-- =====================================================================
-- ops/angel_veliz/poll_supabase.sql
-- Encuesta del expediente "Movido tres veces, aliviado ninguna"
-- (Angel Jesus Veliz Marcano)
-- (3 preguntas: traslados, silencio, cifras_once_j)
-- Convencion Yamacoa: tabla con RLS cerrada + RPC SECURITY DEFINER de
-- solo incremento sobre lista blanca sembrada. El renderer llama:
--   supabase.rpc('angel_veliz_votar', { p_pregunta, p_opcion })
--   supabase.rpc('angel_veliz_totales')  -> jsonb { pregunta: { opcion: votos } }
-- Los textos de opcion DEBEN coincidir byte a byte con angel_veliz.json.
-- =====================================================================

create table if not exists public.angel_veliz_votos (
  pregunta   text   not null,
  opcion     text   not null,
  votos      bigint not null default 0 check (votos >= 0),
  actualizado timestamptz not null default now(),
  primary key (pregunta, opcion)
);

comment on table public.angel_veliz_votos is
  'Agregados de la encuesta del tema angel_veliz. Sin datos personales: solo contadores.';

-- RLS cerrada: nadie lee ni escribe la tabla directamente; todo pasa por las RPC.
alter table public.angel_veliz_votos enable row level security;
revoke all on table public.angel_veliz_votos from anon, authenticated;

-- ---------------------------------------------------------------------
-- Siembra de la lista blanca (idempotente). Combinacion no sembrada = voto rechazado.
-- ---------------------------------------------------------------------
insert into public.angel_veliz_votos (pregunta, opcion) values
  ('traslados', 'No, es solo cambiar el lugar del mismo castigo'),
  ('traslados', 'Depende de las condiciones específicas de cada prisión'),
  ('traslados', 'Sí, si implica menos hacinamiento'),
  ('silencio', 'Gravísimo: es una forma más de castigo'),
  ('silencio', 'Grave, pero puede tener otra explicación operativa'),
  ('silencio', 'No tengo suficiente información para opinar'),
  ('cifras_once_j', 'Que casi cinco años después siguen presos por protestar una vez'),
  ('cifras_once_j', 'El tamaño total (1.306), más allá del origen 11J'),
  ('cifras_once_j', 'Que se necesita un desglose provincia por provincia')
on conflict (pregunta, opcion) do nothing;

-- ---------------------------------------------------------------------
-- RPC de voto: solo incrementa (+1) combinaciones sembradas.
-- ---------------------------------------------------------------------
create or replace function public.angel_veliz_votar(p_pregunta text, p_opcion text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.angel_veliz_votos
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
--   { "traslados": { "No, es solo cambiar el lugar del mismo castigo": 12, ... }, "silencio": {...}, "cifras_once_j": {...} }
-- ---------------------------------------------------------------------
create or replace function public.angel_veliz_totales()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_object_agg(t.pregunta, t.ops), '{}'::jsonb)
  from (
    select pregunta, jsonb_object_agg(opcion, votos) as ops
    from public.angel_veliz_votos
    group by pregunta
  ) t;
$$;

-- ---------------------------------------------------------------------
-- Permisos: el cliente anonimo solo puede ejecutar las dos RPC.
-- ---------------------------------------------------------------------
revoke all on function public.angel_veliz_votar(text, text) from public;
revoke all on function public.angel_veliz_totales() from public;
grant execute on function public.angel_veliz_votar(text, text) to anon, authenticated;
grant execute on function public.angel_veliz_totales() to anon, authenticated;

-- =====================================================================
-- Notas de operador
-- - Si el pipeline cambia el texto de una opcion en angel_veliz.json, hay que
--   sembrar aqui la combinacion nueva (insert ... on conflict do nothing);
--   la vieja puede conservarse para no perder historico.
-- - El renderer degrada en silencio a localStorage si las RPC fallan o no
--   existe window.__yamacoaSupabase: este SQL es opcional para la vista
--   previa y obligatorio para el agregado global.
-- - Sin deduplicacion por votante (no se guarda IP ni identidad): el control
--   anti-repeticion vive en localStorage, como en los demas temas.
-- - El id de pregunta "cifras_once_j" evita el digito inicial "11j" porque
--   el schema exige el patron ^[a-z_]+$ en encuesta.preguntas[].id.
-- =====================================================================
