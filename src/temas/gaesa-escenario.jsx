import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from "recharts";
import { FUENTES_URL } from "../design/tokens";

/* ──────────────────────────────────────────────────────────────
   PARÁMETROS BASE (auditables y editables)
   Todas las cifras parten del escenario hipotético del autor.
   ────────────────────────────────────────────────────────────── */
const P = {
  precioToneladaPetroleo: 560,        // USD / tonelada (ref. Brent + WTI)
  barrilesPorTonelada: 7.33,          // bbl por tonelada de crudo
  consumoAnualCubaTon: 5_000_000,     // toneladas/año (estimación)
  costoParqueSolar10MW: 8_500_000,    // USD por parque de 10 MW (850k/MW)
  mwPorParqueSolar: 10,
  costoTurbina3MW: 3_900_000,         // USD por aerogenerador de 3 MW
  mwPorTurbina: 3,
  demandaPicoCuba: 3_300,             // MW en hora pico
  vidaUtilAnios: 25,
};

// Factores de capacidad y eficiencia para la proyección energética
const ESCENARIOS = {
  conservador: { fcSolar: 0.18, fcEolica: 0.28, efPetroleo: 0.34, label: "Conservador" },
  optimista:   { fcSolar: 0.22, fcEolica: 0.35, efPetroleo: 0.40, label: "Optimista" },
};
const MWH_TERMICOS_POR_TON = 11.63; // contenido energético del crudo

/* ── Paleta ── */
const C = {
  ink: "#3a2418",
  surface: "#fcf9f4",
  raised: "#f5efe7",
  line: "rgba(60,40,20,.15)",
  text: "#1f1a16",
  muted: "#6b5d50",
  solar: "#A97300",
  wind: "#127A72",
  oil: "#A8301C",
  bench: "#1f1a16",
};

/* ── Formato ── */
const nf0 = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });
const fmt = (n) => nf0.format(Math.round(n));
const fmt1 = (n) => nf1.format(n);
const usd = (n) => {
  const mil = n / 1e9;
  return mil >= 1 ? `${fmt1(mil)} mil M$` : `${fmt(n / 1e6)} M$`;
};

export default function App() {
  const [capital, setCapital] = useState(4_500_000_000);
  const [escKey, setEscKey] = useState("conservador");
  const esc = ESCENARIOS[escKey];

  const d = useMemo(() => {
    const toneladas = capital / P.precioToneladaPetroleo;
    const barriles = toneladas * P.barrilesPorTonelada;
    const aniosCombustible = toneladas / P.consumoAnualCubaTon;

    const parques = capital / P.costoParqueSolar10MW;
    const mwSolar = parques * P.mwPorParqueSolar;

    const turbinas = capital / P.costoTurbina3MW;
    const mwEolica = turbinas * P.mwPorTurbina;

    // Proyección de electricidad acumulada (TWh)
    const twhSolarAnio = (mwSolar * 8760 * esc.fcSolar) / 1e6;
    const twhEolicaAnio = (mwEolica * 8760 * esc.fcEolica) / 1e6;
    const twhPetroleoTotal =
      (toneladas * MWH_TERMICOS_POR_TON * esc.efPetroleo) / 1e6;

    const serie = [];
    for (let a = 0; a <= P.vidaUtilAnios; a++) {
      serie.push({
        anio: a,
        Solar: +(twhSolarAnio * a).toFixed(1),
        Eólica: +(twhEolicaAnio * a).toFixed(1),
        Petróleo: +twhPetroleoTotal.toFixed(1),
      });
    }
    const cruceSolar = twhSolarAnio > 0 ? twhPetroleoTotal / twhSolarAnio : Infinity;

    return {
      toneladas, barriles, aniosCombustible,
      parques, mwSolar, turbinas, mwEolica,
      twhSolarAnio, twhEolicaAnio, twhPetroleoTotal,
      serie, cruceSolar,
    };
  }, [capital, esc]);

  const scaleMax = Math.max(d.mwSolar, d.mwEolica, P.demandaPicoCuba) * 1.08;

  return (
    <div style={S.page}>
      <style>{CSS}</style>

      {/* ── HERO ── */}
      <header style={S.hero}>
        <div style={S.glow} />
        <div style={S.eyebrow}>Escenario hipotético · Energía de Cuba</div>
        <h1 style={S.h1}>
          ¿Qué podría comprar la mitad del capital de GAESA en seis meses?
        </h1>
        <p style={S.lede}>
          Partiendo de los activos líquidos estimados del conglomerado, este
          panel traduce el dinero en toneladas de petróleo, parques solares y
          aerogeneradores — y proyecta qué entrega cada opción a 25 años.
        </p>

        <div style={S.capitalBox}>
          <div style={S.capitalLabel}>Capital disponible</div>
          <div style={S.capitalValue}>{usd(capital)}</div>
          <input
            className="cap-slider"
            type="range"
            min={1_000_000_000}
            max={9_000_000_000}
            step={250_000_000}
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value))}
          />
          <div style={S.sliderEnds}>
            <span>1 mil M$</span>
            <span>9 mil M$</span>
          </div>
          <div style={S.hint}>
            Mueve el control para ver cómo cambia todo en tiempo real.
          </div>
        </div>
      </header>

      {/* ── TARJETAS ── */}
      <section style={S.cardGrid}>
        <Card accent={C.oil} tag="Petróleo crudo">
          <BigNum value={fmt(d.toneladas)} unit="toneladas" color={C.oil} />
          <Row k="Barriles" v={`${fmt(d.barriles)} bbl`} />
          <Row k="Precio base" v={`${P.precioToneladaPetroleo} $/t`} />
          <Pill color={C.oil}>
            Cubre ≈ {fmt1(d.aniosCombustible)} años de combustible de Cuba
          </Pill>
          <Note>Recurso de un solo uso: se quema y se agota.</Note>
        </Card>

        <Card accent={C.solar} tag="Energía solar">
          <BigNum value={fmt(d.parques)} unit="parques de 10 MW" color={C.solar} />
          <Row k="Potencia" v={`${fmt(d.mwSolar)} MW`} />
          <Row k="Coste/parque" v={usd(P.costoParqueSolar10MW)} />
          <Pill color={C.solar}>
            {pct(d.mwSolar, P.demandaPicoCuba)} % de la demanda pico
          </Pill>
          <Note>Infraestructura permanente (~25 años de vida útil).</Note>
        </Card>

        <Card accent={C.wind} tag="Energía eólica">
          <BigNum value={fmt(d.turbinas)} unit="aerogeneradores de 3 MW" color={C.wind} />
          <Row k="Potencia" v={`${fmt(d.mwEolica)} MW`} />
          <Row k="Coste/turbina" v={usd(P.costoTurbina3MW)} />
          <Pill color={C.wind}>
            {pct(d.mwEolica, P.demandaPicoCuba)} % de la demanda pico
          </Pill>
          <Note>Infraestructura permanente (~25 años de vida útil).</Note>
        </Card>
      </section>

      {/* ── SIGNATURE: capacidad vs demanda (umbral de apagones) ── */}
      <section style={S.block}>
        <h2 style={S.h2}>Capacidad instalable frente a la demanda pico</h2>
        <p style={S.sub}>
          La línea marca los <b style={{ color: C.bench }}>3.300 MW</b> de
          consumo máximo de Cuba. Todo lo que cruza esa marca es excedente:
          el fin de los apagones.
        </p>

        <div style={S.thresholdWrap}>
          <div
            className="thr-line"
            style={{ left: `${(P.demandaPicoCuba / scaleMax) * 100}%` }}
          >
            <span style={S.thrLabel}>Demanda pico · 3.300 MW</span>
          </div>

          <ThrBar
            name="Solar"
            mw={d.mwSolar}
            color={C.solar}
            scaleMax={scaleMax}
            demanda={P.demandaPicoCuba}
          />
          <ThrBar
            name="Eólica"
            mw={d.mwEolica}
            color={C.wind}
            scaleMax={scaleMax}
            demanda={P.demandaPicoCuba}
          />
        </div>
      </section>

      {/* ── PROYECCIÓN 25 AÑOS ── */}
      <section style={S.block}>
        <div style={S.projHead}>
          <div>
            <h2 style={S.h2}>Electricidad acumulada a 25 años</h2>
            <p style={S.sub}>
              El petróleo entrega su energía una sola vez; las renovables
              generan cada año. Las solares superan a todo ese crudo en
              torno al <b style={{ color: C.solar }}>año {fmt1(d.cruceSolar)}</b> y
              siguen otras dos décadas.
            </p>
          </div>
          <div style={S.toggle}>
            {Object.keys(ESCENARIOS).map((k) => (
              <button
                key={k}
                onClick={() => setEscKey(k)}
                style={{
                  ...S.toggleBtn,
                  ...(escKey === k ? S.toggleOn : {}),
                }}
              >
                {ESCENARIOS[k].label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: "100%", height: 340 }}>
          <ResponsiveContainer>
            <AreaChart data={d.serie} margin={{ top: 10, right: 12, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.solar} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={C.solar} stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="gW" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.wind} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={C.wind} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={C.line} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="anio"
                stroke={C.muted}
                tick={{ fill: C.muted, fontSize: 12 }}
                label={{ value: "Años", position: "insideBottom", offset: -2, fill: C.muted, fontSize: 12 }}
              />
              <YAxis
                stroke={C.muted}
                tick={{ fill: C.muted, fontSize: 12 }}
                label={{ value: "TWh", angle: -90, position: "insideLeft", fill: C.muted, fontSize: 12 }}
              />
              <Tooltip content={<TT />} />
              <Legend wrapperStyle={{ fontSize: 13, color: C.text }} />
              <Area type="monotone" dataKey="Solar" stroke={C.solar} strokeWidth={2.5} fill="url(#gS)" />
              <Area type="monotone" dataKey="Eólica" stroke={C.wind} strokeWidth={2.5} fill="url(#gW)" />
              <ReferenceLine y={d.twhPetroleoTotal} stroke={C.oil} strokeWidth={2} strokeDasharray="6 4"
                label={{ value: `Petróleo (total único): ${fmt1(d.twhPetroleoTotal)} TWh`, fill: C.oil, fontSize: 11, position: "insideTopRight" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Note>
          Supuestos · solar FC {Math.round(esc.fcSolar * 100)}% · eólica FC{" "}
          {Math.round(esc.fcEolica * 100)}% · eficiencia térmica del crudo{" "}
          {Math.round(esc.efPetroleo * 100)}%.
        </Note>
      </section>

      {/* ── TABLA RESUMEN ── */}
      <section style={S.block}>
        <h2 style={S.h2}>Tabla comparativa</h2>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Opción</th>
                <th style={S.thR}>Unidades</th>
                <th style={S.thR}>Capacidad / volumen</th>
                <th style={S.thR}>Energía a 25 años</th>
                <th style={S.thR}>Tipo</th>
              </tr>
            </thead>
            <tbody>
              <TR c={C.oil} opt="Petróleo crudo"
                u={`${fmt(d.toneladas)} t`}
                cap={`${fmt(d.barriles)} bbl`}
                en={`${fmt1(d.twhPetroleoTotal)} TWh (único)`}
                tipo="Consumible" />
              <TR c={C.solar} opt="Parques solares"
                u={`${fmt(d.parques)} × 10 MW`}
                cap={`${fmt(d.mwSolar)} MW`}
                en={`${fmt1(d.twhSolarAnio * P.vidaUtilAnios)} TWh`}
                tipo="Permanente" />
              <TR c={C.wind} opt="Aerogeneradores"
                u={`${fmt(d.turbinas)} × 3 MW`}
                cap={`${fmt(d.mwEolica)} MW`}
                en={`${fmt1(d.twhEolicaAnio * P.vidaUtilAnios)} TWh`}
                tipo="Permanente" />
            </tbody>
          </table>
        </div>
      </section>

      <footer style={S.footer}>
        <p style={S.foot}>
          Cifras derivadas del escenario y las fuentes públicas aportadas por el
          autor (activos GAESA, precios de referencia Brent/WTI, costes de
          instalación renovable). Son estimaciones para ilustrar el orden de
          magnitud, no una contabilidad oficial.
        </p>
      </footer>
    </div>
  );
}

/* ── Subcomponentes ── */
function Card({ children, accent, tag }) {
  return (
    <div style={{ ...S.card, borderTop: `3px solid ${accent}` }}>
      <div style={{ ...S.cardTag, color: accent }}>{tag}</div>
      {children}
    </div>
  );
}
function BigNum({ value, unit, color }) {
  return (
    <div style={S.bigWrap}>
      <span style={{ ...S.big, color }}>{value}</span>
      <span style={S.bigUnit}>{unit}</span>
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div style={S.kv}>
      <span style={S.kvK}>{k}</span>
      <span style={S.kvV}>{v}</span>
    </div>
  );
}
function Pill({ children, color }) {
  return (
    <div style={{ ...S.pill, color, borderColor: hexA(color, 0.4), background: hexA(color, 0.1) }}>
      {children}
    </div>
  );
}
function Note({ children }) {
  return <div style={S.noteText}>{children}</div>;
}
function ThrBar({ name, mw, color, scaleMax, demanda }) {
  const wTotal = (mw / scaleMax) * 100;
  const wCover = (Math.min(mw, demanda) / scaleMax) * 100;
  const surplus = mw - demanda;
  return (
    <div style={S.thrRow}>
      <div style={S.thrName}>{name}</div>
      <div style={S.thrTrack}>
        <div style={{ width: `${wCover}%`, background: hexA(color, 0.5), height: "100%", position: "absolute", left: 0, borderRadius: "6px 0 0 6px" }} />
        <div className="thr-glow" style={{ width: `${wTotal}%`, height: "100%", position: "absolute", left: 0, borderRadius: 6, border: `1.5px solid ${color}`, boxShadow: surplus > 0 ? `0 0 12px ${hexA(color, 0.35)}` : "none" }} />
        <div style={{ ...S.thrVal, color }}>{fmt(mw)} MW</div>
      </div>
      <div style={S.thrBadge}>
        {surplus >= 0
          ? `+${fmt(surplus)} MW excedente`
          : `cubre ${Math.round((mw / demanda) * 100)}%`}
      </div>
    </div>
  );
}
function TR({ c, opt, u, cap, en, tipo }) {
  return (
    <tr>
      <td style={S.td}>
        <span style={{ ...S.dot, background: c }} /> {opt}
      </td>
      <td style={S.tdR}>{u}</td>
      <td style={S.tdR}>{cap}</td>
      <td style={S.tdR}>{en}</td>
      <td style={S.tdR}>{tipo}</td>
    </tr>
  );
}
function TT({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={S.tt}>
      <div style={S.ttTitle}>Año {label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: "#fcf9f4", fontSize: 13 }}>
          {p.name}: {fmt1(p.value)} TWh
        </div>
      ))}
    </div>
  );
}

/* ── helpers ── */
const pct = (a, b) => Math.round((a / b) * 100);
function hexA(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ── estilos ── */
const S = {
  page: { background: "transparent", color: C.text, fontFamily: "'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif", minHeight: "100%", padding: "0 0 48px", lineHeight: 1.5 },
  hero: { position: "relative", padding: "44px 20px 28px", maxWidth: 1040, margin: "0 auto", overflow: "hidden" },
  glow: { position: "absolute", top: -180, left: "50%", transform: "translateX(-50%)", width: 600, height: 380, background: `radial-gradient(ellipse at center, ${hexA(C.solar, 0.16)}, transparent 70%)`, pointerEvents: "none" },
  eyebrow: { position: "relative", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: C.solar, marginBottom: 14 },
  h1: { position: "relative", fontFamily: "'Manrope', sans-serif", fontSize: "clamp(28px, 5.5vw, 46px)", lineHeight: 1.05, fontWeight: 700, margin: "0 0 16px", letterSpacing: "-0.02em" },
  lede: { position: "relative", color: C.muted, fontSize: "clamp(15px, 2.2vw, 17px)", maxWidth: 620, margin: 0 },
  capitalBox: { position: "relative", marginTop: 28, padding: 22, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 24, boxShadow: "var(--y-shadow)", maxWidth: 520 },
  capitalLabel: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted },
  capitalValue: { fontFamily: "'Manrope', sans-serif", fontSize: "clamp(34px, 7vw, 52px)", fontWeight: 700, color: C.solar, margin: "2px 0 14px", letterSpacing: "-0.02em" },
  sliderEnds: { display: "flex", justifyContent: "space-between", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.muted, marginTop: 6 },
  hint: { fontSize: 12.5, color: C.muted, marginTop: 12 },

  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(248px, 1fr))", gap: 16, maxWidth: 1040, margin: "12px auto 0", padding: "0 20px" },
  card: { background: C.surface, border: `1px solid ${C.line}`, borderRadius: 24, boxShadow: "var(--y-shadow)", padding: 20 },
  cardTag: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 },
  bigWrap: { display: "flex", flexDirection: "column", marginBottom: 14 },
  big: { fontFamily: "'Manrope', sans-serif", fontSize: "clamp(30px, 6vw, 40px)", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" },
  bigUnit: { fontSize: 13, color: C.muted, marginTop: 5 },
  kv: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: `1px solid ${C.line}`, fontSize: 13.5 },
  kvK: { color: C.muted },
  kvV: { fontFamily: "'IBM Plex Mono', monospace", color: C.text },
  pill: { marginTop: 14, padding: "8px 12px", borderRadius: 10, border: "1px solid", fontSize: 13, fontWeight: 600 },
  noteText: { marginTop: 10, fontSize: 12, color: C.muted, fontStyle: "italic" },

  block: { maxWidth: 1040, margin: "40px auto 0", padding: "0 20px" },
  h2: { fontFamily: "'Manrope', sans-serif", fontSize: "clamp(20px, 3.5vw, 26px)", fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.01em" },
  sub: { color: C.muted, fontSize: 14.5, margin: "0 0 22px", maxWidth: 640 },

  thresholdWrap: { position: "relative", background: C.surface, border: `1px solid ${C.line}`, borderRadius: 24, boxShadow: "var(--y-shadow)", padding: "44px 20px 20px" },
  thrRow: { display: "flex", alignItems: "center", gap: 12, margin: "14px 0" },
  thrName: { width: 64, fontSize: 13.5, fontWeight: 600, flexShrink: 0 },
  thrTrack: { position: "relative", flex: 1, height: 38, background: C.raised, borderRadius: 6 },
  thrVal: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700 },
  thrBadge: { width: 132, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: C.muted, flexShrink: 0 },
  thrLabel: { position: "absolute", top: -26, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.bench, background: C.surface, padding: "2px 6px", borderRadius: 4 },

  projHead: { display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "flex-start" },
  toggle: { display: "flex", gap: 4, background: C.raised, padding: 4, borderRadius: 10, border: `1px solid ${C.line}` },
  toggleBtn: { background: "transparent", border: "none", color: C.muted, fontSize: 12.5, fontWeight: 600, padding: "7px 12px", borderRadius: 7, cursor: "pointer", fontFamily: "inherit" },
  toggleOn: { background: C.ink, color: "#fcf9f4" },

  tableWrap: { overflowX: "auto", border: `1px solid ${C.line}`, borderRadius: 24, background: C.surface, boxShadow: "var(--y-shadow)" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 560, fontSize: 13.5 },
  th: { textAlign: "left", padding: "13px 16px", color: C.muted, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", background: C.raised },
  thR: { textAlign: "right", padding: "13px 16px", color: C.muted, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", background: C.raised },
  td: { padding: "13px 16px", borderTop: `1px solid ${C.line}`, fontWeight: 600 },
  tdR: { padding: "13px 16px", borderTop: `1px solid ${C.line}`, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", color: C.text },
  dot: { display: "inline-block", width: 9, height: 9, borderRadius: "50%", marginRight: 8 },

  tt: { background: C.ink, border: 0, borderRadius: 12, boxShadow: "0 8px 24px rgba(40,25,10,.22)", padding: "10px 12px" },
  ttTitle: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#f2cdb8", marginBottom: 4 },

  footer: { maxWidth: 1040, margin: "36px auto 0", padding: "0 20px" },
  foot: { fontSize: 12, color: C.muted, lineHeight: 1.6 },
};

const CSS = `
@import url('${FUENTES_URL}');
* { box-sizing: border-box; }
.cap-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 999px; background: ${C.line}; outline: none; }
.cap-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; border-radius: 50%; background: ${C.solar}; cursor: pointer; box-shadow: 0 0 0 4px ${hexA(C.solar, 0.2)}; border: none; }
.cap-slider::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: ${C.solar}; cursor: pointer; border: none; box-shadow: 0 0 0 4px ${hexA(C.solar, 0.2)}; }
.thr-line { position: absolute; top: 18px; bottom: 18px; width: 2px; background: repeating-linear-gradient(${C.bench} 0 5px, transparent 5px 10px); z-index: 3; }
.thr-glow { transition: width .35s cubic-bezier(.2,.7,.3,1), box-shadow .35s ease; }
@media (max-width: 560px) {
  .thr-line span { font-size: 9px !important; }
}
@media (prefers-reduced-motion: reduce) {
  .thr-glow { transition: none; }
}
`;
