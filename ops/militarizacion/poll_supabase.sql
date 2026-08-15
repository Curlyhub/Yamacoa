-- =====================================================================
-- ops/militarizacion/poll_supabase.sql
-- Encuesta del expediente "Guerra sin declarar" (militarizacion de facto
-- en Cuba, feb-jul 2026)
-- (3 preguntas: excepcion, tribunal_militar, cifras)
-- Convencion Yamacoa: tabla con RLS cerrada + RPC SECURITY DEFINER de
-- solo incremento sobre lista blanca sembrada. El renderer llama:
--   supabase.rpc('militarizacion_votar', { p_pregunta, p_opcion })
--   supabase.rpc('militarizacion_totales')  -> jsonb { pregunta: { opcion: votos } }
-- Los textos de opcion DEBEN coincidir byte a byte con militarizacion.json.
-- =====================================================================

create table if not exists public.militarizacion_votos (
  pregunta   text   not null,
  opcion     text   not null,
  votos      bigint not null default 0 check (votos >= 0),
  actualizado timestamptz not null default now(),
  primary key (pregunta, opcion)
);

comment on table public.militarizacion_votos is
  'Agregados de la encuesta del tema militarizacion. Sin datos personales: solo contadores.';

-- RLS cerrada: nadie lee ni escribe la tabla directamente; todo pasa por las RPC.
alter table public.militarizacion_votos enable row level security;
revoke all on table public.militarizacion_votos from anon, authenticated;

-- ---------------------------------------------------------------------
-- Siembra de la lista blanca (idempotente). Combinacion no sembrada = voto rechazado.
-- ---------------------------------------------------------------------
insert into public.militarizacion_votos (pregunta, opcion) values
  ('excepcion', 'Que se apliquen sin control judicial'),
  ('excepcion', 'Que ninguna medida tenga fecha de fin'),
  ('excepcion', 'Que el Estado niegue en público lo que hace en privado'),
  ('tribunal_militar', 'Un caso aislado y extremo'),
  ('tribunal_militar', 'El inicio de una práctica que se generalizará'),
  ('tribunal_militar', 'No tengo información suficiente para opinar'),
  ('cifras', 'Publicarlas igual, marcadas como "según Cubalex"'),
  ('cifras', 'Esperar una segunda fuente antes de publicarlas'),
  ('cifras', 'Publicar solo la tendencia cualitativa, sin las cifras exactas')
on conflict (pregunta, opcion) do nothing;

-- ---------------------------------------------------------------------
-- RPC de voto: solo incrementa (+1) combinaciones sembradas.
-- ---------------------------------------------------------------------
create or replace function public.militarizacion_votar(p_pregunta text, p_opcion text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.militarizacion_votos
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
--   { "excepcion": { "Que se apliquen sin control judicial": 12, ... }, ... }
-- ---------------------------------------------------------------------
create or replace function public.militarizacion_totales()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_object_agg(t.pregunta, t.ops), '{}'::jsonb)
  from (
    select pregunta, jsonb_object_agg(opcion, votos) as ops
    from public.militarizacion_votos
    group by pregunta
  ) t;
$$;

-- ---------------------------------------------------------------------
-- Permisos: el cliente anonimo solo puede ejecutar las dos RPC.
-- ---------------------------------------------------------------------
revoke all on function public.militarizacion_votar(text, text) from public;
revoke all on function public.militarizacion_totales() from public;
grant execute on function public.militarizacion_votar(text, text) to anon, authenticated;
grant execute on function public.militarizacion_totales() to anon, authenticated;

-- =====================================================================
-- Notas de operador
-- - Si el pipeline cambia el texto de una opcion en militarizacion.json,
--   hay que sembrar aqui la combinacion nueva (insert ... on conflict do
--   nothing); la vieja puede conservarse para no perder historico.
-- - El renderer degrada en silencio a localStorage si las RPC fallan o no
--   existe window.__yamacoaSupabase: este SQL es opcional para la vista
--   previa y obligatorio para el agregado global.
-- - Sin deduplicacion por votante (no se guarda IP ni identidad): el
--   control anti-repeticion vive en localStorage, como en los demas temas.
-- =====================================================================
