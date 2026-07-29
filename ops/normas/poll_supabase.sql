-- =====================================================================
-- ops/normas/poll_supabase.sql
-- Siembra de la encuesta de "Reconstruir la norma" (tema: normas / dataset reconstruccion-civica)
--
-- REQUIERE haber aplicado antes ops/_shared/poll_supabase.sql, que crea la
-- tabla única y las dos RPC. Este fichero SOLO siembra la lista blanca de
-- claves: no crea objetos ni concede permisos. Ver ENCUESTAS.md.
--
-- Clave: <meta.slug>::<pregunta.id>::<opcion.id>
-- El slug de la clave es `meta.slug` del dataset (reconstruccion-civica), que NO
-- coincide con el id del tema en el registry (normas): el tema declara
-- `dataSlug`. Es deliberado y está documentado en ENCUESTAS.md §2.2.
-- =====================================================================

insert into public.yamacoa_encuesta_votos (clave) values
  ('reconstruccion-civica::formulacion::o1'),  -- A la cultural: al cubano se le perdió el civismo
  ('reconstruccion-civica::formulacion::o2'),  -- A la del entorno: la conducta es adaptación a los incentivos
  ('reconstruccion-civica::formulacion::o3'),  -- A una mezcla de las dos
  ('reconstruccion-civica::formulacion::o4'),  -- A ninguna de las dos
  ('reconstruccion-civica::palanca::o1'),  -- Publicar normas descriptivas verdaderas y agregadas
  ('reconstruccion-civica::palanca::o2'),  -- Infraestructura de verdad: archivo, protocolo y corrección pública de errores
  ('reconstruccion-civica::palanca::o3'),  -- Inoculación informativa: reconocer la manipulación antes de verla
  ('reconstruccion-civica::palanca::o4'),  -- Reconocimiento horizontal entre pares
  ('reconstruccion-civica::riesgo::o1'),  -- Campañas de vergüenza colectiva contra la propia población
  ('reconstruccion-civica::riesgo::o2'),  -- Sustituir una historia oficial por otra
  ('reconstruccion-civica::riesgo::o3'),  -- Fabricar un «hombre nuevo» alternativo
  ('reconstruccion-civica::riesgo::o4')  -- Que la diáspora se constituya en autoridad tutelar
on conflict (clave) do nothing;

-- =====================================================================
-- Preguntas (referencia para el operador)
-- formulacion: Antes de leer este expediente, ¿a cuál de las dos formulaciones te acercabas más?
-- palanca: De lo ejecutable ahora, sin permiso ni cambio político, ¿qué crees que rendiría más en Cuba hoy?
-- riesgo: De las contraindicaciones que el propio modelo enumera, ¿cuál te parece más probable que se cometa?
--
-- Si un /refrescar cambia el TEXTO de una opción no hay que tocar nada: la
-- clave va por id, no por texto, y los votos acumulados se conservan. Solo
-- hay que sembrar aquí si se añade o se renombra un ID.
-- =====================================================================
