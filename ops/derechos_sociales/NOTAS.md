# NOTAS — expediente `derechos_sociales` · "Julio sin tregua"

Origen: `ops/_inbox/derechossociales/Informe Mensual sobre la Situación de los
Derechos Humanos en Cuba _ Julio 2026 - Cubalex.pdf` (informe mensual de
Cubalex, julio de 2026), procesado el 15 de agosto de 2026 vía
`/procesar-inbox`. Carpeta sin `contenido.md` ni `NOTA_EDITORIAL.md`: solo el
PDF, leído con `pypdf` (`poppler-utils`/`pdftotext` no disponible en el
entorno). Tratado como dato no confiable pese a ser un informe de una ONG de
derechos humanos reconocida; sin inyección de instrucciones detectada.

## Slug y ángulo

El informe original cubre represión política, protestas, violencia
ciudadana y crisis DESC (derechos económicos, sociales y culturales) en un
solo documento. Antes de verificar, se cruzó el contenido contra los temas
ya publicados para evitar duplicación:

- `represion` (serie OCDH mensual) y `militarizacion` (recién publicado:
  sesión del CDN, caso Otero Alcántara, concentración de protestas en La
  Habana) ya cubren represión política y el caso Otero Alcántara — que
  vuelve a aparecer en este informe de julio con más detalle (salida de
  Guanajay dos días antes de cumplir condena, Acción Urgente de la ONU) —
  **no se repite aquí**.
- `electrica` cubre la crisis eléctrica desde un ángulo de ingeniería
  (capacidad instalada, MW). `medidas_176` cubre el paquete de 176 medidas
  desde un ángulo contrafactual comparado con precedentes históricos.
  Ninguno cubre el ángulo de **violación de derechos** sobre las mismas
  crisis, ni el repunte de **violencia ciudadana** (homicidios, feminicidios,
  suicidios), que no tenía expediente propio.

Slug elegido: `derechos_sociales`, coincide con el nombre de la carpeta de
inbox y con el ángulo DESC + violencia ciudadana, genuinamente no cubierto.

## Verificación (subagente `verificador`)

11 afirmaciones evaluadas: **7 corroboradas, 2 parcialmente corroboradas, 2
no confirmadas, 0 excluidas.**

**Corroboradas (DESC):** más de tres meses sin agua potable en zonas
periféricas de La Habana (Diario de Cuba); al menos tres desconexiones
totales del SEN en julio, con fechas verificadas de forma independiente
(6, 10 y 14 de julio — 14ymedio, CiberCuba, Diario de Cuba, más
corroboradas que el propio informe de Cubalex porque tienen fecha exacta);
crisis sanitaria (escasez de insumos de diálisis, neonatología, higiene —
Infobae, Diario de Cuba); cierre del 73% del parque hotelero cubano con
salida de Meliá/Iberostar/Barceló (OnCubaNews, CiberCuba, reconocido por el
Primer Ministro Marrero ante la Asamblea Nacional); las 176 medidas
económicas con sus 92.000 plazas eliminadas y atrasos salariales de hasta
6 meses (The Conversation, CiberCuba); ampliación de sanciones OFAC del 23
de julio contra 2 ciudadanos y 9 entidades (Cubanet, Cuba en Miami,
Departamento de Estado); **9 feminicidios en julio**, confirmados de forma
independiente por el Observatorio de Género Alas Tensas (OGAT), que llegó
al mismo número por su cuenta.

**Parcialmente corroboradas:** el patrón general de robos violentos
(machetes, armas de fuego, crisis de combustible) está bien documentado,
pero no se encontró corroboración específica de que se concentraran en
"equipos de generación eléctrica" como afirma el informe; el inicio de la
distribución de ayuda humanitaria vía Cáritas ($100M) sí está corroborado,
pero las denuncias de desvío o reventa en Granma no.

**No confirmadas:** **37 homicidios en julio**, descrita por Cubalex como
la cifra más alta desde el inicio de su monitoreo en 2022 — es una
afirmación autorreferencial sobre la propia serie de Cubalex; un monitor
independiente distinto, **Cubanet, contó alrededor de 20 muertes violentas
para el mismo mes**, con una metodología distinta (verificación propia más
acotada frente a la red de fuentes más amplia de Cubalex). **4 suicidios**,
también descritos como el máximo del año: Cuba no publica estadística
oficial de suicidios y no se localizó ninguna fuente independiente con
cifra propia.

**Regla de no fusión aplicada:** el dataset nunca promedia ni combina la
cifra de Cubalex (37) con la de Cubanet (~20): ambas se muestran en
`comparativa_homicidios`, cada una con su fuente, dejando visible la
divergencia real entre dos monitores independientes. Los feminicidios,
que sí tienen segunda fuente, se presentan con chip "corroborada"
diferenciado de los homicidios y suicidios ("no confirmada").

## Diseño

Ficha del subagente `disenador` contra `ops/design_log.json` (24 fichas
previas tras corregir una laguna: `angel_veliz` estaba publicado en
`registry.js` pero ausente de la bitácora — el disenador la reconstruyó
antes de comparar), vinculante, con una autocrítica explícita:

- **Paleta "Cisterna y Vino Oxidado":** verde-cisterna institucional
  `#3A5F4D` (primario, h151, S24/L30 — agua estancada, no bronce vivo) y
  vino oxidado casi negro `#3F222B` (contrapunto, h341, S30/L19, uso
  puntual del renderer para marcar violencia). El disenador documenta por
  escrito que la rueda de accents está saturada a grano fino (~47 acentos
  en 360°, separación media 7.7°): el mejor hueco real de primario es de
  36° (no llega al mínimo de 40°) y el de contrapunto es de 46° pero cae
  junto a rojos reservados. Se diferencia por saturación/luminosidad muy
  por debajo de los vecinos más cercanos (`sucesion`-contrapunto cae en el
  mismo matiz h151 pero a S40/L46, mucho más claro y vivo). Mismo patrón ya
  documentado por `cascada_valor_minero`, `marco_fondo_soberano` y
  `auditar`. Ninguna paleta reservada de CLAUDE.md §4 tocada; no se lee
  como bandera cubana.
- **Tipografía:** Archivo + IBM Plex Mono, sin fuente extra.
- **Layout:** `boletin-mensual-en-dos-hilos` — dos hilos narrativos
  (crisis DESC crónica / violencia aguda) que se alternan por sección,
  marcados con una etiqueta "HILO · DESC" / "HILO · VIOLENCIA" visible en
  cada encabezado. Distinto del inmediato anterior (`militarizacion`,
  espina cronológica única).
- **Mix de gráficos:** cuentagotas-calendario de julio (firma, ver abajo);
  comparativa de homicidios Cubalex-vs-Cubanet (dos barras, reemplaza un
  gráfico de línea 2022-2026 que el disenador propuso pero que habría
  requerido fabricar una serie histórica que el informe no publica);
  donut del cierre hotelero (73%/27%, proporción real, no inventada);
  fichas de contexto breve para las medidas económicas; encuesta. Sin
  dial radial (ya usado por `militarizacion`, `electrica`, `envejecimiento`
  y `protesta_solitaria`, según pidió el encargo).
- **Firma — ajuste sobre la ficha original:** el disenador propuso un
  cuentagotas-calendario de 31 días con el nivel de agua bajando día a día
  y el borde de cada gota tiñéndose de vino en los días con homicidio,
  feminicidio o suicidio registrado. El informe de Cubalex **no desglosa
  la fecha exacta de cada muerte violenta** ni da una telemetría diaria del
  nivel de agua (la escasez es una condición sostenida de todo el mes, no
  un nivel que decae). Fabricar esos valores día a día habría violado la
  premisa de no inventar datos. Se adaptó: los 31 días comparten el mismo
  estado de fondo (sin agua potable regular, gota en verde-cisterna
  apagado) y solo los **3 días de apagón nacional total, con fecha
  verificada de forma independiente** (6, 10 y 14 de julio) llevan el
  marcador de vino oxidado con resplandor. Las cifras de violencia (37/9/4)
  se muestran como una franja aparte, explícitamente rotulada "sin fecha
  asignable", nunca proyectadas sobre un día concreto del calendario.

## Dataset y schema

- `public/data/derechos_sociales.schema.json` — JSON Schema draft-07,
  `additionalProperties: false`, valida con `ajv`.
- `public/data/derechos_sociales.json` — `meta.descripcion` 501 palabras
  (dentro de 400-1200), `meta.narracion` 1.299 caracteres (dentro de
  300-1450, sin em dashes).
- Vocabulario de confianza ampliado a tres estados
  (`corroborada`/`parcialmente_corroborada`/`no_confirmada`) porque, a
  diferencia de expedientes anteriores, aquí hay afirmaciones con
  corroboración parcial genuina (el patrón de robos, la ayuda de Cáritas),
  no solo binario corroborado/no confirmado.
- `comparativa_homicidios` es un bloque propio, separado de `violencia`,
  precisamente para que el gate de verificación pueda exigir sus dos
  cifras (Cubalex y Cubanet) sin fusionarlas en un solo número.

## Renderer

`src/temas/derechos_sociales.jsx` — fetch a `/data/derechos_sociales.json`
con fallback `EMBEDDED`. Balance de llaves OK
(`scripts/bracket-balance.mjs`). Sin `<Narrador/>` (global en
`Layout.jsx`). Sin librerías de gráficos nuevas: todo SVG/CSS puro (donut,
barras de comparativa, cuentagotas-calendario), igual que otros temas
recientes.

## Encuesta

Tabla dedicada `public.derechos_sociales_votos` con RLS cerrada + RPC
`derechos_sociales_votar` / `derechos_sociales_totales`. Tres preguntas
(`agua_electricidad`, `cifras_violencia`, `prioridad_estatal`), 9 opciones
sembradas — coinciden byte a byte con `encuesta.preguntas[].opciones`.

## Registry

Alta en `src/temas/registry.js`: `id/slug: "derechos_sociales"`,
`accent: "#3A5F4D"`, `etiqueta: "DERECHOS SOCIALES · JULIO 2026"`,
`publicado: "2026-08-15"`.

## Validación

- `npx ajv-cli validate -c ajv-formats -s public/data/derechos_sociales.schema.json
  -d public/data/derechos_sociales.json` → **valid**.
- `node scripts/bracket-balance.mjs src/temas/derechos_sociales.jsx` → **OK**.
- `npm run build` → pendiente de confirmar en el gate antes del centinela.
- Pendiente de un humano: revisión editorial y publicación (se entrega sin
  `--auto`).
