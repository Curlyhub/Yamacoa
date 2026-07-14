import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Narrador from "./Narrador"; // DESACTIVADO (2026-07-07): descarga de wasm de Kokoro y
// reproducción demasiado lentas; además pendiente de revisión editorial exhaustiva del
// contenido en inglés (meta.narracion_en) generado en todos los expedientes. Reactivar
// descomentando este import y el <Narrador /> más abajo cuando ambos se resuelvan.
import temas from "../temas/registry.js";

/* Tipografías de la portada y la cabecera. Cada tema carga las suyas; aquí se
   carga el juego compartido del shell de forma encapsulada (igual que hacen los
   temas). Si la red no está disponible, cae a la pila del sistema sin error. */
const FUENTE_SHELL =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";

/* Tokens del sistema de diseño compartido (AGENTS.md). El acento es por tema. */
const CSS = `
.ym-app{
  --ym-bg:#0C0E14; --ym-panel:#161A26; --ym-line:rgba(237,239,245,.12);
  --ym-text:#EDEFF5; --ym-dim:#8A93A8;
  --ym-display:'Space Grotesk',system-ui,sans-serif;
  --ym-body:'Inter',system-ui,sans-serif;
  --ym-mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
  min-height:100vh; display:flex; flex-direction:column;
  background:var(--ym-bg); color:var(--ym-text); font-family:var(--ym-body);
}
.ym-app *{box-sizing:border-box;}

.ym-header{
  border-bottom:1px solid var(--ym-line);
  background:rgba(12,14,20,.78);
}
.ym-header-in{
  max-width:1080px; margin:0 auto; padding:16px 22px;
  display:flex; align-items:center; gap:18px; flex-wrap:wrap;
}
.ym-brand{
  display:inline-flex; align-items:baseline; gap:10px;
  text-decoration:none; color:var(--ym-text);
}
.ym-brand-mark{
  font-family:var(--ym-display); font-weight:700; font-size:18px;
  letter-spacing:.18em;
}
.ym-brand-mark span{ color:var(--ym-accent,#38D6C9); }
.ym-brand-sub{
  font-family:var(--ym-mono); font-size:10.5px; letter-spacing:.22em;
  text-transform:uppercase; color:var(--ym-dim);
}
.ym-nav{ margin-left:auto; display:flex; align-items:center; gap:14px; }
.ym-tema-tag{
  font-family:var(--ym-mono); font-size:10.5px; letter-spacing:.2em;
  text-transform:uppercase; color:var(--ym-accent,#8A93A8);
}
.ym-back{
  font-family:var(--ym-mono); font-size:12px; letter-spacing:.04em;
  text-decoration:none; color:var(--ym-dim);
  border:1px solid var(--ym-line); border-radius:999px; padding:6px 13px;
}
.ym-back:hover{ color:var(--ym-text); border-color:var(--ym-accent,var(--ym-line)); }

.ym-share{
  font-family:var(--ym-mono); font-size:12px; letter-spacing:.04em;
  text-decoration:none; color:var(--ym-dim);
  border:1px solid var(--ym-line); border-radius:999px; padding:6px 13px;
}
.ym-share:hover{ color:var(--ym-text); border-color:var(--ym-accent,var(--ym-line)); }

.ym-main{ flex:1; width:100%; }

a:focus-visible, .ym-app [tabindex]:focus-visible{
  outline:2px solid var(--ym-accent,#38D6C9); outline-offset:3px;
  border-radius:6px;
}

@media (max-width:560px){
  .ym-header-in{ padding:13px 16px; }
  .ym-brand-sub{ display:none; }
}
@media (prefers-reduced-motion:no-preference){
  .ym-back{ transition:color .18s ease, border-color .18s ease; }
}
`;

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, "") || "/";
  const temaActivo = temas.find((t) => t.path === path);
  const shareHref =
  temaActivo && typeof window !== "undefined"
    ? "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent(`${temaActivo.titulo} — Yamacoa`) +
      "&url=" + encodeURIComponent(window.location.href)
      // + "&via=yamacoa"   // descomenta si tienes cuenta @yamacoa
      // + "&hashtags=Cuba" // opcional
    : null;

  // Carga encapsulada del juego de tipografías del shell (una sola vez).
  useEffect(() => {
    const id = "ym-fuente-shell";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = FUENTE_SHELL;
    document.head.appendChild(link);
  }, []);

  const accentStyle = temaActivo ? { "--ym-accent": temaActivo.accent } : undefined;

  return (
    <div className="ym-app" style={accentStyle}>
      <style>{CSS}</style>

      <header className="ym-header">
        <div className="ym-header-in">
          <Link to="/" className="ym-brand" aria-label="Yamacoa, ir a la portada">
            <span className="ym-brand-mark">
              YAMA<span>COA</span>
            </span>
            <span className="ym-brand-sub">Observatorio</span>
          </Link>
          {temaActivo && (
            <nav className="ym-nav" aria-label="Navegación del tema">
              <span className="ym-tema-tag">{temaActivo.etiqueta}</span>
              <a className="ym-share"
                href={shareHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Compartir ${temaActivo.titulo} en X`}
              >
                Compartir en X
              </a>
              <Link to="/" className="ym-back">
                ← Volver a la portada
              </Link>
            </nav>
          )}
        </div>
      </header>

      <main className="ym-main">{children}</main>
      {<Narrador /> }
    </div>
  );
}
