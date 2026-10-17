-- Noticias automáticas de Yamacoa: fuente de verdad del feed.
-- Ejecutar UNA vez en el SQL Editor de Supabase (proyecto del portal).
--
-- El sitio NO lee estas tablas: cada ciclo (00:00 y 18:00) exporta las vigentes a
-- /data/feed/noticias.json dentro del build y despliega. Por eso todas las tablas
-- tienen RLS sin políticas públicas: solo la service role (el ciclo) las toca.
--
-- Caducidad: caduca = publicado + 3 días (decisión 2026-10-18; antes 7). El borrado es real (no archivo):
--   1) el ciclo borra las caducadas y redespliega en cuanto empieza;
--   2) pg_cron borra cada 15 min como red de seguridad;
--   3) la SPA oculta una noticia en el segundo exacto en que caduca.
-- No hace falta Redis: el TTL es una columna y un DELETE.

create extension if not exists pg_cron;

do $$ begin
  create type estado_noticia as enum ('publicada', 'retenida', 'retirada');
exception when duplicate_object then null; end $$;
-- retenida: tratada pero sin audio todavía (el TTS falló); se reintenta en el ciclo siguiente.
-- retirada: un editor la quitó a mano; el ciclo siguiente la saca del sitio y pg_cron la borra.

create table if not exists noticias_ciclos (
  id           text primary key,                 -- '2026-10-17T18:00'
  inicio       timestamptz not null default now(),
  fin          timestamptz,
  capturadas   int default 0,
  tratadas     int default 0,
  publicadas   int default 0,
  retenidas    int default 0,
  caducadas    int default 0,
  descartes    jsonb default '[]'::jsonb,         -- [{capturas:[], motivo}]: rastro editorial
  desplegado   boolean default false,
  error        text
);

-- caduca es columna generada y Postgres exige expresión IMMUTABLE. «timestamptz + '7 days'»
-- no lo es (los días dependen del huso por el cambio de hora); 168 horas exactas sí, así que
-- se envuelve en una función inmutable. Tres días de reloj = 72 h, también en octubre.
-- Para cambiar la vida de las noticias basta con reemplazar esta función (y VIDA_MS en
-- ops/noticias/lib/db.mjs y VIDA_DIAS en src/periodico/feed.js); las filas ya guardadas
-- conservan su caduca: recalcúlalas con  update noticias set publicado = publicado;
create or replace function yamacoa_caduca(publicado timestamptz) returns timestamptz
  language sql immutable parallel safe
  as $f$ select publicado + interval '72 hours' $f$;

create table if not exists noticias (
  id           text primary key check (id ~ '^n-[a-z0-9-]+$'),
  slug         text not null unique,
  plantilla    text not null check (plantilla in ('cronica','breve','datos','contraste')),
  seccion      text not null,
  titulo       text not null,
  estado       estado_noticia not null default 'retenida',
  publicado    timestamptz not null,
  caduca       timestamptz not null generated always as (yamacoa_caduca(publicado)) stored,
  actualizado  timestamptz,
  relevancia   numeric not null default 0,
  pieza        jsonb not null,                    -- objeto completo conforme a noticias.schema.json (sin audio)
  guion        text not null,                     -- texto del resumen hablado
  audio        jsonb,                             -- {url, duracion, voz, texto} cuando el TTS terminó
  capturas     text[] not null default '{}',      -- hashes de noticias_capturas usadas
  ciclo        text references noticias_ciclos(id) on delete set null,
  creada       timestamptz not null default now()
);
create index if not exists noticias_caduca_idx on noticias (caduca);
create index if not exists noticias_estado_idx on noticias (estado);

-- Todo lo visto en las fuentes, para no tratar dos veces el mismo artículo.
create table if not exists noticias_capturas (
  hash         text primary key,                  -- sha256 de la URL normalizada
  url          text not null,
  fuente       text not null,
  titulo       text,
  fecha_fuente timestamptz,
  capturada    timestamptz not null default now(),
  ciclo        text
);
create index if not exists noticias_capturas_capturada_idx on noticias_capturas (capturada);

alter table noticias          enable row level security;
alter table noticias_capturas enable row level security;
alter table noticias_ciclos   enable row level security;
-- Sin políticas: anon y authenticated no leen ni escriben. La service role salta RLS.

-- Red de seguridad del borrado a los 3 días (y limpieza de capturas a los 10 y de ciclos a los 90).
select cron.unschedule(jobname) from cron.job where jobname = 'yamacoa_noticias_caducar';
select cron.schedule('yamacoa_noticias_caducar', '*/15 * * * *', $$
  delete from noticias where caduca <= now() or (estado = 'retirada' and actualizado < now() - interval '1 day');
  delete from noticias_capturas where capturada < now() - interval '10 days';
  delete from noticias_ciclos where inicio < now() - interval '90 days';
$$);
