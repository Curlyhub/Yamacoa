// Tres puertas de validación del tema: balance de llaves, compilación esbuild, AJV + coherencia.
import fs from "node:fs";
import * as esbuild from "esbuild";
import Ajv from "ajv";

const [jsxPath, jsonPath, schemaPath] = process.argv.slice(2);
let fallos = 0;
const ok = (m) => console.log("  [PASS] " + m);
const ko = (m) => { fallos++; console.log("  [FAIL] " + m); };

// 1. Balance de llaves, consciente de cadenas, plantillas y comentarios
console.log("Puerta 1: balance de llaves");
{
  const s = fs.readFileSync(jsxPath, "utf8");
  const pila = []; const pares = { ")": "(", "]": "[", "}": "{" };
  let i = 0, linea = 1, error = null;
  const modos = []; // 'tpl' cuando estamos dentro de una plantilla
  const push = (c) => pila.push({ c, linea });
  while (i < s.length && !error) {
    const c = s[i], n = s[i + 1];
    if (c === "\n") linea++;
    const enTpl = modos[modos.length - 1] === "tpl";
    if (enTpl) {
      if (c === "\\") { i += 2; continue; }
      if (c === "`") { modos.pop(); i++; continue; }
      if (c === "$" && n === "{") { modos.push("code"); push("{"); i += 2; continue; }
      i++; continue;
    }
    if (c === "/" && n === "/") { while (i < s.length && s[i] !== "\n") i++; continue; }
    if (c === "/" && n === "*") { i += 2; while (i < s.length && !(s[i] === "*" && s[i + 1] === "/")) { if (s[i] === "\n") linea++; i++; } i += 2; continue; }
    if (c === "'" || c === '"') {
      i++; while (i < s.length && s[i] !== c) { if (s[i] === "\\") i++; if (s[i] === "\n") { linea++; } i++; } i++; continue;
    }
    if (c === "`") { modos.push("tpl"); i++; continue; }
    if ("([{".includes(c)) push(c);
    else if (")]}".includes(c)) {
      const top = pila.pop();
      if (!top || top.c !== pares[c]) error = "cierre '" + c + "' sin pareja en la línea " + linea;
      else if (c === "}" && modos[modos.length - 1] === "code" && pila.filter((p) => p.c === "{").length < modos.filter((m) => m === "code").length) modos.pop();
    }
    i++;
  }
  if (!error && pila.length) error = "quedan " + pila.length + " aperturas sin cerrar (primera en la línea " + pila[0].linea + ")";
  error ? ko(error) : ok("llaves, corchetes y paréntesis equilibrados");
}

// 2. Compilación JSX con esbuild (bundle:false)
console.log("Puerta 2: esbuild");
try {
  const r = await esbuild.build({ entryPoints: [jsxPath], bundle: false, write: false, loader: { ".jsx": "jsx" }, jsx: "automatic", format: "esm", logLevel: "silent" });
  r.warnings.length ? ko(r.warnings.length + " avisos de compilación") : ok("compila sin errores ni avisos (" + r.outputFiles[0].text.length + " bytes)");
} catch (e) { ko("no compila: " + e.message.split("\n")[0]); }

// 3. AJV + coherencia
console.log("Puerta 3: AJV y coherencia");
const d = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const ajv = new Ajv({ allErrors: true, strict: true });
const valida = ajv.compile(schema);
valida(d) ? ok("el JSON cumple el schema draft-07") : ko("schema: " + ajv.errorsText(valida.errors));

const rangos = [...d.partidas.flatMap((p) => [[p.id + ".usd2025", p.usd2025], [p.id + ".nominal", p.nominal]]),
  ...Object.entries(d.totales)];
const malos = rangos.filter(([, r]) => !(r.p5 <= r.p50 && r.p50 <= r.p95));
malos.length ? ko("percentiles desordenados: " + malos.map((m) => m[0]).join(", ")) : ok("p5 ≤ p50 ≤ p95 en " + rangos.length + " rangos");

const inc = d.partidas.filter((p) => p.en_total !== (p.confianza !== "no_cuantificado"));
inc.length ? ko("en_total incoherente con la confianza: " + inc.map((p) => p.id).join(", ")) : ok("solo las partidas no_cuantificado quedan fuera del total");

const ids = new Set(d.partidas.map((p) => p.id));
ids.size === d.partidas.length ? ok("ids de partida únicos") : ko("ids de partida repetidos");
const prefijo = d.partidas.filter((p) => (p.libro === "eeuu") !== p.id.startsWith("us_"));
prefijo.length ? ko("prefijo de id no coincide con el libro: " + prefijo.map((p) => p.id)) : ok("prefijos us_/cu_ coinciden con el libro");

for (const libro of ["eeuu", "cuba"]) {
  const suma = d.partidas.filter((p) => p.libro === libro && p.en_total).reduce((a, p) => a + p.usd2025.p50, 0);
  const tot = d.totales[libro].p50, desv = Math.abs(suma - tot) / tot;
  desv < 0.15 ? ok(libro + ": suma de medianas a " + (desv * 100).toFixed(1) + " % de la mediana del total")
              : ko(libro + ": suma de medianas se aleja " + (desv * 100).toFixed(1) + " % del total");
}
const sumaLibros = d.totales.eeuu.p50 + d.totales.cuba.p50, dt = Math.abs(sumaLibros - d.totales.total.p50) / d.totales.total.p50;
dt < 0.05 ? ok("total coherente con los dos libros (" + (dt * 100).toFixed(1) + " %)") : ko("total incoherente con los libros");
d.totales.total_nominal.p50 < d.totales.total.p50 ? ok("total nominal menor que el deflactado") : ko("total nominal ≥ total 2025");

const fids = new Set(d.fuentes.map((f) => f.id));
const refs = [...d.partidas.flatMap((p) => p.fuentes), ...d.correcciones.flatMap((c) => c.fuentes),
  ...d.conexos.flatMap((c) => c.fuentes), ...d.encarcelamiento.coif_anclas.map((a) => a.fuente)];
const rotas = [...new Set(refs.filter((r) => !fids.has(r)))];
rotas.length ? ko("fuentes citadas que no existen: " + rotas.join(", ")) : ok(refs.length + " citas apuntan a fuentes existentes");
const huer = [...fids].filter((f) => !refs.includes(f));
console.log("  [INFO] fuentes listadas sin cita directa (solo en la bibliografía): " + huer.length);

const sens = d.sensibilidad.reduce((a, s) => a + s.cuota_varianza, 0);
sens > 0.9 && sens < 1.1 ? ok("cuotas de varianza suman " + sens.toFixed(3)) : ko("cuotas de varianza suman " + sens.toFixed(3));
const sensRotas = d.sensibilidad.filter((s) => !ids.has(s.id));
sensRotas.length ? ko("sensibilidad con ids inexistentes") : ok("sensibilidad apunta a partidas existentes");

const pa = d.encarcelamiento.personas.reduce((a, p) => a + p.anios_custodia, 0);
Math.abs(pa - d.encarcelamiento.total_persona_anios) < 0.05 ? ok("años-persona suman " + pa.toFixed(2)) : ko("años-persona no cuadran");
const per = d.partidas.filter((p) => p.periodo[0] > p.periodo[1]);
per.length ? ko("periodos invertidos") : ok("periodos ordenados");

// Cromática: el ámbar #C98A17 está reservado a contrafactuales
const src = fs.readFileSync(jsxPath, "utf8");
/#C98A17/i.test(src) ? ko("el renderer usa el ámbar reservado") : ok("no usa el ámbar reservado #C98A17");
/preserveAspectRatio\s*=\s*["']none/.test(src) ? ko("preserveAspectRatio=none presente") : ok("sin preserveAspectRatio=none");
const hue = (hex) => { const [r, g, b] = [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16) / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), dd = mx - mn; if (!dd) return 0; let h = mx === r ? ((g - b) / dd) % 6 : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4; return Math.round((h * 60 + 360) % 360); };
const dist = (a, b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
const ambar = hue("#C98A17");
for (const [n, c] of [["us claro", "#0B7FA0"], ["us oscuro", "#3AA0BC"], ["cu claro", "#B84A2E"], ["cu oscuro", "#E0704E"]]) {
  const h = hue(c); dist(h, ambar) >= 20 ? ok(n + " " + c + " a " + dist(h, ambar) + "° del ámbar (" + h + "°)") : ko(n + " " + c + " demasiado cerca del ámbar");
}

console.log(fallos ? "\n→ " + fallos + " FALLOS" : "\n→ Las tres puertas pasan");
process.exit(fallos ? 1 : 0);
