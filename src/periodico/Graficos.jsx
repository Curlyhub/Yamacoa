import { useEffect, useRef, useState } from "react";

/* Biblioteca CERRADA de gráficos de los estudios automáticos.
   El estudio no inventa visualizaciones: declara un `grafico` (contrato en
   estudios.schema.json) con tipo serie | barras | cifra y estos componentes lo
   pintan. Una sola serie por gráfico (un tono: salvia de "automático"), eje
   único, tooltip al pasar y vista de tabla siempre disponible. */

const TINTA = "var(--y-auto-ink)";
const fmt = (v, u) => (v == null ? "s/d" : `${Number(v).toLocaleString("es-ES")}${u ? ` ${u}` : ""}`);

export default function Grafico({ g }) {
  const [tabla, setTabla] = useState(false);
  if (!g) return null;
  const C = { serie: Serie, barras: Barras, cifra: Cifra }[g.tipo];
  if (!C) return null;
  return (
    <figure style={{ margin: 0 }}>
      {g.titulo && <figcaption style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{g.titulo}</figcaption>}
      {g.unidad && <div className="y-meta" style={{ marginBottom: 12 }}>{g.unidad}</div>}
      {tabla && g.tipo !== "cifra" ? <Tabla g={g} /> : <C g={g} />}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
        <span className="y-meta">{g.fuente ? `Fuente: ${g.fuente}` : ""}{g.nota ? ` · ${g.nota}` : ""}</span>
        {g.tipo !== "cifra" && (
          <button type="button" className="y-chip" aria-pressed={tabla} onClick={() => setTabla(!tabla)}>
            {tabla ? "Ver gráfico" : "Ver tabla"}
          </button>
        )}
      </div>
    </figure>
  );
}

function useAncho() {
  const ref = useRef(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function Serie({ g }) {
  const [hover, setHover] = useState(null);
  const [ref, W] = useAncho();
  const pts = g.datos || [];
  if (!pts.length) return null;
  const H = 240, m = { t: 14, r: 16, b: 28, l: 44 };
  const vals = pts.map((p) => p.valor).filter((v) => v != null);
  const max = Math.max(...vals, 0) * 1.1 || 1;
  const x = (i) => m.l + (pts.length === 1 ? 0 : (i * (W - m.l - m.r)) / (pts.length - 1));
  const y = (v) => H - m.b - (v / max) * (H - m.t - m.b);
  const d = pts.map((p, i) => (p.valor == null ? null : `${x(i)},${y(p.valor)}`)).filter(Boolean).join(" L");
  const ticks = [0, max / 2, max].map((v) => Math.round(v));
  const paso = Math.ceil(pts.length / Math.max(2, Math.floor(W / 80)));
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={g.titulo}
        onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke="rgba(60,40,20,.1)" />
            <text x={m.l - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--y-subtle)" fontFamily="var(--y-mono)">
              {t.toLocaleString("es-ES")}
            </text>
          </g>
        ))}
        {pts.map((p, i) => i % paso === 0 && (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--y-subtle)" fontFamily="var(--y-mono)">
            {p.etiqueta}
          </text>
        ))}
        <path d={`M${d}`} fill="none" stroke={TINTA} strokeWidth="2" strokeLinejoin="round" />
        {hover != null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={H - m.b} stroke="var(--y-subtle)" strokeDasharray="3 3" />
            {pts[hover].valor != null && (
              <circle cx={x(hover)} cy={y(pts[hover].valor)} r="5" fill={TINTA} stroke="var(--y-surface)" strokeWidth="2" />
            )}
          </>
        )}
        {pts.map((p, i) => (
          <rect key={i} x={x(i) - (W - m.l - m.r) / pts.length / 2} y={m.t}
            width={(W - m.l - m.r) / pts.length} height={H - m.t - m.b} fill="transparent"
            onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      {hover != null && (
        <div style={tip(x(hover) / W)}>
          <b>{pts[hover].etiqueta}</b> · {fmt(pts[hover].valor, g.unidadCorta)}
        </div>
      )}
    </div>
  );
}

function Barras({ g }) {
  const [hover, setHover] = useState(null);
  const filas = [...(g.datos || [])].sort((a, b) => (b.valor || 0) - (a.valor || 0));
  const max = Math.max(...filas.map((f) => f.valor || 0), 1);
  return (
    <div role="list" aria-label={g.titulo}>
      {filas.map((f, i) => (
        <div key={f.etiqueta} role="listitem" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
          style={{ display: "grid", gridTemplateColumns: "minmax(90px,30%) 1fr auto", gap: 10, alignItems: "center",
            padding: "5px 0", opacity: hover == null || hover === i ? 1 : 0.55 }}>
          <span style={{ fontSize: 13, color: "var(--y-ink-2)" }}>{f.etiqueta}</span>
          <span style={{ height: 14, background: "var(--y-surface-2)", borderRadius: 4, overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: `${((f.valor || 0) / max) * 100}%`,
              background: TINTA, borderRadius: "0 4px 4px 0" }} />
          </span>
          <span className="y-meta" style={{ color: "var(--y-ink-2)", minWidth: 48, textAlign: "right" }}>
            {fmt(f.valor, g.unidadCorta)}
          </span>
        </div>
      ))}
    </div>
  );
}

function Cifra({ g }) {
  const v = g.datos?.[0];
  if (!v) return null;
  return (
    <div>
      <div style={{ fontSize: "clamp(44px,7vw,72px)", fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1, color: "var(--y-auto-head)" }}>
        {v.prefijo || ""}{Number(v.valor).toLocaleString("es-ES")}{v.sufijo || ""}
      </div>
      {v.etiqueta && <p className="y-card-p" style={{ marginTop: 10 }}>{v.etiqueta}</p>}
    </div>
  );
}

function Tabla({ g }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            <th style={th}>{g.ejeX || "Categoría"}</th>
            <th style={{ ...th, textAlign: "right" }}>{g.unidad || "Valor"}</th>
          </tr>
        </thead>
        <tbody>
          {(g.datos || []).map((f) => (
            <tr key={f.etiqueta}>
              <td style={td}>{f.etiqueta}</td>
              <td style={{ ...td, textAlign: "right", fontFamily: "var(--y-mono)" }}>{fmt(f.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { textAlign: "left", font: "500 10.5px var(--y-mono)", textTransform: "uppercase", letterSpacing: ".06em",
  color: "var(--y-subtle)", padding: "6px 8px", borderBottom: "1px solid var(--y-rule)" };
const td = { padding: "7px 8px", borderBottom: "1px solid var(--y-rule)", color: "var(--y-ink-2)" };

function tip(frac) {
  return {
    position: "absolute", top: 4, left: `${Math.min(80, Math.max(4, frac * 100))}%`,
    transform: "translateX(-50%)", background: "var(--y-dark)", color: "var(--y-surface)",
    font: "500 11px var(--y-mono)", padding: "6px 10px", borderRadius: 8, pointerEvents: "none", whiteSpace: "nowrap",
  };
}
