import { Link } from "react-router-dom";
import { useFeed, vigentes, VIDA_DIAS, fechaCorta } from "./feed";
import { MetaNoticia, Vacio, rutaEstudio, rutaNoticia } from "./piezas";

/* Landing de noticias (handoff 1b, "La Semana"). Siete columnas, de la más
   antigua (opacidad .35) a hoy (1.0). Las barras de estudios automáticos cruzan
   los días cuyas noticias los originaron. */

const DIA = 86400000;
const DIAS_SEM = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const CSS = `
.yn-hero{padding:40px 0 26px;}
.yn-hero h1{margin-top:12px;}
.yn-sem{overflow-x:auto; -webkit-overflow-scrolling:touch;}
.yn-grid{display:grid; gap:12px;}
.yn-col[data-ancha="1"]{display:grid; grid-template-columns:1fr 1fr; align-content:start;}
.yn-lista{display:none;}
.yn-lista .yn-dia-h{margin:18px 0 10px;}
.yn-lista .yn-dia-h:first-child{margin-top:0;}
@media (max-width:720px){ .yn-sem, .yn-pie{display:none;} .yn-lista{display:block;} }
.yn-dia-h{font:600 11px var(--y-mono); letter-spacing:.1em; text-transform:uppercase; padding-bottom:10px;
  border-bottom:1px solid var(--y-rule);}
.yn-dia-h[data-hoy="1"]{border-bottom:2px solid var(--y-accent); color:var(--y-accent);}
.yn-barra{display:flex; justify-content:space-between; align-items:center; gap:10px; background:var(--y-auto-bg);
  color:var(--y-auto-head); border-radius:14px; padding:9px 14px; font-size:13.5px; font-weight:700; text-decoration:none;}
.yn-barra:hover{box-shadow:var(--y-shadow);}
.yn-barra span{font:500 10.5px var(--y-mono); color:var(--y-auto-ink); white-space:nowrap;}
.yn-col{display:flex; flex-direction:column; gap:10px;}
.yn-not{background:var(--y-surface); border-radius:16px; padding:14px; box-shadow:var(--y-shadow); text-decoration:none;
  color:inherit; display:block;}
.yn-not:hover{box-shadow:var(--y-shadow-hover);}
.yn-not b{display:block; font-size:14.5px; line-height:1.3; font-weight:700; margin-top:6px;}
.yn-pie{display:flex; justify-content:space-between; margin-top:14px;}
`;

export default function Noticias() {
  const { datos, cargando } = useFeed("noticias.json");
  const est = useFeed("estudios.json");
  const items = vigentes(datos?.items);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dias = Array.from({ length: VIDA_DIAS }, (_, i) => new Date(hoy.getTime() - (VIDA_DIAS - 1 - i) * DIA));
  const idxDia = (iso) => {
    const d = new Date(iso);
    d.setHours(0, 0, 0, 0);
    return Math.round((d - dias[0]) / DIA);
  };
  const porDia = dias.map(() => []);
  for (const n of items) {
    const i = idxDia(n.publicado);
    if (i >= 0 && i < VIDA_DIAS) porDia[i].push(n);
  }
  porDia.forEach((l) => l.sort((a, b) => (b.relevancia || 0) - (a.relevancia || 0)));
  // El ancho de cada día sigue a lo que trae: un día vacío no roba sitio y uno cargado
  // se abre a dos columnas.
  const anchoDia = (l) => (!l.length ? [60, ".35fr"] : l.length > 4 ? [340, "2fr"] : [170, "1fr"]);
  const columnas = porDia.map((l) => `minmax(${anchoDia(l)[0]}px,${anchoDia(l)[1]})`).join(" ");
  const anchoMin = porDia.reduce((s, l) => s + anchoDia(l)[0] + 12, 0);

  const ids = new Map(items.map((n) => [n.id, n]));
  const barras = (est.datos?.items || [])
    .map((e) => {
      const idx = (e.noticias || []).map((id) => ids.get(id)).filter(Boolean).map((n) => idxDia(n.publicado))
        .filter((i) => i >= 0 && i < VIDA_DIAS);
      if (!idx.length) return null;
      return { e, desde: Math.min(...idx), hasta: Math.max(...idx), n: idx.length };
    })
    .filter(Boolean);

  const tarjeta = (n) => (
    <Link key={n.id} to={rutaNoticia(n)} className="yn-not">
      <MetaNoticia n={{ seccion: n.seccion, plantilla: n.plantilla }} />
      {n.plantilla === "datos" && n.cifra && (
        <span style={{ display: "block", fontSize: 26, fontWeight: 800, letterSpacing: "-.04em", marginTop: 6, color: "var(--y-auto-head)" }}>
          {n.cifra.valor}
        </span>
      )}
      <b>{n.titulo}</b>
    </Link>
  );

  return (
    <div className="y-wrap">
      <style>{CSS}</style>
      <header className="yn-hero">
        <p className="y-eyebrow">{fechaCorta(dias[0])} – {fechaCorta(dias[VIDA_DIAS - 1])} · noticias automáticas</p>
        <h1 className="y-h1">Cuba, los últimos tres días.</h1>
        <p className="y-lede" style={{ marginTop: 14, maxWidth: 720 }}>
          Cada noticia vive tres días en portada. Se redacta a partir de fuentes verificadas
          y lleva su nivel de confianza a la vista.
        </p>
      </header>

      {!cargando && items.length === 0 ? (
        <Vacio>Todavía no hay noticias automáticas publicadas esta semana.</Vacio>
      ) : (
        <div className="y-card" style={{ borderRadius: 28, padding: 22 }}>
          <div className="yn-sem">
            <div className="yn-grid" style={{ gridTemplateColumns: columnas, minWidth: anchoMin }}>
              {dias.map((d, i) => (
                <div key={i} className="yn-dia-h" data-hoy={i === VIDA_DIAS - 1 ? "1" : "0"}
                  style={{ opacity: 0.35 + (0.65 * i) / (VIDA_DIAS - 1) }}>
                  {i === VIDA_DIAS - 1 ? "Hoy" : DIAS_SEM[d.getDay()]} {d.getDate()}
                </div>
              ))}
              {barras.map(({ e, desde, hasta, n }) => (
                <Link key={e.id} to={rutaEstudio(e)} className="yn-barra"
                  style={{ gridColumn: `${desde + 1} / span ${hasta - desde + 1}` }}>
                  {e.titulo}<span>{n} noticias →</span>
                </Link>
              ))}
              {porDia.map((lista, i) => (
                <div key={i} className="yn-col" data-ancha={lista.length > 4 ? "1" : "0"} style={{ opacity: 0.55 + (0.45 * i) / (VIDA_DIAS - 1) }}>
                  {lista.map(tarjeta)}
                </div>
              ))}
            </div>
          </div>
          {/* En móvil, lista por días de hoy hacia atrás (solo días con noticias). */}
          <div className="yn-lista">
            {dias.map((d, i) => ({ d, i, lista: porDia[i] })).reverse().filter((x) => x.lista.length).map(({ d, i, lista }) => (
              <section key={i}>
                <div className="yn-dia-h" data-hoy={i === VIDA_DIAS - 1 ? "1" : "0"}>
                  {i === VIDA_DIAS - 1 ? "Hoy" : DIAS_SEM[d.getDay()]} {d.getDate()}
                </div>
                <div className="yn-col">{lista.map(tarjeta)}</div>
              </section>
            ))}
          </div>
          <div className="yn-pie y-meta">
            <span>← sale de portada mañana</span>
            <span>hoy →</span>
          </div>
        </div>
      )}
    </div>
  );
}
