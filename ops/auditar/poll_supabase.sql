-- =====================================================================
-- ops/auditar/poll_supabase.sql
-- Siembra de la encuesta de "Auditar a los aliados" (tema: auditar / dataset propuesta-economica-auditoria)
--
-- REQUIERE haber aplicado antes ops/_shared/poll_supabase.sql, que crea la
-- tabla única y las dos RPC. Este fichero SOLO siembra la lista blanca de
-- claves: no crea objetos ni concede permisos. Ver ENCUESTAS.md.
--
-- Clave: <meta.slug>::<pregunta.id>::<opcion.id>
-- El slug de la clave es `meta.slug` del dataset (propuesta-economica-auditoria), que NO
-- coincide con el id del tema en el registry (auditar): el tema declara
-- `dataSlug`. Es deliberado y está documentado en ENCUESTAS.md §2.2.
-- =====================================================================

insert into public.yamacoa_encuesta_votos (clave) values
  ('propuesta-economica-auditoria::p1::o1'),  -- Vender tierras UBPC sin catastro
  ('propuesta-economica-auditoria::p1::o2'),  -- Liberar precios sin transferencia operativa
  ('propuesta-economica-auditoria::p1::o3'),  -- Subir tipos sin auditar la banca
  ('propuesta-economica-auditoria::p1::o4'),  -- Anunciar la fragmentación de GAESA sin controlar sus activos
  ('propuesta-economica-auditoria::p2::o1'),  -- Sí, y debería ser el programa principal
  ('propuesta-economica-auditoria::p2::o2'),  -- Sí, como anexo de contingencia
  ('propuesta-economica-auditoria::p2::o3'),  -- No: sin alivio no hay programa viable
  ('propuesta-economica-auditoria::p3::o1'),  -- Costa Rica: diversificar preservando el universalismo
  ('propuesta-economica-auditoria::p3::o2'),  -- Corea: reciprocidad y apertura financiera al final
  ('propuesta-economica-auditoria::p3::o3'),  -- Chile posterior a 1990: crecer y subir impuestos en democracia
  ('propuesta-economica-auditoria::p3::o4')  -- Ninguno: Cuba necesita una secuencia propia
on conflict (clave) do nothing;

-- =====================================================================
-- Preguntas (referencia para el operador)
-- p1: De las cuatro inversiones del orden verificación → liberalización, ¿cuál te parece más peligrosa?
-- p2: ¿Debería la propuesta publicar un programa alternativo que funcione sin alivio de las sanciones?
-- p3: ¿Qué caso internacional te parece más aplicable a Cuba?
--
-- Si un /refrescar cambia el TEXTO de una opción no hay que tocar nada: la
-- clave va por id, no por texto, y los votos acumulados se conservan. Solo
-- hay que sembrar aquí si se añade o se renombra un ID.
-- =====================================================================
