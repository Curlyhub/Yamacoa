# SKILLS.md — Yamacoa

`AGENTS.md` y `CLAUDE.md` son los contratos permanentes. Este archivo reúne skills **atómicas y
transversales** que varios comandos reutilizan. Los flujos completos (crear, importar, refrescar,
publicar, bitácora) viven en `.claude/commands/` y **no se duplican aquí**: cada cosa se define una
sola vez y se referencia, para que no deriven.

## Skill: anatomía de un tema
Un tema no es solo un `.jsx`. Es el set de CLAUDE.md §3: renderer **congelado** +
`public/data/<tema>.json` (respirante) + `<tema>.schema.json` (contrato) + `ops/<tema>/`
(`poll_supabase.sql` + `NOTAS.md`) + assets opcionales en `public/assets/<tema>/` (imágenes) y
`public/models/<tema>/` (3D; vídeos por URL) + una entrada en `registry.js`.
- Alta: `/crear-tema` (desde fuentes) o `/importar` (página ya hecha). No lo hagas a mano.
- La entrada de registry lleva: `id, slug, path (/<slug>), titulo, subtitulo, etiqueta,
  accent (hex), fuentes, load (() => import('./<slug>.jsx'))`.

## Skill: registry como única fuente de verdad
`registry.js` exporta el array de temas. `Landing` lo mapea a tarjetas; `App` lo mapea a `<Route>`
con `React.lazy(load)` envuelto en `<Suspense>`. Para añadir/quitar/reordenar expedientes, tocas
SOLO el registry; no edites `Landing.jsx` ni `App.js`.
- Excepción: `/metodologia` NO va en el registry — es una ruta explícita en `App.js`, enlazada desde
  el hero de la portada, no una card (CLAUDE.md §8).

## Skill: frontera de datos (qué se congela)
El `.jsx` entregado es **congelado**: geometría, paleta, copy de estructura y preguntas de encuesta.
Los datos viven en `public/data/<tema>.json` y los reescribe el pipeline sin tocar el componente.
Un `.jsx` solo cambia por una decisión humana de **estructura visual**, nunca para cambiar datos
(CLAUDE.md §2).

## Skill: balance de llaves string-aware
Antes de dar por bueno un `.jsx`: `node scripts/bracket-balance.mjs <fichero>`. Un contador naíf
cuenta llaves dentro de literales de cadena/template y produce falsos desajustes; el script las
ignora. No uses un contador casero.

## Skill: actualizar el sistema de diseño
Tokens compartidos en `src/components/Layout.jsx` (o un módulo de tokens dedicado). No reescribas la
paleta interna de un tema: cada tema conserva su identidad; el sistema compartido solo cubre landing
y navegación. Respeta las paletas reservadas (CLAUDE.md §4).

## Skill: verificar procedencia
Antes de tocar un tema con personas o entidades nombradas, confirma que cada afirmación conserva
fuente y estado, y que el disclaimer sigue visible. No promociones un vínculo a `confirmado` desde el
front. Eventos siempre **parafraseados**, nunca cita literal.

## Skill: publicar
Definido en CLAUDE.md §10 y en el comando `/publicar`: **Direct Upload** a Cloudflare Pages
(`npx wrangler pages deploy build --project-name=yamacoa --branch=main`), con `git commit` como
rastro editorial de procedencia (auditoría, no disparador). HashRouter evita necesitar reglas de
reescritura SPA. **No** es deploy a GitHub Pages / Netlify / S3. Se define una sola vez allí; no lo
repliques aquí.