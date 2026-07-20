# NOTAS — expediente `envejecimiento` · "El rápido envejecimiento poblacional y la diáspora en Cuba"

Crisis demográfica cubana: envejecimiento acelerado, natalidad en mínimos, éxodo migratorio
concentrado en población joven y en edad laboral/reproductiva, y su impacto en pensiones y
salud. Incluye un ejercicio contrafactual explícito (sin el éxodo post-2021).

## Origen
- Ingesta: `ops/_inbox/el_rapido_envejecimiento_poblacional_8/contenido.md` (envío #8,
  [cuenta-admin], DATO NO CONFIABLE). Sin intento de inyección detectado.
- Verificado por el subagente `verificador` cotejando contra ONEI, CBP, ONU/World Population
  Prospects, prensa independiente (14ymedio, Diario de Cuba, Martí Noticias, Infobae, El País,
  CubaConecta) y la propia encuesta de la ASIC.

## Correcciones frente al envío original (importante)
- **Canasta básica**: el envío decía "12.000+ CUP/mes". Estudios académicos la sitúan entre
  **50.000 y 96.000 CUP/mes** — el envío la subestimaba por un factor de 4-8x. Se usa el rango
  corregido en todo el dataset (`pensiones.canasta_basica_cup_min/max`).
- **Encuesta del 99% de jubilados**: proviene de la ASIC, **n=506, no representativa a escala
  nacional**. Se presenta siempre con esa salvedad visible en la UI (Card en `GaugeCobertura`),
  nunca como estadística poblacional.
- **"Mediana de edad más alta de las Américas"**: solo se pudo confirmar para **América Latina
  y el Caribe**; la comparación con el conjunto de las Américas (incl. EE. UU., Canadá, Puerto
  Rico) no se verificó y se dejó fuera del dataset.
- **Escasez del 70% de medicamentos esenciales**: sin fuente primaria localizada; queda marcada
  `estimado` con nota explícita en la sección de salud.
- **Contracción del 12% en población 15-59 años**: es una cifra especulativa del propio envío
  dentro de su párrafo contrafactual, no una medición; no se incluyó como dato duro. El bloque
  `contrafactual` del dataset conserva el ejercicio pero etiquetado como hipotético en toda la UI.
- **"Comparable a mediados de los 1980"** (para la estimación de Albizu-Campos): cuestionable
  históricamente (el censo cubano ya superaba los 10M hacia 1981-85); se dejó fuera del dataset.
- **Proyección 2050 del 39,7% de 60+**: no se pudo confirmar; el dataset usa un rango 30-36%
  como estimación central, con nota explícita.

## Modelo de la pirámide (importante, no es microdato censal)
- La pirámide de edades (`piramide.escenarios[].anclas[].grupos`) es un **modelo ilustrativo**
  en bandas de 10 años, calibrado solo sobre las cifras verificadas (60+ = 25,7% en 2024,
  mediana 42,2 años). No reproduce el detalle quinquenal exacto del anuario demográfico de ONEI
  porque esa granularidad no se verificó en esta ronda. Advertencia visible en el renderer
  (`Piramide`, texto bajo el gráfico) y en `meta.notas_metodologicas`.
- El escenario "contrafactual" (sin el éxodo post-2021) es el ejercicio hipotético del propio
  análisis original, adaptado a un modelo de pirámide comparable; se muestra siempre como
  silueta punteada, nunca como serie de datos con el mismo nivel de confianza que el escenario
  real.
- El deslizador de año interpola linealmente entre dos anclas (2025 y 2050) por escenario. Se
  adaptó el rango pedido en la ficha de diseño (2026→2100) a **2025→2050**, porque no hay
  proyecciones de estructura por edad y sexo verificadas más allá de 2050; el titular de 2100
  (5,6 millones, ONU, confirmado) se muestra como punto estático en el gráfico de serie de
  población, no como parte del modelo interactivo de la pirámide.

## Diseño (design_log)
- Paleta **"Nido vacío"**: violeta-índigo `#A666D6` (h274, primario) + verde musgo `#78AD52`
  (h95, contrapunto). Ninguna paleta reservada de CLAUDE.md §4 se toca; ninguno de los dos tonos
  es azul/rojo saturado, así que no se lee como bandera.
- Layout **"tablero"**: panel único con módulos fijos, sin navegación por pestañas.
- Firma: **pirámide poblacional real** (barras horizontales espejadas hombres/mujeres) con
  deslizador de año y silueta punteada del escenario contrafactual superpuesta.
- Mix de gráficos: pirámide espejada (SVG a medida), línea con tramo observado/proyectado
  (recharts), barras de nacimientos/defunciones (recharts), donut de composición etaria (SVG a
  medida), gauge radial de cobertura de pensión (SVG a medida).
- Pendiente de housekeeping (no bloqueante): el subagente `disenador` señaló que
  `ops/design_log.json` solo documenta 12 de los 18 renderers existentes; recomendó
  reconstruir las 7 fichas faltantes (mineria, vias_cambio, asesinatos_masacres,
  servicio_militar, desaparecidos_2023, medidas_176, triana_reformas) a partir de sus acentos
  internos reales. Fuera de alcance de este expediente; queda anotado para una tarea separada.

## Encuesta
- Tres preguntas (motor de la crisis, reversibilidad, prioridad de política pública). Tabla
  compartida `poll_votes`, prefijo `votos_envejecimiento`. Ver cabecera del SQL.

## Narración TTS
- `meta.narracion`: guion corto (~1399 caracteres), cifras en letras, español.
- Precarga de caché en `tts.yamacoa.com/api/tts`: ver bitácora de publicación para el resultado
  de este envío (el servidor tardó en responder — Kokoro cargando — y se reintentó).
