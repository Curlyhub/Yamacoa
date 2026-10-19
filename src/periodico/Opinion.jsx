import { Link, useParams } from "react-router-dom";
import { useFeed, fechaLarga } from "./feed";
import { Vacio, recorta } from "./piezas";
import Grafico from "./Graficos";
import temas from "../temas/registry.js";

import Compartir from "../components/Compartir";
/* Opinión (2026-10-18): artículos firmados por colaboradores invitados. Plantilla CONGELADA.
   - El texto del autor se pinta TAL CUAL (párrafos separados por línea en blanco), sin
     reescritura ni formato añadido. Su sha256 va a la vista: cualquiera puede comprobarlo.
   - Lo que añade Yamacoa va APARTE, en «Los datos», con el color de lo automático: contexto
     con fuentes, gráfico y notas de datos neutrales. Cada nota se ancla a las palabras exactas
     del autor con una marca discreta (subrayado de puntos + número): las palabras no cambian.
   - Firma con nombre o seudónimo; la sección no aparece en el menú si no hay artículos. */

const CSS = `
.yop{max-width:760px; margin:0 auto; padding-top:34px;}
.yop h1{margin:14px 0 10px;}
.yop-firma{font-size:17px; color:var(--y-ink); margin:0;}
.yop-firma b{font-weight:800;}
.yop-pres{font-size:14.5px; color:var(--y-muted); margin:4px 0 0;}
.yop-tal{margin:22px 0 26px; padding:12px 16px; border-left:3px solid var(--y-rule); font-size:14px; line-height:1.5; color:var(--y-muted);}
.yop-texto p{font-size:18.5px; line-height:1.7; color:var(--y-ink); margin:0 0 20px; white-space:pre-line;}
.yop-texto mark{background:none; color:inherit; text-decoration:underline dotted var(--y-auto-ink) 2px; text-underline-offset:4px;}
.yop-texto sup a{font:600 10px var(--y-mono); color:var(--y-auto-ink); text-decoration:none; margin-left:2px;}
.yop-datos{margin:34px 0 10px; padding:24px 26px 12px; border-radius:28px; background:var(--y-auto-bg);}
.yop-datos header{display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; margin-bottom:14px;}
.yop-datos h2{font-size:22px; letter-spacing:-.02em; margin:0; color:var(--y-auto-head);}
.yop-datos > p{font-size:16px; line-height:1.6; color:var(--y-auto-head); margin:0 0 16px;}
.yop-datos .y-card{box-shadow:none; margin:4px 0 20px;}
.yop-datos sup a{font:600 10px var(--y-mono); color:var(--y-accent); text-decoration:none; margin-left:2px;}
.yop-nota{display:grid; grid-template-columns:auto 1fr; gap:12px; padding:12px 0; border-top:1px solid rgba(31,58,43,.15);}
.yop-nota b{font:700 11px var(--y-mono); color:var(--y-auto-ink);}
.yop-nota q{display:block; font-style:italic; color:var(--y-auto-ink); font-size:14.5px; margin-bottom:4px;}
.yop-nota span{font-size:15.5px; line-height:1.5; color:var(--y-auto-head);}
.yop-fuentes{margin:14px 0 6px; padding-left:22px;}
.yop-fuentes li{font-size:13.5px; line-height:1.45; margin-bottom:6px; color:var(--y-auto-head);}
.yop-fuentes a{color:var(--y-auto-head); font-weight:600;}
.yop-huella{margin-top:26px; font:500 10.5px var(--y-mono); letter-spacing:.04em; color:var(--y-subtle); word-break:break-all;}
.yop-lista{display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:18px; margin-top:26px;}
.yop-card{display:block; background:var(--y-surface); border-radius:24px; padding:22px 24px; box-shadow:var(--y-shadow);
  text-decoration:none; color:inherit; border-top:4px solid var(--y-ink);}
.yop-card:hover{box-shadow:var(--y-shadow-hover);}
.yop-card h3{font-size:21px; line-height:1.2; letter-spacing:-.02em; margin:10px 0 8px;}
.yop-card p{font-size:14.5px; line-height:1.5; color:var(--y-muted); margin:0;}
@media (max-width:560px){ .yop-datos{padding:20px 18px 8px;} .yop-texto p{font-size:17px;} }
`;

export const rutaOpinion = (a) => `/opinion/${a.slug}`;
const parrafos = (t) => t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const firmaDe = (a) => (a.firma_tipo === "seudonimo" ? `${a.firma} (seudónimo)` : a.firma);

function Citas({ citas }) {
  return (citas || []).map((c) => <sup key={c}><a href={`#od-f-${c}`} aria-label={`Fuente ${c}`}>[{c}]</a></sup>);
}

// Marca en un párrafo las palabras que tienen nota de datos. Busca el fragmento literal
// (tolerante a espacios); si no lo encuentra, el párrafo sale sin marca y la nota sigue abajo.
function Parrafo({ texto, notas }) {
  const marcas = [];
  notas.forEach((n, i) => {
    const re = new RegExp(n.fragmento.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"), "i");
    const m = re.exec(texto);
    if (m && !marcas.some((x) => m.index < x.fin && m.index + m[0].length > x.ini)) marcas.push({ ini: m.index, fin: m.index + m[0].length, i });
  });
  if (!marcas.length) return <p>{texto}</p>;
  marcas.sort((a, b) => a.ini - b.ini);
  const out = []; let k = 0;
  marcas.forEach((x) => {
    out.push(texto.slice(k, x.ini));
    out.push(<mark key={x.i}>{texto.slice(x.ini, x.fin)}</mark>,
      <sup key={`s${x.i}`}><a href={`#od-n-${x.i + 1}`} aria-label={`Nota de datos ${x.i + 1}`}>d{x.i + 1}</a></sup>);
    k = x.fin;
  });
  out.push(texto.slice(k));
  return <p>{out}</p>;
}

export function Articulo() {
  const { slug } = useParams();
  const { datos, cargando } = useFeed("opinion.json");
  const a = datos?.items?.find((x) => x.slug === slug);
  if (cargando) return null;
  if (!a) return <div className="y-wrap"><div className="yop"><Vacio>Este artículo no está publicado. <Link to="/opinion" className="y-link" style={{ fontWeight: 600 }}>Ver opinión →</Link></Vacio></div></div>;
  const d = a.datos || {};
  const notas = d.notas || [];
  const exp = d.expediente && temas.find((t) => t.path === d.expediente);
  return (
    <div className="y-wrap">
      <style>{CSS}</style>
      <article className="yop">
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="y-badge y-badge--neutro">Opinión</span>
          <span className="y-meta">{fechaLarga(a.publicado)}</span>
          <span style={{ marginLeft: "auto" }}><Compartir titulo={a.titulo} /></span>
        </div>
        <h1 className="y-h1" style={{ fontSize: "clamp(30px,4.6vw,46px)" }}>{a.titulo}</h1>
        <p className="yop-firma">Por <b>{a.firma}</b>{a.firma_tipo === "seudonimo" && <span className="y-meta"> · firma con seudónimo</span>}</p>
        {a.presentacion && <p className="yop-pres">{a.presentacion}</p>}
        <p className="yop-tal">Este artículo se publica tal como lo envió su autor: Yamacoa no lo edita. Las opiniones
          son suyas. Aparte, en «Los datos», la redacción añade contexto con fuentes verificables.</p>

        <div className="yop-texto">
          {parrafos(a.texto).map((p, i) => <Parrafo key={i} texto={p} notas={notas} />)}
        </div>

        {(d.contexto?.length || d.grafico || notas.length) ? (
          <section className="yop-datos" aria-labelledby="yop-d">
            <header>
              <h2 id="yop-d">Los datos</h2>
              <span className="y-meta" style={{ color: "var(--y-auto-ink)" }}>Añadido por Yamacoa · no forma parte del artículo</span>
            </header>
            {d.grafico && <div className="y-card"><Grafico g={d.grafico} /></div>}
            {(d.contexto || []).map((p, i) => <p key={i}>{p.texto}<Citas citas={p.citas} /></p>)}
            {notas.map((n, i) => (
              <div key={i} id={`od-n-${i + 1}`} className="yop-nota">
                <b>d{i + 1}</b>
                <div><q>{n.fragmento}</q><span>{n.nota}<Citas citas={n.citas} /></span></div>
              </div>
            ))}
            {(d.fuentes || []).length > 0 && (
              <ol className="yop-fuentes">
                {d.fuentes.map((f, i) => (
                  <li key={i} id={`od-f-${i + 1}`}>
                    {f.url ? <a href={f.url} target="_blank" rel="noopener noreferrer">{f.nombre}</a> : <b>{f.nombre}</b>}
                    <span className="y-meta"> · {f.tipo === "dataset" ? "Serie de datos" : f.tipo === "primaria" ? "Fuente primaria" : "Medio"}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        ) : null}

        {exp && (
          <Link to={exp.path} className="y-card y-card--dir" style={{ display: "block", margin: "24px 0" }}>
            <p className="y-eyebrow">Para ir más allá · expediente</p>
            <p style={{ margin: "8px 0 0", fontWeight: 800, fontSize: 19, color: "var(--y-dir-head)" }}>{exp.titulo}</p>
          </Link>
        )}

        <p className="yop-huella">Texto íntegro del autor · sha256 {a.texto_sha256}</p>
      </article>
    </div>
  );
}

export default function Opinion() {
  const { datos, cargando } = useFeed("opinion.json");
  const items = datos?.items || [];
  if (cargando) return null;
  return (
    <div className="y-wrap">
      <style>{CSS}</style>
      <section style={{ paddingTop: 30 }}>
        <p className="y-eyebrow">Opinión · firmas invitadas</p>
        <h1 className="y-h1" style={{ fontSize: "clamp(34px,5vw,54px)", margin: "10px 0 12px" }}>Otras voces, con los datos al lado.</h1>
        <p className="y-lede" style={{ maxWidth: 720 }}>Artículos firmados por colaboradores, publicados tal como los escriben.
          Las opiniones son de sus autores; Yamacoa añade, aparte, el contexto con datos y fuentes.</p>
        {items.length === 0 ? <div style={{ marginTop: 26 }}><Vacio>Aún no hay artículos de opinión publicados.</Vacio></div> : (
          <div className="yop-lista">
            {items.map((a) => (
              <Link key={a.id} to={rutaOpinion(a)} className="yop-card">
                <span className="y-meta">{fechaLarga(a.publicado)}</span>
                <h3>{a.titulo}</h3>
                <p style={{ color: "var(--y-ink)", fontWeight: 700, marginBottom: 8 }}>{firmaDe(a)}</p>
                <p>{recorta(parrafos(a.texto)[0], 180)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
