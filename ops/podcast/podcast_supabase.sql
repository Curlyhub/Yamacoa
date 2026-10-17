-- ops/podcast/podcast_supabase.sql
-- Estudio de grabación de Yamacoa (podcast "Elaborado"). Ejecutar en el SQL Editor
-- de Supabase DESPUÉS de ops/portal/portal_supabase.sql (reutiliza public.perfiles).
--
-- Reparto de almacenamiento (ver ops/podcast/NOTAS.md):
--   Supabase  -> SOLO metadatos (esta tabla). Nada de audio: el plan gratuito trae 1 GB.
--   R2 privado "yamacoa-grabaciones" -> trozos crudos + máster + versión limpia.
--   R2 público "yamacoa-media"       -> episodio publicado (mp3) + feeds JSON.
--
-- El navegador nunca escribe en R2 directamente: sube cada trozo al Worker
-- (workers/media), que comprueba con el JWT del usuario que la grabación es suya
-- y sigue en estado 'grabando' (consulta a esta tabla bajo RLS).

-- ============================================================ permiso de grabar
alter table public.perfiles add column if not exists puede_grabar boolean not null default false;
-- Alta: update public.perfiles set puede_grabar = true where email = 'persona@dominio';

-- ============================================================ grabaciones
do $$ begin
  create type public.estado_grabacion as enum
    ('grabando','subida','procesando','procesada','publicada','descartada','error');
exception when duplicate_object then null; end $$;

create table if not exists public.grabaciones (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references public.perfiles(id),
  titulo text not null check (char_length(titulo) between 4 and 200),
  -- [{nombre, rol, consiente:true, consentido_en:timestamptz}]; el consentimiento
  -- de TODAS las voces es obligatorio para abrir la grabación (ver abrir_grabacion).
  participantes jsonb not null,
  marcas jsonb not null default '[]'::jsonb,          -- [{t:segundos, titulo}] capítulos marcados en directo
  mime text not null,                                 -- audio/webm;codecs=opus | audio/mp4
  dispositivo text,                                   -- user agent resumido, para diagnóstico
  trozos integer not null default 0,
  duracion_seg integer,
  estado public.estado_grabacion not null default 'grabando',
  motivo_error text,
  episodio_slug text,                                 -- lo fija /podcast-publicar
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index if not exists idx_grab_autor on public.grabaciones(autor_id, creado desc);
create index if not exists idx_grab_estado on public.grabaciones(estado);
alter table public.grabaciones enable row level security;

drop policy if exists "grabaciones propias: leer" on public.grabaciones;
create policy "grabaciones propias: leer" on public.grabaciones
  for select using (auth.uid() = autor_id);
-- Sin políticas de insert/update/delete: el cliente solo actúa vía las RPC de abajo.

-- ============================================================ RPC
create or replace function public.abrir_grabacion(p_titulo text, p_participantes jsonb, p_mime text, p_dispositivo text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_ok boolean;
begin
  select puede_grabar and not bloqueado into v_ok from perfiles where id = auth.uid();
  if not coalesce(v_ok, false) then raise exception 'sin permiso de grabación'; end if;
  if jsonb_typeof(p_participantes) <> 'array' or jsonb_array_length(p_participantes) = 0 then
    raise exception 'faltan participantes';
  end if;
  if exists (select 1 from jsonb_array_elements(p_participantes) e
             where coalesce((e->>'consiente')::boolean, false) = false
                or char_length(coalesce(e->>'nombre','')) < 2) then
    raise exception 'todas las voces deben constar con nombre y consentimiento';
  end if;
  insert into grabaciones (autor_id, titulo, participantes, mime, dispositivo)
  values (auth.uid(), p_titulo,
          (select jsonb_agg(e || jsonb_build_object('consentido_en', now())) from jsonb_array_elements(p_participantes) e),
          p_mime, left(p_dispositivo, 200))
  returning id into v_id;
  return v_id;
end $$;

-- Cierre: el cliente declara cuántos trozos subió; el procesador comprueba que
-- están todos en R2 antes de unirlos.
create or replace function public.cerrar_grabacion(p_id uuid, p_trozos integer, p_duracion integer, p_marcas jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  update grabaciones
     set estado = 'subida', trozos = p_trozos, duracion_seg = p_duracion,
         marcas = coalesce(p_marcas, '[]'::jsonb), actualizado = now()
   where id = p_id and autor_id = auth.uid() and estado = 'grabando';
  if not found then raise exception 'grabación no encontrada o ya cerrada'; end if;
end $$;

create or replace function public.descartar_grabacion(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update grabaciones set estado = 'descartada', actualizado = now()
   where id = p_id and autor_id = auth.uid() and estado in ('grabando','subida');
end $$;

revoke all on function public.abrir_grabacion(text, jsonb, text, text) from public, anon;
revoke all on function public.cerrar_grabacion(uuid, integer, integer, jsonb) from public, anon;
revoke all on function public.descartar_grabacion(uuid) from public, anon;
grant execute on function public.abrir_grabacion(text, jsonb, text, text) to authenticated;
grant execute on function public.cerrar_grabacion(uuid, integer, integer, jsonb) to authenticated;
grant execute on function public.descartar_grabacion(uuid) to authenticated;

-- Grabaciones abandonadas (el teléfono murió y nadie volvió): pasan a 'error'
-- a las 24 h para que el procesador las revise. Requiere pg_cron.
select cron.schedule('grabaciones-abandonadas', '17 * * * *', $$
  update public.grabaciones set estado = 'error', motivo_error = 'abandonada sin cerrar', actualizado = now()
   where estado = 'grabando' and creado < now() - interval '24 hours'
$$);
