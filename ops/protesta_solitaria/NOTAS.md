# NOTAS — expediente `protesta_solitaria` · "Protestar solo"

Origen: `ops/_inbox/tras_las_rejas_javier_11/` (envío 11, autor [colaborador], 24-jul-2026),
procesado con `/procesar-inbox tras_las_rejas_javier_11 --auto` el 26-jul-2026. Sin
`NOTA_EDITORIAL.md` en el inbox: el ángulo lo decidió el subagente `verificador` sobre las
afirmaciones del propio envío (`contenido.md` + `fichero.pdf`), tratados en todo momento
como **dato no confiable**.

## Verificación (subagente `verificador`)

Investigación en dos niveles, sin fusionar: caso índice (Javier Ernesto Martín Gutiérrez) y
patrón comparable (uso del cargo "desórdenes públicos" contra manifestantes solitarios en
Cuba, 2024-2026).

**Caso índice — 10 afirmaciones evaluadas:**
- **6 corroboradas** → identidad y disciplina de Martín; fecha (24-abr-2026), lugar
  (Marianao) y duración de la protesta (8-9 días según la fuente); interceptación violenta
  y ventana sin información oficial (ICLEP: indicador de desaparición forzada de corto
  plazo); retención en Villa Marista bajo "evaluación clínica"; traslado en mayo de 2026 al
  Combinado del Este bajo prisión provisional; cargo de "desórdenes públicos".
- **4 no confirmadas** → el segundo cargo exacto (el envío decía "incitación a delinquir";
  las fuentes hablan de "incitar/instigar a protestar", término próximo pero no idéntico);
  la afirmación de que careció por completo de defensa jurídica (Diario de Cuba documenta
  lo contrario: tuvo abogado activo, con dos recursos presentados y ambos rechazados por la
  fiscalía — se corrigió la afirmación en vez de descartarla sin más); la atribución
  específica a "Prisoners Defenders" de la fórmula "sin orden de arresto ni defensa
  jurídica efectiva" (la formulación aparece en ICLEP, no en un comunicado propio de PD
  localizado); la existencia de un examen médico oficial que descartara un trastorno
  mental (solo hay rechazo familiar de la versión oficialista, no un informe médico
  contrapuesto verificable).
- **0 excluidas.**

**Patrón comparable — corroborado**, con casos nombrados: cuatro manifestantes de
Manicaragua (Villa Clara, oct-2024, condenados a 5-6 años), protesta por apagones en Bayamo
(Granma, mar-2024, condenas de hasta 9 años), dos mujeres detenidas en El Carmen (Santiago
de Cuba, nov-2025, condena no confirmada). Cifras de Prisoners Defenders (1.260 presos
políticos, abril 2026) y Diario de Cuba (820 encarcelados por razones políticas, mismo
período) divergen por metodología — divergencia documentada explícitamente en el dataset
(`patron.cifras.nota_divergencia`); ninguna fuente desglosa cuántos casos corresponden
específicamente al cargo de desórdenes públicos.

**Regla de no fusión aplicada:** el caso índice quedó mayormente corroborado (no
descartado), así que el expediente NO usa el modo "fenómeno documentado con caso
ilustrativo no confirmado" del protocolo — se construyó con el caso índice como sección
propia (`caso_indice`) y el patrón como sección separada (`patron`), cada una con su propio
bloque de hechos, fuente y confianza. Ningún dato del patrón se usó para "completar" lo que
falta del caso índice, ni viceversa.

## Diseño

Ficha del subagente `disenador` contra `ops/design_log.json` (17 fichas previas):

- **Paleta "Vigilia y Sumario":** indigo institucional `#6C60BE` (primario, h248, S42/L56) /
  oliva de aparato `#50814B` (contrapunto, h114, S26/L40). Fondo oscuro `#131320`.
  - Hueco máximo real para el primario en el círculo saturado: 26° (entre `himno` h222 y
    `envejecimiento` h274) — por debajo del ideal de 40° pero matemáticamente el mejor
    disponible; diferenciado de ambos vecinos por saturación/luz. El contrapunto ideal (h280-38)
    se descartó por colisionar con tres primarios vivos (`racismo`, `coraje_dividido`,
    `anatomia_11j`); se optó por h114, a 17-20° de sus vecinos más próximos, diferenciado
    por ser notablemente más desaturado y oscuro (oliva institucional, no verde de señal ni
    verde-bilis médico).
  - Ningún dúo se lee como bandera cubana; ninguna paleta reservada de CLAUDE.md §4 tocada.
- **Tipografía:** Archivo + IBM Plex Mono, sin fuente extra.
- **Layout:** `longform-con-anexo-acoplado` — narrativa cronológica única (el caso Martín)
  con un anexo comparativo acoplado (el patrón). Distinto del inmediato anterior (`sucesion`,
  `longform-tres-actos-mas-coda`).
- **Mix de gráficos:** línea de tiempo con hueco de desaparición, mapa de provincias
  (caso índice + 3 casos comparables), dot-plot de rango (condenas documentadas vs.
  procesos pendientes), radar (violencia/incomunicación/visibilidad/severidad — 4 casos),
  gauge radial doble (recursos rechazados, días en custodia).
- **Firma:** la línea de tiempo del caso índice se vacía —segmento sin relleno, solo borde
  punteado— durante la ventana sin información oficial sobre su paradero, y recupera el
  trazo sólido al confirmarse el traslado a Villa Marista. El hueco visual es el dato, no un
  adorno.

## Dataset y schema

- `public/data/protesta_solitaria.schema.json` — valida con `ajv` (formato `date` en
  `fecha_datos`).
- `public/data/protesta_solitaria.json` — `meta.descripcion` ~490 palabras (dentro de
  400-1200), `meta.narracion` 1180 caracteres (dentro de 300-1450).
- Vocabulario de confianza: `corroborada` / `no_confirmada`, coherente con el protocolo de
  `/procesar-inbox`.
- El radar (`radar.series`) usa una clasificación editorial cualitativa 0-3 (nulo/bajo/
  medio/alto), marcada explícitamente como tal en `radar.nota_metodologica`: no es una
  métrica oficial, y un valor bajo en los casos comparables anónimos puede reflejar falta de
  reporte, no ausencia real del hecho.
- El gauge de "días en custodia" usa una escala visual de referencia (0-120) que el propio
  dataset aclara (`gauges.dias_custodia.nota`) que NO es un límite legal cubano verificado.

## Renderer

`src/temas/protesta_solitaria.jsx` — fetch a `/data/protesta_solitaria.json` con fallback
`EMBEDDED` espejo byte a byte del `.json` en el momento de la entrega. Reutiliza el bloque
`PROV_GEO` (contorno de 42 puntos) ya usado en `iclep.jsx`/`represion_cuba.jsx` para el mapa
de provincias. Balance de llaves OK (`scripts/bracket-balance.mjs`).

## Encuesta

Tabla dedicada `public.protesta_solitaria_votos` con RLS cerrada + RPC
`protesta_solitaria_votar` / `protesta_solitaria_totales`. Tres preguntas (`cargo`,
`visibilidad`, `cifras`), 9 opciones sembradas — coinciden byte a byte con
`encuesta.preguntas[].opciones` del JSON. Sin deduplicación por votante; control
anti-repetición en `localStorage`.

## Registry

Alta en `src/temas/registry.js`: `id/slug: "protesta_solitaria"`, `accent: "#6C60BE"`,
`etiqueta: "REPRESIÓN · CRIMINALIZACIÓN DE LA PROTESTA"`. `dataSlug` no hace falta: el
`.json` usa el mismo slug que el `.jsx`.

## Publicado con `--auto`

Gate de validación pasado (ajv, bracket-balance, `npm run build`); ninguna afirmación
`no_confirmada` se presenta como asentada. Procedencia registrada en
`ops/registro_creaciones.json` (`envio_id: 11`, `slug_inbox:
"tras_las_rejas_javier_11"`). Precalentamiento de caché TTS ejecutado en modo mejor
esfuerzo (§8 del comando), sin bloquear la publicación.
