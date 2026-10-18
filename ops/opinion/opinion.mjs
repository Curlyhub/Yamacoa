#!/usr/bin/env node
// Artículos de opinión de Yamacoa (redacción). El texto del autor es INVARIANTE: este programa
// nunca lo modifica (la BD tampoco lo permite); solo prepara lo que Yamacoa añade APARTE.
//
//   analizar   envíos en estado «enviado» -> Claude headless (analista.md) -> verja -> «revision»
//              verja: cada cifra del contexto y de las notas tiene que estar en la fuente citada;
//              cada nota se ancla a palabras LITERALES del autor; los gráficos de serie los
//              construye el código. Las alertas son para el editor y nunca se publican.
//   revisar    lista lo pendiente, con alertas         ver <id>      texto + lo que añade Yamacoa
//   ensayo <id>  vista previa en public/ (npm start)    aprobar <id> [--sin-datos]  -> publicado
//   rechazar <id> --motivo "…"                          solo-exportar --destino <dir> (publicar.sh)
//   prueba <fichero.txt> --titulo "…"   análisis de un texto local, sin BD, con vista previa
//
// Requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (noticias.env) salvo en --prueba.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { abrir } from "../noticias/lib/db.mjs";
import { cargarSeries, paraMotor, graficoDeSerie, numeroEnTexto, ordenados } from "../noticias/lib/series.mjs";
import { descargar, texto as textoHtml } from "../noticias/lib/rss.mjs";
import { cifras } from "../podcast/auto/lib/oral.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(AQUI, "../..");
const TRABAJO = path.join(AQUI, "trabajo");
const SITE = (process.env.YAMACOA_SITE || "https://yamacoa.com").replace(/\/+$/, "");
const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const valor = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const log = (...m) => console.log(new Date().toISOString().slice(11, 19), ...m);
const escribir = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2)); };
const leerJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sha256 = (t) => crypto.createHash("sha256").update(t, "utf8").digest("hex");
const parrafos = (t) => t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const slugify = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").replace(/^(.{70}).+$/, (_, c) => c.replace(/-[^-]*$/, "") || c);
const expedientes = () => { try { return leerJson(path.join(REPO, "functions/social-meta.json")); } catch { return {}; } };

/* ---------- BD (PostgREST con la service role) ---------- */
function bd() {
  const base = (process.env.SUPABASE_URL || "").replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error("faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (~/.config/yamacoa/noticias.env)");
  return async (ruta, { method = "GET", body } = {}) => {
    const r = await fetch(`${base}/rest/v1/${ruta}`, { method, body: body ? JSON.stringify(body) : undefined,
      headers: { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}), "Content-Type": "application/json", Prefer: "return=representation" },
      signal: AbortSignal.timeout(30000) });
    if (!r.ok) {
      const t = await r.text();
      if (/PGRST205|does not exist/.test(t) && method === "GET") return [];
      throw new Error(`supabase ${method} ${ruta.split("?")[0]}: ${r.status} ${t.slice(0, 300)}`);
    }
    const t = await r.text(); return t ? JSON.parse(t) : null;
  };
}
const CAMPOS = "id,titulo,firma,firma_tipo,presentacion,texto,texto_sha256,original_tipo,estado,slug,analisis,motivo,creado,publicado";

/* ---------- analizar ---------- */
async function series() {
  let puntos = [];
  try { puntos = await abrir({ estadoDir: path.join(REPO, "ops/noticias/estado") }).puntosSeries(); } catch { /* sin BD: semilla */ }
  return cargarSeries({ catalogo: path.join(REPO, "ops/noticias/series.json"), datos: path.join(REPO, "public/data"), puntos });
}

async function analizar(a) {
  const dir = path.join(TRABAJO, a.id);
  fs.mkdirSync(dir, { recursive: true });
  const ser = await series();
  escribir(path.join(dir, "articulo.json"), { titulo: a.titulo, firma: a.firma, parrafos: parrafos(a.texto) });
  escribir(path.join(dir, "series.json"), paraMotor(ser));
  escribir(path.join(dir, "expedientes.json"), Object.entries(expedientes()).map(([ruta, e]) => ({ ruta, titulo: e.t, resumen: e.d })));
  if (!fs.existsSync(path.join(dir, "analisis.json"))) {
    log(`analista: «${a.titulo}»…`);
    const r = spawnSync("claude", [
      "-p", "--model", process.env.YAMACOA_MODELO || "opus",
      "--tools", "Read,Write,Glob,WebFetch,WebSearch", "--allowedTools", "Read,Write,Glob,WebFetch,WebSearch",
      "--permission-mode", "acceptEdits", "--strict-mcp-config", "--no-session-persistence", "--output-format", "json",
    ], { cwd: dir, input: fs.readFileSync(path.join(AQUI, "analista.md"), "utf8"), encoding: "utf8", timeout: 30 * 60000, maxBuffer: 64 << 20 });
    fs.writeFileSync(path.join(dir, "analista.log.json"), r.stdout || "");
    if (r.status !== 0 || !fs.existsSync(path.join(dir, "analisis.json"))) throw new Error(`analista: ${(r.stderr || r.stdout || "sin analisis.json").slice(0, 400)}`);
  }
  return verja(leerJson(path.join(dir, "analisis.json")), a.texto, ser);
}

const plano = (t) => String(t).replace(/\s+/g, " ").replace(/[«»“”"]/g, '"').trim().toLowerCase();

async function verja(an, texto, ser) {
  const descartes = [];
  // Fuentes: nombre y URL los pone el código; se guarda su texto para comprobar números.
  const fuentes = [], textos = [];
  for (const f of an.fuentes || []) {
    if (f.serie && ser.get(f.serie)) {
      const s = ser.get(f.serie);
      fuentes.push({ nombre: `Serie Yamacoa: ${s.titulo} (${s.fuente})`, url: `${SITE}${s.expediente || "/metodologia"}`, tipo: "dataset" });
      textos.push(ordenados(s).map((p) => `${p.fecha} ${p.valor}`).join("\n"));
    } else if (f.url) {
      const html = await descargar(f.url, 15000).catch(() => null);
      fuentes.push(html == null ? null : { nombre: f.nombre || f.url, url: f.url, tipo: f.tipo === "primaria" ? "primaria" : "medio" });
      textos.push(html == null ? null : textoHtml(html));
      if (html == null) descartes.push(`fuente inaccesible: ${f.url}`);
    } else { fuentes.push(null); textos.push(null); descartes.push(`fuente no válida: ${JSON.stringify(f).slice(0, 80)}`); }
  }
  const respaldada = (frase, citas) => {
    const ok = (citas || []).filter((c) => textos[c - 1]);
    if (!ok.length) return "sin cita a una fuente válida";
    const sueltas = cifras(frase).filter((v) => !(Number.isInteger(v) && v >= 1950 && v <= 2100) && !ok.some((c) => numeroEnTexto(v, textos[c - 1])));
    return sueltas.length ? `cifras sin respaldo: ${sueltas.join(", ")}` : null;
  };
  const usadas = new Set();
  const contexto = [];
  for (const p of an.contexto || []) {
    const m = !(p.texto?.length >= 40 && p.texto.length <= 900) ? "longitud" : respaldada(p.texto, p.citas);
    if (m) { descartes.push(`contexto fuera (${m}): ${String(p.texto).slice(0, 80)}…`); continue; }
    contexto.push({ texto: p.texto.replace(/\s*—\s*/g, ", "), citas: p.citas }); p.citas.forEach((c) => usadas.add(c));
  }
  const notas = [];
  const llano = plano(texto);
  for (const n of an.notas || []) {
    const m = !n.fragmento || !llano.includes(plano(n.fragmento)) ? "el fragmento no es literal del autor"
      : !(n.nota?.length >= 20 && n.nota.length <= 500) ? "longitud" : respaldada(n.nota, n.citas);
    if (m) { descartes.push(`nota fuera (${m}): ${String(n.nota).slice(0, 80)}…`); continue; }
    notas.push({ fragmento: n.fragmento, nota: n.nota.replace(/\s*—\s*/g, ", "), citas: n.citas }); n.citas.forEach((c) => usadas.add(c));
  }
  let grafico = null;
  if (an.grafico?.serie && ser.get(an.grafico.serie)) grafico = graficoDeSerie(ser.get(an.grafico.serie), { tipo: an.grafico.tipo, titulo: an.grafico.titulo });
  else if (an.grafico?.datos) {
    const todo = textos.filter(Boolean).join("\n");
    const sin = an.grafico.datos.filter((d) => d.valor != null && !numeroEnTexto(d.valor, todo));
    if (sin.length) descartes.push(`gráfico fuera: ${sin.map((d) => d.valor).join(", ")} no están en las fuentes`); else grafico = an.grafico;
  }
  // Las citas se reindexan a las fuentes válidas y usadas, en orden.
  const mapa = new Map(); const finales = [];
  fuentes.forEach((f, i) => { if (f && usadas.has(i + 1)) { mapa.set(i + 1, finales.length + 1); finales.push(f); } });
  const re = (l) => l.map((x) => ({ ...x, citas: x.citas.filter((c) => mapa.has(c)).map((c) => mapa.get(c)) }));
  const datos = {
    ...(contexto.length ? { contexto: re(contexto) } : {}),
    ...(grafico ? { grafico } : {}),
    ...(notas.length ? { notas: re(notas) } : {}),
    ...(finales.length ? { fuentes: finales } : {}),
    ...(an.expediente && expedientes()[an.expediente] ? { expediente: an.expediente } : {}),
  };
  log(`verja: ${contexto.length} párrafos de contexto, ${notas.length} notas, gráfico ${grafico ? "sí" : "no"}, ${descartes.length} descartes`);
  return { datos, alertas: an.alertas || [], descartes };
}

/* ---------- feed ---------- */
function validador() {
  const Ajv = createRequire(import.meta.url)("ajv");
  const ajv = new Ajv({ allErrors: true, format: "full" });
  ajv.addSchema(leerJson(path.join(REPO, "public/data/feed/noticias.schema.json")));
  return ajv.compile(leerJson(path.join(REPO, "public/data/feed/opinion.schema.json")));
}
function item(a) {
  if (sha256(a.texto) !== a.texto_sha256) throw new Error(`«${a.titulo}»: el texto no coincide con su sha256: NO se publica`);
  const datos = a.analisis?.publicar === false ? null : a.analisis?.datos;
  return {
    id: `o-${a.slug}`, slug: a.slug, titulo: a.titulo, firma: a.firma, firma_tipo: a.firma_tipo,
    ...(a.presentacion ? { presentacion: a.presentacion } : {}),
    publicado: new Date(a.publicado || Date.now()).toISOString(), texto: a.texto, texto_sha256: a.texto_sha256,
    ...(datos && Object.keys(datos).length ? { datos } : {}),
  };
}
function exportarLista(destino, lista) {
  const feed = { version: "1", actualizado: new Date().toISOString(), items: lista.map(item) };
  const v = validador();
  if (!v(feed)) throw new Error(`el feed de opinión no valida: ${v.errors.map((e) => `${e.dataPath} ${e.message}`).join("; ")}`);
  escribir(path.join(destino, "data/feed/opinion.json"), feed);
  log(`opinión: ${lista.length} artículos -> ${destino}`);
}

/* ---------- principal ---------- */
async function main() {
  const destino = valor("--destino") || path.join(REPO, "public");

  const prueba = valor("--prueba");
  if (prueba) {
    const texto = fs.readFileSync(prueba, "utf8").replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    const a = { id: `prueba-${slugify(path.basename(prueba, path.extname(prueba)))}`, titulo: valor("--titulo") || "Artículo de prueba",
      firma: valor("--firma") || "Firma de prueba", firma_tipo: "seudonimo", texto, texto_sha256: sha256(texto) };
    const r = await analizar(a);
    console.log(JSON.stringify({ alertas: r.alertas, descartes: r.descartes }, null, 2));
    exportarLista(destino, [{ ...a, slug: slugify(a.titulo), publicado: new Date().toISOString(), analisis: r }]);
    log(`vista previa: http://localhost:3123/opinion/${slugify(a.titulo)}`);
    return;
  }

  const q = bd();
  if (flag("--solo-exportar")) {
    return exportarLista(destino, await q(`opinion_articulos?select=${CAMPOS}&estado=eq.publicado&order=publicado.desc`));
  }
  const uno = async (id) => {
    const [a] = await q(`opinion_articulos?select=${CAMPOS}&id=eq.${encodeURIComponent(id)}`);
    if (!a) throw new Error(`no existe el artículo ${id}`); return a;
  };

  if (flag("--revisar")) {
    for (const a of await q(`opinion_articulos?select=${CAMPOS}&estado=in.(enviado,revision)&order=creado.asc`)) {
      console.log(`${a.id}  [${a.estado}]  «${a.titulo}» · ${a.firma} (${a.firma_tipo}) · ${a.texto.length} caracteres`);
      for (const al of a.analisis?.alertas || []) console.log(`    ⚠ ${al}`);
    }
    return;
  }
  if (valor("--ver")) {
    const a = await uno(valor("--ver"));
    console.log(`«${a.titulo}» · ${a.firma} (${a.firma_tipo}) · ${a.estado}\n\n${a.texto}\n\n--- Lo que añade Yamacoa ---`);
    console.log(JSON.stringify(a.analisis, null, 2));
    return;
  }
  if (valor("--ensayo")) {
    const a = await uno(valor("--ensayo"));
    const pub = await q(`opinion_articulos?select=${CAMPOS}&estado=eq.publicado&order=publicado.desc`);
    exportarLista(destino, [{ ...a, slug: a.slug || slugify(a.titulo), publicado: new Date().toISOString() }, ...pub.filter((x) => x.id !== a.id)]);
    log(`vista previa: http://localhost:3123/opinion/${a.slug || slugify(a.titulo)}`);
    return;
  }
  if (valor("--aprobar")) {
    const a = await uno(valor("--aprobar"));
    if (!["revision", "enviado"].includes(a.estado)) throw new Error(`está en «${a.estado}»`);
    const usados = new Set((await q("opinion_articulos?select=slug&slug=not.is.null")).map((x) => x.slug));
    let slug = a.slug || slugify(a.titulo); for (let k = 2; usados.has(slug) && slug !== a.slug; k++) slug = `${slugify(a.titulo)}-${k}`;
    const analisis = flag("--sin-datos") ? { ...(a.analisis || {}), publicar: false } : a.analisis;
    await q(`opinion_articulos?id=eq.${a.id}`, { method: "PATCH", body: { estado: "publicado", slug, publicado: new Date().toISOString(), analisis } });
    log(`publicado «${a.titulo}» -> /opinion/${slug}. Sale con el próximo despliegue (ops/publicar.sh).`);
    return;
  }
  if (valor("--rechazar")) {
    const motivo = valor("--motivo");
    if (!motivo) throw new Error("--rechazar necesita --motivo \"…\" (lo verá el autor)");
    await q(`opinion_articulos?id=eq.${encodeURIComponent(valor("--rechazar"))}`, { method: "PATCH", body: { estado: "rechazado", motivo } });
    log("rechazado; el autor verá el motivo en el portal");
    return;
  }

  // Por defecto: analizar lo enviado (lo lanza el ciclo; si no hay nada, no cuesta nada).
  for (const a of await q(`opinion_articulos?select=${CAMPOS}&estado=eq.enviado&order=creado.asc`)) {
    try {
      const r = await analizar(a);
      await q(`opinion_articulos?id=eq.${a.id}`, { method: "PATCH", body: { estado: "revision", analisis: r } });
      log(`en revisión: «${a.titulo}»${r.alertas.length ? ` · ${r.alertas.length} alertas` : ""}`);
    } catch (e) { log(`ERROR «${a.titulo}»: ${e.message}`); }
  }
}

main().catch((e) => { log(`ERROR ${e.stack || e.message}`); process.exitCode = 1; });
