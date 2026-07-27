-- =====================================================================
-- ops/sulmira/poll_supabase.sql
-- Encuesta del expediente "La voz que le prestaron" (Sulmira Martínez Pérez)
-- (3 preguntas: condena, confesion, cifras)
-- Convención Yamacoa: tabla con RLS cerrada + RPC SECURITY DEFINER de
-- solo incremento sobre lista blanca sembrada. El renderer llama:
--   supabase.rpc('sulmira_votar', { p_pregunta, p_opcion })
--   supabase.rpc('sulmira_totales')  -> jsonb { pregunta: { opcion: votos } }
-- Los textos de opción DEBEN coincidir byte a byte con sulmira.json.
-- =====================================================================

create table if not exists public.sulmira_votos (
  pregunta   text   not null,
  opcion     text   not null,
  votos      bigint not null default 0 check (votos >= 0),
  actualizado timestamptz not null default now(),
  primary key (pregunta, opcion)
);

comment on table public.sulmira_votos is
  'Agregados de la encuesta del tema sulmira. Sin datos personales: solo contadores.';

-- RLS cerrada: nadie lee ni escribe la tabla directamente; todo pasa por las RPC.
alter table public.sulmira_votos enable row level security;
revoke all on table public.sulmira_votos from anon, authenticated;

-- ---------------------------------------------------------------------
-- Siembra de la lista blanca (idempotente). Combinación no sembrada = voto rechazado.
-- ---------------------------------------------------------------------
insert into public.sulmira_votos (pregunta, opcion) values
  ('condena', 'No, es desproporcionada'),
  ('condena', 'Depende del contenido exacto de las publicaciones'),
  ('condena', 'Sí, si incluye llamados a protestar'),
  ('confesion', 'Sí, lo sabía'),
  ('confesion', 'No, es la primera vez que lo veo documentado'),
  ('confesion', 'Lo sospechaba pero no conocía casos concretos'),
  ('cifras', 'El total actualizado (1.281), aunque falte el desglose'),
  ('cifras', 'El desglose disponible (142 mujeres), aunque esté desactualizado'),
  ('cifras', 'Que se publique pronto un desglose para la cifra nueva')
on conflict (pregunta, opcion) do nothing;

-- ---------------------------------------------------------------------
-- RPC de voto: solo incrementa (+1) combinaciones sembradas.
-- ---------------------------------------------------------------------
create or replace function public.sulmira_votar(p_pregunta text, p_opcion text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.sulmira_votos
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
--   { "condena": { "No, es desproporcionada": 12, ... }, "confesion": {...}, "cifras": {...} }
-- ---------------------------------------------------------------------
create or replace function public.sulmira_totales()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_object_agg(t.pregunta, t.ops), '{}'::jsonb)
  from (
    select pregunta, jsonb_object_agg(opcion, votos) as ops
    from public.sulmira_votos
    group by pregunta
  ) t;
$$;

-- ---------------------------------------------------------------------
-- Permisos: el cliente anónimo solo puede ejecutar las dos RPC.
-- ---------------------------------------------------------------------
revoke all on function public.sulmira_votar(text, text) from public;
revoke all on function public.sulmira_totales() from public;
grant execute on function public.sulmira_votar(text, text) to anon, authenticated;
grant execute on function public.sulmira_totales() to anon, authenticated;

-- =====================================================================
-- Notas de operador
-- - Si el pipeline cambia el texto de una opción en sulmira.json, hay que
--   sembrar aquí la combinación nueva (insert ... on conflict do nothing);
--   la vieja puede conservarse para no perder histórico.
-- - El renderer degrada en silencio a localStorage si las RPC fallan o no
--   existe window.__yamacoaSupabase: este SQL es opcional para la vista
--   previa y obligatorio para el agregado global.
-- - Sin deduplicación por votante (no se guarda IP ni identidad): el control
--   anti-repetición vive en localStorage, como en los demás temas.
-- =====================================================================
