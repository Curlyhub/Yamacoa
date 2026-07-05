-- ───────────────────────────────────────────────────────────────────────────
-- Persistencia global de la encuesta del tema "servicio-militar" (Yamacoa)
-- Ejecutar una vez en el SQL editor de Supabase (o en tu Postgres).
--
-- Modelo: una fila por (pregunta, opción) con un contador atómico.
-- Seguridad: RLS bloquea escrituras directas; sólo la función poll_increment
-- (SECURITY DEFINER) puede escribir, y sólo suma 1. La anon key es pública por
-- diseño; lo único que un cliente puede hacer es leer totales e incrementar.
--
-- NOTA: la tabla y la RPC son COMPARTIDAS entre todos los temas de Yamacoa. Si
-- ya la creaste para otro expediente, NO hace falta volver a crearla: reutilízala.
-- Las preguntas de este tema son q1 y q2.
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.poll_votes (
  question_id text   not null,
  option_id   text   not null,
  votes       bigint not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (question_id, option_id)
);

alter table public.poll_votes enable row level security;

drop policy if exists "poll_votes read" on public.poll_votes;
create policy "poll_votes read"
  on public.poll_votes for select
  using (true);

-- (Sin policy de insert/update/delete: las escrituras directas quedan prohibidas.
--  Sólo la RPC de abajo puede modificar la tabla.)

create or replace function public.poll_increment(q text, o text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.poll_votes (question_id, option_id, votes)
  values (q, o, 1)
  on conflict (question_id, option_id)
  do update set votes = poll_votes.votes + 1,
                updated_at = now();
end;
$$;

revoke all on function public.poll_increment(text, text) from public;
grant execute on function public.poll_increment(text, text) to anon, authenticated;

-- Lectura:  GET  {SUPABASE_URL}/rest/v1/poll_votes?select=question_id,option_id,votes
-- Voto:     POST {SUPABASE_URL}/rest/v1/rpc/poll_increment   body: {"q":"q1","o":"a"}
-- Headers en ambas: apikey + Authorization: Bearer {ANON_KEY}
--
-- Preguntas de este tema:
--   q1 (a,b,c,d) · qué es lo más grave de lo documentado
--   q2 (a,b,c,d) · qué pesará más en la reserva juvenil ante una guerra
