import { Link, useParams } from "react-router-dom";
import { useFeed, fechaLarga, hora } from "./feed";
import { Confianza, Vacio, Vida, pistaDe, rutaEstudio, PLANTILLA } from "./piezas";
import { BotonPlay } from "./Reproductor";
import Grafico from "./Graficos";
import temas from "../temas/registry.js";

import Compartir from "../components/Compartir";
/* Plantillas CONGELADAS de noticia automática. Una sola página, cuatro variantes
   según `plantilla` (contrato noticias.schema.json):
     cronica   hecho desarrollado
     breve     última hora: poco texto y lo que aún no se sabe
     datos     la noticia es una cifra: cifra destacada y gráfico opcional
     contraste versión oficial frente a lo documentado por otras fuentes
   Cabecera, resumen hablado, citas por párrafo y fuentes son comunes: cambian los
   bloques, no el estilo. La confianza y el tipo de imagen van a la vista.
   `analisis` (todas menos breve) va DESPUÉS de los hechos, en un bloque rotulado: la
   interpretación nunca se mezcla con lo que pasó. El `grafico` puede ir en cualquier
   plantilla: en datos bajo la cifra; en las demás dentro del análisis o tras el cuerpo. */

const TIPO_IMG = { foto: "Fotografía", grafico: "Gráfico Yamacoa", ilustracion_ia: "Ilustración generada por IA" };
const TIPO_FUENTE = { primaria: "Fuente primaria", medio: "Medio", red_social: "Red social", dataset: "Serie de datos" };

const CSS = `
.ynd{max-width:760px; margin:0 auto; padding-top:34px;}
.ynd h1{margin:14px 0 16px;}
.ynd .y-lede{margin-bottom:22px;}
.ynd-audio{display:flex; align-items:center; gap:14px; margin:22px 0; padding:14px 18px; border-radius:20px;
  background:var(--y-surface);}
.ynd-audio b{font-size:14px;}
.ynd-cuerpo p{font-size:17px; line-height:1.62; color:var(--y-ink-2); margin:0 0 18px;}
.ynd sup a{font:600 10px var(--y-mono); color:var(--y-accent); text-decoration:none; margin-left:2px;}
.ynd-fig{margin:26px 0; border-radius:24px; overflow:hidden; background:var(--y-surface-2);}
.ynd-fig img{display:block; width:100%; height:auto;}
.ynd-fig figcaption{font:500 10.5px var(--y-mono); letter-spacing:.04em; color:var(--y-subtle); padding:10px 14px;}
.ynd-fuentes{margin-top:30px; padding-top:18px; border-top:3px solid var(--y-ink);}
.ynd-fuentes ol{padding-left:22px; margin:12px 0 0;}
.ynd-fuentes li{font-size:14px; line-height:1.45; margin-bottom:10px; color:var(--y-ink-2);}
.ynd-fuentes li a{color:var(--y-ink); font-weight:600;}
.ynd-guion{margin:-8px 0 22px;}
.ynd-guion summary{font:500 11px var(--y-mono); letter-spacing:.06em; text-transform:uppercase; color:var(--y-subtle); cursor:pointer;}
.ynd-guion p{font-size:15px; line-height:1.55; color:var(--y-muted); margin:10px 0 0;}
.ynd-pend{background:var(--y-surface-2); border-radius:20px; padding:18px 22px; margin:8px 0 26px;}
.ynd-pend ul{margin:10px 0 0; padding-left:20px;}
.ynd-pend li{font-size:15.5px; line-height:1.5; color:var(--y-ink-2); margin-bottom:6px;}
.ynd-cifra{background:var(--y-auto-bg); border-radius:28px; padding:26px 28px; margin:24px 0;}
.ynd-cifra b{display:block; font-size:clamp(52px,9vw,88px); font-weight:800; letter-spacing:-.05em; line-height:.95; color:var(--y-auto-head);}
.ynd-cifra span{font:600 13px var(--y-mono); letter-spacing:.06em; text-transform:uppercase; color:var(--y-auto-ink);}
.ynd-cifra p{font-size:17px; line-height:1.45; color:var(--y-auto-head); margin:12px 0 0; font-weight:600;}
.ynd-vers{display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:14px; margin:24px 0 28px;}
.ynd-ver{border-radius:24px; padding:20px 22px; background:var(--y-surface); box-shadow:var(--y-shadow);}
.ynd-ver[data-lado="oficial"]{background:var(--y-surface-2); box-shadow:none; border:1px solid var(--y-rule);}
.ynd-ver p:not(.y-eyebrow){font-size:15.5px; line-height:1.55; color:var(--y-ink-2); margin:10px 0 0;}
.ynd[data-plantilla="breve"] h1{font-size:clamp(26px,3.6vw,36px) !important;}
.ynd-anal{margin:30px 0 8px; padding:24px 26px 8px; border-radius:28px; background:var(--y-surface);
  box-shadow:var(--y-shadow); border-left:6px solid var(--y-auto-ink);}
.ynd-anal header{display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; margin-bottom:14px;}
.ynd-anal h2{font-size:22px; letter-spacing:-.02em; margin:0; color:var(--y-auto-head);}
.ynd-anal > p{font-size:16.5px; line-height:1.6; color:var(--y-ink-2); margin:0 0 16px;}
.ynd-anal .y-card{box-shadow:none; background:var(--y-bg); margin:4px 0 20px;}
@media (max-width:560px){.ynd-anal{padding:20px 18px 6px; border-left-width:4px;}}
`;

const LADO = { oficial: "Versión oficial", independiente: "Lo que documentan medios independientes",
  internacional: "Lo que reportan medios internacionales", testimonio: "Testimonios" };

function Citas({ citas }) {
  return (citas || []).map((c) => (
    <sup key={c}><a href={`#f-${c}`} aria-label={`Fuente ${c}`}>[{c}]</a></sup>
  ));
}

export default function Noticia() {
  const { slug } = useParams();
  const { datos, cargando } = useFeed("noticias.json");
  const n = datos?.items?.find((x) => x.slug === slug);

  if (cargando) return null;
  if (!n || (n.caduca && Date.parse(n.caduca) <= Date.now())) {
    return (
      <div className="y-wrap"><div className="ynd">
        <Vacio>
          Esta noticia ya no está en portada: las noticias automáticas viven tres días.
          {" "}<Link to="/noticias" className="y-link" style={{ fontWeight: 600 }}>Ver las de esta semana →</Link>
        </Vacio>
      </div></div>
    );
  }

  return (
    <div className="y-wrap">
      <style>{CSS}</style>
      <article className="ynd" data-plantilla={n.plantilla || "cronica"}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="y-badge y-badge--auto">{PLANTILLA[n.plantilla] || "Noticia automática"}</span>
          <span className="y-meta">{n.seccion} · {fechaLarga(n.publicado)}, {hora(n.publicado)}
            {n.actualizado ? ` · actualizada ${hora(n.actualizado)}` : ""}</span>
          <Confianza valor={n.confianza} />
          <span style={{ marginLeft: "auto" }}><Compartir titulo={n.titulo} /></span>
        </div>
        <h1 className="y-h1" style={{ fontSize: "clamp(30px,4.6vw,46px)" }}>{n.titulo}</h1>
        <p className="y-lede">{n.entradilla}</p>

        {/* Ilustración de cabecera: siempre rotulada con su tipo (§11.4). */}
        {n.imagen?.url && (
          <figure className="ynd-fig">
            <img src={n.imagen.url} alt={n.imagen.alt || ""} />
            <figcaption>{TIPO_IMG[n.imagen.tipo] || "Imagen"}{n.imagen.credito ? ` · ${n.imagen.credito}` : ""}</figcaption>
          </figure>
        )}

        {n.audio?.url && (
          <div className="ynd-audio">
            <BotonPlay pista={pistaDe(n, "Resumen hablado")} oscuro etiqueta={`resumen de ${n.titulo}`} />
            <div><b>Escuchar el resumen</b><div className="y-meta">Voz sintética · {Math.round((n.audio.duracion || 0) / 60) || 1} min</div></div>
          </div>
        )}
        {n.audio?.texto && (
          <details className="ynd-guion">
            <summary>Leer lo que dice el resumen</summary>
            <p>{n.audio.texto}</p>
          </details>
        )}

        {n.plantilla === "datos" && n.cifra && (
          <div className="ynd-cifra">
            <b>{n.cifra.valor}</b>
            {n.cifra.unidad && <span>{n.cifra.unidad}</span>}
            <p>{n.cifra.etiqueta}<Citas citas={n.cifra.citas} /></p>
          </div>
        )}
        {n.plantilla === "datos" && n.grafico && (
          <div className="y-card" style={{ margin: "0 0 26px" }}><Grafico g={n.grafico} /></div>
        )}

        {n.plantilla === "contraste" && (n.versiones || []).length > 0 && (
          <div className="ynd-vers">
            {n.versiones.map((v, i) => (
              <section key={i} className="ynd-ver" data-lado={v.lado}>
                <p className="y-eyebrow" style={{ margin: 0 }}>{LADO[v.lado] || v.lado}</p>
                <p>{v.texto}<Citas citas={v.citas} /></p>
              </section>
            ))}
          </div>
        )}

        <div className="ynd-cuerpo">
          {(n.cuerpo || []).map((p, i) => (
            <p key={i}>{p.texto}<Citas citas={p.citas} /></p>
          ))}
        </div>

        {n.plantilla !== "datos" && n.grafico && !(n.analisis || []).length && (
          <div className="y-card" style={{ margin: "8px 0 26px" }}><Grafico g={n.grafico} /></div>
        )}

        {n.plantilla !== "breve" && (n.analisis || []).length > 0 && (
          <section className="ynd-anal" aria-labelledby="ynd-a">
            <header>
              <h2 id="ynd-a">Análisis</h2>
              <span className="y-meta">Interpretación de Yamacoa con los datos citados · separada de los hechos</span>
            </header>
            {n.plantilla !== "datos" && n.grafico && <div className="y-card"><Grafico g={n.grafico} /></div>}
            {n.analisis.map((p, i) => (
              <p key={i}>{p.texto}<Citas citas={p.citas} /></p>
            ))}
          </section>
        )}

        {n.plantilla === "breve" && (n.pendiente || []).length > 0 && (
          <div className="ynd-pend">
            <p className="y-eyebrow" style={{ margin: 0 }}>Lo que aún no se sabe</p>
            <ul>{n.pendiente.map((q, i) => <li key={i}>{q}</li>)}</ul>
          </div>
        )}

        {n.expediente && temas.find((t) => t.path === n.expediente) && (() => {
          const t = temas.find((x) => x.path === n.expediente);
          return (
            <Link to={t.path} className="y-card y-card--dir" style={{ margin: "24px 0" }}>
              <p className="y-eyebrow">Para ir más allá · expediente</p>
              <p style={{ margin: "8px 0 0", fontWeight: 800, fontSize: 19, color: "var(--y-dir-head)" }}>{t.titulo}</p>
              {t.subtitulo && <p className="y-card-p" style={{ color: "var(--y-dir-ink)" }}>{t.subtitulo}</p>}
            </Link>
          );
        })()}

        {n.estudio && (
          <Link to={rutaEstudio({ slug: n.estudio })} className="y-card y-card--auto" style={{ margin: "24px 0" }}>
            <p className="y-eyebrow">Forma parte de un estudio automático</p>
            <p style={{ margin: "8px 0 0", fontWeight: 700, color: "var(--y-auto-head)" }}>Ver el análisis de datos →</p>
          </Link>
        )}

        <section className="ynd-fuentes" aria-labelledby="ynd-f">
          <h2 id="ynd-f" className="y-eyebrow" style={{ color: "var(--y-ink)" }}>Fuentes</h2>
          <ol>
            {(n.fuentes || []).map((f, i) => (
              <li key={i} id={`f-${i + 1}`}>
                {f.url ? <a href={f.url} target="_blank" rel="noopener noreferrer">{f.nombre}</a> : <b>{f.nombre}</b>}
                {" · "}<span className="y-meta">{TIPO_FUENTE[f.tipo] || f.tipo}
                  {f.verificacion ? ` · verificada por ${f.verificacion === "replicada" ? "replicación" : "comprobación directa"}` : ""}</span>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: 18, maxWidth: 260 }}>
            <p className="y-meta" style={{ margin: 0 }}>Vida en portada</p>
            <Vida caduca={n.caduca} />
          </div>
        </section>
      </article>
    </div>
  );
}
