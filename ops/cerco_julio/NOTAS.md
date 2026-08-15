# NOTAS — expediente `cerco_julio` · "El cerco de julio"

Origen: `ops/_inbox/situacion-0626/Informe Mensual sobre la Situación de los
Derechos Humanos en Cuba _ Julio 2026 - Cubalex.pdf`, procesado el 15 de
agosto de 2026 vía `/procesar-inbox`. **Este PDF es byte a byte idéntico
(MD5 `f1d8acaf69b7f3fa49c835948ecf3f01`) al usado en el expediente
`derechos_sociales`**, construido minutos antes en la misma sesión desde
`ops/_inbox/derechossociales/`. Antes de procesar, se detectó la
duplicación y se consultó al administrador, que pidió extraer un
ángulo distinto del mismo informe en vez de descartar el inbox o repetir
`derechos_sociales`. Sin `NOTA_EDITORIAL.md`; sin inyección de instrucciones
detectada.

## Slug y ángulo

Tercer expediente construido en la sesión a partir de informes de Cubalex
sobre Cuba en 2026 (`militarizacion`, `derechos_sociales`, ahora
`cerco_julio`). El informe de julio cubre represión política, DESC y
violencia ciudadana en un solo documento; antes de verificar se cruzó el
contenido restante contra los dos expedientes ya publicados en la sesión:

- `derechos_sociales` ya usó la crisis DESC (agua, electricidad, salud) y
  la violencia ciudadana (homicidios, feminicidios, suicidios) del mismo
  informe.
- `militarizacion` ya usó el caso de Otero Alcántara y la concentración de
  protestas en La Habana (de un informe especial distinto de Cubalex).

Quedaba sin usar el contenido de represión selectiva/individualizada de
julio: la campaña de hostigamiento del 2 de julio contra defensores de
derechos humanos, las muertes bajo custodia y las excarcelaciones del mes.
Slug elegido: `cerco_julio`.

## Verificación (subagente `verificador`)

13 afirmaciones evaluadas: **6 corroboradas, 3 parcialmente corroboradas,
4 no confirmadas, 0 excluidas.**

**Corroboradas:** el operativo del 2 de julio como fenómeno (documentado
por CiberCuba, 14ymedio, Martí Noticias y Cubanet, con más de una decena
de nombres propios reportados: Marthadela Tamayo, Osvaldo Navarro,
Lisandra Orraca, Irina León, Dagoberto Valdés, Yoandy Izquierdo, Rosa
María Rodríguez Gil, Esteban Ajete, Katia Hernández); los hechos centrales
de González Agüero y Díaz Rodríguez (incomunicación, golpizas, desnudez
forzada, amenazas de muerte con arma) y de Hernández Leyva (golpiza,
traslado a Artemisa, desnudez, fotografía); el interrogatorio de 10-12
horas a Anna Sofía Benítez; el caso del adolescente de 13 años golpeado en
Boyeros (identificado por prensa independiente como Alex Javier Hernández
González, corrigiendo un dato que el informe original no precisaba); la
muerte de Rolando Yunior Rodríguez Torres; y las cuatro excarcelaciones
(Nilo Abrahante Santiago, Aníbal Yasiel Palau Jacinto, Kevin Damián
Frómeta Castro, Ángel Castro Carrera).

**Parcialmente corroboradas:** la cifra "al menos 25" personas afectadas
por el operativo (el fenómeno sí, el número exacto no aparece verbatim en
prensa independiente); el caso de Lismani Acosta Gómez (detención el 6 de
julio confirmada; el traslado y las cifras de fianza que cita el informe
original divergen de lo que reporta la prensa independiente, que ubica su
traslado en El Vivac, no en "Cuba-Panamá"); y la muerte de Jorge Luis
Iglesia Rodríguez (la muerte en prisión está confirmada, pero la causa que
reportan medios independientes es una infección de próstata, no la
tuberculosis no tratada que cita Cubalex como causa única — ambas
condiciones coexistían, y el dataset lo explica así, sin elegir una
versión sobre la otra).

**No confirmadas:** el hostigamiento continuado contra los tres defensores
tras el 2 de julio (nuevas citaciones y detenciones en fechas concretas:
8, 10, 11 y 12 de julio) — no hay contradicción, solo ausencia de
cobertura independiente localizada; el caso de Agustín López Canino
(fuente única, mención indirecta en un artículo-resumen); los otros dos
menores detenidos en Regla y Arroyo Naranjo que menciona el informe
original; y la muerte de Osviel Rivero Viera, para la que no se localizó
ninguna fuente, ni de corroboración ni de contradicción.

**Regla de no fusión aplicada:** `tres_pistas` marca cada evento con su
propio `confianza` y `sincronizado`, de modo que el punto de partida (2 de
julio, corroborado) nunca se mezcla visualmente con el hostigamiento
posterior (no confirmado). `cierre_balanza` mantiene `muertes` y
`excarcelados` como listas separadas, cada nombre con su propio grado de
certeza — nunca "3 muertes vs. 4 liberados" como un resumen de dos
números limpios, sino nombre por nombre con su fuente.

## Diseño

Ficha del subagente `disenador` contra `ops/design_log.json` (25 fichas
previas tras la actualización del propio agente en el turno anterior),
vinculante:

- **Paleta "Citación y Retén":** oro-mostaza `#D4BD2B` (primario, h52 —
  papel de convocatoria administrativa, no bronce ni oro de bandera) y
  azul-pizarra desaturado `#4B578B` (contrapunto, h229 — vernáculo cubano
  para el puesto de control/cordón de la Seguridad del Estado, no una
  metáfora importada). El disenador documenta que con 57 acentos ya vivos
  en la bitácora (separación media 6.3°), el máximo global alcanzable para
  cualquier primario nuevo es 13° y para cualquier contrapunto 20° —ambos
  muy por debajo de 40°/25°—, así que prioriza la distancia frente al
  clúster con el que este tema podría confundirse en la práctica
  (`represion`, `militarizacion`, `derechos_sociales`, `sulmira`,
  `protesta_solitaria`, `angel_veliz`, `anatomia_11j`, `racismo`): ≥48° de
  distancia real frente a los ocho. Ninguna paleta reservada de CLAUDE.md
  §4 tocada; no se lee como bandera cubana (mostaza + azul-pizarra
  desaturado, sin rojo).
- **Tipografía:** Archivo + IBM Plex Mono, sin fuente extra (documento
  burocrático tipiado, no verso).
- **Layout:** `triptico-central-con-satelites-y-cierre-en-balanza` —
  distinto del inmediato anterior (`derechos_sociales`,
  `boletin-mensual-en-dos-hilos`).
- **Mix de gráficos:** tres pistas verticales sincronizadas (firma, ver
  abajo); mapa de provincias (no sincronizado a sidebar, sin colisionar
  con la firma reservada de `represion`; solo 3 de 15 provincias tienen
  señal real, el resto queda sin dato); galería de casos satélite; balanza
  de cierre (muertes vs. excarcelaciones); fichas de contexto agregado;
  encuesta. Ningún gráfico coincide con el conjunto combinado de
  `angel_veliz`, `militarizacion` y `derechos_sociales`.
- **Firma:** tres líneas de tiempo verticales (González Agüero, Díaz
  Rodríguez, Hernández Leyva) que arrancan alineadas en un único marcador
  horizontal (2 de julio, mismo operativo) con los mismos glifos de
  ruptura destacados (nodo con resplandor dorado) en las tres pistas, y a
  partir de ahí se desalinean: cada pista sigue su propio calendario de
  hostigamiento, con menos certeza cuanto más se aleja del punto
  sincronizado. La sincronía inicial es la prueba visual de un operativo
  centralizado, no un adorno — y coincide, honestamente, con el corte real
  entre lo corroborado (el 2 de julio) y lo no confirmado (todo lo
  posterior).

## Dataset y schema

- `public/data/cerco_julio.schema.json` — JSON Schema draft-07,
  `additionalProperties: false`, valida con `ajv`.
- `public/data/cerco_julio.json` — `meta.descripcion` 689 palabras (dentro
  de 400-1200), `meta.narracion` 1.382 caracteres (dentro de 300-1450, sin
  em dashes).
- `provincias` solo incluye las tres provincias que el informe desglosa
  por nombre (La Habana, Camagüey, Santiago de Cuba); el resto de las 15
  provincias mencionadas en el agregado no aparece individualizado —no se
  inventaron cifras para completarlas.
- `contexto_agregado` lleva `confianza: "no_confirmada"` en bloque, porque
  sus cifras (388/817/302) son la métrica interna de Cubalex sin
  desglose verificable caso por caso, coherente con el tratamiento que ya
  recibieron cifras equivalentes en `militarizacion` y `derechos_sociales`.

## Renderer

`src/temas/cerco_julio.jsx` — fetch a `/data/cerco_julio.json` con
fallback `EMBEDDED`. Balance de llaves OK (`scripts/bracket-balance.mjs`).
Sin `<Narrador/>` (global en `Layout.jsx`). Reutiliza verbatim `PROV_GEO` y
`CUBA_FEATURE` de `represion_cuba.jsx` (geometría real de Cuba, invariante)
solo para el mapa de puntos por provincia; no es un mapa sincronizado a
sidebar (eso sigue siendo exclusivo de `represion`). Todo lo demás es
SVG/CSS puro, sin librerías nuevas más allá de `d3` (ya dependencia del
proyecto).

## Encuesta

Tabla dedicada `public.cerco_julio_votos` con RLS cerrada + RPC
`cerco_julio_votar` / `cerco_julio_totales`. Tres preguntas
(`operativo_coordinado`, `balanza_final`, `cifras_no_confirmadas`), 9
opciones sembradas.

## Registry

Alta en `src/temas/registry.js`: `id/slug: "cerco_julio"`,
`accent: "#D4BD2B"`, `etiqueta: "REPRESIÓN · DEFENSORES DE DERECHOS
HUMANOS"`, `publicado: "2026-08-15"`.

## Validación

- `npx ajv-cli validate -c ajv-formats -s public/data/cerco_julio.schema.json
  -d public/data/cerco_julio.json` → **valid**.
- `node scripts/bracket-balance.mjs src/temas/cerco_julio.jsx` → **OK**.
- `npm run build` → pendiente de confirmar en el gate antes del centinela.
- Pendiente de un humano: revisión editorial y publicación (se entrega sin
  `--auto`).
