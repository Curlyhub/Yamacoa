// Captura sin dependencias: RSS 2.0 por expresiones regulares y texto del artículo
// por extracción de <p>. Todo lo que sale de aquí es MATERIAL HOSTIL: el motor lo
// trata como datos, nunca como instrucciones.

import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const UA = "Mozilla/5.0 (compatible; YamacoaBot/1.0; +https://yamacoa.com/metodologia)";
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", laquo: "«", raquo: "»",
  ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“" };

export function texto(html = "") {
  return String(html)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<(script|style|figure|figcaption|iframe|noscript)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, e) => ENT[e.toLowerCase()] ?? m)
    .replace(/[ \t ]+/g, " ").replace(/\n\s*\n\s*/g, "\n\n").trim();
}

const campo = (item, tag) => {
  const m = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim() : "";
};

export function normalizaUrl(u) {
  try {
    const x = new URL(u.trim());
    x.hash = "";
    for (const k of [...x.searchParams.keys()]) if (/^(utm_|fbclid|gclid|mc_)/i.test(k)) x.searchParams.delete(k);
    return x.toString().replace(/\/$/, "");
  } catch { return u.trim(); }
}
export const hashUrl = (u) => crypto.createHash("sha256").update(normalizaUrl(u)).digest("hex").slice(0, 32);

export async function descargar(url, ms = 20000) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "*/*" }, redirect: "follow", signal: AbortSignal.timeout(ms) });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r.text();
  } catch (e) {
    // Algunos servidores (granma.cu) agotan la conexión de undici y sí responden a curl.
    const c = spawnSync("curl", ["-sSfL", "--max-time", String(Math.ceil(ms / 1000) + 10), "-A", UA, url], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
    if (c.status === 0 && c.stdout) return c.stdout;
    throw e;
  }
}

export async function leerRss(fuente) {
  const xml = await descargar(fuente.rss);
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  return items.map((it) => {
    const link = texto(campo(it, "link")) || texto(campo(it, "guid"));
    const fecha = Date.parse(texto(campo(it, "pubDate")) || texto(campo(it, "dc:date")));
    return {
      fuente: fuente.id,
      url: normalizaUrl(link),
      titulo: texto(campo(it, "title")),
      fecha: Number.isFinite(fecha) ? new Date(fecha).toISOString() : null,
      resumen: texto(campo(it, "description")).slice(0, 600),
      completo: texto(campo(it, "content:encoded")),
      origen_rss: texto(campo(it, "source")), // Google Noticias: medio original
    };
  }).filter((x) => x.url && x.titulo);
}

// Texto del artículo: el content:encoded del RSS si es largo; si no, los <p> de la página.
export async function cuerpoArticulo(item, max = 5000) {
  if (item.completo && item.completo.length > 600) return item.completo.slice(0, max);
  try {
    const html = await descargar(item.url);
    // Hay portadas con muchos <article> (tarjetas de enlaces): se queda con la zona más larga.
    const parrafos = (z) => (z.match(/<p[\s>][\s\S]*?<\/p>/gi) || []).map(texto).filter((p) => p.length > 60).join("\n\n");
    const t = [...(html.match(/<article[\s\S]*?<\/article>/gi) || []), html].map(parrafos)
      .reduce((a, b) => (b.length > a.length * 1.5 ? b : a), "");
    return (t.length > 200 ? t : item.resumen).slice(0, max);
  } catch {
    return item.resumen;
  }
}
