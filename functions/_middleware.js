// Cloudflare Pages Function — tarjetas sociales por expediente.
//
// La app es una SPA (BrowserRouter): los crawlers de WhatsApp/Facebook/X NO
// ejecutan JavaScript, así que las etiquetas OG/Twitter tienen que venir ya
// escritas en el HTML que se les sirve. Como el `_redirects` (/* -> index.html)
// devuelve el MISMO index.html para toda ruta, sin esto todos los temas
// compartirían la tarjeta por defecto. Aquí, en el edge, reescribimos las
// metaetiquetas según la ruta antes de entregar el HTML.
//
// FUENTE DE VERDAD del front es src/temas/registry.js. Este mapa lo refleja:
// al añadir/renombrar/quitar un tema, actualizá también esta tabla. Una ruta
// que no esté aquí recibe la tarjeta por defecto de index.html (nunca gris).

const SITE = "https://yamacoa.com";
const DEFAULT_IMG = `${SITE}/logo512.png`;

// path -> { t: título, d: descripción, img?: URL absoluta de imagen propia }
const TEMAS = {
  "/conflictos": { t: "La calle arde", d: "Observatorio de la protesta cívica en Cuba · primer trimestre de 2026" },
  "/represion": { t: "La maquinaria de la represión", d: "Observatorio de la represión en Cuba · foco abril–mayo 2026" },
  "/gaesa": { t: "Energía y GAESA", d: "El coste de los apagones frente a los activos líquidos del conglomerado militar" },
  "/rusificacion": { t: "La rusificación de Cuba", d: "Mapa de la captura oligárquica del Estado" },
  "/himno": { t: "Himno Patriótico Cubano", d: "El himno de Narciso López · 1850" },
  "/mineria": { t: "El subsuelo y la crisis", d: "Reservas minerales de Cuba y la ruptura geopolítica de 2026" },
  "/libertad-prensa": { t: "El cerco a la palabra", d: "Violaciones a la libertad de expresión y de prensa en Cuba — enero de 2026." },
  "/racismo-estructural": { t: "El racismo que el Estado niega", d: "Represión racializada de defensores afrodescendientes en Cuba — y sus ecos históricos." },
  "/anatomia-11j": { t: "La anatomía de la represión del 11J", d: "Quién pagó el precio de salir a la calle el 11 de julio de 2021" },
  "/asesinatos-masacres": { t: "Asesinatos y masacres de Estado", d: "Ejecuciones, hundimientos y muertes en huelga de hambre bajo el Estado cubano · 1959–2022" },
  "/desaparecidos-2023": { t: "Los 79 de 2023", d: "Muertes y desapariciones documentadas en 2023 atribuidas al Estado cubano" },
  "/servicio-militar": { t: "Servir o morir", d: "El servicio militar obligatorio en Cuba: trata de personas con un costo letal" },
  "/vias-cambio": { t: "Vías de cambio: invasión, ley y evidencia", d: "Qué dice la evidencia sobre cómo caen los regímenes: resistencia civil frente a intervención armada" },
  "/metodologia": { t: "Metodología", d: "Estadística observacional sobre eventos medibles documentados en fuentes públicas." },
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
  const tema = TEMAS[key];

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
