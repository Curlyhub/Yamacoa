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
  "/noticias": { t: "Noticias", d: "Cuba, los últimos tres días: noticias automáticas verificadas, con sus fuentes y su nivel de confianza." },
  "/estudios": { t: "Estudios", d: "Estudios automáticos: de los grupos de noticias más relevantes de la semana, al dato." },
  "/expedientes": { t: "Expedientes", d: "Investigaciones dirigidas con método y datos verificados sobre Cuba." },
  "/podcast": { t: "Podcast", d: "Cuba, para escuchar: ediciones habladas, episodios automáticos y conversaciones grabadas." },
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

const esc = (s) => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

// Siembra #root con el texto real del expediente. Sin esto, la respuesta
// publica es una shell que solo dice "You need to enable JavaScript": los
// crawlers, motores de busqueda y extractores automaticos no ven ni una linea
// del articulo. React vacia #root al montar, asi que el lector con JavaScript
// no percibe este bloque; el que no lo ejecuta, lo lee entero.
class SeedRoot {
  constructor(html) { this.html = html; }
  element(el) { el.setInnerContent(this.html, { html: true }); }
}

// Enlace canonico por ruta (la shell trae uno generico).
class SetHref {
  constructor(value) { this.value = value; }
  element(el) { el.setAttribute("href", this.value); }
}

function articuloHTML(tema, title, pageUrl, img) {
  const b = tema.body;
  const parrafos = b.parrafos.map((p) => `<p>${esc(p)}</p>`).join("");
  const ld = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: tema.t,
    description: tema.d,
    url: pageUrl,
    image: img,
    inLanguage: "es",
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: "Yamacoa Observatorio", url: SITE },
  };
  if (b.fecha) ld.datePublished = b.fecha;
  if (b.fuentes) ld.citation = b.fuentes;
  return (
    `<article>` +
    (b.etiqueta ? `<p>${esc(b.etiqueta)}</p>` : "") +
    `<h1>${esc(tema.t)}</h1>` +
    `<p>${esc(tema.d)}</p>` +
    parrafos +
    (b.fuentes ? `<p>Fuentes: ${esc(b.fuentes)}</p>` : "") +
    (b.fecha ? `<p>Datos actualizados: ${esc(b.fecha)}</p>` : "") +
    `<p><a href="${esc(pageUrl)}">${esc(title)}</a></p>` +
    `</article>` +
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`
  );
}

// Noticias automáticas: viven 3 días en data/feed/noticias.json (lo regenera cada
// ciclo desde la base de datos). Una noticia viva recibe su tarjeta y su texto; una
// caducada o inexistente responde 410 Gone para que los buscadores la retiren.
async function deFeed(context, feed, slug) {
  try {
    const r = await context.env.ASSETS.fetch(new URL(`/data/feed/${feed}.json`, context.request.url));
    if (!r.ok) return null;
    return ((await r.json()).items || []).find((x) => x.slug === slug) || null;
  } catch {
    return null;
  }
}
async function noticiaDe(context, slug) {
  const n = await deFeed(context, "noticias", slug);
  return n && Date.parse(n.caduca) > Date.now() ? n : null;
}

// Primeras frases de un texto largo, para og:description (≤ ~220 caracteres, sin cortar palabras).
function extracto(texto, max = 220) {
  const t = String(texto || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(" ", max)).replace(/[,;:.\s]+$/, "") + "…";
}

// Retiradas (ops/admin/admin_supabase.sql): lista PÚBLICA de (tipo, slug) que la redacción o un
// autor de opinión retiró. Se quitan de los feeds en ~1 minuto, sin esperar al despliegue.
// Clave publicable (la misma del portal). Si Supabase no responde, se sirve lo publicado.
const SUPABASE = "https://qsajkrppuaikyzmuipru.supabase.co";
const SUPABASE_PUBLICA = "sb_publishable_iuMth2MYSMZ2Y6-pN5gF8Q_Okq9CwWJ";
const FEED_TIPO = { "/data/feed/noticias.json": "noticia", "/data/feed/podcast.json": "podcast", "/data/feed/opinion.json": "opinion" };

async function retiradas(context) {
  const cache = caches.default;
  const clave = new Request("https://yamacoa.com/__retiradas");
  const guardada = await cache.match(clave);
  if (guardada) return guardada.json();
  try {
    const r = await fetch(`${SUPABASE}/rest/v1/retiradas?select=tipo,slug`, {
      headers: { apikey: SUPABASE_PUBLICA }, signal: AbortSignal.timeout(2500),
    });
    if (!r.ok) return [];
    const lista = await r.json();
    context.waitUntil(cache.put(clave, new Response(JSON.stringify(lista), { headers: { "Cache-Control": "max-age=60" } })));
    return lista;
  } catch {
    return [];
  }
}
const retirada = (lista, tipo, slug) => lista.some((x) => x.tipo === tipo && x.slug === slug);

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const key = url.pathname.replace(/\/+$/, "") || "/";

  // Feeds: fuera lo retirado.
  if (FEED_TIPO[url.pathname]) {
    const res = await next();
    const lista = await retiradas(context);
    if (!res.ok || !lista.length) return res;
    try {
      const feed = await res.clone().json();
      feed.items = (feed.items || []).filter((x) => !retirada(lista, FEED_TIPO[url.pathname], x.slug));
      const h = new Headers(res.headers); h.delete("content-length"); h.set("cache-control", "public, max-age=0, must-revalidate");
      return new Response(JSON.stringify(feed), { status: 200, headers: h });
    } catch {
      return res;
    }
  }
  let tema = TEMAS[key] || EXTRAS[key];

  const mNoticia = key.match(/^\/noticias\/([a-z0-9-]{4,90})$/);
  if (mNoticia) {
    const n = retirada(await retiradas(context), "noticia", mNoticia[1]) ? null : await noticiaDe(context, mNoticia[1]);
    if (!n) {
      const res = await next();
      return new HTMLRewriter()
        .on("head", { element(el) { el.append('<meta name="robots" content="noindex">', { html: true }); } })
        .transform(new Response(res.body, { status: 410, headers: res.headers }));
    }
    tema = {
      t: n.titulo,
      d: n.entradilla,
      body: {
        etiqueta: `Noticia · ${n.seccion}`,
        parrafos: (n.cuerpo || []).map((p) => p.texto),
        fuentes: (n.fuentes || []).map((f) => f.nombre).join(" · "),
        fecha: n.publicado,
      },
    };
    // La ilustración de la noticia (WebP, rotulada «generada por IA» en la página) como imagen
    // de la tarjeta; sin ella, la genérica.
    if (n.imagen?.url) tema.img = new URL(n.imagen.url, SITE).href;
  }

  // Episodios y artículos de opinión: tarjeta propia al compartirlos (sin cuerpo indexable).
  const mPieza = key.match(/^\/(podcast|opinion)\/([a-z0-9-]{4,90})$/);
  if (mPieza) {
    const [, tipo, slug] = mPieza;
    const x = retirada(await retiradas(context), tipo, slug) ? null : await deFeed(context, tipo, slug);
    if (x && tipo === "podcast") tema = { t: x.titulo, d: extracto(x.descripcion || `Podcast de Yamacoa · ${x.tipo || ""}`) };
    if (x && tipo === "opinion") tema = { t: x.titulo, d: extracto(`Opinión · ${x.firma}. ${x.presentacion || x.texto || ""}`) };
  }

  const res = await next();
  const ct = res.headers.get("content-type") || "";
  // Solo reescribimos HTML de rutas conocidas; el resto pasa intacto.
  if (!tema || !ct.includes("text/html")) return res;

  const title = `${tema.t} | Yamacoa Observatorio`;
  const img = tema.img || DEFAULT_IMG;
  const pageUrl = `${SITE}${key}`;

  let rw = new HTMLRewriter()
    .on("title", new SetText(title))
    .on('link[rel="canonical"]', new SetHref(pageUrl))
    .on('meta[name="description"]', new SetContent(tema.d))
    .on('meta[property="og:title"]', new SetContent(title))
    .on('meta[property="og:description"]', new SetContent(tema.d))
    .on('meta[property="og:url"]', new SetContent(pageUrl))
    .on('meta[property="og:image"]', new SetContent(img))
    .on('meta[property="og:image:secure_url"]', new SetContent(img))
    .on('meta[name="twitter:title"]', new SetContent(title))
    .on('meta[name="twitter:description"]', new SetContent(tema.d))
    .on('meta[name="twitter:image"]', new SetContent(img));
  // index.html declara la tarjeta genérica (PNG 1200x630); otra imagen no tiene por qué cumplirlo.
  if (!/\.png(\?|$)/.test(img)) {
    rw = rw.on('meta[property="og:image:type"]', new SetContent(/\.webp(\?|$)/.test(img) ? "image/webp" : "image/jpeg"))
      .on('meta[property="og:image:width"]', { element(el) { el.remove(); } })
      .on('meta[property="og:image:height"]', { element(el) { el.remove(); } });
  }

  // Cuerpo indexable solo si el generador pudo extraerlo del dataset.
  if (tema.body && Array.isArray(tema.body.parrafos) && tema.body.parrafos.length) {
    rw = rw.on("div#root", new SeedRoot(articuloHTML(tema, title, pageUrl, img)));
  }

  return rw.transform(res);
}
