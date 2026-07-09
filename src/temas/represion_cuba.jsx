import { useState, useEffect, useMemo, useCallback } from "react";
import * as d3 from "d3";
import {
  ResponsiveContainer, ComposedChart, AreaChart, Area, Line,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";

/* ──────────────────────────────────────────────────────────────────────────
   LA MAQUINARIA DE LA REPRESIÓN  ·  tema Yamacoa
   Renderizador congelado. Los datos viven en /data/represion.json (lo que
   reescribe el agente); aquí van incrustados como copia de respaldo para que
   la página funcione aunque el fetch falle.

   Fuente primaria: OCDH. Series contrastadas con Prisoners Defenders,
   CubaNet, Diario de Cuba, 14ymedio, Infobae, elTOQUE y Amnistía Internacional.
   Cifras "al menos": el OCDH reconoce que son un subregistro.
   ────────────────────────────────────────────────────────────────────────── */

/* ════════ CONFIG DEL RENDERIZADOR (no lo toca el agente) ═══════════════════ */

const DATA_URL = (typeof process !== "undefined" && process.env && process.env.PUBLIC_URL ? process.env.PUBLIC_URL : "") + "/data/represion.json";

// Geometría de provincias (lon,lat). El dataset sólo aporta el "señalamiento".
const PROV_GEO = {
  pinar: [-83.70, 22.42], artemisa: [-82.76, 22.81], habana: [-82.38, 23.13],
  mayabeque: [-82.05, 22.96], matanzas: [-81.40, 22.95], cienfuegos: [-80.45, 22.15],
  villaclara: [-79.97, 22.40], sancti: [-79.45, 21.93], ciego: [-78.76, 21.84],
  camaguey: [-77.92, 21.38], tunas: [-76.95, 20.96], holguin: [-76.26, 20.89],
  granma: [-76.64, 20.38], santiago: [-75.82, 20.02], guantanamo: [-75.21, 20.14],
};

const CUBA_FEATURE = {
  type: "Feature",
  geometry: { type: "Polygon", coordinates: [[
    [-84.95,21.86],[-84.40,22.05],[-83.90,22.35],[-83.30,22.70],[-82.80,23.00],
    [-82.30,23.18],[-81.50,23.18],[-80.90,23.13],[-80.20,22.92],[-79.60,22.66],
    [-79.00,22.46],[-78.40,22.40],[-77.80,22.10],[-77.20,21.82],[-76.60,21.34],
    [-76.10,21.12],[-75.60,21.05],[-75.10,20.72],[-74.50,20.50],[-74.13,20.25],
    [-74.55,20.05],[-75.05,19.92],[-75.85,19.86],[-76.55,19.96],[-77.20,20.02],
    [-77.72,19.84],[-78.22,20.32],[-78.62,20.70],[-79.05,21.00],[-79.62,21.30],
    [-80.22,21.50],[-80.82,21.60],[-81.42,21.70],[-82.02,21.86],[-82.62,22.00],
    [-83.22,22.05],[-83.92,22.00],[-84.42,21.90],[-84.95,21.86],
  ]] },
};

// Meses disponibles en el mapa (etiqueta -> periodo del dataset).
const MAP_MESES = [["abr", "Abril", "2026-04"], ["may", "Mayo", "2026-05"]];

// Encuesta: copy editorial del renderizador. Las barras parten de esta línea
// base ("seed") y le suman los votos persistidos (globales o locales).
const SURVEY = [
  { id: "q1", q: "Ante la escalada represiva, ¿qué debería hacer la comunidad internacional con el régimen cubano?",
    opts: [
      { id: "a", t: "Condicionar todo trato a la liberación de presos políticos", seed: 412 },
      { id: "b", t: "Mantener una presión diplomática gradual", seed: 168 },
      { id: "c", t: "Dialogar sin condiciones previas", seed: 96 },
      { id: "d", t: "No interferir", seed: 51 },
    ] },
  { id: "q2", q: "El total anual de acciones represivas bajó en 2025 frente a 2024. ¿Qué lo explica mejor?",
    opts: [
      { id: "a", t: "El vaciamiento del país por la emigración forzada", seed: 351 },
      { id: "b", t: "Una represión más selectiva y silenciosa", seed: 277 },
      { id: "c", t: "Subregistro: menos información disponible", seed: 142 },
      { id: "d", t: "Una mejora real de los derechos humanos", seed: 23 },
    ] },
];

/* ════════ PERSISTENCIA DE LA ENCUESTA ══════════════════════════════════════
   Define REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY en .env.local
   para tener estadística GLOBAL. Sin ellas la encuesta funciona igual pero los
   votos se guardan sólo en este dispositivo (localStorage).
   Ver ops/represion/poll_supabase.sql. */
const POLL_BACKEND = {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL || "",
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || "",
};
const HAS_SUPA = !!(POLL_BACKEND.supabaseUrl && POLL_BACKEND.supabaseAnonKey);
// poll_votes es una tabla compartida por todos los temas: los qid van namespaced.
const NS = "rep";
const LS_COUNTS = "rep_poll_counts", LS_VOTED = "rep_poll_voted";

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

const pollStore = {
  async results() {
    if (HAS_SUPA) {
      try {
        const r = await fetch(`${POLL_BACKEND.supabaseUrl}/rest/v1/poll_votes?select=question_id,option_id,votes&question_id=like.${NS}:*`,
          { headers: { apikey: POLL_BACKEND.supabaseAnonKey, Authorization: `Bearer ${POLL_BACKEND.supabaseAnonKey}` } });
        if (r.ok) {
          const out = {};
          for (const row of await r.json()) {
            const qid = row.question_id.slice(NS.length + 1);
            if (!out[qid]) out[qid] = {};
            out[qid][row.option_id] = Number(row.votes) || 0;
          }
          return out;
        }
      } catch {}
    }
    return lsGet(LS_COUNTS, {});
  },
  async vote(qid, oid) {
    if (HAS_SUPA) {
      try {
        await fetch(`${POLL_BACKEND.supabaseUrl}/rest/v1/rpc/poll_increment`, {
          method: "POST",
          headers: { apikey: POLL_BACKEND.supabaseAnonKey, Authorization: `Bearer ${POLL_BACKEND.supabaseAnonKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ q: `${NS}:${qid}`, o: oid }),
        });
        return;
      } catch {}
    }
    const c = lsGet(LS_COUNTS, {});
    if (!c[qid]) c[qid] = {};
    c[qid][oid] = (c[qid][oid] || 0) + 1;
    lsSet(LS_COUNTS, c);
  },
};

/* ════════ DATASET DE RESPALDO (espejo de represion.json) ═══════════════════ */
const EMBEDDED = {
  meta: { titulo: "La maquinaria de la represión", actualizado: "2026-06-26", ventana: "ene–may 2026" },
  kpis: [
    { id: "totalVentana", valor: 1596, etiqueta: "acciones represivas ene–may 2026" },
    { id: "mayo", valor: 332, etiqueta: "en mayo (55 detenciones)" },
    { id: "presosMay", valor: 1281, etiqueta: "presos políticos · récord, cierre de mayo" },
    { id: "acum11J", valor: 2076, etiqueta: "presos políticos acumulados desde el 11J" },
  ],
  serieMensual: [
    { mes: "Ene", total: 390, detenciones: 42 }, { mes: "Feb", total: 231, detenciones: 31 },
    { mes: "Mar", total: 277, detenciones: null }, { mes: "Abr", total: 366, detenciones: 27 },
    { mes: "May", total: 332, detenciones: 55 },
  ],
  serieAnual: [
    { anio: "2023", total: 3830, detenciones: 936, nota: null },
    { anio: "2024", total: 3921, detenciones: 818, nota: null },
    { anio: "2025", total: 3179, detenciones: 529, nota: "La baja se atribuye al vaciamiento del país, no a menos represión." },
  ],
  acumuladoDesde2021: 26200,
  composicion: { periodo: "2026-05", total: 332, tipos: [
    { tipo: "Sitio policial a viviendas", n: 79 },
    { tipo: "Abusos contra presos (políticos y comunes)", n: 58 },
    { tipo: "Detenciones arbitrarias", n: 55 },
    { tipo: "Interrupción de comunicaciones", n: 43 },
    { tipo: "Hostigamientos, amenazas y citaciones*", n: 97 },
  ] },
  provincias: [
    { id: "artemisa", nombre: "Artemisa", senal: { "2026-04": "alta", "2026-05": null } },
    { id: "habana", nombre: "La Habana", senal: { "2026-04": "alta", "2026-05": "alta" } },
    { id: "matanzas", nombre: "Matanzas", senal: { "2026-04": "media", "2026-05": "media" } },
    { id: "villaclara", nombre: "Villa Clara", senal: { "2026-04": "alta", "2026-05": "media" } },
    { id: "ciego", nombre: "Ciego de Ávila", senal: { "2026-04": "media", "2026-05": "media" } },
    { id: "camaguey", nombre: "Camagüey", senal: { "2026-04": "alta", "2026-05": "alta" } },
    { id: "tunas", nombre: "Las Tunas", senal: { "2026-04": null, "2026-05": "alta" } },
    { id: "holguin", nombre: "Holguín", senal: { "2026-04": null, "2026-05": "alta" } },
    { id: "granma", nombre: "Granma", senal: { "2026-04": null, "2026-05": "media" } },
    { id: "pinar", nombre: "Pinar del Río", senal: {} },
    { id: "mayabeque", nombre: "Mayabeque", senal: {} },
    { id: "cienfuegos", nombre: "Cienfuegos", senal: {} },
    { id: "sancti", nombre: "Sancti Spíritus", senal: {} },
    { id: "santiago", nombre: "Santiago de Cuba", senal: {} },
    { id: "guantanamo", nombre: "Guantánamo", senal: {} },
  ],
  presos: { fuente: "Prisoners Defenders",
    serie: [{ ref: "Ene 26", n: 1207 }, { ref: "Feb 26", n: 1214 }, { ref: "Abr 26", n: 1260 }, { ref: "May 26", n: 1281 }],
    acumuladoDesde11J: 2076,
    desglose: [
      { etiqueta: "presos políticos al cierre de mayo (+28 en el mes)", n: 1281 },
      { etiqueta: "personas presas por política desde el 11J de 2021", n: 2076 },
      { etiqueta: "mujeres encarceladas por motivos políticos", n: 131 },
      { etiqueta: "con patologías médicas graves", n: 467 },
      { etiqueta: "con trastornos graves de salud mental sin tratamiento", n: 47 },
      { etiqueta: "encarcelados siendo menores de edad", n: 31 },
    ] },
  casos: [
    { id: "muir", nombre: "Jonathan David Muir Burgos", rol: "Adolescente · Morón, Ciego de Ávila", estado: "Excarcelado", fecha: "2026-06-24", destacado: true,
      resumen: "Detenido el 16 de marzo con 16 años tras las protestas de Morón y acusado de «sabotaje», fue recluido en Canaleta, una cárcel de adultos, donde cumplió 17 años. La CIDH le otorgó medidas cautelares; Amnistía, Freedom House, EEUU y la UE pidieron su salida. Excarcelado el 24 de junio con la condición de no denunciar en redes; su causa penal sigue sin aclararse.",
      fuentes: ["CubaNet", "Diario de Cuba", "14ymedio", "Amnistía Internacional"] },
    { id: "crespo", nombre: "Christian de Jesús Crespo Álvarez", rol: "Adolescente · 16 años", estado: "Prisión provisional", fecha: "2026-03", destacado: false,
      resumen: "Otro menor detenido tras las protestas de Morón y recluido en Canaleta, acusado igualmente de «sabotaje», sin las garantías especiales exigidas para menores de edad.",
      fuentes: ["14ymedio", "Prisoners Defenders"] },
    { id: "soler", nombre: "Berta Soler Fernández", rol: "Líder de las Damas de Blanco", estado: "Detención", fecha: "2026-05", destacado: false,
      resumen: "Detenida a inicios de mayo junto a su esposo por la Seguridad del Estado al salir de la sede de la organización, en el municipio 10 de Octubre de La Habana.",
      fuentes: ["OCDH", "CiberCuba"] },
    { id: "moya", nombre: "Ángel Juan Moya Acosta", rol: "Expreso político", estado: "Detención", fecha: "2026-05", destacado: false,
      resumen: "Esposo de Berta Soler, arrestado en la misma operación de inicios de mayo.", fuentes: ["OCDH", "CiberCuba"] },
    { id: "delacruz", nombre: "Yoan de la Cruz", rol: "Joven del 11J", estado: "Detención", fecha: "2026-05", destacado: false,
      resumen: "Conocido por grabar una de las primeras manifestaciones del 11 de julio de 2021. Detenido de nuevo en mayo.", fuentes: ["OCDH"] },
    { id: "ballester", nombre: "Sordey Ballester Horta", rol: "Dermatóloga · Matanzas", estado: "Detención", fecha: "2026-05-15", destacado: false,
      resumen: "Detenida el 15 de mayo presuntamente por fotografiar un cartel con consignas críticas contra el gobierno.", fuentes: ["OCDH"] },
    { id: "holguin", nombre: "Ola represiva de Holguín", rol: "19–22 de mayo · 10 personas", estado: "Protesta", fecha: "2026-05", destacado: false,
      resumen: "Eusebio Martínez Matos, Braulio Cuenca, Jenny Moré, Jaime Bosch, José A. Linnet, Yaquelín Thope, Yamilka Mora, Israel Espinosa Thope, Léstor O. Martínez y Rafael Batista, vinculados a las protestas en la provincia.", fuentes: ["OCDH"] },
    { id: "farinas", nombre: "Guillermo «Coco» Fariñas", rol: "Opositor · FANTU", estado: "Detención", fecha: "2026-05", destacado: false,
      resumen: "Miembro del Foro Antitotalitario Unido, detenido durante el mes de mayo.", fuentes: ["OCDH"] },
    { id: "chang", nombre: "Erick Alain Chang Padrón", rol: "Activista", estado: "Prisión provisional", fecha: "2026-05-21", destacado: false,
      resumen: "Nueva detención el 21 de mayo; habría sido trasladado al centro de procesamiento penal de Villa Marista.", fuentes: ["OCDH"] },
    { id: "saez", nombre: "Pedro Sáez", rol: "Villa Clara", estado: "Protesta", fecha: "2026-05", destacado: false,
      resumen: "Detenido en el contexto de una manifestación en el municipio de Corralillo.", fuentes: ["OCDH"] },
    { id: "maldonado", nombre: "Daniel Maldonado", rol: "Periodista colombiano", estado: "Detención", fecha: "2026-05", destacado: false,
      resumen: "Arrestado en Cuba durante la cobertura del mes de mayo.", fuentes: ["OCDH"] },
    { id: "alina", nombre: "Alina Bárbara López Hernández", rol: "Académica · co-dir. Sección Cuba de LASA", estado: "Impedimento de salida", fecha: "2026-05", destacado: false,
      resumen: "Impedimento de salida del país: tenía invitación al congreso anual de la asociación.", fuentes: ["OCDH"] },
    { id: "ferrer", nombre: "José Daniel Ferrer García", rol: "Líder de UNPACU", estado: "Excarcelado", fecha: "2026-01-16", destacado: false,
      resumen: "Excarcelado el 16 de enero; se negó a aceptar las condiciones impuestas a los liberados. Reclama la liberación de Félix Navarro, Sayli Navarro, Maykel Osorbo y Luis Manuel Otero Alcántara.", fuentes: ["Prisoners Defenders", "Infobae"] },
    { id: "osorbo", nombre: "Maykel «Osorbo» Castillo", rol: "Movimiento San Isidro", estado: "Condena", fecha: "2021", destacado: false,
      resumen: "Cumple 9 años de prisión desde 2021. Coautor de «Patria y Vida», ganó dos Grammy Latino que nunca pudo recoger.", fuentes: ["Prisoners Defenders"] },
    { id: "onaikel", nombre: "Onaikel Infante Abreu", rol: "Activista · La Habana", estado: "Condena", fecha: "2023", destacado: false,
      resumen: "Cumple 8 años por una protesta pacífica desde la azotea de su vivienda con consignas como «Patria y Vida». Denuncia un cáncer de garganta sin tratamiento adecuado.", fuentes: ["Prisoners Defenders"] },
    { id: "alfaro", nombre: "Daniel Alfaro Frías", rol: "Coordinador del MONR · 71 años", estado: "Condena", fecha: "2024-03", destacado: false,
      resumen: "Cumple 9 años en la prisión de Guanajay (Artemisa). Denuncia maltratos, cinco enfermedades crónicas y negación de asistencia médica.", fuentes: ["Prisoners Defenders"] },
    { id: "garcia-rios", nombre: "Lázaro García Ríos", rol: "Preso político", estado: "Fallecido bajo custodia", fecha: "2026-01-22", destacado: false,
      resumen: "Falleció bajo custodia del Estado el 22 de enero mientras cumplía una condena de 20 años, tras reiteradas denuncias por negación de atención médica.", fuentes: ["Prisoners Defenders"] },
  ],
};

/* ════════ UTILIDADES ═══════════════════════════════════════════════════════ */
function fmt(n) { return n == null ? "—" : Number(n).toLocaleString("es-ES"); }

function heat(t) {
  const stops = [[0,[108,124,138]],[0.4,[201,162,75]],[0.72,[219,110,58]],[1,[196,57,43]]];
  t = Math.max(0, Math.min(1, t));
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++)
    if (t >= stops[i][0] && t <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; break; }
  const f = (t - a[0]) / (b[0] - a[0] || 1);
  const c = a[1].map((v, i) => Math.round(v + (b[1][i] - v) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
const NIVEL = { alta: 1, media: 0.55, baja: 0.3 };
const senalT = (lvl) => (lvl ? NIVEL[lvl] || 0 : 0);

const COL = { ember: "#C4392B", amber: "#DB6E3A", gold: "#C9A24B", steel: "#6C7C8A", teal: "#5E9C8E" };
const ESTCOL = {
  "Detención": "#C4392B", "Prisión provisional": "#9C4A3A", "Condena": "#C9A24B",
  "Protesta": "#DB6E3A", "Excarcelado": "#5E9C8E", "Impedimento de salida": "#B08A3E",
  "Fallecido bajo custodia": "#7C8A96",
};

function MesTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="tip">
      <div className="tip-h">{label} 2026</div>
      <div className="tip-row"><span>Acciones represivas</span><b>{fmt(d.total)}</b></div>
      {d.det != null ? <div className="tip-row"><span>· detenciones</span><b>{fmt(d.det)}</b></div>
        : <div className="tip-note">Sin desglose público de detenciones</div>}
    </div>
  );
}
function AnioTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="tip">
      <div className="tip-h">{label}</div>
      <div className="tip-row"><span>Total acciones</span><b>{fmt(d.total)}</b></div>
      <div className="tip-row"><span>Detenciones arbitrarias</span><b>{fmt(d.detenciones)}</b></div>
      {d.nota && <div className="tip-note">{d.nota}</div>}
    </div>
  );
}
function PresoTip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="tip">
      <div className="tip-h">{label}</div>
      <div className="tip-row"><span>Presos políticos</span><b>{fmt(payload[0].payload.n)}</b></div>
      <div className="tip-note">Conteo de Prisoners Defenders</div>
    </div>
  );
}

const FUENTES = "OCDH · Prisoners Defenders · CubaNet · Diario de Cuba · 14ymedio · Infobae · elTOQUE · Amnistía Internacional";

/* ════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [data, setData] = useState(EMBEDDED);
  const [tab, setTab] = useState("curva");
  const [mesMapa, setMesMapa] = useState("2026-05");
  const [sel, setSel] = useState("habana");
  const [filtro, setFiltro] = useState("Todos");
  const [votos, setVotos] = useState(() => lsGet(LS_VOTED, {}));
  const [live, setLive] = useState({});

  // fuentes tipográficas
  useEffect(() => {
    const id = "rep-fonts";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  // dataset: intenta el JSON publicado; si falla, se queda el respaldo
  useEffect(() => {
    let alive = true;
    fetch(DATA_URL).then((r) => (r.ok ? r.json() : null)).then((j) => { if (alive && j) setData(j); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // resultados de la encuesta
  useEffect(() => { pollStore.results().then(setLive).catch(() => setLive({})); }, []);

  const vote = useCallback(async (qid, oid) => {
    if (votos[qid]) return;
    const nv = { ...votos, [qid]: oid }; setVotos(nv); lsSet(LS_VOTED, nv);
    setLive((p) => { const c = { ...p, [qid]: { ...(p[qid] || {}) } }; c[qid][oid] = (c[qid][oid] || 0) + 1; return c; });
    try { await pollStore.vote(qid, oid); } catch {}
  }, [votos]);

  // serie mensual para recharts (det = detenciones)
  const mensual = useMemo(() => (data.serieMensual || []).map((m) => ({ mes: m.mes, total: m.total, det: m.detenciones })), [data]);

  // mapa
  const MW = 1000, MH = 380;
  const { cubaPath, project } = useMemo(() => {
    const p = d3.geoMercator().fitExtent([[26, 26], [MW - 26, MH - 26]], CUBA_FEATURE);
    return { cubaPath: d3.geoPath(p)(CUBA_FEATURE), project: p };
  }, []);
  const provincias = useMemo(
    () => (data.provincias || []).filter((p) => PROV_GEO[p.id]).map((p) => ({ ...p, lonlat: PROV_GEO[p.id] })),
    [data]
  );
  const intensity = (p) => senalT(p.senal ? p.senal[mesMapa] : null);
  const radius = (p) => 6 + Math.sqrt(intensity(p)) * 26;
  const prov = provincias.find((p) => p.id === sel) || provincias[0];
  const topMes = (per) => provincias.filter((p) => p.senal && p.senal[per] === "alta").map((p) => p.nombre);

  // casos
  const casos = data.casos || [];
  const destacado = casos.find((c) => c.destacado);
  const estados = ["Todos", ...Array.from(new Set(casos.map((c) => c.estado)))];
  const casosVis = casos.filter((c) => !c.destacado && (filtro === "Todos" || c.estado === filtro));

  const kpi = (id) => (data.kpis || []).find((k) => k.id === id) || {};

  return (
    <div className="rep">
      <style>{CSS}</style>

      <header className="hd">
        <div className="eyebrow">OBSERVATORIO · REPRESIÓN EN CUBA · FOCO ABRIL–MAYO 2026</div>
        <h1 className="title">LA MAQUINARIA<span> DE LA REPRESIÓN</span></h1>
        <p className="sub">
          Cada mes el régimen cubano responde a la crisis con detenciones, sitios policiales
          y cortes de comunicación. Esto es lo que el OCDH documentó —siempre «al menos»—
          entre el repunte de enero y la ola de Holguín de mayo.
        </p>
        <div className="kpis">
          {["totalVentana", "mayo", "presosMay", "acum11J"].map((id) => (
            <div className="kpi" key={id}>
              <div className="kpi-n">{fmt(kpi(id).valor)}</div>
              <div className="kpi-l">{kpi(id).etiqueta}</div>
            </div>
          ))}
        </div>
        <div className="stamp">FUENTES ABIERTAS · CIFRAS «AL MENOS» · SUBREGISTRO · act. {data.meta && data.meta.actualizado}</div>
      </header>

      <nav className="tabs">
        {[["curva","La curva 2026"],["mapa","El mapa"],["tipos","Anatomía del abuso"],
          ["presos","Presos políticos"],["casos","Los rostros"],["encuesta","Tu lectura"]].map(([k, lbl]) => (
          <button key={k} className={"tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{lbl}</button>
        ))}
      </nav>

      {/* 1 · CURVA */}
      {tab === "curva" && (
        <section className="panel">
          <div className="grid2">
            <div className="card">
              <div className="card-h">Acciones represivas por mes · 2026</div>
              <div className="card-sub">Área: total mensual. Línea: detenciones arbitrarias (marzo sin desglose).</div>
              <div className="chart">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={mensual} margin={{ top: 10, right: 14, left: -6, bottom: 0 }}>
                    <defs><linearGradient id="gTot" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COL.amber} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={COL.amber} stopOpacity={0.04} />
                    </linearGradient></defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,.06)" />
                    <XAxis dataKey="mes" tick={{ fill: "#8B97A3", fontSize: 12, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#8B97A3", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip content={<MesTip />} cursor={{ stroke: "rgba(255,255,255,.12)" }} />
                    <Area type="monotone" dataKey="total" stroke={COL.amber} strokeWidth={2.5} fill="url(#gTot)" />
                    <Line type="monotone" dataKey="det" stroke={COL.ember} strokeWidth={2} dot={{ r: 3, fill: COL.ember }} connectNulls={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-h">El total anual no cuenta toda la historia</div>
              <div className="card-sub">2025 cae frente a 2024 — pero el OCDH lo atribuye al vaciamiento del país, no a menos represión.</div>
              <div className="chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.serieAnual || []} margin={{ top: 10, right: 14, left: -6, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,.06)" vertical={false} />
                    <XAxis dataKey="anio" tick={{ fill: "#8B97A3", fontSize: 12, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#8B97A3", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip content={<AnioTip />} cursor={{ fill: "rgba(255,255,255,.04)" }} />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={64}>
                      {(data.serieAnual || []).map((d, i) => <Cell key={i} fill={d.nota ? COL.steel : COL.amber} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="foot-note">Desde 2021 el OCDH contabiliza más de {fmt(data.acumuladoDesde2021)} acciones represivas.</div>
            </div>
          </div>
          <div className="readout">
            <p><b>El patrón de 2026.</b> Enero abrió con un repunte (390 acciones) ligado al nerviosismo del
              régimen; febrero bajó a 231; y desde marzo la cifra vuelve a subir —277, 366, 332— en paralelo
              a las protestas por apagones y agua. Las detenciones, en cambio, se disparan en mayo: de 27 en
              abril a <b>55</b>, casi todas asociadas a las manifestaciones de Holguín.</p>
          </div>
        </section>
      )}

      {/* 2 · MAPA */}
      {tab === "mapa" && (
        <section className="panel">
          <div className="map-bar">
            <div className="seg">
              {MAP_MESES.map(([, lbl, per]) => (
                <button key={per} className={"seg-b" + (mesMapa === per ? " on" : "")} onClick={() => setMesMapa(per)}>{lbl}</button>
              ))}
            </div>
            <span className="map-hint">Provincias <b>señaladas por el OCDH como más afectadas</b> ese mes — no es un recuento exacto.</span>
          </div>
          <div className="map-stage">
            <div className="map-wrap">
              <svg viewBox={`0 0 ${MW} ${MH}`} className="map-svg" preserveAspectRatio="xMidYMid meet">
                <path d={cubaPath} fill="rgba(255,255,255,.035)" stroke="rgba(255,255,255,.16)" strokeWidth={1.2} />
                {provincias.map((p) => {
                  const [x, y] = project(p.lonlat); const it = intensity(p); const on = sel === p.id; const act = it > 0;
                  return (
                    <g key={p.id} transform={`translate(${x},${y})`} onClick={() => setSel(p.id)} style={{ cursor: "pointer" }}>
                      {act && <circle r={radius(p) + 6} fill={heat(it)} opacity={0.14} />}
                      <circle r={radius(p)} fill={act ? heat(it) : "rgba(140,150,160,.28)"} stroke={on ? "#fff" : "rgba(0,0,0,.4)"} strokeWidth={on ? 2 : 1} />
                      <text className="map-lbl" y={radius(p) + 13} textAnchor="middle">{p.nombre}</text>
                    </g>
                  );
                })}
              </svg>
              <div className="legend">
                <span className="lg-t">Señalamiento del mes:</span>
                <span className="lg-i"><i style={{ background: heat(1) }} />Más afectada</span>
                <span className="lg-i"><i style={{ background: heat(0.55) }} />Afectada</span>
                <span className="lg-i"><i style={{ background: "rgba(140,150,160,.4)" }} />Sin señalar</span>
              </div>
            </div>
            <aside className="dossier">
              <div className="d-prov">{prov && prov.nombre}</div>
              <div className="d-state" style={{ color: heat(intensity(prov || {})) }}>
                {intensity(prov || {}) >= 1 ? "Entre las más afectadas" : intensity(prov || {}) > 0 ? "Afectada" : "No señalada este mes"}
              </div>
              <div className="d-rows">
                <div className="d-row"><span>Abril 2026</span><b>{prov && prov.senal && prov.senal["2026-04"] === "alta" ? "más afectada" : prov && prov.senal && prov.senal["2026-04"] ? "afectada" : "—"}</b></div>
                <div className="d-row"><span>Mayo 2026</span><b>{prov && prov.senal && prov.senal["2026-05"] === "alta" ? "más afectada" : prov && prov.senal && prov.senal["2026-05"] ? "afectada" : "—"}</b></div>
              </div>
              <p className="d-text">{provNota(prov ? prov.id : "")}</p>
              <div className="d-hint">Toca cualquier provincia del mapa.</div>
            </aside>
          </div>
          <div className="shift">
            <span>El foco se desplaza al oriente →</span>
            <div className="shift-row">
              <div><div className="shift-m">Abril</div><div className="shift-p">{topMes("2026-04").join(" · ")}</div></div>
              <div className="shift-arrow">→</div>
              <div><div className="shift-m">Mayo</div><div className="shift-p">{topMes("2026-05").join(" · ")}</div></div>
            </div>
          </div>
        </section>
      )}

      {/* 3 · TIPOS */}
      {tab === "tipos" && (
        <section className="panel">
          <div className="card">
            <div className="card-h">De qué se compone la represión de mayo</div>
            <div className="card-sub">{fmt(data.composicion && data.composicion.total)} acciones documentadas. El sitio policial a viviendas vuelve a encabezar el registro.</div>
            <div className="bars">
              {(data.composicion ? data.composicion.tipos : []).map((t, i, arr) => {
                const max = arr[0].n;
                return (
                  <div className="barrow" key={i}>
                    <div className="barrow-l">{t.tipo}</div>
                    <div className="barrow-track"><div className="barrow-fill" style={{ width: `${(t.n / max) * 100}%`, background: heat(t.n / max) }} /></div>
                    <div className="barrow-n">{fmt(t.n)}</div>
                  </div>
                );
              })}
            </div>
            <div className="foot-note">* Cifra derivada: residual del total tras restar las categorías con dato propio del OCDH.</div>
          </div>
          <div className="grid2" style={{ marginTop: 18 }}>
            <div className="mini">
              <div className="mini-h">Abril 2026</div><div className="mini-big">366</div>
              <div className="mini-sub">acciones · 27 detenciones · 339 otros abusos</div>
              <p className="mini-p">Los presos políticos, comunes y sus familiares se llevaron la peor parte: <b>71 denuncias</b> de abusos. La UE, denunció el OCDH, hizo exigencias a EEUU en la Cumbre de Barcelona y ninguna a La Habana.</p>
            </div>
            <div className="mini">
              <div className="mini-h">Mayo 2026</div><div className="mini-big">332</div>
              <div className="mini-sub">acciones · 55 detenciones · 277 otros abusos</div>
              <p className="mini-p">Suben con fuerza las detenciones (de 27 a 55) y la <b>interrupción de comunicaciones</b> (43 casos), táctica habitual para aislar a quienes protestan.</p>
            </div>
          </div>
        </section>
      )}

      {/* 4 · PRESOS */}
      {tab === "presos" && (
        <section className="panel">
          <div className="grid2">
            <div className="card">
              <div className="card-h">El presidio político crece en 2026</div>
              <div className="card-sub">Conteo de {data.presos && data.presos.fuente}. Mayo cierra en un récord histórico.</div>
              <div className="chart">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data.presos ? data.presos.serie : []} margin={{ top: 10, right: 14, left: -6, bottom: 0 }}>
                    <defs><linearGradient id="gPres" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COL.ember} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={COL.ember} stopOpacity={0.03} />
                    </linearGradient></defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,.06)" />
                    <XAxis dataKey="ref" tick={{ fill: "#8B97A3", fontSize: 12, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[1150, 1320]} tick={{ fill: "#8B97A3", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip content={<PresoTip />} cursor={{ stroke: "rgba(255,255,255,.12)" }} />
                    <Area type="monotone" dataKey="n" stroke={COL.ember} strokeWidth={2.5} fill="url(#gPres)" dot={{ r: 4, fill: COL.ember }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-h">Quiénes están dentro</div>
              <div className="card-sub">Desglose de Prisoners Defenders.</div>
              <div className="stats">
                {(data.presos ? data.presos.desglose : []).map((s, i) => (
                  <div className="stat" key={i}><div className="stat-n">{fmt(s.n)}</div><div className="stat-l">{s.etiqueta}</div></div>
                ))}
              </div>
            </div>
          </div>
          <div className="readout">
            <p><b>Dos conteos, una realidad.</b> El OCDH registraba unos 800 presos políticos «activos» al cierre
              de 2025 con su propia metodología; Prisoners Defenders, que cuenta de forma más amplia, superaba ya
              los 1.200. Distintas varas de medir, misma dirección: el presidio político crece mes a mes pese a
              las excarcelaciones anunciadas con el Vaticano.</p>
          </div>
        </section>
      )}

      {/* 5 · CASOS */}
      {tab === "casos" && (
        <section className="panel">
          {destacado && (
            <article className="featured">
              <div className="ft-left">
                <div className="ft-badge" style={{ background: ESTCOL[destacado.estado] }}>{destacado.estado} · {destacado.fecha}</div>
                <h2 className="ft-name">{destacado.nombre}</h2>
                <div className="ft-role">{destacado.rol}</div>
                <p className="ft-text">{destacado.resumen}</p>
                <div className="ft-src">Fuentes: {destacado.fuentes.join(" · ")}</div>
              </div>
              <div className="ft-mark">17<span>años</span></div>
            </article>
          )}

          <div className="filters">
            {estados.map((e) => (
              <button key={e} className={"fchip" + (filtro === e ? " on" : "")} onClick={() => setFiltro(e)}>
                {e !== "Todos" && <span className="fdot" style={{ background: ESTCOL[e] }} />}{e}
              </button>
            ))}
          </div>

          <div className="casos">
            {casosVis.map((c) => (
              <article className="caso" key={c.id}>
                <div className="caso-tag" style={{ background: ESTCOL[c.estado] }}>{c.estado}</div>
                <h3 className="caso-n">{c.nombre}</h3>
                <div className="caso-r">{c.rol}</div>
                <p className="caso-d">{c.resumen}</p>
                <div className="caso-src">{c.fuentes.join(" · ")}</div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 6 · ENCUESTA */}
      {tab === "encuesta" && (
        <section className="panel">
          <div className="card-h" style={{ marginBottom: 4 }}>Tu lectura de la situación</div>
          <div className="card-sub" style={{ marginBottom: 18 }}>
            Encuesta informal, sin valor estadístico. Las barras parten de una línea base ilustrativa y suman
            los votos {HAS_SUPA ? "de todos los visitantes" : "guardados en este dispositivo"}.
          </div>
          {SURVEY.map((q) => {
            const voto = votos[q.id];
            const liveQ = live[q.id] || {};
            const total = q.opts.reduce((s, o) => s + o.seed + (liveQ[o.id] || 0), 0);
            return (
              <div className="poll" key={q.id}>
                <div className="poll-q">{q.q}</div>
                <div className="poll-opts">
                  {q.opts.map((o) => {
                    const count = o.seed + (liveQ[o.id] || 0);
                    const pct = total ? (count / total) * 100 : 0;
                    const mine = voto === o.id;
                    return (
                      <button key={o.id} className={"poll-opt" + (voto ? " voted" : "") + (mine ? " mine" : "")}
                        onClick={() => vote(q.id, o.id)} disabled={!!voto}>
                        <div className="poll-bar" style={{ width: voto ? `${pct}%` : "0%" }} />
                        <span className="poll-t">{o.t}{mine && " ✓"}</span>
                        {voto && <span className="poll-pct">{pct.toFixed(0)}%</span>}
                      </button>
                    );
                  })}
                </div>
                {voto && <div className="poll-foot">{fmt(total)} respuestas · {HAS_SUPA ? "estadística global" : "sólo este dispositivo"}</div>}
              </div>
            );
          })}
          <div className="readout" style={{ marginTop: 22 }}>
            <p>«El régimen aleja cada vez más a Cuba de un escenario de transición pacífica y le encamina hacia
              el colapso total», resumió Yaxys Cires, director de estrategias del OCDH. La pregunta que dejó
              abierta: «¿Por qué no comenzar un proceso de cambios políticos, económicos y sociales medibles,
              abierto a todos los sectores de la sociedad cubana y del exilio?».</p>
          </div>
        </section>
      )}

      <footer className="ft">
        <div className="ft-srcline">Fuentes · {FUENTES}</div>
        <div className="ft-meta">
          Datos «al menos» reportados por el OCDH y contrastados con prensa independiente; subregistro reconocido
          por la propia organización. El mapa refleja provincias señaladas como más afectadas, no recuentos exactos.
          Encuesta meramente ilustrativa.
        </div>
      </footer>
    </div>
  );
}

function provNota(id) {
  const m = {
    holguin: "Epicentro de la ola represiva del 19–22 de mayo, con al menos diez detenidos vinculados a las protestas.",
    habana: "Presente entre las más afectadas todos los meses: detenciones de las Damas de Blanco, las hermanas Reyes Moreno y otros.",
    villaclara: "Detención de Pedro Sáez tras la manifestación de Corralillo y de Alexei Martínez Rojas en Camajuaní.",
    camaguey: "Reiteradamente entre las provincias de mayor represión en 2024, 2025 y 2026.",
    tunas: "Aparece entre las más afectadas en mayo, cuando se desplaza el foco hacia el oriente.",
    matanzas: "Detención de la dermatóloga Sordey Ballester por fotografiar un cartel crítico.",
    ciego: "Morón fue foco de protestas en marzo; de allí salieron los menores Jonathan Muir y Christian Crespo, presos por «sabotaje».",
    artemisa: "Señalada en abril; alberga la prisión de Guanajay, donde cumplen condena presos políticos como Daniel Alfaro Frías.",
    granma: "Afectada en mayo dentro del desplazamiento represivo hacia el oriente del país.",
  };
  return m[id] || "Sin señalamiento específico en los informes de abril y mayo del OCDH.";
}

/* ════════════════════════════════════════════════════════════════════════ */
const CSS = `
.rep{
  --bg:#0C0F14; --bg2:#11151C; --card:#141923; --line:rgba(255,255,255,.08);
  --tx:#E7ECF1; --tx2:#9AA6B2; --ember:#C4392B; --amber:#DB6E3A; --gold:#C9A24B;
  background:radial-gradient(1200px 600px at 50% -10%, #161D27 0%, #0C0F14 60%);
  color:var(--tx); font-family:'Archivo',system-ui,sans-serif;
  padding:34px 22px 60px; max-width:1120px; margin:0 auto; -webkit-font-smoothing:antialiased;
}
.rep *{box-sizing:border-box;}
.eyebrow{font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:.22em; color:var(--amber); text-transform:uppercase; margin-bottom:14px;}
.title{font-size:clamp(34px,6.4vw,68px); line-height:.96; font-weight:900; letter-spacing:-.02em; margin:0;}
.title span{color:var(--ember);}
.sub{max-width:680px; color:var(--tx2); font-size:15.5px; line-height:1.6; margin:16px 0 24px;}
.kpis{display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:18px;}
.kpi{background:var(--card); border:1px solid var(--line); border-radius:12px; padding:16px;}
.kpi-n{font-family:'IBM Plex Mono',monospace; font-size:30px; font-weight:600; color:var(--amber); line-height:1;}
.kpi-l{font-size:11.5px; color:var(--tx2); margin-top:9px; line-height:1.35;}
.stamp{display:inline-block; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.16em; color:var(--tx2); border:1px solid var(--line); border-radius:6px; padding:6px 11px;}
.tabs{display:flex; flex-wrap:wrap; gap:7px; margin:28px 0 22px; border-bottom:1px solid var(--line); padding-bottom:14px;}
.tab{background:transparent; border:1px solid var(--line); color:var(--tx2); font-family:'Archivo',sans-serif; font-size:13.5px; font-weight:600; padding:9px 15px; border-radius:999px; cursor:pointer; transition:.18s;}
.tab:hover{color:var(--tx); border-color:rgba(255,255,255,.22);}
.tab.on{background:var(--ember); border-color:var(--ember); color:#fff;}
.panel{animation:fade .35s ease;}
@keyframes fade{from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;}}
.grid2{display:grid; grid-template-columns:1fr 1fr; gap:16px;}
.card{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px;}
.card-h{font-size:17px; font-weight:800; letter-spacing:-.01em;}
.card-sub{font-size:12.5px; color:var(--tx2); margin:5px 0 12px; line-height:1.45;}
.chart{margin:0 -4px;}
.foot-note{font-size:11px; color:var(--tx2); margin-top:10px; font-family:'IBM Plex Mono',monospace;}
.tip{background:#0A0D12; border:1px solid rgba(255,255,255,.14); border-radius:9px; padding:10px 12px; box-shadow:0 8px 24px rgba(0,0,0,.4);}
.tip-h{font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--amber); margin-bottom:6px; letter-spacing:.04em;}
.tip-row{display:flex; justify-content:space-between; gap:18px; font-size:12.5px; color:var(--tx); padding:1px 0;}
.tip-row b{font-family:'IBM Plex Mono',monospace;}
.tip-note{font-size:10.5px; color:var(--tx2); margin-top:5px; max-width:210px; line-height:1.35;}
.readout{background:linear-gradient(180deg,rgba(196,57,43,.07),rgba(196,57,43,0)); border:1px solid var(--line); border-left:3px solid var(--ember); border-radius:10px; padding:16px 18px; margin-top:18px;}
.readout p{margin:0; font-size:14.5px; line-height:1.62; color:#D4DBE2;}
.readout b{color:#fff;}
.map-bar{display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-bottom:14px;}
.seg{display:inline-flex; background:var(--card); border:1px solid var(--line); border-radius:999px; padding:3px;}
.seg-b{background:transparent; border:none; color:var(--tx2); font-family:'Archivo'; font-weight:700; font-size:13px; padding:7px 18px; border-radius:999px; cursor:pointer; transition:.16s;}
.seg-b.on{background:var(--amber); color:#0A0D12;}
.map-hint{font-size:12px; color:var(--tx2); line-height:1.4;}
.map-hint b{color:var(--tx);}
.map-stage{display:grid; grid-template-columns:1fr 300px; gap:16px; align-items:start;}
.map-wrap{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:10px 10px 14px;}
.map-svg{width:100%; height:auto; display:block;}
.map-lbl{fill:var(--tx2); font-size:11px; font-family:'IBM Plex Mono',monospace; pointer-events:none;}
.legend{display:flex; gap:16px; flex-wrap:wrap; align-items:center; padding:8px 6px 2px; border-top:1px solid var(--line); margin-top:6px;}
.lg-t{font-size:11px; color:var(--tx2); font-family:'IBM Plex Mono',monospace;}
.lg-i{display:inline-flex; align-items:center; gap:6px; font-size:11.5px; color:var(--tx2);}
.lg-i i{width:11px; height:11px; border-radius:50%; display:inline-block;}
.dossier{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px; position:sticky; top:16px;}
.d-prov{font-size:20px; font-weight:800; letter-spacing:-.01em;}
.d-state{font-family:'IBM Plex Mono',monospace; font-size:12px; margin-top:4px; letter-spacing:.03em;}
.d-rows{margin:14px 0; border-top:1px solid var(--line); padding-top:12px;}
.d-row{display:flex; justify-content:space-between; font-size:13px; padding:4px 0; color:var(--tx2);}
.d-row b{color:var(--tx); font-weight:600; text-transform:capitalize;}
.d-text{font-size:13px; line-height:1.55; color:#CBD4DC; margin:6px 0 0;}
.d-hint{font-size:11px; color:var(--tx2); margin-top:14px; font-family:'IBM Plex Mono',monospace;}
.shift{margin-top:18px; background:var(--card); border:1px solid var(--line); border-radius:12px; padding:16px 18px;}
.shift>span{font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:.12em; color:var(--amber); text-transform:uppercase;}
.shift-row{display:flex; align-items:center; gap:20px; margin-top:12px; flex-wrap:wrap;}
.shift-m{font-weight:800; font-size:15px;}
.shift-p{font-size:13px; color:var(--tx2); margin-top:2px;}
.shift-arrow{font-size:22px; color:var(--ember);}
.bars{display:flex; flex-direction:column; gap:11px; margin-top:6px;}
.barrow{display:grid; grid-template-columns:1fr 2.1fr auto; align-items:center; gap:12px;}
.barrow-l{font-size:13px; color:#D4DBE2; line-height:1.3;}
.barrow-track{height:16px; background:rgba(255,255,255,.05); border-radius:5px; overflow:hidden;}
.barrow-fill{height:100%; border-radius:5px; transition:width .5s cubic-bezier(.2,.7,.3,1);}
.barrow-n{font-family:'IBM Plex Mono',monospace; font-size:15px; font-weight:600; min-width:34px; text-align:right;}
.mini{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px;}
.mini-h{font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:.1em; color:var(--amber); text-transform:uppercase;}
.mini-big{font-size:46px; font-weight:900; line-height:1; margin:8px 0 2px; letter-spacing:-.02em;}
.mini-sub{font-size:12px; color:var(--tx2); font-family:'IBM Plex Mono',monospace;}
.mini-p{font-size:13.5px; line-height:1.55; color:#CBD4DC; margin:12px 0 0;}
.mini-p b{color:#fff;}
.stats{display:grid; grid-template-columns:1fr 1fr; gap:12px;}
.stat{background:var(--bg2); border:1px solid var(--line); border-radius:10px; padding:13px 14px;}
.stat-n{font-family:'IBM Plex Mono',monospace; font-size:25px; font-weight:600; color:var(--amber); line-height:1;}
.stat-l{font-size:11.5px; color:var(--tx2); margin-top:7px; line-height:1.35;}
.featured{display:grid; grid-template-columns:1fr auto; gap:18px; align-items:center; background:linear-gradient(120deg,rgba(94,156,142,.12),rgba(20,25,35,.4)); border:1px solid rgba(94,156,142,.3); border-radius:16px; padding:22px; margin-bottom:18px;}
.ft-badge{display:inline-block; font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.06em; color:#0A0D12; font-weight:600; padding:4px 10px; border-radius:6px; text-transform:uppercase;}
.ft-name{font-size:25px; font-weight:900; letter-spacing:-.015em; margin:11px 0 2px;}
.ft-role{font-family:'IBM Plex Mono',monospace; font-size:12.5px; color:var(--teal,#5E9C8E); color:#7FC0AF; margin-bottom:10px;}
.ft-text{font-size:14px; line-height:1.6; color:#D4DBE2; margin:0 0 10px; max-width:640px;}
.ft-src{font-size:11px; color:var(--tx2); font-family:'IBM Plex Mono',monospace;}
.ft-mark{font-family:'IBM Plex Mono',monospace; font-size:64px; font-weight:600; color:#7FC0AF; line-height:.8; text-align:center; opacity:.85;}
.ft-mark span{display:block; font-size:13px; letter-spacing:.2em; margin-top:6px; color:var(--tx2);}
.filters{display:flex; flex-wrap:wrap; gap:7px; margin-bottom:16px;}
.fchip{display:inline-flex; align-items:center; gap:7px; background:transparent; border:1px solid var(--line); color:var(--tx2); font-family:'Archivo'; font-size:12.5px; font-weight:600; padding:7px 13px; border-radius:999px; cursor:pointer; transition:.16s;}
.fchip:hover{color:var(--tx); border-color:rgba(255,255,255,.22);}
.fchip.on{background:#1C2330; color:var(--tx); border-color:rgba(255,255,255,.3);}
.fdot{width:9px; height:9px; border-radius:50%;}
.casos{display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px;}
.caso{background:var(--card); border:1px solid var(--line); border-radius:13px; padding:16px; transition:.18s;}
.caso:hover{border-color:rgba(255,255,255,.22); transform:translateY(-2px);}
.caso-tag{display:inline-block; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.06em; color:#0A0D12; font-weight:600; padding:3px 8px; border-radius:5px; text-transform:uppercase;}
.caso-n{font-size:16px; font-weight:800; margin:11px 0 2px; letter-spacing:-.01em;}
.caso-r{font-size:12px; color:var(--amber); font-family:'IBM Plex Mono',monospace; margin-bottom:8px;}
.caso-d{font-size:13px; line-height:1.5; color:#CBD4DC; margin:0 0 10px;}
.caso-src{font-size:10.5px; color:var(--tx2); font-family:'IBM Plex Mono',monospace;}
.poll{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:18px; margin-bottom:16px;}
.poll-q{font-size:16px; font-weight:800; margin-bottom:14px; line-height:1.35;}
.poll-opts{display:flex; flex-direction:column; gap:9px;}
.poll-opt{position:relative; text-align:left; background:var(--bg2); border:1px solid var(--line); border-radius:9px; padding:12px 14px; cursor:pointer; overflow:hidden; transition:.16s; display:flex; align-items:center; justify-content:space-between; gap:10px;}
.poll-opt:not(.voted):hover{border-color:var(--amber); background:#1A212C;}
.poll-opt.voted{cursor:default;}
.poll-bar{position:absolute; left:0; top:0; bottom:0; background:rgba(219,110,58,.18); transition:width .6s cubic-bezier(.2,.7,.3,1); z-index:0;}
.poll-opt.mine .poll-bar{background:rgba(196,57,43,.28);}
.poll-t{position:relative; z-index:1; font-size:13.5px; color:#E7ECF1; line-height:1.35;}
.poll-pct{position:relative; z-index:1; font-family:'IBM Plex Mono',monospace; font-size:13px; font-weight:600; color:var(--amber);}
.poll-opt.mine .poll-pct{color:#fff;}
.poll-foot{font-size:11px; color:var(--tx2); margin-top:10px; font-family:'IBM Plex Mono',monospace;}
.ft{margin-top:38px; border-top:1px solid var(--line); padding-top:18px;}
.ft-srcline{font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:var(--tx2); line-height:1.6;}
.ft-meta{font-size:11.5px; color:#6B7682; margin-top:10px; line-height:1.55; max-width:760px;}
@media(max-width:820px){
  .kpis{grid-template-columns:1fr 1fr;} .grid2{grid-template-columns:1fr;}
  .map-stage{grid-template-columns:1fr;} .dossier{position:static;}
  .stats{grid-template-columns:1fr;} .featured{grid-template-columns:1fr;} .ft-mark{display:none;}
  .barrow{grid-template-columns:1fr; gap:5px;} .barrow-track{order:3;} .barrow-n{order:2; text-align:left;}
}
`;
