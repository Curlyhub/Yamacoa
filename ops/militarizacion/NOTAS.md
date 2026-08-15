# NOTAS — expediente `militarizacion` · "Guerra sin declarar"

Origen: `ops/_inbox/militar/Cubalex-Militarizacion-en-Cuba_ReporteAug2026.pdf`
(informe especial de Cubalex, "Cuba: militarización social y excepcionalidad de
facto", febrero-julio 2026, corte de datos 25 de julio de 2026, versión final
1 de agosto de 2026), procesado el 15 de agosto de 2026 vía `/procesar-inbox`.
Carpeta propiedad de `root` en el filesystem, solo lectura para el resto de
usuarios; el fichero se leyó sin necesidad de privilegios elevados
(`pypdf`, ya que `pdftotext`/poppler-utils no estaba instalado y no había
`sudo` sin contraseña disponible). Sin `NOTA_EDITORIAL.md` en el inbox: el
ángulo lo decidió el propio contenido del informe, tratado en todo momento
como **dato no confiable** pese a tratarse de una ONG de derechos humanos
reconocida. Sin inyección de instrucciones detectada en el texto extraído.

## Verificación (subagente `verificador`)

Investigación en dos niveles: hechos y casos individuales verificados contra
prensa independiente, fuentes oficiales y organizaciones de derechos humanos
(nunca fusionados con las series agregadas), y las dos series numéricas
propias del monitoreo de Cubalex, evaluadas por separado.

**11 afirmaciones evaluadas, 9 corroboradas, 2 no confirmadas (divergentes),
0 excluidas:**

- **Corroboradas (9):** la sesión del Consejo de Defensa Nacional del 17 de
  enero de 2026 y su desmentido oficial del 19 de enero; la Resolución
  6/2026 del MININT (Gaceta Oficial No. 65, 18 de mayo, congelamiento de
  cuentas bancarias sin aviso previo); la campaña "Mi Firma por la Patria"
  (6,2 millones de firmas, mayo de 2026); la restricción de viajes
  interprovinciales desde el 18 de junio de 2026; y los cinco casos
  individuales (Eduardo Ceballos, Alexander Verdecia, Andy García Lorenzo,
  Manuel Cuesta Morúa, Luis Manuel Otero Alcántara), todos con fuentes
  independientes de Cubalex (CiberCuba, 14ymedio, Diario de Cuba, Martí
  Noticias, CubaNet, EFE, NPR, Gaceta Oficial).
- **No confirmadas / divergentes (2):** la serie mensual de eventos y
  represión, y la serie de protestas mensuales. Ambas son la métrica interna
  del propio monitoreo de Cubalex; no existe réplica exacta en otro
  observatorio. La serie de protestas en particular **diverge** de las
  cifras publicadas por el Observatorio Cubano de Conflictos (OCC) para los
  mismos meses (mayo: OCC reporta 1.311 protestas/denuncias en total, 46
  presenciales, frente a 109 de Cubalex; junio: OCC reporta 1.220 en total,
  107 presenciales — récord propio —, frente a 254 de Cubalex). No se
  intentó reconciliar ambas series: se presentan por separado, cada una
  atribuida a su fuente, y las cifras de Cubalex quedan marcadas de forma
  visible como "según Cubalex" en `cifras.advertencia` y
  `cifras.nota_divergencia_occ` del dataset, nunca como corroboradas por
  segunda fuente.

**Regla de no fusión aplicada:** el dataset separa siempre `origen`,
`fases`, `cifras` (marcadas), `riesgo`, `geografia` y `casos` como bloques
independientes; ninguna cifra de las series agregadas se usó para completar
lo que falta en los casos individuales, ni viceversa. La escala de riesgo
(`riesgo.historial`) solo asigna un nivel numérico a partir de abril de 2026,
que es lo único que Cubalex cuantifica en su informe público; febrero y
marzo quedan marcados como "sin cuantificar" en vez de inventar un valor.

## Diseño

Ficha del subagente `disenador` contra `ops/design_log.json` (22 fichas
previas, incluida `registry.js` con 30 accents reales de portada),
vinculante, sin cambios:

- **Paleta "Plomo de Cuartel":** plomo-violeta institucional `#4D4068`
  (primario, h260, S24/L33 — el gris de un uniforme de campaña o el cristal
  ahumado de un tribunal militar) y papel kaki de expediente `#C7BEAE`
  (contrapunto, h38, S18 — casi acromático a propósito, color de dossier y
  sello). El primario ocupa el hueco de 26° más cercano disponible en el
  círculo de accents real de `registry.js` (12° de `protesta_solitaria`,
  14° de `envejecimiento`), diferenciado por saturación/luz (mitad de croma
  de sus vecinos). El contrapunto es **exclusivo del renderer** (sellos
  "NO CUMPLE", arco caliente del dial, barras de represión, mapa de
  cobertura): nunca sale como `accent` de `registry.js`. Ninguna paleta
  reservada de CLAUDE.md §4 tocada; no se lee como bandera cubana (par
  frío/cálido desaturado, sin azul+rojo dominante). Fondo oscuro `#15121C`.
- **Tipografía:** Archivo + IBM Plex Mono, sin fuente extra (expediente
  institucional/legal, sin verso que justifique Spectral).
- **Layout:** `seis-secciones-con-espina-cronologica` — distinto del
  inmediato anterior en la bitácora (`marco_fondo_soberano`,
  `doctrina-en-cinco-partes-con-matriz-de-trazabilidad`).
- **Mix de gráficos (8 tipos, sin repetir bar+line):** dial radial de
  riesgo con aguja clavada en el tope mecánico (semicírculo SVG + fila de
  "trail" de seis meses que registra el ascenso como cicatriz, sin inventar
  cifras para febrero-marzo); mapa de cobertura en small multiples (misma
  geometría congelada `CUBA_FEATURE` de `represion_cuba.jsx`, opacidad de
  relleno proporcional al número de provincias por mes, **sin** shading por
  provincia nombrada porque el informe no las identifica); barra anotada de
  eventos mensuales con capa de represión superpuesta y % rotulado; línea de
  protestas con el tramo de julio punteado (mes parcial); espina horizontal
  de fases con línea conectora; galería de casos con la cronología de
  hábeas corpus de Otero Alcántara plegada dentro de la tarjeta (sin widget
  propio, según autocrítica del disenador); checklist con sello tipográfico
  "NO CUMPLE" (semáforo neutro, sin rojo/verde de tráfico); encuesta.
- **Firma:** el dial de riesgo clavado en 5 desde abril, con el arco
  feb-abril representado como trayecto no cuantificado (fila de meses con
  conector punteado) en vez de una aguja que sube con cifras inventadas —
  ajuste deliberado sobre la ficha original del disenador, que asumía datos
  mensuales numéricos que el informe fuente no publica antes de abril.

## Dataset y schema

- `public/data/militarizacion.schema.json` — JSON Schema draft-07,
  `additionalProperties: false` en todos los objetos, valida con `ajv`
  (formato `date` en `fecha_datos`).
- `public/data/militarizacion.json` — `meta.descripcion` 575 palabras
  (dentro de 400-1200), `meta.narracion` 1.412 caracteres (dentro de
  300-1450, sin em dashes verificado por script).
- Vocabulario de confianza: `corroborada` / `no_confirmada`, coherente con
  el protocolo de `/procesar-inbox`. Las dos series agregadas no llevan
  `confianza` por ítem (son series numéricas, no afirmaciones discretas):
  su estado de verificación vive en `cifras.advertencia` y
  `cifras.nota_divergencia_occ`, ambos de prosa explícita.
- `geografia.lugares_identificados` solo incluye los siete lugares que el
  informe nombra explícitamente (seis municipios de La Habana y un evento en
  Santiago de Cuba); no se inventaron las demás provincias de los conteos
  mensuales.
- `evaluacion_juridica` traslada la evaluación jurídica del propio informe
  (cinco requisitos internacionales de un estado de excepción legítimo,
  todos incumplidos), aplicada sobre hechos ya verificados de forma
  independiente por este expediente (sesión del CDN, Resolución 6/2026,
  denegaciones de hábeas corpus).
- Bloque `metodologia` incluido (fuentes, periodo, cadencia, extracción
  agnóstica de motor, validación, limitaciones, cambios metodológicos)
  siguiendo la convención de `represion.json` y otros temas recientes.

## Renderer

`src/temas/militarizacion.jsx` — fetch a `/data/militarizacion.json` con
fallback `EMBEDDED` espejo del `.json` en el momento de la entrega. Balance
de llaves OK (`scripts/bracket-balance.mjs`). Sin `<Narrador/>` (es global en
`Layout.jsx`, no se tocó). Reutiliza verbatim la constante `CUBA_FEATURE`
(contorno de 42 puntos) de `represion_cuba.jsx` solo para el contorno
silueta del mapa de cobertura; usa `d3.geoMercator`/`d3.geoPath` (dependencia
ya presente en el proyecto) para proyectar esa silueta una sola vez vía
`useMemo`. Sin `PROV_GEO`: no hay señal por provincia nombrada porque el
informe no las identifica individualmente (ver nota de `geografia` arriba).
Todos los demás gráficos (dial, barras, línea, espina de fases, checklist)
son SVG/CSS puro, sin librería de gráficos adicional.

## Encuesta

Tabla dedicada `public.militarizacion_votos` con RLS cerrada + RPC
`militarizacion_votar` / `militarizacion_totales`. Tres preguntas
(`excepcion`, `tribunal_militar`, `cifras`), 9 opciones sembradas —
coinciden byte a byte con `encuesta.preguntas[].opciones` del JSON. Sin
deduplicación por votante; control anti-repetición en `localStorage`.

## Registry

Alta en `src/temas/registry.js`: `id/slug: "militarizacion"`,
`accent: "#4D4068"`, `etiqueta: "ESTADO Y DERECHO · MILITARIZACIÓN"`,
`publicado: "2026-08-15"`.

## Validación

- `npx ajv-cli validate -c ajv-formats -s public/data/militarizacion.schema.json
  -d public/data/militarizacion.json` → **valid**.
- `node scripts/bracket-balance.mjs src/temas/militarizacion.jsx` → **OK**.
- `npm run build` → pendiente de confirmar en el gate de `/procesar-inbox`
  antes del centinela `RESULTADO.json`.
- Pendiente de un humano: revisión editorial y publicación (este expediente
  se entrega para revisión, no se publica automáticamente — sin `--auto`).
