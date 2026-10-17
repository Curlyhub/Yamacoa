// Capa de datos del ciclo de noticias. Dos implementaciones con la misma interfaz:
//  - Supabase (producción): SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY en el entorno.
//  - Local (desarrollo / ensayo): ops/noticias/estado/db.json. Se usa si falta la clave.
// La caducidad la decide la base de datos (caduca = publicado + 3 d), nunca el build.

import fs from "node:fs";
import path from "node:path";

const DIA = 86400000;
export const VIDA_MS = 3 * DIA; // = yamacoa_caduca() en la BD

export function abrir({ estadoDir }) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? supabase(url.replace(/\/+$/, "").replace(/\/rest\/v1$/, ""), key) : local(path.join(estadoDir, "db.json"));
}

/* ---------- Supabase (PostgREST) ---------- */
function supabase(base, key) {
  async function q(ruta, { method = "GET", body, prefer } = {}) {
    const r = await fetch(`${base}/rest/v1/${ruta}`, {
      method,
      headers: {
        // Clave nueva (sb_secret_…): solo en apikey. Clave heredada service_role (JWT eyJ…): también como Bearer.
        apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}), "Content-Type": "application/json",
        ...(prefer ? { Prefer: prefer } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) throw new Error(`supabase ${method} ${ruta.split("?")[0]}: ${r.status} ${await r.text()}`);
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  }
  const iso = () => new Date().toISOString();
  return {
    tipo: "supabase",
    iniciarCiclo: (id) => q("noticias_ciclos", { method: "POST", body: { id }, prefer: "resolution=merge-duplicates" }),
    cerrarCiclo: (id, campos) => q(`noticias_ciclos?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: { fin: iso(), ...campos } }),
    async capturasVistas(hashes) {
      const vistos = new Set();
      for (let i = 0; i < hashes.length; i += 150) {
        const lote = hashes.slice(i, i + 150);
        const filas = await q(`noticias_capturas?select=hash&hash=in.(${lote.join(",")})`);
        filas.forEach((f) => vistos.add(f.hash));
      }
      return vistos;
    },
    registrarCapturas: (filas) => filas.length
      ? q("noticias_capturas", { method: "POST", body: filas, prefer: "resolution=ignore-duplicates" }) : null,
    async caducar() {
      const ahora = iso();
      const filas = await q(`noticias?or=(caduca.lte.${ahora},estado.eq.retirada)&select=id`, { method: "DELETE", prefer: "return=representation" });
      return filas.map((f) => f.id);
    },
    vigentes: () => q(`noticias?estado=eq.publicada&caduca=gt.${iso()}&order=publicado.desc`),
    retenidas: () => q("noticias?estado=eq.retenida&order=publicado.asc"),
    async slugs() { return new Set((await q("noticias?select=slug")).map((f) => f.slug)); },
    insertar: (fila) => q("noticias", { method: "POST", body: fila }),
    actualizar: (id, campos) => q(`noticias?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: campos }),
  };
}

/* ---------- Local (fichero JSON) ---------- */
function local(fichero) {
  const leer = () => {
    try { return JSON.parse(fs.readFileSync(fichero, "utf8")); }
    catch { return { noticias: [], capturas: {}, ciclos: [] }; }
  };
  const guardar = (db) => {
    fs.mkdirSync(path.dirname(fichero), { recursive: true });
    fs.writeFileSync(fichero + ".tmp", JSON.stringify(db, null, 1));
    fs.renameSync(fichero + ".tmp", fichero);
  };
  const conCaduca = (n) => ({ ...n, caduca: new Date(Date.parse(n.publicado) + VIDA_MS).toISOString() });
  return {
    tipo: "local",
    async iniciarCiclo(id) { const db = leer(); db.ciclos.push({ id, inicio: new Date().toISOString() }); guardar(db); },
    async cerrarCiclo(id, campos) {
      const db = leer(); const c = db.ciclos.find((x) => x.id === id);
      if (c) Object.assign(c, { fin: new Date().toISOString(), ...campos });
      guardar(db);
    },
    async capturasVistas(hashes) { const db = leer(); return new Set(hashes.filter((h) => db.capturas[h])); },
    async registrarCapturas(filas) {
      const db = leer(); const limite = Date.now() - 10 * DIA;
      for (const f of filas) db.capturas[f.hash] = { ...f, capturada: new Date().toISOString() };
      for (const [h, f] of Object.entries(db.capturas)) if (Date.parse(f.capturada) < limite) delete db.capturas[h];
      guardar(db);
    },
    async caducar() {
      const db = leer(); const ahora = Date.now(); const fuera = [];
      db.noticias = db.noticias.filter((n) => {
        const muere = Date.parse(conCaduca(n).caduca) <= ahora || n.estado === "retirada";
        if (muere) fuera.push(n.id);
        return !muere;
      });
      guardar(db); return fuera;
    },
    async vigentes() {
      const ahora = Date.now();
      return leer().noticias.map(conCaduca)
        .filter((n) => n.estado === "publicada" && Date.parse(n.caduca) > ahora)
        .sort((a, b) => Date.parse(b.publicado) - Date.parse(a.publicado));
    },
    async retenidas() { return leer().noticias.map(conCaduca).filter((n) => n.estado === "retenida"); },
    async slugs() { return new Set(leer().noticias.map((n) => n.slug)); },
    async insertar(fila) { const db = leer(); db.noticias.push(fila); guardar(db); },
    async actualizar(id, campos) {
      const db = leer(); const n = db.noticias.find((x) => x.id === id);
      if (n) Object.assign(n, campos);
      guardar(db);
    },
  };
}
