-- =====================================================================
-- ops/desacreditacion/poll_supabase.sql
-- Encuesta del expediente "La maquinaria de desacreditar"
-- (3 preguntas: frente, patologizacion, efecto)
-- Convención Yamacoa: tabla con RLS cerrada + RPC SECURITY DEFINER de
-- solo incremento sobre lista blanca sembrada. El renderer llama:
--   supabase.rpc('desacreditacion_votar', { p_pregunta, p_opcion })
--   supabase.rpc('desacreditacion_totales')  -> jsonb { pregunta: { opcion: votos } }
-- Los textos de opción DEBEN coincidir byte a byte con desacreditacion.json.
-- =====================================================================

create table if not exists public.desacreditacion_votos (
  pregunta   text   not null,
  opcion     text   not null,
  votos      bigint not null default 0 check (votos >= 0),
  actualizado timestamptz not null default now(),
  primary key (pregunta, opcion)
);

comment on table public.desacreditacion_votos is
  'Agregados de la encuesta del tema desacreditacion. Sin datos personales: solo contadores.';

-- RLS cerrada: nadie lee ni escribe la tabla directamente; todo pasa por las RPC.
alter table public.desacreditacion_votos enable row level security;
revoke all on table public.desacreditacion_votos from anon, authenticated;

-- ---------------------------------------------------------------------
-- Siembra de la lista blanca (idempotente). Combinación no sembrada = voto rechazado.
-- ---------------------------------------------------------------------
insert into public.desacreditacion_votos (pregunta, opcion) values
  ('frente', 'Del oficialismo dentro de Cuba'),
  ('frente', 'De sectores del propio exilio'),
  ('frente', 'De ambos por igual'),
  ('frente', 'No sabría decir'),
  ('patologizacion', 'Sí, lo conocía'),
  ('patologizacion', 'No, es la primera vez que lo veo documentado'),
  ('patologizacion', 'Lo sospechaba pero no conocía casos concretos'),
  ('efecto', 'Muy efectiva: cambia cómo se recibe el testimonio'),
  ('efecto', 'Algo efectiva, pero se nota la manipulación'),
  ('efecto', 'Poco efectiva entre audiencias informadas')
on conflict (pregunta, opcion) do nothing;

-- ---------------------------------------------------------------------
-- RPC de voto: solo incrementa (+1) combinaciones sembradas.
-- ---------------------------------------------------------------------
create or replace function public.desacreditacion_votar(p_pregunta text, p_opcion text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.desacreditacion_votos
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
--   { "frente": { "Del oficialismo dentro de Cuba": 12, ... }, "patologizacion": {...}, "efecto": {...} }
-- ---------------------------------------------------------------------
create or replace function public.desacreditacion_totales()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_object_agg(t.pregunta, t.ops), '{}'::jsonb)
  from (
    select pregunta, jsonb_object_agg(opcion, votos) as ops
    from public.desacreditacion_votos
    group by pregunta
  ) t;
$$;

-- ---------------------------------------------------------------------
-- Permisos: el cliente anónimo solo puede ejecutar las dos RPC.
-- ---------------------------------------------------------------------
revoke all on function public.desacreditacion_votar(text, text) from public;
revoke all on function public.desacreditacion_totales() from public;
grant execute on function public.desacreditacion_votar(text, text) to anon, authenticated;
grant execute on function public.desacreditacion_totales() to anon, authenticated;

-- =====================================================================
-- Notas de operador
-- - Si el pipeline cambia el texto de una opción en desacreditacion.json,
--   hay que sembrar aquí la combinación nueva (insert ... on conflict do nothing);
--   la vieja puede conservarse para no perder histórico.
-- - El renderer degrada en silencio a localStorage si las RPC fallan o no
--   existe window.__yamacoaSupabase: este SQL es opcional para la vista previa
--   y obligatorio para el agregado global.
-- - Sin deduplicación por votante (no se guarda IP ni identidad): el control
--   anti-repetición vive en localStorage, como en los demás temas.
-- =====================================================================
