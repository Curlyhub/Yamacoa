# NOTAS — expediente `electrica` · "La corriente interrumpida"

Sistema electroenergético nacional (SEN) de Cuba: de la electrificación de la isla
al apagón permanente. Ventana **1958–2026**.

## Origen
- Ingesta: `ops/_inbox/electrica/CubaElectrica.txt` (nota del contribuyente, DATO NO CONFIABLE).
- El texto fuente mezcla contexto general de redes eléctricas del siglo XX con datos
  específicos de Cuba. Solo se ingirieron las afirmaciones cotejables contra fuentes
  bien corroboradas; el resto se dejó fuera o se marcó como cualitativo.
- Fuente citada por el contribuyente (cubasiglo21.com) tratada como pista, no como
  fuente primaria; las cifras se anclaron a UNE/Cubadebate, Horizonte Cubano (Columbia),
  IEEE Spectrum, ONEI, Banco Mundial/IEA y prensa independiente (14ymedio, elTOQUE, CiberCuba).

## Distinciones que van VISIBLES en la UI (no en notas al pie)
- **"Termoeléctricas" (~40%) ≠ "fósil" (~80%)**: el 80% fósil solo se alcanza sumando
  las termoeléctricas de vapor + los motores diésel y fuel-oil de la generación distribuida.
  El donut de la pestaña *Estado* separa las tres familias fósiles y las etiqueta.
- **Capacidad instalada 2025 = INCIERTA**: no hay placa nominal agregada oficial reciente;
  ~3.000 MW es orden de magnitud de prensa. Marcado con badge "incierto" y en el slope chart.
- **Disponible en pico**: fluctúa a diario (1.165–1.880 MW en 2025-26); se usa ~1.900 como central.
- **Comparativa entre países**: instantáneas actuales, NO serie histórica continua (no verificable
  década a década). Observacional, no causal — advertido en el texto de la pestaña *El contrafactual*.
- **Cálculo de centros de datos**: escenario ilustrativo, no contabilidad. Badge "estimación" +
  panel explícito "Lo que este cálculo NO dice".
- **Ranking per cápita pre-1959**: dejado como afirmación cualitativa ("entre los dos primeros de
  AL"); el puesto exacto y la cifra concreta no se verificaron contra fuente primaria.

## Diseño (design_log)
- Paleta **"Arco voltaico"**: azul de arco `#3BA9E0` (h200) + filamento `#F5B841` (h42) +
  ascua `#E8503A` (h9). Rampa de voltaje frío→ascua para severidad.
- Firma: **medidor radial tipo voltímetro** (demanda vs disponible = déficit) +
  **ridgeline** de apagones (KDE, distinto del violín de anatomía) +
  **parallel coordinates** para la comparación multieje (distinto del radar de anatomía).
- Mix de gráficos: slope-chart, gauge radial, área, donut, coropleta, ridgeline,
  parallel-coords, barras, slider-cálculo. Seis pestañas.

## Encuesta
- Este expediente **no lleva encuesta**. `poll_supabase.sql` se incluye por convención
  (tabla compartida `poll_votes`, idempotente). Ver cabecera del SQL.

## Revisión editorial (2026-07-06, ronda humana pre-publicación)
Dos correcciones pedidas por el administrador tras la revisión visual:

1. **"La velocidad, no el relato"** (nueva sección en *Génesis*) + retirada de la palabra "hito".
   - Objeción: presentar 56%→95% como hazaña revolucionaria omite que el sistema YA se
     expandía rápido antes de 1959. Comparado el *ritmo* pre/post:
     - Capacidad instalada: 189 MW (1951) → 397 MW (1958) = ×2,1 en 7 años ≈ **+11,2% anual
       compuesto**; post-1959 397→3.676 MW (34 años) ≈ **+6,8% anual**. Más MW absolutos
       después (~96 vs ~30 MW/año, subsidio soviético) pero a MENOR ritmo relativo.
     - Clientes: 667.000 (1955) → 732.400 (1958) ≈ +3,2%/año; 732.400 → 1.633.000 (1984)
       ≈ +3,1%/año — prácticamente igual.
   - Caveats VISIBLES: la cobertura % se satura cerca del 100% (los últimos puntos avanzan
     más despacio por aritmética); el anclaje de 1951 y los clientes son de menor confianza
     (badge "reconstruido"); 397 y 3.676 MW sí corroborados. Nuevo campo `velocidad` en el dataset.
   - El título "Los hitos del sistema" → "Cronología, sin épica / Cómo se llegó hasta aquí".
   - Fuentes: capacidad 189/1951 y 464/1958 y clientes de cubasiglo21 (fuente partidista, tratada
     como hostil) CRUZADAS con Electric Choice (37,5 MW 1914 · 135 MW 1928 · 397 MW 1959 ·
     ~3.000 MW años 80) y The Business History Conference / Springer (Compañía Cubana de
     Electricidad). Se usó 397 MW (bien corroborado) para el cálculo, no el 464 partidista.

2. **Pestaña ¿Y si? — parámetros con referencia explícita.**
   - Precio del kWh industrial ahora citado: Brasil ~US$0,128; mercados con data centers
     US$0,12–0,18; Paraguay ~US$0,045 (GlobalPetrolPrices / Statista, 2025). Se usa US$0,12.
   - Añadido `costeSolar`: el LCOE solar a gran escala cayó ~80–85% (2010→2025, ~US$0,38→~US$0,058/kWh;
     ~US$2,5→~US$1 por vatio) — IRENA/NREL. Responde a "los costes han disminuido desde hace mucho".
   - Inversión por centro detallada con rango (US$100M–1.000M) y aclaración de que NO incluye la
     generación. Nuevo bloque `fuentesCalculo` con las tres referencias, renderizado bajo "Supuestos".

3. **Mapa provincial real (cuba.svg de MapSVG)** — sustituye a las burbujas d3.
   - A petición del administrador se reemplazó el mapa de círculos (d3.geoMercator sobre el
     contorno de 42 puntos) por la coropleta provincial del `cuba.svg` dejado en el inbox.
   - Geometría extraída a `src/temas/electrica_geo.js` (`CUBA_PATHS` + `CUBA_VIEWBOX`), parte del
     renderer congelado. El `cuba.svg` original se copió a `public/assets/electrica/cuba.svg` (procedencia).
   - 16 paths (15 provincias + Isla de la Juventud). Cada provincia se colorea por `senal` fusionando
     el `title` del path con `provincias[].nombre` (alias "Ciudad de la Habana" → "La Habana").
     Isla de la Juventud no tiene dato → gris neutro. Matanzas (con `plantas`) lleva borde punteado.
   - NOTA sobre §4: esto es una excepción deliberada al invariante "contorno de 42 puntos + burbujas
     por provincia", decidida por el humano antes de publicar. Aplica SOLO a este expediente.

## Refresco (Nivel 1)
- El dataset respirante es `public/data/electrica.json`, validado contra
  `public/data/electrica.schema.json`. El `.jsx` está congelado: NO tocar.
- Candidatos a refresco periódico: `capacidad` (disponible/déficit/producción),
  `provincias.senal` por periodo, `generacion` (subida de solar), `historia` (nuevos colapsos).
