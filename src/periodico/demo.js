/* Datos de DEMOSTRACIÓN para revisar el diseño en local (npm start, ruta?demo).
   Solo se cargan en desarrollo: feed.js excluye este módulo del build de
   producción. Titulares tomados del handoff de diseño; NO son noticias reales. */

const H = 3600000;
const D = 24 * H;
const ahora = Date.now();
const iso = (ms) => new Date(ms).toISOString();

function n(id, seccion, titulo, haceDias, relevancia, extra = {}) {
  const pub = ahora - haceDias * D - 2 * H;
  return {
    id: `n-${id}`, slug: id, plantilla: "cronica", seccion, titulo, relevancia,
    entradilla: "[DEMO] Entradilla de ejemplo para revisar el diseño. El pipeline la sustituye por texto verificado con sus fuentes.",
    cuerpo: [
      { texto: "[DEMO] Primer párrafo de la noticia, con su cita a la fuente correspondiente.", citas: [1] },
      { texto: "[DEMO] Segundo párrafo, que cruza dos fuentes independientes.", citas: [1, 2] },
    ],
    fuentes: [
      { nombre: "Fuente primaria de ejemplo", tipo: "primaria", url: "https://example.org" },
      { nombre: "Publicación en red social de ejemplo", tipo: "red_social", verificacion: "replicada" },
    ],
    confianza: "corroborada", publicado: iso(pub), caduca: iso(pub + 7 * D), ...extra,
  };
}

const noticias = [
  n("apagon-14-horas", "Energía", "Apagón de 14 horas afecta a seis provincias del occidente", 0, 92, { estudio: "apagones-2024-2026" }),
  n("dolar-informal-410", "Economía", "El dólar informal toca los 410 CUP en los grupos de Telegram", 1, 80, {
    plantilla: "datos",
    cifra: { valor: "410", unidad: "CUP por dólar", etiqueta: "[DEMO] Tasa representativa del mercado informal.", citas: [1] },
    fuentes: [{ nombre: "Medio de ejemplo", tipo: "medio", url: "https://example.org" },
      { nombre: "Serie Yamacoa: Dólar en el mercado informal (datos de ejemplo)", tipo: "dataset", url: "https://example.org" }],
    grafico: { tipo: "serie", titulo: "[DEMO] Dólar en el mercado informal", unidad: "pesos cubanos (CUP) por dólar", unidadCorta: "CUP",
      fuente: "Datos de ejemplo · serie Yamacoa", serie: "dolar-informal", destacar: "17 oct",
      datos: [["4 oct", 372], ["5 oct", null], ["6 oct", 375], ["7 oct", 380], ["8 oct", 384], ["9 oct", 383], ["10 oct", 390], ["11 oct", null],
        ["12 oct", null], ["13 oct", 396], ["14 oct", 398], ["15 oct", 402], ["16 oct", 405], ["17 oct", 410]].map(([etiqueta, valor]) => ({ etiqueta, valor })) },
    analisis: [
      { texto: "[DEMO] Primer párrafo de análisis: cómo se compara el dato de hoy con su serie (sube un 10 % en dos semanas) y desde cuándo no estaba tan alto.", citas: [1, 2] },
      { texto: "[DEMO] Segundo párrafo: a quién afecta y en qué magnitud, con números de las fuentes citadas.", citas: [2] },
    ],
  }),
  n("llegadas-frontera-sur", "Migración", "Llegadas por la frontera sur repuntan un 18% en septiembre", 2, 71, {
    plantilla: "datos",
    cifra: { valor: "+18 %", unidad: "llegadas en septiembre", etiqueta: "[DEMO] Variación mensual de llegadas registradas por la frontera sur.", citas: [1] },
    grafico: { tipo: "barras", titulo: "[DEMO] Llegadas por mes", unidad: "personas", fuente: "Datos de ejemplo",
      datos: [{ etiqueta: "jul", valor: 3100 }, { etiqueta: "ago", valor: 3400 }, { etiqueta: "sep", valor: 4012 }] },
  }),
  n("antibioticos-holguin", "Salud", "Hospitales de Holguín reportan déficit de antibióticos básicos", 3, 66, {
    confianza: "no_confirmada", plantilla: "breve",
    pendiente: ["[DEMO] ¿Cuántos hospitales están afectados?", "[DEMO] ¿Cuándo llega el próximo lote?"],
  }),
  n("turnos-lena", "Sociedad", "Vecinos de Centro Habana organizan turnos para cocinar con leña", 4, 52, { estudio: "apagones-2024-2026" }),
  n("precios-topados", "Economía", "Nuevo esquema de precios topados para el arroz y el aceite", 5, 48, {
    plantilla: "contraste", expediente: "/medidas-176",
    grafico: { tipo: "proporcion", titulo: "[DEMO] Personas en «situación de vulnerabilidad»", unidad: "personas", fuente: "Datos de ejemplo",
      total: 9434593, datos: [{ etiqueta: "Reconocidas por el Gobierno", valor: 883446 }] },
    analisis: [{ texto: "[DEMO] Análisis del contraste: qué parte de la población representa la cifra oficial y qué miden otras fuentes.", citas: [1, 2] }],
    versiones: [
      { lado: "oficial", texto: "[DEMO] El Ministerio de Finanzas y Precios presenta el tope como una protección al consumidor.", citas: [2] },
      { lado: "independiente", texto: "[DEMO] Vendedores consultados por medios independientes anticipan desabastecimiento en los mercados.", citas: [1] },
    ],
  }),
  n("deficit-mw", "Energía", "La Unión Eléctrica reconoce un déficit de 1.650 MW en el pico", 6, 60, {
    estudio: "apagones-2024-2026",
    grafico: { tipo: "comparacion", titulo: "[DEMO] Afectación máxima prevista", unidad: "megavatios (MW)", unidadCorta: "MW", fuente: "Datos de ejemplo",
      datos: [{ etiqueta: "Octubre 2025", valor: 1180 }, { etiqueta: "Octubre 2026", valor: 1650 }] },
    analisis: [{ texto: "[DEMO] Análisis con comparación: el déficit de hoy frente al mismo mes del año anterior, citando ambas fuentes.", citas: [1, 2] }],
  }),
  n("protestas-provincias", "Derechos", "El OCC registra protestas en las 15 provincias durante septiembre", 2, 70, {
    grafico: { tipo: "mapa", titulo: "[DEMO] Protestas por provincia, septiembre", unidad: "protestas", fuente: "Datos de ejemplo",
      datos: [["La Habana", 474], ["Santiago de Cuba", 160], ["Holguín", 120], ["Matanzas", 95], ["Villa Clara", 88], ["Camagüey", 70],
        ["Pinar del Río", 52], ["Granma", 61], ["Guantánamo", 40], ["Cienfuegos", 33], ["Las Tunas", 38], ["Artemisa", 30],
        ["Mayabeque", 25], ["Sancti Spíritus", 29], ["Ciego de Ávila", 27], ["Isla de la Juventud", 6]].map(([etiqueta, valor]) => ({ etiqueta, valor })) },
  }),
];

const grafico = {
  tipo: "serie", titulo: "[DEMO] Horas de apagón promedio por día", unidad: "horas/día", unidadCorta: "h",
  fuente: "Datos de ejemplo",
  datos: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep"].map((m, i) => ({ etiqueta: m, valor: 6 + i * 0.9 + (i % 3) })),
};

const estudio = {
  id: "e-apagones", slug: "apagones-2024-2026", seccion: "Energía",
  titulo: "Apagones 2024–2026: frecuencia, duración y provincias",
  resumen: "[DEMO] Generado a partir de las noticias de la semana sobre el sistema eléctrico.",
  noticias: ["n-apagon-14-horas", "n-turnos-lena", "n-deficit-mw"], relevancia: 87,
  fuentesDatos: ["UNE", "Reportes vecinales"], creado: iso(ahora - 3 * H), grafico,
};

const estudioDetalle = {
  ...estudio,
  secciones: [
    { titulo: "Qué muestran los datos", parrafos: ["[DEMO] Texto de análisis."], grafico },
    {
      titulo: "Dónde golpea más", parrafos: ["[DEMO] Comparación provincial."],
      grafico: {
        tipo: "barras", titulo: "[DEMO] Horas sin corriente, última semana", unidad: "horas", unidadCorta: "h", fuente: "Datos de ejemplo",
        datos: [["Pinar del Río", 61], ["Artemisa", 54], ["Matanzas", 49], ["La Habana", 22], ["Mayabeque", 40]].map(([etiqueta, valor]) => ({ etiqueta, valor })),
      },
    },
  ],
  limitaciones: "[DEMO] Los reportes vecinales tienen subregistro en zonas rurales; las cifras son suelos, no totales.",
};

const podcast = [
  {
    id: "p-edicion", slug: "edicion-hablada-demo", titulo: "Cuba hoy, en 12 minutos.", tipo: "Automático",
    formato: "edicion_hablada", duracion: 724, publicado: iso(ahora - 2 * H), voces_sinteticas: true,
    descripcion: "[DEMO] Edición hablada del día.",
    capitulos: noticias.slice(0, 5).map((x, i) => ({ titulo: x.titulo, inicio: i * 140, noticia: x.id })),
  },
  { id: "p-corriente", slug: "por-que-no-alcanza-la-corriente", titulo: "¿Por qué no alcanza la corriente?", tipo: "Elaborado",
    formato: "conversacion", duracion: 1560, publicado: iso(ahora - D), voces_sinteticas: false,
    descripcion: "[DEMO] Conversación grabada en el estudio.", participantes: [{ nombre: "Persona A", rol: "conduce" }, { nombre: "Persona B", rol: "invitada" }] },
  { id: "p-dolar", slug: "dolar-semana", titulo: "El dólar en la semana", tipo: "Automático", formato: "noticias", duracion: 410,
    publicado: iso(ahora - 2 * D), voces_sinteticas: true, descripcion: "[DEMO] Resumen económico." },
];

const FEEDS = {
  "noticias.json": { version: "demo", actualizado: iso(ahora - H), items: noticias },
  "estudios.json": { version: "demo", actualizado: iso(ahora - H), items: [estudio] },
  "estudios/apagones-2024-2026.json": estudioDetalle,
  "podcast.json": { version: "demo", actualizado: iso(ahora - H), items: podcast },
};

export async function leer(ruta) {
  if (!(ruta in FEEDS)) throw new Error(`demo: ${ruta}`);
  return FEEDS[ruta];
}
