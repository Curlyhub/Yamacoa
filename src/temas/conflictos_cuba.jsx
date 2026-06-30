import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
  PieChart,
  Pie,
  ReferenceLine,
} from "recharts";

/* ──────────────────────────────────────────────────────────────────────────
   LA CALLE ARDE — Observatorio de la protesta cívica en Cuba · ene–mar 2026.

   ARQUITECTURA: el renderizador está congelado. Los datos editoriales viven en
   /data/conflictos.json (lo reescribe el agente). Aquí sólo quedan: la geometría
   de la isla, la paleta, los componentes y una copia incrustada de respaldo que
   se usa si el fetch falla (p. ej. al abrir el archivo suelto).

   NOTAS DE MÉTODO: el OCC cuenta actos presenciales y expresiones virtuales;
   desde 2023 amplió ese criterio (de ahí la salvedad de ese año). Las cifras son
   un piso. El pronóstico es ilustrativo, no una predicción.
   ────────────────────────────────────────────────────────────────────────── */

const DATA_URL =
  (typeof process !== "undefined" && process.env && process.env.PUBLIC_URL
    ? process.env.PUBLIC_URL
    : "") + "/data/conflictos.json";

/* ════════ PALETA "BRASA" — una rampa de fuego, un solo frío ════════════════ */
const C = {
  bg: "#0A0D12",
  bg2: "#0E1219",
  surface: "#121823",
  surface2: "#171F2B",
  line: "#222C3A",
  ink: "#ECEFF3",
  sub: "#9AA7B4",
  faint: "#677586",
  h1: "#5B0E2D",
  h2: "#A52341",
  h3: "#E04B3A",
  h4: "#F2913B",
  h5: "#F7CE4B",
  hot: "#F2913B",
  hotSoft: "#F2913B22",
  cool: "#3FA7C9",
  coolSoft: "#3FA7C922",
  steel: "#5E7486",
};
const HEAT = [C.h1, C.h2, C.h3, C.h4, C.h5];

/* ════════ GEOMETRÍA (renderizador) ════════════════════════════════════════ */
const CUBA_OUTLINE = [
  [-84.95, 21.86], [-84.2, 22.05], [-83.5, 22.25], [-82.95, 22.45],
  [-82.55, 22.7], [-82.25, 22.98], [-81.75, 23.18], [-81.2, 23.06],
  [-80.6, 23.12], [-79.95, 23.0], [-79.4, 22.92], [-78.6, 22.46],
  [-77.85, 22.05], [-77.1, 21.66], [-76.4, 21.34], [-75.75, 21.14],
  [-75.15, 20.72], [-74.6, 20.42], [-74.13, 20.05], [-74.55, 19.98],
  [-75.2, 19.9], [-75.85, 19.94], [-76.6, 19.97], [-77.2, 19.92],
  [-77.7, 20.58], [-78.3, 20.5], [-78.85, 21.5], [-79.4, 21.5],
  [-79.95, 21.6], [-80.45, 21.92], [-81.05, 21.9], [-81.55, 22.12],
  [-82.2, 22.42], [-82.7, 22.22], [-83.25, 22.18], [-84.0, 22.0],
  [-84.55, 21.9], [-84.95, 21.86],
];
const PROV_GEO = {
  "Pinar del Río": [-83.7, 22.42], Artemisa: [-82.76, 22.81],
  "La Habana": [-82.38, 23.11], Mayabeque: [-82.0, 22.95],
  Matanzas: [-81.57, 23.04], "Villa Clara": [-79.96, 22.41],
  Cienfuegos: [-80.45, 22.15], "Sancti Spíritus": [-79.44, 21.93],
  "Ciego de Ávila": [-78.76, 21.84], Camagüey: [-77.92, 21.38],
  "Las Tunas": [-76.95, 20.96], Holguín: [-76.26, 20.89],
  Granma: [-77.12, 20.38], "Santiago de Cuba": [-75.82, 20.02],
  Guantánamo: [-75.21, 20.14],
};

/* ════════ RESPALDO INCRUSTADO (idéntico a conflictos.json) ═════════════════ */
const EMBEDDED = {
  meta: {
    titulo: "La calle arde",
    subtitulo: "Observatorio de la protesta cívica en Cuba · primer trimestre de 2026",
    fuente: "Observatorio Cubano de Conflictos (OCC)",
    periodo: "enero–marzo 2026",
    actualizado: "2026-03-30",
  },
  trimestre: { total: 3383, desafios: 1383, represivos: 419, presenciales: 54, grafiti: 113, muertesViolencia: 70, deltaMarzoYoYPct: 80 },
  meses: [
    { id: "ene", nombre: "Enero", total: 953, dcp: 542, des: 411, desafios: 395, represivos: 147, grafiti: 1, presenciales: null, muertesViolencia: 21, nota2025: 684, nota2025Estimado: false,
      categorias: [{ k: "Alimentación, inflación y agricultura", v: 97 }, { k: "Inseguridad ciudadana", v: 87 }, { k: "Servicios públicos", v: 86 }, { k: "Salud pública", v: 70 }, { k: "Otros problemas sociales", v: 62 }, { k: "Vivienda", v: 9 }],
      provincias: [{ p: "La Habana", v: 474 }, { p: "Matanzas", v: 80 }, { p: "Santiago de Cuba", v: 62 }, { p: "Granma", v: 24 }, { p: "Villa Clara", v: 21 }] },
    { id: "feb", nombre: "Febrero", total: 1185, dcp: 545, des: 640, desafios: 432, represivos: 113, grafiti: 42, presenciales: null, muertesViolencia: 22, nota2025: 609, nota2025Estimado: false,
      categorias: [{ k: "Servicios públicos", v: 229 }, { k: "Alimentación, inflación y agricultura", v: 201 }, { k: "Otros problemas sociales", v: 68 }, { k: "Salud pública", v: 67 }, { k: "Inseguridad ciudadana", v: 57 }, { k: "Vivienda", v: 18 }],
      provincias: [{ p: "La Habana", v: 461 }, { p: "Matanzas", v: 137 }, { p: "Holguín", v: 72 }, { p: "Santiago de Cuba", v: 69 }, { p: "Guantánamo", v: 41 }, { p: "Villa Clara", v: 34 }] },
    { id: "mar", nombre: "Marzo", total: 1245, dcp: 715, des: 530, desafios: 556, represivos: 159, grafiti: 70, presenciales: 54, muertesViolencia: 27, nota2025: 691, nota2025Estimado: true,
      categorias: [{ k: "Servicios públicos", v: 179 }, { k: "Alimentación, inflación y agricultura", v: 127 }, { k: "Otros problemas sociales", v: 91 }, { k: "Inseguridad ciudadana", v: 85 }, { k: "Salud pública", v: 29 }, { k: "Vivienda", v: 19 }],
      provincias: [{ p: "La Habana", v: 625 }, { p: "Matanzas", v: 84 }, { p: "Santiago de Cuba", v: 77 }, { p: "Holguín", v: 38 }, { p: "Ciego de Ávila", v: 35 }, { p: "Guantánamo", v: 31 }] },
  ],
  anual: [
    { a: "2021", v: 3300, caveat: false }, { a: "2022", v: 3923, caveat: false },
    { a: "2023", v: 5749, caveat: true }, { a: "2024", v: 8443, caveat: false },
    { a: "2025", v: 11268, caveat: false },
  ],
  forecast: {
    metodo: "Proyección ilustrativa por inercia de la serie 2021–2025 (crecimiento medio ≈ 34 % anual). No es una predicción: es lo que la tendencia daría si nada la frena ni la dispara.",
    base: 11268, escenarios: { bajoPct: 12, centralPct: 30, altoPct: 50 },
    puntos: [
      { anio: "2021", real: 3300 }, { anio: "2022", real: 3923 }, { anio: "2023", real: 5749 },
      { anio: "2024", real: 8443 }, { anio: "2025", real: 11268, central: 11268, bajo: 11268, alto: 11268 },
      { anio: "2026", central: 14648, bajo: 12620, alto: 16902 },
      { anio: "2027", central: 19043, bajo: 14135, alto: 25353 },
      { anio: "2028", central: 24756, bajo: 15831, alto: 38030 },
    ],
  },
  eventos: [
    { mes: "mar", fecha: "13 mar", lugar: "Morón, Ciego de Ávila", tipo: "Calle", titulo: "La sede del Partido, una hoguera", texto: "Manifestantes entraron en la sede local del Partido Comunista, sacaron muebles, documentos y propaganda a la calle y los prendieron en una gran fogata: el clímax de tres semanas de cacerolazos nocturnos." },
    { mes: "mar", fecha: "4–5 mar", lugar: "Termoeléctrica Antonio Guiteras", tipo: "Energía", titulo: "Avería en cadena", texto: "Un fallo grave en la Guiteras provocó una desconexión en cadena. El viceministro Abad Vigoa admitió el 21 de marzo que el país llevaba tres meses sin recibir diésel ni fuel oil, con 10 de 16 unidades termoeléctricas fuera de servicio." },
    { mes: "mar", fecha: "16 y 21 mar", lugar: "Sistema Eléctrico Nacional", tipo: "Energía", titulo: "Dos colapsos en una semana", texto: "Apagones totales del SEN el 16 y el 21 de marzo: sexto y séptimo colapso nacional en 18 meses. En Colón, Mayarí y barrios de La Habana hubo cortes de hasta 84 horas seguidas." },
    { mes: "mar", fecha: "marzo", lugar: "Arroyo Naranjo, La Habana", tipo: "Escándalo", titulo: "Las donaciones de México, en dólares", texto: "Un equipo de TV Azteca documentó que parte de la ayuda humanitaria mexicana se vendía en dólares en tiendas de GAESA, mientras los módulos repartidos eran mínimos: a un niño de 4 años le tocaron galletas y dos latas de atún." },
    { mes: "mar", fecha: "marzo", lugar: "Hospital Pediátrico de Camagüey", tipo: "Salud", titulo: "Darwin Daniel, 10 meses", texto: "El bebé Darwin Daniel Sotolongo Cedres murió en cuidados intensivos tras cuatro meses con soporte vital, después de que su madre denunciara durante meses la falta de recursos y especialistas para operarlo." },
    { mes: "feb", fecha: "febrero", lugar: "Estrecho de la Florida", tipo: "Represión", titulo: "Ametrallamiento de un bote", texto: "Lanchas guardafronteras ametrallaron una embarcación procedente de Miami: cuatro tripulantes muertos y seis heridos. En el mes también se encarceló a los líderes del grupo audiovisual holguinero El4tico." },
    { mes: "feb", fecha: "febrero", lugar: "Canaleta, Ciego de Ávila", tipo: "Represión", titulo: "Motín en la prisión", texto: "Brutal represión contra reclusos de la prisión de Canaleta, amotinados por los maltratos y las pésimas condiciones de vida." },
    { mes: "feb", fecha: "febrero", lugar: "ETECSA · Min. de Comunicaciones", tipo: "Digital", titulo: "Hackeo a los servidores del Estado", texto: "Entre las protestas anónimas del mes destacó el hackeo de los servidores de ETECSA y del Ministerio de Comunicaciones, junto a incendios de campos de cultivo y propiedades del gobierno." },
    { mes: "ene", fecha: "enero", lugar: "Malecón, La Habana", tipo: "Calle", titulo: "“Viva Trump” en el muro", texto: "Las consignas ignoraron el llamado del gobierno al nacionalismo: aparecieron grafitis de agradecimiento al presidente estadounidense, incluido uno en pleno Malecón, y vallas propagandísticas incendiadas." },
    { mes: "ene", fecha: "enero", lugar: "La Habana (caso digital)", tipo: "Represión", titulo: "Cerco a Ana Sofía Benítez", texto: "La Seguridad del Estado tendió un cerco para sacar de las redes a la influencer Ana Sofía Benítez Silvente, de 21 años, en un caso que provocó un amplio clamor de rechazo." },
  ],
  encuesta: [
    { id: "motor", pregunta: "¿Qué crees que más empuja hoy a los cubanos a la calle?", opciones: [
      { id: "apagones", txt: "Los apagones y la falta de agua", seed: 612 }, { id: "comida", txt: "La comida y los precios imposibles", seed: 488 },
      { id: "represion", txt: "El hartazgo con el régimen", seed: 731 }, { id: "esperanza", txt: "La esperanza de un cambio con ayuda externa", seed: 356 }] },
    { id: "trayectoria", pregunta: "¿Crees que la protesta seguirá creciendo en 2026?", opciones: [
      { id: "sinfreno", txt: "Sí, sin freno", seed: 524 }, { id: "altibajos", txt: "Subirá, pero con altibajos", seed: 689 },
      { id: "estable", txt: "Se estabilizará donde está", seed: 198 }, { id: "caera", txt: "Caerá por el peso de la represión", seed: 241 }] },
  ],
};

/* ════════ HELPERS ══════════════════════════════════════════════════════════ */
const fmt = (n) => (n == null ? "—" : n.toLocaleString("es-ES"));
const pct = (n, d) => (d ? Math.round((n / d) * 1000) / 10 : 0);
const tipoColor = (t) =>
  ({ Calle: C.h4, Energía: C.cool, Salud: "#9DC8BF", Represión: C.h3, Escándalo: C.h5, Digital: C.steel }[t] || C.steel);

function useFonts() {
  useEffect(() => {
    const id = "yamacoa-fonts-conflictos";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id;
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap";
    document.head.appendChild(l);
  }, []);
}

function useData() {
  const [data, setData] = useState(EMBEDDED);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(DATA_URL, { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();
        if (alive && j && j.meses) setData(j);
      } catch (_) { /* respaldo incrustado */ }
    })();
    return () => { alive = false; };
  }, []);
  return data;
}

/* ════════ ÁTOMOS ═══════════════════════════════════════════════════════════ */
function Eyebrow({ children, color = C.hot }) {
  return <div style={{ font: "600 11px/1 'IBM Plex Mono', monospace", letterSpacing: "0.22em", textTransform: "uppercase", color, marginBottom: 14 }}>{children}</div>;
}
function Card({ children, style }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 6, padding: "24px 26px 28px", ...style }}>{children}</div>;
}
function H2({ kicker, title, kc }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Eyebrow color={kc}>{kicker}</Eyebrow>
      <h2 style={{ font: "800 24px/1.12 Archivo, sans-serif", color: C.ink, margin: 0, letterSpacing: "-0.01em" }}>{title}</h2>
    </div>
  );
}
function Legend({ items }) {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
      {items.map(([label, color]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 11, height: 11, background: color, borderRadius: 2, display: "inline-block" }} />
          <span style={{ font: "500 12px 'IBM Plex Mono', monospace", color: C.sub }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
function Pill({ active, color, children, onClick }) {
  return (
    <button onClick={onClick} style={{ font: "600 12px 'IBM Plex Mono', monospace", padding: "7px 13px", borderRadius: 3, cursor: "pointer", border: `1px solid ${active ? color : C.line}`, background: active ? color + "22" : "transparent", color: active ? color : C.sub, transition: "all .15s" }}>
      {children}
    </button>
  );
}

/* ════════ MAPA ═════════════════════════════════════════════════════════════ */
function CubaMap({ mes }) {
  const ref = useRef(null);
  const W = 760, H = 300;
  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const feature = { type: "Feature", geometry: { type: "Polygon", coordinates: [CUBA_OUTLINE] } };
    const projection = d3.geoMercator().fitExtent([[18, 26], [W - 18, H - 40]], feature);
    const path = d3.geoPath(projection);
    svg.append("path").attr("d", path(feature)).attr("fill", "#0C1218").attr("stroke", C.steel).attr("stroke-width", 1).attr("opacity", 0.9);
    const max = d3.max(mes.provincias, (d) => d.v) || 1;
    const r = d3.scaleSqrt().domain([0, max]).range([3, 34]);
    const heat = d3.scaleLinear().domain([0, max]).range([0, 1]);
    const g = svg.append("g");
    mes.provincias.forEach((d) => {
      const coord = PROV_GEO[d.p];
      if (!coord) return;
      const [x, y] = projection(coord);
      const col = d3.interpolateRgb(C.h3, C.h5)(heat(d.v));
      const node = g.append("g").attr("transform", `translate(${x},${y})`);
      node.append("circle").attr("r", 0).attr("fill", col + "33").attr("stroke", col).attr("stroke-width", 1.25).transition().duration(650).attr("r", r(d.v));
      node.append("circle").attr("r", 2.2).attr("fill", col);
      node.append("text").attr("x", 0).attr("y", -r(d.v) - 6).attr("text-anchor", "middle").attr("fill", C.ink).style("font", "600 11px 'IBM Plex Mono', monospace").text(`${d.p} ${d.v}`);
    });
    const hav = projection(PROV_GEO["La Habana"]);
    g.append("text").attr("x", hav[0]).attr("y", hav[1] + 4).attr("text-anchor", "middle").attr("fill", C.h5).style("font", "12px sans-serif").text("★");
  }, [mes]);
  return <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} />;
}

/* ════════ TOOLTIPS ═════════════════════════════════════════════════════════ */
function MonthlyTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const r = payload[0].payload;
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.line}`, padding: "10px 12px", font: "500 12px/1.6 'IBM Plex Mono', monospace", color: C.ink }}>
      <div style={{ color: C.hot, marginBottom: 4 }}>{label} 2026</div>
      <div>Total: {fmt(r.total)}</div>
      <div style={{ color: C.cool }}>D. Económicos y Sociales: {fmt(r.des)}</div>
      <div style={{ color: C.h4 }}>D. Civiles y Políticos: {fmt(r.dcp)}</div>
      <div style={{ color: C.h3 }}>Desafíos al Estado: {fmt(r.desafios)}</div>
    </div>
  );
}
function AnnualTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const r = payload[0].payload;
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.line}`, padding: "10px 12px", font: "500 12px/1.6 'IBM Plex Mono', monospace", color: C.ink, maxWidth: 240 }}>
      <div style={{ color: C.hot, marginBottom: 4 }}>{label}</div>
      <div>{fmt(r.v)} protestas y denuncias</div>
      {r.caveat && <div style={{ color: C.faint, marginTop: 6, lineHeight: 1.5 }}>Parte del salto de 2023 refleja que el OCC amplió su definición para incluir expresiones virtuales.</div>}
    </div>
  );
}
function ForecastTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const r = payload[0].payload;
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.line}`, padding: "10px 12px", font: "500 12px/1.6 'IBM Plex Mono', monospace", color: C.ink }}>
      <div style={{ color: r.real != null ? C.h5 : C.cool, marginBottom: 4 }}>{label}{r.real != null ? "" : " · proyección"}</div>
      {r.real != null && <div>Registrado: {fmt(r.real)}</div>}
      {r.central != null && r.real == null && (
        <>
          <div style={{ color: C.h4 }}>Central: {fmt(r.central)}</div>
          <div style={{ color: C.cool }}>Banda: {fmt(r.bajo)} – {fmt(r.alto)}</div>
        </>
      )}
    </div>
  );
}

/* ════════ TAB · PANORAMA ═══════════════════════════════════════════════════ */
function Panorama({ data }) {
  const { meses, trimestre } = data;
  const serie = meses.map((m) => ({ nombre: m.nombre, total: m.total, des: m.des, dcp: m.dcp, desafios: m.desafios }));
  const comp = [
    { name: "D. Económicos y Sociales", value: meses.reduce((a, m) => a + m.des, 0), color: C.cool },
    { name: "Desafíos al Estado policial", value: trimestre.desafios, color: C.h3 },
    { name: "Actos represivos", value: trimestre.represivos, color: C.h5 },
  ];
  const compTotal = comp.reduce((a, c) => a + c.value, 0);

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
        {[
          { n: 556, l: "récord de desafíos al Estado", s: "432 feb · 395 ene", c: C.h4 },
          { n: 54, l: "protestas presenciales", s: "la mayoría en La Habana", c: C.h3 },
          { n: 113, l: "grafitis antigubernamentales", s: "1 ene · 42 feb · 70 mar", c: C.h5 },
          { n: 70, l: "muertes por violencia", s: "en el trimestre", c: C.steel },
        ].map((k, i) => (
          <Card key={i} style={{ padding: "18px 20px 20px" }}>
            <div style={{ font: "800 38px/1 Archivo, sans-serif", color: k.c, letterSpacing: "-0.02em" }}>{k.n}</div>
            <div style={{ font: "600 13px/1.35 Archivo, sans-serif", color: C.ink, marginTop: 10 }}>{k.l}</div>
            <div style={{ font: "400 11px/1.4 'IBM Plex Mono', monospace", color: C.faint, marginTop: 6 }}>{k.s}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 22, alignItems: "stretch" }} className="pano-grid">
        <Card>
          <H2 kicker="El trimestre, mes a mes" title="El descontento se vuelve desafío" />
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={serie} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke={C.line} vertical={false} />
                <XAxis dataKey="nombre" tick={{ fill: C.sub, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }} axisLine={{ stroke: C.line }} tickLine={false} />
                <YAxis tick={{ fill: C.faint, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<MonthlyTip />} cursor={{ fill: "#ffffff08" }} />
                <Bar dataKey="des" stackId="a" fill={C.cool} />
                <Bar dataKey="dcp" stackId="a" fill={C.h4} radius={[2, 2, 0, 0]} />
                <Line type="monotone" dataKey="desafios" stroke={C.h3} strokeWidth={2.5} dot={{ r: 4, fill: C.h3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <Legend items={[["D. Econ. y Soc.", C.cool], ["D. Civ. y Pol.", C.h4], ["Desafíos al Estado", C.h3]]} />
        </Card>

        <Card>
          <H2 kicker="Anatomía del trimestre" title="De qué está hecho" kc={C.h5} />
          <div style={{ height: 230, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={comp} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="none" startAngle={90} endAngle={-270}>
                  {comp.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: C.bg, border: `1px solid ${C.line}`, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ font: "800 30px/1 Archivo, sans-serif", color: C.ink }}>{fmt(compTotal)}</div>
              <div style={{ font: "500 10px 'IBM Plex Mono', monospace", color: C.faint, marginTop: 4, letterSpacing: "0.1em" }}>EN EL TRIMESTRE</div>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            {comp.map((c) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "6px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c.color, flexShrink: 0 }} />
                  <span style={{ font: "500 12px/1.3 Archivo, sans-serif", color: C.sub }}>{c.name}</span>
                </div>
                <span style={{ font: "600 12px 'IBM Plex Mono', monospace", color: C.ink }}>{pct(c.value, compTotal)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ════════ TAB · TERRITORIO ═════════════════════════════════════════════════ */
function Territorio({ data }) {
  const [mesId, setMesId] = useState("mar");
  const [catId, setCatId] = useState("mar");
  const mes = data.meses.find((m) => m.id === mesId);
  const mesCat = data.meses.find((m) => m.id === catId);
  const catMax = Math.max(...mesCat.categorias.map((c) => c.v));

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 8 }}>
          <H2 kicker="Dónde ardió más fuerte" title="Provincias más activas" />
          <div style={{ display: "flex", gap: 6 }}>
            {data.meses.map((m) => <Pill key={m.id} active={mesId === m.id} color={C.h4} onClick={() => setMesId(m.id)}>{m.nombre}</Pill>)}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18, alignItems: "center" }} className="map-grid">
          <CubaMap mes={mes} />
          <div>
            {mes.provincias.map((p, i) => {
              const max = mes.provincias[0].v;
              return (
                <div key={p.p} style={{ marginBottom: 11 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", font: "500 13px 'IBM Plex Mono', monospace", color: C.ink, marginBottom: 4 }}>
                    <span><span style={{ color: C.faint, marginRight: 8 }}>{String(i + 1).padStart(2, "0")}</span>{p.p}</span>
                    <span style={{ color: C.h4 }}>{p.v}</span>
                  </div>
                  <div style={{ height: 4, background: C.line, borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${(p.v / max) * 100}%`, background: i === 0 ? C.h4 : C.cool, borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
          <H2 kicker="La raíz material" title="Derechos económicos y sociales" kc={C.cool} />
          <div style={{ display: "flex", gap: 6 }}>
            {data.meses.map((m) => <Pill key={m.id} active={catId === m.id} color={C.cool} onClick={() => setCatId(m.id)}>{m.nombre}</Pill>)}
          </div>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {mesCat.categorias.map((c) => (
            <div key={c.k} style={{ display: "grid", gridTemplateColumns: "200px 1fr 44px", alignItems: "center", gap: 12 }} className="cat-row">
              <span style={{ font: "500 13px/1.3 Archivo, sans-serif", color: C.sub }}>{c.k}</span>
              <div style={{ height: 18, background: C.bg2, borderRadius: 2, overflow: "hidden", border: `1px solid ${C.line}` }}>
                <div style={{ height: "100%", width: `${(c.v / catMax) * 100}%`, background: `linear-gradient(90deg, ${C.cool}, ${C.cool}aa)`, transition: "width .5s" }} />
              </div>
              <span style={{ font: "600 13px 'IBM Plex Mono', monospace", color: C.ink, textAlign: "right" }}>{c.v}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ════════ TAB · TRAYECTORIA ════════════════════════════════════════════════ */
function Trayectoria({ data }) {
  const comp = data.meses.map((m) => ({ nombre: m.nombre, "2025": m.nota2025, "2026": m.total }));
  return (
    <div style={{ display: "grid", gap: 22 }}>
      <Card>
        <H2 kicker="La inercia de la calle" title="Hacia dónde apunta la tendencia" kc={C.cool} />
        <p style={{ color: C.sub, font: "400 14px/1.65 Archivo, sans-serif", margin: "0 0 16px", maxWidth: 640 }}>
          La línea cálida es lo que el OCC registró, año a año. A partir de 2025, el abanico muestra el
          rango de lo que daría la propia inercia de la serie: desde una desaceleración (+12 %) hasta una
          aceleración (+50 %). No es una predicción.
        </p>
        <div style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.forecast.puntos} margin={{ top: 16, right: 14, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="bandFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.h4} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={C.cool} stopOpacity={0.12} />
                </linearGradient>
                <linearGradient id="realLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={C.h2} />
                  <stop offset="100%" stopColor={C.h5} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={C.line} vertical={false} />
              <XAxis dataKey="anio" tick={{ fill: C.sub, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }} axisLine={{ stroke: C.line }} tickLine={false} />
              <YAxis tick={{ fill: C.faint, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? v / 1000 + "k" : v)} />
              <Tooltip content={<ForecastTip />} cursor={{ stroke: C.line }} />
              <ReferenceLine x="2025" stroke={C.faint} strokeDasharray="3 4" label={{ value: "hoy", fill: C.faint, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", position: "insideTopRight" }} />
              <Area dataKey={(d) => (d.alto != null ? [d.bajo, d.alto] : null)} stroke="none" fill="url(#bandFill)" connectNulls isAnimationActive={false} />
              <Line type="monotone" dataKey="central" stroke={C.h4} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: C.h4 }} connectNulls />
              <Line type="monotone" dataKey="real" stroke="url(#realLine)" strokeWidth={3} dot={{ r: 4, fill: C.h5 }} connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <Legend items={[["Registrado (OCC)", C.h5], ["Proyección central", C.h4], ["Banda +12 % / +50 %", C.cool]]} />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }} className="tray-grid">
        <Card>
          <H2 kicker="Cinco años de escalada" title="De 3.300 a 11.268" />
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.anual} margin={{ top: 18, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke={C.line} vertical={false} />
                <XAxis dataKey="a" tick={{ fill: C.sub, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }} axisLine={{ stroke: C.line }} tickLine={false} />
                <YAxis tick={{ fill: C.faint, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<AnnualTip />} cursor={{ fill: "#ffffff08" }} />
                <Bar dataKey="v" radius={[3, 3, 0, 0]}>
                  {data.anual.map((d, i) => <Cell key={i} fill={d.caveat ? C.steel : HEAT[Math.min(4, i)]} />)}
                  <LabelList dataKey="v" position="top" formatter={(v) => fmt(v)} style={{ fill: C.sub, font: "600 11px 'IBM Plex Mono', monospace" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <H2 kicker="Mismo trimestre, un año después" title="2025 contra 2026" kc={C.h3} />
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comp} margin={{ top: 14, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke={C.line} vertical={false} />
                <XAxis dataKey="nombre" tick={{ fill: C.sub, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }} axisLine={{ stroke: C.line }} tickLine={false} />
                <YAxis tick={{ fill: C.faint, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#ffffff08" }} contentStyle={{ background: C.bg, border: `1px solid ${C.line}`, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }} />
                <Bar dataKey="2025" fill={C.steel} radius={[2, 2, 0, 0]} />
                <Bar dataKey="2026" fill={C.h4} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Legend items={[["2025", C.steel], ["2026", C.h4]]} />
          <p style={{ color: C.faint, font: "400 11px/1.5 'IBM Plex Mono', monospace", margin: "10px 0 0" }}>
            Marzo 2025 es estimado a partir de la nota del informe (“≈80 % más que el mismo mes de 2025”).
          </p>
        </Card>
      </div>
    </div>
  );
}

/* ════════ TAB · EXPEDIENTE ═════════════════════════════════════════════════ */
function Expediente({ data }) {
  const [filtro, setFiltro] = useState("todos");
  const list = filtro === "todos" ? data.eventos : data.eventos.filter((e) => e.mes === filtro);
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <H2 kicker="Expediente del trimestre" title="Los hechos detrás de los números" kc={C.h3} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[["todos", "Todos"], ["ene", "Enero"], ["feb", "Febrero"], ["mar", "Marzo"]].map(([id, n]) => (
            <Pill key={id} active={filtro === id} color={C.h3} onClick={() => setFiltro(id)}>{n}</Pill>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gap: 1, background: C.line, border: `1px solid ${C.line}`, borderRadius: 4, overflow: "hidden" }}>
        {list.map((e, i) => (
          <div key={i} style={{ background: C.surface, padding: "18px 20px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ font: "600 10px 'IBM Plex Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: C.bg, background: tipoColor(e.tipo), padding: "3px 8px", borderRadius: 2 }}>{e.tipo}</span>
              <span style={{ font: "500 12px 'IBM Plex Mono', monospace", color: C.faint }}>{e.fecha} · {e.lugar}</span>
            </div>
            <div style={{ font: "700 17px/1.3 Archivo, sans-serif", color: C.ink, marginBottom: 6 }}>{e.titulo}</div>
            <div style={{ font: "400 14px/1.6 Archivo, sans-serif", color: C.sub }}>{e.texto}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ════════ TAB · PULSO ══════════════════════════════════════════════════════ */
function Pulso({ data }) {
  const [votos, setVotos] = useState(() => data.encuesta.map((q) => q.opciones.reduce((a, o) => ({ ...a, [o.id]: o.seed }), {})));
  const [elegido, setElegido] = useState(data.encuesta.map(() => null));
  const total = votos.map((q) => Object.values(q).reduce((a, b) => a + b, 0));
  function votar(qi, oid) {
    if (elegido[qi]) return;
    setVotos((p) => { const n = p.map((q) => ({ ...q })); n[qi][oid] += 1; return n; });
    setElegido((p) => { const n = [...p]; n[qi] = oid; return n; });
  }
  return (
    <Card>
      <H2 kicker="Pulso ciudadano · encuesta abierta" title="¿Qué ves tú en estas cifras?" kc={C.h5} />
      <p style={{ color: C.sub, font: "400 14px/1.65 Archivo, sans-serif", margin: "0 0 24px", maxWidth: 640 }}>
        No es un sondeo científico: es un termómetro. Tu voto se suma al agregado y se conserva mientras la página esté abierta.
      </p>
      <div style={{ display: "grid", gap: 30 }}>
        {data.encuesta.map((q, qi) => {
          const t = total[qi], answered = !!elegido[qi];
          return (
            <div key={q.id}>
              <div style={{ font: "700 16px/1.4 Archivo, sans-serif", color: C.ink, marginBottom: 14 }}>{q.pregunta}</div>
              <div style={{ display: "grid", gap: 9 }}>
                {q.opciones.map((o) => {
                  const v = votos[qi][o.id], p = pct(v, t), isPick = elegido[qi] === o.id;
                  return (
                    <button key={o.id} onClick={() => votar(qi, o.id)} disabled={answered}
                      style={{ position: "relative", textAlign: "left", border: `1px solid ${isPick ? C.h4 : C.line}`, background: C.surface2, borderRadius: 3, padding: "12px 14px", cursor: answered ? "default" : "pointer", overflow: "hidden" }}>
                      {answered && <div style={{ position: "absolute", inset: 0, width: `${p}%`, background: isPick ? C.hotSoft : C.coolSoft, transition: "width .6s cubic-bezier(.4,0,.2,1)" }} />}
                      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center" }}>
                        <span style={{ font: "500 14px/1.4 Archivo, sans-serif", color: C.ink }}>{o.txt}</span>
                        {answered && <span style={{ font: "600 13px 'IBM Plex Mono', monospace", color: isPick ? C.h4 : C.sub, whiteSpace: "nowrap" }}>{p}%</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ font: "500 11px 'IBM Plex Mono', monospace", color: C.faint, marginTop: 9 }}>
                {answered ? `${fmt(t)} votos · gracias` : "elige una opción para ver el agregado"}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ════════ APP ══════════════════════════════════════════════════════════════ */
const TABS = [
  { id: "panorama", label: "Panorama", color: C.h4 },
  { id: "territorio", label: "Territorio", color: C.h4 },
  { id: "trayectoria", label: "Trayectoria", color: C.cool },
  { id: "expediente", label: "Expediente", color: C.h3 },
  { id: "pulso", label: "Pulso", color: C.h5 },
];

export default function App() {
  useFonts();
  const data = useData();
  const [tab, setTab] = useState("panorama");
  const { meta, trimestre } = data;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.ink, fontFamily: "Archivo, sans-serif" }}>
      <style>{`
        @media (max-width: 720px){
          .pano-grid,.tray-grid,.map-grid{grid-template-columns:1fr !important;}
          .cat-row{grid-template-columns:130px 1fr 38px !important;}
        }
        .tabrail::-webkit-scrollbar{height:0;}
        button:focus-visible{outline:2px solid ${C.h5};outline-offset:2px;}
      `}</style>

      <header style={{ maxWidth: 980, margin: "0 auto", padding: "56px 22px 26px" }}>
        <div style={{ font: "600 11px/1 'IBM Plex Mono', monospace", letterSpacing: "0.24em", color: C.cool, textTransform: "uppercase", marginBottom: 20 }}>
          Yamacoa · Observatorio Cubano de Conflictos
        </div>
        <h1 style={{ font: "900 clamp(44px,8.5vw,80px)/0.94 Archivo, sans-serif", letterSpacing: "-0.03em", margin: 0, color: C.ink }}>
          La calle <span style={{ color: C.h4, fontStyle: "italic" }}>arde</span>
        </h1>
        <p style={{ font: "400 17px/1.6 Archivo, sans-serif", color: C.sub, maxWidth: 600, margin: "22px 0 0" }}>
          {meta.subtitulo}. Tres semanas seguidas de cacerolazos nocturnos, fogatas y gritos de
          “¡Libertad!” encendieron la penumbra de los apagones, y el descontento económico se
          desplazó hacia el desafío abierto al régimen.
        </p>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginTop: 30 }}>
          {[
            { n: fmt(trimestre.total), l: "protestas y denuncias · ene–mar", c: C.ink },
            { n: fmt(trimestre.desafios), l: "desafíos al Estado policial", c: C.h4 },
            { n: "+" + trimestre.deltaMarzoYoYPct + "%", l: "marzo 2026 vs. marzo 2025", c: C.h3 },
          ].map((k, i) => (
            <div key={i}>
              <div style={{ font: "800 36px/1 Archivo, sans-serif", color: k.c, letterSpacing: "-0.02em" }}>{k.n}</div>
              <div style={{ font: "500 11px/1.4 'IBM Plex Mono', monospace", color: C.faint, marginTop: 7, textTransform: "uppercase", letterSpacing: "0.07em" }}>{k.l}</div>
            </div>
          ))}
        </div>
      </header>

      <div style={{ position: "sticky", top: 0, zIndex: 10, background: C.bg + "ee", backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.line}` }}>
        <div className="tabrail" role="tablist" style={{ maxWidth: 980, margin: "0 auto", padding: "0 22px", display: "flex", gap: 4, overflowX: "auto" }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} role="tab" aria-selected={active} onClick={() => setTab(t.id)}
                style={{ position: "relative", font: "600 13px Archivo, sans-serif", letterSpacing: "0.02em", padding: "16px 16px 14px", border: "none", background: "transparent", color: active ? C.ink : C.faint, cursor: "pointer", whiteSpace: "nowrap" }}>
                {t.label}
                <span style={{ position: "absolute", left: 12, right: 12, bottom: 0, height: 2, background: active ? t.color : "transparent", borderRadius: 2 }} />
              </button>
            );
          })}
        </div>
      </div>

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "30px 22px 60px" }}>
        {tab === "panorama" && <Panorama data={data} />}
        {tab === "territorio" && <Territorio data={data} />}
        {tab === "trayectoria" && <Trayectoria data={data} />}
        {tab === "expediente" && <Expediente data={data} />}
        {tab === "pulso" && <Pulso data={data} />}

        <div style={{ marginTop: 26, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 6, padding: "24px 26px" }}>
          <Eyebrow color={C.cool}>Cierre del informe</Eyebrow>
          <p style={{ font: "400 18px/1.55 Archivo, sans-serif", color: C.ink, margin: 0, maxWidth: 680 }}>
            Mientras el buque tanque ruso <em style={{ color: C.h4 }}>Anatoli Kolodkin</em> se acercaba a La
            Habana con 740.000 barriles de crudo, Trump suavizó su bloqueo petrolero. Según el experto
            Jorge Piñón, ese crudo dará unos 250.000 barriles de diésel: la demanda nacional por entre
            10 y 12 días.
          </p>
          <p style={{ font: "700 18px/1.55 Archivo, sans-serif", color: C.h4, margin: "14px 0 0" }}>
            Puede que el régimen tenga entonces 10 o 12 días sin cacerolazos.
          </p>
        </div>

        <footer style={{ marginTop: 34, paddingTop: 22, borderTop: `1px solid ${C.line}`, font: "400 12px/1.7 'IBM Plex Mono', monospace", color: C.faint }}>
          Fuente: {meta.fuente}, informes de enero, febrero y marzo de 2026 · actualizado {meta.actualizado}.
          Cifras mínimas; los eventos están parafraseados; el pronóstico es ilustrativo.
          <br />Yamacoa · una iniciativa independiente por la libertad y los derechos humanos. Otra Cuba mejor es posible.
        </footer>
      </main>
    </div>
  );
}
