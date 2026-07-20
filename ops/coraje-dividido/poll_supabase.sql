-- =====================================================================
-- ops/coraje_dividido/poll_supabase.sql
-- Encuesta del expediente "Coraje dividido" (3 preguntas: cuello, mando, cuota)
-- Convención Yamacoa: tabla con RLS cerrada + RPC SECURITY DEFINER de
-- solo incremento sobre lista blanca sembrada. El renderer llama:
--   supabase.rpc('coraje_dividido_votar', { p_pregunta, p_opcion })
--   supabase.rpc('coraje_dividido_totales')  -> jsonb { pregunta: { opcion: votos } }
-- Los textos de opción DEBEN coincidir byte a byte con coraje_dividido.json.
-- =====================================================================

create table if not exists public.coraje_dividido_votos (
  pregunta   text   not null,
  opcion     text   not null,
  votos      bigint not null default 0 check (votos >= 0),
  actualizado timestamptz not null default now(),
  primary key (pregunta, opcion)
);

comment on table public.coraje_dividido_votos is
  'Agregados de la encuesta del tema coraje_dividido. Sin datos personales: solo contadores.';

-- RLS cerrada: nadie lee ni escribe la tabla directamente; todo pasa por las RPC.
alter table public.coraje_dividido_votos enable row level security;
revoke all on table public.coraje_dividido_votos from anon, authenticated;

-- ---------------------------------------------------------------------
-- Siembra de la lista blanca (idempotente). Combinación no sembrada = voto rechazado.
-- ---------------------------------------------------------------------
insert into public.coraje_dividido_votos (pregunta, opcion) values
  ('cuello', 'En la represión interna'),
  ('cuello', 'En la desunión del exilio'),
  ('cuello', 'En ambas por igual'),
  ('cuello', 'En la falta de apoyo internacional'),
  ('mando',  'Sí, la unidad es lo primero'),
  ('mando',  'Solo si surge de una votación abierta'),
  ('mando',  'No, prefiero pluralidad de liderazgos'),
  ('cuota',  'Sí, con cuota mensual'),
  ('cuota',  'Sí, puntualmente'),
  ('cuota',  'Solo si existe mando único primero'),
  ('cuota',  'No')
on conflict (pregunta, opcion) do nothing;

-- ---------------------------------------------------------------------
-- RPC de voto: solo incrementa (+1) combinaciones sembradas.
-- ---------------------------------------------------------------------
create or replace function public.coraje_dividido_votar(p_pregunta text, p_opcion text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.coraje_dividido_votos
     set votos = votos + 1,
         actualizado = now()
   where pregunta = p_pregunta
     and opcion   = p_opcion;

  if not found then
    raise exception 'combinacion pregunta/opcion no valida';
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- RPC de totales: jsonb con la forma exacta que consume el renderer:
--   { "cuello": { "En la represión interna": 12, ... }, "mando": {...}, "cuota": {...} }
-- ---------------------------------------------------------------------
create or replace function public.coraje_dividido_totales()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_object_agg(t.pregunta, t.ops), '{}'::jsonb)
  from (
    select pregunta, jsonb_object_agg(opcion, votos) as ops
    from public.coraje_dividido_votos
    group by pregunta
  ) t;
$$;

-- ---------------------------------------------------------------------
-- Permisos: el cliente anónimo solo puede ejecutar las dos RPC.
-- ---------------------------------------------------------------------
revoke all on function public.coraje_dividido_votar(text, text) from public;
revoke all on function public.coraje_dividido_totales() from public;
grant execute on function public.coraje_dividido_votar(text, text) to anon, authenticated;
grant execute on function public.coraje_dividido_totales() to anon, authenticated;

-- =====================================================================
-- Notas de operador
-- - Si el pipeline cambia el texto de una opción en coraje_dividido.json,
--   hay que sembrar aquí la combinación nueva (insert ... on conflict do nothing);
--   la vieja puede conservarse para no perder histórico.
-- - El renderer degrada en silencio a localStorage si las RPC fallan o no
--   existe window.__yamacoaSupabase: este SQL es opcional para la vista previa
--   y obligatorio para el agregado global.
-- - Sin deduplicación por votante (no se guarda IP ni identidad): el control
--   anti-repetición vive en el cliente (localStorage), como en los demás temas.
-- =====================================================================
