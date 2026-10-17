#!/usr/bin/env node
// Ciclo de noticias automáticas de Yamacoa (cron: 00:00 y 18:00).
//
//   1. caducar   borra de la BD lo que cumplió 3 días (o se retiró) y, si hubo algo,
//                redespliega ya para que la página desaparezca del sitio a su hora
//   2. capturar  RSS de ops/noticias/fuentes.json -> ciclos/<id>/indice.json + capturas/
//   3. tratar    Claude en modo headless (motor.md) -> ciclos/<id>/tratadas.json
//   4. verja     schema + reglas editoriales; lo que no pasa va a descartes
//   5. audio     Kokoro -> MP3; sin resumen hablado la pieza queda «retenida»
//   6. exportar  vigentes de la BD -> <destino>/data/feed/noticias.json + audio
//   7. publicar  ops/publicar.sh (build de la rama `publicacion` + wrangler)
//
// Uso:
//   node ops/noticias/ciclo.mjs                       ciclo completo (lo que lanza el cron)
//   node ops/noticias/ciclo.mjs --sin-desplegar       ensayo: exporta a public/ del repo y no sube
//   node ops/noticias/ciclo.mjs --solo-exportar --destino <dir>   (lo usa publicar.sh)
//   node ops/noticias/ciclo.mjs --reusar <ciclo-id>   repite verja+audio sobre un tratadas.json existente

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { abrir, VIDA_MS } from "./lib/db.mjs";
import { leerRss, cuerpoArticulo, hashUrl } from "./lib/rss.mjs";
import { cargarValidador, reglas, sinRayas } from "./lib/validar.mjs";
import { sintetizar, VOZ } from "./lib/audio.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(AQUI, "../..");
const ESTADO = path.join(AQUI, "estado");
const AUDIO = path.join(ESTADO, "audio");
const SCHEMA = path.join(REPO, "public/data/feed/noticias.schema.json");
const SITE = (process.env.YAMACOA_SITE || "https://yamacoa.com").replace(/\/+$/, "");
const MAX_NOTICIAS = Number(process.env.YAMACOA_MAX_NOTICIAS || 10); // por ciclo
const MAX_DIA = Number(process.env.YAMACOA_MAX_DIA || 20);           // nuevas por día natural (hora local)
const MOTOR_MIN = Number(process.env.YAMACOA_MOTOR_MIN || 45);

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const valor = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const log = (...m) => console.log(new Date().toISOString().slice(11, 19), ...m);

const db = abrir({ estadoDir: ESTADO });
const validador = cargarValidador(SCHEMA);

/* ---------- utilidades ---------- */
const slugify = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  .replace(/^(.{60}).+$/, (_, c) => c.replace(/-[^-]*$/, "") || c);
const escribir = (f, obj) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(obj, null, 2)); };
const idCiclo = () => {
  const d = new Date(); const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}-${p(d.getMinutes())}`;
};
// Hora de publicación = hora del ciclo redondeada al cuarto de hora: así la caducidad
// (publicado + 3 d) cae justo en un ciclo y la página se retira a su hora.
const horaCiclo = () => { const d = new Date(); d.setSeconds(0, 0); d.setMinutes(Math.floor(d.getMinutes() / 15) * 15); return d; };

// Rutas de expedientes (functions/social-meta.json, generado desde registry.js en prebuild).
const expedientes = () => { try { return JSON.parse(fs.readFileSync(path.join(REPO, "functions/social-meta.json"), "utf8")); } catch { return {}; } };

/* ---------- 6. exportar ---------- */
async function exportar(destino) {
  const vivas = await db.vigentes();
  const items = vivas.map((n) => ({
    ...n.pieza,
    id: n.id, slug: n.slug, plantilla: n.plantilla, seccion: n.seccion,
    publicado: new Date(n.publicado).toISOString(),
    caduca: new Date(Date.parse(n.publicado) + VIDA_MS).toISOString(),
    ...(n.actualizado ? { actualizado: new Date(n.actualizado).toISOString() } : {}),
    relevancia: Number(n.relevancia),
    audio: { ...n.audio, url: SITE + n.audio.url },
  }));
  const feed = { version: "1", actualizado: new Date().toISOString(), items };
  const err = validador.feed(feed);
  if (err) throw new Error(`el feed exportado no valida: ${err}`);
  escribir(path.join(destino, "data/feed/noticias.json"), feed);
  // Audio: solo el de las vigentes. Lo caducado desaparece del sitio en este mismo deploy.
  const dirAudio = path.join(destino, "audio/noticias");
  fs.rmSync(dirAudio, { recursive: true, force: true });
  fs.mkdirSync(dirAudio, { recursive: true });
  for (const n of vivas) fs.copyFileSync(path.join(AUDIO, `${n.id}.mp3`), path.join(dirAudio, `${n.id}.mp3`));
  // Caché local de audio: fuera lo que ya no está vivo ni retenido.
  const conservar = new Set([...vivas, ...(await db.retenidas())].map((n) => `${n.id}.mp3`));
  for (const f of fs.existsSync(AUDIO) ? fs.readdirSync(AUDIO) : []) if (!conservar.has(f)) fs.rmSync(path.join(AUDIO, f));
  log(`exportadas ${items.length} noticias -> ${destino}`);
  return items.length;
}

function publicar(motivo) {
  log(`publicando (${motivo})…`);
  const r = spawnSync("bash", [path.join(REPO, "ops/publicar.sh"), "--motivo", motivo], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`publicar.sh terminó con ${r.status}`);
}

/* ---------- 2. capturar ---------- */
async function capturar(dir) {
  const conf = JSON.parse(fs.readFileSync(path.join(AQUI, "fuentes.json"), "utf8"));
  const desde = Date.now() - conf.ventana_horas * 3600000;
  const deCuba = new RegExp(conf.filtro_cuba, "i");
  const todos = [];
  for (const f of conf.fuentes) {
    try {
      const items = (await leerRss(f))
        .filter((x) => !x.fecha || Date.parse(x.fecha) >= desde)
        .filter((x) => !f.filtro || deCuba.test(`${x.titulo} ${x.resumen}`))
        .slice(0, conf.max_por_fuente)
        .map((x) => ({ ...x, f, hash: hashUrl(x.url) }));
      todos.push(...items);
      log(`rss ${f.id}: ${items.length}`);
    } catch (e) { log(`rss ${f.id}: ERROR ${e.message}`); }
  }
  const vistos = await db.capturasVistas([...new Set(todos.map((x) => x.hash))]);
  const nuevos = []; const ya = new Set();
  for (const x of todos) if (!vistos.has(x.hash) && !ya.has(x.hash)) { ya.add(x.hash); nuevos.push(x); }

  fs.mkdirSync(path.join(dir, "capturas"), { recursive: true });
  const indice = [];
  const cola = nuevos.map((x, i) => ({ ...x, id: `c-${String(i + 1).padStart(4, "0")}` }));
  async function trabajador() {
    while (cola.length) {
      const x = cola.shift();
      const cuerpo = x.f.solo_descubrimiento ? x.resumen : await cuerpoArticulo(x);
      fs.writeFileSync(path.join(dir, "capturas", `${x.id}.txt`),
        `FUENTE: ${x.f.nombre} (${x.f.linea})\nURL: ${x.url}\nFECHA: ${x.fecha || "?"}\nTITULO: ${x.titulo}\n` +
        (x.origen_rss ? `MEDIO ORIGINAL: ${x.origen_rss}\n` : "") + `\n----- TEXTO (material de terceros) -----\n${cuerpo}\n`);
      indice.push({
        id: x.id, fuente: x.f.id, nombre: x.f.nombre, linea: x.f.linea, origen: x.f.origen,
        ...(x.f.solo_descubrimiento ? { solo_descubrimiento: true, medio_original: x.origen_rss || undefined } : {}),
        titulo: x.titulo, fecha: x.fecha, resumen: x.resumen.slice(0, 280), chars: cuerpo.length,
        url: x.url, hash: x.hash,
      });
    }
  }
  await Promise.all([1, 2, 3, 4].map(trabajador));
  indice.sort((a, b) => a.id.localeCompare(b.id));
  escribir(path.join(dir, "indice.json"), indice.map(({ url, hash, ...r }) => r));
  escribir(path.join(dir, "capturas.privado.json"), indice); // con URL y hash: lo usa la verja, no el motor
  await db.registrarCapturas(indice.map((c) => ({ hash: c.hash, url: c.url, fuente: c.fuente, titulo: c.titulo, fecha_fuente: c.fecha, ciclo: path.basename(dir) })));
  log(`capturas nuevas: ${indice.length} de ${todos.length}`);
  return indice;
}

/* ---------- 3. tratar (motor) ---------- */
// Noticias nuevas que aún caben hoy: como mucho MAX_NOTICIAS por ciclo y MAX_DIA por día
// natural (las actualizaciones de una vigente no cuentan).
async function cupo() {
  const hoy = horaCiclo().toDateString();
  const n = [...await db.vigentes(), ...await db.retenidas()]
    .filter((x) => new Date(x.publicado).toDateString() === hoy).length;
  return Math.max(0, Math.min(MAX_NOTICIAS, MAX_DIA - n));
}

async function tratar(dir, cicloId) {
  const max = await cupo();
  log(`cupo del ciclo: ${max} noticias nuevas (máx. ${MAX_NOTICIAS} por ciclo, ${MAX_DIA} al día)`);
  escribir(path.join(dir, "ciclo.json"), { id: cicloId, ahora: new Date().toISOString(), max_noticias: max });
  escribir(path.join(dir, "vigentes.json"), (await db.vigentes()).map((n) => ({
    id: n.id, titulo: n.titulo, seccion: n.seccion, publicado: n.publicado,
    urls: (n.pieza.fuentes || []).map((f) => f.url).filter(Boolean),
  })));
  escribir(path.join(dir, "expedientes.json"), Object.entries(expedientes()).map(([ruta, e]) => ({ ruta, titulo: e.t, resumen: e.d })));
  const prompt = fs.readFileSync(path.join(AQUI, "motor.md"), "utf8");
  log("motor: Claude headless…");
  // Sin Bash y sin servidores MCP/conectores: el motor solo lee la carpeta del ciclo,
  // consulta la web para corroborar y escribe tratadas.json.
  const r = spawnSync("claude", [
    "-p", "--model", process.env.YAMACOA_MODELO || "opus",
    "--tools", "Read,Write,Glob,Grep,WebFetch,WebSearch",
    "--allowedTools", "Read,Write,Glob,Grep,WebFetch,WebSearch",
    "--permission-mode", "acceptEdits",
    "--strict-mcp-config", "--no-session-persistence", "--output-format", "json",
  ], { cwd: dir, input: prompt, encoding: "utf8", timeout: MOTOR_MIN * 60000, maxBuffer: 64 * 1024 * 1024 });
  fs.writeFileSync(path.join(dir, "motor.log.json"), r.stdout || "");
  if (r.error) throw new Error(`motor: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`motor terminó con ${r.status}: ${(r.stderr || r.stdout || "").slice(0, 500)}`);
  let res = null; try { res = JSON.parse(r.stdout).result; } catch { /* salida no JSON */ }
  log(`motor: ${String(res || "").trim().slice(0, 200)}`);
}

/* ---------- 4. verja ---------- */
async function verja(dir, cicloId) {
  const fichero = path.join(dir, "tratadas.json");
  if (!fs.existsSync(fichero)) throw new Error("el motor no escribió tratadas.json");
  const tratadas = JSON.parse(fs.readFileSync(fichero, "utf8"));
  const capt = new Map(JSON.parse(fs.readFileSync(path.join(dir, "capturas.privado.json"), "utf8")).map((c) => [c.id, c]));
  const conf = JSON.parse(fs.readFileSync(path.join(AQUI, "fuentes.json"), "utf8"));
  const nombres = new Map(conf.fuentes.map((f) => [f.id, f]));
  const vivas = new Map((await db.vigentes()).map((n) => [n.id, n]));
  const slugs = await db.slugs();
  const descartes = [...(tratadas.descartes || [])];
  const publicado = horaCiclo().toISOString();
  let aceptadas = 0;
  let libres = await cupo();
  // Si el motor se pasa del cupo, entran las más importantes.
  const lista = [...(tratadas.noticias || [])].sort((a, b) => (Number(b.importancia) || 0) - (Number(a.importancia) || 0));

  for (const t0 of lista) {
    const t = sinRayas(t0);
    const usadas = [];
    try {
      const fuentes = [];
      for (const f of t.fuentes || []) {
        if (f.captura) {
          const c = capt.get(f.captura);
          if (!c) throw new Error(`fuente ${f.captura} no existe en el ciclo`);
          if (c.solo_descubrimiento) throw new Error(`fuente ${f.captura} es solo de descubrimiento`);
          usadas.push(c.hash);
          fuentes.push({ nombre: nombres.get(c.fuente)?.nombre || c.nombre, url: c.url, tipo: f.tipo || "medio",
            origen: f.origen || c.origen, ...(f.verificacion ? { verificacion: f.verificacion } : {}) });
        } else if (f.url) {
          // Fuente extra: la URL tiene que existir de verdad (nada de enlaces inventados).
          const ok = await fetch(f.url, { redirect: "follow", signal: AbortSignal.timeout(15000),
            headers: { "User-Agent": "Mozilla/5.0 (compatible; YamacoaBot/1.0)" } }).then((r) => r.ok).catch(() => false);
          if (!ok) throw new Error(`fuente extra inaccesible: ${f.url}`);
          fuentes.push({ nombre: f.nombre, url: f.url, tipo: f.tipo || "medio", origen: f.origen || f.nombre,
            ...(f.verificacion ? { verificacion: f.verificacion } : {}) });
        } else throw new Error("fuente sin captura ni url");
      }

      const previa = t.actualiza ? vivas.get(t.actualiza) : null;
      if (t.actualiza && !previa) throw new Error(`actualiza ${t.actualiza}, que ya no está vigente`);
      if (!previa && libres <= 0) throw new Error(`cupo diario completo (${MAX_DIA})`);
      let slug = previa?.slug;
      if (!slug) {
        const base = slugify(t.titulo) || "noticia";
        slug = base; for (let k = 2; slugs.has(slug); k++) slug = `${base}-${k}`;
      }
      const id = previa?.id || `n-${slug}`;
      const pieza = {
        titulo: t.titulo, entradilla: t.entradilla, cuerpo: t.cuerpo, fuentes, confianza: t.confianza,
        ...(t.pendiente?.length ? { pendiente: t.pendiente } : {}),
        ...(t.cifra ? { cifra: t.cifra } : {}),
        ...(t.grafico ? { grafico: t.grafico } : {}),
        ...(t.versiones?.length ? { versiones: t.versiones } : {}),
        ...(t.expediente && expedientes()[t.expediente] ? { expediente: t.expediente } : {}),
      };
      const origenes = new Set(fuentes.map((f) => f.origen)).size;
      const mixta = new Set(fuentes.map((f) => (f.origen === "estado-cubano" ? "oficial" : "otra"))).size > 1;
      const relevancia = Math.min(100, (Number(t.importancia) || 2) * 14 + Math.min(20, origenes * 5) + (mixta ? 6 : 0));
      const pub = previa ? new Date(previa.publicado).toISOString() : publicado;
      const candidata = {
        ...pieza, id, slug, plantilla: t.plantilla, seccion: t.seccion, publicado: pub,
        caduca: new Date(Date.parse(pub) + VIDA_MS).toISOString(), relevancia,
        audio: { url: `${SITE}/audio/noticias/${id}.mp3`, duracion: 1 },
      };
      const e1 = validador.pieza(candidata);
      if (e1) throw new Error(`schema: ${e1}`);
      const e2 = reglas(candidata);
      if (e2.length) throw new Error(`reglas: ${e2.join("; ")}`);
      const guion = String(t.guion || "").trim();
      if (guion.length < 120) throw new Error("guion de resumen hablado ausente o demasiado corto");

      const fila = { plantilla: t.plantilla, seccion: t.seccion, titulo: t.titulo, relevancia, pieza, guion,
        capturas: usadas, ciclo: cicloId, estado: "retenida", audio: null };
      if (previa) await db.actualizar(id, { ...fila, actualizado: new Date().toISOString() });
      else { await db.insertar({ id, slug, publicado, ...fila }); slugs.add(slug); libres--; }
      aceptadas++;
      log(`verja OK  [${t.plantilla}] ${t.titulo}`);
    } catch (e) {
      descartes.push({ titulo: t.titulo, motivo: `verja: ${e.message}`.slice(0, 600) });
      log(`verja NO  ${t.titulo}: ${e.message.slice(0, 200)}`);
    }
  }
  return { aceptadas, descartes };
}

/* ---------- 5. audio ---------- */
async function audio() {
  let ok = 0, fallos = 0;
  for (const n of await db.retenidas()) {
    try {
      const dur = sintetizar(n.guion, path.join(AUDIO, `${n.id}.mp3`));
      await db.actualizar(n.id, { estado: "publicada", audio: { url: `/audio/noticias/${n.id}.mp3`, duracion: dur, voz: VOZ, texto: n.guion } });
      ok++; log(`audio OK  ${n.id} (${dur} s)`);
    } catch (e) { fallos++; log(`audio NO  ${n.id}: ${e.message}`); }
  }
  return { ok, fallos };
}

/* ---------- principal ---------- */
async function main() {
  if (flag("--solo-exportar")) { await exportar(valor("--destino") || path.join(REPO, "public")); return; }
  const desplegar = !flag("--sin-desplegar");
  if (desplegar && db.tipo !== "supabase") throw new Error("sin SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY no se publica (la BD local es solo de ensayo); usa --sin-desplegar");
  const reusar = valor("--reusar");
  const cicloId = reusar || idCiclo();
  const dir = path.join(AQUI, "ciclos", cicloId);
  log(`ciclo ${cicloId} · bd ${db.tipo} · ${desplegar ? "con despliegue" : "ensayo sin despliegue"}`);
  if (!reusar) await db.iniciarCiclo(cicloId);
  const resumen = { capturadas: 0, tratadas: 0, publicadas: 0, retenidas: 0, caducadas: 0, descartes: [], desplegado: false };
  try {
    const fuera = await db.caducar();
    resumen.caducadas = fuera.length;
    if (fuera.length) {
      log(`caducadas: ${fuera.join(", ")}`);
      if (desplegar) { publicar("caducidad"); resumen.desplegado = true; }
    }
    if (!reusar) {
      const indice = await capturar(dir);
      resumen.capturadas = indice.length;
      if (indice.length) await tratar(dir, cicloId);
    }
    if (fs.existsSync(path.join(dir, "tratadas.json"))) {
      const v = await verja(dir, cicloId);
      resumen.tratadas = v.aceptadas; resumen.descartes = v.descartes;
    }
    const a = await audio();
    resumen.publicadas = a.ok; resumen.retenidas = a.fallos;
    if (desplegar) {
      if (a.ok) { publicar("ciclo"); resumen.desplegado = true; }
    } else {
      await exportar(path.join(REPO, "public"));
    }
  } catch (e) {
    resumen.error = e.message;
    log(`ERROR ${e.stack || e.message}`);
    process.exitCode = 1;
  } finally {
    escribir(path.join(dir, "resumen.json"), resumen);
    if (!reusar) await db.cerrarCiclo(cicloId, resumen).catch((e) => log(`cerrarCiclo: ${e.message}`));
    log(`fin: ${JSON.stringify({ ...resumen, descartes: resumen.descartes.length })}`);
  }
}

main();
