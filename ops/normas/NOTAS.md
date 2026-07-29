# NOTAS — expediente `normas` · "Reconstruir la norma"

Origen: **`ops/_import/normas/`** (set ya construido: renderer + dataset + schema),
cableado con `/importar` el 28-jul-2026. **No es un `/procesar-inbox`**: el
expediente no se investigó ni se diseñó en esta sesión, llegó hecho. Estas notas
documentan el cableado y son explícitas sobre qué se verificó aquí y qué no.

El tema se llama `normas` (id, slug y ruta `/normas`) pero su dataset conserva el
nombre interno del set, `reconstruccion-civica`. Ambos quedan enlazados por
`dataSlug` en el registry, el mismo mecanismo que ya usan `convocatoria_11j` y
`protesta_solitaria`. Así no hubo que reescribir `meta.slug` ni el `$id` del
schema.

## Verificación — NO realizada en esta sesión

**Aviso para el operador:** las 17 fuentes del dataset y las afirmaciones que
sostienen **no se cotejaron** durante el import. No se ejecutó el subagente
`verificador`. Lo que sigue es una descripción de lo que el set *declara*, no
una validación de ello.

El dataset trae su propio aparato de incertidumbre, que el renderer expone en la
UI (componente `Confianza`, con nivel y procedencia visibles junto a cada
afirmación, no en nota al pie):

- `meta.nota_ecosistema` advierte que buena parte de la evidencia sobre la Cuba
  contemporánea procede de organizaciones con orientaciones normativas
  convergentes, y que toda cifra de ese ecosistema sin contraste independiente se
  etiqueta como *reportado* aunque su metodología esté publicada. El renderer lo
  muestra en el cierre (sección 10) como `Nota` de alerta.
- `meta.aviso_simulacion` marca los controles interactivos (deslizadores del
  modelo, malla de normas, índice C_t) como exploraciones de forma funcional, no
  predicciones. El componente `AvisoSimulacion` lo repite en ámbar sobre cada
  bloque interactivo: **ningún valor que produzcan es un dato observado**.

Antes de publicar conviene, como mínimo, pasar el `verificador` sobre las cifras
de los cuatro `casos_externos` y sobre los experimentos citados en `pendientes`
(Michigan/J-PAL, Allcott, Centola, Branas, Keizer, Braga 2024), que son el
sostén empírico del argumento.

## Diseño — heredado del set, no propuesto aquí

No se ejecutó el subagente `disenador`: la dirección visual venía en el `.jsx`.
Comprobado a mano contra `ops/design_log.json` (18 fichas previas) y contra las
paletas reservadas de CLAUDE.md §4:

- **Paleta:** fondo `#0E1A18`, petróleo `#2E9B87` (primario), con ciruela
  `#8B76A8`, arcilla `#C4694A`, salvia `#9BB88F` y ámbar `#C98A17` como
  contrapuntos. No colisiona con ninguna paleta reservada: no es el ámbar-teal
  "voltaje" de conflictos OCC (aquí el ámbar es acento terciario de aviso, no
  co-primario), ni acero-a-ascua, ni rampa fuego, ni bandera cubana.
- **Aviso pendiente de confirmación humana:** la banda teal del registry está
  poblada — `#157A72`, `#2BB6A6`, `#35C4A6`, `#38D6C9`. `#2E9B87` es
  distinguible pero no holgadamente. Alternativas dentro de la propia paleta del
  renderer si se prefiere despejar: ciruela `#8B76A8` o arcilla `#C4694A`.
- **Tipografía:** Archivo + IBM Plex Mono, sin fuente extra. Conforme a §4.
- **Mix de gráficos:** radar (recharts, único uso de la librería), curva
  logística del modelo con deslizadores, malla de normas, anillos, pesas de
  indicadores, gráfico de pendientes de experimentos, divergente de efectos,
  secuencia por etapas, índice C_t interactivo y bloques contrafactuales
  desplegables. No repite el patrón bar+line.
- **Fórmulas:** 10 bloques MathML nativo servidos desde el dataset e inyectados
  con `dangerouslySetInnerHTML` (`Mate` y `MateEnLinea`). Es una decisión del set,
  declarada en su cabecera. El schema **no acota hoy** el contenido de esos
  campos: si algún día el refresco automático los rellena sin revisión humana,
  conviene añadir un `pattern` que restrinja el marcado admitido.

## Dataset y schema

- `public/data/reconstruccion-civica.schema.json` — `additionalProperties: false`
  en raíz, 15 claves requeridas. Valida con `ajv`.
- `public/data/reconstruccion-civica.json` — 17 fuentes, 4 casos externos, 3
  niveles de acción (ejecutable ahora / requiere apertura parcial / requiere
  transición).
- El expediente se apoya en literatura experimental sobre normas sociales
  (Science, PNAS, J-PAL), OCDE y Banco Mundial, además de OCDH, Rojas, Pedraza y
  Pérez-Díaz. Es un perfil de fuentes distinto al habitual de la plataforma
  (prensa cubana independiente): el `fuentes` del registry lo refleja.

## Cambios aplicados al set durante el import

1. **`RUTA_DATOS` corregida.** El renderer venía con
   `fetch("/datos/reconstruccion-civica.json")`. En este proyecto no existe
   `public/datos/`: la convención es `public/data/`. Tal cual, el fetch daba 404
   en silencio y la página se quedaba permanentemente en `DATOS_EMBEBIDOS` — el
   dataset no habría respirado nunca y `/refrescar` no habría tenido efecto
   visible. Se dejó en la forma dominante del repo, con prefijo `PUBLIC_URL`.
2. **Encuesta añadida** (el set no traía ninguna). Ver sección siguiente.
3. **Renumeración:** la encuesta entra como sección 11 "Tu lectura" y "Fuentes"
   pasa de 11 a 12, replicando la colocación de `sulmira` (encuesta justo antes
   de las referencias).
4. **"La ventana institucional" (sección 6) rehecha** a petición editorial. El
   set reutilizaba `Divergente` para el experimento del BID en Honduras, con
   tres defectos:
   - **Forma equivocada.** Un gráfico divergente supone valores a ambos lados de
     un eje. Los tres efectos de Honduras son positivos (+18, +15, +11 pp), así
     que las tres barras salían hacia el mismo lado desde un eje central que no
     separaba nada. La forma es correcta para Filadelfia (que va de −57,8 % a
     +75,7 %) y por eso `Divergente` **no se tocó**: sigue sirviendo a Filadelfia
     sin cambios.
   - **Etiquetas cortadas.** Con `viewBox="0 0 100 N"` y `escala = 40/max`, el
     valor mayor situaba su etiqueta en x=97 de un lienzo de 100 unidades:
     "+18 pp" se salía del `viewBox`. Además `preserveAspectRatio="none"` sobre
     `width:100%` deformaba todo el texto horizontalmente.
   - **Contexto ausente.** `honduras.descripcion` ("experimento de viñetas con
     civiles y policías") estaba en el dataset pero **no se renderizaba en
     ninguna parte**: el lector no tenía cómo saber qué medía el gráfico.

   Sustituido por `VentanaInstitucional`, en HTML/CSS en vez de SVG (sin
   `viewBox`, no hay recorte posible: las etiquetas fluyen y envuelven). La
   interactividad reproduce la manipulación experimental: un conmutador entre
   "misma sanción, sin trato respetuoso" (control, barras a cero, rótulo
   *referencia*) y "misma sanción, con trato respetuoso" (las tres barras se
   separan de la referencia con transición). Eje explícito 0 → +20 pp y leyenda
   que dice qué se está midiendo.

   **Guardarraíl de honestidad:** el dataset da diferencias en puntos
   porcentuales, no niveles absolutos, y el estudio del BID no publica una línea
   base que podamos citar. El conmutador **no fabrica un nivel de partida**: el
   estado de control es cero por definición, que es exactamente lo que significa
   una diferencia frente al grupo de control. No se añadió `AvisoSimulacion`
   porque estos son efectos observados, no una simulación de forma funcional.

Los tres cambios se hicieron **antes de la publicación**, es decir antes de que
el renderer quede congelado según CLAUDE.md §2. A partir del despliegue, el
`.jsx` no se toca.

## Encuesta

> **Rehecha el 28-jul-2026.** La primera versión seguía la plantilla de
> `sulmira` / `protesta_solitaria` / `desacreditacion` / `coraje_dividido`:
> tabla dedicada `public.normas_votos` + RPC `normas_votar` / `normas_totales`,
> con el cliente de Supabase leído de `window.__yamacoaSupabase`. **Ese patrón
> no funciona.** Ese global solo se asigna en `triana_reformas.jsx:916` y
> `envejecimiento.jsx:837`, en ambos casos desde una prop `supabase` que el
> router nunca pasa (`App.js:37` renderiza `<Componente />` sin props), y
> `@supabase/supabase-js` ni siquiera está instalado. Los cuatro temas de esa
> generación llevan desde su publicación con encuestas solo-localStorage y sus
> tablas por tema vacías. Elegí ese patrón por ser el de los temas más
> recientes, sin comprobar que el cliente existiera: error mío, corregido aquí.

Migrada al contrato compartido de `ENCUESTAS.md` §2, que es el que trae el set
de `auditar` y el que de verdad agrega votos:

- Tabla única `public.yamacoa_encuesta_votos` (`ops/_shared/poll_supabase.sql`,
  se aplica una sola vez para toda la plataforma) con RLS cerrada y las RPC
  `yamacoa_encuesta_votar(p_clave)` / `yamacoa_encuesta_resultados(p_prefijo)`,
  `SECURITY DEFINER` y de solo incremento sobre lista blanca sembrada.
- Credenciales desde `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY`
  (las que CRA inyecta en build y ya existen en `.env.local`), no desde un
  global de `window`.
- Clave de voto `reconstruccion-civica::<pregunta>::<opcion>`. Usa `meta.slug`
  del dataset, no el id `normas` del registry: es la convención de `ENCUESTAS.md`
  §2.2 para los temas con `dataSlug`.
- `ops/normas/poll_supabase.sql` pasa a ser **solo siembra**: 12 claves.

El bloque `encuesta` del dataset se migró además a la forma canónica de
`ENCUESTAS.md` §2.4: las opciones son ahora objetos `{id, texto}` en vez de
cadenas sueltas. El motivo es concreto — la clave de voto va por `id`, así que
un `/refrescar` puede reescribir el texto de una opción sin perder los votos
acumulados. Con opciones-cadena, cualquier retoque de redacción los tiraba.

Verificado por script en ambos sentidos (ninguna opción sin sembrar, ninguna
siembra huérfana, sin duplicados, ids conformes al `pattern` del schema, y sin
colisión de prefijo con `auditar`). Las tres preguntas:

- `formulacion` (4 opciones) — cuál de las dos formulaciones de la tesis, la
  cultural o la del entorno, sostenía quien lee antes del expediente.
- `palanca` (4) — cuál de las acciones de nivel "ejecutable ahora" rendiría más.
  Las cuatro opciones salen de `acciones[0].items`, no son inventadas.
- `riesgo` (4) — cuál de las contraindicaciones del propio modelo se cometería
  antes. Las cuatro salen de `contraindicaciones`.

La advertencia de que los resultados son opiniones de quien lee y **no una
muestra representativa** pasó del sumario hardcodeado en el renderer a
`encuesta.nota_privacidad` del dataset, donde puede respirar. Es coherente con
`meta.aviso_simulacion`.

Sin deduplicación por votante (no se guarda IP ni identidad); el control
anti-repetición vive en `localStorage` bajo `yamacoa:encuesta:reconstruccion-civica`.
El renderer degrada en silencio a local si faltan las variables de entorno o la
RPC falla.

El bloque `encuesta` se añadió a los tres sitios que deben permanecer en espejo:
el `.json`, el `.schema.json` (como propiedad requerida) y el `DATOS_EMBEBIDOS`
del `.jsx`.

## Narración (`/narrar`, 28-jul-2026)

El set no traía `meta.descripcion` ni `meta.narracion`: era el **único** de los 26
temas del registry sin capa narrativa. Ambos redactados a partir del dataset, sin
introducir ningún dato que no estuviera ya en él.

- `meta.descripcion` — 878 palabras (rango 400-1200). Registro factual, cifras en
  dígitos. Recoge la advertencia metodológica de `comparacion_interna` (no cabe
  comparación cuantitativa rigurosa 1958-2026) y la de Bogotá (reformas
  simultáneas, sin identificación causal limpia) en vez de dar por buenas las
  cifras sin más.
- `meta.narracion` — 1.404 caracteres, dentro del límite duro de 1.500 de la API y
  del `maxLength: 1450` del schema. Cifras en letras, años en dígitos, siglas
  desarrolladas ("Observatorio Cubano de Derechos Humanos", no OCDH), sin em
  dashes, ninguna frase por encima de 25 palabras (verificado por script, no a
  ojo). Español.
- Schema: `descripcion` y `narracion` añadidas dentro de `meta`, con `minLength` /
  `maxLength` según el contrato vigente de `/narrar`, y sumadas a `meta.required`.
  `additionalProperties: false` se mantiene.
- `DATOS_EMBEBIDOS` resincronizado: el fallback vuelve a ser espejo exacto del
  dataset (comprobado por `JSON.stringify`), con guarda que aborta si divergen en
  algo distinto de los dos campos nuevos.

**Precalentado de caché TTS:** `POST https://tts.yamacoa.com/api/tts` → `200`,
`x-tts-cache: HIT-AFTER-WAIT`, WAV de 24 kHz mono 16 bit, 3,9 MB, 1 min 23 s de
audio. El contador `cached_files` del endpoint de salud pasó de 31 a 32, así que
la entrada quedó efectivamente en caché.

Nota operativa para futuras corridas: el primer intento con `fetch` de Node falló
con `UND_ERR_HEADERS_TIMEOUT`. No es un fallo del servidor — **undici corta a los
300 s** y la síntesis de un guion de ~1.400 caracteres tarda más. La generación
siguió en curso del lado del servidor; el reintento con `curl --max-time 900`
esperó a esa síntesis en vuelo y devolvió `HIT-AFTER-WAIT`. Conviene usar `curl`
(o un dispatcher de undici con `headersTimeout` ampliado) para el precalentado
en frío, no el `fetch` del ejemplo del comando.

## Registry

Alta en `src/temas/registry.js`: `id/slug: "normas"`, `path: "/normas"`,
`dataSlug: "reconstruccion-civica"`, `publicado: "2026-07-28"`.

**Campos editoriales propuestos, pendientes de confirmación humana:**
`etiqueta: "SOCIEDAD · CULTURA CÍVICA"`, `accent: "#2E9B87"` y el texto de
`fuentes`. `titulo` y `subtitulo` se tomaron literales del `meta` del dataset.

## Imagen social

No existe `public/og-normas.png`. Por la convención de
`scripts/gen-social-meta.mjs`, la ruta cae a la imagen por defecto de la
plataforma (`yamacoa_og_1200x630.png`), que es la que se comparte en X. Es un
comportamiento válido, no un fallo: solo 14 de los temas tienen imagen propia.
Queda como decisión editorial abierta.

## Validación

- `npx ajv validate -s public/data/reconstruccion-civica.schema.json -d
  public/data/reconstruccion-civica.json` → **valid** (tras añadir `encuesta`).
- `node scripts/bracket-balance.mjs src/temas/reconstruccion_civica.jsx` → **OK**.
- `npm run build` → **compila sin error**.
- Contraste JSON ↔ SQL de las 12 opciones de encuesta → **OK, byte a byte**.
- `DATOS_EMBEBIDOS` ↔ `.json` → verificar el espejo exacto antes de publicar; el
  fallback y el dataset deben coincidir en el momento de la entrega.

## Pendiente antes de publicar

1. Confirmar `etiqueta`, `accent` y `fuentes` del registry.
2. Pasar el `verificador` sobre las cifras de `casos_externos` y `pendientes`.
3. `sudo rm -rf build` — el directorio tiene 107 ficheros propiedad de `root` de
   una ejecución anterior con `sudo`, y `npm run build` falla con `EACCES` hasta
   que se limpien. `build/` es salida desechable y se regenera entera.
4. Aplicar `ops/normas/poll_supabase.sql` en Supabase (opcional para la vista
   previa, obligatorio para el agregado global de votos).
