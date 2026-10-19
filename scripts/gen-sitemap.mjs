// Genera public/sitemap.xml (lo anuncia public/robots.txt). Se ejecuta en `prebuild`, DESPUÉS
// de que ops/publicar.sh exporte a public/data/feed/ las noticias, estudios, episodios y artículos
// de opinión vigentes: el sitemap del build publicado lleva exactamente lo que está en línea.
// Expedientes: src/temas/registry.js (fuente única). El fichero es un artefacto del build y no se
// versiona (.gitignore). Lo retirado después desde la administración sigue en el sitemap hasta la
// siguiente publicación, pero el middleware ya lo sirve con noindex.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PUBLIC = resolve(ROOT, "public");
const OUT = resolve(PUBLIC, "sitemap.xml");
const SITE = "https://yamacoa.com";

// Mismo truco que gen-social-meta.mjs: registry.js es ESM en un paquete CJS.
async function loadRegistry() {
  const src = await readFile(resolve(ROOT, "src/temas/registry.js"), "utf8");
  const tmp = resolve(tmpdir(), `yamacoa-registry-sitemap-${process.pid}.mjs`);
  await writeFile(tmp, src);
  return (await import(pathToFileURL(tmp).href)).default;
}

// Un feed que falta o no se puede leer no rompe el build: esa sección sale sin piezas.
async function piezas(feed) {
  try {
    const d = JSON.parse(await readFile(resolve(PUBLIC, `data/feed/${feed}.json`), "utf8"));
    return (d.items || []).filter((i) => i.slug);
  } catch { return []; }
}

const dia = (f) => (f ? String(f).slice(0, 10) : undefined);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const urls = [
  ...["/", "/noticias", "/estudios", "/expedientes", "/podcast", "/opinion", "/suscribete", "/metodologia", "/privacidad"]
    .map((p) => ({ loc: p })),
  ...(await loadRegistry()).map((t) => ({ loc: t.path, mod: t.publicado })),
  ...(await piezas("noticias")).map((n) => ({ loc: `/noticias/${n.slug}`, mod: dia(n.publicado) })),
  ...(await piezas("estudios")).map((e) => ({ loc: `/estudios/${e.slug}`, mod: dia(e.actualizado || e.creado) })),
  ...(await piezas("podcast")).map((p) => ({ loc: `/podcast/${p.slug}`, mod: dia(p.publicado) })),
  ...(await piezas("opinion")).map((o) => ({ loc: `/opinion/${o.slug}`, mod: dia(o.publicado) })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(SITE + u.loc)}</loc>${u.mod ? `<lastmod>${u.mod}</lastmod>` : ""}</url>`).join("\n")}
</urlset>
`;

await writeFile(OUT, xml);
console.log(`sitemap: ${urls.length} URL -> ${OUT}`);
