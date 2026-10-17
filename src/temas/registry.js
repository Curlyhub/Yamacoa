// Manifiesto de temas: la única fuente de verdad del proyecto.
//
// Añadir un análisis nuevo es una entrada en este array (ver SKILLS.md): la
// portada (periodico/Portada.jsx) y el archivo (periodico/Expedientes.jsx) lo mapean a una tarjeta y el router (App.js)
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
//   publicado fecha de publicación (YYYY-MM-DD). La portada ordena por este
//             campo, de más reciente a más antiguo. NO es `meta.actualizado`
//             del dataset: aquel se mueve con cada /refrescar y haría saltar
//             expedientes viejos al primer puesto. Se fija una vez, al crear
//             el tema, y ya no se toca.
//   load      import dinámico del .jsx del tema
//
// El array es APPEND-ONLY: los temas nuevos se añaden al final y la portada
// los coloca en su sitio según `publicado`. No hace falta reordenar a mano.

const temas = [
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
    publicado: "2026-07-10",
    load: () => import("./convocatoria_11j.jsx"),
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
    publicado: "2026-06-30",
    load: () => import("./anatomia_11j.jsx"),
  },
  {
    id: "angola",
    slug: "angola",
    path: "/angola",
    titulo: "Cuba en Angola: la sangre y el negocio",
    subtitulo:
      "Medio siglo de una misma operación: el ejército (1975-1991) y los médicos (2007-hoy); quién cobró, quién pagó y cuántos no volvieron",
    etiqueta: "EXPEDIENTE · INTERNACIONALISMO",
    accent: "#6E9537", // oliva "Carlota" del renderer congelado
    fuentes: "Archivo Cuba (verificado) · Gleijeses · elTOQUE · Connectas · prensa independiente",
    publicado: "2026-07-11",
    load: () => import("./angola.jsx"),
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
    publicado: "2026-06-30",
    load: () => import("./represion_cuba.jsx"),
  },
  {
    id: "conflictos",
    slug: "conflictos",
    path: "/conflictos",
    titulo: "La calle arde",
    subtitulo: "Observatorio de la protesta cívica en Cuba · primer trimestre de 2026",
    etiqueta: "PROTESTA CÍVICA · OCC",
    accent: "#F2913B",
    fuentes: "Observatorio Cubano de Conflictos (OCC)",
    publicado: "2026-06-30",
    load: () => import("./conflictos_cuba.jsx"),
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
    publicado: "2026-06-30",
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
    publicado: "2026-06-30",
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
    publicado: "2026-06-30",
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
    publicado: "2026-06-30",
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
    publicado: "2026-06-30",
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
    publicado: "2026-06-30",
    load: () => import("./racismo.jsx"),
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
    publicado: "2026-07-05",
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
    publicado: "2026-07-05",
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
    publicado: "2026-07-05",
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
    publicado: "2026-07-05",
    load: () => import("./vias_cambio.jsx"),
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
    publicado: "2026-07-07",
    load: () => import("./electrica.jsx"),
  },
  {
    id: "medidas-176",
    slug: "medidas-176",
    path: "/medidas-176",
    titulo: "Las 176 medidas: anatomía de un ciclo",
    subtitulo:
      "Sesenta y seis años de aperturas anunciadas y reversiones ejecutadas, medidos contra los países que no revirtieron",
    etiqueta: "ECONOMÍA · CONTRAFACTUAL", // ⚠ CONFIRMAR
    accent: "#35C4A6",                     // ⚠ CONFIRMAR (menta "apertura" de la paleta del renderer)
    fuentes: "Maddison Project · CEPAL/FMI · Gacetas Oficiales · documento de las 176 medidas", // ⚠ CONFIRMAR
    dataSlug: "medidas_176", // el dataset es /data/medidas_176.json (guion bajo)
    publicado: "2026-07-14",
    load: () => import("./medidas_176.jsx"),
  },
  {
    id: "triana",
    slug: "triana",
    path: "/triana",
    titulo: "Triana en cifras",
    subtitulo:
      "Anatomía de una entrevista reformista: dónde acierta, dónde falla la aritmética y a quién se deja de nombrar",
    etiqueta: "ECONOMÍA · FACT-CHECK", // ⚠ CONFIRMAR
    accent: "#e9b23c",                  // ⚠ CONFIRMAR (oro dominante de la paleta del renderer)
    fuentes: "La Joven Cuba (entrevista) · Reuters · The Guardian · Wikipedia", // ⚠ CONFIRMAR
    dataSlug: "triana_reformas", // el dataset es /data/triana_reformas.json
    publicado: "2026-07-14",
    load: () => import("./triana_reformas.jsx"),
  },
  {
    id: "envejecimiento",
    slug: "envejecimiento",
    path: "/envejecimiento",
    titulo: "El rápido envejecimiento poblacional y la diáspora en Cuba",
    subtitulo:
      "Cómo el éxodo migratorio deformó la pirámide poblacional cubana, comparado con un escenario sin él",
    etiqueta: "DEMOGRAFÍA · DIÁSPORA",
    accent: "#A666D6", // violeta "Nido vacío" del renderer congelado
    fuentes: "ONEI · CBP · Naciones Unidas (World Population Prospects) · Albizu-Campos · ASIC",
    publicado: "2026-07-20",
    load: () => import("./envejecimiento.jsx"),
  },
  {
    id: "cayo-romano",
    slug: "cayo-romano",
    path: "/cayo-romano",
    titulo: "Cayo Romano vs Fondo Soberano Minero",
    subtitulo:
      "Qué vale de verdad el subsuelo cubano, y qué se cede a perpetuidad: el plan C40 medido contra un fondo soberano",
    etiqueta: "RECURSOS · CONTRAFACTUAL", // ⚠ CONFIRMAR
    accent: "#0E7C7B",                     // ⚠ CONFIRMAR (teal de la paleta C del renderer)
    fuentes: "USGS · Reuters · Antilles Gold · DevTech/Crespin · MovimientoC40", // ⚠ CONFIRMAR
    publicado: "2026-07-20",
    load: () => import("./cayo_romano.jsx"),
  },
  {
    id: "coraje-dividido",
    slug: "coraje-dividido",
    path: "/coraje-dividido",
    titulo: "Coraje dividido",
    subtitulo: "El valor de un pueblo y la fragmentación de su exilio, medidos",
    etiqueta: "EDICIÓN ESPECIAL · EXILIO", // ⚠ CONFIRMAR
    accent: "#C2497F",                      // ⚠ CONFIRMAR (magenta "exilio" de la paleta del renderer)
    fuentes: "elTOQUE · FIU Cuba Poll · Bendixen & Amandi/Miami Herald · OCC · Justicia 11J · 14ymedio", // ⚠ CONFIRMAR
    dataSlug: "coraje_dividido", // el dataset es /data/coraje_dividido.json (guion bajo)
    publicado: "2026-07-20",
    load: () => import("./coraje_dividido.jsx"),
  },
  {
    id: "desacreditacion",
    slug: "desacreditacion",
    path: "/desacreditacion",
    titulo: "La maquinaria de desacreditar",
    subtitulo:
      "Cómo se fabrica el descrédito de un opositor cubano: etiquetado coordinado, patologización pseudo-clínica y hostigamiento mediático, desde el oficialismo y desde el propio exilio.",
    etiqueta: "DISCURSO · TÁCTICAS DE REPRESIÓN",
    accent: "#AB69A8",
    fuentes: "Cubalex · ICLEP · CiberCuba · 14ymedio · Amnesty International · HRW · Freedom House",
    publicado: "2026-07-22",
    load: () => import("./desacreditacion.jsx"),
  },
  {
    id: "sucesion",
    slug: "sucesion",
    path: "/sucesion",
    titulo: "Sucesión sin urnas",
    subtitulo:
      "Tres hombres, un aparato: cómo se ha transferido el poder en Cuba desde 1959 — y por qué un hilo viral que lo explica con teología y psicología usa la herramienta equivocada.",
    etiqueta: "HISTORIA INSTITUCIONAL · PODER",
    accent: "#969933",
    fuentes: "Actas del PCC · ABC News · France24 · CNBC · Rotter (1966) · Weber (1904-05) · Redalyc/SciELO · Dialnet",
    publicado: "2026-07-22",
    load: () => import("./sucesion.jsx"),
  },
  {
    id: "protesta-solitaria",
    slug: "protesta-solitaria",
    path: "/protesta-solitaria",
    titulo: "Protestar solo",
    subtitulo:
      "El caso de Javier Ernesto Martín Gutiérrez, campeón cubano de MMA encarcelado tras nueve días de protesta pacífica frente a su casa, y el cargo de \"desórdenes públicos\" usado contra manifestantes solitarios en Cuba entre 2024 y 2026.",
    etiqueta: "REPRESIÓN · CRIMINALIZACIÓN DE LA PROTESTA",
    accent: "#6C60BE", // indigo "Vigilia y Sumario" del renderer congelado
    fuentes: "14ymedio · Martí Noticias · CiberCuba · Diario de Cuba · ICLEP · Prisoners Defenders",
    dataSlug: "protesta_solitaria", // el dataset es /data/protesta_solitaria.json (guion bajo)
    publicado: "2026-07-26",
    load: () => import("./protesta_solitaria.jsx"),
  },
  {
    id: "sulmira",
    slug: "sulmira",
    path: "/sulmira",
    titulo: "La voz que le prestaron",
    subtitulo:
      "Sulmira Martínez Pérez, \"Salem Cuba\", 21-22 años, condenada a 5 años de prisión por memes y llamados pacíficos a protestar en Facebook: la autoinculpación forzada que la televisión estatal transmitió como si fuera su propia voz.",
    etiqueta: "REPRESIÓN · PRESOS POLÍTICOS",
    accent: "#4E7A44",
    fuentes: "Prisoners Defenders · Cubalex · Alas Tensas · ICLEP · CiberCuba · Diario de Cuba",
    publicado: "2026-07-27",
    load: () => import("./sulmira.jsx"),
  },
  {
    id: "normas",
    slug: "normas",
    path: "/normas",
    titulo: "Reconstruir la norma",
    subtitulo:
      "Marginalidad, desciudadanización y las condiciones materiales del cambio cívico en Cuba",
    etiqueta: "SOCIEDAD · CULTURA CÍVICA",
    accent: "#2E9B87", // petróleo, color dominante del renderer congelado
    fuentes: "Literatura experimental sobre normas sociales (Science · PNAS · J-PAL) · OCDE · Banco Mundial · OCDH · Rojas · Pedraza",
    dataSlug: "reconstruccion-civica", // el dataset es /data/reconstruccion-civica.json
    publicado: "2026-07-28",
    load: () => import("./reconstruccion_civica.jsx"),
  },
  {
    id: "auditar",
    slug: "auditar",
    path: "/auditar",
    titulo: "Auditar a los aliados",
    subtitulo:
      "Evaluación crítica de la Propuesta para transformar la economía cubana",
    etiqueta: "ECONOMÍA · EVALUACIÓN DE PROPUESTAS",
    // El primario del renderer es bermellón #E8462C (h8), pero como accent de
    // portada queda a 3 grados de represion (#C4392B, h5) y cae en el rojo
    // reservado a represión por CLAUDE.md §4. El magenta de la misma paleta
    // (#C765A8, h319) tampoco sirve: queda a 16 grados de desacreditacion
    // (#AB69A8) y a 14 de #C2497F. Se usa el hueco real mayor de la rueda,
    // 48 grados libres entre h200 y h248. El bermellón se queda en la página.
    accent: "#4A63C8",
    fuentes: "ONEI · CEPAL · FMI · elTOQUE · EIU · Cuba Study Group",
    dataSlug: "propuesta-economica-auditoria", // el dataset es /data/propuesta-economica-auditoria.json
    publicado: "2026-07-28",
    load: () => import("./propuesta_economica_auditoria.jsx"),
  },
  {
    id: "cascada",
    slug: "cascada",
    path: "/cascada",
    titulo: "Del subsuelo al fondo: cuánto vale realmente el níquel cubano",
    subtitulo:
      "Anclaje empírico del multiplicador VAN/in-situ a partir del único activo minero cubano con estudio de factibilidad auditado",
    etiqueta: "MINERÍA · VALORACIÓN DE ACTIVOS", // ⚠ CONFIRMAR
    // Confirmado 29-jul-2026 al asentar la ficha en ops/design_log.json: acero
    // desaturado h235 (S30/L58), el único hueco libre del círculo (26°, entre
    // himno h218 y protesta-solitaria h248). Vecino del azul-bandera reservado
    // por CLAUDE.md §4, del que se separa por menos de la mitad de saturación.
    // La laterita #B1723E de la cascada NO sale a portada: se queda dentro.
    accent: "#7479B4",
    fuentes: "Informe técnico NI 43-101 del Moa JV (Micon International · CIM 2014)", // ⚠ CONFIRMAR
    dataSlug: "cascada-valor-minero", // el dataset es /data/cascada-valor-minero.json
    publicado: "2026-07-29",
    load: () => import("./cascada-valor-minero.jsx"),
  },
  {
    id: "fondo",
    slug: "fondo",
    path: "/fondo",
    titulo: "El fondo que aún no existe",
    subtitulo:
      "Marco para la creación de cualquier fondo soberano en una Cuba democrática",
    etiqueta: "EDICIÓN ESPECIAL · MARCO NORMATIVO", // ⚠ CONFIRMAR
    // Bronce oliva h73 (S30/L44), primario de la paleta del renderer. El círculo
    // está saturado: el margen real son 11° con sucesion (#969933, h62) y 12°
    // con angola (#6E9537, h85). Se separa de ambos por saturación (S30 frente
    // a S50 y S46). La ciruela #9B65A4 del renderer NO sale a portada.
    accent: "#83924F", // ⚠ CONFIRMAR
    fuentes: "NRGI · Transparencia Venezuela · Alaska Permanent Fund · fallos comparados (Alaska · Timor-Leste · Venezuela · Kazajistán)", // ⚠ CONFIRMAR
    dataSlug: "marco-fondo-soberano", // el dataset es /data/marco-fondo-soberano.json
    publicado: "2026-07-29",
    load: () => import("./marco-fondo-soberano.jsx"),
  },
  {
    id: "angel-veliz",
    slug: "angel-veliz",
    path: "/angel-veliz",
    titulo: "Movido tres veces, aliviado ninguna",
    subtitulo:
      "Ángel Jesús Véliz Marcano, preso del 11J en Camagüey, condenado a 6 años de prisión: tres traslados carcelarios entre 2021 y 2024, ninguno hacia el régimen de mínima severidad que le habría acercado a la libertad condicional, mientras su madre, exiliada desde 2024, ya no puede comunicarse con él por teléfono.",
    etiqueta: "REPRESIÓN · PRESOS POLÍTICOS",
    accent: "#71397F",
    fuentes: "Prisoners Defenders · CiberCuba · Cubanet · Diario de Cuba · Diario Las Américas · Martí Noticias · ADN Cuba",
    dataSlug: "angel_veliz", // el dataset es /data/angel_veliz.json (guion bajo)
    publicado: "2026-07-31",
    load: () => import("./angel_veliz.jsx"),
  },
  {
    id: "militarizacion",
    slug: "militarizacion",
    path: "/militarizacion",
    titulo: "Guerra sin declarar",
    subtitulo:
      "Desde el 17 de enero de 2026, estructuras militares gobiernan funciones civiles en Cuba sin que el Estado haya proclamado ninguna de las situaciones excepcionales que prevé su propia Constitución: 215 eventos documentados por Cubalex entre febrero y julio, un civil procesado por espionaje ante un tribunal militar y amenazas de muerte contra presos políticos.",
    etiqueta: "ESTADO Y DERECHO · MILITARIZACIÓN",
    accent: "#4D4068",
    fuentes: "Cubalex · CiberCuba · Martí Noticias · Diario de Cuba · 14ymedio · CubaNet · OCC",
    publicado: "2026-08-15",
    load: () => import("./militarizacion.jsx"),
  },
  {
    id: "derechos_sociales",
    slug: "derechos_sociales",
    path: "/derechos_sociales",
    titulo: "Julio sin tregua",
    subtitulo:
      "En julio de 2026, zonas periféricas de La Habana cumplieron tres meses sin agua potable, el sistema eléctrico colapsó por completo al menos tres veces y Cubalex contó nueve feminicidios, la cifra más alta de su serie mensual. El propio informe describe julio como el mes de mayor violencia ciudadana desde 2022 — pero, a diferencia de los feminicidios, esa cifra total no ha sido confirmada por una segunda fuente.",
    etiqueta: "DERECHOS SOCIALES · JULIO 2026",
    accent: "#3A5F4D",
    fuentes: "Cubalex · Cubanet · Alas Tensas · Diario de Cuba · 14ymedio · CiberCuba · Infobae · OnCubaNews",
    publicado: "2026-08-15",
    load: () => import("./derechos_sociales.jsx"),
  },
  {
    id: "cerco_julio",
    slug: "cerco_julio",
    path: "/cerco_julio",
    titulo: "El cerco de julio",
    subtitulo:
      "El 2 de julio de 2026, la Seguridad del Estado desplegó un operativo simultáneo contra activistas en varias provincias para impedirles asistir a un acto de la Embajada de Estados Unidos. Tres defensores de derechos humanos fueron incomunicados, golpeados y amenazados de muerte el mismo día. En paralelo, cuatro presos políticos salieron libres tras cumplir condena, mientras otros no sobrevivieron bajo custodia.",
    etiqueta: "REPRESIÓN · DEFENSORES DE DERECHOS HUMANOS",
    accent: "#D4BD2B",
    fuentes: "Cubalex · CiberCuba · Martí Noticias · Diario de Cuba · 14ymedio · Cubanet · ADN Cuba",
    publicado: "2026-08-15",
    load: () => import("./cerco_julio.jsx"),
  },
];

export default temas;
