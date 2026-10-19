# El precio de los Cinco

Tema de Yamacoa en tres artefactos, más el registro de diseño y el validador.

| Archivo | Papel |
|---|---|
| `PrecioDeLosCinco.jsx` | Renderer congelado. Solo depende de React. |
| `precio-de-los-cinco.json` | Dataset que respira: partidas, totales, correcciones, textos, leyendas y fuentes. |
| `precio-de-los-cinco.schema.json` | Schema AJV draft-07. Las etiquetas de confianza son un enum cerrado. |
| `design_log.entrada.json` | Entrada para `ops/design_log.json` (tonos 193° y 12°; sin ámbar). |
| `validar.mjs` | Las tres puertas más las comprobaciones de coherencia del tema. |

## Integración

- El componente recibe el dataset por prop: `<PrecioDeLosCinco datos={json} />`. Adáptalo a cómo cargan el JSON los demás renderers.
- Trae su propia `Leyenda` local para no depender de una ruta de import que no conozco. Si la plataforma tiene una `Leyenda` compartida, se puede sustituir antes de congelar el renderer.
- Los estilos van en un `<style>` con prefijo `pc-` para no colisionar con el resto de la app. Respeta `prefers-color-scheme` y también `data-theme="dark"` o `"light"` sobre `.pc-root`.
- No hay SVG: el gráfico de rangos es HTML, así que las reglas de texto mínimo y `preserveAspectRatio` no aplican.
- El slug usa guiones (`precio-de-los-cinco`).

## Validación

```
node validar.mjs PrecioDeLosCinco.jsx precio-de-los-cinco.json precio-de-los-cinco.schema.json
```

Requiere `esbuild` y `ajv` instalados. Comprueba el balance de llaves (consciente de cadenas y plantillas), la compilación con esbuild (`bundle:false`), el schema, el orden de percentiles, que solo las partidas `no_cuantificado` queden fuera del total, la suma de medianas frente a los totales, la integridad de las citas, las cuotas de varianza, los años-persona y la distancia cromática al ámbar reservado.

## Refresco

Para recalcular, ejecuta `python3 precio-cinco-modelo.py` (semilla 1998, escribe `modelo.json`) y después `python3 construir_dataset.py` (combina `modelo.json` y `fuentes.json` en el dataset del tema). Antes de publicar queda un pendiente: verificar las tarifas CJA del distrito sur de Florida para 2000-2001.

## Integración en Yamacoa (importado el 2026-10-19)

| Pieza | Dónde vive |
|---|---|
| Renderer (congelado) | `src/temas/precio-de-los-cinco.jsx` — carga `/data/precio-de-los-cinco.json` con `fetch` y lleva una copia como respaldo (`EMBEDDED`) |
| Dataset y schema | `public/data/precio-de-los-cinco.json` y `.schema.json` |
| Modelo, fuentes y validador | esta carpeta (`ops/precio-de-los-cinco/`) |
| Tarjeta | `src/temas/registry.js` (`/precio-de-los-cinco`) |
| Diseño | entrada en `ops/design_log.json` |

Cambios al importar (solo piel y carga, sin tocar datos ni lógica): fondo transparente sobre el del
periódico, superficie, tinta y reglas desde los tokens `--y-*`, Manrope en lugar de Archivo Black e
IBM Plex Sans, sin modo oscuro, y `<PrecioDeLosCinco datos>` envuelto en un `App` que hace el fetch.
Los colores de datos (#0B7FA0, #B84A2E y la escala de confianza) son los originales.

**Refresco:** los scripts escriben en el directorio actual. Ejecutarlos aquí y copiar el resultado:
`python3 precio-cinco-modelo.py && python3 construir_dataset.py && cp precio-de-los-cinco.json ../../public/data/`.
`modelo.json` y la copia local del dataset son intermedios: no se versionan.

Sin encuesta (`poll_supabase.sql`): el set no la traía.
