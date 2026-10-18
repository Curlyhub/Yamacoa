-- ops/suscriptores/suscriptores_supabase.sql
-- Lectores inscritos (2026-10-18), SEPARADOS de los usuarios internos. Ejecutar una vez en el SQL
-- Editor, después de portal, podcast, opinion y escucha.
--
-- Supabase Auth tiene un único registro de cuentas (auth.users); la separación va por tablas:
--   * public.perfiles     = INTERNOS (portal: envíos, opinión, estudio, administración)
--   * public.suscriptores = LECTORES de yamacoa.com (inscripción gratuita; `plan` prevé el pago)
-- Desde ahora TODA cuenta nueva nace como lectora. Una cuenta interna se crea como siempre y
-- después se promueve, a mano, con:
--     select public.hacer_interno('persona@dominio');      (SQL Editor, como administrador)
-- Los internos existentes no cambian. Los internos también pueden descargar podcasts.
--
-- En el panel de Supabase (Authentication), después de ejecutar esto:
--   * Providers -> Email: «Allow new users to sign up» = ON y «Confirm email» = ON
--   * URL Configuration: Site URL = https://yamacoa.com ; Redirect URLs: https://yamacoa.com/**,
--     https://portal.yamacoa.com/** y http://localhost:3123/**
--   * Providers -> Google: ver ops/suscriptores/NOTAS.md

create table if not exists public.suscriptores (
  id        uuid primary key references auth.users(id) on delete cascade,
  email     text not null,
  proveedor text,                                   -- email | google
  plan      text not null default 'gratuito',       -- previsto: gratuito | pago (más adelante)
  estado    text not null default 'activo' check (estado in ('activo', 'baja')),
  alta      timestamptz not null default now()
);
alter table public.suscriptores enable row level security;
drop policy if exists "suscriptor: leer el propio" on public.suscriptores;
create policy "suscriptor: leer el propio" on public.suscriptores for select using (auth.uid() = id);
-- Nadie escribe desde el cliente: lo hacen el trigger y las funciones de abajo.

-- Toda cuenta nueva -> suscriptores (antes: perfiles). Los internos se promueven a mano.
create or replace function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.suscriptores (id, email, proveedor)
  values (new.id, new.email, coalesce(new.raw_app_meta_data->>'provider', 'email'))
  on conflict (id) do nothing;
  return new;
end $$;

-- Promover una cuenta a interna (la saca de suscriptores: no se mezclan).
create or replace function public.hacer_interno(p_email text)
returns void language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role' and not public.es_admin() then
    raise exception 'SIN_PERMISO';
  end if;
  select id into v_id from auth.users where lower(email) = lower(trim(p_email));
  if v_id is null then raise exception 'NO_EXISTE: %', p_email; end if;
  insert into public.perfiles (id, email) values (v_id, lower(trim(p_email))) on conflict (id) do nothing;
  delete from public.suscriptores where id = v_id;
end $$;
revoke all on function public.hacer_interno(text) from public, anon;
grant execute on function public.hacer_interno(text) to authenticated;

-- Darse de baja: el lector borra su cuenta entera (y con ella su fila de suscriptores).
create or replace function public.baja_suscriptor()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if not exists (select 1 from public.suscriptores where id = auth.uid()) then raise exception 'NO_ES_LECTOR'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.baja_suscriptor() from public, anon;
grant execute on function public.baja_suscriptor() to authenticated;

-- ============================================================ cierre de huecos
-- Con el registro abierto, «tener cuenta» ya no implica ser interno. Lo que antes solo miraba
-- auth.uid() pasa a exigir una fila en perfiles (y el permiso que toque).
drop policy if exists "pdf: subir a carpeta propia" on storage.objects;
create policy "pdf: subir a carpeta propia" on storage.objects
  for insert with check (
    bucket_id = 'envios-pdf'
    and (storage.foldername(name))[1] = auth.uid()::text
    and lower(right(name, 4)) = '.pdf'
    and exists (select 1 from public.perfiles p where p.id = auth.uid() and not p.bloqueado)
  );
drop policy if exists "opinion: subir original propio" on storage.objects;
create policy "opinion: subir original propio" on storage.objects
  for insert with check (
    bucket_id = 'opinion-originales'
    and (storage.foldername(name))[1] = auth.uid()::text
    and lower(storage.extension(name)) in ('docx', 'pdf')
    and exists (select 1 from public.perfiles p where p.id = auth.uid() and p.puede_opinar and not p.bloqueado)
  );
drop policy if exists "envios: crear propios" on public.envios;
create policy "envios: crear propios" on public.envios
  for insert with check (
    auth.uid() = autor_id
    and exists (select 1 from public.perfiles p where p.id = auth.uid() and not p.bloqueado)
  );
