// Reproduce el documento original del autor (PDF o Word) sobre su TEXTO CONFIRMADO.
//
// El texto confirmado (opinion_articulos.texto, con su sha256) manda: decide qué párrafos hay
// y qué palabras dicen. Del documento solo se toma la forma: ladillos, negrita, cursiva,
// enlaces y figuras. Cada párrafo se busca LITERAL en el documento; si no aparece, sale tal
// cual, sin formato. Lo que el documento tiene fuera del texto confirmado (título, firma,
// fecha) no se publica, salvo las figuras y su pie (el texto en cursiva que las sigue).
// Las palabras publicadas, por tanto, nunca pueden ser distintas de las confirmadas.
//
//   reproducir(buf, tipo, texto) -> { bloques, avisos }
//     bloques: { tipo: "parrafo"|"ladillo", runs: [{ t, b?, i?, href? }] }
//            | { tipo: "figura", webp: Buffer, ancho, alto, pie? }

import { createRequire } from "node:module";
const req = createRequire(import.meta.url);

const parrafos = (t) => t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const limpio = (s) => s.replace(/[   ]/g, " ").replace(/­/g, "");
const ENLACE = /^https?:\/\/[^\s"<>]+$/i;

/* ---------- PDF: pdf.js (la misma versión que usa el portal) ---------- */
async function flujoPdf(buf) {
  const pdfjs = await import(req.resolve("pdfjs-dist/legacy/build/pdf.mjs"));
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), verbosity: 0, isOffscreenCanvasSupported: false }).promise;
  const piezas = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const pag = await doc.getPage(n);
    const ops = await pag.getOperatorList();
    // Imágenes: se sigue la matriz de transformación para saber dónde se pintan.
    const imagenes = [];
    let ctm = [1, 0, 0, 1, 0, 0]; const pila = [];
    const por = (m, t) => [m[0] * t[0] + m[2] * t[1], m[1] * t[0] + m[3] * t[1], m[0] * t[2] + m[2] * t[3],
      m[1] * t[2] + m[3] * t[3], m[0] * t[4] + m[2] * t[5] + m[4], m[1] * t[4] + m[3] * t[5] + m[5]];
    ops.fnArray.forEach((f, k) => {
      const a = ops.argsArray[k];
      if (f === pdfjs.OPS.save) pila.push(ctm);
      else if (f === pdfjs.OPS.restore) ctm = pila.pop() || [1, 0, 0, 1, 0, 0];
      else if (f === pdfjs.OPS.transform) ctm = por(ctm, a);
      else if (f === pdfjs.OPS.paintImageXObject) imagenes.push({ nombre: a[0], arriba: ctm[5] + Math.max(ctm[3], 0), alto: Math.abs(ctm[3]), ancho: Math.abs(ctm[0]) });
    });
    const enlaces = (await pag.getAnnotations()).filter((x) => x.subtype === "Link" && x.url && ENLACE.test(x.url));
    const fuente = (id) => { try { return pag.commonObjs.get(id)?.name || ""; } catch { return ""; } };
    const { items } = await pag.getTextContent();
    const lineas = []; let actual = null;
    for (const it of items) {
      const y = it.transform[5], h = Math.abs(it.transform[3]) || 10;
      if (!actual || Math.abs(y - actual.y) > h * 0.5) { actual = { y, piezas: [] }; lineas.push(actual); }
      if (it.str) {
        const nombre = fuente(it.fontName), cx = it.transform[4] + it.width / 2, cy = y + h / 3;
        const a = enlaces.find((e) => cx >= e.rect[0] && cx <= e.rect[2] && cy >= e.rect[1] && cy <= e.rect[3]);
        actual.piezas.push({ t: limpio(it.str), b: /bold|black|heavy|semibold|demi/i.test(nombre), i: /italic|oblique/i.test(nombre),
          ...(a ? { href: a.url } : {}), tam: h });
      }
      if (it.hasEOL) actual = null;
    }
    // Figuras entre las líneas, por su altura en la página (las imágenes pequeñas son adornos).
    for (const im of imagenes.filter((x) => x.ancho > 120 && x.alto > 60)) {
      const k = lineas.findIndex((l) => l.y < im.arriba);
      const obj = await new Promise((r) => pag.objs.get(im.nombre, r));
      lineas.splice(k < 0 ? lineas.length : k, 0, { figura: obj });
    }
    for (const l of lineas) {
      if (l.figura) { piezas.push({ figura: l.figura }); continue; }
      if (!l.piezas.length) continue;
      // Misma regla que el portal: palabra partida con guion al final de línea.
      const prev = piezas[piezas.length - 1];
      if (prev?.t && /[a-záéíóúñ]-$/i.test(prev.t)) prev.t = prev.t.slice(0, -1);
      else if (prev?.t) piezas.push({ t: " ", ...estilo(prev) });
      piezas.push(...l.piezas);
    }
    piezas.push({ t: " " });
  }
  return piezas;
}
const estilo = (p) => ({ b: p.b, i: p.i, ...(p.href ? { href: p.href } : {}) });

/* ---------- Word: mammoth (la misma versión que usa el portal) ---------- */
const ENTIDAD = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const entidades = (s) => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => e[0] === "#"
  ? String.fromCodePoint(parseInt(e.slice(1).replace(/^x/i, ""), /^#x/i.test(e) ? 16 : 10)) : ENTIDAD[e.toLowerCase()] ?? m);
async function flujoDocx(buf) {
  const mammoth = req("mammoth");
  const { value: html } = await mammoth.convertToHtml({ buffer: buf });
  const piezas = []; let b = 0, i = 0, href = null, h = 0;
  for (const m of html.matchAll(/<(\/?)(\w+)([^>]*)>|([^<]+)/g)) {
    const [, cierre, tag, attrs, txt] = m;
    if (txt) { piezas.push({ t: limpio(entidades(txt)), b: b > 0, i: i > 0, ...(href ? { href } : {}), h: h > 0 }); continue; }
    const t = tag.toLowerCase(), d = cierre ? -1 : 1;
    if (t === "strong" || t === "b") b += d;
    else if (t === "em" || t === "i") i += d;
    else if (/^h[1-6]$/.test(t)) h += d;
    else if (t === "a") { const u = !cierre && /href="([^"]+)"/.exec(attrs)?.[1]; href = u && ENLACE.test(entidades(u)) ? entidades(u) : null; }
    else if (t === "img" && !cierre) {
      const src = /src="data:image\/[\w+.-]+;base64,([^"]+)"/.exec(attrs)?.[1];
      if (src) piezas.push({ figura: { buffer: Buffer.from(src, "base64") } });
    }
    if (cierre && /^(p|h[1-6]|li|td|th|tr)$/.test(t)) piezas.push({ t: " " });
  }
  return piezas;
}

/* ---------- alinear el documento con el texto confirmado ---------- */
async function webp(fig) {
  const sharp = req("sharp");
  let img;
  if (fig.buffer) img = sharp(fig.buffer);
  else if (fig.data && (fig.kind === 2 || fig.kind === 3)) img = sharp(Buffer.from(fig.data.buffer, fig.data.byteOffset, fig.data.byteLength), { raw: { width: fig.width, height: fig.height, channels: fig.kind === 2 ? 3 : 4 } });
  else return null;
  const out = await img.resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 88 }).toBuffer({ resolveWithObject: true });
  return { webp: out.data, ancho: out.info.width, alto: out.info.height };
}

export async function reproducir(buf, tipo, texto) {
  const piezas = tipo === "pdf" ? await flujoPdf(buf) : await flujoDocx(buf);
  // Cadena llana del documento (espacios colapsados) y, por carácter, de qué pieza sale.
  let llano = ""; const dueño = [];
  piezas.forEach((p, k) => {
    if (p.figura) { llano += " \u0000 "; dueño.push(-1, k, -1); return; }
    for (const c of p.t.replace(/\s/g, " ")) {
      if (c === " " && (llano.endsWith(" ") || !llano)) continue;
      llano += c; dueño.push(k);
    }
  });
  const tams = piezas.filter((p) => p.tam && p.t.trim()).map((p) => p.tam).sort((a, b) => a - b);
  const cuerpo = tams[Math.floor(tams.length / 2)] || 0;

  const bloques = [], avisos = [];
  let cursor = 0;
  const figurasHasta = async (fin, siguiente) => {
    // Figuras entre el párrafo anterior y este; su pie es el texto en cursiva que las sigue.
    for (let j = cursor; j < fin; j++) {
      if (llano[j] !== "\u0000") continue;
      const f = await webp(piezas[dueño[j]].figura).catch(() => null);
      if (!f) { avisos.push("una figura del documento no se pudo convertir"); continue; }
      const tras = llano.slice(j + 1, siguiente ?? fin).split("\u0000")[0];
      const ini = j + 1 + (tras.length - tras.trimStart().length);
      let k = ini; while (k < fin && llano[k] !== "\u0000" && piezas[dueño[k]]?.i) k++;
      const pie = llano.slice(ini, k).trim();
      bloques.push({ tipo: "figura", ...f, ...(pie && pie.length <= 300 ? { pie } : {}) });
    }
  };
  for (const p of parrafos(texto)) {
    const buscado = limpio(p).replace(/\s+/g, " ").trim();
    const at = llano.indexOf(buscado, cursor);
    if (at < 0) {
      avisos.push(`párrafo sin forma (no aparece literal en el documento): «${buscado.slice(0, 60)}…»`);
      bloques.push({ tipo: "parrafo", runs: [{ t: p }] });
      continue;
    }
    await figurasHasta(at);
    const runs = [];
    for (let j = at; j < at + buscado.length; j++) {
      const pz = piezas[dueño[j]] || {};
      const e = { b: !!pz.b, i: !!pz.i, href: pz.href || null };
      const ult = runs[runs.length - 1];
      if (ult && ult.b === e.b && ult.i === e.i && ult.href === e.href) ult.t += llano[j];
      else runs.push({ t: llano[j], ...e });
    }
    const todo = (f) => runs.every((r) => !r.t.trim() || f(r));
    const ladillo = buscado.length <= 120 && todo((r) => r.b) && (piezas[dueño[at]]?.h || (piezas[dueño[at]]?.tam || 0) > cuerpo * 1.08);
    bloques.push({ tipo: ladillo ? "ladillo" : "parrafo",
      runs: runs.map(({ t, b, i, href }) => ({ t, ...(b && !ladillo ? { b: true } : {}), ...(i ? { i: true } : {}), ...(href ? { href } : {}) })) });
    cursor = at + buscado.length;
  }
  await figurasHasta(llano.length);
  // Garantía: las palabras de cada bloque son exactamente las del texto confirmado.
  const textuales = bloques.filter((x) => x.tipo !== "figura").map((x) => x.runs.map((r) => r.t).join(""));
  const esperados = parrafos(texto).map((p) => limpio(p).replace(/\s+/g, " ").trim());
  if (textuales.length !== esperados.length || textuales.some((t, k) => t.replace(/\s+/g, " ").trim() !== esperados[k] && t !== parrafos(texto)[k]))
    throw new Error("la reproducción no coincide con el texto confirmado");
  return { bloques, avisos };
}
