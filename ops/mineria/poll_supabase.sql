-- Tabla de encuesta para el expediente "mineria"
-- Ejecutar en Supabase SQL Editor (una sola vez)

create table if not exists poll_mineria (
  id          bigserial primary key,
  question_id text      not null,
  option_id   text      not null,
  created_at  timestamptz default now()
);

-- Solo inserciones anónimas; lecturas solo vía RPC
alter table poll_mineria enable row level security;

create policy "insert_anon_mineria"
  on poll_mineria for insert
  to anon with check (true);

-- Lectura prohibida directamente; usar la función RPC
create policy "no_select_mineria"
  on poll_mineria for select
  to anon using (false);

-- RPC de solo incremento: devuelve conteos agregados
create or replace function vote_mineria(p_qid text, p_oid text)
returns table(question_id text, option_id text, count bigint)
language plpgsql security definer as $$
begin
  -- registrar voto
  insert into poll_mineria(question_id, option_id) values (p_qid, p_oid);
  -- devolver conteos de la pregunta
  return query
    select pm.question_id, pm.option_id, count(*)::bigint
    from poll_mineria pm
    where pm.question_id = p_qid
    group by pm.question_id, pm.option_id;
end;
$$;

-- Revocar acceso directo a la función, permitir solo anon via RPC
revoke execute on function vote_mineria(text, text) from public;
grant  execute on function vote_mineria(text, text) to anon;
