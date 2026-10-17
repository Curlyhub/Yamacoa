// Verja automática: el contrato (noticias.schema.json) más las reglas editoriales que
// un JSON Schema no puede expresar. Una pieza que no pasa NO se publica: va a descartes.

import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export function cargarValidador(schemaPath) {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  // ajv 6 (el de la raíz de node_modules): draft-07 y formatos date-time/uri incluidos.
  const Ajv = require("ajv");
  const validarFeed = new Ajv({ allErrors: true, format: "full" }).compile(schema);
  const errores = (v) => (v.errors || []).map((e) => `${e.dataPath || ""} ${e.message}`).join("; ");
  return {
    feed(feed) { return validarFeed(feed) ? null : errores(validarFeed); },
    pieza(n) {
      const ok = validarFeed({ version: "x", actualizado: new Date().toISOString(), items: [n] });
      return ok ? null : errores(validarFeed);
    },
  };
}

// Reglas editoriales de CLAUDE.md §11.4 y del agente redactor-noticias.
export function reglas(n) {
  const fallos = [];
  const nf = n.fuentes.length;
  const fuera = (citas) => (citas || []).some((c) => c < 1 || c > nf);
  n.cuerpo.forEach((p, i) => { if (fuera(p.citas)) fallos.push(`párrafo ${i + 1} cita una fuente inexistente`); });
  if (n.cifra && fuera(n.cifra.citas)) fallos.push("la cifra cita una fuente inexistente");
  (n.versiones || []).forEach((v, i) => { if (fuera(v.citas)) fallos.push(`versión ${i + 1} cita una fuente inexistente`); });

  const origenes = new Set(n.fuentes.map((f) => f.origen || f.nombre));
  const hayPrimaria = n.fuentes.some((f) => f.tipo === "primaria");
  if (n.confianza === "corroborada" && origenes.size < 2 && !hayPrimaria) {
    fallos.push("«corroborada» exige dos orígenes independientes o una fuente primaria");
  }
  if (n.plantilla === "contraste") {
    const lados = new Set((n.versiones || []).map((v) => v.lado));
    if (!lados.has("oficial") || lados.size < 2) fallos.push("contraste exige la versión oficial y al menos otra");
  }
  if (/[!¡]/.test(n.titulo)) fallos.push("titular con exclamación");
  if (n.titulo.length > 120) fallos.push("titular de más de 120 caracteres");
  return fallos;
}

// Estilo de la casa: sin rayas largas. Se corrigen en vez de descartar la pieza.
export function sinRayas(v) {
  if (typeof v === "string") return v.replace(/\s*—\s*/g, ", ").replace(/,\s*,/g, ",");
  if (Array.isArray(v)) return v.map(sinRayas);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, sinRayas(x)]));
  return v;
}
