# CLAUDE.md — Contrato operativo de Claude Code para Yamacoa

> Punto de entrada para Claude Code en este repositorio.
> Para **tokens de diseño** ver `AGENTS.md`. Para **procedimientos detallados** ver `SKILLS.md`.
> Este fichero define *qué se puede tocar*, *cómo se crea/importa/refresca un tema* y *cómo se publica*.

---

## 1. Qué es Yamacoa

Plataforma de periodismo de datos interactivo sobre economía política, represión cívica y
condiciones sociales en Cuba. Es una **SPA en React** (CRA + HashRouter) desplegada en
**Cloudflare Pages**. Cada "expediente" (tema) es una **ruta lazy-loaded**, no una página HTML
independiente. Publicar un tema = añadir ficheros + registrar + `build` + subir (§10).

---

## 2. Arquitectura núcleo — *frozen renderer + breathing dataset*

Invariante fundamental del proyecto. Respétalo siempre:

- **`src/temas/[tema].jsx` — renderer CONGELADO.** Contiene geometría (`PROV_GEO`,
  `CUBA_FEATURE`), constantes de paleta, estructura de copy editorial y preguntas de encuesta.
  Hace `fetch` del JSON en runtime con *fallback* embebido. **NUNCA se modifica tras la entrega.**
- **`public/data/[tema].json` — dataset RESPIRANTE.** Todo el contenido editorial, métricas y
  casos viven aquí. Lo actualiza el pipeline en el ciclo de ~8 h **sin tocar el componente**.
- **`public/data/[tema].schema.json` — contrato.** JSON Schema que valida el dataset y que además
  sirve de esquema constreñido (`responseSchema`) para la extracción **asistida por LLM — motor
  agnóstico** (Gemini, otro proveedor o un modelo local; es un detalle de implementación).

> Regla de oro: si una tarea te empuja a editar un `.jsx` ya entregado para cambiar *datos*,
> estás haciendo algo mal. Los datos van al `.json`. El `.jsx` solo cambia si cambia la
> *estructura visual*, y eso es una decisión humana, no automática.

---

## 3. Set de entregables por tema

1. `src/temas/[tema].jsx` — renderer congelado (fetch + fallback embebido)
2. `public/data/[tema].json` — dataset respirante
3. `public/data/[tema].schema.json` — contrato JSON Schema
4. `ops/[tema]/poll_supabase.sql` — tabla con RLS + RPC `SECURITY DEFINER` de solo incremento
5. `ops/[tema]/NOTAS.md` — notas de operador

Assets opcionales (si el renderer los referencia):
- `public/assets/[tema]/` — imágenes (`.png .jpg .webp .avif .svg .gif`)
- `public/models/[tema]/` — 3D (`.glb .gltf .bin .obj .mtl .usdz`)
- vídeos: **nunca como fichero** — embebidos por URL (YouTube/etc.) desde el dataset

Además, **registrar en `src/temas/registry.js`** una entrada con el formato existente:
`{ id, slug, path, titulo, subtitulo, etiqueta, accent, fuentes, load }`. `Landing.jsx` y
`Layout.jsx` consumen el registry como fuente única.

---

## 4. Invariantes — qué NO tocar

- Renderers `.jsx` entregados (sección 2).
- Geometría real de Cuba: `d3.geoMercator().fitExtent()` sobre el contorno de 42 puntos.
  La actividad por provincia se controla con el campo `senal` (`alta`/`media`/`baja`/`null`)
  del JSON, fusionado por `id` de provincia con coordenadas hardcodeadas en el renderer.
- **Rutas de assets:** los renderers referencian imágenes desde `${process.env.PUBLIC_URL}/assets/[tema]/…`
  y modelos 3D desde `${process.env.PUBLIC_URL}/models/[tema]/…`. Vídeos por URL, nunca como fichero.
- Paletas reservadas: rojo/acero-a-ascua para **represión**; ámbar-teal "voltaje" para
  conflictos OCC; rampa fuego (granate→oro) con contrapunto acero-cian para **protestas**;
  bandera cubana (azul `#3D6FE5`, punzó `#D8392B`, oro `#E6B450`) para **píldoras históricas**.
  Evitar paletas a dos tonos que se lean como bandera.
- Tipografía: **Manrope** + IBM Plex Mono (Spectral serif **solo** para verso/letra).
  Archivo queda en los expedientes aún no migrados (ver §11).

---

## 5. Dos niveles de automatización

### Nivel 1 — Refresco (a oscuras, automático)
Para temas **existentes**. El pipeline regenera el `.json`, valida contra `.schema.json`, y publica.
Seguro porque el renderer está congelado y la extracción va constreñida por schema. **No requiere
revisión humana.** Comando `/refrescar`; ver §7.

### Nivel 2 — Creación e importación (asistido, con verja humana)
- **Crear** desde fuentes: `/crear-tema` genera el set de ficheros + entrada en registry. Ver §6.
- **Importar** una página ya construida: `/importar` cablea un set dejado en `ops/_import/[tema]/`
  (coloca cada fichero según su tipo y lo que el `.jsx` referencia, y registra la card).
En ambos, **un humano revisa y aprueba antes de publicar** (QA editorial: variedad de gráficos,
precisión, paleta).

---

## 6. Procedimiento — crear tema nuevo (Nivel 2)

**Patrón de investigación en dos pasos:** consulta amplia primero, luego seguimiento dirigido
a métricas concretas (totales anuales, series históricas) ANTES de escribir código.

1. **Ingesta.** Leer documentos de `ops/_inbox/[tema]/` o la URL indicada. Extraer afirmaciones.
2. **Verificación.** Cotejar cada afirmación contra fuente primaria o bien corroborada
   (OCDH, OCC, Prisoners Defenders, BNF/Gallica, CiberCuba, 14ymedio, Diario de Cuba, elTOQUE,
   Amnesty). **Marcar la incertidumbre explícitamente**; no presentar material no verificado
   como asentado. Distinciones que importan van VISIBLES en la UI, no en notas al pie.
3. **Esquema.** Redactar `[tema].schema.json` (sirve de `responseSchema`).
4. **Dataset.** Generar `[tema].json` conforme al schema.
5. **Renderer.** Construir `[tema].jsx` con paleta NUEVA y **variedad de gráficos**
   (donuts, fan/forecast, vistas conmutables, gauges radiales) — no repetir el patrón bar+line.
   Si usa imágenes o 3D, referenciarlas desde `public/assets/[tema]/` y `public/models/[tema]/`
   (vídeos por URL). Cargar la skill `frontend-design` antes de diseñar.
6. **Encuesta + notas.** `poll_supabase.sql` y `NOTAS.md`.
7. **Registrar** en `registry.js`.
8. **Validar** (§9). **Detenerse y pedir revisión humana antes de publicar.**

---

## 7. Procedimiento — refrescar dataset existente (Nivel 1)

1. Cargar el `.schema.json` del tema como `responseSchema`.
2. Ejecutar extracción LLM constreñida sobre las fuentes nuevas.
3. Validar el `.json` resultante con `ajv` (§9). Si falla, **abortar y registrar**, no publicar.
4. Publicar (§10) solo si la validación fue OK. No tocar el `.jsx` (congelado).

---

## 8. Bitácora de metodologías — página `/metodologia`

Explica el MÉTODO de Yamacoa: **estadística observacional sobre eventos medibles** documentados en
fuentes públicas. **NO es un expediente.** Comando `/bitacora`.

- **No va en `registry.js`.** Se accede desde el texto «Metodología reproducible» del hero de la
  portada, convertido en `<Link to="/metodologia">`. La ruta se añade explícita en `App.js`, fuera
  del map del registry.
- **Dataset** `public/data/metodologia.json`: intro; etapas del método (EVENTO MEDIBLE → FUENTE
  DOCUMENTAL → CODIFICACIÓN asistida por LLM con esquema constreñido → VERIFICACIÓN periodística y
  estadística → DATO con su incertidumbre); explicación estadística (observacional, no experimental;
  subregistro y suelos «al menos»; sesgo de reporte; cambios de alcance; sin causalidad); criterios
  de validación periodística/estadística; y `notas` (mapa opcional de caveats de una línea SOLO para
  temas con salvedad notable, p.ej. conflictos → OCC 2023).
- **Renderer** `src/temas/metodologia.jsx` (congelado, paleta neutra/editorial): el método al
  centro + **buscador/typeahead que filtra `registry.js`** según se teclea. Sin desplegables
  masivos; **sin nombrar el motor LLM; sin etapa de publicación** (no aporta y expone superficie
  de ataque).
- Casi estática: **fuera del ciclo de 8 h** (el buscador lee el registry en vivo).

---

## 9. Validación (obligatoria antes de publicar)

- `ajv` — validar cada `.json` contra su `.schema.json`.
- `esbuild` / `npm run build` — pase de compilación sobre los `.jsx`.
- Balance de llaves — `node scripts/bracket-balance.mjs <fichero.jsx>` (string-aware; un contador
  naíf da falsos desajustes dentro de literales de string en JSX).
- `npm run build` debe completar sin error antes de cualquier despliegue.

---

## 10. Contrato de publicación — Direct Upload (Wrangler)

El proyecto Pages de Yamacoa es de tipo **Direct Upload** (sin repo Git conectado; `Git Provider: No`).
Se compila en local y se sube el build; **NO se hace push**.

**Cada publicación (desde 2026-10-17, con noticias automáticas):**
1. `git add` + `git commit` convencional — rastro editorial de procedencia (auditoría, **NO** dispara
   el deploy). Mensaje: `refresh(represion): OCDH may-2026` / `feat(tema): nuevo expediente X`;
   el cuerpo cita las fuentes ingeridas.
2. `ops/publicar.sh --mover` — mueve la rama `publicacion` a HEAD, compila en un worktree aparte
   (`../yamacoa-publicacion`) con las noticias vigentes exportadas desde la base de datos, y sube
   con `wrangler pages deploy build --project-name=yamacoa --branch=main`.

> **Nunca** `npm run build` + `wrangler` a mano desde el árbol de trabajo: ese build no lleva las
> noticias (borraría las vigentes del sitio hasta el siguiente ciclo) y podría llevar cambios a
> medias. El cron de noticias (§11.6) publica SIEMPRE la rama `publicacion`: lo que no se ha
> movido a esa rama no sale, aunque esté commiteado.

Requiere en el entorno `CLOUDFLARE_API_TOKEN` (permiso **Account · Cloudflare Pages · Edit**) y
`CLOUDFLARE_ACCOUNT_ID`, cargados desde un fichero fuera del repo (`~/.config/yamacoa/cf.env`;
nunca versionados; `*.env` en `.gitignore`). El ciclo de noticias usa además
`~/.config/yamacoa/noticias.env` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

> Si algún día el proyecto se conectara a Git, el `git push` bastaría y Pages reconstruiría solo
> (consumiendo el límite de 500 builds/mes). Con Direct Upload compilas tú: ese límite no aplica igual.

---

## 11. Periódico (desde 2026-10-17): tipologías, diseño unificado y reglas

Yamacoa pasa de observatorio a **periódico digital** con cuatro tipologías. El color codifica el
origen en todo el sitio: **salvia = automático**, **melocotón = dirigido**, **marrón = podcast**.

| Tipología | Ruta | Renderer | Datos | Vida |
|---|---|---|---|---|
| Noticia automática | `/noticias`, `/noticias/:slug` | `src/periodico/Noticia.jsx` (4 plantillas: `cronica`, `breve`, `datos`, `contraste`) | BD → `feed/noticias.json` en el build | 3 días y se borra |
| Estudio automático | `/estudios`, `/estudios/:slug` | `src/periodico/Estudios.jsx` | `feed/estudios.json` + `feed/estudios/<slug>.json` | permanente |
| Expediente dirigido | `/expedientes`, `/<slug>` | `src/temas/<tema>.jsx` (uno por tema) | `public/data/<tema>.json` | permanente |
| Podcast | `/podcast`, `/podcast/:slug` | `src/periodico/Podcast.jsx` | `feed/podcast.json` | permanente |

### 11.1 Diseño unificado
- Tokens: `src/design/tokens.js` (fuente única; handoff en `../design_handoff_yamacoa_periodico/`).
  La carcasa (`Layout.jsx`), las landings y las plantillas solo usan esos tokens.
- Los expedientes existentes se migran de piel con **`/unificar-estilo <archivo>`**. Es la única
  excepción autorizada al congelado (§2): cambia colores, tipografía, radios y fondo, nunca datos ni lógica.
- Los expedientes NUEVOS (`/crear-tema`, `/procesar-inbox`, `/importar`) nacen ya con fondo claro
  y tokens. La "paleta nueva por tema" de §6.5 se reduce a los **colores de datos**; la superficie,
  la tipografía y los componentes son los comunes.

### 11.2 Plantillas por tipología (no un `.jsx` por noticia)
- Noticias, estudios automáticos y episodios **no generan código**: son JSON que una plantilla
  congelada pinta. Los estudios automáticos usan una biblioteca CERRADA de gráficos
  (`src/periodico/Graficos.jsx`: `serie` | `barras` | `cifra` | `comparacion` | `proporcion` |
  `mapa`; ampliada el 2026-10-18). Un tipo nuevo de gráfico es decisión humana.
- Contratos: `public/data/feed/{noticias,estudios,podcast}.schema.json`. Se valida con
  `npx ajv validate --spec=draft7 -c ajv-formats -s <schema> -d <json>`.

### 11.3 Dónde viven los feeds
- **Noticias:** la fuente de verdad es la base de datos (Supabase, `ops/noticias/noticias_supabase.sql`).
  Cada ciclo exporta las vigentes a `data/feed/noticias.json` y su audio a `audio/noticias/` DENTRO
  del build de la rama `publicacion` y despliega. Nada de eso entra en git (`.gitignore`); el rastro
  de procedencia (capturas, descartes, ciclos) vive en la base de datos.
- **Estudios y podcast:** publicación manual. Sus feeds irán a R2 (`media.yamacoa.com/feed/…`,
  `REACT_APP_FEED_BASE`); hasta entonces, `public/data/feed/`.
- `npm start` con `?demo` carga datos de demostración que no entran en producción.
- Los episodios de podcast y las imágenes generadas **nunca** en el repo ni en Pages (25 MiB por
  fichero). Los resúmenes hablados de noticias (≈0,5 MB, efímeros) sí van en el build.

### 11.4 Reglas editoriales de lo automático
- **Independencia:** dos piezas con el mismo origen cuentan como una. Una red social solo entra
  verificada por **replicación** (≥2 independientes, al menos una que no sea red social) o por
  **comprobación directa** (cuenta oficial, material geolocalizado y fechado). Ver el agente
  `redactor-noticias`.
- **Cita por párrafo** obligatoria; `confianza` visible en la UI.
- **Resumen hablado obligatorio:** ninguna noticia ni estudio automático se publica sin
  `audio` (Kokoro, `tts.yamacoa.com`). El schema lo exige; si el TTS falla, la pieza espera.
- **Imágenes:** en noticias, fotografía con crédito o gráfico de datos. Las ilustraciones
  generadas por IA (Workers AI / FLUX) nunca son fotorrealistas de hechos reales y se rotulan
  siempre «Ilustración generada por IA» (`imagen.tipo = "ilustracion_ia"`).
- **Caducidad (decisión 2026-10-17: borrar; 2026-10-18: 3 días):** `caduca = publicado + 3 días`, columna de la BD.
  A los 3 días la noticia se BORRA de la base de datos y del sitio (sin archivo). `publicado` es
  la hora del ciclo, así que la caducidad cae en un ciclo, que borra y redespliega al empezar;
  pg_cron borra cada 15 min como red de seguridad y la plantilla oculta la pieza en el segundo
  exacto. No hace falta Redis.
- **Análisis y series (2026-10-18):** la noticia (salvo `breve`) puede llevar `analisis`: qué
  significa el hecho, en un bloque rotulado y separado de los hechos, con cita por párrafo y sin
  causas que ninguna fuente atribuya. El dato de hoy se pone en su historia con las **series de
  referencia** (`ops/noticias/series.json`, catálogo cerrado: una serie nueva es decisión humana).
  Sus puntos salen del expediente (semilla) o de las capturas, y la verja solo los acepta si el
  número está en el texto citado. El gráfico de una serie lo construye el código, no el modelo.
  Los puntos son permanentes (`noticias_series_puntos`), aunque la noticia caduque.
- **Voces sintéticas** siempre declaradas (`voces_sinteticas: true`) y rotuladas en la UI.

### 11.5 Línea editorial (decisión 2026-10-17)
Yamacoa es un periódico **democrático**: parte de que Cuba vive bajo una dictadura de partido
único y su línea es contribuir a una transición democrática y pacífica. **Con datos, no con
pasión**: la exactitud va siempre por delante de la causa (un dato falso la daña más que
cualquier propaganda). Es un periódico **para todos**, también para quien aún defiende al
régimen: se le persuade con evidencia y respeto.
- Hechos y valoración separados: la línea está en qué se cubre, el contexto y la precisión de
  los nombres («el régimen», «prensa oficial», «presos políticos» citando a quien los documenta),
  no en adjetivos ni insultos. La versión oficial se informa y se contrasta, no se adopta.
- Prioridades: derechos humanos y presos políticos; economía real y fuera del control estatal
  (y el peso de GAESA); la «rusificación»; migración y diáspora; y la Cuba que existe más allá
  del régimen (cultura, ciencia, emprendimiento, iniciativas cívicas pacíficas).
- Las **estrategias de cambio** se desarrollan en expedientes y estudios (revisión humana); la
  noticia informa y enlaza con ellos (`expediente`).
- Nunca se incita a la violencia ni se expone a personas dentro de Cuba.
- Texto operativo: `ops/noticias/motor.md` (§ Línea editorial). Aplica también a `/crear-tema`.

### 11.6 Ciclo automático de noticias (cron 00:00 y 18:00, hora local)
`ops/noticias/ciclo.sh` → `ciclo.mjs`: caducar → capturar (RSS de `ops/noticias/fuentes.json`)
(prensa cubana, Miami, España y EE UU) → tratar (**Claude headless** con `ops/noticias/motor.md`, sin Bash ni MCP, solo escribe en la
carpeta del ciclo) → verja (schema + reglas; las URL las pone el código, no el modelo) → audio
(Kokoro; sin audio, `retenida`) → `ops/publicar.sh`. Tope: 10 nuevas por ciclo y
**20 por día**. Ensayo sin subir:
`node ops/noticias/ciclo.mjs --sin-desplegar` (exporta a `public/` y se ve en `npm start`).
Retirar una noticia a mano: `estado = 'retirada'` en la BD; sale en el siguiente ciclo o con
`ops/publicar.sh`. Detalles: `ops/noticias/NOTAS.md`.

### 11.7 Podcast elaborado (grabación humana)
- Estudio interno: `portal/estudio.html` (misma cuenta que el portal; permiso
  `perfiles.puede_grabar`). Graba en el navegador del teléfono o del portátil en trozos de 10 s
  con cola persistente, y los sube vía Worker (`workers/media`) al R2 **privado**.
- **Consentimiento** de todas las voces antes de grabar, registrado en la base de datos con fecha.
  Sin él, la RPC `abrir_grabacion` lo rechaza.
- Procesado: `ops/podcast/procesar.sh` (limpieza, −16 LUFS, whisper). Publicación:
  `/podcast-publicar` (borrador → verja humana → `--publicar`). El máster crudo no se borra nunca.
- Detalles y almacenamiento: `ops/podcast/NOTAS.md`.

## 12. Referencias

- `AGENTS.md` — tokens del sistema de diseño (contrato permanente para todos los agentes).
- `SKILLS.md` — procedimientos bajo demanda.
- Comandos (`.claude/commands/`): `/crear-tema`, `/importar`, `/refrescar`, `/publicar`, `/bitacora`,
  `/unificar-estilo`, `/podcast-publicar`.
- Agentes (`.claude/agents/`): `verificador`, `disenador`, `redactor-noticias`, `productor-podcast`.
- `scripts/bracket-balance.mjs` — verificador de balance de llaves string-aware.
- Fuentes de datos: OCDH, OCC (PDF mensuales), Prisoners Defenders, BNF/Gallica (históricas),
  CiberCuba, 14ymedio, Diario de Cuba, Infobae, elTOQUE, Amnesty International.