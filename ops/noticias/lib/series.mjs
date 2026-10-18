// Series de referencia: el dato de hoy dentro de su historia. El catálogo (series.json) es
// cerrado; los puntos salen de la semilla del expediente (ya verificada) y de la BD (puntos
// que añadió la verja desde las capturas). El gráfico de una serie lo construye el código,
// nunca el modelo: el motor solo dice QUÉ serie, no teclea los valores históricos.

import fs from "node:fs";
import path from "node:path";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const FORMATO = { anual: /^\d{4}$/, mensual: /^\d{4}-\d{2}$/, diaria: /^\d{4}-\d{2}-\d{2}$/ };
const CUANTOS = { anual: 15, mensual: 24, diaria: 30 };

const en = (o, ruta) => ruta.split(".").reduce((x, k) => (x == null ? x : x[k]), o);

export function etiqueta(fecha, frecuencia) {
  if (frecuencia === "anual") return fecha;
  const [a, m, d] = fecha.split("-");
  if (frecuencia === "mensual") return `${MESES[+m - 1]} ${a.slice(2)}`;
  return `${+d} ${MESES[+m - 1]}`;
}

export function cargarSeries({ catalogo, datos, puntos = [] }) {
  const conf = JSON.parse(fs.readFileSync(catalogo, "utf8"));
  const series = new Map();
  for (const s of conf.series) {
    const pts = new Map();
    if (s.semilla) {
      try {
        const j = JSON.parse(fs.readFileSync(path.join(datos, s.semilla.fichero), "utf8"));
        for (const p of en(j, s.semilla.ruta) || []) {
          const fecha = String(p[s.semilla.x]); const valor = p[s.semilla.y];
          if (FORMATO[s.frecuencia].test(fecha) && typeof valor === "number") {
            pts.set(fecha, { fecha, valor, fuente: s.fuente, origen: "expediente" });
          }
        }
      } catch { /* sin semilla: la serie empieza vacía */ }
    }
    series.set(s.id, { ...s, puntos: pts });
  }
  // Los puntos de la BD pisan a la semilla en la misma fecha (dato más reciente).
  for (const p of puntos) {
    const s = series.get(p.serie);
    if (s) s.puntos.set(p.fecha, { fecha: p.fecha, valor: Number(p.valor), fuente: p.fuente, url: p.url, origen: "noticia" });
  }
  return series;
}

export const ordenados = (s) => [...s.puntos.values()].sort((a, b) => a.fecha.localeCompare(b.fecha));

// Lo que ve el motor: catálogo y los últimos puntos de cada serie.
export function paraMotor(series) {
  return [...series.values()].map((s) => ({
    id: s.id, titulo: s.titulo, unidad: s.unidad, fuente: s.fuente, frecuencia: s.frecuencia,
    formato_fecha: { anual: "AAAA", mensual: "AAAA-MM", diaria: "AAAA-MM-DD" }[s.frecuencia],
    abierta: !!s.abierta, expediente: s.expediente || null, nota: s.nota || undefined,
    puntos: ordenados(s).slice(-CUANTOS[s.frecuencia]).map((p) => [p.fecha, p.valor]),
  }));
}

export const fechaValida = (s, fecha) => FORMATO[s.frecuencia].test(String(fecha || ""));

// ¿Aparece el número en el texto? Acepta 1281 / 1.281 / 1,281 / 1 281 y 4,3 / 4.3.
export function numeroEnTexto(valor, texto) {
  const t = String(texto).replace(/[  ]/g, " ");
  const v = Number(valor);
  if (!Number.isFinite(v)) return false;
  const [ent, dec] = String(Math.abs(v)).split(".");
  const miles = (sep) => ent.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  const enteros = [...new Set([ent, miles("."), miles(","), miles(" ")])];
  const formas = dec ? enteros.flatMap((e) => [`${e},${dec}`, `${e}.${dec}`]) : enteros;
  return formas.some((f) => new RegExp(`(^|[^\\d.,])${f.replace(/[.]/g, "\\.")}(?![\\d]|[.,]\\d)`).test(t));
}

// Gráfico de una serie (lo construye el código). `nuevas`: fechas que aporta esta noticia.
// Periodo anterior en la frecuencia de la serie (para rellenar huecos con s/d).
function anterior(fecha, frecuencia) {
  if (frecuencia === "anual") return String(+fecha - 1);
  const d = new Date(`${frecuencia === "mensual" ? `${fecha}-01` : fecha}T12:00:00Z`);
  if (frecuencia === "mensual") d.setUTCMonth(d.getUTCMonth() - 1); else d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, frecuencia === "mensual" ? 7 : 10);
}

export function graficoDeSerie(s, { tipo = "serie", titulo, nuevas = [] } = {}) {
  const todos = ordenados(s);
  if (!todos.length) return null;
  // Eje temporal real: los últimos N periodos hasta el dato más reciente; lo que falta, s/d.
  const fechas = [todos[todos.length - 1].fecha];
  while (fechas.length < CUANTOS[s.frecuencia]) fechas.unshift(anterior(fechas[0], s.frecuencia));
  while (fechas.length && !s.puntos.has(fechas[0])) fechas.shift();
  const pts = fechas.map((f) => s.puntos.get(f) || { fecha: f, valor: null });
  if (pts.filter((p) => p.valor != null).length < 3) return null;
  const ultima = nuevas.length ? [...nuevas].sort().pop() : pts[pts.length - 1].fecha;
  const fuentes = [...new Set(pts.map((p) => p.fuente).filter(Boolean))];
  return {
    tipo: tipo === "barras" ? "barras" : "serie",
    titulo: titulo || s.titulo,
    unidad: s.unidad,
    ...(s.unidadCorta ? { unidadCorta: s.unidadCorta } : {}),
    fuente: `${fuentes.join(", ")} · serie Yamacoa`,
    ...(s.nota ? { nota: s.nota } : {}),
    serie: s.id,
    ...(tipo === "barras" ? { orden: "original" } : {}),
    destacar: etiqueta(ultima, s.frecuencia),
    datos: pts.map((p) => ({ etiqueta: etiqueta(p.fecha, s.frecuencia), valor: p.valor })),
  };
}
