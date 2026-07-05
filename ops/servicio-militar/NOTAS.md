# NOTAS · servicio-militar

Expediente: **el servicio militar obligatorio (SMO) en Cuba como «trata de personas con un
costo letal»**, según Maria C. Werlau — Archivo Cuba / Free Society Project (20 oct 2023).
Tema marcado por el operador como de importancia vital ante un escenario de guerra.

## Frontera de datos (renderer congelado ↔ dataset respirante)

- **Congelado** (`src/temas/servicio_militar.jsx`): geometría provincial (paths SVG MapSVG
  `CU-01…CU-99`), paleta «esperanza» (verde), estructura de pestañas, geometría de la línea
  de tiempo multidécada (apilado por año), copy de marco, tooltip y las barras de comparación
  de pago. Lleva espejo embebido (`EMBEDDED`) por si falla el fetch.
- **Respirante** (`public/data/servicio-militar.json`): `caidos[]` (los 54) + `resumen` +
  `sistema` (leyes + cargas) + `carneCanon` (Angola + Rusia) + `metodologia`. Validado por
  `servicio-militar.schema.json`.
- **Regenerar el dataset:** `python3 /tmp/gen_smo.py` (reconcilia los 54 y las 8 categorías
  antes de escribir: 2 fusilados, 1 desaparición, 14 asesinatos, 2 médica, 14 suicidios, 19
  accidente, 1 mar, 1 sin causa; 4 menores).

## Paleta (nueva, verde esperanza como pidió el operador)

- Principal `--gr` **`#33C27A`** (verde esperanza) sobre negro verdoso `#0A0F0C`. El verde
  enmarca la juventud arrebatada; UI, KPIs y acentos en verde.
- Las 8 causas de muerte se codifican por color (accidente ámbar, asesinato rojo-naranja,
  suicidio violeta, médica azul, fusilamiento rojo, desaparición gris, mar teal, sin causa
  gris verdoso). Ningún dos-tonos-bandera; identidad verde dominante.
- Distinta de reservadas: rojo/acero (represión), ámbar-teal (conflictos), fuego (protestas),
  bandera (píldoras). No colisiona con los otros expedientes nuevos (mar-cyan, naranja).

## Gráficos / interacción (variedad)

- **Donut** de 8 causas, clic → filtra el resto de la vista.
- **Iceberg** 54 documentados vs «cientos, quizás miles».
- **Línea de tiempo multidécada 1964–2023** (el «workflow/línea temporal» pedido): un punto por
  persona, apilado por año, coloreado por causa, con reproducción/scrubber por año y realce de
  menores (anillo). Clasifica los eventos (asesinato/suicidio/accidente/… ) como pidió el operador.
- **Mapa provincial** por conteo de caídos, filtro por causa, clic → lista de la provincia.
- **La máquina**: timeline legal en flujo vertical (1963→2023) + 4 cargas (trabajo forzoso,
  sangre, menores, prohibición de salida).
- **Carne de cañón**: conmutador Angola / Rusia con **barras de comparación de pago**
  (lo que recibe el recluta vs lo que se paga por él) + rejilla de cifras + penas.

## Incertidumbre marcada VISIBLE en la UI (no en notas al pie)

- **«Esfuerzo inicial»**: advertencia global; el costo real se sabe de cientos/miles. Iceberg.
- **Discrepancia interna**: el resumen del Anexo dice 13 ejecuciones extrajudiciales, la lista
  nominal tiene 14. Se muestra la lista y se nota en `resumen.nota` y en la ficha.
- **«Suicidios» cuestionados por las familias** (golpes, disparos múltiples) → se muestra la
  clasificación de Archivo Cuba; los detalles recogen la disputa (Elvis Martínez, Darío Andino…).
- **Fechas aproximadas** (solo mes/año) → `fechaAprox:true`, «(aprox.)» en la ficha; ubicadas a
  mitad de periodo en la línea de tiempo.
- **Cifras de Ucrania (198/746/62)** provienen de filtraciones y ONG del exilio; el total real y
  la implicación directa del Estado se desconocen. En `metodologia.limitaciones`.
- **Angola (2.085 muertos)** es la cifra reportada; sin lista oficial, veteranos dicen que más.
- Fuente única del exilio con tesis de responsabilidad estatal; sin contraste con registros
  oficiales cerrados.

## Encuesta

- `ops/servicio-militar/poll_supabase.sql`: tabla `poll_votes` + RPC `poll_increment` (RLS,
  solo +1). **Compartida**; reutilízala si ya existe. Preguntas `q1`, `q2`.
- Sin backend: `localStorage` (claves `smo_poll_*`). Para stats globales, rellena `POLL_BACKEND`.

## Registro

```js
{
  id: "servicio-militar", slug: "servicio-militar", path: "/servicio-militar",
  titulo: "Servir o morir",
  subtitulo: "El servicio militar obligatorio en Cuba: trata de personas con un costo letal",
  etiqueta: "DERECHOS · SERVICIO MILITAR", accent: "#33C27A",
  fuentes: "Maria C. Werlau · Archivo Cuba / Free Society Project",
  load: () => import("./servicio_militar.jsx"),
}
```

## Fuente primaria

`ops/_inbox/servicio_militar/Cuba-Servicio-Militar.pdf` (24 pp.). El registro de 54 caídos
sale del Anexo (pp. 21–24); la evolución legal, el trabajo forzoso (EJT/UMAP), la sangre, los
mercenarios en Ucrania y el precedente de Angola, del cuerpo del informe (pp. 1–20).
Ciclo: **esfuerzo inicial en progreso** (fuera del refresco de 8 h).
