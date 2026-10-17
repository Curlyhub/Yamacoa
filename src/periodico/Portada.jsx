import { Link } from "react-router-dom";
import temas from "../temas/registry.js";
import { useFeed, vigentes } from "./feed";
import {
  BloquePodcast, Confianza, MetaNoticia, NoticiaColumna, TarjetaEstudio, TarjetaExpediente,
  pistaDe, recorta, rutaNoticia, etiquetaCorta,
} from "./piezas";
import { BotonPlay } from "./Reproductor";

/* Portada (handoff 1a, broadsheet). Noticia principal = la vigente de mayor
   relevancia. Sin noticias todavía, el expediente más reciente ocupa la apertura
   para que la portada nunca quede vacía. */

export const expedientesOrdenados = [...temas].sort((a, b) =>
  String(b.publicado || "").localeCompare(String(a.publicado || ""))
);

const CSS = `
.yp-grid{display:grid; grid-template-columns:2fr 1fr; gap:32px; padding-top:28px;}
.yp-princ h1{margin:12px 0 14px;}
.yp-img{margin-top:24px; border-radius:24px; overflow:hidden; background:var(--y-surface-2);}
.yp-img img{display:block; width:100%; height:clamp(220px,32vw,320px); object-fit:cover;}
.yp-img figcaption{font:500 10px var(--y-mono); letter-spacing:.06em; color:var(--y-subtle); padding:8px 12px;}
.yp-tres{display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:26px; padding-top:22px;
  border-top:1px solid var(--y-rule);}
.yp-lado{display:flex; flex-direction:column; gap:20px;}
.yp-lista{list-style:none; margin:0; padding:0;}
.yp-lista li{display:flex; justify-content:space-between; gap:12px; padding:14px 0; border-bottom:1px solid var(--y-rule);
  font-size:15px; font-weight:600; line-height:1.3;}
.yp-exp{margin-top:48px; padding-top:22px;}
.yp-exp-h{display:flex; justify-content:space-between; align-items:baseline; margin-bottom:20px; gap:12px;}
.yp-tri{display:grid; grid-template-columns:repeat(3,1fr); gap:18px;}
@media (max-width:900px){
  .yp-grid, .yp-tri{grid-template-columns:1fr;}
  .yp-tres{grid-template-columns:1fr;}
}
`;

export default function Portada() {
  const noticias = useFeed("noticias.json");
  const estudios = useFeed("estudios.json");
  const podcast = useFeed("podcast.json");

  const activas = vigentes(noticias.datos?.items).sort((a, b) => (b.relevancia || 0) - (a.relevancia || 0));
  const [principal, ...resto] = activas;
  const estudio = estudios.datos?.items?.[0];
  const episodio = podcast.datos?.items?.[0];
  const columnas = resto.slice(0, 3);
  const mas = resto.slice(3, 9);

  return (
    <div className="y-wrap">
      <style>{CSS}</style>
      <div className="yp-grid">
        <div>
          {principal ? <Principal n={principal} /> : <AperturaExpediente t={expedientesOrdenados[0]} />}
          {columnas.length > 0 && (
            <div className="yp-tres">
              {columnas.map((n) => <NoticiaColumna key={n.id} n={n} />)}
            </div>
          )}
        </div>

        <aside className="yp-lado" aria-label="Destacados">
          {estudio && <TarjetaEstudio e={estudio} rotulo="Estudio automático del día" />}
          <BloquePodcast p={episodio} />
          {mas.length > 0 && (
            <div>
              <p className="y-meta" style={{ textTransform: "uppercase", marginBottom: 4 }}>Más noticias de la semana</p>
              <ul className="yp-lista">
                {mas.map((n) => (
                  <li key={n.id}>
                    <Link className="y-link" to={rutaNoticia(n)}>{n.titulo}</Link>
                    <span className="y-meta">{n.seccion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!principal && (
            <div className="y-card" style={{ background: "var(--y-surface-2)", boxShadow: "none" }}>
              <p className="y-eyebrow">Redacción automática</p>
              <p className="y-card-p" style={{ marginTop: 8 }}>
                Las noticias automáticas verificadas aparecerán aquí y vivirán tres días en portada.
              </p>
            </div>
          )}
        </aside>
      </div>

      <section className="yp-exp y-rule-top" aria-labelledby="yp-exp-t">
        <div className="yp-exp-h">
          <h2 id="yp-exp-t" className="y-h2">Expedientes dirigidos</h2>
          <Link to="/expedientes" className="y-link" style={{ fontWeight: 600, fontSize: 15 }}>Archivo completo →</Link>
        </div>
        <div className="yp-tri">
          {expedientesOrdenados.slice(principal ? 0 : 1, principal ? 3 : 4).map((t) => (
            <TarjetaExpediente key={t.id} t={t} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Principal({ n }) {
  return (
    <article className="yp-princ">
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span className="y-badge y-badge--auto">Noticia automática</span>
        <MetaNoticia n={n} />
        <Confianza valor={n.confianza} />
      </div>
      <h1 className="y-h1"><Link className="y-link" to={rutaNoticia(n)}>{n.titulo}</Link></h1>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <p className="y-lede" style={{ maxWidth: 640, flex: 1 }}>{n.entradilla}</p>
        <BotonPlay pista={pistaDe(n, "Resumen hablado")} oscuro etiqueta={`resumen de ${n.titulo}`} />
      </div>
      {n.imagen?.url && (
        <figure className="yp-img" style={{ margin: "24px 0 0" }}>
          <img src={n.imagen.url} alt={n.imagen.alt || ""} loading="eager" />
          {n.imagen.credito && <figcaption>{n.imagen.credito}</figcaption>}
        </figure>
      )}
    </article>
  );
}

function AperturaExpediente({ t }) {
  if (!t) return null;
  return (
    <article className="yp-princ">
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span className="y-badge y-badge--dir">Expediente dirigido</span>
        <span className="y-meta">{etiquetaCorta(t.etiqueta)} · {t.fuentes}</span>
      </div>
      <h1 className="y-h1"><Link className="y-link" to={t.path}>{t.titulo}</Link></h1>
      <p className="y-lede" style={{ maxWidth: 680 }}>{recorta(t.subtitulo, 260)}</p>
      <p style={{ marginTop: 22 }}>
        <Link to={t.path} className="y-btn">Abrir expediente →</Link>
      </p>
    </article>
  );
}
