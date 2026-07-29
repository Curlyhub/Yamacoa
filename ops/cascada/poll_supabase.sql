-- =====================================================================
-- ops/cascada/poll_supabase.sql
-- Siembra de la encuesta de "Del subsuelo al fondo" (tema: cascada / dataset cascada-valor-minero)
--
-- REQUIERE haber aplicado antes ops/_shared/poll_supabase.sql, que crea la
-- tabla única y las dos RPC. Este fichero SOLO siembra la lista blanca de
-- claves: no crea objetos ni concede permisos. Ver ENCUESTAS.md.
--
-- Clave: <meta.slug>::<pregunta.id>::<opcion.id>
-- El slug de la clave es `meta.slug` del dataset (cascada-valor-minero), que NO
-- coincide con el id del tema en el registry (cascada): el tema declara
-- `dataSlug`. Es deliberado y está documentado en ENCUESTAS.md §2.2.
-- =====================================================================

insert into public.yamacoa_encuesta_votos (clave) values
  ('cascada-valor-minero::p1::o1'),  -- Lo que el país podría llegar a ingresar
  ('cascada-valor-minero::p1::o2'),  -- El metal del subsuelo a precio de mercado, sin descontar nada
  ('cascada-valor-minero::p1::o3'),  -- Un valor ya descontado de costes y de tiempo
  ('cascada-valor-minero::p1::o4'),  -- No tenía claro qué medían
  ('cascada-valor-minero::p2::o1'),  -- La geología: una laterita de baja ley exige un proceso caro
  ('cascada-valor-minero::p2::o2'),  -- Los términos pactados con el socio extranjero
  ('cascada-valor-minero::p2::o3'),  -- El deterioro del país: red eléctrica, riesgo y coste de capital
  ('cascada-valor-minero::p2::o4'),  -- Nada anómalo: es lo corriente en minería
  ('cascada-valor-minero::p3::o1'),  -- Sí, pero como custodia de una opción, no como reparto de abundancia
  ('cascada-valor-minero::p3::o2'),  -- Sí, tal como se plantea: el valor realizable basta
  ('cascada-valor-minero::p3::o3'),  -- No: lo realizable no cubre siquiera la deuda externa
  ('cascada-valor-minero::p3::o4')  -- No se puede decidir sin auditar el resto de los yacimientos
on conflict (clave) do nothing;

-- =====================================================================
-- Preguntas (referencia para el operador)
-- p1: Antes de leer esto, ¿qué creías que medían las cifras de riqueza mineral cubana que circulan?
-- p2: El Estado cubano capta en torno al 3,5 % del valor bruto in situ de su mejor activo minero. ¿Qué lo explica mejor?
-- p3: Con este multiplicador sobre la mesa, ¿sigue en pie el argumento de un fondo soberano minero cubano?
--
-- Si un /refrescar cambia el TEXTO de una opción no hay que tocar nada: la
-- clave va por id, no por texto, y los votos acumulados se conservan. Solo
-- hay que sembrar aquí si se añade o se renombra un ID.
-- =====================================================================
