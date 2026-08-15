-- =====================================================================
-- ops/derechos_sociales/poll_supabase.sql
-- Encuesta del expediente "Julio sin tregua" (crisis DESC + violencia
-- ciudadana en Cuba, julio de 2026)
-- (3 preguntas: agua_electricidad, cifras_violencia, prioridad_estatal)
-- Convencion Yamacoa: tabla con RLS cerrada + RPC SECURITY DEFINER de
-- solo incremento sobre lista blanca sembrada. El renderer llama:
--   supabase.rpc('derechos_sociales_votar', { p_pregunta, p_opcion })
--   supabase.rpc('derechos_sociales_totales')  -> jsonb { pregunta: { opcion: votos } }
-- Los textos de opcion DEBEN coincidir byte a byte con derechos_sociales.json.
-- =====================================================================

create table if not exists public.derechos_sociales_votos (
  pregunta   text   not null,
  opcion     text   not null,
  votos      bigint not null default 0 check (votos >= 0),
  actualizado timestamptz not null default now(),
  primary key (pregunta, opcion)
);

comment on table public.derechos_sociales_votos is
  'Agregados de la encuesta del tema derechos_sociales. Sin datos personales: solo contadores.';

-- RLS cerrada: nadie lee ni escribe la tabla directamente; todo pasa por las RPC.
alter table public.derechos_sociales_votos enable row level security;
revoke all on table public.derechos_sociales_votos from anon, authenticated;

-- ---------------------------------------------------------------------
-- Siembra de la lista blanca (idempotente). Combinacion no sembrada = voto rechazado.
-- ---------------------------------------------------------------------
insert into public.derechos_sociales_votos (pregunta, opcion) values
  ('agua_electricidad', 'La falta de agua potable'),
  ('agua_electricidad', 'Los apagones nacionales totales'),
  ('agua_electricidad', 'Ambas por igual: son la misma crisis de fondo'),
  ('cifras_violencia', 'Confiar en el monitor con la red más amplia (Cubalex)'),
  ('cifras_violencia', 'Confiar en el monitor con verificación más acotada (Cubanet)'),
  ('cifras_violencia', 'Ninguna cifra es confiable sin datos oficiales del Estado'),
  ('prioridad_estatal', 'Seguridad ciudadana antes que control social'),
  ('prioridad_estatal', 'Resolver la causa de fondo (energía y agua) antes que cualquier despliegue'),
  ('prioridad_estatal', 'No hay forma de priorizar sin más información')
on conflict (pregunta, opcion) do nothing;

-- ---------------------------------------------------------------------
-- RPC de voto: solo incrementa (+1) combinaciones sembradas.
-- ---------------------------------------------------------------------
create or replace function public.derechos_sociales_votar(p_pregunta text, p_opcion text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.derechos_sociales_votos
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
-- RPC de totales: jsonb con la forma exacta que consume el renderer.
-- ---------------------------------------------------------------------
create or replace function public.derechos_sociales_totales()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_object_agg(t.pregunta, t.ops), '{}'::jsonb)
  from (
    select pregunta, jsonb_object_agg(opcion, votos) as ops
    from public.derechos_sociales_votos
    group by pregunta
  ) t;
$$;

-- ---------------------------------------------------------------------
-- Permisos: el cliente anonimo solo puede ejecutar las dos RPC.
-- ---------------------------------------------------------------------
revoke all on function public.derechos_sociales_votar(text, text) from public;
revoke all on function public.derechos_sociales_totales() from public;
grant execute on function public.derechos_sociales_votar(text, text) to anon, authenticated;
grant execute on function public.derechos_sociales_totales() to anon, authenticated;

-- =====================================================================
-- Notas de operador
-- - Si el pipeline cambia el texto de una opcion en derechos_sociales.json,
--   hay que sembrar aqui la combinacion nueva (insert ... on conflict do
--   nothing); la vieja puede conservarse para no perder historico.
-- - El renderer degrada en silencio a localStorage si las RPC fallan o no
--   existe window.__yamacoaSupabase.
-- - Sin deduplicacion por votante; el control anti-repeticion vive en
--   localStorage, como en los demas temas.
-- =====================================================================
