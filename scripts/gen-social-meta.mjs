// Genera functions/social-meta.json a partir de src/temas/registry.js
// (la única fuente de verdad del front). Lo consume functions/_middleware.js
// para servir tarjetas OG/Twitter por expediente. Se ejecuta en `prebuild`,
// así que al añadir un tema al registry su tarjeta social aparece sola.
//
// Convención de imagen por tema: si existe public/og-<slug>.(png|jpg|jpeg|webp)
// se usa como imagen propia; si no, el middleware cae a la imagen por defecto.

import { readFile, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const REGISTRY = resolve(ROOT, "src/temas/registry.js");
const PUBLIC = resolve(ROOT, "public");
const OUT = resolve(ROOT, "functions/social-meta.json");
const SITE = "https://yamacoa.com";
const IMG_EXTS = ["png", "jpg", "jpeg", "webp"];

const exists = async (p) => access(p, constants.F_OK).then(() => true).catch(() => false);

// registry.js es ESM (`export default`) pero el paquete es CJS por defecto, así
// que Node no lo importa por su extensión .js. Lo copiamos a un .mjs temporal e
// importamos eso; los `import("...jsx")` van dentro de lambdas `load` que nunca
// se invocan aquí, así que no se resuelve ningún renderer.
async function loadRegistry() {
  const src = await readFile(REGISTRY, "utf8");
  const tmp = resolve(tmpdir(), `yamacoa-registry-${process.pid}.mjs`);
  await writeFile(tmp, src);
  const mod = await import(pathToFileURL(tmp).href);
  return mod.default;
}

async function imgFor(slug) {
  for (const ext of IMG_EXTS) {
    if (await exists(resolve(PUBLIC, `og-${slug}.${ext}`))) {
      return `${SITE}/og-${slug}.${ext}`;
    }
  }
  return undefined;
}

const temas = await loadRegistry();
const map = {};
for (const t of temas) {
  const entry = { t: t.titulo, d: t.subtitulo };
  const img = await imgFor(t.slug);
  if (img) entry.img = img;
  map[t.path] = entry;
}

await writeFile(OUT, JSON.stringify(map, null, 2) + "\n");
console.log(`social-meta: ${Object.keys(map).length} rutas -> ${OUT}`);
