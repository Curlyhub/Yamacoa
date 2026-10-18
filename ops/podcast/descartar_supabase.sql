-- Descartar grabaciones (2026-10-18). Ejecutar una vez en el SQL Editor de Supabase.
-- El autor puede descartar una grabación suya que NO esté publicada (también ya procesada o con
-- error). procesar.sh borra después sus ficheros (servidor y copia local) y marca `purgada`.
-- El «máster que no se borra nunca» es el de lo publicado: lo que su autor descarta se borra.
alter table public.grabaciones add column if not exists purgada timestamptz;

create or replace function public.descartar_grabacion(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update grabaciones set estado = 'descartada', actualizado = now()
   where id = p_id and autor_id = auth.uid() and estado in ('grabando', 'subida', 'procesada', 'error');
  if not found then raise exception 'NO_DESCARTABLE: no existe, no es tuya o ya está publicada'; end if;
end $$;
