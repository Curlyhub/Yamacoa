import React, { useState, useEffect, useMemo } from "react";
import {
  RadialBarChart, RadialBar, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer,
} from "recharts";

/* ───────────────────────── paleta (de la bandera + la partitura) ───────── */
const COL = {
  bg: "#0A0E1A", panel: "#111A2E", panel2: "#0E1626",
  azul: "#3D6FE5", azulDeep: "#23408F",
  punzo: "#D8392B", punzoSoft: "#B33124",
  oro: "#E6B450",            // la estrella / el pergamino de la BNF
  steel: "#6E7E96",
  text: "#EAEEF6", muted: "#94A1B7", faint: "#5E6B82",
  line: "rgba(255,255,255,.07)",
};
const TONE = {
  origen: COL.steel, simbolo: COL.azul, pico: COL.punzo,
  caida: COL.punzoSoft, cierre: COL.oro,
};

/* ───────────────────────── dataset embebido (respaldo) ─────────────────── */
const EMBEDDED = {
  meta: { titulo: "Himno Patriótico Cubano", subtitulo: "El himno de Narciso López · 1850" },
  ficha: {
    anio: "1850", tipo: "Marcha patriótica",
    musica: "Narciso López Frías — hijo del General Narciso López de Urriola",
    letra: "José María Heredia y otros poetas populares (tres estrofas del «Himno del desterrado», 1825). Algunas fuentes atribuyen versos a Plácido Gener.",
    documento: "Partitura impresa, 1898 — Gallica / Bibliothèque nationale de France (dominio público)",
    estatus: "Pieza histórica. Enrique Gay-Calbó (1945) la consideró un antecedente del Himno Nacional.",
    partituraUrl: "https://gallica.bnf.fr/ark:/12148/bpt6k855033c/f1.double",
    videoUrl: "https://www.youtube.com/watch?v=TwVwz3PV9tU",
  },
  intro: "En mayo de 1850, mientras la bandera de la estrella solitaria se izaba por primera vez en suelo cubano, circulaba con las expediciones de Narciso López una marcha de guerra. No es el Himno Nacional —ese llegaría en 1868 con La Bayamesa— pero es uno de sus antecedentes: el primer canto patriótico ligado a los símbolos que hoy identifican a Cuba.",
  versoDestacado: {
    texto: "Ya en las playas de Cuba tremola\nLa bandera del azul y el punzó\nCon la estrella…",
    nota: "Verso de una versión que circuló (atribuida a Plácido Gener); no figura en la partitura de la BNF. El texto documentado y completo está en la pestaña «El Himno».",
  },
  timeline: [
    { anio: "1825", fecha: "Septiembre", hito: "Heredia escribe el «Himno del desterrado»", detalle: "Desde el exilio, el santiaguero José María Heredia escribe el poema del que más tarde se tomarán tres estrofas para la marcha.", tono: "origen" },
    { anio: "1849", fecha: "", hito: "Se diseña la bandera de la estrella solitaria", detalle: "Miguel Teurbe Tolón la diseña a partir de una idea de Narciso López; Emilia Teurbe Tolón la cose a mano por primera vez.", tono: "simbolo" },
    { anio: "1850", fecha: "19 de mayo", hito: "Desembarco en Cárdenas", detalle: "López desembarca con unos 600 hombres del vapor Creole e iza por primera vez «la bandera del azul y el punzó». La marcha circula como canto de la expedición.", tono: "pico" },
    { anio: "1851", fecha: "1 de septiembre", hito: "Ejecución de Narciso López", detalle: "Tras una última expedición fallida es capturado y ejecutado a garrote vil en La Habana, acusado de alta traición.", tono: "caida" },
    { anio: "1868", fecha: "20 de octubre", hito: "Nace La Bayamesa", detalle: "Perucho Figueredo da a conocer el futuro Himno Nacional en la toma de Bayamo.", tono: "origen" },
    { anio: "1869", fecha: "11 de abril", hito: "Guáimaro adopta la bandera", detalle: "La Asamblea Constituyente adopta como emblema nacional la bandera de López.", tono: "simbolo" },
    { anio: "1945", fecha: "", hito: "Reconocida como antecedente", detalle: "El historiador Enrique Gay-Calbó cataloga la marcha de 1850 entre los antecedentes del himno nacional.", tono: "cierre" },
  ],
  letra: {
    nota: "El escaneo de la partitura original (BNF / Gallica, imp. Paul Dupont) confirma el texto: letra de Heredia y otros, música de Narciso López y Frías. Aquí va completo, junto a su raíz literaria.",
    noEs: "No es «La Bayamesa» (1868, Perucho Figueredo), que es el Himno Nacional —pieza posterior y distinta—. Esta marcha es uno de sus antecedentes.",
    completo: {
      titulo: "Himno Patriótico Cubano",
      atrib: "Letra de Heredia y otros poetas populares · Música de Narciso López y Frías",
      fuente: "Partitura impresa (París, Imp. Paul Dupont). Bibliothèque nationale de France — Gallica. Dominio público.",
      movimientos: [
        { n: "I", bloques: [
          { rol: "Coro de hombres", versos: ["Ya retumba el cañón en la sierra,", "Ya nos llama el clarín á lidiar;", "Entonemos el canto de guerra", "Y corramos la Patria á salvar.", "¡Guerra! ¡guerra! repite en el valle", "Atronando la voz del cañón;", "¡Libertad! ya tus hijos levantan", "De la estrella de Cuba el pendón."] },
          { rol: "Estrofa · Dúo", versos: ["¡Á las armas, cubanos, nos llama", "El clamor de la Patria infelice,", "El honor del deber, que nos dice:", "¡Por la Patria vencer ó morir!", "Tras de siglos y siglos de yugo", "En que gime la triste aherrojada,", "Luce al fin la brillante alborada", "Precursora de un gran porvenir."] },
          { rol: "Coro de mujeres", versos: ["¡Cuba! al fin te verás libre y pura", "Como el aire, la luz que respiras,", "Cual las ondas hirvientes que miras", "De tus playas la arena besar."] },
          { rol: "Todos", versos: ["Aunque viles traidores le sirvan,", "Del tirano es inútil la saña,", "Que no en vano entre Cuba y España", "Tiende inmenso sus olas el mar."] },
        ] },
        { n: "II", bloques: [
          { rol: "Coro de hombres · Estrofa (Dúo)", versos: ["Cuando brille la aurora bendita", "Victoriosa en el cielo cubano,", "Y sucumba de España el tirano", "Á los golpes del hierro fatal;", "Coronada de palmas y flores,", "Con asombro del godo insolente", "Alzará Cuba Libre la frente", "Á los rayos del sol tropical."] },
        ], refran: "Se repiten el Coro de mujeres y el Todos." },
        { n: "III", bloques: [
          { rol: "Coro de hombres · Estrofa (Dúo)", versos: ["Al poder el aliento se oponga,", "Y á la muerte contraste la muerte:", "La constancia encadena la suerte;", "Siempre vence quien sabe morir.", "Enlacemos un nombre glorioso", "De los siglos al rápido vuelo:", "Elevemos los ojos al cielo,", "Y á los años que están por venir."] },
        ], refran: "Se repiten el Coro de mujeres y el Todos." },
        { n: "IV", bloques: [
          { rol: "Coro de hombres · Estrofa (Dúo)", versos: ["Vale más á la espada enemiga", "Presentar el impávido pecho,", "Que yacer de dolor en un lecho,", "Y mil muertes muriendo sufrir.", "Que la gloria en las lides anima", "El ardor del patriota constante,", "Y circunda con halo brillante", "De su muerte el momento feliz."] },
        ], refran: "Se repiten el Coro de mujeres y el Todos." },
      ],
    },
    otraVersion: {
      titulo: "Otra versión que circuló",
      atrib: "Fragmento atribuido a Plácido Gener (recogido por La Jiribilla). No figura en la partitura de la BNF.",
      versos: ["Ya en las playas de Cuba tremola", "la bandera del azul y el punzó", "con la estrella…"],
    },
    raiz: {
      titulo: "La raíz literaria",
      atrib: "José María Heredia, «Himno del desterrado» (septiembre de 1825). Tres de sus estrofas se adaptaron a la marcha de López (Gay-Calbó, 1945).",
      fragmentos: [
        { sub: "Apertura", versos: ["Reina el sol, y las olas serenas", "corta en torno la prora triunfante,", "y hondo rastro de espuma brillante", "va dejando la nave en el mar."] },
        { sub: "El giro combativo", versos: ["Aun habrá corazones en Cuba", "que me envidien de mártir la suerte,", "y prefieran espléndida muerte", "a su amargo, azaroso vivir."] },
      ],
    },
  },
  encuesta: {
    intro: "Sin respuestas correctas: es tu opinión. Los resultados se guardan en tu dispositivo.",
    preguntas: [
      { id: "conocia", texto: "¿Conocías la existencia de este himno antes de hoy?", opciones: [
        { id: "si", label: "Sí, lo conocía", seed: 14 }, { id: "oido", label: "Había oído de él", seed: 22 }, { id: "no", label: "No, es nuevo para mí", seed: 61 }] },
      { id: "reconocimiento", texto: "¿Merece más reconocimiento dentro de la memoria de los símbolos patrios?", opciones: [
        { id: "si", label: "Sí, claramente", seed: 58 }, { id: "parte", label: "En parte", seed: 31 }, { id: "no", label: "No especialmente", seed: 9 }] },
      { id: "lopez", texto: "Narciso López une el impulso independentista con el anexionismo. ¿Cómo lo valoras?", opciones: [
        { id: "simbolos", label: "Pesa más su aporte a los símbolos", seed: 37 }, { id: "anexion", label: "Pesa más su anexionismo", seed: 24 }, { id: "ambivalente", label: "Es una figura ambivalente", seed: 49 }] },
      { id: "heredia", texto: "¿Qué te parece que la letra provenga en buena medida de Heredia?", opciones: [
        { id: "valor", label: "Le da más valor literario", seed: 52 }, { id: "igual", label: "No cambia mucho", seed: 18 }, { id: "nuevo", label: "No lo sabía", seed: 40 }] },
    ],
  },
  evaluacion: {
    intro: "Siete preguntas sobre lo que acabas de leer. Al terminar verás tu puntaje y tu desglose por área.",
    categorias: ["Cronología", "Autoría", "Símbolos", "Contexto"],
    preguntas: [
      { id: "q1", cat: "Cronología", texto: "¿En qué año se sitúa esta marcha patriótica?", opciones: ["1825", "1850", "1868", "1898"], correcta: 1, exp: "Circula en 1850, con las expediciones de Narciso López." },
      { id: "q2", cat: "Autoría", texto: "¿Quién compuso la música?", opciones: ["Perucho Figueredo", "Narciso López Frías", "José María Heredia", "José White"], correcta: 1, exp: "Narciso López Frías, hijo del General, musicalizó la pieza." },
      { id: "q3", cat: "Autoría", texto: "La letra toma estrofas de un poema de…", opciones: ["Plácido Gener, en exclusiva", "José María Heredia («Himno del desterrado»)", "Miguel Teurbe Tolón", "Cirilo Villaverde"], correcta: 1, exp: "Tres estrofas provienen del «Himno del desterrado» de Heredia (1825)." },
      { id: "q4", cat: "Símbolos", texto: "¿Quién diseñó la bandera, a partir de una idea de López?", opciones: ["Emilia Teurbe Tolón", "Miguel Teurbe Tolón", "Carlos M. de Céspedes", "Narciso López en persona"], correcta: 1, exp: "Miguel Teurbe Tolón la diseñó; Emilia, su esposa, la cosió." },
      { id: "q5", cat: "Símbolos", texto: "¿Dónde se izó por primera vez «la bandera del azul y el punzó»?", opciones: ["Bayamo", "Cárdenas, Matanzas", "Guáimaro", "La Habana"], correcta: 1, exp: "El 19 de mayo de 1850, en el desembarco de Cárdenas." },
      { id: "q6", cat: "Contexto", texto: "¿Cuál fue el destino de Narciso López en 1851?", opciones: ["Murió en combate en Cárdenas", "Ejecutado a garrote vil en La Habana", "Exiliado de por vida en EE.UU.", "Capturado y luego liberado"], correcta: 1, exp: "Fue ejecutado a garrote vil en La Habana el 1 de septiembre de 1851." },
      { id: "q7", cat: "Contexto", texto: "El historiador Gay-Calbó (1945) consideró esta marcha como…", opciones: ["El himno nacional oficial", "Un antecedente del Himno Nacional", "Una canción española", "Una obra perdida"], correcta: 1, exp: "La situó entre los antecedentes del himno nacional cubano." },
    ],
    veredictos: [
      { min: 0, max: 39, titulo: "Primer contacto", texto: "Acabas de conocer la pieza. Vuelve a la Historia y al Himno y reintenta." },
      { min: 40, max: 69, titulo: "Vas tomando el hilo", texto: "Tienes la cronología; afina la autoría y el contexto." },
      { min: 70, max: 99, titulo: "Buen dominio", texto: "Manejas la historia del himno con soltura." },
      { min: 100, max: 100, titulo: "Partitura completa", texto: "Dominas la historia del himno de punta a cabo." },
    ],
  },
};

/* ───────────────────────── persistencia (best-effort, no rompe artifact) ── */
const LS = (() => {
  const can = (() => { try { const k = "__y"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return true; } catch { return false; } })();
  return {
    get(k, f) { if (!can) return f; try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } },
    set(k, v) { if (!can) return; try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
})();

/* ───────────────────────── estrella SVG (firma) ────────────────────────── */
function Star({ s = 22, fill = COL.oro, stroke = "none", style, rot = -Math.PI / 2 }) {
  const pts = []; const cx = s / 2, cy = s / 2, R = s / 2, r = R * 0.42;
  for (let i = 0; i < 10; i++) { const ang = (Math.PI / 5) * i + rot; const rad = i % 2 ? r : R; pts.push(`${cx + rad * Math.cos(ang)},${cy + rad * Math.sin(ang)}`); }
  return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={style}><polygon points={pts.join(" ")} fill={fill} stroke={stroke} strokeWidth="1" /></svg>;
}

/* ───────────────────────── componente ──────────────────────────────────── */
export default function App() {
  const [data, setData] = useState(EMBEDDED);
  const [tab, setTab] = useState("historia");

  useEffect(() => {
    let live = true;
    fetch("/data/himno.json").then(r => r.ok ? r.json() : Promise.reject()).then(j => { if (live) setData(j); }).catch(() => {});
    return () => { live = false; };
  }, []);

  // tipografías
  useEffect(() => {
    const id = "yamacoa-fonts-himno";
    if (document.getElementById(id)) return;
    const l = document.createElement("link"); l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Spectral:ital,wght@0,400;0,500;1,400;1,500&display=swap";
    document.head.appendChild(l);
  }, []);

  const T = {
    historia: "Historia", himno: "El Himno", encuesta: "Encuesta", evaluacion: "Evaluación",
  };

  return (
    <div style={{ background: COL.bg, color: COL.text, minHeight: "100vh", fontFamily: "Archivo, system-ui, sans-serif" }}>
      <style>{CSS}</style>
      <div className="wrap">
        <Hero data={data} />

        <nav className="tabs">
          {Object.entries(T).map(([k, lbl]) => (
            <button key={k} className={"tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{lbl}</button>
          ))}
        </nav>

        {tab === "historia" && <Historia data={data} />}
        {tab === "himno" && <Himno data={data} />}
        {tab === "encuesta" && <Encuesta data={data} />}
        {tab === "evaluacion" && <Evaluacion data={data} />}

        <footer className="foot">
          <span>Yamacoa · píldora histórica</span>
          <span>Fuente del texto: gallica.bnf.fr / BnF · dominio público. Compilación: MovimientoC40.</span>
        </footer>
      </div>
    </div>
  );
}

/* ───────────────────────── HERO ────────────────────────────────────────── */
function Hero({ data }) {
  return (
    <header className="hero">
      <div className="hero-flag" aria-hidden>
        <div className="stripes">{[0, 1, 2, 3, 4].map(i => <span key={i} className={i % 2 ? "st red" : "st blue"} />)}</div>
        <div className="tri"><Star s={30} fill="#FFFFFF" rot={Math.PI} /></div>
      </div>
      <div className="hero-body">
        <div className="eyebrow"><span className="dot" /> Archivos · Símbolos patrios</div>
        <h1>{data.meta?.titulo || "Himno Patriótico Cubano"}</h1>
        <p className="sub">{data.meta?.subtitulo}</p>
        <p className="intro">{data.intro}</p>
        <blockquote className="verso">
          {(data.versoDestacado?.texto || "").split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}
          {data.versoDestacado?.nota && <cite>{data.versoDestacado.nota}</cite>}
        </blockquote>
      </div>
    </header>
  );
}

/* ───────────────────────── HISTORIA (timeline + ficha) ─────────────────── */
function Historia({ data }) {
  const f = data.ficha || {};
  return (
    <section className="panel">
      <div className="grid">
        <div className="col-time">
          <div className="card-h">Línea de tiempo</div>
          <div className="card-sub">De un poema en el exilio a uno de los antecedentes del himno nacional.</div>
          <div className="timeline">
            {(data.timeline || []).map((e, i) => (
              <div className="tl-row" key={i}>
                <div className="tl-axis"><span className="tl-node" style={{ background: TONE[e.tono] || COL.steel }} /><span className="tl-line" /></div>
                <div className="tl-card">
                  <div className="tl-year" style={{ color: TONE[e.tono] || COL.steel }}>{e.anio}{e.fecha ? <span className="tl-date"> · {e.fecha}</span> : null}</div>
                  <div className="tl-hito">{e.hito}</div>
                  <div className="tl-det">{e.detalle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="col-ficha">
          <div className="ficha">
            <div className="ficha-top"><Star s={18} /><span>Ficha de la pieza</span></div>
            <Row k="Año" v={f.anio} />
            <Row k="Tipo" v={f.tipo} />
            <Row k="Música" v={f.musica} />
            <Row k="Letra" v={f.letra} />
            <Row k="Documento" v={f.documento} />
            <Row k="Estatus" v={f.estatus} />
            <div className="ficha-links">
              {f.partituraUrl && <a href={f.partituraUrl} target="_blank" rel="noreferrer">Partitura · BNF ↗</a>}
              {f.videoUrl && <a href={f.videoUrl} target="_blank" rel="noreferrer">Fragmento · audio ↗</a>}
            </div>
          </div>
          <div className="note">
            <strong>Una salvedad honesta.</strong> Las fuentes no coinciden del todo en la autoría de la letra: la partitura de la BNF la atribuye a Heredia y «otros poetas populares», mientras parte de la prensa cubana cita a Plácido Gener. La píldora muestra ambas versiones en vez de elegir una.
          </div>
        </aside>
      </div>
    </section>
  );
}
function Row({ k, v }) { return (<div className="frow"><div className="fk">{k}</div><div className="fv">{v}</div></div>); }

/* ───────────────────────── EL HIMNO (letra) ───────────────────────────── */
function Himno({ data }) {
  const L = data.letra || {};
  const C = L.completo || {};
  return (
    <section className="panel">
      <div className="card-h">El texto documentado</div>
      <div className="card-sub">{L.nota}</div>

      <div className="score">
        <div className="score-head">
          <div className="score-title">{C.titulo}</div>
          <div className="score-attr">{C.atrib}</div>
        </div>
        <div className="mov-grid">
          {(C.movimientos || []).map((m, i) => (
            <div className="mov" key={i}>
              <div className="mov-n"><Star s={13} /> {m.n}</div>
              {m.bloques.map((b, j) => (
                <div className="blk" key={j}>
                  <div className="blk-rol"><span className="rol-bar" />{b.rol}</div>
                  <div className="versos">{b.versos.map((v, k) => <p key={k}>{v}</p>)}</div>
                </div>
              ))}
              {m.refran && <div className="refran">↻ {m.refran}</div>}
            </div>
          ))}
        </div>
        <div className="score-src">{C.fuente}</div>
      </div>

      <div className="sub-grid">
        {L.raiz && (
          <div className="frag">
            <div className="frag-t"><span className="rol-bar" />{L.raiz.titulo}</div>
            {(L.raiz.fragmentos || []).map((f, i) => (
              <div className="raiz-blk" key={i}>
                <div className="raiz-sub">{f.sub}</div>
                <div className="versos">{f.versos.map((v, k) => <p key={k}>{v}</p>)}</div>
              </div>
            ))}
            <div className="frag-a">{L.raiz.atrib}</div>
          </div>
        )}
        {L.otraVersion && (
          <div className="frag">
            <div className="frag-t"><span className="rol-bar punzo" />{L.otraVersion.titulo}</div>
            <div className="versos">{L.otraVersion.versos.map((v, k) => <p key={k}>{v}</p>)}</div>
            <div className="frag-a">{L.otraVersion.atrib}</div>
          </div>
        )}
      </div>

      {L.noEs && (
        <div className="distinguir">
          <div className="dist-tag">No confundir</div>
          <p>{L.noEs}</p>
        </div>
      )}
    </section>
  );
}

/* ───────────────────────── ENCUESTA (poll) ────────────────────────────── */
function Encuesta({ data }) {
  const E = data.encuesta || { preguntas: [] };
  const [votes, setVotes] = useState(() => LS.get("himno_poll", {}));
  const [picked, setPicked] = useState(() => LS.get("himno_poll_picked", {}));

  const vote = (qid, oid) => {
    if (picked[qid]) return;
    const nv = { ...votes, [qid]: { ...(votes[qid] || {}), [oid]: ((votes[qid]?.[oid]) || 0) + 1 } };
    const np = { ...picked, [qid]: oid };
    setVotes(nv); setPicked(np); LS.set("himno_poll", nv); LS.set("himno_poll_picked", np);
  };

  return (
    <section className="panel">
      <div className="card-h">Encuesta</div>
      <div className="card-sub">{E.intro}</div>
      <div className="poll-grid">
        {E.preguntas.map(q => {
          const done = !!picked[q.id];
          const tot = q.opciones.reduce((s, o) => s + o.seed + ((votes[q.id]?.[o.id]) || 0), 0) || 1;
          return (
            <div className="poll-card" key={q.id}>
              <div className="poll-q">{q.texto}</div>
              <div className="poll-opts">
                {q.opciones.map(o => {
                  const n = o.seed + ((votes[q.id]?.[o.id]) || 0);
                  const pct = Math.round((n / tot) * 100);
                  const mine = picked[q.id] === o.id;
                  return (
                    <button key={o.id} className={"opt" + (done ? " done" : "") + (mine ? " mine" : "")} onClick={() => vote(q.id, o.id)} disabled={done}>
                      <span className="opt-fill" style={{ width: done ? pct + "%" : 0 }} />
                      <span className="opt-label">{o.label}{mine ? " ✓" : ""}</span>
                      <span className="opt-pct">{done ? pct + "%" : ""}</span>
                    </button>
                  );
                })}
              </div>
              {done && <div className="poll-tot">{tot} respuestas</div>}
            </div>
          );
        })}
      </div>
      <p className="poll-note">Conteo local (tu dispositivo) sobre una línea base. Para un contador global se conecta el mismo <code>pollStore</code> a Supabase, como en los otros temas.</p>
    </section>
  );
}

/* ───────────────────────── EVALUACIÓN (quiz gráfico) ───────────────────── */
function Evaluacion({ data }) {
  const Q = data.evaluacion || { preguntas: [], categorias: [], veredictos: [] };
  const [ans, setAns] = useState({});       // qid -> índice elegido
  const [done, setDone] = useState(false);

  const total = Q.preguntas.length;
  const answered = Object.keys(ans).length;
  const correct = Q.preguntas.filter(q => ans[q.id] === q.correcta).length;
  const score = total ? Math.round((correct / total) * 100) : 0;

  const porCat = useMemo(() => {
    const m = {};
    (Q.categorias || []).forEach(c => (m[c] = { cat: c, ok: 0, tot: 0 }));
    Q.preguntas.forEach(q => { if (!m[q.cat]) m[q.cat] = { cat: q.cat, ok: 0, tot: 0 }; m[q.cat].tot++; if (ans[q.id] === q.correcta) m[q.cat].ok++; });
    return Object.values(m).map(r => ({ ...r, pct: r.tot ? Math.round((r.ok / r.tot) * 100) : 0 }));
  }, [ans, Q]);

  const veredicto = (Q.veredictos || []).find(v => score >= v.min && score <= v.max) || {};
  const gauge = [{ name: "score", value: score, fill: score >= 70 ? COL.azul : score >= 40 ? COL.oro : COL.punzo }];

  if (!done) {
    return (
      <section className="panel">
        <div className="card-h">Evaluación</div>
        <div className="card-sub">{Q.intro}</div>
        <div className="quiz">
          {Q.preguntas.map((q, i) => (
            <div className="q-card" key={q.id}>
              <div className="q-top"><span className="q-num">{String(i + 1).padStart(2, "0")}</span><span className="q-cat">{q.cat}</span></div>
              <div className="q-text">{q.texto}</div>
              <div className="q-opts">
                {q.opciones.map((o, idx) => (
                  <button key={idx} className={"q-opt" + (ans[q.id] === idx ? " sel" : "")} onClick={() => setAns({ ...ans, [q.id]: idx })}>{o}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="quiz-bar">
          <div className="quiz-progress"><span style={{ width: (total ? (answered / total) * 100 : 0) + "%" }} /></div>
          <button className="btn-primary" disabled={answered < total} onClick={() => setDone(true)}>
            {answered < total ? `Faltan ${total - answered}` : "Ver mi resultado"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="card-h">Tu resultado</div>
      <div className="card-sub">{veredicto.titulo} — {veredicto.texto}</div>
      <div className="res-grid">
        <div className="gauge-card">
          <ResponsiveContainer width="100%" height={230}>
            <RadialBarChart innerRadius="72%" outerRadius="100%" data={gauge} startAngle={220} endAngle={-40}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: "rgba(255,255,255,.06)" }} dataKey="value" cornerRadius={20} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="gauge-center"><div className="gauge-num">{score}%</div><div className="gauge-sub">{correct}/{total} correctas</div></div>
        </div>
        <div className="cat-card">
          <div className="card-h sm">Desglose por área</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={porCat} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 0 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="cat" width={86} tick={{ fill: COL.muted, fontSize: 12, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,.04)" }} contentStyle={{ background: COL.panel2, border: `1px solid ${COL.line}`, borderRadius: 8, fontFamily: "IBM Plex Mono", fontSize: 12, color: COL.text }} formatter={(v, _n, p) => [`${v}% · ${p.payload.ok}/${p.payload.tot}`, p.payload.cat]} />
              <Bar dataKey="pct" radius={[0, 5, 5, 0]} maxBarSize={26}>
                {porCat.map((d, i) => <Cell key={i} fill={d.pct >= 70 ? COL.azul : d.pct >= 40 ? COL.oro : COL.punzo} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="review">
        {Q.preguntas.map((q, i) => {
          const ok = ans[q.id] === q.correcta;
          return (
            <div className={"rev-row" + (ok ? " ok" : " no")} key={q.id}>
              <span className="rev-ic">{ok ? "✓" : "✕"}</span>
              <div>
                <div className="rev-q"><b>{i + 1}.</b> {q.texto}</div>
                {!ok && <div className="rev-bad">Tu respuesta: {q.opciones[ans[q.id]]}</div>}
                <div className="rev-good">Correcta: {q.opciones[q.correcta]} — {q.exp}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="quiz-bar end">
        <button className="btn-ghost" onClick={() => { setAns({}); setDone(false); }}>Reintentar</button>
      </div>
    </section>
  );
}

/* ───────────────────────── CSS ─────────────────────────────────────────── */
const CSS = `
*{box-sizing:border-box}
.wrap{max-width:1080px;margin:0 auto;padding:24px 20px 60px}
.card-h{font-size:18px;font-weight:700;letter-spacing:-.01em}
.card-h.sm{font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:${COL.muted};font-weight:600}
.card-sub{color:${COL.muted};font-size:13.5px;margin:4px 0 18px;line-height:1.5}

/* hero */
.hero{display:grid;grid-template-columns:132px 1fr;gap:26px;align-items:stretch;padding:8px 0 24px}
.hero-flag{position:relative;border-radius:10px;overflow:hidden;border:1px solid ${COL.line};min-height:170px}
.hero-flag .stripes{position:absolute;inset:0;display:flex;flex-direction:column}
.hero-flag .st{flex:1}
.hero-flag .st.blue{background:${COL.azulDeep}}
.hero-flag .st.red{background:#0e1626}
.hero-flag .tri{position:absolute;left:0;top:0;bottom:0;width:62%;background:${COL.punzo};clip-path:polygon(0 0,100% 50%,0 100%);display:flex;align-items:center;justify-content:flex-start;padding-left:14px}
.eyebrow{display:flex;align-items:center;gap:8px;font-family:'IBM Plex Mono',monospace;font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:${COL.oro}}
.eyebrow .dot{width:6px;height:6px;border-radius:50%;background:${COL.oro};box-shadow:0 0 10px ${COL.oro}}
.hero h1{font-size:38px;line-height:1.04;margin:12px 0 2px;font-weight:800;letter-spacing:-.02em}
.hero .sub{font-family:'IBM Plex Mono',monospace;color:${COL.azul};font-size:13px;margin:0 0 14px;letter-spacing:.02em}
.hero .intro{color:${COL.text};opacity:.86;font-size:15px;line-height:1.62;max-width:62ch;margin:0 0 16px}
.verso{margin:0;padding:14px 18px;border-left:3px solid ${COL.oro};background:linear-gradient(90deg,rgba(230,180,80,.08),transparent);font-family:'Spectral',Georgia,serif;font-style:italic;font-size:16.5px;line-height:1.5;color:#F3E9D2}
.verso cite{display:block;margin-top:10px;font-style:normal;font-family:'IBM Plex Mono',monospace;font-size:11px;color:${COL.faint};line-height:1.5;letter-spacing:.01em}

/* tabs */
.tabs{display:flex;gap:6px;border-bottom:1px solid ${COL.line};margin:8px 0 22px;flex-wrap:wrap}
.tab{appearance:none;background:none;border:none;color:${COL.muted};font-family:'IBM Plex Mono',monospace;font-size:13px;letter-spacing:.04em;padding:10px 14px;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}
.tab:hover{color:${COL.text}}
.tab.on{color:${COL.text};border-bottom-color:${COL.oro}}

.panel{animation:fade .35s ease}
@keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

/* historia */
.grid{display:grid;grid-template-columns:1fr 340px;gap:26px}
.timeline{margin-top:6px}
.tl-row{display:grid;grid-template-columns:22px 1fr;gap:14px}
.tl-axis{position:relative;display:flex;flex-direction:column;align-items:center}
.tl-node{width:13px;height:13px;border-radius:50%;margin-top:5px;box-shadow:0 0 0 4px ${COL.bg},0 0 12px currentColor;z-index:1}
.tl-line{flex:1;width:2px;background:${COL.line}}
.tl-row:last-child .tl-line{display:none}
.tl-card{padding:0 0 22px}
.tl-year{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:14px}
.tl-date{color:${COL.faint};font-weight:400}
.tl-hito{font-weight:700;font-size:15px;margin:2px 0 4px}
.tl-det{color:${COL.muted};font-size:13.5px;line-height:1.55}

.col-ficha{display:flex;flex-direction:column;gap:14px}
.ficha{background:${COL.panel};border:1px solid ${COL.line};border-radius:12px;padding:16px 16px 14px}
.ficha-top{display:flex;align-items:center;gap:8px;font-family:'IBM Plex Mono',monospace;font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:${COL.oro};margin-bottom:8px}
.frow{padding:9px 0;border-top:1px solid ${COL.line}}
.frow:first-of-type{border-top:none}
.fk{font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;color:${COL.faint};margin-bottom:3px}
.fv{font-size:13.5px;line-height:1.5;color:${COL.text};opacity:.92}
.ficha-links{display:flex;gap:14px;margin-top:12px;flex-wrap:wrap}
.ficha-links a{color:${COL.azul};font-family:'IBM Plex Mono',monospace;font-size:12px;text-decoration:none}
.ficha-links a:hover{text-decoration:underline}
.note{background:${COL.panel2};border:1px solid ${COL.line};border-left:3px solid ${COL.steel};border-radius:10px;padding:13px 14px;font-size:12.5px;line-height:1.6;color:${COL.muted}}
.note strong{color:${COL.text}}

/* himno */
.score{background:${COL.panel};border:1px solid ${COL.line};border-radius:14px;padding:18px 18px 14px;margin-bottom:18px}
.score-head{text-align:center;padding-bottom:14px;margin-bottom:18px;border-bottom:1px solid ${COL.line}}
.score-title{font-family:'Spectral',Georgia,serif;font-size:24px;font-weight:600}
.score-attr{font-family:'IBM Plex Mono',monospace;font-size:11.5px;color:${COL.muted};margin-top:6px}
.mov-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px 30px}
.mov-n{display:flex;align-items:center;gap:7px;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:13px;color:${COL.oro};letter-spacing:.12em;margin-bottom:10px;padding-bottom:6px;border-bottom:1px dashed ${COL.line}}
.blk{margin-bottom:12px}
.blk-rol{display:flex;align-items:center;gap:8px;font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;color:${COL.azul};margin-bottom:6px}
.rol-bar{width:16px;height:2px;background:${COL.azul};flex:none}
.rol-bar.punzo{background:${COL.punzo}}
.versos p{margin:0 0 1px;font-family:'Spectral',Georgia,serif;font-size:14.5px;line-height:1.55;color:#EFE7D6}
.refran{font-family:'IBM Plex Mono',monospace;font-size:11px;color:${COL.faint};margin-top:6px}
.score-src{margin-top:14px;padding-top:12px;border-top:1px solid ${COL.line};font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:${COL.faint};text-align:center}
.sub-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px}
.frag{background:${COL.panel};border:1px solid ${COL.line};border-radius:12px;padding:16px;display:flex;flex-direction:column}
.frag-t{display:flex;align-items:center;gap:8px;font-family:'IBM Plex Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:${COL.azul};margin-bottom:12px}
.raiz-blk{margin-bottom:12px}
.raiz-sub{font-size:11px;color:${COL.faint};font-style:italic;margin-bottom:4px}
.frag-a{margin-top:auto;padding-top:10px;border-top:1px solid ${COL.line};font-size:11.5px;line-height:1.5;color:${COL.faint}}
.distinguir{display:flex;gap:14px;align-items:flex-start;background:linear-gradient(90deg,rgba(216,57,43,.08),transparent);border:1px solid ${COL.line};border-left:3px solid ${COL.punzo};border-radius:10px;padding:13px 15px}
.dist-tag{flex:none;font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;color:${COL.punzo};border:1px solid ${COL.punzo};border-radius:999px;padding:3px 9px;margin-top:1px}
.distinguir p{margin:0;font-size:13.5px;line-height:1.55;color:${COL.text};opacity:.9}

/* encuesta */
.poll-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.poll-card{background:${COL.panel};border:1px solid ${COL.line};border-radius:12px;padding:16px}
.poll-q{font-weight:600;font-size:14.5px;line-height:1.4;margin-bottom:12px}
.poll-opts{display:flex;flex-direction:column;gap:8px}
.opt{position:relative;display:flex;align-items:center;justify-content:space-between;gap:10px;overflow:hidden;text-align:left;border:1px solid ${COL.line};background:${COL.panel2};color:${COL.text};border-radius:9px;padding:10px 12px;font-size:13px;cursor:pointer;font-family:inherit;transition:border-color .15s}
.opt:hover:not(:disabled){border-color:${COL.azul}}
.opt:disabled{cursor:default}
.opt-fill{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,rgba(61,111,229,.30),rgba(61,111,229,.12));transition:width .6s cubic-bezier(.2,.7,.2,1);z-index:0}
.opt.mine .opt-fill{background:linear-gradient(90deg,rgba(230,180,80,.32),rgba(230,180,80,.12))}
.opt-label,.opt-pct{position:relative;z-index:1}
.opt-pct{font-family:'IBM Plex Mono',monospace;font-size:12px;color:${COL.muted}}
.opt.mine{border-color:${COL.oro}}
.poll-tot{font-family:'IBM Plex Mono',monospace;font-size:11px;color:${COL.faint};margin-top:9px}
.poll-note{color:${COL.faint};font-size:12px;line-height:1.6;margin-top:16px}
.poll-note code{background:${COL.panel2};padding:1px 6px;border-radius:5px;font-size:11.5px;color:${COL.muted}}

/* evaluación */
.quiz{display:flex;flex-direction:column;gap:14px}
.q-card{background:${COL.panel};border:1px solid ${COL.line};border-radius:12px;padding:16px}
.q-top{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.q-num{font-family:'IBM Plex Mono',monospace;font-size:13px;color:${COL.oro}}
.q-cat{font-family:'IBM Plex Mono',monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;color:${COL.faint};border:1px solid ${COL.line};border-radius:999px;padding:2px 8px}
.q-text{font-weight:600;font-size:15px;margin-bottom:12px;line-height:1.4}
.q-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.q-opt{text-align:left;border:1px solid ${COL.line};background:${COL.panel2};color:${COL.text};border-radius:9px;padding:10px 12px;font-size:13.5px;cursor:pointer;font-family:inherit;transition:.15s}
.q-opt:hover{border-color:${COL.azul}}
.q-opt.sel{border-color:${COL.oro};background:rgba(230,180,80,.10)}
.quiz-bar{display:flex;align-items:center;gap:16px;margin-top:20px}
.quiz-bar.end{justify-content:flex-end}
.quiz-progress{flex:1;height:6px;background:${COL.panel2};border-radius:999px;overflow:hidden}
.quiz-progress span{display:block;height:100%;background:${COL.azul};transition:width .3s}
.btn-primary{background:${COL.oro};color:#1a1206;border:none;border-radius:9px;padding:11px 20px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;white-space:nowrap}
.btn-primary:disabled{background:${COL.panel2};color:${COL.faint};cursor:not-allowed}
.btn-ghost{background:none;border:1px solid ${COL.line};color:${COL.muted};border-radius:9px;padding:10px 18px;font-size:13.5px;cursor:pointer;font-family:inherit}
.btn-ghost:hover{color:${COL.text};border-color:${COL.steel}}

.res-grid{display:grid;grid-template-columns:280px 1fr;gap:18px;margin-bottom:8px}
.gauge-card{position:relative;background:${COL.panel};border:1px solid ${COL.line};border-radius:12px;padding:8px;display:flex;align-items:center;justify-content:center}
.gauge-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}
.gauge-num{font-size:44px;font-weight:800;letter-spacing:-.02em}
.gauge-sub{font-family:'IBM Plex Mono',monospace;font-size:12px;color:${COL.muted}}
.cat-card{background:${COL.panel};border:1px solid ${COL.line};border-radius:12px;padding:16px}
.review{margin-top:16px;display:flex;flex-direction:column;gap:8px}
.rev-row{display:grid;grid-template-columns:24px 1fr;gap:10px;background:${COL.panel};border:1px solid ${COL.line};border-radius:10px;padding:12px 14px}
.rev-row.ok{border-left:3px solid ${COL.azul}}
.rev-row.no{border-left:3px solid ${COL.punzo}}
.rev-ic{font-weight:800}
.rev-row.ok .rev-ic{color:${COL.azul}}
.rev-row.no .rev-ic{color:${COL.punzo}}
.rev-q{font-size:14px;line-height:1.4;margin-bottom:4px}
.rev-bad{font-size:12.5px;color:${COL.punzo};margin-bottom:2px}
.rev-good{font-size:12.5px;color:${COL.muted};line-height:1.5}

/* footer */
.foot{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:40px;padding-top:16px;border-top:1px solid ${COL.line};font-family:'IBM Plex Mono',monospace;font-size:11px;color:${COL.faint}}

@media(max-width:780px){
  .hero{grid-template-columns:1fr}
  .hero-flag{min-height:120px}
  .hero h1{font-size:30px}
  .grid{grid-template-columns:1fr}
  .mov-grid{grid-template-columns:1fr}
  .sub-grid{grid-template-columns:1fr}
  .poll-grid{grid-template-columns:1fr}
  .q-opts{grid-template-columns:1fr}
  .res-grid{grid-template-columns:1fr}
}
`;
