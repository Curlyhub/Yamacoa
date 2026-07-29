# NOTAS — expediente `auditar` · "Auditar a los aliados"

Origen: **`ops/_import/auditar/`** (set ya construido: renderer + dataset +
schema), cableado con `/importar` el 28-jul-2026. **No es un `/procesar-inbox`**:
el expediente no se investigó ni se diseñó en esta sesión, llegó hecho.

El tema se llama `auditar` (id, slug y ruta `/auditar`) pero su dataset conserva
el nombre interno del set, `propuesta-economica-auditoria`, enlazados por
`dataSlug` en el registry. Mismo mecanismo que `normas` y `convocatoria_11j`.

## Verificación — NO realizada en esta sesión

**Aviso para el operador:** las fuentes del dataset y las afirmaciones que
sostienen **no se cotejaron** durante el import. No se ejecutó el subagente
`verificador`. El expediente evalúa críticamente una propuesta económica firmada
por cinco autores; ese tipo de material exige verificación antes de publicar,
más aún cuando el propio dataset admite el problema en `meta.nota_ecosistema`:

> "Los cinco autores son economistas cubanos vinculados en distinta medida a la
> crítica reformista del modelo. Sus fuentes principales —ONEI, CEPAL, FMI,
> elTOQUE, EIU, Cuba Study Group— comparten orientaciones normativas parcialmente
> convergentes. Esta evaluación tiene el mismo problema: usa en buena parte las
> mismas fuentes. Los sesgos de selección se heredan y no se cancelan entre sí."

Que el dataset declare su propio sesgo es buena señal, pero no sustituye al
cotejo. `meta.aviso_simulacion` marca además los controles interactivos como
exploraciones de identidades aritméticas, no predicciones.

## Diseño — heredado del set, no propuesto aquí

No se ejecutó el subagente `disenador`. Ficha registrada a posteriori en
`ops/design_log.json` (20 fichas) para que futuras propuestas no colisionen.

- **Paleta:** fondo `#0A0B0F`, bermellón `#E8462C` como primario, con cian
  `#2FC2D6`, violeta `#8B7BE8`, musgo `#67AE7B`, magenta `#C765A8` y ámbar
  `#C98A17`.
- **Colisión detectada y esquivada.** El bermellón (h8) queda a **3 grados** de
  `represion` (`#C4392B`, h5) y cae de lleno en el rojo que CLAUDE.md §4 reserva
  a represión. Un expediente de economía no debe competir cromáticamente con la
  serie de represión en la portada. Se resolvió como en `desacreditacion`: el
  bermellón se queda **dentro de la página** y a `accent` del registry sale el
  magenta `#C765A8` (h319), el hueco mayor disponible con 14 grados libres. Las
  demás opciones de su propia paleta estaban peor: violeta a 1 grado de
  `protesta_solitaria`, ámbar a 1 de `anatomia_11j`, musgo a 5 de
  `convocatoria_11j`, cian a 8 de `cayo_romano`. **Pendiente de confirmación
  humana.**
- **Tipografía:** Archivo + IBM Plex Mono. Conforme a §4.
- El renderer declara en su cabecera dos reglas de higiene tipográfica que
  conviene propagar al resto de la plataforma: ningún SVG con
  `preserveAspectRatio="none"` (deforma el texto) y las etiquetas largas en HTML
  junto al gráfico, nunca dentro del SVG. Son exactamente los dos defectos que
  hubo que corregir en el gráfico de la ventana institucional de `normas`.

## Cambios aplicados al set durante el import

1. **`RUTA_DATOS` corregida.** El renderer venía con
   `fetch("/datos/propuesta-economica-auditoria.json")`. En este proyecto no
   existe `public/datos/`: la convención es `public/data/`. Tal cual, el fetch
   daba 404 en silencio y la página se quedaba permanentemente en
   `DATOS_EMBEBIDOS`. **Es el segundo set consecutivo con este mismo defecto**
   (el de `normas` lo traía idéntico): conviene avisar a quien genera los sets.
2. **`accent` del registry** cambiado de bermellón a magenta, por lo anterior.

Ambos cambios antes de la publicación, es decir antes de que el renderer quede
congelado según CLAUDE.md §2.

## Encuesta

El set ya traía el bloque `encuesta` y un renderer que apunta al contrato de
**tabla única** de la plataforma:

```
yamacoa_encuesta_votar(p_clave text)
yamacoa_encuesta_resultados(p_prefijo text)
clave = <meta.slug>::<pregunta.id>::<opcion.id>
```

Su cabecera mandaba "verificar contra ENCUESTAS.md antes de publicar", pero **ni
ese documento ni esas RPC existían en el repo**. Tirando de ese hilo apareció el
problema mayor descrito en `ENCUESTAS.md` §1: seis temas ya publicados tienen
encuestas que nunca agregaron un solo voto.

Resuelto adoptando esta convención como la vigente de la plataforma:

- `ops/_shared/poll_supabase.sql` — tabla única, RLS cerrada, las dos RPC
  `SECURITY DEFINER` de solo incremento sobre lista blanca. Se aplica **una sola
  vez** en el proyecto Supabase, antes que cualquier siembra.
- `ops/auditar/poll_supabase.sql` — **solo siembra**: 11 claves (3 preguntas).
- `ENCUESTAS.md` — el documento que el renderer pedía, ahora escrito: contrato,
  estado real de los tres patrones y plan de convergencia.
- `normas` migrado a este mismo contrato.

Detalle de implementación en la RPC de lectura: usa `starts_with(clave, prefijo)`
y **no** `like prefijo || '%'`. Varios slugs de Yamacoa llevan guion bajo
(`convocatoria_11j`, `protesta_solitaria`) y en `like` el guion bajo es comodín
de un carácter, con lo que un tema podría leer claves de otro.

Verificado por script que las 11 claves sembradas coinciden con el dataset en
ambos sentidos, sin duplicados, con ids conformes al schema y sin colisión de
prefijo con `normas`.

## Registry

`id/slug: "auditar"`, `path: "/auditar"`,
`dataSlug: "propuesta-economica-auditoria"`, `publicado: "2026-07-28"`.

`etiqueta: "ECONOMÍA · EVALUACIÓN DE PROPUESTAS"` y `fuentes` (tomado de
`meta.nota_ecosistema`) siguen pendientes de confirmación humana. `titulo` y
`subtitulo` son literales del `meta` del dataset.

### Accent — resuelto 28-jul-2026: `#4A63C8`

La propuesta anterior (`#C765A8`, h319) llevaba una justificación equivocada:
decía tener «14 grados libres, el hueco mayor disponible». Recalculado el hue de
los 26 accents del registry, el hueco mayor de la rueda son **48 grados entre
h200 (`#3BA9E0`) y h248 (`#6C60BE`)**; el magenta caía en la zona más saturada,
a 16 grados de `desacreditacion` (`#AB69A8`) y a 14 de `#C2497F`, con lo que la
portada habría mostrado tres magentas contiguos.

Se fija un indigo del hueco real. El bermellón `#E8462C` del renderer sigue
descartado como accent de portada: a 3 grados de `represion` (`#C4392B`), rojo
reservado por CLAUDE.md §4. El bermellón se queda dentro de la página.

## Capa narrativa — añadida 28-jul-2026

`/narrar auditar`. Solo se tocaron `.json` y `.schema.json`; el renderer no.

- `meta.descripcion` — 914 palabras (rango 400-1200). Registro factual, cifras en
  dígitos. Recoge las tres objeciones (aritmética del Anexo 1, demográfica,
  de secuencia) y arrastra las advertencias metodológicas del dataset: que
  comparar Cuba con Singapur, Corea, Costa Rica y Chile es seleccionar sobre la
  variable dependiente, y que la valoración es juicio analítico, no medición.
- `meta.narracion` — 1.372 caracteres, bajo el `maxLength: 1450` del schema y el
  límite duro de 1.500 de la API. Cifras en letras, años en dígitos, «Oficina
  Nacional de Estadística e Información» desarrollada, ninguna frase por encima
  de 25 palabras (verificado por script). Español.
- Schema: `descripcion` y `narracion` dentro de `meta`, sumadas a `meta.required`,
  `additionalProperties: false` intacto.

`DATOS_EMBEBIDOS` **ya no es espejo exacto** del dataset: le faltan estos dos
campos. Es deliberado y no rompe nada — `Narrador.jsx:47` hace fetch de
`/data/<dataSlug>.json` directamente y nunca lee el fallback del renderer, y el
contrato de `/narrar` prohíbe tocar el `.jsx` congelado.

**Precalentado TTS:** `POST https://tts.yamacoa.com/api/tts` → `200`,
`x-tts-cache: HIT-AFTER-WAIT`, WAV de 3.862.844 bytes (~80 s de audio) en 152 s.
`cached_files` del endpoint de salud pasó de 32 a 33: la entrada quedó en caché.

Dos trampas del precalentado, ambas pisadas aquí:

1. `fetch` de Node **no sirve** — undici corta a los 300 s y la síntesis de un
   guion de ~1.400 caracteres tarda más. Usar `curl --max-time 900` o más.
2. **No canalizar `curl` a `head`.** El primer intento fue
   `curl … -D - | head -20`: `head` cierra la tubería, `curl` muere con SIGPIPE y
   no queda ni WAV ni cabeceras. La petición **sí** había llegado al servidor —
   por eso el reintento devolvió `HIT-AFTER-WAIT` en vez de `MISS`. Escribir
   cuerpo y cabeceras a fichero (`-o` / `-D fichero`) y leerlos después.

## Validación

- `npx ajv validate` schema ↔ dataset → **valid**.
- `node scripts/bracket-balance.mjs src/temas/propuesta_economica_auditoria.jsx`
  → **OK**.
- `npm run build` → **compila** (exit 0), sin warnings nuevos atribuibles a este
  renderer. Corrido con `BUILD_PATH` a un directorio de trabajo, porque `build/`
  sigue bloqueado (ver pendiente 3).
- `DATOS_EMBEBIDOS` ↔ dataset → espejo salvo `meta.descripcion` y
  `meta.narracion`; divergencia deliberada, ver arriba.
- Claves de encuesta dataset ↔ SQL → **OK en ambos sentidos**.

## Pendiente antes de publicar

1. **Verificación editorial de las fuentes** (no hecha; ver arriba).
2. Confirmar `etiqueta` y `fuentes` del registry. `accent` ya resuelto.
3. `sudo rm -rf build` — el directorio conserva 114 ficheros propiedad de `root`
   de una ejecución anterior con `sudo`; `npm run build` falla con `EACCES`
   hasta limpiarlo. Es salida desechable y se regenera entera.
4. Aplicar en Supabase, **en este orden**: `ops/_shared/poll_supabase.sql` y
   después `ops/auditar/poll_supabase.sql`.
