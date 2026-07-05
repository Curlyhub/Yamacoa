# NOTAS · desaparecidos-2023

Expediente de memoria: **79 muertes y desapariciones documentadas en 2023 atribuidas al
Estado cubano**, según Archivo Cuba & American Museum of the Cuban Diaspora — Proyecto de
Verdad y Memoria (informe anual, feb. 2024, «trabajo en progreso»).

## Frontera de datos (renderer congelado ↔ dataset respirante)

- **Congelado** (`src/temas/desaparecidos_2023.jsx`): geometría provincial (paths SVG
  MapSVG `CU-01…CU-99`), proyección desde el `geoViewBox`, paleta «brasa/alerta»,
  estructura de pestañas, geometría de la línea de tiempo (carriles por categoría),
  copy de marco y el tooltip. Lleva espejo embebido (`EMBEDDED`) por si falla el fetch.
- **Respirante** (`public/data/desaparecidos-2023.json`): un objeto `casos[]` con las 79
  personas + `resumen` (totales y subdesgloses) + `proceso` (método) + `metodologia`.
  Validado por `desaparecidos-2023.schema.json`.
- **Fuente única de la vista:** casi todo se deriva de `casos[]` (timeline, mapa, nombres).
  Los KPIs y el donut usan `resumen`. Regenerar el dataset: `python3 /tmp/gen_desap.py`
  (el generador reconcilia los 79 y los subtotales por categoría antes de escribir).

## Paleta (nueva, naranja extremo como pidió el operador)

- Principal `--or` **`#FF6A00`** (naranja extremo) sobre negro cálido `#0C0A07`.
- Categorías: ejecuciones `#E23A15` · custodia `#FF6A00` · servicio militar `#FFA83A` ·
  internacionalistas `#C98A2A` · migrantes `#6E9BD1` (azul acero, único tono frío = la
  ruta / el mar; NO es un dos-tonos-bandera, la identidad es naranja dominante).
- Distinta de reservadas: rojo/acero (represión), ámbar-teal (conflictos), fuego
  (protestas), bandera (píldoras). Nota: **mineria** usa `#f54b08` (naranja-rojo); este
  usa `#FF6A00`, más saturado y limpio, con fondo e identidad propios.

## Gráficos / interacción (variedad, no bar+line)

- **Donut** de 5 categorías, clic → subdesglose en barras (custodia, SMO, migrantes).
- **Iceberg**: 79 documentados vs 59 sin documentar sobre 138 reportados.
- **Línea de tiempo** interactiva (el «workflow/línea temporal de los sucesos» pedido):
  carriles por categoría, un punto por persona en su fecha real, reproducción/scrubber por
  mes con playhead, filtro por categoría, ficha al tocar. Muertes = círculo; desapariciones
  = rombo hueco.
- **Mapa provincial**: intensidad por casos ocurridos dentro de Cuba (naranja), anillos
  azules en los puntos de salida de migrantes (Cárdenas/CU-04, Caibarién/CU-05); clic en
  provincia → lista de casos. Advertencia visible de que la mayoría de muertes de migrantes
  ocurre fuera de la isla.
- **Muro de nombres** por categoría, con realce de menores y marca ◆ de desaparecidos.
- **Método**: flujo de 4 pasos (reporte → verificación → codificación → registro) + límites.

## Incertidumbre marcada VISIBLE en la UI (no en notas al pie)

- **Trabajo en progreso**: advertencia global en el hero y el pie; el número real se sabe
  mayor. `59` casos reportados sin documentar mostrados en el «iceberg».
- **«Suicidios» en custodia** que podrían ser ejecuciones: dicho en el subdesglose (asterisco)
  y en los detalles de los casos.
- **Fechas aproximadas** (solo mes en el informe) → `fechaAprox:true`, se ubican a mitad de
  mes; la ficha muestra «(aprox.)».
- **Geografía**: las muertes de migrantes ocurren mayormente fuera de Cuba; el mapa lo dice
  y solo tiñe provincias por muertes dentro de la isla.
- **Homónimos**: dos «Yasmani Reina» distintos (uno desaparecido balsero, otro muerto en
  accidente) — desambiguado en el dato y la ficha.
- Fuente única del exilio con tesis de responsabilidad estatal; sin contraste con registros
  oficiales (cerrados). En `metodologia.limitaciones`.

## Encuesta

- `ops/desaparecidos-2023/poll_supabase.sql`: tabla `poll_votes` + RPC `poll_increment`
  (RLS, solo +1). **Compartida** entre temas; reutilízala si ya existe. Preguntas `q1`, `q2`.
- Sin backend: `localStorage` (claves `d23_poll_*`). Para stats globales, rellena
  `POLL_BACKEND` en el `.jsx`.

## Registro

```js
{
  id: "desaparecidos-2023", slug: "desaparecidos-2023", path: "/desaparecidos-2023",
  titulo: "Los 79 de 2023",
  subtitulo: "Muertes y desapariciones documentadas en 2023 atribuidas al Estado cubano",
  etiqueta: "MEMORIA · VERDAD Y MEMORIA 2023", accent: "#FF6A00",
  fuentes: "Archivo Cuba & American Museum of the Cuban Diaspora · Verdad y Memoria",
  load: () => import("./desaparecidos_2023.jsx"),
}
```

## Fuente primaria

`ops/_inbox/desaparecidos-2023/2023-informe-anual.pdf` (19 pp.). Reconciliación de
categorías: 9 + 22 + 11 + 3 + 34 = **79**. Subdesgloses verificados contra las páginas 2,
7, 8, 11 y 13 del informe. Ciclo: **anual** (fuera del refresco de 8 h).
