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
  n("dolar-informal-410", "Economía", "El dólar informal toca los 410 CUP en los grupos de Telegram", 1, 80),
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
    versiones: [
      { lado: "oficial", texto: "[DEMO] El Ministerio de Finanzas y Precios presenta el tope como una protección al consumidor.", citas: [2] },
      { lado: "independiente", texto: "[DEMO] Vendedores consultados por medios independientes anticipan desabastecimiento en los mercados.", citas: [1] },
    ],
  }),
  n("deficit-mw", "Energía", "La Unión Eléctrica reconoce un déficit de 1.650 MW en el pico", 6, 60, { estudio: "apagones-2024-2026" }),
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
