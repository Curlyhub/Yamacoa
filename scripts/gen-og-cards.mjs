// Genera public/og-<slug>.png (1200x630) por tema, a partir de src/temas/registry.js
// (fuente única). Ejecutar a mano tras añadir o editar temas:
//
//   node scripts/gen-og-cards.mjs && npm run gen:social
//
// El segundo comando regenera functions/social-meta.json, que detecta estos
// ficheros automáticamente (convención ya existente en scripts/gen-social-meta.mjs).
//
// Implementación: arma un SVG por tema (paleta + copy del registry) y lo rasteriza
// con `sharp` (dependencia transitiva ya presente; evita instalar Playwright/Puppeteer
// solo para esto). No hay navegador headless disponible en este entorno, así que las
// tipografías son sustitutos del sistema (Ubuntu Sans / Ubuntu Mono) por Archivo /
// IBM Plex Mono -- suficiente para una miniatura de compartir, no pretende ser
// pixel-perfect con el sitio real. No se ejecuta en el build: las imágenes generadas
// se versionan como cualquier otro asset estático en public/.

import sharp from "sharp";
import { writeFile, readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REGISTRY = resolve(ROOT, "src/temas/registry.js");
const OUT_DIR = resolve(ROOT, "public");

const W = 1200;
const H = 630;
const BG = "#0C0E14";
const INK = "#EDEFF5";
const MUTED = "#8A93A8";

async function loadRegistry() {
  const src = await readFile(REGISTRY, "utf8");
  const tmp = resolve(tmpdir(), `yamacoa-registry-og-${process.pid}.mjs`);
  await writeFile(tmp, src);
  const mod = await import(pathToFileURL(tmp).href);
  return mod.default;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Word-wrap aproximado por ancho medio de carácter: no es medición real de
// tipografía, solo evita que el texto se salga de la tarjeta.
function wrapText(text, maxWidth, fontSize, avgCharWidthFactor) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  const charW = fontSize * avgCharWidthFactor;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (line && test.length * charW > maxWidth) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function tspans(lines, x, startY, lineHeight) {
  return lines
    .map((l, i) => `<tspan x="${x}" y="${startY + i * lineHeight}">${escapeXml(l)}</tspan>`)
    .join("");
}

function cardSvg({ titulo, subtitulo, etiqueta, accent }) {
  const padX = 84;
  const contentW = W - padX * 2 - 60;

  let titleSize = 64;
  if (titulo.length > 40) titleSize = 54;
  if (titulo.length > 60) titleSize = 46;

  const titleLines = wrapText(titulo, contentW, titleSize, 0.58).slice(0, 3);
  const titleLineH = Math.round(titleSize * 1.15);

  const subSize = 26;
  const subLines = wrapText(subtitulo || "", contentW, subSize, 0.54).slice(0, 2);
  const subLineH = Math.round(subSize * 1.5);

  const kickerY = 140;
  const titleStartY = 224;
  const titleBlockEnd = titleStartY + (titleLines.length - 1) * titleLineH;
  const subStartY = titleBlockEnd + Math.round(titleLineH * 0.62) + 48;

  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="82%" cy="6%" r="75%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.32"/>
      <stop offset="55%" stop-color="${accent}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="0" y="0" width="10" height="${H}" fill="${accent}"/>

  <text x="${padX}" y="${kickerY}" font-family="'Ubuntu Mono', monospace" font-weight="700" font-size="20" letter-spacing="4" fill="${accent}">${escapeXml(
    (etiqueta || "").toUpperCase()
  )}</text>

  <text font-family="'Ubuntu Sans', sans-serif" font-weight="800" font-size="${titleSize}" fill="${INK}" letter-spacing="-1">${tspans(
    titleLines,
    padX,
    titleStartY,
    titleLineH
  )}</text>

  <text font-family="'Ubuntu Sans', sans-serif" font-weight="400" font-size="${subSize}" fill="${MUTED}">${tspans(
    subLines,
    padX,
    subStartY,
    subLineH
  )}</text>

  <text x="${padX}" y="${H - 56}" font-family="'Ubuntu Mono', monospace" font-weight="700" font-size="22" letter-spacing="2" fill="${INK}">YAMACOA</text>
  <text x="${padX}" y="${H - 30}" font-family="'Ubuntu Mono', monospace" font-weight="400" font-size="15" letter-spacing="2" fill="${MUTED}">OBSERVATORIO · YAMACOA.COM</text>
</svg>`.trim();
}

const temas = await loadRegistry();
for (const t of temas) {
  const svg = cardSvg(t);
  const out = resolve(OUT_DIR, `og-${t.slug}.png`);
  await sharp(Buffer.from(svg)).png().toFile(out);
  console.log(`og-${t.slug}.png <- ${t.titulo}`);
}
console.log(`Generadas ${temas.length} tarjetas OG en ${OUT_DIR}`);
