-- ───────────────────────────────────────────────────────────────────────────
-- Persistencia global de la encuesta del tema "angola" (Yamacoa)
--
-- La tabla public.poll_votes y la RPC poll_increment son COMPARTIDAS por todos
-- los temas (ver ops/represion/poll_supabase.sql, que las crea). Si ya están
-- creadas en el proyecto Supabase, NO hay que ejecutar nada nuevo: este tema
-- solo usa el namespace de pregunta "angola:*".
--
-- Se replica aquí el DDL por si se montara en un Postgres limpio.
-- Modelo: una fila por (pregunta, opción) con un contador atómico.
-- Seguridad: RLS bloquea escrituras directas; sólo la función poll_increment
-- (SECURITY DEFINER) puede escribir, y sólo suma 1.
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

-- Preguntas de este tema (namespace "angola:"):
--   angola:q1  opciones a / b / c / d
