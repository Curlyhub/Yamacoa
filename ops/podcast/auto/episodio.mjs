#!/usr/bin/env node
// Podcasts automáticos de Yamacoa.
//
//   1. noticias  vigentes de la BD (ya pasaron su verja) -> episodios/<id>/noticias.json
//   2. guion     Claude headless (guionista.md), sin web: solo convierte lo publicado en radio
//   3. verja     estructura + cada cifra del guion tiene que estar en su noticia; el bloque
//                que no pasa se cae (el episodio sigue si quedan al menos dos)
//   4. voces     VoxCPM2 local (tts.py). Entrada y cierre, con el aviso de voces sintéticas,
//                los pone el código, no el modelo
//   5. mezcla    ffmpeg: pausas, música si la hay (musica/entrada.*, musica/salida.*),
//                −16 LUFS, MP3 mono 96 kbps; capítulos y transcripción con tiempos exactos
//   6. estado    ensayo (voces no definitivas) · revision (conversación: verja humana) ·
//                listo (sin destino de subida) · publicado (MP3 en tts.yamacoa.com/podcast + feed)
//
// Uso:
//   node ops/podcast/auto/episodio.mjs --formato al-dia            (cron, tras el ciclo de las 18:00)
//   node ops/podcast/auto/episodio.mjs --formato conversacion      (domingos)
//   … --ensayo        no guarda en la BD ni sube nada: exporta a public/ para verlo en npm start
//   … --reusar <id>   rehace lo que falte (guion, voces o mezcla) de un episodio existente
//   … --sin-voz       se para tras la verja (revisar el guion)
//   node ops/podcast/auto/episodio.mjs --aprobar <id>              (revisión humana: revision -> listo/publicado)
//   node ops/podcast/auto/episodio.mjs --solo-exportar --destino <dir>   (lo usa publicar.sh)

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { abrir } from "../../noticias/lib/db.mjs";
import { cargarSeries, paraMotor, numeroEnTexto } from "../../noticias/lib/series.mjs";
import { paraOido, cifras } from "./lib/oral.mjs";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(AQUI, "../../..");
const EPISODIOS = path.join(AQUI, "episodios");
// Dónde viven los MP3: el servidor propio de tts.yamacoa.com (nginx sirve /podcast/), al que
// el ciclo sube por rsync con una clave dedicada. Para pasar a R2 basta YAMACOA_R2_BUCKET y
// YAMACOA_MEDIA=https://media.yamacoa.com (la web solo ve la URL).
const MEDIA = (process.env.YAMACOA_MEDIA || "https://tts.yamacoa.com").replace(/\/+$/, "");
// La clave solo puede escribir .mp3 en /var/www/yamacoa-media/podcast (orden forzada en el servidor).
const DESTINO = process.env.YAMACOA_MEDIA_DESTINO ?? "<usuario>@<servidor>:";
const CLAVE = process.env.YAMACOA_MEDIA_CLAVE || `${process.env.HOME}/.ssh/yamacoa_media`;
const PY = process.env.YAMACOA_TTS_PY || "/home/<usuario>/bohio/yamacoa-tts/.venv/bin/python";
const BUCKET = process.env.YAMACOA_R2_BUCKET || ""; // alternativa: R2
const MINUTOS = { "al-dia": Number(process.env.YAMACOA_PODCAST_MIN || 6), conversacion: 12 };

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const valor = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const log = (...m) => console.log(new Date().toISOString().slice(11, 19), ...m);
const escribir = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2)); };
const leerJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const db = abrir({ estadoDir: path.join(REPO, "ops/noticias/estado") });

const hoy = () => new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD, hora local
const fechaHablada = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

/* ---------- 1. noticias ---------- */
const textoNoticia = (n) => [n.titulo, n.entradilla, ...(n.cuerpo || []).map((p) => p.texto), ...(n.analisis || []).map((p) => p.texto),
  n.cifra ? `${n.cifra.valor} ${n.cifra.unidad || ""} ${n.cifra.etiqueta || ""}` : "",
  ...(n.grafico?.datos || []).map((d) => `${d.etiqueta} ${d.valor}`), ...(n.versiones || []).map((v) => v.texto)].join("\n");

async function reunir(formato) {
  const vivas = (await db.vigentes()).map((n) => ({ ...n.pieza, id: n.id, seccion: n.seccion, plantilla: n.plantilla,
    publicado: new Date(n.publicado).toISOString(), relevancia: Number(n.relevancia) }));
  let elegidas = vivas;
  if (formato === "al-dia") {
    const recientes = vivas.filter((n) => Date.now() - Date.parse(n.publicado) < 30 * 3600000);
    elegidas = recientes.length >= 3 ? recientes : vivas;
  }
  return elegidas.sort((a, b) => b.relevancia - a.relevancia).map((n) => ({
    id: n.id, titulo: n.titulo, seccion: n.seccion, confianza: n.confianza, entradilla: n.entradilla,
    cuerpo: (n.cuerpo || []).map((p) => p.texto), analisis: (n.analisis || []).map((p) => p.texto),
    ...(n.cifra ? { cifra: n.cifra } : {}), ...(n.grafico ? { grafico: n.grafico } : {}),
    ...(n.versiones ? { versiones: n.versiones } : {}),
    fuentes: (n.fuentes || []).map((f) => f.nombre), _texto: textoNoticia(n),
  }));
}

/* ---------- 2. guion ---------- */
function escribirGuion(dir) {
  log("guion: Claude headless…");
  const r = spawnSync("claude", [
    "-p", "--model", process.env.YAMACOA_MODELO || "opus",
    "--tools", "Read,Write,Glob", "--allowedTools", "Read,Write,Glob",
    "--permission-mode", "acceptEdits", "--strict-mcp-config", "--no-session-persistence", "--output-format", "json",
  ], { cwd: dir, input: fs.readFileSync(path.join(AQUI, "guionista.md"), "utf8"), encoding: "utf8", timeout: 25 * 60000, maxBuffer: 64 << 20 });
  fs.writeFileSync(path.join(dir, "guion.log.json"), r.stdout || "");
  if (r.error) throw new Error(`guionista: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`guionista terminó con ${r.status}: ${(r.stderr || r.stdout || "").slice(0, 400)}`);
  if (!fs.existsSync(path.join(dir, "guion.json"))) throw new Error("el guionista no escribió guion.json");
}

/* ---------- 3. verja ---------- */
function verja(guion, noticias, formato) {
  const porId = new Map(noticias.map((n) => [n.id, n]));
  const fallos = [];
  if (!(guion.titulo?.length >= 6 && guion.titulo.length <= 90)) fallos.push("título del episodio fuera de 6-90 caracteres");
  if (!(guion.descripcion?.length >= 40 && guion.descripcion.length <= 600)) fallos.push("descripción fuera de 40-600 caracteres");
  if (fallos.length) throw new Error(`verja: ${fallos.join("; ")}`);
  const bloques = [];
  for (const b of guion.bloques || []) {
    const ids = [].concat(b.noticia || []);
    const fuente = ids.map((id) => porId.get(id));
    const motivo = !ids.length || fuente.some((x) => !x) ? `noticia inexistente (${ids.join(", ")})`
      : !b.titulo || b.titulo.length > 80 ? "título de capítulo ausente o largo"
      : !(b.turnos || []).length ? "sin turnos"
      : (b.turnos || []).find((t) => !["A", "B"].includes(t.voz) || !(t.texto?.length >= 10 && t.texto.length <= 900)) ? "turno mal formado"
      : null;
    if (motivo) { log(`verja NO  bloque «${b.titulo}»: ${motivo}`); continue; }
    // Cada cifra del guion está en alguna de sus noticias (los años, libres).
    const texto = fuente.map((n) => n._texto).join("\n");
    const sueltas = b.turnos.flatMap((t) => cifras(t.texto)).filter((v) => !(Number.isInteger(v) && v >= 1950 && v <= 2100) && !numeroEnTexto(v, texto));
    if (sueltas.length) { log(`verja NO  bloque «${b.titulo}»: cifras sin respaldo ${sueltas.join(", ")}`); continue; }
    bloques.push({ ...b, noticia: ids, turnos: b.turnos.map((t) => ({ voz: t.voz, texto: t.texto.replace(/\s*—\s*/g, ", ") })) });
  }
  if (bloques.length < (formato === "al-dia" ? 2 : 1)) throw new Error(`verja: solo ${bloques.length} bloques válidos`);
  log(`verja OK  ${bloques.length} de ${(guion.bloques || []).length} bloques`);
  return { titulo: guion.titulo, descripcion: guion.descripcion, bloques };
}

/* ---------- 4. voces ---------- */
function turnosDe(guion, formato, fecha, voces) {
  const nombre = formato === "al-dia" ? "Yamacoa al día" : "Conversación Yamacoa";
  const entrada = [
    { voz: "A", texto: `Esto es ${nombre}, ${formato === "al-dia" ? "las noticias de Cuba" : "la semana en Cuba con datos"} del ${fechaHablada(fecha)}.` },
    { voz: "B", texto: "Las voces de este episodio son sintéticas. El guion sale de las noticias publicadas en Yamacoa punto com, donde cada dato tiene su fuente." },
  ];
  const cierre = [
    { voz: "A", texto: "Las noticias completas, con sus fuentes y sus gráficos, están en Yamacoa punto com." },
    { voz: "B", texto: formato === "al-dia" ? "Hasta mañana." : "Hasta la semana que viene." },
  ];
  const bloques = [{ titulo: null, turnos: entrada }, ...guion.bloques, { titulo: null, turnos: cierre }];
  let k = 0;
  return bloques.flatMap((b, i) => b.turnos.map((t) => ({
    id: `t-${String(++k).padStart(4, "0")}`, bloque: i, voz: t.voz, texto: t.texto, oral: paraOido(t.texto),
    hablante: `${voces[t.voz].etiqueta} (voz sintética)`,
  })));
}

// La transcripción de la referencia es privada: vive fuera del repo, junto al WAV.
const enCasa = (f) => f.replace(/^~/, process.env.HOME);
function textoReferencia(v) {
  const r = v.texto_referencia_de;
  if (!r) return null;
  try { return JSON.parse(fs.readFileSync(enCasa(r.fichero), "utf8"))[r.clave] || null; } catch { return null; }
}

function sintetizar(dir, turnos, conf) {
  const audio = path.join(dir, "voces");
  const faltan = turnos.filter((t) => !fs.existsSync(path.join(audio, `${t.id}.wav`)));
  if (!faltan.length) return;
  escribir(path.join(dir, "tts.json"), {
    salida: audio,
    voces: Object.fromEntries(Object.entries(conf.voces).map(([k, v]) => [k, { referencia: v.referencia, texto_referencia: textoReferencia(v), diseno: v.diseno }])),
    turnos: faltan.map((t) => ({ id: t.id, voz: t.voz, texto: t.oral })),
  });
  log(`voces: VoxCPM2, ${faltan.length} turnos…`);
  const r = spawnSync(PY, [path.join(AQUI, "tts.py"), path.join(dir, "tts.json")], { stdio: ["ignore", "inherit", "inherit"], timeout: 90 * 60000,
    env: { ...process.env, TQDM_DISABLE: "1" } }); // sin barras de progreso en el registro
  if (r.status !== 0) throw new Error(`tts.py terminó con ${r.status}`);
  // duraciones.json solo trae las de esta pasada: se acumulan.
  const previo = fs.existsSync(path.join(dir, "duraciones.json")) ? leerJson(path.join(dir, "duraciones.json")).duraciones : {};
  const nuevo = leerJson(path.join(audio, "duraciones.json"));
  escribir(path.join(dir, "duraciones.json"), { sr: nuevo.sr, duraciones: { ...previo, ...nuevo.duraciones } });
}

/* ---------- 5. mezcla ---------- */
const PAUSA = { turno: 0.35, bloque: 0.9 };
const musica = (cual) => ["wav", "mp3", "flac", "ogg"].map((e) => path.join(AQUI, "musica", `${cual}.${e}`)).find((f) => fs.existsSync(f));
const duracionDe = (f) => Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout.trim());

function mezclar(dir, turnos) {
  const { sr, duraciones } = leerJson(path.join(dir, "duraciones.json"));
  const ent = musica("entrada"), sal = musica("salida");
  const entradas = []; const filtros = []; let n = 0; let t = 0;
  const marcas = []; // inicio de cada turno en el episodio final
  const pon = (f) => { entradas.push("-i", f); filtros.push(`[${n}:a]aresample=${sr},aformat=channel_layouts=mono[a${n}]`); return n++; };
  const silencio = (s) => { entradas.push("-f", "lavfi", "-t", String(s), "-i", `anullsrc=r=${sr}:cl=mono`); filtros.push(`[${n}:a]anull[a${n}]`); n++; t += s; };
  if (ent) { pon(ent); t += duracionDe(ent); silencio(0.4); }
  turnos.forEach((x, i) => {
    if (i > 0) silencio(x.bloque !== turnos[i - 1].bloque ? PAUSA.bloque : PAUSA.turno);
    marcas.push(t); pon(path.join(dir, "voces", `${x.id}.wav`)); t += duraciones[x.id];
  });
  if (sal) { silencio(0.6); pon(sal); }
  const grafo = `${filtros.join(";")};${Array.from({ length: n }, (_, i) => `[a${i}]`).join("")}concat=n=${n}:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[out]`;
  fs.writeFileSync(path.join(dir, "mezcla.filtro"), grafo);
  const mp3 = path.join(dir, "episodio.mp3");
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...entradas, "-filter_complex_script", path.join(dir, "mezcla.filtro"),
    "-map", "[out]", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "96k", mp3], { encoding: "utf8", maxBuffer: 16 << 20 });
  if (r.status !== 0) throw new Error(`ffmpeg: ${(r.stderr || "").slice(0, 500)}`);
  log(`mezcla OK  ${Math.round(duracionDe(mp3))} s, ${(fs.statSync(mp3).size / 1e6).toFixed(1)} MB`);
  return marcas;
}

/* ---------- 6. episodio, subida y feed ---------- */
function construir(dir, { id, slug, formato, guion, turnos, marcas, voces, fecha }) {
  const mp3 = path.join(dir, "episodio.mp3");
  const pieza = {
    id, slug, titulo: guion.titulo, tipo: "Automático", formato: formato === "al-dia" ? "edicion_hablada" : "conversacion",
    duracion: Math.round(duracionDe(mp3)), audio: { url: `${MEDIA}/podcast/${slug}.mp3`, bytes: fs.statSync(mp3).size, mime: "audio/mpeg" },
    publicado: new Date(`${fecha}T${new Date().toTimeString().slice(0, 8)}`).toISOString(),
    descripcion: guion.descripcion, voces_sinteticas: true,
    participantes: Object.values(voces).map((v) => ({ nombre: v.etiqueta, rol: "voz sintética" })),
    capitulos: guion.bloques.map((b, i) => ({
      titulo: b.titulo, inicio: Math.round(marcas[turnos.findIndex((t) => t.bloque === i + 1)] * 10) / 10,
      ...(b.noticia.length === 1 ? { noticia: b.noticia[0] } : {}),
    })),
    transcripcion: true,
  };
  const transcripcion = { segmentos: turnos.map((t, i) => ({ hablante: t.hablante, texto: t.texto, inicio: Math.round(marcas[i] * 10) / 10 })) };
  return { pieza, transcripcion };
}

// Sube el MP3 y comprueba que se sirve. Sin destino configurado, el episodio queda «listo».
function subir(dir, slug) {
  if (BUCKET) return subirR2(dir, slug);
  if (!DESTINO) return false;
  const ssh = `ssh -i ${CLAVE} -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=20`;
  const r = spawnSync("rsync", ["-t", "--chmod=F644", "-e", ssh, path.join(dir, "episodio.mp3"), `${DESTINO}${slug}.mp3`], { encoding: "utf8", timeout: 10 * 60000 });
  if (r.status !== 0) throw new Error(`subida por rsync: ${(r.stderr || "").slice(-400)}`);
  const c = spawnSync("curl", ["-sI", "-o", "/dev/null", "-w", "%{http_code}", `${MEDIA}/podcast/${slug}.mp3`], { encoding: "utf8" });
  if (c.stdout !== "200") throw new Error(`subido, pero ${MEDIA}/podcast/${slug}.mp3 responde ${c.stdout}`);
  log(`subido: ${MEDIA}/podcast/${slug}.mp3`);
  return true;
}

function subirR2(dir, slug) {
  const r = spawnSync("npx", ["--no-install", "wrangler", "r2", "object", "put", `${BUCKET}/podcast/${slug}.mp3`,
    "--file", path.join(dir, "episodio.mp3"), "--content-type", "audio/mpeg", "--remote"], { cwd: REPO, encoding: "utf8" });
  if (r.status !== 0) throw new Error(`subida a R2: ${(r.stderr || r.stdout || "").slice(-400)}`);
  return true;
}

function validarFeed(feed) {
  const Ajv = createRequire(import.meta.url)("ajv");
  const v = new Ajv({ allErrors: true, format: "full" }).compile(leerJson(path.join(REPO, "public/data/feed/podcast.schema.json")));
  if (!v(feed)) throw new Error(`el feed de podcast no valida: ${v.errors.map((e) => `${e.dataPath} ${e.message}`).join("; ")}`);
}

async function exportar(destino, extra = null) {
  const pub = (await db.episodios("publicado")).filter((e) => !extra || e.id !== extra.pieza.id);
  const lista = extra ? [extra, ...pub] : pub;
  const feed = { version: "1", actualizado: new Date().toISOString(), items: lista.map((e) => e.pieza) };
  validarFeed(feed);
  escribir(path.join(destino, "data/feed/podcast.json"), feed);
  for (const e of lista) escribir(path.join(destino, `data/feed/podcast/${e.slug}.transcripcion.json`), e.transcripcion);
  log(`podcast: ${lista.length} episodios -> ${destino}`);
}

/* ---------- principal ---------- */
async function main() {
  if (flag("--solo-exportar")) return exportar(valor("--destino") || path.join(REPO, "public"));

  const aprobar = valor("--aprobar");
  if (aprobar) {
    const e = (await db.episodios()).find((x) => x.id === aprobar || x.slug === aprobar);
    if (!e) throw new Error(`no existe el episodio ${aprobar}`);
    if (e.estado !== "revision" && e.estado !== "listo") throw new Error(`el episodio está en «${e.estado}», no en revisión`);
    const subido = subir(path.join(EPISODIOS, e.id), e.slug);
    await db.guardarEpisodio({ ...e, estado: subido ? "publicado" : "listo", ...(subido ? { publicado: new Date().toISOString() } : {}) });
    log(subido ? `publicado ${e.id}: redespliega con ops/publicar.sh` : `aprobado ${e.id}: queda «listo» (sin destino de subida configurado)`);
    return;
  }

  const formato = valor("--formato") || "al-dia";
  if (!MINUTOS[formato]) throw new Error(`formato desconocido: ${formato}`);
  const ensayo = flag("--ensayo");
  const fecha = hoy();
  const id = valor("--reusar") || `p-${formato}-${fecha}`;
  const slug = id.replace(/^p-/, formato === "al-dia" ? "yamacoa-" : "");
  const dir = path.join(EPISODIOS, id);
  fs.mkdirSync(dir, { recursive: true });
  log(`episodio ${id} · ${formato} · bd ${db.tipo}${ensayo ? " · ENSAYO" : ""}`);

  const conf = leerJson(path.join(AQUI, "voces.json"));
  const vocesListas = conf.definitivas && Object.values(conf.voces).every((v) => v.referencia && v.origen &&
    fs.existsSync(enCasa(v.referencia)));
  if (!vocesListas && !ensayo) { log("voces no definitivas (voces.json): no se genera el episodio; para probar, --ensayo"); return; }
  if (!vocesListas) log("voces: no definitivas (voces.json), las diseñadas solo valen para ensayo");

  if (!fs.existsSync(path.join(dir, "noticias.json"))) {
    const noticias = await reunir(formato);
    if (noticias.length < 2) throw new Error(`solo ${noticias.length} noticias vigentes: no hay episodio`);
    escribir(path.join(dir, "noticias.json"), noticias.map(({ _texto, ...n }) => n));
    escribir(path.join(dir, "noticias.privado.json"), noticias);
    escribir(path.join(dir, "episodio.json"), { formato, fecha, duracion_objetivo_min: MINUTOS[formato],
      voces: Object.fromEntries(Object.entries(conf.voces).map(([k, v]) => [k, v.etiqueta])) });
    if (formato === "conversacion") {
      const ser = cargarSeries({ catalogo: path.join(REPO, "ops/noticias/series.json"), datos: path.join(REPO, "public/data"), puntos: await db.puntosSeries() });
      escribir(path.join(dir, "series.json"), paraMotor(ser));
    }
  }
  if (!fs.existsSync(path.join(dir, "guion.json"))) escribirGuion(dir);
  const guion = verja(leerJson(path.join(dir, "guion.json")), leerJson(path.join(dir, "noticias.privado.json")), formato);
  escribir(path.join(dir, "guion.verjado.json"), guion);
  if (flag("--sin-voz")) { log("--sin-voz: guion en guion.verjado.json"); return; }

  const turnos = turnosDe(guion, formato, fecha, conf.voces);
  escribir(path.join(dir, "turnos.json"), turnos);
  sintetizar(dir, turnos, conf);
  const marcas = mezclar(dir, turnos);
  const { pieza, transcripcion } = construir(dir, { id, slug, formato, guion, turnos, marcas, voces: conf.voces, fecha });

  if (ensayo) {
    // Vista previa local: el MP3 en public/audio/podcast (ignorado por git) y el feed en public/.
    const local = path.join(REPO, "public/audio/podcast", `${slug}.mp3`);
    fs.mkdirSync(path.dirname(local), { recursive: true });
    fs.copyFileSync(path.join(dir, "episodio.mp3"), local);
    await exportar(path.join(REPO, "public"), { id, slug, pieza: { ...pieza, audio: { ...pieza.audio, url: `http://localhost:3123/audio/podcast/${slug}.mp3` } }, transcripcion });
    log(`ensayo listo: http://localhost:3123/podcast/${slug}`);
    return;
  }
  let estado = !vocesListas ? "ensayo" : formato === "conversacion" ? "revision" : "listo";
  if (estado === "listo" && subir(dir, slug)) estado = "publicado";
  await db.guardarEpisodio({ id, slug, formato, estado, titulo: guion.titulo, pieza, guion, transcripcion,
    ...(estado === "publicado" ? { publicado: pieza.publicado } : {}) });
  log(`estado: ${estado}${estado === "listo" ? " (sin destino de subida)" : estado === "revision" ? ` (aprobar: --aprobar ${id})` : ""}`);
  if (estado === "publicado" && flag("--desplegar")) {
    const r = spawnSync("bash", [path.join(REPO, "ops/publicar.sh"), "--motivo", `podcast ${id}`], { stdio: "inherit" });
    if (r.status !== 0) throw new Error(`publicar.sh terminó con ${r.status}`);
  }
}

main().catch((e) => { log(`ERROR ${e.stack || e.message}`); process.exitCode = 1; });
