# NOTAS — expediente `fondo` · "El fondo que aún no existe"

Origen: **`ops/_import/fondo/`** (set ya construido: renderer + dataset + schema
+ ficha de diseño), cableado con `/importar` el 29-jul-2026. **No es un
`/procesar-inbox`**: el expediente no se investigó ni se diseñó en esta sesión,
llegó hecho.

El tema se llama `fondo` (id, slug y ruta `/fondo`) pero su dataset conserva el
nombre interno del set, `marco-fondo-soberano`, enlazados por `dataSlug` en el
registry. Mismo mecanismo que `cascada`, `auditar` y `normas`. El `fetch` del
renderer fija ese nombre: `RUTA_DATOS = "/data/marco-fondo-soberano.json"`.

## Qué es este expediente — y qué no

**Es un tema normativo, no de datos.** El dataset codifica un articulado y su
evidencia comparada, no una serie temporal. El propio `meta` lo declara en
`naturaleza: "marco normativo"` y en `advertencia_naturaleza`:

> "Esto no es la propuesta de un fondo. Es el conjunto de condiciones que
> cualquier fondo soberano cubano debería satisfacer para merecer ese nombre,
> con independencia de qué recurso lo alimente, qué gobierno lo cree o qué
> mayoría lo apruebe."

El pie de página repite la salvedad: las cifras que contiene son ilustrativas del
argumento institucional y no constituyen estimación patrimonial. `premisa`
incluye además una **declaración de sesgo explícita** — el texto sostiene que la
rigidez constitucional de las reglas de extracción es preferible a la
flexibilidad legislativa, y admite que eso es un juicio, no un dato. La escala de
confianza del renderer añade un nivel propio, `normativo`, junto a `confirmado`,
`reportado` y `estimado`.

La estructura es un argumento cerrado: **cuatro fallos documentados → catorce
artículos**. Alaska (fallo de perímetro), Timor-Leste (rigidez), Venezuela
(proliferación) y Kazajistán (custodia). Cada artículo nuevo declara de qué fallo
deriva, y cada fallo declara qué artículos genera.

## Verificación — NO realizada en esta sesión

**Aviso para el operador:** no se ejecutó el subagente `verificador`. El
expediente cita cifras concretas y contrastables que **deberían cotejarse antes
de publicar**, entre otras:

- Alaska: 75.588 votos contra 38.518 en 1976; Artículo IX Sección 15 de la
  constitución del estado; el giro de 2018-19 sobre las ganancias.
- Venezuela: 174.898 M USD comprometidos por el FONDEN en 781 proyectos
  (2005–mediados de 2015), ~29 % a gasto corriente y ~5 % a armamento — marcadas
  como `reportado`, fuente Transparencia Venezuela.
- Kazajistán: embargo de Bruselas de octubre de 2017; 22.600 M USD congelados por
  BNY Mellon (~40 % de la cartera) frente a un laudo de ~542 M; el tribunal sueco
  que sí reconoció inmunidad al Banco Nacional.
- Timor-Leste y la regla del 3 %; el paso noruego del 4 % al 3 % en 2017.

Lo que **sí** se comprobó aquí, por script:

- **Trazabilidad bidireccional fallo ↔ artículo: OK.** Ningún fallo apunta a un
  artículo inexistente, ningún artículo responde a un fallo inexistente, y no hay
  asimetrías (si un fallo declara generar el artículo N, el artículo N declara
  responder a ese fallo, y viceversa).
- Numeración del articulado continua, 1..14, sin huecos.
- Las 27 rutas de datos que lee el renderer existen en el dataset real, no solo
  en el fallback embebido.

## Diseño — heredado del set, no propuesto aquí

No se ejecutó el subagente `disenador`. Ficha asentada en `ops/design_log.json`
(21 → 22 fichas).

- **Paleta "Bronce y Ciruela".** Fondo `#131310`. Primario bronce oliva
  `#83924F` (h73, S30/L44) → portada y renderer. Contrapunto ciruela `#9B65A4`
  (h291) **reservado al renderer**: marca los cuatro fallos comparados y nunca
  sale a `accent` del registry, así que no compite por hueco en la portada (mismo
  criterio que el magenta de `sulmira` y la laterita de `cascada`).
- **Mapeo semántico**, que es lo mejor de esta ficha: bronce = prescripción (el
  articulado); ciruela = diagnóstico (los cuatro fallos); ámbar = lo que queda
  sin decidir. El lector puede leer el argumento por color antes de leerlo por
  texto.
- **El círculo está saturado** y este tema lo estrecha más. Tras asignar h235 a
  `cascada`, el hueco de 26° entre `himno` y `protesta-solitaria` queda partido.
  Los dos mejores huecos restantes empataban, y la ficha los toma **ambos**, uno
  por rol: h73 para el primario y h291 para el contrapunto renderer-only.
- **Corrección a la ficha, hecha durante el import.** Decía que el margen alto de
  h73 era con `coraje_dividido` h84 — pero ese h84 es el *contrapunto* de aquel
  tema, que no sale a portada; su `accent` de registry es magenta `#C2497F`. El
  vecino real por ese lado es **`angola` (`#6E9537`, h85), a 12°**. Recalculado
  sobre los accents del registry, los dos vecinos son `sucesion` a 11° y `angola`
  a 12°. La conclusión de la ficha no cambia: se separa de ambos por saturación
  (S30 frente a S50 de `sucesion` y S46 de `angola`), pero **en la portada habrá
  tres cards de familia oliva**. Es lo que hay que mirar al confirmar el accent.
- El ámbar `#C98A17` no se reclama como acento: convención de plataforma para
  cuestión abierta y decisión pendiente, igual que en `normas` y `cascada`.
- **Tipografía:** Archivo Black + IBM Plex Mono, con Inter de texto corrido.
  Ninguna paleta reservada de CLAUDE.md §4 tocada; no se usa rojo en ningún rol.
- **Elemento firma:** la matriz de trazabilidad. Diagrama bipartito en SVG con
  los cuatro casos a la izquierda y los catorce artículos a la derecha, unidos
  por bandas curvas en ciruela; el hover se propaga en ambos sentidos y hasta el
  cuerpo del documento doscientos píxeles más abajo. Los artículos sin banda van
  en gris y quedan declarados como procedentes del marco original, no derivados
  de un fallo comparado. No decora: es la tesis hecha objeto.

## Cambios aplicados al set durante el import

**Dos enlaces muertos al tema hermano, corregidos.** El set apuntaba a
`/cascada-valor-minero`, que es el `dataSlug` de aquel expediente, **no su ruta**;
la ruta registrada es `/cascada`. Además el proyecto usa `HashRouter`, así que un
`href` sin `#` no navega a la SPA: pide una ruta al servidor y aterriza en la
portada.

| Dónde | Antes | Después |
| --- | --- | --- |
| `meta.tema_hermano.ruta` (pie) | `/cascada-valor-minero` | `#/cascada` |
| `meta.tema_hermano.slug` (rótulo del enlace) | `cascada-valor-minero` | `cascada` |
| `anexo_admisibilidad.criterios[A].enlace_tema` | `cascada-valor-minero` | `#/cascada` |

El criterio A del anexo lo renderiza como `href={"/" + c.enlace_tema}`, con la
barra ya puesta en el `.jsx`: el valor `#/cascada` produce `/#/cascada`, que es la
forma canónica de una URL de `HashRouter` y aterriza bien, aunque recarga la
página. El del pie sí es `#/cascada` limpio y navega sin recarga. Corregir el
prefijo del anexo exigiría tocar el renderer y no compensa.

Los tres cambios están hechos en el dataset **y espejados en `DATOS_EMBEBIDOS`**,
antes de publicar, es decir antes de que el renderer quede congelado según
CLAUDE.md §2.

El set llegó por lo demás limpio: `RUTA_DATOS` ya apuntaba a `public/data/` (no
repitió el defecto de `normas` y `auditar`), ninguna referencia a `/assets/` ni
`/models/`, schema ya normalizado al punto.

## Encuesta — NO la hay, por decisión del operador

El set no traía bloque `encuesta`, el renderer no la contempla y **no se añadió**
(instrucción explícita en el import). En consecuencia **no existe
`ops/fondo/poll_supabase.sql`** y no hay nada que sembrar en Supabase para este
tema. Es una desviación deliberada del set de entregables de CLAUDE.md §3.

Coherente con la naturaleza del expediente: es un articulado normativo, y la
`decision_pendiente` que el documento sí deja abierta —el dividendo ciudadano—
va argumentada por ambos lados en columnas enfrentadas, sin recomendación. Si más
adelante se quiere encuesta, el camino es el de `cascada`: bloque en dataset +
schema, espejo en el fallback, sección en el renderer y siembra de la lista
blanca. Ver `ENCUESTAS.md` §3.

## Registry

`id/slug: "fondo"`, `path: "/fondo"`, `dataSlug: "marco-fondo-soberano"`,
`publicado: "2026-07-29"`. `titulo` y `subtitulo` son literales del `meta`.

**Pendientes de confirmación humana:**

- `etiqueta: "EDICIÓN ESPECIAL · MARCO NORMATIVO"` — `meta.kicker` dice "Edición
  especial" y `meta.naturaleza` "marco normativo"; la etiqueta los junta. El
  único precedente de edición especial es `coraje-dividido`.
- `accent: "#83924F"` — ver Diseño, y en particular la vecindad con `angola`.
- `fuentes` — propuesta durante el import a partir de `d.fuentes` del dataset.

`functions/social-meta.json` ya traía la clave `/fondo` con título y descripción
idénticos al `meta`; no se tocó.

## Relación con `/cascada`

Los dos expedientes se publicaron el mismo día y se referencian sin solaparse:

| | `/cascada` | `/fondo` |
| --- | --- | --- |
| Aporta | el numerador cuantitativo | la arquitectura institucional |
| Naturaleza | dato auditado (NI 43-101) | marco normativo |
| Conclusión | el Estado capta ~3,5 % del bruto in situ | qué condiciones haría falta satisfacer |

El criterio A del anexo de admisibilidad prohíbe usar el valor bruto de contenido
metálico como valor de activo — que es exactamente lo que `/cascada` demuestra
con el único activo cubano auditado. El enlace entre ambos está puesto desde
`/fondo`; **desde `/cascada` no hay enlace de vuelta** a `/fondo` (aquel apunta a
`/mineria`, su numerador). Si se quiere la reciprocidad, es una edición del
dataset de `cascada`, no del renderer.

## Validación

- `npx ajv validate -c ajv-formats` schema ↔ dataset → **valid**.
- `node scripts/bracket-balance.mjs src/temas/marco-fondo-soberano.jsx` → **OK**.
- `npm run build` → **compila**, sin ningún warning atribuible a este renderer.
- Rutas de datos que lee el renderer ↔ dataset real → **27/27 presentes**.
- Trazabilidad fallo ↔ artículo → **OK en ambos sentidos**, sin asimetrías.
- Numeración del articulado → **continua, 1..14**.
- Referencias a `/assets/` y `/models/` → **ninguna**. Nada que colocar, ningún
  huérfano.

## Pendiente antes de publicar

1. **Verificación editorial de las cifras comparadas** (no hecha; ver arriba).
   Aquí importa más de lo habitual: el argumento entero descansa en que los
   cuatro fallos ocurrieron como se cuentan.
2. Confirmar `etiqueta`, `accent` y `fuentes` del registry.
3. Nada que aplicar en Supabase: este tema no tiene encuesta.
4. Opcional: vaciar `ops/_import/fondo/`.

## Capa narrativa — añadida 29-jul-2026

`/narrar`. Solo se tocaron `.json` y `.schema.json`; el renderer no.

- `meta.descripcion` — 741 palabras (rango 400-1200). Registro factual, cifras en
  dígitos. Recorre los cuatro fallos con sus cifras y el artículo que cada uno
  genera, la decisión abierta del dividendo ciudadano, las tres juntas débiles
  que el propio marco declara y el principio rector.
- `meta.narracion` — 1.165 caracteres, bajo el `maxLength: 1450` del schema y el
  límite duro de 1.500 de la API. Cifras en letras, ninguna frase por encima de
  25 palabras (verificado por script; hubo que partir en dos las de Alaska y
  Venezuela). Español.
- Schema: `descripcion` y `narracion` dentro de `meta`, sumadas a `meta.required`,
  `additionalProperties: false` intacto.

`DATOS_EMBEBIDOS` **ya no es espejo exacto** del dataset: le faltan estos dos
campos. Deliberado — `Narrador.jsx` hace fetch de `/data/<dataSlug>.json` y nunca
lee el fallback del renderer.
