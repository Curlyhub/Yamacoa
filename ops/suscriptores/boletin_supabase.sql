-- ops/suscriptores/boletin_supabase.sql
-- Boletín semanal de Yamacoa (2026-10-18). Ejecutar una vez en el SQL Editor, después de
-- suscriptores_supabase.sql. Es OPCIONAL para el lector y con consentimiento APARTE del de la
-- cuenta (política de privacidad §3): nace desactivado salvo que lo marque al inscribirse.

alter table public.suscriptores add column if not exists boletin boolean not null default false;
alter table public.suscriptores add column if not exists boletin_desde timestamptz;
-- Token para darse de baja con un clic desde el correo, sin entrar en la cuenta.
alter table public.suscriptores add column if not exists boletin_token uuid not null default gen_random_uuid();
create unique index if not exists suscriptores_boletin_token on public.suscriptores (boletin_token);

-- Alta: el formulario manda `boletin: true` en los metadatos si el lector marcó la casilla.
create or replace function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_boletin boolean := coalesce((new.raw_user_meta_data->>'boletin')::boolean, false);
begin
  insert into public.suscriptores (id, email, proveedor, boletin, boletin_desde)
  values (new.id, new.email, coalesce(new.raw_app_meta_data->>'provider', 'email'),
          v_boletin, case when v_boletin then now() end)
  on conflict (id) do nothing;
  return new;
end $$;

-- El lector activa o desactiva su boletín desde «Mi cuenta».
create or replace function public.mi_boletin(p_activo boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.suscriptores
     set boletin = p_activo, boletin_desde = case when p_activo then now() end
   where id = auth.uid();
  if not found then raise exception 'NO_ES_LECTOR'; end if;
end $$;
revoke all on function public.mi_boletin(boolean) from public, anon;
grant execute on function public.mi_boletin(boolean) to authenticated;

-- Baja con un clic (enlace del correo y cabecera List-Unsubscribe): basta el token.
create or replace function public.boletin_baja(p_token uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update public.suscriptores set boletin = false, boletin_desde = null where boletin_token = p_token;
  return found;
end $$;
revoke all on function public.boletin_baja(uuid) from public;
grant execute on function public.boletin_baja(uuid) to anon, authenticated;

-- Registro de envíos (qué semana y a cuántos), para no mandar dos veces el mismo boletín.
create table if not exists public.boletin_envios (
  semana     text primary key,              -- p. ej. 2026-W42
  asunto     text not null,
  enviados   integer not null default 0,
  enviado    timestamptz not null default now()
);
alter table public.boletin_envios enable row level security; -- solo service_role
