import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import temas from "../temas/registry.js";

/* Portada de Yamacoa. Toda la rejilla se deriva del registry: añadir un tema no
   toca este archivo. Estilos encapsulados; usa los tokens del shell (Layout). */

/* Orden de la rejilla: los más recientes arriba.
   Se ordena por `publicado` (fecha de publicación, estable) y NO por el
   `actualizado` del dataset, que se mueve con cada /refrescar: si ordenáramos
   por ese, un expediente antiguo recién refrescado saltaría al primer puesto
   como si fuera nuevo. Array.sort es estable desde ES2019, así que los temas
   publicados el mismo día conservan el orden en que están en el registry.
   El registry sigue siendo append-only: /importar añade al final y esto lo
   coloca donde toca. */
const temasOrdenados = [...temas].sort((a, b) =>
  String(b.publicado || "").localeCompare(String(a.publicado || ""))
);
const CSS = `
.ym-landing{ max-width:1080px; margin:0 auto; padding:0 22px 72px; }

/* ── Hero ── */
.ym-hero{
  position:relative; overflow:hidden;
  padding:84px 4px 60px; border-bottom:1px solid var(--ym-line);
}
.ym-hero-bg{
  position:absolute; inset:0; pointer-events:none; z-index:0;
  background:
    radial-gradient(60% 70% at 18% -10%, rgba(56,214,201,.16), transparent 60%),
    radial-gradient(55% 70% at 92% 0%, rgba(212,174,87,.14), transparent 60%);
}
.ym-hero-grid{
  position:absolute; inset:0; z-index:0; pointer-events:none; opacity:.5;
  background-image:
    linear-gradient(rgba(237,239,245,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(237,239,245,.05) 1px, transparent 1px);
  background-size:42px 42px;
  mask-image:radial-gradient(80% 70% at 50% 0%, #000 35%, transparent 78%);
  -webkit-mask-image:radial-gradient(80% 70% at 50% 0%, #000 35%, transparent 78%);
}
.ym-hero > *{ position:relative; z-index:1; }
.ym-eyebrow{
  font-family:var(--ym-mono); font-size:11.5px; letter-spacing:.34em;
  text-transform:uppercase; color:var(--ym-dim); margin:0 0 22px;
  display:flex; align-items:center; gap:12px;
}
.ym-eyebrow::before{
  content:""; width:30px; height:1px; background:var(--ym-dim);
}
.ym-wordmark{
  font-family:var(--ym-display); font-weight:700;
  writing-mode:vertical-rl;
  font-size:clamp(26px,3.2vw,42px); line-height:.92; margin:0;
  letter-spacing:-.02em;
  background:linear-gradient(180deg,#EDEFF5 30%,#38D6C9 70%,#D4AE57 110%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  flex-shrink:0; align-self:stretch;
}
.ym-hero-row{
  display:flex; align-items:stretch; gap:36px; margin-top:22px;
}
.ym-hero-body{ flex:1; min-width:0; }
.ym-lede{
  font-size:clamp(16px,2.1vw,20px); line-height:1.55; color:#C7CDDB;
  max-width:640px; margin:26px 0 0;
}
.ym-meta{
  margin:34px 0 0; display:flex; flex-wrap:wrap; gap:10px 16px;
  font-family:var(--ym-mono); font-size:11.5px; letter-spacing:.12em;
  text-transform:uppercase; color:var(--ym-dim);
}
.ym-meta li{ list-style:none; display:flex; align-items:center; gap:8px; }
.ym-meta li + li::before{
  content:""; width:4px; height:4px; border-radius:50%;
  background:var(--ym-line); margin-right:8px;
}
.ym-meta b{ color:var(--ym-text); font-weight:600; }
.ym-meta-link{
  color:inherit; text-decoration:none;
  border-bottom:1px solid var(--ym-line); padding-bottom:1px;
  transition:color .15s, border-color .15s;
}
.ym-meta-link:hover, .ym-meta-link:focus-visible{
  color:var(--ym-text); border-bottom-color:var(--ym-text);
}

/* ── Rejilla de temas ── */
.ym-grid{
  display:grid; gap:18px;
  grid-template-columns:repeat(auto-fill, minmax(290px, 1fr));
}

/* ── Scroll reveal (wrapper) ── */
.ym-card-reveal{
  opacity:0;
  transform:translateY(20px);
  transition:
    opacity  0.44s cubic-bezier(.2,.7,.3,1) var(--rd, 0ms),
    transform 0.44s cubic-bezier(.2,.7,.3,1) var(--rd, 0ms);
}
.ym-card-reveal.ym-visible{
  opacity:1;
  transform:none;
}
@media (prefers-reduced-motion: reduce){
  .ym-card-reveal{ opacity:1; transform:none; transition:none; }
}

/* ── Tarjeta ── */
.ym-card{
  --accent:#38D6C9;
  position:relative; display:flex; flex-direction:column;
  text-decoration:none; color:inherit;
  background:var(--ym-panel); border:1px solid var(--ym-line);
  border-radius:16px; padding:24px 22px 20px; min-height:236px;
  overflow:hidden;
}
.ym-card::before{
  content:""; position:absolute; inset:0 0 auto 0; height:3px;
  background:var(--accent); opacity:.55;
}
.ym-card-tag{
  display:inline-flex; align-items:center; gap:9px;
  font-family:var(--ym-mono); font-size:10.5px; letter-spacing:.22em;
  text-transform:uppercase; color:var(--accent); margin:6px 0 16px;
}
.ym-card-dot{ width:7px; height:7px; border-radius:50%; background:var(--accent); }
.ym-card-titulo{
  font-family:var(--ym-display); font-weight:600;
  font-size:clamp(21px,2.6vw,25px); line-height:1.12; margin:0;
  letter-spacing:-.01em;
}
.ym-card-sub{
  font-size:14.5px; line-height:1.5; color:var(--ym-dim);
  margin:12px 0 0;
}
.ym-card-foot{
  margin-top:auto; padding-top:18px;
  display:flex; align-items:flex-end; justify-content:space-between; gap:14px;
}
.ym-card-fuentes{
  font-family:var(--ym-mono); font-size:10.5px; line-height:1.5;
  letter-spacing:.04em; color:var(--ym-dim); max-width:78%;
}
.ym-card-fuentes b{
  display:block; color:#6B7589; text-transform:uppercase;
  letter-spacing:.2em; font-size:9.5px; margin-bottom:4px; font-weight:500;
}
.ym-card-abrir{
  font-family:var(--ym-mono); font-size:12px; white-space:nowrap;
  color:var(--accent); display:inline-flex; align-items:center; gap:6px;
}
.ym-card-abrir span{ display:inline-block; }

/* ── Procedencia (no negociable) ── */
.ym-procedencia{
  margin:56px auto 0; padding-top:22px; border-top:1px solid var(--ym-line);
  display:grid; gap:14px; max-width:760px; text-align:center;
}
.ym-procedencia p{
  margin:0; font-size:13px; line-height:1.6; color:var(--ym-dim);
}
.ym-procedencia p::before{
  content:"·"; color:var(--ym-line); margin-right:10px; font-weight:700;
}

@media (prefers-reduced-motion:no-preference){
  .ym-card{ transition:transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
  .ym-card::before{ transition:opacity .2s ease, height .2s ease; }
  .ym-card-abrir span{ transition:transform .2s ease; }
}
.ym-card:hover, .ym-card:focus-visible{
  border-color:var(--accent);
  box-shadow:0 16px 40px -28px var(--accent);
}
.ym-card:hover{ transform:translateY(-3px); }
.ym-card:hover::before, .ym-card:focus-visible::before{ opacity:1; height:4px; }
.ym-card:hover .ym-card-abrir span{ transform:translateX(4px); }
.ym-card:focus-visible{ outline:2px solid var(--accent); outline-offset:3px; }

/* ── Separador de sección ── */
.ym-section-divider{
  margin:52px 0 18px; padding-bottom:18px;
  border-bottom:1px solid var(--ym-line);
  display:flex; align-items:baseline; justify-content:space-between; gap:16px;
}
.ym-section-divider h2{
  font-family:var(--ym-display); font-weight:700; font-size:13px;
  letter-spacing:.1em; text-transform:uppercase; margin:0; color:var(--ym-text);
}
.ym-section-divider span{
  font-family:var(--ym-mono); font-size:11px; letter-spacing:.14em;
  color:var(--ym-dim); text-transform:uppercase;
}

@media (max-width:560px){
  .ym-hero{ padding:60px 2px 44px; }
  .ym-hero-row{ flex-direction:column-reverse; gap:16px; }
  .ym-wordmark{ writing-mode:horizontal-tb; font-size:clamp(44px,12vw,72px); }
  .ym-grid{ grid-template-columns:1fr; }
}
`;

export default function Landing() {
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || typeof IntersectionObserver === "undefined") {
      // Sin soporte: mostrar todas las tarjetas inmediatamente
      grid && grid.querySelectorAll(".ym-card-reveal").forEach((el) => el.classList.add("ym-visible"));
      return;
    }
    const items = grid.querySelectorAll(".ym-card-reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("ym-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );
    items.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="ym-landing">
      <style>{CSS}</style>

      <section className="ym-hero" aria-labelledby="ym-hero-title">
        <div className="ym-hero-bg" aria-hidden="true" />
        <div className="ym-hero-grid" aria-hidden="true" />

        <p className="ym-eyebrow">Instituto de análisis independiente · Cuba</p>

        <div className="ym-hero-row">
          <div className="ym-hero-body">
            <p className="ym-lede">
              Entender Cuba es el primer paso para cambiarla. Reunimos
              periodismo contrastado, datos abiertos y análisis cuantitativo
              para informar y formar al cubano — dentro o fuera de la isla —
              en el debate por un futuro democrático acorde con los principios
              universales de libertad y derechos humanos.
            </p>
            <ul className="ym-meta">
              <li>
                <b>{temas.length}</b> expedientes publicados
              </li>
              <li>Fuentes documentadas</li>
              <li><Link to="/metodologia" className="ym-meta-link">Metodología reproducible</Link></li>
            </ul>
          </div>
          <h1 className="ym-wordmark" id="ym-hero-title">Yamacoa</h1>
        </div>
      </section>

      <div className="ym-section-divider">
        <h2>Expedientes</h2>
        <span>{temas.length} publicados</span>
      </div>

      <div className="ym-grid" ref={gridRef}>
        {temasOrdenados.map((t, i) => (
          <div
            key={t.id}
            className="ym-card-reveal"
            style={{ "--rd": `${i * 90}ms` }}
          >
            <Link
              to={t.path}
              className="ym-card"
              style={{ "--accent": t.accent }}
              aria-label={`Abrir el análisis: ${t.titulo}`}
            >
              <div className="ym-card-tag">
                <span className="ym-card-dot" aria-hidden="true" />
                {t.etiqueta}
              </div>
              <h3 className="ym-card-titulo">{t.titulo}</h3>
              <p className="ym-card-sub">{t.subtitulo}</p>
              <div className="ym-card-foot">
                <p className="ym-card-fuentes">
                  <b>Fuentes</b>
                  {t.fuentes}
                </p>
                <span className="ym-card-abrir">
                  Abrir <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <footer className="ym-procedencia">
        <p>
          Cuando un expediente identifica a personas o entidades, lo hace a
          partir de periodismo de investigación, documentos oficiales o registros
          públicos. Los vínculos se presentan como reportados o documentados, no
          como determinaciones de culpabilidad. Las fuentes primarias se citan
          dentro de cada expediente.
        </p>
        <p>
          Yamacoa es un proyecto independiente sin financiación gubernamental ni
          partidista. Los modelos, los datos y los métodos empleados en cada
          análisis se describen en las notas metodológicas del expediente
          correspondiente.
        </p>
        <p>
          Yamacoa es un canal del <em>Grupo de las Marianas</em> — creadoras
          del hashtag <strong>#CubaEstadoFallido</strong>.
        </p>
      </footer>
    </div>
  );
}
