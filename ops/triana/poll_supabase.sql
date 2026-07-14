-- ───────────────────────────────────────────────────────────────────────────
-- Encuesta del expediente "triana" (renderer: triana_reformas.jsx, congelado).
--
-- El renderer llama a:  rpc('incrementar_voto', { p_tabla, p_pregunta, p_opcion })
-- con p_tabla = 'votos_triana_reformas' (viene del dataset, encuesta.tabla_supabase).
--
-- En lugar de crear una tabla por tema, esta RPC es un ADAPTADOR sobre la tabla
-- compartida public.poll_votes del proyecto (ver ops/electrica/poll_supabase.sql):
-- p_tabla se usa solo como PREFIJO del question_id ("votos_triana_reformas:q1"),
-- nunca como identificador SQL — sin SQL dinámico, sin superficie de inyección.
--
-- Seguridad: mismo modelo que el resto — RLS bloquea escrituras directas; solo
-- esta función (SECURITY DEFINER) escribe, y solo suma 1 por llamada.
-- Idempotente: se puede ejecutar entera las veces que haga falta.
-- NOTA: el renderer no lee los totales de Supabase (muestra conteos locales);
-- esta tabla acumula el agregado global para el operador.
-- ───────────────────────────────────────────────────────────────────────────

-- Prerrequisito compartido (idéntico al del resto de temas; no hace nada si ya existe)
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

-- RPC con la firma que espera el renderer congelado de triana
create or replace function public.incrementar_voto(p_tabla text, p_pregunta text, p_opcion text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- p_tabla es una etiqueta de espacio de nombres, NUNCA un identificador SQL.
  insert into public.poll_votes (question_id, option_id, votes)
  values (p_tabla || ':' || p_pregunta, p_opcion, 1)
  on conflict (question_id, option_id)
  do update set votes = poll_votes.votes + 1,
                updated_at = now();
end;
$$;

revoke all on function public.incrementar_voto(text, text, text) from public;
grant execute on function public.incrementar_voto(text, text, text) to anon, authenticated;

-- Lectura de totales (operador):
--   GET  {SUPABASE_URL}/rest/v1/poll_votes?select=*&question_id=like.votos_triana_reformas:*
-- Voto (lo hace el renderer):
--   POST {SUPABASE_URL}/rest/v1/rpc/incrementar_voto
--   body: {"p_tabla":"votos_triana_reformas","p_pregunta":"q1","p_opcion":"a"}
-- Headers en ambas: apikey + Authorization: Bearer {ANON_KEY}
