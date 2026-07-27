# NOTAS — expediente `sulmira` · "La voz que le prestaron"

Origen: `ops/_inbox/tras_las_rejas_sulmira_12/` (envío 12, autor [colaborador],
26-jul-2026, título original "Tras las Rejas: Sulmira Martínez."), procesado el
27-jul-2026. Sin `NOTA_EDITORIAL.md` en el inbox: mismo patrón que el expediente
hermano `protesta_solitaria` (envío 11, "tras_las_rejas_javier_11", misma autora,
misma serie "Tras las Rejas"). El ángulo lo decidió el subagente `verificador`
sobre las afirmaciones del propio envío, tratado en todo momento como **dato no
confiable**.

## Verificación (subagente `verificador`)

Investigación en dos niveles, sin fusionar: caso índice (Sulmira Martínez Pérez,
"Salem Cuba") y patrón comparable (condenas por publicaciones en Facebook contra
otros cubanos, 2025-2026).

**Caso índice — 15 afirmaciones evaluadas:**
- **13 corroboradas** → uso de Facebook para memes, mensajes críticos y llamados
  pacíficos a protestar sin cargo de violencia; detención el 10 de enero de 2023
  por la Seguridad del Estado; cargos de propaganda contra el orden constitucional
  y desacato; reclusión inicial en Villa Marista; autoinculpación forzada
  transmitida por televisión estatal; aplazamientos del juicio; juicio celebrado
  en noviembre de 2024 con petición fiscal de 10 años; condena en febrero de 2026
  a 5 años; denuncia de la madre (Norma Pérez Ferrer) por la no entrega de copia
  de la sentencia; traslado en julio de 2025 (antes de la condena) a un
  campamento penitenciario; problemas de salud (neumonía, ficha oficial PD);
  reconocimiento como presa política por 4 organizaciones.
- **2 no confirmadas** → condiciones de reclusión "precarias"/"terribles" en el
  campamento, y presunta negativa arbitraria de libertad condicional: ambas
  dependen de un único testimonio (la madre) recogido por un solo medio
  (CiberCuba), sin corroboración independiente localizada. Quedan **visibles**
  en el renderer (chip "no confirmada" en `Hecho` y en `TimelineSellos`), no
  relegadas a nota al pie.
- **0 excluidas.**

**Patrón comparable — 2 afirmaciones evaluadas, ambas corroboradas:** cifras de
Prisoners Defenders (142 mujeres de 1.260 presos políticos, abril de 2026, y la
actualización de junio de 2026 a 1.281 con "nueva ofensiva contra mujeres" según
Infobae, sin desglose de mujeres actualizado); y los 5 casos comparables nombrados
(Cristian Labrada, 10 años; Yasser García López, 5 años; dos personas vía Infobae,
5 y 4 años; un joven vía El Imparcial, 7 años), todos por publicaciones o críticas
en redes sociales.

**Regla de no fusión aplicada:** el caso índice quedó mayormente corroborado (no
descartado), así que el expediente construye `caso_indice` y `patron` como
bloques separados del dataset, cada uno con su propia fuente y confianza.
Ningún dato del patrón se usó para completar lo que falta del caso índice
(la cifra de mujeres/junio no se recalcula), ni viceversa (el waffle de mujeres
usa exclusivamente `patron.cifras`, nunca datos de Sulmira).

**Total: 17 afirmaciones evaluadas (15 nivel caso + 2 nivel patrón), 15
corroboradas, 2 no confirmadas, 0 excluidas. Sin inyección de instrucciones
detectada en el material de origen.**

## Diseño

Ficha del subagente `disenador` contra `ops/design_log.json` (18 fichas previas),
vinculante, sin cambios:

- **Paleta "Señal Cortada":** verdín institucional `#4E7A44` (primario, h109,
  S28/L37) — "verdín de campamento", diferenciado del verde-señal de
  `convocatoria_11j` (h132), el oliva de `protesta_solitaria` (h114) y el
  verde-jade de `sucesion` (h151) por ser notablemente más oscuro y apagado —
  y magenta interferencia `#CF4AA9` (contrapunto, h317, S58/L55), reservado
  **exclusivamente al renderer** (glitch de la firma, sellos puntuales de
  aplazamiento, celdas de mujeres en el waffle): nunca sale como `accent` de
  `registry.js`, así que no compite por hueco en el círculo saturado de accents
  vivos de la portada. Fondo oscuro. Ninguna paleta reservada de CLAUDE.md §4
  tocada.
- **Tipografía:** Archivo + IBM Plex Mono, sin fuente extra.
- **Layout:** `retrato-vertical-con-friso-de-patron` — cronología vertical del
  caso índice como columna principal, con el patrón comparable (sellos de
  organizaciones, waffle, barra) como friso acoplado. Distinto del inmediato
  anterior (`protesta_solitaria`, `longform-con-anexo-acoplado`).
- **Mix de gráficos:** línea de tiempo vertical con sello "APLAZADO" (plano, sin
  textura, borde 2px, rotado) en cada evento con `es_aplazamiento: true`; fila de
  4 sellos tipográficos planos (Prisoners Defenders, Cubalex, Alas Tensas,
  ICLEP); waffle de 100 celdas normalizado (142 de 1.260 presos políticos, en
  magenta interferencia sobre panel neutro) con nota metodológica visible sobre
  la fecha de corte; barra horizontal de condenas (Sulmira + 5 casos
  comparables), ordenada de mayor a menor, con la barra de Sulmira en magenta
  para distinguirla del resto (verdín).
- **Firma:** el bloque tipográfico de la autoinculpación forzada (IBM Plex Mono,
  gris apagado, tono de acta) se muestra íntegro hasta que la sección entra en
  vista (`IntersectionObserver`) o el usuario pasa el cursor: entonces se
  distorsiona con scanlines horizontales y un desdoblamiento cromático
  rojo/cian (CSS puro, `clip-path` + `mix-blend-mode`, sin librerías), su
  opacidad cae, y debajo aparece, en Archivo y sin distorsión, la afirmación ya
  verificada sobre su actividad real en Facebook antes de la detención. **Ninguna
  de las dos capas es una cita textual inventada**: ambas son `caso_indice.hechos`
  ya verificados del propio dataset (el hecho de la autoinculpación forzada y el
  hecho del uso de Facebook), mostrados con su fuente real; el efecto no
  fabrica un guion de confesión ni una frase atribuida a Sulmira que no esté en
  las fuentes.

## Dataset y schema

- `public/data/sulmira.schema.json` — JSON Schema draft-07, `additionalProperties:
  false` en todos los objetos, valida con `ajv` (formato `date` en
  `fecha_datos` vía `ajv-formats`).
- `public/data/sulmira.json` — `meta.descripcion` 514 palabras (dentro de
  400-1200), `meta.narracion` 1.347 caracteres (dentro de 300-1450, sin em
  dashes verificado por script).
- Vocabulario de confianza: `corroborada` / `no_confirmada`, coherente con el
  protocolo de `/procesar-inbox`.
- `patron.casos_comparables` incluye a Sulmira como entrada propia ("caso
  índice"), igual convención que usó `protesta_solitaria`, para que la barra
  horizontal la compare directamente contra el patrón sin tabla aparte.
- El waffle (`patron.cifras`) deja explícito en `nota_metodologica` que la
  cifra de mujeres (142/1.260) es de abril de 2026 y que la actualización de
  junio de 2026 (1.281 total) no trae desglose de mujeres recalculado: no se
  inventa ese número.

## Renderer

`src/temas/sulmira.jsx` — fetch a `/data/sulmira.json` con fallback `EMBEDDED`
espejo byte a byte del `.json` en el momento de la entrega (verificado por
script: `JSON.stringify` de ambos coincide exactamente). Balance de llaves OK
(`scripts/bracket-balance.mjs`). Sin `<Narrador/>` (es global en `Layout.jsx`,
no se tocó). Sin librerías nuevas: gráficos en JSX + SVG/CSS puro, igual que
`protesta_solitaria.jsx`.

## Encuesta

Tabla dedicada `public.sulmira_votos` con RLS cerrada + RPC `sulmira_votar` /
`sulmira_totales`. Tres preguntas (`condena`, `confesion`, `cifras`), 9 opciones
sembradas — coinciden byte a byte con `encuesta.preguntas[].opciones` del JSON.
Sin deduplicación por votante; control anti-repetición en `localStorage`.

## Registry

Alta en `src/temas/registry.js`: `id/slug: "sulmira"`, `accent: "#4E7A44"`,
`etiqueta: "REPRESIÓN · PRESOS POLÍTICOS"`, `publicado: "2026-07-27"`. No hace
falta `dataSlug`: el `.json` usa el mismo slug que el `.jsx`.

## Validación

- `npx ajv-cli validate -c ajv-formats -s public/data/sulmira.schema.json -d
  public/data/sulmira.json` → **valid**.
- `node scripts/bracket-balance.mjs src/temas/sulmira.jsx` → **OK**.
- Pendiente de un humano: revisión editorial y `npm run build` + publicación
  (este expediente se entrega para revisión, no se publica automáticamente).
