import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, LabelList,
} from "recharts";

/* =========================================================================
   EL RÁPIDO ENVEJECIMIENTO POBLACIONAL Y LA DIÁSPORA EN CUBA
   renderer congelado (frozen). Todo el contenido variable vive en
   envejecimiento.json. Aquí solo geometría, paleta y lógica de render.
   Paleta "Nido vacío": violeta-índigo (ocaso) + verde musgo (patio vacío).
   ========================================================================= */

const C = {
  bg: "#141225",
  bg2: "#1b1836",
  panel: "#201c3d",
  line: "#37325a",
  ink: "#f1eefa",
  mut: "#948bb5",
  violeta: "#A666D6",
  musgo: "#78AD52",
  alerta: "#D9A441",
  coral: "#DD6B5B",
};

const F = {
  disp: "'Archivo', 'Arial Black', sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
  body: "'Archivo', 'Helvetica Neue', Arial, sans-serif",
};

const NIVEL_COLOR = { confirmado: C.musgo, reportado: C.alerta, estimado: C.coral };
const NIVEL_LABEL = { confirmado: "confirmado", reportado: "reportado", estimado: "estimado" };

/* Data incrustada: fallback para previsualización, espejo byte a byte de
   public/data/envejecimiento.json. En producción el fetch o la prop `data`
   la sobrescriben; el renderer sigue congelado. */
const DATOS = {
  "meta": {
    "slug": "envejecimiento",
    "titulo": "El rápido envejecimiento poblacional y la diáspora en Cuba",
    "subtitulo": "Cómo el éxodo migratorio deformó la pirámide poblacional cubana, comparado con un escenario sin él",
    "descripcion": "Cuba atraviesa la crisis demográfica más aguda de América Latina: envejecimiento acelerado, natalidad en mínimos históricos y un éxodo migratorio que golpea, sobre todo, a la población en edad laboral y reproductiva. Según la Oficina Nacional de Estadísticas e Información (ONEI), la población residente cayó a 9.748.532 habitantes a finales de 2024, y a un estimado de alrededor de 9,4 millones hacia finales de 2025: un descenso sostenido por cuarto año consecutivo. El demógrafo independiente Juan Carlos Albizu-Campos sitúa la población efectiva muy por debajo de esa cifra oficial: 8,62 millones en 2023 y 8,025 millones en 2024, una divergencia de método (población de derecho frente a población efectivamente presente en la isla) que conviene no leer como un error, sino como dos formas distintas de contar.\n\nEl motor central es la emigración. Desde octubre de 2021, más de 850.000 cubanos han llegado a Estados Unidos según datos de la Oficina de Aduanas y Protección Fronteriza (CBP), con picos entre 2022 y 2023; sumando otros destinos, el total migratorio ronda o supera el millón, aunque no existe una fuente única que consolide esa cifra global con precisión. Las mujeres representan entre el 56% y el 57% de quienes emigran, y buena parte del éxodo se concentra en población en edad laboral y reproductiva, lo que erosiona a la vez la base de nacimientos y la fuerza de trabajo activa.\n\nEl resultado es una pirámide poblacional que se invierte con rapidez. El grupo de 60 años o más alcanzó el 25,7% de la población en 2024 (frente al 19,4% de 2015), la proporción más alta de América Latina y el Caribe, y la mediana de edad llegó a 42,2 años. En paralelo, la natalidad se desploma: 2025 cerró con 68.051 nacimientos frente a 134.354 defunciones —casi el doble—, un saldo natural negativo superior a 66.000 personas y una tasa de fecundidad de 1,45 hijos por mujer, muy por debajo del nivel de reemplazo (2,1). Naciones Unidas proyecta que, de continuar la tendencia, la población cubana podría rondar los 5,6 millones hacia el año 2100; para 2050 las proyecciones son más dispersas, entre 7 y 9,4 millones según la fuente, con el grupo de 60 años o más acercándose a un tercio de la población.\n\nEsta transformación golpea directamente a dos sistemas: pensiones y salud. La pensión mínima, elevada a 4.000 pesos cubanos (CUP) desde septiembre de 2025, equivale a entre 7 y 10 dólares al cambio informal, frente a una canasta de bienes y servicios de referencia que estudios académicos sitúan entre 50.000 y 96.000 CUP mensuales por persona. Una encuesta de la Asociación Sindical Independiente de Cuba (ASIC, 506 personas, no representativa a escala nacional) encontró que el 99% de sus encuestados no cubre con su pensión ni alimentación, ni vivienda ni medicamentos. En salud, más de 77.000 profesionales emigraron entre 2021 y 2024, y la cantidad de médicos cayó cerca de un 30%, de 104 a 131 habitantes por médico.\n\nEl expediente incluye también un ejercicio contrafactual explícitamente hipotético: cómo luciría la pirámide poblacional sin el éxodo migratorio posterior a 2021. No es una proyección demográfica oficial ni una medición, sino una forma de dimensionar cuánto de la crisis actual es tendencia de fondo (baja fecundidad desde los años setenta) y cuánto es aceleración por la salida masiva y reciente de población joven.",
    "narracion": "Cuba envejece más rápido que ningún otro país de América Latina, mientras se vacía de gente joven. La población oficial cayó a nueve millones setecientos cuarenta y ocho mil habitantes a finales de dos mil veinticuatro, y ronda los nueve millones cuatrocientos mil hacia finales de dos mil veinticinco. Un demógrafo independiente calcula una cifra aún menor: ocho millones de habitantes en dos mil veinticuatro.\n\nEl motor es la emigración: desde dos mil veintiuno, más de ochocientos cincuenta mil cubanos llegaron a Estados Unidos, y más de la mitad de quienes emigran son mujeres. Se van, sobre todo, los más jóvenes y quienes están en edad de trabajar y de tener hijos.\n\nEl resultado: uno de cada cuatro cubanos tiene sesenta años o más, la proporción más alta de la región. La edad mediana llega a cuarenta y dos años. Nacen menos de setenta mil niños al año, frente a más de ciento treinta y cuatro mil muertes: casi el doble.\n\nNaciones Unidas proyecta que Cuba podría tener solo cinco millones seiscientos mil habitantes hacia el año dos mil cien.\n\nLa pensión mínima cubre apenas una fracción de la canasta básica real, y más de setenta y siete mil profesionales de salud emigraron en cuatro años. Este expediente muestra, con datos verificados, cómo se deforma la pirámide poblacional cubana, y la compara con un escenario hipotético: el que existiría sin el éxodo masivo de la última década.",
    "fecha_publicacion": "2026-07-19",
    "fuentes": [
      "ONEI (Oficina Nacional de Estadísticas e Información) — Anuario Demográfico y notas oficiales",
      "Oficina de Aduanas y Protección Fronteriza de EE. UU. (CBP)",
      "Naciones Unidas — División de Población (World Population Prospects)",
      "Juan Carlos Albizu-Campos (demógrafo independiente), citado por 14ymedio, Martí Noticias y Diario de Cuba",
      "Asociación Sindical Independiente de Cuba (ASIC)",
      "Prensa independiente y agencias: Infobae, El País, CubaConecta, elTOQUE, CiberCuba"
    ],
    "sistema_confianza": {
      "confirmado": "Cifra oficial o de fuente primaria (ONEI, CBP, ONU) cotejada directamente.",
      "reportado": "Ampliamente citada por prensa independiente o estudios académicos, sin una única fuente primaria consolidada.",
      "estimado": "Proyección, extrapolación o cálculo ilustrativo; no es una medición."
    },
    "notas_metodologicas": [
      "La cifra de 'canasta básica' de 12.000 CUP mencionada en el envío original subestima gravemente el coste real: estudios académicos la sitúan entre 50.000 y 96.000 CUP/mes; este expediente usa esos valores.",
      "El hallazgo de que el 99% de los jubilados no cubre sus necesidades básicas proviene de una encuesta de la ASIC con 506 respuestas: no es representativa a escala nacional y se presenta siempre con esa salvedad.",
      "La 'mediana de edad más alta' de Cuba se acota a América Latina y el Caribe: no se pudo verificar la comparación con el conjunto de las Américas (incluidos EE. UU., Canadá y Puerto Rico).",
      "El escenario 'sin el éxodo masivo post-2021' es un ejercicio contrafactual hipotético, no una medición ni una proyección oficial: ilustra magnitud, no certeza.",
      "La pirámide de edades se construye como modelo ilustrativo, calibrado sobre los porcentajes de población de 60 años o más y la mediana de edad verificados por ONEI; no reproduce el detalle quinquenal exacto del anuario demográfico.",
      "La escasez del 70% de medicamentos esenciales es una cifra ampliamente repetida en el discurso público, pero no se localizó una fuente primaria que la sustente en esta verificación; se marca como estimada."
    ],
    "tesis_confianza": [
      { "afirmacion": "Población residente cayó a 9.748.532 a finales de 2024 (ONEI)", "nivel": "confirmado" },
      { "afirmacion": "Estimación independiente de Albizu-Campos: 8,025 millones en 2024", "nivel": "reportado" },
      { "afirmacion": "60 años o más = 25,7% de la población en 2024, la más alta de América Latina y el Caribe", "nivel": "confirmado" },
      { "afirmacion": "68.051 nacimientos y 134.354 defunciones en 2025 (saldo -66.303)", "nivel": "confirmado" },
      { "afirmacion": "Proyección ONU de ~5,6 millones de habitantes hacia 2100", "nivel": "confirmado" },
      { "afirmacion": "Proyección de 30-36% de personas de 60+ hacia 2050 y población de 7-9,4 millones", "nivel": "estimado" },
      { "afirmacion": "Escasez del 70% de medicamentos esenciales", "nivel": "estimado" },
      { "afirmacion": "Escenario contrafactual sin éxodo post-2021 (10,5-11 millones en 2025-26)", "nivel": "estimado" }
    ]
  },
  "piramide": {
    "advertencia": "Modelo ilustrativo calibrado sobre los porcentajes de personas de 60 años o más y la mediana de edad verificados por ONEI; no reproduce el detalle quinquenal exacto del anuario demográfico.",
    "escenarios": [
      {
        "id": "real",
        "nombre": "Trayectoria observada",
        "anclas": [
          {
            "anio": 2025, "confianza": "confirmado",
            "nota": "Cifra ONEI de cierre de 2024 (9.748.532), usada como año base del modelo.",
            "poblacion_total": 9748532, "pct_60_mas": 25.7, "mediana_edad": 42.2,
            "grupos": [
              { "edad": "0-9", "hombres": 5.61, "mujeres": 5.39 },
              { "edad": "10-19", "hombres": 6.38, "mujeres": 6.12 },
              { "edad": "20-29", "hombres": 6.5, "mujeres": 6.5 },
              { "edad": "30-39", "hombres": 7.44, "mujeres": 8.06 },
              { "edad": "40-49", "hombres": 6.0, "mujeres": 6.5 },
              { "edad": "50-59", "hombres": 4.61, "mujeres": 5.19 },
              { "edad": "60-69", "hombres": 6.3, "mujeres": 7.7 },
              { "edad": "70-79", "hombres": 3.36, "mujeres": 4.64 },
              { "edad": "80+", "hombres": 1.41, "mujeres": 2.29 }
            ]
          },
          {
            "anio": 2050, "confianza": "estimado",
            "nota": "Población 2050: rango 7-9,4 millones según la fuente; 60+ rango 30-36% (una cifra de 39,7% citada en el envío original no se pudo confirmar).",
            "poblacion_total": 8300000, "pct_60_mas": 33.0, "mediana_edad": 48.0,
            "grupos": [
              { "edad": "0-9", "hombres": 4.08, "mujeres": 3.92 },
              { "edad": "10-19", "hombres": 4.33, "mujeres": 4.17 },
              { "edad": "20-29", "hombres": 4.75, "mujeres": 4.75 },
              { "edad": "30-39", "hombres": 5.28, "mujeres": 5.72 },
              { "edad": "40-49", "hombres": 6.0, "mujeres": 6.5 },
              { "edad": "50-59", "hombres": 8.22, "mujeres": 9.28 },
              { "edad": "60-69", "hombres": 8.1, "mujeres": 9.9 },
              { "edad": "70-79", "hombres": 4.41, "mujeres": 6.09 },
              { "edad": "80+", "hombres": 1.71, "mujeres": 2.79 }
            ]
          }
        ]
      },
      {
        "id": "contrafactual",
        "nombre": "Sin el éxodo masivo post-2021 (hipotético)",
        "advertencia": "Ejercicio ilustrativo del análisis original, no una proyección demográfica oficial ni una medición.",
        "anclas": [
          {
            "anio": 2025, "confianza": "estimado",
            "poblacion_total": 10800000, "pct_60_mas": 21.0, "mediana_edad": 39.0,
            "grupos": [
              { "edad": "0-9", "hombres": 6.12, "mujeres": 5.88 },
              { "edad": "10-19", "hombres": 6.63, "mujeres": 6.37 },
              { "edad": "20-29", "hombres": 7.25, "mujeres": 7.25 },
              { "edad": "30-39", "hombres": 8.16, "mujeres": 8.84 },
              { "edad": "40-49", "hombres": 6.24, "mujeres": 6.76 },
              { "edad": "50-59", "hombres": 4.46, "mujeres": 5.04 },
              { "edad": "60-69", "hombres": 5.4, "mujeres": 6.6 },
              { "edad": "70-79", "hombres": 2.73, "mujeres": 3.77 },
              { "edad": "80+", "hombres": 0.95, "mujeres": 1.55 }
            ]
          },
          {
            "anio": 2050, "confianza": "estimado",
            "poblacion_total": 10300000, "pct_60_mas": 26.0, "mediana_edad": 45.0,
            "grupos": [
              { "edad": "0-9", "hombres": 4.84, "mujeres": 4.66 },
              { "edad": "10-19", "hombres": 5.36, "mujeres": 5.14 },
              { "edad": "20-29", "hombres": 5.75, "mujeres": 5.75 },
              { "edad": "30-39", "hombres": 7.68, "mujeres": 8.32 },
              { "edad": "40-49", "hombres": 6.24, "mujeres": 6.76 },
              { "edad": "50-59", "hombres": 6.34, "mujeres": 7.16 },
              { "edad": "60-69", "hombres": 6.53, "mujeres": 7.98 },
              { "edad": "70-79", "hombres": 3.57, "mujeres": 4.93 },
              { "edad": "80+", "hombres": 1.14, "mujeres": 1.86 }
            ]
          }
        ]
      }
    ]
  },
  "serie_poblacion": {
    "advertencia": "Serie deliberadamente dispersa: solo se incluyen los años con cifra corroborada o bien reportada. El tramo 2025-2100 es proyección, marcada con línea punteada en el renderer.",
    "oficial": [
      { "anio": 2020, "valor": 11300000, "confianza": "reportado" },
      { "anio": 2024, "valor": 9748532, "confianza": "confirmado" },
      { "anio": 2025, "valor": 9400000, "confianza": "reportado" },
      { "anio": 2050, "valor": 8300000, "confianza": "estimado" },
      { "anio": 2100, "valor": 5600000, "confianza": "confirmado" }
    ],
    "estimacion_independiente": [
      { "anio": 2023, "valor": 8620000, "confianza": "reportado" },
      { "anio": 2024, "valor": 8025000, "confianza": "reportado" }
    ]
  },
  "natalidad_mortalidad": {
    "serie": [
      { "anio": 2024, "nacimientos": 71358, "defunciones": 130000, "confianza_defunciones": "reportado", "confianza_nacimientos": "confirmado" },
      { "anio": 2025, "nacimientos": 68051, "defunciones": 134354, "confianza_defunciones": "confirmado", "confianza_nacimientos": "confirmado" }
    ],
    "saldo_natural_2025": -66303,
    "tasa_fecundidad": { "valor": 1.45, "nivel_reemplazo": 2.1, "anio": 2024, "confianza": "reportado" }
  },
  "pensiones": {
    "jubilados_total": 1774310,
    "pct_poblacion": 18.9,
    "confianza_jubilados": "reportado",
    "pension_minima_cup": 4000,
    "pension_minima_usd_informal_min": 7,
    "pension_minima_usd_informal_max": 10,
    "vigente_desde": "2025-09",
    "confianza_pension_minima": "confirmado",
    "canasta_basica_cup_min": 50157,
    "canasta_basica_cup_max": 96060,
    "confianza_canasta": "reportado",
    "cobertura_pct_min": 4.2,
    "cobertura_pct_max": 8.0,
    "encuesta_asic": {
      "n": 506, "pct_no_cubre": 99, "fecha": "2025-09",
      "advertencia": "Encuesta de la Asociación Sindical Independiente de Cuba (ASIC): 506 respuestas, no representativa a escala nacional."
    }
  },
  "salud": {
    "profesionales_emigrados_2021_2024": 77522,
    "confianza_profesionales": "confirmado",
    "medicos_2021": 106131,
    "medicos_2024": 75364,
    "caida_pct": 29,
    "habitantes_por_medico_2021": 104,
    "habitantes_por_medico_2024": 131,
    "confianza_medicos": "confirmado",
    "escasez_medicamentos_pct": 70,
    "confianza_escasez": "estimado"
  },
  "contrafactual": {
    "titulo": "La pirámide sin el éxodo",
    "advertencia": "Ejercicio hipotético del análisis original: no es una proyección demográfica oficial ni una medición.",
    "parrafos": [
      "Sin el éxodo masivo posterior a 2021 (o limitándolo a niveles históricos, como el Mariel o los balseros de los años noventa), la población cubana en 2025-2026 podría rondar los 10,5-11 millones de habitantes, frente a los cerca de 9,4 millones observados.",
      "El envejecimiento seguiría produciéndose, porque la baja fecundidad viene de los años setenta, pero de forma más lenta: el grupo de 60 años o más crecería con menos velocidad y la base de población en edad laboral se mantendría más ancha.",
      "Esta comparación no mide un futuro alternativo real: ilustra, a partir de las mismas magnitudes verificadas (edad y sexo de quienes emigran, tamaño del éxodo), cuánto de la crisis demográfica actual es tendencia estructural y cuánto es aceleración por la salida masiva y reciente de población joven."
    ]
  },
  "encuesta": {
    "titulo": "Tu lectura",
    "intro": "Este expediente trata, en el fondo, de una isla que envejece mientras se vacía de gente joven. Vota: los resultados se comparan con los de otros lectores.",
    "tabla_supabase": "votos_envejecimiento",
    "rpc_incrementar": "incrementar_voto",
    "preguntas": [
      {
        "id": "causa_principal",
        "texto": "¿Cuál crees que es el principal motor de la crisis demográfica cubana?",
        "opciones": [
          { "id": "exodo", "texto": "El éxodo migratorio masivo" },
          { "id": "natalidad", "texto": "La caída sostenida de la natalidad" },
          { "id": "economia", "texto": "La crisis económica que empuja ambas cosas" },
          { "id": "tendencia", "texto": "Una tendencia demográfica que ya venía de antes" }
        ]
      },
      {
        "id": "reversibilidad",
        "texto": "¿Es reversible esta inversión de la pirámide poblacional en las próximas dos décadas?",
        "opciones": [
          { "id": "si", "texto": "Sí, con políticas adecuadas" },
          { "id": "no", "texto": "No, ya es estructural" },
          { "id": "parcial", "texto": "Parcialmente, pero con un coste alto" }
        ]
      },
      {
        "id": "prioridad",
        "texto": "¿Qué debería priorizar el Estado cubano ante este escenario?",
        "opciones": [
          { "id": "pensiones", "texto": "Reformar el sistema de pensiones" },
          { "id": "salud", "texto": "Retener al personal de salud" },
          { "id": "incentivos", "texto": "Incentivos a la natalidad" },
          { "id": "retorno", "texto": "Políticas de retorno migratorio" }
        ]
      }
    ]
  }
};

/* ---------- helpers ---------- */
const fmt = (n) => new Intl.NumberFormat("es-ES").format(Math.round(n));
const fmtM = (n) => (n / 1e6).toFixed(2).replace(".", ",") + " M";
const lerp = (a, b, t) => a + (b - a) * t;

function Badge({ nivel }) {
  const col = NIVEL_COLOR[nivel] || C.mut;
  return (
    <span style={{ fontFamily: F.mono, fontSize: 10.5, color: col, border: `1px solid ${col}`, borderRadius: 20, padding: "2px 8px", letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {NIVEL_LABEL[nivel] || nivel}
    </span>
  );
}

function Eyebrow({ n, children, color = C.violeta }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <span style={{ fontFamily: F.mono, fontSize: 12, color, letterSpacing: 2, border: `1px solid ${color}`, borderRadius: 2, padding: "2px 7px" }}>{n}</span>
      <span style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, letterSpacing: 3, textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

function H({ children, size = 30 }) {
  return <h2 style={{ fontFamily: F.disp, fontWeight: 800, fontSize: size, lineHeight: 1.05, color: C.ink, margin: "0 0 16px", letterSpacing: -0.5 }}>{children}</h2>;
}

function P({ children, style }) {
  return <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.62, color: "#d5d0e6", margin: "0 0 14px", ...style }}>{children}</p>;
}

function Section({ children, style }) {
  return <section style={{ maxWidth: 960, margin: "0 auto", padding: "56px 22px", ...style }}>{children}</section>;
}

function Card({ children, style }) {
  return <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: 18, ...style }}>{children}</div>;
}

const tipStyle = { background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 4, fontFamily: F.mono, fontSize: 12, color: C.ink };

/* ============================ HERO ============================ */
function Hero({ meta }) {
  return (
    <header style={{ maxWidth: 960, margin: "0 auto", padding: "72px 22px 20px" }}>
      <div style={{ fontFamily: F.mono, fontSize: 12, color: C.mut, letterSpacing: 2, marginBottom: 20, display: "flex", gap: 14, flexWrap: "wrap" }}>
        <span style={{ color: C.violeta }}>DEMOGRAFÍA · DIÁSPORA</span><span style={{ color: C.line }}>|</span>
        <span>PUBLICADO {meta.fecha_publicacion}</span>
      </div>
      <h1 style={{ fontFamily: F.disp, fontWeight: 800, fontSize: "clamp(36px, 7.5vw, 68px)", lineHeight: 1.02, color: C.ink, margin: "0 0 8px", letterSpacing: -1 }}>
        {meta.titulo}
      </h1>
      <p style={{ fontFamily: F.body, fontSize: 19, lineHeight: 1.5, color: "#cabfe0", maxWidth: 760, margin: "18px 0 0" }}>{meta.subtitulo}</p>
    </header>
  );
}

/* ============================ CONTEXTO ============================ */
function Contexto({ meta }) {
  const parrafos = meta.descripcion.split("\n\n");
  return (
    <Section>
      <Eyebrow n="01">Contexto</Eyebrow>
      <H>Una crisis demográfica sin precedente regional</H>
      {parrafos.map((p, i) => <P key={i}>{p}</P>)}
    </Section>
  );
}

/* ============================ PIRÁMIDE (firma) ============================ */
function interpolarAncla(anclas, t) {
  const a0 = anclas[0], a1 = anclas[1];
  return {
    anio: Math.round(lerp(a0.anio, a1.anio, t)),
    poblacion_total: lerp(a0.poblacion_total, a1.poblacion_total, t),
    pct_60_mas: lerp(a0.pct_60_mas, a1.pct_60_mas, t),
    mediana_edad: lerp(a0.mediana_edad, a1.mediana_edad, t),
    grupos: a0.grupos.map((g, i) => ({
      edad: g.edad,
      hombres: lerp(g.hombres, a1.grupos[i].hombres, t),
      mujeres: lerp(g.mujeres, a1.grupos[i].mujeres, t),
    })),
  };
}

function Piramide({ d }) {
  const [t, setT] = useState(0);
  const [verFantasma, setVerFantasma] = useState(true);

  const real = d.escenarios.find((e) => e.id === "real");
  const contra = d.escenarios.find((e) => e.id === "contrafactual");

  const estadoReal = useMemo(() => interpolarAncla(real.anclas, t), [real, t]);
  const estadoContra = useMemo(() => interpolarAncla(contra.anclas, t), [contra, t]);

  const maxLado = Math.max(
    ...estadoReal.grupos.map((g) => Math.max(g.hombres, g.mujeres)),
    ...estadoContra.grupos.map((g) => (g.hombres + g.mujeres) / 2)
  ) * 1.15;

  const W = 680, rowH = 30, padTop = 10, padBottom = 26;
  const Hh = padTop + estadoReal.grupos.length * rowH + padBottom;
  const cx = W / 2;
  const halfW = W / 2 - 70;
  const scale = (v) => (v / maxLado) * halfW;

  return (
    <Section>
      <Eyebrow n="02" color={C.violeta}>Firma · la pirámide que se invierte</Eyebrow>
      <H>Cuántos años tiene Cuba, y cuántos podría tener</H>
      <P>
        Desliza entre {real.anclas[0].anio} y {real.anclas[1].anio} para ver cómo se estrecha la base y se ensancha
        la cima. El contorno punteado muestra, como referencia, la silueta que tendría la pirámide sin el éxodo
        masivo posterior a 2021 — un ejercicio hipotético, no una medición.
      </P>

      <Card style={{ marginTop: 20, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, letterSpacing: 1 }}>AÑO</div>
            <div style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 32, color: C.violeta }}>{estadoReal.anio}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, letterSpacing: 1 }}>POBLACIÓN · 60+ · MEDIANA</div>
            <div style={{ fontFamily: F.mono, fontSize: 15, color: C.ink }}>
              {fmtM(estadoReal.poblacion_total)} · {estadoReal.pct_60_mas.toFixed(1)}% · {estadoReal.mediana_edad.toFixed(1)} años
            </div>
          </div>
        </div>

        <input
          type="range" min={0} max={1} step={0.01} value={t}
          onChange={(e) => setT(Number(e.target.value))}
          aria-label="Año de la pirámide poblacional"
          style={{ width: "100%", margin: "8px 0 4px", accentColor: C.violeta }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 10.5, color: C.mut }}>
          <span>{real.anclas[0].anio} (observado)</span>
          <span>{real.anclas[1].anio} (proyección)</span>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontFamily: F.mono, fontSize: 12, color: C.mut, cursor: "pointer" }}>
          <input type="checkbox" checked={verFantasma} onChange={(e) => setVerFantasma(e.target.checked)} style={{ accentColor: C.musgo }} />
          mostrar silueta contrafactual (sin el éxodo)
        </label>

        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" role="img" aria-label="Pirámide poblacional de Cuba, hombres y mujeres por grupo de edad">
            <line x1={cx} y1={padTop - 4} x2={cx} y2={Hh - padBottom + 4} stroke={C.line} />
            {estadoReal.grupos.map((g, i) => {
              const y = padTop + i * rowH;
              const gc = estadoContra.grupos[i];
              const contraTotal = gc.hombres + gc.mujeres;
              return (
                <g key={g.edad}>
                  <text x={cx} y={y + rowH * 0.62} fill={C.mut} fontSize="10.5" fontFamily={F.mono} textAnchor="middle">{g.edad}</text>
                  {/* barras reales: hombres a la izquierda, mujeres a la derecha */}
                  <rect x={cx - 24 - scale(g.hombres)} y={y + 4} width={scale(g.hombres)} height={rowH - 10} fill={C.violeta} opacity="0.88" rx="2" />
                  <rect x={cx + 24} y={y + 4} width={scale(g.mujeres)} height={rowH - 10} fill={C.musgo} opacity="0.88" rx="2" />
                  {/* fantasma contrafactual: silueta total, mitad a cada lado */}
                  {verFantasma && (
                    <>
                      <rect x={cx - 24 - scale(contraTotal / 2)} y={y + 2} width={scale(contraTotal / 2)} height={rowH - 6} fill="none" stroke={C.ink} strokeOpacity="0.4" strokeDasharray="3 2" rx="2" />
                      <rect x={cx + 24} y={y + 2} width={scale(contraTotal / 2)} height={rowH - 6} fill="none" stroke={C.ink} strokeOpacity="0.4" strokeDasharray="3 2" rx="2" />
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 10, fontFamily: F.mono, fontSize: 11, color: C.mut, flexWrap: "wrap" }}>
          <span><span style={{ color: C.violeta }}>■</span> hombres (real)</span>
          <span><span style={{ color: C.musgo }}>■</span> mujeres (real)</span>
          {verFantasma && <span><span style={{ color: C.ink, opacity: 0.6 }}>▢</span> silueta sin el éxodo (hipotético)</span>}
        </div>
      </Card>
      <div style={{ marginTop: 14, fontFamily: F.mono, fontSize: 11.5, color: C.mut, fontStyle: "italic" }}>* {d.advertencia}</div>
    </Section>
  );
}

/* ============================ SERIE DE POBLACIÓN (línea + tramo proyectado) ============================ */
function SeriePoblacion({ d }) {
  const puntos = useMemo(() => {
    const anios = new Set();
    d.oficial.forEach((p) => anios.add(p.anio));
    (d.estimacion_independiente || []).forEach((p) => anios.add(p.anio));
    const ordenados = Array.from(anios).sort((a, b) => a - b);
    const cortePunteado = 2025;
    return ordenados.map((anio) => {
      const of = d.oficial.find((p) => p.anio === anio);
      const ind = (d.estimacion_independiente || []).find((p) => p.anio === anio);
      const fila = { anio };
      if (of && anio <= cortePunteado) fila.solido = of.valor;
      if (of && anio >= cortePunteado) fila.punteado = of.valor;
      if (ind) fila.independiente = ind.valor;
      return fila;
    });
  }, [d]);

  return (
    <Section>
      <Eyebrow n="03" color={C.musgo}>Una población que se vacía</Eyebrow>
      <H>De once millones a menos de nueve y medio</H>
      <P>
        La línea sólida es el tramo observado; la punteada, proyección. La serie gris muestra la estimación
        independiente del demógrafo Albizu-Campos, notablemente más baja que la cifra oficial de ONEI.
      </P>
      <div style={{ width: "100%", height: 320, marginTop: 10 }}>
        <ResponsiveContainer>
          <LineChart data={puntos} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid stroke={C.line} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="anio" tick={{ fill: C.mut, fontSize: 11, fontFamily: F.mono }} axisLine={{ stroke: C.line }} tickLine={false} />
            <YAxis tick={{ fill: C.mut, fontSize: 10, fontFamily: F.mono }} axisLine={false} tickLine={false} tickFormatter={(v) => fmtM(v)} width={64} />
            <Tooltip contentStyle={tipStyle} formatter={(v, k) => [fmtM(v), k === "solido" ? "ONEI (observado)" : k === "punteado" ? "ONEI (proyección)" : "Estimación independiente"]} labelFormatter={(l) => "Año " + l} />
            <Line type="monotone" dataKey="solido" stroke={C.violeta} strokeWidth={2.5} dot={{ r: 4 }} connectNulls={false} />
            <Line type="monotone" dataKey="punteado" stroke={C.violeta} strokeWidth={2.5} strokeDasharray="6 5" dot={{ r: 4 }} connectNulls={false} />
            <Line type="monotone" dataKey="independiente" stroke={C.mut} strokeWidth={2} strokeDasharray="2 3" dot={{ r: 4 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div style={{ marginTop: 10, fontFamily: F.mono, fontSize: 11.5, color: C.mut, fontStyle: "italic" }}>* {d.advertencia}</div>
    </Section>
  );
}

/* ============================ NATALIDAD Y MORTALIDAD ============================ */
function NatalidadMortalidad({ d }) {
  const data = d.serie.map((s) => ({ anio: String(s.anio), Nacimientos: s.nacimientos, Defunciones: s.defunciones }));
  const fec = d.tasa_fecundidad;
  const pctReemplazo = (fec.valor / fec.nivel_reemplazo) * 100;
  return (
    <Section>
      <Eyebrow n="04" color={C.coral}>Nacen menos, mueren más</Eyebrow>
      <H>El saldo natural, en números rojos</H>
      <P>
        En 2025 murieron casi el doble de personas de las que nacieron: saldo natural de {fmt(d.saldo_natural_2025)} personas.
      </P>
      <div style={{ width: "100%", height: 260, marginTop: 10 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="anio" tick={{ fill: C.mut, fontSize: 11, fontFamily: F.mono }} axisLine={{ stroke: C.line }} tickLine={false} />
            <YAxis tick={{ fill: C.mut, fontSize: 10, fontFamily: F.mono }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt(v)} width={54} />
            <Tooltip contentStyle={tipStyle} formatter={(v) => fmt(v)} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="Nacimientos" fill={C.musgo} radius={[3, 3, 0, 0]}>
              <LabelList dataKey="Nacimientos" position="top" formatter={fmt} style={{ fill: C.musgo, fontFamily: F.mono, fontSize: 11 }} />
            </Bar>
            <Bar dataKey="Defunciones" fill={C.coral} radius={[3, 3, 0, 0]}>
              <LabelList dataKey="Defunciones" position="top" formatter={fmt} style={{ fill: C.coral, fontFamily: F.mono, fontSize: 11 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Card style={{ marginTop: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, letterSpacing: 1 }}>TASA DE FECUNDIDAD · {fec.anio}</div>
            <div style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 28, color: C.ink }}>{fec.valor.toFixed(2)} hijos/mujer <Badge nivel={fec.confianza} /></div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ height: 10, background: C.bg2, borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: pctReemplazo + "%", height: "100%", background: C.coral, borderRadius: 5 }} />
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, marginTop: 6 }}>
              {pctReemplazo.toFixed(0)}% del nivel de reemplazo ({fec.nivel_reemplazo} hijos/mujer)
            </div>
          </div>
        </div>
      </Card>
    </Section>
  );
}

/* ============================ DONUT: COMPOSICIÓN ETARIA ============================ */
function DonutComposicion({ d }) {
  const real = d.escenarios.find((e) => e.id === "real").anclas[0];
  const grupos = real.grupos;
  const suma = (desde, hasta) => grupos.slice(desde, hasta).reduce((acc, g) => acc + g.hombres + g.mujeres, 0);
  const jovenes = suma(0, 2); // 0-9, 10-19
  const laboral = suma(2, 6); // 20-59
  const mayores = suma(6, 9); // 60+
  const data = [
    { name: "0-19 años", value: jovenes, color: C.musgo },
    { name: "20-59 años", value: laboral, color: C.violeta },
    { name: "60+ años", value: mayores, color: C.coral },
  ];
  const R = 110, cx = 140, cy = 140, thick = 40;
  let acc = 0;
  const arcs = data.map((s) => {
    const a0 = (acc / 100) * Math.PI * 2 - Math.PI / 2;
    acc += s.value;
    const a1 = (acc / 100) * Math.PI * 2 - Math.PI / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const [x0, y0] = p(R, a0), [x1, y1] = p(R, a1);
    const [xi0, yi0] = p(R - thick, a0), [xi1, yi1] = p(R - thick, a1);
    return { d: `M${x0} ${y0} A${R} ${R} 0 ${large} 1 ${x1} ${y1} L${xi1} ${yi1} A${R - thick} ${R - thick} 0 ${large} 0 ${xi0} ${yi0} Z`, color: s.color };
  });
  return (
    <Section>
      <Eyebrow n="05" color={C.musgo}>Composición etaria · {real.anio - 1}</Eyebrow>
      <H>Tres franjas de edad, un país que envejece</H>
      <P>Reparto de la población observada por gran franja de edad, agregando los grupos de la pirámide.</P>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
        <svg viewBox="0 0 280 280" width="240" height="240" style={{ flexShrink: 0 }} role="img" aria-label="Composición etaria de la población cubana">
          {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} stroke={C.bg} strokeWidth="1.5" />)}
          <text x="140" y="136" fill={C.ink} fontSize="13" fontFamily={F.disp} fontWeight="800" textAnchor="middle">CUBA</text>
          <text x="140" y="155" fill={C.mut} fontSize="10" fontFamily={F.mono} textAnchor="middle">{real.anio - 1}</text>
        </svg>
        <div style={{ flex: 1, minWidth: 220, display: "grid", gap: 8 }}>
          {data.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 11, height: 11, background: s.color, borderRadius: 2, flexShrink: 0 }} />
              <span style={{ fontFamily: F.body, fontSize: 14, color: C.ink, flex: 1 }}>{s.name}</span>
              <span style={{ fontFamily: F.mono, fontSize: 13, color: s.color }}>{s.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ============================ GAUGE: COBERTURA DE LA PENSIÓN ============================ */
function GaugeCobertura({ d }) {
  const pctMin = d.cobertura_pct_min, pctMax = d.cobertura_pct_max;
  const pctMed = (pctMin + pctMax) / 2;
  const R = 100, cx = 130, cy = 120, ang0 = Math.PI, ang1 = 0; // semicírculo
  const angPara = (pct) => ang0 + (ang1 - ang0) * Math.min(pct, 100) / 100;
  const arcoPath = (pctFin) => {
    const aStart = ang0, aEnd = angPara(pctFin);
    const large = 0;
    const p = (r, a) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
    const [x0, y0] = p(R, aStart), [x1, y1] = p(R, aEnd);
    return `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1}`;
  };
  const aguja = angPara(pctMed);
  const puntaX = cx + (R - 14) * Math.cos(aguja), puntaY = cy - (R - 14) * Math.sin(aguja);

  return (
    <Section>
      <Eyebrow n="06" color={C.coral}>El nido vacío de las pensiones</Eyebrow>
      <H>La pensión mínima cubre una fracción de la canasta real</H>
      <P>
        La pensión mínima ({fmt(d.pension_minima_cup)} CUP, vigente desde {d.vigente_desde}) equivale a entre{" "}
        {d.pension_minima_usd_informal_min} y {d.pension_minima_usd_informal_max} dólares al cambio informal.
        Frente a una canasta de referencia de entre {fmt(d.canasta_basica_cup_min)} y {fmt(d.canasta_basica_cup_max)}{" "}
        CUP mensuales, la cobertura ronda solo entre el {pctMin}% y el {pctMax}%.
      </P>
      <Card style={{ marginTop: 10, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <svg viewBox="0 0 260 150" width="240" height="140" role="img" aria-label="Medidor de cobertura de la pensión mínima frente a la canasta básica">
          <path d={arcoPath(100)} fill="none" stroke={C.bg2} strokeWidth="16" strokeLinecap="round" />
          <path d={arcoPath(pctMed)} fill="none" stroke={C.coral} strokeWidth="16" strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={puntaX} y2={puntaY} stroke={C.ink} strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r="5" fill={C.ink} />
          <text x={cx} y={cy + 30} fill={C.ink} fontSize="22" fontFamily={F.disp} fontWeight="800" textAnchor="middle">{pctMed.toFixed(1)}%</text>
          <text x={cx} y={cy + 46} fill={C.mut} fontSize="10" fontFamily={F.mono} textAnchor="middle">cobertura estimada</text>
        </svg>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, letterSpacing: 1, marginBottom: 8 }}>JUBILADOS Y PENSIONADOS</div>
          <div style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 26, color: C.ink }}>{fmt(d.jubilados_total)} <Badge nivel={d.confianza_jubilados} /></div>
          <div style={{ fontFamily: F.mono, fontSize: 12.5, color: C.mut, marginTop: 4 }}>≈ {d.pct_poblacion}% de la población</div>
        </div>
      </Card>
      <Card style={{ marginTop: 16, borderColor: C.coral }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.coral, letterSpacing: 1, marginBottom: 6 }}>ENCUESTA ASIC (n={d.encuesta_asic.n}) — NO REPRESENTATIVA A ESCALA NACIONAL</div>
        <P style={{ marginBottom: 0, fontSize: 15 }}>
          El {d.encuesta_asic.pct_no_cubre}% de los encuestados por la Asociación Sindical Independiente de Cuba
          ({d.encuesta_asic.fecha}) declaró que su pensión no le alcanza para alimentación, vivienda ni medicamentos.
          {" "}{d.encuesta_asic.advertencia}
        </P>
      </Card>
    </Section>
  );
}

/* ============================ SALUD ============================ */
function Salud({ d }) {
  return (
    <Section>
      <Eyebrow n="07" color={C.violeta}>El sistema de salud que se queda sin manos</Eyebrow>
      <H>Menos médicos para una población que envejece</H>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10 }}>
        <Card style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, letterSpacing: 1 }}>PROFESIONALES DE SALUD EMIGRADOS · 2021-2024</div>
          <div style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 30, color: C.coral, margin: "6px 0" }}>{fmt(d.profesionales_emigrados_2021_2024)} <Badge nivel={d.confianza_profesionales} /></div>
        </Card>
        <Card style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, letterSpacing: 1 }}>HABITANTES POR MÉDICO</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "6px 0" }}>
            <span style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 26, color: C.musgo }}>{d.habitantes_por_medico_2021}</span>
            <span style={{ fontFamily: F.mono, color: C.mut }}>→</span>
            <span style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 26, color: C.coral }}>{d.habitantes_por_medico_2024}</span>
            <Badge nivel={d.confianza_medicos} />
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 12, color: C.mut }}>caída de {d.caida_pct}% en el total de médicos ({fmt(d.medicos_2021)} → {fmt(d.medicos_2024)})</div>
        </Card>
      </div>
      <Card style={{ marginTop: 14 }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, letterSpacing: 1, marginBottom: 6 }}>ESCASEZ DE MEDICAMENTOS ESENCIALES</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 24, color: C.ink }}>{d.escasez_medicamentos_pct}%</span>
          <Badge nivel={d.confianza_escasez} />
        </div>
        <P style={{ marginTop: 8, marginBottom: 0, fontSize: 13.5, color: C.mut }}>Cifra ampliamente citada en el discurso público; no se localizó fuente primaria que la sustente en esta verificación.</P>
      </Card>
    </Section>
  );
}

/* ============================ CONTRAFACTUAL ============================ */
function Contrafactual({ d }) {
  return (
    <Section>
      <Eyebrow n="08" color={C.musgo}>El contrafactual</Eyebrow>
      <H>{d.titulo}</H>
      {d.parrafos.map((p, i) => <P key={i}>{p}</P>)}
      <div style={{ marginTop: 10, fontFamily: F.mono, fontSize: 11.5, color: C.mut, fontStyle: "italic" }}>* {d.advertencia}</div>
    </Section>
  );
}

/* ============================ ENCUESTA ============================ */
function usePoll(cfg, slug) {
  const [conteos, setConteos] = useState({});
  const [votos, setVotos] = useState({});
  const supaRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.__yamacoaSupabase) supaRef.current = window.__yamacoaSupabase;
    try {
      const c = JSON.parse(localStorage.getItem("enc:" + slug + ":conteos") || "{}");
      const v = JSON.parse(localStorage.getItem("enc:" + slug + ":votos") || "{}");
      setConteos(c); setVotos(v);
    } catch (e) { /* noop */ }
  }, [slug]);

  const votar = (pid, oid) => {
    setConteos((prev) => {
      const next = { ...prev, [pid]: { ...(prev[pid] || {}) } };
      const anterior = votos[pid];
      if (anterior && next[pid][anterior]) next[pid][anterior] = Math.max(0, next[pid][anterior] - 1);
      next[pid][oid] = (next[pid][oid] || 0) + 1;
      try { localStorage.setItem("enc:" + slug + ":conteos", JSON.stringify(next)); } catch (e) {}
      return next;
    });
    setVotos((prev) => {
      const next = { ...prev, [pid]: oid };
      try { localStorage.setItem("enc:" + slug + ":votos", JSON.stringify(next)); } catch (e) {}
      return next;
    });
    const supa = supaRef.current;
    if (supa && cfg.rpc_incrementar) {
      try { supa.rpc(cfg.rpc_incrementar, { p_tabla: cfg.tabla_supabase, p_pregunta: pid, p_opcion: oid }); } catch (e) { /* silencioso */ }
    }
  };
  return { conteos, votos, votar };
}

function PreguntaEncuesta({ p, conteos, votoActual, onVotar }) {
  const total = Object.values(conteos[p.id] || {}).reduce((a, b) => a + b, 0);
  return (
    <Card style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: F.body, fontSize: 15.5, color: C.ink, marginBottom: 12 }}>{p.texto}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {p.opciones.map((o) => {
          const votosOpcion = (conteos[p.id] || {})[o.id] || 0;
          const pct = total > 0 ? Math.round((votosOpcion / total) * 100) : 0;
          const elegido = votoActual === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onVotar(p.id, o.id)}
              style={{
                position: "relative", textAlign: "left", cursor: "pointer", overflow: "hidden",
                border: `1px solid ${elegido ? C.violeta : C.line}`, borderRadius: 6, background: C.bg2,
                padding: "10px 14px", fontFamily: F.body, fontSize: 13.5, color: C.ink,
              }}
            >
              {total > 0 && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: pct + "%", background: elegido ? "rgba(166,102,214,0.22)" : "rgba(255,255,255,0.05)", transition: "width .4s" }} />}
              <span style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 10 }}>
                <span>{o.texto}</span>
                {total > 0 && <span style={{ fontFamily: F.mono, color: C.mut }}>{pct}%</span>}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function Encuesta({ d, slug }) {
  const { conteos, votos, votar } = usePoll(d, slug);
  return (
    <Section>
      <Eyebrow n="09" color={C.violeta}>Encuesta</Eyebrow>
      <H>{d.titulo}</H>
      <P>{d.intro}</P>
      {d.preguntas.map((p) => (
        <PreguntaEncuesta key={p.id} p={p} conteos={conteos} votoActual={votos[p.id]} onVotar={votar} />
      ))}
    </Section>
  );
}

/* ============================ NOTAS METODOLÓGICAS ============================ */
function Notas({ meta }) {
  return (
    <Section>
      <Eyebrow n="10" color={C.mut}>Notas metodológicas</Eyebrow>
      <H size={24}>Lo que este expediente marca como incierto</H>
      <div style={{ display: "grid", gap: 10 }}>
        {(meta.notas_metodologicas || []).map((n, i) => (
          <div key={i} style={{ display: "flex", gap: 10, fontFamily: F.body, fontSize: 14, color: C.mut, lineHeight: 1.5 }}>
            <span style={{ color: C.alerta }}>→</span><span>{n}</span>
          </div>
        ))}
      </div>
      {meta.tesis_confianza && (
        <div style={{ marginTop: 24, display: "grid", gap: 8 }}>
          {meta.tesis_confianza.map((t, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderBottom: `1px solid ${C.line}`, paddingBottom: 8 }}>
              <span style={{ fontFamily: F.body, fontSize: 13.5, color: C.ink }}>{t.afirmacion}</span>
              <Badge nivel={t.nivel} />
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

/* ============================ FUENTES ============================ */
function Fuentes({ fuentes }) {
  return (
    <Section style={{ paddingBottom: 80 }}>
      <div style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, borderTop: `1px solid ${C.line}`, paddingTop: 22 }}>Fuentes</div>
      <div style={{ display: "grid", gap: 6 }}>
        {fuentes.map((f, i) => (
          <div key={i} style={{ fontFamily: F.mono, fontSize: 12.5, color: C.mut, display: "flex", gap: 8 }}>
            <span style={{ color: C.violeta }}>[{i + 1}]</span><span>{f}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ============================ ROOT ============================ */
export default function Envejecimiento({ data: propData, supabase }) {
  const [data, setData] = useState(propData || DATOS);

  useEffect(() => {
    if (propData) { setData(propData); return; }
    let vivo = true;
    const base = (typeof process !== "undefined" && process.env && process.env.PUBLIC_URL) || "";
    const rutas = [
      base + "/data/envejecimiento.json",
      base + "/temas/envejecimiento.json",
      base + "/envejecimiento.json",
    ];
    (async () => {
      for (const url of rutas) {
        try {
          const r = await fetch(url);
          if (r && r.ok) { const j = await r.json(); if (vivo) setData(j); return; }
        } catch (e) { /* siguiente ruta */ }
      }
    })();
    return () => { vivo = false; };
  }, [propData]);

  useEffect(() => {
    if (supabase && typeof window !== "undefined") window.__yamacoaSupabase = supabase;
  }, [supabase]);

  if (!data) {
    return <div style={{ background: C.bg, color: C.mut, fontFamily: F.mono, minHeight: "60vh", display: "grid", placeItems: "center" }}>Cargando…</div>;
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <Hero meta={data.meta} />
      <Contexto meta={data.meta} />
      <Piramide d={data.piramide} />
      <SeriePoblacion d={data.serie_poblacion} />
      <NatalidadMortalidad d={data.natalidad_mortalidad} />
      <DonutComposicion d={data.piramide} />
      <GaugeCobertura d={data.pensiones} />
      <Salud d={data.salud} />
      <Contrafactual d={data.contrafactual} />
      <Encuesta d={data.encuesta} slug={data.meta.slug} />
      <Notas meta={data.meta} />
      <Fuentes fuentes={data.meta.fuentes} />
    </div>
  );
}
