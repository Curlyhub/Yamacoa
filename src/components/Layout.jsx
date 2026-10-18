import { useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Narrador from "./Narrador";
import temas from "../temas/registry.js";
import { TOKENS_CSS, cargarFuentes } from "../design/tokens";
import { ReproductorProvider } from "../periodico/Reproductor";
import { fechaLarga, useFeed } from "../periodico/feed";
import { haySesionGuardada } from "../periodico/cuenta";

/* Carcasa unificada del periódico (handoff 2026-10, dirección 1a).
   Barra de fecha + cabecera (masthead grande en portada, compacta en el resto) +
   navegación por tipología. Fuera de la portada, una línea de ruta (Portada › sección)
   para volver siempre; en un expediente, la franja con su etiqueta, compartir y volver.
   Tokens en design/tokens.js. */

const NAV = [
  { to: "/", t: "Portada", end: true },
  { to: "/noticias", t: "Noticias" },
  { to: "/estudios", t: "Estudios" },
  { to: "/expedientes", t: "Expedientes" },
  { to: "/podcast", t: "Podcast" },
];
// «Opinión» solo aparece cuando hay artículos publicados (feed opinion.json con items).
const OPINION = { to: "/opinion", t: "Opinión" };

const CSS = `
.yl-app{min-height:100vh; display:flex; flex-direction:column; color:var(--y-ink); font-family:var(--y-font);}
.yl-top{display:flex; justify-content:space-between; gap:16px; padding:14px 0 12px; border-bottom:1px solid var(--y-rule);
  font:500 10.5px var(--y-mono); letter-spacing:.12em; text-transform:uppercase; color:var(--y-muted);}
.yl-top span:nth-child(2){text-align:center;}
.yl-head{display:flex; align-items:flex-end; gap:24px; flex-wrap:wrap; padding:22px 0 18px; border-bottom:3px solid var(--y-ink);}
.yl-brand{text-decoration:none; color:var(--y-ink); display:block;}
.yl-brand small{display:block; font:500 10.5px var(--y-mono); letter-spacing:.14em; text-transform:uppercase;
  color:var(--y-accent); margin-bottom:6px;}
.yl-brand b{display:block; font-weight:800; letter-spacing:-.04em; line-height:.9; font-size:clamp(46px,7vw,72px);}
.yl-app[data-compacta="1"] .yl-head{padding:14px 0 12px; align-items:center;}
.yl-app[data-compacta="1"] .yl-brand small{display:none;}
.yl-app[data-compacta="1"] .yl-brand b{font-size:30px; letter-spacing:-.035em;}
.yl-nav{margin-left:auto; display:flex; align-items:center; gap:clamp(10px,2vw,22px); flex-wrap:wrap;}
.yl-nav a:not(.y-btn){font-size:15px; font-weight:500; color:var(--y-ink); text-decoration:none; padding:4px 0;
  border-bottom:2px solid transparent;}
.yl-nav a:not(.y-btn):hover{color:var(--y-accent);}
.yl-nav a.active{border-bottom-color:var(--y-accent);}
.yl-nav .y-btn{color:var(--y-surface); border:0;}
.yl-nav .y-btn:hover{color:var(--y-surface); background:var(--y-accent);}
.yl-exp{display:flex; align-items:center; gap:12px; flex-wrap:wrap; padding:12px 0; border-bottom:1px solid var(--y-rule);}
.yl-exp-tag{font:500 10.5px var(--y-mono); letter-spacing:.12em; text-transform:uppercase;}
.yl-exp-acc{margin-left:auto; display:flex; gap:8px;}
.yl-exp-acc a{font:500 11.5px var(--y-mono); color:var(--y-muted); text-decoration:none; padding:6px 13px;
  border-radius:999px; box-shadow:inset 0 0 0 1px var(--y-rule);}
.yl-exp-acc a:hover{color:var(--y-ink); box-shadow:inset 0 0 0 1px var(--y-accent);}
.yl-migas{display:flex; align-items:center; gap:8px; flex-wrap:wrap; padding:12px 0; border-bottom:1px solid var(--y-rule);
  font:500 11px var(--y-mono); letter-spacing:.08em; text-transform:uppercase; color:var(--y-subtle);}
.yl-migas a{color:var(--y-muted); text-decoration:none;}
.yl-migas a:hover{color:var(--y-accent);}
.yl-migas [aria-current]{color:var(--y-ink);}
.yl-main{flex:1; width:100%; padding-bottom:96px;}
.yl-pie{border-top:3px solid var(--y-ink); padding:22px 0 40px; display:flex; gap:20px; flex-wrap:wrap;
  justify-content:space-between; font:500 11px var(--y-mono); letter-spacing:.08em; text-transform:uppercase; color:var(--y-muted);}
.yl-pie a{color:inherit;}
.yl-pie a:hover{color:var(--y-accent);}
@media (max-width:720px){
  .yl-top span:nth-child(2), .yl-top span:nth-child(3){display:none;}
  .yl-nav{margin-left:0; width:100%;}
  .yl-nav a:not(.y-btn){font-size:14px;}
}
`;

// Sección de cada ruta interior, para la línea de ruta. El detalle (noticia, episodio,
// estudio) enlaza a su sección; la sección es la página actual.
const SECCIONES = { noticias: "Noticias", estudios: "Estudios", expedientes: "Expedientes", podcast: "Podcast",
  metodologia: "Metodología", suscribete: "Suscríbete", opinion: "Opinión" };

function Migas({ path }) {
  const [, sec, detalle] = path.split("/");
  if (!SECCIONES[sec]) return null;
  return (
    <nav className="yl-migas" aria-label="Estás en">
      <Link to="/">← Portada</Link>
      <span aria-hidden="true">›</span>
      {detalle ? <Link to={`/${sec}`}>{SECCIONES[sec]}</Link> : <span aria-current="page">{SECCIONES[sec]}</span>}
    </nav>
  );
}

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, "") || "/";
  const temaActivo = temas.find((t) => t.path === path);
  const portada = path === "/";
  const opinion = useFeed("opinion.json");
  const nav = opinion.datos?.items?.length ? [...NAV.slice(0, 2), OPINION, ...NAV.slice(2)] : NAV;

  useEffect(cargarFuentes, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  const shareHref =
    temaActivo && typeof window !== "undefined"
      ? "https://twitter.com/intent/tweet?text=" +
        encodeURIComponent(`${temaActivo.titulo} · Yamacoa`) +
        "&url=" + encodeURIComponent(window.location.href)
      : null;

  return (
    <ReproductorProvider>
      <style>{TOKENS_CSS + CSS}</style>
      <div className="yl-app" data-compacta={portada ? "0" : "1"}>
        <div className="y-wrap">
          {portada && (
            <div className="yl-top">
              <span>{fechaLarga(new Date())}</span>
              <span>Observatorio independiente · Cuba</span>
              <span>Datos abiertos y verificados</span>
            </div>
          )}
          <header className="yl-head">
            <Link to="/" className="yl-brand" aria-label="Yamacoa, ir a la portada">
              <small>Observatorio independiente</small>
              <b>Yamacoa</b>
            </Link>
            <nav className="yl-nav" aria-label="Secciones">
              {nav.map((n) => (
                <NavLink key={n.to} to={n.to} end={n.end}>{n.t}</NavLink>
              ))}
              <Link to="/suscribete" className="y-btn">{haySesionGuardada() ? "Mi cuenta" : "Suscríbete"}</Link>
            </nav>
          </header>
          {!portada && !temaActivo && <Migas path={path} />}
          {temaActivo && (
            <div className="yl-exp">
              <Link to="/" className="yl-exp-tag" style={{ color: "var(--y-muted)", textDecoration: "none" }}>← Portada</Link>
              <span className="y-badge y-badge--dir">Expediente dirigido</span>
              <span className="yl-exp-tag" style={{ color: "var(--y-dir-ink)" }}>{temaActivo.etiqueta}</span>
              <span className="yl-exp-acc">
                <a href={shareHref} target="_blank" rel="noopener noreferrer"
                  aria-label={`Compartir ${temaActivo.titulo} en X`}>Compartir en X</a>
                <Link to="/expedientes">← Todos los expedientes</Link>
              </span>
            </div>
          )}
        </div>

        <main className="yl-main">{children}</main>

        <div className="y-wrap">
          <footer className="yl-pie">
            <span>Yamacoa · Observatorio independiente sobre Cuba</span>
            <span>
              <Link to="/metodologia">Metodología</Link> · <Link to="/expedientes">Archivo</Link>
            </span>
          </footer>
        </div>
      </div>
      <Narrador />
    </ReproductorProvider>
  );
}
