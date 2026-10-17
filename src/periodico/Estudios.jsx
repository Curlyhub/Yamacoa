import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useFeed, vigentes, hora, fechaLarga } from "./feed";
import { expedientesOrdenados } from "./Portada";
import { BloquePodcast, TarjetaExpediente, Vacio, Vida, pistaDe, rutaEstudio, rutaNoticia, rutaEpisodio } from "./piezas";
import { BotonPlay } from "./Reproductor";
import Grafico from "./Graficos";

/* Landing de estudios (handoff 1d, "Mesa de redacción"): cable de noticias a la
   izquierda, estudio destacado con "Por qué existe este estudio" al centro,
   podcast y cola a la derecha. Y plantilla congelada de estudio automático. */

const CSS = `
.ye-estado{display:flex; gap:18px; flex-wrap:wrap; padding:18px 0; font:500 11px var(--y-mono);
  letter-spacing:.08em; text-transform:uppercase; color:var(--y-muted); border-bottom:1px solid var(--y-rule);}
.ye-estado b{color:var(--y-ink);}
.ye-grid{display:grid; grid-template-columns:330px 1fr 280px; gap:20px; padding-top:22px; align-items:start;}
.ye-cable{background:var(--y-surface); border-radius:24px; padding:18px; box-shadow:var(--y-shadow);}
.ye-chips{display:flex; gap:6px; flex-wrap:wrap; margin:12px 0;}
.ye-item{display:block; padding:12px 0; border-bottom:1px solid var(--y-rule); text-decoration:none; color:inherit;}
.ye-item b{display:block; font-size:14px; font-weight:600; line-height:1.3; margin:4px 0 0;}
.ye-item:hover b{color:var(--y-accent);}
.ye-porque{background:var(--y-surface); border-radius:18px; padding:16px 18px; margin-top:18px;}
.ye-porque div{display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;}
.ye-dos{display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:20px;}
.ye-lado{position:sticky; top:16px; display:flex; flex-direction:column; gap:16px;}
.ye-mas{display:flex; flex-direction:column; gap:12px; margin-top:16px;}
@media (max-width:1000px){ .ye-grid{grid-template-columns:1fr;} .ye-lado{position:static;} .ye-dos{grid-template-columns:1fr;} }
`;

export default function Estudios() {
  const nots = useFeed("noticias.json");
  const est = useFeed("estudios.json");
  const pod = useFeed("podcast.json");
  const [sec, setSec] = useState("Todas");

  const cable = vigentes(nots.datos?.items).sort((a, b) => Date.parse(b.publicado) - Date.parse(a.publicado));
  const secciones = ["Todas", ...new Set(cable.map((n) => n.seccion).filter(Boolean))];
  const filtrado = sec === "Todas" ? cable : cable.filter((n) => n.seccion === sec);
  const estudios = est.datos?.items || [];
  const [destacado, ...otros] = estudios;
  const episodios = pod.datos?.items || [];

  return (
    <div className="y-wrap">
      <style>{CSS}</style>
      <header style={{ padding: "36px 0 0" }}>
        <p className="y-eyebrow">Mesa de redacción</p>
        <h1 className="y-h1" style={{ marginTop: 12 }}>Estudios: de la noticia al dato.</h1>
      </header>
      <div className="ye-estado" role="status">
        <span><b>{cable.length}</b> noticias activas</span>
        <span><b>{estudios.length}</b> estudios esta semana</span>
        {nots.datos?.actualizado && <span>actualizado {hora(nots.datos.actualizado)}</span>}
      </div>

      <div className="ye-grid">
        <section className="ye-cable" aria-labelledby="ye-cable-t">
          <p id="ye-cable-t" className="y-eyebrow" style={{ color: "var(--y-auto-ink)" }}>Cable · noticias automáticas</p>
          <div className="ye-chips">
            {secciones.map((s) => (
              <button key={s} type="button" className="y-chip" aria-pressed={sec === s} onClick={() => setSec(s)}>{s}</button>
            ))}
          </div>
          {filtrado.length === 0 && <p className="y-card-p">Sin noticias activas.</p>}
          {filtrado.map((n) => (
            <Link key={n.id} to={rutaNoticia(n)} className="ye-item">
              <span className="y-meta">{hora(n.publicado)} · {n.seccion}</span>
              <b>{n.titulo}</b>
              <Vida caduca={n.caduca} />
            </Link>
          ))}
        </section>

        <div>
          {destacado ? <EstudioDestacado e={destacado} /> : (
            <Vacio>Los estudios automáticos se generan a partir de los grupos de noticias más relevantes de la semana.</Vacio>
          )}
          {otros.length > 0 && (
            <div className="ye-mas">
              {otros.map((e) => (
                <Link key={e.id} to={rutaEstudio(e)} className="y-card y-card--auto">
                  <p className="y-eyebrow">{e.seccion} · {e.noticias?.length || 0} noticias</p>
                  <h3 className="y-card-t">{e.titulo}</h3>
                </Link>
              ))}
            </div>
          )}
          <h2 className="y-h2" style={{ fontSize: 22, marginTop: 30 }}>Expedientes dirigidos</h2>
          <div className="ye-dos">
            {expedientesOrdenados.slice(0, 2).map((t) => <TarjetaExpediente key={t.id} t={t} />)}
          </div>
        </div>

        <aside className="ye-lado" aria-label="Escuchar">
          {episodios[0] ? <BloquePodcast p={episodios[0]} rotulo="Ahora" /> : (
            <Vacio>Aún no hay episodios publicados.</Vacio>
          )}
          {episodios.length > 1 && (
            <div className="y-card" style={{ padding: 18 }}>
              <p className="y-eyebrow">En cola</p>
              {episodios.slice(1, 5).map((p) => (
                <Link key={p.id} to={rutaEpisodio(p)} className="ye-item">
                  <span className="y-meta">{p.tipo}</span><b>{p.titulo}</b>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function PorQue({ e }) {
  return (
    <div className="ye-porque">
      <p className="y-eyebrow" style={{ color: "var(--y-ink)" }}>Por qué existe este estudio</p>
      <div>
        <span className="y-badge y-badge--auto">{e.noticias?.length || 0} noticias de origen</span>
        {e.relevancia != null && <span className="y-badge y-badge--neutro">relevancia {e.relevancia}/100</span>}
        {(e.fuentesDatos || []).map((f) => <span key={f} className="y-badge y-badge--neutro">{f}</span>)}
      </div>
    </div>
  );
}

function EstudioDestacado({ e }) {
  return (
    <article className="y-card y-card--auto" style={{ borderRadius: 28, padding: "26px 28px" }}>
      <p className="y-eyebrow">Estudio automático · {e.seccion}</p>
      <h2 className="y-card-t" style={{ fontSize: "clamp(26px,3.2vw,36px)", lineHeight: 1.06, letterSpacing: "-.03em" }}>
        <Link className="y-link" to={rutaEstudio(e)}>{e.titulo}</Link>
      </h2>
      <p className="y-lede" style={{ color: "var(--y-auto-head)", fontSize: 16 }}>{e.resumen}</p>
      {e.grafico && <div className="y-card" style={{ marginTop: 18, boxShadow: "none" }}><Grafico g={e.grafico} /></div>}
      <PorQue e={e} />
    </article>
  );
}

const CSS_D = `
.yed{max-width:860px; margin:0 auto; padding-top:34px;}
.yed h1{margin:14px 0 16px;}
.yed-sec{margin-top:34px;}
.yed-sec h2{font-size:22px; font-weight:800; letter-spacing:-.02em; margin:0 0 10px;}
.yed-sec p:not(.y-eyebrow):not(.y-card-p){font-size:17px; line-height:1.6; color:var(--y-ink-2); margin:0 0 16px;}
.yed-orig{list-style:none; padding:0; margin:10px 0 0;}
.yed-orig li{padding:10px 0; border-bottom:1px solid var(--y-rule); font-size:14.5px; font-weight:600;}
`;

export function EstudioAuto() {
  const { slug } = useParams();
  const { datos: e, cargando } = useFeed(`estudios/${slug}.json`);
  const nots = useFeed("noticias.json");
  if (cargando) return null;
  if (!e) {
    return <div className="y-wrap"><div className="yed"><Vacio>No encontramos este estudio. <Link className="y-link" to="/estudios">Volver a estudios →</Link></Vacio></div></div>;
  }
  const origen = (nots.datos?.items || []).filter((n) => (e.noticias || []).includes(n.id));
  return (
    <div className="y-wrap">
      <style>{CSS + CSS_D}</style>
      <article className="yed">
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="y-badge y-badge--auto">Estudio automático</span>
          <span className="y-meta">{e.seccion} · {fechaLarga(e.creado)}</span>
        </div>
        <h1 className="y-h1" style={{ fontSize: "clamp(30px,4.4vw,44px)" }}>{e.titulo}</h1>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <p className="y-lede" style={{ flex: 1 }}>{e.resumen}</p>
          <BotonPlay pista={pistaDe(e, "Resumen hablado")} oscuro etiqueta={`resumen de ${e.titulo}`} />
        </div>
        <PorQue e={e} />

        {(e.secciones || []).map((s, i) => (
          <section key={i} className="yed-sec">
            {s.titulo && <h2>{s.titulo}</h2>}
            {(s.parrafos || []).map((p, j) => <p key={j}>{p}</p>)}
            {s.grafico && <div className="y-card" style={{ margin: "8px 0 0" }}><Grafico g={s.grafico} /></div>}
          </section>
        ))}

        {e.limitaciones && (
          <section className="yed-sec">
            <div className="y-card" style={{ background: "var(--y-surface-2)", boxShadow: "none" }}>
              <p className="y-eyebrow">Límites de este estudio</p>
              <p className="y-card-p" style={{ marginTop: 8, color: "var(--y-ink-2)" }}>{e.limitaciones}</p>
            </div>
          </section>
        )}

        {origen.length > 0 && (
          <section className="yed-sec">
            <p className="y-eyebrow">Noticias de origen</p>
            <ul className="yed-orig">
              {origen.map((n) => <li key={n.id}><Link className="y-link" to={rutaNoticia(n)}>{n.titulo}</Link></li>)}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
