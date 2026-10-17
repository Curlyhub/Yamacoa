import { useEffect, useState } from "react";

/* Capa de datos del periódico.
   Las noticias, los estudios automáticos y los episodios NO viven en el build:
   el pipeline los publica como JSON en el almacén de medios (R2) y la SPA los
   lee en tiempo de ejecución. Así una noticia nueva no exige commit ni deploy.
   REACT_APP_FEED_BASE apunta al almacén (p.ej. https://media.yamacoa.com/feed);
   sin ella se lee la copia local de public/data/feed (desarrollo y respaldo).

   Contratos: public/data/feed/*.schema.json. */

const LOCAL = `${process.env.PUBLIC_URL || ""}/data/feed`;
export const FEED_BASE = (process.env.REACT_APP_FEED_BASE || LOCAL).replace(/\/+$/, "");

const DIA = 86400000;
export const VIDA_DIAS = 3;

const cache = new Map();

function modoDemo() {
  if (process.env.NODE_ENV === "production") return false;
  try {
    // ?demo activa el modo para toda la sesión (los <Link> pierden la query).
    if (new URLSearchParams(window.location.search).has("demo")) sessionStorage.setItem("y-demo", "1");
    return sessionStorage.getItem("y-demo") === "1";
  } catch {
    return false;
  }
}

async function cargar(ruta) {
  if (process.env.NODE_ENV !== "production" && modoDemo()) {
    const demo = await import("./demo.js");
    return demo.leer(ruta);
  }
  if (cache.has(ruta)) return cache.get(ruta);
  const p = fetch(`${FEED_BASE}/${ruta}`, { cache: "no-cache" }).then((r) => {
    if (!r.ok) throw new Error(`${r.status} ${ruta}`);
    return r.json();
  });
  cache.set(ruta, p);
  p.catch(() => cache.delete(ruta));
  return p;
}

/* Devuelve { datos, error, cargando }. Un feed ausente no es un error visible:
   las vistas muestran su estado vacío. */
export function useFeed(ruta) {
  const [estado, setEstado] = useState({ datos: null, error: null, cargando: true });
  useEffect(() => {
    let vivo = true;
    if (!ruta) return undefined;
    setEstado({ datos: null, error: null, cargando: true });
    cargar(ruta)
      .then((datos) => vivo && setEstado({ datos, error: null, cargando: false }))
      .catch((error) => vivo && setEstado({ datos: null, error, cargando: false }));
    return () => {
      vivo = false;
    };
  }, [ruta]);
  return estado;
}

/* Noticias vigentes: las caducadas se filtran también en cliente, por si el
   feed llega con retraso respecto a la purga del servidor. */
export function vigentes(items, ahora = Date.now()) {
  return (items || []).filter((n) => !n.caduca || Date.parse(n.caduca) > ahora);
}

export function diasRestantes(caduca, ahora = Date.now()) {
  if (!caduca) return null;
  return Math.max(0, Math.ceil((Date.parse(caduca) - ahora) / DIA));
}

export function fraccionVida(caduca, ahora = Date.now()) {
  const d = diasRestantes(caduca, ahora);
  return d == null ? 0 : Math.min(1, d / VIDA_DIAS);
}

export function textoCaduca(caduca) {
  const d = diasRestantes(caduca);
  if (d == null) return "";
  if (d <= 0) return "sale hoy";
  return d === 1 ? "queda 1 día" : `quedan ${d} días`;
}

const FMT_LARGA = new Intl.DateTimeFormat("es-ES", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});
const FMT_CORTA = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" });
const FMT_MES = new Intl.DateTimeFormat("es-ES", { month: "short", year: "numeric" });
const FMT_HORA = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" });

export const fechaLarga = (d) => FMT_LARGA.format(d instanceof Date ? d : new Date(d));
export const fechaCorta = (d) => FMT_CORTA.format(new Date(d));
export const mesAnio = (d) => FMT_MES.format(new Date(d));
export const hora = (d) => FMT_HORA.format(new Date(d));

export function duracion(seg) {
  if (!Number.isFinite(seg) || seg < 0) return "0:00";
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function minutos(seg) {
  return `${Math.max(1, Math.round((seg || 0) / 60))} min`;
}
