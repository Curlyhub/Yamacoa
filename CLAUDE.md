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
- Tipografía: Archivo + IBM Plex Mono (Spectral serif **solo** para verso/letra).

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

**Cada publicación:**
1. `git add` + `git commit` convencional — rastro editorial de procedencia (auditoría, **NO** dispara
   el deploy). Mensaje: `refresh(represion): OCDH may-2026` / `feat(tema): nuevo expediente X`;
   el cuerpo cita las fuentes ingeridas.
2. `npm run build`
3. `npx wrangler pages deploy build --project-name=yamacoa --branch=main`

Requiere en el entorno `CLOUDFLARE_API_TOKEN` (permiso **Account · Cloudflare Pages · Edit**) y
`CLOUDFLARE_ACCOUNT_ID`, cargados desde un fichero fuera del repo (nunca versionados; `*.env` en `.gitignore`).

> Si algún día el proyecto se conectara a Git, el `git push` bastaría y Pages reconstruiría solo
> (consumiendo el límite de 500 builds/mes). Con Direct Upload compilas tú: ese límite no aplica igual.

---

## 11. Referencias

- `AGENTS.md` — tokens del sistema de diseño (contrato permanente para todos los agentes).
- `SKILLS.md` — procedimientos bajo demanda.
- Comandos (`.claude/commands/`): `/crear-tema`, `/importar`, `/refrescar`, `/publicar`, `/bitacora`.
- `scripts/bracket-balance.mjs` — verificador de balance de llaves string-aware.
- Fuentes de datos: OCDH, OCC (PDF mensuales), Prisoners Defenders, BNF/Gallica (históricas),
  CiberCuba, 14ymedio, Diario de Cuba, Infobae, elTOQUE, Amnesty International.