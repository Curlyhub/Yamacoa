-- =====================================================================
-- ops/_shared/poll_supabase.sql
-- INFRAESTRUCTURA COMPARTIDA DE ENCUESTAS · Yamacoa
--
-- Se aplica UNA SOLA VEZ en el proyecto Supabase. Cada expediente NO crea
-- tabla propia: solo siembra sus claves con su `ops/<tema>/poll_supabase.sql`.
--
-- Contrato consumido por los renderers (ver ENCUESTAS.md):
--   yamacoa_encuesta_votar(p_clave text) returns void
--   yamacoa_encuesta_resultados(p_prefijo text) returns table(clave, votos)
--
-- Clave de voto:  <meta.slug>::<pregunta.id>::<opcion.id>
-- Prefijo de lectura: <meta.slug>::
--
-- Postura de seguridad, idéntica a la de las tablas por tema que sustituye:
-- RLS cerrada, nadie toca la tabla directamente, las dos RPC son
-- SECURITY DEFINER y la de voto SOLO INCREMENTA claves ya sembradas. Una
-- clave no sembrada se rechaza: sin esa lista blanca, un cliente anónimo
-- podría crear filas arbitrarias en la tabla compartida de toda la plataforma.
-- =====================================================================

create table if not exists public.yamacoa_encuesta_votos (
  clave       text   primary key,
  votos       bigint not null default 0 check (votos >= 0),
  actualizado timestamptz not null default now()
);

comment on table public.yamacoa_encuesta_votos is
  'Contadores agregados de TODAS las encuestas de Yamacoa. Clave: slug::pregunta::opcion. Sin datos personales.';

alter table public.yamacoa_encuesta_votos enable row level security;
revoke all on table public.yamacoa_encuesta_votos from anon, authenticated;

-- ---------------------------------------------------------------------
-- Voto: +1 sobre una clave sembrada. Clave desconocida = error, no alta.
-- ---------------------------------------------------------------------
create or replace function public.yamacoa_encuesta_votar(p_clave text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.yamacoa_encuesta_votos
     set votos = votos + 1,
         actualizado = now()
   where clave = p_clave;

  if not found then
    raise exception 'clave de voto no valida: %', p_clave;
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- Resultados por prefijo. Se usa starts_with y NO `like`: los slugs de
-- Yamacoa contienen guiones bajos (convocatoria_11j, protesta_solitaria)
-- y en `like` el guion bajo es un comodín de un carácter, lo que haría
-- que un tema leyera claves de otro.
-- ---------------------------------------------------------------------
create or replace function public.yamacoa_encuesta_resultados(p_prefijo text)
returns table(clave text, votos bigint)
language sql
stable
security definer
set search_path = public
as $$
  select v.clave, v.votos
  from public.yamacoa_encuesta_votos v
  where starts_with(v.clave, p_prefijo);
$$;

-- ---------------------------------------------------------------------
-- Permisos: el cliente anónimo solo puede ejecutar las dos RPC.
-- ---------------------------------------------------------------------
revoke all on function public.yamacoa_encuesta_votar(text) from public;
revoke all on function public.yamacoa_encuesta_resultados(text) from public;
grant execute on function public.yamacoa_encuesta_votar(text) to anon, authenticated;
grant execute on function public.yamacoa_encuesta_resultados(text) to anon, authenticated;

-- =====================================================================
-- Notas de operador
-- - Orden de aplicación: PRIMERO este fichero, DESPUÉS los
--   `ops/<tema>/poll_supabase.sql` de cada expediente (solo siembran).
-- - Sin deduplicación por votante: no se guarda IP ni identidad. El control
--   anti-repetición vive en localStorage del navegador, como en toda la
--   plataforma. Es deliberado: un expediente sobre represión no debe
--   registrar quién vota qué.
-- - Los seis temas de la generación antigua (represion, angola,
--   convocatoria_11j, desaparecidos_2023, asesinatos_masacres,
--   servicio_militar) siguen sobre la tabla `poll_votes` con
--   `poll_increment`. Esta tabla NO los sustituye todavía: conservan sus
--   votos históricos. Ver ENCUESTAS.md para el plan de convergencia.
-- =====================================================================
