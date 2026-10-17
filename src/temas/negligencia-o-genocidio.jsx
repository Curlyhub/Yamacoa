import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ResponsiveContainer, ComposedChart, LineChart, Line, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, Area,
  ScatterChart, Scatter, ZAxis, Cell
} from "recharts";

/* ------------------------------------------------------------------ *
 *  Yamacoa · negligencia-o-genocidio
 *  Renderer congelado. No modificar tras publicacion.
 *  Todo cambio de contenido va en negligencia-o-genocidio.json
 * ------------------------------------------------------------------ */

const DATA_URL =
  ((typeof process !== "undefined" && process.env && process.env.PUBLIC_URL) || "") +
  "/data/negligencia.json";

const DATOS_EMBEBIDOS = {
  "slug": "negligencia-o-genocidio",
  "titulo": "Negligencia criminal o genocidio silencioso",
  "subtitulo": "Qué categoría resiste los datos cuando se audita la mortalidad cubana 2006-2026",
  "version": "1.0.0",
  "fecha_publicacion": "2026-08-17",
  "fecha_datos": "2026-08-17",
  "resumen": "Entre 2020 y 2025 murieron en Cuba entre 107.000 y 151.000 personas por encima de lo que predice su propia trayectoria de envejecimiento. La mortalidad infantil pasó de 4,0 a 9,9 por mil nacidos vivos, un indicador que ni la emigración ni el envejecimiento pueden explicar. Esta ficha somete tres hipótesis causales a prueba —embargo, pandemia, política económica interna— y después somete el resultado a los tres tests jurídicos que se invocan en el debate público: genocidio, exterminio como crimen de lesa humanidad, y el artículo 72 de la Constitución cubana de 2019.",
  "tesis": "El término genocidio falla dos de sus tres elementos constitutivos y su uso debilita la exigencia de responsabilidad al ofrecer una refutación fácil. El estándar que Cuba sí incumple de forma documentable es el que su propio Estado se impuso por escrito.",
  "paleta": {
    "fondo": "#E9EEEC",
    "superficie": "#FBFCFB",
    "tinta": "#12181A",
    "tintaSuave": "#5A6A6C",
    "regla": "#C6D2CE",
    "petroleo": "#14494F",
    "ciruela": "#7A2B3F",
    "oliva": "#63763F",
    "violeta": "#4C4478",
    "ambar": "#C98A17",
    "arena": "#A8A08C",
    "nota_ambar": "El ámbar #C98A17 está reservado en toda la plataforma exclusivamente para contenido contrafactual."
  },
  "correcciones": [
    {
      "afirmacion": "Cuba perdió por muerte el 19,19% de su población de 2006, más que España (18,87%) o Francia (18,82%).",
      "veredicto": "Indicador inservible",
      "confianza": "calculado",
      "razon": "Dividir defunciones acumuladas de 20 años entre la población inicial mide sobre todo estructura de edad y crecimiento poblacional, no deterioro sanitario. El propio resultado se autorrefuta: una diferencia de 0,32 puntos frente a España no distingue nada, y los insumos del cálculo original eran cifras redondeadas de forma aproximada, no series oficiales.",
      "correccion": "Sustituido por dos indicadores válidos: exceso de mortalidad frente a la propia tendencia de envejecimiento del país, y mortalidad infantil, que es insensible tanto a la migración como a la estructura etaria."
    },
    {
      "afirmacion": "El embargo estadounidense explica el colapso demográfico.",
      "veredicto": "No identificable como causa del cambio",
      "confianza": "calculado",
      "razon": "El embargo es una constante desde 1962. Su fase más restrictiva documentada (Torricelli 1992, Helms-Burton 1996) coincidió con un periodo en que la esperanza de vida cubana siguió subiendo y la mortalidad infantil siguió bajando. El deterioro se fecha en 2019-2025. Una variable constante no puede explicar un cambio de nivel.",
      "correccion": "El embargo funciona en el análisis como restricción presupuestaria de fondo, no como tratamiento. La variable que sí cambia en la ventana relevante es la asignación interna de recursos."
    }
  ],
  "series_demografia": [
    {
      "anio": 2019,
      "defunciones": 109089,
      "nacimientos": 108000,
      "poblacion": 11193470,
      "conf_def": "confirmado",
      "conf_nac": "estimado"
    },
    {
      "anio": 2020,
      "defunciones": 112439,
      "nacimientos": 105038,
      "poblacion": 11181595,
      "conf_def": "confirmado",
      "conf_nac": "estimado"
    },
    {
      "anio": 2021,
      "defunciones": 167675,
      "nacimientos": 99096,
      "poblacion": 11113215,
      "conf_def": "confirmado",
      "conf_nac": "confirmado"
    },
    {
      "anio": 2022,
      "defunciones": 120098,
      "nacimientos": 95403,
      "poblacion": 11089511,
      "conf_def": "confirmado",
      "conf_nac": "confirmado"
    },
    {
      "anio": 2023,
      "defunciones": 117739,
      "nacimientos": 90392,
      "poblacion": 10055968,
      "conf_def": "confirmado",
      "conf_nac": "confirmado"
    },
    {
      "anio": 2024,
      "defunciones": 128098,
      "nacimientos": 71374,
      "poblacion": 9748007,
      "conf_def": "confirmado",
      "conf_nac": "confirmado"
    },
    {
      "anio": 2025,
      "defunciones": 136214,
      "nacimientos": 68064,
      "poblacion": 9434593,
      "conf_def": "confirmado",
      "conf_nac": "confirmado"
    }
  ],
  "contrafactual": {
    "titulo": "Defunciones esperadas si Cuba solo hubiera envejecido",
    "metodo": "Se toma la tasa bruta de mortalidad de 2019 (9,746 por mil, la última prepandemia) y se la hace crecer a una deriva anual constante que representa el envejecimiento puro. Esa tasa contrafactual se aplica a la población realmente observada de cada año, no a una población proyectada. Aplicarla a la población real es lo que hace el ejercicio conservador: al reconocer que el país tiene cada año menos habitantes, se reduce mecanicamente el número de muertes esperadas.",
    "tasa_base_2019": 9.746,
    "deriva_base_pct": 1.7,
    "deriva_min_pct": 1,
    "deriva_max_pct": 3,
    "justificacion_deriva": "Entre 2014 y 2019 la tasa bruta de mortalidad cubana creció a un ritmo compuesto de 2,6% anual por envejecimiento. Se fija 1,7% como base por ser deliberadamente conservador: sobreestima el contrafactual y por tanto subestima el exceso.",
    "advertencia": "Todo el rango de este contrafactual es material contrafactual y se marca en ambar. No es una medición; es una comparación contra un mundo que no ocurrió.",
    "limitaciones": [
      "La deriva por envejecimiento se modela como constante; en la realidad se acelera cuando emigra masivamente la población en edad laboral, lo que sesga el contrafactual al alza y el exceso a la baja.",
      "La serie de población 2022-2023 incorpora una revisión metodológica de la ONEI hacia 'población efectiva' que produce un salto no demográfico entre ambos años.",
      "El exceso calculado no se atribuye a ninguna causa por si solo: es la magnitud a explicar, no la explicación."
    ]
  },
  "mortalidad_infantil": {
    "titulo": "El indicador que no admite coartada",
    "unidad": "defunciones de menores de un año por cada 1.000 nacidos vivos",
    "por_que_importa": "La mortalidad infantil es insensible a las dos explicaciones que el Estado ofrece para el resto de los indicadores. La emigración no la altera, porque el denominador son los nacidos vivos en el país ese mismo año. El envejecimiento no la altera, porque mide exclusivamente a menores de un año. Lo que mide es capacidad operativa del sistema de salud.",
    "cuba": [
      {
        "anio": 2015,
        "valor": 4.3,
        "conf": "reportado"
      },
      {
        "anio": 2016,
        "valor": 4.3,
        "conf": "reportado"
      },
      {
        "anio": 2017,
        "valor": 4,
        "conf": "reportado"
      },
      {
        "anio": 2018,
        "valor": 4,
        "conf": "confirmado"
      },
      {
        "anio": 2019,
        "valor": 5,
        "conf": "reportado"
      },
      {
        "anio": 2020,
        "valor": 4.9,
        "conf": "reportado"
      },
      {
        "anio": 2021,
        "valor": 7.6,
        "conf": "reportado"
      },
      {
        "anio": 2022,
        "valor": 7.5,
        "conf": "reportado"
      },
      {
        "anio": 2023,
        "valor": 7.1,
        "conf": "confirmado"
      },
      {
        "anio": 2024,
        "valor": 7.4,
        "conf": "confirmado"
      },
      {
        "anio": 2025,
        "valor": 9.9,
        "conf": "confirmado"
      }
    ],
    "comparadores": [
      {
        "pais": "Irán",
        "regimen_sancion": "Sancionado severamente desde 2012, reimpuesto 2018",
        "serie": [
          {
            "anio": 2015,
            "valor": 13.4
          },
          {
            "anio": 2018,
            "valor": 12.5
          },
          {
            "anio": 2021,
            "valor": 11.9
          },
          {
            "anio": 2025,
            "valor": 11
          }
        ],
        "conf": "estimado"
      },
      {
        "pais": "Vietnam",
        "regimen_sancion": "Embargo estadounidense total 1975-1994",
        "serie": [
          {
            "anio": 2015,
            "valor": 17.2
          },
          {
            "anio": 2018,
            "valor": 16.5
          },
          {
            "anio": 2021,
            "valor": 15.8
          },
          {
            "anio": 2025,
            "valor": 15.2
          }
        ],
        "conf": "estimado"
      },
      {
        "pais": "Venezuela",
        "regimen_sancion": "Sancionado desde 2017, sector petrolero 2019",
        "serie": [
          {
            "anio": 2015,
            "valor": 19.8
          },
          {
            "anio": 2018,
            "valor": 21.4
          },
          {
            "anio": 2021,
            "valor": 23.1
          },
          {
            "anio": 2025,
            "valor": 24
          }
        ],
        "conf": "estimado"
      },
      {
        "pais": "Taiwán",
        "regimen_sancion": "Exclusión diplomática desde 1971, sin bloqueo económico",
        "serie": [
          {
            "anio": 2015,
            "valor": 4
          },
          {
            "anio": 2018,
            "valor": 4
          },
          {
            "anio": 2021,
            "valor": 3.9
          },
          {
            "anio": 2025,
            "valor": 3.8
          }
        ],
        "conf": "estimado"
      },
      {
        "pais": "España",
        "regimen_sancion": "Bloqueo diplomático ONU 1946-1950, sin sanción actual",
        "serie": [
          {
            "anio": 2015,
            "valor": 2.7
          },
          {
            "anio": 2018,
            "valor": 2.7
          },
          {
            "anio": 2021,
            "valor": 2.6
          },
          {
            "anio": 2025,
            "valor": 2.6
          }
        ],
        "conf": "estimado"
      }
    ],
    "objecion_central": {
      "titulo": "La objeción que hay que conceder",
      "texto": "La linea base cubana de 4,0 por mil ha sido cuestionada en literatura revisada por pares. Berdine, Geloso y Powell (Health Policy and Planning, 2018) argumentaron que Cuba reclasificaba muertes neonatales tempranas como defunciones fetales tardías y ejercía presión sobre embarazos de riesgo, deprimiendo artificialmente el indicador. Si esa crítica es correcta, el punto de partida real era superior a 4,0 y el aumento proporcional del 148% está sobreestimado.",
      "efecto_sobre_tesis": "Debilita la magnitud, no la dirección. El salto de 7,4 a 9,9 ocurrió en un solo año y dentro del mismo régimen de registro, por lo que no puede explicarse por un cambio de definiciones anterior."
    }
  },
  "did": {
    "titulo": "Diseno de identificación",
    "advertencia_metodologica": "Este no es un estimador inferencial. Con una sola unidad tratada no existen errores estándar validos ni contraste de hipótesis posible. Lo que sigue es una comparación estructurada de trayectorias, presentada con la aritmética de diferencias en diferencias porque esa aritmética hace explicitos los supuestos. Un control sintético ponderado sería más defendible y requiere series completas que esta ficha aún no incorpora.",
    "unidad_tratada": "Cuba",
    "tratamiento": "El paquete de política 2019-2021: reversión del ciclo reformista de 2010-2016, Tarea Ordenamiento (1 de enero de 2021) y colapso del suministro eléctrico. No el embargo, que es constante.",
    "grupo_control": "Estados sancionados sin colapso institucional simultaneo: Irán, Vietnam, Corea del Norte",
    "resultado": "Logaritmo de la tasa de mortalidad infantil",
    "pre": "2010-2018",
    "post": "2019-2025",
    "delta_ln_cuba": 0.9063,
    "delta_ln_control": -0.101,
    "estimador_did_ln": 1.0073,
    "razon_implicada": 2.74,
    "lectura": "La mortalidad infantil cubana de 2025 es aproximadamente 2,7 veces la que habría correspondido si Cuba hubiera seguido la trayectoria media de otros estados fuertemente sancionados.",
    "supuestos_que_pueden_fallar": [
      "Tendencias paralelas: Cuba partía de un nivel muy inferior al del grupo de control, y los cambios proporcionales desde bases bajas se mueven más facilmente. En términos absolutos Cuba sumo 5,9 puntos y Venezuela 2,6; en términos proporcionales Cuba supera a Venezuela. Ambas lecturas son correctas y deben presentarse juntas.",
      "El tratamiento es un paquete, no una política. No es posible aislar el efecto de la Tarea Ordenamiento del efecto del colapso eléctrico o de la pandemia.",
      "Integridad del registro: si Cuba subregistraba antes, el pre está sesgado a la baja; si subregistra ahora, el post lo está también.",
      "Composición: los nacimientos cayeron un 25% entre 2023 y 2025, lo que altera el perfil de riesgo del denominador."
    ],
    "prueba_placebo": {
      "titulo": "Placebo en el tiempo",
      "texto": "Si el embargo fuera la causa, el deterioro debería aparecer cuando el embargo se endurece. La Ley Torricelli (1992) y la Helms-Burton (1996) constituyen el endurecimiento más severo documentado, coincidiendo además con la perdida del subsidio soviético. En ese periodo la mortalidad infantil cubana continuo descendiendo y la esperanza de vida continuo subiendo. El test placebo no detecta efecto donde la hipótesis del embargo predice el mayor efecto."
    }
  },
  "comparados": {
    "titulo": "Estados aislados, resultados divergentes",
    "nota_taxonomica": "Taiwán y España no son casos de bloqueo económico y se incluyen precisamente por eso: Taiwán sufre exclusión diplomática sin restricción comercial, y España sufrió un bloqueo diplomático de la ONU (Resolución 39(I), 1946) con exclusión del Plan Marshall. Sirven para separar aislamiento político de restricción material.",
    "casos": [
      {
        "pais": "Cuba",
        "periodo": "1962-presente",
        "tipo": "Embargo comercial unilateral",
        "intensidad": 8,
        "cambio_pob_pct_anual": -3.3,
        "poblacion_mm": 9.4,
        "resultado": "Contracción de 1,6 millones en cinco años sin guerra",
        "destacar": true
      },
      {
        "pais": "Venezuela",
        "periodo": "2017-presente",
        "tipo": "Sanciones sectoriales y financieras",
        "intensidad": 7,
        "cambio_pob_pct_anual": -1.2,
        "poblacion_mm": 28.4,
        "resultado": "Exodo de unos 7,9 millones; mortalidad infantil al alza",
        "destacar": false
      },
      {
        "pais": "Irán",
        "periodo": "2012-presente",
        "tipo": "Sanciones financieras y petroleras",
        "intensidad": 8,
        "cambio_pob_pct_anual": 0.6,
        "poblacion_mm": 90.6,
        "resultado": "Población creciente; mortalidad infantil descendente",
        "destacar": false
      },
      {
        "pais": "Corea del Norte",
        "periodo": "1950-presente",
        "tipo": "Sanciones multilaterales integrales",
        "intensidad": 10,
        "cambio_pob_pct_anual": 0.4,
        "poblacion_mm": 26.5,
        "resultado": "Hambruna documentada 1994-1998; población aún creciente",
        "destacar": false
      },
      {
        "pais": "Vietnam",
        "periodo": "1975-1994",
        "tipo": "Embargo estadounidense total",
        "intensidad": 9,
        "cambio_pob_pct_anual": 2.1,
        "poblacion_mm": 100.3,
        "resultado": "Crecimiento sostenido bajo embargo; despegue tras Doi Moi",
        "destacar": false
      },
      {
        "pais": "Serbia (RFY)",
        "periodo": "1992-1996",
        "tipo": "Bloqueo integral ONU",
        "intensidad": 9,
        "cambio_pob_pct_anual": -0.1,
        "poblacion_mm": 6.6,
        "resultado": "Hiperinflación; población prácticamente estable",
        "destacar": false
      },
      {
        "pais": "Irak",
        "periodo": "1990-2003",
        "tipo": "Sanciones integrales ONU",
        "intensidad": 10,
        "cambio_pob_pct_anual": 2.7,
        "poblacion_mm": 24,
        "resultado": "Exceso de mortalidad infantil real pero muy inferior al alegado por el gobierno de la epoca",
        "destacar": false
      },
      {
        "pais": "España",
        "periodo": "1946-1950",
        "tipo": "Bloqueo diplomático ONU y exclusión del Plan Marshall",
        "intensidad": 5,
        "cambio_pob_pct_anual": 0.8,
        "poblacion_mm": 28,
        "resultado": "Estancamiento bajo autarquía; despegue tras el Plan de Estabilización de 1959",
        "destacar": false
      },
      {
        "pais": "Taiwán",
        "periodo": "1971-presente",
        "tipo": "Exclusión diplomática sin restricción comercial",
        "intensidad": 2,
        "cambio_pob_pct_anual": -0.2,
        "poblacion_mm": 23.4,
        "resultado": "Fecundidad más baja del mundo y población en descenso, pero sin exceso de mortalidad",
        "destacar": false
      }
    ],
    "hallazgo": "La intensidad de sanción no ordena los resultados demográficos. Los dos casos con contracción poblacional acelerada, Cuba y Venezuela, no son los más sancionados; son los que combinan sanción con colapso de capacidad estatal interna. Irak y Corea del Norte, más sancionados, crecieron. Taiwán demuestra que envejecimiento y baja fecundidad por si solos producen descenso lento, no colapso.",
    "caso_espana": {
      "titulo": "El contrafactual histórico más incomodo",
      "texto": "España estuvo diplomaticamente bloqueada por la Resolución 39(I) de la Asamblea General de la ONU en diciembre de 1946: retirada de embajadores, exclusión de los organismos especializados y del Plan Marshall. Respondio con dos décadas de autarquía y estancamiento. En 1959 el régimen mantuvo intacta su naturaleza política pero cambio por completo su política económica con el Plan de Estabilización. El resultado fue el segundo mayor crecimiento del mundo en la década siguiente. El caso demuestra que el aislamiento externo no determina el resultado material: lo determina la respuesta de política interna, y esa respuesta no exige democratización previa."
    }
  },
  "politica_economica": {
    "titulo": "Veinte años de decisiones, medidas contra defunciones",
    "hitos": [
      {
        "anio": 2006,
        "mes": 7,
        "evento": "Raul Castro asume el poder de forma provisional",
        "signo": "neutro",
        "detalle": "Inicio de la ventana de análisis."
      },
      {
        "anio": 2008,
        "mes": 7,
        "evento": "Decreto-Ley 259: entrega de tierras ociosas en usufructo",
        "signo": "aperturista",
        "detalle": "Primera reforma estructural del periodo."
      },
      {
        "anio": 2011,
        "mes": 4,
        "evento": "Lineamientos del VI Congreso; expansión del trabajo por cuenta propia",
        "signo": "aperturista",
        "detalle": "Se anuncia el recorte de 500.000 plazas estatales."
      },
      {
        "anio": 2014,
        "mes": 12,
        "evento": "Deshielo con Estados Unidos; Ley 118 de inversión extranjera",
        "signo": "aperturista",
        "detalle": "Auge turístico y expansión de remesas."
      },
      {
        "anio": 2017,
        "mes": 6,
        "evento": "NSPM-5: reversión de la política estadounidense",
        "signo": "restrictivo_externo",
        "detalle": "Congelación de nuevas licencias."
      },
      {
        "anio": 2019,
        "mes": 2,
        "evento": "Nueva Constitución; freno interno al ciclo reformista",
        "signo": "restrictivo_interno",
        "detalle": "El articulo 72 consagra la salud como derecho garantizado por el Estado."
      },
      {
        "anio": 2020,
        "mes": 11,
        "evento": "Cierre de Western Union; tope a remesas",
        "signo": "restrictivo_externo",
        "detalle": "Corte del principal canal formal de divisas familiares."
      },
      {
        "anio": 2021,
        "mes": 1,
        "evento": "Tarea Ordenamiento: unificación monetaria y devaluación 1:24",
        "signo": "restrictivo_interno",
        "detalle": "Shock inflacionario. Punto de inflexion del análisis."
      },
      {
        "anio": 2021,
        "mes": 8,
        "evento": "Decretos-Ley 46 y 47: autorización de mipymes",
        "signo": "aperturista",
        "detalle": "Liberalización parcial y tardía, siete meses después del shock."
      },
      {
        "anio": 2022,
        "mes": 3,
        "evento": "Inicio de la mayor ola migratoria de la historia cubana",
        "signo": "consecuencia",
        "detalle": "Salida neta sostenida por encima de 200.000 personas anuales."
      },
      {
        "anio": 2024,
        "mes": 10,
        "evento": "Primer apagon nacional total del sistema electroenergético",
        "signo": "consecuencia",
        "detalle": "Se repite en diciembre de 2024 y marzo de 2025."
      },
      {
        "anio": 2025,
        "mes": 8,
        "evento": "Epidemia declarada de arbovirosis: dengue, chikungunya y oropouche",
        "signo": "consecuencia",
        "detalle": "El MINSAP reconoció contagio en torno a un tercio de la población."
      }
    ],
    "inversion_2024": {
      "titulo": "La prueba documental de la asignación",
      "fuente": "ONEI, Indicadores Seleccionados de Inversiones, diciembre 2024",
      "total_mm_pesos": 98569.5,
      "ocupacion_hotelera_pct": 23,
      "partidas": [
        {
          "rubro": "Servicios empresariales e inmobiliarias",
          "pct_2023": 24.6,
          "pct_2024": 25.3,
          "mm_2024": 24907.3,
          "grupo": "turismo"
        },
        {
          "rubro": "Hoteles y restaurantes",
          "pct_2023": 8.9,
          "pct_2024": 12.1,
          "mm_2024": 11936.5,
          "grupo": "turismo"
        },
        {
          "rubro": "Industria manufacturera",
          "pct_2023": 17.4,
          "pct_2024": 17.4,
          "mm_2024": 17151.1,
          "grupo": "otros"
        },
        {
          "rubro": "Electricidad, gas y agua",
          "pct_2023": 10,
          "pct_2024": 12.9,
          "mm_2024": 12715.5,
          "grupo": "otros"
        },
        {
          "rubro": "Transporte y comunicaciones",
          "pct_2023": 14.1,
          "pct_2024": 9.7,
          "mm_2024": 9543.5,
          "grupo": "otros"
        },
        {
          "rubro": "Agricultura y ganadería",
          "pct_2023": 3.1,
          "pct_2024": 2.7,
          "mm_2024": 2671.4,
          "grupo": "social"
        },
        {
          "rubro": "Administración pública y defensa",
          "pct_2023": 3.4,
          "pct_2024": 2.7,
          "mm_2024": 2645.5,
          "grupo": "otros"
        },
        {
          "rubro": "Salud pública y asistencia social",
          "pct_2023": 1.8,
          "pct_2024": 2,
          "mm_2024": 1977.4,
          "grupo": "social"
        },
        {
          "rubro": "Educación",
          "pct_2023": 1.4,
          "pct_2024": 1,
          "mm_2024": 993.9,
          "grupo": "social"
        }
      ],
      "lectura": "El 37,4% de toda la inversión nacional de 2024 se dirigió a infraestructura turística operando al 23% de ocupación. Salud pública recibió el 2,0%. Educación cayó de 1,4% a 1,0%. Ese mismo año se registraron 128.098 defunciones y la mortalidad infantil subió a 7,4 por mil.",
      "confianza": "confirmado"
    }
  },
  "test_juridico": {
    "titulo": "Tres estándares, tres resultados distintos",
    "advertencia": "Yamacoa no es un tribunal y esta sección no constituye una imputación penal. Lo que se hace aquí es aplicar los elementos constitutivos de cada figura al expediente factico disponible y señalar cuales se cumplen y cuales no.",
    "estandares": [
      {
        "figura": "Genocidio",
        "norma": "Convención de 1948, articulo II; Estatuto de Roma, articulo 6",
        "veredicto": "No se sostiene",
        "color": "fallo",
        "elementos": [
          {
            "elemento": "Grupo protegido: nacional, etnico, racial o religioso",
            "estado": "no_cumple",
            "razon": "El colectivo afectado es la población general. Los grupos políticos y económicos fueron excluidos deliberadamente del texto de 1948 durante su negociación."
          },
          {
            "elemento": "Actus reus: matanza o sometimiento a condiciones de existencia destructivas",
            "estado": "parcial",
            "razon": "La privación de acceso a medicamentos e insumos está documentada. Su calificación como sometimiento deliberado no lo está."
          },
          {
            "elemento": "Dolus specialis: intención de destruir al grupo como tal",
            "estado": "no_cumple",
            "razon": "La facilitación estatal de la emigración masiva es contraprueba directa. Un Estado que permite y tramita la salida de su población no está ejecutando un plan de destrucción in situ."
          }
        ]
      },
      {
        "figura": "Exterminio como crimen de lesa humanidad",
        "norma": "Estatuto de Roma, articulo 7.1.b y 7.2.b",
        "veredicto": "No acreditado, pero es la figura estructuralmente más próxima",
        "color": "abierto",
        "elementos": [
          {
            "elemento": "Privación de acceso a alimentos y medicinas",
            "estado": "cumple",
            "razon": "Documentada por la CIDH, por organizaciones independientes y por las propias cifras de abastecimiento del MINSAP."
          },
          {
            "elemento": "Ataque generalizado o sistematico contra población civil",
            "estado": "parcial",
            "razon": "La generalidad está acreditada; el carácter de ataque dirigido no."
          },
          {
            "elemento": "Politica de Estado dirigida a cometer el ataque",
            "estado": "no_cumple",
            "razon": "El elemento de política exige dirección, no solo resultado. La asignación presupuestaria acredita prioridades incompatibles con la vida, no una política de causar muertes."
          },
          {
            "elemento": "Calculo dirigido a la destrucción de parte de la población",
            "estado": "no_cumple",
            "razon": "La norma exige que las condiciones esten calculadas para destruir. La evidencia sostiene previsibilidad e indiferencia, no cálculo."
          }
        ]
      },
      {
        "figura": "Articulo 72 de la Constitución de la República de Cuba (2019)",
        "norma": "Texto aprobado en referendo el 24 de febrero de 2019 y redactado por el propio Estado",
        "veredicto": "Incumplido de forma documentable",
        "color": "incumplido",
        "elementos": [
          {
            "elemento": "La salud pública es un derecho de todas las personas",
            "estado": "cumple",
            "razon": "Obligación vigente, autoimpuesta, no derivada de tratado alguno. Cuba firmo el PIDESC en 2008 pero nunca lo ratifico, de modo que este es el estándar exigible más fuerte."
          },
          {
            "elemento": "El Estado garantiza el acceso a los servicios",
            "estado": "incumple",
            "razon": "Desabastecimiento crónico del cuadro básico de medicamentos y cierre de servicios por falta de insumos y de personal."
          },
          {
            "elemento": "El Estado garantiza la calidad de los servicios",
            "estado": "incumple",
            "razon": "La mortalidad infantil paso de 4,0 a 9,9 por mil entre 2018 y 2025. La mortalidad materna subió de 38,7 a 44,1 por cien mil entre 2023 y 2025."
          },
          {
            "elemento": "Asignación del máximo de recursos disponibles",
            "estado": "incumple",
            "razon": "Con el 37,4% de la inversión nacional dirigida a turismo al 23% de ocupación y el 2,0% a salud, la restricción presupuestaria externa no explica la distribución interna."
          }
        ]
      }
    ],
    "conclusion": "La categoría correcta no es genocidio. Tampoco es negligencia, porque negligencia implica un resultado no previsto, y el deterioro fue advertido, medido y publicado por los propios organos estadísticos del Estado antes de agravarse. Lo que el expediente sostiene es una decisión sostenida de asignación de recursos, mantenida durante siete años consecutivos frente a indicadores de mortalidad que empeoraban de forma pública y verificable.",
    "por_que_importa_la_precision": "Invocar genocidio no eleva la exigencia de responsabilidad: la reduce. Ofrece a cualquier interlocutor una refutación de un solo paso, la ausencia de grupo protegido y de dolo especial, que permite descartar todo el expediente junto con el término. La imputación que resiste es la que se construye sobre el articulo 72 y sobre las cifras de inversión de la ONEI, porque ambas son documentos del propio Estado."
  },
  "encuesta": {
    "titulo": "Participa",
    "descripcion": "Los resultados se publican en agregado y son anonimos. Un voto por pregunta y navegador.",
    "preguntas": [
      {
        "id": "categoria",
        "texto": "Tras revisar los tres estándares, cual describe mejor la responsabilidad del Estado cubano por la mortalidad de la ultima década?",
        "opciones": [
          "Genocidio en sentido jurídico estricto",
          "Crimen de lesa humanidad, aún no acreditado",
          "Incumplimiento sostenido de obligaciones propias",
          "Negligencia sin intencionalidad",
          "La responsabilidad principal es del embargo"
        ]
      },
      {
        "id": "factor",
        "texto": "Que factor considera determinante en el exceso de mortalidad 2020-2025?",
        "opciones": [
          "La asignación interna de recursos",
          "El embargo estadounidense",
          "La pandemia y sus secuelas",
          "El envejecimiento y la emigración de personal sanitario",
          "Una combinación sin factor dominante"
        ]
      },
      {
        "id": "terminologia",
        "texto": "Usar la palabra genocidio en este caso, ayuda o perjudica la exigencia de responsabilidad?",
        "opciones": [
          "Ayuda: nombra la gravedad real",
          "Perjudica: ofrece una refutación fácil",
          "Es indiferente al resultado político",
          "No tengo posición formada"
        ]
      }
    ]
  },
  "referencias": [
    {
      "id": 1,
      "fuente": "ONEI",
      "titulo": "Indicadores Demograficos de Cuba y sus Territorios 2025",
      "fecha": "2026-07-21",
      "url": "http://www.cubadebate.cu/noticias/2026/07/21/cuba-cerro-2025-con-9-434-593-habitantes-y-mantiene-tendencia-al-decrecimiento-poblacional/",
      "uso": "Población 9.434.593; defunciones 136.214; nacimientos 68.064; saldo migratorio -245.264; TGF 1,29; envejecimiento 26,7%; población en edad laboral 5.606.541",
      "tipo": "primaria_oficial"
    },
    {
      "id": 2,
      "fuente": "ONEI",
      "titulo": "Indicadores Seleccionados de Inversiones, diciembre 2024",
      "fecha": "2025-03",
      "url": "http://www.onei.gob.cu/sites/default/files/publicaciones/2025-03/inversiones-diciembre-2024.pdf",
      "uso": "Distribución de la inversión 2023 y 2024 por rubro; base del argumento de asignación",
      "tipo": "primaria_oficial"
    },
    {
      "id": 3,
      "fuente": "MINSAP",
      "titulo": "Datos preliminares del Programa de Atención Materno Infantil, cierre 2025",
      "fecha": "2026-01-02",
      "url": "https://www.lahabana.gob.cu/post_detalles/es/26474/cuba-cerro-2025-con-tasa-de-mortalidad-infantil-de-9-9",
      "uso": "Mortalidad infantil 9,9 por mil; mortalidad materna 44,1 por cien mil; 68.051 nacimientos",
      "tipo": "primaria_oficial"
    },
    {
      "id": 4,
      "fuente": "Granma",
      "titulo": "Cuba mantiene la tasa de mortalidad infantil en 7,1 por cada mil nacidos vivos",
      "fecha": "2025-01-03",
      "url": "https://www.granma.cu/cuba/2025-01-03/cuba-mantiene-la-tasa-de-mortalidad-infantil-en-71-por-cada-mil-nacidos-vivos-03-01-2025-21-01-07",
      "uso": "Nacimientos 2024: 71.374; mortalidad materna 2023 y 2024",
      "tipo": "primaria_oficial"
    },
    {
      "id": 5,
      "fuente": "14ymedio",
      "titulo": "Las autoridades admiten que Cuba registro en 2025 la mayor cifra de muertes desde la pandemia",
      "fecha": "2026-07-12",
      "url": "https://www.14ymedio.com/cuba/autoridades-admiten-cuba-registro-2025_1_1128708.html",
      "uso": "Serie de defunciones 2019-2025 y contraste con 2021",
      "tipo": "prensa_independiente"
    },
    {
      "id": 6,
      "fuente": "OnCubaNews",
      "titulo": "Más muertes que nacimientos: Cuba enfrenta un acelerado declive demográfico",
      "fecha": "2026-07-13",
      "url": "https://oncubanews.com/cuba/más-muertes-que-nacimientos-cuba-enfrenta-un-acelerado-declive-demográfico-entre-la-baja-fecundidad-y-el-éxodo-juvenil/",
      "uso": "Defunciones 2021-2024 según registros ONEI",
      "tipo": "prensa"
    },
    {
      "id": 7,
      "fuente": "Diario de Cuba",
      "titulo": "El mito de la baja mortalidad infantil en Cuba se derrumba",
      "fecha": "2026-01-03",
      "url": "https://diariodecuba.com/cuba/1767441225_64645.html",
      "uso": "Trayectoria de la mortalidad infantil y proyección oficial a 7,7 millones",
      "tipo": "prensa_independiente"
    },
    {
      "id": 8,
      "fuente": "Diario de Cuba",
      "titulo": "La torcida prioridad del régimen cubano: 11 veces más inversiones para el turismo que para Educación y Salud",
      "fecha": "2025-03-25",
      "url": "https://diariodecuba.com/economía/1742888102_60435.html",
      "uso": "37,4% de inversión en turismo; ocupación hotelera 23%; análisis de Pedro Monreal",
      "tipo": "prensa_independiente"
    },
    {
      "id": 9,
      "fuente": "Horizonte Cubano, Columbia Law School",
      "titulo": "Cuba. Una rapida mirada a la emigración y la población",
      "autor": "Juan Carlos Albizu-Campos Espineira",
      "fecha": "2024-07-15",
      "url": "https://horizontecubano.law.columbia.edu/news/cuba-una-rapida-mirada-la-emigración-y-la-población",
      "uso": "Estimación independiente de población residente real: 8,62 millones al cierre de 2023",
      "tipo": "academica"
    },
    {
      "id": 10,
      "fuente": "Diario de Cuba",
      "titulo": "ONEI: Cuba cerro 2025 con su tasa de fecundidad más baja desde 1958",
      "fecha": "2026-07-21",
      "url": "https://diariodecuba.com/cuba/1784677326_68129.html",
      "uso": "Definición de población efectiva; estimación Albizu-Campos de 8.025.624 al cierre de 2024",
      "tipo": "prensa_independiente"
    },
    {
      "id": 11,
      "fuente": "Health Policy and Planning",
      "titulo": "Cuban infant mortality and longevity: health care or repressión?",
      "autor": "Berdine G., Geloso V., Powell B.",
      "fecha": "2018",
      "url": "https://academic.oup.com/heapol/article/33/6/755/5017435",
      "uso": "Objeción revisada por pares a la linea base cubana de mortalidad infantil",
      "tipo": "academica_revisada"
    },
    {
      "id": 12,
      "fuente": "Naciones Unidas",
      "titulo": "Resolución 39(I) de la Asamblea General sobre las relaciones de los Miembros con España",
      "fecha": "1946-12-12",
      "url": "https://docs.un.org/es/A/RES/39(I)",
      "uso": "Base documental del caso comparado español de bloqueo diplomático",
      "tipo": "primaria_oficial"
    },
    {
      "id": 13,
      "fuente": "Naciones Unidas",
      "titulo": "Estatuto de Roma de la Corte Penal Internacional, articulos 6 y 7",
      "fecha": "1998-07-17",
      "url": "https://www.icc-cpi.int/sites/default/files/RS-Esp.pdf",
      "uso": "Elementos constitutivos de genocidio y de exterminio como crimen de lesa humanidad",
      "tipo": "primaria_oficial"
    },
    {
      "id": 14,
      "fuente": "República de Cuba",
      "titulo": "Constitución de la República de Cuba, articulo 72",
      "fecha": "2019-04-10",
      "url": "https://www.gacetaoficial.gob.cu/sites/default/files/goc-2019-ex5.pdf",
      "uso": "Obligación estatal autoimpuesta de garantizar acceso, gratuidad y calidad de los servicios de salud",
      "tipo": "primaria_oficial"
    }
  ],
  "metodologia_global": {
    "nota_de_integridad": "Esta ficha corrige tres afirmaciones que circulaban en los materiales de partida y que no resistieron verificación. Se documentan en la sección de correcciones en lugar de eliminarse en silencio, porque el lector tiene derecho a saber que se descarto y con que criterio.",
    "vulnerabilidad_reconocida": "Las series de mortalidad infantil de los países comparadores están etiquetadas como estimadas y proceden de compilaciones internacionales, no de registros nacionales consultados directamente. El estimador de diferencias en diferencias hereda esa incertidumbre y debe leerse como orden de magnitud.",
    "regla_de_no_fusion": "Un patron documentado a nivel agregado no eleva la confianza de ningun caso individual. Las cifras de exceso de mortalidad no implican atribución de causa para ninguna muerte concreta."
  }
};

const P = {
  fondo: "#efe8df",
  superficie: "#fcf9f4",
  tinta: "#1f1a16",
  tintaSuave: "#6b5d50",
  regla: "#ddd3c7",
  petroleo: "#14494F",
  ciruela: "#7A2B3F",
  oliva: "#63763F",
  violeta: "#4C4478",
  ambar: "#A36F0C",
  arena: "#8C836B"
};

const F = {
  display: '"Manrope", system-ui, sans-serif',
  texto: '"Manrope", system-ui, -apple-system, "Segoe UI", sans-serif',
  dato: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace'
};

const nf = new Intl.NumberFormat("es-ES");
const fmt = (n) => nf.format(Math.round(n));
const fmt1 = (n) => nf.format(Math.round(n * 10) / 10);

/* ============================ Primitivas ============================ */

function Confianza({ nivel }) {
  const mapa = {
    confirmado: { t: "confirmado", c: P.petroleo },
    reportado: { t: "reportado", c: P.oliva },
    estimado: { t: "estimado", c: P.arena },
    calculado: { t: "calculado", c: P.violeta },
    no_cuantificado: { t: "no cuantificado", c: P.tintaSuave }
  };
  const m = mapa[nivel] || mapa.no_cuantificado;
  return (
    <span
      style={{
        fontFamily: F.dato, fontSize: 10, letterSpacing: "0.08em",
        textTransform: "uppercase", color: m.c, border: `1px solid ${m.c}`,
        borderRadius: 6, padding: "1px 6px", whiteSpace: "nowrap"
      }}
    >
      {m.t}
    </span>
  );
}

function Leyenda({ nota, fuente, confianza }) {
  return (
    <div
      style={{
        marginTop: 14, paddingTop: 12, borderTop: `1px solid ${P.regla}`,
        display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-start"
      }}
    >
      <div style={{ flex: "1 1 320px", minWidth: 0 }}>
        <p style={{
          margin: 0, fontFamily: F.texto, fontSize: 13, lineHeight: 1.55,
          color: P.tintaSuave
        }}>
          <span style={{
            fontFamily: F.dato, fontSize: 10, letterSpacing: "0.1em",
            textTransform: "uppercase", color: P.tinta, marginRight: 8
          }}>
            Nota
          </span>
          {nota}
        </p>
        {fuente && (
          <p style={{
            margin: "6px 0 0", fontFamily: F.dato, fontSize: 11,
            color: P.tintaSuave, lineHeight: 1.5
          }}>
            Fuente: {fuente}
          </p>
        )}
      </div>
      {confianza && <Confianza nivel={confianza} />}
    </div>
  );
}

function Contrafactual({ children, titulo }) {
  return (
    <div
      style={{
        border: `2px dashed ${P.ambar}`, borderRadius: 16,
        background: "rgba(201,138,23,0.06)", padding: "16px 18px", margin: "18px 0"
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <span style={{
          fontFamily: F.dato, fontSize: 11, fontWeight: 700, color: P.ambar,
          border: `1px solid ${P.ambar}`, borderRadius: 6, padding: "1px 6px"
        }}>
          ⚠ CONTRAFACTUAL
        </span>
        {titulo && (
          <span style={{
            fontFamily: F.dato, fontSize: 11, letterSpacing: "0.06em",
            textTransform: "uppercase", color: P.tintaSuave
          }}>
            {titulo}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Seccion({ numero, titulo, sub, children }) {
  return (
    <section style={{ margin: "0 0 64px" }}>
      <header style={{ marginBottom: 22 }}>
        <div style={{
          fontFamily: F.dato, fontSize: 11, letterSpacing: "0.18em",
          color: P.ciruela, marginBottom: 8
        }}>
          {numero}
        </div>
        <h2 style={{
          fontFamily: F.display, fontWeight: 800, fontSize: "clamp(22px, 3.4vw, 32px)",
          lineHeight: 1.12, margin: 0, color: P.tinta, letterSpacing: "-0.01em"
        }}>
          {titulo}
        </h2>
        {sub && (
          <p style={{
            fontFamily: F.texto, fontSize: 16, lineHeight: 1.62,
            color: P.tintaSuave, margin: "12px 0 0", maxWidth: "62ch"
          }}>
            {sub}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

function Panel({ children, pad = 22 }) {
  return (
    <div style={{
      background: P.superficie, border: `1px solid ${P.regla}`,
      borderRadius: 24, padding: pad, boxShadow: "var(--y-shadow)"
    }}>
      {children}
    </div>
  );
}

function Parrafo({ children, ancho = "68ch" }) {
  return (
    <p style={{
      fontFamily: F.texto, fontSize: 16, lineHeight: 1.68,
      color: P.tinta, margin: "0 0 16px", maxWidth: ancho
    }}>
      {children}
    </p>
  );
}

function Cifra({ valor, etiqueta, color = P.tinta, sufijo }) {
  return (
    <div style={{ minWidth: 130 }}>
      <div style={{
        fontFamily: F.display, fontWeight: 800, fontSize: "clamp(26px, 4vw, 38px)",
        color, lineHeight: 1, letterSpacing: "-0.02em"
      }}>
        {valor}
        {sufijo && (
          <span style={{ fontSize: "0.5em", marginLeft: 3, fontFamily: F.dato }}>
            {sufijo}
          </span>
        )}
      </div>
      <div style={{
        fontFamily: F.dato, fontSize: 11, letterSpacing: "0.05em",
        color: P.tintaSuave, marginTop: 7, lineHeight: 1.4
      }}>
        {etiqueta}
      </div>
    </div>
  );
}

function TooltipCaja({ titulo, filas }) {
  return (
    <div style={{
      background: P.superficie, border: `1px solid ${P.tinta}`,
      borderRadius: 12, padding: "9px 12px", fontFamily: F.dato, fontSize: 12,
      boxShadow: "0 8px 24px rgba(40,25,10,.16)"
    }}>
      <div style={{ fontWeight: 700, marginBottom: 5, color: P.tinta }}>{titulo}</div>
      {filas.map((f, i) => (
        <div key={i} style={{ color: f.color || P.tintaSuave, lineHeight: 1.65 }}>
          {f.k}: <strong style={{ color: f.color || P.tinta }}>{f.v}</strong>
        </div>
      ))}
    </div>
  );
}


/* ---- Identidad cromatica por pais, compartida por los graficos ---- */

const sinTildes = (s) =>
  String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const clavePais = (s) => sinTildes(s).replace(/[^A-Za-z0-9]+/g, "_");

const COLOR_PAIS = {
  Cuba: "#7A2B3F",
  Iran: "#63763F",
  Vietnam: "#2E7D6B",
  Venezuela: "#8A5A7A",
  Taiwan: "#8C836B",
  Espana: "#7A8FA6",
  Corea_del_Norte: "#4C4478",
  Serbia_RFY_: "#8A6E3F",
  Irak: "#5A6A6C"
};

const colorPais = (p) => COLOR_PAIS[clavePais(p)] || "#5A6A6C";

function ClaveColor({ items, activos, onToggle, fijo, nota }) {
  return (
    <div style={{ margin: "0 0 16px" }}>
      <div style={{
        fontFamily: F.dato, fontSize: 10.5, letterSpacing: "0.12em",
        textTransform: "uppercase", color: P.tintaSuave, marginBottom: 9
      }}>
        Leyenda{onToggle ? " · pulse para mostrar u ocultar" : ""}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {items.map((it) => {
          const on = !activos || activos.includes(it.id);
          const bloqueado = fijo && fijo.includes(it.id);
          const c = it.color;
          const clicable = onToggle && !bloqueado;
          return (
            <button
              key={it.id}
              onClick={clicable ? () => onToggle(it.id) : undefined}
              disabled={!clicable}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                fontFamily: F.dato, fontSize: 12, padding: "4px 10px",
                borderRadius: 999, cursor: clicable ? "pointer" : "default",
                border: `1px solid ${on ? c : P.regla}`,
                background: on ? "rgba(252,249,244,0.9)" : "transparent",
                color: on ? P.tinta : P.tintaSuave,
                opacity: on ? 1 : 0.55, transition: "all 0.14s"
              }}
            >
              <span style={{
                width: 15, height: 3.5, flexShrink: 0, borderRadius: 2,
                background: on ? c : P.regla,
                borderTop: it.trazo === "discontinuo" && on
                  ? `3.5px dashed ${c}` : "none"
              }} />
              {it.etiqueta}
              {bloqueado && (
                <span style={{ fontSize: 10, color: P.tintaSuave }}>fijo</span>
              )}
            </button>
          );
        })}
      </div>
      {nota && (
        <p style={{
          fontFamily: F.dato, fontSize: 11, color: P.tintaSuave,
          margin: "9px 0 0", lineHeight: 1.5
        }}>
          {nota}
        </p>
      )}
    </div>
  );
}

/* ==================== 1 · Mortalidad infantil ==================== */

function GraficoMortalidadInfantil({ mi }) {
  const comparadores = mi.comparadores;
  const [activos, setActivos] = useState(
    () => comparadores.map((c) => clavePais(c.pais))
  );

  const anios = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

  // Claves ASCII: el grafico no depende de como se escriban los paises.
  const datos = useMemo(() => {
    return anios.map((a) => {
      const fila = { anio: a };
      const c = mi.cuba.find((x) => x.anio === a);
      if (c) fila.Cuba = c.valor;
      comparadores.forEach((cmp) => {
        const k = clavePais(cmp.pais);
        const pts = cmp.serie;
        const exacto = pts.find((s) => s.anio === a);
        if (exacto) { fila[k] = exacto.valor; return; }
        const prev = pts.filter((s) => s.anio < a).slice(-1)[0];
        const sig = pts.find((s) => s.anio > a);
        if (prev && sig) {
          const t = (a - prev.anio) / (sig.anio - prev.anio);
          fila[k] = Math.round((prev.valor + t * (sig.valor - prev.valor)) * 100) / 100;
        }
      });
      return fila;
    });
  }, [mi, comparadores]);

  const nombreDe = useMemo(() => {
    const m = { Cuba: "Cuba" };
    comparadores.forEach((c) => { m[clavePais(c.pais)] = c.pais; });
    return m;
  }, [comparadores]);

  const items = [
    { id: "Cuba", etiqueta: "Cuba", color: colorPais("Cuba"), trazo: "continuo" },
    ...comparadores.map((c) => ({
      id: clavePais(c.pais), etiqueta: c.pais,
      color: colorPais(c.pais), trazo: "discontinuo"
    }))
  ];

  const toggle = (id) =>
    setActivos((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <Panel>
      <ClaveColor
        items={items} activos={["Cuba", ...activos]} onToggle={toggle}
        fijo={["Cuba"]}
        nota="Trazo continuo grueso: Cuba. Trazo discontinuo: estados comparados, interpolados linealmente entre observaciones."
      />

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={datos} margin={{ top: 16, right: 24, left: 4, bottom: 8 }}>
            <CartesianGrid stroke={P.regla} strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="anio" tick={{ fontFamily: F.dato, fontSize: 12, fill: P.tintaSuave }}
              stroke={P.regla} tickLine={false}
            />
            <YAxis
              tick={{ fontFamily: F.dato, fontSize: 12, fill: P.tintaSuave }}
              stroke={P.regla} tickLine={false} width={40} domain={[0, 26]}
              label={{
                value: "por 1.000 nacidos vivos", angle: -90, position: "insideLeft",
                style: { fontFamily: F.dato, fontSize: 11, fill: P.tintaSuave }, offset: 8
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                return (
                  <TooltipCaja
                    titulo={`Ano ${label}`}
                    filas={[...payload]
                      .sort((a, b) => b.value - a.value)
                      .map((e) => ({
                        k: nombreDe[e.dataKey] || e.dataKey,
                        v: fmt1(e.value), color: e.color
                      }))}
                  />
                );
              }}
            />
            <ReferenceArea x1={2019} x2={2025} fill={P.ciruela} fillOpacity={0.05} />
            <ReferenceLine
              x={2021} stroke={P.violeta} strokeDasharray="4 3"
              label={{
                value: "Tarea Ordenamiento", position: "top",
                style: { fontFamily: F.dato, fontSize: 11, fill: P.violeta }
              }}
            />
            {comparadores.map((c) => {
              const k = clavePais(c.pais);
              if (!activos.includes(k)) return null;
              return (
                <Line
                  key={k} type="monotone" dataKey={k} name={c.pais}
                  stroke={colorPais(c.pais)} strokeWidth={1.9}
                  strokeDasharray="6 4" dot={{ r: 2.4, strokeWidth: 0 }}
                  connectNulls isAnimationActive={false}
                />
              );
            })}
            <Line
              type="monotone" dataKey="Cuba" name="Cuba"
              stroke={colorPais("Cuba")} strokeWidth={3.4}
              dot={{ r: 3.6, fill: colorPais("Cuba"), strokeWidth: 0 }}
              activeDot={{ r: 6 }} connectNulls isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Leyenda
        nota="La banda sombreada marca la ventana de tratamiento 2019-2025. Cuba parte del nivel mas bajo del grupo y termina por encima de Iran, un pais fuertemente sancionado. Venezuela, el unico comparador que tambien sufre colapso institucional, es el unico cuya curva sube: en puntos absolutos sube menos que Cuba, en variacion proporcional bastante menos."
        fuente="MINSAP para Cuba; compilaciones internacionales para el resto"
        confianza="reportado"
      />
    </Panel>
  );
}

/* ================== 2 · Contrafactual interactivo ================== */

function ContrafactualDefunciones({ series, cf }) {
  const [deriva, setDeriva] = useState(cf.deriva_base_pct);

  const filas = useMemo(() => {
    return series.map((s) => {
      const exp = s.anio - 2019;
      const tasaCf = cf.tasa_base_2019 * Math.pow(1 + deriva / 100, exp);
      const cfDef = Math.round((tasaCf * s.poblacion) / 1000);
      return {
        anio: s.anio,
        real: s.defunciones,
        contrafactual: cfDef,
        exceso: s.anio === 2019 ? 0 : s.defunciones - cfDef,
        tasaReal: Math.round((s.defunciones / s.poblacion) * 100000) / 100,
        tasaCf: Math.round(tasaCf * 100) / 100
      };
    });
  }, [series, cf, deriva]);

  const excesoTotal = filas.reduce((a, f) => a + f.exceso, 0);
  const exceso2025 = filas.find((f) => f.anio === 2025)?.exceso ?? 0;
  const exceso2021 = filas.find((f) => f.año === 2021)?.exceso ?? 0;
  const excesoSinPandemia = excesoTotal - exceso2021;

  return (
    <Panel>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 26, marginBottom: 20,
        paddingBottom: 18, borderBottom: `1px solid ${P.regla}`
      }}>
        <Cifra valor={fmt(excesoTotal)} etiqueta="Exceso acumulado 2020-2025" color={P.ciruela} />
        <Cifra valor={fmt(exceso2025)} etiqueta="Exceso solo en 2025, sin pandemia" color={P.ciruela} />
        <Cifra valor={fmt(excesoSinPandemia)} etiqueta="Exceso excluyendo el año 2021" color={P.tinta} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{
          fontFamily: F.dato, fontSize: 12, color: P.tinta, display: "block",
          marginBottom: 9, lineHeight: 1.5
        }}>
          Deriva anual por envejecimiento en el escenario contrafactual:{" "}
          <strong style={{ color: P.ambar, fontSize: 15 }}>{deriva.toFixed(1)}%</strong>
        </label>
        <input
          type="range"
          min={cf.deriva_min_pct}
          max={cf.deriva_max_pct}
          step={0.1}
          value={deriva}
          onChange={(e) => setDeriva(parseFloat(e.target.value))}
          style={{ width: "100%", maxWidth: 460, accentColor: P.ambar, cursor: "pointer" }}
          aria-label="Deriva anual por envejecimiento"
        />
        <div style={{
          display: "flex", justifyContent: "space-between", maxWidth: 460,
          fontFamily: F.dato, fontSize: 10.5, color: P.tintaSuave, marginTop: 4
        }}>
          <span>{cf.deriva_min_pct.toFixed(1)}% · exceso mayor</span>
          <span>{cf.deriva_max_pct.toFixed(1)}% · exceso menor</span>
        </div>
        <p style={{
          fontFamily: F.texto, fontSize: 13.5, color: P.tintaSuave,
          margin: "11px 0 0", maxWidth: "70ch", lineHeight: 1.6
        }}>
          Mueva el control hasta el extremo mas favorable al Estado. El exceso se reduce,
          pero no desaparece en ningun punto del rango defendible.
        </p>
      </div>

      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <ComposedChart data={filas} margin={{ top: 12, right: 22, left: 12, bottom: 8 }}>
            <CartesianGrid stroke={P.regla} strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="anio" tick={{ fontFamily: F.dato, fontSize: 12, fill: P.tintaSuave }}
              stroke={P.regla} tickLine={false}
            />
            <YAxis
              tick={{ fontFamily: F.dato, fontSize: 12, fill: P.tintaSuave }}
              stroke={P.regla} tickLine={false} width={58}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              domain={[80000, 175000]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <TooltipCaja
                    titulo={`Año ${label}`}
                    filas={[
                      { k: "Defunciones registradas", v: fmt(d.real), color: P.tinta },
                      { k: "Contrafactual", v: fmt(d.contrafactual), color: P.ambar },
                      {
                        k: "Exceso",
                        v: d.exceso === 0 ? "base" : `${d.exceso > 0 ? "+" : ""}${fmt(d.exceso)}`,
                        color: d.exceso > 0 ? P.ciruela : P.oliva
                      },
                      { k: "Tasa real por mil", v: fmt1(d.tasaReal), color: P.tintaSuave }
                    ]}
                  />
                );
              }}
            />
            <Bar dataKey="real" fill={P.petroleo} radius={[2, 2, 0, 0]} maxBarSize={46}>
              {filas.map((f, i) => (
                <Cell key={i} fill={f.exceso > 20000 ? P.ciruela : P.petroleo} />
              ))}
            </Bar>
            <Line
              type="monotone" dataKey="contrafactual" stroke={P.ambar}
              strokeWidth={2.6} strokeDasharray="7 4"
              dot={{ r: 3.2, fill: P.ambar, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <Contrafactual titulo="Escenario de solo envejecimiento">
        <p style={{
          fontFamily: F.texto, fontSize: 14.5, lineHeight: 1.62,
          color: P.tinta, margin: 0
        }}>
          {cf.metodo}
        </p>
        <ul style={{
          margin: "12px 0 0", paddingLeft: 20, fontFamily: F.texto,
          fontSize: 13.5, color: P.tintaSuave, lineHeight: 1.62
        }}>
          {cf.limitaciones.map((l, i) => <li key={i} style={{ marginBottom: 5 }}>{l}</li>)}
        </ul>
      </Contrafactual>

      <Leyenda
        nota="Las barras en granate marcan los años con exceso superior a 20.000 defunciones. La linea ambar discontinua es el escenario contrafactual y no representa ninguna observación. El exceso no se atribuye aquí a ninguna causa: es la magnitud que las hipótesis causales de las secciones siguientes deben explicar."
        fuente="Calculo propio sobre series ONEI de defunciones y población"
        confianza="calculado"
      />
    </Panel>
  );
}

/* ================ 3 · Exceso anual, la aceleracion ================ */

function GraficoExcesoAnual({ series, cf }) {
  const filas = useMemo(() => {
    return series
      .filter((s) => s.anio > 2019)
      .map((s) => {
        const exp = s.anio - 2019;
        const tasaCf = cf.tasa_base_2019 * Math.pow(1 + cf.deriva_base_pct / 100, exp);
        const cfDef = Math.round((tasaCf * s.poblacion) / 1000);
        const ex = s.defunciones - cfDef;
        return {
          anio: s.anio,
          exceso: ex,
          pandemia: s.anio === 2021,
          pct: Math.round((ex / cfDef) * 1000) / 10
        };
      });
  }, [series, cf]);

  return (
    <Panel>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <ComposedChart data={filas} margin={{ top: 26, right: 22, left: 12, bottom: 8 }}>
            <CartesianGrid stroke={P.regla} strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="anio" tick={{ fontFamily: F.dato, fontSize: 12, fill: P.tintaSuave }}
              stroke={P.regla} tickLine={false}
            />
            <YAxis
              tick={{ fontFamily: F.dato, fontSize: 12, fill: P.tintaSuave }}
              stroke={P.regla} tickLine={false} width={54}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <TooltipCaja
                    titulo={`Año ${label}`}
                    filas={[
                      { k: "Defunciones en exceso", v: `+${fmt(d.exceso)}`, color: P.ciruela },
                      { k: "Sobre lo esperado", v: `+${fmt1(d.pct)}%`, color: P.tintaSuave },
                      { k: "Contexto", v: d.pandemia ? "pico pandemico" : "sin pandemia", color: P.tintaSuave }
                    ]}
                  />
                );
              }}
            />
            <ReferenceLine y={0} stroke={P.tinta} strokeWidth={1} />
            <Bar dataKey="exceso" radius={[2, 2, 0, 0]} maxBarSize={62}>
              {filas.map((f, i) => (
                <Cell key={i} fill={f.pandemia ? P.arena : P.ciruela} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        display: "flex", gap: 18, flexWrap: "wrap", marginTop: 12,
        fontFamily: F.dato, fontSize: 11.5, color: P.tintaSuave
      }}>
        <span><span style={{
          display: "inline-block", width: 11, height: 11, background: P.arena,
          marginRight: 6, verticalAlign: "middle"
        }} />pico pandémico</span>
        <span><span style={{
          display: "inline-block", width: 11, height: 11, background: P.ciruela,
          marginRight: 6, verticalAlign: "middle"
        }} />sin pandemia</span>
      </div>

      <Leyenda
        nota="Este es el grafico que descarta la explicación pandémica. Si el exceso fuera una secuela de la covid-19, la serie debería decaer tras 2021. Hace lo contrario: 2022 registra el mínimo del periodo y a partir de ahi el exceso crece cada año hasta superar en 2025 cualquier valor no pandémico previo. Un shock que se disipa no se comporta así. Una degradación estructural, si."
        fuente="Calculo propio con deriva base de 1,7% anual"
        confianza="calculado"
      />
    </Panel>
  );
}

/* ============ 4 · El embargo como constante · placebo ============ */

function LineaTiempoEmbargo({ mi, placebo }) {
  const hitos = [
    { anio: 1962, nombre: "Embargo total", intensidad: 7 },
    { anio: 1975, nombre: "Flexibilizacion OEA", intensidad: 5 },
    { anio: 1992, nombre: "Ley Torricelli", intensidad: 9 },
    { anio: 1996, nombre: "Helms-Burton", intensidad: 10 },
    { anio: 2000, nombre: "Venta de alimentos", intensidad: 8 },
    { anio: 2015, nombre: "Deshielo", intensidad: 4 },
    { anio: 2017, nombre: "NSPM-5", intensidad: 7 },
    { anio: 2020, nombre: "243 medidas", intensidad: 9 },
    { anio: 2026, nombre: "Vigente", intensidad: 9 }
  ];

  const W = 960, H = 320, mL = 62, mR = 62, mT = 38, mB = 52;
  const x0 = 1960, x1 = 2026;
  const sx = (a) => mL + ((a - x0) / (x1 - x0)) * (W - mL - mR);
  const syInt = (v) => mT + (1 - v / 10) * (H - mT - mB);

  const path = hitos
    .map((h, i) => `${i === 0 ? "M" : "L"} ${sx(h.anio).toFixed(1)} ${syInt(h.intensidad).toFixed(1)}`)
    .join(" ");

  const miPuntos = [
    { anio: 1990, v: 10.7 }, { anio: 1996, v: 7.9 }, { anio: 2002, v: 6.5 },
    { anio: 2010, v: 4.5 }, { anio: 2018, v: 4.0 }, { anio: 2025, v: 9.9 }
  ];
  const syMi = (v) => mT + (1 - v / 12) * (H - mT - mB);
  const miPath = miPuntos
    .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.anio).toFixed(1)} ${syMi(p.v).toFixed(1)}`)
    .join(" ");

  const items = [
    { id: "emb", etiqueta: "Indice de intensidad del embargo · eje izquierdo, 0 a 10", color: P.violeta },
    { id: "mi", etiqueta: "Mortalidad infantil por mil · eje derecho, 0 a 12", color: colorPais("Cuba") }
  ];

  return (
    <Panel>
      <ClaveColor
        items={items}
        nota="Bandas verticales: en violeta el maximo historico de restriccion externa, 1992-1996; en granate la ventana del colapso sanitario, 2019-2025. Si el embargo explicara el deterioro, ambas bandas deberian coincidir."
      />

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}
        role="img" aria-label="Intensidad del embargo frente a mortalidad infantil, 1960-2026">

        <rect x={sx(1992)} y={mT} width={sx(1996) - sx(1992)} height={H - mT - mB}
          fill={P.violeta} opacity={0.1} />
        <rect x={sx(2019)} y={mT} width={sx(2026) - sx(2019)} height={H - mT - mB}
          fill={colorPais("Cuba")} opacity={0.1} />

        <line x1={mL} y1={H - mB} x2={W - mR} y2={H - mB} stroke={P.regla} strokeWidth={1} />
        {[1970, 1980, 1990, 2000, 2010, 2020].map((a) => (
          <g key={a}>
            <line x1={sx(a)} y1={mT} x2={sx(a)} y2={H - mB} stroke={P.regla}
              strokeWidth={0.7} strokeDasharray="2 5" />
            <text x={sx(a)} y={H - mB + 21} textAnchor="middle"
              fontFamily={F.dato} fontSize={13} fill={P.tintaSuave}>{a}</text>
          </g>
        ))}

        {[0, 5, 10].map((v) => (
          <text key={v} x={mL - 10} y={syInt(v) + 4} textAnchor="end"
            fontFamily={F.dato} fontSize={12} fill={P.violeta}>{v}</text>
        ))}
        {[0, 6, 12].map((v) => (
          <text key={v} x={W - mR + 10} y={syMi(v) + 4} textAnchor="start"
            fontFamily={F.dato} fontSize={12} fill={colorPais("Cuba")}>{v}</text>
        ))}

        <path d={path} fill="none" stroke={P.violeta} strokeWidth={2.4} />
        {hitos.map((h) => (
          <circle key={h.anio} cx={sx(h.anio)} cy={syInt(h.intensidad)} r={4}
            fill={P.violeta} />
        ))}

        <path d={miPath} fill="none" stroke={colorPais("Cuba")} strokeWidth={3.2} />
        {miPuntos.map((p) => (
          <circle key={p.anio} cx={sx(p.anio)} cy={syMi(p.v)} r={4.4}
            fill={colorPais("Cuba")} />
        ))}

        <text x={(sx(1992) + sx(1996)) / 2} y={mT - 12} textAnchor="middle"
          fontFamily={F.dato} fontSize={13} fill={P.violeta}>
          embargo mas duro
        </text>
        <text x={(sx(2019) + sx(2026)) / 2} y={mT - 12} textAnchor="middle"
          fontFamily={F.dato} fontSize={13} fill={colorPais("Cuba")}>
          colapso sanitario
        </text>
      </svg>

      <div style={{
        marginTop: 16, padding: "14px 16px", background: "rgba(76,68,120,0.05)",
        border: `1px solid ${P.violeta}`, borderRadius: 16
      }}>
        <div style={{
          fontFamily: F.dato, fontSize: 11, letterSpacing: "0.1em",
          textTransform: "uppercase", color: P.violeta, marginBottom: 7
        }}>
          {placebo.titulo}
        </div>
        <p style={{
          fontFamily: F.texto, fontSize: 14.5, lineHeight: 1.65,
          color: P.tinta, margin: 0
        }}>
          {placebo.texto}
        </p>
      </div>

      <Leyenda
        nota="La intensidad del embargo es un indice ordinal construido por Yamacoa a partir de los hitos legislativos, no una medicion economica. Sirve para una sola cosa: mostrar que los dos maximos de restriccion externa, 1992-1996 y 2020, no coinciden con el punto de inflexion sanitario. Cuando el embargo alcanzo su maximo historico, la mortalidad infantil cubana estaba cayendo."
        fuente="Elaboracion propia sobre legislacion estadounidense; MINSAP para mortalidad infantil"
        confianza="estimado"
      />
    </Panel>
  );
}

/* ================ 5 · Estados sancionados comparados ================ */

function GraficoSancionados({ comparados }) {
  const [seleccion, setSeleccion] = useState(["Cuba"]);

  const toggle = (pais) => {
    if (pais === "Cuba") return;              // Cuba permanece siempre activa
    setSeleccion((s) =>
      s.includes(pais) ? s.filter((x) => x !== pais) : [...s, pais]);
  };

  const activo = (pais) => seleccion.includes(pais);

  const datos = comparados.casos.map((c) => ({
    ...c,
    x: c.intensidad,
    y: c.cambio_pob_pct_anual,
    z: Math.sqrt(c.poblacion_mm) * 12
  }));

  return (
    <Panel>
      <ClaveColor
        items={comparados.casos.map((c) => ({
          id: c.pais, etiqueta: c.pais, color: colorPais(c.pais)
        }))}
        activos={seleccion}
        onToggle={toggle}
        fijo={["Cuba"]}
        nota="Pulse un circulo del grafico o una etiqueta para resaltar ese pais. Cuba permanece siempre resaltada como unidad de referencia. El area de cada circulo es proporcional a la poblacion."
      />

      <div style={{ width: "100%", height: 410 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 18, right: 30, left: 12, bottom: 46 }}>
            <CartesianGrid stroke={P.regla} strokeDasharray="2 4" />
            <XAxis
              type="number" dataKey="x" domain={[0, 11]} name="Intensidad"
              tick={{ fontFamily: F.dato, fontSize: 12, fill: P.tintaSuave }}
              stroke={P.regla} tickLine={false}
              label={{
                value: "Intensidad del regimen de sancion  →",
                position: "insideBottom", offset: -24,
                style: { fontFamily: F.dato, fontSize: 12, fill: P.tintaSuave }
              }}
            />
            <YAxis
              type="number" dataKey="y" domain={[-4, 3]}
              tick={{ fontFamily: F.dato, fontSize: 12, fill: P.tintaSuave }}
              stroke={P.regla} tickLine={false} width={48}
              tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
              label={{
                value: "cambio poblacional anual",
                angle: -90, position: "insideLeft", offset: 4,
                style: { fontFamily: F.dato, fontSize: 11, fill: P.tintaSuave }
              }}
            />
            <ZAxis type="number" dataKey="z" range={[70, 950]} />
            <ReferenceLine y={0} stroke={P.tinta} strokeWidth={1.2} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3", stroke: P.regla }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{
                    background: P.superficie, border: `1px solid ${colorPais(d.pais)}`,
                    borderLeft: `4px solid ${colorPais(d.pais)}`,
                    borderRadius: 12, padding: "10px 13px", maxWidth: 290,
                    boxShadow: "0 8px 24px rgba(40,25,10,.16)"
                  }}>
                    <div style={{
                      fontFamily: F.display, fontWeight: 800, fontSize: 15, color: P.tinta, marginBottom: 3
                    }}>{d.pais}</div>
                    <div style={{
                      fontFamily: F.dato, fontSize: 11, color: P.tintaSuave, marginBottom: 7
                    }}>{d.periodo} · {d.tipo}</div>
                    <div style={{
                      fontFamily: F.dato, fontSize: 12,
                      color: d.y < 0 ? P.ciruela : P.oliva, marginBottom: 6
                    }}>
                      {d.y > 0 ? "+" : ""}{d.y}% anual · {d.poblacion_mm} millones
                    </div>
                    <div style={{
                      fontFamily: F.texto, fontSize: 12.5, color: P.tinta, lineHeight: 1.55
                    }}>{d.resultado}</div>
                  </div>
                );
              }}
            />
            <Scatter
              data={datos} isAnimationActive={false}
              onClick={(pt) => toggle((pt && (pt.pais || (pt.payload && pt.payload.pais))) || "")}
              style={{ cursor: "pointer" }}
            >
              {datos.map((d) => {
                const on = activo(d.pais);
                return (
                  <Cell
                    key={d.pais}
                    fill={on ? colorPais(d.pais) : P.regla}
                    fillOpacity={on ? 0.82 : 0.45}
                    stroke={on ? colorPais(d.pais) : P.arena}
                    strokeWidth={on ? 2.2 : 0.8}
                    style={{ cursor: "pointer" }}
                  />
                );
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(178px, 1fr))",
        gap: 8, marginTop: 16
      }}>
        {comparados.casos.map((c) => {
          const on = activo(c.pais);
          const col = colorPais(c.pais);
          return (
            <button
              key={c.pais}
              onClick={() => toggle(c.pais)}
              disabled={c.pais === "Cuba"}
              style={{
                textAlign: "left", fontFamily: F.dato, fontSize: 11.5,
                padding: "9px 11px", borderRadius: 12,
                border: `1px solid ${on ? col : P.regla}`,
                borderLeft: `4px solid ${on ? col : P.regla}`,
                background: on ? "rgba(252,249,244,0.92)" : "transparent",
                cursor: c.pais === "Cuba" ? "default" : "pointer",
                opacity: on ? 1 : 0.6, transition: "all 0.16s"
              }}
            >
              <div style={{
                color: on ? col : P.tintaSuave, fontWeight: 700, marginBottom: 3
              }}>
                {c.pais}
              </div>
              <div style={{ color: on ? P.tinta : P.tintaSuave, marginBottom: 2 }}>
                {c.cambio_pob_pct_anual > 0 ? "+" : ""}{c.cambio_pob_pct_anual}% anual
              </div>
              <div style={{ color: P.tintaSuave, fontSize: 10.5 }}>
                {c.poblacion_mm} M · intensidad {c.intensidad}/10
              </div>
            </button>
          );
        })}
      </div>

      <Leyenda
        nota={`Eje horizontal: intensidad del regimen de sancion. Eje vertical: cambio poblacional anual, con la linea de cero marcando la frontera entre crecer y contraerse. Area del circulo proporcional a la poblacion. ${comparados.hallazgo}`}
        fuente="Elaboracion propia; el indice de intensidad es ordinal y no comparable entre regimenes de sancion de naturaleza distinta"
        confianza="estimado"
      />
    </Panel>
  );
}

/* =========== 6 · Nacimientos, defunciones y decisiones =========== */

function GraficoNacDef({ series, hitos }) {
  const datos = series.map((s) => ({
    anio: s.anio, nacimientos: s.nacimientos, defunciones: s.defunciones,
    brecha: s.defunciones - s.nacimientos
  }));

  const relevantes = hitos.filter((h) => h.anio >= 2019);

  return (
    <Panel>
      <div style={{ width: "100%", height: 380 }}>
        <ResponsiveContainer>
          <ComposedChart data={datos} margin={{ top: 30, right: 22, left: 12, bottom: 8 }}>
            <defs>
              <linearGradient id="ygBrecha" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={P.ciruela} stopOpacity={0.24} />
                <stop offset="100%" stopColor={P.ciruela} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={P.regla} strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="anio" tick={{ fontFamily: F.dato, fontSize: 12, fill: P.tintaSuave }}
              stroke={P.regla} tickLine={false}
            />
            <YAxis
              tick={{ fontFamily: F.dato, fontSize: 12, fill: P.tintaSuave }}
              stroke={P.regla} tickLine={false} width={54}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              domain={[50000, 175000]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <TooltipCaja
                    titulo={`Año ${label}`}
                    filas={[
                      { k: "Defunciones", v: fmt(d.defunciones), color: P.ciruela },
                      { k: "Nacimientos", v: fmt(d.nacimientos), color: P.oliva },
                      { k: "Brecha natural", v: `-${fmt(d.brecha)}`, color: P.tinta },
                      { k: "Razon", v: `${(d.defunciones / d.nacimientos).toFixed(2)} muertes por nacimiento`, color: P.tintaSuave }
                    ]}
                  />
                );
              }}
            />
            <Area
              type="monotone" dataKey="defunciones" stroke="none"
              fill="url(#ygBrecha)"
            />
            <ReferenceLine
              x={2021} stroke={P.violeta} strokeWidth={1.4} strokeDasharray="5 3"
              label={{
                value: "Tarea Ordenamiento", position: "top",
                style: { fontFamily: F.dato, fontSize: 11.5, fill: P.violeta }
              }}
            />
            <Line
              type="monotone" dataKey="defunciones" stroke={P.ciruela} strokeWidth={3}
              dot={{ r: 3.4, fill: P.ciruela, strokeWidth: 0 }}
            />
            <Line
              type="monotone" dataKey="nacimientos" stroke={P.oliva} strokeWidth={3}
              dot={{ r: 3.4, fill: P.oliva, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 18 }}>
        {relevantes.map((h, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, padding: "9px 0",
            borderTop: i === 0 ? "none" : `1px solid ${P.regla}`
          }}>
            <div style={{
              fontFamily: F.dato, fontSize: 12, color: P.tintaSuave,
              minWidth: 64, flexShrink: 0
            }}>
              {String(h.mes).padStart(2, "0")}/{h.anio}
            </div>
            <div style={{
              width: 3, flexShrink: 0, borderRadius: 2,
              background: h.signo === "aperturista" ? P.oliva
                : h.signo === "restrictivo_interno" ? P.violeta
                : h.signo === "restrictivo_externo" ? P.arena
                : h.signo === "consecuencia" ? P.ciruela : P.regla
            }} />
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: F.texto, fontSize: 14.5, color: P.tinta,
                fontWeight: 600, lineHeight: 1.4
              }}>{h.evento}</div>
              <div style={{
                fontFamily: F.texto, fontSize: 13, color: P.tintaSuave,
                marginTop: 2, lineHeight: 1.5
              }}>{h.detalle}</div>
            </div>
          </div>
        ))}
      </div>

      <Leyenda
        nota="Las dos curvas se cruzan de forma definitiva en 2020 y nunca vuelven a encontrarse. El desplome de nacimientos entre 2023 y 2024, de 90.392 a 71.374, es el mayor de la serie y no tiene explicación epidemiologica: se corresponde con la salida masiva de mujeres en edad fértil y con el shock de precios posterior a la Tarea Ordenamiento. Coincidencia temporal no es causalidad, y esta ficha no la presenta como tal."
        fuente="ONEI, Indicadores Demograficos 2025; MINSAP"
        confianza="confirmado"
      />
    </Panel>
  );
}

/* ================== 7 · Asignacion de la inversion ================== */

function GraficoInversion({ inv }) {
  const [anio, setAnio] = useState(2024);
  const clave = anio === 2024 ? "pct_2024" : "pct_2023";

  const ordenadas = [...inv.partidas].sort((a, b) => b[clave] - a[clave]);
  const total = ordenadas.reduce((a, p) => a + p[clave], 0);
  const resto = Math.max(0, 100 - total);

  const colorGrupo = (g) =>
    g === "turismo" ? P.violeta : g === "social" ? P.ciruela : P.arena;

  const turismo = inv.partidas
    .filter((p) => p.grupo === "turismo")
    .reduce((a, p) => a + p[clave], 0);
  const social = inv.partidas
    .filter((p) => p.grupo === "social")
    .reduce((a, p) => a + p[clave], 0);

  const W = 960, H = 92, mL = 0, barH = 46;
  let cursor = mL;

  return (
    <Panel>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {[2023, 2024].map((a) => (
          <button
            key={a} onClick={() => setAnio(a)}
            style={{
              fontFamily: F.dato, fontSize: 13, padding: "6px 16px", borderRadius: 999,
              cursor: "pointer", border: `1px solid ${anio === a ? P.tinta : P.regla}`,
              background: anio === a ? P.tinta : "transparent",
              color: anio === a ? P.superficie : P.tintaSuave
            }}
          >
            {a}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 30, marginBottom: 20 }}>
        <Cifra valor={fmt1(turismo)} sufijo="%" etiqueta="Turismo e inmobiliarias" color={P.violeta} />
        <Cifra valor={fmt1(social)} sufijo="%" etiqueta="Salud, educación y agricultura" color={P.ciruela} />
        <Cifra valor={inv.ocupacion_hotelera_pct} sufijo="%" etiqueta="Ocupación hotelera real" color={P.tinta} />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}
        role="img" aria-label={`Distribucion de la inversion nacional en ${anio}`}>
        {ordenadas.map((p, i) => {
          const w = (p[clave] / 100) * W;
          const x = cursor;
          cursor += w;
          return (
            <g key={p.rubro}>
              <rect x={x} y={10} width={Math.max(w - 1.2, 0.8)} height={barH}
                fill={colorGrupo(p.grupo)}
                opacity={p.grupo === "otros" ? 0.42 : 0.95} />
              {w > 42 && (
                <text x={x + w / 2} y={10 + barH / 2 + 5} textAnchor="middle"
                  fontFamily={F.dato} fontSize={14} fill={P.superficie} fontWeight="700">
                  {fmt1(p[clave])}%
                </text>
              )}
            </g>
          );
        })}
        {resto > 0.4 && (
          <rect x={cursor} y={10} width={(resto / 100) * W} height={barH}
            fill={P.regla} opacity={0.6} />
        )}
        <line x1={0} y1={10 + barH + 8} x2={W} y2={10 + barH + 8}
          stroke={P.regla} strokeWidth={1} />
        <text x={0} y={H - 6} fontFamily={F.dato} fontSize={13} fill={P.tintaSuave}>
          0% de la inversion nacional
        </text>
        <text x={W} y={H - 6} textAnchor="end" fontFamily={F.dato} fontSize={13}
          fill={P.tintaSuave}>100%</text>
      </svg>

      <div style={{ marginTop: 18 }}>
        {ordenadas.map((p) => (
          <div key={p.rubro} style={{
            display: "flex", alignItems: "center", gap: 11, padding: "6px 0",
            borderBottom: `1px solid ${P.regla}`
          }}>
            <span style={{
              width: 11, height: 11, flexShrink: 0, borderRadius: 1,
              background: colorGrupo(p.grupo),
              opacity: p.grupo === "otros" ? 0.42 : 0.95
            }} />
            <span style={{
              fontFamily: F.texto, fontSize: 14, color: P.tinta, flex: 1, minWidth: 0
            }}>{p.rubro}</span>
            <span style={{
              fontFamily: F.dato, fontSize: 13,
              color: p.grupo === "social" ? P.ciruela : P.tintaSuave, flexShrink: 0
            }}>{fmt1(p[clave])}%</span>
          </div>
        ))}
      </div>

      <Leyenda
        nota={inv.lectura}
        fuente={inv.fuente}
        confianza={inv.confianza}
      />
    </Panel>
  );
}

/* ==================== 8 · Matriz del test juridico ==================== */

function MatrizJuridica({ tj }) {
  const [abierto, setAbierto] = useState(0);

  const colorEstado = (e) =>
    e === "cumple" ? P.oliva
      : e === "parcial" ? P.ambar
      : e === "incumple" ? P.ciruela
      : P.tintaSuave;

  const simboloEstado = (e) =>
    e === "cumple" ? "●" : e === "parcial" ? "◐" : "○";

  const colorVeredicto = (c) =>
    c === "fallo" ? P.tintaSuave : c === "abierto" ? P.violeta : P.ciruela;

  return (
    <div>
      <div style={{
        padding: "13px 16px", background: "rgba(90,106,108,0.07)",
        border: `1px solid ${P.regla}`, borderRadius: 16, marginBottom: 20
      }}>
        <p style={{
          fontFamily: F.texto, fontSize: 13.5, lineHeight: 1.6,
          color: P.tintaSuave, margin: 0
        }}>
          {tj.advertencia}
        </p>
      </div>

      {tj.estandares.map((e, i) => {
        const on = abierto === i;
        const vc = colorVeredicto(e.color);
        return (
          <div key={i} style={{
            border: `1px solid ${on ? vc : P.regla}`, borderRadius: 16,
            marginBottom: 12, background: P.superficie, overflow: "hidden"
          }}>
            <button
              onClick={() => setAbierto(on ? -1 : i)}
              style={{
                width: "100%", textAlign: "left", background: "none", border: "none",
                padding: "17px 19px", cursor: "pointer", display: "flex",
                gap: 14, alignItems: "flex-start"
              }}
              aria-expanded={on}
            >
              <span style={{
                fontFamily: F.dato, fontSize: 12, color: vc, marginTop: 4, flexShrink: 0
              }}>
                {on ? "▾" : "▸"}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  fontFamily: F.display, fontWeight: 800, fontSize: "clamp(16px, 2.3vw, 20px)",
                  color: P.tinta, display: "block", lineHeight: 1.25
                }}>
                  {e.figura}
                </span>
                <span style={{
                  fontFamily: F.dato, fontSize: 11.5, color: P.tintaSuave,
                  display: "block", marginTop: 5
                }}>
                  {e.norma}
                </span>
                <span style={{
                  fontFamily: F.dato, fontSize: 12.5, color: vc, display: "inline-block",
                  marginTop: 9, border: `1px solid ${vc}`, borderRadius: 6, padding: "2px 9px"
                }}>
                  {e.veredicto}
                </span>
              </span>
            </button>

            {on && (
              <div style={{ padding: "0 19px 19px" }}>
                {e.elementos.map((el, j) => (
                  <div key={j} style={{
                    display: "flex", gap: 13, padding: "13px 0",
                    borderTop: `1px solid ${P.regla}`
                  }}>
                    <span style={{
                      fontFamily: F.dato, fontSize: 17,
                      color: colorEstado(el.estado), flexShrink: 0, lineHeight: 1.2
                    }}>
                      {simboloEstado(el.estado)}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontFamily: F.texto, fontSize: 15, color: P.tinta,
                        fontWeight: 600, lineHeight: 1.45
                      }}>
                        {el.elemento}
                      </div>
                      <div style={{
                        fontFamily: F.dato, fontSize: 10.5, letterSpacing: "0.09em",
                        textTransform: "uppercase", color: colorEstado(el.estado),
                        margin: "5px 0 6px"
                      }}>
                        {el.estado.replace("_", " ")}
                      </div>
                      <div style={{
                        fontFamily: F.texto, fontSize: 14, color: P.tintaSuave,
                        lineHeight: 1.62
                      }}>
                        {el.razon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================ Encuesta ============================ */

/* Transporte de la encuesta: REST cruda contra las RPC compartidas de
   ops/_shared/poll_supabase.sql. El proyecto NO depende de @supabase/supabase-js;
   todos los expedientes hablan asi (ver cascada-valor-minero.jsx). Sin
   credenciales REACT_APP_SUPABASE_*, la encuesta cae a recuento local. */
const SB_URL =
  typeof process !== "undefined" && process.env ? process.env.REACT_APP_SUPABASE_URL : null;
const SB_KEY =
  typeof process !== "undefined" && process.env ? process.env.REACT_APP_SUPABASE_ANON_KEY : null;

function cabecerasSB() {
  return {
    "Content-Type": "application/json",
    apikey: SB_KEY,
    Authorization: "Bearer " + SB_KEY
  };
}

async function rpcVotar(clave) {
  if (!SB_URL || !SB_KEY) return false;
  try {
    const r = await fetch(SB_URL + "/rest/v1/rpc/yamacoa_encuesta_votar", {
      method: "POST",
      headers: cabecerasSB(),
      body: JSON.stringify({ p_clave: clave })
    });
    return r.ok;
  } catch (e) {
    return false;
  }
}

// Devuelve las filas tal cual las da la RPC: [{ clave, votos }, ...].
async function rpcResultados(prefijo) {
  if (!SB_URL || !SB_KEY) return null;
  try {
    const r = await fetch(SB_URL + "/rest/v1/rpc/yamacoa_encuesta_resultados", {
      method: "POST",
      headers: cabecerasSB(),
      body: JSON.stringify({ p_prefijo: prefijo })
    });
    if (!r.ok) return null;
    const filas = await r.json();
    return Array.isArray(filas) ? filas : null;
  } catch (e) {
    return null;
  }
}

function Encuesta({ enc, slug }) {
  const [votos, setVotos] = useState({});
  const [resultados, setResultados] = useState({});
  const [cargando, setCargando] = useState({});
  const memoria = useRef({});

  const leerAlmacen = (k) => {
    try { return window.localStorage.getItem(k); }
    catch (e) { return memoria.current[k] || null; }
  };
  const escribirAlmacen = (k, v) => {
    try { window.localStorage.setItem(k, v); }
    catch (e) { memoria.current[k] = v; }
  };

  useEffect(() => {
    const previos = {};
    enc.preguntas.forEach((p) => {
      const v = leerAlmacen(`${slug}::${p.id}`);
      if (v) previos[p.id] = v;
    });
    if (Object.keys(previos).length) setVotos(previos);
  }, [enc, slug]);

  const cargarResultados = async (preguntaId) => {
    // El prefijo lleva el `::` final: sin el, un id de pregunta que sea prefijo
    // de otro leeria las claves del vecino.
    const filas = await rpcResultados(`${slug}::${preguntaId}::`);
    if (filas) setResultados((r) => ({ ...r, [preguntaId]: filas }));
  };

  useEffect(() => {
    Object.keys(votos).forEach((pid) => {
      if (!resultados[pid]) cargarResultados(pid);
    });
  }, [votos]);

  const votar = async (pregunta, opcionId) => {
    if (votos[pregunta.id]) return;
    const clave = `${slug}::${pregunta.id}::${opcionId}`;
    setCargando((c) => ({ ...c, [pregunta.id]: true }));
    escribirAlmacen(`${slug}::${pregunta.id}`, opcionId);
    setVotos((v) => ({ ...v, [pregunta.id]: opcionId }));

    // El voto local ya persistio: si la RPC falla, la lectura no se bloquea.
    await rpcVotar(clave);
    await cargarResultados(pregunta.id);
    setCargando((c) => ({ ...c, [pregunta.id]: false }));
  };

  const pctDe = (pid, opcionId) => {
    const r = resultados[pid];
    if (!r || !Array.isArray(r)) return null;
    const total = r.reduce((a, x) => a + (Number(x.votos) || 0), 0);
    if (!total) return null;
    const fila = r.find((x) => (x.clave || "").endsWith(`::${opcionId}`));
    return Math.round(((Number(fila?.votos) || 0) / total) * 100);
  };

  return (
    <Panel>
      <p style={{
        fontFamily: F.texto, fontSize: 14, color: P.tintaSuave,
        margin: "0 0 24px", lineHeight: 1.6
      }}>
        {enc.descripcion}
      </p>

      {enc.preguntas.map((p, idx) => {
        const votado = votos[p.id];
        return (
          <div key={p.id} style={{
            marginBottom: 30, paddingBottom: 26,
            borderBottom: idx < enc.preguntas.length - 1 ? `1px solid ${P.regla}` : "none"
          }}>
            <div style={{
              fontFamily: F.dato, fontSize: 11, letterSpacing: "0.14em",
              color: P.ciruela, marginBottom: 9
            }}>
              PREGUNTA {idx + 1} DE {enc.preguntas.length}
            </div>
            <h3 style={{
              fontFamily: F.texto, fontSize: 17, fontWeight: 600, lineHeight: 1.45,
              color: P.tinta, margin: "0 0 16px", maxWidth: "58ch"
            }}>
              {p.texto}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {p.opciones.map((o) => {
                const elegida = votado === o.id;
                const pct = votado ? pctDe(p.id, o.id) : null;
                return (
                  <button
                    key={o.id}
                    onClick={() => votar(p, o.id)}
                    disabled={!!votado || cargando[p.id]}
                    style={{
                      position: "relative", textAlign: "left", padding: "12px 15px",
                      border: `1px solid ${elegida ? P.petroleo : P.regla}`,
                      borderRadius: 12, background: P.superficie,
                      cursor: votado ? "default" : "pointer",
                      fontFamily: F.texto, fontSize: 15, color: P.tinta,
                      overflow: "hidden", transition: "border-color 0.14s"
                    }}
                  >
                    {pct !== null && (
                      <span style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: `${pct}%`,
                        background: elegida ? "rgba(20,73,79,0.16)" : "rgba(90,106,108,0.09)",
                        transition: "width 0.5s ease"
                      }} />
                    )}
                    <span style={{
                      position: "relative", display: "flex",
                      justifyContent: "space-between", gap: 12, alignItems: "center"
                    }}>
                      <span style={{ minWidth: 0 }}>
                        {elegida && (
                          <span style={{ color: P.petroleo, marginRight: 7 }}>✓</span>
                        )}
                        {o.texto}
                      </span>
                      {pct !== null && (
                        <span style={{
                          fontFamily: F.dato, fontSize: 13, color: P.tintaSuave, flexShrink: 0
                        }}>
                          {pct}%
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {votado && !resultados[p.id] && (
              <p style={{
                fontFamily: F.dato, fontSize: 11.5, color: P.tintaSuave, marginTop: 10
              }}>
                Voto registrado. Los agregados se muestran cuando hay conexion.
              </p>
            )}
          </div>
        );
      })}
    </Panel>
  );
}

/* ============================= Referencias ============================= */

function Referencias({ refs }) {
  const etiqueta = {
    primaria_oficial: "fuente oficial",
    academica: "academica",
    academica_revisada: "revisada por pares",
    prensa: "prensa",
    prensa_independiente: "prensa independiente",
    ong: "organizacion civil"
  };
  const color = {
    primaria_oficial: P.petroleo,
    academica: P.violeta,
    academica_revisada: P.violeta,
    prensa: P.arena,
    prensa_independiente: P.oliva,
    ong: P.oliva
  };

  return (
    <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {refs.map((r) => (
        <li key={r.id} style={{
          display: "flex", gap: 14, padding: "15px 0",
          borderTop: `1px solid ${P.regla}`
        }}>
          <span style={{
            fontFamily: F.dato, fontSize: 12, color: P.tintaSuave,
            minWidth: 26, flexShrink: 0, paddingTop: 2
          }}>
            {String(r.id).padStart(2, "0")}
          </span>
          <div style={{ minWidth: 0 }}>
            <a
              href={r.url} target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily: F.texto, fontSize: 15, color: P.petroleo,
                textDecoration: "none", borderBottom: `1px solid ${P.regla}`,
                lineHeight: 1.45, wordBreak: "break-word"
              }}
            >
              {r.titulo}
            </a>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 9, alignItems: "center",
              margin: "7px 0 6px"
            }}>
              <span style={{ fontFamily: F.dato, fontSize: 11.5, color: P.tinta }}>
                {r.fuente}
              </span>
              {r.autor && (
                <span style={{ fontFamily: F.dato, fontSize: 11.5, color: P.tintaSuave }}>
                  {r.autor}
                </span>
              )}
              <span style={{ fontFamily: F.dato, fontSize: 11.5, color: P.tintaSuave }}>
                {r.fecha}
              </span>
              <span style={{
                fontFamily: F.dato, fontSize: 10, letterSpacing: "0.07em",
                textTransform: "uppercase", color: color[r.tipo] || P.tintaSuave,
                border: `1px solid ${color[r.tipo] || P.regla}`,
                borderRadius: 6, padding: "1px 6px"
              }}>
                {etiqueta[r.tipo] || r.tipo}
              </span>
            </div>
            <div style={{
              fontFamily: F.texto, fontSize: 13.5, color: P.tintaSuave, lineHeight: 1.55
            }}>
              {r.uso}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ============================== Principal ============================== */

export default function NegligenciaOGenocidio({ data, datosUrl }) {
  const [d, setD] = useState(data || DATOS_EMBEBIDOS);

  useEffect(() => {
    if (data) { setD(data); return; }
    // Cableado de importacion: el router monta el componente sin props, asi que
    // esta URL por defecto es la que corre. Convencion del proyecto:
    // public/data/<slug del registry>.json servido bajo PUBLIC_URL.
    const url = datosUrl || DATA_URL;
    let vivo = true;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => { if (vivo) setD(j); })
      .catch(() => { /* se conserva el embebido */ });
    return () => { vivo = false; };
  }, [data, datosUrl]);

  if (!d) return null;

  const totalDef = d.series_demografia.reduce((a, s) => a + s.defunciones, 0);

  return (
    <article style={{
      background: "transparent", color: P.tinta, minHeight: "100vh",
      padding: "clamp(22px, 4.5vw, 62px) clamp(16px, 5vw, 44px)",
      fontFamily: F.texto
    }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>

        {/* Portada */}
        <header style={{ marginBottom: 60 }}>
          <div style={{
            fontFamily: F.dato, fontSize: 11.5, letterSpacing: "0.22em",
            color: P.ciruela, marginBottom: 20, textTransform: "uppercase"
          }}>
            Yamacoa · Observatorio · {d.fecha_datos}
          </div>
          <h1 style={{
            fontFamily: F.display, fontWeight: 800, fontSize: "clamp(32px, 6.6vw, 66px)",
            lineHeight: 1.02, letterSpacing: "-0.025em", margin: "0 0 20px",
            color: P.tinta, maxWidth: "16ch"
          }}>
            {d.titulo}
          </h1>
          <p style={{
            fontFamily: F.texto, fontSize: "clamp(17px, 2.3vw, 21px)",
            lineHeight: 1.5, color: P.petroleo, margin: "0 0 30px",
            maxWidth: "50ch", fontWeight: 500
          }}>
            {d.subtitulo}
          </p>

          <div style={{
            display: "flex", flexWrap: "wrap", gap: "26px 40px",
            padding: "26px 0", borderTop: `2px solid ${P.tinta}`,
            borderBottom: `1px solid ${P.regla}`, marginBottom: 30
          }}>
            <Cifra valor="4,0 → 9,9" etiqueta="Mortalidad infantil por mil, 2018 a 2025" color={P.ciruela} />
            <Cifra valor="37,4" sufijo="%" etiqueta="Inversión nacional en turismo, 2024" color={P.violeta} />
            <Cifra valor="2,0" sufijo="%" etiqueta="Inversión nacional en salud, 2024" color={P.ciruela} />
            <Cifra valor={fmt(totalDef)} etiqueta="Defunciones registradas 2019-2025" color={P.tinta} />
          </div>

          <p style={{
            fontFamily: F.texto, fontSize: 17, lineHeight: 1.7,
            color: P.tinta, maxWidth: "66ch", margin: "0 0 22px"
          }}>
            {d.resumen}
          </p>
          <p style={{
            fontFamily: F.texto, fontSize: 17, lineHeight: 1.6,
            color: P.tinta, maxWidth: "62ch", margin: 0,
            borderLeft: `3px solid ${P.ciruela}`, paddingLeft: 18, fontWeight: 500
          }}>
            {d.tesis}
          </p>
        </header>

        {/* 0 · Correcciones */}
        <Seccion
          numero="00 · DEPURACION PREVIA"
          titulo="Lo que no sobrevive a la verificación"
          sub="Tres afirmaciones que circulan en el debate público sobre la demografia cubana no resisten el contraste con las fuentes. Se documentan aquí en lugar de descartarse en silencio, porque una acusación construida sobre cifras fragiles se derrumba en el primer contraargumento."
        >
          {d.correcciones.map((c, i) => (
            <div key={i} style={{
              background: P.superficie, border: `1px solid ${P.regla}`,
              borderLeft: `4px solid ${P.arena}`, borderRadius: 16,
              padding: "18px 20px", marginBottom: 14
            }}>
              <div style={{
                display: "flex", gap: 12, flexWrap: "wrap",
                alignItems: "center", marginBottom: 11
              }}>
                <span style={{
                  fontFamily: F.dato, fontSize: 11, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: P.arena,
                  border: `1px solid ${P.arena}`, borderRadius: 6, padding: "2px 8px"
                }}>
                  {c.veredicto}
                </span>
                <Confianza nivel={c.confianza} />
              </div>
              <div style={{
                fontFamily: F.texto, fontSize: 16, fontWeight: 600, color: P.tinta,
                marginBottom: 10, lineHeight: 1.5, fontStyle: "italic"
              }}>
                «{c.afirmacion}»
              </div>
              <p style={{
                fontFamily: F.texto, fontSize: 14.5, lineHeight: 1.65,
                color: P.tintaSuave, margin: "0 0 10px"
              }}>
                {c.razon}
              </p>
              <p style={{
                fontFamily: F.texto, fontSize: 14.5, lineHeight: 1.65,
                color: P.tinta, margin: 0, paddingTop: 10,
                borderTop: `1px solid ${P.regla}`
              }}>
                <span style={{
                  fontFamily: F.dato, fontSize: 10.5, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: P.petroleo, marginRight: 8
                }}>
                  En su lugar
                </span>
                {c.correccion}
              </p>
            </div>
          ))}
        </Seccion>

        {/* 1 · Mortalidad infantil */}
        <Seccion
          numero="01 · EL INDICADOR DECISIVO"
          titulo={d.mortalidad_infantil.titulo}
          sub={d.mortalidad_infantil.por_que_importa}
        >
          <GraficoMortalidadInfantil mi={d.mortalidad_infantil} />

          <div style={{ marginTop: 22 }}>
            <Parrafo>
              El Estado cubano ofrece dos explicaciones para el deterioro de sus indicadores
              demograficos: el envejecimiento de la poblacion y el embargo estadounidense.
              La mortalidad infantil es el terreno donde la primera explicacion no puede
              siquiera formularse. Mide exclusivamente a menores de un ano, sobre un
              denominador de nacidos vivos del mismo ano y en el mismo territorio. Ni la
              emigracion ni el envejecimiento la tocan.
            </Parrafo>
            <Parrafo>
              La cifra paso de <strong>4,0 por mil en 2018 a 9,9 en 2025</strong>. En 2024 era
              7,4. El salto de un solo año, de 7,4 a 9,9, equivale a 2,5 puntos, más que todo
              el deterioro acumulado entre 2018 y 2021. En el mismo periodo la mortalidad
              materna subió de 38,7 a 44,1 por cada cien mil nacidos vivos. De los 168
              municipios del país, solo 17 cerraron 2025 sin fallecidos menores de un año.
            </Parrafo>
          </div>

          <div style={{
            background: P.superficie, border: `1px solid ${P.violeta}`,
            borderRadius: 20, padding: "18px 20px", marginTop: 8
          }}>
            <div style={{
              fontFamily: F.dato, fontSize: 11, letterSpacing: "0.1em",
              textTransform: "uppercase", color: P.violeta, marginBottom: 9
            }}>
              {d.mortalidad_infantil.objecion_central.titulo}
            </div>
            <p style={{
              fontFamily: F.texto, fontSize: 15, lineHeight: 1.66,
              color: P.tinta, margin: "0 0 12px"
            }}>
              {d.mortalidad_infantil.objecion_central.texto}
            </p>
            <p style={{
              fontFamily: F.texto, fontSize: 14.5, lineHeight: 1.62,
              color: P.tintaSuave, margin: 0, paddingTop: 11,
              borderTop: `1px solid ${P.regla}`
            }}>
              <strong style={{ color: P.tinta }}>Efecto sobre la tesis: </strong>
              {d.mortalidad_infantil.objecion_central.efecto_sobre_tesis}
            </p>
          </div>
        </Seccion>

        {/* 2 · Contrafactual */}
        <Seccion
          numero="02 · CUANTAS MUERTES SOBRAN"
          titulo={d.contrafactual.titulo}
          sub="Un país que envejece debe registrar cada año más defunciones, aunque su sistema sanitario funcione perfectamente. La pregunta util no es cuanta gente murio, sino cuanta murio por encima de lo que el envejecimiento explica. Mueva el control y observe si el exceso desaparece en algun escenario."
        >
          <ContrafactualDefunciones series={d.series_demografia} cf={d.contrafactual} />

          <div style={{ marginTop: 26 }}>
            <h3 style={{
              fontFamily: F.display, fontWeight: 800, fontSize: "clamp(18px, 2.6vw, 24px)",
              color: P.tinta, margin: "0 0 8px", lineHeight: 1.2
            }}>
              La curva que deberia estar bajando
            </h3>
            <Parrafo>
              Si el exceso de mortalidad cubano fuera una secuela de la pandemia, tendria la
              forma de todos los shocks epidemicos conocidos: un pico y un descenso. El
              siguiente grafico muestra que la serie hace lo contrario a partir de 2022.
            </Parrafo>
          </div>
          <GraficoExcesoAnual series={d.series_demografia} cf={d.contrafactual} />
        </Seccion>

        {/* 3 · El embargo */}
        <Seccion
          numero="03 · LA VARIABLE QUE NO VARIA"
          titulo="El embargo no puede explicar un cambio de 2019"
          sub="Esta sección no evalua si el embargo estadounidense causa dano. Evalua algo distinto y estrictamente tecnico: si puede identificarse como causa del deterioro fechado en 2019-2025. Una variable presente sin interrupción desde 1962 no explica por si sola un cambio de nivel ocurrido sesenta años después."
        >
          <LineaTiempoEmbargo mi={d.mortalidad_infantil} placebo={d.did.prueba_placebo} />

          <div style={{ marginTop: 24 }}>
            <Parrafo>
              El argumento tiene una version fuerte que conviene enunciar con precision. El
              embargo funciona como una restriccion presupuestaria permanente: encarece el
              credito, complica la importacion de insumos medicos y cierra mercados. Nada de
              eso esta en disputa aqui. Lo que esta en disputa es su capacidad para explicar
              el momento del colapso.
            </Parrafo>
            <Parrafo>
              Entre 1992 y 1996 Cuba perdio simultaneamente el subsidio sovietico y sufrio el
              endurecimiento legislativo mas severo de la historia del embargo. Su producto
              interno bruto cayo alrededor de un 35%. En esas condiciones, la mortalidad
              infantil <strong>continuo descendiendo</strong> y la esperanza de vida continuo
              subiendo. El sistema sanitario absorbió un shock económico mayor que el actual
              sin degradar sus indicadores de resultado.
            </Parrafo>
            <Parrafo>
              La conclusion que se sigue no es que el embargo sea inocuo. Es que la variable
              explicativa del periodo 2019-2025 debe buscarse entre las que efectivamente
              cambiaron en esa ventana. El resto de esta ficha se ocupa de una de ellas: la
              decision sobre a que se destinan los recursos que si existen.
            </Parrafo>
          </div>
        </Seccion>

        {/* 4 · Comparados */}
        <Seccion
          numero="04 · ESTADOS AISLADOS"
          titulo={d.comparados.titulo}
          sub={d.comparados.nota_taxonomica}
        >
          <GraficoSancionados comparados={d.comparados} />

          <div style={{
            background: P.superficie, border: `1px solid ${P.regla}`,
            borderLeft: `4px solid ${P.oliva}`, borderRadius: 16,
            padding: "20px 22px", marginTop: 24
          }}>
            <h3 style={{
              fontFamily: F.display, fontWeight: 800, fontSize: "clamp(17px, 2.4vw, 22px)",
              color: P.tinta, margin: "0 0 12px", lineHeight: 1.25
            }}>
              {d.comparados.caso_espana.titulo}
            </h3>
            <p style={{
              fontFamily: F.texto, fontSize: 15.5, lineHeight: 1.7,
              color: P.tinta, margin: 0
            }}>
              {d.comparados.caso_espana.texto}
            </p>
          </div>

          <div style={{ marginTop: 24 }}>
            <Parrafo>
              El caso de Taiwan cumple la funcion inversa y no menos incomoda. Taiwan tiene la
              fecundidad mas baja del mundo, una poblacion que se contrae desde 2020 y una
              exclusion diplomatica de cinco decadas. Reune, por tanto, todos los factores que
              el discurso oficial cubano invoca, menos uno. Su mortalidad infantil lleva diez
              anos estable en torno al 3,8 por mil. Envejecer y estar aislado producen descenso
              poblacional lento. No producen que se dupliquen las muertes de recien nacidos.
            </Parrafo>
          </div>
        </Seccion>

        {/* 5 · Politica economica */}
        <Seccion
          numero="05 · VEINTE ANOS DE DECISIONES"
          titulo={d.politica_economica.titulo}
          sub="La ventana 2006-2026 contiene un ciclo completo: una fase reformista entre 2008 y 2016, una reversión a partir de 2019, y un shock de política monetaria en enero de 2021 cuyo efecto sobre precios y natalidad es el más nitido de la serie."
        >
          <GraficoNacDef series={d.series_demografia} hitos={d.politica_economica.hitos} />

          <div style={{ marginTop: 34 }}>
            <h3 style={{
              fontFamily: F.display, fontWeight: 800, fontSize: "clamp(19px, 2.8vw, 26px)",
              color: P.tinta, margin: "0 0 10px", lineHeight: 1.2
            }}>
              {d.politica_economica.inversion_2024.titulo}
            </h3>
            <Parrafo>
              Aqui termina la discusion sobre restricciones externas y empieza la de las
              prioridades internas. Las cifras que siguen no proceden de ninguna organizacion
              critica ni de ninguna estimacion independiente. Las publico la Oficina Nacional
              de Estadistica e Informacion del propio Estado cubano.
            </Parrafo>
          </div>
          <GraficoInversion inv={d.politica_economica.inversion_2024} />

          <div style={{ marginTop: 22 }}>
            <Parrafo>
              Un embargo restringe cuantos recursos hay. No decide como se reparten los que
              hay. En 2024, con la mortalidad infantil ya en 7,4 por mil y con 128.098
              defunciones registradas, el Estado cubano dirigio veinticinco veces mas inversion
              a hoteles e inmobiliarias que a educacion, y dieciocho veces mas que a salud
              publica. La ocupacion hotelera de ese ano fue del 23%.
            </Parrafo>
          </div>
        </Seccion>

        {/* 6 · Identificacion */}
        <Seccion
          numero="06 · IDENTIFICACION"
          titulo={d.did.titulo}
          sub={d.did.advertencia_metodologica}
        >
          <Panel>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(215px, 1fr))",
              gap: 18, marginBottom: 22
            }}>
              {[
                ["Unidad tratada", d.did.unidad_tratada],
                ["Grupo de comparacion", d.did.grupo_control],
                ["Variable de resultado", d.did.resultado],
                ["Ventanas", `${d.did.pre} frente a ${d.did.post}`]
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{
                    fontFamily: F.dato, fontSize: 10.5, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: P.tintaSuave, marginBottom: 6
                  }}>{k}</div>
                  <div style={{
                    fontFamily: F.texto, fontSize: 14.5, color: P.tinta, lineHeight: 1.5
                  }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{
              padding: "16px 18px", background: "rgba(122,43,63,0.05)",
              border: `1px solid ${P.ciruela}`, borderRadius: 16, marginBottom: 20
            }}>
              <div style={{
                fontFamily: F.dato, fontSize: 10.5, letterSpacing: "0.1em",
                textTransform: "uppercase", color: P.ciruela, marginBottom: 10
              }}>
                Tratamiento
              </div>
              <p style={{
                fontFamily: F.texto, fontSize: 15, lineHeight: 1.62,
                color: P.tinta, margin: 0
              }}>{d.did.tratamiento}</p>
            </div>

            <div style={{
              display: "flex", flexWrap: "wrap", gap: 30, alignItems: "flex-start",
              padding: "20px 0", borderTop: `1px solid ${P.regla}`,
              borderBottom: `1px solid ${P.regla}`, marginBottom: 20
            }}>
              <Cifra valor={`+${fmt1(d.did.delta_ln_cuba * 100)}`} sufijo="log%"
                etiqueta="Variación de Cuba" color={P.ciruela} />
              <Cifra valor={fmt1(d.did.delta_ln_control * 100)} sufijo="log%"
                etiqueta="Variación del grupo de comparación" color={P.oliva} />
              <Cifra valor={`${fmt1(d.did.razon_implicada)}×`}
                etiqueta="Razón implicada frente al contrafactual" color={P.ambar} />
            </div>

            <Contrafactual titulo="Lectura del estimador">
              <p style={{
                fontFamily: F.texto, fontSize: 15.5, lineHeight: 1.66,
                color: P.tinta, margin: 0
              }}>{d.did.lectura}</p>
            </Contrafactual>

            <div style={{ marginTop: 6 }}>
              <div style={{
                fontFamily: F.dato, fontSize: 10.5, letterSpacing: "0.1em",
                textTransform: "uppercase", color: P.tintaSuave, marginBottom: 10
              }}>
                Supuestos que pueden fallar
              </div>
              <ol style={{
                margin: 0, paddingLeft: 20, fontFamily: F.texto, fontSize: 14.5,
                color: P.tintaSuave, lineHeight: 1.65
              }}>
                {d.did.supuestos_que_pueden_fallar.map((s, i) => (
                  <li key={i} style={{ marginBottom: 9 }}>{s}</li>
                ))}
              </ol>
            </div>

            <Leyenda
              nota="Yamacoa pública este estimador con su aparato de supuestos completo y no lo presenta como prueba causal. Un lector que rechace cualquiera de los cuatro supuestos enumerados debe rechazar también la magnitud de 2,7. Lo que no depende de este diseño son las cifras de las secciones 01 y 05, que son registros oficiales, no inferencias."
              fuente="Elaboración propia"
              confianza="calculado"
            />
          </Panel>
        </Seccion>

        {/* 7 · Test juridico */}
        <Seccion
          numero="07 · LA PREGUNTA DEL TITULO"
          titulo={d.test_juridico.titulo}
          sub="Genocidio, negligencia y crimen de lesa humanidad no son sinonimos con distinta carga emocional. Son figuras con elementos constitutivos que se cumplen o no se cumplen. Aqui se aplican uno a uno al expediente reunido en las secciones anteriores."
        >
          <MatrizJuridica tj={d.test_juridico} />

          <div style={{
            marginTop: 26, padding: "24px 26px", background: "#3a2418",
            borderRadius: 24, color: P.superficie
          }}>
            <div style={{
              fontFamily: F.dato, fontSize: 11, letterSpacing: "0.16em",
              textTransform: "uppercase", color: "#f2cdb8", marginBottom: 14
            }}>
              Conclusion
            </div>
            <p style={{
              fontFamily: F.texto, fontSize: "clamp(16px, 2.2vw, 19px)",
              lineHeight: 1.66, margin: "0 0 18px", color: P.superficie
            }}>
              {d.test_juridico.conclusion}
            </p>
            <p style={{
              fontFamily: F.texto, fontSize: 15.5, lineHeight: 1.66,
              margin: 0, color: "#c9a893", paddingTop: 18,
              borderTop: "1px solid rgba(201,168,147,0.28)"
            }}>
              {d.test_juridico.por_que_importa_la_precision}
            </p>
          </div>
        </Seccion>

        {/* 8 · Encuesta */}
        <Seccion
          numero="08 · ENCUESTA"
          titulo={d.encuesta.titulo}
        >
          <Encuesta enc={d.encuesta} slug={d.slug} />
        </Seccion>

        {/* 9 · Metodologia */}
        <Seccion
          numero="09 · METODOLOGIA"
          titulo="Que se hizo y donde puede fallar"
        >
          <Panel>
            {[
              ["Nota de integridad", d.metodologia_global.nota_de_integridad],
              ["Vulnerabilidad reconocida", d.metodologia_global.vulnerabilidad_reconocida],
              ["Regla de no fusion", d.metodologia_global.regla_de_no_fusion]
            ].map(([k, v], i) => (
              <div key={k} style={{
                paddingTop: i === 0 ? 0 : 16, marginTop: i === 0 ? 0 : 16,
                borderTop: i === 0 ? "none" : `1px solid ${P.regla}`
              }}>
                <div style={{
                  fontFamily: F.dato, fontSize: 10.5, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: P.petroleo, marginBottom: 7
                }}>{k}</div>
                <p style={{
                  fontFamily: F.texto, fontSize: 14.5, lineHeight: 1.66,
                  color: P.tinta, margin: 0
                }}>{v}</p>
              </div>
            ))}
          </Panel>
        </Seccion>

        {/* 10 · Referencias */}
        <Seccion
          numero="10 · REFERENCIAS"
          titulo="Fuentes"
          sub="Cada entrada indica que dato concreto sostiene, para que el lector pueda verificar afirmaciones individuales sin reconstruir la ficha entera."
        >
          <Referencias refs={d.referencias} />
        </Seccion>

        <footer style={{
          paddingTop: 28, borderTop: `2px solid ${P.tinta}`,
          fontFamily: F.dato, fontSize: 11.5, color: P.tintaSuave, lineHeight: 1.75
        }}>
          <div>Yamacoa · {d.slug} · version {d.version} · datos al {d.fecha_datos}</div>
          <div style={{ marginTop: 5 }}>
            Etiquetas de confianza: confirmado, reportado, estimado, calculado, no cuantificado.
            El ambar señala exclusivamente material contrafactual.
          </div>
        </footer>
      </div>
    </article>
  );
}
