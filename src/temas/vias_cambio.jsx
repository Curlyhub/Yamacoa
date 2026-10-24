import React, { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, ZAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, Cell, LabelList
} from "recharts";
import {
  Scale, ShieldAlert, Users, TrendingDown, Landmark,
  ArrowRight, Gavel, Radio, Handshake, Flame, Ship, Megaphone,
  Info
} from "lucide-react";
import { FUENTES_URL } from "../design/tokens";

/* ============================ FROZEN PALETTE ============================ */
/* Paleta "Expediente" — reservada para este tema. Nunca se edita aqui: */
/* si hace falta un ajuste de color, es decision humana, no del pipeline. */
const C = {
  paper: "#f5efe7", paper2: "#fcf9f4", ink: "#1f1a16", ink2: "#4a3f36",
  ink3: "#6b5d50", line: "#e2d8cc", line2: "#cfc2b2",
  teal: "#157A72", tealDeep: "#0E4F4A", brick: "#B23A2B",
  sand: "#B4832C", slate: "#3B5A86",
};

/* tipo (dataset) -> color congelado. El dataset solo declara la categoria. */
const TIPO_COLOR = { novional: C.teal, armada: C.brick, mixta: C.sand, patron: C.slate };
const GRP_COLOR = { "no-violenta": C.teal, "armada": C.brick };

/* icon key (dataset) -> componente. El dataset solo declara la clave. */
const ICONS = {
  gavel: Gavel, shield: ShieldAlert, scale: Scale, landmark: Landmark,
  ship: Ship, users: Users, flame: Flame, megaphone: Megaphone,
  handshake: Handshake, trend_down: TrendingDown, radio: Radio, info: Info,
};

const DATA_URL = "/data/vias_cambio.json";

/* ============================ EMBEDDED FALLBACK ============================ */
/* Copia identica de public/data/vias_cambio.json. Garantiza render standalone */
/* si el fetch falla. Se regenera junto con el JSON externo; no se edita a mano. */
const EMBEDDED_DATA = 
{
  "meta": {
    "slug": "vias_cambio",
    "titulo": "Vías de cambio: invasión, ley y evidencia",
    "actualizado": "2026-10-24",
    "fuentes": [
      "Chenoweth & Stephan, \"Why Civil Resistance Works\" (NAVCO, 1900-2006)",
      "Chenoweth, \"The Future of Nonviolent Resistance\", Journal of Democracy 31(3), 2020",
      "Downes & Monten, \"Forced to Be Free?\", International Security 37(4), 2013",
      "O'Rourke, \"Covert Regime Change\" (Cornell University Press, 2018)",
      "Carta de la ONU, art. 2(4) y 51; Res. AGNU 3314 (1974), 38/7 (1983) y 44/240 (1989); Res. CSNU 940 (1994)",
      "CEPAL, Estudio Economico de America Latina y el Caribe 2025",
      "ONEI (Cuba)",
      "US Customs and Border Protection (CBP)",
      "Horizonte Cubano, Columbia Law School",
      "AP, Al Jazeera, CSIS, House of Commons Library (Venezuela 2026)",
      "CNN, AS/COA, Havana Times, Cato Institute"
    ],
    "descripcion": "Este expediente es un dossier analítico sobre derecho internacional y transiciones políticas que responde a una pregunta con matices: qué vías han derribado dictaduras y cuáles no, y qué significa eso para Cuba. Distingue lo que la evidencia distingue. La invasión organizada por exiliados con apoyo encubierto, como Bahía de Cochinos en 1961, es ilegal para quien la organiza —la Carta de la ONU, la Resolución 3314 sobre agresión y las leyes penales del país de residencia, como la Neutrality Act en Estados Unidos— y casi siempre fracasa: la Brigada 2506, unos 1.400 hombres, colapsó en unas 72 horas porque no hubo levantamiento interno, el aparato de seguridad estaba alertado y Washington mantuvo la operación negable. La intervención directa y abierta de una potencia es otra cosa. En Granada, en 1983, unos 7.300 soldados estadounidenses derribaron en días al Consejo Militar que había fusilado a Maurice Bishop, y hubo elecciones en diciembre de 1984. En Panamá, en 1989, unos 27.000 soldados derrocaron a Manuel Noriega, que se entregó a los 14 días; juró Guillermo Endara, ganador de las elecciones que Noriega había anulado, el ejército se abolió y la democracia no se ha interrumpido. Ambas fueron condenadas por la Asamblea General de la ONU (resoluciones 38/7 y 44/240) y en Panamá murieron entre 202 y unos 500 civiles según las fuentes. En Haití, en 1994, una fuerza con mandato del Consejo de Seguridad hizo salir a la junta sin combate, pero la democracia no se consolidó. En Venezuela, en enero de 2026, Estados Unidos capturó a Nicolás Maduro, pero la estructura chavista sigue gobernando con Delcy Rodríguez y, nueve meses después, sin fecha electoral. La literatura comparada (Downes y Monten, 2013) concluye que la imposición externa produce democracia solo cuando hay un relevo legítimo y un interventor que construye instituciones; y la vía encubierta tiene peor historial, según O'Rourke (2018), con casos como Guatemala en 1954, donde se derribó a un gobierno electo. En cuanto a la resistencia civil, Chenoweth y Stephan hallaron en 323 campañas (1900-2006) un éxito del 53 % frente al 26 % de las insurgencias armadas, pero su base de datos no mide intervenciones de otro Estado y, desde 2010, el éxito ha caído a menos del 34 % para la vía no violenta y al 8 % para la armada. Aplicado a Cuba, el expediente documenta una erosión económica sostenida —el PIB real cae más del 11 % entre 2019 y 2024, la zafra 2024-25 fue la peor en más de un siglo, el turismo cayó de 4,7 a 1,6 millones de llegadas y el peso informal llegó a 440 por dólar— y el mayor éxodo de su historia, con más de un millón de personas salidas desde 2021. Las protestas del 11 de julio de 2021 mostraron la magnitud del descontento y también el límite de la protesta frente a un aparato represivo intacto. Una matriz sitúa cada estrategia según su legalidad y su eficacia histórica para derribar a un gobernante. La conclusión es que las vías no son excluyentes: la intervención directa no puede descartarse, pero Cuba es mayor y está más armada que Granada o Panamá y no tiene un gobierno electo en espera, de modo que lo que ocurra al día siguiente importa tanto como lo que ocurra el primero.",
    "narracion": "¿Qué derriba de verdad una dictadura? Este expediente separa lo que la evidencia separa. La invasión de exiliados con apoyo encubierto, como Bahía de Cochinos, es ilegal para quien la organiza y casi siempre fracasa: mil cuatrocientos hombres, colapso en setenta y dos horas. La intervención directa de una potencia es otra historia: en Granada, en 1983, y en Panamá, en 1989, Estados Unidos derribó a los gobernantes en días, y ambos países son democracias desde entonces, aunque la ONU condenó las dos operaciones y en Panamá murieron cientos de civiles. Pero quitar al gobernante no es cambiar el régimen: en Venezuela, la captura de Maduro en enero de 2026 dejó en el poder a la estructura chavista, que aún no ha fijado elecciones. La resistencia civil sigue teniendo el mejor historial y da legitimidad propia, pero su éxito ha caído desde 2010, y el 11J mostró su límite frente a la represión. Para Cuba, la crisis económica y el éxodo debilitan al régimen; una intervención no puede descartarse, pero la isla es mayor y está más armada que Granada o Panamá, y no hay un gobierno electo esperando. Lo que ocurra el día después importa tanto como el primero.",
    "narracion_en": "What actually brings down a dictatorship? This file separates what the evidence separates. An invasion by exiles with covert backing, like the Bay of Pigs, is illegal for those who organize it and almost always fails: about one thousand four hundred men, collapse within seventy-two hours. Direct intervention by a major power is a different story. In Grenada in nineteen eighty-three and in Panama in nineteen eighty-nine, the United States removed the rulers within days, and both countries have been democracies ever since, although the United Nations General Assembly condemned both operations and hundreds of civilians died in Panama. Removing a ruler, however, is not the same as changing a regime. In Haiti in nineteen ninety-four, restored democracy did not take root. In Venezuela, the capture of Nicolás Maduro in January twenty twenty-six left the chavista power structure in place, and nine months later no election date has been set. Comparative research finds that imposed regime change leads to democracy only when a legitimate successor is ready and the intervening power builds institutions. Civil resistance still has the best overall record and gives a transition its own legitimacy, but its success rate has fallen since twenty ten, and the July eleventh, twenty twenty-one protests showed its limits against an intact security apparatus. Applied to Cuba, economic collapse and the largest exodus in the island's history are weakening the regime. A direct intervention cannot be ruled out, but Cuba is far larger and better armed than Grenada or Panama, and there is no elected government waiting to take over. What happens the day after matters as much as what happens on the first day."
  },
  "hero": {
    "eyebrow": "Dossier analítico · Derecho internacional y transiciones políticas",
    "titulo_pre": "Los exiliados casi nunca han derribado una dictadura. Una potencia que interviene",
    "titulo_em": "sí ha podido",
    "titulo_post": "— lo difícil es el día después.",
    "subtitulo": "Bahía de Cochinos fracasó; Granada (1983) y Panamá (1989) acabaron en democracias que duran hasta hoy; la captura de Maduro en 2026 quitó al gobernante pero no al régimen. Este expediente separa lo que la evidencia distingue: quién interviene, cómo, contra qué Estado y con qué plan para el día siguiente. Y lo aplica a Cuba sin descartar ninguna vía ni darla por segura.",
    "stats": [
      {
        "n": "72",
        "unit": "h",
        "label": "duró Bahía de Cochinos: exiliados con apoyo encubierto"
      },
      {
        "n": "14",
        "unit": "días",
        "label": "tardó Noriega en entregarse tras la invasión de Panamá"
      },
      {
        "n": "9",
        "unit": "meses",
        "label": "después de capturar a Maduro, Venezuela sigue sin fecha electoral"
      },
      {
        "n": "<34",
        "unit": "%",
        "label": "de éxito de la resistencia no violenta desde 2010"
      }
    ]
  },
  "marco_legal": {
    "lede": "El derecho internacional prohíbe el uso de la fuerza, pero no pesa igual sobre todos. Sobre un exiliado o un particular cae con todo su peso penal; sobre una gran potencia se traduce, casi siempre, en una condena sin consecuencias prácticas. Esa asimetría explica por qué la vía armada organizada desde el exilio es inviable y la intervención de un Estado, no.",
    "items": [
      {
        "icon": "gavel",
        "titulo": "Art. 2(4), Carta de la ONU",
        "texto": "Prohíbe a los Estados recurrir a la amenaza o al uso de la fuerza contra la integridad territorial o la independencia política de otro Estado."
      },
      {
        "icon": "shield",
        "titulo": "Res. 3314 (1974), definición de agresión",
        "texto": "El envío de bandas armadas, grupos irregulares o mercenarios que realicen actos de fuerza contra otro Estado se equipara a un acto de agresión (art. 3g)."
      },
      {
        "icon": "scale",
        "titulo": "Excepciones tasadas",
        "texto": "Legítima defensa ante un ataque armado (art. 51) y autorización del Consejo de Seguridad. La de Haití en 1994 la tuvo (Res. 940); las de Granada y Panamá, no."
      },
      {
        "icon": "landmark",
        "titulo": "Leyes del país de residencia",
        "texto": "Organizar o financiar acciones armadas desde el exilio choca con normas penales internas (en EE UU, la Neutrality Act y la prohibición de apoyo material a grupos armados). Es la parte del marco que de verdad se aplica."
      },
      {
        "icon": "info",
        "titulo": "Condenadas, pero no revertidas",
        "texto": "La Asamblea General deploró la invasión de Granada (Res. 38/7, 108 votos a 9) y la de Panamá (Res. 44/240, 75 a 20) como violaciones flagrantes del derecho internacional. Ninguna se deshizo. La ONU y juristas calificaron igual la operación de 2026 en Venezuela."
      }
    ],
    "flujo": [
      {
        "clave": "Exiliado o particular",
        "texto": "Organizar o financiar una acción armada: delito perseguible en su país de residencia"
      },
      {
        "clave": "Estado",
        "texto": "Uso de la fuerza sin mandato: condena en la ONU, rara vez sanción efectiva"
      },
      {
        "clave": "Resultado",
        "texto": "El riesgo penal recae sobre individuos; el coste político, sobre el Estado que interviene"
      }
    ]
  },
  "evidencia_chenoweth": {
    "lede": "Erica Chenoweth y Maria Stephan revisaron 323 campañas de cambio de régimen entre 1900 y 2006 (NAVCO): la resistencia civil triunfó el 53 % de las veces y la insurgencia armada el 26 %. Dos límites que importan para Cuba: NAVCO mide campañas nacidas dentro del país, no la intervención militar de otro Estado; y desde 2010 el éxito ha caído para ambas vías, a menos del 34 % la no violenta y al 8 % la armada, según la propia Chenoweth.",
    "fuente_nota": "Chenoweth & Stephan, \"Why Civil Resistance Works\" (NAVCO, 1900-2006); Chenoweth, Journal of Democracy (2020) para el periodo posterior a 2010.",
    "modos": {
      "exito": {
        "titulo": "Tasa de exito de las campanas",
        "unidad": "%",
        "nota": "Éxito = objetivo logrado en el año siguiente al pico de movilización. Datos 1900-2006; desde 2010: <34 % y 8 %.",
        "data": [
          {
            "k": "Campana no violenta",
            "v": 53,
            "tipo": "novional"
          },
          {
            "k": "Insurgencia armada",
            "v": 26,
            "tipo": "armada"
          }
        ]
      },
      "participacion": {
        "titulo": "Participacion media (factor relativo)",
        "unidad": "x",
        "nota": "Las campanas no violentas movilizan, en promedio, cuatro veces mas participantes.",
        "data": [
          {
            "k": "No violenta",
            "v": 4,
            "tipo": "novional"
          },
          {
            "k": "Armada",
            "v": 1,
            "tipo": "armada"
          }
        ]
      },
      "democracia": {
        "titulo": "Probabilidad de democracia a 5 anos",
        "unidad": "x",
        "nota": "Diez veces mas probable que emerja una democracia tras una campana no violenta.",
        "data": [
          {
            "k": "No violenta",
            "v": 10,
            "tipo": "novional"
          },
          {
            "k": "Armada",
            "v": 1,
            "tipo": "armada"
          }
        ]
      }
    },
    "mini": [
      {
        "n": "<34 %",
        "t": "de las campañas no violentas triunfaron desde 2010 (8 % de las armadas): los regímenes han aprendido a resistir ambas"
      },
      {
        "n": "20 / 25",
        "t": "de los mayores movimientos del siglo XX fueron no violentos"
      },
      {
        "n": "NAVCO",
        "t": "mide campañas surgidas dentro del país; no evalúa la intervención militar abierta de otro Estado"
      }
    ]
  },
  "cochinos": {
    "lede": "La Brigada 2506, unos 1.400 exiliados entrenados y financiados por la CIA, desembarcó el 17 de abril de 1961 y la operación colapsó en unas 72 horas. Lo que fracasó fue un modelo concreto: una fuerza de exiliados con apoyo encubierto y negable, que contaba con un levantamiento interno que no llegó y con un respaldo de Washington que nunca se hizo abierto. No es el mismo modelo que una intervención directa de EE UU.",
    "why_titulo": "Por que fracaso",
    "why_items": [
      "Ausencia de un levantamiento popular que acompañara el desembarco.",
      "Aparato de seguridad e inteligencia infiltrado y ya alertado.",
      "Superioridad logística y de mando del Estado en su propio terreno.",
      "Washington mantuvo la operación negable: recortó los ataques aéreos y no dio cobertura abierta."
    ],
    "stats": [
      {
        "n": "17-19 abr 1961",
        "t": "tres dias de operacion",
        "icon": "ship"
      },
      {
        "n": "~1.400",
        "t": "brigadistas desembarcados",
        "icon": "users"
      },
      {
        "n": "~114",
        "t": "muertos en combate",
        "icon": "flame"
      },
      {
        "n": "~1.189",
        "t": "capturados por el regimen",
        "icon": "shield"
      }
    ]
  },
  "intervenciones": {
    "lede": "Cuando quien interviene es la propia potencia, con su ejército y a cara descubierta, el historial en el Caribe es otro: el gobernante suele caer en días. Lo que decide el resultado final es lo que hay después: un gobierno legítimo esperando, instituciones que reconstruir y un plan. Downes y Monten (2013) lo resumen así: la imposición externa produce democracia solo cuando el interventor la construye activamente y el país tiene condiciones previas favorables.",
    "fuente_nota": "Cifras de cada operación según fuentes militares y de la ONU; las víctimas civiles de Panamá siguen en disputa. Venezuela: estado a octubre de 2026.",
    "casos": [
      {
        "caso": "Granada, 1983",
        "icon": "ship",
        "veredicto": "Cayó el gobierno · llegó la democracia",
        "resultado": "democracia",
        "fuerza": "~7.300 soldados de EE UU y 353 del Caribe frente a ~1.500 del ejército revolucionario y 784 cubanos, en su mayoría trabajadores de la construcción.",
        "despues": "El Consejo Militar que había fusilado a Maurice Bishop cayó en unos ocho días. Elecciones en diciembre de 1984; democracia parlamentaria estable desde entonces.",
        "coste": "19 militares de EE UU, 24 cubanos, entre 21 y 45 militares granadinos y al menos 24 civiles muertos. La AGNU la deploró (Res. 38/7)."
      },
      {
        "caso": "Panamá, 1989",
        "icon": "shield",
        "veredicto": "Cayó el dictador · llegó la democracia",
        "resultado": "democracia",
        "fuerza": "~27.000 soldados de EE UU frente a ~16.000 de las Fuerzas de Defensa de Panamá.",
        "despues": "Noriega se entregó a los 14 días. Juró Guillermo Endara, ganador de las elecciones de mayo de 1989 que Noriega había anulado. El ejército se abolió (1990; en la Constitución, 1994) y la alternancia democrática no se ha interrumpido.",
        "coste": "23 militares de EE UU y 314 panameños; civiles: 202 según el Pentágono, unos 500 según la ONU, más según otras fuentes. La AGNU la deploró (Res. 44/240)."
      },
      {
        "caso": "Haití, 1994",
        "icon": "scale",
        "veredicto": "Cayó la junta sin combate · democracia frágil",
        "resultado": "fragil",
        "fuerza": "~20.000 soldados de EE UU y de unos 15 países, con mandato del Consejo de Seguridad (Res. 940).",
        "despues": "Con los paracaidistas ya en el aire, la junta de Cédras aceptó irse. Aristide volvió el 15 de octubre de 1994. Las instituciones no se consolidaron: Aristide salió de nuevo en 2004 en plena revuelta armada.",
        "coste": "1 militar de EE UU y unos 10 haitianos muertos."
      },
      {
        "caso": "Venezuela, 2026",
        "icon": "flame",
        "veredicto": "Cayó el gobernante · el régimen sigue",
        "resultado": "continuidad",
        "fuerza": "Operación de unas dos horas y media en Caracas (3 de enero) con fuerzas especiales y apoyo de la CIA.",
        "despues": "Maduro y Cilia Flores, capturados y juzgados en Nueva York. Gobierna Delcy Rodríguez con la estructura chavista y el reconocimiento de Washington; cientos de presos políticos liberados, pero sin fecha electoral y con detenidos en las protestas del 22 de octubre.",
        "coste": "Unas 80 muertes, entre ellas 32 militares y agentes cubanos según La Habana. La ONU y juristas la consideraron contraria a la Carta."
      }
    ],
    "leccion": "La pregunta útil no es si la fuerza externa «funciona», sino para qué. Para quitar a un gobernante de un Estado pequeño, la intervención directa de EE UU ha sido eficaz casi siempre. Para que nazca una democracia, solo cuando había un relevo legítimo listo y un plan: Panamá tenía un presidente electo esperando; Venezuela en 2026, no. Cuba no se parece del todo a ninguno: es mucho mayor (unos 9,7 millones de habitantes según la ONEI frente a 2,4 en Panamá en 1989), sus Fuerzas Armadas son mayores y no hay un gobierno electo en espera. Y la vía encubierta tiene peor historial: según O'Rourke (2018), la mayoría de las operaciones encubiertas de cambio de régimen de EE UU en la Guerra Fría no lograron su objetivo, y en Guatemala (1954) la que sí lo logró derribó a un gobierno electo y abrió décadas de dictadura militar."
  },
  "vias_frecuencia": {
    "lede": "Las salidas autoritarias suelen combinar presión social sostenida, quiebra económica y fractura de las élites. La intervención militar directa de una potencia es poco frecuente, pero cuando ocurre suele derribar al gobernante; la invasión de exiliados es a la vez rara e ineficaz. El ordenamiento es una síntesis ilustrativa de esa frecuencia relativa.",
    "fuente_nota": "Sintesis cualitativa a partir de la evidencia comparada citada. No es una serie estadistica.",
    "data": [
      {
        "k": "Presión interna masiva + defección de élites",
        "v": 82,
        "ej": "Chile 1988-90",
        "tipo": "novional"
      },
      {
        "k": "Transición negociada / apertura pactada",
        "v": 74,
        "ej": "Brasil 1985; España 1975-78",
        "tipo": "novional"
      },
      {
        "k": "Colapso económico o derrota militar",
        "v": 61,
        "ej": "Argentina 1983 (tras Malvinas)",
        "tipo": "mixta"
      },
      {
        "k": "Fin del apoyo de la potencia patrona",
        "v": 58,
        "ej": "Europa del Este 1989",
        "tipo": "patron"
      },
      {
        "k": "Insurrección armada interna",
        "v": 28,
        "ej": "Nicaragua 1979",
        "tipo": "armada"
      },
      {
        "k": "Intervención militar directa de una potencia",
        "v": 20,
        "ej": "Granada 1983; Panamá 1989; Haití 1994",
        "tipo": "armada"
      },
      {
        "k": "Invasión organizada por exiliados",
        "v": 9,
        "ej": "Bahía de Cochinos 1961",
        "tipo": "armada"
      }
    ]
  },
  "erosion_economica": {
    "lede": "El régimen cubano enfrenta la peor crisis desde 1959: contracción sostenida del PIB, inflación crónica, colapso del azúcar y del turismo y un peso en caída libre. Esta erosión es el telón de fondo de cualquier vía de cambio, interna o externa: reduce la capacidad del Estado para premiar lealtades y vuelve más costosa su defensa.",
    "modos": {
      "pib": {
        "titulo": "Variacion anual del PIB real (%)",
        "fuente_nota": "CEPAL y cifras oficiales. Acumulado 2019-2024: caida superior al 11 %. Barras claras = proyeccion.",
        "tooltip_nota": "2025-2026: proyeccion CEPAL.",
        "data": [
          {
            "year": "2015",
            "v": 4.4,
            "proj": false
          },
          {
            "year": "2019",
            "v": -0.2,
            "proj": false
          },
          {
            "year": "2020",
            "v": -10.9,
            "proj": false
          },
          {
            "year": "2021",
            "v": 1.3,
            "proj": false
          },
          {
            "year": "2022",
            "v": 1.8,
            "proj": false
          },
          {
            "year": "2023",
            "v": -1.9,
            "proj": false
          },
          {
            "year": "2024",
            "v": -1.1,
            "proj": false
          },
          {
            "year": "2025",
            "v": -1.5,
            "proj": true
          },
          {
            "year": "2026",
            "v": 0.1,
            "proj": true
          }
        ]
      },
      "inflacion": {
        "titulo": "Inflacion interanual, fin de ano (%)",
        "fuente_nota": "CEPAL / ONEI. En 2025, estimaciones privadas apuntan a niveles cercanos al 70 %.",
        "tooltip_nota": "2025 parcial (oficial). Estimaciones privadas la situan mucho mas alta.",
        "data": [
          {
            "year": "2021",
            "v": 77.3
          },
          {
            "year": "2022",
            "v": 39.1
          },
          {
            "year": "2023",
            "v": 31
          },
          {
            "year": "2024",
            "v": 25
          },
          {
            "year": "2025*",
            "v": 18
          }
        ]
      },
      "azucar": {
        "titulo": "Produccion de azucar (miles de toneladas)",
        "fuente_nota": "De ~8 millones de t (1989) a ~165.000 t (2024/25). Tramos intermedios aproximados.",
        "tooltip_nota": "Zafra 24/25: la peor en mas de un siglo.",
        "data": [
          {
            "year": "1989",
            "t": 8000
          },
          {
            "year": "2000",
            "t": 4057
          },
          {
            "year": "2010",
            "t": 1150
          },
          {
            "year": "2020",
            "t": 816
          },
          {
            "year": "24/25",
            "t": 165
          }
        ]
      },
      "turismo": {
        "titulo": "Llegadas internacionales (millones)",
        "fuente_nota": "Cifras aproximadas. 2025 (*) parcial: caida interanual de ~25 %.",
        "tooltip_nota": "Ocupacion hotelera en torno al 24 % en 2025.",
        "data": [
          {
            "year": "2018",
            "v": 4.7
          },
          {
            "year": "2019",
            "v": 4.3
          },
          {
            "year": "2020",
            "v": 1.1
          },
          {
            "year": "2021",
            "v": 0.6
          },
          {
            "year": "2022",
            "v": 1.6
          },
          {
            "year": "2023",
            "v": 2.4
          },
          {
            "year": "2024",
            "v": 2.2
          },
          {
            "year": "2025*",
            "v": 1.6
          }
        ]
      },
      "cambio": {
        "titulo": "Peso cubano: tasa oficial vs. mercado informal (CUP/USD)",
        "fuente_nota": "Observatorios cambiarios independientes. La brecha oficial/informal supera 18x.",
        "tooltip_nota": "La tasa oficial (24) es una ficcion frente al mercado real.",
        "data": [
          {
            "year": "2021",
            "oficial": 24,
            "informal": 70
          },
          {
            "year": "2022",
            "oficial": 24,
            "informal": 170
          },
          {
            "year": "2023",
            "oficial": 24,
            "informal": 265
          },
          {
            "year": "2024",
            "oficial": 24,
            "informal": 395
          },
          {
            "year": "2025",
            "oficial": 24,
            "informal": 440
          }
        ]
      }
    },
    "mini": [
      {
        "n": "20 h",
        "t": "de apagon diario en algunas provincias durante 2025"
      },
      {
        "n": "oct 2024",
        "t": "primer apagon nacional total: dias sin electricidad"
      },
      {
        "n": "~10 %",
        "t": "de la poblacion con problemas diarios de agua potable"
      }
    ]
  },
  "exodo": {
    "lede": "La mayor ola migratoria de la historia cubana vacia la isla y erosiona la base del regimen sin un solo disparo. Mas de un millon de personas han salido desde 2021; en 2024 emigraron unas 251.000 y nacieron solo 71.358, la cifra mas baja en 65 anos.",
    "modos": {
      "poblacion": {
        "titulo": "Poblacion efectiva (miles de habitantes)",
        "fuente_nota": "ONEI vs. estimacion de Albizu-Campos. De ~11,3 M (2020) a ~8,6 M segun calculos independientes.",
        "tooltip_nota": "ONEI arrastra un rezago estadistico; las estimaciones independientes son menores.",
        "data": [
          {
            "year": "2020",
            "onei": 11186,
            "ind": null
          },
          {
            "year": "2021",
            "onei": 11113,
            "ind": null
          },
          {
            "year": "2022",
            "onei": 11089,
            "ind": null
          },
          {
            "year": "2023",
            "onei": 10056,
            "ind": 8620
          },
          {
            "year": "2024",
            "onei": 9748,
            "ind": 8300
          }
        ]
      },
      "emigracion": {
        "titulo": "Llegadas de cubanos a EE.UU. por ano fiscal (miles)",
        "fuente_nota": "CBP (EE.UU.). Solo EE.UU.; el saldo migratorio total hacia todos los destinos es mayor.",
        "tooltip_nota": "Pico 2022-24; caida en 2025 por cambios de politica migratoria.",
        "data": [
          {
            "year": "2020",
            "v": 14
          },
          {
            "year": "2021",
            "v": 39
          },
          {
            "year": "2022",
            "v": 225
          },
          {
            "year": "2023",
            "v": 200
          },
          {
            "year": "2024",
            "v": 218
          },
          {
            "year": "2025",
            "v": 33
          }
        ]
      }
    },
    "j11_texto": "Las protestas del 11 de julio de 2021, las mayores en décadas, mostraron la magnitud del descontento, y también el límite de la protesta sola frente a un aparato represivo intacto: más de un millar de detenidos y condenas de hasta 25 años. La presión interna sigue siendo la base de cualquier transición legítima, pero no basta por sí misma."
  },
  "matriz": {
    "lede": "Cada estrategia se sitúa según su legalidad y bajo riesgo penal (eje horizontal) y su eficacia histórica para derribar a un gobernante (eje vertical). El tamaño del punto marca el riesgo para quien participa. Las posiciones son una síntesis ilustrativa de la evidencia citada, no una medición. Toca un punto para ver el detalle.",
    "data": [
      {
        "name": "Resistencia civil masiva no violenta",
        "x": 90,
        "y": 64,
        "r": 30,
        "grp": "no-violenta"
      },
      {
        "name": "Transición negociada con élites",
        "x": 80,
        "y": 68,
        "r": 26,
        "grp": "no-violenta"
      },
      {
        "name": "Desobediencia civil y huelgas",
        "x": 82,
        "y": 55,
        "r": 42,
        "grp": "no-violenta"
      },
      {
        "name": "Medios independientes e información",
        "x": 88,
        "y": 48,
        "r": 34,
        "grp": "no-violenta"
      },
      {
        "name": "Presión diplomática, sanciones y coerción económica",
        "x": 70,
        "y": 46,
        "r": 20,
        "grp": "no-violenta"
      },
      {
        "name": "Intervención militar directa de una potencia",
        "x": 18,
        "y": 78,
        "r": 70,
        "grp": "armada"
      },
      {
        "name": "Captura del gobernante sin transición (Venezuela 2026)",
        "x": 15,
        "y": 38,
        "r": 55,
        "grp": "armada"
      },
      {
        "name": "Insurrección armada interna",
        "x": 25,
        "y": 26,
        "r": 78,
        "grp": "armada"
      },
      {
        "name": "Invasión organizada por exiliados",
        "x": 9,
        "y": 12,
        "r": 92,
        "grp": "armada"
      },
      {
        "name": "Financiar grupos armados desde el exterior",
        "x": 7,
        "y": 15,
        "r": 88,
        "grp": "armada"
      }
    ],
    "nota_armada": "Vía armada. Para exiliados y particulares es delito y su historial es de fracaso (Bahía de Cochinos). Para una potencia, la ONU la condena, pero en el Caribe ha derribado gobernantes en días; que llegue una democracia depende del relevo y del plan posteriores (Panamá sí; Venezuela 2026, todavía no). Tiene costes en vidas civiles.",
    "nota_novional": "Vía legal o de bajo riesgo penal, base de toda transición con legitimidad propia. Su eficacia ha caído desde 2010 frente a regímenes que han aprendido a reprimir y dividir; combinada con presión externa sostenida, maximiza el efecto."
  },
  "sintesis": {
    "parrafos": [
      "No hay una sola respuesta a cómo cae una dictadura, y la evidencia distingue más de lo que suele decirse. La invasión organizada por exiliados con apoyo encubierto es a la vez ilegal para quien la organiza y casi siempre fallida: Bahía de Cochinos es su arquetipo. La intervención directa y abierta de una potencia es otra cosa: Granada (1983) y Panamá (1989) derribaron a sus gobernantes en días y desembocaron en democracias que siguen vigentes, aunque la ONU condenó ambas y en Panamá murieron cientos de civiles.",
      "Derribar al gobernante no es lo mismo que cambiar el régimen. En Haití (1994) la democracia restaurada no se consolidó; en Venezuela (2026) la captura de Maduro dejó en el poder a la estructura chavista, que nueve meses después no ha fijado elecciones. La literatura comparada (Downes y Monten, 2013) indica que la imposición externa produce democracia cuando había un relevo legítimo, instituciones que rescatar y un interventor dispuesto a construirlas.",
      "La resistencia civil sigue teniendo el mejor historial general y es la única vía que da legitimidad propia a una transición, pero su eficacia ha caído desde 2010 y el 11J mostró su límite frente a un aparato represivo intacto. Las vías no son excluyentes: la mayoría de las transiciones combinan presión interna, quiebra económica, fractura de élites y presión externa.",
      "Para Cuba, hoy, la erosión económica y el éxodo debilitan al régimen y Washington ha elevado la presión (orden de emergencia nacional, cargos contra Raúl Castro, amenazas navales, el llamamiento de Rubio a colaborar con la CIA). Una intervención directa no puede descartarse, pero Cuba es mayor y está más armada que Granada o Panamá, y no tiene un gobierno electo en espera. Lo que ocurra al día siguiente importará tanto como lo que ocurra el primero."
    ],
    "tags": [
      {
        "icon": "users",
        "texto": "Presión interna"
      },
      {
        "icon": "trend_down",
        "texto": "Erosión económica"
      },
      {
        "icon": "shield",
        "texto": "Intervención externa: quién, cómo y para qué"
      },
      {
        "icon": "handshake",
        "texto": "Transición negociada"
      }
    ]
  },
  "footer": {
    "nota": "Documento analítico e histórico. Expone el marco jurídico y la evidencia comparada sobre transiciones de régimen, incluidas las intervenciones militares extranjeras, sin promover ni facilitar la violencia ni acciones ilegales. Las cifras marcadas como proyección, aproximadas o ilustrativas se identifican en cada gráfica. Revisado el 24 de octubre de 2026 para incorporar las intervenciones directas (Granada, Panamá, Haití, Venezuela) y la caída del éxito de la resistencia civil desde 2010.",
    "fuentes_texto": "Chenoweth & Stephan (NAVCO) - Chenoweth (Journal of Democracy, 2020) - Downes & Monten (International Security, 2013) - O'Rourke (Covert Regime Change, 2018) - Carta de la ONU; Res. AGNU 3314, 38/7, 44/240; Res. CSNU 940 - CEPAL - ONEI - CBP (EE.UU.) - Horizonte Cubano (Columbia Law) - AP, Al Jazeera, CSIS, House of Commons Library - CNN, AS/COA, Havana Times, Cato."
  }
}
;

/* ============================ HOOKS / UI ============================ */
function useReveal() {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setSeen(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, seen] = useReveal();
  return (
    <div ref={ref} className={className}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? "none" : "translateY(14px)",
        transition: `opacity .7s ease ${delay}ms, transform .7s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}>
      {children}
    </div>
  );
}

function Eyebrow({ n, children }) {
  return (
    <div className="eyebrow">
      {n && <span className="eyebrow-n">{n}</span>}
      <span className="eyebrow-rule" />
      <span>{children}</span>
    </div>
  );
}

function Tip({ active, payload, label, unit, note }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="tip">
      {label != null && <div className="tip-h">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="tip-row">
          <span className="tip-dot" style={{ background: p.color || TIPO_COLOR[p.payload.tipo] || C.teal }} />
          <span className="tip-k">{p.name}</span>
          <span className="tip-v">{p.value}{unit || ""}</span>
        </div>
      ))}
      {note && <div className="tip-note">{note}</div>}
    </div>
  );
}

const axis = { stroke: C.line2, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", tick: { fill: C.ink3 } };

function Src({ children }) {
  return <div className="src"><Info size={11} strokeWidth={2} /><span>{children}</span></div>;
}

function Icon({ name, ...props }) {
  const Cmp = ICONS[name] || Info;
  return <Cmp {...props} />;
}

/* ============================ DATA LOADING ============================ */
function useTemaData() {
  const [data, setData] = useState(EMBEDDED_DATA);
  const [source, setSource] = useState("embedded");
  useEffect(() => {
    let alive = true;
    fetch(DATA_URL, { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error("bad status"); return r.json(); })
      .then((json) => { if (alive) { setData(json); setSource("fetch"); } })
      .catch(() => { if (alive) setSource("embedded"); });
    return () => { alive = false; };
  }, []);
  return [data, source];
}

/* ============================ APP ============================ */
export default function App() {
  const [D] = useTemaData();

  const [mChen, setMChen] = useState("exito");
  const [mEcon, setMEcon] = useState("pib");
  const [mDemo, setMDemo] = useState("poblacion");
  const [sel, setSel] = useState(D.matriz.data[0]);

  const chenModo = D.evidencia_chenoweth.modos[mChen];
  const econModo = D.erosion_economica.modos[mEcon];
  const demoModo = D.exodo.modos[mDemo];

  return (
    <div className="root">
      <style>{CSS}</style>

      {/* NAV */}
      <nav className="nav">
        <span className="nav-mark">EXPEDIENTE · CAMBIO DE RÉGIMEN</span>
        <div className="nav-links">
          {[["marco", "Marco"], ["evidencia", "Evidencia"], ["cochinos", "1961"],
            ["vias", "Vías"], ["erosion", "Economía"], ["exodo", "Éxodo"],
            ["matriz", "Matriz"], ["sintesis", "Síntesis"]].map(([id, t]) => (
            <a key={id} href={"#" + id}>{t}</a>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="hero-grid" aria-hidden />
        <div className="hero-in">
          <Reveal><div className="hero-eyebrow">{D.hero.eyebrow}</div></Reveal>
          <Reveal delay={90}>
            <h1 className="hero-h">
              {D.hero.titulo_pre}
              <span className="hero-em"> {D.hero.titulo_em} </span>
              {D.hero.titulo_post}
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="hero-sub">{D.hero.subtitulo}</p>
          </Reveal>
          <Reveal delay={280}>
            <div className="hero-stats">
              {D.hero.stats.map((s, i) => (
                <div className="hs" key={i}>
                  <div className="hs-n">{s.n}<span>{s.unit}</span></div>
                  <div className="hs-l">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </header>

      <main className="main">

        {/* I — MARCO JURÍDICO */}
        <section id="marco" className="sec">
          <Reveal><Eyebrow n="I">El marco jurídico: agresión, no disidencia</Eyebrow></Reveal>
          <Reveal delay={60}><p className="lede">{D.marco_legal.lede}</p></Reveal>
          <div className="cards">
            {D.marco_legal.items.map((l, i) => (
              <Reveal key={i} delay={i * 70} className="card-w">
                <div className="card">
                  <Icon name={l.icon} size={20} strokeWidth={1.6} color={C.teal} />
                  <h3>{l.titulo}</h3>
                  <p>{l.texto}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <div className="flow">
              {D.marco_legal.flujo.map((f, i) => (
                <React.Fragment key={i}>
                  <div className="flow-step"><span className="flow-k">{f.clave}</span>{f.texto}</div>
                  {i < D.marco_legal.flujo.length - 1 && <ArrowRight className="flow-arrow" size={18} />}
                </React.Fragment>
              ))}
            </div>
          </Reveal>
        </section>

        {/* II — EVIDENCIA COMPARADA */}
        <section id="evidencia" className="sec">
          <Reveal><Eyebrow n="II">La evidencia comparada: qué mide y qué no</Eyebrow></Reveal>
          <Reveal delay={60}><p className="lede">{D.evidencia_chenoweth.lede}</p></Reveal>
          <Reveal delay={90}>
            <div className="panel">
              <div className="seg">
                {[["exito", "Tasa de éxito"], ["participacion", "Participación"], ["democracia", "Democracia a 5 años"]].map(([k, t]) => (
                  <button key={k} className={"seg-b" + (mChen === k ? " on" : "")} onClick={() => setMChen(k)}>{t}</button>
                ))}
              </div>
              <div className="panel-title">{chenModo.titulo}</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chenModo.data} layout="vertical" margin={{ left: 8, right: 40, top: 4, bottom: 4 }}>
                  <CartesianGrid horizontal={false} stroke={C.line} />
                  <XAxis type="number" {...axis} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="k" width={150} {...axis} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(21,122,114,.06)" }} content={<Tip unit={chenModo.unidad} note={chenModo.nota} />} />
                  <Bar dataKey="v" radius={[0, 3, 3, 0]} barSize={34} name="Valor" isAnimationActive>
                    {chenModo.data.map((d, i) => <Cell key={i} fill={TIPO_COLOR[d.tipo]} />)}
                    <LabelList dataKey="v" position="right" formatter={(v) => v + chenModo.unidad}
                      style={{ fill: C.ink, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 500 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <Src>{D.evidencia_chenoweth.fuente_nota}</Src>
            </div>
          </Reveal>
          <div className="mini-row">
            {D.evidencia_chenoweth.mini.map((m, i) => (
              <Reveal key={i} delay={i * 70} className="mini-w">
                <div className="mini"><div className="mini-n">{m.n}</div><div className="mini-t">{m.t}</div></div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* III — BAHÍA DE COCHINOS */}
        <section id="cochinos" className="sec">
          <Reveal><Eyebrow n="III">El precedente: Bahía de Cochinos, 1961</Eyebrow></Reveal>
          <div className="split">
            <Reveal className="split-l">
              <p className="lede" style={{ marginTop: 0 }}>{D.cochinos.lede}</p>
              <div className="why">
                <div className="why-h">{D.cochinos.why_titulo}</div>
                <ul>{D.cochinos.why_items.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            </Reveal>
            <Reveal delay={100} className="split-r">
              <div className="stat-stack">
                {D.cochinos.stats.map((s, i) => (
                  <div key={i} className="stat-line">
                    <Icon name={s.icon} size={18} strokeWidth={1.6} color={C.brick} />
                    <div><div className="stat-n">{s.n}</div><div className="stat-t">{s.t}</div></div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* IV — INTERVENCIONES DIRECTAS (opcional en el dataset) */}
        {D.intervenciones && (
        <section id="intervenciones" className="sec">
          <Reveal><Eyebrow n="IV">Cuando interviene una potencia: el Caribe</Eyebrow></Reveal>
          <Reveal delay={60}><p className="lede">{D.intervenciones.lede}</p></Reveal>
          <div className="cards">
            {D.intervenciones.casos.map((c, i) => (
              <Reveal key={i} delay={i * 70} className="card-w">
                <div className="card">
                  <Icon name={c.icon} size={20} strokeWidth={1.6} color={c.resultado === "democracia" ? C.teal : c.resultado === "fragil" ? C.sand : C.brick} />
                  <h3>{c.caso}</h3>
                  <div className="iv-ver" style={{ color: c.resultado === "democracia" ? C.tealDeep : c.resultado === "fragil" ? C.sand : C.brick }}>{c.veredicto}</div>
                  <p><span className="iv-k">Fuerza</span>{c.fuerza}</p>
                  <p><span className="iv-k">Después</span>{c.despues}</p>
                  <p><span className="iv-k">Coste</span>{c.coste}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}><div className="j11"><Info size={18} color={C.teal} strokeWidth={1.7} /><div>{D.intervenciones.leccion}</div></div></Reveal>
          <Src>{D.intervenciones.fuente_nota}</Src>
        </section>
        )}

        {/* IV — VÍAS DE CAMBIO */}
        <section id="vias" className="sec">
          <Reveal><Eyebrow n="V">Cómo han caído las dictaduras</Eyebrow></Reveal>
          <Reveal delay={60}><p className="lede">{D.vias_frecuencia.lede}</p></Reveal>
          <Reveal delay={90}>
            <div className="panel">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={D.vias_frecuencia.data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                  <CartesianGrid horizontal={false} stroke={C.line} />
                  <XAxis type="number" domain={[0, 100]} {...axis} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="k" width={220} {...axis} axisLine={false} tickLine={false}
                    tick={{ fill: C.ink2, fontSize: 11 }} />
                  <Tooltip cursor={{ fill: "rgba(21,122,114,.06)" }}
                    content={({ active, payload }) => active && payload && payload[0] ? (
                      <div className="tip">
                        <div className="tip-h">{payload[0].payload.k}</div>
                        <div className="tip-row"><span className="tip-k">Frecuencia relativa</span><span className="tip-v">{payload[0].value}</span></div>
                        <div className="tip-note">Ejemplo: {payload[0].payload.ej}</div>
                      </div>) : null} />
                  <Bar dataKey="v" radius={[0, 3, 3, 0]} barSize={22}>
                    {D.vias_frecuencia.data.map((d, i) => <Cell key={i} fill={TIPO_COLOR[d.tipo]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <Src>{D.vias_frecuencia.fuente_nota}</Src>
            </div>
          </Reveal>
        </section>

        {/* V — EROSIÓN ECONÓMICA */}
        <section id="erosion" className="sec">
          <Reveal><Eyebrow n="VI">El telón de fondo: erosión económica</Eyebrow></Reveal>
          <Reveal delay={60}><p className="lede">{D.erosion_economica.lede}</p></Reveal>
          <Reveal delay={90}>
            <div className="panel">
              <div className="seg">
                {[["pib", "PIB"], ["inflacion", "Inflación"], ["azucar", "Azúcar"], ["turismo", "Turismo"], ["cambio", "Peso (CUP/USD)"]].map(([k, t]) => (
                  <button key={k} className={"seg-b" + (mEcon === k ? " on" : "")} onClick={() => setMEcon(k)}>{t}</button>
                ))}
              </div>

              {mEcon === "pib" && (<>
                <div className="panel-title">{econModo.titulo}</div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={econModo.data} margin={{ left: -8, right: 8, top: 10, bottom: 4 }}>
                    <CartesianGrid vertical={false} stroke={C.line} />
                    <XAxis dataKey="year" {...axis} axisLine={false} tickLine={false} />
                    <YAxis {...axis} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "rgba(21,122,114,.06)" }} content={<Tip unit="%" note={econModo.tooltip_nota} />} />
                    <ReferenceLine y={0} stroke={C.ink3} />
                    <Bar dataKey="v" name="PIB" radius={[3, 3, 0, 0]} barSize={30}>
                      {econModo.data.map((d, i) => <Cell key={i} fill={d.v < 0 ? C.brick : C.teal} fillOpacity={d.proj ? 0.45 : 1} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <Src>{econModo.fuente_nota}</Src>
              </>)}

              {mEcon === "inflacion" && (<>
                <div className="panel-title">{econModo.titulo}</div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={econModo.data} margin={{ left: -8, right: 12, top: 10, bottom: 4 }}>
                    <CartesianGrid vertical={false} stroke={C.line} />
                    <XAxis dataKey="year" {...axis} axisLine={false} tickLine={false} />
                    <YAxis {...axis} axisLine={false} tickLine={false} />
                    <Tooltip content={<Tip unit="%" note={econModo.tooltip_nota} />} />
                    <Line type="monotone" dataKey="v" name="Inflación" stroke={C.sand} strokeWidth={2.5} dot={{ r: 4, fill: C.sand }} />
                  </LineChart>
                </ResponsiveContainer>
                <Src>{econModo.fuente_nota}</Src>
              </>)}

              {mEcon === "azucar" && (<>
                <div className="panel-title">{econModo.titulo}</div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={econModo.data} margin={{ left: 4, right: 8, top: 10, bottom: 4 }}>
                    <CartesianGrid vertical={false} stroke={C.line} />
                    <XAxis dataKey="year" {...axis} axisLine={false} tickLine={false} />
                    <YAxis {...axis} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "rgba(180,131,44,.08)" }} content={<Tip note={econModo.tooltip_nota} />} />
                    <Bar dataKey="t" name="Azúcar" fill={C.sand} radius={[3, 3, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
                <Src>{econModo.fuente_nota}</Src>
              </>)}

              {mEcon === "turismo" && (<>
                <div className="panel-title">{econModo.titulo}</div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={econModo.data} margin={{ left: -8, right: 12, top: 10, bottom: 4 }}>
                    <CartesianGrid vertical={false} stroke={C.line} />
                    <XAxis dataKey="year" {...axis} axisLine={false} tickLine={false} />
                    <YAxis {...axis} axisLine={false} tickLine={false} />
                    <Tooltip content={<Tip note={econModo.tooltip_nota} />} />
                    <Line type="monotone" dataKey="v" name="Llegadas" stroke={C.slate} strokeWidth={2.5} dot={{ r: 4, fill: C.slate }} />
                  </LineChart>
                </ResponsiveContainer>
                <Src>{econModo.fuente_nota}</Src>
              </>)}

              {mEcon === "cambio" && (<>
                <div className="panel-title">{econModo.titulo}</div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={econModo.data} margin={{ left: -8, right: 12, top: 10, bottom: 4 }}>
                    <CartesianGrid vertical={false} stroke={C.line} />
                    <XAxis dataKey="year" {...axis} axisLine={false} tickLine={false} />
                    <YAxis {...axis} axisLine={false} tickLine={false} />
                    <Tooltip content={<Tip note={econModo.tooltip_nota} />} />
                    <Line type="monotone" dataKey="oficial" name="Oficial" stroke={C.ink3} strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 4" />
                    <Line type="monotone" dataKey="informal" name="Informal" stroke={C.brick} strokeWidth={2.5} dot={{ r: 4, fill: C.brick }} />
                  </LineChart>
                </ResponsiveContainer>
                <Src>{econModo.fuente_nota}</Src>
              </>)}
            </div>
          </Reveal>
          <div className="mini-row">
            {D.erosion_economica.mini.map((m, i) => (
              <Reveal key={i} delay={i * 70} className="mini-w">
                <div className="mini"><div className="mini-n">{m.n}</div><div className="mini-t">{m.t}</div></div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* VI — ÉXODO */}
        <section id="exodo" className="sec">
          <Reveal><Eyebrow n="VII">El éxodo: presión interna hecha demografía</Eyebrow></Reveal>
          <Reveal delay={60}><p className="lede">{D.exodo.lede}</p></Reveal>
          <Reveal delay={90}>
            <div className="panel">
              <div className="seg">
                {[["poblacion", "Población"], ["emigracion", "Llegadas a EE.UU."]].map(([k, t]) => (
                  <button key={k} className={"seg-b" + (mDemo === k ? " on" : "")} onClick={() => setMDemo(k)}>{t}</button>
                ))}
              </div>
              {mDemo === "poblacion" ? (<>
                <div className="panel-title">{demoModo.titulo}</div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={demoModo.data} margin={{ left: 4, right: 12, top: 10, bottom: 4 }}>
                    <CartesianGrid vertical={false} stroke={C.line} />
                    <XAxis dataKey="year" {...axis} axisLine={false} tickLine={false} />
                    <YAxis domain={[8000, 11500]} {...axis} axisLine={false} tickLine={false} />
                    <Tooltip content={<Tip note={demoModo.tooltip_nota} />} />
                    <Line type="monotone" dataKey="onei" name="ONEI (oficial)" stroke={C.teal} strokeWidth={2.5} dot={{ r: 4, fill: C.teal }} connectNulls />
                    <Line type="monotone" dataKey="ind" name="Estimación independiente" stroke={C.brick} strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 4, fill: C.brick }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
                <Src>{demoModo.fuente_nota}</Src>
              </>) : (<>
                <div className="panel-title">{demoModo.titulo}</div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={demoModo.data} margin={{ left: -8, right: 8, top: 10, bottom: 4 }}>
                    <CartesianGrid vertical={false} stroke={C.line} />
                    <XAxis dataKey="year" {...axis} axisLine={false} tickLine={false} />
                    <YAxis {...axis} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: "rgba(178,58,43,.08)" }} content={<Tip note={demoModo.tooltip_nota} />} />
                    <Bar dataKey="v" name="Llegadas" fill={C.brick} radius={[3, 3, 0, 0]} barSize={38} />
                  </BarChart>
                </ResponsiveContainer>
                <Src>{demoModo.fuente_nota}</Src>
              </>)}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="j11">
              <Megaphone size={18} color={C.teal} strokeWidth={1.7} />
              <div><strong>11J de 2021.</strong> {D.exodo.j11_texto}</div>
            </div>
          </Reveal>
        </section>

        {/* VII — MATRIZ (SIGNATURE) */}
        <section id="matriz" className="sec">
          <Reveal><Eyebrow n="VIII">La matriz de vías: legalidad frente a eficacia</Eyebrow></Reveal>
          <Reveal delay={60}><p className="lede">{D.matriz.lede}</p></Reveal>
          <div className="matrix-wrap">
            <Reveal delay={90} className="matrix-chart">
              <div className="quad-tags">
                <span className="qt tl">Ineficaz · legal</span>
                <span className="qt tr">Eficaz · legal</span>
                <span className="qt bl">Ineficaz · ilegal</span>
                <span className="qt br">Eficaz · ilegal</span>
              </div>
              <ResponsiveContainer width="100%" height={380}>
                <ScatterChart margin={{ left: 6, right: 16, top: 16, bottom: 28 }}>
                  <ReferenceArea x1={50} x2={100} y1={50} y2={100} fill={C.teal} fillOpacity={0.05} />
                  <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill={C.brick} fillOpacity={0.05} />
                  <CartesianGrid stroke={C.line} />
                  <XAxis type="number" dataKey="x" domain={[0, 100]} {...axis} axisLine={false} tickLine={false}
                    label={{ value: "Legalidad · bajo riesgo penal →", position: "bottom", offset: 6, fill: C.ink3, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }} />
                  <YAxis type="number" dataKey="y" domain={[0, 100]} {...axis} axisLine={false} tickLine={false}
                    label={{ value: "Eficacia →", angle: -90, position: "insideLeft", fill: C.ink3, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }} />
                  <ZAxis type="number" dataKey="r" range={[120, 900]} />
                  <ReferenceLine x={50} stroke={C.line2} strokeDasharray="4 4" />
                  <ReferenceLine y={50} stroke={C.line2} strokeDasharray="4 4" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }) => active && payload && payload[0] ? (
                      <div className="tip">
                        <div className="tip-h">{payload[0].payload.name}</div>
                        <div className="tip-row"><span className="tip-k">Legalidad</span><span className="tip-v">{payload[0].payload.x}/100</span></div>
                        <div className="tip-row"><span className="tip-k">Eficacia</span><span className="tip-v">{payload[0].payload.y}/100</span></div>
                        <div className="tip-row"><span className="tip-k">Riesgo</span><span className="tip-v">{payload[0].payload.r}/100</span></div>
                      </div>) : null} />
                  <Scatter data={D.matriz.data} onClick={(d) => setSel(d)} cursor="pointer">
                    {D.matriz.data.map((d, i) => (
                      <Cell key={i} fill={GRP_COLOR[d.grp]}
                        fillOpacity={sel && sel.name === d.name ? 0.95 : 0.55}
                        stroke={sel && sel.name === d.name ? C.ink : "transparent"} strokeWidth={1.5} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </Reveal>
            <Reveal delay={140} className="matrix-detail">
              <div className="md-eyebrow">Selección</div>
              <div className="md-name" style={{ color: sel.grp === "armada" ? C.brick : C.tealDeep }}>{sel.name}</div>
              <div className="md-bars">
                {[["Legalidad", sel.x, C.teal], ["Eficacia histórica", sel.y, C.slate], ["Riesgo al participante", sel.r, C.brick]].map(([k, v, col], i) => (
                  <div key={i} className="md-bar">
                    <div className="md-bar-h"><span>{k}</span><span>{v}/100</span></div>
                    <div className="md-track"><div className="md-fill" style={{ width: v + "%", background: col }} /></div>
                  </div>
                ))}
              </div>
              <div className="md-note">
                {sel.grp === "armada" ? D.matriz.nota_armada : D.matriz.nota_novional}
              </div>
              <div className="md-list">
                {D.matriz.data.map((d, i) => (
                  <button key={i} className={"md-chip" + (sel.name === d.name ? " on" : "")}
                    style={{ borderColor: sel.name === d.name ? GRP_COLOR[d.grp] : C.line2 }}
                    onClick={() => setSel(d)}>
                    {d.grp === "armada" ? <Flame size={12} /> : <Handshake size={12} />}
                    {d.name}
                  </button>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* VIII — SÍNTESIS */}
        <section id="sintesis" className="sec">
          <Reveal><Eyebrow n="IX">Síntesis</Eyebrow></Reveal>
          <Reveal delay={60}>
            <div className="synth">
              {D.sintesis.parrafos.map((p, i) => <p key={i}>{p}</p>)}
              <div className="synth-tags">
                {D.sintesis.tags.map((t, i) => (
                  <span key={i}><Icon name={t.icon} size={13} />{t.texto}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <footer className="foot">
          <div className="foot-note">{D.footer.nota}</div>
          <div className="foot-src"><span className="foot-k">Fuentes</span>{D.footer.fuentes_texto}</div>
        </footer>
      </main>
    </div>
  );
}

/* ============================ CSS ============================ */
const CSS = `
@import url('${FUENTES_URL}');

.root{ --paper:${C.paper}; --paper2:${C.paper2}; --ink:${C.ink}; --ink2:${C.ink2}; --ink3:${C.ink3}; --line:${C.line}; --line2:${C.line2}; --teal:${C.teal}; --brick:${C.brick};
  background:transparent; color:var(--ink); font-family:'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif; -webkit-font-smoothing:antialiased; line-height:1.55; }
.root *{ box-sizing:border-box; }
.root a{ color:inherit; text-decoration:none; }

/* NAV */
.nav{ position:sticky; top:0; z-index:40; display:flex; align-items:center; justify-content:space-between;
  padding:11px 24px; background:rgba(239,232,223,.86); backdrop-filter:blur(10px); border-bottom:1px solid var(--line); }
.nav-mark{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.14em; color:var(--ink2); }
.nav-links{ display:flex; gap:16px; flex-wrap:wrap; }
.nav-links a{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:.04em; color:var(--ink3); transition:color .2s; }
.nav-links a:hover{ color:var(--teal); }

/* HERO */
.hero{ position:relative; background:transparent; color:var(--ink); overflow:hidden; padding:76px 24px 68px; }
.hero-grid{ position:absolute; inset:0; background-image:linear-gradient(${"rgba(60,40,20,.06)"} 1px,transparent 1px),linear-gradient(90deg,${"rgba(60,40,20,.06)"} 1px,transparent 1px); background-size:46px 46px; mask-image:radial-gradient(ellipse 80% 70% at 30% 20%,#000 40%,transparent 100%); }
.hero-in{ position:relative; max-width:1080px; margin:0 auto; }
.hero-eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:.16em; text-transform:uppercase; color:#6b5d50; margin-bottom:22px; }
.hero-h{ font-family:'Manrope',sans-serif; font-weight:800; font-size:clamp(30px,5.4vw,60px); line-height:1.06; letter-spacing:-.01em; margin:0 0 22px; max-width:16ch; }
.hero-em{ font-style:italic; color:${C.teal}; }
.hero-sub{ max-width:62ch; font-size:clamp(15px,1.5vw,17px); color:#4a3f36; margin:0 0 34px; }
.hero-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:0; border-top:1px solid rgba(60,40,20,.15); }
.hs{ padding:20px 20px 4px 0; border-right:1px solid rgba(60,40,20,.12); }
.hs:last-child{ border-right:0; }
.hs-n{ font-family:'Manrope',sans-serif; font-weight:800; font-size:clamp(30px,4vw,44px); line-height:1; color:${C.teal}; }
.hs-n span{ font-size:.55em; color:#6b5d50; margin-left:2px; }
.hs-l{ font-size:12px; color:#6b5d50; margin-top:8px; max-width:20ch; }

/* MAIN */
.main{ max-width:1080px; margin:0 auto; padding:0 24px; }
.sec{ padding:64px 0; border-bottom:1px solid var(--line); }
.sec:last-of-type{ border-bottom:0; }

.eyebrow{ display:flex; align-items:center; gap:14px; margin-bottom:20px; font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink2); }
.eyebrow-n{ font-family:'Manrope',sans-serif; font-weight:800; font-size:22px; font-style:italic; color:var(--teal); letter-spacing:0; text-transform:none; }
.eyebrow-rule{ width:26px; height:1px; background:var(--line2); }

.lede{ font-family:'Manrope',sans-serif; font-size:clamp(18px,2vw,21px); line-height:1.5; color:var(--ink); max-width:66ch; margin:0 0 30px; font-weight:400; }

/* CARDS */
.cards{ display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-bottom:28px; }
.card-w{ height:100%; }
.card{ height:100%; background:var(--paper2); border:1px solid transparent; box-shadow:var(--y-shadow); border-radius:24px; padding:22px; transition:transform .25s,border-color .25s; }
.card:hover{ transform:translateY(-2px); border-color:var(--teal); }
.card h3{ font-family:'Manrope',sans-serif; font-weight:700; font-size:18px; margin:12px 0 8px; }
.card p{ font-size:14px; color:var(--ink2); margin:0; }
.card p + p{ margin-top:10px; }
.iv-ver{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:.06em; text-transform:uppercase; margin:0 0 12px; }
.iv-k{ display:block; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink3); margin-bottom:2px; }

/* FLOW */
.flow{ display:flex; align-items:stretch; gap:10px; flex-wrap:wrap; }
.flow-step{ flex:1; min-width:200px; background:var(--paper2); border:1px solid var(--line); border-left:3px solid var(--brick); border-radius:16px; padding:14px 16px; font-size:14px; color:var(--ink); }
.flow-k{ display:block; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink3); margin-bottom:6px; }
.flow-arrow{ align-self:center; color:var(--ink3); flex:none; }

/* PANEL */
.panel{ background:var(--paper2); border:0; box-shadow:var(--y-shadow); border-radius:24px; padding:20px 20px 14px; }
.panel-title{ font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:.04em; color:var(--ink2); margin:6px 0 14px; }
.seg{ display:inline-flex; flex-wrap:wrap; gap:4px; background:var(--paper); border:1px solid var(--line); border-radius:999px; padding:4px; margin-bottom:6px; }
.seg-b{ font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:.02em; color:var(--ink2); background:transparent; border:0; padding:7px 13px; border-radius:999px; cursor:pointer; transition:background .2s,color .2s; }
.seg-b:hover{ color:var(--ink); }
.seg-b.on{ background:#3a2418; color:#fcf9f4; }

/* SOURCE */
.src{ display:flex; align-items:flex-start; gap:6px; font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--ink3); margin-top:12px; padding-top:12px; border-top:1px solid var(--line); }
.src svg{ margin-top:2px; flex:none; }

/* TOOLTIP */
.tip{ background:#3a2418; color:#fcf9f4; border-radius:12px; padding:10px 12px; box-shadow:0 8px 24px rgba(40,25,10,.22); max-width:240px; }
.tip-h{ font-family:'Manrope',sans-serif; font-weight:700; font-size:14px; margin-bottom:7px; line-height:1.3; }
.tip-row{ display:flex; align-items:center; gap:8px; font-size:12px; margin:3px 0; }
.tip-dot{ width:8px; height:8px; border-radius:2px; flex:none; }
.tip-k{ color:#e3d3c3; }
.tip-v{ margin-left:auto; font-family:'IBM Plex Mono',monospace; font-weight:500; }
.tip-note{ font-size:11px; color:#c9a893; margin-top:7px; padding-top:7px; border-top:1px solid rgba(252,249,244,.16); line-height:1.4; }

/* MINI STATS */
.mini-row{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:22px; }
.mini-w{ height:100%; }
.mini{ height:100%; padding:20px; background:var(--paper2); border:1px solid var(--line); border-top:2px solid var(--teal); border-radius:16px; }
.mini-n{ font-family:'Manrope',sans-serif; font-weight:800; font-size:34px; line-height:1; color:var(--teal); margin-bottom:10px; }
.mini-t{ font-size:13.5px; color:var(--ink2); }

/* SPLIT (COCHINOS) */
.split{ display:grid; grid-template-columns:1.5fr 1fr; gap:26px; align-items:start; }
.why{ background:var(--paper2); border:0; box-shadow:var(--y-shadow); border-radius:24px; padding:18px 20px; }
.why-h{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--brick); margin-bottom:10px; }
.why ul{ margin:0; padding-left:18px; }
.why li{ font-size:14px; color:var(--ink2); margin:7px 0; }
.stat-stack{ display:flex; flex-direction:column; gap:0; border:1px solid var(--line); border-radius:24px; overflow:hidden; }
.stat-line{ display:flex; align-items:center; gap:14px; padding:18px 20px; background:var(--paper2); border-bottom:1px solid var(--line); }
.stat-line:last-child{ border-bottom:0; }
.stat-n{ font-family:'Manrope',sans-serif; font-weight:800; font-size:24px; line-height:1.1; }
.stat-t{ font-size:12.5px; color:var(--ink3); }

/* J11 */
.j11{ display:flex; gap:14px; align-items:flex-start; margin-top:22px; padding:18px 20px; background:var(--paper2); border:1px solid var(--line); border-left:3px solid var(--teal); border-radius:16px; font-size:14.5px; color:var(--ink2); }
.j11 svg{ flex:none; margin-top:2px; }
.j11 strong{ color:var(--ink); }

/* MATRIX */
.matrix-wrap{ display:grid; grid-template-columns:1.15fr .85fr; gap:20px; align-items:start; }
.matrix-chart{ position:relative; background:var(--paper2); border:0; box-shadow:var(--y-shadow); border-radius:24px; padding:16px 12px 8px; }
.quad-tags{ position:absolute; inset:20px 22px 46px 46px; pointer-events:none; z-index:2; }
.qt{ position:absolute; font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.06em; color:var(--ink3); text-transform:uppercase; }
.qt.tl{ top:0; left:0; } .qt.tr{ top:0; right:0; } .qt.bl{ bottom:0; left:0; } .qt.br{ bottom:0; right:0; }
.matrix-detail{ background:var(--paper2); border:0; box-shadow:var(--y-shadow); border-radius:24px; padding:22px; }
.md-eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink3); margin-bottom:8px; }
.md-name{ font-family:'Manrope',sans-serif; font-weight:700; font-size:22px; line-height:1.2; margin-bottom:18px; }
.md-bars{ display:flex; flex-direction:column; gap:13px; margin-bottom:16px; }
.md-bar-h{ display:flex; justify-content:space-between; font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--ink2); margin-bottom:5px; }
.md-track{ height:7px; background:var(--paper); border-radius:4px; overflow:hidden; border:1px solid var(--line); }
.md-fill{ height:100%; border-radius:4px; transition:width .5s cubic-bezier(.2,.7,.2,1); }
.md-note{ font-size:13px; color:var(--ink2); line-height:1.5; padding-top:14px; border-top:1px solid var(--line); margin-bottom:14px; }
.md-list{ display:flex; flex-wrap:wrap; gap:6px; }
.md-chip{ display:inline-flex; align-items:center; gap:5px; font-size:11px; color:var(--ink2); background:var(--paper); border:1px solid var(--line2); border-radius:20px; padding:5px 10px; cursor:pointer; transition:all .2s; text-align:left; line-height:1.2; }
.md-chip:hover{ color:var(--ink); }
.md-chip.on{ color:var(--ink); background:#fcf9f4; }
.md-chip svg{ flex:none; }

/* SYNTH */
.synth p{ font-family:'Manrope',sans-serif; font-size:clamp(17px,1.8vw,20px); line-height:1.55; color:var(--ink); max-width:70ch; margin:0 0 18px; }
.synth-tags{ display:flex; flex-wrap:wrap; gap:8px; margin-top:24px; }
.synth-tags span{ display:inline-flex; align-items:center; gap:7px; font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--tealDeep); background:var(--paper2); border:1px solid var(--line); border-radius:20px; padding:8px 14px; }
.synth-tags svg{ color:var(--teal); }

/* FOOT */
.foot{ padding:40px 0 60px; }
.foot-note{ font-size:12.5px; color:var(--ink3); max-width:74ch; margin-bottom:18px; line-height:1.6; }
.foot-src{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--ink3); line-height:1.7; }
.foot-k{ display:inline-block; color:var(--ink2); letter-spacing:.1em; text-transform:uppercase; margin-right:10px; }

/* RESPONSIVE */
@media (max-width:820px){
  .hero-stats{ grid-template-columns:repeat(2,1fr); }
  .hs{ border-right:0; border-bottom:1px solid rgba(60,40,20,.12); }
  .cards,.mini-row,.split,.matrix-wrap{ grid-template-columns:1fr; }
  .nav-links{ display:none; }
  .quad-tags{ inset:16px 18px 42px 42px; }
}
@media (prefers-reduced-motion:reduce){ *{ animation:none!important; transition:none!important; } }
`;
