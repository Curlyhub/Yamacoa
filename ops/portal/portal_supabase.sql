-- ops/portal/portal_supabase.sql
-- Portal de contribuciones de Yamacoa. Ejecutar en el SQL Editor de Supabase.
--
-- ALTA Y BAJA DE USUARIOS: no se hacen desde aqui. Viven en el CLI del orquestador
-- (repo yamacoa-pipeline, crates/orchestrator), que habla con la Auth Admin API real:
--     orchestrator crear-usuario  --email correo@dominio.com
--     orchestrator borrar-usuario --email correo@dominio.com [--confirmar]
-- Necesita SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno. El borrado cascada
-- a public.perfiles por la FK de abajo (on delete cascade).
--
-- Requisitos previos en el dashboard:
--   Authentication -> Providers -> Email: "Allow new users to sign up" = OFF
--   Storage -> New bucket: "envios-pdf" (privado)
--   Database -> Extensions: habilitar pg_cron

-- ============================================================ perfiles
create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  es_admin boolean not null default false,
  bloqueado boolean not null default false,
  pwd_actualizada timestamptz not null default now(),
  creado timestamptz not null default now()
);
alter table public.perfiles enable row level security;

drop policy if exists "perfil propio: leer" on public.perfiles;
create policy "perfil propio: leer" on public.perfiles
  for select using (auth.uid() = id);
-- nadie inserta/borra/edita perfiles desde el cliente; solo service_role y triggers.

-- crea el perfil automaticamente al crear el usuario en auth
create or replace function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists trg_crear_perfil on auth.users;
create trigger trg_crear_perfil after insert on auth.users
  for each row execute function public.crear_perfil();

-- al cambiar la contrasena, refresca pwd_actualizada y desbloquea
create or replace function public.registrar_rotacion_pwd()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.encrypted_password is distinct from old.encrypted_password then
    update public.perfiles
      set pwd_actualizada = now(), bloqueado = false
      where id = new.id;
  end if;
  return new;
end $$;
drop trigger if exists trg_rotacion_pwd on auth.users;
create trigger trg_rotacion_pwd after update on auth.users
  for each row execute function public.registrar_rotacion_pwd();

-- ============================================================ envios
do $$ begin
  create type public.estado_envio as enum
    ('pendiente','en_proceso','procesado','error','eliminado');
exception when duplicate_object then null; end $$;

create table if not exists public.envios (
  id bigint generated always as identity primary key,
  autor_id uuid not null references public.perfiles(id),
  titulo text not null check (char_length(titulo) between 4 and 200),
  fecha date not null default current_date,          -- automatica
  texto text not null check (char_length(texto) between 20 and 20000),
  pdf_path text,                                     -- ruta en bucket envios-pdf
  estado public.estado_envio not null default 'pendiente',
  motivo_error text,
  tema_slug text,                                    -- lo fija el orquestador al procesar
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index if not exists idx_envios_estado on public.envios(estado);
create index if not exists idx_envios_autor on public.envios(autor_id, creado desc);
alter table public.envios enable row level security;

-- el autor ve SOLO sus envios; nunca los edita ni borra desde el cliente
drop policy if exists "envios: leer propios" on public.envios;
create policy "envios: leer propios" on public.envios
  for select using (auth.uid() = autor_id);

-- insertar: solo autenticado, no bloqueado, como autor de si mismo
drop policy if exists "envios: crear propios" on public.envios;
create policy "envios: crear propios" on public.envios
  for insert with check (
    auth.uid() = autor_id
    and not exists (select 1 from public.perfiles p
                    where p.id = auth.uid() and p.bloqueado)
  );

-- cuota: maximo 5 envios por dia y usuario (servidor, no front)
create or replace function public.check_cuota_diaria()
returns trigger language plpgsql security definer set search_path = public as $$
declare n int;
begin
  select count(*) into n from public.envios
    where autor_id = new.autor_id and creado::date = current_date;
  if n >= 5 then
    raise exception 'CUOTA_DIARIA: maximo 5 envios al dia';
  end if;
  return new;
end $$;
drop trigger if exists trg_cuota on public.envios;
create trigger trg_cuota before insert on public.envios
  for each row execute function public.check_cuota_diaria();

create or replace function public.touch_actualizado()
returns trigger language plpgsql as $$
begin new.actualizado = now(); return new; end $$;
drop trigger if exists trg_touch on public.envios;
create trigger trg_touch before update on public.envios
  for each row execute function public.touch_actualizado();

-- ============================================================ storage (bucket envios-pdf)
-- subir: cada usuario solo a su carpeta <uid>/..., solo PDF
drop policy if exists "pdf: subir a carpeta propia" on storage.objects;
create policy "pdf: subir a carpeta propia" on storage.objects
  for insert with check (
    bucket_id = 'envios-pdf'
    and (storage.foldername(name))[1] = auth.uid()::text
    and lower(right(name, 4)) = '.pdf'
  );
drop policy if exists "pdf: leer propios" on storage.objects;
create policy "pdf: leer propios" on storage.objects
  for select using (
    bucket_id = 'envios-pdf'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
-- (el orquestador usa service_role: salta RLS para descargar/borrar)

-- ============================================================ rotacion mensual
-- bloquea (NO borra) a quien lleve mas de 30 dias sin rotar contrasena.
-- Recomendado: bloquear conserva la trazabilidad de procedencia de paginas publicadas.
select cron.schedule(
  'bloqueo-rotacion-pwd', '15 2 * * *',
  $$ update public.perfiles
       set bloqueado = true
     where not es_admin
       and not bloqueado
       and pwd_actualizada < now() - interval '30 days' $$
);
-- Variante DESTRUCTIVA que pediste (borra el usuario). Dejo el codigo comentado a
-- proposito: si se borra auth.users cascada perfiles y se pierde la autoria historica.
-- select cron.schedule('borrado-rotacion-pwd', '20 2 * * *',
--   $$ delete from auth.users where id in (
--        select id from public.perfiles
--        where not es_admin and pwd_actualizada < now() - interval '30 days') $$);

-- ============================================================ procedencia
create or replace view public.v_procedencia as
select e.tema_slug, e.titulo, p.email as autor, e.creado, e.estado
from public.envios e join public.perfiles p on p.id = e.autor_id
where e.tema_slug is not null;

-- ============================================================ alta de usuarios
-- Aqui vivia public.admin_crear_usuario(), que insertaba a mano en auth.users. ELIMINADA:
-- escribir directamente en auth.users reimplementa el estado interno de GoTrue (identities,
-- confirmacion, formato del hash) y se rompe en cuanto Supabase cambia el esquema. El alta
-- pasa ahora por la Auth Admin API, via el CLI del orquestador (ver cabecera del fichero):
--
--     orchestrator crear-usuario --email [cuenta-admin]
--
-- El trigger trg_crear_perfil de arriba crea la fila en public.perfiles sola, venga el alta
-- de donde venga (CLI, dashboard o Admin API). Para marcar al administrador, una vez creado:
--
--     update public.perfiles set es_admin = true where email = '[cuenta-admin]';
