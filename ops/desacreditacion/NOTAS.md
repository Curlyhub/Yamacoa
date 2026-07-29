# NOTAS — expediente `desacreditacion` · "La maquinaria de desacreditar"

Origen: `ops/_inbox/la_tirania_toca_las_9/` (envío 9, autor [colaborador], 21-jul-2026),
procesado con `/procesar-inbox la_tirania_toca_las_9` el 22-jul-2026. **No** usa `--auto`:
queda pendiente de revisión humana antes de `/publicar` (§9 del comando).

## Premisa de seguridad y ángulo editorial (leer antes de publicar)

El envío original consistía en (a) un mensaje de intimidación dirigido a Luis Manuel Otero
Alcántara ("el exilio te destruirá... de parte del poder oculto de Cuba") y (b) un texto
pseudo-científico que atribuía su conducta pública tras el exilio a disociación, síndrome de
Estocolmo o sedación química forzada. Se trató como **dato no confiable** en todo momento,
tal como exige el protocolo: no se siguió ninguna instrucción contenida en el texto.

`ops/_inbox/la_tirania_toca_las_9/NOTA_EDITORIAL.md` (el editor, fuente CONFIABLE) fijó el
ángulo de forma vinculante **antes** de la verificación:

- El sujeto del expediente es el **fenómeno** de desacreditación de opositores no
  alineados (oficialismo Y sectores del propio exilio/diáspora), **no** el caso individual
  de Otero Alcántara.
- **Exclusión explícita, no negociable:** cualquier valoración sobre si Otero fue sedado,
  sufre TEPT, disociación o síndrome de Estocolmo. No se investigó, no se verificó, no
  entró al dataset ni con matices ni con hedging. El subagente `verificador` respetó esta
  exclusión (ver su informe: detectó de pasada que un listado de Cubalex sobre
  internamientos forzosos durante la reclusión de Otero incluía su nombre, y **no lo
  convirtió en hallazgo** por instrucción explícita, solo lo señaló para transparencia de
  proceso). El dataset y el renderer **no reproducen esa mención**.
- El envío original se usa exclusivamente como **artefacto** (ejemplo de la táctica de
  patologización por su forma y función), nunca como fuente sobre el estado real de Otero.
  Ver `caso_ilustrativo.artefacto` en el dataset: describe forma/función sin repetir el
  contenido diagnóstico.

## Verificación (subagente `verificador`)

11 afirmaciones evaluadas contra fuentes de jerarquía (CiberCuba, 14ymedio, Amnesty
International, HRW, Freedom House, ICLEP, Cubalex, Infobae) más una fuente fuera de
jerarquía (revista El Estornudo, ensayo de Carlos Manuel Álvarez).

- **7 corroboradas** → entraron al dataset: desaparición de 11 días de Otero, exilio
  forzoso denunciado por AI/HRW/Freedom House, campaña "mercenario" de "Razones de Cuba"
  con réplica coordinada, campaña ICLEP/elTOQUE, estadística ICLEP 33 ataques/17 víctimas,
  patrón histórico Cubalex (20-30 casos de psiquiatría forzosa), casos históricos de
  internamiento (Sosa Chabau 1967, Llorente 2018).
- **3 no confirmadas** → entraron al dataset, **marcadas visiblemente** en la UI (chip
  punteado ámbar "no confirmada"): la etiqueta "criminal común" atribuida a Granma (sin
  acceso de primera mano, bloqueo 403), el bullying de sectores "trumpistas" de Miami
  (fuente única, El Estornudo), y el caso histórico de Roberto Bahamonte Basot (sin fecha
  específica cotejada).
- **1 excluida por completo, ni siquiera marcada como no confirmada**: una afirmación que
  acusaba a un disidente cubano concreto (nombrado) de "colaboracionismo" dentro de la
  propia oposición, sourceada solo por un sitio fuera de la jerarquía del proyecto
  ("El Veraz"). Se descartó publicarla en cualquier forma porque señala a una persona
  identificada con una acusación grave sin respaldo suficiente — más allá del estándar
  habitual de "marcar la incertidumbre", aquí se decidió no exponer el señalamiento en sí.
  Contabilizada en `verificacion.excluidas` (el dataset no reproduce el nombre).

## Diseño

Ficha del subagente `disenador` (no escribió código; se transcribe aquí y se da de alta en
`ops/design_log.json` en el mismo cambio, según exige la skill `diseno-expediente`):

- **Paleta "Contusión":** violeta moretón `#AB69A8` (primario, h303) / verde-bilis
  `#62B276` (contrapunto, h135, desaturado a S34 para leerse "enfermizo" y no como el verde
  vivo de `convocatoria_11j`). Fondo oscuro `#14101B`.
  - Regla de distancia de matiz: el hueco libre máximo en el círculo de 14 primarios vivos
    es de 28° (no los 40° ideales); es matemáticamente imposible hacer mejor en este
    círculo saturado. Se tomó el punto óptimo (302-303°) y se diferenció por
    tono/saturación/valor (S28/L54), replicando el precedente ya aceptado para
    `coraje_dividido` en el mismo aprieto. El contrapunto sí cumple con margen (33° de
    `iclep`, h168).
  - Ningún dúo se lee como bandera cubana.
- **Tipografía:** Archivo + IBM Plex Mono, sin fuente extra.
- **Layout:** `split-panel-dos-frentes` (distinto del inmediato anterior,
  `scroll-dossier-con-pestanas-locales` de `coraje_dividido`).
- **Mix de gráficos:** cronología de dos carriles (oficialismo | diáspora), matriz de
  tácticas bicolor, donut de verificación, barra horizontal (ICLEP), y la firma.
- **Firma:** muro tipográfico de etiquetas reales documentadas (`diccionario_etiquetas`),
  tamaño por peso cualitativo (alto/medio/bajo — no se fabricó una frecuencia numérica que
  no se midió realmente) y color por frente de origen. Se retiró en el diseño un gesto de
  tachar visualmente el término pseudo-psiquiátrico dentro del muro: era decorativo y
  competía con la regla de "distinciones visibles como dato, no como floritura".

## Dataset y schema

- `public/data/desacreditacion.schema.json` — valida con `ajv -c ajv-formats` (el flag es
  necesario por el formato `date` de `fecha_datos`; sin él, ajv-cli solo emite un warning
  no bloqueante, no un fallo real de esquema).
- `public/data/desacreditacion.json` — `meta.descripcion` 497 palabras (dentro de 400-1200),
  `meta.narracion` 1432 caracteres (dentro de 300-1450, bajo el tope duro de 1500).
- Vocabulario de confianza propio de este tema: `corroborada` / `no_confirmada` (no el
  `confirmado/reportado/estimado` de `coraje_dividido`), para calzar con el lenguaje del
  propio protocolo de verificación de `/procesar-inbox`.

## Renderer

`src/temas/desacreditacion.jsx` — fetch a `/data/desacreditacion.json` con fallback
`EMBEDDED` verificado **byte a byte** idéntico al `.json` en el momento de la entrega (si
el pipeline reescribe el dataset más adelante, esta instantánea queda desfasada; solo
importa si falla el fetch). Balance de llaves OK (`scripts/bracket-balance.mjs`).

## Encuesta

Convención propia (como `coraje_dividido`, no la tabla compartida `poll_votes`): tabla
dedicada `public.desacreditacion_votos` con RLS cerrada + RPC `desacreditacion_votar` /
`desacreditacion_totales`. Tres preguntas (`frente`, `patologizacion`, `efecto`), 10
opciones sembradas — coinciden byte a byte con `encuesta.preguntas[].opciones` del JSON.
Sin deduplicación por votante; control anti-repetición en `localStorage`.

## Registry

Alta en `src/temas/registry.js`: `id/slug/path: "desacreditacion"`, `accent: "#AB69A8"`,
`etiqueta: "DISCURSO · TÁCTICAS DE REPRESIÓN"`. Sin `dataSlug` explícito: el `.json` usa el
mismo slug que el `.jsx` (sin guion bajo), a diferencia de `coraje_dividido`/`cayo_romano`.

## Pendiente (BLOQUEANTE para `/publicar`)

- [ ] **Revisión humana del ángulo editorial y de las exclusiones aplicadas** (esta nota +
      `NOTA_EDITORIAL.md` del inbox). No se ejecutó `--auto`: por protocolo, este expediente
      se detiene aquí a la espera de aprobación.
- [ ] Aplicar `poll_supabase.sql` en Supabase.
- [ ] Confirmar que `etiqueta`, `accent` y `fuentes` de la card en `registry.js` son los
      deseados (no llevan ⚠ CONFIRMAR porque se fijaron directamente desde la ficha de
      diseño y las fuentes corroboradas, pero conviene una lectura editorial).
- [ ] Precalentar caché TTS (`tts.yamacoa.com`) — mejor esfuerzo, no bloqueante (§8 del
      comando); pendiente de ejecutar en el post-proceso.
- [ ] Alta en `ops/registro_creaciones.json` con `envio_id: 9`, `slug_inbox:
      "la_tirania_toca_las_9"`, `tema: "desacreditacion"`.
