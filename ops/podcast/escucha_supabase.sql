-- Escucha privada de las grabaciones procesadas (2026-10-18). Ejecutar una vez en el SQL Editor.
-- procesar.sh deja aquí escucha.mp3 (<autor>/<grabación>.mp3) para que SOLO su autor la oiga en
-- el estudio antes de decidir; se borra al publicar o descartar. Temporal: el original vive en el
-- servidor propio.
insert into storage.buckets (id, name, public) values ('grabaciones-escucha', 'grabaciones-escucha', false)
on conflict (id) do nothing;

drop policy if exists "escucha: leer la propia" on storage.objects;
create policy "escucha: leer la propia" on storage.objects
  for select using (bucket_id = 'grabaciones-escucha' and (storage.foldername(name))[1] = auth.uid()::text);
-- Solo la service role (procesar.sh) escribe y borra.
