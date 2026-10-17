// Worker "yamacoa-media": recibe los trozos de audio del estudio de grabación y
// los guarda en el bucket R2 PRIVADO de grabaciones.
//
//   PUT /grabacion/<uuid>/<n>     cuerpo = trozo de audio (MediaRecorder timeslice)
//   GET /salud
//
// Autorización: el JWT de Supabase del usuario. En vez de verificar la firma aquí,
// se consulta la fila de la grabación con ese JWT bajo RLS: si Supabase devuelve
// la fila, el token es válido, la grabación es de quien sube y vemos su estado.
// Solo se aceptan trozos mientras estado = 'grabando'.
//
// Los trozos son idempotentes: re-subir el mismo <n> sobrescribe. El cliente
// guarda cada trozo en IndexedDB antes de subirlo y reintenta hasta recibir 201.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const MAX_TROZO = 40 * 1024 * 1024;
const EXT = { "audio/webm": "webm", "audio/mp4": "m4a", "audio/ogg": "ogg" };
const permitidas = new Map(); // `${token}|${id}` -> caduca (ms), caché por isolate

function cors(env, req) {
  const origen = req.headers.get("Origin") || "";
  const lista = String(env.ORIGENES || "").split(",").map((s) => s.trim()).filter(Boolean);
  return {
    "Access-Control-Allow-Origin": lista.includes(origen) ? origen : lista[0] || "null",
    "Access-Control-Allow-Methods": "PUT, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(cuerpo, status, cabeceras) {
  return new Response(JSON.stringify(cuerpo), {
    status, headers: { "Content-Type": "application/json", ...cabeceras },
  });
}

async function grabacionAbierta(env, token, id) {
  const clave = `${token}|${id}`;
  const c = permitidas.get(clave);
  if (c && c > Date.now()) return true;
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/grabaciones?id=eq.${id}&select=estado`, {
    headers: { apikey: env.SUPABASE_ANON, Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return false;
  const filas = await r.json();
  const ok = Array.isArray(filas) && filas[0]?.estado === "grabando";
  if (ok) permitidas.set(clave, Date.now() + 60_000);
  return ok;
}

export default {
  async fetch(req, env) {
    const h = cors(env, req);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/salud") return json({ ok: true }, 200, h);

    const m = url.pathname.match(/^\/grabacion\/([^/]+)\/(\d{1,5})$/);
    if (req.method !== "PUT" || !m) return json({ error: "ruta" }, 404, h);
    const [, id, n] = m;
    if (!UUID.test(id)) return json({ error: "id" }, 400, h);

    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "auth" }, 401, h);

    const tipo = (req.headers.get("Content-Type") || "").split(";")[0].trim();
    const ext = EXT[tipo];
    if (!ext) return json({ error: "tipo" }, 415, h);
    const largo = Number(req.headers.get("Content-Length") || 0);
    if (largo > MAX_TROZO) return json({ error: "tamaño" }, 413, h);

    if (!(await grabacionAbierta(env, token, id))) return json({ error: "grabación cerrada o ajena" }, 403, h);

    const cuerpo = await req.arrayBuffer();
    if (!cuerpo.byteLength || cuerpo.byteLength > MAX_TROZO) return json({ error: "tamaño" }, 413, h);
    const clave = `grabaciones/${id}/trozos/${n.padStart(5, "0")}.${ext}`;
    await env.GRABACIONES.put(clave, cuerpo, { httpMetadata: { contentType: tipo } });
    return json({ ok: true, n: Number(n), bytes: cuerpo.byteLength }, 201, h);
  },
};
