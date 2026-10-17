import { useState, useEffect, useMemo, useRef, useCallback } from "react";

/* ════════════════════════════════════════════════════════════════════════════
   ANGOLA: la sangre y el negocio (expediente Yamacoa)

   Renderer CONGELADO (ficha de diseño "Carlota", jul-2026): layout split-diptico
   con costura central; Acto I (guerra, oliva #6E9537) y Acto II (negocio, azul
   #3987C6). Firma: waffle de 40 chapas de identificacion en la costura.
   Sin dependencias de graficos: todo SVG propio.
   Los datos viven en /data/angola.json (respirante); este fichero incluye un
   espejo EMBEDDED como fallback si el fetch falla.
   ════════════════════════════════════════════════════════════════════════════ */

const DATA_URL = (typeof process !== "undefined" && process.env && process.env.PUBLIC_URL ? process.env.PUBLIC_URL : "") + "/data/angola.json";

const COL = {
  bg: "#fcf9f4", panel: "#fcf9f4", panel2: "#f5efe7",
  line: "rgba(60,40,20,.15)", text: "#1f1a16", dim: "#6b5d50",
  oliva: "#557A1E", olivaHi: "#46661A", olivaSoft: "rgba(85,122,30,.14)",
  azul: "#2A70AE", azulHi: "#1F5E94", azulSoft: "rgba(42,112,174,.14)",
  oro: "#946A0A",
};

const ACTO = {
  guerra: { color: COL.oliva, hi: COL.olivaHi, soft: COL.olivaSoft, rotulo: "Acto I · La guerra" },
  negocio: { color: COL.azul, hi: COL.azulHi, soft: COL.azulSoft, rotulo: "Acto II · El negocio" },
};

/* ════════ ENCUESTA (tabla compartida poll_votes; ver ops/angola/) ══════════ */

const SURVEY = [
  { id: "q1", q: "¿Qué parte de esta historia te resultaba más desconocida?",
    opts: [
      { id: "a", t: "Que las cifras oficiales de muertos no cuadran entre sí", seed: 41 },
      { id: "b", t: "Lo que cobra el Estado por cada médico frente a lo que recibe el médico", seed: 58 },
      { id: "c", t: "Que la misión en Angola sigue activa hoy", seed: 47 },
      { id: "d", t: "La conocía completa", seed: 12 },
    ] },
];

const POLL_BACKEND = {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL || "",
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || "",
};
const HAS_SUPA = !!(POLL_BACKEND.supabaseUrl && POLL_BACKEND.supabaseAnonKey);
const NS = "angola";
const LS_COUNTS = "angola_poll_counts", LS_VOTED = "angola_poll_voted";

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

async function supaFetchCounts() {
  const u = `${POLL_BACKEND.supabaseUrl}/rest/v1/poll_votes?select=question_id,option_id,votes&question_id=like.${NS}:*`;
  const r = await fetch(u, { headers: { apikey: POLL_BACKEND.supabaseAnonKey, Authorization: `Bearer ${POLL_BACKEND.supabaseAnonKey}` } });
  if (!r.ok) throw new Error("poll read " + r.status);
  const rows = await r.json();
  const out = {};
  rows.forEach((row) => {
    const q = row.question_id.split(":")[1];
    if (!out[q]) out[q] = {};
    out[q][row.option_id] = row.votes;
  });
  return out;
}
async function supaVote(q, o) {
  const r = await fetch(`${POLL_BACKEND.supabaseUrl}/rest/v1/rpc/poll_increment`, {
    method: "POST",
    headers: { apikey: POLL_BACKEND.supabaseAnonKey, Authorization: `Bearer ${POLL_BACKEND.supabaseAnonKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ q: `${NS}:${q}`, o }),
  });
  if (!r.ok) throw new Error("poll vote " + r.status);
}

/* ════════ UTILIDADES ═══════════════════════════════════════════════════════ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = (e) => setReduced(e.matches);
    mq.addEventListener ? mq.addEventListener("change", fn) : mq.addListener(fn);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", fn) : mq.removeListener(fn));
  }, []);
  return reduced;
}

function useInView(threshold = 0.35) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setSeen(true); return undefined; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setSeen(true); obs.disconnect(); } });
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, seen];
}

const fmt = (n) => n.toLocaleString("es-ES");

/* ════════ FIRMA: LA COSTURA (contador + waffle de chapas) ══════════════════ */

function Chapa({ estado, delay, reduced }) {
  // estado: "oro" (llega al medico), "media" (rango 125-200), "gris" (retenido)
  const fill = estado === "oro" ? COL.oro : estado === "media" ? "url(#angMediaChapa)" : "#e6dccf";
  const stroke = estado === "gris" ? "rgba(60,40,20,.25)" : COL.oro;
  return (
    <svg viewBox="0 0 34 22" className="chapa" aria-hidden="true"
      style={reduced ? undefined : { animationDelay: `${delay}ms` }}>
      <rect x="1" y="1" width="32" height="20" rx="6" fill={fill} stroke={stroke} strokeWidth="1.1" />
      <circle cx="7" cy="11" r="2.4" fill={COL.bg} stroke={stroke} strokeWidth="0.9" />
    </svg>
  );
}

function Costura({ reduced }) {
  const [ref, seen] = useInView(0.25);
  const [km, setKm] = useState(reduced ? 14000 : 0);
  useEffect(() => {
    if (!seen) return undefined;
    if (reduced) { setKm(14000); return undefined; }
    const t0 = performance.now(), dur = 1300;
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      setKm(Math.round(14000 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, reduced]);

  const chapas = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 40; i++) arr.push(i === 0 ? "oro" : i === 1 ? "media" : "gris");
    return arr;
  }, []);

  return (
    <section className="costura" ref={ref} aria-label="La costura: lo que cruza el Atlántico y lo que se queda por el camino">
      <svg width="0" height="0" aria-hidden="true">
        <defs>
          <linearGradient id="angMediaChapa" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={COL.oro} />
            <stop offset="60%" stopColor={COL.oro} />
            <stop offset="60%" stopColor="#e6dccf" />
            <stop offset="100%" stopColor="#e6dccf" />
          </linearGradient>
        </defs>
      </svg>
      <div className="costura-km mono">{fmt(km)} km · Atlántico Sur · La Habana → Luanda</div>
      <h2 className="costura-h">De cada 5.000 dólares, al médico le llegan una o dos chapas</h2>
      <div className={"waffle" + (seen && !reduced ? " on" : "")} role="img"
        aria-label="Waffle de 40 chapas de identificación de 125 dólares cada una: Angola paga 5.000 dólares al mes por médico; al médico le llegan en mano entre una y dos chapas según el año y la forma de pago; el resto lo retiene el Estado cubano">
        {chapas.map((e, i) => <Chapa key={i} estado={e} delay={i * 40} reduced={reduced || !seen} />)}
      </div>
      <p className="costura-cap">
        Cada chapa vale 125 dólares: las 40 suman los 5.000 que Angola paga al mes por cada médico
        (lo confirmó su ministra de Salud en 2020). Los reportajes sitúan lo que llega al bolsillo
        del médico entre una y dos chapas; parte del resto queda en un fondo en Cuba que solo se
        cobra si la misión termina sin deserción. La cifra exacta en mano varía según el año: por
        eso la segunda chapa está partida.
      </p>
    </section>
  );
}

/* ════════ ACTO I: DOT-PLOT DE MUERTOS ══════════════════════════════════════ */

function MuertosPlot({ muertos }) {
  const W = 640, ROW = 58, PADL = 8, PADR = 74, PADT = 30;
  const cifras = muertos.cifras;
  const H = PADT + cifras.length * ROW + 34;
  const max = Math.max(...cifras.map((c) => c.valor)) * 1.06;
  const x = (v) => PADL + (v / max) * (W - PADL - PADR);
  const ESTADO_LBL = {
    oficial: "cifra oficial",
    oficial_indirecta: "oficial indirecta",
    estimado_independiente: "estimado independiente",
  };
  return (
    <figure className="fig">
      <figcaption className="fig-h">Las cifras que no cuadran: muertos cubanos según cada fuente</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="plot" role="img"
        aria-label={"Gráfico de puntos con las cifras de muertos cubanos en Angola según cada fuente: " +
          cifras.map((c) => `${c.quien} (${c.ano}): ${fmt(c.valor)}`).join("; ")}>
        {[2000, 4000, 6000, 8000, 10000].filter((t) => t < max).map((t) => (
          <g key={t}>
            <line x1={x(t)} y1={PADT - 14} x2={x(t)} y2={H - 26} stroke={COL.line} strokeDasharray="2 5" />
            <text x={x(t)} y={H - 10} textAnchor="middle" className="tick">{fmt(t)}</text>
          </g>
        ))}
        {cifras.map((c, i) => {
          const y = PADT + i * ROW + 16;
          const es = c.estado === "estimado_independiente";
          const color = es ? COL.oro : COL.oliva;
          return (
            <g key={c.id}>
              <text x={PADL} y={y - 13} className="lbl">{c.quien} · {c.ano}</text>
              <line x1={PADL} y1={y + 6} x2={x(c.valor)} y2={y + 6}
                stroke={color} strokeWidth={es ? 1.4 : 2.4} strokeDasharray={es ? "5 4" : "none"} opacity=".8" />
              <circle cx={x(c.valor)} cy={y + 6} r={es ? 6.5 : 5.5}
                fill={c.estado === "oficial" ? color : "none"} stroke={color} strokeWidth="2" />
              <text x={Math.min(x(c.valor) + 11, W - 4)} y={y + 10} className="val" fill={color}>{fmt(c.valor)}</text>
              <text x={PADL} y={y + 22} className="sub">{ESTADO_LBL[c.estado]}{c.alcance ? " · " + c.alcance : ""}</text>
            </g>
          );
        })}
      </svg>
      <p className="fig-note">{muertos.nota}</p>
    </figure>
  );
}

/* ════════ ACTO II: SERIE ANOTADA DE LA MISIÓN ══════════════════════════════ */

function MisionSerie({ serie }) {
  const W = 640, H = 250, PADL = 14, PADR = 14, PADB = 58, PADT = 26;
  const max = Math.max(...serie.map((s) => s.valor)) * 1.12;
  const n = serie.length;
  const bx = (i) => PADL + ((i + 0.5) / n) * (W - PADL - PADR);
  const y = (v) => H - PADB - (v / max) * (H - PADB - PADT);
  return (
    <figure className="fig">
      <figcaption className="fig-h">Colaboradores cubanos en Angola: los recuentos conocidos</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="plot" role="img"
        aria-label={"Serie de recuentos de colaboradores cubanos en Angola: " +
          serie.map((s) => `${s.ano}: ${fmt(s.valor)} (${s.alcance})`).join("; ")}>
        {serie.map((s, i) => {
          const parcial = s.alcance !== "todos los sectores";
          return (
            <g key={s.ano}>
              <line x1={bx(i)} y1={H - PADB} x2={bx(i)} y2={y(s.valor)}
                stroke={COL.azul} strokeWidth="3" strokeDasharray={parcial ? "5 4" : "none"} opacity=".85" />
              <circle cx={bx(i)} cy={y(s.valor)} r="6.5"
                fill={parcial ? "none" : COL.azul} stroke={COL.azul} strokeWidth="2" />
              <text x={bx(i)} y={y(s.valor) - 12} textAnchor="middle" className="val" fill={COL.azulHi}>{fmt(s.valor)}</text>
              <text x={bx(i)} y={H - PADB + 18} textAnchor="middle" className="lbl">{s.ano}</text>
              <text x={bx(i)} y={H - PADB + 34} textAnchor="middle" className="sub">{s.alcance}</text>
            </g>
          );
        })}
        <line x1={PADL} y1={H - PADB} x2={W - PADR} y2={H - PADB} stroke={COL.line} />
      </svg>
      <p className="fig-note">
        Los recuentos no son comparables entre sí: los puntos huecos con trazo discontinuo cuentan
        solo el personal de salud; los llenos, todos los sectores. Se muestran tal cual, con su
        alcance debajo, en vez de dibujar una curva continua que aparente una serie homogénea.
      </p>
    </figure>
  );
}

/* ════════ BLOQUE DE SALARIOS (ambos actos) ═════════════════════════════════ */

function Salario({ bloque, acto }) {
  const a = ACTO[acto];
  return (
    <div className="salario" style={{ borderColor: a.color }}>
      <div className="salario-h" style={{ color: a.hi }}>{bloque.titulo}</div>
      <div className="salario-estado">
        <div className="salario-big" style={{ color: a.hi }}>{bloque.recibe_estado.valor}</div>
        <div className="salario-det">
          ingresa el Estado cubano · {bloque.recibe_estado.detalle}
          {bloque.recibe_estado.estado === "estimado" && <span className="badge badge-est"> estimado</span>}
        </div>
      </div>
      <div className="salario-personas">
        {bloque.recibe_persona.map((p) => (
          <div className="salario-row" key={p.rol}>
            <span className="salario-rol">{p.rol}</span>
            <span className="salario-pago mono" style={{ color: a.hi }}>{p.pago}</span>
            {p.detalle && <span className="salario-nota">{p.detalle}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════ CRONOLOGÍA DÍPTICO (espina central) ══════════════════════════════ */

function Cronologia({ items }) {
  return (
    <section className="crono" aria-label="Cronología en dos actos">
      <h2 className="sec-h">Medio siglo en una espina</h2>
      <p className="sec-sub">La guerra a la izquierda, en oliva; el negocio a la derecha, en azul. La misma costura.</p>
      <div className="crono-spine">
        {items.map((it) => {
          const a = ACTO[it.acto];
          return (
            <div key={it.ano + it.titulo} className={"crono-item " + it.acto}>
              <div className="crono-card" style={{ borderColor: it.hito ? a.color : COL.line }}>
                <div className="crono-fecha mono" style={{ color: a.hi }}>{it.fecha}</div>
                <div className="crono-tit">{it.titulo}</div>
                <p className="crono-txt">{it.texto}</p>
                {it.fuente && <div className="srcline">Fuente: {it.fuente}</div>}
              </div>
              <span className="crono-dot" style={{ background: a.color }} aria-hidden="true" />
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ════════ ALEGACIONES NO CORROBORADAS ══════════════════════════════════════ */

const NC_LBL = {
  alegacion_de_epoca: "Alegación de época",
  testimonio_unico: "Testimonio único",
  descartada: "Descartada por la historiografía",
  no_corroborada: "No corroborada",
};

function NoCorroborado({ nc }) {
  return (
    <section className="nc" aria-label={nc.titulo}>
      <h2 className="sec-h">{nc.titulo}</h2>
      <p className="sec-sub">{nc.nota}</p>
      <div className="nc-grid">
        {nc.items.map((it) => (
          <div className="nc-card" key={it.id}>
            <span className={"badge nc-" + it.estado}>{NC_LBL[it.estado] || it.estado}</span>
            <div className="nc-af">{it.afirmacion}</div>
            <p className="nc-det">{it.detalle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════ ENCUESTA ═════════════════════════════════════════════════════════ */

function Encuesta() {
  const q = SURVEY[0];
  const [counts, setCounts] = useState(() => lsGet(LS_COUNTS, {}));
  const [voted, setVoted] = useState(() => lsGet(LS_VOTED, {}));
  useEffect(() => {
    if (!HAS_SUPA) return;
    supaFetchCounts().then(setCounts).catch(() => {});
  }, []);
  const vote = useCallback((oid) => {
    if (voted[q.id]) return;
    const next = { ...counts, [q.id]: { ...(counts[q.id] || {}), [oid]: ((counts[q.id] || {})[oid] || 0) + 1 } };
    setCounts(next); lsSet(LS_COUNTS, next);
    const v = { ...voted, [q.id]: oid };
    setVoted(v); lsSet(LS_VOTED, v);
    if (HAS_SUPA) supaVote(q.id, oid).catch(() => {});
  }, [counts, voted, q.id]);

  const totals = q.opts.map((o) => o.seed + ((counts[q.id] || {})[o.id] || 0));
  const sum = totals.reduce((a, b) => a + b, 0) || 1;
  const done = !!voted[q.id];
  return (
    <section className="poll" aria-label="Encuesta">
      <h2 className="sec-h">{q.q}</h2>
      <div className="poll-opts">
        {q.opts.map((o, i) => {
          const pct = Math.round((totals[i] / sum) * 100);
          return (
            <button key={o.id} className={"poll-opt" + (voted[q.id] === o.id ? " mine" : "")}
              onClick={() => vote(o.id)} disabled={done} aria-pressed={voted[q.id] === o.id}>
              <span className="poll-t">{o.t}</span>
              {done && <span className="poll-pct mono">{pct}%</span>}
              {done && <span className="poll-bar" style={{ width: pct + "%" }} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <p className="poll-note">{done ? "Gracias: tu voto quedó contado." : "Un voto por visitante; se guarda de forma anónima."}</p>
    </section>
  );
}

/* ════════ APP ══════════════════════════════════════════════════════════════ */

const EMBEDDED = {
 "meta": {
  "slug": "angola",
  "titulo": "Cuba en Angola: la sangre y el negocio",
  "subtitulo": "Medio siglo de una misma operación: primero el ejército (1975-1991), después los médicos (2007-hoy). Quién cobró, quién pagó y cuántos no volvieron.",
  "actualizado": "2026-07-11",
  "fuentes": [
   "Archivo Cuba / Free Society Project (informe 2017, punto de partida)",
   "Piero Gleijeses (Johns Hopkins, archivos cubanos y soviéticos)",
   "Cubanet",
   "Diario de Cuba",
   "14ymedio",
   "elTOQUE",
   "Connectas",
   "Martí Noticias",
   "Café Fuerte",
   "El Debate",
   "Jornal F8 (Angola)",
   "HALO Trust",
   "Prisoners Defenders",
   "Relatores Especiales de la ONU",
   "MEP / estadística oficial cubana",
   "Freedom Park (Sudáfrica)"
  ],
  "nota_registro": "Este expediente parte de un informe de Archivo Cuba (2017) y cada afirmación fue verificada de forma independiente antes de entrar aquí. Lo corroborado se presenta como dato; lo que solo tiene una fuente, un testimonio o una denuncia de época se marca visible como tal y vive en su propia sección. Las cifras oficiales cubanas de muertos no coinciden entre sí: se muestran todas, con su fecha y su origen, en vez de elegir una.",
  "descripcion": "Expediente sobre la presencia cubana en Angola en sus dos actos: la intervención militar de 1975 a 1991 (Operación Carlota: 377.033 militares y unos 50.000 cooperantes civiles según la cifra oficial dada por Raúl Castro en 1991) y el negocio de exportación de servicios profesionales reactivado desde 2007 y todavía activo (1.243 colaboradores de salud en octubre de 2024 según el ministro de Salud cubano). Documenta la divergencia entre las cifras oficiales de muertos (2.016, 2.077 y 2.289 según el recuento y la fecha) y los estimados independientes (1.400 según la CIA ya en 1978; alrededor de 10.000 según el general desertor Rafael del Pino y estimados estadounidenses de 1987); la economía de la intervención (pagos estimados de 300 a 600 millones de dólares anuales a La Habana mientras el recluta cobraba 7 pesos cubanos al mes); y la economía de la misión médica (Angola paga unos 5.000 dólares mensuales por médico, confirmado por la ministra de Salud angoleña en 2020, mientras el profesional recibe una fracción mínima y el resto lo retiene el Estado cubano vía Antex S.A., empresa del conglomerado militar GAESA). Incluye la dimensión angoleña (más de 500.000 muertos de guerra civil, decenas de miles de amputados por minas) y una sección explícita de alegaciones no corroboradas (armas químicas, saqueo de marfil y diamantes, trueque petróleo por servicios) que la verificación no permitió asentar como hechos.",
  "narracion": "Hay una línea que une al soldado cubano de mil novecientos setenta y cinco con el médico cubano de hoy, y esa línea pasa por Angola. En noviembre de mil novecientos setenta y cinco, Fidel Castro lanzó la Operación Carlota. Durante los dieciséis años siguientes, según la cifra oficial que dio Raúl Castro al terminar la guerra, trescientos setenta y siete mil treinta y tres militares cubanos y unos cincuenta mil cooperantes civiles pasaron por Angola. La historiografía académica, con los archivos cubanos y soviéticos sobre la mesa, estableció que la solicitud vino del angoleño Agostinho Neto y que La Habana decidió intervenir con notable autonomía; Moscú, al principio reticente, puso el armamento. Cuba no fue gratis: los estimados que circulan hablan de trescientos a seiscientos millones de dólares anuales para el Estado cubano. El recluta, mientras tanto, cobraba siete pesos cubanos al mes. Cuántos murieron sigue siendo un secreto de Estado. Las propias cifras oficiales no se ponen de acuerdo: la lista leída en los entierros de mil novecientos ochenta y nueve tenía dos mil doscientos ochenta y nueve nombres, contando caídos en otros países; de ellos, unos dos mil dieciséis murieron en Angola; Raúl Castro dijo en mil novecientos noventa y uno que eran dos mil setenta y siete. La CIA calculaba mil cuatrocientos muertos ya en mil novecientos setenta y ocho, con doce años de guerra por delante. Y el general Rafael del Pino, el desertor de más alto rango, sostuvo en mil novecientos ochenta y siete que rondaban los diez mil, una cifra que coincidía con los estimados del gobierno estadounidense. En diciembre de mil novecientos ochenta y nueve, la Operación Tributo enterró los restos repatriados en los ciento sesenta y nueve municipios del país, y después llegó lo que un veterano llamó el olvido olímpico. Angola pagó un precio aún mayor: más de medio millón de muertos en su guerra civil y decenas de miles de amputados por las minas que todavía se desentierran. La guerra terminó en mil novecientos noventa y uno, pero el negocio no. En dos mil siete la cooperación renació como contrato: médicos, maestros e ingenieros cubanos enviados por Antex, una empresa del conglomerado militar GAESA. En dos mil catorce eran cuatro mil colaboradores. Angola paga unos cinco mil dólares al mes por cada médico; lo confirmó la propia ministra de Salud angoleña. El médico recibe una fracción mínima, y buena parte del resto se queda en La Habana, en un fondo que solo se cobra si la misión termina sin deserción. La Organización de las Naciones Unidas ha calificado ese esquema, desde dos mil diecinueve, de posible trabajo forzoso. Cuando el petróleo angoleño se abarató, llegaron los impagos: estudiantes angoleños becados en Cuba pasaron ocho meses sin estipendio, y en agosto de dos mil diecisiete Luanda llegó a rechazar a ciento ochenta y nueve trabajadores de la salud cubanos que ya estaban listos para volar. Aun así, la misión sigue: mil doscientos cuarenta y tres colaboradores de salud en octubre de dos mil veinticuatro, y la exportación de servicios sigue siendo la primera fuente de divisas del Estado cubano, con más de cinco mil millones de dólares al año. Hay cosas que este expediente no asienta como hechos porque la verificación no dio para tanto, y se muestran como lo que son: la denuncia de armas químicas de mil novecientos ochenta y ocho, el saqueo de marfil y diamantes que contó un solo libro, el supuesto trueque de petróleo por servicios. La honestidad con las fuentes es la marca de la casa. Lo que sí queda asentado alcanza: medio siglo después, Angola sigue siendo el espejo donde el internacionalismo cubano se mira y aparece un negocio.",
  "narracion_en": "There is a line connecting the Cuban soldier of nineteen seventy-five with the Cuban doctor of today, and that line runs through Angola. In November nineteen seventy-five, Fidel Castro launched Operation Carlota. Over the following sixteen years, according to the official figure given by Raúl Castro at the war's end, three hundred and seventy-seven thousand and thirty-three Cuban soldiers and some fifty thousand civilian aid workers passed through Angola. Academic historiography, working from Cuban and Soviet archives, established that the request came from Angola's Agostinho Neto and that Havana decided to intervene with remarkable autonomy; Moscow, reluctant at first, supplied the weapons. Cuba did not serve for free: circulating estimates speak of three hundred to six hundred million dollars a year for the Cuban state. The conscript, meanwhile, earned seven Cuban pesos a month. How many died remains a state secret. Even the official figures disagree: the list read at the eighty-nine burials held two thousand two hundred and eighty-nine names, counting those fallen in other countries; of them, some two thousand and sixteen died in Angola; Raúl Castro said in nineteen ninety-one the total was two thousand and seventy-seven. The CIA calculated fourteen hundred dead as early as nineteen seventy-eight, with twelve years of war still ahead. And General Rafael del Pino, the highest-ranking defector, held in nineteen eighty-seven that the toll was around ten thousand, a figure matching United States government estimates. In December nineteen eighty-nine, Operation Tribute buried the repatriated remains across the country's one hundred and sixty-nine municipalities, and then came what one veteran called the olympic oblivion. Angola paid an even higher price: more than half a million dead in its civil war and tens of thousands of amputees from landmines still being dug up today. The war ended in nineteen ninety-one, but the business did not. In two thousand seven the cooperation was reborn as a contract: Cuban doctors, teachers and engineers deployed through Antex, a company of the military conglomerate GAESA. By two thousand fourteen there were four thousand workers. Angola pays about five thousand dollars a month for each doctor; Angola's own health minister confirmed it. The doctor receives a minimal fraction, and much of the rest stays in Havana, in a fund payable only if the mission ends without desertion. Since two thousand nineteen, the United Nations has described that scheme as possible forced labour. When Angolan oil got cheap, the defaults arrived: Angolan scholarship students in Cuba went eight months without their stipend, and in August two thousand seventeen Luanda went as far as rejecting one hundred and eighty-nine Cuban health workers who were ready to fly. Even so, the mission continues: one thousand two hundred and forty-three health workers in October two thousand twenty-four, and the export of services remains the Cuban state's top source of hard currency, at more than five billion dollars a year. Some things this dossier does not assert as fact, because verification could not carry them, and they are shown for what they are: the nineteen eighty-eight chemical weapons allegation, the ivory and diamond plunder recounted by a single book, the alleged oil-for-services barter. Honesty with sources is the house rule. What is established suffices: half a century on, Angola remains the mirror in which Cuban internationalism looks at itself and sees a business."
 },
 "kpis": [
  {
   "id": "militares",
   "valor": "377.033",
   "etiqueta": "militares cubanos pasaron por Angola (1975-1991), más ~50.000 cooperantes civiles",
   "fuente": "cifra oficial, Raúl Castro, mayo 1991"
  },
  {
   "id": "muertos",
   "valor": "2.077-2.289",
   "etiqueta": "muertos según las propias cifras oficiales (que no coinciden entre sí); ~10.000 según estimados independientes",
   "fuente": "listas oficiales 1989/1991 · Del Pino / EEUU 1987"
  },
  {
   "id": "pago_medico",
   "valor": "$5.000",
   "etiqueta": "paga Angola al mes por cada médico cubano; el médico recibe una fracción mínima",
   "fuente": "confirmado por la ministra de Salud angoleña, 2020"
  },
  {
   "id": "mision_hoy",
   "valor": "1.243",
   "etiqueta": "colaboradores de salud cubanos seguían en Angola en octubre de 2024",
   "fuente": "ministro de Salud de Cuba, oct 2024"
  }
 ],
 "cronologia": [
  {
   "ano": 1975,
   "fecha": "noviembre de 1975",
   "titulo": "Arranca la Operación Carlota",
   "acto": "guerra",
   "texto": "Las primeras tropas cubanas llegan a Angola en la primera semana de noviembre. La historiografía académica (Piero Gleijeses, con archivos cubanos y soviéticos) estableció que la solicitud vino de Agostinho Neto y el MPLA, y que La Habana decidió intervenir con considerable autonomía: Moscú, reticente al inicio, aportó el armamento pero no la iniciativa.",
   "fuente": "Gleijeses; archivos citados en uOttawa/Recipro"
  },
  {
   "ano": 1978,
   "fecha": "julio de 1978",
   "titulo": "La CIA ya cuenta 1.400 muertos",
   "acto": "guerra",
   "texto": "El País reporta un cálculo de la CIA de 1.400 cubanos muertos en los primeros años de la intervención. Quedaban doce años más de guerra.",
   "fuente": "cálculo CIA citado por prensa de época"
  },
  {
   "ano": 1988,
   "fecha": "1987-1988",
   "titulo": "Cuito Cuanavale y el principio del fin",
   "acto": "guerra",
   "texto": "La batalla de Cuito Cuanavale precede los acuerdos que encadenan la retirada cubana con la independencia de Namibia. Ese mismo año circula la denuncia de uso de armas químicas: nunca llegó a certificación institucional de la ONU (ver sección de alegaciones).",
   "fuente": "acuerdos de Nueva York, dic 1988"
  },
  {
   "ano": 1989,
   "fecha": "6-7 de diciembre de 1989",
   "titulo": "Operación Tributo",
   "acto": "guerra",
   "texto": "Cuba repatría restos y los entierra con honores en los 169 municipios del país; la ceremonia central es en El Cacahual. La lista leída entonces tenía 2.289 nombres, incluyendo caídos en otros países.",
   "fuente": "prensa oficial cubana; Café Fuerte"
  },
  {
   "ano": 1991,
   "fecha": "25 de mayo de 1991",
   "titulo": "Sale el último contingente",
   "acto": "guerra",
   "texto": "Termina la presencia militar tras poco más de quince años y medio. Raúl Castro da la cifra oficial acumulada: 377.033 militares. El Estado cubano nunca ha publicado la lista oficial de muertos.",
   "fuente": "cifra oficial, mayo 1991"
  },
  {
   "ano": 2007,
   "fecha": "2007",
   "titulo": "La cooperación renace como contrato",
   "acto": "negocio",
   "texto": "Con la visita de José Eduardo dos Santos a La Habana se consolidan acuerdos de servicios profesionales: salud, educación y construcción, contratados a través de Antex S.A., empresa del conglomerado militar GAESA.",
   "fuente": "elTOQUE; Connectas"
  },
  {
   "ano": 2014,
   "fecha": "mediados de 2014",
   "titulo": "El pico: 4.000 colaboradores",
   "acto": "negocio",
   "texto": "1.800 en salud y 1.400 en educación, más otros sectores; 1.779 jóvenes angoleños estudiaban a la vez en Cuba con becas que Luanda pagaba a La Habana.",
   "fuente": "Diario de Cuba, jun 2014"
  },
  {
   "ano": 2016,
   "fecha": "2015-2016",
   "titulo": "El petróleo barato trae impagos",
   "acto": "negocio",
   "texto": "Con el crudo hundido, Angola acumula retrasos: cooperantes de salud regresan a Cuba por falta de pago (lo admitió la embajadora cubana en junio de 2016) y estudiantes angoleños becados en Cuba pasan casi 8 meses sin estipendio; al menos 15 abandonan y regresan.",
   "fuente": "O País; Jornal F8, ene 2016"
  },
  {
   "ano": 2017,
   "fecha": "agosto de 2017",
   "titulo": "Angola rechaza a 189 trabajadores cubanos",
   "acto": "negocio",
   "texto": "Médicos, dentistas y enfermeros listos para partir vía Antex se quedan en tierra. El mismo año, el contrato de carreteras de la cubana Imbondex en Bengo (firmado sin licitación) empieza a desinflarse: acabaría anulado en 2020.",
   "fuente": "Martí Noticias, ago 2017; 14ymedio",
   "hito": true
  },
  {
   "ano": 2019,
   "fecha": "2019-2020",
   "titulo": "La ONU habla de trabajo forzoso",
   "acto": "negocio",
   "texto": "Relatores Especiales de la ONU califican el esquema laboral de las misiones médicas cubanas de posible trabajo forzoso y esclavitud moderna; Prisoners Defenders documenta testimonios en más de 29 países.",
   "fuente": "Relatores ONU; Prisoners Defenders"
  },
  {
   "ano": 2024,
   "fecha": "octubre de 2024",
   "titulo": "La misión sigue: 1.243 colaboradores de salud",
   "acto": "negocio",
   "texto": "El ministro de Salud cubano confirma la cifra; en 2025 la prensa angoleña reporta nuevas llegadas. La deuda angoleña con Cuba sigue sin saldarse del todo (reportes de abril de 2026).",
   "fuente": "Jornal F8, 2025; Peoples Dispatch, abr 2026"
  }
 ],
 "muertos": {
  "nota": "El Estado cubano nunca ha publicado la lista oficial de sus muertos en Angola. Estas son todas las cifras conocidas, cada una con su origen y su fecha. No son comparables entre sí: unas cuentan solo Angola, otras incluyen otros países; unas son oficiales, otras estimados de inteligencia o de desertores.",
  "cifras": [
   {
    "id": "cia_1978",
    "valor": 1400,
    "quien": "CIA (vía El País)",
    "ano": 1978,
    "alcance": "solo los primeros ~3 años de guerra",
    "estado": "estimado_independiente"
   },
   {
    "id": "lista_1989",
    "valor": 2289,
    "quien": "Lista oficial leída en la Operación Tributo",
    "ano": 1989,
    "alcance": "incluye caídos en Etiopía y otros países",
    "estado": "oficial"
   },
   {
    "id": "angola_1989",
    "valor": 2016,
    "quien": "Caídos específicamente en Angola dentro de esa lista",
    "ano": 1989,
    "alcance": "solo Angola",
    "estado": "oficial"
   },
   {
    "id": "raul_1991",
    "valor": 2077,
    "quien": "Raúl Castro, discurso de cierre",
    "ano": 1991,
    "alcance": "cifra final oficial",
    "estado": "oficial"
   },
   {
    "id": "freedom_park",
    "valor": 2106,
    "quien": "Lista entregada al Freedom Park (Sudáfrica) por la embajada cubana",
    "ano": 2006,
    "alcance": "2.070 nombres inscritos en el muro hasta hoy",
    "estado": "oficial_indirecta"
   },
   {
    "id": "delpino_1987",
    "valor": 10000,
    "quien": "Gral. Rafael del Pino (desertor) y estimados del gobierno de EEUU",
    "ano": 1987,
    "alcance": "orden de magnitud, no recuento",
    "estado": "estimado_independiente"
   }
  ]
 },
 "salarios": {
  "nota": "Lo que entraba al Estado cubano frente a lo que llegaba al bolsillo del cubano enviado. Guerra y misión médica comparten el mismo esquema: el Estado cobra en divisas, el enviado recibe una fracción.",
  "guerra": {
   "titulo": "El soldado (años 80)",
   "recibe_estado": {
    "valor": "300-600 millones de dólares/año",
    "detalle": "estimación circulante de lo que ingresaba Cuba por la intervención; equivale a 4.800-9.600 millones en toda la guerra",
    "estado": "estimado"
   },
   "recibe_persona": [
    {
     "rol": "Recluta del servicio militar",
     "pago": "7 pesos cubanos/mes",
     "detalle": "el mismo pago que en Cuba; sin vacaciones"
    },
    {
     "rol": "Oficial (desde capitán)",
     "pago": "600 kwanzas/mes",
     "detalle": "la kwanza rondaba el dólar en la época"
    },
    {
     "rol": "Asesores y altos oficiales",
     "pago": "900-1.000 kwanzas/mes",
     "detalle": ""
    }
   ]
  },
  "mision": {
   "titulo": "El médico (hoy)",
   "recibe_estado": {
    "valor": "$5.000/mes por médico",
    "detalle": "lo confirmó la ministra de Salud angoleña en 2020; la exportación de servicios es la primera fuente de divisas de Cuba",
    "estado": "corroborado"
   },
   "recibe_persona": [
    {
     "rol": "Médico en misión",
     "pago": "una fracción mínima",
     "detalle": "los reportajes citan cantidades en mano del orden de 125-200 dólares según año y forma de pago; parte del resto va a un fondo en Cuba que solo se cobra si la misión termina sin deserción"
    }
   ]
  }
 },
 "mision_serie": [
  { "ano": 2013, "valor": 800, "detalle": "médicos cubanos reportados, presentes en 70 municipios", "alcance": "solo salud" },
  { "ano": 2014, "valor": 4000, "detalle": "colaboradores en total: 1.800 salud + 1.400 educación + otros", "alcance": "todos los sectores" },
  { "ano": 2016, "valor": 3023, "detalle": "cifra de la prensa oficial (salud, educación, construcción) vía Antex", "alcance": "todos los sectores" },
  { "ano": 2024, "valor": 1243, "detalle": "colaboradores de salud, según el ministro de Salud cubano", "alcance": "solo salud" }
 ],
 "antex": {
  "titulo": "La caja registradora: Antex y GAESA",
  "texto": "La contratación del personal cubano en Angola pasa por Antex S.A., parte del conglomerado militar GAESA según reportajes de elTOQUE y Connectas. El mismo entramado ha operado otros negocios en Angola: el contrato de rehabilitación de carreteras en Bengo de la cubana Imbondex se firmó en 2017 sin licitación pública por unos 301 millones (la cifra exacta y su moneda varían según la fuente), quedó reducido a una fracción por la devaluación del kwanza y fue anulado en 2020 por incumplimiento.",
  "exportacion_servicios": {
   "nota": "Exportación total de servicios de Cuba (los servicios profesionales en el exterior son el grueso de la categoría personales/culturales/recreativos).",
   "serie": [
    { "ano": 2023, "total_musd": 6910, "detalle": "total de servicios exportados" },
    { "ano": 2024, "total_musd": 7770, "detalle": "de ellos 5.390 millones en servicios personales, culturales y recreativos: el 69%" }
   ],
   "fuente": "MEP / estadística oficial cubana"
  }
 },
 "estudiantes": {
  "titulo": "El otro flujo: estudiantes angoleños en Cuba",
  "serie": [
   { "ano": 2014, "valor": 1779 },
   { "ano": 2016, "valor": 2386 }
  ],
  "texto": "Luanda pagaba a La Habana también por sus becados. Cuando llegaron los impagos, los estudiantes angoleños en Cuba pasaron casi 8 meses sin estipendio (enero de 2016): denunciaron desesperación, deudas y hambre, y al menos 15 regresaron a Angola. No consta que el gobierno cubano los asistiera.",
  "fuente": "Jornal F8; Club-K; Deutsche Welle"
 },
 "angola_costo": {
  "titulo": "Lo que pagó Angola",
  "items": [
   {
    "id": "muertos_guerra",
    "valor": "más de 500.000",
    "etiqueta": "muertos dejó la guerra civil angoleña (1975-2002)",
    "fuente": "consenso historiográfico"
   },
   {
    "id": "amputados",
    "valor": "~70.000-88.000",
    "etiqueta": "amputados por minas terrestres; siguen desenterrándose hoy",
    "fuente": "HALO Trust"
   },
   {
    "id": "poder",
    "valor": "desde 1975",
    "etiqueta": "el MPLA, consolidado en el poder durante la intervención, sigue gobernando Angola",
    "fuente": "registro electoral angoleño"
   }
  ]
 },
 "no_corroborado": {
  "titulo": "Lo que este expediente NO asienta como hecho",
  "nota": "La verificación independiente no alcanzó para asentar estas afirmaciones del informe de partida. Se listan porque ocultarlas sería tan deshonesto como afirmarlas.",
  "items": [
   {
    "id": "armas_quimicas",
    "afirmacion": "Uso cubano de armas químicas (sarín, VX) y mezclas incendiarias contra población civil pro-UNITA",
    "estado": "alegacion_de_epoca",
    "detalle": "La denuncia de 1988 existe y un toxicólogo belga (Aubin Heyndrickx) certificó residuos en muestras; pero nunca hubo certificación institucional de la ONU como organismo, y el testigo posterior clave (Wouter Basson, jefe del programa químico del apartheid) fue desacreditado judicialmente. Alegación documentada de época; no un hecho asentado."
   },
   {
    "id": "marfil_diamantes",
    "afirmacion": "Oficiales de las FAR montaron negocios con marfil, diamantes y maderas de Angola",
    "estado": "testimonio_unico",
    "detalle": "Fuente única literaria (Norberto Fuentes, Dulces guerreros cubanos), sin respaldo judicial independiente. La Causa 1 de 1989 (Ochoa) versó sobre narcotráfico, no sobre esto: vincularla sería forzar el archivo."
   },
   {
    "id": "iniciativa_sovietica",
    "afirmacion": "La URSS ordenó la intervención y Cuba obedeció",
    "estado": "descartada",
    "detalle": "La historiografía académica (Gleijeses, con archivos cubanos y soviéticos) establece lo contrario: solicitud de Neto, decisión cubana autónoma, Moscú inicialmente reticente. Se incluye porque el informe de partida la sostiene: la verificación la descarta."
   },
   {
    "id": "petroleo_trueque",
    "afirmacion": "Cuba cobraba los servicios médicos en petróleo angoleño (esquema Venezuela)",
    "estado": "no_corroborada",
    "detalle": "Documentado para Venezuela; para Angola lo verificable es pago en divisas vía Antex. Extrapolarlo sería impreciso."
   },
   {
    "id": "quedados",
    "afirmacion": "Unos 6.000 cubanos se quedaron en Angola contratados por cuenta propia",
    "estado": "no_corroborada",
    "detalle": "Cifra sin fuente identificable. Las deserciones masivas de misiones médicas están documentadas a nivel global, pero no ese número para Angola."
   },
   {
    "id": "savimbi_6200",
    "afirmacion": "UNITA reportaba 6.200 cubanos muertos hasta 1986",
    "estado": "no_corroborada",
    "detalle": "Cifra no localizable en ninguna fuente independiente; se excluye también del gráfico de cifras de muertos."
   }
  ]
 },
 "veteranos": {
  "titulo": "El regreso",
  "texto": "Los soldados rasos volvieron con lo puesto: el escritor y veterano Jorge Olivera Castillo describe que al regreso pudieron comprar una o dos mudas de ropa con lo que les entregaron, y que después llegó, en sus palabras, un olvido olímpico. Su testimonio sostiene que entre los mendigos de las calles cubanas hay veteranos de aquella guerra. Es la voz de quien estuvo: se presenta como testimonio con nombre, no como estadística.",
  "fuente": "Jorge Olivera Castillo (veterano, testimonio publicado)"
 },
 "metodologia": {
  "resumen": "Expediente construido desde un informe de Archivo Cuba (2017) sometido a verificación independiente afirmación por afirmación: fuentes primarias u organismos cuando existen, prensa seria corroborada en su defecto. Las afirmaciones con fuente única, testimonio confidencial o denuncia de época no entran como hechos: viven marcadas en su propia sección. Las cifras oficiales cubanas de muertos divergen entre sí y se presentan todas con origen y fecha, sin elegir ninguna.",
  "niveles": [
   { "id": "corroborado", "etiqueta": "Corroborado", "descripcion": "Dos o más fuentes independientes, o admisión oficial de una de las partes." },
   { "id": "estimado", "etiqueta": "Estimado", "descripcion": "Cálculo de inteligencia, académico o de prensa; orden de magnitud más que recuento." },
   { "id": "testimonio", "etiqueta": "Testimonio", "descripcion": "Voz de un protagonista identificado; vale como experiencia, no como estadística." },
   { "id": "alegacion", "etiqueta": "Alegación no corroborada", "descripcion": "Denuncia o afirmación que la verificación no permitió asentar; se muestra como tal." }
  ]
 }
};

export default function App() {
  const [data, setData] = useState(EMBEDDED);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    let dead = false;
    fetch(DATA_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("fetch " + r.status))))
      .then((j) => { if (!dead && j && j.meta && j.meta.slug === "angola") setData(j); })
      .catch(() => {});
    return () => { dead = true; };
  }, []);

  const d = data;
  const kpisGuerra = d.kpis.filter((k) => ["militares", "muertos"].includes(k.id));
  const kpisNegocio = d.kpis.filter((k) => !["militares", "muertos"].includes(k.id));

  return (
    <div className="angola">
      <style>{CSS}</style>

      <header className="hero">
        <div className="hero-half hero-guerra" aria-hidden="true" />
        <div className="hero-half hero-negocio" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-tag mono">EXPEDIENTE · CUBA EN ANGOLA</div>
          <h1 className="hero-h">{d.meta.titulo}</h1>
          <p className="hero-sub">{d.meta.subtitulo}</p>
          <div className="hero-actos">
            <span className="hero-acto" style={{ color: COL.olivaHi }}>{ACTO.guerra.rotulo} · 1975-1991</span>
            <span className="hero-seam mono" aria-hidden="true">┄┄ 14.000 km ┄┄</span>
            <span className="hero-acto" style={{ color: COL.azulHi }}>{ACTO.negocio.rotulo} · 2007-hoy</span>
          </div>
        </div>
      </header>

      <div className="wrap">
        <section className="kpis" aria-label="Cifras clave">
          {[...kpisGuerra.map((k) => ({ ...k, acto: "guerra" })), ...kpisNegocio.map((k) => ({ ...k, acto: "negocio" }))].map((k) => (
            <div className="kpi" key={k.id} style={{ borderTopColor: ACTO[k.acto].color }}>
              <div className="kpi-v mono" style={{ color: ACTO[k.acto].hi }}>{k.valor}</div>
              <div className="kpi-l">{k.etiqueta}</div>
              {k.fuente && <div className="srcline">{k.fuente}</div>}
            </div>
          ))}
        </section>

        <p className="registro">{d.meta.nota_registro}</p>

        <Costura reduced={reduced} />

        <Cronologia items={d.cronologia} />

        <section className="diptico" aria-label="Los dos actos, cara a cara">
          <div className="acto acto-guerra">
            <h2 className="acto-h" style={{ color: COL.olivaHi }}>{ACTO.guerra.rotulo}</h2>
            <MuertosPlot muertos={d.muertos} />
            <Salario bloque={d.salarios.guerra} acto="guerra" />
            <div className="panelbox">
              <h3 className="box-h">{d.angola_costo.titulo}</h3>
              {d.angola_costo.items.map((it) => (
                <div className="costo-row" key={it.id}>
                  <span className="costo-v mono">{it.valor}</span>
                  <span className="costo-l">{it.etiqueta}{it.fuente ? " (" + it.fuente + ")" : ""}</span>
                </div>
              ))}
            </div>
            <blockquote className="veteranos">
              <h3 className="box-h">{d.veteranos.titulo}</h3>
              <p>{d.veteranos.texto}</p>
              {d.veteranos.fuente && <div className="srcline">{d.veteranos.fuente}</div>}
            </blockquote>
          </div>

          <div className="acto acto-negocio">
            <h2 className="acto-h" style={{ color: COL.azulHi }}>{ACTO.negocio.rotulo}</h2>
            <MisionSerie serie={d.mision_serie} />
            <Salario bloque={d.salarios.mision} acto="negocio" />
            <div className="panelbox">
              <h3 className="box-h">{d.antex.titulo}</h3>
              <p className="box-txt">{d.antex.texto}</p>
              <div className="expo">
                {d.antex.exportacion_servicios.serie.map((s) => (
                  <div className="costo-row" key={s.ano}>
                    <span className="costo-v mono" style={{ color: COL.azulHi }}>{fmt(s.total_musd)} M USD</span>
                    <span className="costo-l">{s.ano}: {s.detalle}</span>
                  </div>
                ))}
                <div className="srcline">{d.antex.exportacion_servicios.nota} Fuente: {d.antex.exportacion_servicios.fuente}</div>
              </div>
            </div>
            <div className="panelbox">
              <h3 className="box-h">{d.estudiantes.titulo}</h3>
              <div className="costo-row">
                {d.estudiantes.serie.map((s) => (
                  <span className="est-pair mono" key={s.ano}>{s.ano}: <strong style={{ color: COL.azulHi }}>{fmt(s.valor)}</strong></span>
                ))}
              </div>
              <p className="box-txt">{d.estudiantes.texto}</p>
              {d.estudiantes.fuente && <div className="srcline">Fuente: {d.estudiantes.fuente}</div>}
            </div>
          </div>
        </section>

        <div className="salario-nota-global">{d.salarios.nota}</div>

        <NoCorroborado nc={d.no_corroborado} />

        <Encuesta />

        <section className="metodo" aria-label="Metodología">
          <h2 className="sec-h">Cómo se hizo este expediente</h2>
          <p className="sec-sub">{d.metodologia.resumen}</p>
          <div className="metodo-grid">
            {d.metodologia.niveles.map((n) => (
              <div className="metodo-card" key={n.id}>
                <div className="metodo-et mono">{n.etiqueta}</div>
                <p className="metodo-desc">{n.descripcion}</p>
              </div>
            ))}
          </div>
          <div className="fuentes">
            <span className="mono fuentes-h">FUENTES · </span>
            {d.meta.fuentes.join(" · ")}
          </div>
          <div className="srcline">Actualizado: {d.meta.actualizado}</div>
        </section>
      </div>
    </div>
  );
}

/* ════════ CSS ═══════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.angola { background:transparent; color:${COL.text}; font-family:'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif; line-height:1.55; }
.angola .mono { font-family:'IBM Plex Mono',monospace; }
.angola .wrap { max-width:1140px; margin:0 auto; padding:0 20px 72px; }
.angola .srcline { font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:${COL.dim}; margin-top:6px; }
.angola :focus-visible { outline:2px solid ${COL.oro}; outline-offset:2px; }

/* hero: díptico partido por la costura */
.angola .hero { position:relative; overflow:hidden; border-bottom:1px solid ${COL.line}; }
.angola .hero-half { position:absolute; top:0; bottom:0; width:50%; }
.angola .hero-guerra { left:0; background:
  radial-gradient(120% 90% at 15% 10%, ${COL.olivaSoft}, transparent 60%),
  radial-gradient(60% 40% at 40% 90%, rgba(85,122,30,.07), transparent 70%); }
.angola .hero-negocio { right:0; background:
  radial-gradient(120% 90% at 85% 10%, ${COL.azulSoft}, transparent 60%),
  radial-gradient(60% 40% at 60% 90%, rgba(42,112,174,.07), transparent 70%); }
.angola .hero::after { content:""; position:absolute; top:0; bottom:0; left:50%; width:1px;
  background:linear-gradient(${COL.oliva}, ${COL.oro}, ${COL.azul}); opacity:.55; }
.angola .hero-inner { position:relative; z-index:1; max-width:900px; margin:0 auto; padding:72px 20px 56px; text-align:center; }
.angola .hero-tag { font-size:11px; letter-spacing:.22em; color:${COL.dim}; }
.angola .hero-h { font-size:clamp(30px,5.2vw,54px); font-weight:800; margin:14px 0 12px; line-height:1.08; }
.angola .hero-sub { color:${COL.dim}; font-size:clamp(15px,2vw,18px); max-width:720px; margin:0 auto; }
.angola .hero-actos { display:flex; gap:14px; align-items:center; justify-content:center; flex-wrap:wrap; margin-top:26px; font-size:13px; font-weight:600; }
.angola .hero-seam { color:${COL.dim}; font-size:11.5px; letter-spacing:.08em; }

/* kpis */
.angola .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:26px 0 18px; }
.angola .kpi { background:${COL.panel}; border:0; border-top:3px solid; border-radius:20px; box-shadow:var(--y-shadow); padding:14px 15px; }
.angola .kpi-v { font-size:clamp(20px,2.6vw,30px); font-weight:600; }
.angola .kpi-l { font-size:12.5px; color:${COL.dim}; margin-top:5px; }
.angola .registro { font-size:13px; color:${COL.dim}; border-left:3px solid ${COL.oro}; padding:8px 14px; background:${COL.panel2}; border-radius:0 16px 16px 0; margin:14px 0 34px; }

/* costura (firma) */
.angola .costura { text-align:center; padding:36px 12px 30px; border:0; border-radius:24px; box-shadow:var(--y-shadow); background:
  linear-gradient(90deg, rgba(85,122,30,.07), transparent 32%, transparent 68%, rgba(42,112,174,.07)), ${COL.panel}; margin-bottom:44px; }
.angola .costura-km { font-size:12px; letter-spacing:.14em; color:${COL.dim}; }
.angola .costura-h { font-size:clamp(19px,2.6vw,26px); font-weight:800; margin:10px auto 20px; max-width:640px; }
.angola .waffle { display:grid; grid-template-columns:repeat(10,34px); gap:7px; justify-content:center; }
.angola .waffle .chapa { width:34px; height:22px; }
.angola .waffle.on .chapa { opacity:0; animation:angolaChapa .45s ease forwards; }
@keyframes angolaChapa { from { opacity:0; transform:translateY(7px); } to { opacity:1; transform:none; } }
.angola .costura-cap { max-width:680px; margin:20px auto 0; font-size:13px; color:${COL.dim}; }

/* cronología en espina */
.angola .sec-h { font-size:clamp(20px,3vw,28px); font-weight:800; margin:0 0 6px; }
.angola .sec-sub { color:${COL.dim}; font-size:14px; max-width:760px; margin:0 0 24px; }
.angola .crono { margin-bottom:52px; }
.angola .crono-spine { position:relative; }
.angola .crono-spine::before { content:""; position:absolute; top:0; bottom:0; left:50%; width:1px;
  background:linear-gradient(${COL.oliva} 0%, ${COL.oro} 55%, ${COL.azul} 100%); opacity:.5; }
.angola .crono-item { position:relative; width:50%; padding:0 30px 26px; }
.angola .crono-item.guerra { left:0; text-align:right; }
.angola .crono-item.negocio { left:50%; }
.angola .crono-dot { position:absolute; top:8px; width:11px; height:11px; border-radius:50%; border:2px solid ${COL.bg}; }
.angola .crono-item.guerra .crono-dot { right:-6px; }
.angola .crono-item.negocio .crono-dot { left:-5px; }
.angola .crono-card { display:inline-block; text-align:left; background:${COL.panel}; border:1px solid; border-radius:16px; box-shadow:var(--y-shadow); padding:13px 16px; max-width:430px; }
.angola .crono-fecha { font-size:11px; letter-spacing:.1em; }
.angola .crono-tit { font-weight:700; margin:3px 0 5px; }
.angola .crono-txt { font-size:13px; color:${COL.dim}; margin:0; }

/* díptico de actos */
.angola .diptico { display:grid; grid-template-columns:1fr 1fr; gap:0; position:relative; margin-bottom:14px; }
.angola .diptico::before { content:""; position:absolute; top:0; bottom:0; left:50%; width:1px; background:${COL.line}; }
.angola .acto { padding:0 26px; min-width:0; }
.angola .acto-guerra { padding-left:0; }
.angola .acto-negocio { padding-right:0; }
.angola .acto-h { font-size:15px; letter-spacing:.14em; text-transform:uppercase; font-weight:800; margin:0 0 18px; }
.angola .fig { margin:0 0 26px; background:${COL.panel}; border:0; border-radius:24px; box-shadow:var(--y-shadow); padding:14px; }
.angola .fig-h { font-weight:700; font-size:14.5px; margin-bottom:10px; }
.angola .plot { width:100%; height:auto; display:block; }
.angola .tick { fill:${COL.dim}; font-size:10px; font-family:'IBM Plex Mono',monospace; }
.angola .lbl { fill:${COL.text}; font-size:12px; font-weight:600; }
.angola .sub { fill:${COL.dim}; font-size:10px; font-family:'IBM Plex Mono',monospace; }
.angola .val { font-size:12px; font-family:'IBM Plex Mono',monospace; font-weight:600; }
.angola .fig-note { font-size:12px; color:${COL.dim}; margin:10px 0 0; }
.angola .salario { border:1px solid; border-radius:20px; padding:14px 16px; margin-bottom:26px; background:${COL.panel2}; }
.angola .salario-h { font-weight:800; letter-spacing:.05em; margin-bottom:8px; }
.angola .salario-big { font-family:'IBM Plex Mono',monospace; font-size:clamp(19px,2.4vw,26px); font-weight:600; }
.angola .salario-det { font-size:12.5px; color:${COL.dim}; margin:3px 0 12px; }
.angola .salario-row { display:flex; flex-wrap:wrap; gap:6px 10px; align-items:baseline; border-top:1px dashed ${COL.line}; padding:8px 0; }
.angola .salario-rol { font-size:13px; font-weight:600; }
.angola .salario-pago { font-size:13px; }
.angola .salario-nota { font-size:12px; color:${COL.dim}; flex-basis:100%; }
.angola .salario-nota-global { font-size:13px; color:${COL.dim}; border-left:3px solid ${COL.oro}; padding:8px 14px; background:${COL.panel2}; border-radius:0 16px 16px 0; margin:6px 0 52px; }
.angola .badge { font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.08em; text-transform:uppercase; padding:2px 7px; border-radius:20px; border:1px solid ${COL.line}; color:${COL.dim}; }
.angola .badge-est { border-color:${COL.oro}; color:${COL.oro}; margin-left:6px; }
.angola .panelbox { background:${COL.panel}; border:0; border-radius:24px; box-shadow:var(--y-shadow); padding:14px 16px; margin-bottom:26px; }
.angola .box-h { font-size:14.5px; font-weight:700; margin:0 0 8px; }
.angola .box-txt { font-size:13px; color:${COL.dim}; margin:0 0 10px; }
.angola .costo-row { display:flex; gap:10px; align-items:baseline; flex-wrap:wrap; padding:6px 0; border-top:1px dashed ${COL.line}; }
.angola .costo-row:first-of-type { border-top:none; }
.angola .costo-v { font-size:15px; font-weight:600; color:${COL.olivaHi}; }
.angola .costo-l { font-size:12.5px; color:${COL.dim}; }
.angola .est-pair { font-size:13px; margin-right:14px; }
.angola .veteranos { margin:0 0 26px; background:${COL.panel2}; border:1px solid ${COL.line}; border-left:3px solid ${COL.oliva}; border-radius:16px; padding:14px 16px; }
.angola .veteranos p { font-size:13.5px; color:${COL.text}; margin:0; }

/* no corroborado */
.angola .nc { margin-bottom:52px; }
.angola .nc-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:12px; }
.angola .nc-card { background:${COL.panel}; border:0; border-radius:24px; box-shadow:var(--y-shadow); padding:14px 16px; }
.angola .nc-af { font-weight:700; font-size:14px; margin:9px 0 6px; }
.angola .nc-det { font-size:12.5px; color:${COL.dim}; margin:0; }
.angola .nc-alegacion_de_epoca { border-color:${COL.oro}; color:${COL.oro}; }
.angola .nc-testimonio_unico { border-color:${COL.olivaHi}; color:${COL.olivaHi}; }
.angola .nc-descartada { border-color:#A8392B; color:#A8392B; }
.angola .nc-no_corroborada { color:${COL.dim}; }

/* encuesta */
.angola .poll { margin-bottom:52px; background:${COL.panel}; border:0; border-radius:24px; box-shadow:var(--y-shadow); padding:22px; }
.angola .poll-opts { display:grid; gap:9px; margin-top:8px; }
.angola .poll-opt { position:relative; overflow:hidden; text-align:left; background:${COL.panel}; color:${COL.text};
  border:1px solid ${COL.line}; border-radius:14px; padding:11px 14px; font-size:13.5px; cursor:pointer; font-family:inherit; }
.angola .poll-opt:hover:not(:disabled) { border-color:${COL.azul}; }
.angola .poll-opt:disabled { cursor:default; }
.angola .poll-opt.mine { border-color:${COL.oro}; }
.angola .poll-t { position:relative; z-index:1; }
.angola .poll-pct { position:relative; z-index:1; float:right; color:${COL.dim}; }
.angola .poll-bar { position:absolute; inset:0 auto 0 0; background:${COL.azulSoft}; }
.angola .poll-note { font-size:12px; color:${COL.dim}; margin:10px 0 0; }

/* metodología */
.angola .metodo-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:12px; margin-bottom:18px; }
.angola .metodo-card { background:${COL.panel}; border:0; border-radius:20px; box-shadow:var(--y-shadow); padding:12px 14px; }
.angola .metodo-et { font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:${COL.oro}; margin-bottom:5px; }
.angola .metodo-desc { font-size:12.5px; color:${COL.dim}; margin:0; }
.angola .fuentes { font-size:12px; color:${COL.dim}; border-top:1px solid ${COL.line}; padding-top:14px; }
.angola .fuentes-h { color:${COL.text}; font-size:10.5px; letter-spacing:.14em; }

@media (max-width: 900px) {
  .angola .kpis { grid-template-columns:repeat(2,1fr); }
  .angola .diptico { grid-template-columns:1fr; }
  .angola .diptico::before { display:none; }
  .angola .acto { padding:0; }
  .angola .acto-negocio { border-top:1px solid ${COL.line}; padding-top:26px; margin-top:8px; }
  .angola .crono-spine::before { left:8px; }
  .angola .crono-item { width:100%; left:0 !important; text-align:left !important; padding:0 0 22px 30px; }
  .angola .crono-item.guerra .crono-dot { right:auto; left:3px; }
  .angola .crono-item.negocio .crono-dot { left:3px; }
  .angola .waffle { grid-template-columns:repeat(8,30px); }
  .angola .waffle .chapa { width:30px; height:20px; }
}
@media (prefers-reduced-motion: reduce) {
  .angola .waffle.on .chapa { animation:none; opacity:1; }
  .angola * { transition:none !important; }
}
`;
