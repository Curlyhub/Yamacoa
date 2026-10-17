# NOTAS — expediente `negligencia` · "Negligencia criminal o genocidio silencioso"

Origen: set ya construido, dejado en `ops/_import/negligencia/` el 17 de
agosto de 2026 y cableado con `/importar`. **No pasó por `/crear-tema` ni por
`/procesar-inbox`**: no hay `ops/_inbox/` de partida, ni informe de subagente
`verificador`, ni ficha del subagente `disenador`. La verificación de las
afirmaciones y la decisión de diseño las trae el propio set; este repositorio
no las ha reproducido. Ver "Deuda" al final.

El set traía tres ficheros y ninguno más: renderer, dataset y schema. No traía
`NOTAS.md` ni `poll_supabase.sql`; ambos se escribieron aquí, después del
import, a partir de los patrones de los expedientes ya publicados.

## Nombres y rutas

El set venía nombrado `negligencia-o-genocidio.*` y el tema se registra como
`negligencia`. Reparto resultante:

| Qué | Dónde | Nombre |
| --- | --- | --- |
| renderer | `src/temas/` | `negligencia-o-genocidio.jsx` (conserva su nombre) |
| dataset | `public/data/` | `negligencia.json` |
| schema | `public/data/` | `negligencia.schema.json` |

El tema **no declara `dataSlug`**: el id del registry y el nombre del dataset
coinciden (`negligencia`). Lo que no coincide es `meta.slug` del dataset, que
sigue siendo `negligencia-o-genocidio` porque es el prefijo de las claves de
voto y el renderer lo lee de ahí. Esa asimetría es deliberada y está
documentada en la cabecera de `poll_supabase.sql`.

Sin assets: el renderer no referencia ninguna imagen, modelo 3D ni vídeo. Todo
es Recharts sobre SVG, con `recharts` que ya era dependencia del proyecto.

## Cambios hechos al renderer durante el import

El set llegaba escrito contra un contrato distinto del de esta plataforma.
Tres correcciones, todas anteriores a la primera publicación (después de
publicar, el `.jsx` queda congelado por CLAUDE.md §2):

1. **URL del dataset.** Traía `fetch("/datos/negligencia-o-genocidio.json")`:
   directorio inexistente aquí y sin `PUBLIC_URL`. Como `App.js` monta los
   temas del registry sin props, esa URL por defecto es la que corre de
   verdad, y el `.catch()` se traga el 404 en silencio: la página habría
   servido para siempre el `DATOS_EMBEBIDOS` sin dar señal de error. Ahora hay
   un `DATA_URL` de módulo con la convención del proyecto.

2. **Transporte de la encuesta.** El componente `Encuesta` esperaba un cliente
   `supabase` por props y llamaba `supabase.rpc(...)`. El proyecto **no depende
   de `@supabase/supabase-js`**: todos los expedientes hablan por REST cruda
   contra `/rest/v1/rpc/…` leyendo `REACT_APP_SUPABASE_URL` y
   `REACT_APP_SUPABASE_ANON_KEY`. Y `App.js` nunca habría pasado esa prop, así
   que la encuesta quedaba muda para siempre. Se sustituyó por los helpers
   `rpcVotar` / `rpcResultados` del patrón de `cascada-valor-minero.jsx`. De
   paso se corrigió el nombre del parámetro de lectura: llamaba con
   `p_clave_prefijo` cuando la RPC compartida recibe `p_prefijo`.

3. **Claves de voto por id.** `encuesta.preguntas[].opciones` era un array de
   cadenas y la clave de voto se construía con el **texto** de la opción, de
   modo que cualquier `/refrescar` que reescribiera un enunciado habría
   reiniciado los contadores en silencio. Se convirtió a `[{ id, texto }]`
   (`o1`…`o5`) en dataset, schema y renderer, que es la convención del resto de
   la plataforma.

El resto del renderer no se tocó: paleta, estructura editorial, gráficos y
copy quedan como venían.

## Dataset y schema

- `public/data/negligencia.schema.json` — JSON Schema draft-07,
  `additionalProperties: false`, valida con `ajv`.
- Se añadió el bloque **`meta`**, que el set no traía. Sin él,
  `scripts/gen-social-meta.mjs` no encuentra `meta.descripcion` y la ruta se
  sirve sin cuerpo indexable (habría sido el único de los 34 expedientes sin
  él), y `src/components/Narrador.jsx` no encuentra `meta.narracion` y no
  ofrece audio. `meta.descripcion` son 950 palabras, dentro del rango 400-1200;
  `meta.narracion`, 1.440 caracteres, por debajo del tope duro de 1.500 que
  aplica el componente. Ambos textos se redactaron **solo a partir del propio
  dataset**, sin añadir ni una cifra que no estuviera ya en él.
- El renderer **no lee `meta`**: sigue leyendo `slug`, `titulo`, `subtitulo`,
  `version` y `fecha_datos` de la raíz, donde ya estaban. `meta` duplica esos
  cinco campos para el consumo de la plataforma. Si un `/refrescar` cambia uno,
  debe cambiar los dos.

## Encuesta

Tabla compartida `public.yamacoa_encuesta_votos` con las RPC
`yamacoa_encuesta_votar` / `yamacoa_encuesta_resultados` de
`ops/_shared/poll_supabase.sql` — no tabla dedicada, que es la convención
antigua. Tres preguntas (`categoria`, `factor`, `terminologia`), 14 opciones
sembradas. **`ops/_shared/poll_supabase.sql` debe estar aplicado antes**; si no
lo está, la siembra falla y los votos se rechazan por diseño.

Sin credenciales `REACT_APP_SUPABASE_*` en el entorno de build, la encuesta cae
a recuento local en `localStorage` sin romper la lectura.

## Registry

Alta en `src/temas/registry.js`: `id/slug/path: "negligencia"`,
`publicado: "2026-08-17"`. Los tres campos editoriales que quedaron marcados
`⚠ CONFIRMAR` (`etiqueta`, `accent` y `fuentes`) recibieron el visto bueno humano
el 2026-10-18 y se publican tal cual.

Sobre el `accent` `#7A2B3F` (ciruela, el color editorial dominante del
renderer): se calcularon las seis entradas de la paleta contra los 34 acentos
ya vivos en portada y **las seis colisionan**. La ciruela es la de menor
colisión: 6° de `racismo-estructural` (`#A33B4A`), del que se separa por 12
puntos de luminosidad (L32 frente a L44), el mismo recurso que ya usan
`cascada` y `fondo`. El ámbar `#C98A17` de la paleta queda descartado de
oficio: el propio dataset lo declara reservado para material contrafactual, y
además cae a 1° de `anatomia-11j`. Alternativa descartada: petróleo `#14494F`
(7° de `cayo-romano`).

## Validación

- `npx ajv validate -s public/data/negligencia.schema.json -d public/data/negligencia.json` → **valid**.
- `node scripts/bracket-balance.mjs src/temas/negligencia-o-genocidio.jsx` → **OK**.
- `npm run build` → compila sin error.
- Pendiente de un humano: revisión editorial y publicación.

## Deuda conocida

- **Sin ficha en `ops/design_log.json`.** El expediente no pasó por el
  subagente `disenador`, así que su paleta y su mix de gráficos no están en la
  bitácora anti-repetición y no cuentan como ocupados para el próximo tema.
- **Sin traza de verificación propia.** Las afirmaciones del dataset vienen
  verificadas de origen según su propia sección `correcciones` y
  `metodologia_global`, pero ningún subagente `verificador` de este repositorio
  las ha cotejado contra fuente primaria.
- **Ortografía del dataset.** Varios enunciados de la encuesta y títulos de
  sección llegaron sin tildes (`cual`, `Que`, `Diseno`, `articulo`,
  `mecanicamente`). No se tocaron durante el import para no mezclar cableado
  con edición; corregirlos es trabajo de `/refrescar` o de una pasada
  editorial, y no requiere tocar el `.jsx`.
