-- =====================================================================
-- ops/protesta_solitaria/poll_supabase.sql
-- Encuesta del expediente "Protestar solo"
-- (3 preguntas: cargo, visibilidad, cifras)
-- Convención Yamacoa: tabla con RLS cerrada + RPC SECURITY DEFINER de
-- solo incremento sobre lista blanca sembrada. El renderer llama:
--   supabase.rpc('protesta_solitaria_votar', { p_pregunta, p_opcion })
--   supabase.rpc('protesta_solitaria_totales')  -> jsonb { pregunta: { opcion: votos } }
-- Los textos de opción DEBEN coincidir byte a byte con protesta_solitaria.json.
-- =====================================================================

create table if not exists public.protesta_solitaria_votos (
  pregunta   text   not null,
  opcion     text   not null,
  votos      bigint not null default 0 check (votos >= 0),
  actualizado timestamptz not null default now(),
  primary key (pregunta, opcion)
);

comment on table public.protesta_solitaria_votos is
  'Agregados de la encuesta del tema protesta_solitaria. Sin datos personales: solo contadores.';

-- RLS cerrada: nadie lee ni escribe la tabla directamente; todo pasa por las RPC.
alter table public.protesta_solitaria_votos enable row level security;
revoke all on table public.protesta_solitaria_votos from anon, authenticated;

-- ---------------------------------------------------------------------
-- Siembra de la lista blanca (idempotente). Combinación no sembrada = voto rechazado.
-- ---------------------------------------------------------------------
insert into public.protesta_solitaria_votos (pregunta, opcion) values
  ('cargo', 'Sí, lo sabía'),
  ('cargo', 'No, es la primera vez que lo veo documentado'),
  ('cargo', 'Lo sospechaba pero no conocía casos concretos'),
  ('visibilidad', 'Lo protege: hay más presión internacional'),
  ('visibilidad', 'Lo expone más: se vuelve un caso ejemplarizante'),
  ('visibilidad', 'No hay diferencia real'),
  ('cifras', 'La más amplia (1.260): capta el fenómeno completo'),
  ('cifras', 'La más estricta (820): mide lo verificable'),
  ('cifras', 'Ambas, si se explica la diferencia de método')
on conflict (pregunta, opcion) do nothing;

-- ---------------------------------------------------------------------
-- RPC de voto: solo incrementa (+1) combinaciones sembradas.
-- ---------------------------------------------------------------------
create or replace function public.protesta_solitaria_votar(p_pregunta text, p_opcion text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.protesta_solitaria_votos
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
--   { "cargo": { "Sí, lo sabía": 12, ... }, "visibilidad": {...}, "cifras": {...} }
-- ---------------------------------------------------------------------
create or replace function public.protesta_solitaria_totales()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_object_agg(t.pregunta, t.ops), '{}'::jsonb)
  from (
    select pregunta, jsonb_object_agg(opcion, votos) as ops
    from public.protesta_solitaria_votos
    group by pregunta
  ) t;
$$;

-- ---------------------------------------------------------------------
-- Permisos: el cliente anónimo solo puede ejecutar las dos RPC.
-- ---------------------------------------------------------------------
revoke all on function public.protesta_solitaria_votar(text, text) from public;
revoke all on function public.protesta_solitaria_totales() from public;
grant execute on function public.protesta_solitaria_votar(text, text) to anon, authenticated;
grant execute on function public.protesta_solitaria_totales() to anon, authenticated;

-- =====================================================================
-- Notas de operador
-- - Si el pipeline cambia el texto de una opción en protesta_solitaria.json,
--   hay que sembrar aquí la combinación nueva (insert ... on conflict do nothing);
--   la vieja puede conservarse para no perder histórico.
-- - El renderer degrada en silencio a localStorage si las RPC fallan o no
--   existe window.__yamacoaSupabase: este SQL es opcional para la vista previa
--   y obligatorio para el agregado global.
-- - Sin deduplicación por votante (no se guarda IP ni identidad): el control
--   anti-repetición vive en localStorage, como en los demás temas.
-- =====================================================================
