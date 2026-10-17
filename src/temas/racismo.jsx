import { useEffect, useState } from "react";
import { cargarFuentes } from "../design/tokens";

/* ============================================================================
   YAMACOA · expediente "racismo-estructural" — RENDERER CONGELADO
   Represión racializada de defensores afrodescendientes en Cuba (informe CERD
   2026), con comparación histórica (EE. UU. actual · apartheid sudafricano).
   Datos en public/data/racismo.json (validado por racismo.schema.json).
   Paleta "Memoria": berenjena + ocre + ciruela + granate (sin rojo/acero,
   sin marigold/petróleo de otros temas).
   ========================================================================== */

const C = {
  bg:"transparent", panel:"#fcf9f4", panel2:"#f5efe7", line:"rgba(60,40,20,.15)",
  paper:"#1f1a16", dim:"#6b5d50", ochre:"#A35A1C", plum:"#74468A", garnet:"#9A2A3A",
};
const TOK = { ochre:C.ochre, plum:C.plum, garnet:C.garnet, paper:C.paper };
const DATA_URL = ((typeof process !== "undefined" && process.env && process.env.PUBLIC_URL) || "") + "/data/racismo.json";

const EMBEDDED = {
  "meta": {
    "tema": "racismo-estructural",
    "titulo": "El racismo que el Estado niega",
    "subtitulo": "Represión racializada de defensores afrodescendientes en Cuba — y sus ecos históricos.",
    "actualizado": "2026-06-30",
    "fuente": "Informe alternativo CERD 2026 (CRD · 4Métrica · Ciudadanía y Libertad · Cuido60 · Iniciativa AC · Museo V)"
  },
  "stats": [
    {
      "n": "57 %",
      "l": "de la población penitenciaria",
      "s": "afrodescendiente · dato testimonial",
      "color": "ochre"
    },
    {
      "n": "35 %",
      "l": "de la población del país",
      "s": "afrodescendiente · referencia censal",
      "color": "plum"
    },
    {
      "n": "×1,6",
      "l": "sobrerrepresentación penal",
      "s": "si el 57/35 se confirma",
      "color": "garnet"
    },
    {
      "n": "4",
      "l": "mecanismos de represión racializada",
      "s": "documentados en el informe",
      "color": "paper"
    }
  ],
  "comparacion": {
    "titulo": "Sobrerrepresentación de afrodescendientes/negros en la cárcel",
    "nota": "El factor compara el peso en la cárcel con el peso en la población. Funciona para minorías sobrerrepresentadas; no para una mayoría oprimida (ver Sudáfrica).",
    "items": [
      {
        "pais": "Cuba",
        "pop": 35,
        "prison": 57,
        "factor": "×1,6",
        "tier": "testimonial",
        "nota": "Testimonio en el informe CERD 2026. Cuba no publica datos raciales penales: cifra no verificable de forma independiente."
      },
      {
        "pais": "EE. UU. (actual)",
        "pop": 13,
        "prison": 37,
        "factor": "×2,8",
        "tier": "documentado",
        "nota": "BJS / Sentencing Project / Prison Policy. Los negros son encarcelados ~5× la tasa de los blancos."
      }
    ],
    "sudafrica": {
      "titulo": "¿Y el apartheid? El número engaña",
      "d": "En la Sudáfrica del apartheid los negros eran ~79 % de la población: una mayoría oprimida por una minoría. El factor de sobrerrepresentación daría ≈1 pese a la brutalidad del sistema. Por eso, con Sudáfrica la comparación honesta no es el número, sino el mecanismo de control del movimiento.",
      "passArrests": "17 millones",
      "periodo": "1921–1986",
      "pico": "~250.000 detenciones/año en los años 50"
    }
  },
  "mecanismos": [
    {
      "id": 1,
      "t": "Restricción del movimiento",
      "d": "La llamada «regulación migratoria»: el Estado declara «regulada» a la persona y le impide salir del país, sin recurso legal ni respuesta administrativa. Aísla a los defensores del escrutinio internacional.",
      "eco": "Pass laws del apartheid",
      "ecoD": "Sudáfrica obligaba a la población negra a portar el «dompas» para circular; su violación produjo más de 17 millones de detenciones (1921–1986), con cerca de 250.000 al año en los años 50, y desató la masacre de Sharpeville en 1960.",
      "cerd": "Art. 5(d)"
    },
    {
      "id": 2,
      "t": "Criminalización discursiva",
      "d": "El Estado niega que exista racismo —sostiene que «se fue con la burguesía»— y tacha al activismo antirracista de «mercenario» o «contrarrevolucionario», con campañas de difamación digital.",
      "eco": "Propaganda Jim Crow / «superpredador»",
      "ecoD": "Recodificar la disidencia racial como criminalidad o deslealtad es viejo: de la prensa segregacionista estadounidense al mito del «superpredador» de los años 90, que criminalizó a una generación de jóvenes negros.",
      "cerd": "Art. 4"
    },
    {
      "id": 3,
      "t": "Castigo diferenciado por perfil racial",
      "d": "La dureza de la represión escala con el perfil racial e interseccional. Un testimonio describe «tres horas de castigo para un afrodescendiente frente a dos para un activista blanco».",
      "eco": "Sentencia racializada (EE. UU.)",
      "ecoD": "En EE. UU., a igualdad de población, los negros son encarcelados unas 5 veces más que los blancos: el mismo principio de un castigo escalado por raza, medido a escala nacional.",
      "cerd": "Art. 5"
    },
    {
      "id": 4,
      "t": "Extensión a la familia y la comunidad",
      "d": "El castigo se desborda hacia hijas, vecinos y redes de apoyo: asedio policial, represalias económicas, violencia vicaria contra las madres de presos políticos.",
      "eco": "Castigo colectivo",
      "ecoD": "La represalia sobre el entorno —el empleo, los beneficios sociales, la libertad de los hijos— como herramienta para romper el tejido comunitario y disuadir por contagio.",
      "cerd": "Art. 6 y 7"
    }
  ],
  "casos": [
    {
      "n": "Diubis Laurencio Tejeda",
      "d": "Joven afrodescendiente, muerto a manos de fuerzas estatales durante las protestas del 11 de julio de 2021.",
      "tag": "asesinado"
    },
    {
      "n": "Duannis Dabel León Taboada",
      "d": "Sentenciado a 14 años por sedición. Su madre, Yeni Taboada, sufre represión vicaria: asedio, amenazas y agresiones a sus hijas.",
      "tag": "14 años"
    }
  ],
  "testimonios": [
    {
      "quien": "Marthadela Tamayo",
      "rol": "Comité Ciudadano por la Integración Racial",
      "p": "Documenta la «regulación migratoria» y la vigilancia constante; refuta el relato oficial: el racismo no se fue con la burguesía, Cuba sigue siéndolo."
    },
    {
      "quien": "Osvaldo Navarro",
      "rol": "CIR · Di.Verso",
      "p": "«Regulado» desde 2019, sin poder viajar ni sostener vínculos internacionales; aporta el dato de sobrerrepresentación penal afrodescendiente."
    },
    {
      "quien": "Manuel Cuesta Morúa",
      "rol": "activista antirracista",
      "p": "Señala la duración racializada del castigo y cómo el totalitarismo patriarcal golpea con más fuerza el activismo basado en identidades."
    },
    {
      "quien": "Yeni Taboada",
      "rol": "madre de preso político",
      "p": "Relata casa sitiada por patrullas, amenazas de muerte, agresiones a sus hijas y trato marginalizante por raza y clase."
    },
    {
      "quien": "Aymara Nieto",
      "rol": "UNPACU · Damas de Blanco",
      "p": "Tras 7 años presa, describe maltrato físico, traslado encadenada a Las Tunas y dos años sin ver a su familia."
    },
    {
      "quien": "Eliezet Sesma",
      "rol": "preso político",
      "p": "Detalla un régimen de máxima severidad y un ciclo de humillación intracarcelaria ligado a su origen y a la pobreza."
    }
  ],
  "cerd": [
    {
      "art": "Art. 2",
      "d": "Eliminar la discriminación racial y sancionar las prácticas discriminatorias."
    },
    {
      "art": "Art. 4",
      "d": "Prohibir la propaganda y la incitación a la discriminación racial."
    },
    {
      "art": "Art. 5",
      "d": "Igualdad ante la ley: seguridad, libre circulación, participación pública, acceso a la justicia."
    },
    {
      "art": "Art. 6",
      "d": "Protección y recursos efectivos ante los tribunales frente a la discriminación."
    },
    {
      "art": "Art. 7",
      "d": "Participación sin discriminación en la vida política, social, económica y cultural."
    }
  ],
  "interseccional": "Según el informe, más del 50 % de las mujeres negras y mestizas son víctimas de violencia de género — donde el racismo y el sexismo se refuerzan."
};

function Stat({ n, l, s, a }) {
  return (<div className="rc-stat"><div className="rc-stat-n" style={{ color:a||C.paper }}>{n}</div>
    <div className="rc-stat-l">{l}</div><div className="rc-stat-s">{s}</div></div>);
}
function SecHead({ n, t, d }) {
  return (<div className="rc-sec-head"><span className="rc-sec-num">{n}</span><h2>{t}</h2><p>{d}</p></div>);
}

/* barras comparadas pop vs cárcel */
function CompBar({ item }) {
  const sc = (v) => (v / 60) * 100;
  return (
    <div className="rc-comp-row">
      <div className="rc-comp-head">
        <b>{item.pais}</b>
        <span className={"rc-tier rc-tier-" + item.tier}>{item.tier}</span>
        <span className="rc-factor">{item.factor}</span>
      </div>
      <div className="rc-comp-bars">
        <div className="rc-cb">
          <span className="rc-cb-lab">población</span>
          <span className="rc-cb-track"><span className="rc-cb-fill" style={{ width: sc(item.pop) + "%", background: C.plum }} /></span>
          <span className="rc-cb-n">{item.pop}%</span>
        </div>
        <div className="rc-cb">
          <span className="rc-cb-lab">cárcel</span>
          <span className="rc-cb-track"><span className="rc-cb-fill" style={{ width: sc(item.prison) + "%", background: C.ochre }} /></span>
          <span className="rc-cb-n">{item.prison}%</span>
        </div>
      </div>
      <p className="rc-comp-note">{item.nota}</p>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(EMBEDDED);
  const [mec, setMec] = useState(1);
  const [metodo, setMetodo] = useState(false);

  useEffect(() => {
    cargarFuentes();
    let live = true;
    fetch(DATA_URL).then((r) => (r.ok ? r.json() : null)).then((j) => { if (live && j) setData(j); }).catch(() => {});
    return () => { live = false; };
  }, []);

  const M = data.mecanismos.find((m) => m.id === mec) || data.mecanismos[0];
  const sa = data.comparacion.sudafrica;

  return (
    <div className="rc">
      <style>{CSS}</style>

      <header className="rc-hero">
        <div className="rc-hero-grid" aria-hidden="true" />
        <p className="rc-eyebrow">Informe alternativo · CERD · 2026</p>
        <h1 className="rc-title">El racismo que el Estado <span>niega</span></h1>
        <p className="rc-lede">{data.meta.subtitulo} El Estado cubano sostiene que la Revolución acabó con el racismo;
          los testimonios de defensores afrodescendientes documentan lo contrario — y un patrón que tiene ecos en otras geografías del castigo racial.</p>
        <div className="rc-strip">
          {data.stats.map((st, i) => <Stat key={i} n={st.n} l={st.l} s={st.s} a={TOK[st.color]} />)}
        </div>
        <p className="rc-src">Fuente: {data.meta.fuente}</p>
      </header>

      <main className="rc-main">
        <section className="rc-note">
          <p>El dato ancla —57 % de la población penitenciaria afrodescendiente frente al 35 % del país— procede de
            un <b>testimonio</b> recogido en un informe de incidencia, no de una estadística penal oficial: Cuba no
            publica datos raciales de su sistema penal. Se presenta etiquetado y no se propaga como cifra verificada.
            Las comparaciones con otros países son <b>ilustrativas del mecanismo</b>, no equivalencias exactas entre épocas.</p>
          <button className="rc-disc" onClick={() => setMetodo((v) => !v)} aria-expanded={metodo}>
            {metodo ? "− Ocultar" : "+ Ver"} método y procedencia
          </button>
          {metodo && (
            <ul className="rc-disc-body">
              <li><b>Testimonios:</b> entrevistas de octubre de 2025, parafraseadas; se evita la cita textual extensa.</li>
              <li><b>57 / 35:</b> testimonio (Osvaldo Navarro) en el informe CERD 2026; sin verificación independiente posible.</li>
              <li><b>EE. UU.:</b> Bureau of Justice Statistics, The Sentencing Project, Prison Policy Initiative.</li>
              <li><b>Sudáfrica:</b> arrestos por pass laws según Britannica / HRW / South African History Online.</li>
              <li>El factor de sobrerrepresentación solo es comparable entre minorías; con una mayoría oprimida no aplica.</li>
            </ul>
          )}
        </section>

        {/* 01 — COMPARACIÓN */}
        <section className="rc-sec">
          <SecHead n="01" t="La desproporción, en contexto" d={data.comparacion.nota} />
          <div className="rc-card">
            <div className="rc-legend">
              <span><i style={{ background: C.plum }} /> peso en la población</span>
              <span><i style={{ background: C.ochre }} /> peso en la cárcel</span>
            </div>
            {data.comparacion.items.map((it) => <CompBar key={it.pais} item={it} />)}
            <div className="rc-sa">
              <h4>{sa.titulo}</h4>
              <p>{sa.d}</p>
              <div className="rc-sa-stats">
                <div><b>{sa.passArrests}</b><span>detenciones por pass laws</span></div>
                <div><b>{sa.periodo}</b><span>periodo</span></div>
                <div><b>{sa.pico}</b><span>en el pico</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* 02 — WORKFLOW de mecanismos */}
        <section className="rc-sec">
          <SecHead n="02" t="La maquinaria, paso a paso" d="Cuatro mecanismos de represión racializada. Toca cada uno para ver su detalle y su eco histórico." />
          <div className="rc-card">
            <div className="rc-flow">
              {data.mecanismos.map((m, i) => (
                <div key={m.id} className="rc-flow-item">
                  <button className={"rc-node" + (mec === m.id ? " on" : "")} onClick={() => setMec(m.id)}>
                    <span className="rc-node-n">0{m.id}</span>
                    <span className="rc-node-t">{m.t}</span>
                  </button>
                  {i < data.mecanismos.length - 1 && <span className="rc-arrow" aria-hidden="true">→</span>}
                </div>
              ))}
            </div>

            <div className="rc-detail">
              <div className="rc-detail-main">
                <span className="rc-detail-cerd">{M.cerd}</span>
                <h3>0{M.id} · {M.t}</h3>
                <p>{M.d}</p>
              </div>
              <div className="rc-detail-eco">
                <span className="rc-eco-tag">Eco histórico</span>
                <h4>{M.eco}</h4>
                <p>{M.ecoD}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 03 — CASOS */}
        <section className="rc-sec">
          <SecHead n="03" t="Dos rostros" d="La represión racializada no es abstracta." />
          <div className="rc-cases">
            {data.casos.map((c) => (
              <div key={c.n} className="rc-case">
                <span className="rc-case-tag">{c.tag}</span>
                <h3>{c.n}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
          <p className="rc-inter">{data.interseccional}</p>
        </section>

        {/* 04 — TESTIMONIOS */}
        <section className="rc-sec">
          <SecHead n="04" t="Las voces" d="Seis defensores afrodescendientes. Testimonios parafraseados del informe." />
          <div className="rc-test">
            {data.testimonios.map((t) => (
              <div key={t.quien} className="rc-test-item">
                <div className="rc-test-who"><b>{t.quien}</b><span>{t.rol}</span></div>
                <p>{t.p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 05 — CERD */}
        <section className="rc-sec">
          <SecHead n="05" t="Lo que incumple Cuba" d="Artículos de la Convención Internacional sobre la Eliminación de la Discriminación Racial vulnerados." />
          <div className="rc-cerd">
            {data.cerd.map((a) => (
              <div key={a.art} className="rc-cerd-item"><b>{a.art}</b><span>{a.d}</span></div>
            ))}
          </div>
          <blockquote className="rc-quote">
            La represión contra los defensores afrodescendientes no es una desviación, sino una manifestación
            sistemática de discriminación racial estructural — negada por el mismo Estado que la ejerce.
          </blockquote>
        </section>

        <footer className="rc-foot">
          <p>Fuente primaria: {data.meta.fuente}. Comparaciones: BJS / Sentencing Project / Prison Policy (EE. UU.); Britannica / HRW / SAHO (Sudáfrica).</p>
          <p>Documento de procedencia mixta: el dato penal cubano es testimonial y se etiqueta como tal; las comparaciones internacionales ilustran el mecanismo, no equivalen entre épocas. Los testimonios se parafrasean.</p>
        </footer>
      </main>
    </div>
  );
}

const CSS = `
.rc{ --bg:transparent; --panel:#fcf9f4; --panel2:#f5efe7; --paper:#1f1a16; --dim:#6b5d50;
  --ochre:#A35A1C; --plum:#74468A; --garnet:#9A2A3A; --line:rgba(60,40,20,.15);
  --sh:var(--y-shadow,0 1px 2px rgba(40,25,10,.04),0 10px 30px rgba(40,25,10,.055));
  background:transparent; color:var(--paper); min-height:100vh;
  font-family:'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif; -webkit-font-smoothing:antialiased; }
.rc *{ box-sizing:border-box; }
.rc-hero{ position:relative; overflow:hidden; max-width:1000px; margin:0 auto; padding:88px 24px 40px; border-bottom:1px solid var(--line); }
.rc-hero-grid{ position:absolute; inset:0; z-index:0; opacity:.5; pointer-events:none;
  background-image:linear-gradient(rgba(60,40,20,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(60,40,20,.06) 1px,transparent 1px);
  background-size:40px 40px; -webkit-mask-image:radial-gradient(75% 60% at 26% 0%,#000 30%,transparent 78%); mask-image:radial-gradient(75% 60% at 26% 0%,#000 30%,transparent 78%); }
.rc-hero>*{ position:relative; z-index:1; }
.rc-eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; letter-spacing:.26em; text-transform:uppercase; color:var(--ochre); margin:0 0 20px; display:flex; align-items:center; gap:12px; }
.rc-eyebrow::before{ content:""; width:26px; height:2px; background:var(--ochre); }
.rc-title{ font-family:'Manrope'; font-weight:800; letter-spacing:-.02em; font-size:clamp(34px,6vw,62px); line-height:1.03; margin:0; }
.rc-title span{ color:var(--garnet); }
.rc-lede{ max-width:680px; margin:24px 0 0; font-size:clamp(15px,2vw,18px); line-height:1.6; color:#4a3f36; }
.rc-strip{ margin:38px 0 0; display:grid; gap:14px; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); }
.rc-stat{ border:0; border-radius:20px; padding:16px 18px; background:var(--panel); box-shadow:var(--sh); }
.rc-stat-n{ font-family:'Manrope'; font-weight:800; font-size:30px; line-height:1; }
.rc-stat-l{ font-size:13px; margin-top:8px; font-weight:600; }
.rc-stat-s{ font-family:'IBM Plex Mono',monospace; font-size:10px; color:var(--dim); margin-top:3px; }
.rc-src{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--dim); margin:30px 0 0; }
.rc-main{ max-width:1000px; margin:0 auto; padding:0 24px 80px; }
.rc-note{ margin:40px 0 8px; padding:22px 24px; border-radius:24px; background:linear-gradient(180deg,rgba(116,70,138,.12),rgba(116,70,138,.03)); border:1px solid rgba(116,70,138,.28); }
.rc-note p{ margin:0; font-size:14.5px; line-height:1.62; color:#4a3f36; }
.rc-note b{ color:var(--paper); }
.rc-disc{ margin-top:14px; background:none; border:1px solid var(--line); color:var(--dim); font-family:'IBM Plex Mono',monospace; font-size:11.5px; padding:7px 13px; border-radius:999px; cursor:pointer; }
.rc-disc:hover{ color:var(--paper); border-color:var(--plum); }
.rc-disc-body{ margin:14px 0 0; padding-left:18px; }
.rc-disc-body li{ font-size:13px; line-height:1.6; color:var(--dim); margin-bottom:6px; }
.rc-disc-body b{ color:var(--paper); }
.rc-sec{ margin-top:56px; }
.rc-sec-head{ margin-bottom:20px; }
.rc-sec-num{ font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--ochre); letter-spacing:.1em; }
.rc-sec-head h2{ font-family:'Manrope'; font-weight:700; font-size:clamp(22px,3.4vw,30px); margin:6px 0 0; letter-spacing:-.01em; }
.rc-sec-head p{ margin:8px 0 0; font-size:14.5px; color:var(--dim); max-width:660px; line-height:1.55; }
.rc-card{ background:var(--panel); border:0; border-radius:24px; box-shadow:var(--sh); padding:22px; }

.rc-legend{ display:flex; gap:18px; flex-wrap:wrap; margin-bottom:18px; }
.rc-legend span{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--dim); display:flex; align-items:center; gap:7px; }
.rc-legend i{ width:11px; height:11px; border-radius:3px; }
.rc-comp-row{ padding:16px 0; border-top:1px solid var(--line); }
.rc-comp-row:first-of-type{ border-top:none; }
.rc-comp-head{ display:flex; align-items:center; gap:10px; margin-bottom:12px; }
.rc-comp-head b{ font-family:'Manrope'; font-size:16px; }
.rc-tier{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; text-transform:uppercase; letter-spacing:.08em; padding:2px 7px; border-radius:999px; }
.rc-tier-testimonial{ color:var(--garnet); border:1px solid var(--garnet); }
.rc-tier-documentado{ color:var(--plum); border:1px solid var(--plum); }
.rc-factor{ margin-left:auto; font-family:'Manrope'; font-weight:800; font-size:20px; color:var(--ochre); }
.rc-comp-bars{ display:flex; flex-direction:column; gap:7px; }
.rc-cb{ display:grid; grid-template-columns:72px 1fr 40px; gap:10px; align-items:center; }
.rc-cb-lab{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:var(--dim); text-align:right; }
.rc-cb-track{ height:14px; background:#f5efe7; border-radius:7px; overflow:hidden; }
.rc-cb-fill{ display:block; height:100%; border-radius:7px; }
.rc-cb-n{ font-family:'IBM Plex Mono',monospace; font-size:12px; }
.rc-comp-note{ font-size:12px; color:var(--dim); line-height:1.5; margin:10px 0 0; }
.rc-sa{ margin-top:18px; padding:18px 20px; border-radius:16px; background:rgba(154,42,58,.08); border:1px solid rgba(154,42,58,.3); }
.rc-sa h4{ font-family:'Manrope'; font-size:15px; margin:0 0 8px; color:var(--paper); }
.rc-sa p{ font-size:13.5px; line-height:1.6; color:#4a3f36; margin:0; }
.rc-sa-stats{ display:flex; gap:24px; flex-wrap:wrap; margin-top:14px; }
.rc-sa-stats b{ font-family:'Manrope'; font-weight:800; font-size:20px; color:var(--garnet); display:block; }
.rc-sa-stats span{ font-family:'IBM Plex Mono',monospace; font-size:10px; color:var(--dim); }

.rc-flow{ display:flex; align-items:stretch; gap:6px; flex-wrap:wrap; margin-bottom:22px; }
.rc-flow-item{ display:flex; align-items:center; gap:6px; flex:1 1 180px; }
.rc-node{ flex:1; text-align:left; background:var(--panel2); border:1px solid var(--line); border-radius:12px; padding:14px; cursor:pointer; min-height:78px; display:flex; flex-direction:column; gap:6px; }
.rc-node.on{ border-color:var(--ochre); background:rgba(163,90,28,.10); }
.rc-node-n{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:var(--ochre); }
.rc-node-t{ font-family:'Manrope'; font-weight:600; font-size:13.5px; line-height:1.25; }
.rc-arrow{ color:var(--dim); font-size:16px; }
@media(max-width:680px){ .rc-arrow{ display:none; } }
.rc-detail{ display:grid; grid-template-columns:1.3fr 1fr; gap:18px; }
@media(max-width:680px){ .rc-detail{ grid-template-columns:1fr; } }
.rc-detail-main{ position:relative; }
.rc-detail-cerd{ position:absolute; top:0; right:0; font-family:'IBM Plex Mono',monospace; font-size:10px; color:var(--ochre); border:1px solid var(--line); border-radius:999px; padding:3px 9px; }
.rc-detail-main h3{ font-family:'Manrope'; font-weight:700; font-size:18px; margin:0 0 10px; padding-right:80px; }
.rc-detail-main p{ font-size:14px; line-height:1.6; color:#4a3f36; margin:0; }
.rc-detail-eco{ background:var(--panel2); border:1px solid var(--line); border-left:3px solid var(--plum); border-radius:16px; padding:16px 18px; }
.rc-eco-tag{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; text-transform:uppercase; letter-spacing:.1em; color:var(--plum); }
.rc-detail-eco h4{ font-family:'Manrope'; font-weight:700; font-size:15px; margin:6px 0 8px; }
.rc-detail-eco p{ font-size:13px; line-height:1.58; color:var(--dim); margin:0; }

.rc-cases{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
@media(max-width:600px){ .rc-cases{ grid-template-columns:1fr; } }
.rc-case{ background:var(--panel); border:0; border-radius:24px; box-shadow:var(--sh); padding:20px; position:relative; }
.rc-case-tag{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; text-transform:uppercase; letter-spacing:.08em; color:var(--garnet); border:1px solid var(--garnet); border-radius:999px; padding:2px 9px; }
.rc-case h3{ font-family:'Manrope'; font-weight:700; font-size:16px; margin:12px 0 8px; }
.rc-case p{ font-size:13.5px; line-height:1.55; color:var(--dim); margin:0; }
.rc-inter{ margin:18px 0 0; padding:16px 18px; border-radius:16px; background:rgba(116,70,138,.08); border:1px solid var(--line); font-size:13.5px; line-height:1.6; color:#4a3f36; }

.rc-test{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
@media(max-width:680px){ .rc-test{ grid-template-columns:1fr; } }
.rc-test-item{ background:var(--panel); border:0; border-radius:24px; box-shadow:var(--sh); padding:18px; }
.rc-test-who{ display:flex; flex-direction:column; margin-bottom:8px; }
.rc-test-who b{ font-family:'Manrope'; font-size:15px; }
.rc-test-who span{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:var(--ochre); }
.rc-test-item p{ font-size:13.5px; line-height:1.58; color:var(--dim); margin:0; }

.rc-cerd{ display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:12px; }
.rc-cerd-item{ border:0; border-radius:20px; box-shadow:var(--sh); padding:14px 16px; background:var(--panel); }
.rc-cerd-item b{ font-family:'Manrope'; font-weight:800; font-size:15px; color:var(--ochre); display:block; margin-bottom:6px; }
.rc-cerd-item span{ font-size:12.5px; line-height:1.5; color:var(--dim); }
.rc-quote{ margin:22px 0 0; padding:24px 26px; border-left:3px solid var(--garnet); background:rgba(154,42,58,.07); border-radius:0 16px 16px 0; font-family:'Manrope',system-ui,sans-serif; font-style:italic; font-weight:500; font-size:clamp(15px,2.2vw,19px); line-height:1.55; color:var(--paper); }
.rc-foot{ margin-top:64px; padding-top:24px; border-top:1px solid var(--line); display:grid; gap:12px; }
.rc-foot p{ margin:0; font-size:12.5px; line-height:1.6; color:var(--dim); }
@media(prefers-reduced-motion:no-preference){ .rc-disc,.rc-node,.rc-cb-fill{ transition:all .18s ease; } }
`;
