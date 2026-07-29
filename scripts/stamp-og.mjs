#!/usr/bin/env node
/**
 * scripts/stamp-og.mjs
 * Postbuild: emite build/<slug>/index.html con meta OG/Twitter por tema.
 * Fuente de verdad: public/data/*.json (bloque `meta`).
 * NO toca ningún .jsx (renderer congelado). Ejecutar tras `react-scripts build`.
 *
 * Uso:  SITE_URL=https://yamacoa.com node scripts/stamp-og.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const SITE = (process.env.SITE_URL || "https://yamacoa.com").replace(/\/+$/, "");
const BUILD = "build";
const DATA = "public/data";
const DEFAULT_IMG = `${SITE}/yamacoa_og_1200x630.png`;

if (!existsSync(join(BUILD, "index.html"))) {
  console.error("stamp-og: no existe build/index.html — ¿corriste `npm run build` antes?");
  process.exit(1);
}
if (!existsSync(DATA)) {
  console.error(`stamp-og: no existe ${DATA}`);
  process.exit(1);
}

const tpl = readFileSync(join(BUILD, "index.html"), "utf8");

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const files = readdirSync(DATA).filter(
  (f) => f.endsWith(".json") && !f.endsWith(".schema.json") && f !== "metodologias.json"
);

let n = 0;
const sinImagen = [];

for (const f of files) {
  const slug = basename(f, ".json");
  let meta;
  try {
    meta = JSON.parse(readFileSync(join(DATA, f), "utf8")).meta || {};
  } catch {
    console.warn(`stamp-og: ${f} ilegible, se omite`);
    continue;
  }

  const titulo = meta.titulo || slug;
  const desc = meta.subtitulo || meta.descripcion || "";
  const url = `${SITE}/${slug}`;

  // Convención: meta.og_image = "/assets/<slug>/share/card.png"
  let img = DEFAULT_IMG;
  if (meta.og_image) {
    img = meta.og_image.startsWith("http") ? meta.og_image : `${SITE}${meta.og_image}`;
    // aviso si el fichero no está en public/ (sería 404 en producción)
    const local = join("public", meta.og_image.replace(/^\//, ""));
    if (!meta.og_image.startsWith("http") && !existsSync(local)) {
      console.warn(`stamp-og: ${slug} → og_image declarada pero ausente en ${local}`);
    }
  } else {
    sinImagen.push(slug);
  }

  const head = `
  <title>${esc(titulo)} · Yamacoa</title>
  <meta name="description" content="${esc(desc)}"/>
  <link rel="canonical" href="${url}"/>
  <meta property="og:type" content="article"/>
  <meta property="og:site_name" content="Yamacoa"/>
  <meta property="og:title" content="${esc(titulo)}"/>
  <meta property="og:description" content="${esc(desc)}"/>
  <meta property="og:url" content="${url}"/>
  <meta property="og:image" content="${img}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${esc(titulo)}"/>
  <meta name="twitter:description" content="${esc(desc)}"/>
  <meta name="twitter:image" content="${img}"/>`;

  const html = tpl
    .replace(/<title>.*?<\/title>/is, "")
    .replace(/<head([^>]*)>/i, `<head$1>${head}`);

  mkdirSync(join(BUILD, slug), { recursive: true });
  writeFileSync(join(BUILD, slug, "index.html"), html, "utf8");
  n++;
}

console.log(`stamp-og: ${n} temas estampados sobre ${SITE}`);
if (sinImagen.length) {
  console.log(`stamp-og: sin meta.og_image (usan og-default.png): ${sinImagen.join(", ")}`);
}
