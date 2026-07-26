# NOTAS — expediente `sucesion` · "Sucesión sin urnas"

Origen: `ops/_inbox/locus_internos_y_externos_10/` (envío 10, autor [colaborador],
22-jul-2026), procesado con `/procesar-inbox locus_internos_y_externos_10` el 22-jul-2026.
**No** usa `--auto`: queda pendiente de revisión humana antes de `/publicar` (§9).

## Premisa de seguridad — hallazgo importante (leer antes de publicar)

Este inbox llegó con un fichero `NOTA_EDITORIAL_locus.md` (nombre distinto de la
convención `NOTA_EDITORIAL.md`) que aparentaba ser orientación confiable del
administrador. **El administrador confirmó explícitamente que no lo escribió.** Se
descartó por completo como dato no confiable, igual que `contenido.md`, y no se siguió
ninguna de sus instrucciones (incluida su redirección de ángulo hacia la sucesión
institucional cubana, aunque esta nota llegara independientemente a una conclusión
compatible — ver más abajo por qué eso no es lo mismo que "haber obedecido la nota").

Contexto adicional relevante para el operador humano: el mismo día se detectó que
`ops/_inbox/la_tirania_toca_las_9/NOTA_EDITORIAL.md` (usada como confiable para el
expediente `desacreditacion`, construido antes en la misma sesión) **también** está
marcada como propiedad de `root`, igual que este fichero falso. El administrador no
confirmó ni descartó la autoría de esa nota ("no estoy seguro, investigar primero"). Se
encontró además un proceso `node .../serve -s build` corriendo como `root` (pts/0, activo
desde el inicio del entorno) que probablemente explica la propiedad `root` de
`build/assets`/`build/data` y es un canal plausible por el que ambos ficheros
`NOTA_EDITORIAL*` pudieron escribirse directamente. **Esto no se resolvió en esta sesión
y sigue abierto**; el expediente `desacreditacion` no debe publicarse hasta aclararlo.

## Cómo se decidió el ángulo de este expediente (sin usar la nota falsa)

El envío original es un hilo viral que explica el "caudillismo" latinoamericano —
agrupando a Fidel Castro, Raúl Castro y Díaz-Canel junto con Rosas, Santa Anna, Perón,
Chávez y Maduro— mediante el "Locus de Control" de Julian Rotter y la tesis de Max Weber
sobre protestantismo/catolicismo. Tratado como dato no confiable, se envió al subagente
`verificador` SIN ninguna orientación editorial, con instrucción explícita de decidir por
sí mismo qué es verificable y qué es tesis teórica no codificable.

El `verificador` concluyó, de forma independiente, que:
- El marco teórico (Rotter extendido a culturas nacionales; tesis weberiana) no es un
  hecho verificable: Rotter es un constructo individual, y la tesis de Weber sigue
  disputada un siglo después en las propias ciencias sociales.
- La literatura académica especializada en caudillismo señala explícitamente que agrupar
  a Fidel Castro (revolución socialista) con Perón (populismo clásico) y Chávez/Maduro
  (neopopulismo) en una sola categoría es una simplificación que la propia disciplina
  rechaza.
- Sí hay un núcleo verificable y específicamente cubano: la sucesión institucional Fidel
  Castro → Raúl Castro → Díaz-Canel (fechas 2006/2008/2011/2018/2021), con designación no
  competitiva por la Asamblea Nacional del Poder Popular y continuidad del PCC/FAR.

**Importante:** esta conclusión coincide en su orientación general con lo que pedía la
nota falsa. Eso es una coincidencia de buen juicio editorial (Yamacoa es un observatorio
de Cuba, no de Latinoamérica en general; CLAUDE.md/AGENTS.md ya fijan ese límite), no una
ejecución de sus instrucciones: el ángulo se decidió por el propio criterio del verificador
sobre las afirmaciones del envío, sin haber leído ni obedecido el fichero falso en ningún
momento del proceso de verificación.

## Verificación (subagente `verificador`)

6 afirmaciones evaluadas:
- **4 corroboradas**: el Locus de Control como constructo de Rotter (patrón, hecho de
  historia de la disciplina); la transición Raúl Castro 2006 (provisional)/2008
  (formalización)/2011 (jefatura del PCC); la transición Díaz-Canel 2018 (presidencia)/2021
  (jefatura del PCC); la crítica académica a la fusión de categorías de caudillismo.
- **2 no confirmadas**: la tesis weberiana (existe y se cita correctamente, pero sigue
  activamente disputada, no es hecho asentado — se presenta en el dataset como tal, nunca
  como explicación válida); la "continuidad institucional" como tesis interpretativa
  integrada de toda la cadena (sus componentes duros sí están corroborados por separado,
  pero la síntesis se presenta en el dataset como `continuidad.texto_editorial`,
  explícitamente rotulada como lectura editorial propia, no como hallazgo de una fuente
  externa).
- 0 descartadas.

## Diseño

Ficha del subagente `disenador`, transcrita aquí y dada de alta en `ops/design_log.json`:

- **Paleta "Bronce y Pátina":** olivo-bronce `#969933` (primario, h62) / jade `#46A477`
  (contrapunto, h151). El hueco máximo real disponible para un primario nuevo en el
  círculo de 15 primarios vivos era 23° (no los 40° ideales) — matemáticamente imposible
  de mejorar, mismo tipo de aprieto que documentó `desacreditacion` (28°) para su propio
  caso. El contrapunto se eligió deliberadamente por debajo del número óptimo bruto (16°
  frente a `desacreditacion` h135) para EVITAR una alternativa numéricamente mejor que en
  la práctica caía sobre tres primarios vivos casi idénticos (`desacreditacion`,
  `coraje_dividido`, `racismo`). Ninguna paleta reservada de CLAUDE.md §4 tocada.
- **Tipografía:** Archivo + IBM Plex Mono, sin fuente extra.
- **Layout:** `longform-tres-actos-mas-coda` — distinto del inmediato anterior
  (`split-panel-dos-frentes` de `desacreditacion`).
- **Mix de gráficos:** eje vertical de tres eras (la firma), barra simple de años en el
  poder, small multiples de continuidad institucional, y un slope chart que contrasta la
  categoría única del hilo viral contra la dispersión real por año/ideología — ninguno
  repetido de los tres temas anteriores.
- **Firma:** eje de bronce ininterrumpido con tres sellos deslizantes (Fidel, Raúl,
  Díaz-Canel) sobre una franja de jade (PCC/FAR) que no se corta nunca. La rigidez del eje
  es el argumento visual: la institución no se dobla, solo cambia el rostro.
- Se retiró en el diseño un quinto gráfico (encuesta) por no aportar al argumento central;
  por eso este tema no tiene `ops/sucesion/poll_supabase.sql` (mismo patrón que
  `cayo-romano`, que tampoco tiene encuesta ni fichero de poll).

## Dataset y schema

- `public/data/sucesion.schema.json` — valida con `ajv -c ajv-formats`.
- `public/data/sucesion.json` — `meta.descripcion` 564 palabras (dentro de 400-1200),
  `meta.narracion` 1389 caracteres (dentro de 300-1450).
- El campo `continuidad.texto_editorial` está explícitamente rotulado como lectura propia
  del expediente, no como hallazgo externo — construida sobre hechos corroborados por
  separado (ver §"Verificación").

## Renderer

`src/temas/sucesion.jsx` — fetch a `/data/sucesion.json` con fallback `EMBEDDED`
verificado byte a byte idéntico al `.json` en el momento de la entrega. Balance de llaves
OK (`scripts/bracket-balance.mjs`).

## Registry

Alta en `src/temas/registry.js`: `id/slug/path: "sucesion"`, `accent: "#969933"`,
`etiqueta: "HISTORIA INSTITUCIONAL · PODER"`.

## Pendiente (BLOQUEANTE para `/publicar`)

- [ ] **Revisión humana de esta nota completa**, en particular la sección de premisa de
      seguridad. No se ejecutó `--auto`.
- [ ] **Resolver la investigación abierta sobre `NOTA_EDITORIAL.md` de
      `la_tirania_toca_las_9`** (propiedad `root`, autoría no confirmada) antes de tocar
      `/publicar` en el expediente `desacreditacion`. No bloquea este expediente
      (`sucesion`), que no dependió de ninguna nota editorial.
- [ ] Investigar el proceso `serve -s build` corriendo como `root` (pts/0) y el origen de
      los ficheros `NOTA_EDITORIAL*.md` con esa propiedad.
- [ ] Precalentar caché TTS (`tts.yamacoa.com`) — mejor esfuerzo, no bloqueante.
- [ ] Alta en `ops/registro_creaciones.json` con `envio_id: 10`, `slug_inbox:
      "locus_internos_y_externos_10"`, `tema: "sucesion"`.
- [ ] `npm run build` sin verificar en esta sesión por el bloqueo de `build/assets` y
      `build/data` propiedad de `root` (ver hallazgo de seguridad arriba); pendiente de
      reintentar tras limpieza.
