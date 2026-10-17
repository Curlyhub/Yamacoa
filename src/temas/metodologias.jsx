import React, { useState, useEffect } from "react";
import { cargarFuentes } from "../design/tokens";

/* ─── paleta editorial neutra (no reservada) ────────────────────────────── */
const COL = {
  bg: "transparent", panel: "#fcf9f4", panel2: "#f5efe7",
  accent: "#2F6690", accentGlow: "rgba(47,102,144,.10)",
  node: "#fcf9f4", nodeBorder: "rgba(60,40,20,.18)",
  arrow: "#8a7a68",
  text: "#1f1a16", muted: "#6b5d50", faint: "#8a7a68",
  line: "rgba(60,40,20,.15)",
  cadCiclo: "#1E7466", cadEstatica: "#5E4FA8",
};

/* ─── dataset embebido (respaldo) ──────────────────────────────────────── */
const EMBEDDED = {
  generado_at: "2026-06-27",
  pipeline_global: {
    ciclo: "~8 horas",
    herramientas: [
      "Gemini Flash (responseSchema)", "SearXNG self-hosted",
      "ajv", "esbuild", "bracket-balance string-aware",
    ],
    publicacion: "git-driven · Cloudflare Pages · HashRouter SPA",
    fuentes_recurrentes: [
      "OCDH", "OCC", "Prisoners Defenders", "BNF/Gallica",
      "CiberCuba", "14ymedio", "Diario de Cuba", "elTOQUE", "Amnesty International",
    ],
  },
  temas: [
    {
      id: "conflictos", titulo: "La calle arde",
      metodologia: {
        fuentes: [{ nombre: "OCC", tipo: "informe trimestral PDF", url: "https://observatoriocubano.org" }],
        periodo: "enero–marzo 2026", cadencia: "ciclo-8h",
        extraccion: "Gemini Flash con responseSchema constreñido; SearXNG self-hosted",
        validacion: "ajv contra conflictos.schema.json \xb7 esbuild \xb7 bracket-balance string-aware",
        limitaciones: [
          "OCC cambió alcance metodológico en 2023: datos anteriores no son directamente comparables",
          "Subregistro en provincias con menor conectividad y presencia de prensa independiente",
        ],
        cambios_metodologicos: [
          "OCC revisó la metodología de conteo en 2023; la serie 2021-2022 se reporta con ese caveat",
        ],
      },
    },
    {
      id: "represion", titulo: "La maquinaria de la represión",
      metodologia: {
        fuentes: [
          { nombre: "OCDH", tipo: "informe mensual", url: "https://observacuba.org" },
          { nombre: "Prisoners Defenders", tipo: "base de datos de presos políticos", url: "https://www.prisionersdefenders.org" },
          { nombre: "Prensa independiente cubana", tipo: "cobertura periodística", url: "" },
        ],
        periodo: "enero–mayo 2026", cadencia: "ciclo-8h",
        extraccion: "Gemini Flash con responseSchema constreñido; SearXNG self-hosted",
        validacion: "ajv contra represion.schema.json \xb7 esbuild \xb7 bracket-balance string-aware",
        limitaciones: [
          "Subregistro reconocido por el OCDH: no es posible documentar todos los actos represivos",
          "Concentración de cobertura en zonas con prensa activa (La Habana, Santiago de Cuba)",
        ],
        cambios_metodologicos: [],
      },
    },
    {
      id: "rusificacion", titulo: "La rusificación de Cuba",
      metodologia: {
        fuentes: [
          { nombre: "Periodismo de investigación", tipo: "artículos verificados sobre la élite militar-empresarial cubana", url: "" },
          { nombre: "Documentos oficiales cubanos", tipo: "registros públicos y organigramas estatales", url: "" },
        ],
        periodo: "2026-06-25", cadencia: "ciclo-8h",
        extraccion: "Pipeline Rust + Gemma: extracción de grafo de relaciones con puntuación de confianza por enlace (0.0-1.0); responseSchema para tipado de vínculos",
        validacion: "ajv contra rusificacion.schema.json \xb7 esbuild \xb7 bracket-balance string-aware",
        limitaciones: [
          "Confianza de los vínculos variable (0.2-1.0): los marcados 'estructura' son relaciones orgánicas, no necesariamente personales documentadas",
          "Opacidad del Estado cubano limita la verificación cruzada de fuentes primarias",
        ],
        cambios_metodologicos: [],
      },
    },
    {
      id: "himno", titulo: "Himno Patriótico Cubano",
      metodologia: {
        fuentes: [
          { nombre: "BNF/Gallica", tipo: "partitura original (dominio público)", url: "https://gallica.bnf.fr/ark:/12148/bpt6k855033c/f1.double" },
          { nombre: "Enrique Gay-Calbó", tipo: "ensayo historiográfico (1945)", url: "" },
          { nombre: "José María Heredia", tipo: "fuente literaria primaria · Himno del desterrado (1825)", url: "" },
        ],
        periodo: "pieza histórica \xb7 1850", cadencia: "estatica",
        extraccion: "Verificación manual directa contra la partitura original impresa (BNF/Gallica, imp. Paul Dupont); contraste con fuentes secundarias",
        validacion: "ajv contra himno.schema.json \xb7 esbuild \xb7 bracket-balance string-aware",
        limitaciones: [
          "Autoría de la letra debatida: la partitura de la BNF atribuye a Heredia y otros poetas populares; parte de la prensa cubana cita a Plácido Gener",
          "La versión 'del azul y el punzó' (atribuida a Gener) no figura en la partitura primaria; se documenta por separado",
        ],
        cambios_metodologicos: [],
      },
    },
  ],
};

const DATA_URL = "/data/metodologias.json";

/* ─── componente principal ──────────────────────────────────────────────── */
export default function App() {
  const [data, setData] = useState(EMBEDDED);
  const [sel, setSel] = useState(EMBEDDED.temas[0].id);

  useEffect(() => {
    let live = true;
    fetch(DATA_URL)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => { if (live) { setData(j); if (j.temas?.[0]) setSel(j.temas[0].id); } })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  useEffect(() => {
    cargarFuentes();
  }, []);

  const temaActivo = (data.temas || []).find(t => t.id === sel) || data.temas?.[0];
  const m = temaActivo?.metodologia || {};
  const cadColor = m.cadencia === "estatica" ? COL.cadEstatica : COL.cadCiclo;
  const cadLabel = m.cadencia === "estatica" ? "estática" : "ciclo ~8 h";

  return (
    <div style={{ background: COL.bg, color: COL.text, minHeight: "100vh", fontFamily: "Manrope, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      <style>{CSS}</style>
      <div className="wrap">

        <header className="cab">
          <div className="eyebrow">Yamacoa · Procedencia editorial</div>
          <h1>Bitácora de metodologías</h1>
          <p className="sub">Cómo se construye cada expediente: fuentes, extracción, validación y publicación.</p>
        </header>

        {/* selector de tema */}
        <div className="tema-bar">
          {(data.temas || []).map(t => (
            <button key={t.id} className={"tbtn" + (sel === t.id ? " on" : "")} onClick={() => setSel(t.id)}>
              {t.titulo}
            </button>
          ))}
        </div>

        {/* diagrama de flujo */}
        <div className="flow-wrap">
          <div className="flow">

            <div className="fnode hi">
              <div className="fnode-lbl">FUENTES</div>
              <div className="fnode-body">
                {(m.fuentes || []).map((f, i) => (
                  <div key={i} className="src-chip">
                    {f.url
                      ? <a href={f.url} target="_blank" rel="noreferrer" className="src-name link">{f.nombre}</a>
                      : <span className="src-name">{f.nombre}</span>}
                    <span className="src-tipo">{f.tipo}</span>
                  </div>
                ))}
              </div>
            </div>

            <FlowArrow />

            <div className="fnode">
              <div className="fnode-lbl">EXTRACCIÓN</div>
              <div className="fnode-body">
                <div className="chips"><Chip>Gemini Flash</Chip><Chip>responseSchema</Chip></div>
                <div className="chips"><Chip>SearXNG</Chip></div>
                <span className="cad" style={{ borderColor: cadColor, color: cadColor }}>{cadLabel}</span>
              </div>
            </div>

            <FlowArrow />

            <div className="fnode">
              <div className="fnode-lbl">VALIDACIÓN</div>
              <div className="fnode-body">
                <div className="chips"><Chip>ajv</Chip><Chip>schema</Chip></div>
                <div className="chips"><Chip>esbuild</Chip></div>
                <div className="chips"><Chip>bracket-balance</Chip></div>
              </div>
            </div>

            <FlowArrow />

            <div className="fnode">
              <div className="fnode-lbl">PUBLICACIÓN</div>
              <div className="fnode-body pub">
                <span className="pub-step">git commit</span>
                <span className="pub-arr">↓</span>
                <span className="pub-step">npm run build</span>
                <span className="pub-arr">↓</span>
                <span className="pub-step">Cloudflare Pages</span>
              </div>
            </div>

          </div>
        </div>

        {/* panel de detalle del tema activo */}
        {temaActivo && (
          <section className="detail">
            <div className="detail-title">{temaActivo.titulo}</div>
            <div className="drows">
              <DRow k="Periodo" v={m.periodo} />
              <DRow k="Cadencia">
                <span className="cad sm" style={{ borderColor: cadColor, color: cadColor }}>{cadLabel}</span>
              </DRow>
              <DRow k="Extracción" v={m.extraccion} />
              {(m.limitaciones || []).length > 0 && (
                <DRow k="Limitaciones">
                  <ul className="blist">{(m.limitaciones || []).map((l, i) => <li key={i}>{l}</li>)}</ul>
                </DRow>
              )}
              {(m.cambios_metodologicos || []).length > 0 && (
                <DRow k="Cambios">
                  <ul className="blist">{(m.cambios_metodologicos || []).map((c, i) => <li key={i}>{c}</li>)}</ul>
                </DRow>
              )}
            </div>
          </section>
        )}

        {/* pipeline global compartido */}
        <section className="global">
          <div className="global-lbl">Pipeline compartido</div>
          <div className="drows">
            <DRow k="Ciclo" v={data.pipeline_global?.ciclo} />
            <DRow k="Herramientas">
              <div className="chips">
                {(data.pipeline_global?.herramientas || []).map((h, i) => <Chip key={i}>{h}</Chip>)}
              </div>
            </DRow>
            <DRow k="Publicación" v={data.pipeline_global?.publicacion} />
            <DRow k="Fuentes recurrentes">
              <div className="chips">
                {(data.pipeline_global?.fuentes_recurrentes || []).map((f, i) => <Chip key={i}>{f}</Chip>)}
              </div>
            </DRow>
          </div>
        </section>

        <footer className="foot">
          <span>Yamacoa · Bitácora de metodologías</span>
          <span>Generado: {data.generado_at}</span>
        </footer>
      </div>
    </div>
  );
}

/* ─── subcomponentes ────────────────────────────────────────────────────── */
function FlowArrow() {
  return (
    <div className="flow-arr" aria-hidden>
      <svg width="28" height="20" viewBox="0 0 28 20">
        <line x1="1" y1="10" x2="20" y2="10" stroke={COL.arrow} strokeWidth="2" />
        <polygon points="20,5 28,10 20,15" fill={COL.arrow} />
      </svg>
    </div>
  );
}

function Chip({ children }) {
  return <span className="chip">{children}</span>;
}

function DRow({ k, v, children }) {
  return (
    <div className="drow">
      <div className="dk">{k}</div>
      <div className="dv">{children || v}</div>
    </div>
  );
}

/* ─── CSS ───────────────────────────────────────────────────────────────── */
const CSS = `
*{box-sizing:border-box}
.wrap{max-width:1080px;margin:0 auto;padding:24px 20px 60px}

.eyebrow{font-family:'IBM Plex Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:.18em;color:${COL.muted};margin-bottom:10px}
.cab{padding:16px 0 24px}
.cab h1{font-size:32px;font-weight:800;letter-spacing:-.02em;margin:0 0 8px}
.cab .sub{color:${COL.muted};font-size:14.5px;line-height:1.55;margin:0;max-width:62ch}

.tema-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px}
.tbtn{appearance:none;background:${COL.panel};border:1px solid ${COL.nodeBorder};color:${COL.muted};
  font-family:'IBM Plex Mono',monospace;font-size:11.5px;padding:7px 14px;border-radius:999px;cursor:pointer;
  transition:.14s}
.tbtn:hover{color:${COL.text};border-color:${COL.accent}}
.tbtn.on{color:${COL.text};border-color:${COL.accent};background:${COL.accentGlow}}

.flow-wrap{overflow-x:auto;padding-bottom:10px;margin-bottom:24px}
.flow{display:flex;align-items:stretch;gap:0;min-width:680px}

.fnode{flex:1;background:${COL.node};border:1px solid ${COL.nodeBorder};border-radius:16px;box-shadow:var(--y-shadow);
  padding:15px 13px;min-width:140px;display:flex;flex-direction:column;gap:9px}
.fnode.hi{border-color:${COL.accent};background:${COL.accentGlow}}
.fnode-lbl{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.2em;
  text-transform:uppercase;color:${COL.accent};margin-bottom:2px}
.fnode-body{display:flex;flex-direction:column;gap:7px;flex:1}

.flow-arr{display:flex;align-items:center;padding:0 3px;flex:none;opacity:.7}

.src-chip{background:${COL.panel2};border:1px solid ${COL.line};border-radius:8px;padding:7px 9px}
.src-name{font-weight:600;font-size:12.5px;color:${COL.text}}
.src-name.link{color:${COL.accent};text-decoration:none}
.src-name.link:hover{text-decoration:underline}
.src-tipo{display:block;font-family:'IBM Plex Mono',monospace;font-size:10px;
  color:${COL.faint};margin-top:3px;line-height:1.4}

.chips{display:flex;gap:5px;flex-wrap:wrap}
.chip{background:${COL.panel2};border:1px solid ${COL.line};border-radius:5px;
  font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:${COL.muted};
  padding:3px 7px;white-space:nowrap}

.cad{display:inline-block;border:1px solid;border-radius:999px;
  font-family:'IBM Plex Mono',monospace;font-size:10.5px;padding:3px 9px;margin-top:2px}
.cad.sm{font-size:12px;padding:3px 11px}

.fnode-body.pub{align-items:center}
.pub-step{font-family:'IBM Plex Mono',monospace;font-size:11.5px;color:${COL.text};
  background:${COL.panel2};border:1px solid ${COL.line};border-radius:7px;
  padding:5px 10px;text-align:center;width:100%}
.pub-arr{color:${COL.arrow};font-size:13px;line-height:1}

.detail{background:${COL.panel};border:0;border-radius:24px;box-shadow:var(--y-shadow);
  padding:18px 20px;margin-bottom:20px;animation:fade .3s ease}
@keyframes fade{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
.detail-title{font-size:16px;font-weight:700;letter-spacing:-.01em;margin-bottom:12px}

.drows{display:flex;flex-direction:column}
.drow{display:grid;grid-template-columns:130px 1fr;gap:14px;padding:10px 0;border-top:1px solid ${COL.line}}
.dk{font-family:'IBM Plex Mono',monospace;font-size:10px;text-transform:uppercase;
  letter-spacing:.1em;color:${COL.faint};padding-top:3px;line-height:1.4}
.dv{font-size:13.5px;line-height:1.55;color:${COL.muted}}

.blist{margin:0;padding-left:16px;display:flex;flex-direction:column;gap:5px}
.blist li{font-size:13px;line-height:1.55}

.global{background:${COL.panel2};border:1px solid ${COL.line};
  border-left:3px solid ${COL.nodeBorder};border-radius:12px;
  padding:15px 18px;margin-bottom:24px}
.global-lbl{font-family:'IBM Plex Mono',monospace;font-size:10px;text-transform:uppercase;
  letter-spacing:.16em;color:${COL.faint};margin-bottom:10px}

.foot{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:40px;
  padding-top:16px;border-top:1px solid ${COL.line};
  font-family:'IBM Plex Mono',monospace;font-size:11px;color:${COL.faint}}

@media(max-width:640px){
  .cab h1{font-size:26px}
  .drow{grid-template-columns:1fr}
  .dk{padding-bottom:2px}
}
`;
