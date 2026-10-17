-- =====================================================================
-- ops/negligencia/poll_supabase.sql
-- Siembra de la encuesta de "Negligencia criminal o genocidio silencioso"
-- (tema: negligencia / dataset public/data/negligencia.json)
--
-- REQUIERE haber aplicado antes ops/_shared/poll_supabase.sql, que crea la
-- tabla unica `yamacoa_encuesta_votos` y las dos RPC. Este fichero SOLO
-- siembra la lista blanca de claves: no crea objetos ni concede permisos.
-- Ver ENCUESTAS.md.
--
-- Clave: <meta.slug>::<pregunta.id>::<opcion.id>
-- El slug de la clave es `meta.slug` del dataset (negligencia-o-genocidio),
-- que NO coincide con el id del tema en el registry (negligencia). El
-- renderer construye la clave con `d.slug` del propio dataset, asi que la
-- siembra debe usar ese valor y no el del registry.
-- =====================================================================

insert into public.yamacoa_encuesta_votos (clave) values
  -- categoria: Tras revisar los tres estandares, cual describe mejor la
  -- responsabilidad del Estado cubano por la mortalidad de la ultima decada?
  ('negligencia-o-genocidio::categoria::o1'),  -- Genocidio en sentido jurídico estricto
  ('negligencia-o-genocidio::categoria::o2'),  -- Crimen de lesa humanidad, aún no acreditado
  ('negligencia-o-genocidio::categoria::o3'),  -- Incumplimiento sostenido de obligaciones propias
  ('negligencia-o-genocidio::categoria::o4'),  -- Negligencia sin intencionalidad
  ('negligencia-o-genocidio::categoria::o5'),  -- La responsabilidad principal es del embargo

  -- factor: Que factor considera determinante en el exceso de mortalidad
  -- 2020-2025?
  ('negligencia-o-genocidio::factor::o1'),     -- La asignación interna de recursos
  ('negligencia-o-genocidio::factor::o2'),     -- El embargo estadounidense
  ('negligencia-o-genocidio::factor::o3'),     -- La pandemia y sus secuelas
  ('negligencia-o-genocidio::factor::o4'),     -- El envejecimiento y la emigración de personal sanitario
  ('negligencia-o-genocidio::factor::o5'),     -- Una combinación sin factor dominante

  -- terminologia: Usar la palabra genocidio en este caso, ayuda o perjudica
  -- la exigencia de responsabilidad?
  ('negligencia-o-genocidio::terminologia::o1'),  -- Ayuda: nombra la gravedad real
  ('negligencia-o-genocidio::terminologia::o2'),  -- Perjudica: ofrece una refutación fácil
  ('negligencia-o-genocidio::terminologia::o3'),  -- Es indiferente al resultado político
  ('negligencia-o-genocidio::terminologia::o4')   -- No tengo posición formada
on conflict (clave) do nothing;

-- =====================================================================
-- Notas de operador
--
-- - Si un /refrescar cambia el TEXTO de una opcion no hay que tocar nada: la
--   clave va por id, no por texto, y los votos acumulados se conservan. Solo
--   hay que sembrar aqui si se anade o se renombra un ID.
-- - Los comentarios de cada linea reproducen el texto vigente el 17 de agosto
--   de 2026. Son referencia para el operador, no contrato: la fuente de verdad
--   del enunciado es public/data/negligencia.json.
-- - Sin deduplicacion por votante (ni IP ni identidad): el control
--   anti-repeticion vive en localStorage, como en toda la plataforma.
-- - Comprobacion tras aplicar:
--     select clave, votos from public.yamacoa_encuesta_votos
--      where starts_with(clave, 'negligencia-o-genocidio::')
--      order by clave;   -- deben salir 14 filas
-- =====================================================================
