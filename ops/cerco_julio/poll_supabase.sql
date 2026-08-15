-- =====================================================================
-- ops/cerco_julio/poll_supabase.sql
-- Encuesta del expediente "El cerco de julio" (campana de represion
-- selectiva contra defensores de derechos humanos, julio de 2026)
-- (3 preguntas: operativo_coordinado, balanza_final, cifras_no_confirmadas)
-- Convencion Yamacoa: tabla con RLS cerrada + RPC SECURITY DEFINER de
-- solo incremento sobre lista blanca sembrada. El renderer llama:
--   supabase.rpc('cerco_julio_votar', { p_pregunta, p_opcion })
--   supabase.rpc('cerco_julio_totales')  -> jsonb { pregunta: { opcion: votos } }
-- Los textos de opcion DEBEN coincidir byte a byte con cerco_julio.json.
-- =====================================================================

create table if not exists public.cerco_julio_votos (
  pregunta   text   not null,
  opcion     text   not null,
  votos      bigint not null default 0 check (votos >= 0),
  actualizado timestamptz not null default now(),
  primary key (pregunta, opcion)
);

comment on table public.cerco_julio_votos is
  'Agregados de la encuesta del tema cerco_julio. Sin datos personales: solo contadores.';

alter table public.cerco_julio_votos enable row level security;
revoke all on table public.cerco_julio_votos from anon, authenticated;

insert into public.cerco_julio_votos (pregunta, opcion) values
  ('operativo_coordinado', 'La coordinación centralizada del operativo'),
  ('operativo_coordinado', 'Que el motivo fuera impedir un acto simbólico, no una protesta'),
  ('operativo_coordinado', 'Que el hostigamiento posterior no tenga aún segunda fuente'),
  ('balanza_final', 'Que el sistema libera a quien ya cumplió, sin más concesión que esa'),
  ('balanza_final', 'Que las muertes bajo custodia siguen sin transparencia real'),
  ('balanza_final', 'Ambas cosas a la vez, sin que una compense a la otra'),
  ('cifras_no_confirmadas', 'Publicarlas igual, marcadas como no confirmadas'),
  ('cifras_no_confirmadas', 'No publicarlas hasta tener una segunda fuente'),
  ('cifras_no_confirmadas', 'Depende de la gravedad de cada afirmación')
on conflict (pregunta, opcion) do nothing;

create or replace function public.cerco_julio_votar(p_pregunta text, p_opcion text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.cerco_julio_votos
     set votos = votos + 1,
         actualizado = now()
   where pregunta = p_pregunta
     and opcion   = p_opcion;

  if not found then
    raise exception 'combinacion pregunta/opcion no valida';
  end if;
end;
$$;

create or replace function public.cerco_julio_totales()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_object_agg(t.pregunta, t.ops), '{}'::jsonb)
  from (
    select pregunta, jsonb_object_agg(opcion, votos) as ops
    from public.cerco_julio_votos
    group by pregunta
  ) t;
$$;

revoke all on function public.cerco_julio_votar(text, text) from public;
revoke all on function public.cerco_julio_totales() from public;
grant execute on function public.cerco_julio_votar(text, text) to anon, authenticated;
grant execute on function public.cerco_julio_totales() to anon, authenticated;

-- =====================================================================
-- Notas de operador
-- - Si el pipeline cambia el texto de una opcion en cerco_julio.json, hay
--   que sembrar aqui la combinacion nueva (insert ... on conflict do
--   nothing); la vieja puede conservarse para no perder historico.
-- - El renderer degrada en silencio a localStorage si las RPC fallan o no
--   existe window.__yamacoaSupabase.
-- - Sin deduplicacion por votante; el control anti-repeticion vive en
--   localStorage, como en los demas temas.
-- =====================================================================
