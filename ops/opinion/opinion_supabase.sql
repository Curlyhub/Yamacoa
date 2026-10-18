-- ops/opinion/opinion_supabase.sql
-- Artículos de opinión (2026-10-18). Ejecutar una vez en el SQL Editor de Supabase,
-- DESPUÉS de ops/portal/portal_supabase.sql (reutiliza public.perfiles).
--
-- Reglas (decisión del editor, 2026-10-18):
--   * Solo cuentas invitadas: perfiles.puede_opinar. Alta:
--       update public.perfiles set puede_opinar = true where email = 'persona@dominio';
--   * El autor firma con su nombre o con seudónimo (Yamacoa conoce la cuenta, no la publica).
--   * El texto del autor es INVARIANTE: se guarda con su sha256 y un trigger impide cambiarlo.
--     Yamacoa solo añade, aparte, análisis de datos y notas de datos (columna `analisis`).
--   * Revisión humana antes de publicar. El autor puede retirar su artículo en cualquier momento.

alter table public.perfiles add column if not exists puede_opinar boolean not null default false;

create table if not exists public.opinion_articulos (
  id            uuid primary key default gen_random_uuid(),
  autor_id      uuid not null references public.perfiles(id),
  titulo        text not null check (char_length(titulo) between 8 and 160),
  firma         text not null check (char_length(firma) between 2 and 80),
  firma_tipo    text not null check (firma_tipo in ('nombre', 'seudonimo')),
  presentacion  text check (char_length(presentacion) <= 240),   -- una línea sobre quien firma (opcional)
  texto         text not null check (char_length(texto) between 400 and 40000),
  texto_sha256  text not null,
  original_path text,                                            -- bucket opinion-originales (Word/PDF tal cual)
  original_tipo text not null check (original_tipo in ('docx', 'pdf', 'texto')),
  estado        text not null default 'enviado'
                check (estado in ('enviado', 'revision', 'publicado', 'rechazado', 'retirado')),
  -- enviado: espera el análisis · revision: análisis hecho, espera al editor · publicado
  -- rechazado: no se publica (motivo) · retirado: lo retiró su autor o el editor
  slug          text unique,
  analisis      jsonb,                                           -- lo que añade Yamacoa (aparte del texto)
  motivo        text,                                            -- nota del editor al autor
  creado        timestamptz not null default now(),
  actualizado   timestamptz not null default now(),
  publicado     timestamptz
);
create index if not exists idx_opinion_estado on public.opinion_articulos(estado);
create index if not exists idx_opinion_autor on public.opinion_articulos(autor_id, creado desc);
alter table public.opinion_articulos enable row level security;

-- El autor ve SOLO lo suyo. No inserta ni edita directamente: usa las funciones de abajo.
drop policy if exists "opinion: leer propios" on public.opinion_articulos;
create policy "opinion: leer propios" on public.opinion_articulos
  for select using (auth.uid() = autor_id);

-- Invariancia del texto: nadie (ni la service role) puede cambiar texto ni hash tras el envío.
create or replace function public.opinion_texto_invariante()
returns trigger language plpgsql as $$
begin
  if new.texto is distinct from old.texto or new.texto_sha256 is distinct from old.texto_sha256 then
    raise exception 'TEXTO_INVARIANTE: el texto de un artículo de opinión no se modifica';
  end if;
  new.actualizado = now();
  return new;
end $$;
drop trigger if exists trg_opinion_invariante on public.opinion_articulos;
create trigger trg_opinion_invariante before update on public.opinion_articulos
  for each row execute function public.opinion_texto_invariante();

-- Enviar: solo con permiso, sin bloqueo, máximo 3 al día. El hash lo calcula el servidor.
create or replace function public.enviar_opinion(
  p_titulo text, p_firma text, p_firma_tipo text, p_presentacion text,
  p_texto text, p_original_path text, p_original_tipo text)
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare v_ok boolean; v_n int; v_id uuid;
begin
  select puede_opinar and not bloqueado into v_ok from perfiles where id = auth.uid();
  if not coalesce(v_ok, false) then raise exception 'SIN_PERMISO: la cuenta no puede enviar opinión'; end if;
  select count(*) into v_n from opinion_articulos where autor_id = auth.uid() and creado > now() - interval '1 day';
  if v_n >= 3 then raise exception 'CUOTA: máximo 3 artículos al día'; end if;
  if p_original_path is not null and (storage_folder(p_original_path) is distinct from auth.uid()::text) then
    raise exception 'RUTA: el original tiene que estar en tu carpeta';
  end if;
  insert into opinion_articulos (autor_id, titulo, firma, firma_tipo, presentacion, texto, texto_sha256, original_path, original_tipo)
  values (auth.uid(), trim(p_titulo), trim(p_firma), p_firma_tipo, nullif(trim(coalesce(p_presentacion, '')), ''),
          p_texto, encode(digest(convert_to(p_texto, 'UTF8'), 'sha256'), 'hex'), p_original_path, p_original_tipo)
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.storage_folder(p text) returns text
language sql immutable as $$ select split_part(p, '/', 1) $$;

-- Retirar: el autor puede retirar lo suyo en cualquier momento (también si ya está publicado:
-- sale del sitio en el siguiente despliegue). Protege a quien escribe desde Cuba.
create or replace function public.retirar_opinion(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update opinion_articulos set estado = 'retirado', motivo = 'Retirado por su autor'
   where id = p_id and autor_id = auth.uid() and estado <> 'retirado';
  if not found then raise exception 'NO_ENCONTRADO'; end if;
end $$;

grant execute on function public.enviar_opinion(text, text, text, text, text, text, text) to authenticated;
grant execute on function public.retirar_opinion(uuid) to authenticated;

-- ============================================================ originales (Word/PDF)
insert into storage.buckets (id, name, public) values ('opinion-originales', 'opinion-originales', false)
on conflict (id) do nothing;

drop policy if exists "opinion: subir original propio" on storage.objects;
create policy "opinion: subir original propio" on storage.objects
  for insert with check (
    bucket_id = 'opinion-originales'
    and (storage.foldername(name))[1] = auth.uid()::text
    and lower(storage.extension(name)) in ('docx', 'pdf')
  );
drop policy if exists "opinion: leer original propio" on storage.objects;
create policy "opinion: leer original propio" on storage.objects
  for select using (
    bucket_id = 'opinion-originales'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
-- El ciclo (service role) salta RLS para leer los originales si hiciera falta.
