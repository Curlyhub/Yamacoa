import { useState, useEffect, useMemo } from "react";
import * as d3 from "d3";
import { CUBA_PATHS, CUBA_VIEWBOX } from "./electrica_geo.js";
import { cargarFuentes } from "../design/tokens";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";

/* ──────────────────────────────────────────────────────────────────────────
   LA CORRIENTE INTERRUMPIDA — el sistema electroenergético nacional (SEN) de
   Cuba, de la electrificación de la isla al apagón permanente · 1958–2026.

   ARQUITECTURA: el renderizador está congelado. Todo el contenido editorial y
   las métricas viven en /data/electrica.json (lo reescribe el pipeline). Aquí
   sólo quedan la geometría de la isla, la paleta "Arco voltaico", los
   componentes y una copia incrustada de respaldo que se usa si el fetch falla
   (p. ej. al abrir el archivo suelto).

   NOTAS DE MÉTODO: las cifras son un piso ("al menos"), con su incertidumbre
   marcada en la UI. La comparación entre países es observacional, no causal;
   el cálculo de centros de datos es un escenario ilustrativo, no contabilidad.
   ────────────────────────────────────────────────────────────────────────── */

const DATA_URL =
  (typeof process !== "undefined" && process.env && process.env.PUBLIC_URL
    ? process.env.PUBLIC_URL
    : "") + "/data/electrica.json";

/* ════════ PALETA "ARCO VOLTAICO" — azul de arco, filamento y ascua ═════════ */
const C = {
  bg: "#efe8df",
  bg2: "#f5efe7",
  surface: "#fcf9f4",
  surface2: "#f5efe7",
  line: "#e2d8cc",
  ink: "#1f1a16",
  sub: "#6b5d50",
  faint: "#8a7a68",
  arc: "#1B76AD", // azul de arco: corriente viva, disponible
  arcSoft: "#1B76AD1c",
  arcBright: "#2A93CC",
  filament: "#A87410", // filamento incandescente
  filamentSoft: "#A874101c",
  ember: "#A42A1E", // ascua: déficit, sobrecarga, avería
  emberSoft: "#A42A1E1c",
  steel: "#5E7486",
  ok: "#12866A",
};
/* severidad de la señal por provincia (rampa de voltaje: corriente fría → ascua) */
const SEV = { alta: C.ember, media: C.filament, baja: C.arc };
const sevColor = (s) => SEV[s] || C.steel;

/* ════════ GEOMETRÍA — las provincias reales viven en ./electrica_geo.js ════
   (CUBA_PATHS/CUBA_VIEWBOX, extraídas del cuba.svg de MapSVG). El título de cada
   path se fusiona con la provincia del dataset para colorearla por `senal`. ══ */
const TITULO_A_NOMBRE = { "Ciudad de la Habana": "La Habana" };

/* ════════ RESPALDO INCRUSTADO (espejo de electrica.json) ═══════════════════ */
const EMBEDDED = {
  meta: {
    slug: "electrica",
    titulo: "La corriente interrumpida",
    subtitulo: "El sistema eléctrico cubano: de la electrificación de la isla al apagón permanente",
    ventana: "1958–2026",
    actualizado: "2026-07-06",
    fuentes: [
      "Unión Eléctrica (UNE) vía Cubadebate y Juventud Rebelde",
      "Horizonte Cubano (Columbia Law School)",
      "IEEE Spectrum · Cuba's Energy Crisis (2025)",
      "ONEI vía Diario de Cuba y El Periódico de la Energía",
      "CiberCuba · 14ymedio · elTOQUE · Cubanet · Infobae",
      "Wikipedia · 2024–2026 Cuba blackouts",
      "Banco Mundial · IEA · ICE (Costa Rica) · ONE (Rep. Dominicana)",
    ],
    nota: "Cifras 'al menos' y con su incertidumbre marcada. Distinción clave: 'termoeléctricas' en sentido estricto (plantas de vapor) generan ~40%; el ~80% fósil solo se alcanza sumando los motores diésel y fuel-oil de la generación distribuida.",
    descripcion: "Este expediente reconstruye la trayectoria del sistema electroenergético nacional (SEN) de Cuba desde vísperas de 1959 hasta julio de 2026, contrastando lo que se construyó con el estado actual de la red. En 1958 la isla tenía una capacidad instalada de entre 397 y 430 MW y una electrificación del 56% de la población, concentrada en las ciudades; según compilaciones de la época, Cuba figuraba entre los dos primeros países de América Latina en consumo eléctrico por habitante, aunque el ranking exacto (primero o segundo, tras o junto a Argentina) y la cifra per cápita concreta no pudieron verificarse contra la fuente primaria y se dejan como afirmación cualitativa. El 6 de agosto de 1960 el Estado nacionalizó la Compañía Cubana de Electricidad, que suministraba más del 90% de la electricidad vendida en el país. Entre los años sesenta y ochenta, con apoyo soviético, se construyeron la mayoría de las grandes termoeléctricas que aún hoy sostienen el sistema, y en 1992 el SEN alcanzó su pico documentado: 3.676 MW de capacidad interconectada y un 95% de electrificación. La caída de la URSS abrió el Período Especial: sin crudo subvencionado, el mantenimiento se volvió inviable. En 2005 y 2006 la llamada Revolución Energética apostó por miles de grupos electrógenos diésel y fuel-oil distribuidos (entre 2004 y 2020 se importaron más de 73.000), pero el alivio duró apenas unos cinco años. El estado actual es de crisis: la demanda pico ronda los 3.000 MW (rango observado 2.900–3.300), mientras la capacidad realmente disponible fluctúa a diario y se ha reportado desde 1.165 hasta 1.880 MW en 2025 y 2026. El déficit medio de 2025 fue de unos 1.531 MW según Horizonte Cubano (Columbia Law), con picos de hasta 2.054 MW. La producción anual de 2025 fue de 15.918 GWh, alrededor de un 25% por debajo de los 19.071 GWh de 2020, aunque con una leve recuperación frente a 2024 atribuible al aporte solar. La generación térmica fósil (termoeléctricas de vapor más motores diésel y fuel-oil) representa cerca del 80%; la mayor planta, la CTE Antonio Guiteras de Matanzas (330 MW, unos 38 años de explotación), encadenó 17 desconexiones del sistema a comienzos de julio de 2026. La mayoría de las termoeléctricas supera los 30 a 40 años, muy por encima de su vida útil de diseño. Los apagones diarios oscilan entre 12 y 20 horas como suelo, con picos documentados de hasta 30 horas en La Habana y hasta 87 horas continuas en Matanzas, y afectaciones simultáneas de entre el 54% y el 72% del territorio. Entre octubre de 2024 y julio de 2026 el país sufrió al menos seis apagones nacionales totales. La dependencia del combustible importado se agravó: en 2025 México fue el mayor proveedor (~44%), seguido de Venezuela (~34%) y Rusia (~15%), pero Venezuela cortó sus envíos por completo tras la captura de Nicolás Maduro en enero de 2026. La única señal de crecimiento es la solar fotovoltaica, que pasó de unos 298 MW a fin de 2024 a 1.084 MW a fin de 2025, con apoyo chino. El expediente cierra con dos ejercicios interpretativos, marcados como tales: una comparación de instantáneas entre Cuba y dos pares regionales que no vivieron la ruptura de 1959 (República Dominicana, con 5.950 MW instalados y 99,6% de electrificación, y Costa Rica, con 3.658 MW y una matriz más del 95% renovable), y un cálculo ilustrativo del coste de oportunidad de una Cuba con red estable y fiable para alojar centros de datos, sector para el que la fiabilidad de la red, el precio del kWh y la conectividad submarina son decisivos. No se afirma causalidad: la comparación entre países es observacional y las proyecciones son escenarios explícitos, no contabilidad.",
    narracion: "En vísperas de 1959, Cuba tenía una capacidad eléctrica de unos cuatrocientos megavatios y llegaba a algo más de la mitad de su población. Según recuentos de la época, estaba entre los dos primeros países de América Latina en consumo eléctrico por habitante. En 1960 el Estado nacionalizó la Compañía Cubana de Electricidad, que daba más del noventa por ciento de la electricidad del país. Entre los años sesenta y ochenta, con apoyo soviético, se levantaron casi todas las grandes termoeléctricas que hoy siguen sosteniendo la red. En 1992 el sistema tocó su techo: más de tres mil seiscientos megavatios y una cobertura del noventa y cinco por ciento. Después llegó el desplome. Con la caída de la Unión Soviética se acabó el petróleo barato y el mantenimiento se hizo imposible. En dos mil cinco se apostó por miles de plantas pequeñas de diésel repartidas por la isla, pero el respiro duró apenas cinco años. Hoy la demanda máxima ronda los tres mil megavatios, mientras la generación disponible cae muchos días por debajo de los dos mil. El déficit medio de 2025 fue de más de mil quinientos megavatios, con picos por encima de dos mil. La producción anual quedó cerca de un veinticinco por ciento por debajo de la de 2020. La mayoría de las plantas supera los treinta o cuarenta años de uso, muy por encima de su vida útil. La mayor de todas, la Antonio Guiteras, en Matanzas, se desconectó del sistema diecisiete veces solo en los primeros meses de 2026. Los apagones diarios van, como mínimo, de doce a veinte horas, y en algunas zonas han llegado a superar las ochenta horas seguidas. Entre octubre de 2024 y julio de 2026 hubo al menos seis apagones nacionales totales. La única señal de crecimiento es la energía solar, que pasó de unos trescientos a más de mil megavatios en un solo año. El expediente termina con dos ejercicios marcados como interpretativos. El primero compara a Cuba con dos vecinos que no vivieron la ruptura de 1959: República Dominicana y Costa Rica, hoy muy por delante en capacidad por habitante y en fiabilidad de la red. El segundo calcula, como escenario, cuánto podría rendir una Cuba con electricidad estable si alojara centros de datos, un negocio que exige exactamente lo que hoy falta: corriente continua, sin interrupciones. No se afirma ninguna causa: la comparación es observacional y las cuentas son un escenario, no una contabilidad.",
    narracion_en: "On the eve of 1959, Cuba had an electrical capacity of about four hundred megawatts and reached a little more than half of its population. According to accounts from that era, it ranked among the top two countries in Latin America in electricity consumption per person. In 1960 the state nationalized the Cuban Electric Company, which supplied more than ninety percent of the country's electricity. Between the sixties and the eighties, with Soviet support, nearly all of the large thermoelectric plants that still sustain the grid today were built. In 1992 the system reached its peak: more than three thousand six hundred megawatts of capacity and coverage of ninety-five percent. Then came the collapse. When the Soviet Union fell, cheap oil disappeared and maintenance became impossible. In two thousand five, the government bet on thousands of small diesel plants spread across the island, but the relief lasted barely five years. Today peak demand hovers around three thousand megawatts, while available generation falls many days below two thousand. The average deficit in 2025 was more than one thousand five hundred megawatts, with peaks above two thousand. Annual production ended up close to twenty-five percent below that of 2020. Most plants have been running for more than thirty or forty years, far beyond their designed working life. The largest of them all, the Antonio Guiteras plant in Matanzas, disconnected from the system seventeen times in just the first months of 2026. Daily blackouts run, at a minimum, from twelve to twenty hours, and in some areas they have gone on for more than eighty hours straight. Between October 2024 and July 2026 there were at least six total national blackouts. The only sign of growth is solar power, which went from about three hundred to more than one thousand megawatts in a single year. The file closes with two exercises explicitly marked as interpretive. The first compares Cuba with two neighbors that did not live through the rupture of 1959: the Dominican Republic and Costa Rica, both now far ahead in capacity per person and in grid reliability. The second calculates, as a scenario, how much a Cuba with stable electricity could earn by hosting data centers, a business that demands exactly what is missing today: continuous power, without interruptions. No cause is claimed: the comparison is observational and the figures are a scenario, not an accounting.",
  },
  kpis: [
    { id: "deficit", valor: 1550, sufijo: " MW", etiqueta: "Déficit medio diario (2025)", estado: "corroborado" },
    { id: "apagon", valor: "12–20+", sufijo: " h", etiqueta: "Apagón diario típico", estado: "corroborado" },
    { id: "cobertura", valor: 63, sufijo: " %", etiqueta: "Demanda cubierta en pico", estado: "estimacion" },
    { id: "solar", valor: 1084, sufijo: " MW", etiqueta: "Solar instalada (fin 2025)", estado: "corroborado" },
  ],
  historia: [
    { anio: 1958, hito: "Vísperas de 1959: 413 MW y 56% de cobertura", detalle: "Capacidad instalada de unos 397 a 430 MW y electrificación del 56%, concentrada en las ciudades. Cuba figuraba entre los dos primeros países de América Latina en consumo eléctrico por habitante (ranking exacto no verificado).", capacidadMW: 413, electrificacionPct: 56, fase: "prerevolucion" },
    { anio: 1960, hito: "Nacionalización de la Compañía Cubana de Electricidad", detalle: "El 6 de agosto de 1960 el Estado expropió la Compañía Cubana de Electricidad, que suministraba más del 90% de la electricidad vendida en el país.", capacidadMW: null, electrificacionPct: null, fase: "expansion-sovietica" },
    { anio: 1975, hito: "Expansión termoeléctrica con apoyo soviético", detalle: "Entre los años sesenta y ochenta se construyeron, con apoyo soviético, la mayoría de las grandes termoeléctricas que todavía hoy sostienen el sistema.", capacidadMW: null, electrificacionPct: null, fase: "expansion-sovietica" },
    { anio: 1991, hito: "Período Especial: se corta el crudo soviético", detalle: "La caída de la URSS eliminó el petróleo subvencionado; el mantenimiento se volvió inviable y comenzaron los apagones prolongados.", capacidadMW: null, electrificacionPct: null, fase: "periodo-especial" },
    { anio: 1992, hito: "Pico del SEN: 3.676 MW y 95% de cobertura", detalle: "El sistema alcanzó 3.676 MW de capacidad interconectada y una electrificación del 95%, justo cuando el combustible empezaba a faltar.", capacidadMW: 3676, electrificacionPct: 95, fase: "periodo-especial" },
    { anio: 2005, hito: "Revolución Energética: grupos electrógenos", detalle: "Se apostó por miles de grupos electrógenos diésel y fuel-oil distribuidos; entre 2004 y 2020 se importaron más de 73.000. El alivio duró unos cinco años.", capacidadMW: null, electrificacionPct: null, fase: "revolucion-energetica" },
    { anio: 2024, hito: "Colapsos totales del SEN", detalle: "Entre octubre de 2024 y julio de 2026 el sistema sufrió al menos seis apagones nacionales; la CTE Antonio Guiteras encadenó desconexiones.", capacidadMW: null, electrificacionPct: null, fase: "crisis" },
    { anio: 2025, hito: "Récord de solar y mínimo de crudo", detalle: "La capacidad solar pasó de unos 298 MW a 1.084 MW en un año, mientras la producción total (15.918 GWh) seguía un 25% por debajo de 2020 y Venezuela cortaba sus envíos en enero de 2026.", capacidadMW: null, electrificacionPct: 99, fase: "crisis" },
  ],
  trayectoria: {
    cortes: [
      { anio: 1958, label: "Vísperas de 1959", narrativa: "Una red pequeña pero de las más avanzadas de la región, con la mitad del país aún a oscuras." },
      { anio: 1992, label: "Pico del SEN", narrativa: "La electrificación llega al 95% y la capacidad se multiplica por nueve, justo cuando se corta el combustible soviético." },
      { anio: 2025, label: "Crisis", narrativa: "El acceso es casi universal sobre el papel, pero la capacidad disponible se ha desplomado por debajo de la de 1992 con más población y más demanda." },
    ],
    metricas: [
      { clave: "instalada", etiqueta: "Capacidad instalada", unidad: "MW", valores: { 1958: 413, 1992: 3676, 2025: 3000 }, estado: "2025 incierto: la placa nominal agregada del SEN no se publica; ~3.000 MW es el orden de magnitud citado en prensa." },
      { clave: "disponible", etiqueta: "Disponible en pico", unidad: "MW", valores: { 1958: 397, 1992: 3132, 2025: 1900 }, estado: "corroborado (2025 fluctúa 1.165–1.880 MW)" },
      { clave: "electrificacion", etiqueta: "Electrificación", unidad: "%", valores: { 1958: 56, 1992: 95, 2025: 99 }, estado: "corroborado" },
    ],
  },
  velocidad: {
    titular: "La velocidad, no el relato",
    nota: "Llegar del 56% (1958) al 95% de cobertura (finales de los ochenta) suele contarse como una hazaña de la Revolución. Pero el sistema ya se expandía deprisa: la capacidad instalada se multiplicó por 2,1 en solo siete años (1951–1958), un ritmo del ~11% anual compuesto. Con el subsidio soviético se sumaron MÁS megavatios en términos absolutos (~96 MW/año frente a ~30), pero a un ritmo relativo MENOR (~6,8% anual). Y el crecimiento de clientes conectados fue casi idéntico antes y después. Dos vecinos que no rompieron en 1959 —República Dominicana y Costa Rica— llegaron igual a la cobertura casi universal (ver 'El contrafactual').",
    caveat: "La cobertura en porcentaje se satura al acercarse al 100%, así que los últimos puntos porcentuales avanzan más despacio por aritmética, no por mérito. El anclaje de 1951 (189 MW) y las cifras de clientes provienen de compilaciones históricas de menor confianza; 397 MW (1958) y 3.676 MW (1992) están bien corroborados. El punto no es que no se construyera, sino que el ritmo previo a 1959 ya era rápido y no se aceleró después.",
    capacidad: [
      { periodo: "Antes de 1959", anios: "1951–1958", inicioMW: 189, finMW: 397, cagrPct: 11.2, mwPorAnio: 30, estado: "reconstruido" },
      { periodo: "Después de 1959", anios: "1958–1992", inicioMW: 397, finMW: 3676, cagrPct: 6.8, mwPorAnio: 96, estado: "corroborado" },
    ],
    clientes: [
      { periodo: "Antes de 1959", anios: "1955–1958", inicio: 667000, fin: 732400, cagrPct: 3.2, estado: "reconstruido" },
      { periodo: "Después de 1959", anios: "1958–1984", inicio: 732400, fin: 1633000, cagrPct: 3.1, estado: "reconstruido" },
    ],
  },
  capacidad: {
    instaladaMW: { valor: 3000, estado: "incierto", nota: "La prensa suele confundir la capacidad instalada nominal con la demanda pico; no hay cifra oficial reciente de placa agregada del SEN." },
    disponibleMW: { valor: 1900, min: 1165, max: 2000, estado: "corroborado", nota: "Fluctúa a diario; se han reportado desde 1.165 hasta 1.880 MW disponibles en 2025-2026." },
    demandaPicoMW: { valor: 3000, min: 2900, max: 3300, estado: "corroborado" },
    deficitTipicoMW: { valor: 1550, min: 1300, max: 2054, estado: "corroborado", nota: "Promedio de 2025 ~1.531 MW (Horizonte Cubano); picos de hasta ~2.054 MW." },
    produccionAnualGWh: { valor: 15918, estado: "corroborado", nota: "2025; alrededor de un 25% por debajo de los 19.071 GWh de 2020." },
    caidaProduccionPct: 25,
    antiguedadMediaAnios: 35,
    produccionSerie: [
      { anio: 2020, gwh: 19071 },
      { anio: 2021, gwh: 17966 },
      { anio: 2022, gwh: 15732 },
      { anio: 2023, gwh: 15331 },
      { anio: 2024, gwh: 14345 },
      { anio: 2025, gwh: 15918 },
    ],
  },
  generacion: [
    { fuente: "Termoeléctricas (vapor)", pct: 40.6, fosil: true, nota: "Las grandes plantas de los años 60-80; la mayoría supera los 30-40 años." },
    { fuente: "Motores fuel-oil", pct: 21.7, fosil: true },
    { fuente: "Motores diésel distribuidos", pct: 21.9, fosil: true, nota: "La generación distribuida de la Revolución Energética (2005-2006)." },
    { fuente: "Solar fotovoltaica", pct: 9.3, fosil: false, nota: "1.084 MW instalados a fin de 2025, en expansión con apoyo chino." },
    { fuente: "Hidro, biomasa, eólica y otras", pct: 6.5, fosil: false },
  ],
  provincias: [
    { id: "pinar", nombre: "Pinar del Río", senal: { 2025: "media", 2026: "alta" } },
    { id: "artemisa", nombre: "Artemisa", senal: { 2025: "media", 2026: "alta" }, nota: "CTE Máximo Gómez (Mariel), entre las más antiguas en explotación." },
    { id: "habana", nombre: "La Habana", senal: { 2025: "media", 2026: "media" }, nota: "Capital priorizada en el reparto; aun así se han reportado cortes de hasta 30 horas. CTE Otto Parellada (Tallapiedra), de las más viejas del SEN." },
    { id: "mayabeque", nombre: "Mayabeque", senal: { 2025: "alta", 2026: "alta" }, nota: "CTE Ernesto Guevara (Santa Cruz del Norte)." },
    { id: "matanzas", nombre: "Matanzas", senal: { 2025: "alta", 2026: "alta" }, plantas: [{ nombre: "CTE Antonio Guiteras", mw: 330, tipo: "Termoeléctrica de vapor", anio: 1988, estado: "La mayor del país (~38 años); 17 desconexiones del SEN en lo que va de 2026." }], nota: "Se han documentado apagones de hasta 87 horas continuas." },
    { id: "cienfuegos", nombre: "Cienfuegos", senal: { 2025: "media", 2026: "alta" }, nota: "CTE Carlos Manuel de Céspedes." },
    { id: "villaclara", nombre: "Villa Clara", senal: { 2025: "alta", 2026: "alta" } },
    { id: "sancti", nombre: "Sancti Spíritus", senal: { 2025: "alta", 2026: "alta" } },
    { id: "ciego", nombre: "Ciego de Ávila", senal: { 2025: "alta", 2026: "alta" } },
    { id: "camaguey", nombre: "Camagüey", senal: { 2025: "alta", 2026: "alta" }, nota: "CTE Diez de Octubre (Nuevitas)." },
    { id: "tunas", nombre: "Las Tunas", senal: { 2025: "alta", 2026: "alta" } },
    { id: "holguin", nombre: "Holguín", senal: { 2025: "alta", 2026: "alta" }, nota: "CTE Lidio Ramón Pérez (Felton), la termoeléctrica más nueva del país." },
    { id: "granma", nombre: "Granma", senal: { 2025: "alta", 2026: "alta" } },
    { id: "santiago", nombre: "Santiago de Cuba", senal: { 2025: "media", 2026: "alta" }, nota: "CTE Antonio Maceo (Renté)." },
    { id: "guantanamo", nombre: "Guantánamo", senal: { 2025: "alta", 2026: "alta" } },
  ],
  comparativa: {
    nota: "Instantáneas actuales, no una serie histórica continua (esa serie no pudo verificarse década a década). Los tres países partieron de una electrificación parcial parecida a mediados del siglo XX; hoy República Dominicana y Costa Rica tienen cobertura casi universal y mucha más capacidad por habitante, mientras Cuba retrocedió en términos relativos.",
    paises: [
      { pais: "Cuba", capacidadMW: 3000, disponibleMW: 1900, poblacionMill: 11.0, kwhPerCapita: 1414, electrificacionPct: 99, renovablePct: 8, estado: "disponible corroborado; instalada incierta" },
      { pais: "República Dominicana", capacidadMW: 5950, disponibleMW: null, poblacionMill: 10.7, kwhPerCapita: 2135, electrificacionPct: 99.6, renovablePct: 20, produccionGWh: 25397, estado: "corroborado" },
      { pais: "Costa Rica", capacidadMW: 3658, disponibleMW: null, poblacionMill: 5.2, kwhPerCapita: 1963, electrificacionPct: 100, renovablePct: 95, estado: "corroborado" },
    ],
  },
  radar: {
    ejes: [
      { clave: "capPerCapita", etiqueta: "Capacidad disponible / hab.", unidad: "W/hab", mejorEs: "alto", estado: "corroborado" },
      { clave: "consumoPerCapita", etiqueta: "Consumo / hab.", unidad: "kWh/hab", mejorEs: "alto", estado: "corroborado" },
      { clave: "electrificacion", etiqueta: "Electrificación", unidad: "%", mejorEs: "alto", estado: "corroborado" },
      { clave: "renovable", etiqueta: "Matriz renovable", unidad: "%", mejorEs: "alto", estado: "corroborado" },
      { clave: "fiabilidad", etiqueta: "Fiabilidad de la red", unidad: "índice 0-100", mejorEs: "alto", estado: "estimacion" },
    ],
    series: [
      { pais: "Cuba", valores: { capPerCapita: 173, consumoPerCapita: 1414, electrificacion: 99, renovable: 8, fiabilidad: 35 } },
      { pais: "República Dominicana", valores: { capPerCapita: 556, consumoPerCapita: 2135, electrificacion: 99.6, renovable: 20, fiabilidad: 82 } },
      { pais: "Costa Rica", valores: { capPerCapita: 703, consumoPerCapita: 1963, electrificacion: 100, renovable: 95, fiabilidad: 90 } },
      { pais: "Cuba (escenario de pares)", hipotetico: true, nota: "Escenario ilustrativo, no dato: Cuba si hubiera seguido la trayectoria media de sus pares regionales.", valores: { capPerCapita: 630, consumoPerCapita: 2049, electrificacion: 99.8, renovable: 57.5, fiabilidad: 86 } },
    ],
  },
  apagones: {
    unidad: "horas sin electricidad al día",
    estado: "estimacion",
    nota: "Reconstrucción ilustrativa a partir de los rangos documentados por la prensa independiente (mínimo, típico y picos), NO un censo. La Habana suele estar priorizada; Matanzas concentra los extremos, con cortes documentados de hasta 87 horas continuas.",
    grupos: [
      { label: "La Habana (priorizada)", valores: [3, 4, 5, 5, 6, 6, 7, 8, 8, 9, 10, 11, 12, 14, 16, 20] },
      { label: "Occidente", valores: [6, 7, 8, 9, 10, 10, 11, 12, 12, 13, 14, 15, 16, 18, 20, 22] },
      { label: "Centro", valores: [8, 10, 11, 12, 13, 14, 15, 15, 16, 17, 18, 19, 20, 21, 22, 24] },
      { label: "Oriente", valores: [10, 12, 13, 14, 15, 16, 17, 18, 18, 19, 20, 21, 22, 23, 24, 26] },
      { label: "Matanzas (extremos)", valores: [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 36, 48, 60, 72, 84, 87], nota: "Incluye el pico documentado de 87 horas continuas." },
    ],
  },
  centrosDatos: {
    consumoDataCenterMW: { valor: 70, min: 40, max: 100, estado: "corroborado", nota: "Rango de un centro de datos hyperscale mediano; los mayores superan los 500 MW." },
    precioKWhIndustrialUSD: { valor: 0.12, min: 0.08, max: 0.15, estado: "estimacion", nota: "Tarifa industrial de referencia en la región (Brasil ~US$0,128/kWh; mercados con centros de datos US$0,12–0,18/kWh; Paraguay ~US$0,045). Cuba no publica una tarifa industrial comparable." },
    empleosPorDataCenter: { valor: 60, min: 30, max: 200, estado: "estimacion", nota: "Empleo directo típico; el impacto mayor es indirecto y en la fase de construcción." },
    inversionPorDataCenterUSD: { valor: 500000000, min: 100000000, max: 1000000000, estado: "corroborado", nota: "Referencia: Google invirtió US$500 millones en un 'digital port' en República Dominicana. El capex por centro varía con el tamaño (US$100M–US$1.000M en el rango); no incluye la generación que lo alimenta." },
    costeSolar: { anioInicial: 2010, anioActual: 2025, lcoeInicialUSD: 0.38, lcoeActualUSD: 0.058, caidaPct: 85, estado: "corroborado", nota: "El coste nivelado (LCOE) de la solar fotovoltaica a gran escala cayó ~80–85% entre 2010 y 2025 (de ~US$0,38 a ~US$0,058/kWh; el sistema completo pasó de ~US$2,5 a ~US$1 por vatio). Construir hoy capacidad fiable —sobre todo solar— es mucho más barato que cuando Cuba quedó fuera del ciclo de inversión: es un coste que lleva más de una década bajando." },
    fuentesCalculo: [
      "Precio del kWh industrial: GlobalPetrolPrices y Statista — tarifas industriales/comerciales de América Latina, 2025.",
      "Caída del coste de la solar: IRENA y NREL — LCOE fotovoltaico a gran escala −80–85% desde 2010 (~US$0,38 → ~US$0,058/kWh).",
      "Inversión por centro de datos: referencia pública de Google (US$500M) en República Dominicana.",
    ],
    supuestos: [
      "El cálculo asume una Cuba con red estable y fiable, cables submarinos redundantes y marco jurídico previsible: hoy no se cumple ninguna de las tres condiciones.",
      "Los ingresos se estiman como energía vendida (MW × 8.760 h × precio industrial), no como beneficio neto del operador.",
      "Un centro de datos exige suministro continuo 24/7; la red cubana no puede garantizar hoy ni la demanda residencial en hora pico.",
      "No existe una cifra pública de inversión en centros de datos que Cuba haya dejado de captar; el ejercicio ilustra un orden de magnitud, no una contabilidad.",
    ],
    referenciasRegion: [
      { lugar: "República Dominicana", mw: null, nota: "Google invirtió US$500M en un 'digital port' con cable submarino directo a EE.UU." },
      { lugar: "Panamá", mw: 5, nota: "Sparkle (Telecom Italia) opera un centro con ~600 gabinetes y carga TI de ~5 MW." },
      { lugar: "Puerto Rico", mw: null, nota: "Al menos ocho instalaciones registradas y varios cables submarinos con redundancia." },
    ],
  },
};

/* ════════ HELPERS ══════════════════════════════════════════════════════════ */
const fmt = (n) => (n == null ? "—" : n.toLocaleString("es-ES"));
const fmt0 = (n) => (n == null ? "—" : Math.round(n).toLocaleString("es-ES"));
const usd = (n) => {
  if (n == null) return "—";
  if (n >= 1e9) return "US$" + (n / 1e9).toLocaleString("es-ES", { maximumFractionDigits: 1 }) + " mil M";
  if (n >= 1e6) return "US$" + (n / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 0 }) + " M";
  return "US$" + fmt0(n);
};
const estadoColor = (e) => (e === "corroborado" ? C.arc : e === "incierto" ? C.filament : C.steel);
const estadoLabel = (e) => (e === "corroborado" ? "corroborado" : e === "incierto" ? "incierto" : e === "reconstruido" ? "reconstruido" : "estimación");

function useFonts() {
  useEffect(() => {
    cargarFuentes();
  }, []);
}

function useData() {
  const [data, setData] = useState(EMBEDDED);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(DATA_URL, { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();
        if (alive && j && j.capacidad && j.apagones) setData(j);
      } catch (_) { /* respaldo incrustado */ }
    })();
    return () => { alive = false; };
  }, []);
  return data;
}

/* ════════ ÁTOMOS ═══════════════════════════════════════════════════════════ */
function Eyebrow({ children, color = C.arc }) {
  return <div style={{ font: "600 11px/1 'IBM Plex Mono', monospace", letterSpacing: "0.22em", textTransform: "uppercase", color, marginBottom: 14 }}>{children}</div>;
}
function Card({ children, style }) {
  return <div style={{ background: C.surface, border: 0, boxShadow: "var(--y-shadow)", borderRadius: 24, padding: "24px 26px 28px", ...style }}>{children}</div>;
}
function H2({ kicker, title, kc = C.arc }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Eyebrow color={kc}>{kicker}</Eyebrow>
      <h2 style={{ font: "800 24px/1.12 Manrope, sans-serif", color: C.ink, margin: 0, letterSpacing: "-0.01em" }}>{title}</h2>
    </div>
  );
}
function Legend({ items }) {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
      {items.map(([label, color]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 11, height: 11, background: color, borderRadius: 2, display: "inline-block" }} />
          <span style={{ font: "500 12px 'IBM Plex Mono', monospace", color: C.sub }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
function Badge({ estado }) {
  if (!estado) return null;
  const c = estadoColor(estado);
  return <span style={{ font: "600 9px 'IBM Plex Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", color: c, border: `1px solid ${c}55`, background: c + "14", padding: "2px 7px", borderRadius: 3, whiteSpace: "nowrap" }}>{estadoLabel(estado)}</span>;
}
function Note({ children }) {
  return <p style={{ font: "400 11.5px/1.55 'IBM Plex Mono', monospace", color: C.faint, margin: "12px 0 0" }}>{children}</p>;
}

/* ════════ MEDIDOR RADIAL — el voltímetro del déficit (firma) ═══════════════ */
function Gauge({ demanda, disponible }) {
  const size = 240, cx = size / 2, cy = size / 2 + 10, r1 = 96, r0 = 70;
  const START = -135 * (Math.PI / 180);
  const END = 135 * (Math.PI / 180);
  const total = END - START;
  const frac = Math.max(0, Math.min(1, disponible / demanda));
  const arcGen = (s, e) => d3.arc().innerRadius(r0).outerRadius(r1).startAngle(s).endAngle(e).cornerRadius(3)();
  const track = arcGen(START, END);
  const filled = arcGen(START, START + total * frac);
  const deficit = demanda - disponible;
  const deficitPct = Math.round((deficit / demanda) * 100);
  // ticks
  const ticks = d3.range(0, demanda + 1, 500);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: 300 }}>
        <defs>
          <linearGradient id="gaugeFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C.arc} />
            <stop offset="100%" stopColor={C.arcBright} />
          </linearGradient>
        </defs>
        <path d={track} transform={`translate(${cx},${cy})`} fill={C.ember + "22"} stroke={C.ember + "55"} strokeWidth={1} />
        <path d={filled} transform={`translate(${cx},${cy})`} fill="url(#gaugeFill)" />
        {ticks.map((t) => {
          const a = START + total * (t / demanda) - Math.PI / 2;
          const x1 = cx + Math.cos(a) * (r1 + 4), y1 = cy + Math.sin(a) * (r1 + 4);
          const x2 = cx + Math.cos(a) * (r1 + 10), y2 = cy + Math.sin(a) * (r1 + 10);
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.faint} strokeWidth={1} />;
        })}
        <text x={cx} y={cy - 14} textAnchor="middle" style={{ font: "800 40px Manrope, sans-serif", fill: C.ember }}>{deficitPct}%</text>
        <text x={cx} y={cy + 6} textAnchor="middle" style={{ font: "600 11px 'IBM Plex Mono', monospace", fill: C.sub, letterSpacing: "0.08em" }}>DE LA DEMANDA</text>
        <text x={cx} y={cy + 22} textAnchor="middle" style={{ font: "600 11px 'IBM Plex Mono', monospace", fill: C.sub, letterSpacing: "0.08em" }}>SIN CUBRIR</text>
        <text x={cx - 78} y={cy + 40} textAnchor="middle" style={{ font: "500 10px 'IBM Plex Mono', monospace", fill: C.faint }}>0</text>
        <text x={cx + 78} y={cy + 40} textAnchor="middle" style={{ font: "500 10px 'IBM Plex Mono', monospace", fill: C.faint }}>{fmt(demanda)}</text>
      </svg>
      <div style={{ display: "flex", gap: 22, marginTop: 4 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ font: "800 22px Manrope, sans-serif", color: C.arc }}>{fmt(disponible)}</div>
          <div style={{ font: "500 10px 'IBM Plex Mono', monospace", color: C.faint, marginTop: 3 }}>MW disponibles</div>
        </div>
        <div style={{ width: 1, background: C.line }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ font: "800 22px Manrope, sans-serif", color: C.ember }}>{fmt(deficit)}</div>
          <div style={{ font: "500 10px 'IBM Plex Mono', monospace", color: C.faint, marginTop: 3 }}>MW de déficit</div>
        </div>
      </div>
    </div>
  );
}

/* ════════ SLOPE CHART — la trayectoria del SEN ════════════════════════════ */
function SlopeChart({ trayectoria }) {
  const W = 720, H = 340, mL = 60, mR = 150, mT = 30, mB = 40;
  const cortes = trayectoria.cortes;
  const metricas = trayectoria.metricas;
  const xs = cortes.map((_, i) => mL + (i / (cortes.length - 1)) * (W - mL - mR));
  const colorFor = (clave) => (clave === "disponible" ? C.arc : clave === "instalada" ? C.filament : C.steel);
  const y = (v) => mT + (1 - v) * (H - mT - mB); // v normalizado 0..1 por métrica
  const rows = metricas.map((m) => {
    const vals = cortes.map((c) => m.valores[c.anio]);
    const lo = Math.min(...vals), hi = Math.max(...vals);
    const norm = vals.map((v) => (hi === lo ? 0.5 : (v - lo) / (hi - lo)));
    return { m, vals, norm };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {cortes.map((c, i) => (
        <g key={c.anio}>
          <line x1={xs[i]} y1={mT - 8} x2={xs[i]} y2={H - mB} stroke={C.line} strokeWidth={1} />
          <text x={xs[i]} y={H - mB + 20} textAnchor="middle" style={{ font: "700 13px Manrope, sans-serif", fill: C.ink }}>{c.anio}</text>
          <text x={xs[i]} y={H - mB + 34} textAnchor="middle" style={{ font: "500 10px 'IBM Plex Mono', monospace", fill: C.faint }}>{c.label}</text>
        </g>
      ))}
      {rows.map(({ m, vals, norm }) => {
        const col = colorFor(m.clave);
        const pts = norm.map((n, i) => [xs[i], y(n)]);
        const d = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0] + "," + p[1]).join(" ");
        return (
          <g key={m.clave}>
            <path d={d} fill="none" stroke={col} strokeWidth={2.5} />
            {pts.map((p, i) => (
              <g key={i}>
                <circle cx={p[0]} cy={p[1]} r={4} fill={col} stroke={C.bg} strokeWidth={1.5} />
                <text x={p[0]} y={p[1] - 10} textAnchor="middle" style={{ font: "600 11px 'IBM Plex Mono', monospace", fill: col }}>{fmt(vals[i])}</text>
              </g>
            ))}
            <text x={W - mR + 12} y={y(norm[norm.length - 1]) + 4} style={{ font: "600 12px Manrope, sans-serif", fill: col }}>{m.etiqueta}</text>
            <text x={W - mR + 12} y={y(norm[norm.length - 1]) + 19} style={{ font: "500 10px 'IBM Plex Mono', monospace", fill: C.faint }}>{m.unidad}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ════════ MAPA — coropleta provincial (cuba.svg de MapSVG) ═════════════════ */
const provByTitle = (provincias, title) => {
  const nombre = TITULO_A_NOMBRE[title] || title;
  return provincias.find((p) => p.nombre === nombre) || null;
};
const sevFill = (base, sev) => base + (sev === "alta" ? "e0" : sev === "media" ? "b0" : "88");
function CubaMap({ provincias, periodo, onHover, activo }) {
  return (
    <svg viewBox={CUBA_VIEWBOX} style={{ width: "100%", height: "auto", display: "block" }} aria-label="Mapa de Cuba por provincia">
      {CUBA_PATHS.map((path) => {
        const p = provByTitle(provincias, path.title);
        const sev = p ? p.senal[periodo] : null;
        const base = p ? sevColor(sev) : C.steel;
        const on = activo && p && activo.id === p.id;
        const planta = !!(p && p.plantas);
        return (
          <path
            key={path.id}
            d={path.d}
            fill={p ? (on ? base : sevFill(base, sev)) : "#e6ddd1"}
            stroke={on ? C.ink : planta ? C.ink + "aa" : C.bg}
            strokeWidth={on ? 1.5 : planta ? 1.1 : 0.7}
            strokeDasharray={planta && !on ? "2.5 2" : "0"}
            style={{ cursor: p ? "pointer" : "default", transition: "fill .3s, stroke .2s" }}
            onMouseEnter={() => p && onHover && onHover(p)}
            onMouseLeave={() => onHover && onHover(null)}
          >
            <title>{path.title}{p ? ` — señal ${sev}` : " — sin dato"}</title>
          </path>
        );
      })}
    </svg>
  );
}

/* ════════ RIDGELINE — distribución de horas de apagón (KDE) ════════════════ */
function kde(values, xs, bw) {
  const k = (u) => Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
  return xs.map((x) => d3.mean(values, (v) => k((x - v) / bw)) / bw);
}
function Ridgeline({ apagones }) {
  const grupos = apagones.grupos;
  const W = 720, mL = 142, mR = 24, mB = 40;
  const domainMax = 90;
  const xs = useMemo(() => d3.range(0, domainMax + 0.1, 1.5), []);
  const rows = grupos.map((gr) => ({ label: gr.label, dens: kde(gr.valores, xs, 4.5), median: d3.median(gr.valores) }));
  const globalMax = d3.max(rows, (r) => d3.max(r.dens)) || 1;
  // Espaciado de líneas base y alto máximo de cresta desacoplados: cada cresta
  // sube como mucho `peakScale` px y solapa la de arriba, pero el lienzo reserva
  // `topPad` para que la cima superior NUNCA se corte.
  const n = grupos.length;
  const rowGap = 60;      // separación entre líneas base
  const peakScale = 96;   // alto en px de la cresta más alta (densidad global máx.)
  const topPad = peakScale + 16;
  const H = topPad + (n - 1) * rowGap + mB;
  const xScale = (h) => mL + (h / domainMax) * (W - mL - mR);
  const baseYof = (i) => topPad + i * rowGap;
  const colorFor = (med) => d3.interpolateRgb(C.arc, C.ember)(Math.min(1, med / 40));
  const gridHrs = [0, 12, 24, 48, 72, 87];
  const gridTop = Math.max(6, baseYof(0) - peakScale - 6);
  const gridBottom = baseYof(n - 1) + 6;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {gridHrs.map((h) => (
        <g key={h}>
          <line x1={xScale(h)} y1={gridTop} x2={xScale(h)} y2={gridBottom} stroke={C.line} strokeWidth={h === 87 ? 1 : 0.75} strokeDasharray={h === 87 ? "3 3" : "0"} />
          <text x={xScale(h)} y={gridBottom + 20} textAnchor="middle" style={{ font: "500 10px 'IBM Plex Mono', monospace", fill: h === 87 ? C.ember : C.faint }}>{h === 87 ? "87h" : h + "h"}</text>
        </g>
      ))}
      {/* Se dibuja de arriba (fondo) a abajo (frente) para que las crestas delanteras solapen a las traseras. */}
      {rows.map((r, i) => {
        const baseY = baseYof(i);
        const col = colorFor(r.median);
        const pts = r.dens.map((d, k) => [xScale(xs[k]), baseY - (d / globalMax) * peakScale]);
        const area = "M" + xScale(0) + "," + baseY + " " + pts.map((p) => "L" + p[0] + "," + p[1]).join(" ") + " L" + xScale(domainMax) + "," + baseY + " Z";
        const line = "M" + pts.map((p) => p[0] + "," + p[1]).join(" L");
        return (
          <g key={r.label}>
            <path d={area} fill={col} fillOpacity={0.23} />
            <path d={line} fill="none" stroke={col} strokeWidth={1.7} />
            <line x1={mL} y1={baseY} x2={W - mR} y2={baseY} stroke={C.line} strokeWidth={0.5} />
            <text x={mL - 12} y={baseY - 4} textAnchor="end" style={{ font: "600 11px Manrope, sans-serif", fill: C.ink }}>{r.label}</text>
            <text x={xScale(r.median) + 4} y={baseY - (d3.max(r.dens) / globalMax) * peakScale - 5} textAnchor="middle" style={{ font: "600 10px 'IBM Plex Mono', monospace", fill: col }}>~{Math.round(r.median)}h</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ════════ PARALLEL COORDINATES — Cuba vs pares regionales ══════════════════ */
function Parallel({ radar }) {
  const W = 720, H = 380, mL = 20, mR = 20, mT = 46, mB = 60;
  const ejes = radar.ejes;
  const series = radar.series;
  const [hover, setHover] = useState(null);
  const axX = ejes.map((_, i) => mL + (i / (ejes.length - 1)) * (W - mL - mR));
  const domains = ejes.map((e) => {
    const vals = series.map((s) => s.valores[e.clave]);
    return [Math.min(...vals) * 0.85, Math.max(...vals)];
  });
  const y = (ejeIdx, v) => {
    const [lo, hi] = domains[ejeIdx];
    const t = hi === lo ? 0.5 : (v - lo) / (hi - lo);
    return (H - mB) - t * (H - mT - mB);
  };
  const colorFor = (s) => {
    if (s.pais === "Cuba") return C.ember;
    if (s.hipotetico) return C.filament;
    if (s.pais === "Costa Rica") return C.ok;
    return C.arc;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} onMouseLeave={() => setHover(null)}>
      {ejes.map((e, i) => (
        <g key={e.clave}>
          <line x1={axX[i]} y1={mT} x2={axX[i]} y2={H - mB} stroke={C.line} strokeWidth={1} />
          <text x={axX[i]} y={mT - 22} textAnchor={i === 0 ? "start" : i === ejes.length - 1 ? "end" : "middle"} style={{ font: "600 10.5px Manrope, sans-serif", fill: C.sub }}>{e.etiqueta}</text>
          <text x={axX[i]} y={mT - 9} textAnchor={i === 0 ? "start" : i === ejes.length - 1 ? "end" : "middle"} style={{ font: "500 9px 'IBM Plex Mono', monospace", fill: C.faint }}>{e.unidad}</text>
          <text x={axX[i]} y={H - mB + 15} textAnchor={i === 0 ? "start" : i === ejes.length - 1 ? "end" : "middle"} style={{ font: "500 9px 'IBM Plex Mono', monospace", fill: C.faint }}>{fmt0(domains[i][0])}</text>
          <text x={axX[i]} y={mT + 10} textAnchor={i === 0 ? "start" : i === ejes.length - 1 ? "end" : "middle"} style={{ font: "500 9px 'IBM Plex Mono', monospace", fill: C.faint }}>{fmt0(domains[i][1])}</text>
        </g>
      ))}
      {series.map((s, si) => {
        const col = colorFor(s);
        const dim = hover != null && hover !== si;
        const pts = ejes.map((e, i) => [axX[i], y(i, s.valores[e.clave])]);
        const d = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0] + "," + p[1]).join(" ");
        return (
          <g key={s.pais} onMouseEnter={() => setHover(si)} style={{ cursor: "pointer", opacity: dim ? 0.18 : 1, transition: "opacity .15s" }}>
            <path d={d} fill="none" stroke={col} strokeWidth={s.pais === "Cuba" ? 3 : 2} strokeDasharray={s.hipotetico ? "6 4" : "0"} />
            {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3.2} fill={col} />)}
          </g>
        );
      })}
      {/* leyenda */}
      {series.map((s, si) => {
        const col = colorFor(s);
        const lx = mL + si * 175;
        return (
          <g key={"lg" + s.pais} transform={`translate(${lx},${H - 20})`} onMouseEnter={() => setHover(si)} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }}>
            <line x1={0} y1={-4} x2={16} y2={-4} stroke={col} strokeWidth={s.pais === "Cuba" ? 3 : 2} strokeDasharray={s.hipotetico ? "5 3" : "0"} />
            <text x={20} y={0} style={{ font: "500 10px 'IBM Plex Mono', monospace", fill: hover === si ? C.ink : C.sub }}>{s.pais}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ════════ TAB · GÉNESIS ════════════════════════════════════════════════════ */
const FASE_LABEL = {
  prerevolucion: "Antes de 1959",
  "expansion-sovietica": "Expansión soviética",
  "periodo-especial": "Período Especial",
  "revolucion-energetica": "Revolución Energética",
  crisis: "Crisis",
};
const FASE_COLOR = {
  prerevolucion: C.steel,
  "expansion-sovietica": C.arc,
  "periodo-especial": C.filament,
  "revolucion-energetica": C.filament,
  crisis: C.ember,
};
/* ════════ VELOCIDAD — el ritmo, no el volumen (pre vs post 1959) ═══════════ */
function PairedRow({ label, unidad, pre, post, maxV, fmtV, ganaPre, nota }) {
  const w = (v) => `${Math.max(2, (v / maxV) * 100)}%`;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ font: "600 13px Manrope, sans-serif", color: C.ink }}>{label}</span>
        <span style={{ font: "500 10px 'IBM Plex Mono', monospace", color: C.faint }}>{unidad}</span>
      </div>
      {[{ v: pre, c: C.filament, l: "Antes de 1959", win: ganaPre }, { v: post, c: C.arc, l: "Después de 1959", win: !ganaPre }].map((b) => (
        <div key={b.l} style={{ display: "grid", gridTemplateColumns: "116px 1fr 64px", alignItems: "center", gap: 10, marginBottom: 6 }} className="pr-row">
          <span style={{ font: "500 11px 'IBM Plex Mono', monospace", color: C.sub }}>{b.l}</span>
          <div style={{ height: 20, background: C.bg2, borderRadius: 3, overflow: "hidden", border: `1px solid ${C.line}` }}>
            <div style={{ height: "100%", width: w(b.v), background: b.win ? `linear-gradient(90deg, ${b.c}, ${b.c}bb)` : b.c + "66", transition: "width .5s" }} />
          </div>
          <span style={{ font: "700 13px 'IBM Plex Mono', monospace", color: b.win ? b.c : C.sub, textAlign: "right" }}>{fmtV(b.v)}</span>
        </div>
      ))}
      {nota && <div style={{ font: "400 11px/1.5 'IBM Plex Mono', monospace", color: C.faint, marginTop: 4 }}>{nota}</div>}
    </div>
  );
}
function Velocidad({ velocidad }) {
  const cap = velocidad.capacidad;
  const cli = velocidad.clientes;
  const pre = cap.find((c) => c.periodo.includes("Antes")) || cap[0];
  const post = cap.find((c) => c.periodo.includes("Después")) || cap[1];
  const preCli = cli.find((c) => c.periodo.includes("Antes")) || cli[0];
  const postCli = cli.find((c) => c.periodo.includes("Después")) || cli[1];
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <H2 kicker="El ritmo antes y después de 1959" title={velocidad.titular} kc={C.filament} />
        <Badge estado="reconstruido" />
      </div>
      <p style={{ color: C.sub, font: "400 14px/1.65 Manrope, sans-serif", margin: "0 0 20px", maxWidth: 700 }}>{velocidad.nota}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }} className="vel-grid">
        <div>
          <PairedRow label="Ritmo de la capacidad instalada" unidad="% anual compuesto" pre={pre.cagrPct} post={post.cagrPct} maxV={Math.max(pre.cagrPct, post.cagrPct)} fmtV={(v) => "+" + v.toLocaleString("es-ES") + "%"} ganaPre={pre.cagrPct > post.cagrPct} nota={`${pre.anios} vs ${post.anios} — el ritmo del 50 fue MÁS rápido.`} />
          <PairedRow label="Megavatios sumados por año" unidad="MW / año (absoluto)" pre={pre.mwPorAnio} post={post.mwPorAnio} maxV={Math.max(pre.mwPorAnio, post.mwPorAnio)} fmtV={(v) => "~" + v} ganaPre={pre.mwPorAnio > post.mwPorAnio} nota="En volumen absoluto sí se sumó más tras 1959 (subsidio soviético)." />
        </div>
        <div>
          <PairedRow label="Clientes conectados" unidad="% anual compuesto" pre={preCli.cagrPct} post={postCli.cagrPct} maxV={Math.max(preCli.cagrPct, postCli.cagrPct)} fmtV={(v) => "+" + v.toLocaleString("es-ES") + "%"} ganaPre={preCli.cagrPct >= postCli.cagrPct} nota={`${preCli.anios} vs ${postCli.anios} — prácticamente el mismo ritmo.`} />
          <div style={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 16, padding: "14px 16px", marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ font: "800 30px/1 Manrope, sans-serif", color: C.filament }}>2,1×</span>
              <span style={{ font: "500 12px/1.4 Manrope, sans-serif", color: C.sub }}>creció la capacidad en <b style={{ color: C.ink }}>solo 7 años</b> (1951→1958), antes de la Revolución.</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8, marginBottom: 4 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 11, height: 11, background: C.filament, borderRadius: 2 }} /><span style={{ font: "500 11px 'IBM Plex Mono', monospace", color: C.sub }}>Antes de 1959</span></span>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 11, height: 11, background: C.arc, borderRadius: 2 }} /><span style={{ font: "500 11px 'IBM Plex Mono', monospace", color: C.sub }}>Después de 1959</span></span>
      </div>
      <Note>{velocidad.caveat}</Note>
    </Card>
  );
}

function Genesis({ data }) {
  return (
    <div style={{ display: "grid", gap: 22 }}>
      <Card>
        <H2 kicker="Setenta años en tres cortes" title="Lo que se construyó y lo que se perdió" />
        <p style={{ color: C.sub, font: "400 14px/1.65 Manrope, sans-serif", margin: "0 0 8px", maxWidth: 680 }}>
          Cada línea está normalizada a su propio recorrido para poder leer las tres juntas: lo que
          importa es la <em style={{ color: C.ink }}>forma</em>. La electrificación sube y se queda
          arriba; la capacidad disponible sube nueve veces… y vuelve a caer por debajo de sí misma.
        </p>
        <SlopeChart trayectoria={data.trayectoria} />
        <Note>Capacidad instalada 2025: orden de magnitud citado en prensa (incierto). Disponible 2025 fluctúa entre 1.165 y 1.880 MW. Electrificación: corroborada.</Note>
      </Card>

      {data.velocidad && <Velocidad velocidad={data.velocidad} />}

      <Card>
        <H2 kicker="Cronología, sin épica" title="Cómo se llegó hasta aquí" kc={C.filament} />
        <div style={{ display: "grid", gap: 1, background: C.line, border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden" }}>
          {data.historia.map((h) => (
            <div key={h.anio + h.hito} style={{ background: C.surface, padding: "16px 18px", display: "grid", gridTemplateColumns: "76px 1fr", gap: 14, alignItems: "start" }} className="tl-row">
              <div>
                <div style={{ font: "800 22px/1 Manrope, sans-serif", color: C.ink }}>{h.anio}</div>
                {h.fase && <div style={{ font: "600 9px 'IBM Plex Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase", color: FASE_COLOR[h.fase], marginTop: 6 }}>{FASE_LABEL[h.fase]}</div>}
              </div>
              <div>
                <div style={{ font: "700 15px/1.3 Manrope, sans-serif", color: C.ink, marginBottom: 5 }}>{h.hito}</div>
                {h.detalle && <div style={{ font: "400 13px/1.6 Manrope, sans-serif", color: C.sub }}>{h.detalle}</div>}
                {(h.capacidadMW != null || h.electrificacionPct != null) && (
                  <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                    {h.capacidadMW != null && <span style={{ font: "600 11px 'IBM Plex Mono', monospace", color: C.arc }}>{fmt(h.capacidadMW)} MW</span>}
                    {h.electrificacionPct != null && <span style={{ font: "600 11px 'IBM Plex Mono', monospace", color: C.filament }}>{h.electrificacionPct}% cobertura</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ════════ TAB · ESTADO ════════════════════════════════════════════════════ */
function Estado({ data }) {
  const cap = data.capacidad;
  const gen = data.generacion;
  const genData = gen.map((g) => ({ ...g, color: g.fosil ? (g.fuente.includes("vapor") ? C.ember : g.fuente.includes("diésel") ? C.filament : "#D2691E") : (g.fuente.includes("Solar") ? C.arc : C.ok) }));
  const fosilPct = gen.filter((g) => g.fosil).reduce((a, g) => a + g.pct, 0);
  const serie = cap.produccionSerie || [];
  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 22, alignItems: "stretch" }} className="est-grid">
        <Card>
          <H2 kicker="El medidor nacional" title="Cuánta demanda queda sin cubrir" kc={C.ember} />
          <Gauge demanda={cap.demandaPicoMW.valor} disponible={cap.disponibleMW.valor} />
          <Note>Demanda pico ~{fmt(cap.demandaPicoMW.valor)} MW (rango {fmt(cap.demandaPicoMW.min)}–{fmt(cap.demandaPicoMW.max)}). Disponible en pico ~{fmt(cap.disponibleMW.valor)} MW, fluctuando a diario ({fmt(cap.disponibleMW.min)}–{fmt(cap.disponibleMW.max)}). {cap.deficitTipicoMW.nota}</Note>
        </Card>

        <Card>
          <H2 kicker="Producción anual del SEN" title="Una década a la baja" kc={C.arc} />
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serie} margin={{ top: 12, right: 10, left: -6, bottom: 0 }}>
                <defs>
                  <linearGradient id="prodFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.arc} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={C.arc} stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={C.line} vertical={false} />
                <XAxis dataKey="anio" tick={{ fill: C.sub, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }} axisLine={{ stroke: C.line }} tickLine={false} />
                <YAxis tick={{ fill: C.faint, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }} axisLine={false} tickLine={false} domain={[12000, 20000]} tickFormatter={(v) => v / 1000 + "k"} />
                <Tooltip cursor={{ stroke: C.line }} contentStyle={{ background: "#3a2418", border: "none", borderRadius: 12, color: "#fcf9f4", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }} labelStyle={{ color: "#fcf9f4" }} itemStyle={{ color: "#fcf9f4" }} formatter={(v) => [fmt(v) + " GWh", "Producción"]} />
                <ReferenceLine y={19071} stroke={C.faint} strokeDasharray="3 4" label={{ value: "2020: 19.071", fill: C.faint, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", position: "insideTopRight" }} />
                <Area type="monotone" dataKey="gwh" stroke={C.arc} strokeWidth={2.5} fill="url(#prodFill)" dot={{ r: 3, fill: C.arc }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <Note>Producción 2025: {fmt(cap.produccionAnualGWh.valor)} GWh, ~{cap.caidaProduccionPct}% por debajo de 2020. La leve recuperación de 2025 se atribuye al aporte solar.</Note>
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <H2 kicker="De qué se genera la electricidad" title={`El ${Math.round(fosilPct)}% sigue siendo fósil`} kc={C.filament} />
          <Badge estado="corroborado" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 26, alignItems: "center" }} className="gen-grid">
          <div style={{ height: 230, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genData} dataKey="pct" nameKey="fuente" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="none" startAngle={90} endAngle={-270}>
                  {genData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#3a2418", border: "none", borderRadius: 12, color: "#fcf9f4", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }} labelStyle={{ color: "#fcf9f4" }} itemStyle={{ color: "#fcf9f4" }} formatter={(v, n) => [v + "%", n]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <div style={{ font: "800 30px/1 Manrope, sans-serif", color: C.ember }}>{Math.round(fosilPct)}%</div>
              <div style={{ font: "500 10px 'IBM Plex Mono', monospace", color: C.faint, marginTop: 4, letterSpacing: "0.1em" }}>FÓSIL</div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 9 }}>
            {genData.map((g) => (
              <div key={g.fuente}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: g.color, flexShrink: 0 }} />
                    <span style={{ font: "500 13px/1.3 Manrope, sans-serif", color: C.sub }}>{g.fuente}</span>
                  </div>
                  <span style={{ font: "600 13px 'IBM Plex Mono', monospace", color: C.ink }}>{g.pct}%</span>
                </div>
                {g.nota && <div style={{ font: "400 11px/1.45 'IBM Plex Mono', monospace", color: C.faint, marginLeft: 18, marginTop: 3 }}>{g.nota}</div>}
              </div>
            ))}
          </div>
        </div>
        <Note>{data.meta.nota}</Note>
      </Card>
    </div>
  );
}

/* ════════ TAB · TERRITORIO ═════════════════════════════════════════════════ */
function Territorio({ data }) {
  const periodos = useMemo(() => {
    const set = new Set();
    data.provincias.forEach((p) => Object.keys(p.senal).forEach((k) => set.add(k)));
    return Array.from(set).sort();
  }, [data.provincias]);
  const [periodo, setPeriodo] = useState(periodos[periodos.length - 1]);
  const [hover, setHover] = useState(null);
  const orden = { alta: 0, media: 1, baja: 2 };
  const sorted = data.provincias.slice().sort((a, b) => (orden[a.senal[periodo]] ?? 3) - (orden[b.senal[periodo]] ?? 3));
  const conteo = { alta: 0, media: 0, baja: 0 };
  data.provincias.forEach((p) => { const s = p.senal[periodo]; if (conteo[s] != null) conteo[s]++; });
  return (
    <div style={{ display: "grid", gap: 22 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 10 }}>
          <H2 kicker="La geografía del apagón" title="Severidad por provincia" />
          <div style={{ display: "flex", gap: 6 }}>
            {periodos.map((p) => (
              <button key={p} onClick={() => setPeriodo(p)} style={{ font: "600 12px 'IBM Plex Mono', monospace", padding: "7px 13px", borderRadius: 999, cursor: "pointer", border: `1px solid ${periodo === p ? C.arc : C.line}`, background: periodo === p ? C.arcSoft : "transparent", color: periodo === p ? C.arc : C.sub }}>{p}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 20, alignItems: "start" }} className="map-grid">
          <div>
            <CubaMap provincias={data.provincias} periodo={periodo} onHover={setHover} activo={hover} />
            <Legend items={[["Severidad alta", C.ember], ["Media", C.filament], ["Baja / priorizada", C.arc], ["Sin dato", C.steel], ["╌ borde: termoeléctrica principal", C.ink]]} />
          </div>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[["alta", "Alta"], ["media", "Media"], ["baja", "Baja"]].map(([k, l]) => (
                <div key={k} style={{ flex: 1, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ font: "800 22px Manrope, sans-serif", color: sevColor(k) }}>{conteo[k]}</div>
                  <div style={{ font: "500 9px 'IBM Plex Mono', monospace", color: C.faint, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ maxHeight: 300, overflowY: "auto", display: "grid", gap: 1, background: C.line, border: `1px solid ${C.line}`, borderRadius: 12 }}>
              {sorted.map((p) => {
                const sev = p.senal[periodo];
                const on = hover && hover.id === p.id;
                return (
                  <div key={p.id} onMouseEnter={() => setHover(p)} onMouseLeave={() => setHover(null)}
                    style={{ background: on ? C.surface2 : C.surface, padding: "9px 12px", display: "flex", alignItems: "center", gap: 10, cursor: "default" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: sevColor(sev), flexShrink: 0 }} />
                    <span style={{ font: "500 12.5px Manrope, sans-serif", color: C.ink, flex: 1 }}>{p.nombre}</span>
                    {p.plantas && <span style={{ font: "500 9px 'IBM Plex Mono', monospace", color: C.filament }}>◆ planta</span>}
                    <span style={{ font: "600 10px 'IBM Plex Mono', monospace", color: sevColor(sev), textTransform: "uppercase" }}>{sev}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {hover && (hover.nota || hover.plantas) && (
          <div style={{ marginTop: 14, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 16, padding: "14px 16px" }}>
            <div style={{ font: "700 13px Manrope, sans-serif", color: C.ink, marginBottom: 6 }}>{hover.nombre}</div>
            {hover.nota && <div style={{ font: "400 13px/1.55 Manrope, sans-serif", color: C.sub }}>{hover.nota}</div>}
            {hover.plantas && hover.plantas.map((pl) => (
              <div key={pl.nombre} style={{ font: "500 11.5px/1.5 'IBM Plex Mono', monospace", color: C.filament, marginTop: 6 }}>
                {pl.nombre} · {fmt(pl.mw)} MW{pl.anio ? ` · ${new Date().getFullYear() - pl.anio} años` : ""}{pl.estado ? ` — ${pl.estado}` : ""}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ════════ TAB · APAGONES ═══════════════════════════════════════════════════ */
function Apagones({ data }) {
  return (
    <div style={{ display: "grid", gap: 22 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <H2 kicker="Horas sin electricidad al día" title="La forma del apagón" kc={C.ember} />
          <Badge estado={data.apagones.estado} />
        </div>
        <p style={{ color: C.sub, font: "400 14px/1.65 Manrope, sans-serif", margin: "0 0 12px", maxWidth: 680 }}>
          Cada cresta es una distribución de horas de apagón diario. La Habana, priorizada en el reparto,
          concentra su masa a la izquierda; el oriente se desplaza a la derecha; Matanzas arrastra una
          cola larguísima hasta el pico documentado de 87 horas continuas.
        </p>
        <Ridgeline apagones={data.apagones} />
        <Note>{data.apagones.nota}</Note>
      </Card>
    </div>
  );
}

/* ════════ TAB · EL CONTRAFACTUAL ══════════════════════════════════════════ */
function Contrafactual({ data }) {
  const paises = data.comparativa.paises;
  const maxCap = Math.max(...paises.map((p) => p.capacidadMW || 0));
  return (
    <div style={{ display: "grid", gap: 22 }}>
      <Card>
        <H2 kicker="Cinco ejes, tres países y un escenario" title="Cuba frente a quien no rompió en 1959" />
        <p style={{ color: C.sub, font: "400 14px/1.65 Manrope, sans-serif", margin: "0 0 16px", maxWidth: 680 }}>
          República Dominicana y Costa Rica partieron a mediados del siglo XX de una electrificación
          parecida a la cubana. Hoy están muy por delante en casi todos los ejes. La línea de puntos es
          un <em style={{ color: C.filament }}>escenario</em>, no un dato: dónde estaría Cuba con la
          trayectoria media de sus pares. Pasa el cursor para aislar cada país.
        </p>
        <Parallel radar={data.radar} />
        <Note>La comparación es observacional, no causal. Fiabilidad de la red es un índice estimado; el resto de los ejes están corroborados. {data.comparativa.nota}</Note>
      </Card>

      <Card>
        <H2 kicker="Instantánea de capacidad" title="Megavatios instalados hoy" kc={C.arc} />
        <div style={{ display: "grid", gap: 14 }}>
          {paises.map((p) => (
            <div key={p.pais} style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: 14, alignItems: "center" }} className="cmp-row">
              <div>
                <div style={{ font: "600 13px Manrope, sans-serif", color: C.ink }}>{p.pais}</div>
                <div style={{ font: "500 10px 'IBM Plex Mono', monospace", color: C.faint }}>{p.electrificacionPct}% cobertura · {p.renovablePct}% renov.</div>
              </div>
              <div>
                <div style={{ height: 26, background: C.bg2, borderRadius: 3, overflow: "hidden", border: `1px solid ${C.line}`, position: "relative" }}>
                  <div style={{ height: "100%", width: `${((p.capacidadMW || 0) / maxCap) * 100}%`, background: p.pais === "Cuba" ? `linear-gradient(90deg, ${C.ember}, ${C.filament})` : `linear-gradient(90deg, ${C.arc}, ${C.arcBright})`, transition: "width .6s" }} />
                  {p.pais === "Cuba" && p.disponibleMW && (
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: `${(p.disponibleMW / maxCap) * 100}%`, width: 2, background: "#fcf9f4" }} title="disponible real" />
                  )}
                  <div style={{ position: "absolute", top: 0, right: 8, height: "100%", display: "flex", alignItems: "center", font: "600 12px 'IBM Plex Mono', monospace", color: C.ink }}>{fmt(p.capacidadMW)} MW</div>
                </div>
                {p.pais === "Cuba" && <div style={{ font: "400 10px 'IBM Plex Mono', monospace", color: C.faint, marginTop: 4 }}>La marca blanca ▏ señala los ~{fmt(p.disponibleMW)} MW realmente disponibles: el resto es placa que no genera.</div>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 20 }}>
          {paises.map((p) => (
            <div key={p.pais} style={{ background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ font: "600 11px Manrope, sans-serif", color: C.sub, marginBottom: 8 }}>{p.pais}</div>
              <div style={{ font: "800 24px/1 Manrope, sans-serif", color: p.pais === "Cuba" ? C.ember : C.arc }}>{fmt(p.kwhPerCapita)}</div>
              <div style={{ font: "500 10px 'IBM Plex Mono', monospace", color: C.faint, marginTop: 4 }}>kWh por habitante</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ════════ TAB · ¿Y SI? — coste de oportunidad ═════════════════════════════ */
function YSi({ data }) {
  const cd = data.centrosDatos;
  const [n, setN] = useState(3);
  const mwc = cd.consumoDataCenterMW.valor;
  const price = cd.precioKWhIndustrialUSD.valor;
  const jobs = cd.empleosPorDataCenter.valor;
  const inv = cd.inversionPorDataCenterUSD.valor;
  const totalMW = n * mwc;
  const energyMWh = totalMW * 8760;
  const revenue = energyMWh * 1000 * price; // MWh -> kWh
  const totalJobs = n * jobs;
  const totalInv = n * inv;
  const pctDemanda = Math.round((totalMW / data.capacidad.demandaPicoMW.valor) * 100);
  return (
    <div style={{ display: "grid", gap: 22 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <H2 kicker="Un ejercicio, no una contabilidad" title="Lo que una red fiable podría alojar" kc={C.filament} />
          <Badge estado="estimacion" />
        </div>
        <p style={{ color: C.sub, font: "400 14px/1.65 Manrope, sans-serif", margin: "0 0 20px", maxWidth: 680 }}>
          Los centros de datos exigen exactamente lo que hoy falta: corriente continua, sin interrupciones.
          Mueve el control para imaginar una Cuba con red estable y ver el orden de magnitud de lo que un
          puñado de instalaciones movería. Es un <em style={{ color: C.ink }}>escenario</em>: no se afirma
          que ese dinero exista ni que Cuba lo haya perdido.
        </p>

        <div style={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={{ font: "600 13px Manrope, sans-serif", color: C.sub }}>Centros de datos hipotéticos</span>
            <span style={{ font: "800 30px Manrope, sans-serif", color: C.filament }}>{n}</span>
          </div>
          <input type="range" min={1} max={20} value={n} onChange={(e) => setN(+e.target.value)}
            style={{ width: "100%", accentColor: C.filament, cursor: "pointer" }} />
          <div style={{ display: "flex", justifyContent: "space-between", font: "500 10px 'IBM Plex Mono', monospace", color: C.faint, marginTop: 6 }}>
            <span>1</span><span>{n} × {mwc} MW = {fmt(totalMW)} MW ({pctDemanda}% de la demanda pico de hoy)</span><span>20</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
          {[
            { n: usd(revenue), l: "energía vendida al año", s: `${fmt(totalMW)} MW × 8.760 h × US$${price}/kWh`, c: C.filament },
            { n: fmt(totalJobs), l: "empleos directos", s: `~${jobs} por centro (rango ${cd.empleosPorDataCenter.min}–${cd.empleosPorDataCenter.max})`, c: C.arc },
            { n: usd(totalInv), l: "inversión de capital", s: `~${usd(inv)} por centro (rango ${usd(cd.inversionPorDataCenterUSD.min)}–${usd(cd.inversionPorDataCenterUSD.max)})`, c: C.arcBright },
            { n: pctDemanda + "%", l: "de la demanda pico actual", s: "que hoy la red no puede ni cubrir para los hogares", c: C.ember },
          ].map((k, i) => (
            <div key={i} style={{ background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 18px" }}>
              <div style={{ font: "800 26px/1.05 Manrope, sans-serif", color: k.c, letterSpacing: "-0.01em" }}>{k.n}</div>
              <div style={{ font: "600 12px/1.35 Manrope, sans-serif", color: C.ink, marginTop: 8 }}>{k.l}</div>
              <div style={{ font: "400 10px/1.45 'IBM Plex Mono', monospace", color: C.faint, marginTop: 5 }}>{k.s}</div>
            </div>
          ))}
        </div>

        {/* Parámetros del cálculo, con su referencia explícita */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }} className="ysi-grid">
          <div style={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ font: "600 12px Manrope, sans-serif", color: C.ink }}>Precio del kWh industrial</span>
              <span style={{ font: "700 15px 'IBM Plex Mono', monospace", color: C.filament }}>US${price}/kWh</span>
            </div>
            <div style={{ font: "500 10px 'IBM Plex Mono', monospace", color: C.faint, marginBottom: 8 }}>rango US${cd.precioKWhIndustrialUSD.min}–{cd.precioKWhIndustrialUSD.max} · {estadoLabel(cd.precioKWhIndustrialUSD.estado)}</div>
            <div style={{ font: "400 11px/1.5 'IBM Plex Mono', monospace", color: C.sub }}>{cd.precioKWhIndustrialUSD.nota}</div>
          </div>
          {cd.costeSolar && (
            <div style={{ background: C.bg2, border: `1px solid ${C.arc}44`, borderRadius: 16, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                <span style={{ font: "800 30px/1 Manrope, sans-serif", color: C.arc }}>−{cd.costeSolar.caidaPct}%</span>
                <span style={{ font: "600 12px/1.35 Manrope, sans-serif", color: C.ink }}>cayó el coste de la solar<br />({cd.costeSolar.anioInicial}→{cd.costeSolar.anioActual})</span>
              </div>
              <div style={{ font: "500 10px 'IBM Plex Mono', monospace", color: C.faint, marginBottom: 8 }}>LCOE ~US${cd.costeSolar.lcoeInicialUSD} → ~US${cd.costeSolar.lcoeActualUSD}/kWh</div>
              <div style={{ font: "400 11px/1.5 'IBM Plex Mono', monospace", color: C.sub }}>{cd.costeSolar.nota}</div>
            </div>
          )}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }} className="ysi-grid">
        <Card>
          <H2 kicker="La región ya lo hace" title="Referencias cercanas" kc={C.arc} />
          <div style={{ display: "grid", gap: 12 }}>
            {cd.referenciasRegion.map((r) => (
              <div key={r.lugar} style={{ borderLeft: `2px solid ${C.arc}`, paddingLeft: 14 }}>
                <div style={{ font: "700 14px Manrope, sans-serif", color: C.ink }}>{r.lugar}{r.mw ? ` · ${r.mw} MW` : ""}</div>
                <div style={{ font: "400 12.5px/1.55 Manrope, sans-serif", color: C.sub, marginTop: 3 }}>{r.nota}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <H2 kicker="Lo que este cálculo NO dice" title="Supuestos y límites" kc={C.ember} />
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 10 }}>
            {cd.supuestos.map((s, i) => (
              <li key={i} style={{ font: "400 12.5px/1.6 Manrope, sans-serif", color: C.sub }}>{s}</li>
            ))}
          </ul>
          {cd.fuentesCalculo && cd.fuentesCalculo.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
              <div style={{ font: "600 10px 'IBM Plex Mono', monospace", letterSpacing: "0.14em", textTransform: "uppercase", color: C.faint, marginBottom: 8 }}>Referencias del cálculo</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
                {cd.fuentesCalculo.map((f, i) => (
                  <li key={i} style={{ font: "400 11px/1.5 'IBM Plex Mono', monospace", color: C.faint }}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ════════ APP ══════════════════════════════════════════════════════════════ */
const TABS = [
  { id: "genesis", label: "Génesis", color: C.arc },
  { id: "estado", label: "Estado actual", color: C.ember },
  { id: "territorio", label: "Territorio", color: C.arc },
  { id: "apagones", label: "Apagones", color: C.ember },
  { id: "contrafactual", label: "El contrafactual", color: C.filament },
  { id: "ysi", label: "¿Y si?", color: C.filament },
];

export default function App() {
  useFonts();
  const data = useData();
  const [tab, setTab] = useState("genesis");
  const { meta, kpis } = data;

  return (
    <div style={{ background: "transparent", minHeight: "100vh", color: C.ink, fontFamily: "Manrope, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      <style>{`
        @media (max-width: 760px){
          .est-grid,.gen-grid,.map-grid,.cmp-row,.ysi-grid,.vel-grid{grid-template-columns:1fr !important;}
        }
        .tabrail::-webkit-scrollbar{height:0;}
        button:focus-visible{outline:2px solid ${C.arcBright};outline-offset:2px;}
      `}</style>

      <header style={{ maxWidth: 980, margin: "0 auto", padding: "56px 22px 26px" }}>
        <div style={{ font: "600 11px/1 'IBM Plex Mono', monospace", letterSpacing: "0.24em", color: C.arc, textTransform: "uppercase", marginBottom: 20 }}>
          Yamacoa · Sistema Electroenergético Nacional
        </div>
        <h1 style={{ font: "800 clamp(42px,8vw,78px)/0.95 Manrope, sans-serif", letterSpacing: "-0.03em", margin: 0, color: C.ink }}>
          La corriente <span style={{ color: C.ember, fontStyle: "italic" }}>interrumpida</span>
        </h1>
        <p style={{ font: "400 17px/1.6 Manrope, sans-serif", color: C.sub, maxWidth: 620, margin: "22px 0 0" }}>
          {meta.subtitulo}. De la isla casi electrificada de 1992 al apagón como estado permanente:
          lo que se construyó, lo que se perdió y lo que una red fiable todavía podría ser.
        </p>
        <div style={{ display: "flex", gap: 26, flexWrap: "wrap", marginTop: 30 }}>
          {kpis.map((k) => (
            <div key={k.id}>
              <div style={{ font: "800 34px/1 Manrope, sans-serif", color: k.id === "solar" ? C.arc : k.id === "deficit" || k.id === "apagon" ? C.ember : C.filament, letterSpacing: "-0.02em" }}>
                {typeof k.valor === "number" ? fmt(k.valor) : k.valor}{k.sufijo || ""}
              </div>
              <div style={{ font: "500 11px/1.4 'IBM Plex Mono', monospace", color: C.faint, marginTop: 7, textTransform: "uppercase", letterSpacing: "0.06em", maxWidth: 190 }}>{k.etiqueta}</div>
            </div>
          ))}
        </div>
      </header>

      <div style={{ position: "sticky", top: 0, zIndex: 10, background: C.bg + "ee", backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.line}` }}>
        <div className="tabrail" role="tablist" style={{ maxWidth: 980, margin: "0 auto", padding: "0 22px", display: "flex", gap: 4, overflowX: "auto" }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} role="tab" aria-selected={active} onClick={() => setTab(t.id)}
                style={{ position: "relative", font: "600 13px Manrope, sans-serif", letterSpacing: "0.02em", padding: "16px 16px 14px", border: "none", background: "transparent", color: active ? C.ink : C.faint, cursor: "pointer", whiteSpace: "nowrap" }}>
                {t.label}
                <span style={{ position: "absolute", left: 12, right: 12, bottom: 0, height: 2, background: active ? t.color : "transparent", borderRadius: 2 }} />
              </button>
            );
          })}
        </div>
      </div>

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "30px 22px 60px" }}>
        {tab === "genesis" && <Genesis data={data} />}
        {tab === "estado" && <Estado data={data} />}
        {tab === "territorio" && <Territorio data={data} />}
        {tab === "apagones" && <Apagones data={data} />}
        {tab === "contrafactual" && <Contrafactual data={data} />}
        {tab === "ysi" && <YSi data={data} />}

        <footer style={{ marginTop: 34, paddingTop: 22, borderTop: `1px solid ${C.line}`, font: "400 12px/1.7 'IBM Plex Mono', monospace", color: C.faint }}>
          Fuentes: {meta.fuentes.join(" · ")} · actualizado {meta.actualizado}.
          Cifras mínimas ("al menos") con su incertidumbre marcada; la comparación entre países es
          observacional, no causal, y el cálculo de centros de datos es un escenario ilustrativo.
          <br />Yamacoa · una iniciativa independiente por la libertad y los derechos humanos. Otra Cuba mejor es posible.
        </footer>
      </main>
    </div>
  );
}
