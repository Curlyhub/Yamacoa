// Manifiesto de temas: la única fuente de verdad del proyecto.
//
// Añadir un análisis nuevo es una entrada en este array (ver SKILLS.md): la
// portada (components/Landing.jsx) lo mapea a una tarjeta y el router (App.js)
// lo mapea a una ruta con React.lazy(load). No se editan a mano ni la landing
// ni el router para sumar, quitar o reordenar temas: solo se toca este archivo.
//
// Cada tema declara:
//   id        identificador estable
//   slug      nombre corto en la URL
//   path      ruta de react-router (`/<slug>`)
//   titulo    nombre del análisis
//   subtitulo una línea que lo describe
//   etiqueta  rótulo de categoría (mono, en mayúsculas)
//   accent    color de acento del tema (hex)
//   fuentes   procedencia en texto corto
//   load      import dinámico del .jsx del tema

const temas = [
  {
    id: "conflictos",
    slug: "conflictos",
    path: "/conflictos",
    titulo: "La calle arde",
    subtitulo: "Observatorio de la protesta cívica en Cuba · primer trimestre de 2026",
    etiqueta: "PROTESTA CÍVICA · OCC",
    accent: "#F2913B",
    fuentes: "Observatorio Cubano de Conflictos (OCC)",
    load: () => import("./conflictos_cuba.jsx"),
  },
  {
    id: "represion",
    slug: "represion",
    path: "/represion",
    titulo: "La maquinaria de la represión",
    subtitulo: "Observatorio de la represión en Cuba · foco abril–mayo 2026",
    etiqueta: "REPRESIÓN · DERECHOS HUMANOS",
    accent: "#C4392B",
    fuentes: "OCDH · Prisoners Defenders · prensa independiente cubana",
    load: () => import("./represion_cuba.jsx"),
  },
  {
    id: "gaesa",
    slug: "gaesa",
    path: "/gaesa",
    titulo: "Energía y GAESA",
    subtitulo:
      "El coste de los apagones frente a los activos líquidos del conglomerado militar",
    etiqueta: "ENERGÍA · CONTRAFACTUAL",
    accent: "#38D6C9",
    fuentes: "Escenario del autor sobre cifras públicas",
    load: () => import("./gaesa-escenario.jsx"),
  },
  {
    id: "rusificacion",
    slug: "rusificacion",
    path: "/rusificacion",
    titulo: "La rusificación de Cuba",
    subtitulo: "Mapa de la captura oligárquica del Estado",
    etiqueta: "RED DE PODER",
    accent: "#D4AE57",
    fuentes: "Periodismo de investigación y documentos oficiales",
    load: () => import("./rusificacion_cuba.jsx"),
  },
  {
    id: "himno",
    slug: "himno",
    path: "/himno",
    titulo: "Himno Patriótico Cubano",
    subtitulo: "El himno de Narciso López · 1850",
    etiqueta: "HISTORIA · SÍMBOLOS PATRIOS", // ⚠ CONFIRMAR
    accent: "rgb(80, 133, 230)",                        // ⚠ CONFIRMAR (oro de la partitura / la estrella)
    fuentes: "BNF/Gallica · Gay-Calbó (1945) · Heredia",  // ⚠ CONFIRMAR
    load: () => import("./himno_narciso.jsx"),
  },
  {
    id: "mineria",
    slug: "mineria",
    path: "/mineria",
    titulo: "El subsuelo y la crisis",
    subtitulo: "Reservas minerales de Cuba y la ruptura geopolítica de 2026",
    etiqueta: "RECURSOS MINERALES · GEOPOLÍTICA",
    accent: "#f54b08",
    fuentes: "USGS · Sherritt NI 43-101 · Antilles Gold JORC · GeoMinera",
    load: () => import("./mineria.jsx"),
  },
  {
    id: "libertad-prensa",
    slug: "libertad-prensa",
    path: "/libertad-prensa",
    titulo: "El cerco a la palabra",
    subtitulo: "Violaciones a la libertad de expresión y de prensa en Cuba — enero de 2026.",
    etiqueta: "LIBERTAD DE PRENSA · ICLEP", // ⚠ CONFIRMAR
    accent: "#2BB6A6",                       // ⚠ CONFIRMAR (turquesa del eyebrow)
    fuentes: "ICLEP · Instituto Cubano por la Libertad de Expresión y Prensa", // ⚠ CONFIRMAR
    dataSlug: "iclep", // el dataset es /data/iclep.json, no /data/libertad-prensa.json
    load: () => import("./iclep.jsx"),
  },
  {
    id: "racismo-estructural",
    slug: "racismo-estructural",
    path: "/racismo-estructural",
    titulo: "El racismo que el Estado niega",
    subtitulo: "Represión racializada de defensores afrodescendientes en Cuba — y sus ecos históricos.",
    etiqueta: "REPRESIÓN · RACISMO ESTRUCTURAL", // ⚠ CONFIRMAR
    accent: "#A33B4A",                            // ⚠ CONFIRMAR (garnet del título; alt: ochre #C9803E del eyebrow)
    fuentes: "Informe alternativo CERD 2026 · CRD · 4Métrica · Ciudadanía y Libertad", // ⚠ CONFIRMAR
    dataSlug: "racismo", // el dataset es /data/racismo.json, no /data/racismo-estructural.json
    load: () => import("./racismo.jsx"),
  },
  {
    id: "anatomia-11j",
    slug: "anatomia-11j",
    path: "/anatomia-11j",
    titulo: "La anatomía de la represión del 11J",
    subtitulo: "Quién pagó el precio de salir a la calle el 11 de julio de 2021",
    etiqueta: "REPRESIÓN · HISTORIA", // ⚠ CONFIRMAR
    accent: "#E3A52A",                // ⚠ CONFIRMAR (marigold dominante en la paleta)
    fuentes: "Justicia 11J / Cubalex", // ⚠ CONFIRMAR
    dataSlug: "11j", // el dataset es /data/11j.json, no /data/anatomia-11j.json
    load: () => import("./anatomia_11j.jsx"),
  },
  {
    id: "asesinatos-masacres",
    slug: "asesinatos-masacres",
    path: "/asesinatos-masacres",
    titulo: "Asesinatos y masacres de Estado",
    subtitulo: "Ejecuciones, hundimientos y muertes en huelga de hambre bajo el Estado cubano · 1959–2022",
    etiqueta: "MEMORIA · CRÍMENES DE ESTADO",
    accent: "#3F92B0",
    fuentes: "Archivo Cuba / Free Society Project · Proyecto de Verdad y Memoria",
    load: () => import("./asesinatos_masacres.jsx"),
  },
  {
    id: "desaparecidos-2023",
    slug: "desaparecidos-2023",
    path: "/desaparecidos-2023",
    titulo: "Los 79 de 2023",
    subtitulo: "Muertes y desapariciones documentadas en 2023 atribuidas al Estado cubano",
    etiqueta: "MEMORIA · VERDAD Y MEMORIA 2023",
    accent: "#FF6A00",
    fuentes: "Archivo Cuba & American Museum of the Cuban Diaspora · Verdad y Memoria",
    load: () => import("./desaparecidos_2023.jsx"),
  },
  {
    id: "servicio-militar",
    slug: "servicio-militar",
    path: "/servicio-militar",
    titulo: "Servir o morir",
    subtitulo: "El servicio militar obligatorio en Cuba: trata de personas con un costo letal",
    etiqueta: "DERECHOS · SERVICIO MILITAR",
    accent: "#33C27A",
    fuentes: "Maria C. Werlau · Archivo Cuba / Free Society Project",
    load: () => import("./servicio_militar.jsx"),
  },
  {
    id: "vias-cambio",
    slug: "vias-cambio",
    path: "/vias-cambio",
    titulo: "Vías de cambio: invasión, ley y evidencia",
    subtitulo: "Qué dice la evidencia sobre cómo caen los regímenes: resistencia civil frente a intervención armada",
    etiqueta: "VÍAS DE CAMBIO · EVIDENCIA",
    accent: "#157A72", // teal "voltaje" de la paleta congelada del renderer
    fuentes: "Chenoweth & Stephan (NAVCO) · CEPAL · Carta ONU · Horizonte Cubano (Columbia Law)", // ⚠ CONFIRMAR
    dataSlug: "vias_cambio", // el dataset es /data/vias_cambio.json (guion bajo), no /data/vias-cambio.json
    load: () => import("./vias_cambio.jsx"),
  },
  {
    id: "convocatoria-11j",
    slug: "convocatoria-11j",
    path: "/convocatoria-11j",
    titulo: "Mañana es 11J",
    subtitulo:
      "Quinto aniversario del 11J: dónde y a qué hora sale el mundo a la calle por Cuba, con cada convocatoria en su nivel de verificación",
    etiqueta: "CONVOCATORIA · 11 DE JULIO",
    accent: "#32BD4E", // verde señal de la paleta "Luz verde" del renderer congelado
    fuentes: "Prensa independiente cubana · Prisoners Defenders · Justicia 11J · OCDH",
    dataSlug: "convocatoria_11j", // el dataset es /data/convocatoria_11j.json (guion bajo)
    load: () => import("./convocatoria_11j.jsx"),
  },
  {
    id: "electrica",
    slug: "electrica",
    path: "/electrica",
    titulo: "La corriente interrumpida",
    subtitulo: "El sistema eléctrico cubano: de la electrificación de la isla al apagón permanente",
    etiqueta: "ENERGÍA · SISTEMA ELÉCTRICO NACIONAL",
    accent: "#3BA9E0", // azul de arco de la paleta "Arco voltaico" del renderer congelado
    fuentes: "Unión Eléctrica (UNE) · Horizonte Cubano (Columbia Law) · IEEE Spectrum · ONEI · prensa independiente",
    load: () => import("./electrica.jsx"),
  },

];

export default temas;
