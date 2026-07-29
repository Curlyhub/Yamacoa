import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";

/* ============================================================================
   AUDITAR A LOS ALIADOS — renderer congelado
   Yamacoa · tema: propuesta-economica-auditoria
   ----------------------------------------------------------------------------
   CONTRATO
   Este archivo NO se modifica tras la publicación. Solo respira el dataset
   (propuesta-economica-auditoria.json), validado contra el .schema.json en
   cada refresco del ciclo de 8 h.

   ENCUESTA — convención de base única
   Todas las encuestas de la plataforma comparten una sola tabla. La clave de
   cada opción es:            `${meta.slug}::${pregunta.id}::${opcion.id}`
   El almacenamiento primario es localStorage; Supabase actúa como respaldo
   silencioso e incremental. RPC esperadas (SECURITY DEFINER, RLS cerrada):

     yamacoa_encuesta_votar(p_clave text) returns void
     yamacoa_encuesta_resultados(p_prefijo text) returns table(clave text, votos bigint)

   Si las variables de entorno no están definidas, la encuesta funciona en modo
   local sin errores visibles. Verificar contra ENCUESTAS.md antes de publicar.

   TIPOGRAFÍA
   Ningún SVG usa preserveAspectRatio="none": deforma el texto. Las etiquetas
   largas se renderizan en HTML junto al gráfico, nunca dentro del SVG.
   Tamaño mínimo de texto en SVG: 12 unidades sobre viewBox de 960.
   ============================================================================ */

const RUTA_DATOS =
  ((typeof process !== "undefined" && process.env && process.env.PUBLIC_URL) || "") +
  "/data/propuesta-economica-auditoria.json";

const DATOS_EMBEBIDOS = {
  "meta": {
    "slug": "propuesta-economica-auditoria",
    "titulo": "Auditar a los aliados",
    "subtitulo": "Evaluación crítica de la Propuesta para transformar la economía cubana",
    "version": "1.0.0",
    "actualizado": "2026-07-28",
    "ciclo_horas": 8,
    "aviso_simulacion": "Los controles de esta página exploran identidades aritméticas y formas funcionales. Ningún valor que produzcan es un dato observado.",
    "nota_ecosistema": "Los cinco autores son economistas cubanos vinculados en distinta medida a la crítica reformista del modelo. Sus fuentes principales —ONEI, CEPAL, FMI, elTOQUE, EIU, Cuba Study Group— comparten orientaciones normativas parcialmente convergentes. Esta evaluación tiene el mismo problema: usa en buena parte las mismas fuentes. Los sesgos de selección se heredan y no se cancelan entre sí."
  },
  "marco": {
    "titulo": "Por qué esta crítica es de aliado",
    "parrafos": [
      "La Propuesta para transformar la economía cubana es, en este momento, el programa de reforma más serio que existe sobre la mesa. Sus cinco autores publican con nombre y apellido un documento falsable: dice qué hacer, en qué orden y bajo qué supuestos. El régimen no publica nada equivalente. Anuncia 176 medidas sin secuencia, sin cuadro fiscal y sin condiciones de reversión.",
      "Esa asimetría es el punto de partida. Un programa que se somete a auditoría pública es una forma de oposición: obliga a discutir con cifras en un país donde la discusión con cifras está proscrita.",
      "Por eso la crítica correcta no es la que desacredita. Es la que endurece. Un documento que se publica como versión 1 pide exactamente esto: que alguien verifique la aritmética, busque los supuestos ocultos y ponga a prueba la secuencia contra la evidencia comparada. Lo que sigue hace las tres cosas, y empieza corrigiendo cuatro errores de la propia evaluación preliminar."
    ],
    "cita": "Auditar un programa aliado no lo debilita. Lo convierte en el único que puede sobrevivir al contacto con la realidad."
  },
  "propuesta": {
    "titulo": "Propuesta para transformar la economía cubana",
    "version_doc": "Versión 1",
    "fecha": "20 de julio de 2026",
    "paginas": 118,
    "autores": [
      "Mauricio De Miranda Parrondo",
      "Pedro Monreal González",
      "Omar Everleny Pérez Villanueva",
      "Ricardo Torres Pérez",
      "Pavel Vidal Alejandro"
    ],
    "objetivo": "Una economía social de mercado sustentada en un Estado democrático de Derecho.",
    "bloques": [
      "Estabilización fiscal, monetaria, de precios y cambiaria",
      "Emergencia energética",
      "Agricultura y turismo",
      "Empresa privada, empresas estatales y GAESA",
      "Apertura comercial, inversión y reinserción financiera",
      "Protección social, reforma laboral, administración pública y seguridad"
    ],
    "primera_fase": "3 años · 20 objetivos · 6 bloques",
    "supuestos": [
      {
        "id": "s1",
        "texto": "Avance sustantivo en la negociación diplomática Cuba – Estados Unidos",
        "critico": true
      },
      {
        "id": "s2",
        "texto": "Rearticulación de la inserción internacional, distinta de la dependencia soviética o venezolana",
        "critico": false
      },
      {
        "id": "s3",
        "texto": "Disponibilidad de financiamiento internacional de emergencia",
        "critico": true
      },
      {
        "id": "s4",
        "texto": "Condiciones políticas internas para iniciar la sustitución del modelo",
        "critico": true
      }
    ]
  },
  "aciertos": [
    {
      "id": "a1",
      "titulo": "Gobernanza antes de privatizar",
      "detalle": "Advierte explícitamente que privatizar antes de construir instituciones produce captura y corrupción. Propone corporatizar, auditar, separar regulación y propiedad y crear un régimen de insolvencia antes de vender.",
      "respaldo": "Coincide con el mecanismo de Singapur: profesionalizar la gestión estatal antes de expandirla o venderla."
    },
    {
      "id": "a2",
      "titulo": "Protección de propietarios actuales",
      "detalle": "Descarta desalojos y restituciones físicas de viviendas, y protege a beneficiarios legítimos de la reforma agraria.",
      "respaldo": "Neutraliza el miedo a la restauración, que es el principal activo propagandístico del régimen frente a cualquier transición."
    },
    {
      "id": "a3",
      "titulo": "Rechazo a la austeridad adicional",
      "detalle": "Reconoce que el ajuste ya ocurrió, pero de forma regresiva: pérdida de salario real, deterioro de pensiones y traslado del costo a los hogares.",
      "respaldo": "Diagnóstico correcto y poco frecuente en programas de estabilización."
    },
    {
      "id": "a4",
      "titulo": "Desmilitarización económica",
      "detalle": "Incorporar GAESA al presupuesto civil, auditarlo y transferir sus reservas al Banco Central.",
      "respaldo": "Condición necesaria de cualquier estabilización creíble. También la medida políticamente más difícil de todo el programa."
    },
    {
      "id": "a5",
      "titulo": "Libertad sindical y negociación colectiva",
      "detalle": "Derecho de huelga, tutela judicial, protección frente a discriminación y portabilidad de pensiones.",
      "respaldo": "Rompe con el sindicato único, que es una de las piezas centrales del control."
    },
    {
      "id": "a6",
      "titulo": "Fondo nacional de activos públicos",
      "detalle": "Gestión profesional temporal de las grandes empresas antes de cualquier venta.",
      "respaldo": "Es literalmente el mecanismo Temasek. Es el punto donde la comparación internacional apoya al documento en lugar de cuestionarlo."
    }
  ],
  "correcciones": {
    "titulo": "Cuatro objeciones de la evaluación preliminar que no se sostienen",
    "intro": "La honestidad analítica exige empezar por aquí. Atribuir al documento algo que no dice le entrega a sus autores una refutación gratuita.",
    "items": [
      {
        "id": "c1",
        "objecion": "«Las plantas flotantes deberían limitarse a contratos de 18-36 meses con cláusulas de salida»",
        "realidad": "La medida 6.1 ya especifica un horizonte «del orden de 24 a 36 meses, con opciones de renovación o de salida», y exige contratación mediante procesos competitivos y transparentes.",
        "queda_en_pie": "Sigue faltando el precio máximo por MWh, la penalización por indisponibilidad y la auditoría pública del combustible.",
        "confianza": "confirmado"
      },
      {
        "id": "c2",
        "objecion": "«Los aranceles agrícolas deberían ser un mecanismo variable y decreciente»",
        "realidad": "La medida 9.3 ya los define «temporales y decrecientes», aplicados de forma selectiva por productos, transparente y no discriminatoria.",
        "queda_en_pie": "No se fija el umbral de disparo, la regla de eliminación automática ni quién la certifica. La objeción válida es de diseño, no de omisión.",
        "confianza": "confirmado"
      },
      {
        "id": "c3",
        "objecion": "«El límite de 402 hectáreas parece administrativo, no resultado de un análisis productivo»",
        "realidad": "Equivale a 30 caballerías, no es acumulable entre modalidades de propiedad, usufructo y gestión, y el documento lo presenta como restricción frente al anuncio gubernamental de junio de 2026 de pasar a usufructo indefinido y superficie no definida.",
        "queda_en_pie": "La crítica correcta es otra y es más incisiva: el documento fija un tope de superficie sin fijar un tope de control. Sin registro de beneficiario real, un tope se evade con testaferros y sociedades interpuestas.",
        "confianza": "confirmado"
      },
      {
        "id": "c4",
        "objecion": "«Las vacaciones fiscales de uno o dos años pueden incentivar la creación artificial de sociedades»",
        "realidad": "Esa formulación no aparece en el texto localizado. La evaluación preliminar la atribuye al documento y construye sobre ella una recomendación alternativa.",
        "queda_en_pie": "Debe verificarse contra página exacta o eliminarse antes de circular la crítica.",
        "confianza": "reportado"
      }
    ]
  },
  "demografia": {
    "titulo": "La restricción que cambió de naturaleza",
    "intro": "La ONEI presentó los datos de 2025 el 21 de julio de 2026: un día después de la fecha de cierre de la propuesta. El documento no pudo incorporarlos. Cambian uno de sus nueve criterios de priorización.",
    "fuente": "ONEI, Indicadores Demográficos de Cuba y sus Territorios 2025",
    "confianza": "reportado",
    "salidas_dia": 672,
    "indicadores": [
      {
        "id": "poblacion",
        "etiqueta": "Población efectiva 2025",
        "valor": 9434593,
        "unidad": "hab.",
        "formato": "entero"
      },
      {
        "id": "variacion",
        "etiqueta": "Variación respecto a 2024",
        "valor": -313414,
        "unidad": "hab.",
        "formato": "entero"
      },
      {
        "id": "migratorio",
        "etiqueta": "Saldo migratorio externo",
        "valor": -245264,
        "unidad": "hab.",
        "formato": "entero"
      },
      {
        "id": "nacimientos",
        "etiqueta": "Nacimientos",
        "valor": 68064,
        "unidad": "",
        "formato": "entero"
      },
      {
        "id": "defunciones",
        "etiqueta": "Defunciones",
        "valor": 136214,
        "unidad": "",
        "formato": "entero"
      },
      {
        "id": "laboral",
        "etiqueta": "Población en edad laboral (17–64)",
        "valor": 5606541,
        "unidad": "hab.",
        "formato": "entero"
      },
      {
        "id": "perdida_laboral",
        "etiqueta": "Pérdida de población laboral en 5 años",
        "valor": -1259894,
        "unidad": "hab.",
        "formato": "entero"
      },
      {
        "id": "fecundidad",
        "etiqueta": "Fecundidad global (reemplazo: 2,1)",
        "valor": 1.29,
        "unidad": "hijos/mujer",
        "formato": "decimal"
      },
      {
        "id": "envejecimiento",
        "etiqueta": "Población de 60 años o más",
        "valor": 26.7,
        "unidad": "%",
        "formato": "decimal"
      },
      {
        "id": "mediana",
        "etiqueta": "Edad mediana",
        "valor": 45,
        "unidad": "años",
        "formato": "entero"
      }
    ],
    "serie_poblacion": [
      {
        "anio": 2020,
        "valor": 11181595,
        "confianza": "reportado"
      },
      {
        "anio": 2021,
        "valor": 11113215,
        "confianza": "reportado"
      },
      {
        "anio": 2022,
        "valor": 11089511,
        "confianza": "reportado"
      },
      {
        "anio": 2023,
        "valor": 10055968,
        "confianza": "reportado"
      },
      {
        "anio": 2024,
        "valor": 9748007,
        "confianza": "reportado"
      },
      {
        "anio": 2025,
        "valor": 9434593,
        "confianza": "reportado"
      }
    ],
    "argumento": {
      "criterio_documento": "Compatibilidad con las restricciones demográficas y de capacidades humanas.",
      "conclusion_documento": "Priorizar turismo y agricultura antes que manufactura compleja o servicios especializados.",
      "objecion": "Turismo y agricultura son los dos sectores más intensivos en trabajo poco calificado de la economía cubana. Con la fuerza laboral cayendo un 18,3 % en cinco años, la restricción demográfica no favorece a los sectores intensivos en mano de obra: los penaliza más que a ningún otro.",
      "conclusion_correcta": "Aplicado correctamente, el criterio lleva a priorizar productividad por trabajador, no ocupación: servicios exportables digitales, agroprocesamiento mecanizado, energía distribuida y mantenimiento industrial."
    }
  },
  "denominador": {
    "titulo": "El efecto denominador",
    "intro": "Si la población cae y el numerador no varía, todo indicador per cápita mejora solo. Un programa evaluado con métricas per cápita registrará éxito mientras la gente se va.",
    "poblacion_anexo": 10.08,
    "poblacion_min": 8,
    "poblacion_max": 11.2,
    "magnitudes": [
      {
        "id": "expo",
        "etiqueta": "Exportaciones de bienes y servicios per cápita",
        "valor_base": 864,
        "unidad": "USD"
      },
      {
        "id": "elec",
        "etiqueta": "Consumo eléctrico per cápita",
        "valor_base": 1384,
        "unidad": "kWh"
      },
      {
        "id": "acero",
        "etiqueta": "Consumo aparente de acero per cápita",
        "valor_base": 10,
        "unidad": "kg"
      },
      {
        "id": "cemento",
        "etiqueta": "Consumo de cemento per cápita",
        "valor_base": 69,
        "unidad": "kg"
      }
    ],
    "hitos": [
      {
        "id": "anexo",
        "etiqueta": "Anexo 1",
        "poblacion": 10.08
      },
      {
        "id": "onei24",
        "etiqueta": "ONEI 2024",
        "poblacion": 9.748
      },
      {
        "id": "onei25",
        "etiqueta": "ONEI 2025",
        "poblacion": 9.435
      }
    ],
    "recomendacion": "El marco de seguimiento debe fijar indicadores en niveles absolutos y en tasas por hogar residente, y publicar la serie de población empleada en cada corte."
  },
  "anexo1": {
    "titulo": "Auditoría aritmética del Anexo 1",
    "intro": "La tabla comparativa del documento es internamente inconsistente. El cálculo es directo y no requiere ninguna fuente externa.",
    "confianza": "confirmado",
    "vias": [
      {
        "id": "via_pib",
        "etiqueta": "Vía PIB",
        "operacion": "PIB nominal ÷ PIB per cápita",
        "numerador": 11437,
        "denominador": 1038,
        "unidad_num": "millones USD",
        "unidad_den": "USD/hab.",
        "poblacion_implicita": 11.018
      },
      {
        "id": "via_dens",
        "etiqueta": "Vía densidad",
        "operacion": "Densidad × superficie",
        "numerador": 91.7,
        "denominador": 109884,
        "unidad_num": "hab./km²",
        "unidad_den": "km²",
        "poblacion_implicita": 10.076
      }
    ],
    "poblacion_declarada": 10.08,
    "discrepancia_pct": 9.35,
    "discrepancia_personas": 942000,
    "diagnostico": "La población implícita de 11,02 millones corresponde aproximadamente a la serie ONEI anterior a la revisión; los 10,08 millones, a una serie posterior. El anexo mezcla dos añadas estadísticas.",
    "atenuante": "La nota al pie advierte que los indicadores per cápita implican estimados de población que varían entre organizaciones. Eso explica el fenómeno, pero no lo corrige: en una tabla presentada como comparación entre países, la magnitud del sesgo puede superar las diferencias que la tabla pretende mostrar.",
    "correccion": "Una sola convención de población, declarada, aplicada a todas las celdas de la columna Cuba, con nota de cuál se usa para los demás países."
  },
  "carencias": {
    "titulo": "Lo que falta, ordenado por coste de omisión",
    "items": [
      {
        "id": "k1",
        "carencia": "Cuadro macro consolidado año a año",
        "coste": "Sin él no puede saberse si las medidas son mutuamente financiables",
        "prioridad": "critica"
      },
      {
        "id": "k2",
        "carencia": "Necesidad total de divisas y su calendario",
        "coste": "Es la restricción binaria del programa entero",
        "prioridad": "critica"
      },
      {
        "id": "k3",
        "carencia": "Programa alternativo sin alivio de sanciones",
        "coste": "Si falla el supuesto 1, el país se queda sin plan",
        "prioridad": "critica"
      },
      {
        "id": "k4",
        "carencia": "Registro social o padrón de hogares",
        "coste": "Focalizar sin registro produce exclusión de los más pobres",
        "prioridad": "critica"
      },
      {
        "id": "k5",
        "carencia": "Microsimulación distributiva",
        "coste": "Sin ella no se sabe quién paga el ajuste",
        "prioridad": "alta"
      },
      {
        "id": "k6",
        "carencia": "Matriz de riesgos políticos",
        "coste": "GAESA y los perdedores con capacidad coercitiva",
        "prioridad": "alta"
      },
      {
        "id": "k7",
        "carencia": "Reglas de reversión de reformas",
        "coste": "Sin ellas, un error se convierte en trayectoria",
        "prioridad": "alta"
      },
      {
        "id": "k8",
        "carencia": "Metodología reproducible del Anexo 1",
        "coste": "Auditabilidad",
        "prioridad": "media"
      }
    ],
    "nota": "La expresión «registro social» no aparece en el documento. Esa ausencia es especialmente costosa porque el propio texto reconoce que en 2026 el Gobierno anunció la sustitución del subsidio universal por un esquema focalizado."
  },
  "contrafactuales": [
    {
      "id": "cf0",
      "codigo": "CF-0",
      "titulo": "Los cuatro supuestos no son independientes",
      "supuesto": "El documento enumera cuatro condiciones —negociación con EE. UU., nueva inserción internacional, financiamiento de emergencia, apertura política interna— y las trata como una lista.",
      "mecanismo": "No son cuatro sucesos independientes: están fuertemente correlacionados en ambos sentidos. La negociación probablemente requiere apertura interna; el financiamiento multilateral requiere la negociación. Un programa cuyo escenario central es la conjunción de cuatro eventos correlacionados no tiene escenario base: tiene el mejor de los escenarios descrito como si fuera el promedio.",
      "referente": "Las transiciones negociadas de España, Chile y Brasil tardaron entre 15 y 25 años en consolidarse, y ninguna exigió las cuatro condiciones simultáneamente en el año uno.",
      "plausibilidad": "no cuantificada por los autores",
      "plausibilidad_nivel": 3,
      "falsacion": "Que los autores publiquen probabilidades subjetivas por supuesto y un programa que funcione en el complemento. Si la probabilidad conjunta resulta alta, esta objeción cae."
    },
    {
      "id": "cf1",
      "codigo": "CF-1",
      "titulo": "Reformas internas sin alivio de sanciones",
      "supuesto": "Se aplican los seis bloques de la primera fase; el Título III de Helms-Burton sigue vigente; no hay acceso al FMI ni al Banco Mundial.",
      "mecanismo": "Caen simultáneamente cuatro fuentes de divisas: turismo estadounidense, banca corresponsal, financiamiento multilateral e inversión de gran escala. Sobrevive lo que no pasa por el sistema financiero estadounidense: remesas, inversión familiar de la diáspora, agricultura, servicios digitales exportables y solar distribuida.",
      "referente": "Durante 2026 la suspensión de envíos de combustible venezolano, la amenaza arancelaria a proveedores de hidrocarburos y las sanciones a entidades vinculadas a GAESA forzaron la suspensión de operaciones de importantes empresas extranjeras con vínculos de larga data. El escenario adverso ya ocurrió una vez, dentro del período que el propio documento describe.",
      "plausibilidad": "alta",
      "plausibilidad_nivel": 4,
      "falsacion": "Suspensión efectiva del Título III y restablecimiento de al menos una relación de banca corresponsal con capacidad de compensación en dólares."
    },
    {
      "id": "cf2",
      "codigo": "CF-2",
      "titulo": "Venta del 50 % de las tierras UBPC sin catastro",
      "supuesto": "Se ejecuta la medida tal como está escrita: incorporación al mercado del 50 % de 1,4 millones de hectáreas durante el segundo año, sin catastro actualizado, sin registro de beneficiario real, sin tribunales agrarios y sin valoración independiente del suelo.",
      "mecanismo": "En un mercado con información asimétrica extrema, quien tiene liquidez en divisas y acceso a información registral compra barato a quien necesita liquidez inmediata. El tope de 402 hectáreas no impide la concentración si no hay registro de beneficiario final: solo obliga a fragmentar la titularidad nominal.",
      "referente": "La privatización masiva en economías de transición con instituciones débiles produjo saqueo de activos y coaliciones contrarias al Estado de Derecho. El propio documento lo advierte, y aun así calendariza la venta agraria en el año dos.",
      "plausibilidad": "alta, condicionada a que se ejecute el calendario",
      "plausibilidad_nivel": 4,
      "falsacion": "Catastro nacional cerrado y registro de beneficiario real operativo antes de la primera transacción."
    },
    {
      "id": "cf3",
      "codigo": "CF-3",
      "titulo": "Liberar precios y tipo de cambio sin transferencia operativa",
      "supuesto": "Se ejecutan las medidas 3.1, 3.3 y 4 antes de que exista un mecanismo verificable de pago de transferencias.",
      "mecanismo": "El tipo de cambio informal pasó de ≈40 a ≈670 CUP/USD entre enero de 2021 y mediados de 2026, con inflación promedio del 31,8 % en 2022-2024 frente a 5,6 % regional. Liberar precios en mercados con escasez física, concentración de importadores y acceso desigual a divisas convierte un precio administrado en un precio oligopólico, no competitivo. Los hogares sin remesas absorben el ajuste completo.",
      "referente": "Chile 1975: apertura y liberalización aceleradas produjeron una caída del PIB del 13 % y un desplome industrial del 27 %, con inflación del 375 % en 1974.",
      "plausibilidad": "alta",
      "plausibilidad_nivel": 4,
      "falsacion": "Un sistema de pago que acredite transferencias a un porcentaje verificable de hogares objetivo durante tres meses consecutivos, con error de exclusión publicado."
    },
    {
      "id": "cf4",
      "codigo": "CF-4",
      "titulo": "Fragmentar GAESA como reforma administrativa",
      "supuesto": "Se ejecuta la medida 13 mediante decisión administrativa.",
      "mecanismo": "GAESA concentra a la vez poder económico, estructura militar, redes de lealtad, acceso a divisas y capacidad de veto. Entre el anuncio y la ejecución hay una ventana en la que el sujeto de la reforma controla los activos, los registros y la fuerza. Las respuestas disponibles en esa ventana son ocultamiento, transferencia acelerada a interpuestos, destrucción documental o resistencia.",
      "referente": "Georgia 2004: el volteo de una norma predatoria funcionó porque precedió a la negociación con los afectados, pero se hizo desde un Estado que ya controlaba el aparato coercitivo. En el escenario del documento, Cuba no lo controla.",
      "plausibilidad": "baja en la versión benigna",
      "plausibilidad_nivel": 2,
      "falsacion": "Congelación verificable de transferencias extraordinarias de activos y declaración patrimonial de la cúpula, ambas antes de cualquier anuncio de fragmentación."
    },
    {
      "id": "cf5",
      "codigo": "CF-5",
      "titulo": "La transición ocurre con la demografía de 2030",
      "supuesto": "Se aplica el programa completo y funciona; el país recupera crecimiento hacia el año tres.",
      "mecanismo": "A −245 000 personas netas al año y con fecundidad de 1,29, la recuperación llega a un país con menos trabajadores, más pensionistas y una razón de dependencia estructuralmente peor. Un programa que promete pensiones y salarios reales crecientes compromete obligaciones permanentes sobre una base contributiva menguante.",
      "referente": "Ningún caso comparado emprendió su transformación con esta dinámica: Corea y Singapur la hicieron con bono demográfico; Costa Rica y Chile con estructuras jóvenes.",
      "plausibilidad": "alta en el mecanismo, indeterminada en la magnitud",
      "plausibilidad_nivel": 4,
      "falsacion": "Saldo migratorio neto próximo a cero durante cuatro trimestres consecutivos. Sería, además, el mejor indicador único de éxito del programa completo."
    }
  ],
  "comparacion": {
    "advertencia": "Comparar Cuba con Singapur, Corea, Costa Rica y Chile es seleccionar sobre la variable dependiente: se eligen cuatro éxitos y se pregunta qué hicieron. Ese diseño produjo tanto la literatura del «milagro asiático» como la del Consenso de Washington, y ambas fallaron fuera de muestra porque ninguna incluyó el denominador: cuántos países aplicaron políticas parecidas y no lo lograron.",
    "reglas": [
      "Ninguno de los cuatro es un control válido para Cuba. No hay tendencias paralelas verificables; cualquier estimación de tipo diferencias-en-diferencias sobre estos pares sería indefendible.",
      "Singapur es un referente de frontera, no un caso comparable. Ciudad-Estado de 700 km² y menos de dos millones de habitantes en 1965, sin agricultura ni interior. Muestra hasta dónde puede llegar la calidad institucional; no cómo llegar desde Cuba.",
      "Un patrón fuerte entre los cuatro casos no eleva la confianza en ninguna medida concreta del documento cubano. No hay regla de fusión entre el nivel patrón y el nivel caso."
    ],
    "casos": [
      {
        "id": "chile",
        "nombre": "Chile",
        "periodo": "1973 – 2022",
        "es_caso_de": "Éxito posterior a 1990, en democracia y con más impuestos",
        "no_es_caso_de": "Terapia de choque exitosa",
        "titular": "El caso que suele citarse al revés",
        "narrativa": "Quien invoca a Chile para justificar liberalización rápida está citando exactamente la década que fracasó. La reducción de pobreza no la produjo la liberalización: la produjo el crecimiento sostenido más un aumento deliberado de impuestos en democracia.",
        "fases": [
          {
            "id": "chile_a",
            "etiqueta": "Fase autoritaria radical",
            "rango": "1973–1983",
            "signo": "negativo",
            "hitos": [
              {
                "etiqueta": "Inflación 1974",
                "valor": 375,
                "unidad": "%",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Caída del PIB 1975",
                "valor": -13,
                "unidad": "%",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Caída de la producción industrial 1975",
                "valor": -27,
                "unidad": "%",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Caída del PIB 1982",
                "valor": -14.3,
                "unidad": "%",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Desempleo 1982",
                "valor": 23.7,
                "unidad": "%",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Desempleo 1983 (serie Meller)",
                "valor": 31.3,
                "unidad": "%",
                "confianza": "reportado"
              }
            ],
            "cierre": "El Estado tuvo que intervenir más de cinco bancos y renacionalizar el sistema financiero que acababa de privatizar."
          },
          {
            "id": "chile_b",
            "etiqueta": "Fase democrática",
            "rango": "1990–2022",
            "signo": "positivo",
            "hitos": [
              {
                "etiqueta": "Pobreza por ingresos 1990",
                "valor": 38.6,
                "unidad": "%",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Pobreza por ingresos 2022",
                "valor": 6.5,
                "unidad": "%",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Indigencia 1990 → 2013",
                "valor": 2.5,
                "unidad": "% (desde 13,0 %)",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Gasto social 1990 → 2009",
                "valor": 17,
                "unidad": "% del PIB (desde 12 %)",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Crecimiento medio 1990-2003",
                "valor": 5.5,
                "unidad": "% anual",
                "confianza": "reportado"
              },
              {
                "etiqueta": "IED 1990 → 1997",
                "valor": 8092,
                "unidad": "M USD (desde 1 460)",
                "confianza": "reportado"
              }
            ],
            "cierre": "En 1990 se aprobó una reforma tributaria que revirtió las rebajas de los ochenta; con ella se financió el gasto social, que casi se cuadruplicó entre 1990 y 2009."
          }
        ],
        "leccion": "La propuesta cubana no contiene una reforma tributaria progresiva de esa naturaleza: contiene reducciones tributarias puntuales (medida 2.1) y financiación parcial vía venta de activos (medida 2.3). Es el punto exacto donde la analogía chilena, bien leída, contradice al documento.",
        "advertencias": [
          "El crecimiento chileno se apoyó en el cobre y en una posición externa que Cuba no tiene.",
          "La desigualdad se mantuvo alta pese a la caída de la pobreza.",
          "El estallido de 2019 sugiere pasivos de legitimidad no capturados por la línea de pobreza."
        ]
      },
      {
        "id": "corea",
        "nombre": "Corea del Sur",
        "periodo": "1948 – 1998",
        "es_caso_de": "Estado desarrollista con reciprocidad exportadora; luego democratización (1987); luego reestructuración de crisis (1997)",
        "no_es_caso_de": "Liberalización temprana ni apertura financiera prudente",
        "titular": "La reciprocidad, no la protección",
        "narrativa": "El subsidio coreano se condicionaba a desempeño exportador verificable y se retiraba ante el incumplimiento. Sin esa reciprocidad, la protección se convierte en renta permanente.",
        "fases": [
          {
            "id": "corea_a",
            "etiqueta": "Estado desarrollista",
            "rango": "1948–1996",
            "signo": "positivo",
            "hitos": [
              {
                "etiqueta": "Reforma agraria radical, previa a la industrialización",
                "valor": 1950,
                "unidad": "año",
                "confianza": "confirmado"
              },
              {
                "etiqueta": "Sustitución de importaciones antes de promoción exportadora",
                "valor": 25,
                "unidad": "años",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Ingreso por habitante a inicios de los sesenta",
                "valor": 100,
                "unidad": "USD (≈3 % del de EE. UU.)",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Ingreso por habitante en 1998",
                "valor": 22,
                "unidad": "% del de EE. UU.",
                "confianza": "reportado"
              }
            ],
            "cierre": "Control estatal de la banca, del tipo de cambio y de los movimientos de capital. Lo contrario de una apertura temprana de la cuenta financiera."
          },
          {
            "id": "corea_b",
            "etiqueta": "Crisis de 1997",
            "rango": "1997–1999",
            "signo": "negativo",
            "hitos": [
              {
                "etiqueta": "Rescate del FMI",
                "valor": 58000,
                "unidad": "M USD",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Quiebra de conglomerados (Daewoo entre otros)",
                "valor": 1,
                "unidad": "caso emblemático",
                "confianza": "reportado"
              }
            ],
            "cierre": "El endeudamiento de los chaebol combinado con apertura financiera acelerada produjo salida masiva de capitales, desplome del won, despidos masivos y fin del empleo vitalicio."
          }
        ],
        "leccion": "Corea abrió comercio antes que capital, y aun así se equivocó al abrir capital demasiado rápido. El documento cubano propone subir tipos de interés (medida 3.4) sin haber auditado los balances bancarios: es el mismo orden invertido.",
        "advertencias": [
          "Bono demográfico ausente en la Cuba de 2026.",
          "Respaldo geopolítico de un aliado dispuesto a tolerar lo que prohibía a otros países.",
          "Burocracia meritocrática construida durante décadas."
        ]
      },
      {
        "id": "costarica",
        "nombre": "Costa Rica",
        "periodo": "1980 – 2000",
        "es_caso_de": "Diversificación productiva preservando universalismo social, en democracia continua",
        "no_es_caso_de": "Transformación rápida",
        "titular": "El análogo estructural más cercano",
        "narrativa": "Economía pequeña, alta densidad de logro social previo, sin ejército desde 1948, base turística y dependencia de mercados concentrados. Es el caso con más poder explicativo para Cuba, y el documento lo menciona solo dos veces.",
        "fases": [
          {
            "id": "cr_a",
            "etiqueta": "Crisis",
            "rango": "1980–1982",
            "signo": "negativo",
            "hitos": [
              {
                "etiqueta": "Caída del PIB 1980-1982",
                "valor": -9.2,
                "unidad": "%",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Desempleo",
                "valor": 9.4,
                "unidad": "% (desde 4,8 %)",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Inflación acumulada",
                "valor": 207,
                "unidad": "%",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Caída del salario real",
                "valor": -30,
                "unidad": "%",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Tipo de cambio (₡ por USD)",
                "valor": 65,
                "unidad": "₡ (desde 8)",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Canasta básica sobre salario promedio",
                "valor": 86,
                "unidad": "% (desde 60 %)",
                "confianza": "reportado"
              }
            ],
            "cierre": "Deuda pública de 2 900 M USD en 1981 y moratoria declarada."
          },
          {
            "id": "cr_b",
            "etiqueta": "Ajuste y promoción de exportaciones",
            "rango": "1985–2000",
            "signo": "positivo",
            "hitos": [
              {
                "etiqueta": "Programas de Ajuste Estructural escalonados",
                "valor": 3,
                "unidad": "PAE I, II y III",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Horizonte real de la transformación",
                "valor": 15,
                "unidad": "años",
                "confianza": "reportado"
              }
            ],
            "cierre": "Minidevaluaciones en vez de un salto único, y mantenimiento de la arquitectura universal de salud y educación mientras cambiaba la base productiva."
          }
        ],
        "leccion": "Cuba está en posición peor que la Costa Rica de 1982 en depreciación y en duración de la contracción. Y Costa Rica no apostó por profundizar en café y banano porque ya tenía plantaciones: construyó una oferta nueva. Tener capacidad hotelera ociosa es una razón para usarla, no para especializarse en ella.",
        "advertencias": [
          "El horizonte real fue de quince años, no de tres.",
          "El universalismo no se desmontó: se preservó como ancla de legitimidad mientras todo lo demás cambiaba.",
          "La diversificación llegó por atracción de IED con capacidades previas, no por explotar capacidad instalada."
        ]
      },
      {
        "id": "singapur",
        "nombre": "Singapur",
        "periodo": "1965 – 2024",
        "es_caso_de": "Construcción de calidad institucional y atracción de IED bajo hegemonía de partido",
        "no_es_caso_de": "Democratización, ni economía con agricultura o territorio",
        "titular": "Referente de frontera, no modelo",
        "narrativa": "Muestra hasta dónde puede llegar la calidad institucional. No muestra cómo llegar desde Cuba. Es N = 1, y la lista de países que intentaron capitalismo autoritario y obtuvieron captura en lugar de desarrollo es larga.",
        "fases": [
          {
            "id": "sg_a",
            "etiqueta": "Punto de partida",
            "rango": "1965",
            "signo": "negativo",
            "hitos": [
              {
                "etiqueta": "PIB per cápita nominal",
                "valor": 500,
                "unidad": "USD (nivel de México y Sudáfrica)",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Desempleo",
                "valor": 9,
                "unidad": "%",
                "confianza": "reportado"
              },
              {
                "etiqueta": "Superficie",
                "valor": 700,
                "unidad": "km²",
                "confianza": "confirmado"
              }
            ],
            "cierre": "Sin recursos naturales, sin interior y con el agua importada por acuerdo con Johor."
          },
          {
            "id": "sg_b",
            "etiqueta": "Frontera actual",
            "rango": "2024",
            "signo": "positivo",
            "hitos": [
              {
                "etiqueta": "PIB per cápita nominal",
                "valor": 67707,
                "unidad": "USD",
                "confianza": "reportado"
              },
              {
                "etiqueta": "PIB per cápita en PPA",
                "valor": 132570,
                "unidad": "USD",
                "confianza": "reportado"
              }
            ],
            "cierre": "El único mecanismo directamente transferible es institucional: profesionalizar la gestión de las empresas estatales antes de expandirlas o venderlas."
          }
        ],
        "leccion": "La propuesta cubana de un fondo nacional de activos públicos gestionado profesionalmente es exactamente el mecanismo Temasek. Es el punto donde la comparación internacional apoya al documento en lugar de cuestionarlo.",
        "advertencias": [
          "Ciudad-Estado sin agricultura ni interior; Cuba tiene 109 884 km² y un sector agropecuario.",
          "Salarios públicos altos como antídoto anticorrupción requieren una base fiscal capaz de pagarlos.",
          "No debe transferirse la conclusión de que el autoritarismo eficaz es un atajo."
        ]
      }
    ],
    "mecanismos": [
      {
        "id": "m1",
        "mecanismo": "Reforma agraria con tope verificado",
        "caso": "corea",
        "condicion": "Registro de beneficiario real",
        "estado": "ausente",
        "veredicto": "El tope de 402 ha es evadible"
      },
      {
        "id": "m2",
        "mecanismo": "Reciprocidad: subsidio a cambio de desempeño",
        "caso": "corea",
        "condicion": "Métrica exportadora auditada y capacidad de retirada",
        "estado": "ausente",
        "veredicto": "Los aranceles se convertirán en renta"
      },
      {
        "id": "m3",
        "mecanismo": "Gobernanza corporativa antes de privatizar",
        "caso": "singapur",
        "condicion": "Cuadros profesionales y auditoría",
        "estado": "presente",
        "veredicto": "Acierto del documento"
      },
      {
        "id": "m4",
        "mecanismo": "Universalismo preservado durante el ajuste",
        "caso": "costarica",
        "condicion": "Base fiscal y padrón de hogares",
        "estado": "ausente",
        "veredicto": "Riesgo alto de exclusión"
      },
      {
        "id": "m5",
        "mecanismo": "Diversificación por capacidades nuevas",
        "caso": "costarica",
        "condicion": "IED con encadenamientos",
        "estado": "parcial",
        "veredicto": "Depende íntegramente del supuesto 1"
      },
      {
        "id": "m6",
        "mecanismo": "Impuestos al alza en democracia para financiar lo social",
        "caso": "chile",
        "condicion": "Legitimidad democrática",
        "estado": "ausente",
        "veredicto": "Contradice la medida 2.1"
      },
      {
        "id": "m7",
        "mecanismo": "Apertura financiera al final de la secuencia",
        "caso": "corea",
        "condicion": "Banca auditada y recapitalizada",
        "estado": "ausente",
        "veredicto": "Contradice la medida 3.4"
      },
      {
        "id": "m8",
        "mecanismo": "Ajuste cambiario gradual",
        "caso": "costarica",
        "condicion": "Reservas mínimas",
        "estado": "ausente",
        "veredicto": "Refuerza la crítica a la unificación"
      }
    ]
  },
  "regla_unica": {
    "titulo": "La regla que emerge de los cuatro casos",
    "enunciado": "En los cuatro casos, la construcción de la capacidad de verificación precedió a la liberalización del mecanismo correspondiente. Los dos que se saltaron ese orden en algún momento —Chile con la banca en 1982, Corea con la cuenta de capital en 1997— pagaron una crisis por ello.",
    "inversiones": [
      {
        "id": "i1",
        "medida": "Mercado de tierras UBPC",
        "referencia": "Medida 8.2 · año 2",
        "orden_propuesto": [
          "Abrir el mercado",
          "Construir catastro"
        ],
        "orden_evidencia": [
          "Catastro y registro de beneficiario real",
          "Abrir el mercado"
        ],
        "riesgo": "Concentración encubierta mediante testaferros"
      },
      {
        "id": "i2",
        "medida": "Liberalización de precios",
        "referencia": "Medidas 3.1 y 3.3",
        "orden_propuesto": [
          "Liberar precios",
          "Montar transferencias"
        ],
        "orden_evidencia": [
          "Transferencia operativa verificada",
          "Liberar precios por grupos"
        ],
        "riesgo": "Precio oligopólico y ajuste íntegro sobre hogares sin remesas"
      },
      {
        "id": "i3",
        "medida": "Tipos de interés",
        "referencia": "Medida 3.4",
        "orden_propuesto": [
          "Subir tipos",
          "Auditar la banca"
        ],
        "orden_evidencia": [
          "Auditoría y recapitalización bancaria",
          "Subir tipos"
        ],
        "riesgo": "Morosidad, asfixia del capital circulante y quiebra de empresas ya insolventes"
      },
      {
        "id": "i4",
        "medida": "Fragmentación de GAESA",
        "referencia": "Medida 13",
        "orden_propuesto": [
          "Anunciar la fragmentación",
          "Auditar activos"
        ],
        "orden_evidencia": [
          "Congelar transferencias y declarar patrimonio",
          "Anunciar la fragmentación"
        ],
        "riesgo": "Ocultamiento, transferencia a interpuestos y destrucción documental"
      }
    ]
  },
  "valoracion": {
    "titulo": "Valoración revisada",
    "aviso": "Juicio analítico, no medición objetiva.",
    "dimensiones": [
      {
        "id": "v1",
        "dimension": "Diagnóstico estructural",
        "preliminar": 8.5,
        "revisada": 8.5,
        "motivo": "Se sostiene"
      },
      {
        "id": "v2",
        "dimension": "Modelo normativo propuesto",
        "preliminar": 8,
        "revisada": 8,
        "motivo": "Se sostiene"
      },
      {
        "id": "v3",
        "dimension": "Priorización sectorial",
        "preliminar": 7,
        "revisada": 5,
        "motivo": "El criterio demográfico, correctamente aplicado, contradice la elección de turismo y agricultura"
      },
      {
        "id": "v4",
        "dimension": "Protección social",
        "preliminar": 6.5,
        "revisada": 5.5,
        "motivo": "Ausencia total de registro social; focalización sin infraestructura"
      },
      {
        "id": "v5",
        "dimension": "Secuencia económica",
        "preliminar": 5.5,
        "revisada": 5,
        "motivo": "Cuatro inversiones del orden verificación → liberalización"
      },
      {
        "id": "v6",
        "dimension": "Reproducibilidad de los datos",
        "preliminar": 4.5,
        "revisada": 4,
        "motivo": "Inconsistencia aritmética del Anexo 1 confirmada al 9,35 %"
      },
      {
        "id": "v7",
        "dimension": "Cuantificación macroeconómica",
        "preliminar": 3,
        "revisada": 3,
        "motivo": "Se sostiene"
      },
      {
        "id": "v8",
        "dimension": "Viabilidad política",
        "preliminar": 3,
        "revisada": 2.5,
        "motivo": "Los cuatro supuestos están correlacionados y no se declara probabilidad conjunta"
      },
      {
        "id": "v9",
        "dimension": "Robustez ante escenarios adversos",
        "preliminar": 3.5,
        "revisada": 3,
        "motivo": "El escenario adverso ya ocurrió en 2026 y el documento no lo incorpora"
      },
      {
        "id": "v10",
        "dimension": "Adecuación cultural e histórica",
        "preliminar": 6.5,
        "revisada": 7,
        "motivo": "La protección de propietarios actuales está mejor resuelta de lo que reconocía la evaluación preliminar"
      }
    ],
    "globales": [
      {
        "id": "g1",
        "etiqueta": "Como marco para debatir la transición",
        "preliminar": 7,
        "revisada": 7
      },
      {
        "id": "g2",
        "etiqueta": "Como programa inmediatamente ejecutable",
        "preliminar": 4,
        "revisada": 3.5
      }
    ]
  },
  "exigencias": [
    {
      "id": "e1",
      "numero": 1,
      "titulo": "Publicar el cuadro macro consolidado",
      "detalle": "Año a año, con necesidad total de divisas y su calendario. Sin esto no puede saberse si el programa es autoconsistente."
    },
    {
      "id": "e2",
      "numero": 2,
      "titulo": "Publicar un programa B sin alivio de sanciones",
      "detalle": "Y declarar la probabilidad subjetiva conjunta de los cuatro supuestos. Dado CF-1, el programa B es probablemente el principal."
    },
    {
      "id": "e3",
      "numero": 3,
      "titulo": "Anteponer verificación a liberalización",
      "detalle": "Catastro y beneficiario real antes del mercado de tierras; transferencia operativa antes de liberar precios; auditoría bancaria antes de subir tipos; control de activos antes de anunciar la fragmentación de GAESA."
    },
    {
      "id": "e4",
      "numero": 4,
      "titulo": "Construir el registro social antes de focalizar",
      "detalle": "Con error de exclusión medido y publicado, sobre un piso universal mínimo previo."
    },
    {
      "id": "e5",
      "numero": 5,
      "titulo": "Corregir el Anexo 1",
      "detalle": "Una sola convención de población declarada, fuente por celda, año efectivo por observación, y niveles absolutos allí donde el denominador se contrae."
    }
  ],
  "cierre": {
    "parrafos": [
      "La comparación con Singapur, Corea, Costa Rica y Chile no ofrece el aval que suele buscarse en esos nombres. Ofrece una regla incómoda: los cuatro construyeron capacidad de verificación antes de liberalizar el mecanismo correspondiente, y los dos que se saltaron ese orden pagaron una crisis por ello.",
      "La propuesta cubana invierte ese orden en cuatro medidas, y lo hace sobre una base demográfica que ningún caso comparado tuvo: una fuerza laboral que perdió el 18,3 % en cinco años.",
      "La corrección no es abandonar el programa. Es reordenarlo: rápido en derechos, transparencia, competencia y capacidad de verificar; deliberadamente lento en ventas de activos, mercado de tierras y retirada de protección; y diseñado desde el principio para funcionar en el escenario en el que Washington no coopera."
    ],
    "remate": "Nada de esto es un argumento contra la propuesta. Es el argumento a favor de que exista una versión 2. Un programa que se deja auditar es lo contrario de un régimen que no se deja contar."
  },
  "formulas": [
    {
      "id": "f1",
      "titulo": "Población implícita",
      "lectura": "Toda tabla que publique un agregado y su valor per cápita está publicando también, de manera implícita, una población. Si dos celdas de la misma tabla implican poblaciones distintas, la tabla es inconsistente sin necesidad de acudir a ninguna fuente externa.",
      "mathml": "<math display=\"block\" xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mover><mi>N</mi><mo>^</mo></mover><mo>=</mo><mfrac><mi>Y</mi><mrow><mi>y</mi></mrow></mfrac><mo>,</mo><mspace width=\"1.4em\"/><mtext>con</mtext><mspace width=\"0.6em\"/><mi>Y</mi><mo>=</mo><mtext>agregado</mtext><mo>,</mo><mspace width=\"0.6em\"/><mi>y</mi><mo>=</mo><mtext>valor per cápita</mtext></mrow></math>",
      "variables": [
        {
          "simbolo": "N̂",
          "nombre": "Población implícita en la tabla"
        },
        {
          "simbolo": "Y",
          "nombre": "Magnitud agregada publicada"
        },
        {
          "simbolo": "y",
          "nombre": "Magnitud per cápita publicada"
        }
      ]
    },
    {
      "id": "f2",
      "titulo": "Efecto denominador",
      "lectura": "La variación relativa de cualquier indicador per cápita es exactamente el inverso de la variación relativa de la población, cuando el numerador no cambia. Una caída poblacional del 6,4 % produce una mejora automática del 6,8 % en todos los indicadores per cápita, sin que mejore absolutamente nada.",
      "mathml": "<math display=\"block\" xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>y</mi><mo>=</mo><mfrac><mi>X</mi><mi>N</mi></mfrac><mspace width=\"2em\"/><mo>⟹</mo><mspace width=\"2em\"/><mfrac><mrow><mi>Δ</mi><mi>y</mi></mrow><mi>y</mi></mfrac><mo>=</mo><mfrac><mrow><mo>−</mo><mi>Δ</mi><mi>N</mi><mo>/</mo><mi>N</mi></mrow><mrow><mn>1</mn><mo>+</mo><mi>Δ</mi><mi>N</mi><mo>/</mo><mi>N</mi></mrow></mfrac></mrow></math>",
      "variables": [
        {
          "simbolo": "X",
          "nombre": "Magnitud agregada, constante"
        },
        {
          "simbolo": "N",
          "nombre": "Población residente"
        },
        {
          "simbolo": "y",
          "nombre": "Indicador per cápita"
        }
      ]
    },
    {
      "id": "f3",
      "titulo": "Función de bienestar ausente",
      "lectura": "Para afirmar que un conjunto de políticas es óptimo haría falta definir qué se maximiza y con qué pesos. El documento propone políticas plausibles, pero no declara ninguna función objetivo: por tanto no demuestra que sean las que maximizan el bienestar cubano, solo que son defendibles.",
      "mathml": "<math display=\"block\" xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>W</mi><mo>=</mo><munderover><mo>∑</mo><mrow><mi>t</mi><mo>=</mo><mn>0</mn></mrow><mi>T</mi></munderover><msup><mi>β</mi><mi>t</mi></msup><mrow><mo>[</mo><mrow><mi>Δ</mi><msubsup><mi>y</mi><mi>t</mi><mtext>real</mtext></msubsup><mo>−</mo><msub><mi>λ</mi><mi>p</mi></msub><msub><mi>P</mi><mi>t</mi></msub><mo>−</mo><msub><mi>λ</mi><mi>g</mi></msub><msub><mi>G</mi><mi>t</mi></msub><mo>−</mo><msub><mi>λ</mi><mi>e</mi></msub><msub><mi>E</mi><mi>t</mi></msub><mo>−</mo><msub><mi>λ</mi><mi>m</mi></msub><msub><mi>M</mi><mi>t</mi></msub></mrow><mo>]</mo></mrow></mrow></math>",
      "variables": [
        {
          "simbolo": "Δyᵗ",
          "nombre": "Variación del ingreso real"
        },
        {
          "simbolo": "Pₜ",
          "nombre": "Pobreza"
        },
        {
          "simbolo": "Gₜ",
          "nombre": "Desigualdad"
        },
        {
          "simbolo": "Eₜ",
          "nombre": "Apagones"
        },
        {
          "simbolo": "Mₜ",
          "nombre": "Emigración"
        },
        {
          "simbolo": "β",
          "nombre": "Factor de descuento intertemporal"
        }
      ]
    }
  ],
  "encuesta": {
    "titulo": "Tu lectura",
    "intro": "Tres preguntas. El voto es anónimo y se registra una sola vez por navegador.",
    "nota_privacidad": "No se recoge ningún dato personal. Solo se incrementa un contador agregado por opción.",
    "preguntas": [
      {
        "id": "p1",
        "texto": "De las cuatro inversiones del orden verificación → liberalización, ¿cuál te parece más peligrosa?",
        "opciones": [
          {
            "id": "o1",
            "texto": "Vender tierras UBPC sin catastro"
          },
          {
            "id": "o2",
            "texto": "Liberar precios sin transferencia operativa"
          },
          {
            "id": "o3",
            "texto": "Subir tipos sin auditar la banca"
          },
          {
            "id": "o4",
            "texto": "Anunciar la fragmentación de GAESA sin controlar sus activos"
          }
        ]
      },
      {
        "id": "p2",
        "texto": "¿Debería la propuesta publicar un programa alternativo que funcione sin alivio de las sanciones?",
        "opciones": [
          {
            "id": "o1",
            "texto": "Sí, y debería ser el programa principal"
          },
          {
            "id": "o2",
            "texto": "Sí, como anexo de contingencia"
          },
          {
            "id": "o3",
            "texto": "No: sin alivio no hay programa viable"
          }
        ]
      },
      {
        "id": "p3",
        "texto": "¿Qué caso internacional te parece más aplicable a Cuba?",
        "opciones": [
          {
            "id": "o1",
            "texto": "Costa Rica: diversificar preservando el universalismo"
          },
          {
            "id": "o2",
            "texto": "Corea: reciprocidad y apertura financiera al final"
          },
          {
            "id": "o3",
            "texto": "Chile posterior a 1990: crecer y subir impuestos en democracia"
          },
          {
            "id": "o4",
            "texto": "Ninguno: Cuba necesita una secuencia propia"
          }
        ]
      }
    ]
  },
  "fuentes": [
    {
      "id": "doc",
      "cita": "De Miranda Parrondo, M.; Monreal González, P.; Pérez Villanueva, O. E.; Torres Pérez, R.; Vidal Alejandro, P. — Propuesta para transformar la economía cubana, Versión 1, 20 de julio de 2026, 118 pp. Incluye Anexo 1 (indicadores comparativos 2022-2024) y Anexo 2 (cronograma por semestres)."
    },
    {
      "id": "onei",
      "cita": "ONEI, Indicadores Demográficos de Cuba y sus Territorios 2025 (presentación en conferencia de prensa, 21 de julio de 2026)."
    },
    {
      "id": "eltoque",
      "cita": "elTOQUE, serie del tipo de cambio informal del peso cubano."
    },
    {
      "id": "torres",
      "cita": "Torres, R., Without Power, There Is No Country: Cuba's Electricity Generation Crisis (Cuba Study Group, 2026)."
    },
    {
      "id": "vidal",
      "cita": "Vidal, P., «Where the Cuban Economy Stands in Latin America: A New Measurement of Gross Domestic Product», Cuban Studies 49 (2020): 97–118."
    },
    {
      "id": "cepalcuba",
      "cita": "CEPAL, The Cuban Economy: Structural Reforms and Economic Performance in the 1990s (Santiago de Chile, 2001)."
    },
    {
      "id": "memoriachilena",
      "cita": "Memoria Chilena / Biblioteca Nacional de Chile, «Crisis económica 1982»."
    },
    {
      "id": "casen",
      "cita": "Encuestas CASEN 1990–2022, Ministerio de Desarrollo Social y Familia de Chile."
    },
    {
      "id": "arellano",
      "cita": "Arellano, J. P., Veinte años de políticas sociales y Políticas sociales para el crecimiento con equidad en Chile, 1990-2002 (CIEPLAN)."
    },
    {
      "id": "meller",
      "cita": "Meller, P., Pobreza y distribución del ingreso en Chile (década del 90)."
    },
    {
      "id": "rosales",
      "cita": "Rosales, O., «La experiencia económica de Corea del Sur: lecciones y desafíos», El Trimestre Económico."
    },
    {
      "id": "sakong",
      "cita": "SaKong, Il, La economía coreana: seis décadas de crecimiento y desarrollo."
    },
    {
      "id": "toussaint",
      "cita": "Toussaint, E., «Corea del Sur: el milagro desenmascarado»."
    },
    {
      "id": "cepalcr",
      "cita": "CEPAL, Reformas estructurales y política económica en Costa Rica."
    },
    {
      "id": "mas",
      "cita": "Monetary Authority of Singapore, intervención de Ravi Menon en el 50.º aniversario de la independencia (línea base de 1965)."
    }
  ]
};

/* ---------------------------------------------------------------- paleta ---
   Registrada en ops/design_log.json como "propuesta-economica-auditoria".
   Sin colisión con "reconstruccion-civica" (petróleo/ciruela/arcilla/salvia).
   Ámbar #C98A17 permanece RESERVADO en toda la plataforma para contrafactuales.
   -------------------------------------------------------------------------- */
const P = {
  fondo: "#0A0B0F",
  superficie: "#141720",
  superficieAlt: "#1C2029",
  borde: "#2A2F3C",
  bordeVivo: "#3D4455",
  tinta: "#F2F0EA",
  tintaTenue: "#98A2B3",
  tintaDebil: "#6B7585",
  bermellon: "#E8462C",
  cian: "#2FC2D6",
  violeta: "#8B7BE8",
  musgo: "#67AE7B",
  magenta: "#C765A8",
  ambar: "#C98A17"
};

const COLOR_CONFIANZA = { confirmado: P.cian, reportado: P.musgo, estimado: P.magenta };
const COLOR_ESTADO = { presente: P.musgo, parcial: P.violeta, ausente: P.bermellon };
const COLOR_PRIORIDAD = { critica: P.bermellon, alta: P.violeta, media: P.tintaTenue };
const COLOR_CASO = { chile: P.bermellon, corea: P.cian, costarica: P.musgo, singapur: P.violeta };

const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const TITULAR = "'Archivo Black', 'Arial Black', system-ui, sans-serif";

const nf = (dec) => new Intl.NumberFormat("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmt = (n, dec) => (n === null || n === undefined ? "—" : nf(dec === undefined ? 1 : dec).format(n));
const fmtEntero = (n) => (n === null || n === undefined ? "—" : new Intl.NumberFormat("es-ES").format(Math.round(n)));

/* ------------------------------------------------- almacenamiento seguro --- */

const memoria = {};
const almacen = {
  leer(clave) {
    try {
      const v = window.localStorage.getItem(clave);
      return v === null ? (memoria[clave] === undefined ? null : memoria[clave]) : v;
    } catch (e) {
      return memoria[clave] === undefined ? null : memoria[clave];
    }
  },
  escribir(clave, valor) {
    memoria[clave] = valor;
    try {
      window.localStorage.setItem(clave, valor);
    } catch (e) {
      /* modo memoria */
    }
  }
};

/* ------------------------------------------------------------ primitivas --- */

function Mate({ html, tono, tamano }) {
  return (
    <div
      style={{
        color: tono || P.cian,
        fontSize: tamano || "clamp(18px, 3vw, 27px)",
        padding: "10px 2px 14px",
        overflowX: "auto",
        lineHeight: 1.5
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function Confianza({ nivel, procedencia }) {
  if (!nivel) return null;
  const c = COLOR_CONFIANZA[nivel] || P.tintaTenue;
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 3, verticalAlign: "middle" }}>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: c,
          border: `1px solid ${c}`,
          borderRadius: 2,
          padding: "2px 7px",
          whiteSpace: "nowrap",
          alignSelf: "flex-start"
        }}
      >
        {nivel}
      </span>
      {procedencia ? (
        <span style={{ fontFamily: MONO, fontSize: 11, color: P.tintaTenue, lineHeight: 1.5 }}>
          Procedencia: {procedencia}
        </span>
      ) : null}
    </span>
  );
}

function Leyenda({ items, nota }) {
  return (
    <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${P.borde}` }}>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        {items.map((it) => (
          <span key={it.etiqueta} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: it.forma === "linea" ? 18 : 11,
                height: it.forma === "linea" ? 3 : 11,
                borderRadius: it.forma === "linea" ? 2 : 11,
                background: it.relleno === false ? "transparent" : it.color,
                border: `1.5px solid ${it.color}`,
                flexShrink: 0
              }}
            />
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: P.tintaTenue, lineHeight: 1.5 }}>{it.etiqueta}</span>
          </span>
        ))}
      </div>
      {nota ? (
        <div style={{ fontFamily: MONO, fontSize: 11, color: P.tintaDebil, marginTop: 9, lineHeight: 1.6 }}>{nota}</div>
      ) : null}
    </div>
  );
}

function Seccion({ id, numero, etapa, titulo, sumario, children }) {
  return (
    <section id={id} style={{ padding: "64px 0 8px", borderTop: `1px solid ${P.borde}`, scrollMarginTop: 78 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11.5,
            color: P.fondo,
            background: P.tintaTenue,
            padding: "2px 8px",
            borderRadius: 2,
            letterSpacing: "0.1em",
            fontWeight: 700
          }}
        >
          {String(numero).padStart(2, "0")}
        </span>
        {etapa ? (
          <span style={{ fontFamily: MONO, fontSize: 11, color: P.tintaDebil, letterSpacing: "0.16em", textTransform: "uppercase" }}>
            {etapa}
          </span>
        ) : null}
      </div>
      <h2
        style={{
          fontFamily: TITULAR,
          fontSize: "clamp(26px, 4.6vw, 46px)",
          lineHeight: 1.05,
          margin: "0 0 14px 0",
          color: P.tinta,
          letterSpacing: "-0.01em"
        }}
      >
        {titulo}
      </h2>
      {sumario ? (
        <p style={{ margin: "0 0 30px 0", maxWidth: 780, color: P.tintaTenue, fontSize: 16.5, lineHeight: 1.68 }}>
          {sumario}
        </p>
      ) : null}
      {children}
    </section>
  );
}

function Tarjeta({ children, acento, fondo, estilo }) {
  return (
    <div
      style={{
        background: fondo || P.superficie,
        border: `1px solid ${P.borde}`,
        borderLeft: `3px solid ${acento || P.borde}`,
        borderRadius: 3,
        padding: "20px 22px",
        ...(estilo || {})
      }}
    >
      {children}
    </div>
  );
}

function Rotulo({ children, color }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 10.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: color || P.tintaDebil,
        marginBottom: 10
      }}
    >
      {children}
    </div>
  );
}

function Nota({ children, tono }) {
  const c = tono === "alerta" ? P.bermellon : tono === "bien" ? P.musgo : P.tintaTenue;
  return (
    <p
      style={{
        fontFamily: MONO,
        fontSize: 13,
        lineHeight: 1.75,
        color: c,
        borderLeft: `2px solid ${c}`,
        paddingLeft: 14,
        margin: "22px 0 0 0",
        maxWidth: 800
      }}
    >
      {children}
    </p>
  );
}

function Boton({ children, onClick, activo, color, ancho }) {
  const c = color || P.cian;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: MONO,
        fontSize: 12.5,
        padding: "9px 14px",
        borderRadius: 2,
        cursor: "pointer",
        background: activo ? c : "transparent",
        color: activo ? P.fondo : c,
        border: `1px solid ${c}`,
        fontWeight: activo ? 700 : 400,
        width: ancho || "auto",
        textAlign: "left",
        lineHeight: 1.45,
        transition: "background 130ms, color 130ms"
      }}
    >
      {children}
    </button>
  );
}

function Deslizador({ etiqueta, valor, min, max, paso, color, onChange, formateado }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 14, marginBottom: 7 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: P.tintaTenue, lineHeight: 1.5 }}>{etiqueta}</span>
        <span style={{ fontFamily: TITULAR, fontSize: 18, color: color, whiteSpace: "nowrap" }}>{formateado}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer" }}
        aria-label={etiqueta}
      />
    </div>
  );
}

function AvisoSimulacion({ texto }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 11.5,
        letterSpacing: "0.04em",
        color: P.ambar,
        border: `1px dashed ${P.ambar}`,
        borderRadius: 2,
        padding: "9px 12px",
        marginBottom: 22,
        lineHeight: 1.65
      }}
    >
      ⚠ Simulación · no es dato. {texto}
    </div>
  );
}

/* ===================================================== embudo de lectura === */

const ETAPAS = [
  { id: "sec-marco", clave: "Contexto", titulo: "Qué se audita" },
  { id: "sec-aciertos", clave: "Mérito", titulo: "Lo que está bien" },
  { id: "sec-correcciones", clave: "Rigor", titulo: "Nos corregimos" },
  { id: "sec-demografia", clave: "Evidencia", titulo: "El dato nuevo" },
  { id: "sec-anexo", clave: "Aritmética", titulo: "La tabla no cuadra" },
  { id: "sec-contrafactuales", clave: "Riesgo", titulo: "Qué puede fallar" },
  { id: "sec-comparacion", clave: "Comparación", titulo: "Cuatro casos" },
  { id: "sec-regla", clave: "Conclusión", titulo: "La regla única" },
  { id: "sec-exigencias", clave: "Acción", titulo: "Cinco exigencias" }
];

function Embudo({ activa, onIr }) {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(10,11,15,0.94)",
        backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${P.borde}`,
        margin: "0 -22px",
        padding: "0 22px"
      }}
      aria-label="Progreso de lectura"
    >
      <div style={{ display: "flex", gap: 2, overflowX: "auto", padding: "10px 0 9px" }}>
        {ETAPAS.map((e, i) => {
          const on = i <= activa;
          const actual = i === activa;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onIr(e.id)}
              title={e.titulo}
              style={{
                flex: "1 0 auto",
                minWidth: 74,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0 4px",
                textAlign: "left"
              }}
            >
              <div
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: actual ? P.bermellon : on ? P.cian : P.borde,
                  marginBottom: 6,
                  transition: "background 200ms"
                }}
              />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: actual ? P.tinta : on ? P.tintaTenue : P.tintaDebil,
                  whiteSpace: "nowrap"
                }}
              >
                {e.clave}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ============================================== 1 · reloj demográfico ====== */

function RelojDemografico({ salidasDia }) {
  const [seg, setSeg] = useState(0);
  const inicio = useRef(Date.now());
  useEffect(() => {
    const t = setInterval(() => setSeg((Date.now() - inicio.current) / 1000), 1000);
    return () => clearInterval(t);
  }, []);
  const personas = (salidasDia / 86400) * seg;
  const minutos = Math.floor(seg / 60);
  const resto = Math.floor(seg % 60);
  return (
    <div
      style={{
        border: `1px solid ${P.bermellon}`,
        background: "rgba(232, 70, 44, 0.06)",
        borderRadius: 3,
        padding: "22px 24px"
      }}
    >
      <Rotulo color={P.bermellon}>Desde que abriste esta página</Rotulo>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <span style={{ fontFamily: TITULAR, fontSize: "clamp(46px, 11vw, 88px)", color: P.bermellon, lineHeight: 0.95 }}>
          {fmt(personas, 2)}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 14, color: P.tintaTenue, lineHeight: 1.5 }}>
          personas han salido de Cuba, en saldo neto
        </span>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 12, color: P.tintaDebil, marginTop: 14, lineHeight: 1.7 }}>
        Tiempo transcurrido: {minutos} min {String(resto).padStart(2, "0")} s · Ritmo aplicado:{" "}
        {fmtEntero(salidasDia)} personas netas al día, derivado del saldo migratorio de 2025.
      </div>
    </div>
  );
}

/* ============================================== 2 · serie de población ===== */

function SeriePoblacion({ serie }) {
  const [sel, setSel] = useState(serie.length - 1);
  const W = 960;
  const H = 380;
  const mL = 92;
  const mR = 26;
  const mT = 26;
  const mB = 62;
  const vals = serie.map((s) => s.valor);
  const maxV = Math.max(...vals) * 1.02;
  const minV = Math.min(...vals) * 0.95;
  const px = (i) => mL + (i / (serie.length - 1)) * (W - mL - mR);
  const py = (v) => mT + (1 - (v - minV) / (maxV - minV)) * (H - mT - mB);
  const linea = serie.map((s, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(s.valor).toFixed(1)}`).join(" ");
  const area = `${linea} L${px(serie.length - 1).toFixed(1)},${(H - mB).toFixed(1)} L${px(0).toFixed(1)},${(H - mB).toFixed(1)} Z`;
  const ticks = [9, 9.5, 10, 10.5, 11, 11.5].filter((t) => t * 1e6 >= minV && t * 1e6 <= maxV);
  const actual = serie[sel];
  const primero = serie[0];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img" aria-label="Población efectiva de Cuba, 2020 a 2025">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={mL} y1={py(t * 1e6)} x2={W - mR} y2={py(t * 1e6)} stroke={P.borde} strokeWidth="1" />
            <text x={mL - 12} y={py(t * 1e6) + 5} textAnchor="end" style={{ fontFamily: MONO, fontSize: 13, fill: P.tintaTenue }}>
              {fmt(t, 1)} M
            </text>
          </g>
        ))}
        <path d={area} fill={P.bermellon} opacity="0.1" />
        <path d={linea} fill="none" stroke={P.bermellon} strokeWidth="3" strokeLinejoin="round" />
        {serie.map((s, i) => (
          <g key={s.anio} onMouseEnter={() => setSel(i)} style={{ cursor: "pointer" }}>
            <rect x={px(i) - 26} y={mT} width="52" height={H - mT - mB} fill="transparent" />
            <circle cx={px(i)} cy={py(s.valor)} r={sel === i ? 8 : 5} fill={sel === i ? P.tinta : P.bermellon} stroke={P.fondo} strokeWidth="2" />
            <text x={px(i)} y={H - mB + 26} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 13, fill: sel === i ? P.tinta : P.tintaTenue }}>
              {s.anio}
            </text>
          </g>
        ))}
        <line x1={mL} y1={H - mB} x2={W - mR} y2={H - mB} stroke={P.bordeVivo} strokeWidth="1.5" />
        <text x={mL} y={H - 14} style={{ fontFamily: MONO, fontSize: 12, fill: P.tintaDebil }}>
          Población efectiva al cierre de cada año
        </text>
      </svg>

      <div style={{ display: "flex", gap: 30, flexWrap: "wrap", marginTop: 16 }}>
        <div>
          <Rotulo>Año seleccionado</Rotulo>
          <div style={{ fontFamily: TITULAR, fontSize: 30, color: P.tinta, lineHeight: 1 }}>{actual.anio}</div>
          <div style={{ fontFamily: MONO, fontSize: 14, color: P.tintaTenue, marginTop: 8 }}>
            {fmtEntero(actual.valor)} habitantes
          </div>
        </div>
        <div>
          <Rotulo>Variación desde {primero.anio}</Rotulo>
          <div style={{ fontFamily: TITULAR, fontSize: 30, color: P.bermellon, lineHeight: 1 }}>
            {fmtEntero(actual.valor - primero.valor)}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, color: P.tintaTenue, marginTop: 8 }}>
            {fmt((actual.valor / primero.valor - 1) * 100, 1)} %
          </div>
        </div>
        <div style={{ alignSelf: "center" }}>
          <Confianza nivel={actual.confianza} />
        </div>
      </div>

      <Leyenda
        items={[
          { etiqueta: "Población efectiva (ONEI)", color: P.bermellon, forma: "linea" },
          { etiqueta: "Año seleccionado", color: P.tinta }
        ]}
        nota="Eje vertical truncado en 9 millones para hacer visible la pendiente; no arranca en cero. La serie 2023 incorpora la revisión metodológica de la ONEI, por lo que el salto entre 2022 y 2023 mezcla emigración real y cambio de criterio."
      />
    </div>
  );
}

/* ============================================== 3 · efecto denominador ===== */

function EfectoDenominador({ datos, aviso }) {
  const [pob, setPob] = useState(datos.poblacion_anexo);
  const base = datos.poblacion_anexo;
  const factor = base / pob;
  const variacion = (factor - 1) * 100;

  return (
    <div>
      <AvisoSimulacion texto={aviso} />
      <div style={{ display: "grid", gap: 30, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <div>
          <Deslizador
            etiqueta="Población residente utilizada como denominador"
            valor={pob}
            min={datos.poblacion_min}
            max={datos.poblacion_max}
            paso={0.001}
            color={P.bermellon}
            onChange={setPob}
            formateado={`${fmt(pob, 3)} M`}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
            {datos.hitos.map((h) => (
              <Boton key={h.id} activo={Math.abs(pob - h.poblacion) < 0.0005} color={P.cian} onClick={() => setPob(h.poblacion)}>
                {h.etiqueta} · {fmt(h.poblacion, 3)} M
              </Boton>
            ))}
          </div>
          <div
            style={{
              marginTop: 24,
              padding: "18px 20px",
              border: `1px solid ${variacion > 0.5 ? P.bermellon : P.borde}`,
              borderRadius: 3,
              background: P.superficie
            }}
          >
            <Rotulo color={variacion > 0.5 ? P.bermellon : P.tintaDebil}>Mejora automática, sin que mejore nada</Rotulo>
            <div style={{ fontFamily: TITULAR, fontSize: 42, color: variacion > 0.5 ? P.bermellon : P.tintaTenue, lineHeight: 1 }}>
              {variacion >= 0 ? "+" : ""}
              {fmt(variacion, 1)} %
            </div>
            <div style={{ fontFamily: MONO, fontSize: 12.5, color: P.tintaTenue, marginTop: 12, lineHeight: 1.7 }}>
              Aplicado a todos los indicadores per cápita a la vez, con los numeradores agregados congelados en su valor del
              Anexo 1.
            </div>
          </div>
        </div>

        <div>
          <Rotulo>Indicadores recalculados</Rotulo>
          <div style={{ display: "grid", gap: 2 }}>
            {datos.magnitudes.map((m) => {
              const nuevo = m.valor_base * factor;
              const cambio = nuevo - m.valor_base;
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 16,
                    padding: "13px 0",
                    borderBottom: `1px solid ${P.borde}`,
                    flexWrap: "wrap"
                  }}
                >
                  <span style={{ fontSize: 14, color: P.tintaTenue, lineHeight: 1.5, flex: "1 1 170px" }}>{m.etiqueta}</span>
                  <span style={{ fontFamily: MONO, fontSize: 15, color: P.tinta, whiteSpace: "nowrap" }}>
                    {fmt(nuevo, m.valor_base < 100 ? 1 : 0)}{" "}
                    <span style={{ fontSize: 12, color: P.tintaDebil }}>{m.unidad}</span>
                    {Math.abs(cambio) > 0.05 ? (
                      <span style={{ color: P.bermellon, fontSize: 12.5, marginLeft: 9 }}>
                        {cambio > 0 ? "▲" : "▼"} {fmt(Math.abs(cambio), m.valor_base < 100 ? 1 : 0)}
                      </span>
                    ) : null}
                  </span>
                </div>
              );
            })}
          </div>
          <Leyenda
            items={[
              { etiqueta: "Valor recalculado", color: P.tinta },
              { etiqueta: "Desviación respecto al Anexo 1", color: P.bermellon }
            ]}
            nota="Los numeradores agregados se mantienen constantes. Toda variación mostrada procede exclusivamente del denominador."
          />
        </div>
      </div>
      <Nota tono="alerta">{datos.recomendacion}</Nota>
    </div>
  );
}

/* ============================================== 4 · balanza del Anexo 1 ==== */

function BalanzaAnexo({ anexo }) {
  const [via, setVia] = useState(null);
  const W = 960;
  const H = 260;
  const mL = 30;
  const mR = 30;
  const lo = 9.6;
  const hi = 11.4;
  const px = (v) => mL + ((v - lo) / (hi - lo)) * (W - mL - mR);
  const a = anexo.vias[0];
  const b = anexo.vias[1];
  const yA = 92;
  const yB = 168;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img" aria-label="Poblaciones implícitas en el Anexo 1">
        <rect
          x={px(b.poblacion_implicita)}
          y={62}
          width={px(a.poblacion_implicita) - px(b.poblacion_implicita)}
          height={130}
          fill={P.bermellon}
          opacity="0.12"
        />
        {[9.6, 10.0, 10.4, 10.8, 11.2].map((t) => (
          <g key={t}>
            <line x1={px(t)} y1={54} x2={px(t)} y2={206} stroke={P.borde} strokeWidth="1" />
            <text x={px(t)} y={228} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 13, fill: P.tintaTenue }}>
              {fmt(t, 1)} M
            </text>
          </g>
        ))}

        {[
          { v: a, y: yA, color: P.violeta },
          { v: b, y: yB, color: P.cian }
        ].map((row) => (
          <g key={row.v.id} onMouseEnter={() => setVia(row.v.id)} onMouseLeave={() => setVia(null)} style={{ cursor: "pointer" }}>
            <line x1={mL} y1={row.y} x2={W - mR} y2={row.y} stroke={P.borde} strokeWidth="1" strokeDasharray="3 5" />
            <circle cx={px(row.v.poblacion_implicita)} cy={row.y} r={via === row.v.id ? 13 : 10} fill={row.color} />
            <text
              x={px(row.v.poblacion_implicita)}
              y={row.y - 22}
              textAnchor="middle"
              style={{ fontFamily: TITULAR, fontSize: 19, fill: row.color }}
            >
              {fmt(row.v.poblacion_implicita, 3)} M
            </text>
          </g>
        ))}

        <line x1={px(anexo.poblacion_declarada)} y1={44} x2={px(anexo.poblacion_declarada)} y2={206} stroke={P.tinta} strokeWidth="2" strokeDasharray="6 4" />
        <text x={px(anexo.poblacion_declarada)} y={36} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 13, fill: P.tinta }}>
          declarada en nota: {fmt(anexo.poblacion_declarada, 2)} M
        </text>

        <text x={W / 2} y={252} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 12, fill: P.tintaDebil }}>
          Población implícita en las celdas del Anexo 1
        </text>
      </svg>

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", marginTop: 18 }}>
        {anexo.vias.map((v, i) => (
          <Tarjeta key={v.id} acento={i === 0 ? P.violeta : P.cian}>
            <Rotulo color={i === 0 ? P.violeta : P.cian}>{v.etiqueta}</Rotulo>
            <div style={{ fontFamily: MONO, fontSize: 13.5, color: P.tinta, lineHeight: 1.8 }}>{v.operacion}</div>
            <div style={{ fontFamily: MONO, fontSize: 13, color: P.tintaTenue, lineHeight: 1.8, marginTop: 8 }}>
              {fmtEntero(v.numerador)} {v.unidad_num}
              <br />
              {i === 0 ? "÷" : "×"} {fmtEntero(v.denominador)} {v.unidad_den}
            </div>
            <div style={{ fontFamily: TITULAR, fontSize: 26, color: i === 0 ? P.violeta : P.cian, marginTop: 12 }}>
              {fmt(v.poblacion_implicita, 3)} M
            </div>
          </Tarjeta>
        ))}
        <Tarjeta acento={P.bermellon} fondo="rgba(232,70,44,0.07)">
          <Rotulo color={P.bermellon}>Discrepancia</Rotulo>
          <div style={{ fontFamily: TITULAR, fontSize: 38, color: P.bermellon, lineHeight: 1 }}>{fmt(anexo.discrepancia_pct, 2)} %</div>
          <div style={{ fontFamily: MONO, fontSize: 13, color: P.tintaTenue, marginTop: 12, lineHeight: 1.7 }}>
            Más de {fmtEntero(anexo.discrepancia_personas)} personas de diferencia entre dos celdas de la misma tabla.
          </div>
          <div style={{ marginTop: 14 }}>
            <Confianza nivel={anexo.confianza} procedencia="Cálculo aritmético directo sobre el Anexo 1 del documento" />
          </div>
        </Tarjeta>
      </div>

      <Leyenda
        items={[
          { etiqueta: "Población implícita vía PIB ÷ PIB per cápita", color: P.violeta },
          { etiqueta: "Población implícita vía densidad × superficie", color: P.cian },
          { etiqueta: "Población declarada en la nota al pie", color: P.tinta, forma: "linea" },
          { etiqueta: "Banda de discrepancia", color: P.bermellon, relleno: false }
        ]}
        nota="Ninguna fuente externa interviene en este cálculo: las tres magnitudes proceden de la misma tabla del documento."
      />
    </div>
  );
}

/* ============================================== 5 · contrafactuales ======== */

function Contrafactual({ cf, abiertoInicial }) {
  const [abierto, setAbierto] = useState(!!abiertoInicial);
  return (
    <div
      style={{
        border: `2px dashed ${P.ambar}`,
        borderRadius: 3,
        padding: "18px 22px",
        background: "rgba(201, 138, 23, 0.05)"
      }}
    >
      <div
        onClick={() => setAbierto(!abierto)}
        style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", cursor: "pointer" }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: P.fondo,
            background: P.ambar,
            padding: "3px 8px",
            borderRadius: 2,
            fontWeight: 700
          }}
        >
          ⚠ Contrafactual · no es evidencia
        </span>
        <span style={{ fontFamily: MONO, fontSize: 12.5, color: P.ambar, fontWeight: 700 }}>{cf.codigo}</span>
        <h3 style={{ fontFamily: TITULAR, fontSize: 18, color: P.tinta, margin: 0, flex: "1 1 220px", lineHeight: 1.3 }}>
          {cf.titulo}
        </h3>
        <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              style={{
                width: 9,
                height: 9,
                borderRadius: 9,
                background: n <= cf.plausibilidad_nivel ? P.ambar : "transparent",
                border: `1px solid ${P.ambar}`
              }}
            />
          ))}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 18, color: P.ambar, width: 14, textAlign: "center" }}>
          {abierto ? "−" : "+"}
        </span>
      </div>

      {abierto ? (
        <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
          <Campo etiqueta="Supuesto" valor={cf.supuesto} />
          <Campo etiqueta="Mecanismo" valor={cf.mecanismo} />
          <Campo etiqueta="Referente empírico" valor={cf.referente} />
          <Campo etiqueta="Plausibilidad" valor={cf.plausibilidad} color={P.ambar} />
          <div style={{ borderTop: `1px dashed ${P.ambar}`, paddingTop: 14 }}>
            <Rotulo color={P.musgo}>Condición de falsación</Rotulo>
            <div style={{ color: P.tinta, fontSize: 15, lineHeight: 1.7 }}>{cf.falsacion}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Campo({ etiqueta, valor, color }) {
  return (
    <div>
      <Rotulo>{etiqueta}</Rotulo>
      <div style={{ color: color || P.tinta, fontSize: 15, lineHeight: 1.7 }}>{valor}</div>
    </div>
  );
}

/* ============================================== 6 · casos comparados ======= */

function Caso({ caso }) {
  const color = COLOR_CASO[caso.id] || P.cian;
  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "baseline", marginBottom: 10 }}>
        <h3 style={{ fontFamily: TITULAR, fontSize: 30, color: color, margin: 0, lineHeight: 1.1 }}>{caso.nombre}</h3>
        <span style={{ fontFamily: MONO, fontSize: 13, color: P.tintaTenue }}>{caso.periodo}</span>
      </div>
      <div style={{ fontFamily: TITULAR, fontSize: 19, color: P.tinta, marginBottom: 14, lineHeight: 1.3 }}>{caso.titular}</div>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: P.tintaTenue, maxWidth: 780, marginTop: 0 }}>{caso.narrativa}</p>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", margin: "22px 0" }}>
        <Tarjeta acento={color}>
          <Rotulo color={color}>Es un caso de</Rotulo>
          <div style={{ fontSize: 15, lineHeight: 1.65 }}>{caso.es_caso_de}</div>
        </Tarjeta>
        <Tarjeta acento={P.bermellon}>
          <Rotulo color={P.bermellon}>No es un caso de</Rotulo>
          <div style={{ fontSize: 15, lineHeight: 1.65 }}>{caso.no_es_caso_de}</div>
        </Tarjeta>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {caso.fases.map((f) => {
          const cf = f.signo === "positivo" ? P.musgo : P.bermellon;
          return (
            <div key={f.id} style={{ border: `1px solid ${P.borde}`, borderTop: `3px solid ${cf}`, borderRadius: 3, padding: "18px 20px", background: P.superficie }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                <span style={{ fontFamily: TITULAR, fontSize: 16, color: cf }}>{f.etiqueta}</span>
                <span style={{ fontFamily: MONO, fontSize: 12.5, color: P.tintaTenue }}>{f.rango}</span>
              </div>
              <div style={{ marginTop: 16 }}>
                {f.hitos.map((h) => (
                  <div
                    key={h.etiqueta}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 14,
                      padding: "11px 0",
                      borderBottom: `1px solid ${P.borde}`,
                      flexWrap: "wrap"
                    }}
                  >
                    <span style={{ fontSize: 13.5, color: P.tintaTenue, lineHeight: 1.5, flex: "1 1 150px" }}>{h.etiqueta}</span>
                    <span style={{ fontFamily: MONO, fontSize: 15, color: cf, whiteSpace: "nowrap", textAlign: "right" }}>
                      {h.valor > 0 && h.unidad === "%" ? "" : ""}
                      {fmt(h.valor, Number.isInteger(h.valor) ? 0 : 1)}{" "}
                      <span style={{ fontSize: 11.5, color: P.tintaDebil }}>{h.unidad}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 12.5, color: P.tintaTenue, marginTop: 14, lineHeight: 1.7 }}>{f.cierre}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 20 }}>
        <Tarjeta acento={P.ambar} fondo="rgba(201,138,23,0.05)">
          <Rotulo color={P.ambar}>Lección para el documento cubano</Rotulo>
          <div style={{ fontSize: 16, lineHeight: 1.7 }}>{caso.leccion}</div>
        </Tarjeta>
      </div>

      <div style={{ marginTop: 16 }}>
        <Rotulo color={P.bermellon}>Advertencias del caso</Rotulo>
        <ul style={{ margin: 0, paddingLeft: 20, color: P.tintaTenue, fontSize: 14.5, lineHeight: 1.8 }}>
          {caso.advertencias.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      <Leyenda
        items={[
          { etiqueta: "Fase con resultado adverso", color: P.bermellon },
          { etiqueta: "Fase con resultado favorable", color: P.musgo }
        ]}
        nota="Todas las magnitudes de esta sección están etiquetadas individualmente en el dataset. Ninguna procede de una estimación propia."
      />
    </div>
  );
}

/* ============================================== 7 · matriz de mecanismos === */

function MatrizMecanismos({ mecanismos, casos }) {
  const [filtro, setFiltro] = useState("todos");
  const nombres = useMemo(() => {
    const m = {};
    casos.forEach((c) => {
      m[c.id] = c.nombre;
    });
    return m;
  }, [casos]);
  const visibles = filtro === "todos" ? mecanismos : mecanismos.filter((m) => m.estado === filtro);
  const cuenta = (e) => mecanismos.filter((m) => m.estado === e).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <Boton activo={filtro === "todos"} color={P.tintaTenue} onClick={() => setFiltro("todos")}>
          Todos · {mecanismos.length}
        </Boton>
        {["presente", "parcial", "ausente"].map((e) => (
          <Boton key={e} activo={filtro === e} color={COLOR_ESTADO[e]} onClick={() => setFiltro(e)}>
            {e.charAt(0).toUpperCase() + e.slice(1)} en Cuba · {cuenta(e)}
          </Boton>
        ))}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {visibles.map((m) => {
          const c = COLOR_ESTADO[m.estado];
          return (
            <div
              key={m.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1.15fr) minmax(0,1fr) minmax(0,0.95fr)",
                gap: 18,
                alignItems: "start",
                background: P.superficie,
                border: `1px solid ${P.borde}`,
                borderLeft: `3px solid ${c}`,
                borderRadius: 3,
                padding: "16px 18px"
              }}
            >
              <div>
                <div style={{ fontSize: 15, color: P.tinta, lineHeight: 1.55, fontWeight: 600 }}>{m.mecanismo}</div>
                <div style={{ fontFamily: MONO, fontSize: 11.5, color: COLOR_CASO[m.caso] || P.tintaDebil, marginTop: 7 }}>
                  {nombres[m.caso] || m.caso}
                </div>
              </div>
              <div>
                <Rotulo>Condición necesaria</Rotulo>
                <div style={{ fontSize: 14, color: P.tintaTenue, lineHeight: 1.6 }}>{m.condicion}</div>
              </div>
              <div>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: c,
                    border: `1px solid ${c}`,
                    borderRadius: 2,
                    padding: "2px 7px",
                    display: "inline-block",
                    marginBottom: 9
                  }}
                >
                  {m.estado} en Cuba
                </span>
                <div style={{ fontSize: 14, color: P.tinta, lineHeight: 1.6 }}>{m.veredicto}</div>
              </div>
            </div>
          );
        })}
      </div>

      <Leyenda
        items={[
          { etiqueta: "Condición presente en Cuba", color: P.musgo },
          { etiqueta: "Parcialmente presente", color: P.violeta },
          { etiqueta: "Ausente", color: P.bermellon }
        ]}
        nota="Cada fila cruza un mecanismo documentado en un caso externo con la condición que lo hizo funcionar, y evalúa si esa condición existe hoy en Cuba."
      />
    </div>
  );
}

/* ============================================== 8 · la regla única ========= */

function ReglaUnica({ regla }) {
  const [modo, setModo] = useState("propuesto");
  const propuesto = modo === "propuesto";
  return (
    <div>
      <Tarjeta acento={P.cian} estilo={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, lineHeight: 1.65, color: P.tinta }}>{regla.enunciado}</div>
      </Tarjeta>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
        <Boton activo={propuesto} color={P.bermellon} onClick={() => setModo("propuesto")}>
          Orden que propone el documento
        </Boton>
        <Boton activo={!propuesto} color={P.musgo} onClick={() => setModo("evidencia")}>
          Orden que respalda la evidencia
        </Boton>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {regla.inversiones.map((inv) => {
          const pasos = propuesto ? inv.orden_propuesto : inv.orden_evidencia;
          const c = propuesto ? P.bermellon : P.musgo;
          return (
            <div
              key={inv.id}
              style={{
                background: P.superficie,
                border: `1px solid ${P.borde}`,
                borderLeft: `3px solid ${c}`,
                borderRadius: 3,
                padding: "18px 20px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
                <span style={{ fontFamily: TITULAR, fontSize: 17, color: P.tinta }}>{inv.medida}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: P.tintaDebil }}>{inv.referencia}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 16 }}>
                {pasos.map((paso, i) => (
                  <React.Fragment key={paso}>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 13.5,
                        color: i === 0 ? P.fondo : c,
                        background: i === 0 ? c : "transparent",
                        border: `1px solid ${c}`,
                        borderRadius: 2,
                        padding: "8px 13px",
                        lineHeight: 1.45,
                        transition: "background 200ms, color 200ms"
                      }}
                    >
                      <span style={{ opacity: 0.75, marginRight: 7 }}>{i + 1}</span>
                      {paso}
                    </span>
                    {i === 0 ? <span style={{ color: c, fontSize: 18, fontFamily: MONO }}>→</span> : null}
                  </React.Fragment>
                ))}
              </div>

              {propuesto ? (
                <div style={{ fontFamily: MONO, fontSize: 12.5, color: P.bermellon, marginTop: 15, lineHeight: 1.7 }}>
                  Riesgo: {inv.riesgo}
                </div>
              ) : (
                <div style={{ fontFamily: MONO, fontSize: 12.5, color: P.musgo, marginTop: 15, lineHeight: 1.7 }}>
                  Con este orden, el riesgo anterior deja de ser estructural y pasa a ser gestionable.
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Leyenda
        items={[
          { etiqueta: "Paso 1 del orden mostrado", color: propuesto ? P.bermellon : P.musgo },
          { etiqueta: "Paso 2 del orden mostrado", color: propuesto ? P.bermellon : P.musgo, relleno: false }
        ]}
        nota="Pulsa los dos botones para ver cómo se intercambian los pasos. La diferencia entre ambos órdenes es toda la crítica de secuencia, en cuatro medidas."
      />
    </div>
  );
}

/* ============================================== 9 · valoración ============= */

function Valoracion({ valoracion }) {
  const [sel, setSel] = useState(null);
  const dims = valoracion.dimensiones;
  const W = 960;
  const filaH = 46;
  const H = dims.length * filaH + 74;
  const mL = 300;
  const mR = 90;
  const px = (v) => mL + (v / 10) * (W - mL - mR);
  const yF = (i) => 52 + i * filaH;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img" aria-label="Valoración preliminar frente a revisada">
        {[0, 2, 4, 6, 8, 10].map((t) => (
          <g key={t}>
            <line x1={px(t)} y1={34} x2={px(t)} y2={H - 34} stroke={P.borde} strokeWidth="1" />
            <text x={px(t)} y={24} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 12.5, fill: P.tintaDebil }}>
              {t}
            </text>
          </g>
        ))}
        {dims.map((d, i) => {
          const y = yF(i);
          const baja = d.revisada < d.preliminar;
          const sube = d.revisada > d.preliminar;
          const c = baja ? P.bermellon : sube ? P.musgo : P.tintaDebil;
          const on = sel === i;
          return (
            <g key={d.id} onMouseEnter={() => setSel(i)} onMouseLeave={() => setSel(null)} style={{ cursor: "pointer" }}>
              <rect x="0" y={y - 20} width={W} height={filaH - 6} fill={on ? P.superficieAlt : "transparent"} />
              <text x={mL - 18} y={y + 5} textAnchor="end" style={{ fontFamily: MONO, fontSize: 13.5, fill: on ? P.tinta : P.tintaTenue }}>
                {d.dimension}
              </text>
              <line x1={px(d.preliminar)} y1={y} x2={px(d.revisada)} y2={y} stroke={c} strokeWidth={on ? 4 : 2.5} />
              <circle cx={px(d.preliminar)} cy={y} r="5.5" fill={P.fondo} stroke={P.tintaTenue} strokeWidth="2" />
              <circle cx={px(d.revisada)} cy={y} r={on ? 8 : 6.5} fill={c} />
              <text x={W - mR + 16} y={y + 5} style={{ fontFamily: MONO, fontSize: 13.5, fill: c }}>
                {fmt(d.revisada, 1)}
              </text>
            </g>
          );
        })}
      </svg>

      <div
        style={{
          minHeight: 56,
          marginTop: 12,
          fontFamily: MONO,
          fontSize: 13,
          lineHeight: 1.7,
          color: sel === null ? P.tintaDebil : P.tinta,
          borderLeft: `2px solid ${sel === null ? P.borde : P.violeta}`,
          paddingLeft: 14,
          maxWidth: 820
        }}
      >
        {sel === null ? (
          "Pasa el cursor sobre una fila para leer el motivo del cambio."
        ) : (
          <span>
            {dims[sel].dimension}: {fmt(dims[sel].preliminar, 1)} → {fmt(dims[sel].revisada, 1)}. {dims[sel].motivo}.
          </span>
        )}
      </div>

      <Leyenda
        items={[
          { etiqueta: "Valoración preliminar", color: P.tintaTenue, relleno: false },
          { etiqueta: "Revisada a la baja", color: P.bermellon },
          { etiqueta: "Revisada al alza", color: P.musgo },
          { etiqueta: "Sin cambio", color: P.tintaDebil }
        ]}
        nota={valoracion.aviso}
      />

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: 26 }}>
        {valoracion.globales.map((g) => {
          const baja = g.revisada < g.preliminar;
          return (
            <Tarjeta key={g.id} acento={baja ? P.bermellon : P.cian}>
              <Rotulo>{g.etiqueta}</Rotulo>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontFamily: TITULAR, fontSize: 46, color: baja ? P.bermellon : P.cian, lineHeight: 1 }}>
                  {fmt(g.revisada, 1)}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 14, color: P.tintaDebil }}>
                  / 10 · antes {fmt(g.preliminar, 1)}
                </span>
              </div>
            </Tarjeta>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================== 10 · encuesta ============== */

const SB_URL = typeof process !== "undefined" && process.env ? process.env.REACT_APP_SUPABASE_URL : null;
const SB_KEY = typeof process !== "undefined" && process.env ? process.env.REACT_APP_SUPABASE_ANON_KEY : null;

function claveVoto(slug, preguntaId, opcionId) {
  return `${slug}::${preguntaId}::${opcionId}`;
}

async function rpcVotar(clave) {
  if (!SB_URL || !SB_KEY) return false;
  try {
    const r = await fetch(`${SB_URL}/rest/v1/rpc/yamacoa_encuesta_votar`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
      body: JSON.stringify({ p_clave: clave })
    });
    return r.ok;
  } catch (e) {
    return false;
  }
}

async function rpcResultados(prefijo) {
  if (!SB_URL || !SB_KEY) return null;
  try {
    const r = await fetch(`${SB_URL}/rest/v1/rpc/yamacoa_encuesta_resultados`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
      body: JSON.stringify({ p_prefijo: prefijo })
    });
    if (!r.ok) return null;
    const filas = await r.json();
    const mapa = {};
    (filas || []).forEach((f) => {
      mapa[f.clave] = Number(f.votos) || 0;
    });
    return mapa;
  } catch (e) {
    return null;
  }
}

function Encuesta({ encuesta, slug }) {
  const claveLocal = `yamacoa:encuesta:${slug}`;
  const [votos, setVotos] = useState({});
  const [conteos, setConteos] = useState({});
  const [remoto, setRemoto] = useState(false);

  useEffect(() => {
    const guardado = almacen.leer(claveLocal);
    if (guardado) {
      try {
        setVotos(JSON.parse(guardado));
      } catch (e) {
        /* dato corrupto: se ignora */
      }
    }
    const conteoLocal = almacen.leer(`${claveLocal}:conteos`);
    if (conteoLocal) {
      try {
        setConteos(JSON.parse(conteoLocal));
      } catch (e) {
        /* dato corrupto: se ignora */
      }
    }
    let vivo = true;
    rpcResultados(`${slug}::`).then((m) => {
      if (vivo && m) {
        setConteos(m);
        setRemoto(true);
      }
    });
    return () => {
      vivo = false;
    };
  }, [claveLocal, slug]);

  const votar = useCallback(
    (preguntaId, opcionId) => {
      if (votos[preguntaId]) return;
      const clave = claveVoto(slug, preguntaId, opcionId);
      const nuevos = { ...votos, [preguntaId]: opcionId };
      setVotos(nuevos);
      almacen.escribir(claveLocal, JSON.stringify(nuevos));
      setConteos((prev) => {
        const sig = { ...prev, [clave]: (prev[clave] || 0) + 1 };
        almacen.escribir(`${claveLocal}:conteos`, JSON.stringify(sig));
        return sig;
      });
      rpcVotar(clave);
    },
    [votos, slug, claveLocal]
  );

  return (
    <div>
      <p style={{ color: P.tintaTenue, fontSize: 16, lineHeight: 1.68, maxWidth: 760, marginTop: 0 }}>{encuesta.intro}</p>
      <div style={{ display: "grid", gap: 26 }}>
        {encuesta.preguntas.map((pr, idx) => {
          const votada = votos[pr.id];
          const total = pr.opciones.reduce((acc, o) => acc + (conteos[claveVoto(slug, pr.id, o.id)] || 0), 0);
          return (
            <div key={pr.id} style={{ border: `1px solid ${P.borde}`, borderRadius: 3, padding: "20px 22px", background: P.superficie }}>
              <div style={{ display: "flex", gap: 12, alignItems: "baseline", marginBottom: 16, flexWrap: "wrap" }}>
                <span style={{ fontFamily: MONO, fontSize: 12, color: P.cian, letterSpacing: "0.1em" }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span style={{ fontFamily: TITULAR, fontSize: 17, color: P.tinta, lineHeight: 1.4, flex: "1 1 240px" }}>
                  {pr.texto}
                </span>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {pr.opciones.map((o) => {
                  const clave = claveVoto(slug, pr.id, o.id);
                  const n = conteos[clave] || 0;
                  const pct = total > 0 ? (n / total) * 100 : 0;
                  const elegida = votada === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => votar(pr.id, o.id)}
                      disabled={!!votada}
                      style={{
                        position: "relative",
                        overflow: "hidden",
                        textAlign: "left",
                        background: P.superficieAlt,
                        border: `1px solid ${elegida ? P.cian : P.borde}`,
                        borderRadius: 2,
                        padding: "13px 15px",
                        cursor: votada ? "default" : "pointer",
                        color: P.tinta,
                        fontSize: 14.5,
                        lineHeight: 1.55,
                        fontFamily: "inherit"
                      }}
                    >
                      {votada ? (
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${pct}%`,
                            background: elegida ? P.cian : P.bordeVivo,
                            opacity: elegida ? 0.22 : 0.3,
                            transition: "width 420ms"
                          }}
                        />
                      ) : null}
                      <span style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 14 }}>
                        <span>
                          {elegida ? <span style={{ color: P.cian, marginRight: 8 }}>✓</span> : null}
                          {o.texto}
                        </span>
                        {votada ? (
                          <span style={{ fontFamily: MONO, fontSize: 13, color: elegida ? P.cian : P.tintaTenue, whiteSpace: "nowrap" }}>
                            {fmt(pct, 1)} %
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              {votada ? (
                <div style={{ fontFamily: MONO, fontSize: 11.5, color: P.tintaDebil, marginTop: 12 }}>
                  {fmtEntero(total)} {total === 1 ? "voto" : "votos"} · {remoto ? "recuento agregado" : "recuento local"}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <Nota>{encuesta.nota_privacidad}</Nota>
    </div>
  );
}

/* ============================================================== renderer === */

export default function PropuestaEconomicaAuditoria() {
  const [datos, setDatos] = useState(null);
  const [origen, setOrigen] = useState("cargando");
  const [etapa, setEtapa] = useState(0);
  const [caso, setCaso] = useState(0);

  useEffect(() => {
    let vivo = true;
    fetch(RUTA_DATOS)
      .then((r) => {
        if (!r.ok) throw new Error("respuesta no ok");
        return r.json();
      })
      .then((j) => {
        if (!vivo) return;
        setDatos(j);
        setOrigen("remoto");
      })
      .catch(() => {
        if (!vivo) return;
        setDatos(DATOS_EMBEBIDOS);
        setOrigen("embebido");
      });
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    if (!datos) return undefined;
    const onScroll = () => {
      let activa = 0;
      ETAPAS.forEach((e, i) => {
        const el = document.getElementById(e.id);
        if (el && el.getBoundingClientRect().top <= 160) activa = i;
      });
      setEtapa(activa);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [datos]);

  const irA = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (!datos) {
    return (
      <div style={{ background: P.fondo, color: P.tintaTenue, fontFamily: MONO, padding: 44, minHeight: "60vh" }}>
        Cargando dataset…
      </div>
    );
  }

  const d = datos;

  return (
    <div style={{ background: P.fondo, color: P.tinta, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 22px 100px" }}>
        {/* ------------------------------------------------------------ hero */}
        <header style={{ padding: "78px 0 40px" }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11.5,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: P.cian,
              marginBottom: 22
            }}
          >
            Yamacoa · auditoría · {d.meta.slug}
          </div>
          <h1
            style={{
              fontFamily: TITULAR,
              fontSize: "clamp(44px, 9.5vw, 104px)",
              lineHeight: 0.94,
              margin: 0,
              letterSpacing: "-0.025em"
            }}
          >
            {d.meta.titulo}
          </h1>
          <p
            style={{
              fontSize: "clamp(17px, 2.4vw, 23px)",
              lineHeight: 1.45,
              color: P.tintaTenue,
              maxWidth: 720,
              marginTop: 24
            }}
          >
            {d.meta.subtitulo}
          </p>
          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              marginTop: 30,
              fontFamily: MONO,
              fontSize: 11.5,
              color: P.tintaDebil
            }}
          >
            <span>v{d.meta.version}</span>
            <span>Actualizado {d.meta.actualizado}</span>
            <span>Ciclo {d.meta.ciclo_horas} h</span>
            <span style={{ color: origen === "remoto" ? P.cian : P.bermellon }}>
              Origen: {origen === "remoto" ? "dataset en vivo" : "copia embebida"}
            </span>
          </div>
        </header>

        <Embudo activa={etapa} onIr={irA} />

        {/* ----------------------------------------------------- 01 · marco */}
        <Seccion id="sec-marco" numero={1} etapa="Contexto" titulo={d.marco.titulo}>
          <div style={{ display: "grid", gap: 26, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            <div>
              {d.marco.parrafos.map((p, i) => (
                <p key={i} style={{ fontSize: 16.5, lineHeight: 1.72, color: i === 0 ? P.tinta : P.tintaTenue, marginTop: i === 0 ? 0 : 18 }}>
                  {p}
                </p>
              ))}
            </div>
            <div>
              <Tarjeta acento={P.cian}>
                <Rotulo color={P.cian}>El documento auditado</Rotulo>
                <div style={{ fontFamily: TITULAR, fontSize: 19, lineHeight: 1.35, marginBottom: 14 }}>{d.propuesta.titulo}</div>
                <div style={{ fontFamily: MONO, fontSize: 12.5, color: P.tintaTenue, lineHeight: 1.9 }}>
                  {d.propuesta.version_doc} · {d.propuesta.fecha} · {d.propuesta.paginas} pp.
                </div>
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${P.borde}` }}>
                  <Rotulo>Autores</Rotulo>
                  {d.propuesta.autores.map((a) => (
                    <div key={a} style={{ fontSize: 14, color: P.tinta, lineHeight: 1.75 }}>
                      {a}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${P.borde}` }}>
                  <Rotulo>Objetivo declarado</Rotulo>
                  <div style={{ fontSize: 14.5, lineHeight: 1.65, color: P.tintaTenue }}>{d.propuesta.objetivo}</div>
                </div>
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${P.borde}`, fontFamily: MONO, fontSize: 12.5, color: P.cian }}>
                  Primera fase: {d.propuesta.primera_fase}
                </div>
              </Tarjeta>
            </div>
          </div>

          <blockquote
            style={{
              margin: "34px 0 0",
              borderLeft: `4px solid ${P.bermellon}`,
              paddingLeft: 24,
              fontFamily: TITULAR,
              fontSize: "clamp(20px, 3.4vw, 32px)",
              lineHeight: 1.32,
              color: P.tinta,
              maxWidth: 860
            }}
          >
            {d.marco.cita}
          </blockquote>

          <div style={{ marginTop: 34 }}>
            <Rotulo>Los cuatro supuestos del escenario central</Rotulo>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {d.propuesta.supuestos.map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    background: P.superficie,
                    border: `1px solid ${P.borde}`,
                    borderTop: `3px solid ${s.critico ? P.bermellon : P.tintaDebil}`,
                    borderRadius: 3,
                    padding: "15px 17px"
                  }}
                >
                  <div style={{ fontFamily: MONO, fontSize: 12, color: s.critico ? P.bermellon : P.tintaDebil, marginBottom: 9 }}>
                    Supuesto {i + 1}
                    {s.critico ? " · crítico" : ""}
                  </div>
                  <div style={{ fontSize: 14.5, lineHeight: 1.62, color: P.tinta }}>{s.texto}</div>
                </div>
              ))}
            </div>
            <Leyenda
              items={[
                { etiqueta: "Supuesto cuya caída invalida el programa", color: P.bermellon },
                { etiqueta: "Supuesto de contexto", color: P.tintaDebil }
              ]}
              nota="El documento los presenta como una lista. El contrafactual CF-0 sostiene que están correlacionados y que, por tanto, no constituyen un escenario base."
            />
          </div>
        </Seccion>

        {/* -------------------------------------------------- 02 · aciertos */}
        <Seccion
          id="sec-aciertos"
          numero={2}
          etapa="Mérito"
          titulo="Lo que la propuesta hace bien"
          sumario="Una auditoría que empieza por los defectos no es una auditoría: es una posición tomada. Estos seis componentes resisten la comparación internacional, y dos de ellos salen reforzados por ella."
        >
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {d.aciertos.map((a) => (
              <Tarjeta key={a.id} acento={P.musgo}>
                <div style={{ fontFamily: TITULAR, fontSize: 16.5, marginBottom: 11, lineHeight: 1.3, color: P.musgo }}>
                  {a.titulo}
                </div>
                <div style={{ fontSize: 14.5, lineHeight: 1.68, color: P.tinta }}>{a.detalle}</div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 12.5,
                    color: P.tintaTenue,
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: `1px solid ${P.borde}`,
                    lineHeight: 1.7
                  }}
                >
                  {a.respaldo}
                </div>
              </Tarjeta>
            ))}
          </div>
        </Seccion>

        {/* ---------------------------------------------- 03 · correcciones */}
        <Seccion id="sec-correcciones" numero={3} etapa="Rigor" titulo={d.correcciones.titulo} sumario={d.correcciones.intro}>
          <div style={{ display: "grid", gap: 14 }}>
            {d.correcciones.items.map((c) => (
              <div
                key={c.id}
                style={{
                  background: P.superficie,
                  border: `1px solid ${P.borde}`,
                  borderRadius: 3,
                  padding: "20px 22px",
                  display: "grid",
                  gap: 16,
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
                }}
              >
                <div>
                  <Rotulo color={P.bermellon}>Objeción improcedente</Rotulo>
                  <div style={{ fontSize: 15, lineHeight: 1.65, color: P.tintaDebil, textDecoration: "line-through", textDecorationColor: P.bermellon }}>
                    {c.objecion}
                  </div>
                </div>
                <div>
                  <Rotulo color={P.cian}>Lo que el documento dice</Rotulo>
                  <div style={{ fontSize: 15, lineHeight: 1.65, color: P.tinta }}>{c.realidad}</div>
                  <div style={{ marginTop: 12 }}>
                    <Confianza nivel={c.confianza} />
                  </div>
                </div>
                <div>
                  <Rotulo color={P.musgo}>Lo que sí queda en pie</Rotulo>
                  <div style={{ fontSize: 15, lineHeight: 1.65, color: P.tinta }}>{c.queda_en_pie}</div>
                </div>
              </div>
            ))}
          </div>
          <Nota tono="bien">
            Corregirse en público no debilita la crítica: la hace utilizable. Atribuir al documento algo que no dice le entrega
            a sus autores una refutación gratuita y desactiva las objeciones que sí son válidas.
          </Nota>
        </Seccion>

        {/* ----------------------------------------------- 04 · demografía */}
        <Seccion id="sec-demografia" numero={4} etapa="Evidencia" titulo={d.demografia.titulo} sumario={d.demografia.intro}>
          <RelojDemografico salidasDia={d.demografia.salidas_dia} />

          <div style={{ marginTop: 30 }}>
            <SeriePoblacion serie={d.demografia.serie_poblacion} />
          </div>

          <div style={{ marginTop: 34 }}>
            <Rotulo>Indicadores demográficos, cierre de 2025</Rotulo>
            <div style={{ display: "grid", gap: 2 }}>
              {d.demografia.indicadores.map((ind) => (
                <div
                  key={ind.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 18,
                    padding: "14px 0",
                    borderBottom: `1px solid ${P.borde}`,
                    flexWrap: "wrap"
                  }}
                >
                  <span style={{ fontSize: 15, color: P.tintaTenue, lineHeight: 1.5, flex: "1 1 220px" }}>{ind.etiqueta}</span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 17,
                      color: ind.valor < 0 ? P.bermellon : P.tinta,
                      whiteSpace: "nowrap"
                    }}
                  >
                    {ind.formato === "entero" ? fmtEntero(ind.valor) : fmt(ind.valor, 2)}{" "}
                    <span style={{ fontSize: 12.5, color: P.tintaDebil }}>{ind.unidad}</span>
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18 }}>
              <Confianza nivel={d.demografia.confianza} procedencia={d.demografia.fuente} />
            </div>
          </div>

          <div style={{ marginTop: 36, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <Tarjeta acento={P.tintaDebil}>
              <Rotulo>Criterio del documento</Rotulo>
              <div style={{ fontSize: 15, lineHeight: 1.68, marginBottom: 14 }}>{d.demografia.argumento.criterio_documento}</div>
              <Rotulo>Conclusión que extrae</Rotulo>
              <div style={{ fontSize: 15, lineHeight: 1.68, color: P.tintaTenue }}>{d.demografia.argumento.conclusion_documento}</div>
            </Tarjeta>
            <Tarjeta acento={P.bermellon} fondo="rgba(232,70,44,0.06)">
              <Rotulo color={P.bermellon}>La objeción</Rotulo>
              <div style={{ fontSize: 15, lineHeight: 1.68 }}>{d.demografia.argumento.objecion}</div>
            </Tarjeta>
            <Tarjeta acento={P.musgo}>
              <Rotulo color={P.musgo}>Conclusión que sí se sigue del criterio</Rotulo>
              <div style={{ fontSize: 15, lineHeight: 1.68 }}>{d.demografia.argumento.conclusion_correcta}</div>
            </Tarjeta>
          </div>
        </Seccion>

        {/* ------------------------------------------------- 05 · aritmética */}
        <Seccion id="sec-anexo" numero={5} etapa="Aritmética" titulo={d.anexo1.titulo} sumario={d.anexo1.intro}>
          <BalanzaAnexo anexo={d.anexo1} />

          <div style={{ marginTop: 30, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <Tarjeta acento={P.violeta}>
              <Rotulo color={P.violeta}>Diagnóstico</Rotulo>
              <div style={{ fontSize: 15, lineHeight: 1.68 }}>{d.anexo1.diagnostico}</div>
            </Tarjeta>
            <Tarjeta acento={P.tintaDebil}>
              <Rotulo>Atenuante declarado por los autores</Rotulo>
              <div style={{ fontSize: 15, lineHeight: 1.68, color: P.tintaTenue }}>{d.anexo1.atenuante}</div>
            </Tarjeta>
            <Tarjeta acento={P.musgo}>
              <Rotulo color={P.musgo}>Corrección exigible</Rotulo>
              <div style={{ fontSize: 15, lineHeight: 1.68 }}>{d.anexo1.correccion}</div>
            </Tarjeta>
          </div>

          {/* fórmulas */}
          <div style={{ marginTop: 44 }}>
            <Rotulo color={P.cian}>Las identidades que sostienen esta sección</Rotulo>
            <div style={{ display: "grid", gap: 16 }}>
              {d.formulas.map((f) => (
                <div key={f.id} style={{ border: `1px solid ${P.borde}`, borderRadius: 3, padding: "22px 24px", background: P.superficie }}>
                  <div style={{ fontFamily: TITULAR, fontSize: 18, color: P.tinta, marginBottom: 4 }}>{f.titulo}</div>
                  <Mate html={f.mathml} />
                  <div style={{ fontSize: 15, lineHeight: 1.72, color: P.tintaTenue, maxWidth: 800 }}>{f.lectura}</div>
                  <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${P.borde}` }}>
                    <Rotulo>Variables</Rotulo>
                    <div style={{ display: "grid", gap: 7, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
                      {f.variables.map((v) => (
                        <div key={v.simbolo} style={{ display: "flex", gap: 11, alignItems: "baseline" }}>
                          <span style={{ fontFamily: MONO, fontSize: 15, color: P.cian, minWidth: 34 }}>{v.simbolo}</span>
                          <span style={{ fontSize: 13.5, color: P.tintaTenue, lineHeight: 1.55 }}>{v.nombre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* efecto denominador */}
          <div style={{ marginTop: 44 }}>
            <h3 style={{ fontFamily: TITULAR, fontSize: "clamp(20px, 3vw, 28px)", margin: "0 0 10px", lineHeight: 1.2 }}>
              {d.denominador.titulo}
            </h3>
            <p style={{ color: P.tintaTenue, fontSize: 16, lineHeight: 1.7, maxWidth: 780, marginTop: 0, marginBottom: 24 }}>
              {d.denominador.intro}
            </p>
            <EfectoDenominador datos={d.denominador} aviso={d.meta.aviso_simulacion} />
          </div>

          {/* carencias */}
          <div style={{ marginTop: 48 }}>
            <h3 style={{ fontFamily: TITULAR, fontSize: "clamp(20px, 3vw, 28px)", margin: "0 0 20px", lineHeight: 1.2 }}>
              {d.carencias.titulo}
            </h3>
            <div style={{ display: "grid", gap: 8 }}>
              {d.carencias.items.map((k) => {
                const c = COLOR_PRIORIDAD[k.prioridad];
                return (
                  <div
                    key={k.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0,1fr) minmax(0,1.25fr) auto",
                      gap: 16,
                      alignItems: "center",
                      background: P.superficie,
                      border: `1px solid ${P.borde}`,
                      borderLeft: `3px solid ${c}`,
                      borderRadius: 3,
                      padding: "14px 18px"
                    }}
                  >
                    <span style={{ fontSize: 15, color: P.tinta, lineHeight: 1.55 }}>{k.carencia}</span>
                    <span style={{ fontSize: 14, color: P.tintaTenue, lineHeight: 1.55 }}>{k.coste}</span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 10.5,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: c,
                        border: `1px solid ${c}`,
                        borderRadius: 2,
                        padding: "2px 8px",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {k.prioridad}
                    </span>
                  </div>
                );
              })}
            </div>
            <Leyenda
              items={[
                { etiqueta: "Crítica: sin ella el programa no es evaluable", color: P.bermellon },
                { etiqueta: "Alta", color: P.violeta },
                { etiqueta: "Media", color: P.tintaTenue }
              ]}
              nota={d.carencias.nota}
            />
          </div>
        </Seccion>

        {/* -------------------------------------------- 06 · contrafactuales */}
        <Seccion
          id="sec-contrafactuales"
          numero={6}
          etapa="Riesgo"
          titulo="Seis maneras de que esto salga mal"
          sumario="Ejercicios de plausibilidad con cinco campos obligatorios: supuesto, mecanismo, referente empírico, plausibilidad y condición de falsación. Ninguna cifra de esta sección debe citarse como dato. Pulsa para desplegar."
        >
          <div style={{ display: "grid", gap: 12 }}>
            {d.contrafactuales.map((cf, i) => (
              <Contrafactual key={cf.id} cf={cf} abiertoInicial={i === 0} />
            ))}
          </div>
          <Leyenda
            items={[{ etiqueta: "Nivel de plausibilidad, de 1 a 5 puntos", color: P.ambar }]}
            nota="El ámbar con borde discontinuo está reservado en toda la plataforma para señalar contenido contrafactual. Nunca marca datos observados."
          />
        </Seccion>

        {/* ----------------------------------------------- 07 · comparación */}
        <Seccion
          id="sec-comparacion"
          numero={7}
          etapa="Comparación"
          titulo="Cuatro éxitos y un problema de método"
          sumario={d.comparacion.advertencia}
        >
          <div style={{ display: "grid", gap: 10, marginBottom: 34 }}>
            {d.comparacion.reglas.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  background: P.superficieAlt,
                  border: `1px solid ${P.borde}`,
                  borderRadius: 3,
                  padding: "14px 18px"
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 13, color: P.bermellon, fontWeight: 700 }}>R{i + 1}</span>
                <span style={{ fontSize: 15, lineHeight: 1.68, color: P.tintaTenue }}>{r}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 30 }}>
            {d.comparacion.casos.map((c, i) => (
              <Boton key={c.id} activo={i === caso} color={COLOR_CASO[c.id] || P.cian} onClick={() => setCaso(i)}>
                {c.nombre}
              </Boton>
            ))}
          </div>

          <Caso caso={d.comparacion.casos[caso]} />

          <div style={{ marginTop: 52 }}>
            <h3 style={{ fontFamily: TITULAR, fontSize: "clamp(20px, 3vw, 28px)", margin: "0 0 10px", lineHeight: 1.2 }}>
              Mecanismo, condición, estado en Cuba
            </h3>
            <p style={{ color: P.tintaTenue, fontSize: 16, lineHeight: 1.7, maxWidth: 780, marginTop: 0, marginBottom: 24 }}>
              Lo único que puede hacerse con rigor es identificar mecanismos y preguntar si la condición que los hizo funcionar
              está presente en Cuba. Filtra por estado para ver el balance.
            </p>
            <MatrizMecanismos mecanismos={d.comparacion.mecanismos} casos={d.comparacion.casos} />
          </div>
        </Seccion>

        {/* ---------------------------------------------------- 08 · regla */}
        <Seccion
          id="sec-regla"
          numero={8}
          etapa="Conclusión"
          titulo={d.regla_unica.titulo}
          sumario="Cuatro medidas del documento invierten el orden que la evidencia comparada respalda. Cambia el modo para verlo."
        >
          <ReglaUnica regla={d.regla_unica} />

          <div style={{ marginTop: 52 }}>
            <h3 style={{ fontFamily: TITULAR, fontSize: "clamp(20px, 3vw, 28px)", margin: "0 0 20px", lineHeight: 1.2 }}>
              {d.valoracion.titulo}
            </h3>
            <Valoracion valoracion={d.valoracion} />
          </div>
        </Seccion>

        {/* ----------------------------------------------- 09 · exigencias */}
        <Seccion
          id="sec-exigencias"
          numero={9}
          etapa="Acción"
          titulo="Cinco exigencias mínimas"
          sumario="Ordenadas por lo que impiden si no se cumplen. Ninguna requiere abandonar el programa: todas requieren publicarlo mejor."
        >
          <div style={{ display: "grid", gap: 12 }}>
            {d.exigencias.map((e) => (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  gap: 20,
                  alignItems: "flex-start",
                  background: P.superficie,
                  border: `1px solid ${P.borde}`,
                  borderRadius: 3,
                  padding: "20px 22px"
                }}
              >
                <span style={{ fontFamily: TITULAR, fontSize: 38, color: P.cian, lineHeight: 0.9, minWidth: 42 }}>
                  {e.numero}
                </span>
                <div>
                  <div style={{ fontFamily: TITULAR, fontSize: 17, color: P.tinta, marginBottom: 9, lineHeight: 1.35 }}>
                    {e.titulo}
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, color: P.tintaTenue }}>{e.detalle}</div>
                </div>
              </div>
            ))}
          </div>
        </Seccion>

        {/* ------------------------------------------------- 10 · encuesta */}
        <Seccion id="sec-encuesta" numero={10} etapa="Tu lectura" titulo={d.encuesta.titulo}>
          <Encuesta encuesta={d.encuesta} slug={d.meta.slug} />
        </Seccion>

        {/* --------------------------------------------------- 11 · cierre */}
        <Seccion id="sec-cierre" numero={11} etapa="Cierre" titulo="Que exista una versión 2">
          {d.cierre.parrafos.map((p, i) => (
            <p key={i} style={{ fontSize: 17, lineHeight: 1.72, color: i === 0 ? P.tinta : P.tintaTenue, maxWidth: 820, marginTop: i === 0 ? 0 : 20 }}>
              {p}
            </p>
          ))}
          <blockquote
            style={{
              margin: "36px 0 0",
              borderLeft: `4px solid ${P.cian}`,
              paddingLeft: 24,
              fontFamily: TITULAR,
              fontSize: "clamp(20px, 3.6vw, 34px)",
              lineHeight: 1.3,
              color: P.tinta,
              maxWidth: 880
            }}
          >
            {d.cierre.remate}
          </blockquote>
          <Nota tono="alerta">{d.meta.nota_ecosistema}</Nota>
        </Seccion>

        {/* -------------------------------------------------- 12 · fuentes */}
        <Seccion id="sec-fuentes" numero={12} etapa="Fuentes" titulo="Fuentes">
          <ol style={{ margin: 0, paddingLeft: 22, color: P.tintaTenue, fontSize: 14, lineHeight: 1.9 }}>
            {d.fuentes.map((f) => (
              <li key={f.id} style={{ marginBottom: 6 }}>
                {f.url ? (
                  <a href={f.url} style={{ color: P.cian }} target="_blank" rel="noopener noreferrer">
                    {f.cita}
                  </a>
                ) : (
                  f.cita
                )}
              </li>
            ))}
          </ol>
        </Seccion>

        <footer
          style={{
            borderTop: `1px solid ${P.borde}`,
            marginTop: 56,
            paddingTop: 26,
            fontFamily: MONO,
            fontSize: 11.5,
            color: P.tintaDebil,
            lineHeight: 1.8
          }}
        >
          Yamacoa · {d.meta.slug} · renderer congelado v{d.meta.version}. El archivo .jsx no se modifica tras la publicación;
          solo respira el dataset. Fórmulas en MathML nativo servido desde el dataset. Encuesta sobre base única, clave{" "}
          <span style={{ color: P.tintaTenue }}>slug::pregunta::opcion</span>.
        </footer>
      </div>
    </div>
  );
}
