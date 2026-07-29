import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

/* ============================================================================
   RECONSTRUIR LA NORMA — renderer congelado · v2
   Yamacoa · tema: reconstruccion-civica
   ----------------------------------------------------------------------------
   CONTRATO: este archivo NO se modifica tras la publicación. Solo respira el
   dataset (reconstruccion-civica.json), validado contra
   reconstruccion-civica.schema.json en cada refresco del ciclo de 8 h.
   Las fórmulas se renderizan como MathML nativo servido desde el dataset.
   ============================================================================ */

const RUTA_DATOS =
  ((typeof process !== "undefined" && process.env && process.env.PUBLIC_URL) || "") +
  "/data/reconstruccion-civica.json";

const DATOS_EMBEBIDOS = {
  "meta": {
    "slug": "reconstruccion-civica",
    "titulo": "Reconstruir la norma",
    "subtitulo": "Marginalidad, desciudadanización y las condiciones materiales del cambio cívico en Cuba",
    "descripcion": "Este expediente somete a examen una frase de circulación amplia sobre Cuba: que al cubano se le perdió la cultura cívica. La rechaza como explicación y propone en su lugar una formulación operativa. Un entorno donde decir la verdad tiene coste, cooperar con desconocidos es arriesgado, el oportunismo es rentable, la participación no produce consecuencias visibles y el discurso público contradice la experiencia cotidiana, produce un repertorio conductual adaptativo: doble moral, cinismo defensivo, desconfianza fuera del círculo familiar, repliegue en la supervivencia privada y percepción de nula eficacia colectiva. La diferencia entre ambas formulaciones no es retórica: la primera señala un defecto de carácter y la segunda señala un conjunto de incentivos, que es lo único sobre lo que se puede intervenir.\n\nEl modelo formal trata cada conducta cívica como una decisión con cuatro términos: el saldo material, o coste económico directo de actuar; la sanción social del entorno inmediato; la coherencia identitaria entre la conducta y la imagen que la persona tiene de sí misma; y la expectativa de eficacia, es decir la creencia de que la acción producirá un resultado observable. En el caso cubano, tres de los cuatro están fijados en contra. El corolario es que casi toda la retórica del cambio opera exclusivamente sobre el término identitario, el más barato de manipular y el menos eficaz por sí solo.\n\nLos datos de estado del sistema proceden del VIII Informe sobre el Estado de los Derechos Sociales en Cuba del Observatorio Cubano de Derechos Humanos, basado en 1.344 entrevistas presenciales en 70 municipios de todas las provincias entre el 8 de junio y el 11 de julio de 2025, con un margen de error de ±2,73 % y un nivel de confianza del 95,45 %. El 89 % de los hogares vive en pobreza extrema, el 78 % quiere emigrar o conoce a alguien que quiere, el 92 % desaprueba la gestión económica y social, y solo el 3,39 % de las personas de 18 a 30 años declara una visión favorable del gobierno. El 3 % menciona el embargo como preocupación. El expediente sostiene que el dato relevante no es la pobreza sino la coexistencia de una desaprobación casi universal con una participación cívica casi nula: esa brecha es la firma de una norma pluralista invertida, donde casi todos piensan algo que casi nadie cree que los demás piensen.\n\nLa comparación con la Cuba anterior a 1959 se presenta con una advertencia metodológica explícita: no es posible una comparación cuantitativa rigurosa, porque las series previas son fragmentarias y las posteriores a 1962 emplean Producto Social Global, incompatible con las cuentas nacionales estándar. Se comparan magnitudes puntuales etiquetadas y, sobre todo, estructuras. Lo que se perdió, según la tesis, no fue una virtud moral sino una capacidad instalada de coordinación horizontal: órdenes fraternales con unos 29.000 miembros y más de 300 logias, la Asociación de Dependientes del Comercio de La Habana con más de 76.000 asociados en 1957, al menos 135 sociedades mutualistas sanitarias en La Habana ya en 1927, y una red hospitalaria de 87 centros públicos y 250 privados en 1958.\n\nCuatro casos externos delimitan lo que es transferible y lo que no. Bogotá redujo su tasa de homicidios de 55 a 25 por cada 100.000 habitantes entre 1995 y 2003 sin aumentar el pie de fuerza policial, aunque el expediente advierte que hubo reformas simultáneas y que no existe identificación causal limpia. Georgia llevó en dos años la proporción de conductores a quienes la policía pedía soborno del 70 % al 1 %, pero por demolición institucional y bajo un gobierno no democrático: solo aplicable en un escenario post-transición. Estonia movilizó 50.000 voluntarios en un solo día de 2008, el 4 % de su población, tras haber mapeado antes 10.656 puntos con teléfonos móviles y reunido más de 500 socios organizadores; es el único caso ejecutable sin cambio político previo. Las transiciones negociadas de España, Chile y Brasil tomaron entre 15 y 25 años y dependieron de cuatro condiciones que hoy están ausentes en Cuba.\n\nEl expediente incorpora la literatura sobre ventanas rotas con una corrección importante: la evidencia acumulada indica que reparar el entorno físico produce efectos medibles, mientras que perseguir infracciones menores no los produce de forma significativa. La restauración de terrenos baldíos en Filadelfia redujo un 13,3 % los delitos totales y un 29,1 % la violencia con armas. Un experimento de viñetas del Banco Interamericano de Desarrollo muestra que, ante la misma sanción, el trato respetuoso eleva 18 puntos porcentuales la satisfacción y 11 la disposición a cooperar. La ventana rota mayor, sostiene el texto, es la institucional: una autoridad que incumple sus propias reglas comunica con más fuerza que cualquier grafiti que las normas son para los subordinados.\n\nEl cierre propone una secuencia verificable de cuatro fases, de los primeros seis meses a los cinco años, un índice de cinco componentes para medir el avance, una lista de contraindicaciones y una condición explícita de falsación: la tesis quedaría refutada si un piloto controlado a 24 meses mostrara victorias colectivas repetidas y verificables sin aumento medible de la confianza generalizada. No hay que reprogramar culturalmente a la población; hay que construir entornos donde decir la verdad, cooperar, discrepar y actuar cívicamente dejen de ser conductas suicidas o inútiles.",
    "narracion": "Este expediente rechaza una frase muy repetida: que al cubano se le perdió la cultura cívica. Propone otra formulación. Un entorno donde decir la verdad tiene coste, donde cooperar con desconocidos es arriesgado y donde participar no produce consecuencias visibles, genera un repertorio adaptativo. Doble moral, desconfianza y repliegue en lo privado. La conducta se modela con cuatro términos: saldo material, sanción social, coherencia identitaria y expectativa de eficacia. En Cuba tres están fijados en contra. Casi toda la retórica del cambio opera solo sobre el cuarto, el más barato de manipular y el menos eficaz por sí solo. El Observatorio Cubano de Derechos Humanos entrevistó a mil trescientas cuarenta y cuatro personas en setenta municipios durante 2025. Reporta que el noventa y dos por ciento desaprueba la gestión económica. Y que el ochenta y nueve por ciento de los hogares vive en pobreza extrema. Esa desaprobación casi universal convive con una participación cívica casi nula. Lo que se perdió no fue una virtud moral, sino una capacidad instalada de coordinación horizontal. Bogotá movió conducta en ocho años sin ampliar la policía. Estonia movilizó cincuenta mil voluntarios en un solo día de 2008, tras mapear antes más de diez mil puntos de residuos. La conclusión no pide reprogramar a nadie. Pide construir entornos donde cooperar y discrepar dejen de ser conductas inútiles.",
    "version": "1.0.0",
    "actualizado": "2026-07-27",
    "ciclo_horas": 8,
    "nota_ecosistema": "Buena parte de la evidencia sobre la Cuba contemporánea procede de organizaciones con orientaciones normativas convergentes. Los sesgos de selección y definición pueden heredarse a lo largo de la cadena. Toda cifra de ese ecosistema sin contraste independiente se etiqueta como reportado aunque su metodología esté publicada.",
    "aviso_simulacion": "Los controles interactivos de esta página son exploraciones de forma funcional, no predicciones. Ningún valor que produzcan es un dato observado y ninguno debe citarse."
  },
  "tesis": {
    "formulacion_rechazada": "Al cubano se le perdió la cultura cívica.",
    "formulacion_operativa": "Un entorno donde decir la verdad tiene coste, cooperar con desconocidos es arriesgado, el oportunismo es rentable, la participación no produce consecuencias visibles y el discurso público contradice la experiencia cotidiana, produce un repertorio conductual adaptativo: doble moral, cinismo defensivo, desconfianza extrafamiliar, repliegue en la supervivencia privada y percepción de nula eficacia colectiva.",
    "cierre": "No hay que reprogramar culturalmente a la población. Hay que construir entornos donde decir la verdad, cooperar, discrepar y actuar cívicamente dejen de ser conductas suicidas o inútiles."
  },
  "modelo": {
    "formula": "Pr(b_i) ∝ exp[ β_M·M_i + β_S·S_i + β_I·I_i + β_E·E_i ]",
    "terminos": [
      {
        "clave": "M",
        "simbolo": "M_i",
        "nombre": "Saldo material",
        "descripcion": "Recompensa o coste económico directo de la conducta.",
        "estado_cuba": "Fijado en contra",
        "mathml": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><msub><mi>M</mi><mi>i</mi></msub></math>"
      },
      {
        "clave": "S",
        "simbolo": "S_i",
        "nombre": "Sanción social",
        "descripcion": "Aprobación o castigo por parte del entorno inmediato.",
        "estado_cuba": "Fijado en contra",
        "mathml": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><msub><mi>S</mi><mi>i</mi></msub></math>"
      },
      {
        "clave": "I",
        "simbolo": "I_i",
        "nombre": "Coherencia identitaria",
        "descripcion": "Ajuste entre la conducta y la imagen que la persona tiene de sí misma.",
        "estado_cuba": "Único término que la retórica manipula",
        "mathml": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><msub><mi>I</mi><mi>i</mi></msub></math>"
      },
      {
        "clave": "E",
        "simbolo": "E_i",
        "nombre": "Expectativa de eficacia",
        "descripcion": "Creencia de que la acción producirá un resultado observable.",
        "estado_cuba": "Fijado en contra",
        "mathml": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><msub><mi>E</mi><mi>i</mi></msub></math>"
      }
    ],
    "corolario": "Casi toda la retórica del cambio opera exclusivamente sobre I_i, el término más barato de manipular y el menos eficaz por sí solo.",
    "mathml_probabilidad": "<math display=\"block\" xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><mi>Pr</mi><mo form=\"prefix\" stretchy=\"false\">(</mo><msub><mi>b</mi><mi>i</mi></msub><mo form=\"postfix\" stretchy=\"false\">)</mo><mo>=</mo><mi>σ</mi><mo form=\"prefix\" stretchy=\"false\">(</mo><msub><mi>z</mi><mi>i</mi></msub><mo form=\"postfix\" stretchy=\"false\">)</mo><mo>=</mo><mfrac><mn>1</mn><mrow><mn>1</mn><mo>+</mo><msup><mi>e</mi><mrow><mo>−</mo><msub><mi>z</mi><mi>i</mi></msub></mrow></msup></mrow></mfrac></mrow></math>",
    "mathml_indice": "<math display=\"block\" xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msub><mi>z</mi><mi>i</mi></msub><mo>=</mo><msub><mi>β</mi><mi>M</mi></msub><msub><mi>M</mi><mi>i</mi></msub><mo>+</mo><msub><mi>β</mi><mi>S</mi></msub><msub><mi>S</mi><mi>i</mi></msub><mo>+</mo><msub><mi>β</mi><mi>I</mi></msub><msub><mi>I</mi><mi>i</mi></msub><mo>+</mo><msub><mi>β</mi><mi>E</mi></msub><msub><mi>E</mi><mi>i</mi></msub><mo>−</mo><mi>τ</mi></mrow></math>",
    "especificacion": "Se especifica como logit binario: z es la ventaja neta de la conducta cívica frente a la alternativa de supervivencia privada, y τ el umbral de indiferencia. La forma exp[·] del planteamiento original es la razón de verosimilitudes entre ambas opciones; la sigmoide es su consecuencia directa, no un supuesto adicional.",
    "betas": {
      "M": 1.2,
      "S": 1,
      "I": 0.6,
      "E": 1.4,
      "tau": 2.1,
      "escala": 2,
      "confianza": "estimado",
      "procedencia": "Pesos asignados por lectura de los mecanismos documentados en los casos externos. No estimados econométricamente: sirven para explorar la forma de la curva, no para predecir magnitudes."
    },
    "lectura_curva": "La sigmoide tiene dos regiones planas y una pendiente central. Cuba hoy está en la cola izquierda, donde la derivada es casi nula: ahí un aumento grande en cualquier término produce un cambio minúsculo en la conducta. Ese es el argumento cuantitativo contra la estrategia de relato: no es que I_i no importe, es que en esa región nada importa por separado.",
    "escenarios": [
      {
        "id": "cuba",
        "nombre": "Cuba hoy",
        "M": 8,
        "S": 12,
        "I": 45,
        "E": 6,
        "confianza": "estimado",
        "nota": "Asignación cualitativa a partir del diagnóstico, no medida."
      },
      {
        "id": "bogota",
        "nombre": "Bogotá 1995–2003",
        "M": 25,
        "S": 90,
        "I": 65,
        "E": 70,
        "confianza": "estimado",
        "nota": "Derivado de los mecanismos documentados del caso."
      },
      {
        "id": "georgia",
        "nombre": "Georgia 2004–2006",
        "M": 85,
        "S": 95,
        "I": 30,
        "E": 60,
        "confianza": "estimado",
        "nota": "Derivado de los mecanismos documentados del caso."
      },
      {
        "id": "estonia",
        "nombre": "Estonia 2008",
        "M": 15,
        "S": 60,
        "I": 55,
        "E": 95,
        "confianza": "estimado",
        "nota": "Derivado de los mecanismos documentados del caso."
      },
      {
        "id": "transiciones",
        "nombre": "Transiciones negociadas",
        "M": 40,
        "S": 55,
        "I": 50,
        "E": 80,
        "confianza": "estimado",
        "nota": "Derivado de los mecanismos documentados del caso."
      }
    ]
  },
  "estado_sistema": {
    "fuente": "OCDH, VIII Informe sobre el Estado de los Derechos Sociales en Cuba",
    "procedencia": "1.344 entrevistas presenciales, 70 municipios de todas las provincias, 8 jun – 11 jul 2025",
    "margen_error": "±2,73 %",
    "nivel_confianza": "95,45 %",
    "confianza": "reportado",
    "lectura": "El dato relevante no es la pobreza: es la coexistencia de desaprobación casi universal con participación cívica casi nula. Esa brecha es la firma de una norma pluralista invertida.",
    "indicadores": [
      {
        "id": "pobreza",
        "etiqueta": "Hogares en pobreza extrema",
        "valor": 89,
        "unidad": "%",
        "confianza": "reportado"
      },
      {
        "id": "emigrar",
        "etiqueta": "Quiere emigrar o conoce a alguien que quiere",
        "valor": 78,
        "unidad": "%",
        "confianza": "reportado"
      },
      {
        "id": "emigrar_joven",
        "etiqueta": "Intención de emigrar, 18–30 años",
        "valor": 76,
        "unidad": "%",
        "confianza": "reportado"
      },
      {
        "id": "desaprueba",
        "etiqueta": "Desaprueba la gestión económica y social",
        "valor": 92,
        "unidad": "%",
        "confianza": "reportado"
      },
      {
        "id": "favorable_joven",
        "etiqueta": "Visión favorable del gobierno, 18–30 años",
        "valor": 3.39,
        "unidad": "%",
        "confianza": "reportado"
      },
      {
        "id": "embargo",
        "etiqueta": "Menciona el embargo como preocupación",
        "valor": 3,
        "unidad": "%",
        "confianza": "reportado"
      }
    ]
  },
  "comparacion_interna": {
    "nota_metodologica": "No es posible una comparación cuantitativa rigurosa entre 1958 y 2026. Las series anteriores a 1959 son fragmentarias y las posteriores a 1962 emplean Producto Social Global, incompatible con cuentas nacionales estándar. No hay tendencias paralelas verificables ni control válido: cualquier diseño de diferencias-en-diferencias sobre este par sería indefendible. Se comparan magnitudes puntuales etiquetadas y, sobre todo, estructuras.",
    "tesis": "Lo que se perdió no fue una virtud moral: fue una capacidad instalada de coordinación horizontal.",
    "existente": [
      {
        "id": "partidos",
        "descripcion": "Partidos de todas las tendencias, incluido el socialista, con prensa y emisoras propias",
        "magnitud": null,
        "anio": "pre-1952",
        "confianza": "confirmado",
        "procedencia": "Romeu, Caribbean Studies 41(1), 2013"
      },
      {
        "id": "logias",
        "descripcion": "Órdenes fraternales con decenas de miles de miembros y cientos de logias en toda la isla",
        "magnitud": "≈29.000 miembros y +300 logias (Gran Logia de Cuba, ya bajo el régimen posterior)",
        "anio": "1958 / posterior",
        "confianza": "confirmado",
        "procedencia": "Romeu (2011, 2013); Gunn (1995)"
      },
      {
        "id": "dependientes",
        "descripcion": "Asociación de Dependientes del Comercio de La Habana",
        "magnitud": "+76.000 asociados; patrimonio social ≈5 millones de pesos",
        "anio": "1957",
        "confianza": "reportado",
        "procedencia": "Juventud Rebelde, columna 'Casas de salud' (2011)"
      },
      {
        "id": "hijas_galicia",
        "descripcion": "Hijas de Galicia (mujeres y menores)",
        "magnitud": "≈36.000 personas atendidas; 39 médicos; 206 pacientes/día internados",
        "anio": "1956",
        "confianza": "reportado",
        "procedencia": "Juventud Rebelde (2011)"
      },
      {
        "id": "sociedades_habana",
        "descripcion": "Sociedades mutualistas sanitarias en La Habana",
        "magnitud": "≥135 sociedades",
        "anio": "1927",
        "confianza": "reportado",
        "procedencia": "La Jiribilla, 'Salud, dinero…o al revés'"
      },
      {
        "id": "benefica",
        "descripcion": "Quinta La Benéfica, Centro Gallego",
        "magnitud": "≈600 camas, todas las especialidades clínicas y quirúrgicas",
        "anio": "mediados del s. XX",
        "confianza": "reportado",
        "procedencia": "Rev. Cubana de Salud Pública (SciELO Cuba), 2015"
      },
      {
        "id": "hospitales",
        "descripcion": "Hospitales públicos y privados más casas de socorro",
        "magnitud": "87 públicos, 250 privados, ≈200 casas de socorro",
        "anio": "1958",
        "confianza": "reportado",
        "procedencia": "Cifra de amplia circulación en medios del exilio; cadena documental primaria no verificada. No se usa para ninguna inferencia."
      },
      {
        "id": "asociaciones_locales",
        "descripcion": "Liceos, casinos, colegios profesionales, sindicatos, asociaciones juveniles y sociedades regionales en cada pueblo; asociaciones fundadas y dirigidas por mujeres (Lyceum, Pro-Arte Musical)",
        "magnitud": null,
        "anio": "pre-1952",
        "confianza": "confirmado",
        "procedencia": "Romeu, Caribbean Studies 41(1), 2013"
      }
    ],
    "ausente": [
      {
        "id": "batista",
        "descripcion": "Desde el golpe de 1952 el propio régimen militar debilitó la sociedad civil: proscripción del Partido Socialista, control de sindicatos, cierre de periódicos, suspensión de garantías",
        "confianza": "confirmado",
        "procedencia": "Romeu (2013)"
      },
      {
        "id": "rural",
        "descripcion": "La densidad asociativa era abrumadoramente urbana y concentrada en La Habana",
        "confianza": "estimado",
        "procedencia": "Inferencia a partir de la localización documentada de las instituciones"
      },
      {
        "id": "racial",
        "descripcion": "Segregación racial de facto: las sociedades de color existían porque los clubes y sociedades blancos excluían",
        "confianza": "confirmado",
        "procedencia": "Historiografía del asociacionismo cubano"
      },
      {
        "id": "contributivo",
        "descripcion": "Mutualismo sanitario de acceso contributivo, no universal: quien no cotizaba, no accedía",
        "confianza": "confirmado",
        "procedencia": "La Jiribilla; SciELO Cuba (2015)"
      }
    ],
    "reemplazo": {
      "descripcion": "Comités vecinales, asociaciones campesinas, juveniles y femeninas y sindicato único: una vertebración estatal de la sociedad civil entre 1960 y 1961.",
      "mecanismo": "Su función no fue solo controlar, sino ocupar el espacio de la reciprocidad. Cuando el vecino que organiza la cuadra es también quien informa sobre la cuadra, cooperar con desconocidos deja de ser neutro y pasa a ser un riesgo evaluable.",
      "confianza": "confirmado",
      "procedencia": "Rojas, La soledad constitucional del socialismo cubano"
    }
  },
  "contrafactuales": [
    {
      "id": "c1",
      "codigo": "C1",
      "titulo": "Sin estatización asociativa (1960–1961)",
      "supuesto": "La revolución mantiene el aparato asociativo preexistente —logias, colegios profesionales, mutualistas, prensa plural— aun bajo hegemonía política del nuevo poder.",
      "referencia_externa": "España, Brasil, Chile y México mantuvieron, bajo autoritarismos o hegemonías de partido, espacios asociativos parciales que después generaron interlocutores para negociar la apertura.",
      "plausibilidad": "media-baja",
      "justificacion_plausibilidad": "El supuesto es débil: la absorción asociativa no fue un efecto colateral sino un objetivo explícito del proyecto.",
      "corolario": "La variable que separa a Cuba de España, Chile y Brasil no es la dureza de la represión —Pinochet fue brutal— sino la supervivencia de estructuras horizontales con las que negociar."
    },
    {
      "id": "c2",
      "codigo": "C2",
      "titulo": "Crisis de los 90 con libertad de asociación",
      "supuesto": "El colapso del subsidio soviético ocurre en un país con derecho de asociación efectivo.",
      "referencia_externa": "Estonia sufrió un shock comparable tras 1991 y quince años después movilizó 50.000 voluntarios en un día.",
      "plausibilidad": "media",
      "justificacion_plausibilidad": "El Período Especial sí produjo cooperación real —trueque, solidaridad de barrio, ayuda de iglesias— pero informal, no acumulable y no convertible en capital organizativo.",
      "corolario": "La diferencia con Estonia no está en la disposición a cooperar, sino en si la cooperación puede institucionalizarse sin ser criminalizada."
    },
    {
      "id": "c3",
      "codigo": "C3",
      "titulo": "El contrafactual del éxodo",
      "supuesto": "La válvula migratoria permanece cerrada desde 1959, o los emigrados pueden regresar con capital y experiencia.",
      "referencia_externa": "Los emigrantes españoles de los años 60 regresaron con capital y formación político-social que aplicaron en la transición. Los cubanos regresan, en el mejor de los casos, como turistas con restricciones.",
      "plausibilidad": "alta en el mecanismo, indeterminada en la magnitud",
      "justificacion_plausibilidad": "Es altamente plausible que la emigración haya drenado los perfiles con mayor propensión organizativa. No es cuantificable con los datos existentes: cualquier cifra al respecto debe considerarse inventada.",
      "corolario": "Una estrategia que dependa de la diáspora como actor principal reproduce el problema: su existencia misma es el síntoma del drenaje."
    }
  ],
  "casos_externos": [
    {
      "id": "bogota",
      "caso": "Bogotá",
      "pais": "Colombia",
      "periodo": "1995–2003",
      "palanca_dominante": "Sanción social + eficacia",
      "palancas": {
        "M": 25,
        "S": 90,
        "I": 65,
        "E": 70
      },
      "velocidad": "8 años",
      "democratico": true,
      "transferibilidad": "Parcial: requiere gobierno local con autonomía",
      "mecanismo": "Señales normativas de bajo coste y alta visibilidad: mimos regulando el paso de cebra, tarjetas de aprobación y desaprobación entre ciudadanos, restricción horaria nocturna.",
      "indicadores": [
        {
          "etiqueta": "Tasa de homicidios (por 100.000)",
          "antes": 55,
          "despues": 25,
          "unidad": "",
          "confianza": "reportado",
          "procedencia": "Prensa colombiana; cifra recurrente"
        },
        {
          "etiqueta": "Homicidios absolutos",
          "antes": 3665,
          "despues": 1605,
          "unidad": "",
          "confianza": "reportado",
          "procedencia": "El Espectador"
        },
        {
          "etiqueta": "Muertes en tránsito (por 100.000)",
          "antes": 24,
          "despues": 7,
          "unidad": "",
          "confianza": "reportado",
          "procedencia": "El Tiempo"
        }
      ],
      "advertencias": [
        "Existe discrepancia entre fuentes sobre las cifras exactas y el punto de partida.",
        "Coincide con inversión en infraestructura, reforma fiscal y cambios policiales simultáneos: no hay identificación causal limpia que atribuya la caída al componente 'cultura ciudadana' aisladamente.",
        "La tasa nacional colombiana subió de 60 a 72 entre 1998 y 2002, lo que refuerza la singularidad bogotana pero no resuelve la identificación."
      ],
      "hallazgo_solido": "Se logró sin aumentar el pie de fuerza policial: se puede mover conducta sin ampliar coerción."
    },
    {
      "id": "georgia",
      "caso": "Georgia",
      "pais": "Georgia",
      "periodo": "2004–2006",
      "palanca_dominante": "Saldo material + sanción visible",
      "palancas": {
        "M": 85,
        "S": 95,
        "I": 30,
        "E": 60
      },
      "velocidad": "2 años",
      "democratico": false,
      "transferibilidad": "Solo en escenario post-transición",
      "mecanismo": "Demolición institucional, sustitución de personal, salarios viables y sanción visible: las detenciones por corrupción se filmaron y difundieron. La norma no cambió porque se explicara que sobornar está mal, sino porque la sanción se volvió observable.",
      "indicadores": [
        {
          "etiqueta": "Conductores a quienes la policía pedía soborno",
          "antes": 70,
          "despues": 1,
          "unidad": "%",
          "confianza": "reportado",
          "procedencia": "Encuesta 2000 (antes); sondeo posterior citado en prensa especializada"
        },
        {
          "etiqueta": "Opinión positiva sobre la policía",
          "antes": 2.3,
          "despues": null,
          "unidad": "%",
          "confianza": "reportado",
          "procedencia": "Encuesta 2003 citada por Saakashvili — parte interesada"
        },
        {
          "etiqueta": "Puesto en el Índice de Percepción de la Corrupción",
          "antes": 124,
          "despues": 64,
          "unidad": "",
          "confianza": "reportado",
          "procedencia": "Transparency International (base 133 países en 2003)"
        }
      ],
      "series_confianza": {
        "etiqueta": "Caucasus Barometer, 2008–2021",
        "confianza_min": 45,
        "desconfianza_max": 21,
        "confianza": "confirmado",
        "procedencia": "Caucasus Barometer, serie 2008–2020"
      },
      "advertencias": [
        "El proceso fue vertical y estatal, no democratizador.",
        "No eliminó la interferencia política en la policía y solo redujo parcialmente la impunidad policial.",
        "Organizaciones de monitoreo señalaron después condenas desproporcionadas por delitos menores.",
        "Las cifras de efectivos despedidos discrepan entre fuentes: entre ≈15.000 y ≈30.000, o entre 80 % y 85 % del cuerpo."
      ],
      "hallazgo_solido": "Una norma predatoria puede voltearse en dos años. Voltearla por vía autoritaria deja pasivos."
    },
    {
      "id": "estonia",
      "caso": "Estonia — Teeme Ära",
      "pais": "Estonia",
      "periodo": "2008",
      "palanca_dominante": "Expectativa de eficacia",
      "palancas": {
        "M": 15,
        "S": 60,
        "I": 55,
        "E": 95
      },
      "velocidad": "1 día, repetido anualmente",
      "democratico": true,
      "transferibilidad": "Alta: es lo único ejecutable sin cambio político previo",
      "mecanismo": "La infraestructura de coordinación se construyó antes del acto simbólico: 10.656 puntos mapeados por voluntarios con teléfonos móviles, más de 500 socios organizadores, equipos autoconstituidos de 3 a 15 personas con instrucciones enviadas por correo.",
      "indicadores": [
        {
          "etiqueta": "Voluntarios movilizados en un día",
          "antes": 0,
          "despues": 50000,
          "unidad": "",
          "confianza": "confirmado",
          "procedencia": "Let's Do It! / Teeme Ära, documentación del evento del 3 may 2008"
        },
        {
          "etiqueta": "Participación sobre población total",
          "antes": 0,
          "despues": 4,
          "unidad": "%",
          "confianza": "confirmado",
          "procedencia": "Ídem (población ≈1,3 millones)"
        },
        {
          "etiqueta": "Residuos ilegales retirados (toneladas)",
          "antes": 0,
          "despues": 10000,
          "unidad": "",
          "confianza": "confirmado",
          "procedencia": "Ídem, en ≈5 horas"
        }
      ],
      "difusion": [
        {
          "pais": "Letonia",
          "anio": 2008,
          "voluntarios": 40000,
          "confianza": "reportado"
        },
        {
          "pais": "Lituania y Letonia",
          "anio": 2009,
          "voluntarios": 150000,
          "confianza": "reportado"
        },
        {
          "pais": "Eslovenia",
          "anio": 2010,
          "voluntarios": 250000,
          "confianza": "reportado"
        }
      ],
      "advertencias": [
        "La comparación de coste (≈500.000 € frente a una estimación de 22,5 millones y tres años por vía estatal) procede de la propia organización: reportado, no auditado."
      ],
      "hallazgo_solido": "Una demostración de eficacia colectiva es exportable entre países postsoviéticos de baja confianza. No requiere virtud cívica preexistente: requiere un mapa, un día y ausencia de castigo por reunirse."
    },
    {
      "id": "transiciones",
      "caso": "España · Chile · Brasil",
      "pais": "Transiciones negociadas",
      "periodo": "1975–2000",
      "palanca_dominante": "Capacidad organizativa acumulada",
      "palancas": {
        "M": 40,
        "S": 55,
        "I": 50,
        "E": 80
      },
      "velocidad": "15–25 años",
      "democratico": true,
      "transferibilidad": "Precondición, no intervención",
      "mecanismo": "Los autoritarismos toleraron espacios asociativos alternativos —el PMDB brasileño, los clubes y sindicatos tardofranquistas, la Concertación chilena— que después funcionaron como contraparte negociadora.",
      "indicadores": [],
      "condiciones": [
        {
          "condicion": "Surgimiento interno tolerado de grupos alternativos",
          "presente_en_cuba": false
        },
        {
          "condicion": "Independencia de los grupos respecto del extranjero",
          "presente_en_cuba": false
        },
        {
          "condicion": "Disposición a negociar por ambas partes",
          "presente_en_cuba": false
        },
        {
          "condicion": "Acompañamiento internacional imparcial",
          "presente_en_cuba": false
        }
      ],
      "advertencias": [
        "Que la sociedad civil previa fuera condición necesaria es una inferencia (estimado), no un resultado identificado."
      ],
      "hallazgo_solido": "Las cuatro condiciones están ausentes en el caso cubano. No es un pronóstico: es la lista de tareas."
    }
  ],
  "ventanas_rotas": {
    "aclaracion": "La evidencia respalda reparar el entorno con participación comunitaria. No respalda perseguir infracciones menores.",
    "keizer": {
      "descripcion": "Seis experimentos de campo en Groningen. El hallazgo no fue que las personas imitaran una conducta, sino que la violación visible de una norma debilita el cumplimiento de otras normas distintas.",
      "confianza": "confirmado",
      "procedencia": "Keizer, Lindenberg y Steg, The Spreading of Disorder, Science",
      "experimentos": [
        {
          "id": "k1",
          "senal": "Pared limpia vs. con grafitis",
          "conducta": "Tirar un folleto",
          "ordenado": 33,
          "desordenado": 69,
          "n": 154
        },
        {
          "id": "k2",
          "senal": "Bicicletas cumpliendo vs. incumpliendo",
          "conducta": "Atravesar acceso prohibido",
          "ordenado": 27,
          "desordenado": 82,
          "n": 93
        },
        {
          "id": "k3",
          "senal": "Carritos devueltos vs. abandonados",
          "conducta": "Tirar un folleto",
          "ordenado": 30,
          "desordenado": 58,
          "n": null
        },
        {
          "id": "k4",
          "senal": "Silencio vs. petardos ilegales",
          "conducta": "Tirar un folleto",
          "ordenado": 52,
          "desordenado": 80,
          "n": null
        },
        {
          "id": "k5",
          "senal": "Buzón limpio vs. con grafitis",
          "conducta": "Robar un sobre con 5 €",
          "ordenado": 13,
          "desordenado": 27,
          "n": null
        },
        {
          "id": "k6",
          "senal": "Suelo limpio vs. con basura",
          "conducta": "Robar un sobre con 5 €",
          "ordenado": 13,
          "desordenado": 25,
          "n": null
        }
      ],
      "limitacion": "Prueban efectos conductuales inmediatos y locales, no transformación cultural duradera. Los dos experimentos de robo quedaron cerca del umbral convencional de significación."
    },
    "braga": {
      "descripcion": "Revisión sistemática y metaanálisis actualizado de programas de control del desorden.",
      "confianza": "confirmado",
      "procedencia": "Braga et al., Disorder policing to reduce crime, Criminology & Public Policy, 2024",
      "comparaciones_totales": 54,
      "reduccion_media": 26.2,
      "heterogeneidad": "Elevada entre estudios: la media no representa por igual a todos los programas ni contextos.",
      "tipos": [
        {
          "tipo": "Policía comunitaria y resolución de problemas",
          "comparaciones": 35,
          "efecto": -33.1,
          "significativo": true
        },
        {
          "tipo": "Mantenimiento agresivo del orden (tolerancia cero)",
          "comparaciones": 19,
          "efecto": null,
          "significativo": false,
          "nota": "Efecto pequeño y no significativo"
        }
      ]
    },
    "filadelfia": {
      "descripcion": "Ensayo aleatorizado por conglomerados: restauración de terrenos baldíos en barrios bajo el umbral de pobreza.",
      "confianza": "confirmado",
      "procedencia": "Branas et al., PNAS",
      "efectos": [
        {
          "etiqueta": "Delitos totales",
          "valor": -13.3,
          "unidad": "%"
        },
        {
          "etiqueta": "Violencia con armas",
          "valor": -29.1,
          "unidad": "%"
        },
        {
          "etiqueta": "Robos en inmuebles",
          "valor": -21.9,
          "unidad": "%"
        },
        {
          "etiqueta": "Conductas incívicas",
          "valor": -30.3,
          "unidad": "%"
        },
        {
          "etiqueta": "Preocupación al salir de casa",
          "valor": -57.8,
          "unidad": "%"
        },
        {
          "etiqueta": "Uso del exterior para descansar y socializar",
          "valor": 75.7,
          "unidad": "%"
        }
      ],
      "lectura": "El último indicador es el culturalmente decisivo: no midió menos delito, midió más apropiación social del espacio."
    },
    "honduras": {
      "descripcion": "Experimento de viñetas con civiles y policías: efecto del trato respetuoso.",
      "confianza": "confirmado",
      "procedencia": "BID, Procedural Justice and Police Legitimacy: Evidence from a Vignette Experiment in Central America",
      "efectos": [
        {
          "etiqueta": "Satisfacción",
          "valor": 18,
          "unidad": "pp"
        },
        {
          "etiqueta": "Aceptación de la decisión",
          "valor": 15,
          "unidad": "pp"
        },
        {
          "etiqueta": "Disposición a cooperar",
          "valor": 11,
          "unidad": "pp"
        }
      ],
      "lectura": "Regla clara + consecuencia predecible + procedimiento respetuoso. El trato respetuoso compensa en buena medida el deterioro de legitimidad asociado a imponer una sanción."
    },
    "ventana_institucional": "La ventana rota más grande de Cuba no es la basura. Es la institucional: una autoridad que incumple sus propias reglas comunica, con más fuerza que cualquier grafiti, que las normas son para los subordinados."
  },
  "acciones": [
    {
      "id": "ahora",
      "nivel": "Ejecutable ahora",
      "condicion": "No requiere permiso ni cambio político",
      "items": [
        {
          "titulo": "Medir expectativas de segundo orden",
          "detalle": "No «¿confía usted en el sistema?», sino «¿qué porcentaje de sus vecinos cree usted que piensa X?» frente a lo que efectivamente piensan. La brecha entre ambas distribuciones es el objeto de intervención."
        },
        {
          "titulo": "Publicar normas descriptivas verdaderas y agregadas",
          "detalle": "«El 92 % desaprueba la gestión del gobierno» es una intervención normativa, no una noticia: corrige la creencia de segundo orden. Nunca cifras inventadas: una norma descriptiva falsa, al descubrirse, destruye la confianza que pretendía crear."
        },
        {
          "titulo": "Nunca señalar individuos",
          "detalle": "Mostrar historiales electorales de vecinos elevó la participación 8,1 puntos frente a 1,8 de una apelación al deber cívico, sobre una base de 29,7 % (Michigan, confirmado). Pero es coercitivo y en contexto represivo pondría a personas en riesgo. Se usa el mecanismo, no la implementación."
        },
        {
          "titulo": "Infraestructura de verdad",
          "detalle": "Archivos, testimonios con protocolo verificable, corrección pública de errores propios, separación explícita entre información, opinión y activismo, transparencia de fuentes y financiación. Es acumulable y no requiere autorización."
        },
        {
          "titulo": "Inoculación informativa (prebunking)",
          "detalle": "Enseñar a reconocer falsos dilemas, descontextualización, conspiracionismo, apelaciones identitarias y fabricación de consenso. El efecto decae y requiere refuerzos periódicos. Aplicable también —sobre todo— a los mensajes del propio campo reformador."
        },
        {
          "titulo": "Reconocimiento horizontal",
          "detalle": "Trasladar prestigio hacia quien cumple su palabra, reconoce un error, coopera fuera de su círculo, protege bienes comunes o discrepa sin humillar. No mediante premios grandilocuentes, que se leen como propaganda."
        }
      ]
    },
    {
      "id": "apertura",
      "nivel": "Requiere apertura parcial",
      "condicion": "Necesita tolerancia a la reunión y al presupuesto visible",
      "items": [
        {
          "titulo": "Proyectos comunitarios pequeños",
          "detalle": "Presupuesto visible y mérito no apropiado por una estructura superior. Modelo Estonia."
        },
        {
          "titulo": "Reparación física del entorno",
          "detalle": "Responsables identificables y tiempos de respuesta publicados. Modelo Filadelfia."
        },
        {
          "titulo": "Medios locales verificables y círculos profesionales independientes",
          "detalle": "Estructuras horizontales con producción propia y trazable."
        }
      ]
    },
    {
      "id": "transicion",
      "nivel": "Requiere transición",
      "condicion": "No ejecutable bajo el arreglo institucional actual",
      "items": [
        {
          "titulo": "Reforma institucional",
          "detalle": "Reglas públicas, decisiones motivadas, presupuestos auditables, protección al denunciante, apelación real, rotación de responsabilidades y sanciones predecibles."
        },
        {
          "titulo": "Volteo de normas de corrupción",
          "detalle": "Tipo Georgia, con la advertencia explícita de que aquel modelo fue autoritario y dejó pasivos que Cuba no debería importar."
        }
      ]
    }
  ],
  "secuencia": [
    {
      "id": "s1",
      "periodo": "0–6 meses",
      "objetivo": "Diagnóstico",
      "intervenciones": [
        "Mapas de confianza",
        "Expectativas de segundo orden",
        "Experimentos de cooperación",
        "Identificación de referentes locales"
      ],
      "verificable_por": "Publicación de la brecha creencia/realidad"
    },
    {
      "id": "s2",
      "periodo": "6–18 meses",
      "objetivo": "Demostración",
      "intervenciones": [
        "Proyectos locales pequeños",
        "Redes profesionales",
        "Formación de facilitadores"
      ],
      "verificable_por": "Nº de victorias observables y repetidas"
    },
    {
      "id": "s3",
      "periodo": "18–36 meses",
      "objetivo": "Difusión normativa",
      "intervenciones": [
        "Normas descriptivas veraces",
        "Reconocimiento horizontal",
        "Alfabetización informativa"
      ],
      "verificable_por": "Cambio medido en expectativas de segundo orden"
    },
    {
      "id": "s4",
      "periodo": "3–5 años",
      "objetivo": "Institucionalización",
      "intervenciones": [
        "Asociaciones autónomas",
        "Archivos",
        "Auditorías",
        "Rendición de cuentas"
      ],
      "verificable_por": "Congruencia entre regla declarada y aplicada"
    }
  ],
  "indice_ct": {
    "formula": "C_t = w₁·P_t + w₂·K_t + w₃·T_t + w₄·A_t − w₅·D_t",
    "advertencia": "El criterio de éxito no es cuántas personas repiten un discurso nuevo.",
    "componentes": [
      {
        "simbolo": "P_t",
        "nombre": "Participación comunitaria real",
        "signo": "+",
        "peso": 0.25,
        "inicial": 12,
        "mathml": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><msub><mi>P</mi><mi>t</mi></msub></math>"
      },
      {
        "simbolo": "K_t",
        "nombre": "Cooperación con desconocidos e instituciones",
        "signo": "+",
        "peso": 0.25,
        "inicial": 18,
        "mathml": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><msub><mi>K</mi><mi>t</mi></msub></math>"
      },
      {
        "simbolo": "T_t",
        "nombre": "Confianza generalizada",
        "signo": "+",
        "peso": 0.2,
        "inicial": 15,
        "mathml": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><msub><mi>T</mi><mi>t</mi></msub></math>"
      },
      {
        "simbolo": "A_t",
        "nombre": "Apropiación y uso de espacios comunes",
        "signo": "+",
        "peso": 0.15,
        "inicial": 20,
        "mathml": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><msub><mi>A</mi><mi>t</mi></msub></math>"
      },
      {
        "simbolo": "D_t",
        "nombre": "Desorden físico y social observado",
        "signo": "−",
        "peso": 0.15,
        "inicial": 72,
        "mathml": "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><msub><mi>D</mi><mi>t</mi></msub></math>"
      }
    ],
    "mathml": "<math display=\"block\" xmlns=\"http://www.w3.org/1998/Math/MathML\"><mrow><msub><mi>C</mi><mi>t</mi></msub><mo>=</mo><msub><mi>w</mi><mn>1</mn></msub><msub><mi>P</mi><mi>t</mi></msub><mo>+</mo><msub><mi>w</mi><mn>2</mn></msub><msub><mi>K</mi><mi>t</mi></msub><mo>+</mo><msub><mi>w</mi><mn>3</mn></msub><msub><mi>T</mi><mi>t</mi></msub><mo>+</mo><msub><mi>w</mi><mn>4</mn></msub><msub><mi>A</mi><mi>t</mi></msub><mo>−</mo><msub><mi>w</mi><mn>5</mn></msub><msub><mi>D</mi><mi>t</mi></msub></mrow></math>"
  },
  "falsacion": "Esta tesis quedaría refutada si en un piloto controlado a 24 meses se observaran victorias colectivas repetidas y verificables sin aumento medible de la confianza generalizada ni de la disposición a cooperar fuera de la familia. En ese caso el modelo estaría mal, y la explicación habría que buscarla probablemente en un componente de trauma acumulado que este marco no captura.",
  "contraindicaciones": [
    "Campañas de vergüenza colectiva; presentar a la población como cobarde o moralmente degradada",
    "Fabricar un «hombre nuevo» alternativo: el cubano correcto, puro y heroico",
    "Sustituir una historia oficial por otra",
    "Cuentas falsas, manipulación algorítmica, cifras inventadas",
    "Exigir adhesión ideológica como prueba de civismo",
    "Prometer transformación rápida",
    "Ignorar las condiciones materiales que produjeron las conductas",
    "Que la diáspora se constituya en autoridad tutelar y el interior pierda poder real de decisión"
  ],
  "encuesta": {
    "titulo": "Tu lectura",
    "intro": "Tres preguntas sobre el argumento de este expediente. El voto es anónimo y se registra una sola vez por navegador.",
    "nota_privacidad": "No se recoge ningún dato personal. Solo se incrementa un contador agregado por opción. Los resultados son opiniones de quien lee, no una muestra representativa: no son un dato observado y no deben citarse.",
    "preguntas": [
      {
        "id": "formulacion",
        "texto": "Antes de leer este expediente, ¿a cuál de las dos formulaciones te acercabas más?",
        "opciones": [
          {
            "id": "o1",
            "texto": "A la cultural: al cubano se le perdió el civismo"
          },
          {
            "id": "o2",
            "texto": "A la del entorno: la conducta es adaptación a los incentivos"
          },
          {
            "id": "o3",
            "texto": "A una mezcla de las dos"
          },
          {
            "id": "o4",
            "texto": "A ninguna de las dos"
          }
        ]
      },
      {
        "id": "palanca",
        "texto": "De lo ejecutable ahora, sin permiso ni cambio político, ¿qué crees que rendiría más en Cuba hoy?",
        "opciones": [
          {
            "id": "o1",
            "texto": "Publicar normas descriptivas verdaderas y agregadas"
          },
          {
            "id": "o2",
            "texto": "Infraestructura de verdad: archivo, protocolo y corrección pública de errores"
          },
          {
            "id": "o3",
            "texto": "Inoculación informativa: reconocer la manipulación antes de verla"
          },
          {
            "id": "o4",
            "texto": "Reconocimiento horizontal entre pares"
          }
        ]
      },
      {
        "id": "riesgo",
        "texto": "De las contraindicaciones que el propio modelo enumera, ¿cuál te parece más probable que se cometa?",
        "opciones": [
          {
            "id": "o1",
            "texto": "Campañas de vergüenza colectiva contra la propia población"
          },
          {
            "id": "o2",
            "texto": "Sustituir una historia oficial por otra"
          },
          {
            "id": "o3",
            "texto": "Fabricar un «hombre nuevo» alternativo"
          },
          {
            "id": "o4",
            "texto": "Que la diáspora se constituya en autoridad tutelar"
          }
        ]
      }
    ]
  },
  "fuentes": [
    {
      "id": "braga2024",
      "cita": "Braga, A. et al. (2024). Disorder policing to reduce crime: An updated systematic review and meta-analysis. Criminology & Public Policy."
    },
    {
      "id": "keizer",
      "cita": "Keizer, K., Lindenberg, S., Steg, L. The Spreading of Disorder. Science."
    },
    {
      "id": "branas",
      "cita": "Branas, C. et al. Citywide cluster randomized trial to restore blighted vacant land. PNAS."
    },
    {
      "id": "gerber",
      "cita": "Gerber, A., Green, D., Larimer, C. Experimento de participación electoral, Michigan (J-PAL)."
    },
    {
      "id": "bid",
      "cita": "BID. Procedural Justice and Police Legitimacy: Evidence from a Vignette Experiment in Central America."
    },
    {
      "id": "allcott",
      "cita": "Allcott, H. Social norms and energy conservation. Journal of Public Economics."
    },
    {
      "id": "centola",
      "cita": "Centola, D. et al. Experimental evidence for tipping points in social convention. Science."
    },
    {
      "id": "ocde",
      "cita": "OCDE. An updated OECD framework on drivers of trust in public institutions."
    },
    {
      "id": "romeu2013",
      "cita": "Romeu, J. L. (2013). Un análisis de la literatura sobre la Sociedad Civil Cubana. Caribbean Studies 41(1)."
    },
    {
      "id": "rojas",
      "cita": "Rojas, R. Historia mínima de la Revolución cubana; La soledad constitucional del socialismo cubano."
    },
    {
      "id": "perezdiaz",
      "cita": "Pérez-Díaz, V. (1993). The Return of Civil Society."
    },
    {
      "id": "pedraza",
      "cita": "Pedraza, S. (2007). Political Disaffection in Cuba's Revolution and Exodus."
    },
    {
      "id": "ocdh2025",
      "cita": "OCDH. VIII Informe sobre el Estado de los Derechos Sociales en Cuba (2025)."
    },
    {
      "id": "wb2012",
      "cita": "Banco Mundial. Fighting Corruption in Public Services: Chronicling Georgia's Reforms (2012)."
    },
    {
      "id": "caucasus",
      "cita": "Caucasus Barometer, series 2008–2021."
    },
    {
      "id": "wilson1982",
      "cita": "Wilson, J. Q. y Kelling, G. (1982). Broken Windows."
    },
    {
      "id": "teemeara",
      "cita": "Let's Do It! / Teeme Ära, documentación del evento del 3 de mayo de 2008."
    }
  ]
};

/* ---------------------------------------------------------------- paleta ---
   Registrada en ops/design_log.json bajo la clave "reconstruccion-civica".
   Ámbar (#C98A17) está RESERVADO en toda la plataforma para contrafactuales.
   -------------------------------------------------------------------------- */
const P = {
  fondo: "#0E1A18",
  superficie: "#14231F",
  superficieAlt: "#1B2E29",
  borde: "#26403A",
  bordeVivo: "#38574F",
  tinta: "#EDE7DC",
  tintaTenue: "#9DAFA8",
  petroleo: "#2E9B87",
  ciruela: "#8B76A8",
  arcilla: "#C4694A",
  salvia: "#9BB88F",
  ambar: "#C98A17"
};

const COLOR_CONFIANZA = { confirmado: P.petroleo, reportado: P.salvia, estimado: P.arcilla };
const COLOR_CASO = { bogota: P.petroleo, georgia: P.arcilla, estonia: P.ciruela, transiciones: P.salvia };
const COLOR_TERMINO = { M: P.arcilla, S: P.ciruela, I: P.salvia, E: P.petroleo };

const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const TITULAR = "'Archivo Black', 'Arial Black', system-ui, sans-serif";

const fmt = (n, dec) =>
  n === null || n === undefined
    ? "—"
    : new Intl.NumberFormat("es-ES", { maximumFractionDigits: dec === undefined ? 2 : dec }).format(n);

const sigma = (z) => 1 / (1 + Math.exp(-z));

/* ------------------------------------------------------------ primitivas --- */

function MateEnLinea({ html, color, tamano }) {
  return (
    <span
      style={{ color: color || "inherit", fontSize: tamano || 15, display: "inline-block", verticalAlign: "middle" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function Mate({ html, tono }) {
  return (
    <div
      style={{
        color: tono || P.petroleo,
        fontSize: "clamp(17px, 3vw, 25px)",
        padding: "14px 4px",
        overflowX: "auto",
        lineHeight: 1.4
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function Confianza({ nivel, procedencia, compacto }) {
  if (!nivel) return null;
  const c = COLOR_CONFIANZA[nivel] || P.tintaTenue;
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 2, verticalAlign: "middle" }}>
      <span
        style={{
          fontFamily: MONO,
          fontSize: compacto ? 9.5 : 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: c,
          border: `1px solid ${c}`,
          borderRadius: 2,
          padding: "1px 6px",
          whiteSpace: "nowrap",
          alignSelf: "flex-start"
        }}
      >
        {nivel}
      </span>
      {procedencia ? (
        <span style={{ fontFamily: MONO, fontSize: 10, color: P.tintaTenue, lineHeight: 1.45 }}>
          Procedencia: {procedencia}
        </span>
      ) : null}
    </span>
  );
}

function Seccion({ numero, titulo, sumario, children }) {
  return (
    <section style={{ padding: "56px 0", borderTop: `1px solid ${P.borde}` }}>
      <div style={{ display: "flex", gap: 14, alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: P.petroleo, letterSpacing: "0.12em" }}>
          {String(numero).padStart(2, "0")}
        </span>
        <h2 style={{ fontFamily: TITULAR, fontSize: "clamp(21px, 3.2vw, 31px)", lineHeight: 1.15, margin: 0, color: P.tinta }}>
          {titulo}
        </h2>
      </div>
      {sumario ? (
        <p style={{ margin: "0 0 26px 0", maxWidth: 760, color: P.tintaTenue, fontSize: 15.5, lineHeight: 1.65 }}>
          {sumario}
        </p>
      ) : null}
      {children}
    </section>
  );
}

function Tarjeta({ children, acento, estilo }) {
  return (
    <div
      style={{
        background: P.superficie,
        border: `1px solid ${P.borde}`,
        borderLeft: `3px solid ${acento || P.borde}`,
        borderRadius: 3,
        padding: "18px 20px",
        ...(estilo || {})
      }}
    >
      {children}
    </div>
  );
}

function Nota({ children, tono }) {
  const c = tono === "alerta" ? P.arcilla : P.tintaTenue;
  return (
    <p
      style={{
        fontFamily: MONO,
        fontSize: 12.5,
        lineHeight: 1.7,
        color: c,
        borderLeft: `2px solid ${c}`,
        paddingLeft: 12,
        margin: "18px 0 0 0",
        maxWidth: 780
      }}
    >
      {children}
    </p>
  );
}

function AvisoSimulacion({ texto }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 10.5,
        letterSpacing: "0.06em",
        color: P.ambar,
        border: `1px dashed ${P.ambar}`,
        borderRadius: 2,
        padding: "7px 10px",
        marginBottom: 16,
        lineHeight: 1.6
      }}
    >
      ⚠ Simulación · no es dato. {texto}
    </div>
  );
}

function Deslizador({ etiqueta, simbolo, valor, color, onChange, sufijo }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: P.tintaTenue }}>
          <span style={{ color: color, fontWeight: 700 }}>{simbolo}</span> {etiqueta}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 13, color: color }}>
          {fmt(valor, 0)}
          {sufijo || ""}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer" }}
        aria-label={etiqueta}
      />
    </div>
  );
}

function Boton({ children, onClick, activo, color }) {
  const c = color || P.petroleo;
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: MONO,
        fontSize: 11.5,
        padding: "7px 12px",
        borderRadius: 2,
        cursor: "pointer",
        background: activo ? c : "transparent",
        color: activo ? P.fondo : c,
        border: `1px solid ${c}`,
        fontWeight: activo ? 700 : 400,
        transition: "background 120ms"
      }}
    >
      {children}
    </button>
  );
}

/* ==================================== SECCIÓN 1 · la curva del modelo ====== */

function CurvaModelo({ modelo, aviso }) {
  const b = modelo.betas;
  const inicial = modelo.escenarios[0];
  const [v, setV] = useState({ M: inicial.M, S: inicial.S, I: inicial.I, E: inicial.E });
  const [escenario, setEscenario] = useState(inicial.id);
  const [comparar, setComparar] = useState(null);

  const z = useCallback(
    (x) => b.escala * ((b.M * x.M + b.S * x.S + b.I * x.I + b.E * x.E) / 100 - b.tau),
    [b]
  );

  const zActual = z(v);
  const pActual = sigma(zActual);

  const aplicar = (esc) => {
    setV({ M: esc.M, S: esc.S, I: esc.I, E: esc.E });
    setEscenario(esc.id);
    setComparar(null);
  };

  const soloTermino = (clave) => {
    const base = modelo.escenarios[0];
    const nuevo = { M: base.M, S: base.S, I: base.I, E: base.E };
    nuevo[clave] = 100;
    setV(nuevo);
    setEscenario(null);
    setComparar({ clave, desde: sigma(z({ M: base.M, S: base.S, I: base.I, E: base.E })), hasta: sigma(z(nuevo)) });
  };

  const cambiar = (clave, valor) => {
    setV((prev) => ({ ...prev, [clave]: valor }));
    setEscenario(null);
    setComparar(null);
  };

  /* --- geometría del gráfico --- */
  const W = 440;
  const H = 250;
  const mL = 42;
  const mR = 14;
  const mT = 14;
  const mB = 34;
  const zMin = -5;
  const zMax = 5;
  const px = (zz) => mL + ((zz - zMin) / (zMax - zMin)) * (W - mL - mR);
  const py = (p) => mT + (1 - p) * (H - mT - mB);

  const camino = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 160; i++) {
      const zz = zMin + (i / 160) * (zMax - zMin);
      pts.push(`${i === 0 ? "M" : "L"}${px(zz).toFixed(2)},${py(sigma(zz)).toFixed(2)}`);
    }
    return pts.join(" ");
  }, []);

  const pendiente = pActual * (1 - pActual);

  return (
    <div>
      <AvisoSimulacion texto={aviso} />

      <div style={{ display: "grid", gap: 26, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {/* ------- controles ------- */}
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.1em", color: P.tintaTenue, marginBottom: 12 }}>
            MUEVE LOS CUATRO TÉRMINOS
          </div>
          {modelo.terminos.map((t) => (
            <Deslizador
              key={t.clave}
              simbolo={<MateEnLinea html={t.mathml} color={COLOR_TERMINO[t.clave]} tamano={14} />}
              etiqueta={t.nombre}
              valor={v[t.clave]}
              color={COLOR_TERMINO[t.clave]}
              onChange={(n) => cambiar(t.clave, n)}
            />
          ))}

          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.1em", color: P.tintaTenue, margin: "20px 0 9px" }}>
            ESCENARIOS
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {modelo.escenarios.map((esc) => (
              <Boton
                key={esc.id}
                activo={escenario === esc.id}
                color={COLOR_CASO[esc.id] || P.ambar}
                onClick={() => aplicar(esc)}
              >
                {esc.nombre}
              </Boton>
            ))}
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.1em", color: P.tintaTenue, margin: "20px 0 9px" }}>
            LA PRUEBA DECISIVA — desde Cuba hoy, sube un solo término al máximo
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <Boton color={P.salvia} onClick={() => soloTermino("I")}>
              Solo relato (I) → 100
            </Boton>
            <Boton color={P.petroleo} onClick={() => soloTermino("E")}>
              Solo eficacia (E) → 100
            </Boton>
          </div>
          {comparar ? (
            <div
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: COLOR_TERMINO[comparar.clave],
                marginTop: 12,
                lineHeight: 1.7,
                borderLeft: `2px solid ${COLOR_TERMINO[comparar.clave]}`,
                paddingLeft: 11
              }}
            >
              {fmt(comparar.desde * 100, 1)} % → {fmt(comparar.hasta * 100, 1)} % · variación de{" "}
              {fmt((comparar.hasta - comparar.desde) * 100, 1)} puntos llevando un único término de su valor actual a 100.
            </div>
          ) : null}
        </div>

        {/* ------- gráfico ------- */}
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img" aria-label="Curva logística de probabilidad de conducta cívica">
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <g key={t}>
                <line x1={mL} y1={py(t)} x2={W - mR} y2={py(t)} stroke={P.borde} strokeWidth="0.7" />
                <text x={mL - 7} y={py(t) + 3.5} textAnchor="end" style={{ fontFamily: MONO, fontSize: 9, fill: P.tintaTenue }}>
                  {t * 100}
                </text>
              </g>
            ))}
            <text
              x={12}
              y={H / 2}
              transform={`rotate(-90 12 ${H / 2})`}
              textAnchor="middle"
              style={{ fontFamily: MONO, fontSize: 9.5, fill: P.tintaTenue }}
            >
              Pr(conducta cívica) %
            </text>

            {/* zonas planas */}
            <rect x={px(-5)} y={mT} width={px(-2.2) - px(-5)} height={H - mT - mB} fill={P.arcilla} opacity="0.07" />
            <rect x={px(2.2)} y={mT} width={px(5) - px(2.2)} height={H - mT - mB} fill={P.petroleo} opacity="0.07" />
            <text x={px(-3.6)} y={H - mB + 14} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 8.5, fill: P.arcilla }}>
              región plana
            </text>
            <text x={px(0)} y={H - mB + 14} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 8.5, fill: P.tintaTenue }}>
              pendiente máxima
            </text>
            <text x={px(3.6)} y={H - mB + 14} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 8.5, fill: P.petroleo }}>
              región plana
            </text>
            <text x={(mL + W - mR) / 2} y={H - 4} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 9.5, fill: P.tintaTenue }}>
              z · ventaja neta de la conducta cívica
            </text>

            <path d={camino} fill="none" stroke={P.bordeVivo} strokeWidth="2" />

            {/* escenarios como puntos sobre la curva */}
            {modelo.escenarios.map((esc) => {
              const ze = z(esc);
              return (
                <g key={esc.id} onClick={() => aplicar(esc)} style={{ cursor: "pointer" }}>
                  <circle cx={px(ze)} cy={py(sigma(ze))} r="4" fill={P.fondo} stroke={COLOR_CASO[esc.id] || P.ambar} strokeWidth="1.6" />
                </g>
              );
            })}

            {/* punto activo */}
            <line x1={px(zActual)} y1={py(0)} x2={px(zActual)} y2={py(pActual)} stroke={P.ambar} strokeWidth="1" strokeDasharray="3 3" />
            <line x1={mL} y1={py(pActual)} x2={px(zActual)} y2={py(pActual)} stroke={P.ambar} strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={px(zActual)} cy={py(pActual)} r="6" fill={P.ambar} />
          </svg>

          <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginTop: 10 }}>
            <div>
              <div style={{ fontFamily: TITULAR, fontSize: 34, color: P.ambar, lineHeight: 1 }}>
                {fmt(pActual * 100, 1)}
                <span style={{ fontSize: 17 }}> %</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, color: P.tintaTenue, marginTop: 4 }}>
                probabilidad de conducta cívica
              </div>
            </div>
            <div>
              <div style={{ fontFamily: TITULAR, fontSize: 22, color: P.tintaTenue, lineHeight: 1.4 }}>
                {fmt(pendiente, 3)}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, color: P.tintaTenue, marginTop: 4 }}>
                pendiente local · σ(z)·[1−σ(z)]
              </div>
            </div>
            <div>
              <div style={{ fontFamily: TITULAR, fontSize: 22, color: P.tintaTenue, lineHeight: 1.4 }}>{fmt(zActual, 2)}</div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, color: P.tintaTenue, marginTop: 4 }}>índice z</div>
            </div>
          </div>
        </div>
      </div>

      <Nota>{modelo.lectura_curva}</Nota>
      <div style={{ marginTop: 14 }}>
        <Confianza nivel={b.confianza} procedencia={b.procedencia} />
      </div>
    </div>
  );
}

/* ============================ SECCIÓN 2b · ignorancia pluralista ========== */

function MallaNormas({ real, aviso }) {
  const [percibido, setPercibido] = useState(28);
  const celdas = Array.from({ length: 100 }, (_, i) => i);
  const brecha = real - percibido;

  const Malla = ({ pct, color, titulo, sub }) => (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 11, color: color, marginBottom: 3 }}>{titulo}</div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: P.tintaTenue, marginBottom: 9, lineHeight: 1.5 }}>{sub}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 3, maxWidth: 220 }}>
        {celdas.map((i) => (
          <div
            key={i}
            style={{
              aspectRatio: "1",
              borderRadius: 1,
              background: i < Math.round(pct) ? color : "transparent",
              border: `1px solid ${i < Math.round(pct) ? color : P.borde}`,
              transition: "background 140ms"
            }}
          />
        ))}
      </div>
      <div style={{ fontFamily: TITULAR, fontSize: 25, color: color, marginTop: 10 }}>{fmt(pct, 0)} %</div>
    </div>
  );

  return (
    <div>
      <AvisoSimulacion texto={aviso} />
      <div style={{ display: "flex", gap: 34, flexWrap: "wrap" }}>
        <Malla
          pct={real}
          color={P.petroleo}
          titulo="LO QUE LA GENTE PIENSA"
          sub="Desaprobación medida (OCDH 2025, reportado)"
        />
        <Malla
          pct={percibido}
          color={P.arcilla}
          titulo="LO QUE CREE QUE PIENSAN LOS DEMÁS"
          sub="No medido en Cuba. Mueve el control para explorar el mecanismo."
        />
      </div>
      <div style={{ maxWidth: 380, marginTop: 22 }}>
        <Deslizador
          simbolo="π̂"
          etiqueta="Porcentaje que cada persona cree que los demás comparten"
          valor={percibido}
          color={P.arcilla}
          onChange={setPercibido}
          sufijo=" %"
        />
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 12.5,
          color: brecha > 30 ? P.ambar : P.tintaTenue,
          lineHeight: 1.7,
          borderLeft: `2px solid ${brecha > 30 ? P.ambar : P.tintaTenue}`,
          paddingLeft: 12,
          marginTop: 6,
          maxWidth: 700
        }}
      >
        Brecha de segundo orden: {fmt(brecha, 0)} puntos.{" "}
        {brecha > 30
          ? "Con una brecha así, casi todos coinciden y casi nadie lo sabe. La norma dañina se sostiene sin que nadie la defienda: cada persona calla porque cree ser excepción."
          : "Con brechas pequeñas la norma pierde su soporte: la coordinación deja de requerir coraje individual."}
      </div>
      <Nota tono="alerta">
        La segunda distribución no está medida en Cuba por ningún instrumento público. Cerrar esa laguna es la primera
        tarea del programa, no un detalle metodológico.
      </Nota>
    </div>
  );
}

/* ------------------------------------------- anillos del estado actual ---- */

function Anillo({ valor, etiqueta, color }) {
  const [hover, setHover] = useState(false);
  const r = 46;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, valor));
  const trazo = (pct / 100) * circ;
  return (
    <div
      style={{ textAlign: "center", width: 132, cursor: "default" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <svg viewBox="0 0 120 120" width="118" height="118" role="img" aria-label={`${etiqueta}: ${valor}%`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke={P.borde} strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={hover ? 12 : 9}
          strokeDasharray={`${trazo} ${circ - trazo}`}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-width 140ms" }}
        />
        <text x="60" y="59" textAnchor="middle" style={{ fontFamily: TITULAR, fontSize: 23, fill: P.tinta }}>
          {fmt(valor)}
        </text>
        <text x="60" y="76" textAnchor="middle" style={{ fontFamily: MONO, fontSize: 10, fill: P.tintaTenue }}>
          %
        </text>
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 11, color: hover ? color : P.tintaTenue, lineHeight: 1.45, marginTop: 4 }}>
        {etiqueta}
      </div>
    </div>
  );
}

/* ------------------------------------------------- pesas antes/después ---- */

function Pesas({ indicadores, color }) {
  const [activo, setActivo] = useState(null);
  if (!indicadores || indicadores.length === 0) {
    return (
      <p style={{ fontFamily: MONO, fontSize: 12.5, color: P.tintaTenue, lineHeight: 1.7 }}>
        Este caso no aporta indicadores de antes/después: opera como precondición, no como intervención.
      </p>
    );
  }
  const alturaFila = 74;
  const alto = indicadores.length * alturaFila + 18;
  const x0 = 8;
  const x1 = 92;
  return (
    <div>
      <svg viewBox={`0 0 100 ${alto}`} width="100%" style={{ display: "block" }} preserveAspectRatio="none">
        {indicadores.map((ind, i) => {
          const base = i * alturaFila + 30;
          const vals = [ind.antes, ind.despues].filter((val) => val !== null && val !== undefined);
          const max = Math.max(...vals, 1);
          const pxx = (val) => x0 + ((val || 0) / max) * (x1 - x0);
          const hayDespues = ind.despues !== null && ind.despues !== undefined;
          const on = activo === i;
          return (
            <g key={ind.etiqueta} onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)} style={{ cursor: "pointer" }}>
              <rect x="0" y={base - 24} width="100" height={alturaFila - 6} fill={on ? color : "transparent"} opacity={on ? 0.07 : 0} />
              <text x={x0} y={base - 14} style={{ fontFamily: MONO, fontSize: 4.4, fill: on ? P.tinta : P.tintaTenue }}>
                {ind.etiqueta}
              </text>
              <line x1={x0} y1={base} x2={x1} y2={base} stroke={P.borde} strokeWidth="0.4" />
              {hayDespues ? (
                <line x1={pxx(ind.antes)} y1={base} x2={pxx(ind.despues)} y2={base} stroke={color} strokeWidth={on ? 2.4 : 1.6} opacity="0.6" />
              ) : null}
              <circle cx={pxx(ind.antes)} cy={base} r="2.1" fill={P.fondo} stroke={P.tintaTenue} strokeWidth="0.8" />
              {hayDespues ? <circle cx={pxx(ind.despues)} cy={base} r={on ? 3 : 2.4} fill={color} /> : null}
              <text x={pxx(ind.antes)} y={base + 9} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 4, fill: P.tintaTenue }}>
                {fmt(ind.antes)}
                {ind.unidad}
              </text>
              {hayDespues ? (
                <text x={pxx(ind.despues)} y={base - 6} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 4.6, fill: color }}>
                  {fmt(ind.despues)}
                  {ind.unidad}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <div style={{ minHeight: 40, marginTop: 8 }}>
        {activo !== null ? (
          <Confianza nivel={indicadores[activo].confianza} procedencia={indicadores[activo].procedencia} />
        ) : (
          <span style={{ fontFamily: MONO, fontSize: 10.5, color: P.tintaTenue }}>
            Pasa el cursor sobre un indicador para ver su confianza y procedencia.
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ pendientes -- */

function Pendientes({ experimentos }) {
  const [sel, setSel] = useState(null);
  const alto = 270;
  const mSup = 26;
  const mInf = 40;
  const util = alto - mSup - mInf;
  const y = (v) => mSup + util - (v / 100) * util;
  const xA = 100;
  const xB = 330;
  return (
    <div>
      <svg viewBox={`0 0 430 ${alto}`} width="100%" style={{ display: "block", maxWidth: 640 }}>
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line x1={xA - 8} y1={y(t)} x2={xB + 8} y2={y(t)} stroke={P.borde} strokeWidth="0.6" />
            <text x={xA - 14} y={y(t) + 3} textAnchor="end" style={{ fontFamily: MONO, fontSize: 9, fill: P.tintaTenue }}>
              {t}
            </text>
          </g>
        ))}
        <text x={xA} y={alto - 20} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 10, fill: P.tintaTenue }}>
          entorno ordenado
        </text>
        <text x={xB} y={alto - 20} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 10, fill: P.arcilla }}>
          entorno desordenado
        </text>
        <text x={215} y={alto - 5} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 9, fill: P.tintaTenue }}>
          % que incumple la norma medida
        </text>
        {experimentos.map((e, i) => {
          const c = i % 2 === 0 ? P.ciruela : P.petroleo;
          const atenuado = sel !== null && sel !== i;
          return (
            <g
              key={e.id}
              onMouseEnter={() => setSel(i)}
              onMouseLeave={() => setSel(null)}
              style={{ cursor: "pointer", opacity: atenuado ? 0.18 : 1, transition: "opacity 120ms" }}
            >
              <line x1={xA} y1={y(e.ordenado)} x2={xB} y2={y(e.desordenado)} stroke={c} strokeWidth={sel === i ? 2.6 : 1.4} />
              <circle cx={xA} cy={y(e.ordenado)} r="3.2" fill={P.fondo} stroke={c} strokeWidth="1.2" />
              <circle cx={xB} cy={y(e.desordenado)} r={sel === i ? 4.6 : 3.6} fill={c} />
              <text x={xA - 24} y={y(e.ordenado) + 3} textAnchor="end" style={{ fontFamily: MONO, fontSize: 9, fill: c }}>
                {e.ordenado}
              </text>
              <text x={xB + 10} y={y(e.desordenado) + 3} style={{ fontFamily: MONO, fontSize: 9, fill: c }}>
                {e.desordenado}
              </text>
            </g>
          );
        })}
      </svg>
      <div
        style={{
          minHeight: 54,
          marginTop: 6,
          fontFamily: MONO,
          fontSize: 12,
          lineHeight: 1.65,
          color: sel === null ? P.tintaTenue : P.tinta,
          borderLeft: `2px solid ${sel === null ? P.borde : P.ciruela}`,
          paddingLeft: 12,
          maxWidth: 640
        }}
      >
        {sel === null ? (
          "Pasa el cursor sobre una línea para aislar el experimento."
        ) : (
          <span>
            {experimentos[sel].senal} → {experimentos[sel].conducta}: de {experimentos[sel].ordenado} % a{" "}
            {experimentos[sel].desordenado} % ({experimentos[sel].desordenado - experimentos[sel].ordenado > 0 ? "+" : ""}
            {experimentos[sel].desordenado - experimentos[sel].ordenado} pp)
            {experimentos[sel].n ? ` · n = ${experimentos[sel].n}` : " · n no reportado"}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------ lollipop divergente */

function Divergente({ efectos }) {
  const [sel, setSel] = useState(null);
  const filas = efectos.length;
  const alto = filas * 30 + 26;
  const centro = 52;
  const max = Math.max(...efectos.map((e) => Math.abs(e.valor)), 1);
  const escala = 40 / max;
  return (
    <svg viewBox={`0 0 100 ${alto}`} width="100%" style={{ display: "block" }} preserveAspectRatio="none">
      <line x1={centro} y1={8} x2={centro} y2={alto - 10} stroke={P.borde} strokeWidth="0.5" />
      {efectos.map((e, i) => {
        const yy = 22 + i * 30;
        const largo = e.valor * escala;
        const c = e.valor < 0 ? P.petroleo : P.salvia;
        const on = sel === i;
        return (
          <g key={e.etiqueta} onMouseEnter={() => setSel(i)} onMouseLeave={() => setSel(null)} style={{ cursor: "pointer" }}>
            <rect x="0" y={yy - 14} width="100" height="26" fill={c} opacity={on ? 0.08 : 0} />
            <text x={centro} y={yy - 9} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 4.2, fill: on ? P.tinta : P.tintaTenue }}>
              {e.etiqueta}
            </text>
            <line x1={centro} y1={yy} x2={centro + largo} y2={yy} stroke={c} strokeWidth={on ? 2.2 : 1.4} />
            <circle cx={centro + largo} cy={yy} r={on ? 2.9 : 2.2} fill={c} />
            <text
              x={centro + largo + (largo < 0 ? -5 : 5)}
              y={yy + 1.6}
              textAnchor={largo < 0 ? "end" : "start"}
              style={{ fontFamily: MONO, fontSize: 4.4, fill: c }}
            >
              {e.valor > 0 ? "+" : ""}
              {fmt(e.valor)}
              {e.unidad === "pp" ? " pp" : "%"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------ la ventana institucional ---
   El experimento de viñetas del BID mide un contraste: el MISMO caso, con la
   misma decisión y la misma sanción, resuelto con trato respetuoso o sin él.
   Los valores del dataset son diferencias en puntos porcentuales frente a la
   condición de control; no hay nivel absoluto publicado y no se inventa
   ninguno. El conmutador reproduce la manipulación experimental: al pasar a
   "con trato respetuoso" las tres barras se separan de la referencia.
   ---------------------------------------------------------------------------- */

function VentanaInstitucional({ datos }) {
  const [respetuoso, setRespetuoso] = useState(true);
  const [sel, setSel] = useState(null);
  const efectos = datos.efectos || [];
  const max = Math.max(...efectos.map((e) => Math.abs(e.valor)), 1);
  const tope = Math.max(5, Math.ceil(max / 5) * 5);
  const marcas = [0, tope / 4, tope / 2, (tope * 3) / 4, tope];

  return (
    <div>
      <p style={{ color: P.tintaTenue, fontSize: 14, lineHeight: 1.65, margin: "0 0 14px", maxWidth: 620 }}>
        {datos.descripcion}
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }} role="group" aria-label="Condición del experimento">
        <Boton color={P.tintaTenue} activo={!respetuoso} onClick={() => setRespetuoso(false)}>
          MISMA SANCIÓN, SIN TRATO RESPETUOSO
        </Boton>
        <Boton color={P.ciruela} activo={respetuoso} onClick={() => setRespetuoso(true)}>
          MISMA SANCIÓN, CON TRATO RESPETUOSO
        </Boton>
      </div>
      <p style={{ fontFamily: MONO, fontSize: 11, color: P.tintaTenue, margin: "0 0 20px", lineHeight: 1.6 }}>
        {respetuoso
          ? "Diferencia en puntos porcentuales frente a la condición de control."
          : "Condición de control: la referencia desde la que se miden las tres diferencias."}
      </p>

      {efectos.map((e, i) => {
        const activa = respetuoso;
        const pct = activa ? (Math.abs(e.valor) / tope) * 100 : 0;
        const on = sel === i;
        const c = activa ? P.ciruela : P.tintaTenue;
        return (
          <div
            key={e.etiqueta}
            onMouseEnter={() => setSel(i)}
            onMouseLeave={() => setSel(null)}
            style={{ marginBottom: 18 }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 6,
                flexWrap: "wrap"
              }}
            >
              <span style={{ fontSize: 14, lineHeight: 1.45, color: on ? P.tinta : P.tintaTenue }}>{e.etiqueta}</span>
              <span style={{ fontFamily: MONO, fontSize: 14, color: c, whiteSpace: "nowrap", fontWeight: 700 }}>
                {activa ? `${e.valor > 0 ? "+" : ""}${fmt(e.valor)} ${e.unidad === "pp" ? "pp" : "%"}` : "referencia"}
              </span>
            </div>
            <div
              style={{
                position: "relative",
                height: 14,
                background: P.superficieAlt,
                border: `1px solid ${P.borde}`,
                borderRadius: 2,
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "0 auto 0 0",
                  width: pct + "%",
                  background: c,
                  opacity: on ? 1 : 0.82,
                  transition: "width 520ms cubic-bezier(.4,0,.2,1), opacity 160ms"
                }}
              />
            </div>
          </div>
        );
      })}

      {/* eje */}
      <div style={{ position: "relative", height: 16, marginTop: -4 }} aria-hidden="true">
        {marcas.map((m) => (
          <span
            key={m}
            style={{
              position: "absolute",
              left: (m / tope) * 100 + "%",
              transform: m === tope ? "translateX(-100%)" : m === 0 ? "none" : "translateX(-50%)",
              fontFamily: MONO,
              fontSize: 10,
              color: P.tintaTenue
            }}
          >
            {m === 0 ? "0" : `+${fmt(m, 0)}`}
          </span>
        ))}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 10, color: P.tintaTenue, marginTop: 10, letterSpacing: "0.06em" }}>
        PUNTOS PORCENTUALES DE DIFERENCIA · ESCALA 0 A +{fmt(tope, 0)}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- secuencia ---- */

function Secuencia({ etapas }) {
  const [abierta, setAbierta] = useState(0);
  const paso = 100 / etapas.length;
  return (
    <div>
      <svg viewBox="0 0 100 16" width="100%" style={{ display: "block" }} preserveAspectRatio="none">
        <line x1="2" y1="8" x2="98" y2="8" stroke={P.borde} strokeWidth="0.5" />
        {etapas.map((e, i) => (
          <circle
            key={e.id}
            cx={paso * i + paso / 2}
            cy="8"
            r={abierta === i ? 2.6 : 1.6}
            fill={abierta === i ? P.ambar : P.petroleo}
            onClick={() => setAbierta(i)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </svg>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginTop: 10 }}>
        {etapas.map((e, i) => {
          const on = abierta === i;
          return (
            <div
              key={e.id}
              onClick={() => setAbierta(i)}
              style={{
                borderTop: `2px solid ${on ? P.ambar : P.petroleo}`,
                paddingTop: 10,
                cursor: "pointer",
                opacity: on ? 1 : 0.62,
                transition: "opacity 140ms"
              }}
            >
              <div style={{ fontFamily: MONO, fontSize: 11, color: on ? P.ambar : P.petroleo, letterSpacing: "0.08em" }}>
                {e.periodo}
              </div>
              <div style={{ fontFamily: TITULAR, fontSize: 15, color: P.tinta, margin: "5px 0 8px" }}>{e.objetivo}</div>
              <ul style={{ margin: 0, paddingLeft: 15, color: P.tintaTenue, fontSize: 13, lineHeight: 1.6 }}>
                {e.intervenciones.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  color: P.salvia,
                  marginTop: 10,
                  lineHeight: 1.5,
                  borderTop: `1px dotted ${P.borde}`,
                  paddingTop: 7
                }}
              >
                Verificable por: {e.verificable_por}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------- índice C_t ------ */

function IndiceInteractivo({ indice, aviso }) {
  const [vals, setVals] = useState(() => {
    const o = {};
    indice.componentes.forEach((c) => {
      o[c.simbolo] = c.inicial;
    });
    return o;
  });

  const ct = indice.componentes.reduce(
    (acc, c) => acc + (c.signo === "+" ? 1 : -1) * c.peso * vals[c.simbolo],
    0
  );
  const norm = Math.max(0, Math.min(100, ((ct + 15) / 100) * 100));

  return (
    <div>
      <AvisoSimulacion texto={aviso} />
      <Mate html={indice.mathml} tono={P.petroleo} />
      <div style={{ display: "grid", gap: 26, gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))" }}>
        <div>
          {indice.componentes.map((c) => (
            <Deslizador
              key={c.simbolo}
              simbolo={
                <span>
                  {c.signo} <MateEnLinea html={c.mathml} tamano={14} />
                </span>
              }
              etiqueta={`${c.nombre} · w=${c.peso}`}
              valor={vals[c.simbolo]}
              color={c.signo === "+" ? P.petroleo : P.arcilla}
              onChange={(n) => setVals((p) => ({ ...p, [c.simbolo]: n }))}
            />
          ))}
        </div>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.1em", color: P.tintaTenue, marginBottom: 10 }}>
            ÍNDICE COMPUESTO
          </div>
          <div style={{ fontFamily: TITULAR, fontSize: 52, color: ct > 20 ? P.petroleo : P.arcilla, lineHeight: 1 }}>
            {fmt(ct, 1)}
          </div>
          <div style={{ height: 10, background: P.superficieAlt, border: `1px solid ${P.borde}`, borderRadius: 2, marginTop: 16 }}>
            <div
              style={{
                width: `${norm}%`,
                height: "100%",
                background: ct > 20 ? P.petroleo : P.arcilla,
                transition: "width 160ms, background 160ms"
              }}
            />
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11.5, color: P.tintaTenue, lineHeight: 1.7, marginTop: 16 }}>
            Nota la asimetría: el desorden observado (D) entra con signo negativo y peso propio. Un programa que suba
            participación sin reducir desorden apenas mueve el índice — y esa es exactamente la firma de una campaña
            cosmética.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------ contrafactual ----- */

function BloqueContrafactual({ cf, abiertoInicial }) {
  const [abierto, setAbierto] = useState(!!abiertoInicial);
  return (
    <div
      style={{
        border: `2px dashed ${P.ambar}`,
        borderRadius: 3,
        padding: "16px 20px",
        background: "rgba(201, 138, 23, 0.05)"
      }}
    >
      <div
        onClick={() => setAbierto(!abierto)}
        style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", cursor: "pointer" }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: P.fondo,
            background: P.ambar,
            padding: "2px 7px",
            borderRadius: 2,
            fontWeight: 700
          }}
        >
          ⚠ Contrafactual · no es evidencia
        </span>
        <span style={{ fontFamily: MONO, fontSize: 11, color: P.ambar }}>{cf.codigo}</span>
        <h3 style={{ fontFamily: TITULAR, fontSize: 16.5, color: P.tinta, margin: 0, flex: "1 1 200px" }}>{cf.titulo}</h3>
        <span style={{ fontFamily: MONO, fontSize: 15, color: P.ambar }}>{abierto ? "−" : "+"}</span>
      </div>
      {abierto ? (
        <div style={{ marginTop: 14 }}>
          <Campo etiqueta="Supuesto" valor={cf.supuesto} />
          {cf.referencia_externa ? <Campo etiqueta="Referencia externa" valor={cf.referencia_externa} /> : null}
          <Campo etiqueta="Plausibilidad" valor={`${cf.plausibilidad} — ${cf.justificacion_plausibilidad}`} />
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: `1px dashed ${P.ambar}`,
              color: P.tinta,
              fontSize: 14.5,
              lineHeight: 1.65
            }}
          >
            {cf.corolario}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Campo({ etiqueta, valor }) {
  return (
    <div style={{ marginBottom: 9 }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: P.tintaTenue,
          marginBottom: 3
        }}
      >
        {etiqueta}
      </div>
      <div style={{ color: P.tinta, fontSize: 14, lineHeight: 1.62 }}>{valor}</div>
    </div>
  );
}

/* ============================================================== renderer === */

/* ------------------------------------------------------------- encuesta ---
   Contrato compartido de la plataforma, ver ENCUESTAS.md §2.
   Clave de voto: `${meta.slug}::${pregunta.id}::${opcion.id}` sobre la tabla
   única `yamacoa_encuesta_votos` (ops/_shared/poll_supabase.sql) más la
   siembra propia del tema (ops/normas/poll_supabase.sql).

   Almacenamiento primario: localStorage. Supabase es respaldo agregado y
   silencioso: si faltan las variables de entorno o la RPC falla, la encuesta
   sigue funcionando en local sin errores visibles.

   NO se usa `window.__yamacoaSupabase`: ese global no lo asigna nadie en el
   router y su uso dejaba las encuestas sin agregado global. Se leen las
   variables que CRA inyecta en build, igual que los temas que sí funcionan.
   -------------------------------------------------------------------------- */

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
  const [sel, setSel] = useState(null);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(claveLocal);
      if (guardado) setVotos(JSON.parse(guardado));
      const conteoLocal = localStorage.getItem(`${claveLocal}:conteos`);
      if (conteoLocal) setConteos(JSON.parse(conteoLocal));
    } catch (e) {
      /* dato corrupto o almacenamiento bloqueado: se ignora */
    }
    let vivo = true;
    rpcResultados(`${slug}::`).then((m) => {
      if (vivo && m) setConteos(m);
    });
    return () => {
      vivo = false;
    };
  }, [claveLocal, slug]);

  const votar = (preguntaId, opcionId) => {
    if (votos[preguntaId]) return;
    const clave = claveVoto(slug, preguntaId, opcionId);
    const nuevos = { ...votos, [preguntaId]: opcionId };
    setVotos(nuevos);
    setConteos((prev) => {
      const sig = { ...prev, [clave]: (prev[clave] || 0) + 1 };
      try {
        localStorage.setItem(claveLocal, JSON.stringify(nuevos));
        localStorage.setItem(`${claveLocal}:conteos`, JSON.stringify(sig));
      } catch (e) {}
      return sig;
    });
    rpcVotar(clave);
  };

  if (!encuesta || !Array.isArray(encuesta.preguntas)) return null;

  return (
    <div>
      {encuesta.intro ? (
        <p style={{ color: P.tintaTenue, fontSize: 14.5, lineHeight: 1.65, maxWidth: 720, margin: "0 0 20px" }}>
          {encuesta.intro}
        </p>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {encuesta.preguntas.map((pr, idx) => {
          const votada = votos[pr.id];
          const total = pr.opciones.reduce((acc, o) => acc + (conteos[claveVoto(slug, pr.id, o.id)] || 0), 0);
          return (
            <Tarjeta key={pr.id} acento={P.petroleo}>
              <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 12 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: P.petroleo, letterSpacing: "0.1em" }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 14.5, lineHeight: 1.5, color: P.tinta, flex: "1 1 200px" }}>{pr.texto}</span>
              </div>

              {pr.opciones.map((o) => {
                const clave = claveVoto(slug, pr.id, o.id);
                const n = conteos[clave] || 0;
                const pct = total > 0 ? Math.round((n / total) * 100) : 0;
                const elegida = votada === o.id;
                const on = sel === clave;
                return (
                  <button
                    key={o.id}
                    type="button"
                    disabled={!!votada}
                    onClick={() => votar(pr.id, o.id)}
                    onMouseEnter={() => setSel(clave)}
                    onMouseLeave={() => setSel(null)}
                    style={{
                      position: "relative",
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      overflow: "hidden",
                      background: P.superficieAlt,
                      border: `1px solid ${elegida ? P.petroleo : P.borde}`,
                      borderRadius: 2,
                      padding: "9px 11px",
                      marginBottom: 7,
                      cursor: votada ? "default" : "pointer",
                      font: "inherit",
                      color: P.tinta
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: "0 auto 0 0",
                        width: votada ? pct + "%" : 0,
                        background: elegida ? "rgba(46,155,135,.30)" : "rgba(157,175,168,.16)",
                        transition: "width .5s ease",
                        opacity: on ? 1 : 0.9
                      }}
                    />
                    <span
                      style={{
                        position: "relative",
                        display: "flex",
                        gap: 10,
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        fontSize: 13,
                        lineHeight: 1.5
                      }}
                    >
                      <span>
                        {elegida ? "✓ " : ""}
                        {o.texto}
                      </span>
                      {votada ? <span style={{ fontFamily: MONO, fontSize: 11.5, color: P.tintaTenue }}>{pct}%</span> : null}
                    </span>
                  </button>
                );
              })}

              <p style={{ margin: "10px 0 0 0", fontFamily: MONO, fontSize: 11, color: P.tintaTenue }}>
                {total} voto{total === 1 ? "" : "s"}
              </p>
            </Tarjeta>
          );
        })}
      </div>

      {encuesta.nota_privacidad ? <Nota>{encuesta.nota_privacidad}</Nota> : null}
    </div>
  );
}

export default function ReconstruccionCivica() {
  const [datos, setDatos] = useState(null);
  const [origen, setOrigen] = useState("cargando");
  const [casoActivo, setCasoActivo] = useState(0);

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

  const radar = useMemo(() => {
    if (!datos) return [];
    const ejes = [
      { clave: "M", nombre: "Saldo material" },
      { clave: "S", nombre: "Sanción social" },
      { clave: "I", nombre: "Identidad" },
      { clave: "E", nombre: "Eficacia" }
    ];
    return ejes.map((eje) => {
      const fila = { eje: eje.nombre };
      datos.casos_externos.forEach((c) => {
        fila[c.caso] = c.palancas[eje.clave];
      });
      return fila;
    });
  }, [datos]);

  if (!datos) {
    return (
      <div style={{ background: P.fondo, color: P.tintaTenue, fontFamily: MONO, padding: 40, minHeight: "60vh" }}>
        Cargando dataset…
      </div>
    );
  }

  const caso = datos.casos_externos[casoActivo];
  const vr = datos.ventanas_rotas;
  const desaprueba = (datos.estado_sistema.indicadores.find((i) => i.id === "desaprueba") || {}).valor || 92;

  return (
    <div style={{ background: P.fondo, color: P.tinta, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1020, margin: "0 auto", padding: "0 22px 90px" }}>
        <header style={{ padding: "72px 0 46px" }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: P.petroleo,
              marginBottom: 18
            }}
          >
            Yamacoa · observatorio · {datos.meta.slug}
          </div>
          <h1 style={{ fontFamily: TITULAR, fontSize: "clamp(36px, 7vw, 68px)", lineHeight: 1.02, margin: 0, letterSpacing: "-0.015em" }}>
            {datos.meta.titulo}
          </h1>
          <p style={{ fontSize: "clamp(16px, 2.2vw, 20px)", lineHeight: 1.5, color: P.tintaTenue, maxWidth: 700, marginTop: 18 }}>
            {datos.meta.subtitulo}
          </p>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 26, fontFamily: MONO, fontSize: 11, color: P.tintaTenue }}>
            <span>v{datos.meta.version}</span>
            <span>Actualizado {datos.meta.actualizado}</span>
            <span>Ciclo {datos.meta.ciclo_horas} h</span>
            <span style={{ color: origen === "remoto" ? P.petroleo : P.arcilla }}>
              Origen: {origen === "remoto" ? "dataset en vivo" : "copia embebida"}
            </span>
          </div>
        </header>

        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <Tarjeta acento={P.arcilla}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: P.arcilla, marginBottom: 8 }}>
              FORMULACIÓN RECHAZADA
            </div>
            <div style={{ fontSize: 15.5, lineHeight: 1.6, color: P.tintaTenue, fontStyle: "italic" }}>
              «{datos.tesis.formulacion_rechazada}»
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11.5, color: P.tintaTenue, marginTop: 12, lineHeight: 1.6 }}>
              Describe un estado sin identificar su mecanismo. Sugiere reeducación.
            </div>
          </Tarjeta>
          <Tarjeta acento={P.petroleo}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: P.petroleo, marginBottom: 8 }}>
              FORMULACIÓN OPERATIVA
            </div>
            <div style={{ fontSize: 15.5, lineHeight: 1.6 }}>{datos.tesis.formulacion_operativa}</div>
            <div style={{ fontFamily: MONO, fontSize: 11.5, color: P.tintaTenue, marginTop: 12, lineHeight: 1.6 }}>
              Es causal. Sugiere modificar el entorno.
            </div>
          </Tarjeta>
        </div>

        {/* ------------------------------------------------ 1 · curva modelo */}
        <Seccion
          numero={1}
          titulo="La curva, no la fórmula"
          sumario="La conducta cívica no responde de forma lineal a sus incentivos. Responde con una sigmoide, y esa forma —no la ecuación— es el argumento."
        >
          <Mate html={datos.modelo.mathml_probabilidad} />
          <Mate html={datos.modelo.mathml_indice} tono={P.tintaTenue} />
          <p style={{ color: P.tintaTenue, fontSize: 14.5, lineHeight: 1.7, maxWidth: 760 }}>
            {datos.modelo.especificacion}
          </p>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", margin: "26px 0 34px" }}>
            {datos.modelo.terminos.map((t) => {
              const encontra = (t.estado_cuba || "").toLowerCase().includes("contra");
              return (
                <Tarjeta key={t.clave} acento={COLOR_TERMINO[t.clave]}>
                  <MateEnLinea html={t.mathml} color={COLOR_TERMINO[t.clave]} tamano={19} />
                  <div style={{ fontFamily: TITULAR, fontSize: 14, margin: "6px 0 7px" }}>{t.nombre}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: P.tintaTenue }}>{t.descripcion}</div>
                  {t.estado_cuba ? (
                    <div style={{ fontFamily: MONO, fontSize: 10.5, marginTop: 10, color: encontra ? P.arcilla : P.ciruela }}>
                      Cuba: {t.estado_cuba}
                    </div>
                  ) : null}
                </Tarjeta>
              );
            })}
          </div>

          <CurvaModelo modelo={datos.modelo} aviso={datos.meta.aviso_simulacion} />
        </Seccion>

        {/* ------------------------------------------------ 2 · estado + malla */}
        <Seccion numero={2} titulo="El estado del sistema" sumario={datos.estado_sistema.lectura}>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {datos.estado_sistema.indicadores.map((ind, i) => (
              <Anillo
                key={ind.id}
                valor={ind.valor}
                etiqueta={ind.etiqueta}
                color={[P.arcilla, P.ciruela, P.ciruela, P.arcilla, P.salvia, P.salvia][i % 6]}
              />
            ))}
          </div>
          <div style={{ marginTop: 22 }}>
            <Confianza nivel={datos.estado_sistema.confianza} procedencia={datos.estado_sistema.procedencia} />
          </div>
          <Nota>
            {datos.estado_sistema.fuente} · margen de error {datos.estado_sistema.margen_error} · nivel de confianza{" "}
            {datos.estado_sistema.nivel_confianza}.
          </Nota>

          <h3 style={{ fontFamily: TITULAR, fontSize: 17, margin: "40px 0 8px" }}>
            Por qué casi todos coinciden y casi nadie actúa
          </h3>
          <p style={{ color: P.tintaTenue, fontSize: 14.5, lineHeight: 1.7, maxWidth: 760, marginTop: 0 }}>
            Una norma no se sostiene por convicción, sino por lo que cada persona cree que creen las demás. Cuando la
            distribución real y la percibida divergen, la norma dañina se mantiene sola.
          </p>
          <MallaNormas real={desaprueba} aviso={datos.meta.aviso_simulacion} />
        </Seccion>

        {/* ------------------------------------------------ 3 · comparación */}
        <Seccion numero={3} titulo="Comparación interna: la densidad asociativa antes de 1959" sumario={datos.comparacion_interna.tesis}>
          <Nota tono="alerta">{datos.comparacion_interna.nota_metodologica}</Nota>

          <h3 style={{ fontFamily: TITULAR, fontSize: 16, margin: "30px 0 14px" }}>Lo que existía</h3>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {datos.comparacion_interna.existente.map((it) => (
              <Tarjeta key={it.id} acento={COLOR_CONFIANZA[it.confianza]}>
                <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>{it.descripcion}</div>
                {it.magnitud ? (
                  <div style={{ fontFamily: MONO, fontSize: 13, color: P.petroleo, marginBottom: 8 }}>{it.magnitud}</div>
                ) : null}
                <div style={{ fontFamily: MONO, fontSize: 10.5, color: P.tintaTenue, marginBottom: 8 }}>{it.anio}</div>
                <Confianza nivel={it.confianza} procedencia={it.procedencia} />
              </Tarjeta>
            ))}
          </div>

          <h3 style={{ fontFamily: TITULAR, fontSize: 16, margin: "34px 0 14px" }}>Lo que no existía (por qué no idealizar)</h3>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {datos.comparacion_interna.ausente.map((it) => (
              <Tarjeta key={it.id} acento={P.arcilla}>
                <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 10 }}>{it.descripcion}</div>
                <Confianza nivel={it.confianza} procedencia={it.procedencia} />
              </Tarjeta>
            ))}
          </div>

          <div style={{ marginTop: 26 }}>
            <Tarjeta acento={P.ciruela}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: P.ciruela, marginBottom: 8 }}>
                EL REEMPLAZO · 1960–1961
              </div>
              <div style={{ fontSize: 14.5, lineHeight: 1.65, marginBottom: 10 }}>
                {datos.comparacion_interna.reemplazo.descripcion}
              </div>
              <div style={{ fontSize: 14.5, lineHeight: 1.65, marginBottom: 12 }}>
                {datos.comparacion_interna.reemplazo.mecanismo}
              </div>
              <Confianza
                nivel={datos.comparacion_interna.reemplazo.confianza}
                procedencia={datos.comparacion_interna.reemplazo.procedencia}
              />
            </Tarjeta>
          </div>
        </Seccion>

        {/* ------------------------------------------------ 4 · contrafactuales */}
        <Seccion
          numero={4}
          titulo="Contrafactuales internos"
          sumario="Ejercicios de plausibilidad construidos para explicitar supuestos causales. Ninguna cifra de esta sección debe citarse como dato. Pulsa para desplegar."
        >
          <div style={{ display: "grid", gap: 12 }}>
            {datos.contrafactuales.map((cf, i) => (
              <BloqueContrafactual key={cf.id} cf={cf} abiertoInicial={i === 0} />
            ))}
          </div>
        </Seccion>

        {/* ------------------------------------------------ 5 · casos externos */}
        <Seccion
          numero={5}
          titulo="Comparaciones externas"
          sumario="Casos seleccionados por disponer de mediciones conductuales, no de narrativas de éxito. Se documentan también sus costes y sus límites de transferibilidad."
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            {datos.casos_externos.map((c, i) => (
              <Boton key={c.id} activo={i === casoActivo} color={COLOR_CASO[c.id] || P.petroleo} onClick={() => setCasoActivo(i)}>
                {c.caso}
              </Boton>
            ))}
          </div>

          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: P.tintaTenue, marginBottom: 4 }}>
                {caso.pais} · {caso.periodo} · {caso.velocidad}
              </div>
              <h3 style={{ fontFamily: TITULAR, fontSize: 22, margin: "0 0 12px" }}>{caso.caso}</h3>
              <div style={{ fontSize: 14.5, lineHeight: 1.65, marginBottom: 16 }}>{caso.mecanismo}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    padding: "3px 8px",
                    border: `1px solid ${caso.democratico ? P.petroleo : P.arcilla}`,
                    color: caso.democratico ? P.petroleo : P.arcilla,
                    borderRadius: 2
                  }}
                >
                  {caso.democratico ? "democrático" : "no democrático"}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    padding: "3px 8px",
                    border: `1px solid ${P.borde}`,
                    color: P.tintaTenue,
                    borderRadius: 2
                  }}
                >
                  palanca: {caso.palanca_dominante}
                </span>
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11.5,
                  color: P.salvia,
                  lineHeight: 1.6,
                  borderTop: `1px dotted ${P.borde}`,
                  paddingTop: 10
                }}
              >
                Transferibilidad a Cuba hoy: {caso.transferibilidad}
              </div>
            </div>

            <div>
              <Pesas indicadores={caso.indicadores} color={COLOR_CASO[caso.id] || P.petroleo} />
              {caso.condiciones ? (
                <div style={{ marginTop: 8 }}>
                  {caso.condiciones.map((c) => (
                    <div
                      key={c.condicion}
                      style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: `1px solid ${P.borde}` }}
                    >
                      <span style={{ fontFamily: MONO, fontSize: 13, color: c.presente_en_cuba ? P.petroleo : P.arcilla }}>
                        {c.presente_en_cuba ? "✓" : "✕"}
                      </span>
                      <span style={{ fontSize: 13.5, lineHeight: 1.55, color: P.tintaTenue }}>{c.condicion}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <Tarjeta acento={P.arcilla}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: P.arcilla, marginBottom: 9 }}>
                ADVERTENCIAS DEL CASO
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, color: P.tintaTenue, fontSize: 13.5, lineHeight: 1.7 }}>
                {caso.advertencias.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${P.borde}`, fontSize: 14.5, lineHeight: 1.6 }}>
                <span style={{ fontFamily: MONO, fontSize: 10, color: P.petroleo, letterSpacing: "0.1em" }}>LO SÓLIDO · </span>
                {caso.hallazgo_solido}
              </div>
            </Tarjeta>
          </div>

          <h3 style={{ fontFamily: TITULAR, fontSize: 16, margin: "36px 0 6px" }}>Qué palanca movió cada caso</h3>
          <p style={{ color: P.tintaTenue, fontSize: 13.5, lineHeight: 1.6, maxWidth: 700, marginTop: 0 }}>
            Peso relativo asignado por lectura de los mecanismos documentados, no medido.{" "}
            <Confianza nivel="estimado" compacto />
          </p>
          <div style={{ width: "100%", height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius="72%">
                <PolarGrid stroke={P.borde} />
                <PolarAngleAxis dataKey="eje" tick={{ fill: P.tintaTenue, fontFamily: MONO, fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: P.borde, fontSize: 9 }} axisLine={false} />
                {datos.casos_externos.map((c) => (
                  <Radar
                    key={c.id}
                    name={c.caso}
                    dataKey={c.caso}
                    stroke={COLOR_CASO[c.id] || P.petroleo}
                    fill={COLOR_CASO[c.id] || P.petroleo}
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                ))}
                <Legend wrapperStyle={{ fontFamily: MONO, fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: P.superficie, border: `1px solid ${P.borde}`, fontFamily: MONO, fontSize: 12, color: P.tinta }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Seccion>

        {/* ------------------------------------------------ 6 · ventanas rotas */}
        <Seccion numero={6} titulo="Ventanas rotas, bien entendidas" sumario={vr.aclaracion}>
          <h3 style={{ fontFamily: TITULAR, fontSize: 16, margin: "0 0 8px" }}>
            La violación visible de una norma debilita otras normas distintas
          </h3>
          <p style={{ color: P.tintaTenue, fontSize: 14, lineHeight: 1.65, maxWidth: 720, marginTop: 0 }}>
            {vr.keizer.descripcion}
          </p>
          <Pendientes experimentos={vr.keizer.experimentos} />
          <div style={{ marginTop: 12 }}>
            <Confianza nivel={vr.keizer.confianza} procedencia={vr.keizer.procedencia} />
          </div>
          <Nota tono="alerta">{vr.keizer.limitacion}</Nota>

          <h3 style={{ fontFamily: TITULAR, fontSize: 16, margin: "38px 0 8px" }}>
            Reparar el entorno funciona. Perseguir infracciones menores, no.
          </h3>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {vr.braga.tipos.map((t) => (
              <Tarjeta key={t.tipo} acento={t.significativo ? P.petroleo : P.arcilla}>
                <div style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 10 }}>{t.tipo}</div>
                <div style={{ fontFamily: TITULAR, fontSize: 28, color: t.significativo ? P.petroleo : P.arcilla }}>
                  {t.efecto !== null && t.efecto !== undefined ? `${fmt(t.efecto)} %` : "n. s."}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: P.tintaTenue, marginTop: 6 }}>
                  {t.comparaciones} comparaciones · {t.significativo ? "significativo" : t.nota || "no significativo"}
                </div>
              </Tarjeta>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <Confianza nivel={vr.braga.confianza} procedencia={vr.braga.procedencia} />
          </div>
          <Nota tono="alerta">
            {vr.braga.comparaciones_totales} comparaciones principales, reducción media estimada{" "}
            {fmt(vr.braga.reduccion_media)} %. {vr.braga.heterogeneidad}
          </Nota>

          <h3 style={{ fontFamily: TITULAR, fontSize: 16, margin: "38px 0 8px" }}>Restaurar terrenos baldíos: Filadelfia</h3>
          <p style={{ color: P.tintaTenue, fontSize: 14, lineHeight: 1.65, maxWidth: 720, marginTop: 0 }}>
            {vr.filadelfia.descripcion}
          </p>
          <div style={{ maxWidth: 640 }}>
            <Divergente efectos={vr.filadelfia.efectos} />
          </div>
          <div style={{ marginTop: 10 }}>
            <Confianza nivel={vr.filadelfia.confianza} procedencia={vr.filadelfia.procedencia} />
          </div>
          <Nota>{vr.filadelfia.lectura}</Nota>

          <div style={{ marginTop: 34 }}>
            <Tarjeta acento={P.ciruela}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: P.ciruela, marginBottom: 10 }}>
                LA VENTANA INSTITUCIONAL
              </div>
              <div style={{ fontSize: 15.5, lineHeight: 1.65, marginBottom: 16 }}>{vr.ventana_institucional}</div>
              <div style={{ maxWidth: 620 }}>
                <VentanaInstitucional datos={vr.honduras} />
              </div>
              <div style={{ marginTop: 10 }}>
                <Confianza nivel={vr.honduras.confianza} procedencia={vr.honduras.procedencia} />
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.65, color: P.tintaTenue, marginTop: 14 }}>{vr.honduras.lectura}</div>
            </Tarjeta>
          </div>
        </Seccion>

        {/* ------------------------------------------------ 7 · acciones */}
        <Seccion
          numero={7}
          titulo="Qué se puede hacer ahora y qué requiere transición"
          sumario="La distinción que casi toda la literatura de reconstrucción cívica cubana omite."
        >
          <div style={{ display: "grid", gap: 16 }}>
            {datos.acciones.map((bloque) => {
              const col = bloque.id === "ahora" ? P.petroleo : bloque.id === "apertura" ? P.ciruela : P.arcilla;
              return (
                <div key={bloque.id}>
                  <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap", marginBottom: 10 }}>
                    <h3 style={{ fontFamily: TITULAR, fontSize: 17, color: col, margin: 0 }}>{bloque.nivel}</h3>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: P.tintaTenue }}>{bloque.condicion}</span>
                  </div>
                  <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))" }}>
                    {bloque.items.map((it) => (
                      <Tarjeta key={it.titulo} acento={col}>
                        <div style={{ fontFamily: TITULAR, fontSize: 14, marginBottom: 7 }}>{it.titulo}</div>
                        <div style={{ fontSize: 13.5, lineHeight: 1.62, color: P.tintaTenue }}>{it.detalle}</div>
                      </Tarjeta>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Seccion>

        {/* ------------------------------------------------ 8 · secuencia */}
        <Seccion numero={8} titulo="Secuencia y criterio de éxito">
          <Secuencia etapas={datos.secuencia} />
          <div style={{ marginTop: 40 }}>
            <IndiceInteractivo indice={datos.indice_ct} aviso={datos.meta.aviso_simulacion} />
            <Nota>{datos.indice_ct.advertencia}</Nota>
          </div>
          <div style={{ marginTop: 30 }}>
            <Tarjeta acento={P.salvia}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: P.salvia, marginBottom: 9 }}>
                CONDICIÓN DE FALSACIÓN
              </div>
              <div style={{ fontSize: 14.5, lineHeight: 1.68 }}>{datos.falsacion}</div>
            </Tarjeta>
          </div>
        </Seccion>

        {/* ------------------------------------------------ 9 · contraindicados */}
        <Seccion numero={9} titulo="Lo que casi con seguridad empeoraría el fenómeno">
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {datos.contraindicaciones.map((c) => (
              <div
                key={c}
                style={{
                  display: "flex",
                  gap: 11,
                  alignItems: "flex-start",
                  background: P.superficie,
                  border: `1px solid ${P.borde}`,
                  borderRadius: 3,
                  padding: "12px 14px"
                }}
              >
                <span style={{ fontFamily: MONO, color: P.arcilla, fontSize: 14, lineHeight: 1.4 }}>✕</span>
                <span style={{ fontSize: 13.5, lineHeight: 1.6, color: P.tintaTenue }}>{c}</span>
              </div>
            ))}
          </div>
        </Seccion>

        {/* ------------------------------------------------ 10 · cierre */}
        <Seccion numero={10} titulo="Cierre">
          <blockquote
            style={{
              margin: 0,
              borderLeft: `3px solid ${P.petroleo}`,
              paddingLeft: 20,
              fontSize: "clamp(17px, 2.6vw, 23px)",
              lineHeight: 1.5,
              maxWidth: 780
            }}
          >
            {datos.tesis.cierre}
          </blockquote>
          <Nota tono="alerta">{datos.meta.nota_ecosistema}</Nota>
        </Seccion>

        {/* ------------------------------------------------ 11 · tu lectura */}
        <Seccion
          numero={11}
          titulo={datos.encuesta.titulo || "Tu lectura"}
        >
          <Encuesta encuesta={datos.encuesta} slug={datos.meta.slug} />
        </Seccion>

        {/* ------------------------------------------------ 12 · fuentes */}
        <Seccion numero={12} titulo="Fuentes">
          <ol style={{ margin: 0, paddingLeft: 20, color: P.tintaTenue, fontSize: 13, lineHeight: 1.85 }}>
            {datos.fuentes.map((f) => (
              <li key={f.id}>
                {f.url ? (
                  <a href={f.url} style={{ color: P.salvia }} target="_blank" rel="noopener noreferrer">
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
            paddingTop: 22,
            fontFamily: MONO,
            fontSize: 11,
            color: P.tintaTenue,
            lineHeight: 1.7
          }}
        >
          Yamacoa · {datos.meta.slug} · renderer congelado v{datos.meta.version}. El archivo .jsx no se modifica tras la
          publicación; solo respira el dataset. Fórmulas en MathML nativo servido desde el dataset.
        </footer>
      </div>
    </div>
  );
}
