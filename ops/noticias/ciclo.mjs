#!/usr/bin/env node
// Ciclo de noticias automáticas de Yamacoa (cron: 00:00 y 18:00).
//
//   1. caducar   borra de la BD lo que cumplió 3 días (o se retiró) y, si hubo algo,
//                redespliega ya para que la página desaparezca del sitio a su hora
//   2. capturar  RSS de ops/noticias/fuentes.json -> ciclos/<id>/indice.json + capturas/
//   3. tratar    Claude en modo headless (motor.md) -> ciclos/<id>/tratadas.json
//   4. verja     schema + reglas editoriales; lo que no pasa va a descartes. Los puntos
//                nuevos de las series de referencia (series.json) solo entran si el valor
//                está en el texto citado, y los gráficos de serie los construye el código
//   5. audio     Kokoro -> MP3; sin resumen hablado la pieza queda «retenida»
//   5b. imagen   FLUX.1-schnell local (imagen.py): ilustración editorial rotulada «generada por
//                IA». El motor describe la escena; estilo y prohibiciones los pone el código.
//                Si falla, la noticia sale sin imagen (nunca bloquea)
//   6. exportar  vigentes de la BD -> <destino>/data/feed/noticias.json + audio
//   7. publicar  ops/publicar.sh (build de la rama `publicacion` + wrangler)
//
// Uso:
//   node ops/noticias/ciclo.mjs                       ciclo completo (lo que lanza el cron)
//   node ops/noticias/ciclo.mjs --sin-desplegar       ensayo: exporta a public/ del repo y no sube
//   node ops/noticias/ciclo.mjs --solo-exportar --destino <dir>   (lo usa publicar.sh)
//   node ops/noticias/ciclo.mjs --reusar <ciclo-id>   repite verja+audio sobre un tratadas.json existente
//   … --sin-desplegar --sin-audio                     ensayo de maqueta: audio mudo (solo con la BD local)
//   node ops/noticias/ciclo.mjs --reusar <id> --solo-imagen   reintenta las ilustraciones de ese ciclo
//   … --sin-imagen                                    ciclo sin ilustraciones

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { abrir, VIDA_MS } from "./lib/db.mjs";
import { leerRss, cuerpoArticulo, hashUrl, descargar, texto } from "./lib/rss.mjs";
import { cargarValidador, reglas, sinRayas } from "./lib/validar.mjs";
import { sintetizar, VOZ } from "./lib/audio.mjs";
import { cargarSeries, paraMotor, fechaValida, numeroEnTexto, graficoDeSerie, ordenados } from "./lib/series.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(AQUI, "../..");
const ESTADO = path.join(AQUI, "estado");
// Caché de audio separada por BD: la limpieza de un ensayo (BD local) nunca toca la de producción.
const AUDIO_DE = (tipo) => path.join(ESTADO, tipo === "local" ? "audio-ensayo" : "audio");
const SCHEMA = path.join(REPO, "public/data/feed/noticias.schema.json");
const CATALOGO = path.join(AQUI, "series.json");
const series = async () => cargarSeries({ catalogo: CATALOGO, datos: path.join(REPO, "public/data"), puntos: await db.puntosSeries() });
const SITE = (process.env.YAMACOA_SITE || "https://yamacoa.com").replace(/\/+$/, "");
const MAX_NOTICIAS = Number(process.env.YAMACOA_MAX_NOTICIAS || 10); // por ciclo
const MAX_DIA = Number(process.env.YAMACOA_MAX_DIA || 20);           // nuevas por día natural (hora local)
const MOTOR_MIN = Number(process.env.YAMACOA_MOTOR_MIN || 45);

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const valor = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const log = (...m) => console.log(new Date().toISOString().slice(11, 19), ...m);

const db = abrir({ estadoDir: ESTADO });
const AUDIO = AUDIO_DE(db.tipo);
const IMAGEN = path.join(ESTADO, db.tipo === "local" ? "imagen-ensayo" : "imagen");
const PY = process.env.YAMACOA_TTS_PY || "/home/<usuario>/bohio/yamacoa-tts/.venv/bin/python";
// Identidad visual común (paleta de Yamacoa) y límites de §11.4: ilustración, nunca foto; sin
// personas reconocibles, sin texto, sin banderas ni símbolos políticos.
// La escena va DELANTE: CLIP solo lee 77 tokens (T5 lee todo).
const ESTILO = ". Editorial illustration for a news website, flat geometric shapes with soft risograph grain, " +
  "limited palette of terracotta orange, sage green, warm cream and deep brown, calm balanced composition, " +
  "symbolic and slightly abstract, generous negative space, clearly an illustration and not a photograph, " +
  "no text, no letters, no numbers, no price tags, no currency symbols, no logos, no flags, no recognizable people, " +
  "any human figure only as a small faceless silhouette.";
const semilla = (id) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 2147483647;
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
// Ensayo (public/ del repo, npm start): el audio se sirve en local; en el build, desde el sitio.
const ENSAYO_BASE = process.env.YAMACOA_ENSAYO_BASE || "http://localhost:3123";
async function exportar(destino) {
  const base = path.resolve(destino) === path.join(REPO, "public") ? ENSAYO_BASE : SITE;
  const vivas = await db.vigentes();
  // Una ilustración cuyo fichero no está en la caché no se enlaza (nada de imágenes rotas).
  const img = (n) => {
    const i = n.pieza.imagen;
    if (!i) return {};
    if (!i.url.startsWith("/")) return { imagen: i };
    return fs.existsSync(path.join(IMAGEN, `${n.id}.webp`)) ? { imagen: { ...i, url: base + i.url } } : {};
  };
  const items = vivas.map((n) => ({
    ...(({ imagen, ...p }) => p)(n.pieza),
    ...img(n),
    id: n.id, slug: n.slug, plantilla: n.plantilla, seccion: n.seccion,
    publicado: new Date(n.publicado).toISOString(),
    caduca: new Date(Date.parse(n.publicado) + VIDA_MS).toISOString(),
    ...(n.actualizado ? { actualizado: new Date(n.actualizado).toISOString() } : {}),
    relevancia: Number(n.relevancia),
    audio: { ...n.audio, url: base + n.audio.url },
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
  // Ilustraciones (≈100 KB, efímeras como el audio): solo las de las vigentes.
  const dirImg = path.join(destino, "imagen/noticias");
  fs.rmSync(dirImg, { recursive: true, force: true });
  fs.mkdirSync(dirImg, { recursive: true });
  for (const n of vivas) {
    const f = path.join(IMAGEN, `${n.id}.webp`);
    if (n.pieza.imagen && fs.existsSync(f)) fs.copyFileSync(f, path.join(dirImg, `${n.id}.webp`));
  }
  for (const f of fs.existsSync(IMAGEN) ? fs.readdirSync(IMAGEN) : []) if (!vivas.some((n) => `${n.id}.webp` === f)) fs.rmSync(path.join(IMAGEN, f));
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
  escribir(path.join(dir, "series.json"), paraMotor(await series()));
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
  const ser = await series();
  const textoCaptura = (id) => { try { return fs.readFileSync(path.join(dir, "capturas", `${id}.txt`), "utf8"); } catch { return ""; } };
  const publicado = horaCiclo().toISOString();
  let aceptadas = 0;
  const escenas = {}; // id -> { escena, alt } para el paso de imagen
  let libres = await cupo();
  // Si el motor se pasa del cupo, entran las más importantes.
  const lista = [...(tratadas.noticias || [])].sort((a, b) => (Number(b.importancia) || 0) - (Number(a.importancia) || 0));

  for (const t0 of lista) {
    const t = sinRayas(t0);
    const usadas = [];
    try {
      const fuentes = [];
      const textos = []; // texto de cada fuente que es captura (para comprobar números)
      for (const f of t.fuentes || []) {
        textos.push(f.captura ? textoCaptura(f.captura) : null);
        if (f.serie) {
          // Serie de referencia: la cita el análisis; nombre y enlace los pone el código.
          const sr = ser.get(f.serie);
          if (!sr) throw new Error(`serie ${f.serie} no existe en el catálogo`);
          fuentes.push({ nombre: `Serie Yamacoa: ${sr.titulo} (${sr.fuente})`, url: `${SITE}${sr.expediente || "/metodologia"}`,
            tipo: "dataset", origen: `serie:${sr.id}` });
        } else if (f.captura) {
          const c = capt.get(f.captura);
          if (!c) throw new Error(`fuente ${f.captura} no existe en el ciclo`);
          if (c.solo_descubrimiento) throw new Error(`fuente ${f.captura} es solo de descubrimiento`);
          usadas.push(c.hash);
          fuentes.push({ nombre: nombres.get(c.fuente)?.nombre || c.nombre, url: c.url, tipo: f.tipo || "medio",
            origen: f.origen || c.origen, ...(f.verificacion ? { verificacion: f.verificacion } : {}) });
        } else if (f.url) {
          // Fuente extra: la URL tiene que existir de verdad (nada de enlaces inventados). Su
          // texto sirve también para comprobar los números que se le atribuyen.
          const html = await descargar(f.url, 15000).catch(() => null);
          if (html == null) throw new Error(`fuente extra inaccesible: ${f.url}`);
          textos[textos.length - 1] = texto(html);
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

      // Puntos nuevos de series: cada valor tiene que estar en el texto de una captura citada.
      const nuevos = [];
      for (const p of t.puntos || []) {
        const sr = ser.get(p.serie);
        const cit = (p.citas || []).filter((c) => textos[c - 1]); // capturas y fuentes extra, no series
        const previo = sr && ordenados(sr).filter((x) => x.fecha < p.fecha).pop();
        const motivo = !sr ? "serie inexistente" : !sr.abierta ? "serie cerrada" : !fechaValida(sr, p.fecha) ? `fecha ${p.fecha} no es ${sr.frecuencia}`
          : !Number.isFinite(Number(p.valor)) ? "valor no numérico" : !cit.length ? "sin cita a un texto comprobable"
          : !cit.some((c) => numeroEnTexto(p.valor, textos[c - 1])) ? `el valor ${p.valor} no está en el texto citado`
          : previo && (p.valor / previo.valor > 5 || p.valor / previo.valor < 0.2) ? `salto anómalo frente a ${previo.valor}` : null;
        if (motivo) { log(`serie NO  ${p.serie} ${p.fecha}=${p.valor}: ${motivo}`); continue; }
        const f = fuentes[cit[0] - 1];
        nuevos.push({ serie: sr.id, fecha: p.fecha, valor: Number(p.valor), fuente: f.nombre, url: f.url });
      }
      // Gráfico: de una serie (lo construye el código con los puntos ya validados) o propio
      // de la pieza (cada valor tiene que estar en alguna de sus capturas).
      let grafico = null;
      if (t.grafico?.serie) {
        const sr = ser.get(t.grafico.serie);
        if (sr) {
          const copia = { ...sr, puntos: new Map(sr.puntos) };
          for (const p of nuevos.filter((x) => x.serie === sr.id)) copia.puntos.set(p.fecha, { ...p, origen: "noticia" });
          grafico = graficoDeSerie(copia, { tipo: t.grafico.tipo, titulo: t.grafico.titulo, nuevas: nuevos.filter((x) => x.serie === sr.id).map((x) => x.fecha) });
        }
        if (!grafico) log(`gráfico fuera: la serie ${t.grafico.serie} no existe o tiene menos de 3 puntos`);
      } else if (t.grafico) {
        const todo = textos.filter(Boolean).join("\n");
        const sin = (t.grafico.datos || []).filter((d) => d.valor != null && !numeroEnTexto(d.valor, todo));
        if (sin.length) log(`gráfico fuera: ${sin.map((d) => d.valor).join(", ")} no están en las capturas`);
        else grafico = t.grafico;
      }
      let analisis = t.analisis?.length ? t.analisis : null;
      if (analisis && t.plantilla === "breve") { analisis = null; log("análisis fuera: no va en breve"); }

      const pieza = {
        titulo: t.titulo, entradilla: t.entradilla, cuerpo: t.cuerpo, fuentes, confianza: t.confianza,
        ...(t.pendiente?.length ? { pendiente: t.pendiente } : {}),
        ...(t.cifra ? { cifra: t.cifra } : {}),
        ...(analisis ? { analisis } : {}),
        ...(grafico ? { grafico } : {}),
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
      if (nuevos.length) {
        try {
          await db.insertarPuntos(nuevos.map((p) => ({ ...p, noticia: id, ciclo: cicloId })));
          for (const p of nuevos) ser.get(p.serie).puntos.set(p.fecha, { ...p, origen: "noticia" });
          log(`serie OK  ${nuevos.map((p) => `${p.serie} ${p.fecha}=${p.valor}`).join(", ")}`);
        } catch (e) { log(`serie: ${e.message}`); }
      }
      aceptadas++;
      const il = t.ilustracion;
      if (il?.escena && il?.alt && String(il.escena).length <= 400) escenas[id] = { escena: String(il.escena), alt: String(il.alt).slice(0, 200) };
      log(`verja OK  [${t.plantilla}] ${t.titulo}`);
    } catch (e) {
      descartes.push({ titulo: t.titulo, motivo: `verja: ${e.message}`.slice(0, 600) });
      log(`verja NO  ${t.titulo}: ${e.message.slice(0, 200)}`);
    }
  }
  escribir(path.join(dir, "escenas.json"), escenas);
  return { aceptadas, descartes };
}

/* ---------- 5b. imagen ---------- */
// Ilustra las vigentes sin imagen que tienen escena (de este ciclo o de uno reusado).
async function imagenes(dir) {
  const escenas = (() => { try { return JSON.parse(fs.readFileSync(path.join(dir, "escenas.json"), "utf8")); } catch { return {}; } })();
  const sin = (await db.vigentes()).filter((n) => !n.pieza.imagen && escenas[n.id]);
  if (!sin.length) return 0;
  const salida = path.join(dir, "imagenes");
  escribir(path.join(dir, "imagen.json"), { salida, items: sin.map((n) => ({ id: n.id, prompt: escenas[n.id].escena.replace(/[.\s]+$/, "") + ESTILO, seed: semilla(n.id) })) });
  log(`imagen: FLUX, ${sin.length} ilustraciones…`);
  const r = spawnSync(PY, [path.join(AQUI, "imagen.py"), path.join(dir, "imagen.json")],
    { stdio: ["ignore", "inherit", "inherit"], timeout: 40 * 60000, env: { ...process.env, TQDM_DISABLE: "1", HF_HUB_DISABLE_PROGRESS_BARS: "1" } });
  if (r.status !== 0) { log(`imagen: imagen.py terminó con ${r.status}; las noticias salen sin ilustración`); return 0; }
  let ok = 0;
  const hechas = (() => { try { return JSON.parse(fs.readFileSync(path.join(salida, "imagenes.json"), "utf8")); } catch { return {}; } })();
  for (const n of sin) {
    if (!hechas[n.id]) continue;
    fs.mkdirSync(IMAGEN, { recursive: true });
    fs.copyFileSync(path.join(salida, hechas[n.id]), path.join(IMAGEN, `${n.id}.webp`));
    const imagen = { url: `/imagen/noticias/${n.id}.webp`, alt: escenas[n.id].alt, tipo: "ilustracion_ia",
      credito: "FLUX.1-schnell · Yamacoa" }; // la plantilla antepone «Ilustración generada por IA»
    await db.actualizar(n.id, { pieza: { ...n.pieza, imagen } });
    ok++;
  }
  log(`imagen: ${ok} de ${sin.length} ilustradas`);
  return ok;
}

/* ---------- 5. audio ---------- */
async function audio() {
  let ok = 0, fallos = 0;
  const mudo = (f) => { // ensayo de maqueta: 1 s de silencio en lugar de Kokoro
    fs.mkdirSync(path.dirname(f), { recursive: true });
    const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono", "-t", "1", "-q:a", "9", f]);
    if (r.status !== 0) throw new Error("ffmpeg no generó el audio mudo");
    return 1;
  };
  for (const n of await db.retenidas()) {
    try {
      const dur = flag("--sin-audio") ? mudo(path.join(AUDIO, `${n.id}.mp3`)) : sintetizar(n.guion, path.join(AUDIO, `${n.id}.mp3`));
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
  if (flag("--sin-audio") && (desplegar || db.tipo !== "local")) throw new Error("--sin-audio es solo para ensayos con la BD local y --sin-desplegar");
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
    if (flag("--solo-imagen")) { // reintentar ilustraciones de un ciclo (--reusar <id>)
      resumen.ilustradas = await imagenes(dir);
      if (desplegar) { if (resumen.ilustradas) { publicar("imagenes"); resumen.desplegado = true; } }
      else await exportar(path.join(REPO, "public"));
      return;
    }
    if (!reusar) {
      const indice = await capturar(dir);
      resumen.capturadas = indice.length;
      if (indice.length) await tratar(dir, cicloId);
    }
    // Vistas solo cuando el motor las trató: si falla, el ciclo siguiente las vuelve a ver.
    const privado = path.join(dir, "capturas.privado.json");
    if (fs.existsSync(path.join(dir, "tratadas.json")) && fs.existsSync(privado)) {
      const indice = JSON.parse(fs.readFileSync(privado, "utf8"));
      await db.registrarCapturas(indice.map((c) => ({ hash: c.hash, url: c.url, fuente: c.fuente, titulo: c.titulo, fecha_fuente: c.fecha, ciclo: cicloId })));
    }
    if (fs.existsSync(path.join(dir, "tratadas.json"))) {
      const v = await verja(dir, cicloId);
      resumen.tratadas = v.aceptadas; resumen.descartes = v.descartes;
    }
    const a = await audio();
    resumen.publicadas = a.ok; resumen.retenidas = a.fallos;
    if (!flag("--sin-imagen")) resumen.ilustradas = await imagenes(dir).catch((e) => { log(`imagen: ${e.message}`); return 0; });
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
