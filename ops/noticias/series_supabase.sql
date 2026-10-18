-- Series de referencia de las noticias automáticas (2026-10-18). Ejecutar una vez en el
-- SQL Editor de Supabase (también está en noticias_supabase.sql para instalaciones nuevas).
-- Los puntos son PERMANENTES: la noticia que los aportó se borra a los 3 días, el dato no.
-- El catálogo de series vive en el repo (ops/noticias/series.json); aquí solo los puntos.
create table if not exists noticias_series_puntos (
  serie    text not null,                 -- id del catálogo (series.json)
  fecha    text not null,                 -- AAAA | AAAA-MM | AAAA-MM-DD según la frecuencia
  valor    numeric not null,
  fuente   text not null,                 -- medio que publicó el dato
  url      text,                          -- pieza original
  noticia  text,                          -- id de la noticia que lo aportó (sin FK: caduca)
  ciclo    text,
  creado   timestamptz not null default now(),
  primary key (serie, fecha)
);
alter table noticias_series_puntos enable row level security;
-- Sin políticas: solo la service role (el ciclo) lee y escribe.
