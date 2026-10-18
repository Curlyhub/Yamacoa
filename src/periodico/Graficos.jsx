import { useEffect, useRef, useState } from "react";
import { CUBA_PATHS, CUBA_VIEWBOX } from "../temas/electrica_geo";

/* Biblioteca CERRADA de gráficos de noticias y estudios automáticos.
   La pieza no inventa visualizaciones: declara un `grafico` (contrato en
   noticias.schema.json / estudios.schema.json) y estos componentes lo pintan.
     serie        evolución en el tiempo (huecos = sin dato; `destacar` = el dato de hoy)
     barras       categorías o ranking (`orden: "original"` para cronológico)
     cifra        un número
     comparacion  dos valores y su variación (antes/después, oficial frente a otra fuente)
     proporcion   partes de un total, en una retícula de 100 celdas
     mapa         valores por provincia sobre el contorno de Cuba
   Un solo tono (salvia de "automático"), eje único, tooltip al pasar y vista de
   tabla siempre disponible. Un tipo nuevo es decisión humana. */

const TINTA = "var(--y-auto-ink)";
const FUERTE = "var(--y-auto-head)";
const FONDO = "var(--y-surface-2)";
const TONOS = [FUERTE, TINTA, "rgba(47,86,64,.42)"]; // proporción: hasta tres partes
const fmt = (v, u) => (v == null ? "s/d" : `${Number(v).toLocaleString("es-ES")}${u ? ` ${u}` : ""}`);
const pct = (v) => `${Number(v).toLocaleString("es-ES", { maximumFractionDigits: 1 })} %`;

export default function Grafico({ g }) {
  const [tabla, setTabla] = useState(false);
  if (!g) return null;
  const C = { serie: Serie, barras: Barras, cifra: Cifra, comparacion: Comparacion, proporcion: Proporcion, mapa: Mapa }[g.tipo];
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

// Escala "bonita" para el eje: 0 y dos marcas redondas por encima del máximo.
function techo(max) {
  if (!(max > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(max));
  const paso = [1, 2, 2.5, 5, 10].map((k) => k * p).find((s) => s * 2 >= max * 1.05) || 10 * p;
  return paso * 2;
}

function rango(min, max) {
  if (!(max > 0)) return [0, 1];
  if (min < 0 || min < max * 0.45) return [0, techo(max)];
  const paso = techo((max - min) * 1.3) / 2;
  const lo = Math.floor(min / paso) * paso - (min % paso < paso * 0.15 ? paso : 0);
  return [Math.max(0, lo), lo + Math.ceil((max - lo) / paso + 0.15) * paso];
}

function Serie({ g }) {
  const [hover, setHover] = useState(null);
  const [ref, W] = useAncho();
  const pts = g.datos || [];
  if (!pts.length) return null;
  const H = 240, m = { t: 22, r: 18, b: 28, l: 48 };
  // Eje desde 0 salvo que los valores vivan lejos de él (una línea puede no empezar en 0;
  // una barra, siempre). El rótulo del eje lo dice.
  const vals = pts.map((p) => p.valor).filter((v) => v != null);
  const [lo, max] = rango(Math.min(...vals), Math.max(...vals));
  const x = (i) => m.l + (pts.length === 1 ? 0 : (i * (W - m.l - m.r)) / (pts.length - 1));
  const y = (v) => H - m.b - ((v - lo) / (max - lo)) * (H - m.t - m.b);
  // Un hueco (s/d) corta la línea: no se inventa la continuidad.
  const tramos = [];
  pts.forEach((p, i) => {
    if (p.valor == null) return;
    const prev = i > 0 && pts[i - 1].valor != null;
    if (prev) tramos[tramos.length - 1] += ` L${x(i)},${y(p.valor)}`; else tramos.push(`M${x(i)},${y(p.valor)}`);
  });
  const paso = Math.ceil(pts.length / Math.max(2, Math.floor(W / 80)));
  const iDest = g.destacar ? pts.findIndex((p) => p.etiqueta === g.destacar) : -1;
  const marcas = pts.length <= 14;
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={g.titulo}
        onMouseLeave={() => setHover(null)}>
        {[lo, (lo + max) / 2, max].map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke="rgba(60,40,20,.1)" />
            <text x={m.l - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--y-subtle)" fontFamily="var(--y-mono)">
              {t.toLocaleString("es-ES")}
            </text>
          </g>
        ))}
        {pts.map((p, i) => (i === iDest || (i % paso === 0 && (iDest < 0 || Math.abs(x(i) - x(iDest)) > 46))) && (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fontFamily="var(--y-mono)"
            fill={i === iDest ? "var(--y-ink)" : "var(--y-subtle)"} fontWeight={i === iDest ? 700 : 400}>
            {p.etiqueta}
          </text>
        ))}
        {tramos.map((d, k) => <path key={k} d={d} fill="none" stroke={TINTA} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />)}
        {pts.map((p, i) => p.valor != null && (marcas || i === iDest || (i > 0 && pts[i - 1].valor == null && pts[i + 1]?.valor == null)) && (
          <circle key={i} cx={x(i)} cy={y(p.valor)} r={i === iDest ? 5.5 : 4} fill={i === iDest ? FUERTE : TINTA}
            stroke="var(--y-surface)" strokeWidth="2" />
        ))}
        {iDest >= 0 && pts[iDest].valor != null && (
          <text x={Math.min(W - m.r, Math.max(m.l, x(iDest)))} y={y(pts[iDest].valor) - 11} fontSize="12" fontWeight="800"
            textAnchor={x(iDest) > W - 60 ? "end" : x(iDest) < m.l + 30 ? "start" : "middle"} fill="var(--y-ink)">
            {fmt(pts[iDest].valor, g.unidadCorta)}
          </text>
        )}
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
  const filas = g.orden === "original" ? [...(g.datos || [])]
    : [...(g.datos || [])].sort((a, b) => (b.valor || 0) - (a.valor || 0));
  const max = Math.max(...filas.map((f) => f.valor || 0), 1);
  return (
    <div role="list" aria-label={g.titulo}>
      {filas.map((f, i) => {
        const dest = g.destacar === f.etiqueta;
        return (
          <div key={f.etiqueta} role="listitem" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            style={{ display: "grid", gridTemplateColumns: "minmax(90px,30%) 1fr auto", gap: 10, alignItems: "center",
              padding: "5px 0", opacity: hover == null || hover === i ? 1 : 0.55 }}>
            <span style={{ fontSize: 13, color: dest ? "var(--y-ink)" : "var(--y-ink-2)", fontWeight: dest ? 700 : 400 }}>{f.etiqueta}</span>
            <span style={{ height: 14, background: FONDO, borderRadius: 4, overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", width: `${((f.valor || 0) / max) * 100}%`,
                background: dest ? FUERTE : TINTA, borderRadius: "0 4px 4px 0" }} />
            </span>
            <span className="y-meta" style={{ color: "var(--y-ink-2)", minWidth: 48, textAlign: "right", fontWeight: dest ? 700 : 400 }}>
              {fmt(f.valor, g.unidadCorta)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Cifra({ g }) {
  const v = g.datos?.[0];
  if (!v) return null;
  return (
    <div>
      <div style={{ fontSize: "clamp(44px,7vw,72px)", fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1, color: FUERTE }}>
        {v.prefijo || ""}{Number(v.valor).toLocaleString("es-ES")}{v.sufijo || ""}
      </div>
      {v.etiqueta && <p className="y-card-p" style={{ marginTop: 10 }}>{v.etiqueta}</p>}
    </div>
  );
}

// Dos valores y su variación. La flecha y el signo van en tinta de texto: la variación
// no se colorea como "buena" o "mala" (eso es valoración, no dato).
function Comparacion({ g }) {
  const [a, b] = g.datos || [];
  if (!a || !b || a.valor == null || b.valor == null) return null;
  const max = Math.max(a.valor, b.valor, 1);
  // Entre porcentajes la variación va en puntos (25,19 % → 28,44 % = +3,25 puntos, no +12,9 %).
  const enPuntos = /%/.test(`${g.unidad || ""}${g.unidadCorta || ""}`);
  const delta = enPuntos ? b.valor - a.valor : a.valor ? ((b.valor - a.valor) / Math.abs(a.valor)) * 100 : null;
  const veces = enPuntos ? null : a.valor && b.valor / a.valor >= 2 ? b.valor / a.valor : a.valor && a.valor / b.valor >= 2 ? a.valor / b.valor : null;
  return (
    <div>
      {[a, b].map((d, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(90px,30%) 1fr auto", gap: 10, alignItems: "center", padding: "7px 0" }}>
          <span style={{ fontSize: 13.5, color: "var(--y-ink-2)", fontWeight: i ? 700 : 400 }}>{d.etiqueta}</span>
          <span style={{ height: 22, background: FONDO, borderRadius: 4, overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: `${(d.valor / max) * 100}%`, background: i ? FUERTE : TINTA,
              opacity: i ? 1 : 0.6, borderRadius: "0 4px 4px 0" }} />
          </span>
          <span style={{ font: "700 14px var(--y-mono)", color: "var(--y-ink)", minWidth: 60, textAlign: "right" }}>
            {d.prefijo || ""}{fmt(d.valor, g.unidadCorta)}{d.sufijo || ""}
          </span>
        </div>
      ))}
      {delta != null && (
        <p style={{ margin: "10px 0 0", fontSize: 15, color: "var(--y-ink)" }}>
          <b style={{ fontSize: 22, letterSpacing: "-.02em" }}>{delta > 0 ? "▲ +" : delta < 0 ? "▼ " : ""}
            {enPuntos ? `${delta.toLocaleString("es-ES", { maximumFractionDigits: 2 })} puntos` : pct(delta)}</b>
          {veces ? <span className="y-meta" style={{ marginLeft: 10 }}>{veces.toLocaleString("es-ES", { maximumFractionDigits: 1 })} veces</span> : null}
        </p>
      )}
    </div>
  );
}

// Partes de un total en una retícula de 10 × 10 (cada celda = 1 %).
function Proporcion({ g }) {
  const [hover, setHover] = useState(null);
  const partes = (g.datos || []).slice(0, 3);
  if (!partes.length || !(g.total > 0)) return null;
  const celdas = [];
  partes.forEach((p, k) => { for (let i = 0; i < Math.round(((p.valor || 0) / g.total) * 100); i++) celdas.push(k); });
  while (celdas.length < 100) celdas.push(-1);
  const C = 18, G = 3;
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
      <svg viewBox={`0 0 ${10 * (C + G)} ${10 * (C + G)}`} width={10 * (C + G)} height={10 * (C + G)} role="img" aria-label={g.titulo}
        style={{ maxWidth: "100%", flex: "0 0 auto" }}>
        {celdas.slice(0, 100).map((k, i) => (
          <rect key={i} x={(i % 10) * (C + G)} y={Math.floor(i / 10) * (C + G)} width={C} height={C} rx="3"
            fill={k < 0 ? FONDO : TONOS[k]} opacity={hover == null || hover === k ? 1 : 0.35} />
        ))}
      </svg>
      <div style={{ flex: "1 1 200px" }}>
        {partes.map((p, k) => (
          <div key={k} onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover(null)}
            style={{ display: "grid", gridTemplateColumns: "14px 1fr", gap: 10, padding: "6px 0", alignItems: "start" }}>
            <i style={{ width: 14, height: 14, borderRadius: 3, background: TONOS[k], marginTop: 4 }} />
            <span>
              <b style={{ fontSize: k ? 18 : 30, letterSpacing: "-.03em", color: "var(--y-ink)" }}>{pct(((p.valor || 0) / g.total) * 100)}</b>
              <span style={{ display: "block", fontSize: 13.5, color: "var(--y-ink-2)" }}>
                {p.etiqueta} · {fmt(p.valor, g.unidadCorta)}
              </span>
            </span>
          </div>
        ))}
        <span className="y-meta" style={{ display: "block", marginTop: 6 }}>Total: {fmt(g.total, g.unidadCorta)} · cada celda, 1 %</span>
      </div>
    </div>
  );
}

// Provincias reales (cuba.svg de MapSVG, compartido con los expedientes) y centro
// aproximado de cada una. Mapa de símbolos: el área del círculo es el valor (para
// recuentos; el color de la provincia no codifica nada).
const [, , VB_W, VB_H] = CUBA_VIEWBOX.split(" ").map(Number);
const GEO = { oeste: -84.951889, norte: 23.276752, este: -74.132223, sur: 19.825899 };
const enMapa = ([lon, lat]) => [((lon - GEO.oeste) / (GEO.este - GEO.oeste)) * VB_W, ((GEO.norte - lat) / (GEO.norte - GEO.sur)) * VB_H];
const PROV = {
  "Pinar del Río": [-83.7, 22.42], Artemisa: [-82.76, 22.81], "La Habana": [-82.36, 23.09], Mayabeque: [-81.95, 22.9],
  Matanzas: [-81.25, 22.75], "Villa Clara": [-79.96, 22.45], Cienfuegos: [-80.45, 22.2], "Sancti Spíritus": [-79.44, 21.93],
  "Ciego de Ávila": [-78.76, 21.84], Camagüey: [-77.92, 21.38], "Las Tunas": [-76.95, 20.96], Holguín: [-75.95, 20.75],
  Granma: [-76.75, 20.28], "Santiago de Cuba": [-75.82, 20.1], Guantánamo: [-74.85, 20.2], "Isla de la Juventud": [-82.83, 21.7],
};

function Mapa({ g }) {
  const [hover, setHover] = useState(null);
  const [ref, W] = useAncho();
  const datos = (g.datos || []).filter((d) => PROV[d.etiqueta] && d.valor != null);
  if (!datos.length) return null;
  const k = W / VB_W; // los radios se fijan en píxeles de pantalla
  const max = Math.max(...datos.map((d) => d.valor), 1);
  const rMax = Math.max(14, Math.min(30, W / 26));
  const r = (v) => Math.max(3, Math.sqrt(v / max) * rMax) / k;
  // Rótulos: las tres mayores (una sola en pantallas estrechas); el resto, tooltip y tabla.
  const top = new Set([...datos].sort((a, b) => b.valor - a.valor).slice(0, W < 560 ? 1 : 3).map((d) => d.etiqueta));
  const orden = [...datos].sort((a, b) => b.valor - a.valor); // los grandes, debajo
  const h = hover && datos.find((d) => d.etiqueta === hover);
  // Margen superior para que el rótulo del círculo más al norte no se corte.
  const arriba = Math.max(0, ...datos.filter((d) => top.has(d.etiqueta)).map((d) => r(d.valor) + 20 / k - enMapa(PROV[d.etiqueta])[1]));
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <svg viewBox={`0 ${-arriba} ${VB_W} ${VB_H + arriba + 6}`} width={W} height={(W * (VB_H + arriba + 6)) / VB_W} role="img" aria-label={g.titulo}
        onMouseLeave={() => setHover(null)}>
        {CUBA_PATHS.map((p) => <path key={p.id} d={p.d} fill={FONDO} stroke="rgba(60,40,20,.28)" strokeWidth={0.8 / k} />)}
        {orden.map((d) => {
          const [cx, cy] = enMapa(PROV[d.etiqueta]);
          return (
            <g key={d.etiqueta} onMouseEnter={() => setHover(d.etiqueta)}>
              <circle cx={cx} cy={cy} r={Math.max(r(d.valor), 10 / k)} fill="transparent" />
              <circle cx={cx} cy={cy} r={r(d.valor)} fill={TINTA} fillOpacity={hover && hover !== d.etiqueta ? 0.3 : 0.75}
                stroke="var(--y-surface)" strokeWidth={2 / k} />
              {top.has(d.etiqueta) && (
                <text x={cx} y={cy - r(d.valor) - 6 / k} fontSize={11 / k} fontWeight="700" fill="var(--y-ink)"
                  textAnchor={cx * k > W - 90 ? "end" : cx * k < 90 ? "start" : "middle"}>
                  {d.etiqueta} · {Number(d.valor).toLocaleString("es-ES")}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {h && (
        <div style={tip(enMapa(PROV[h.etiqueta])[0] / VB_W)}>
          <b>{h.etiqueta}</b> · {fmt(h.valor, g.unidadCorta)}
        </div>
      )}
      <span className="y-meta" style={{ display: "block", marginTop: 4 }}>El área de cada círculo es proporcional al valor</span>
    </div>
  );
}

function Tabla({ g }) {
  const filas = g.tipo === "mapa" ? [...(g.datos || [])].sort((a, b) => (b.valor || 0) - (a.valor || 0)) : g.datos || [];
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            <th style={th}>{g.ejeX || (g.tipo === "mapa" ? "Provincia" : "Categoría")}</th>
            <th style={{ ...th, textAlign: "right" }}>{g.unidad || "Valor"}</th>
            {g.tipo === "proporcion" && <th style={{ ...th, textAlign: "right" }}>% del total</th>}
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.etiqueta}>
              <td style={td}>{f.etiqueta}</td>
              <td style={{ ...td, textAlign: "right", fontFamily: "var(--y-mono)" }}>{fmt(f.valor)}</td>
              {g.tipo === "proporcion" && <td style={{ ...td, textAlign: "right", fontFamily: "var(--y-mono)" }}>{pct(((f.valor || 0) / g.total) * 100)}</td>}
            </tr>
          ))}
          {g.tipo === "proporcion" && (
            <tr><td style={{ ...td, fontWeight: 700 }}>Total</td><td style={{ ...td, textAlign: "right", fontFamily: "var(--y-mono)", fontWeight: 700 }}>{fmt(g.total)}</td><td style={td} /></tr>
          )}
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
