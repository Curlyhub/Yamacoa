-- Episodios «Elaborados» (estudio) en la misma tabla que los automáticos (2026-10-18).
-- Ejecutar una vez en el SQL Editor de Supabase.
alter table public.podcast_episodios drop constraint if exists podcast_episodios_formato_check;
alter table public.podcast_episodios add constraint podcast_episodios_formato_check
  check (formato in ('al-dia', 'conversacion', 'elaborado'));
