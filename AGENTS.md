# AGENTS.md — Yamacoa

Yamacoa es un observatorio interactivo de economía política cubana. Agrega análisis
independientes (cada uno un "tema") bajo una landing común desde la que se navega a
cada uno. Este archivo es el contrato permanente para cualquier agente que trabaje en
el repositorio. Léelo entero antes de tocar código.

## Qué es y qué no es
- Es: un front-end React que agrupa análisis ya generados y los publica de forma navegable.
- No es: el motor de ingesta o extracción. Ese pipeline (Rust + Gemma) vive en otro
  repositorio. Aquí solo se presenta el resultado.

## Stack
- Create React App (react-scripts 5), React 18, StrictMode activado.
- Enrutado: react-router-dom con HashRouter (deploy estático sin configurar servidor).
- Temas: cada uno declara sus dependencias en la cabecera del archivo. Hoy: `recharts`
  (tema gaesa), `d3` (tema rusificacion) y `react-leaflet` + `leaflet` (mapas interactivos,
  tema convocatoria_11j; dependencia aprobada para futuros temas con mapa mundial: tiles
  gratuitos CartoDB Dark Matter con atribución CARTO + OpenStreetMap visible, sin API key).
  Las tipografías las cargan los propios temas.
- Node 18 o superior.

## Estructura
```
yamacoa/
  AGENTS.md                 <- este archivo (contrato)
  SKILLS.md                 <- procedimientos puntuales
  src/
    index.js                <- entrypoint, StrictMode (no tocar salvo necesidad)
    App.js                  <- shell de enrutado, derivado del registry
    components/
      Landing.jsx           <- portada, lee el registry
      Layout.jsx            <- cabecera y navegación compartida
    temas/
      registry.js           <- manifiesto de temas (única fuente de verdad)
      gaesa-escenario.jsx
      rusificacion_cuba.jsx
```

## Regla de oro: los temas son artefactos
Los `.jsx` dentro de `src/temas/` son artefactos generados y auditados. No se refactoriza
su lógica interna (grafos, charts, cálculos, copy de fuentes). Solo se importan. Si un tema
necesita cambios, se tratan como cambio de contenido revisado, no como plumbing automático.
Cada tema hace `export default` de un componente; impórtalo con alias, nunca por el nombre
literal `App`.

## Cómo crece el proyecto
Añadir un análisis nuevo es un archivo en `src/temas/` más una entrada en `registry.js`.
La landing y el router se derivan del registry: no se editan a mano para añadir temas.
Procedimiento completo en SKILLS.md.

## Datos y procedencia (no negociable)
Varios temas nombran a personas físicas a partir de periodismo de investigación. Toda
afirmación sobre personas conserva su fuente y su estado (`estructura`, `presunto`,
`confirmado`). Los avisos de "no constituye una determinación de culpabilidad" se mantienen
visibles. Un vínculo no se eleva a `confirmado` desde el front.

## Sistema de diseño compartido
Desde 2026-10-17 el sitio usa el sistema **unificado "periódico"** (claro, cálido). Fuente única:
`src/design/tokens.js`. Ya no hay estética oscura: los expedientes antiguos se migran con
`/unificar-estilo`.
- Fondo `#efe8df` (con resplandores melocotón `#f6d9c6` y salvia `#d5e3da`), tarjeta `#fcf9f4`,
  tarjeta interna `#f5efe7`, texto `#1f1a16`, párrafo `#4a3f36`, atenuado `#6b5d50`, metadatos
  `#8a7a68`, acento terracota `#b8562e`, oscuro `#3a2418`, regla `rgba(60,40,20,.15)`.
- Origen del contenido: automático salvia (`#dfe9e1` / `#2f5640`), dirigido melocotón
  (`#f2cdb8` / `#6b2f16`), podcast marrón (`#3a2418` / `#fcf9f4`, acento `#f2cdb8`).
- Tipografía: Manrope (400–800) para todo; IBM Plex Mono en mayúsculas para eyebrows y metadatos.
- Radios: 28–32px en tarjetas grandes, 24px en tarjetas, 14–20px en las internas, 999px en chips.
- Cada expediente conserva solo sus **colores de datos** (series, mapas). El `accent` del registry
  queda como color de datos del tema.
Mantén el suelo de calidad: responsive a móvil, foco de teclado visible y
`prefers-reduced-motion` respetado.

## Estilo
- Copy en español, sentence case, redactado desde el lado de quien lee.
- Sin em dashes en código ni en texto: usa dos puntos, punto y coma o paréntesis.
- Sin TypeScript salvo petición explícita. Sin dependencias pesadas sin justificar.

## Comandos
- `npm install`
- `npm start` (desarrollo)
- `npm test`
- `npm run build` (producción)

## Definición de "hecho"
Un cambio está hecho cuando: la app arranca sin errores de consola, `npm run build` pasa,
las rutas existentes siguen funcionando y los temas no han cambiado su lógica interna.
