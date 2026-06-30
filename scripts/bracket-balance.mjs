#!/usr/bin/env node
/* ──────────────────────────────────────────────────────────────────────────
   bracket-balance.mjs · Yamacoa
   Verifica el balance de ( ) [ ] { } siendo CONSCIENTE de:
     · cadenas '...' y "..."   (con escapes \\)
     · template literals `...` con interpolación ${ ... } anidable
     · comentarios de línea //  y de bloque /* *​/
   Un contador naíf cuenta llaves dentro de literales de cadena en JSX y produce
   falsos desajustes; este scanner las ignora.

   Limitación conocida: no rastrea literales de expresión regular (poco comunes
   en los renderers de datos). Si alguno usa /.../ con corchetes desbalanceados,
   añádelo a la lista de excepciones o conviértelo a `new RegExp("...")`.

   Uso:  node scripts/bracket-balance.mjs <fichero...>
   Sale con código 1 si hay algún desajuste.
   ────────────────────────────────────────────────────────────────────────── */
import { readFileSync } from "node:fs";

const PAIRS = { ")": "(", "]": "[", "}": "{" };
const OPEN = new Set(["(", "[", "{"]);
const CLOSE = new Set([")", "]", "}"]);

function check(src) {
  const errors = [];
  const stack = [];          // { ch, line, col, tmpl? }
  let mode = "code";          // code | sq | dq | tl | lc | bc
  let line = 1, col = 0;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const n = src[i + 1];

    if (c === "\n") {
      line++; col = 0;
      if (mode === "lc") mode = "code";
      continue;
    }
    col++;

    switch (mode) {
      case "code":
        if (c === "/" && n === "/") { mode = "lc"; i++; col++; break; }
        if (c === "/" && n === "*") { mode = "bc"; i++; col++; break; }
        if (c === "'") { mode = "sq"; break; }
        if (c === '"') { mode = "dq"; break; }
        if (c === "`") { mode = "tl"; break; }
        if (OPEN.has(c)) { stack.push({ ch: c, line, col }); break; }
        if (CLOSE.has(c)) {
          const top = stack.pop();
          if (!top) errors.push(`Cierre '${c}' sin apertura (${line}:${col})`);
          else if (top.ch !== PAIRS[c])
            errors.push(`'${c}' (${line}:${col}) no casa con '${top.ch}' abierto en ${top.line}:${top.col}`);
          else if (top.tmpl && c === "}") mode = "tl"; // fin de ${...}
        }
        break;

      case "sq":
        if (c === "\\") { i++; col++; } else if (c === "'") mode = "code";
        break;
      case "dq":
        if (c === "\\") { i++; col++; } else if (c === '"') mode = "code";
        break;
      case "tl":
        if (c === "\\") { i++; col++; }
        else if (c === "`") mode = "code";
        else if (c === "$" && n === "{") { stack.push({ ch: "{", line, col, tmpl: true }); mode = "code"; i++; col++; }
        break;
      case "bc":
        if (c === "*" && n === "/") { mode = "code"; i++; col++; }
        break;
    }
  }

  for (const s of stack) errors.push(`Apertura '${s.ch}' sin cierre (${s.line}:${s.col})`);
  if (mode === "sq" || mode === "dq" || mode === "tl")
    errors.push(`Cadena/template sin cerrar al final (modo ${mode})`);
  return errors;
}

const files = process.argv.slice(2);
if (!files.length) { console.error("uso: node scripts/bracket-balance.mjs <fichero...>"); process.exit(2); }

let bad = 0;
for (const f of files) {
  let src;
  try { src = readFileSync(f, "utf8"); }
  catch (e) { console.error(`✗ ${f}: no se pudo leer (${e.code})`); bad++; continue; }
  const errs = check(src);
  if (errs.length) { bad++; console.error(`✗ ${f}`); for (const e of errs) console.error(`    ${e}`); }
  else console.log(`✓ ${f}`);
}
process.exit(bad ? 1 : 0);
