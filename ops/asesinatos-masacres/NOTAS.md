# NOTAS · asesinatos-masacres

Expediente de memoria histórica: ejecuciones, masacres marítimas, fusilamientos y
muertes en huelga de hambre bajo el Estado cubano (1959–2022), según **Archivo Cuba /
Free Society Project — Proyecto de Verdad y Memoria**.

## Frontera de datos (renderer congelado ↔ dataset respirante)

- **Congelado** (`src/temas/asesinatos_masacres.jsx`): geometría provincial (paths SVG
  MapSVG, ISO `CU-01…CU-99`), proyección lineal desde el `geoViewBox` del SVG original,
  paleta «marea/abismo», estructura de pestañas, copy editorial de marco y los tooltips.
- **Respirante** (`public/data/asesinatos-masacres.json`): todos los datos, cifras,
  casos, nombres y el bloque `metodologia`. Validado por `asesinatos-masacres.schema.json`.
- El `.jsx` lleva un **espejo embebido** (`EMBEDDED`) del JSON como respaldo si el fetch
  falla. Si actualizas el JSON y quieres que el respaldo también cambie, regenera el
  espejo (no es obligatorio para publicar; el fetch en runtime manda).

## Paleta (nueva, no reservada)

- `sea` `#3F92B0` (accent — el mar, cian frío) · `wine` `#9E3B52` (hecho letal) ·
  `bone` `#E4DCC6` (memoria / criaturas) · `brass` `#C79A4C` (cerco de Guantánamo).
- Distinta de: rojo/acero (represión), ámbar-teal (conflictos), fuego (protestas),
  bandera (píldoras), turquesa (ICLEP), garnet (racismo), marigold (11J).

## Mapa temporal

- Los marcadores usan `lonlat: [lon, lat]` de cada masacre; el renderer los proyecta con
  las constantes del `geoViewBox` (`MAP` en el `.jsx`). Para mover un punto, edita
  `lonlat` en el JSON. La familia Lazo (1971) va **sin ubicar** a propósito (la fuente
  no precisa el lugar): se lista aparte bajo el mapa.
- El tinte de provincia se calcula por muertes acumuladas hasta el año del scrubber.

## Gráficos (variedad, no bar+line)

Barras de composición por familia · mapa temporal con scrubber+play · diagrama de flujo
de 6 etapas (workflow del proceso de ejecución) · donut (políticos vs comunes) · barras
horizontales de días de huelga · comparación Berlín/Guantánamo · **escalera** de penas
del Código Penal · muro de nombres con realce de menores.

## Incertidumbre marcada VISIBLE en la UI (no en notas al pie)

- **Canímar (1980):** cifra ocultada por el Estado; un informe dice «decenas, exacta
  desconocida», otro «al menos 56». Se muestra como estimado (`muertosCierto:false`).
- **Remolcador «13 de Marzo»:** el texto declara 8 menores; el listado nominal por edades
  contiene 11 menores de 18. Discrepancia de la fuente, mostrada en el bloque de memoria.
- **Cifras «al menos»:** advertencia global en el hero y en el pie; la propia fuente cree
  que las víctimas reales son muchas más.
- **169 ejecuciones** es un total paraguas: las masacres nominadas son casos *dentro* de
  esa cifra, no sumandos aparte. Se dice explícito en Panorama.
- Fuente única del exilio (Archivo Cuba) con tesis de sistematicidad; sin contraste con
  archivos estatales (cerrados). Recogido en `metodologia.limitaciones`.

## Encuesta

- `ops/asesinatos-masacres/poll_supabase.sql`: tabla `poll_votes` con RLS + RPC
  `poll_increment` (SECURITY DEFINER, solo +1). **Compartida** entre temas; si ya existe,
  reutilízala. Preguntas: `q1`, `q2` (4 opciones cada una).
- Sin backend, la encuesta funciona con `localStorage` (claves `am_poll_*`). Para
  estadística global, rellena `POLL_BACKEND` en el `.jsx` con la URL y anon key de Supabase.

## Registro

Entrada añadida en `src/temas/registry.js`:

```js
{
  id: "asesinatos-masacres",
  slug: "asesinatos-masacres",
  path: "/asesinatos-masacres",
  titulo: "Asesinatos y masacres de Estado",
  subtitulo: "Ejecuciones, hundimientos y muertes en huelga de hambre bajo el Estado cubano · 1959–2022",
  etiqueta: "MEMORIA · CRÍMENES DE ESTADO",
  accent: "#3F92B0",
  fuentes: "Archivo Cuba / Free Society Project · Proyecto de Verdad y Memoria",
  load: () => import("./asesinatos_masacres.jsx"),
}
```

## Fuentes primarias (PDFs en `ops/_inbox/muertes/`)

1. *Ejecuciones extrajudiciales y desapariciones forzadas de civiles intentando huir de
   Cuba* (Archivo Cuba, 30 nov 2022) — 169 ejec. + 24 desap.; 29 fusilamientos; masacres
   marítimas; cerco de Guantánamo; embajadas; Código Penal arts. 283–288.
2. *Al menos 27 presos cubanos han muerto en huelgas de hambre: 1959–presente*
   (Archivo Cuba, 12 oct 2022) — 14 políticos + 13 comunes.
3. *La Masacre del Río Canímar del 6 de julio de 1980* (Archivo Cuba, act. 25 ago 2019).

Ciclo: **casi-estático** (memoria histórica). Fuera del refresco de 8 h.
