// Tarjeta para compartir (1200x630) de UN expediente, con la piel del periódico (2026-10):
//
//   node scripts/og-tarjeta.mjs <slug> [<slug>…] && npm run gen:social
//   node scripts/og-tarjeta.mjs --todos            (todas las del registry)
//
// Escribe public/og-<slug>.png; gen-social-meta.mjs la detecta y el middleware la sirve como
// og:image / twitter:image (WhatsApp, Telegram, Facebook y X la muestran al pegar el enlace).
// Título, subtítulo, etiqueta y color salen de src/temas/registry.js. A diferencia de
// gen-og-cards.mjs (julio, tema oscuro, rehace TODAS las tarjetas), esta solo toca los slugs
// que se le pasan y se rasteriza con Chromium headless para usar las tipografías reales del
// sitio (public/fonts). Chromium: $CHROME o el de Playwright en ~/.cache/ms-playwright.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
if (!args.length) { console.error("uso: node scripts/og-tarjeta.mjs <slug> [<slug>…] | --todos"); process.exit(1); }

function chromium() {
  if (process.env.CHROME) return process.env.CHROME;
  for (const base of [join(homedir(), ".cache/ms-playwright"), "/root/.cache/ms-playwright", ...(existsSync("/home") ? readdirSync("/home").map((u) => join("/home", u, ".cache/ms-playwright")) : [])]) {
    if (!existsSync(base)) continue;
    for (const d of readdirSync(base).filter((x) => x.startsWith("chromium-")).sort().reverse()) {
      const bin = join(base, d, "chrome-linux/chrome");
      if (existsSync(bin)) return bin;
    }
  }
  throw new Error("No encuentro Chromium: define CHROME=/ruta/al/chrome");
}

// Mismo truco que gen-social-meta.mjs: registry.js y tokens.js son ESM en un paquete CJS.
const tmp = mkdtempSync(join(tmpdir(), "yamacoa-og-"));
writeFileSync(join(tmp, "registry.mjs"), readFileSync(resolve(ROOT, "src/temas/registry.js"), "utf8"));
writeFileSync(join(tmp, "tokens.mjs"), readFileSync(resolve(ROOT, "src/design/tokens.js"), "utf8"));
const temas = (await import(pathToFileURL(join(tmp, "registry.mjs")).href)).default;
const slugs = args.includes("--todos") ? temas.map((t) => t.slug) : args;
const { T } = await import(pathToFileURL(join(tmp, "tokens.mjs")).href);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fuentes = pathToFileURL(resolve(ROOT, "public/fonts/fuentes.css")).href;

// El título cabe en dos líneas como mucho; si ocupa dos, el subtítulo baja a dos.
const cuerpo = (n) => (n <= 24 ? [84, 3] : n <= 44 ? [70, 2] : [58, 2]);

const html = (t) => { const [tam, lineas] = cuerpo(t.titulo.length); return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<link rel="stylesheet" href="${fuentes}">
<style>
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{position:relative}
body{font-family:${T.font};color:${T.ink};background:
  radial-gradient(ellipse 70% 60% at 0% 0%, ${T.glowPeach} 0%, transparent 62%),
  radial-gradient(ellipse 60% 55% at 100% 0%, ${T.glowSage} 0%, transparent 60%), ${T.bg};
  padding:58px 72px 54px;display:flex;flex-direction:column}
.top{display:flex;align-items:center;gap:18px;padding-bottom:22px;border-bottom:4px solid ${T.ink}}
.marca{font-weight:800;font-size:40px;letter-spacing:-.035em}
.badge{font:500 15px ${T.mono};letter-spacing:.12em;text-transform:uppercase;background:${T.dirBg};color:${T.dirInk};
  padding:7px 14px;border-radius:999px}
.dom{margin-left:auto;font:500 17px ${T.mono};letter-spacing:.06em;color:${T.muted}}
.eti{margin-top:40px;font:600 19px ${T.mono};letter-spacing:.14em;text-transform:uppercase;color:${t.accent}}
h1{margin-top:14px;font-weight:800;font-size:${tam}px;line-height:1;letter-spacing:-.04em;max-width:1000px}
p{margin-top:24px;font-size:27px;line-height:1.38;color:${T.ink2};max-width:1020px;
  display:-webkit-box;-webkit-line-clamp:${lineas};-webkit-box-orient:vertical;overflow:hidden}
.pie{position:absolute;left:72px;right:72px;bottom:50px;display:flex;align-items:center;gap:16px;font:500 16px ${T.mono};color:${T.muted};letter-spacing:.04em}
.pie i{width:56px;height:8px;border-radius:4px;background:${t.accent};flex:none}
.pie span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
</style></head><body>
<div class="top"><span class="marca">Yamacoa</span><span class="badge">Expediente dirigido</span><span class="dom">yamacoa.com${esc(t.path)}</span></div>
<div class="eti">${esc(t.etiqueta)}</div>
<h1>${esc(t.titulo)}</h1>
<p>${esc(t.subtitulo)}</p>
<div class="pie"><i></i><span>Fuentes: ${esc(t.fuentes)}</span></div>
</body></html>`; };

const bin = chromium();
try {
  for (const slug of slugs) {
    const t = temas.find((x) => x.slug === slug);
    if (!t) throw new Error(`No hay tema con slug «${slug}» en registry.js`);
    const pagina = join(tmp, `${slug}.html`);
    writeFileSync(pagina, html(t));
    const out = resolve(ROOT, "public", `og-${slug}.png`);
    execFileSync(bin, ["--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
      // Headless deja la zona visible más baja que la ventana: se captura de sobra y se recorta.
      "--force-device-scale-factor=1", "--window-size=1200,900", "--virtual-time-budget=4000",
      `--screenshot=${join(tmp, "captura.png")}`, pathToFileURL(pagina).href], { stdio: "ignore" });
    await sharp(join(tmp, "captura.png")).extract({ left: 0, top: 0, width: 1200, height: 630 }).png().toFile(out);
    console.log(`og-${slug}.png <- ${t.titulo}`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
