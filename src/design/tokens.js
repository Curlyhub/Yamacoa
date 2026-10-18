/* Sistema de diseño unificado de Yamacoa ("periódico", handoff 2026-10).
   Fuente única de tokens para la carcasa, las landings por tipología y las
   plantillas de noticia / estudio automático / episodio. Los expedientes
   migrados consumen las mismas variables (ver skill unificar-estilo).

   Regla de sistema: el color codifica el ORIGEN del contenido.
     salvia   = automático (noticias y estudios automáticos)
     melocotón = dirigido (expedientes)
     marrón    = podcast */

// Alojadas en Yamacoa (public/fonts/), no en Google Fonts: el lector no comunica su IP a terceros.
export const FUENTES_URL = `${process.env.PUBLIC_URL || ""}/fonts/fuentes.css`;

export const T = {
  bg: "#efe8df",
  glowPeach: "#f6d9c6",
  glowSage: "#d5e3da",
  // Progreso de audio: el degradado del fondo (melocotón → salvia), saturado para que se lea
  // como trazo fino sobre cualquier superficie. Solo para interacción, nunca para datos.
  progA: "#e07a45",
  progB: "#2fa596",
  surface: "#fcf9f4",
  surface2: "#f5efe7",
  ink: "#1f1a16",
  ink2: "#4a3f36",
  muted: "#6b5d50",
  subtle: "#8a7a68",
  accent: "#b8562e",
  dark: "#3a2418",
  autoBg: "#dfe9e1",
  autoInk: "#2f5640",
  autoHead: "#1f3a2b",
  dirBg: "#f2cdb8",
  dirInk: "#6b2f16",
  dirHead: "#4a200c",
  podBg: "#3a2418",
  podInk: "#fcf9f4",
  podAcc: "#f2cdb8",
  podSec: "#c9a893",
  rule: "rgba(60,40,20,.15)",
  font: "'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif",
  mono: "'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace",
};

/* Variables CSS + componentes recurrentes. Se inyecta UNA vez desde Layout. */
export const TOKENS_CSS = `
:root{
  --y-bg:${T.bg}; --y-surface:${T.surface}; --y-surface-2:${T.surface2};
  --y-ink:${T.ink}; --y-ink-2:${T.ink2}; --y-muted:${T.muted}; --y-subtle:${T.subtle};
  --y-accent:${T.accent}; --y-dark:${T.dark}; --y-rule:${T.rule};
  --y-prog-a:${T.progA}; --y-prog-b:${T.progB};
  --y-auto-bg:${T.autoBg}; --y-auto-ink:${T.autoInk}; --y-auto-head:${T.autoHead};
  --y-dir-bg:${T.dirBg}; --y-dir-ink:${T.dirInk}; --y-dir-head:${T.dirHead};
  --y-pod-bg:${T.podBg}; --y-pod-ink:${T.podInk}; --y-pod-acc:${T.podAcc}; --y-pod-sec:${T.podSec};
  --y-font:${T.font}; --y-mono:${T.mono};
  --y-shadow:0 1px 2px rgba(40,25,10,.04),0 10px 30px rgba(40,25,10,.055);
  --y-shadow-hover:0 2px 4px rgba(40,25,10,.06),0 16px 40px rgba(40,25,10,.09);
  --y-wrap:1200px;
}
html{background:var(--y-bg);}
body{
  margin:0; color:var(--y-ink); font-family:var(--y-font);
  background:
    radial-gradient(ellipse 70% 50% at 0% 0%, ${T.glowPeach} 0%, transparent 60%),
    radial-gradient(ellipse 60% 45% at 100% 0%, ${T.glowSage} 0%, transparent 60%),
    var(--y-bg);
  background-repeat:no-repeat; background-color:var(--y-bg);
  -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
}
.y-wrap{width:100%; box-sizing:border-box; max-width:var(--y-wrap); margin:0 auto; padding-inline:clamp(16px,3.4vw,40px);}
.y-wrap *{box-sizing:border-box;}

.y-eyebrow{font-family:var(--y-mono); font-size:11px; font-weight:500; letter-spacing:.12em;
  text-transform:uppercase; color:var(--y-accent); margin:0;}
.y-meta{font-family:var(--y-mono); font-size:10.5px; letter-spacing:.06em; color:var(--y-subtle);}
.y-h1{font-size:clamp(32px,5vw,52px); font-weight:800; letter-spacing:-.035em; line-height:1.02; margin:0;}
.y-h2{font-size:28px; font-weight:800; letter-spacing:-.02em; margin:0;}
.y-lede{font-size:clamp(16px,1.6vw,18px); line-height:1.55; color:var(--y-ink-2); margin:0;}
.y-rule-top{border-top:3px solid var(--y-ink);}

.y-card{background:var(--y-surface); border-radius:24px; padding:22px 24px; box-shadow:var(--y-shadow);
  text-decoration:none; color:inherit; display:block;}
a.y-card{transition:box-shadow .2s ease, transform .2s ease;}
a.y-card:hover{box-shadow:var(--y-shadow-hover); transform:translateY(-1px);}
.y-card--auto{background:var(--y-auto-bg);}
.y-card--auto .y-eyebrow{color:var(--y-auto-ink);}
.y-card--auto .y-card-t{color:var(--y-auto-head);}
.y-card--dir{background:var(--y-dir-bg);}
.y-card--dir .y-eyebrow{color:var(--y-dir-ink);}
.y-card--dir .y-card-t{color:var(--y-dir-head);}
.y-card--pod{background:var(--y-pod-bg); color:var(--y-pod-ink);}
.y-card--pod .y-eyebrow{color:var(--y-pod-acc);}
.y-card-t{font-size:19px; font-weight:800; letter-spacing:-.015em; line-height:1.22; margin:10px 0 8px;}
.y-card-p{font-size:14px; line-height:1.5; color:var(--y-muted); margin:0;}
.y-card--pod .y-card-p{color:var(--y-pod-sec);}

.y-badge{display:inline-block; font-family:var(--y-mono); font-size:10px; font-weight:500;
  letter-spacing:.08em; text-transform:uppercase; padding:4px 10px; border-radius:999px; white-space:nowrap;}
.y-badge--auto{background:var(--y-auto-bg); color:var(--y-auto-ink);}
.y-badge--dir{background:var(--y-dir-bg); color:var(--y-dir-ink);}
.y-badge--pod{background:var(--y-pod-bg); color:var(--y-pod-acc);}
.y-badge--neutro{background:var(--y-surface-2); color:var(--y-muted);}

.y-btn{display:inline-flex; align-items:center; gap:8px; background:var(--y-dark); color:var(--y-surface);
  font:600 14px var(--y-font); padding:10px 18px; border-radius:999px; border:0; cursor:pointer; text-decoration:none;}
.y-btn--ghost{background:transparent; color:var(--y-ink); box-shadow:inset 0 0 0 1px var(--y-rule);}
.y-chip{font:500 11px var(--y-mono); letter-spacing:.06em; text-transform:uppercase; padding:6px 12px;
  border-radius:999px; border:0; background:var(--y-surface-2); color:var(--y-muted); cursor:pointer;}
.y-chip[aria-pressed="true"]{background:var(--y-dark); color:var(--y-surface);}

.y-play{flex-shrink:0; width:44px; height:44px; border-radius:50%; border:0; cursor:pointer;
  display:grid; place-items:center; background:var(--y-surface); color:var(--y-dark);}
.y-play--dark{background:var(--y-dark); color:var(--y-surface);}
/* Anillo de progreso del botón: naranja → turquesa a medida que avanza el audio. */
.y-play-caja{position:relative; display:inline-grid; place-items:center; flex-shrink:0; border-radius:50%;}
.y-play-anillo{position:absolute; inset:-5px; border-radius:50%; pointer-events:none;
  background:conic-gradient(in oklch, var(--y-prog-a) 0deg, var(--y-prog-b) calc(var(--p, 0) * 360deg),
    rgba(150,125,100,.25) calc(var(--p, 0) * 360deg));
  -webkit-mask:radial-gradient(farthest-side, transparent calc(100% - 3.5px), #000 calc(100% - 3px));
  mask:radial-gradient(farthest-side, transparent calc(100% - 3.5px), #000 calc(100% - 3px));}

.y-vida{height:3px; border-radius:2px; background:rgba(60,40,20,.1); overflow:hidden; margin-top:10px;}
.y-vida > i{display:block; height:100%; background:var(--y-accent);}

.y-link{color:inherit; text-decoration:none;}
.y-link:hover{color:var(--y-accent); text-decoration:underline; text-underline-offset:3px;}

.y-vacio{border:1.5px dashed var(--y-rule); border-radius:24px; padding:28px; color:var(--y-muted);
  font-size:14px; line-height:1.55; background:rgba(252,249,244,.5);}
.y-placeholder{border-radius:24px; min-height:220px;
  background:repeating-linear-gradient(135deg,rgba(60,40,20,.05) 0 12px,transparent 12px 24px), var(--y-surface-2);}

.y-confianza{font:500 10px var(--y-mono); letter-spacing:.08em; text-transform:uppercase; padding:3px 8px; border-radius:6px;}
.y-confianza--corroborada{background:var(--y-auto-bg); color:var(--y-auto-ink);}
.y-confianza--no_confirmada{background:#f6e3c4; color:#7a4a0c;}
.y-confianza--en_desarrollo{background:var(--y-surface-2); color:var(--y-muted);}

a:focus-visible, button:focus-visible, input:focus-visible, [tabindex]:focus-visible{
  outline:2px solid var(--y-accent); outline-offset:3px; border-radius:6px;}
@media (prefers-reduced-motion:reduce){ a.y-card{transition:none;} a.y-card:hover{transform:none;} }
`;

export function cargarFuentes() {
  if (typeof document === "undefined") return;
  if (document.getElementById("y-fuentes")) return;
  const l = document.createElement("link");
  l.id = "y-fuentes";
  l.rel = "stylesheet";
  l.href = FUENTES_URL;
  document.head.appendChild(l);
}
