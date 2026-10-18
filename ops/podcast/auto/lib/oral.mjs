// Texto escrito → texto para el oído (español). El guion conserva las cifras en dígitos
// para que la verja pueda comprobarlas contra las noticias; la voz recibe palabras.

const U = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce",
  "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte", "veintiuno",
  "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
const D = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
const C = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos",
  "ochocientos", "novecientos"];

function menorMil(n) {
  if (n === 100) return "cien";
  const c = Math.floor(n / 100), r = n % 100;
  const resto = r < 30 ? (r ? U[r] : "") : D[Math.floor(r / 10)] + (r % 10 ? ` y ${U[r % 10]}` : "");
  return [C[c], resto].filter(Boolean).join(" ");
}
// «uno» delante de mil o millón se apocopa: un millón, veintiún mil.
const apocope = (s) => s.replace(/veintiuno$/, "veintiún").replace(/uno$/, "un");

export function enLetras(n) {
  n = Math.floor(Math.abs(n));
  if (n < 1000) return n === 0 ? "cero" : menorMil(n);
  if (n < 1e6) {
    const m = Math.floor(n / 1000), r = n % 1000;
    return [m === 1 ? "mil" : `${apocope(menorMil(m))} mil`, r ? menorMil(r) : ""].filter(Boolean).join(" ");
  }
  if (n < 1e12) {
    const m = Math.floor(n / 1e6), r = n % 1e6;
    return [m === 1 ? "un millón" : `${apocope(enLetras(m))} millones`, r ? enLetras(r) : ""].filter(Boolean).join(" ");
  }
  return String(n);
}

const UNIDADES = [
  [/\s?%/g, " por ciento"], [/\bMW\b/g, " megavatios"], [/\bGWh\b/g, " gigavatios hora"], [/\bCUP\b/g, " pesos cubanos"],
  [/\bMLC\b/g, " eme ele ce"], [/\bUSD\b/g, " dólares"], [/\bEUR\b/g, " euros"], [/\bkm\b/g, " kilómetros"],
  [/\bYamacoa\b/g, "Yamacóa"], [/\.com\b/g, " punto com"], [/\bEE\s?UU\b/g, "Estados Unidos"], [/\bONU\b/g, "Naciones Unidas"], [/\bOCDH\b/g, "Observatorio Cubano de Derechos Humanos"],
  [/\bOCC\b/g, "Observatorio Cubano de Conflictos"], [/\bONEI\b/g, "Oficina Nacional de Estadística"],
  [/\bUNE\b/g, "Unión Eléctrica"], [/\bMINSAP\b/g, "Ministerio de Salud Pública"], [/\bGAESA\b/g, "Gaesa"],
];

// Cifra escrita en formato español (1.281 · 28,44 · 3,5) → palabras.
function cifra(txt) {
  const [ent, dec] = txt.replace(/\./g, "").split(",");
  const base = enLetras(Number(ent));
  if (!dec) return base;
  // Decimales: «coma» y el número tal cual (28,44 → veintiocho coma cuarenta y cuatro; 3,05 → tres coma cero cinco).
  const d = dec.startsWith("0") ? dec.split("").map((x) => U[+x]).join(" ") : enLetras(Number(dec));
  return `${base} coma ${d}`;
}

export function paraOido(texto) {
  let t = String(texto);
  // Rangos y signos antes que las cifras: «entre 35 y 45», «-12 %» → «menos doce por ciento».
  t = t.replace(/(^|\s)[-−](\d)/g, "$1menos $2")
    .replace(/\bentre ([\d.,]+)\s?[–-]\s?(\d)/g, "entre $1 y $2").replace(/(\d)\s?[–-]\s?(\d)/g, "$1 a $2");
  t = t.replace(/\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g, (m) => cifra(m));
  for (const [re, s] of UNIDADES) t = t.replace(re, s);
  return t.replace(/[«»"“”]/g, "").replace(/\s+([,.;:])/g, "$1").replace(/\s{2,}/g, " ").trim();
}

// Cifras de un texto (para la verja): las de dos o más dígitos o con decimales.
export function cifras(texto) {
  return (String(texto).match(/\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:,\d+)?/g) || [])
    .filter((m) => m.replace(/\D/g, "").length >= 2 || m.includes(","))
    .map((m) => Number(m.replace(/\./g, "").replace(",", ".")));
}
