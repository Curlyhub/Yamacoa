import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

/* ─── paleta editorial neutra (no reservada) ────────────────────────────── */
const COL = {
  bg: "#0C0E14", panel: "#141820", panel2: "#0E1018",
  accent: "#7AAFC7", accentGlow: "rgba(122,175,199,.12)",
  outAccent: "#42C9A8", outBg: "rgba(66,201,168,.08)", outBorder: "rgba(66,201,168,.32)",
  node: "#161D2B", nodeBorder: "#253040",
  arrow: "#2E4060",
  text: "#EDEFF5", muted: "#8A93A8", faint: "#536070",
  line: "rgba(255,255,255,.07)",
};

/* ─── dataset embebido (respaldo) ──────────────────────────────────────── */
const EMBEDDED = {
  intro: "Yamacoa documenta eventos medibles sobre Cuba — detenciones, protestas, apagones, vínculos de poder — a partir de fuentes periodísticas y documentales públicas. Los presentamos como frecuencias y tendencias observadas, no como explicaciones causales.",
  metodo: [
    { etapa: "EVENTO MEDIBLE",       descripcion: "Identificación de un hecho contable: una detención, una protesta, un apagón, un vínculo documentado entre personas o instituciones." },
    { etapa: "FUENTE DOCUMENTAL",    descripcion: "Localización de la fuente que lo registra: informe de derechos humanos, nota periodística verificada, documento oficial o registro público." },
    { etapa: "CODIFICACIÓN",         descripcion: "Extracción estructurada asistida con esquema de datos constreñido que fuerza los tipos de campo y los valores admitidos. La disciplina la impone el esquema, no el motor: el método es agnóstico del sistema que lo ejecuta." },
    { etapa: "VERIFICACIÓN",         descripcion: "Contraste periodístico y estadístico: corroboración con fuente primaria o bien contrastada, distinción entre reportado y documentado, paráfrasis — nunca cita literal — para evitar la transferencia de error de la fuente." },
    { etapa: "DATO CON INCERTIDUMBRE", descripcion: "El dato final lleva siempre su cota de incertidumbre: «como mínimo», subregistro reconocido, margen de estimación o control del cambio metodológico. La incertidumbre no se oculta; se comunica." },
  ],
  estadistica: "El método es observacional, no experimental: no existe grupo de control ni aleatorización. Observamos lo que ocurre, no lo que ocurriría bajo otras condiciones. La unidad de análisis es el evento o caso documentado — una detención, un conflicto, un apagón. Los totales son suelos, no techos: representan como mínimo lo que las fuentes pudieron documentar. El sesgo de reporte es estructural: los eventos en zonas con mayor presencia de prensa independiente están más documentados. Los cambios metodológicos en las fuentes se señalan explícitamente y se controlan en las series temporales. No afirmamos relaciones causales; describimos frecuencias y tendencias observadas.",
  validacion: {
    periodistico: [
      "¿Hay una fuente primaria o bien contrastada que soporte el dato?",
      "¿La incertidumbre es visible en la interfaz, no relegada a una nota al pie?",
      "¿Se distingue «reportado» de «documentado»?",
      "¿El texto es paráfrasis propia, nunca cita literal de la fuente?",
    ],
    estadistico: [
      "¿El total es un suelo («como mínimo») o una estimación con margen declarado?",
      "¿El cambio en la tendencia es real o se explica por un cambio metodológico de la fuente?",
      "¿El comparativo entre periodos es válido dado el alcance de cada uno?",
      "¿El sesgo de reporte por zona geográfica está reconocido?",
    ],
  },
  cambios: [
    {
      temaId: "conflictos", tema: "La calle arde", periodo: "2023 en adelante",
      cambio: "El OCC revisó su metodología de conteo a partir de 2023.",
      motivo: "Los datos de 2021-2022 no son directamente comparables con los de periodos posteriores a ese corte.",
    },
  ],
};

const DATA_URL = "/data/metodologia.json";

/* ─── componente principal ──────────────────────────────────────────────── */
export default function App() {
  const [data, setData] = useState(EMBEDDED);

  useEffect(() => {
    let live = true;
    fetch(DATA_URL)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => { if (live) setData(j); })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  useEffect(() => {
    const id = "yamacoa-fonts-met2";
    if (document.getElementById(id)) return;
    const l = document.createElement("link");
    l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap";
    document.head.appendChild(l);
  }, []);

  const v = data.validacion || {};
  const cambios = data.cambios || [];

  return (
    <div style={{ background: COL.bg, color: COL.text, minHeight: "100vh", fontFamily: "Archivo, system-ui, sans-serif" }}>
      <style>{CSS}</style>
      <div className="met-wrap">

        {/* cabecera */}
        <header className="met-cab">
          <div className="met-eyebrow">Yamacoa · Método estadístico-observacional</div>
          <h1 className="met-h1">Metodología</h1>
          <p className="met-intro">{data.intro}</p>
        </header>

        {/* diagrama de flujo */}
        <section className="met-section">
          <div className="met-section-lbl">El flujo del dato</div>
          <div className="met-flow-wrap">
            <div className="met-flow">
              {(data.metodo || []).map((e, i, arr) => {
                const isOut = i === arr.length - 1;
                return (
                  <React.Fragment key={i}>
                    <div className={"met-fnode" + (isOut ? " out" : "")}>
                      <div className="met-fnode-lbl">{e.etapa}</div>
                      <p className="met-fnode-desc">{e.descripcion}</p>
                    </div>
                    {i < arr.length - 1 && <FlowArrow />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </section>

        {/* estadística observacional */}
        <section className="met-section">
          <div className="met-section-lbl">Estadística observacional</div>
          <div className="met-prose-card">
            <p className="met-prose">{data.estadistica}</p>
          </div>
        </section>

        {/* criterios de validación */}
        <section className="met-section">
          <div className="met-section-lbl">Criterios de validación</div>
          <div className="met-val-grid">
            <div className="met-val-col">
              <div className="met-val-head">Periodístico</div>
              <ul className="met-crit">
                {(v.periodistico || []).map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
            <div className="met-val-col">
              <div className="met-val-head">Estadístico</div>
              <ul className="met-crit">
                {(v.estadistico || []).map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>
        </section>

        {/* cambios metodológicos — disclosure plegado por defecto */}
        {cambios.length > 0 && (
          <section className="met-section">
            <details className="met-cambios">
              <summary className="met-cambios-sum">
                <span className="met-cambios-tri" aria-hidden>▶</span>
                Ver registro de cambios metodológicos ({cambios.length})
              </summary>
              <div className="met-cambios-body">
                {cambios.map((c, i) => (
                  <div key={i} className="met-cambio">
                    <div className="met-cambio-head">
                      <Link to={"/" + c.temaId} className="met-cambio-tema">{c.tema}</Link>
                      <span className="met-cambio-sep">·</span>
                      <span className="met-cambio-periodo">{c.periodo}</span>
                    </div>
                    <p className="met-cambio-texto">{c.cambio}</p>
                    <p className="met-cambio-motivo">{c.motivo}</p>
                  </div>
                ))}
              </div>
            </details>
          </section>
        )}

        <footer className="met-foot">
          <span>Yamacoa</span>
          <span>El método es público; los datos son auditables.</span>
        </footer>
      </div>
    </div>
  );
}

/* ─── flecha del diagrama ───────────────────────────────────────────────── */
function FlowArrow() {
  return (
    <div className="met-flow-arr" aria-hidden>
      <svg width="24" height="20" viewBox="0 0 24 20">
        <line x1="0" y1="10" x2="16" y2="10" stroke={COL.arrow} strokeWidth="2" />
        <polygon points="16,5 24,10 16,15" fill={COL.arrow} />
      </svg>
    </div>
  );
}

/* ─── CSS ───────────────────────────────────────────────────────────────── */
const CSS = `
*{box-sizing:border-box}
.met-wrap{max-width:1080px;margin:0 auto;padding:24px 20px 64px}

.met-eyebrow{font-family:'IBM Plex Mono',monospace;font-size:11px;text-transform:uppercase;
  letter-spacing:.18em;color:${COL.faint};margin-bottom:10px}
.met-cab{padding:16px 0 32px}
.met-h1{font-size:34px;font-weight:800;letter-spacing:-.02em;margin:0 0 14px}
.met-intro{color:${COL.muted};font-size:15px;line-height:1.62;margin:0;max-width:64ch}

.met-section{margin-bottom:36px}
.met-section-lbl{font-family:'IBM Plex Mono',monospace;font-size:10px;text-transform:uppercase;
  letter-spacing:.2em;color:${COL.faint};margin-bottom:14px;padding-bottom:8px;
  border-bottom:1px solid ${COL.line}}

/* diagrama de flujo */
.met-flow-wrap{overflow-x:auto;padding-bottom:8px}
.met-flow{display:flex;align-items:stretch;gap:0;min-width:820px}

.met-fnode{flex:1;background:${COL.node};border:1px solid ${COL.nodeBorder};border-radius:12px;
  padding:14px 13px;min-width:140px;display:flex;flex-direction:column;gap:8px}
.met-fnode.out{background:${COL.outBg};border-color:${COL.outBorder}}
.met-fnode-lbl{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.22em;
  text-transform:uppercase;color:${COL.accent};margin-bottom:2px}
.met-fnode.out .met-fnode-lbl{color:${COL.outAccent}}
.met-fnode-desc{margin:0;font-size:12.5px;line-height:1.55;color:${COL.muted}}
.met-flow-arr{display:flex;align-items:center;padding:0 3px;flex:none;opacity:.65}

/* estadística */
.met-prose-card{background:${COL.panel};border:1px solid ${COL.nodeBorder};
  border-left:3px solid ${COL.accent};border-radius:12px;padding:18px 20px}
.met-prose{margin:0;font-size:14.5px;line-height:1.72;color:${COL.text};opacity:.88}

/* validación */
.met-val-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.met-val-col{background:${COL.panel};border:1px solid ${COL.nodeBorder};border-radius:12px;padding:16px 18px}
.met-val-head{font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:uppercase;
  letter-spacing:.12em;color:${COL.accent};margin-bottom:12px;font-weight:600}
.met-crit{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:9px}
.met-crit li{font-size:13.5px;line-height:1.55;color:${COL.muted};padding-left:14px;position:relative}
.met-crit li::before{content:"·";position:absolute;left:0;color:${COL.accent};font-weight:700}

/* cambios metodológicos — disclosure */
.met-cambios{border:1px solid ${COL.nodeBorder};border-radius:12px;overflow:hidden}
.met-cambios[open] .met-cambios-tri{transform:rotate(90deg)}
.met-cambios-sum{
  display:flex;align-items:center;gap:10px;padding:13px 16px;cursor:pointer;
  font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.06em;
  color:${COL.muted};background:${COL.panel};list-style:none;user-select:none;
  transition:color .15s}
.met-cambios-sum::-webkit-details-marker{display:none}
.met-cambios-sum:hover{color:${COL.text}}
.met-cambios-tri{font-size:9px;color:${COL.accent};transition:transform .2s ease;flex:none}
.met-cambios-body{padding:0 16px 14px;display:flex;flex-direction:column;gap:12px;
  background:${COL.panel}}
.met-cambio{padding:12px 14px;background:${COL.panel2};border:1px solid ${COL.line};
  border-radius:9px}
.met-cambio-head{display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap}
.met-cambio-tema{font-weight:700;font-size:14px;color:${COL.accent};text-decoration:none}
.met-cambio-tema:hover{text-decoration:underline}
.met-cambio-sep{color:${COL.faint}}
.met-cambio-periodo{font-family:'IBM Plex Mono',monospace;font-size:11px;color:${COL.faint}}
.met-cambio-texto{margin:0 0 4px;font-size:13.5px;line-height:1.5;color:${COL.text}}
.met-cambio-motivo{margin:0;font-size:12.5px;line-height:1.5;color:${COL.muted}}

.met-foot{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:48px;
  padding-top:16px;border-top:1px solid ${COL.line};
  font-family:'IBM Plex Mono',monospace;font-size:11px;color:${COL.faint}}

@media(max-width:640px){
  .met-h1{font-size:26px}
  .met-val-grid{grid-template-columns:1fr}
}
`;
