-- Episodios de los podcasts automáticos (2026-10-18). Ejecutar una vez en el SQL Editor.
-- Permanentes. La fuente de verdad del feed de podcast: publicar.sh exporta los
-- publicados a data/feed/podcast.json en cada despliegue. El MP3 vive en R2.
create table if not exists podcast_episodios (
  id            text primary key,                -- p-<slug>
  slug          text not null unique,
  formato       text not null check (formato in ('al-dia', 'conversacion')),
  estado        text not null check (estado in ('ensayo', 'revision', 'listo', 'publicado', 'retirado')),
  -- ensayo: voces no definitivas (nunca sale) · revision: espera aprobación humana
  -- listo: aprobado, falta subir el audio a R2 · publicado: en el feed · retirado: fuera
  titulo        text not null,
  pieza         jsonb not null,                  -- entrada del feed (podcast.schema.json) sin audio.url
  guion         jsonb not null,
  transcripcion jsonb not null,                  -- { segmentos: [{ hablante, texto, inicio }] }
  creado        timestamptz not null default now(),
  publicado     timestamptz
);
alter table podcast_episodios enable row level security;
-- Sin políticas: solo la service role (el ciclo y publicar.sh).
