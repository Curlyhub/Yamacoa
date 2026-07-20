# NOTAS — expediente `coraje-dividido` · "Coraje dividido"

Edición especial (`meta.edicion: "especial"`). Mide las dos mitades de una paradoja cubana: el
**valor** —operacionalizado como protesta bajo coste represivo— y la **desunión** —operacionalizada
como fragmentación organizativa del exilio, mediante el Índice de Fragmentación del Exilio (IFE),
elaboración propia—. Contrasta el caso cubano con Polonia 1989, Chile 1988, Sudáfrica 1994,
Myanmar, Venezuela, Irán y Eritrea.

## Origen y estado de verificación (LEER ANTES DE PUBLICAR)

- **Llegó ya construido.** El set completo (`.jsx` + `.json` + `.schema.json`) se depositó en
  `ops/_import/coraje-dividido/` y se cableó con `/importar` el **20-jul-2026**. No pasó por
  `/crear-tema`: no hubo ingesta desde `ops/_inbox/` ni ficha del subagente `disenador`.
- **⚠ NO se ha ejecutado el subagente `verificador` sobre este dataset.** Las 18 referencias del
  bloque `referencias` no se han cotejado contra fuente primaria en este repositorio. Todo lo que
  sigue describe el trabajo de *cableado*, no de verificación editorial. **Esta es la salvedad
  bloqueante de §6.2 del contrato: procede una pasada de verificación antes de `/publicar`.**
- Puntos que un verificador debería mirar primero, por ser los más citados en la UI y los de
  procedencia más delicada:
  - El **>94% de insatisfacción** y el **60,9% / 64,9%** proceden de una encuesta de coalición
    **no probabilística por autoselección** (42.263 respuestas, 24-abr a 1-may 2026). El dataset ya
    lo marca, y la nota de `divergencias` aclara que el 61% es agregado isla+exilio y no un desglose
    insular puro. Conviene comprobar que esa distinción sigue visible en la UI, no solo en el JSON.
  - El **79%** del exilio de Florida (Bendixen & Amandi + Tarrance para Miami Herald, n=800, ±3,5)
    es de universo distinto al anterior: no son comparables sin la salvedad.
  - Las **107 protestas de jun-2026** (OCC) son el eje de la sección `valor_medido`; el pipeline
    debería refrescarlas con cada informe mensual.
  - El **IFE es índice propio**, no una métrica externa. Sus puntuaciones por componente y la
    fórmula compuesta (`puntuación × (1 + log₁₀(unidades rivales))`) son elaboración del expediente;
    varias `unidades` están marcadas `(est.)`. No debe presentarse con autoridad de fuente externa.
  - Las cifras de **Polymarket** son mercados finos (~$126k de volumen) y están marcadas
    `reportado`, no `confirmado`. Correcto, pero conviene que la UI no las mezcle con encuestas.
  - `constelacion.nota_decadas` ya advierte que las décadas de fundación son estimadas por registro
    documental disperso, no censo.

## Cambios aplicados durante el importado

El renderer llegó bien construido —estilos inline, cero Tailwind, paleta propia declarada— así que
**no se restiló** (instrucción explícita del operador). Los únicos cambios al `.jsx`:

1. `datosUrl` por defecto: `/datos/coraje_dividido.json` → **`/data/coraje_dividido.json`**. La ruta
   original no existe y siempre daba 404; funcionaba solo por la segunda entrada del array de
   fallback. Corregido antes de congelar para no dejar una petición fallida en cada carga.
2. Array de rutas envuelto en `[...new Set(...)]`: al arreglar el default, las dos entradas pasaban
   a ser idénticas y un fallo de red habría hecho dos peticiones a la misma URL. Se conserva el
   fallback cuando alguien pasa un `datosUrl` propio.
3. Comentarios de cabecera (líneas 8 y 894) actualizados a `/data/`.
4. `DATOS_EMBEBIDOS` regenerado desde el dataset vivo tras añadir la capa narrativa. Verificado por
   comparación de objetos (no de texto): la instantánea es idéntica al `.json`. Si el pipeline
   vuelve a tocar el dataset, **esta instantánea queda desfasada**; solo importa si falla el fetch.

Fuera del `.jsx`: dataset y schema colocados en `public/data/` con guion bajo
(`coraje_dividido.json`), y por eso la entrada del registry lleva `dataSlug: "coraje_dividido"`
mientras el `id`/`slug`/`path` usan guion medio (`coraje-dividido`).

## Diseño

- Paleta propia del renderer: verde caña **`#8FB259`** ("isla", h95) / magenta **`#C2497F`**
  ("exilio", h330), sobre fondo `#0F131B`. Ninguna paleta reservada de CLAUDE.md §4 se toca.
- `accent` de la card: **`#C2497F`** (el magenta). Se descartó el verde caña por proximidad al
  oliva `#6E9537` de `angola`. El magenta no colisiona con ninguno de los otros 20 acentos.
- Sistema de confianza propio en tres niveles (`confirmado` / `reportado` / `estimado`) con chip
  visible por dato — coherente con la exigencia de §6.2 de que la incertidumbre vaya en la UI.
- Dado de alta en `ops/design_log.json` el 20-jul-2026 (ficha 14). Como llegó por `/importar` y no
  pasó por el subagente `disenador`, la ficha se reconstruyó a partir del renderer congelado y lleva
  campo `procedencia` que lo dice.
- **Proximidades de matiz detectadas al dar el alta** (medidas contra las 13 fichas previas):
  - verde caña `#8FB259` (h84) está a **1°** del primario de `angola` (`#6E9537`, h85) y a 11° del
    contrapunto de `envejecimiento` (`#78AD52`, h95);
  - magenta `#C2497F` (h333) está a **6°** del primario de `racismo` (`#8B5A6B`, h339), aunque muy
    por encima en saturación, y a 17° de `anatomia_11j` (`#E85D75`, h350).
  Ninguna es bloqueante —el fondo oscuro y la saturación separan lo suficiente— pero explican por
  qué el `accent` de la card es el magenta y no el verde, y quedan anotadas en la ficha para que el
  próximo expediente no tome ninguno de los dos tonos sin diferenciarse.

## Encuesta

- Tres preguntas (`cuello`, `mando`, `cuota`), 11 opciones en total.
- Convención **propia del tema**, distinta de la de `envejecimiento`: tabla dedicada
  `public.coraje_dividido_votos` con RLS cerrada + dos RPC `SECURITY DEFINER`
  (`coraje_dividido_votar`, `coraje_dividido_totales`), en lugar de la tabla compartida
  `poll_votes` con `rpc_incrementar`.
- Verificado en el importado: nombres de RPC y parámetros (`p_pregunta`, `p_opcion`) coinciden con
  las llamadas del renderer (líneas 836 y 853), y las 11 opciones sembradas coinciden **byte a
  byte** con `encuesta.preguntas[].opciones` del JSON. Si el pipeline reescribe un texto de opción,
  hay que sembrar la combinación nueva o ese voto será rechazado por la RPC.
- Sin deduplicación por votante (no se guarda IP ni identidad); el control anti-repetición vive en
  `localStorage`. El renderer degrada en silencio si las RPC fallan.

## Narración TTS

- `meta.descripcion` (1.669 caracteres) y `meta.narracion` (1.447, límite 1.500) añadidos con
  `/narrar` el 20-jul-2026. Cifras en letras, español. Ambos campos declarados en el schema.
- Ninguno de los dos lo consume el renderer congelado: son capa de metadatos y audio.
- **⚠ La caché de `tts.yamacoa.com` NO se ha precalentado.** Queda pendiente para después de
  publicar (o antes, si se autoriza la llamada al servicio externo).

## Pendiente

- [x] Aplicar `poll_supabase.sql` en Supabase — ejecutado sin errores el 20-jul-2026.
- [x] Alta en `ops/design_log.json` — ficha 14, con las proximidades de matiz anotadas.
- [ ] **Pasada del subagente `verificador` sobre las 18 referencias (BLOQUEANTE, SIN HACER).**
      Se lanzó el 20-jul-2026 y **abortó por límite de sesión sin producir informe alguno**: no
      llegó a verificarse ni una sola afirmación. No existe salida parcial que recuperar; hay que
      relanzarla de cero. Cuando termine, incorporar sus hallazgos aquí en una sección
      "Correcciones frente al set original" al estilo de `ops/envejecimiento/NOTAS.md`.
- [ ] Confirmar los campos marcados ⚠ en la card del registry: `etiqueta`, `accent`, `fuentes`.
- [ ] Precalentar caché TTS (`tts.yamacoa.com`), pendiente de autorización.
- [ ] Housekeeping ajeno a este tema: el `design_log` tiene 14 fichas y el registry 22 entradas.
      Faltan 8, entre ellas `cayo-romano`.
