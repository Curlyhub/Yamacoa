#!/usr/bin/env node
// Episodios «Elaborados» (grabados en el estudio): las partes mecánicas de /podcast-publicar.
//
//   node ops/podcast/elaborado.mjs --borrador <uuid>   exige estado «procesada» y el consentimiento
//        de TODAS las voces; baja transcripcion.json, escucha.mp3 y limpio.flac del servidor a
//        ops/podcast/borradores/<uuid>/ (fuera de git). El borrador editorial lo hace el agente.
//   node ops/podcast/elaborado.mjs --publicar <uuid>   SOLO tras la aprobación humana: codifica el
//        MP3 desde limpio.flac (o recortado.flac si hubo cortes), lo sube a tts.yamacoa.com/podcast,
//        registra el episodio en podcast_episodios, marca la grabación «publicada» y despliega.
//
// En borradores/<uuid>/ el borrador aprobado es episodio.json (titulo, slug, descripcion, formato
// conversacion|directo, participantes, capitulos) y la transcripción con hablantes asignados,
// transcripcion.final.json (si no existe, se usa transcripcion.json).

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(AQUI, "../..");
const BORRADORES = path.join(AQUI, "borradores");
const HOME = process.env.HOME;
const MEDIA = (process.env.YAMACOA_MEDIA || "https://tts.yamacoa.com").replace(/\/+$/, "");
const SSH = (clave) => `ssh -i ${HOME}/.ssh/${clave} -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=20`;
const SERVIDOR = "<usuario>@<servidor>:";
const args = process.argv.slice(2);
const valor = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const leerJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const ejecutar = (cmd, a, opc = {}) => {
  const r = spawnSync(cmd, a, { encoding: "utf8", maxBuffer: 64 << 20, ...opc });
  if (r.status !== 0) throw new Error(`${cmd}: ${(r.stderr || r.stdout || "").slice(-400)}`);
  return r.stdout;
};

function bd() {
  const base = (process.env.SUPABASE_URL || "").replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error("faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (noticias.env)");
  return async (ruta, { method = "GET", body, prefer } = {}) => {
    const r = await fetch(`${base}/rest/v1/${ruta}`, { method, body: body ? JSON.stringify(body) : undefined,
      headers: { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}), "Content-Type": "application/json",
        ...(prefer ? { Prefer: prefer } : {}) } });
    if (!r.ok) throw new Error(`supabase ${method} ${ruta.split("?")[0]}: ${r.status} ${(await r.text()).slice(0, 300)}`);
    const t = await r.text(); return t ? JSON.parse(t) : null;
  };
}

async function grabacion(q, id) {
  const [g] = await q(`grabaciones?id=eq.${encodeURIComponent(id)}&select=*`);
  if (!g) throw new Error(`no existe la grabación ${id}`);
  if (!(g.participantes || []).length || g.participantes.some((p) => p.consiente !== true)) {
    throw new Error("falta el consentimiento de alguna voz: no se publica");
  }
  return g;
}

async function borrador(q, id) {
  const g = await grabacion(q, id);
  if (g.estado !== "procesada") throw new Error(`la grabación está en «${g.estado}», no «procesada»`);
  const dir = path.join(BORRADORES, id);
  fs.mkdirSync(dir, { recursive: true });
  for (const f of ["transcripcion.json", "escucha.mp3", "limpio.flac"]) {
    ejecutar("rsync", ["-t", "-e", SSH("yamacoa_grabaciones"), `${SERVIDOR}${id}/${f}`, path.join(dir, f)]);
  }
  fs.writeFileSync(path.join(dir, "grabacion.json"), JSON.stringify(g, null, 2));
  console.log(`borrador: ${dir}\n  ${g.titulo} · ${g.duracion_seg} s · voces: ${g.participantes.map((p) => `${p.nombre} (${p.rol})`).join(", ")}`
    + `\n  marcas: ${JSON.stringify(g.marcas || [])}`);
}

async function publicar(q, id) {
  const g = await grabacion(q, id);
  if (g.estado !== "procesada") throw new Error(`la grabación está en «${g.estado}», no «procesada»`);
  const dir = path.join(BORRADORES, id);
  const ep = leerJson(path.join(dir, "episodio.json"));
  if (!/^[a-z0-9-]{4,90}$/.test(ep.slug || "")) throw new Error("episodio.json: slug no válido");
  const fuente = ["recortado.flac", "limpio.flac"].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));
  const mp3 = path.join(dir, `${ep.slug}.mp3`);
  ejecutar("ffmpeg", ["-y", "-loglevel", "error", "-i", fuente, "-ac", "1", "-c:a", "libmp3lame", "-b:a", "96k",
    "-metadata", `title=${ep.titulo}`, "-metadata", "artist=Yamacoa", mp3]);
  const duracion = Math.round(Number(ejecutar("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3])));
  const trans = leerJson([path.join(dir, "transcripcion.final.json"), path.join(dir, "transcripcion.json")].find((f) => fs.existsSync(f)));
  const pieza = {
    id: `p-${ep.slug}`, slug: ep.slug, titulo: ep.titulo, tipo: "Elaborado", formato: ep.formato || "conversacion",
    duracion, audio: { url: `${MEDIA}/podcast/${ep.slug}.mp3`, bytes: fs.statSync(mp3).size, mime: "audio/mpeg" },
    publicado: new Date().toISOString(), descripcion: ep.descripcion, voces_sinteticas: false,
    participantes: ep.participantes || g.participantes.map((p) => ({ nombre: p.nombre, rol: p.rol })),
    ...(ep.capitulos?.length ? { capitulos: ep.capitulos } : {}), transcripcion: true, grabacion_id: g.id,
  };
  const Ajv = createRequire(import.meta.url)("ajv");
  const v = new Ajv({ allErrors: true, format: "full" }).compile(leerJson(path.join(REPO, "public/data/feed/podcast.schema.json")));
  if (!v({ version: "x", actualizado: new Date().toISOString(), items: [pieza] })) {
    throw new Error(`el episodio no valida: ${v.errors.map((e) => `${e.dataPath} ${e.message}`).join("; ")}`);
  }
  // Subida (la clave del ciclo solo puede escribir .mp3 en la carpeta pública de podcasts).
  ejecutar("rsync", ["-t", "--chmod=F644", "-e", SSH("yamacoa_media"), mp3, `${SERVIDOR}${ep.slug}.mp3`]);
  const c = ejecutar("curl", ["-sI", "-o", "/dev/null", "-w", "%{http_code}", pieza.audio.url]);
  if (c !== "200") throw new Error(`subido, pero ${pieza.audio.url} responde ${c}`);
  await q("podcast_episodios?on_conflict=id", { method: "POST", prefer: "resolution=merge-duplicates", body: {
    id: pieza.id, slug: ep.slug, formato: "elaborado", estado: "publicado", titulo: ep.titulo, pieza,
    guion: {}, transcripcion: { segmentos: trans.segmentos.map((s) => ({ hablante: s.hablante || null, texto: s.texto, inicio: s.inicio })) },
    publicado: pieza.publicado } });
  await q(`grabaciones?id=eq.${g.id}`, { method: "PATCH", body: { estado: "publicada", episodio_slug: ep.slug, actualizado: new Date().toISOString() } });
  console.log(`publicado ${pieza.audio.url} (${duracion} s); desplegando…`);
  const r = spawnSync("bash", [path.join(REPO, "ops/publicar.sh"), "--motivo", `podcast ${ep.slug}`], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`publicar.sh terminó con ${r.status}`);
}

const q = bd();
const id = valor("--borrador") || valor("--publicar");
if (!id) { console.error("uso: elaborado.mjs --borrador <uuid> | --publicar <uuid>"); process.exit(2); }
(valor("--borrador") ? borrador(q, id) : publicar(q, id)).catch((e) => { console.error(`ERROR ${e.message}`); process.exitCode = 1; });
