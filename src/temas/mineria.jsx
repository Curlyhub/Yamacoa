import React, { useState, useEffect } from "react";
import { cargarFuentes } from "../design/tokens";
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine,
  PieChart, Pie, LineChart,
} from "recharts";

/* ─── paleta cobre / malaquita / níquel (no reservada) ─────────────────── */
const COL = {
  bg:       "transparent",
  panel:    "#fcf9f4",
  panel2:   "#f5efe7",
  primary:  "#B5501C",
  primGlow: "rgba(181,80,28,.10)",
  sec:      "#2E7A5A",
  secGlow:  "rgba(46,122,90,.10)",
  nickel:   "#5F6E7E",
  gold:     "#957A00",
  alert:    "#B0281C",
  alertBg:  "rgba(176,40,28,.06)",
  alertBdr: "rgba(176,40,28,.30)",
  text:     "#1f1a16",
  muted:    "#6b5d50",
  faint:    "#7a6b5b",
  line:     "rgba(60,40,20,.10)",
  node:     "#fcf9f4",
  nodeBdr:  "#e6ddd1",
};

/* mineral → color marcador */
const MCOL = {
  "Ni-Co": COL.primary, "Pb-Zn": "#3366A0",
  "Au-Ag": COL.gold, "Au": COL.gold,
  "Cu": COL.sec, "Cu-Au": "#5E8A1E",
  "Zeolita": "#6E50B0", "Mn": "#6A747E",
  "Cromita": "#6A5230",
};
const mCol = (m) => MCOL[m] ?? COL.nickel;

const ESTADO = {
  activo:       { label: "Activo",          col: "#24874A" },
  suspendido:   { label: "Suspendido",       col: COL.alert },
  virgen:       { label: "Sin explotar",     col: COL.muted },
  histórico:    { label: "Histórico",        col: COL.faint },
  desarrollo:   { label: "En desarrollo",    col: COL.gold },
  construccion: { label: "En construcción",  col: "#3B7F9E" },
  intermitente: { label: "Intermitente",     col: "#9A6420" },
  exploracion:  { label: "Exploración",      col: COL.nickel },
};

const PROC_COL = {
  extraccion:  "#B5501C",
  preparacion: "#3366A0",
  proceso:     "#2E7A5A",
  transporte:  "#8A3A1A",
  refinado:    "#7A2818",
};

/* ─── geografía SVG (viewBox 0 0 720 190) ─────────────────────────────── */
/* convierte lon/lat a píxel SVG */
const toSVG = (lon, lat) => ({
  x: ((85.0 - lon) / 11.0) * 700 + 10,
  y: ((23.5 - lat) / 4.0)  * 170 + 8,
});

/* contorno simplificado isla principal de Cuba (± 15 km) */
const CUBA_POLY = "M13,77 L39,48 L128,36 L179,24 L252,27 L300,36 L366,57 L417,68 L459,80 L513,95 L592,131 L646,138 L701,152 L672,157 L608,161 L481,163 L443,157 L382,131 L328,129 L277,93 L217,68 L163,63 L86,70 Z";

/* Isla de la Juventud */
const IJ = { cx: 150, cy: 87, rx: 22, ry: 12 };

/* ─── datos embebidos (respaldo si el fetch falla) ──────────────────────── */
const EMBEDDED = {
  meta: {
    tema: "mineria", titulo: "El subsuelo y la crisis",
    subtitulo: "Reservas minerales de Cuba y la ruptura geopolítica de 2026",
    fuente: "USGS · Sherritt NI 43-101 · Antilles Gold JORC · GeoMinera",
    periodo: "2019-2026", actualizado: "2026-06-28",
    nota: "Valor in-situ bruto a precio spot. No descuenta recuperación, costos ni VAN.",
  },
  kpis: [
    { id: "valor", label: "Valor in-situ Ni-Co", valor: "~121.500 M USD", sub: "reservas nacionales · spot jun-2026", confianza: "media" },
    { id: "reservas", label: "Reservas de níquel", valor: "~5,5 Mt", sub: "≈ 6 % del total mundial (USGS)", confianza: "media" },
    { id: "cobalto", label: "Cobalto mundial", valor: "# 3 global", sub: "~500.000 t — empata con Indonesia", confianza: "alta" },
    { id: "prod", label: "Producción Ni 2025", valor: "~25.240 t", sub: "caída del 48 % desde 2020 (49.700 t)", confianza: "alta" },
    { id: "oport", label: "Coste de oportunidad", valor: "< 0,5 % / año", sub: "fracción de reservas monetizada anualmente", confianza: "media" },
  ],
  alertaGeopolitica: {
    activa: true,
    items: [
      "8 may 2026 — EE.UU. sanciona Moa Nickel S.A. (secretario de Estado Marco Rubio)",
      "22 jun 2026 — Sherritt inicia cierre de Fort Saskatchewan: única fuente de cobalto refinado de Canadá",
      "mar-abr 2026 — Rusia anuncia paquete bilateral >1.000 M USD en minería",
      "2026 — Xinhai Mining (China) avanza en La Demajagua (Isla de la Juventud)",
    ],
  },
  yacimientos: [
    { id:1, nombre:"Moa — Pedro Sotto Alba", provincia:"Holguín", mineralPrincipal:"Ni-Co", tipo:"Laterita", reservas:"~870 Mt (P+P NI 43-101)", ley:"1,10% Ni · 0,10% Co", estado:"suspendido", operador:"Moa Nickel S.A. (Sherritt 50%/CUPN 50%)", valorMillones:27300, confianza:"alta", lat:20.65, lon:74.95 },
    { id:2, nombre:"Nicaro — Rolo Monterrey", provincia:"Holguín", mineralPrincipal:"Ni-Co", tipo:"Laterita", reservas:"~600 Mt (estimación histórica)", ley:"0,90% Ni", estado:"suspendido", operador:"Empresa de Níquel de Cuba (estatal)", valorMillones:null, confianza:"media-baja", lat:20.70, lon:75.57 },
    { id:3, nombre:"Pinares de Mayarí", provincia:"Holguín", mineralPrincipal:"Ni-Co", tipo:"Laterita", reservas:"~2.200 Mt (estimación histórica)", ley:"1,00% Ni · 0,07% Co", estado:"virgen", operador:"Sin explotar", valorMillones:null, confianza:"baja", lat:20.65, lon:76.15 },
    { id:4, nombre:"San Felipe", provincia:"Camagüey", mineralPrincipal:"Ni-Co", tipo:"Laterita", reservas:"~3.000 Mt (recurso inferido)", ley:"0,90% Ni · 0,09% Co", estado:"virgen", operador:"Sin explotar", valorMillones:60000, confianza:"baja", lat:21.65, lon:77.91 },
    { id:5, nombre:"Castellanos (Matahambre)", provincia:"Pinar del Río", mineralPrincipal:"Pb-Zn", tipo:"SEDEX/skarn", reservas:"~3,6 Mt de mineral", ley:"6,6% Zn · 4,8% Pb", estado:"activo", operador:"Geominera Pinar (estatal)", valorMillones:null, confianza:"alta", lat:22.60, lon:83.00 },
    { id:6, nombre:"La Demajagua — Delita", provincia:"Isla de la Juventud", mineralPrincipal:"Au-Ag", tipo:"Epitermal", reservas:"~3,4 Moz Au equiv. (JORC)", ley:"1,8 g/t Au", estado:"desarrollo", operador:"Antilles Gold / GeoMinera (JV)", valorMillones:3450, confianza:"media-alta", lat:21.70, lon:82.85 },
    { id:7, nombre:"El Cobre", provincia:"Santiago de Cuba", mineralPrincipal:"Cu", tipo:"VMS", reservas:"Agotadas (histórico)", ley:"—", estado:"histórico", operador:"Cerrada", valorMillones:null, confianza:"alta", lat:20.10, lon:75.85 },
    { id:8, nombre:"El Chorrillo — Tasajeras", provincia:"Camagüey", mineralPrincipal:"Zeolita", tipo:"Sedimentario", reservas:"producción activa", ley:"70-80% clinoptilolita", estado:"activo", operador:"Empresa de Zeolita (estatal)", valorMillones:null, confianza:"media", lat:21.80, lon:79.80 },
    { id:9, nombre:"Nueva Sabana", provincia:"Ciego de Ávila", mineralPrincipal:"Cu-Au", tipo:"Pórfido", reservas:"exploración avanzada", ley:"~0,3% Cu equiv.", estado:"construccion", operador:"Consorcio mixto", valorMillones:null, confianza:"baja", lat:22.05, lon:78.75 },
    { id:10, nombre:"Charco Redondo", provincia:"Granma", mineralPrincipal:"Mn", tipo:"Sedimentario", reservas:"~2 Mt (estimación)", ley:"~35% Mn", estado:"intermitente", operador:"Geominera Granma", valorMillones:null, confianza:"media-baja", lat:20.10, lon:76.50 },
    { id:11, nombre:"Loma de Jacinto (El Limón Nuevo, Beatriz, Sur de Elena)", provincia:"Camagüey (Guáimaro)", mineralPrincipal:"Au-Ag", tipo:"Epitermal vetas cuarzo", reservas:"8 t Au (7,6 t M+I); 10 vetas", ley:"83,54% Au · 14% Ag", estado:"desarrollo", operador:"GeoMinera Camagüey (Geominsal)", valorMillones:1029, confianza:"alta", lat:21.75, lon:76.65 },
    { id:12, nombre:"Golden Hill", provincia:"Las Tunas", mineralPrincipal:"Au", tipo:"Alta sulfuración", reservas:"activo desde 2011, ~60 kg Au/año", ley:"n.d.", estado:"activo", operador:"GeoMinera (inversión ALBA)", valorMillones:null, confianza:"media", lat:20.80, lon:76.50 },
    { id:13, nombre:"Falcón (UEB Placetas)", provincia:"Villa Clara", mineralPrincipal:"Au", tipo:"Listvenita (vetas)", reservas:"activo; sin reservas auditadas", ley:"n.d.", estado:"activo", operador:"UEB Producciones Mineras Placetas", valorMillones:null, confianza:"media", lat:22.31, lon:79.65 },
    { id:14, nombre:"Lote Grande (Jarahueca)", provincia:"Sancti Spíritus", mineralPrincipal:"Au", tipo:"Vetas cuarzo-auríferas", reservas:"~23-30 kg/año; procesa en Placetas", ley:"80-88% pureza", estado:"activo", operador:"UEB Producciones Mineras Placetas", valorMillones:null, confianza:"media", lat:22.05, lon:79.52 },
    { id:15, nombre:"Aguas Claras-Guajabales", provincia:"Holguín", mineralPrincipal:"Au", tipo:"Vetas / placeres", reservas:"histórico (cerró ~1939); artesanal activo", ley:"~0,5 g/t est.", estado:"intermitente", operador:"Artesanal / estatal", valorMillones:null, confianza:"media", lat:21.05, lon:76.10 },
    { id:16, nombre:"La Holguinera (Sector 27)", provincia:"Holguín", mineralPrincipal:"Au", tipo:"Vetítica / diseminada", reservas:"1.062.000 t mena → ~1.494 kg Au", ley:"~1,4 g/t", estado:"exploracion", operador:"GeoMinera Oriente", valorMillones:193, confianza:"media", lat:20.95, lon:76.05 },
    { id:17, nombre:"Distrito El Oro (cuenca río Bayamo)", provincia:"Granma/Santiago", mineralPrincipal:"Au", tipo:"Vetas / placeres", reservas:"histórico; cerrado desde la II GM", ley:"histórico", estado:"histórico", operador:"Cerrado", valorMillones:null, confianza:"media", lat:20.35, lon:76.70 },
    { id:18, nombre:"Santa Rosa (AEI Los Pasos)", provincia:"Villa Clara", mineralPrincipal:"Au-Ag", tipo:"VMS / polimetal", reservas:"exploración; contenidos muy altos Au-Ag", ley:"n.d.", estado:"exploracion", operador:"GeoMinera / Millbrook Minerals (Canadá)", valorMillones:null, confianza:"media-baja", lat:22.50, lon:80.00 },
    { id:19, nombre:"Mercedita-Caledonia (Cromita Moa)", provincia:"Holguín", mineralPrincipal:"Cromita", tipo:"Ofiolítico (podiforme)", reservas:"histórico; 'el más importante de América' (ONRM)", ley:"45-52% Cr₂O₃", estado:"histórico", operador:"Cerrada", valorMillones:null, confianza:"media", lat:20.40, lon:74.80 },
  ],
  valoracion: [
    { id:"ni_co_nac", mineral:"Ni-Co nacional", descripcion:"In-situ reservas nacionales (USGS + spot jun-2026)", valorMillones:121500, tipo:"in_situ_estimado", norma:"USGS/spot", confianza:"media" },
    { id:"san_felipe", mineral:"Ni-Co San Felipe", descripcion:"Recurso inferido (sin auditoría NI 43-101 o JORC)", valorMillones:60000, tipo:"recurso_inferido", norma:"estimación propia", confianza:"baja" },
    { id:"moa_pp", mineral:"Ni-Co Moa P+P", descripcion:"Reservas Probadas+Probables Moa (Sherritt NI 43-101)", valorMillones:27300, tipo:"reserva_probable", norma:"NI 43-101", confianza:"alta" },
    { id:"demajagua", mineral:"Au-Ag La Demajagua", descripcion:"Recurso JORC indicado+inferido (Antilles Gold/GeoMinera)", valorMillones:3450, tipo:"recurso_inferido", norma:"JORC 2012", confianza:"media-alta" },
    { id:"jacinto", mineral:"Au Loma de Jacinto", descripcion:"8 t Au (7,6 t M+I) GeoMinera Camagüey 2021. Revalorizado a spot jun-2026.", valorMillones:1029, tipo:"recurso_inferido", norma:"MINEM/GeoMinera (2021)", confianza:"alta" },
    { id:"la_holguinera", mineral:"Au La Holguinera (pronóst.)", descripcion:"Pronóstico GeoMinera: 1.062.000 t mena → ~1.494 kg Au. No auditado.", valorMillones:193, tipo:"in_situ_estimado", norma:"estimación propia", confianza:"media" },
    { id:"castellanos", mineral:"Pb-Zn Castellanos (anual)", descripcion:"Valor estimado de producción anual de concentrado", valorMillones:265, tipo:"flujo_anual", norma:"estimación propia", confianza:"media" },
    { id:"zeolita", mineral:"Zeolita Chorrillo (anual)", descripcion:"Exportaciones anuales estimadas (~80 USD/t)", valorMillones:18, tipo:"flujo_anual", norma:"estimación propia", confianza:"media-baja" },
  ],
  fajaAurifera: {
    titulo: "La faja aurífera de los ~400 km",
    descripcion: "Franja de ~400 km desde el sur de Santa Clara (Villa Clara) hasta el norte de Holguín, extendiéndose hacia Las Tunas y Camagüey. Dos familias geológicas: listvenitas (metasomáticas ofiolíticas) en el centro de la isla y epitermales de baja sulfuración en vetas de cuarzo (tipo Jacinto) en el arco volcánico Cretácico.",
    longitud_km: 400, desde: "Sur de Santa Clara", hasta: "Norte de Holguín / Las Tunas",
  },
  tipoMineralDistrib: [
    { mineral:"Níquel-Cobalto", valorMillones:121500, pct:96.1 },
    { mineral:"Oro-Plata (La Demajagua + Jacinto)", valorMillones:4479, pct:3.5 },
    { mineral:"Au potencial (La Holguinera)", valorMillones:193, pct:0.15 },
  ],
  proyeccion5a: {
    nota: "Sensibilidad al precio spot de Ni, Co y Au. Base 2026 = Ni-Co nacional + Au recursos confirmados. No descuenta costos ni VPN.",
    base2026: 126172,
    serie: [
      { anio:2026, bear:126172, base:126172, bull:126172 },
      { anio:2027, bear:120300, base:130700, bull:139600 },
      { anio:2028, bear:114400, base:135200, bull:153100 },
      { anio:2029, bear:108500, base:139700, bull:166500 },
      { anio:2030, bear:102600, base:144200, bull:180000 },
      { anio:2031, bear: 96700, base:148700, bull:193400 },
    ],
    escenarios: [
      { id:"bear", label:"Bajista", color:"#C4392B", sup:"Ni 13k · Co 25k · Au 3.200 USD/oz" },
      { id:"base", label:"Base",    color:"#9EAAB8", sup:"Ni 20k · Co 40k · Au 5.000 USD/oz" },
      { id:"bull", label:"Alcista", color:"#24874A", sup:"Ni 26k · Co 60k · Au 6.500 USD/oz" },
    ],
  },
  produccion: [
    { anio:"2019", ni_t:48900, co_t:3600, zn_t:60000, pb_t:35000 },
    { anio:"2020", ni_t:49700, co_t:3800, zn_t:60000, pb_t:34000 },
    { anio:"2021", ni_t:46800, co_t:3800, zn_t:45000, pb_t:29000 },
    { anio:"2022", ni_t:46200, co_t:3700, zn_t:52000, pb_t:33000 },
    { anio:"2023", ni_t:43000, co_t:3100, zn_t:58000, pb_t:35000 },
    { anio:"2024", ni_t:null,  co_t:null,  zn_t:null,  pb_t:null, nota:"sin datos confirmados" },
    { anio:"2025", ni_t:25240, co_t:2728,  zn_t:null,  pb_t:null, nota:"Sherritt Q4 2025 + sanciones EE.UU." },
  ],
  proceso_ni_co: [
    { paso:1, nombre:"Mina a cielo abierto",       detalle:"Draglines y camiones de 180-200 t extraen lateritas (limonita/saprolita) 24 h al día en Moa, Holguín.",                                          tipo:"extraccion" },
    { paso:2, nombre:"Trituración y clasificación", detalle:"Cribado húmedo: fracciones <2 mm (limonita, alta Fe) y >2 mm (saprolita, alta Mg). Flujo principal: limonita.",                                   tipo:"preparacion" },
    { paso:3, nombre:"Lixiviación ácida — HPAL",    detalle:"Autoclave a 250 °C y 50 bar con H₂SO₄ concentrado. Disolución selectiva de Ni y Co; el Fe precipita como hematita.",                             tipo:"proceso" },
    { paso:4, nombre:"Separación sólido/líquido",   detalle:"Lavado en contracorriente (CCD). Recuperación del licor cargado con Ni²⁺ y Co²⁺.",                                                               tipo:"proceso" },
    { paso:5, nombre:"Neutralización",              detalle:"Coral (CaCO₃) eleva el pH y precipita impurezas residuales: Fe, Al, Cr.",                                                                         tipo:"proceso" },
    { paso:6, nombre:"Precipitación — MSP",         detalle:"H₂S gasoso precipita el sulfuro mixto de Ni-Co (Mixed Sulphide Precipitate). Producto final de la planta en Moa.",                                tipo:"proceso" },
    { paso:7, nombre:"Transporte a refinería",      detalle:"El MSP se embarcaba hacia Fort Saskatchewan (Alberta, Canadá). Cadena interrumpida desde junio 2026 por cierre de Sherritt.",                    tipo:"transporte", alerta:true },
    { paso:8, nombre:"Refinería — Fort Saskatchewan", detalle:"Lixiviación amoniacal + electrólisis → Ni 99,9 % y Co 99,9 % grado LME. CERRADA jun 2026: primer cierre en 70 años de operación.",           tipo:"refinado", alerta:true },
  ],
  encuesta: {
    intro: "Tres preguntas sobre los minerales cubanos y sus implicaciones geopolíticas.",
    preguntas: [
      { id:"q1", texto:"¿Sabías que Cuba está entre los tres mayores poseedores de reservas de cobalto del mundo?",
        opciones:[ {id:"q1a",label:"Sí, lo sabía",seed:340}, {id:"q1b",label:"Lo sospechaba",seed:290}, {id:"q1c",label:"No, me sorprende",seed:510} ] },
      { id:"q2", texto:"¿Qué impacto crees que tendrán las sanciones de EE.UU. sobre el níquel cubano?",
        opciones:[ {id:"q2a",label:"Bloqueo casi total de ventas",seed:620}, {id:"q2b",label:"Redireccionamiento a China/Rusia",seed:480}, {id:"q2c",label:"Efecto limitado a largo plazo",seed:185} ] },
      { id:"q3", texto:"¿Cómo valoras la estrategia de atraer inversión rusa y china para la minería cubana?",
        opciones:[ {id:"q3a",label:"Pragmática, no hay alternativa",seed:550}, {id:"q3b",label:"Riesgosa: cambia una dependencia por otra",seed:700}, {id:"q3c",label:"Negativa en cualquier contexto",seed:220} ] },
    ],
  },
};

const DATA_URL = (process.env.PUBLIC_URL || "") + "/data/mineria.json";

/* ─── componente principal ─────────────────────────────────────────────── */
export default function App() {
  const [data, setData] = useState(EMBEDDED);
  const [tab, setTab]   = useState("mapa");

  useEffect(() => {
    let live = true;
    fetch(DATA_URL)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => { if (live) setData(j); })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  useEffect(() => {
    cargarFuentes();
  }, []);

  const alerta = data.alertaGeopolitica || {};
  const TABS = ["mapa","valoracion","produccion","proceso","encuesta"];
  const TL = { mapa:"Mapa de recursos", valoracion:"Valoración", produccion:"Producción", proceso:"Proceso HPAL", encuesta:"Encuesta" };

  return (
    <div style={{ background:COL.bg, color:COL.text, fontFamily:"'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      <style>{CSS}</style>
      <div className="mn-wrap">

        {/* ─── cabecera ─── */}
        <header className="mn-hero">
          <div className="mn-eyebrow">Yamacoa · Recursos minerales · Cuba</div>
          <h1 className="mn-h1">{data.meta?.titulo}</h1>
          <p className="mn-sub">{data.meta?.subtitulo}</p>
          <div className="mn-fuente-line">
            <span className="mn-fuente-tag">Fuentes</span> {data.meta?.fuente}
          </div>

          {/* KPIs */}
          <div className="mn-kpis">
            {(data.kpis || []).map(k => (
              <div key={k.id} className="mn-kpi">
                <div className="mn-kpi-val">{k.valor}</div>
                <div className="mn-kpi-lbl">{k.label}</div>
                <div className="mn-kpi-sub">{k.sub}</div>
                <span className={"mn-conf mn-conf-" + k.confianza}>{k.confianza}</span>
              </div>
            ))}
          </div>

          {/* alerta geopolítica */}
          {alerta.activa && (
            <div className="mn-alerta">
              <div className="mn-alerta-hd"><span>⚠</span> RUPTURA GEOPOLÍTICA 2026</div>
              <ul className="mn-alerta-ul">
                {(alerta.items || []).map((it, i) => <li key={i}>{it}</li>)}
              </ul>
            </div>
          )}

          {data.meta?.nota && <p className="mn-nota">{data.meta.nota}</p>}
        </header>

        {/* ─── tabs ─── */}
        <div className="mn-tabs" role="tablist">
          {TABS.map(t => (
            <button key={t} role="tab" aria-selected={tab === t}
              className={"mn-tab" + (tab === t ? " active" : "")}
              onClick={() => setTab(t)}>
              {TL[t]}
            </button>
          ))}
        </div>

        {/* ─── contenido ─── */}
        <div className="mn-content">
          {tab === "mapa"       && <TabMapa data={data} />}
          {tab === "valoracion" && <TabValoracion data={data} />}
          {tab === "produccion" && <TabProduccion data={data} />}
          {tab === "proceso"    && <TabProceso data={data} />}
          {tab === "encuesta"   && <TabEncuesta data={data} />}
        </div>

        <footer className="mn-foot">
          <span>Yamacoa · {data.meta?.periodo}</span>
          <span>Actualizado {data.meta?.actualizado}</span>
        </footer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB: MAPA
═══════════════════════════════════════════════════════════════════════════ */
function TabMapa({ data }) {
  const [hovered, setHovered] = useState(null);
  const [filtro,  setFiltro]  = useState("todos");

  const yacs = data.yacimientos || [];
  const minerales = ["todos", ...Array.from(new Set(yacs.map(y => y.mineralPrincipal)))];
  const filtered = filtro === "todos" ? yacs : yacs.filter(y => y.mineralPrincipal === filtro);
  const hovMine = hovered ? yacs.find(y => y.id === hovered) : null;

  return (
    <div className="mn-tab-mapa">
      {/* mapa SVG */}
      <div className="mn-mapa-wrap" onMouseLeave={() => setHovered(null)}>
        <svg viewBox="0 0 720 190" style={{ width:"100%", height:"auto", display:"block" }}
          aria-label="Mapa de yacimientos minerales de Cuba">
          <defs>
            <filter id="glow-mn">
              <feGaussianBlur stdDeviation="3" result="b"/>
              <feComposite in="SourceGraphic" in2="b" operator="over"/>
            </filter>
          </defs>

          {/* isla principal */}
          <path d={CUBA_POLY} fill={COL.panel2} stroke="rgba(60,40,20,.35)" strokeWidth="1"/>

          {/* Isla de la Juventud */}
          <ellipse cx={IJ.cx} cy={IJ.cy} rx={IJ.rx} ry={IJ.ry}
            fill={COL.panel2} stroke="rgba(60,40,20,.35)" strokeWidth="1"/>

          {/* marcadores de yacimientos */}
          {yacs.map(y => {
            const { x, y: sy } = toSVG(y.lon, y.lat);
            const isHov = hovered === y.id;
            const isDim = filtro !== "todos" && y.mineralPrincipal !== filtro;
            const r = y.valorMillones > 20000 ? 8 : y.valorMillones > 1000 ? 6 : 4;
            return (
              <g key={y.id} style={{ cursor:"pointer" }}
                onMouseEnter={() => setHovered(y.id)}
                onClick={() => setHovered(hovered === y.id ? null : y.id)}>
                {isHov && (
                  <circle cx={x} cy={sy} r={r + 5}
                    fill="none" stroke={mCol(y.mineralPrincipal)} strokeWidth="1.5" opacity=".5"/>
                )}
                <circle cx={x} cy={sy} r={r}
                  fill={mCol(y.mineralPrincipal)}
                  stroke={isHov ? COL.text : "rgba(252,249,244,.95)"}
                  strokeWidth={isHov ? 1.5 : 1}
                  opacity={isDim ? 0.2 : y.estado === "histórico" ? 0.5 : 1}
                  filter={isHov ? "url(#glow-mn)" : undefined}
                />
                <title>{y.nombre} · {y.mineralPrincipal} · {ESTADO[y.estado]?.label}</title>
              </g>
            );
          })}

          {/* leyenda interna */}
          {[["Ni-Co","Níquel-Cobalto"],["Au-Ag","Oro · Plata"],["Pb-Zn","Plomo-Zinc"],["Cu","Cobre"],["Zeolita","Zeolita"],["Mn","Manganeso"],["Cromita","Cromita"]].map(([k,lbl], i) => (
            <g key={k} transform={`translate(14,${102 + i * 12})`}>
              <circle cx="5" cy="0" r="4" fill={mCol(k)} opacity=".9"/>
              <text x="13" y="4" fontSize="9" fill={COL.muted}>{lbl}</text>
            </g>
          ))}
        </svg>

        {/* tooltip al pasar el cursor */}
        {hovMine && (
          <div className="mn-mapa-tip">
            <div className="mn-tip-nombre">{hovMine.nombre}</div>
            <div className="mn-tip-prov">{hovMine.provincia}</div>
            <div className="mn-tip-grid">
              <span className="mn-tip-lbl">Mineral</span>
              <span style={{ color: mCol(hovMine.mineralPrincipal), fontWeight:600 }}>{hovMine.mineralPrincipal}</span>
              <span className="mn-tip-lbl">Estado</span>
              <span style={{ color: ESTADO[hovMine.estado]?.col }}>{ESTADO[hovMine.estado]?.label}</span>
              {hovMine.ley && <><span className="mn-tip-lbl">Ley</span><span>{hovMine.ley}</span></>}
              {hovMine.valorMillones && <><span className="mn-tip-lbl">Valor in-situ</span><span className="mn-tip-valor">{hovMine.valorMillones.toLocaleString("es")} M USD</span></>}
            </div>
            {hovMine.reservas && <div className="mn-tip-res">{hovMine.reservas}</div>}
            {hovMine.confianza && <span className={"mn-conf mn-conf-" + hovMine.confianza}>{hovMine.confianza}</span>}
          </div>
        )}
      </div>

      {/* filtro y tabla */}
      <div className="mn-mapa-tabla-wrap">
        <div className="mn-filtro-wrap">
          <span className="mn-filtro-lbl">Filtrar por mineral</span>
          <div className="mn-filtro-btns">
            {minerales.map(m => (
              <button key={m} className={"mn-filtro-btn" + (filtro === m ? " active" : "")}
                onClick={() => setFiltro(m)}
                style={filtro === m && m !== "todos" ? { background: mCol(m), color:"#fcf9f4", borderColor: mCol(m) } : {}}>
                {m === "todos" ? "Todos" : m}
              </button>
            ))}
          </div>
        </div>

        <div className="mn-tabla-scroll">
          <table className="mn-tabla">
            <thead>
              <tr>
                <th>Yacimiento</th>
                <th>Provincia</th>
                <th>Mineral</th>
                <th>Estado</th>
                <th>Valor in-situ</th>
                <th>Confianza</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((y, i) => (
                <tr key={y.id} className={i % 2 === 0 ? "even" : ""}
                  style={hovered === y.id ? { background: COL.primGlow } : {}}>
                  <td>
                    <span className="mn-dot" style={{ background: mCol(y.mineralPrincipal) }}/>
                    {y.nombre}
                  </td>
                  <td>{y.provincia}</td>
                  <td style={{ color: mCol(y.mineralPrincipal), fontWeight:600 }}>{y.mineralPrincipal}</td>
                  <td>
                    <span className="mn-badge" style={{ color: ESTADO[y.estado]?.col, borderColor: ESTADO[y.estado]?.col + "44" }}>
                      {ESTADO[y.estado]?.label}
                    </span>
                  </td>
                  <td className="mn-num">
                    {y.valorMillones ? y.valorMillones.toLocaleString("es") + " M USD" : "—"}
                  </td>
                  <td>
                    <span className={"mn-conf mn-conf-" + y.confianza}>{y.confianza}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* faja aurífera */}
      {data.fajaAurifera && (
        <div className="mn-faja-box">
          <div className="mn-faja-hd">{data.fajaAurifera.titulo}</div>
          <p className="mn-faja-desc">{data.fajaAurifera.descripcion}</p>
          <div className="mn-faja-stats">
            <span className="mn-faja-stat">
              <span className="mn-faja-val">{data.fajaAurifera.longitud_km} km</span>
              <span className="mn-faja-lbl">extensión</span>
            </span>
            <span className="mn-faja-stat">
              <span className="mn-faja-val">{data.fajaAurifera.desde}</span>
              <span className="mn-faja-lbl">inicio</span>
            </span>
            <span className="mn-faja-stat">
              <span className="mn-faja-val">{data.fajaAurifera.hasta}</span>
              <span className="mn-faja-lbl">fin</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB: VALORACIÓN
═══════════════════════════════════════════════════════════════════════════ */
const CONF_COL = { alta:"#24874A", "media-alta":"#3B7F9E", media:COL.nickel, "media-baja":"#9A6420", baja:COL.alert };

/* ─── donut: distribución por tipo mineral ─── */
const DCOL = { "Níquel-Cobalto": COL.primary, "Oro-Plata (La Demajagua + Jacinto)": COL.gold, "Au potencial (La Holguinera)": "#B39020" };

function TipoDonut({ distrib }) {
  if (!distrib?.length) return null;
  const total = distrib.reduce((s, d) => s + d.valorMillones, 0);
  return (
    <div className="mn-donut-wrap">
      <div className="mn-chart-lbl">Composición por valor in-situ estimado</div>
      <div className="mn-donut-inner">
        <PieChart width={240} height={240}>
          <Pie data={distrib} cx={120} cy={120} innerRadius={68} outerRadius={108}
            dataKey="valorMillones" nameKey="mineral" paddingAngle={2} startAngle={90} endAngle={-270}>
            {distrib.map((d, i) => (
              <Cell key={i} fill={DCOL[d.mineral] ?? COL.nickel} opacity={.85}/>
            ))}
          </Pie>
          <Tooltip formatter={(v, n) => [v.toLocaleString("es") + " M USD", n]}
            contentStyle={{ background:COL.panel, border:`1px solid ${COL.nodeBdr}`, borderRadius:12, boxShadow:"0 8px 24px rgba(40,25,10,.14)", fontSize:12 }}/>
        </PieChart>
        <div className="mn-donut-legend">
          {distrib.map((d, i) => (
            <div key={i} className="mn-donut-litem">
              <span className="mn-dl-dot" style={{ background: DCOL[d.mineral] ?? COL.nickel }}/>
              <div>
                <div className="mn-dl-nombre">{d.mineral}</div>
                <div className="mn-dl-val">{d.valorMillones.toLocaleString("es")} M USD</div>
                <div className="mn-dl-pct">{d.pct?.toFixed(1)} %</div>
              </div>
            </div>
          ))}
          <div className="mn-dl-total">Total: {total.toLocaleString("es")} M USD</div>
        </div>
      </div>
    </div>
  );
}

/* ─── líneas: proyección 5 años ─── */
const PrTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="mn-recharts-tip">
      <div className="mn-rt-nombre">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginTop:4, fontSize:12 }}>
          {p.name}: {p.value != null ? p.value.toLocaleString("es") + " M USD" : "—"}
        </div>
      ))}
    </div>
  );
};

function ProyeccionChart({ proy }) {
  if (!proy?.serie?.length) return null;
  const esc = proy.escenarios || [];
  return (
    <div className="mn-proy-wrap">
      <div className="mn-chart-lbl">Proyección de valor in-situ 2026-2031 — tres escenarios de precio spot</div>
      <div style={{ height:240, marginBottom:8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={proy.serie} margin={{ top:8, right:24, left:0, bottom:0 }}>
            <CartesianGrid vertical={false} stroke={COL.line}/>
            <XAxis dataKey="anio" tick={{ fill:COL.muted, fontSize:11 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill:COL.muted, fontSize:10 }} axisLine={false} tickLine={false}
              tickFormatter={v => (v/1000).toFixed(0) + "k"}
              label={{ value:"M USD", angle:-90, position:"insideLeft", fill:COL.faint, fontSize:10, dy:30 }}/>
            <Tooltip content={<PrTip/>}/>
            {esc.map(e => (
              <Line key={e.id} type="monotone" dataKey={e.id} name={e.label}
                stroke={e.color} strokeWidth={e.id === "base" ? 2 : 1.5}
                strokeDasharray={e.id === "bear" ? "4 3" : e.id === "bull" ? "4 3" : undefined}
                dot={{ fill:e.color, r:3 }} activeDot={{ r:5 }}/>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mn-proy-legend">
        {esc.map(e => (
          <span key={e.id} className="mn-proy-litem">
            <span style={{ background:e.color, width:20, height:2, display:"inline-block", verticalAlign:"middle", marginRight:6, borderRadius:1 }}/>
            <span style={{ color:e.color, fontWeight:600, marginRight:6 }}>{e.label}</span>
            <span style={{ color:COL.faint, fontSize:10 }}>{e.sup}</span>
          </span>
        ))}
      </div>
      <p className="mn-nota" style={{ marginTop:10 }}>{proy.nota}</p>
    </div>
  );
}

const ValTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="mn-recharts-tip">
      <div className="mn-rt-nombre">{d.mineral}</div>
      <div className="mn-rt-val">{d.valorMillones.toLocaleString("es")} M USD</div>
      <div className="mn-rt-tipo">{d.tipo.replace(/_/g, " ")}</div>
      <div className="mn-rt-norma">Norma: {d.norma}</div>
      <div className="mn-rt-desc">{d.descripcion}</div>
      <span className={"mn-conf mn-conf-" + d.confianza}>{d.confianza}</span>
    </div>
  );
};

function TabValoracion({ data }) {
  const val = [...(data.valoracion || [])].sort((a, b) => b.valorMillones - a.valorMillones);
  const chartData = val.map(v => ({ ...v, label: v.mineral.length > 22 ? v.mineral.slice(0,22)+"…" : v.mineral }));

  return (
    <div>
      <div className="mn-section-title">Valor estimado de los recursos minerales</div>
      <p className="mn-section-desc">
        Comparación de valoraciones por tipo de norma técnica. Los valores in-situ son estimaciones brutas:
        el valor recuperable neto puede ser 5-10x menor tras descontar costos, recuperación metalúrgica y tiempo.
      </p>

      {/* donut de composición */}
      <TipoDonut distrib={data.tipoMineralDistrib} />

      {/* gráfico horizontal */}
      <div style={{ height:320, marginBottom:24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top:0, right:130, left:0, bottom:0 }}>
            <CartesianGrid horizontal={false} stroke={COL.line}/>
            <XAxis type="number" dataKey="valorMillones" tickFormatter={v => v >= 1000 ? (v/1000).toFixed(0)+"k" : v}
              tick={{ fill:COL.muted, fontSize:11 }} axisLine={false} tickLine={false}
              label={{ value:"M USD", position:"insideBottomRight", offset:-5, fill:COL.faint, fontSize:10 }}/>
            <YAxis type="category" dataKey="label" width={165} tick={{ fill:COL.text, fontSize:11.5 }}
              axisLine={false} tickLine={false}/>
            <Tooltip content={<ValTooltip/>}/>
            <Bar dataKey="valorMillones" radius={[0,4,4,0]} maxBarSize={32}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={mCol(entry.mineral.split(" ")[0])}
                  fillOpacity={entry.tipo === "in_situ_estimado" ? 0.5 : entry.tipo === "flujo_anual" ? 0.65 : 0.85}/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* tabla detallada */}
      <div className="mn-tabla-scroll">
        <table className="mn-tabla">
          <thead>
            <tr>
              <th>Mineral / Yacimiento</th>
              <th>Valor (M USD)</th>
              <th>Tipo de estimación</th>
              <th>Norma</th>
              <th>Confianza</th>
            </tr>
          </thead>
          <tbody>
            {val.map((v, i) => (
              <tr key={v.id} className={i % 2 === 0 ? "even" : ""}>
                <td>
                  <span className="mn-dot" style={{ background: mCol(v.mineral.split(" ")[0]) }}/>
                  <div>
                    <div style={{ fontWeight:600 }}>{v.mineral}</div>
                    <div style={{ fontSize:11, color:COL.muted, marginTop:2 }}>{v.descripcion}</div>
                  </div>
                </td>
                <td className="mn-num mn-num-big">{v.valorMillones.toLocaleString("es")} M</td>
                <td>
                  <span className="mn-tipo-badge">
                    {v.tipo === "reserva_probable" && "Reserva P+P"}
                    {v.tipo === "recurso_inferido" && "Recurso inferido"}
                    {v.tipo === "in_situ_estimado" && "In-situ estimado"}
                    {v.tipo === "flujo_anual"       && "Flujo anual"}
                  </span>
                </td>
                <td style={{ color:COL.muted, fontSize:12 }}>{v.norma}</td>
                <td><span className={"mn-conf mn-conf-" + v.confianza}>{v.confianza}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mn-nota" style={{ marginTop:16 }}>
        Opacidad del gráfico: alta = reserva auditada, media = recurso inferido, baja = estimación propia o flujo anual.
        El valor in-situ nacional ({(121500000).toLocaleString("es")} miles USD) excede el PIB anual de Cuba (estimado ~80.000 M USD en 2022).
      </div>

      {/* proyección 5 años */}
      <ProyeccionChart proy={data.proyeccion5a} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB: PRODUCCIÓN
═══════════════════════════════════════════════════════════════════════════ */
const ProdTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="mn-recharts-tip">
      <div className="mn-rt-nombre">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginTop:4 }}>
          {p.name}: {p.value != null ? p.value.toLocaleString("es") + " t" : "sin datos"}
        </div>
      ))}
      {payload[0]?.payload?.nota && (
        <div style={{ marginTop:6, fontSize:11, color:COL.muted }}>{payload[0].payload.nota}</div>
      )}
    </div>
  );
};

function TabProduccion({ data }) {
  const prod = data.produccion || [];

  const pico = 49700;
  const ult  = prod.find(p => p.anio === "2025");
  const caida = ult?.ni_t ? Math.round((1 - ult.ni_t / pico) * 100) : null;

  return (
    <div>
      <div className="mn-section-title">Producción de níquel y cobalto · 2019-2025</div>
      <p className="mn-section-desc">
        La producción de Ni-mina se derrumbó un {caida}% desde el pico de 2020 (49.700 t)
        hasta 2025 (25.240 t). Las sanciones de mayo de 2026 aceleran la tendencia estructural
        iniciada por el envejecimiento de la planta de Moa y la salida progresiva de Sherritt.
        El dato de 2024 no está disponible en fuentes públicas.
      </p>

      {/* estadísticas rápidas */}
      <div className="mn-prod-stats">
        <div className="mn-ps"><div className="mn-ps-v">{pico.toLocaleString("es")} t</div><div className="mn-ps-l">Pico Ni (2020)</div></div>
        <div className="mn-ps mn-ps-alert">
          <div className="mn-ps-v" style={{ color:COL.alert }}>{ult?.ni_t?.toLocaleString("es")} t</div>
          <div className="mn-ps-l">Ni en 2025 <span className="mn-ps-badge">-{caida}%</span></div>
        </div>
        <div className="mn-ps"><div className="mn-ps-v">{ult?.co_t?.toLocaleString("es")} t</div><div className="mn-ps-l">Co en 2025</div></div>
        <div className="mn-ps mn-ps-alert">
          <div className="mn-ps-v" style={{ color:COL.alert }}>0</div>
          <div className="mn-ps-l">Refinerías Co activas en Norteamérica</div>
        </div>
      </div>

      {/* gráfico Ni */}
      <div className="mn-chart-lbl">Níquel en mina (toneladas métricas)</div>
      <div style={{ height:240, marginBottom:8 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={prod} margin={{ top:8, right:24, left:0, bottom:0 }}>
            <CartesianGrid vertical={false} stroke={COL.line}/>
            <XAxis dataKey="anio" tick={{ fill:COL.muted, fontSize:11 }} axisLine={false} tickLine={false}/>
            <YAxis yAxisId="ni" tick={{ fill:COL.muted, fontSize:10 }} axisLine={false} tickLine={false}
              tickFormatter={v => v != null ? (v/1000).toFixed(0)+"k" : ""}/>
            <YAxis yAxisId="co" orientation="right" tick={{ fill:COL.sec, fontSize:10 }}
              axisLine={false} tickLine={false}
              tickFormatter={v => v != null ? (v/1000).toFixed(1)+"k" : ""}/>
            <Tooltip content={<ProdTooltip/>}/>
            <ReferenceLine yAxisId="ni" x="2025" stroke={COL.alert} strokeDasharray="3 3" strokeWidth={1}
              label={{ value:"Sanciones EE.UU.", position:"insideTopRight", fill:COL.alert, fontSize:9 }}/>
            <Bar yAxisId="ni" dataKey="ni_t" name="Ni (t)" fill={COL.primary} fillOpacity=".75" radius={[3,3,0,0]} maxBarSize={44}/>
            <Line yAxisId="co" dataKey="co_t" name="Co (t)" stroke={COL.sec} strokeWidth={2}
              dot={{ fill:COL.sec, r:3 }} activeDot={{ r:5 }} connectNulls={false}/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display:"flex", gap:20, fontSize:12, color:COL.muted, marginBottom:24, flexWrap:"wrap" }}>
        <span><span style={{ display:"inline-block", width:12, height:12, background:COL.primary, borderRadius:2, verticalAlign:"middle", marginRight:5 }}/>Ni (eje izq., kt)</span>
        <span><span style={{ display:"inline-block", width:24, height:2, background:COL.sec, verticalAlign:"middle", marginRight:5 }}/>Co (eje der., kt)</span>
        <span>Brecha en 2024: sin datos públicos confirmados</span>
      </div>

      {/* tabla */}
      <div className="mn-tabla-scroll">
        <table className="mn-tabla">
          <thead>
            <tr><th>Año</th><th>Ni (t)</th><th>Co (t)</th><th>Zn (t)</th><th>Pb (t)</th><th>Nota</th></tr>
          </thead>
          <tbody>
            {prod.map((p, i) => (
              <tr key={p.anio} className={i % 2 === 0 ? "even" : ""}
                style={p.anio === "2025" ? { background:COL.alertBg } : {}}>
                <td style={{ fontWeight:600, fontFamily:"'IBM Plex Mono', monospace" }}>{p.anio}</td>
                <td className="mn-num">{p.ni_t != null ? p.ni_t.toLocaleString("es") : "—"}</td>
                <td className="mn-num">{p.co_t != null ? p.co_t.toLocaleString("es") : "—"}</td>
                <td className="mn-num">{p.zn_t != null ? p.zn_t.toLocaleString("es") : "—"}</td>
                <td className="mn-num">{p.pb_t != null ? p.pb_t.toLocaleString("es") : "—"}</td>
                <td style={{ fontSize:11.5, color:COL.muted }}>{p.nota || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB: PROCESO HPAL
═══════════════════════════════════════════════════════════════════════════ */
function TabProceso({ data }) {
  const pasos = data.proceso_ni_co || [];

  return (
    <div>
      <div className="mn-section-title">Cadena de valor del níquel laterítico — proceso HPAL</div>
      <p className="mn-section-desc">
        La planta de Moa opera con tecnología HPAL (High Pressure Acid Leach), el estándar
        mundial para lateritas. El sulfuro mixto (MSP) producido en Cuba viajaba a Fort
        Saskatchewan (Canadá) para su refinación. El cierre de Sherritt en junio de 2026
        rompe esa cadena, dejando a Cuba con el concentrado sin refinar.
      </p>

      {/* diagrama de flujo */}
      <div className="mn-proc-scroll">
        <div className="mn-proc-flow">
          {pasos.map((p, i) => (
            <React.Fragment key={p.paso}>
              <div className={"mn-proc-step" + (p.alerta ? " interrupted" : "")}>
                <div className="mn-proc-num">{p.paso}</div>
                <div className="mn-proc-tipo" style={{ color: PROC_COL[p.tipo] || COL.nickel }}>
                  {p.tipo.toUpperCase()}
                </div>
                <div className="mn-proc-nombre" style={{ color: p.alerta ? COL.alert : COL.text }}>
                  {p.nombre}
                </div>
                <p className="mn-proc-det">{p.detalle}</p>
                {p.alerta && (
                  <div className="mn-proc-alert-badge">CADENA ROTA jun-2026</div>
                )}
              </div>
              {i < pasos.length - 1 && (
                <div className={"mn-proc-arr" + (pasos[i + 1].alerta ? " interrupted" : "")}>
                  <svg width="22" height="18" viewBox="0 0 22 18" style={{ flexShrink:0 }}>
                    <line x1="0" y1="9" x2="14" y2="9" stroke={pasos[i + 1].alerta ? COL.alert : COL.faint} strokeWidth="1.5" strokeDasharray={pasos[i + 1].alerta ? "3 2" : undefined}/>
                    <polygon points="14,4 22,9 14,14" fill={pasos[i + 1].alerta ? COL.alert : COL.faint}/>
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* leyenda de tipos */}
      <div className="mn-proc-leyenda">
        {Object.entries(PROC_COL).map(([k, c]) => (
          <span key={k} className="mn-proc-ley-item">
            <span style={{ background:c, width:8, height:8, borderRadius:2, display:"inline-block" }}/>
            {k}
          </span>
        ))}
      </div>

      {/* caja de datos técnicos */}
      <div className="mn-proc-ficha">
        <div className="mn-proc-ficha-title">Parámetros operativos clave — Moa (referencia pre-suspensión)</div>
        <div className="mn-proc-ficha-grid">
          <div className="mn-pf-item"><span className="mn-pf-lbl">Temperatura HPAL</span><span>250 °C</span></div>
          <div className="mn-pf-item"><span className="mn-pf-lbl">Presión HPAL</span><span>~50 bar</span></div>
          <div className="mn-pf-item"><span className="mn-pf-lbl">Recuperación Ni</span><span>~93 %</span></div>
          <div className="mn-pf-item"><span className="mn-pf-lbl">Recuperación Co</span><span>~90 %</span></div>
          <div className="mn-pf-item"><span className="mn-pf-lbl">Reactivo ácido</span><span>H₂SO₄ concentrado</span></div>
          <div className="mn-pf-item"><span className="mn-pf-lbl">Neutralizante</span><span>Coral marino (CaCO₃)</span></div>
          <div className="mn-pf-item"><span className="mn-pf-lbl">Producto intermedio</span><span>MSP (Mixed Sulphide Precipitate)</span></div>
          <div className="mn-pf-item"><span className="mn-pf-lbl">Producto final</span><span style={{ color:COL.alert }}>⚠ Sin refinería activa</span></div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB: ENCUESTA
═══════════════════════════════════════════════════════════════════════════ */
const POLL_KEY = "ymPollMineria";

function loadPoll() {
  try { return JSON.parse(localStorage.getItem(POLL_KEY) || "{}"); } catch { return {}; }
}
function savePoll(s) {
  try { localStorage.setItem(POLL_KEY, JSON.stringify(s)); } catch {}
}

function TabEncuesta({ data }) {
  const enc = data.encuesta || {};
  const [stored, setStored] = useState(loadPoll);

  function vote(qid, oid) {
    const next = { ...stored, [`${qid}_vote`]: oid };
    setStored(next);
    savePoll(next);
  }

  function getCount(qid, oid, seed) {
    const k = `${qid}_${oid}`;
    return seed + (stored[k] || 0) + (stored[`${qid}_vote`] === oid ? 1 : 0);
  }

  return (
    <div>
      <div className="mn-section-title">Percepción sobre la minería cubana</div>
      <p className="mn-section-desc">{enc.intro}</p>

      {(enc.preguntas || []).map(q => {
        const voted = stored[`${q.id}_vote`];
        const totalVotes = q.opciones.reduce((s, o) => s + getCount(q.id, o.id, o.seed), 0);

        return (
          <div key={q.id} className="mn-poll-q">
            <p className="mn-poll-texto">{q.texto}</p>
            <div className="mn-poll-ops">
              {q.opciones.map(o => {
                const count = getCount(q.id, o.id, o.seed);
                const pct   = totalVotes > 0 ? Math.round(count / totalVotes * 100) : 0;
                const sel   = voted === o.id;

                return (
                  <div key={o.id} className={"mn-poll-op" + (sel ? " selected" : "") + (voted && !sel ? " dimmed" : "")}
                    onClick={() => !voted && vote(q.id, o.id)}>
                    <div className="mn-poll-bar-bg">
                      <div className="mn-poll-bar-fill" style={{ width: voted ? pct + "%" : "0%" }}/>
                    </div>
                    <div className="mn-poll-op-inner">
                      <span>{o.label}</span>
                      {voted && <span className="mn-poll-pct">{pct}%</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            {voted && <p className="mn-poll-total">{totalVotes.toLocaleString("es")} respuestas</p>}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════════════════════ */
const CSS = `
*{box-sizing:border-box}
.mn-wrap{max-width:1100px;margin:0 auto;padding:24px 18px 64px;--sh:var(--y-shadow,0 1px 2px rgba(40,25,10,.04),0 10px 30px rgba(40,25,10,.055))}

/* hero */
.mn-eyebrow{font-family:'IBM Plex Mono',monospace;font-size:11px;text-transform:uppercase;
  letter-spacing:.18em;color:${COL.primary};margin-bottom:10px}
.mn-hero{padding:8px 0 28px}
.mn-h1{font-size:38px;font-weight:800;letter-spacing:-.025em;margin:0 0 10px;line-height:1.1}
.mn-sub{color:#4a3f36;font-size:16px;margin:0 0 12px;line-height:1.5}
.mn-fuente-line{font-size:12px;color:${COL.faint};margin-bottom:20px}
.mn-fuente-tag{font-family:'IBM Plex Mono',monospace;background:${COL.nodeBdr};
  padding:1px 7px;border-radius:4px;margin-right:8px;font-size:10px;text-transform:uppercase;letter-spacing:.1em}

/* kpis */
.mn-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:20px}
.mn-kpi{background:${COL.node};border:0;box-shadow:var(--sh);border-radius:20px;
  padding:14px 16px;position:relative}
.mn-kpi-val{font-family:'IBM Plex Mono',monospace;font-size:20px;font-weight:700;
  color:${COL.primary};line-height:1.2;margin-bottom:4px}
.mn-kpi-lbl{font-size:12.5px;font-weight:600;color:${COL.text};margin-bottom:3px}
.mn-kpi-sub{font-size:11px;color:${COL.muted};line-height:1.4}

/* confianza badge */
.mn-conf{display:inline-block;font-family:'IBM Plex Mono',monospace;font-size:9.5px;
  padding:1px 6px;border-radius:4px;border:1px solid;margin-top:6px;text-transform:lowercase}
.mn-conf-alta{color:#24874A;border-color:#24874A55}
.mn-conf-media-alta{color:#3B7F9E;border-color:#3B7F9E44}
.mn-conf-media{color:${COL.nickel};border-color:${COL.nodeBdr}}
.mn-conf-media-baja{color:#9A6420;border-color:#9A642044}
.mn-conf-baja{color:${COL.alert};border-color:${COL.alertBdr}}

/* alerta */
.mn-alerta{background:${COL.alertBg};border:1px solid ${COL.alertBdr};border-radius:20px;
  padding:14px 18px;margin-bottom:16px}
.mn-alerta-hd{font-family:'IBM Plex Mono',monospace;font-size:11px;text-transform:uppercase;
  letter-spacing:.14em;color:${COL.alert};margin-bottom:10px;display:flex;align-items:center;gap:8px}
.mn-alerta-ul{margin:0;padding:0 0 0 16px;display:flex;flex-direction:column;gap:6px}
.mn-alerta-ul li{font-size:13px;color:${COL.text};line-height:1.5}

/* nota */
.mn-nota{font-size:11.5px;color:${COL.faint};line-height:1.55;
  border-left:2px solid ${COL.nodeBdr};padding-left:10px;margin:12px 0 0}

/* tabs */
.mn-tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:20px;
  border-bottom:1px solid ${COL.line};padding-bottom:0}
.mn-tab{background:none;border:none;border-bottom:2px solid transparent;
  color:${COL.muted};font-family:'Manrope',system-ui,sans-serif;font-size:13.5px;
  font-weight:500;padding:10px 14px 11px;cursor:pointer;transition:color .15s,border-color .15s;
  margin-bottom:-1px}
.mn-tab.active{color:${COL.primary};border-bottom-color:${COL.primary}}
.mn-tab:hover:not(.active){color:${COL.text}}

/* contenido */
.mn-content{padding:4px 0}
.mn-section-title{font-family:'IBM Plex Mono',monospace;font-size:11px;text-transform:uppercase;
  letter-spacing:.2em;color:${COL.faint};border-bottom:1px solid ${COL.line};
  padding-bottom:10px;margin-bottom:14px}
.mn-section-desc{font-size:14.5px;color:#4a3f36;line-height:1.68;margin:0 0 24px;max-width:72ch}
.mn-chart-lbl{font-family:'IBM Plex Mono',monospace;font-size:10px;text-transform:uppercase;
  letter-spacing:.14em;color:${COL.faint};margin-bottom:8px}

/* mapa */
.mn-tab-mapa{display:flex;flex-direction:column;gap:16px}
.mn-mapa-wrap{position:relative;background:${COL.node};border:0;box-shadow:var(--sh);
  border-radius:24px;padding:12px;overflow:hidden}
.mn-mapa-tip{position:absolute;bottom:12px;right:12px;
  background:${COL.panel};border:1px solid ${COL.nodeBdr};border-radius:14px;box-shadow:0 8px 24px rgba(40,25,10,.14);
  padding:12px 14px;min-width:220px;max-width:280px;z-index:2}
.mn-tip-nombre{font-weight:700;font-size:14px;margin-bottom:2px}
.mn-tip-prov{font-size:11px;color:${COL.muted};margin-bottom:8px;
  font-family:'IBM Plex Mono',monospace}
.mn-tip-grid{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:12.5px;margin-bottom:6px}
.mn-tip-lbl{color:${COL.faint};white-space:nowrap}
.mn-tip-valor{color:${COL.primary};font-weight:700;font-family:'IBM Plex Mono',monospace;font-size:13px}
.mn-tip-res{font-size:11.5px;color:${COL.muted};margin:4px 0;line-height:1.4}

/* filtro */
.mn-mapa-tabla-wrap{background:${COL.node};border:0;box-shadow:var(--sh);border-radius:24px;padding:16px}
.mn-filtro-wrap{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.mn-filtro-lbl{font-family:'IBM Plex Mono',monospace;font-size:10px;text-transform:uppercase;
  letter-spacing:.14em;color:${COL.faint};white-space:nowrap}
.mn-filtro-btns{display:flex;gap:6px;flex-wrap:wrap}
.mn-filtro-btn{background:none;border:1px solid ${COL.nodeBdr};border-radius:999px;
  color:${COL.muted};font-size:12px;padding:4px 10px;cursor:pointer;transition:all .15s;
  font-family:'Manrope',system-ui,sans-serif}
.mn-filtro-btn:hover{border-color:${COL.nickel};color:${COL.text}}
.mn-filtro-btn.active{background:${COL.primary};border-color:${COL.primary};color:#fcf9f4;font-weight:600}

/* tablas */
.mn-tabla-scroll{overflow-x:auto}
.mn-tabla{width:100%;border-collapse:collapse;font-size:13px}
.mn-tabla th{font-family:'IBM Plex Mono',monospace;font-size:10px;text-transform:uppercase;
  letter-spacing:.12em;color:${COL.faint};padding:8px 12px;text-align:left;
  border-bottom:1px solid ${COL.nodeBdr};white-space:nowrap;font-weight:500}
.mn-tabla td{padding:9px 12px;border-bottom:1px solid ${COL.line};color:${COL.text};
  vertical-align:middle}
.mn-tabla tr.even td{background:rgba(60,40,20,.025)}
.mn-tabla tr:hover td{background:${COL.primGlow}}
.mn-num{text-align:right;font-family:'IBM Plex Mono',monospace;font-size:12.5px}
.mn-num-big{font-size:14px;color:${COL.primary};font-weight:700}
.mn-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:8px;flex-shrink:0}
.mn-badge{font-size:11px;padding:2px 8px;border-radius:4px;border:1px solid;font-weight:500}
.mn-tipo-badge{font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:${COL.nickel};
  background:${COL.nodeBdr};padding:2px 7px;border-radius:4px}

/* tooltips recharts */
.mn-recharts-tip{background:${COL.panel};border:1px solid ${COL.nodeBdr};border-radius:14px;box-shadow:0 8px 24px rgba(40,25,10,.14);
  padding:12px 14px;font-size:12.5px;min-width:200px;max-width:280px;line-height:1.55}
.mn-rt-nombre{font-weight:700;font-size:13.5px;margin-bottom:4px;color:${COL.text}}
.mn-rt-val{font-family:'IBM Plex Mono',monospace;font-size:15px;color:${COL.primary};font-weight:700}
.mn-rt-tipo,.mn-rt-norma,.mn-rt-desc{color:${COL.muted};margin-top:4px;font-size:11.5px}

/* producción stats */
.mn-prod-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:24px}
.mn-ps{background:${COL.node};border:0;box-shadow:var(--sh);border-radius:16px;padding:12px 14px}
.mn-ps-v{font-family:'IBM Plex Mono',monospace;font-size:20px;font-weight:700;color:${COL.primary};margin-bottom:4px}
.mn-ps-l{font-size:11.5px;color:${COL.muted}}
.mn-ps-badge{background:${COL.alertBg};color:${COL.alert};border:1px solid ${COL.alertBdr};
  border-radius:4px;padding:1px 6px;font-size:10px;font-family:'IBM Plex Mono',monospace;margin-left:6px}

/* proceso */
.mn-proc-scroll{overflow-x:auto;padding-bottom:8px;margin-bottom:16px}
.mn-proc-flow{display:flex;align-items:stretch;gap:0;min-width:900px;padding:4px 0}
.mn-proc-step{flex:1;min-width:100px;background:${COL.node};border:1px solid ${COL.nodeBdr};
  border-radius:16px;padding:12px 11px;display:flex;flex-direction:column;gap:6px;transition:border-color .2s}
.mn-proc-step.interrupted{border-color:${COL.alertBdr};background:${COL.alertBg}}
.mn-proc-num{font-family:'IBM Plex Mono',monospace;font-size:22px;font-weight:700;
  color:${COL.faint};line-height:1;margin-bottom:2px}
.mn-proc-tipo{font-family:'IBM Plex Mono',monospace;font-size:8.5px;text-transform:uppercase;
  letter-spacing:.18em;margin-bottom:2px}
.mn-proc-nombre{font-size:12.5px;font-weight:700;line-height:1.3}
.mn-proc-det{font-size:11px;color:${COL.muted};line-height:1.5;margin:0;flex:1}
.mn-proc-alert-badge{font-family:'IBM Plex Mono',monospace;font-size:8.5px;text-transform:uppercase;
  letter-spacing:.1em;background:${COL.alertBg};color:${COL.alert};border:1px solid ${COL.alertBdr};
  border-radius:4px;padding:3px 7px;margin-top:4px;width:fit-content}
.mn-proc-arr{display:flex;align-items:center;padding:0 2px;flex:none;opacity:.7}
.mn-proc-arr.interrupted{opacity:1}
.mn-proc-leyenda{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:20px;
  font-family:'IBM Plex Mono',monospace;font-size:10px;color:${COL.muted}}
.mn-proc-ley-item{display:flex;align-items:center;gap:5px;text-transform:uppercase;letter-spacing:.1em}

/* ficha técnica */
.mn-proc-ficha{background:${COL.node};border:0;box-shadow:var(--sh);border-radius:24px;padding:16px 18px}
.mn-proc-ficha-title{font-family:'IBM Plex Mono',monospace;font-size:10px;text-transform:uppercase;
  letter-spacing:.14em;color:${COL.faint};margin-bottom:14px}
.mn-proc-ficha-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px}
.mn-pf-item{display:flex;justify-content:space-between;align-items:center;
  font-size:12.5px;padding:7px 10px;background:${COL.panel2};border-radius:10px}
.mn-pf-lbl{color:${COL.muted}}

/* encuesta */
.mn-poll-q{background:${COL.node};border:0;box-shadow:var(--sh);border-radius:24px;
  padding:16px 18px;margin-bottom:14px}
.mn-poll-texto{font-size:15px;font-weight:600;margin:0 0 14px;line-height:1.4}
.mn-poll-ops{display:flex;flex-direction:column;gap:8px}
.mn-poll-op{position:relative;border:1px solid ${COL.nodeBdr};border-radius:14px;overflow:hidden;
  cursor:pointer;transition:border-color .15s}
.mn-poll-op:not(.dimmed):hover{border-color:${COL.primary}}
.mn-poll-op.selected{border-color:${COL.primary}}
.mn-poll-op.dimmed{opacity:.55;cursor:default}
.mn-poll-bar-bg{position:absolute;inset:0;overflow:hidden;border-radius:13px;pointer-events:none}
.mn-poll-bar-fill{height:100%;background:${COL.primGlow};transition:width .6s ease}
.mn-poll-op.selected .mn-poll-bar-fill{background:rgba(181,80,28,.18)}
.mn-poll-op-inner{position:relative;display:flex;justify-content:space-between;
  align-items:center;padding:11px 14px;font-size:13.5px}
.mn-poll-pct{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:700;color:${COL.primary}}
.mn-poll-total{font-size:11px;color:${COL.faint};margin:8px 0 0;text-align:right;
  font-family:'IBM Plex Mono',monospace}

/* footer */
.mn-foot{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:48px;
  padding-top:16px;border-top:1px solid ${COL.line};
  font-family:'IBM Plex Mono',monospace;font-size:11px;color:${COL.faint}}

/* faja aurífera */
.mn-faja-box{background:${COL.node};border:0;box-shadow:var(--sh);border-radius:24px;
  padding:16px 18px}
.mn-faja-hd{font-family:'IBM Plex Mono',monospace;font-size:10px;text-transform:uppercase;
  letter-spacing:.18em;color:${COL.gold};margin-bottom:10px}
.mn-faja-desc{font-size:13.5px;color:#4a3f36;line-height:1.65;margin:0 0 14px;max-width:70ch}
.mn-faja-stats{display:flex;gap:24px;flex-wrap:wrap}
.mn-faja-stat{display:flex;flex-direction:column;gap:2px}
.mn-faja-val{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:700;color:${COL.gold}}
.mn-faja-lbl{font-size:10px;color:${COL.faint};text-transform:uppercase;letter-spacing:.1em}

/* donut */
.mn-donut-wrap{margin-bottom:28px}
.mn-donut-inner{display:flex;align-items:center;gap:24px;flex-wrap:wrap}
.mn-donut-legend{display:flex;flex-direction:column;gap:12px;min-width:220px}
.mn-donut-litem{display:flex;align-items:flex-start;gap:10px}
.mn-dl-dot{display:inline-block;width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:3px}
.mn-dl-nombre{font-size:12.5px;font-weight:600;color:${COL.text};line-height:1.35}
.mn-dl-val{font-family:'IBM Plex Mono',monospace;font-size:12px;color:${COL.primary}}
.mn-dl-pct{font-size:11px;color:${COL.muted}}
.mn-dl-total{font-family:'IBM Plex Mono',monospace;font-size:11px;color:${COL.faint};
  border-top:1px solid ${COL.nodeBdr};padding-top:8px;margin-top:4px}

/* proyección */
.mn-proy-wrap{margin-top:28px;border-top:1px solid ${COL.line};padding-top:20px}
.mn-proy-legend{display:flex;flex-direction:column;gap:6px;margin-bottom:8px}
.mn-proy-litem{display:flex;align-items:center;flex-wrap:wrap;gap:4px;font-family:'IBM Plex Mono',monospace;font-size:11px}

@media(max-width:640px){
  .mn-h1{font-size:26px}
  .mn-kpis{grid-template-columns:1fr 1fr}
  .mn-mapa-tip{position:relative;bottom:auto;right:auto;max-width:100%;margin-top:8px}
  .mn-proc-flow{min-width:680px}
  .mn-donut-inner{flex-direction:column}
}
`;
