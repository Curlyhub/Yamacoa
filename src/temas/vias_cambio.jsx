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

/* ============================ FROZEN PALETTE ============================ */
/* Paleta "Expediente" — reservada para este tema. Nunca se edita aqui: */
/* si hace falta un ajuste de color, es decision humana, no del pipeline. */
const C = {
  paper: "#E6E8EA", paper2: "#F2F3F5", ink: "#15181C", ink2: "#3C424A",
  ink3: "#6B727B", line: "#CDD1D6", line2: "#B7BCC3",
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
    "actualizado": "2026-07-04",
    "fuentes": [
      "Chenoweth & Stephan, \"Why Civil Resistance Works\" (NAVCO, 1900-2006)",
      "Carta de la ONU, art. 2(4) y 51",
      "Res. AGNU 3314 (1974), definicion de agresion",
      "CEPAL, Estudio Economico de America Latina y el Caribe 2025",
      "ONEI (Cuba)",
      "US Customs and Border Protection (CBP)",
      "Horizonte Cubano, Columbia Law School",
      "CNN, AS/COA, Havana Times, Cato Institute"
    ]
  },
  "hero": {
    "eyebrow": "Dossier analitico - Derecho internacional y transiciones politicas",
    "titulo_pre": "Por que una invasion organizada desde el exterior",
    "titulo_em": "casi nunca derriba",
    "titulo_post": "una dictadura consolidada.",
    "subtitulo": "El obstaculo no es solo juridico (el marco de agresion y terrorismo lo vuelve inviable y penalmente arriesgado): historicamente, las insurrecciones armadas montadas fuera del pais rara vez desplazan a regimenes con aparato de seguridad intacto. Los cambios reales llegan por presion interna, colapso economico, fractura de elites o transicion negociada. El caso cubano lo ilustra con datos.",
    "stats": [
      { "n": "53", "unit": "%", "label": "exito de campanas no violentas" },
      { "n": "26", "unit": "%", "label": "exito de insurgencias armadas" },
      { "n": "72", "unit": "h", "label": "duracion de Bahia de Cochinos" },
      { "n": ">1", "unit": "M", "label": "emigrantes cubanos desde 2021" }
    ]
  },
  "marco_legal": {
    "lede": "La distincion entre agresion y terrorismo no es retorica: define quien queda del lado equivocado de la ley. Preparar, financiar o dirigir una accion armada contra la soberania de un Estado activa un regimen normativo muy restrictivo, tanto internacional como interno.",
    "items": [
      {
        "icon": "gavel",
        "titulo": "Art. 2(4), Carta de la ONU",
        "texto": "Prohibe a los Estados recurrir a la amenaza o al uso de la fuerza contra la integridad territorial o la independencia politica de otro Estado."
      },
      {
        "icon": "shield",
        "titulo": "Res. 3314 (1974), definicion de agresion",
        "texto": "El envio de bandas armadas, grupos irregulares o mercenarios que realicen actos de fuerza contra otro Estado se equipara a un acto de agresion (art. 3g)."
      },
      {
        "icon": "scale",
        "titulo": "Excepciones tasadas",
        "texto": "Solo dos: legitima defensa ante un ataque armado (art. 51) y autorizacion expresa del Consejo de Seguridad (Cap. VII). Nada mas habilita el uso de la fuerza."
      },
      {
        "icon": "landmark",
        "titulo": "Leyes nacionales del pais de residencia",
        "texto": "Organizar o financiar acciones armadas desde el exilio choca con normas antiterroristas internas (por ejemplo, en EE.UU., el Neutrality Act y la prohibicion de apoyo material a grupos armados)."
      }
    ],
    "flujo": [
      { "clave": "Accion", "texto": "Invasion o insurreccion armada desde el exterior" },
      { "clave": "Calificacion", "texto": "Acto de agresion; mercenarismo; terrorismo" },
      { "clave": "Consecuencia", "texto": "Persecucion penal, extradicion, sancion, aislamiento" }
    ]
  },
  "evidencia_chenoweth": {
    "lede": "Erica Chenoweth y Maria Stephan revisaron 323 campanas de cambio de regimen entre 1900 y 2006 (base de datos NAVCO). El hallazgo es contraintuitivo pero robusto: la resistencia civil no violenta supera a la via armada en casi todas las metricas que importan.",
    "fuente_nota": "Chenoweth & Stephan, \"Why Civil Resistance Works\" (NAVCO, 1900-2006).",
    "modos": {
      "exito": {
        "titulo": "Tasa de exito de las campanas",
        "unidad": "%",
        "nota": "Exito = objetivo logrado en el ano siguiente al pico de movilizacion.",
        "data": [
          { "k": "Campana no violenta", "v": 53, "tipo": "novional" },
          { "k": "Insurgencia armada", "v": 26, "tipo": "armada" }
        ]
      },
      "participacion": {
        "titulo": "Participacion media (factor relativo)",
        "unidad": "x",
        "nota": "Las campanas no violentas movilizan, en promedio, cuatro veces mas participantes.",
        "data": [
          { "k": "No violenta", "v": 4, "tipo": "novional" },
          { "k": "Armada", "v": 1, "tipo": "armada" }
        ]
      },
      "democracia": {
        "titulo": "Probabilidad de democracia a 5 anos",
        "unidad": "x",
        "nota": "Diez veces mas probable que emerja una democracia tras una campana no violenta.",
        "data": [
          { "k": "No violenta", "v": 10, "tipo": "novional" },
          { "k": "Armada", "v": 1, "tipo": "armada" }
        ]
      }
    },
    "mini": [
      { "n": "4x", "t": "mas participantes moviliza, en promedio, una campana no violenta" },
      { "n": "20 / 25", "t": "de los mayores movimientos del siglo XX fueron no violentos" },
      { "n": "3,5 %", "t": "de participacion activa: umbral tras el cual ninguna campana del conjunto fracaso" }
    ]
  },
  "cochinos": {
    "lede": "La Brigada 2506, unos 1.400 exiliados entrenados y financiados por la CIA, desembarco el 17 de abril de 1961. Sin apoyo interno masivo, con logistica deficiente y frente a una respuesta rapida del regimen, la operacion colapso en unas 72 horas. Es el arquetipo del fracaso: una fuerza externa no sustituye a la movilizacion interna que nunca llego.",
    "why_titulo": "Por que fracaso",
    "why_items": [
      "Ausencia de un levantamiento popular que acompanara el desembarco.",
      "Aparato de seguridad e inteligencia infiltrado y ya alertado.",
      "Superioridad logistica y de mando del Estado en su propio terreno.",
      "Apoyo exterior limitado y deliberadamente negable."
    ],
    "stats": [
      { "n": "17-19 abr 1961", "t": "tres dias de operacion", "icon": "ship" },
      { "n": "~1.400", "t": "brigadistas desembarcados", "icon": "users" },
      { "n": "~114", "t": "muertos en combate", "icon": "flame" },
      { "n": "~1.189", "t": "capturados por el regimen", "icon": "shield" }
    ]
  },
  "vias_frecuencia": {
    "lede": "En la experiencia latinoamericana y global reciente, las salidas autoritarias suelen combinar presion social sostenida, quiebra economica y fractura de las elites; muy rara vez, una invasion externa. El siguiente ordenamiento es una sintesis ilustrativa de esa frecuencia relativa.",
    "fuente_nota": "Sintesis cualitativa a partir de la evidencia comparada citada. No es una serie estadistica.",
    "data": [
      { "k": "Presion interna masiva + defeccion de elites", "v": 82, "ej": "Chile 1988-90", "tipo": "novional" },
      { "k": "Transicion negociada / apertura pactada", "v": 74, "ej": "Brasil 1985; Espana 1975-78", "tipo": "novional" },
      { "k": "Colapso economico o derrota militar", "v": 61, "ej": "Argentina 1983 (tras Malvinas)", "tipo": "mixta" },
      { "k": "Fin del apoyo de la potencia patrona", "v": 58, "ej": "Europa del Este 1989", "tipo": "patron" },
      { "k": "Insurreccion armada interna", "v": 28, "ej": "casos aislados", "tipo": "armada" },
      { "k": "Invasion organizada por exiliados", "v": 9, "ej": "Bahia de Cochinos 1961", "tipo": "armada" }
    ]
  },
  "erosion_economica": {
    "lede": "El regimen cubano ya enfrenta la peor crisis desde 1959: contraccion sostenida del PIB, inflacion cronica, colapso del azucar y del turismo, y un peso en caida libre. Los colapsos internos son hoy mucho mas plausibles que cualquier accion militar externa.",
    "modos": {
      "pib": {
        "titulo": "Variacion anual del PIB real (%)",
        "fuente_nota": "CEPAL y cifras oficiales. Acumulado 2019-2024: caida superior al 11 %. Barras claras = proyeccion.",
        "tooltip_nota": "2025-2026: proyeccion CEPAL.",
        "data": [
          { "year": "2015", "v": 4.4, "proj": false },
          { "year": "2019", "v": -0.2, "proj": false },
          { "year": "2020", "v": -10.9, "proj": false },
          { "year": "2021", "v": 1.3, "proj": false },
          { "year": "2022", "v": 1.8, "proj": false },
          { "year": "2023", "v": -1.9, "proj": false },
          { "year": "2024", "v": -1.1, "proj": false },
          { "year": "2025", "v": -1.5, "proj": true },
          { "year": "2026", "v": 0.1, "proj": true }
        ]
      },
      "inflacion": {
        "titulo": "Inflacion interanual, fin de ano (%)",
        "fuente_nota": "CEPAL / ONEI. En 2025, estimaciones privadas apuntan a niveles cercanos al 70 %.",
        "tooltip_nota": "2025 parcial (oficial). Estimaciones privadas la situan mucho mas alta.",
        "data": [
          { "year": "2021", "v": 77.3 },
          { "year": "2022", "v": 39.1 },
          { "year": "2023", "v": 31.0 },
          { "year": "2024", "v": 25.0 },
          { "year": "2025*", "v": 18.0 }
        ]
      },
      "azucar": {
        "titulo": "Produccion de azucar (miles de toneladas)",
        "fuente_nota": "De ~8 millones de t (1989) a ~165.000 t (2024/25). Tramos intermedios aproximados.",
        "tooltip_nota": "Zafra 24/25: la peor en mas de un siglo.",
        "data": [
          { "year": "1989", "t": 8000 },
          { "year": "2000", "t": 4057 },
          { "year": "2010", "t": 1150 },
          { "year": "2020", "t": 816 },
          { "year": "24/25", "t": 165 }
        ]
      },
      "turismo": {
        "titulo": "Llegadas internacionales (millones)",
        "fuente_nota": "Cifras aproximadas. 2025 (*) parcial: caida interanual de ~25 %.",
        "tooltip_nota": "Ocupacion hotelera en torno al 24 % en 2025.",
        "data": [
          { "year": "2018", "v": 4.7 },
          { "year": "2019", "v": 4.3 },
          { "year": "2020", "v": 1.1 },
          { "year": "2021", "v": 0.6 },
          { "year": "2022", "v": 1.6 },
          { "year": "2023", "v": 2.4 },
          { "year": "2024", "v": 2.2 },
          { "year": "2025*", "v": 1.6 }
        ]
      },
      "cambio": {
        "titulo": "Peso cubano: tasa oficial vs. mercado informal (CUP/USD)",
        "fuente_nota": "Observatorios cambiarios independientes. La brecha oficial/informal supera 18x.",
        "tooltip_nota": "La tasa oficial (24) es una ficcion frente al mercado real.",
        "data": [
          { "year": "2021", "oficial": 24, "informal": 70 },
          { "year": "2022", "oficial": 24, "informal": 170 },
          { "year": "2023", "oficial": 24, "informal": 265 },
          { "year": "2024", "oficial": 24, "informal": 395 },
          { "year": "2025", "oficial": 24, "informal": 440 }
        ]
      }
    },
    "mini": [
      { "n": "20 h", "t": "de apagon diario en algunas provincias durante 2025" },
      { "n": "oct 2024", "t": "primer apagon nacional total: dias sin electricidad" },
      { "n": "~10 %", "t": "de la poblacion con problemas diarios de agua potable" }
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
          { "year": "2020", "onei": 11186, "ind": null },
          { "year": "2021", "onei": 11113, "ind": null },
          { "year": "2022", "onei": 11089, "ind": null },
          { "year": "2023", "onei": 10056, "ind": 8620 },
          { "year": "2024", "onei": 9748, "ind": 8300 }
        ]
      },
      "emigracion": {
        "titulo": "Llegadas de cubanos a EE.UU. por ano fiscal (miles)",
        "fuente_nota": "CBP (EE.UU.). Solo EE.UU.; el saldo migratorio total hacia todos los destinos es mayor.",
        "tooltip_nota": "Pico 2022-24; caida en 2025 por cambios de politica migratoria.",
        "data": [
          { "year": "2020", "v": 14 },
          { "year": "2021", "v": 39 },
          { "year": "2022", "v": 225 },
          { "year": "2023", "v": 200 },
          { "year": "2024", "v": 218 },
          { "year": "2025", "v": 33 }
        ]
      }
    },
    "j11_texto": "Las protestas del 11 de julio de 2021, las mayores en decadas, mostraron el vector realmente decisivo: presion interna, desobediencia civil y sociedad civil organizada. Ninguna accion externa tiene ese alcance ni esa legitimidad."
  },
  "matriz": {
    "lede": "Cada estrategia se situa segun su legalidad y bajo riesgo penal (eje horizontal) y su eficacia historica (eje vertical). El tamano del punto marca el riesgo para quien participa. Las opciones armadas caen en el cuadrante inferior izquierdo: ilegales, poco eficaces y peligrosas. Toca un punto para ver el detalle.",
    "data": [
      { "name": "Resistencia civil masiva no violenta", "x": 90, "y": 76, "r": 30, "grp": "no-violenta" },
      { "name": "Transicion negociada con elites", "x": 80, "y": 71, "r": 26, "grp": "no-violenta" },
      { "name": "Desobediencia civil y huelgas", "x": 82, "y": 60, "r": 42, "grp": "no-violenta" },
      { "name": "Medios independientes e informacion", "x": 88, "y": 55, "r": 34, "grp": "no-violenta" },
      { "name": "Presion diplomatica y sanciones dirigidas", "x": 85, "y": 46, "r": 24, "grp": "no-violenta" },
      { "name": "Insurreccion armada interna", "x": 25, "y": 29, "r": 78, "grp": "armada" },
      { "name": "Invasion organizada por exiliados", "x": 9, "y": 12, "r": 92, "grp": "armada" },
      { "name": "Financiar grupos armados desde el exterior", "x": 7, "y": 15, "r": 88, "grp": "armada" }
    ],
    "nota_armada": "Via ilegal bajo el derecho internacional e interno, de baja eficacia historica y alto riesgo personal. Su calificacion como agresion o terrorismo la vuelve ademas inviable estrategicamente.",
    "nota_novional": "Via legal o de bajo riesgo penal, con respaldo empirico como motor de transicion. Combinada con otras del mismo cuadrante, maximiza el efecto sobre un regimen consolidado."
  },
  "sintesis": {
    "parrafos": [
      "La dificultad de derribar una dictadura consolidada desde fuera es doble. Es juridica: el marco de agresion y terrorismo convierte cualquier invasion o insurreccion organizada en el exilio en un acto perseguible, con exposicion penal real para sus organizadores. Y es empirica: las fuerzas externas rara vez sustituyen a la movilizacion interna que necesitan y casi nunca encuentran.",
      "El camino que la evidencia respalda combina resistencia pacifica interna con presion externa sostenida: protesta masiva y desobediencia civil (como el 11J), medios independientes y sociedad civil, presion diplomatica y sanciones dirigidas, y el aprovechamiento de una erosion economica que ya esta en marcha. En el caso cubano, el colapso interno (crisis economica, apagones, exodo demografico) es hoy mucho mas determinante que cualquier escenario militar externo."
    ],
    "tags": [
      { "icon": "users", "texto": "Presion interna" },
      { "icon": "trend_down", "texto": "Erosion economica" },
      { "icon": "radio", "texto": "Informacion y sociedad civil" },
      { "icon": "handshake", "texto": "Transicion negociada" }
    ]
  },
  "footer": {
    "nota": "Documento analitico e historico. Expone el marco juridico y la evidencia comparada sobre transiciones de regimen; no promueve ni facilita acciones ilegales. Las cifras marcadas como proyeccion, aproximadas o ilustrativas se identifican en cada grafica.",
    "fuentes_texto": "Chenoweth & Stephan (NAVCO) - Carta de la ONU y Res. AGNU 3314 - CEPAL - ONEI - CBP (EE.UU.) - Horizonte Cubano (Columbia Law) - CNN, AS/COA, Havana Times, Cato."
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
          <Reveal><Eyebrow n="II">La evidencia comparada: la violencia rinde menos</Eyebrow></Reveal>
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

        {/* IV — VÍAS DE CAMBIO */}
        <section id="vias" className="sec">
          <Reveal><Eyebrow n="IV">Cómo caen realmente las dictaduras</Eyebrow></Reveal>
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
          <Reveal><Eyebrow n="V">La vía más probable: erosión económica</Eyebrow></Reveal>
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
          <Reveal><Eyebrow n="VI">El éxodo: presión interna hecha demografía</Eyebrow></Reveal>
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
          <Reveal><Eyebrow n="VII">La matriz de vías: legalidad frente a eficacia</Eyebrow></Reveal>
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
          <Reveal><Eyebrow n="VIII">Síntesis</Eyebrow></Reveal>
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
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

.root{ --paper:${C.paper}; --paper2:${C.paper2}; --ink:${C.ink}; --ink2:${C.ink2}; --ink3:${C.ink3}; --line:${C.line}; --line2:${C.line2}; --teal:${C.teal}; --brick:${C.brick};
  background:var(--paper); color:var(--ink); font-family:'IBM Plex Sans',system-ui,sans-serif; -webkit-font-smoothing:antialiased; line-height:1.55; }
.root *{ box-sizing:border-box; }
.root a{ color:inherit; text-decoration:none; }

/* NAV */
.nav{ position:sticky; top:0; z-index:40; display:flex; align-items:center; justify-content:space-between;
  padding:11px 24px; background:rgba(230,232,234,.86); backdrop-filter:blur(10px); border-bottom:1px solid var(--line); }
.nav-mark{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.14em; color:var(--ink2); }
.nav-links{ display:flex; gap:16px; flex-wrap:wrap; }
.nav-links a{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:.04em; color:var(--ink3); transition:color .2s; }
.nav-links a:hover{ color:var(--teal); }

/* HERO */
.hero{ position:relative; background:${C.ink}; color:var(--paper); overflow:hidden; padding:76px 24px 68px; }
.hero-grid{ position:absolute; inset:0; background-image:linear-gradient(${"rgba(255,255,255,.045)"} 1px,transparent 1px),linear-gradient(90deg,${"rgba(255,255,255,.045)"} 1px,transparent 1px); background-size:46px 46px; mask-image:radial-gradient(ellipse 80% 70% at 30% 20%,#000 40%,transparent 100%); }
.hero-in{ position:relative; max-width:1080px; margin:0 auto; }
.hero-eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:.16em; text-transform:uppercase; color:#9AA6A4; margin-bottom:22px; }
.hero-h{ font-family:'Newsreader',serif; font-weight:400; font-size:clamp(30px,5.4vw,60px); line-height:1.06; letter-spacing:-.01em; margin:0 0 22px; max-width:16ch; }
.hero-em{ font-style:italic; color:#5FC7BD; }
.hero-sub{ max-width:62ch; font-size:clamp(15px,1.5vw,17px); color:#C7CDCE; margin:0 0 34px; }
.hero-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:0; border-top:1px solid rgba(255,255,255,.14); }
.hs{ padding:20px 20px 4px 0; border-right:1px solid rgba(255,255,255,.1); }
.hs:last-child{ border-right:0; }
.hs-n{ font-family:'Newsreader',serif; font-size:clamp(30px,4vw,44px); line-height:1; color:#5FC7BD; }
.hs-n span{ font-size:.55em; color:#9AA6A4; margin-left:2px; }
.hs-l{ font-size:12px; color:#AEB6B6; margin-top:8px; max-width:20ch; }

/* MAIN */
.main{ max-width:1080px; margin:0 auto; padding:0 24px; }
.sec{ padding:64px 0; border-bottom:1px solid var(--line); }
.sec:last-of-type{ border-bottom:0; }

.eyebrow{ display:flex; align-items:center; gap:14px; margin-bottom:20px; font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink2); }
.eyebrow-n{ font-family:'Newsreader',serif; font-size:22px; font-style:italic; color:var(--teal); letter-spacing:0; text-transform:none; }
.eyebrow-rule{ width:26px; height:1px; background:var(--line2); }

.lede{ font-family:'Newsreader',serif; font-size:clamp(18px,2vw,21px); line-height:1.5; color:var(--ink); max-width:66ch; margin:0 0 30px; font-weight:400; }

/* CARDS */
.cards{ display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-bottom:28px; }
.card-w{ height:100%; }
.card{ height:100%; background:var(--paper2); border:1px solid var(--line); border-radius:6px; padding:22px; transition:transform .25s,border-color .25s; }
.card:hover{ transform:translateY(-2px); border-color:var(--teal); }
.card h3{ font-family:'Newsreader',serif; font-weight:500; font-size:18px; margin:12px 0 8px; }
.card p{ font-size:14px; color:var(--ink2); margin:0; }

/* FLOW */
.flow{ display:flex; align-items:stretch; gap:10px; flex-wrap:wrap; }
.flow-step{ flex:1; min-width:200px; background:var(--paper2); border:1px solid var(--line); border-left:3px solid var(--brick); border-radius:4px; padding:14px 16px; font-size:14px; color:var(--ink); }
.flow-k{ display:block; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink3); margin-bottom:6px; }
.flow-arrow{ align-self:center; color:var(--ink3); flex:none; }

/* PANEL */
.panel{ background:var(--paper2); border:1px solid var(--line); border-radius:8px; padding:20px 20px 14px; }
.panel-title{ font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:.04em; color:var(--ink2); margin:6px 0 14px; }
.seg{ display:inline-flex; flex-wrap:wrap; gap:4px; background:var(--paper); border:1px solid var(--line); border-radius:6px; padding:4px; margin-bottom:6px; }
.seg-b{ font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:.02em; color:var(--ink2); background:transparent; border:0; padding:7px 13px; border-radius:4px; cursor:pointer; transition:background .2s,color .2s; }
.seg-b:hover{ color:var(--ink); }
.seg-b.on{ background:var(--ink); color:var(--paper); }

/* SOURCE */
.src{ display:flex; align-items:flex-start; gap:6px; font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--ink3); margin-top:12px; padding-top:12px; border-top:1px solid var(--line); }
.src svg{ margin-top:2px; flex:none; }

/* TOOLTIP */
.tip{ background:${C.ink}; color:var(--paper); border-radius:6px; padding:10px 12px; box-shadow:0 8px 24px rgba(0,0,0,.22); max-width:240px; }
.tip-h{ font-family:'Newsreader',serif; font-size:14px; margin-bottom:7px; line-height:1.3; }
.tip-row{ display:flex; align-items:center; gap:8px; font-size:12px; margin:3px 0; }
.tip-dot{ width:8px; height:8px; border-radius:2px; flex:none; }
.tip-k{ color:#AEB6B6; }
.tip-v{ margin-left:auto; font-family:'IBM Plex Mono',monospace; font-weight:500; }
.tip-note{ font-size:11px; color:#8E9797; margin-top:7px; padding-top:7px; border-top:1px solid rgba(255,255,255,.12); line-height:1.4; }

/* MINI STATS */
.mini-row{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:22px; }
.mini-w{ height:100%; }
.mini{ height:100%; padding:20px; background:var(--paper2); border:1px solid var(--line); border-top:2px solid var(--teal); border-radius:4px; }
.mini-n{ font-family:'Newsreader',serif; font-size:34px; line-height:1; color:var(--teal); margin-bottom:10px; }
.mini-t{ font-size:13.5px; color:var(--ink2); }

/* SPLIT (COCHINOS) */
.split{ display:grid; grid-template-columns:1.5fr 1fr; gap:26px; align-items:start; }
.why{ background:var(--paper2); border:1px solid var(--line); border-radius:6px; padding:18px 20px; }
.why-h{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--brick); margin-bottom:10px; }
.why ul{ margin:0; padding-left:18px; }
.why li{ font-size:14px; color:var(--ink2); margin:7px 0; }
.stat-stack{ display:flex; flex-direction:column; gap:0; border:1px solid var(--line); border-radius:6px; overflow:hidden; }
.stat-line{ display:flex; align-items:center; gap:14px; padding:18px 20px; background:var(--paper2); border-bottom:1px solid var(--line); }
.stat-line:last-child{ border-bottom:0; }
.stat-n{ font-family:'Newsreader',serif; font-size:24px; line-height:1.1; }
.stat-t{ font-size:12.5px; color:var(--ink3); }

/* J11 */
.j11{ display:flex; gap:14px; align-items:flex-start; margin-top:22px; padding:18px 20px; background:var(--paper2); border:1px solid var(--line); border-left:3px solid var(--teal); border-radius:4px; font-size:14.5px; color:var(--ink2); }
.j11 svg{ flex:none; margin-top:2px; }
.j11 strong{ color:var(--ink); }

/* MATRIX */
.matrix-wrap{ display:grid; grid-template-columns:1.15fr .85fr; gap:20px; align-items:start; }
.matrix-chart{ position:relative; background:var(--paper2); border:1px solid var(--line); border-radius:8px; padding:16px 12px 8px; }
.quad-tags{ position:absolute; inset:20px 22px 46px 46px; pointer-events:none; z-index:2; }
.qt{ position:absolute; font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.06em; color:var(--ink3); text-transform:uppercase; }
.qt.tl{ top:0; left:0; } .qt.tr{ top:0; right:0; } .qt.bl{ bottom:0; left:0; } .qt.br{ bottom:0; right:0; }
.matrix-detail{ background:var(--paper2); border:1px solid var(--line); border-radius:8px; padding:22px; }
.md-eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink3); margin-bottom:8px; }
.md-name{ font-family:'Newsreader',serif; font-size:22px; line-height:1.2; margin-bottom:18px; }
.md-bars{ display:flex; flex-direction:column; gap:13px; margin-bottom:16px; }
.md-bar-h{ display:flex; justify-content:space-between; font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--ink2); margin-bottom:5px; }
.md-track{ height:7px; background:var(--paper); border-radius:4px; overflow:hidden; border:1px solid var(--line); }
.md-fill{ height:100%; border-radius:4px; transition:width .5s cubic-bezier(.2,.7,.2,1); }
.md-note{ font-size:13px; color:var(--ink2); line-height:1.5; padding-top:14px; border-top:1px solid var(--line); margin-bottom:14px; }
.md-list{ display:flex; flex-wrap:wrap; gap:6px; }
.md-chip{ display:inline-flex; align-items:center; gap:5px; font-size:11px; color:var(--ink2); background:var(--paper); border:1px solid var(--line2); border-radius:20px; padding:5px 10px; cursor:pointer; transition:all .2s; text-align:left; line-height:1.2; }
.md-chip:hover{ color:var(--ink); }
.md-chip.on{ color:var(--ink); background:#fff; }
.md-chip svg{ flex:none; }

/* SYNTH */
.synth p{ font-family:'Newsreader',serif; font-size:clamp(17px,1.8vw,20px); line-height:1.55; color:var(--ink); max-width:70ch; margin:0 0 18px; }
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
  .hs{ border-right:0; border-bottom:1px solid rgba(255,255,255,.1); }
  .cards,.mini-row,.split,.matrix-wrap{ grid-template-columns:1fr; }
  .nav-links{ display:none; }
  .quad-tags{ inset:16px 18px 42px 42px; }
}
@media (prefers-reduced-motion:reduce){ *{ animation:none!important; transition:none!important; } }
`;
