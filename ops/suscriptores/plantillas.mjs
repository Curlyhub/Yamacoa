#!/usr/bin/env node
// Carga en Supabase Auth las plantillas de correo de Yamacoa (ops/suscriptores/correos/) con la
// Management API. Necesita un token personal de Supabase en ~/.config/yamacoa/supabase_pat.env
// (SUPABASE_PAT=...), fuera del repo. Uso: node ops/suscriptores/plantillas.mjs
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const REF = "qsajkrppuaikyzmuipru";
const DIR = join(dirname(fileURLToPath(import.meta.url)), "correos");
const env = readFileSync(join(homedir(), ".config/yamacoa/supabase_pat.env"), "utf8");
const PAT = (env.match(/^SUPABASE_PAT=(.+)$/m) || [])[1]?.trim();
if (!PAT) { console.error("Falta SUPABASE_PAT en ~/.config/yamacoa/supabase_pat.env"); process.exit(1); }

// fichero -> clave de Supabase (mailer_subjects_<k> / mailer_templates_<k>_content)
const PLANTILLAS = { confirmar: "confirmation", recuperar: "recovery", enlace: "magic_link", cambio_correo: "email_change" };

const cuerpo = {};
for (const [fichero, k] of Object.entries(PLANTILLAS)) {
  const html = readFileSync(join(DIR, `${fichero}.html`), "utf8");
  const asunto = html.match(/Asunto: (.+?) -->/)[1];
  cuerpo[`mailer_subjects_${k}`] = asunto;
  cuerpo[`mailer_templates_${k}_content`] = html.replace(/^<!--.*?-->\n/, "");
}

const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${PAT}`, "Content-Type": "application/json" },
  body: JSON.stringify(cuerpo),
});
if (!r.ok) { console.error(`Error ${r.status}: ${(await r.text()).slice(0, 300)}`); process.exit(1); }
const conf = await r.json();
for (const k of Object.values(PLANTILLAS)) console.log(`${k}: ${conf[`mailer_subjects_${k}`]}`);
