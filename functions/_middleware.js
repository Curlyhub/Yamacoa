// Cloudflare Pages Function — tarjetas sociales por expediente.
//
// La app es una SPA (BrowserRouter): los crawlers de WhatsApp/Facebook/X NO
// ejecutan JavaScript, así que las etiquetas OG/Twitter tienen que venir ya
// escritas en el HTML. Como el `_redirects` (/* -> index.html) devuelve el
// MISMO index.html para toda ruta, sin esto todos los temas compartirían la
// tarjeta por defecto. Aquí, en el edge, reescribimos las metaetiquetas según
// la ruta antes de entregar el HTML.
//
// El mapa de expedientes se GENERA desde src/temas/registry.js (fuente única)
// en `prebuild` -> functions/social-meta.json. No editar ese JSON a mano.
// EXTRAS cubre rutas que no están en el registry (p.ej. /metodologia).

import TEMAS from "./social-meta.json";

const SITE = "https://yamacoa.com";
// Cache-busting: algunas plataformas (Facebook, Twitter/X, WhatsApp) cachearon la
// vista previa de yamacoa.com antes de que existiera este banner y no la refrescan
// solas. La query ?v= fuerza una URL "nueva" para toda plataforma, sin depender de
// que cada usuario dispare manualmente el re-scrape. Sube la fecha si se repite.
const DEFAULT_IMG = `${SITE}/yamacoa_og_1200x630.png?v=20260707`;

// Rutas fuera del registry (ver App.js).
const EXTRAS = {
  "/metodologia": {
    t: "Metodología",
    d: "Estadística observacional sobre eventos medibles documentados en fuentes públicas.",
  },
};

// Sustituye el atributo content de una metaetiqueta.
class SetContent {
  constructor(value) { this.value = value; }
  element(el) { el.setAttribute("content", this.value); }
}
// Sustituye el texto interno de <title>.
class SetText {
  constructor(value) { this.value = value; }
  element(el) { el.setInnerContent(this.value); }
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const key = url.pathname.replace(/\/+$/, "") || "/";
  const tema = TEMAS[key] || EXTRAS[key];

  const res = await next();
  const ct = res.headers.get("content-type") || "";
  // Solo reescribimos HTML de rutas conocidas; el resto pasa intacto.
  if (!tema || !ct.includes("text/html")) return res;

  const title = `${tema.t} | Yamacoa Observatorio`;
  const img = tema.img || DEFAULT_IMG;
  const pageUrl = `${SITE}${key}`;

  return new HTMLRewriter()
    .on("title", new SetText(title))
    .on('meta[name="description"]', new SetContent(tema.d))
    .on('meta[property="og:title"]', new SetContent(title))
    .on('meta[property="og:description"]', new SetContent(tema.d))
    .on('meta[property="og:url"]', new SetContent(pageUrl))
    .on('meta[property="og:image"]', new SetContent(img))
    .on('meta[property="og:image:secure_url"]', new SetContent(img))
    .on('meta[name="twitter:title"]', new SetContent(title))
    .on('meta[name="twitter:description"]', new SetContent(tema.d))
    .on('meta[name="twitter:image"]', new SetContent(img))
    .transform(res);
}
