import { Link, useParams } from "react-router-dom";
import { useFeed, duracion, minutos, fechaLarga } from "./feed";
import { expedientesOrdenados } from "./Portada";
import { Vacio, pistaDe, rutaEpisodio, rutaEstudio } from "./piezas";
import { BotonPlay, useReproductor } from "./Reproductor";

/* Landing de podcast (handoff 1e, "Radio-periódico") y plantilla congelada de
   episodio. Tipos: Automático (voz sintética, siempre declarada) y Elaborado
   (grabado por personas en el estudio interno). */

const CSS = `
.ypo-hero{display:grid; grid-template-columns:1.5fr 1fr; gap:20px; padding-top:28px; align-items:start;}
.ypo-on{background:var(--y-pod-bg); color:var(--y-pod-ink); border-radius:32px; padding:clamp(22px,3vw,34px);}
.ypo-on h1{color:var(--y-pod-ink); margin:12px 0 20px;}
.ypo-onda{display:flex; align-items:center; gap:3px; height:64px; margin:8px 0 18px;}
.ypo-onda i{flex:1; border-radius:2px; background:rgba(252,249,244,.25);}
.ypo-onda i.on{background:color-mix(in oklch, var(--y-prog-a), var(--y-prog-b) var(--k));}
.ypo-caps{background:var(--y-surface); border-radius:28px; padding:22px; box-shadow:var(--y-shadow);}
.ypo-cap{display:grid; grid-template-columns:26px 1fr auto; gap:10px; width:100%; text-align:left; background:none; border:0;
  border-bottom:1px solid var(--y-rule); padding:12px 0; cursor:pointer; font:600 14px var(--y-font); color:var(--y-ink);}
.ypo-cap[data-on="1"]{color:var(--y-accent); font-weight:800;}
.ypo-cuatro{display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-top:34px;}
.ypo-ep{background:var(--y-surface); border-radius:24px; padding:14px; box-shadow:var(--y-shadow); text-decoration:none; color:inherit;}
.ypo-ep:hover{box-shadow:var(--y-shadow-hover);}
.ypo-portada{aspect-ratio:1; border-radius:16px; background:var(--y-pod-bg); overflow:hidden; display:grid; place-items:center;
  color:var(--y-pod-acc); font:800 22px var(--y-font); letter-spacing:-.03em;}
.ypo-portada img{width:100%; height:100%; object-fit:cover;}
.ypo-pie{display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:34px;}
@media (max-width:900px){ .ypo-hero, .ypo-pie{grid-template-columns:1fr;} .ypo-cuatro{grid-template-columns:1fr 1fr;} }
`;

function onda(id, n = 64) {
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return Array.from({ length: n }, (_, i) => {
    h = (h * 1103515245 + 12345) >>> 0;
    return 0.25 + 0.75 * Math.abs(Math.sin(i / 5 + (h % 1000) / 160));
  });
}

export function Onda({ p }) {
  const r = useReproductor();
  const barras = onda(p.id);
  const activa = !!r?.pista && r.pista.audio === (p.audio?.url || p.audio);
  const frac = activa && r.t.total ? r.t.actual / r.t.total : 0;
  return (
    <div className="ypo-onda" aria-hidden="true">
      {/* Lo escuchado se tiñe naranja → turquesa, como el anillo del botón: turquesa en el frente. */}
      {barras.map((v, i) => {
        const on = i / barras.length < frac;
        const k = on ? Math.round((i / Math.max(1, Math.ceil(frac * barras.length) - 1)) * 100) : 0;
        return <i key={i} className={on ? "on" : ""} style={{ height: `${v * 100}%`, "--k": `${k}%` }} />;
      })}
    </div>
  );
}

export default function Podcast() {
  const { datos, cargando } = useFeed("podcast.json");
  const est = useFeed("estudios.json");
  const eps = datos?.items || [];
  const edicion = eps.find((p) => p.formato === "edicion_hablada") || eps[0];
  const resto = eps.filter((p) => p !== edicion);
  const r = useReproductor();

  return (
    <div className="y-wrap">
      <style>{CSS}</style>
      {!cargando && !edicion ? (
        <div style={{ paddingTop: 36 }}>
          <p className="y-eyebrow">Podcast</p>
          <h1 className="y-h1" style={{ margin: "12px 0 20px" }}>Cuba, para escuchar.</h1>
          <Vacio>Los primeros episodios (automáticos y elaborados en el estudio) se publicarán aquí.</Vacio>
        </div>
      ) : edicion && (
        <div className="ypo-hero">
          <section className="ypo-on">
            <p className="y-eyebrow" style={{ color: "var(--y-pod-acc)" }}>
              {edicion.formato === "edicion_hablada" ? "Edición hablada" : `Podcast · ${edicion.tipo}`} · {fechaLarga(edicion.publicado)}
            </p>
            <h1 className="y-h1">{edicion.titulo}</h1>
            <Onda p={edicion} />
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <BotonPlay pista={pistaDe(edicion, `Podcast · ${edicion.tipo}`)} tam={58} />
              <span className="y-meta" style={{ color: "var(--y-pod-sec)" }}>
                {minutos(edicion.duracion)}{edicion.voces_sinteticas ? " · voz sintética" : ""}
              </span>
              <Link to={rutaEpisodio(edicion)} className="y-link" style={{ marginLeft: "auto", color: "var(--y-pod-acc)", fontWeight: 600 }}>
                Leer →
              </Link>
            </div>
          </section>
          <section className="ypo-caps" aria-label="Capítulos">
            <p className="y-eyebrow">Capítulos</p>
            {(edicion.capitulos || []).length === 0 && <p className="y-card-p" style={{ marginTop: 8 }}>{edicion.descripcion}</p>}
            {(edicion.capitulos || []).map((c, i) => {
              const pista = pistaDe(edicion, `Podcast · ${edicion.tipo}`);
              const on = !!pista && r?.pista?.id === pista.id && r.t.actual >= c.inicio &&
                (i === edicion.capitulos.length - 1 || r.t.actual < edicion.capitulos[i + 1].inicio);
              return (
                <button key={i} type="button" className="ypo-cap" data-on={on ? "1" : "0"}
                  onClick={() => { if (!pista) return; if (r?.pista?.id !== pista.id) r.reproducir(pista); setTimeout(() => r.buscar(c.inicio), 60); }}>
                  <span className="y-meta">{String(i + 1).padStart(2, "0")}</span>
                  <span>{c.titulo}</span>
                  <span className="y-meta">{duracion(c.inicio)}</span>
                </button>
              );
            })}
          </section>
        </div>
      )}

      {resto.length > 0 && (
        <div className="ypo-cuatro">
          {resto.slice(0, 8).map((p) => (
            <Link key={p.id} to={rutaEpisodio(p)} className="ypo-ep">
              <div className="ypo-portada">{p.portada?.url ? <img src={p.portada.url} alt="" /> : "Y"}</div>
              <p className="y-meta" style={{ margin: "12px 0 4px", textTransform: "uppercase" }}>{p.tipo} · {minutos(p.duracion)}</p>
              <b style={{ fontSize: 15, lineHeight: 1.25, display: "block" }}>{p.titulo}</b>
            </Link>
          ))}
        </div>
      )}

      <div className="ypo-pie">
        <div className="y-card y-card--auto">
          <p className="y-eyebrow">Estudios automáticos</p>
          {(est.datos?.items || []).slice(0, 3).map((e) => (
            <p key={e.id} style={{ margin: "12px 0 0", fontWeight: 700 }}>
              <Link className="y-link" style={{ color: "var(--y-auto-head)" }} to={rutaEstudio(e)}>{e.titulo}</Link>
            </p>
          ))}
          {!est.datos?.items?.length && <p className="y-card-p" style={{ marginTop: 8 }}>Pronto.</p>}
        </div>
        <div className="y-card y-card--dir">
          <p className="y-eyebrow">Expedientes dirigidos</p>
          {expedientesOrdenados.slice(0, 3).map((t) => (
            <p key={t.id} style={{ margin: "12px 0 0", fontWeight: 700 }}>
              <Link className="y-link" style={{ color: "var(--y-dir-head)" }} to={t.path}>{t.titulo}</Link>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

const CSS_E = `
.yep{max-width:820px; margin:0 auto; padding-top:30px;}
.yep-trans p{font-size:16.5px; line-height:1.62; color:var(--y-ink-2); margin:0 0 14px;}
.yep-trans b{font:600 11px var(--y-mono); letter-spacing:.06em; text-transform:uppercase; color:var(--y-accent); margin-right:8px;}
`;

export function Episodio() {
  const { slug } = useParams();
  const { datos, cargando } = useFeed("podcast.json");
  const p = (datos?.items || []).find((x) => x.slug === slug);
  const trans = useFeed(p?.transcripcion ? `podcast/${p.slug}.transcripcion.json` : null);
  const r = useReproductor();
  if (cargando) return null;
  if (!p) return <div className="y-wrap"><div className="yep"><Vacio>Episodio no encontrado. <Link className="y-link" to="/podcast">Volver a podcast →</Link></Vacio></div></div>;
  const pista = pistaDe(p, `Podcast · ${p.tipo}`);

  return (
    <div className="y-wrap">
      <style>{CSS + CSS_E}</style>
      <article className="yep">
        <section className="ypo-on">
          <p className="y-eyebrow" style={{ color: "var(--y-pod-acc)" }}>Podcast · {p.tipo} · {fechaLarga(p.publicado)}</p>
          <h1 className="y-h1" style={{ fontSize: "clamp(28px,4vw,42px)" }}>{p.titulo}</h1>
          <Onda p={p} />
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <BotonPlay pista={pista} tam={58} />
            <span className="y-meta" style={{ color: "var(--y-pod-sec)" }}>{minutos(p.duracion)}</span>
            {p.voces_sinteticas && <span className="y-badge" style={{ background: "rgba(252,249,244,.12)", color: "var(--y-pod-acc)" }}>Voces sintéticas</span>}
          </div>
        </section>

        {p.descripcion && <p className="y-lede" style={{ marginTop: 24 }}>{p.descripcion}</p>}
        {(p.participantes || []).length > 0 && (
          <p className="y-meta" style={{ marginTop: 12 }}>
            Con {p.participantes.map((x) => `${x.nombre}${x.rol ? ` (${x.rol})` : ""}`).join(", ")}
          </p>
        )}

        {(p.capitulos || []).length > 0 && (
          <div className="ypo-caps" style={{ marginTop: 22 }}>
            <p className="y-eyebrow">Capítulos</p>
            {p.capitulos.map((c, i) => (
              <button key={i} type="button" className="ypo-cap"
                onClick={() => { if (!pista) return; if (r?.pista?.id !== pista.id) r.reproducir(pista); setTimeout(() => r.buscar(c.inicio), 60); }}>
                <span className="y-meta">{String(i + 1).padStart(2, "0")}</span><span>{c.titulo}</span>
                <span className="y-meta">{duracion(c.inicio)}</span>
              </button>
            ))}
          </div>
        )}

        {trans.datos?.segmentos?.length > 0 && (
          <section className="yep-trans" style={{ marginTop: 30 }} aria-labelledby="yep-t">
            <h2 id="yep-t" className="y-h2" style={{ fontSize: 22, marginBottom: 14 }}>Transcripción</h2>
            {trans.datos.segmentos.map((s, i) => (
              <p key={i}>{s.hablante && <b>{s.hablante}</b>}{s.texto}</p>
            ))}
          </section>
        )}
      </article>
    </div>
  );
}
