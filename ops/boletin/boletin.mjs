#!/usr/bin/env node
// Boletín de los domingos (2026-10-18): lo esencial de la semana para los lectores que lo pidieron.
//
//   node ops/boletin/boletin.mjs --vista             escribe ops/boletin/vista.html (no envía nada)
//   node ops/boletin/boletin.mjs --prueba <correo>   lo envía solo a esa dirección
//   node ops/boletin/boletin.mjs --enviar            lo envía a todos los suscriptores con boletín
//
// El contenido sale de los feeds PÚBLICOS de yamacoa.com (ya publicados y sin lo retirado): la
// conversación y los podcasts de la semana, la opinión, los estudios y las noticias vigentes más
// relevantes. El boletín no escribe nada nuevo: enlaza lo publicado. Los destinatarios salen de
// `suscriptores` (boletin = true); cada correo lleva su enlace de baja con un clic
// (functions/api/boletin/baja.js) y la cabecera List-Unsubscribe. Envío por Resend.
// Entorno: noticias.env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) y boletin.env (RESEND_API_KEY).
// Una semana ISO se envía una sola vez (tabla boletin_envios).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SITIO = "https://yamacoa.com";
const REMITENTE = "Yamacoa <boletin@yamacoa.com>";
const RESPONDER = "bohiocubano@gmail.com";
const DIAS = 7;
const MAX_NOTICIAS = 6;

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const valor = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
const log = (m) => console.log(`${new Date().toTimeString().slice(0, 8)} boletín: ${m}`);

/* ---------- contenido ---------- */
async function feed(nombre) {
  const r = await fetch(`${SITIO}/data/feed/${nombre}.json`, { headers: { "cache-control": "no-cache" } });
  if (!r.ok) throw new Error(`feed ${nombre}: ${r.status}`);
  return (await r.json()).items || [];
}

const desde = Date.now() - DIAS * 864e5;
const reciente = (x) => new Date(x.publicado).getTime() >= desde;

async function contenido() {
  const [podcast, opinion, estudios, noticias] = await Promise.all(["podcast", "opinion", "estudios", "noticias"].map(feed));
  // Primero la conversación, luego lo grabado y después lo automático, del más reciente al más antiguo.
  const rango = (p) => (p.formato === "conversacion" ? 0 : p.tipo === "Elaborado" ? 1 : 2);
  const pods = podcast.filter(reciente).sort((a, b) => rango(a) - rango(b) || b.publicado.localeCompare(a.publicado));
  // De las ediciones diarias «al día» solo la más reciente: el resto queda en la web.
  const vistas = new Set();
  const episodios = pods.filter((p) => p.formato !== "edicion_hablada" || (!vistas.has("al-dia") && vistas.add("al-dia")));
  return {
    episodios,
    opinion: opinion.filter(reciente),
    estudios: estudios.filter(reciente),
    noticias: noticias.filter((n) => !n.caduca || new Date(n.caduca) > new Date())
      .sort((a, b) => (b.relevancia || 0) - (a.relevancia || 0)).slice(0, MAX_NOTICIAS),
  };
}

/* ---------- correo ---------- */
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const CONFIANZA = { corroborada: "Corroborada", no_confirmada: "No confirmada", en_desarrollo: "En desarrollo" }; // como en piezas.jsx
const corto = (t, n = 220) => { t = String(t || ""); return t.length <= n ? t : `${t.slice(0, t.lastIndexOf(" ", n))}…`; };
const minutos = (s) => `${Math.max(1, Math.round(s / 60))} min`;
const hoyLargo = () => new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

function semanaISO(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dia = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dia);
  const ini = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-W${String(Math.ceil(((t - ini) / 864e5 + 1) / 7)).padStart(2, "0")}`;
}

const C = { fondo: "#efe8df", tarjeta: "#fcf9f4", tinta: "#1f1a16", tinta2: "#4a3f36", suave: "#6b5d50", tenue: "#8a7a68",
  acento: "#b8562e", oscuro: "#3a2418", regla: "#e4d9cc", salvia: "#dfe9e1", salviaT: "#3f6b55", pod: "#3a2418", podAcc: "#f2c9b0" };
const FUENTE = "Manrope,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "'IBM Plex Mono',Menlo,Consolas,monospace";

const seccion = (titulo) => `<tr><td style="padding:26px 0 10px;font:600 11px ${MONO};letter-spacing:.12em;text-transform:uppercase;color:${C.acento};">${esc(titulo)}</td></tr>`;
const pieza = ({ url, antetitulo, titulo, texto, extra = "" }) => `<tr><td style="padding:0 0 12px;">
  <a href="${url}" style="display:block;text-decoration:none;background:${C.tarjeta};border-radius:16px;padding:18px 20px;color:${C.tinta};">
    ${antetitulo ? `<div style="font:500 11px ${MONO};letter-spacing:.06em;text-transform:uppercase;color:${C.tenue};margin-bottom:6px;">${esc(antetitulo)}</div>` : ""}
    <div style="font:800 18px/1.25 ${FUENTE};letter-spacing:-.01em;color:${C.tinta};">${esc(titulo)}</div>
    ${texto ? `<div style="font:400 15px/1.55 ${FUENTE};color:${C.tinta2};margin-top:6px;">${esc(texto)}</div>` : ""}${extra}
  </a></td></tr>`;

function html(c, bajaUrl) {
  const filas = [];
  const conv = c.episodios.find((e) => e.formato === "conversacion");
  if (conv) {
    const caps = (conv.capitulos || []).map((x) => `<li style="margin:0 0 4px;">${esc(x.titulo)}</li>`).join("");
    filas.push(`<tr><td style="padding:8px 0 12px;"><a href="${SITIO}/podcast/${conv.slug}" style="display:block;text-decoration:none;background:${C.pod};border-radius:20px;padding:24px 22px;color:#fcf9f4;">
      <div style="font:600 11px ${MONO};letter-spacing:.12em;text-transform:uppercase;color:${C.podAcc};">La conversación de la semana · ${minutos(conv.duracion)}</div>
      <div style="font:800 22px/1.2 ${FUENTE};letter-spacing:-.02em;margin:10px 0 8px;color:#fcf9f4;">${esc(conv.titulo)}</div>
      ${caps ? `<ul style="margin:0 0 16px;padding-left:18px;font:400 14.5px/1.5 ${FUENTE};color:#e8dccf;">${caps}</ul>` : ""}
      <span style="display:inline-block;background:${C.podAcc};color:${C.pod};font:700 14px ${FUENTE};padding:11px 20px;border-radius:999px;">Escuchar</span>
    </a></td></tr>`);
  }
  const otros = c.episodios.filter((e) => e !== conv);
  if (otros.length) {
    filas.push(seccion("Podcast"));
    for (const e of otros) filas.push(pieza({ url: `${SITIO}/podcast/${e.slug}`,
      antetitulo: `${e.tipo === "Elaborado" ? "Grabado" : e.formato === "edicion_hablada" ? "Yamacoa al día" : "Episodio"} · ${minutos(e.duracion)}`,
      titulo: e.titulo, texto: corto(e.descripcion) }));
  }
  if (c.opinion.length) {
    filas.push(seccion("Opinión"));
    for (const o of c.opinion) filas.push(pieza({ url: `${SITIO}/opinion/${o.slug}`, antetitulo: o.firma, titulo: o.titulo, texto: o.presentacion }));
  }
  if (c.estudios.length) {
    filas.push(seccion("Estudios"));
    for (const e of c.estudios) filas.push(pieza({ url: `${SITIO}/estudios/${e.slug}`, antetitulo: "Estudio automático", titulo: e.titulo, texto: corto(e.entradilla || e.resumen) }));
  }
  if (c.noticias.length) {
    filas.push(seccion("Noticias"));
    for (const n of c.noticias) {
      const fuentes = [...new Set((n.fuentes || []).map((f) => f.nombre).filter(Boolean))].slice(0, 3).join(", ");
      filas.push(pieza({ url: `${SITIO}/noticias/${n.slug}`, antetitulo: [n.seccion, CONFIANZA[n.confianza] || n.confianza].filter(Boolean).join(" · "),
        titulo: n.titulo, texto: n.entradilla,
        extra: fuentes ? `<div style="font:400 12.5px ${FUENTE};color:${C.tenue};margin-top:8px;">Fuentes: ${esc(fuentes)}</div>` : "" }));
    }
  }
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Yamacoa · la semana</title></head>
<body style="margin:0;padding:0;background:${C.fondo};">
<div style="display:none;max-height:0;overflow:hidden;">${esc(conv ? conv.titulo : c.noticias[0]?.titulo || "Lo esencial de la semana sobre Cuba")}</div>
<div style="padding:28px 14px;background:${C.fondo};font-family:${FUENTE};color:${C.tinta};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;">
  <tr><td style="padding:0 4px 4px;font:800 24px ${FUENTE};letter-spacing:-.02em;color:${C.tinta};">Yamacoa</td></tr>
  <tr><td style="padding:0 4px 18px;font:500 11px ${MONO};letter-spacing:.1em;text-transform:uppercase;color:${C.suave};">La semana · ${hoyLargo()}</td></tr>
  <tr><td style="padding:0 4px 8px;font:400 16px/1.55 ${FUENTE};color:${C.tinta2};">Lo esencial de estos siete días sobre Cuba, con datos y con sus fuentes. Todo está abierto en la web.</td></tr>
  ${filas.join("\n")}
  <tr><td style="padding:22px 4px 0;border-top:1px solid ${C.regla};font:400 12.5px/1.6 ${FUENTE};color:${C.suave};">
    Recibes este correo porque lo pediste en tu cuenta de Yamacoa. Llega una vez a la semana.<br>
    <a href="${bajaUrl}" style="color:${C.suave};">Dejar de recibirlo</a> · <a href="${SITIO}/suscribete" style="color:${C.suave};">Mi cuenta</a> · <a href="${SITIO}/privacidad" style="color:${C.suave};">Privacidad</a><br>
    Las voces de los podcasts automáticos son sintéticas. Las ilustraciones de las noticias, cuando las hay, están generadas por IA.
  </td></tr>
</table></div></body></html>`;
}

function texto(c, bajaUrl) {
  const l = [`YAMACOA · LA SEMANA · ${hoyLargo()}`, "", "Lo esencial de estos siete días sobre Cuba, con datos y con sus fuentes.", ""];
  const bloque = (t, xs) => { if (!xs.length) return; l.push(t.toUpperCase()); xs.forEach(([tit, url]) => l.push(`- ${tit}\n  ${url}`)); l.push(""); };
  bloque("Podcast", c.episodios.map((e) => [e.titulo, `${SITIO}/podcast/${e.slug}`]));
  bloque("Opinión", c.opinion.map((o) => [`${o.titulo} (${o.firma})`, `${SITIO}/opinion/${o.slug}`]));
  bloque("Estudios", c.estudios.map((e) => [e.titulo, `${SITIO}/estudios/${e.slug}`]));
  bloque("Noticias", c.noticias.map((n) => [n.titulo, `${SITIO}/noticias/${n.slug}`]));
  l.push("Recibes este correo porque lo pediste en tu cuenta de Yamacoa.", `Dejar de recibirlo: ${bajaUrl}`);
  return l.join("\n");
}

function asunto(c) {
  const conv = c.episodios.find((e) => e.formato === "conversacion");
  return `Yamacoa, la semana: ${(conv || c.noticias[0] || { titulo: "lo esencial sobre Cuba" }).titulo}`.slice(0, 140);
}

/* ---------- envío ---------- */
function entorno(fichero) {
  const f = path.join(process.env.HOME || "/home/<usuario>", ".config/yamacoa", fichero);
  if (!fs.existsSync(f)) return;
  for (const linea of fs.readFileSync(f, "utf8").split("\n")) {
    const m = linea.match(/^\s*(?:export\s+)?([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

async function supa(ruta, opciones = {}) {
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${ruta}`, {
    ...opciones, headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json", ...(opciones.headers || {}) },
  });
  if (!r.ok) throw new Error(`supabase ${ruta}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.status === 204 ? null : r.json();
}

async function resend(lote) {
  const r = await fetch("https://api.resend.com/emails/batch", {
    method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(lote),
  });
  if (!r.ok) throw new Error(`resend: ${r.status} ${(await r.text()).slice(0, 300)}`);
}

const correo = (c, para, token) => {
  const baja = token ? `${SITIO}/api/boletin/baja?t=${token}` : `${SITIO}/suscribete`;
  return { from: REMITENTE, to: [para], reply_to: RESPONDER, subject: asunto(c), html: html(c, baja), text: texto(c, baja),
    headers: token ? { "List-Unsubscribe": `<${baja}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : {} };
};

async function main() {
  const c = await contenido();
  const total = c.episodios.length + c.opinion.length + c.estudios.length + c.noticias.length;
  log(`${c.episodios.length} episodios, ${c.opinion.length} de opinión, ${c.estudios.length} estudios, ${c.noticias.length} noticias`);
  if (flag("--vista")) {
    const f = path.join(AQUI, "vista.html");
    fs.writeFileSync(f, html(c, `${SITIO}/api/boletin/baja?t=00000000-0000-0000-0000-000000000000`));
    log(`vista: ${f} · asunto: ${asunto(c)}`);
    return;
  }
  if (!total) { log("semana sin contenido: no se envía"); return; }
  entorno("noticias.env"); entorno("boletin.env");
  if (!process.env.RESEND_API_KEY) throw new Error("falta RESEND_API_KEY en ~/.config/yamacoa/boletin.env");
  const prueba = valor("--prueba");
  if (prueba) {
    const [fila] = await supa(`suscriptores?select=boletin_token&email=eq.${encodeURIComponent(prueba)}`);
    await resend([correo(c, prueba, fila?.boletin_token)]);
    log(`prueba enviada a ${prueba}`);
    return;
  }
  if (!flag("--enviar")) { console.log("Uso: boletin.mjs --vista | --prueba <correo> | --enviar"); return; }
  if (!process.env.SUPABASE_URL) throw new Error("falta SUPABASE_URL (noticias.env)");
  const semana = semanaISO();
  if ((await supa(`boletin_envios?select=semana&semana=eq.${semana}`)).length) { log(`la semana ${semana} ya se envió`); return; }
  const lectores = await supa("suscriptores?select=email,boletin_token&boletin=eq.true&estado=eq.activo");
  if (!lectores.length) { log("nadie tiene el boletín activado"); return; }
  for (let i = 0; i < lectores.length; i += 100) {
    await resend(lectores.slice(i, i + 100).map((x) => correo(c, x.email, x.boletin_token)));
  }
  await supa("boletin_envios", { method: "POST", headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ semana, asunto: asunto(c), enviados: lectores.length }) });
  log(`semana ${semana}: enviado a ${lectores.length} lectores`);
}

main().catch((e) => { log(`ERROR ${e.message}`); process.exit(1); });
