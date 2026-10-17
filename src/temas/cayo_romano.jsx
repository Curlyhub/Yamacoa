import { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, LabelList,
} from "recharts";

/* ============================================================
   DATASET — versión resumida embebida para renderizado.
   La versión completa importable se distribuye aparte:
   datos-cuba.json + schema-cuba.json
   ============================================================ */
const SUPERFICIE_CUBA_KM2 = 109884;
const CAYO_ROMANO_KM2 = 777;

const PROYECTOS = [
  { id: "moa-jv", nombre: "Moa JV (Pedro Sotto Alba)", recurso: "Ni–Co", operador: "Sherritt / GeoMinera (50/50)", lat: 20.64, lon: -74.95, estado: "En producción",
    dato: "114,1 Mt reservas P&P @ 1,01% Ni / 0,12% Co (dic-2023). Vida útil ~25 años. Refino en Fort Saskatchewan, Canadá.", prodAnual: "~31 kt Ni + ~3,3 kt Co", fuente: "Sherritt / AZO Mining [5]" },
  { id: "che-guevara", nombre: "Che Guevara (Punta Gorda)", recurso: "Ni–Co", operador: "Cubaníquel (estatal)", lat: 20.7, lon: -74.83, estado: "En producción",
    dato: "Planta HPAL estatal en Moa. Producción declinante por descapitalización: el país produjo 49 kt Ni en 2020 frente a ~70 kt históricas.", prodAnual: "declive sostenido", fuente: "USGS MCS / Crespin [4][8]" },
  { id: "castellanos", nombre: "Castellanos", recurso: "Zn–Pb", operador: "Emincar (Trafigura/Geominera)", lat: 22.7, lon: -83.95, estado: "En producción",
    dato: "Primera gran mina nueva en décadas; producción desde 2017 en Pinar del Río.", prodAnual: "~100 kt concentrado Zn", fuente: "Reuters [6]" },
  { id: "demajagua", nombre: "La Demajagua", recurso: "Au–Ag", operador: "Minera La Victoria (Antilles Gold / GeoMinera)", lat: 21.72, lon: -82.9, estado: "En desarrollo",
    dato: "JV con capital fundacional US$30M; perforación del depósito Au-Ag en Isla de la Juventud.", prodAnual: "—", fuente: "Antilles Gold [7]" },
  { id: "el-cobre", nombre: "El Cobre / distrito Cu-Au oriental", recurso: "Cu–Au", operador: "GeoMinera + exploración", lat: 20.05, lon: -75.95, estado: "Exploración",
    dato: "Distrito histórico (desde 1534). El USGS identifica potencial porfídico Cu-Au en el arco geológico cubano, sin certificación JORC/NI 43-101 moderna.", prodAnual: "—", fuente: "USGS FS 2015-3032 [3]" },
  { id: "cromo-camaguey", nombre: "Cromitas de Camagüey", recurso: "Cr", operador: "Estatal", lat: 21.5, lon: -77.5, estado: "Reactivación parcial",
    dato: "Yacimientos ofiolíticos históricos; embarque por Nuevitas. ~3 Mt estimadas sin certificación moderna.", prodAnual: "menor", fuente: "Adelante.cu / hist. [1]" },
  { id: "franja-petrolera", nombre: "Franja petrolera Habana–Matanzas", recurso: "Petróleo onshore", operador: "Cupet + contratos", lat: 23.05, lon: -81.6, estado: "En producción",
    dato: "Crudo pesado onshore/aguas someras: ~40–50 kbbl/d. Reservas probadas del país ~124 Mbbl. La cifra Mincex de '10.000 Mbbl geológicos' NO es reserva probada.", prodAnual: "40–50 kbbl/d", fuente: "USGS 2015 / EIA [2]" },
  { id: "offshore", nombre: "Cuenca Norte offshore (ZEE)", recurso: "Petróleo no descubierto", operador: "Sin operador activo", lat: 23.5, lon: -79.8, estado: "Prospectivo",
    dato: "USGS 2004: 4.600 Mbbl de recurso técnicamente recuperable NO descubierto (media probabilística). Pozos de 2012 (Repsol) resultaron secos.", prodAnual: "0", fuente: "USGS 2004 [2][3]" },
  { id: "cayo-romano", nombre: "Cayo Romano", recurso: "Territorio (777 km²)", operador: "—", lat: 22.03, lon: -77.92, estado: "Activo en disputa del plan C40",
    dato: "Humedal y corredor turístico de Jardines del Rey. El proyecto C40 propone cederlo a EE.UU. a perpetuidad, modelo Enmienda Platt.", prodAnual: "—", fuente: "Proyecto C40 [1]", especial: true },
];

/* Cifras originales del Proyecto C40 vs datos verificables (bruto, M$) */
const C40_VS_REAL = [
  { recurso: "Petróleo", c40: 560000, verificable: 10000, condicional: 368000,
    nota: "C40 valora 7.000 Mbbl a $80 como si fueran reservas. Probado: ~124 Mbbl (≈$10.000M bruto). El recurso offshore no descubierto del USGS (4.600 Mbbl ≈ $368.000M) es condicional: nadie lo ha encontrado aún.", distorsion: "×56 sobre lo probado" },
  { recurso: "Níquel", c40: 20000, verificable: 100000, condicional: 0,
    nota: "C40 usa 1 Mt de reservas; el USGS estima ~5,5 Mt. Subestimado ×5: incoherencia interna que revela falta de rigor en ambas direcciones.", distorsion: "÷5 (subestimado)" },
  { recurso: "Cobalto", c40: 17500, verificable: 22500, condicional: 0,
    nota: "C40 usa 250 kt; el USGS estima 500 kt (3ª reserva mundial). Pero es subproducto del níquel: no puede monetizarse de forma independiente.", distorsion: "÷2 en reservas" },
  { recurso: "Zinc", c40: 31680, verificable: 31680, condicional: 0,
    nota: "Orden de magnitud plausible; Castellanos produce desde 2017.", distorsion: "≈" },
  { recurso: "Cromo", c40: 3480, verificable: 3480, condicional: 0,
    nota: "Datos históricos sin certificación moderna JORC/NI 43-101.", distorsion: "≈ (sin certificar)" },
  { recurso: "Oro", c40: 3000, verificable: 3000, condicional: 0,
    nota: "~50 t; La Demajagua en desarrollo.", distorsion: "≈" },
];

const VALORACION = [
  { concepto: "Total tabla proyecto C40", min: 635660, max: 635660, tipo: "afirmación C40" },
  { concepto: "Bruto verificable (sin offshore hipotético)", min: 160000, max: 180000, tipo: "estimación" },
  { concepto: "Bruto incl. recurso offshore condicional", min: 400000, max: 600000, tipo: "estimación" },
  { concepto: "VPN de proyectos comercialmente viables", min: 50000, max: 180000, tipo: "estimación" },
  { concepto: "Renta soberana descontada (30–50 años)", min: 20000, max: 80000, tipo: "estimación" },
];

const RADAR = [
  { dimension: "Legitimidad nacional", cayoRomano: 2, fondoSoberano: 8 },
  { dimension: "Soberanía territorial", cayoRomano: 1, fondoSoberano: 10 },
  { dimension: "Ingresos inmediatos", cayoRomano: 8, fondoSoberano: 4 },
  { dimension: "Ingresos a largo plazo", cayoRomano: 3, fondoSoberano: 8 },
  { dimension: "Competencia inversora", cayoRomano: 1, fondoSoberano: 8 },
  { dimension: "Reversibilidad", cayoRomano: 1, fondoSoberano: 8 },
  { dimension: "Apoyo EE.UU. rápido", cayoRomano: 7, fondoSoberano: 4 },
  { dimension: "Riesgo corrupción interna", cayoRomano: 5, fondoSoberano: 4 },
];

const SUPUESTOS = {
  pibBase2026: 100000, crecimientoStatusQuo: 0.005, anioTransicion: 2027, horizonte: 2041,
  shockGuerra: -0.09, shockAjustePacifico: -0.02, boomReconstruccion: 0.08,
  crecimientoLPfondo: 0.045, crecimientoLPcayo: 0.038, descuentoLegitimidad: 0.007,
  rentaMineraMax: 3000, rentaPetroleoDescubrimiento: 4500, anioPetroleoOnline: 2036,
  fugaCayo: 0.42, haircutGobernanzaBaja: 0.4,
};

const PERDIDAS = [
  { dimension: "Territorio", detalle: "777 km² = 0,71% del territorio nacional, a perpetuidad; mayor que Aruba + Barbados juntas", vpEstimado: null },
  { dimension: "30% petróleo perpetuo", detalle: "Si el offshore produce 300 kbbl/d con margen fiscal de $25/bbl", vpEstimado: 24000 },
  { dimension: "Exclusividad minera", detalle: "Pérdida de competencia en subastas: 15–30% menos regalías", vpEstimado: 9000 },
  { dimension: "Base fiscal (exención restitución)", detalle: "Décadas de exención sobre propiedades restituidas", vpEstimado: 12000 },
];

const REFERENCIAS = [
  { id: 1, titulo: "PROYECTO CAYO ROMANO", fuente: "MovimientoC40, feb-2025", url: "https://movimientoc40.com/proyecto-cayo-romano/" },
  { id: 2, titulo: "Updated Information on Cuba Mineral and Petroleum Resources", fuente: "USGS, 2015", url: "https://www.usgs.gov/news/national-news-release/updated-information-cuba-mineral-and-petroleum-resources-released" },
  { id: 3, titulo: "Recent Trends in Cuba's Mining and Petroleum Industries (FS 2015-3032)", fuente: "USGS", url: "https://pubs.usgs.gov/fs/2015/3032/fs20153032.pdf" },
  { id: 4, titulo: "Mineral Commodity Summaries 2025", fuente: "USGS", url: "https://pubs.usgs.gov/periodicals/mcs2025/" },
  { id: 5, titulo: "Cuba: Mining, Minerals and Fuel Resources", fuente: "AZO Mining, 2025", url: "https://www.azomining.com/Article.aspx?ArticleID=218" },
  { id: 6, titulo: "Cuba seeks to revive mining sector (Castellanos Zn-Pb)", fuente: "Reuters, 2017", url: "https://www.reuters.com/article/business/cuba-seeks-to-revive-mining-sector-with-new-lead-and-zinc-mine-idUSKBN1A70IN/" },
  { id: 7, titulo: "Antilles Gold — La Demajagua JV con GeoMinera", fuente: "Antilles Gold", url: "https://antillesgold.net/" },
  { id: 8, titulo: "The Imperative for Increased Investment in Cuban Mines", fuente: "R. Crespin / DevTech, 2025", url: "https://devtechsys.com/wp-content/uploads/2025/09/The-Imperative-for-Increased-Investment-in-Cuban-Mines-RCrespin-2025-2.pdf" },
];

/* ============================================================
   MODELO CONTRAFACTUAL
   ============================================================ */
function simular(s, { petroleo, gobernanzaAlta }) {
  const anios = [];
  let pibSQ = s.pibBase2026, pibFondo = s.pibBase2026, pibCayo = s.pibBase2026;
  let acumFondo = 0, acumCayo = 0;
  const gob = gobernanzaAlta ? 1 : 1 - s.haircutGobernanzaBaja;
  const gPenal = gobernanzaAlta ? 0 : 0.01;
  for (let a = 2026; a <= s.horizonte; a++) {
    const t = a - s.anioTransicion;
    if (a > 2026) {
      pibSQ *= 1 + s.crecimientoStatusQuo;
      let gF = s.crecimientoStatusQuo;
      if (t === 0) gF = s.shockAjustePacifico;
      else if (t > 0 && t <= 5) gF = Math.min(s.crecimientoLPfondo + 0.015, 0.02 + t * 0.01) * gob + (1 - gob) * 0.015;
      else if (t > 5) gF = s.crecimientoLPfondo * gob + (1 - gob) * 0.02;
      pibFondo *= 1 + gF - gPenal * (t > 0 ? 1 : 0);
      let gC = s.crecimientoStatusQuo;
      if (t === 0) gC = s.shockGuerra;
      else if (t === 1 || t === 2) gC = s.boomReconstruccion;
      else if (t > 2) gC = (s.crecimientoLPcayo - s.descuentoLegitimidad) * gob + (1 - gob) * 0.015;
      pibCayo *= 1 + gC - gPenal * (t > 0 ? 1 : 0);
    }
    const rMin = t >= 1 ? Math.min(s.rentaMineraMax, 400 + t * 350) * gob : 0;
    const rPet = petroleo && a >= s.anioPetroleoOnline ? s.rentaPetroleoDescubrimiento * gob : 0;
    const rentaFondo = rMin + rPet;
    const rentaCayo = (rMin + rPet) * (1 - s.fugaCayo);
    acumFondo += rentaFondo; acumCayo += rentaCayo;
    anios.push({
      anio: a,
      pibStatusQuo: Math.round(pibSQ / 1000), pibFondo: Math.round(pibFondo / 1000), pibCayo: Math.round(pibCayo / 1000),
      acumFondo: Math.round(acumFondo / 100) / 10, acumCayo: Math.round(acumCayo / 100) / 10,
      perdidaAcum: Math.round((acumFondo - acumCayo) / 100) / 10,
    });
  }
  return anios;
}
function didTabla(serie) {
  const pre = serie[0], post = serie[serie.length - 1];
  const dSQ = post.pibStatusQuo - pre.pibStatusQuo;
  return [
    { escenario: "Fondo soberano", delta: post.pibFondo - pre.pibFondo, did: post.pibFondo - pre.pibFondo - dSQ },
    { escenario: "Cayo Romano", delta: post.pibCayo - pre.pibCayo, did: post.pibCayo - pre.pibCayo - dSQ },
    { escenario: "Status quo (control)", delta: dSQ, did: 0 },
  ];
}

/* ============================================================
   UI
   ============================================================ */
const C = {
  ink: "#1f1a16", teal: "#0E7C7B", blue: "#1F4E79",
  amber: "#B8791A", loss: "#A4303F", paper: "#fcf9f4", sqGray: "#8A8F98",
};
const fmtB = (v) => `$${v}B`;

/* Estilos inline. El proyecto no usa Tailwind: ancho y márgenes alineados
   con el resto de renderers (maxWidth 960, padding lateral 22). El grid usa
   minmax(min(100%, Npx), 1fr) para colapsar a una columna sin media queries. */
const S = {
  wrap: { maxWidth: 960, margin: "0 auto", padding: "0 22px" },
  h2: { fontFamily: "'Manrope', system-ui, sans-serif", fontSize: "clamp(21px, 3vw, 26px)", fontWeight: 800, letterSpacing: "-0.015em", color: C.ink, margin: 0 },
  h3: { fontSize: 14, fontWeight: 600, margin: "0 0 8px" },
  parr: { fontSize: 14, lineHeight: 1.6, maxWidth: 680, margin: "0 0 16px" },
  nota: { fontSize: 12, lineHeight: 1.5, color: "#6b5d50", margin: "6px 0 0" },
  card: { border: "1px solid rgba(60,40,20,.15)", borderRadius: 20, padding: 16, background: "#fcf9f4", boxShadow: "var(--y-shadow)" },
  grid: (min = 300, gap = 24) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap }),
  tablaWrap: { overflowX: "auto", border: "1px solid rgba(60,40,20,.15)", borderRadius: 16 },
  tabla: { width: "100%", borderCollapse: "collapse", fontSize: 13, background: "#fcf9f4", minWidth: 560 },
  th: { textAlign: "left", padding: "8px 12px", fontWeight: 600, whiteSpace: "nowrap" },
  td: { padding: "8px 12px", verticalAlign: "top" },
  mono: { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" },
  nowrap: { whiteSpace: "nowrap" },
  tt: { c: { background: "#3a2418", border: 0, borderRadius: 12, boxShadow: "0 8px 24px rgba(40,25,10,.22)", fontSize: 12.5 }, i: { color: "#fcf9f4" }, l: { color: "#f2cdb8", fontFamily: "'IBM Plex Mono', ui-monospace, monospace" } },
};

const CUBA_PATHS = ["M233.9,8.7 233.0,10.3 234.1,15.9 232.4,15.7 231.8,17.1 232.7,18.2 229.3,21.9 234.1,26.3 233.0,32.5 236.5,36.7 236.1,41.1 240.0,43.8 239.4,49.4 236.2,53.9 234.7,53.7 228.9,49.0 220.0,45.8 204.2,47.7 197.0,45.3 187.0,45.8 183.2,45.1 183.3,42.5 181.4,41.3 178.5,36.3 180.1,24.2 181.8,23.6 183.4,25.0 185.8,22.7 193.4,23.0 196.8,18.7 196.1,13.7 197.8,14.8 199.5,12.2 203.3,15.6 204.6,10.7 205.8,10.1 204.1,6.3 208.9,5.3 212.3,7.6 221.1,9.2 233.9,8.7Z", "M385.1,36.1 390.3,41.6 399.2,46.0 402.5,50.7 394.6,44.3 392.0,44.6 388.6,42.6 384.9,37.3 380.5,37.7 380.4,36.3 385.1,36.1Z", "M377.2,31.8 378.6,32.9 376.8,33.8 373.6,31.3 373.8,28.4 374.5,30.2 377.2,31.8Z", "M360.7,23.5 362.4,24.0 362.3,25.1 361.6,25.8 360.0,24.8 357.9,26.5 357.4,24.6 360.7,23.5Z", "M366.1,27.8 364.5,27.4 364.8,25.4 363.5,25.0 365.9,23.4 367.4,25.0 365.6,26.2 366.5,26.8 366.1,27.8Z", "M336.3,22.0 337.7,24.1 329.4,22.0 336.5,20.1 337.7,20.9 336.3,22.0Z", "M321.8,23.1 323.4,24.8 328.8,25.1 334.3,27.7 343.2,25.7 342.6,23.8 349.3,26.2 350.7,25.9 351.0,24.1 353.2,25.7 355.2,29.9 360.0,31.7 360.3,32.6 364.1,29.9 369.1,28.8 367.1,31.0 364.7,30.8 363.8,33.6 365.7,35.8 370.6,36.7 375.3,40.4 379.2,39.6 381.0,47.5 384.6,49.8 389.2,57.0 393.2,57.5 396.0,61.8 394.7,66.2 400.6,75.4 400.0,80.5 395.7,79.1 393.6,79.6 391.4,81.4 389.5,85.6 387.1,86.7 379.4,85.0 376.3,86.1 373.4,83.5 371.0,83.4 370.1,84.7 370.6,86.8 372.2,90.2 374.1,91.1 371.1,98.2 369.3,99.7 360.4,97.6 358.4,100.5 352.6,103.1 350.9,100.1 350.5,95.5 348.3,92.9 347.2,88.8 347.0,82.9 348.3,79.4 345.6,77.4 344.1,72.6 340.3,72.3 337.0,68.6 338.5,65.3 337.3,63.8 337.4,61.4 335.0,58.3 335.9,53.6 332.6,54.4 331.4,57.1 327.5,58.4 326.6,58.0 326.8,54.3 324.5,54.5 322.4,53.0 317.1,56.4 314.1,49.8 314.4,44.9 313.3,43.0 314.9,41.0 312.5,35.4 311.1,34.9 306.6,36.7 300.8,30.2 302.1,28.7 302.4,23.2 309.2,22.9 311.9,15.6 314.5,20.3 321.8,23.1Z", "M349.7,16.4 350.3,18.8 347.5,17.1 348.0,15.7 349.7,16.4Z", "M344.1,15.0 341.2,15.4 338.2,13.9 338.4,13.1 340.2,11.2 342.4,13.7 344.9,14.1 344.1,15.0Z", "M336.8,14.3 332.4,10.4 334.8,10.0 337.3,13.3 336.8,14.3Z", "M327.3,9.4 321.3,10.4 322.4,9.2 327.3,9.4Z", "M243.5,93.8 243.7,94.9 241.2,94.4 240.7,92.7 243.5,93.8Z", "M294.0,7.0 295.1,8.1 295.6,7.0 296.7,9.0 294.9,10.4 290.1,9.9 284.8,12.3 289.9,8.5 294.1,8.6 293.2,7.0 294.0,7.0Z", "M316.7,5.9 320.6,6.2 318.9,7.8 312.8,7.0 314.3,5.0 316.7,5.9Z", "M306.8,5.2 303.9,6.9 304.6,5.0 306.5,4.4 306.8,5.2Z", "M269.6,16.9 273.5,18.2 277.2,12.8 279.9,12.3 283.7,12.7 284.4,15.9 285.7,16.3 300.0,13.4 306.9,13.9 309.7,12.1 310.1,10.7 308.8,9.2 312.3,9.2 309.8,13.9 311.9,15.6 310.3,18.0 310.1,21.9 308.5,23.2 302.4,23.2 302.1,28.7 300.8,30.2 306.6,36.7 311.1,34.9 312.5,35.4 314.9,41.0 313.3,43.0 314.4,44.9 314.1,49.8 317.1,56.4 313.1,61.7 309.7,62.8 294.4,61.1 287.9,65.9 288.8,66.9 286.9,70.9 289.0,71.0 287.7,77.6 288.2,79.1 290.1,79.1 290.1,82.0 294.8,86.2 301.0,89.3 303.8,88.5 310.1,89.0 311.9,94.1 299.9,93.6 289.6,94.8 283.3,94.1 276.5,91.7 272.6,85.1 273.0,80.6 270.8,77.4 268.9,76.6 267.6,77.7 268.7,91.3 268.1,93.7 266.7,93.6 267.7,91.9 267.4,89.5 265.7,86.7 263.2,87.7 262.8,90.4 260.3,89.9 258.6,91.5 256.0,90.3 254.4,85.2 245.3,82.5 241.9,84.6 237.0,81.9 235.1,83.1 230.4,82.5 229.8,83.7 228.4,83.5 229.0,84.6 224.8,84.1 219.9,78.2 204.9,71.9 203.7,69.7 200.2,69.0 199.9,66.5 202.8,65.0 222.6,65.0 233.9,62.5 236.2,60.6 236.2,53.9 239.4,49.4 240.0,43.8 236.1,41.1 236.5,36.7 233.0,32.5 234.1,26.3 229.3,21.9 232.7,18.2 231.8,17.1 232.4,15.7 234.1,15.9 233.0,10.3 233.9,8.7 241.2,8.6 244.5,10.8 244.5,14.2 243.3,16.7 245.0,17.2 246.8,16.6 248.4,13.1 263.4,9.3 272.1,4.4 273.4,4.9 262.3,10.8 265.5,12.1 269.6,16.9Z", "M303.4,5.4 301.3,6.6 292.7,3.8 303.4,5.4Z", "M289.0,0.2 292.0,2.2 289.0,2.3 286.9,0.9 289.0,0.2Z", "M174.1,54.6 173.7,48.8 174.9,52.7 174.1,54.6Z", "M173.0,15.7 176.6,15.5 177.4,17.2 175.3,19.5 179.4,21.6 180.0,29.0 178.5,36.3 181.4,41.3 183.3,42.5 183.2,45.1 166.0,45.7 156.9,43.7 154.7,45.8 154.0,50.2 152.3,51.1 146.8,42.0 141.3,35.9 144.0,35.2 145.7,33.3 143.7,27.2 144.6,20.0 145.6,18.4 160.3,18.2 173.0,15.7Z", "M204.1,6.3 205.8,10.1 204.6,10.7 203.3,15.6 199.8,12.1 197.8,14.8 196.2,13.6 196.8,18.7 192.8,23.3 185.8,22.7 183.4,25.0 181.8,23.6 180.1,24.2 179.3,21.4 175.3,19.5 177.4,17.2 176.6,15.5 174.3,16.3 172.7,15.2 182.1,9.4 188.3,7.6 195.6,5.8 200.5,7.0 204.1,6.3Z", "M643.8,213.4 645.4,213.6 644.7,215.2 648.8,217.7 649.5,219.7 653.0,220.5 658.7,218.0 664.8,217.9 667.9,215.8 668.2,212.6 670.6,213.4 675.4,209.6 678.6,210.9 683.9,209.8 683.7,212.8 681.6,215.0 685.1,219.4 683.8,220.8 682.0,220.5 680.7,223.6 677.7,225.7 678.9,229.1 677.6,234.3 679.9,242.2 681.3,243.7 676.9,246.9 677.4,250.9 684.6,260.5 680.2,259.4 677.0,260.8 668.7,259.8 660.3,254.8 648.0,253.7 641.9,255.2 626.0,252.2 602.9,255.9 593.8,255.3 583.1,256.9 578.5,256.3 573.5,259.4 566.4,260.1 565.5,256.2 570.8,255.4 574.2,251.3 580.1,250.9 583.2,248.7 585.9,250.7 588.9,249.5 592.6,251.6 596.6,251.4 597.2,250.5 600.2,251.3 600.6,248.3 604.3,248.8 607.4,247.7 611.2,243.6 610.4,234.4 612.6,231.9 614.0,224.4 615.0,223.2 619.5,223.3 621.2,219.7 621.1,216.6 623.0,217.3 624.2,221.6 627.6,218.2 632.8,218.8 632.5,221.0 634.4,217.9 633.5,213.8 637.3,211.2 637.1,207.8 641.5,210.8 642.1,213.0 643.8,213.4Z", "M618.0,155.9 616.2,164.9 605.9,172.0 603.2,176.9 594.9,179.0 592.2,177.5 591.2,186.6 588.9,191.7 590.4,195.4 584.4,198.9 580.6,194.9 571.0,194.1 565.6,195.2 561.4,193.3 554.4,193.1 552.3,191.7 549.7,193.0 548.5,191.9 546.7,195.8 544.8,196.9 533.6,199.9 527.9,198.3 524.5,199.9 522.5,198.7 513.2,198.1 509.5,196.2 510.4,190.0 514.1,184.7 521.8,183.1 522.6,177.9 526.9,180.0 527.6,177.6 530.8,176.6 531.2,175.2 534.6,174.9 535.6,170.8 537.6,169.4 539.5,173.0 542.9,173.7 542.5,175.4 543.4,176.7 545.0,174.5 548.0,175.6 551.1,169.2 555.5,167.6 559.5,161.9 559.3,156.4 563.8,151.5 560.5,151.1 559.5,149.2 561.7,143.3 568.0,143.3 572.9,140.1 580.5,142.9 581.4,143.7 580.9,144.7 582.4,144.7 582.0,146.3 576.2,148.7 577.0,151.6 580.6,149.7 580.4,151.6 581.1,151.1 582.8,145.3 593.5,148.4 594.4,151.1 589.2,153.2 589.5,152.0 588.1,151.3 587.9,153.3 596.6,156.3 594.6,154.9 593.7,152.7 596.3,152.1 600.5,154.8 601.5,153.2 600.4,157.2 596.6,157.9 598.0,157.9 597.1,158.4 597.6,159.4 600.0,159.0 602.0,161.1 607.8,157.9 602.6,155.8 602.8,153.6 604.2,153.2 612.7,153.4 618.0,155.9Z", "M677.2,194.4 677.5,195.3 672.5,194.4 670.6,192.9 670.6,191.5 675.0,191.0 677.2,194.4Z", "M631.4,167.4 632.1,168.2 636.3,166.8 637.8,169.5 638.8,168.4 639.9,169.8 640.2,167.9 643.6,167.9 645.8,166.3 649.5,168.4 649.5,167.4 653.2,164.7 655.2,166.1 661.6,166.1 663.7,170.0 666.5,169.4 668.1,170.4 670.6,174.2 666.6,181.9 663.2,183.6 662.2,181.0 660.2,181.1 659.4,181.5 660.8,182.6 658.8,182.8 658.8,183.7 660.3,186.3 663.5,184.5 667.2,184.7 672.6,188.9 672.0,190.7 671.0,190.7 666.9,187.2 661.6,188.3 656.9,187.8 655.9,194.6 657.4,197.0 660.1,198.5 661.3,198.9 666.7,192.0 668.5,194.1 668.2,196.8 670.7,196.8 670.2,198.3 672.6,199.4 672.2,197.7 676.4,198.7 677.5,197.3 679.9,198.9 680.5,197.3 677.9,196.8 680.5,195.1 683.8,195.2 686.5,196.7 687.0,197.5 685.3,197.9 686.3,199.9 687.2,198.9 687.9,200.5 689.6,200.9 693.6,200.4 688.3,197.9 690.9,196.4 698.1,197.0 699.2,198.0 698.0,198.9 703.7,199.2 704.4,201.0 704.9,199.4 706.8,200.2 706.3,198.9 712.1,198.1 716.2,200.6 719.1,200.4 722.6,203.2 729.8,204.3 730.9,205.1 729.9,205.6 730.9,208.3 732.3,209.2 728.2,211.5 727.0,214.1 727.5,217.7 724.6,218.9 723.5,220.6 714.2,215.6 711.7,216.1 711.9,218.1 713.6,219.6 712.8,220.1 708.5,218.5 704.1,214.6 696.8,216.6 694.8,221.3 693.4,220.1 691.2,220.7 687.9,218.1 685.1,219.4 681.6,215.0 683.7,212.8 683.9,209.8 678.6,210.9 675.7,209.5 670.6,213.4 668.2,212.6 667.9,215.8 664.8,217.9 658.7,218.0 653.0,220.5 650.7,220.3 648.8,217.7 644.9,215.5 645.2,213.4 642.1,213.0 641.5,210.8 637.1,207.8 637.3,211.2 633.5,213.8 634.4,217.9 632.5,221.0 632.8,218.8 627.6,218.2 623.0,212.7 613.8,210.0 613.7,207.3 612.1,207.6 600.4,202.9 599.6,198.4 595.5,199.5 592.0,197.2 590.4,197.8 589.2,197.1 590.5,194.9 589.0,190.7 591.2,186.6 592.2,177.5 594.9,179.0 603.2,176.9 605.9,172.0 616.2,164.9 618.0,155.9 630.6,162.4 631.4,167.4Z", "M565.6,195.2 571.0,194.1 580.6,194.9 584.4,198.9 588.8,196.5 595.5,199.5 599.6,198.4 600.4,202.9 612.1,207.6 613.7,207.3 613.8,210.0 623.0,212.7 627.6,218.2 624.2,221.6 623.0,217.3 621.1,216.6 621.2,219.7 619.5,223.3 614.5,223.6 612.6,231.9 610.4,234.0 611.2,243.6 606.3,248.2 600.1,248.6 600.7,251.2 597.2,250.5 596.6,251.4 592.6,251.6 588.9,249.5 585.9,250.7 583.2,248.7 580.1,250.9 573.9,251.5 570.8,255.4 565.5,256.2 566.4,260.1 560.8,260.0 555.4,258.2 551.5,259.4 547.6,258.7 544.6,260.5 546.5,261.0 543.3,261.9 520.8,264.6 517.4,264.1 516.2,262.6 517.7,257.9 520.1,256.9 524.5,250.0 527.9,246.9 527.0,244.8 529.5,245.5 531.6,244.4 533.4,241.7 540.2,236.5 549.8,232.3 552.0,228.7 552.9,228.7 553.0,230.0 554.9,229.8 557.3,225.8 560.8,223.5 561.0,219.8 563.0,216.1 558.2,210.6 554.9,209.5 554.9,210.9 551.8,208.6 551.7,206.4 554.9,203.0 551.0,201.1 550.5,202.5 546.4,197.5 544.8,196.9 546.7,195.8 548.8,191.8 549.4,193.0 552.3,191.7 554.4,193.1 561.4,193.3 565.6,195.2Z", "M772.1,230.8 773.8,234.5 773.4,237.7 767.4,241.3 766.6,244.4 764.4,246.4 755.4,245.4 742.0,248.0 732.5,247.6 725.4,248.7 720.0,252.8 715.7,253.4 713.6,257.4 711.3,258.3 708.7,258.6 707.8,257.4 707.2,258.8 705.2,259.4 705.2,253.7 702.2,253.7 705.5,250.5 705.4,246.9 703.9,247.2 702.3,250.0 699.9,249.6 699.5,252.1 701.0,251.6 701.5,252.8 695.6,256.3 695.3,259.2 691.6,260.1 684.6,260.5 677.0,249.7 676.9,246.9 681.3,243.7 679.9,242.2 677.6,234.3 678.9,229.1 677.8,225.5 680.7,223.6 682.0,220.5 683.8,220.8 687.3,218.2 691.2,220.7 693.4,220.1 694.8,221.3 695.8,217.5 698.9,215.5 700.6,216.1 704.5,214.7 708.5,218.5 713.2,220.2 711.7,216.1 714.9,215.7 723.5,220.6 724.6,218.9 727.5,217.7 727.0,214.1 728.2,211.5 732.3,209.2 735.3,210.3 740.2,214.6 748.1,224.5 753.2,226.6 755.4,229.8 756.9,228.7 761.3,229.2 766.6,227.1 772.1,230.8Z", "M469.9,208.7 471.1,209.3 471.3,208.1 472.8,208.3 473.9,211.8 469.0,209.9 468.1,207.8 464.2,205.6 466.4,205.1 469.9,208.7Z", "M456.0,201.4 454.9,202.5 453.5,201.4 456.0,201.4Z", "M463.2,195.9 466.2,196.2 460.8,198.9 458.4,197.9 463.2,195.9Z", "M492.7,91.6 497.9,99.9 503.4,104.9 505.4,108.4 506.7,107.5 507.4,100.9 511.2,100.9 507.8,102.8 508.2,105.2 510.1,107.6 513.3,108.4 515.1,113.4 521.4,115.2 527.0,114.7 531.4,117.3 532.0,115.7 533.8,115.2 535.0,116.4 535.8,116.3 535.3,115.2 536.3,115.5 538.7,117.9 536.5,117.6 536.3,118.9 538.1,124.7 543.4,126.3 544.8,125.3 541.1,121.2 539.8,117.1 537.3,115.5 536.8,113.6 534.8,113.7 533.8,112.6 532.8,113.5 526.4,106.9 525.0,107.3 528.0,103.7 531.6,106.0 532.6,108.9 540.2,114.5 545.3,116.3 556.0,124.2 559.3,124.2 558.8,125.6 560.3,127.9 560.1,129.4 557.9,132.6 551.0,128.4 548.5,127.9 547.9,129.0 545.1,127.3 542.9,128.2 546.5,131.1 550.7,131.7 550.5,134.2 549.1,135.4 550.5,138.7 554.0,138.7 553.4,140.0 557.3,138.4 560.7,129.7 562.6,128.7 572.9,140.1 568.0,143.3 561.7,143.3 559.5,149.2 560.5,151.1 563.8,151.5 559.3,156.4 559.5,161.9 555.5,167.6 551.1,169.2 548.0,175.6 545.0,174.5 543.4,176.7 542.5,175.4 542.9,173.7 539.5,173.0 537.6,169.4 535.6,170.8 534.6,174.9 531.2,175.2 530.8,176.6 527.6,177.6 526.9,180.0 522.6,177.9 521.8,183.1 514.1,184.7 510.4,190.0 509.5,196.2 504.6,196.1 501.5,198.3 494.4,197.8 493.7,196.2 492.7,197.3 490.3,194.5 487.1,193.0 483.7,188.4 482.3,187.5 480.4,188.0 477.9,182.8 472.9,179.1 468.5,178.4 466.6,175.2 462.5,172.3 461.3,163.9 458.9,157.5 459.3,155.2 460.8,156.1 461.7,154.5 458.4,152.4 455.0,139.8 451.5,134.2 461.8,128.0 464.5,128.7 467.3,123.4 472.2,123.7 471.6,122.2 474.1,119.2 473.5,114.9 476.0,112.4 477.1,112.2 480.1,116.6 484.3,116.1 484.1,113.8 486.2,112.4 479.4,104.1 480.2,101.8 485.7,100.4 491.7,95.8 491.5,91.9 492.7,91.6Z", "M505.4,92.5 510.1,90.6 514.0,93.0 516.2,92.0 520.1,94.1 522.3,92.9 524.2,96.0 522.5,100.6 523.5,102.6 520.1,104.1 520.4,102.7 519.2,102.3 519.2,104.9 518.2,105.1 515.2,100.9 512.6,101.1 510.1,99.6 510.5,95.9 508.3,95.2 508.3,97.8 507.8,96.2 506.7,97.3 504.4,97.2 501.2,92.7 501.0,90.4 505.4,92.5Z", "M514.7,84.6 513.0,84.6 511.2,82.7 508.3,78.2 508.9,77.2 505.9,74.5 507.7,74.2 509.2,75.5 511.3,80.7 514.7,84.6Z", "M498.3,80.1 501.5,80.3 503.9,82.5 503.0,81.9 504.4,80.3 505.6,81.7 506.9,80.8 507.4,82.1 504.4,83.5 509.8,86.1 507.1,90.7 506.4,89.9 504.9,90.4 503.6,87.3 502.1,86.7 500.9,87.4 501.5,89.3 500.6,88.9 494.8,84.2 494.1,83.0 496.2,81.5 497.0,79.0 496.1,74.0 499.2,75.2 498.3,80.1Z", "M483.2,64.5 483.8,65.5 485.2,64.7 488.9,66.4 491.5,69.8 492.6,74.4 494.1,76.1 496.6,76.6 495.4,77.8 490.2,75.0 485.1,74.3 483.3,72.9 484.8,71.9 484.2,70.7 482.7,69.9 480.4,72.4 479.9,70.6 480.9,68.9 479.8,67.4 475.0,67.1 476.0,65.8 483.2,64.5Z", "M443.7,196.2 442.4,197.2 440.7,196.7 438.3,194.1 439.7,193.8 443.7,196.2Z", "M431.1,188.9 431.2,189.9 436.0,190.6 436.8,192.6 430.0,191.1 428.4,189.4 430.0,187.5 431.1,188.9Z", "M427.1,187.1 420.1,183.1 427.9,184.9 427.1,187.1Z", "M412.8,174.6 420.6,181.5 419.1,181.5 419.6,183.1 413.7,177.9 415.0,177.8 417.7,180.5 413.3,175.4 411.7,175.2 412.3,176.8 409.8,174.8 412.8,174.6Z", "M402.1,166.5 404.9,169.5 401.5,169.6 400.5,168.9 402.5,168.9 402.2,168.1 398.0,165.8 400.3,165.4 402.1,166.5Z", "M431.1,67.5 441.5,68.2 443.2,73.4 444.1,72.9 444.8,73.9 446.6,70.8 444.6,68.2 446.7,68.4 449.0,70.8 456.8,73.5 462.8,78.2 470.1,79.3 470.1,81.4 471.1,80.8 472.8,83.7 475.8,85.7 485.1,87.2 486.2,89.9 488.7,90.0 489.0,91.1 491.5,91.9 491.7,95.8 485.7,100.4 480.2,101.8 479.4,104.1 486.2,112.4 484.1,113.8 484.3,116.1 480.1,116.6 477.1,112.2 476.0,112.4 473.5,114.9 474.1,119.2 471.6,122.2 472.2,123.7 467.3,123.4 464.5,128.7 461.8,128.0 451.5,134.2 448.7,132.5 444.0,131.6 444.1,130.0 448.1,130.2 446.3,127.7 443.1,126.0 434.5,127.9 433.1,129.5 428.7,129.2 427.9,122.2 424.6,120.3 422.7,124.1 418.7,125.0 418.8,120.6 417.1,117.6 419.9,110.0 422.9,103.0 426.0,102.8 428.7,98.1 428.4,94.9 422.5,90.9 422.4,89.3 423.4,84.7 430.5,71.0 431.1,67.5Z", "M445.2,56.5 444.5,57.8 442.6,58.2 442.4,56.5 444.8,55.7 445.2,56.5Z", "M472.2,56.4 472.4,58.1 477.2,63.0 477.2,64.4 475.5,63.9 466.6,66.0 467.4,63.9 468.6,63.9 467.8,62.1 460.3,63.4 451.7,60.3 450.5,59.4 451.5,58.6 450.4,57.4 447.8,59.1 447.6,56.5 448.5,57.0 449.4,55.3 456.4,57.3 464.0,57.4 467.4,54.9 472.2,56.4Z", "M401.4,66.4 405.4,67.1 408.8,69.3 410.1,68.3 415.2,69.2 417.2,67.7 419.9,68.7 425.5,67.1 431.1,67.5 430.5,71.0 423.4,84.7 422.4,89.3 422.5,90.9 428.4,94.9 428.7,98.1 426.0,102.8 422.9,103.0 417.1,117.6 418.8,120.6 418.7,125.0 422.7,124.1 424.6,120.3 427.9,122.2 428.7,129.2 420.4,130.2 413.7,132.9 408.0,132.8 402.3,131.2 399.8,129.2 392.1,129.0 389.0,125.4 387.2,127.5 381.9,125.2 379.2,122.1 367.5,120.6 366.2,123.2 365.0,123.0 361.8,121.6 363.3,120.5 362.2,119.7 361.8,116.8 359.3,118.1 353.4,117.3 355.0,118.9 354.1,119.8 352.8,119.2 350.4,113.5 347.1,111.8 348.1,107.3 352.6,103.1 358.4,100.5 360.4,97.6 369.3,99.7 371.1,98.2 374.1,91.1 372.2,90.2 370.6,86.8 370.1,84.7 371.0,83.4 373.4,83.5 376.3,86.1 379.4,85.0 387.1,86.7 389.5,85.6 391.4,81.4 393.6,79.6 395.7,79.1 400.0,80.5 400.6,75.4 394.7,66.2 396.0,61.8 401.4,66.4Z", "M411.1,50.1 409.8,48.9 413.2,48.5 411.1,50.1Z", "M428.6,48.1 427.0,49.0 425.5,47.5 419.6,46.4 427.5,46.6 428.6,48.1Z", "M99.1,100.9 100.7,101.3 96.2,100.9 99.1,100.9Z", "M137.5,20.1 140.2,19.8 140.7,20.6 139.2,21.4 140.0,22.4 141.2,21.4 141.0,22.9 143.7,22.1 143.7,27.2 145.7,33.3 144.0,35.2 141.3,35.9 146.8,42.0 152.3,51.1 145.4,55.9 142.6,56.4 135.5,60.5 127.8,72.1 121.1,71.9 121.0,73.5 119.3,73.4 119.2,75.0 115.7,77.7 112.9,82.4 111.2,81.4 110.0,84.0 102.7,83.8 99.6,82.5 100.0,81.1 98.6,79.3 95.8,83.2 91.7,85.1 92.2,84.0 83.9,85.1 83.4,83.5 80.7,85.1 73.5,85.1 70.6,88.0 70.1,93.6 69.3,92.9 68.1,93.9 68.7,96.2 71.1,95.6 70.7,97.3 68.2,99.1 67.7,100.7 68.7,102.1 67.7,103.5 65.2,104.7 59.6,102.6 53.9,105.2 51.0,105.2 46.4,107.2 34.8,116.0 31.8,116.3 30.9,114.8 34.3,105.7 32.7,103.4 29.8,102.9 21.0,105.1 11.0,111.3 8.1,112.0 5.0,111.9 1.0,110.2 0.3,107.8 1.6,104.9 5.4,106.8 7.5,105.4 6.3,103.6 7.6,102.9 9.3,103.7 9.3,105.2 26.5,97.8 30.9,94.6 32.7,94.7 35.1,96.6 40.5,94.6 44.5,98.0 47.5,96.7 48.6,92.5 46.1,95.5 44.6,91.1 43.2,90.4 44.2,88.3 40.1,86.9 37.5,82.8 36.3,82.5 38.5,79.2 40.2,71.1 47.5,62.3 46.1,61.8 51.7,59.4 53.5,56.5 53.0,53.3 54.4,53.8 56.4,52.9 57.8,54.3 58.9,50.7 61.8,49.8 62.6,46.8 65.2,47.4 66.7,45.8 65.4,44.4 63.3,44.3 64.1,43.2 66.6,43.0 67.7,44.9 69.3,45.2 74.5,41.6 75.5,42.6 77.3,40.3 81.6,39.8 89.0,36.4 93.1,36.7 94.7,35.8 93.1,35.2 94.7,34.2 99.8,33.6 101.5,30.5 104.4,30.4 103.9,31.5 105.3,31.8 108.4,28.4 111.6,30.5 116.1,24.7 123.5,20.8 127.0,22.0 126.2,25.0 127.6,26.3 129.5,24.6 128.2,23.5 129.3,21.6 135.8,19.3 137.5,20.1Z", "M204.9,131.6 203.1,131.4 211.5,127.1 212.6,125.5 213.1,126.1 212.0,128.5 204.9,131.6Z", "M220.5,126.1 217.1,128.0 215.9,125.9 218.0,126.8 222.8,124.1 220.5,126.1Z", "M252.9,123.9 247.3,127.7 242.7,128.9 242.7,127.4 245.3,127.3 247.5,124.8 250.3,125.2 252.9,121.7 256.2,120.3 252.9,123.9Z", "M149.8,103.4 161.9,107.4 161.7,111.9 166.0,115.8 167.6,116.1 168.9,118.6 167.2,121.6 167.2,124.2 170.6,125.8 170.1,127.2 172.6,129.5 168.7,133.6 151.5,141.1 146.4,141.6 144.9,140.6 134.7,139.5 128.1,133.1 126.0,126.8 133.9,132.9 138.0,133.1 142.2,129.2 142.6,132.1 143.6,128.8 140.6,127.6 134.5,116.8 133.6,113.7 134.3,110.4 138.4,106.2 142.6,104.1 139.4,103.1 140.5,102.3 149.8,103.4Z", "M168.1,104.4 164.2,103.6 163.5,102.3 165.1,101.8 169.0,104.0 168.1,104.4Z", "M324.5,54.5 327.2,54.7 326.6,58.0 327.5,58.4 331.4,57.1 332.6,54.4 335.9,53.6 335.0,58.3 337.4,61.4 337.3,63.8 338.5,65.3 337.0,68.6 340.3,72.3 344.1,72.6 345.6,77.4 348.3,79.4 347.0,82.9 347.2,88.8 348.3,92.9 350.5,95.5 351.1,100.8 352.7,102.0 347.3,108.2 347.1,111.8 335.0,107.0 324.5,95.2 322.3,94.5 322.1,93.0 326.5,92.0 325.0,92.5 326.0,89.9 321.7,88.3 322.6,86.1 319.7,83.5 318.3,84.6 316.2,84.0 315.8,85.6 320.6,91.5 320.6,95.2 317.6,94.0 311.9,94.1 310.1,89.0 300.5,89.1 294.8,86.2 290.1,82.0 290.1,79.1 287.9,78.7 289.1,71.3 286.9,70.9 288.8,66.9 287.9,65.9 290.7,63.3 295.0,61.0 309.7,62.8 313.1,61.7 315.7,57.4 321.5,53.1 324.5,54.5Z"];

/* Proyección geográfica del SVG (MapSVG geoViewBox) */
const GEO = { lon0: -84.951889, lon1: -74.132223, lat0: 23.276752, lat1: 19.825899, w: 774.25848, h: 264.93973 };
const gx = (lon) => ((lon - GEO.lon0) / (GEO.lon1 - GEO.lon0)) * GEO.w;
const gy = (lat) => ((GEO.lat0 - lat) / (GEO.lat0 - GEO.lat1)) * GEO.h;

function MapaCuba({ seleccion, onSelect }) {
  const graticuleLon = [-84, -82, -80, -78, -76];
  const graticuleLat = [20, 21, 22, 23];
  return (
    <div>
      <svg viewBox="-12 -16 798 330" style={{ width: "100%", height: "auto", display: "block", borderRadius: 12, border: "1px solid #C6D4DC" }}>
        <defs>
          <linearGradient id="mar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CFE4EE" />
            <stop offset="100%" stopColor="#AFCEDE" />
          </linearGradient>
          <linearGradient id="tierra" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5EFDF" />
            <stop offset="100%" stopColor="#E8DFC8" />
          </linearGradient>
          <filter id="sombraIsla" x="-5%" y="-10%" width="110%" height="130%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#3E5A6B" floodOpacity="0.35" />
          </filter>
        </defs>
        <rect x="-12" y="-16" width="798" height="330" fill="url(#mar)" />
        {/* Graticule */}
        <g stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1">
          {graticuleLon.map((lo) => <line key={lo} x1={gx(lo)} y1="-16" x2={gx(lo)} y2="290" />)}
          {graticuleLat.map((la) => <line key={la} x1="-12" y1={gy(la)} x2="786" y2={gy(la)} />)}
        </g>
        <g fontSize="8.5" fill="#5F7D8C">
          {graticuleLon.map((lo) => <text key={lo} x={gx(lo) + 3} y="-6">{Math.abs(lo)}°O</text>)}
          {graticuleLat.map((la) => <text key={la} x="-9" y={gy(la) - 3}>{la}°N</text>)}
        </g>
        {/* Costa: contorno real (MapSVG), simplificado */}
        <g filter="url(#sombraIsla)">
          {CUBA_PATHS.map((d, i) => (
            <path key={i} d={d} fill="url(#tierra)" stroke="#94896E" strokeWidth="1.1" strokeLinejoin="round" />
          ))}
        </g>
        {/* Referencia: La Habana */}
        <g>
          <circle cx={gx(-82.383)} cy={gy(23.113)} r="2.4" fill={C.ink} />
          <text x={gx(-82.383) + 6} y={gy(23.113) + 3} fontSize="9.5" fontStyle="italic" fill={C.ink}>La Habana</text>
        </g>
        {/* Marcadores de proyectos */}
        {PROYECTOS.map((p) => {
          const x = gx(p.lon), y = gy(p.lat);
          const sel = seleccion === p.id;
          const strokeCol = p.estado === "En producción" ? C.teal : p.estado === "Prospectivo" ? C.sqGray : C.blue;
          return (
            <g key={p.id} onClick={() => onSelect(p.id)} style={{ cursor: "pointer" }}>
              {sel && <circle cx={x} cy={y} r="15" fill="none" stroke={p.especial ? C.amber : C.teal} strokeWidth="1.5" strokeOpacity="0.6">
                <animate attributeName="r" values="11;17;11" dur="2s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.7;0.15;0.7" dur="2s" repeatCount="indefinite" />
              </circle>}
              {p.especial ? (
                <rect x={x - 7} y={y - 7} width="14" height="14" rx="3"
                  fill={sel ? C.amber : "#FBEED7"} stroke={C.amber} strokeWidth="2.2" transform={`rotate(45 ${x} ${y})`} />
              ) : (
                <circle cx={x} cy={y} r={sel ? 9 : 6.5} fill={sel ? C.teal : "#fcf9f4"} stroke={strokeCol} strokeWidth="2.6" />
              )}
              {sel && (
                <text x={x} y={y - 16} fontSize="11.5" fontWeight="700" fill={C.ink} textAnchor="middle"
                  style={{ paintOrder: "stroke", stroke: "#fcf9f4", strokeWidth: 3 }}>{p.nombre}</text>
              )}
            </g>
          );
        })}
        {/* Leyenda */}
        <g fontSize="9.5" fill={C.ink}>
          <rect x="-12" y="292" width="798" height="22" fill="#fcf9f4" fillOpacity="0.9" />
          <circle cx="6" cy="303" r="5" fill="#fcf9f4" stroke={C.teal} strokeWidth="2.6" /><text x="16" y="306">En producción</text>
          <circle cx="110" cy="303" r="5" fill="#fcf9f4" stroke={C.blue} strokeWidth="2.6" /><text x="120" y="306">Desarrollo/exploración</text>
          <circle cx="248" cy="303" r="5" fill="#fcf9f4" stroke={C.sqGray} strokeWidth="2.6" /><text x="258" y="306">Prospectivo</text>
          <rect x="325" y="298" width="10" height="10" rx="2" fill="#FBEED7" stroke={C.amber} strokeWidth="2" transform="rotate(45 330 303)" /><text x="342" y="306">Cayo Romano (plan C40)</text>
          <text x="770" y="306" textAnchor="end" fill={C.sqGray}>Contorno: MapSVG · toca un marcador</text>
        </g>
      </svg>
      {seleccion && (() => {
        const p = PROYECTOS.find((x) => x.id === seleccion);
        return (
          <div style={{ ...S.card, marginTop: 12, borderColor: p.especial ? C.amber : "rgba(60,40,20,.15)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
              <span style={{ fontWeight: 600, color: p.especial ? C.amber : C.teal }}>{p.nombre}</span>
              <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 999, background: "#f5efe7" }}>{p.estado}</span>
            </div>
            <p style={{ fontSize: 14, margin: "4px 0 0" }}><b>{p.recurso}</b> · {p.operador}</p>
            <p style={{ fontSize: 14, margin: "4px 0 0", color: "#4a3f36" }}>{p.dato}</p>
            <p style={{ ...S.nota, marginTop: 8 }}>Producción: {p.prodAnual} · Fuente: {p.fuente}</p>
          </div>
        );
      })()}
    </div>
  );
}

function BadgeContrafactual() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 8px", borderRadius: 4, background: "#FBEED7", color: C.amber, border: `1px dashed ${C.amber}` }}>⚠ Escenario contrafactual</span>
      <span style={{ fontSize: 12, color: C.sqGray }}>Proyección hipotética condicionada a transición en 2027. No es una predicción.</span>
    </div>
  );
}

function Seccion({ id, num, titulo, children, contrafactual }) {
  return (
    <section id={id} style={{ marginBottom: 56, scrollMarginTop: 80 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
        <span style={{ ...S.mono, fontSize: 13, color: C.teal }}>{num}</span>
        <h2 style={S.h2}>{titulo}</h2>
      </div>
      <div style={{ height: 1, width: "100%", marginBottom: 16, background: "rgba(60,40,20,.15)" }} />
      {contrafactual && <BadgeContrafactual />}
      <div style={contrafactual ? { border: `1.5px dashed ${C.amber}`, borderRadius: 20, padding: "16px 16px 8px", background: "#fcf9f4" } : {}}>{children}</div>
    </section>
  );
}

function Toggle({ label, value, onChange, onText, offText }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer", textAlign: "left", border: `1px solid ${value ? C.teal : "rgba(60,40,20,.15)"}`, background: value ? "#E6F2F1" : "#fcf9f4", color: C.ink }}>
      <span style={{ width: 36, height: 20, borderRadius: 999, position: "relative", flexShrink: 0, background: value ? C.teal : "#c9bcae" }}>
        <span style={{ position: "absolute", top: 2, width: 16, height: 16, borderRadius: 999, background: "#fcf9f4", transition: "left .18s ease", left: value ? 18 : 2 }} />
      </span>
      <span>{label}: <b>{value ? onText : offText}</b></span>
    </button>
  );
}

export default function App() {
  const [petroleo, setPetroleo] = useState(true);
  const [gobernanzaAlta, setGobernanzaAlta] = useState(true);
  const [tab, setTab] = useState("graficas");
  const [proySel, setProySel] = useState("moa-jv");
  const [votos, setVotos] = useState({ estrategia: {}, petroleo: {} });
  const [miVoto, setMiVoto] = useState({ estrategia: null, petroleo: null });

  const serie = useMemo(() => simular(SUPUESTOS, { petroleo, gobernanzaAlta }), [petroleo, gobernanzaAlta]);
  const did = useMemo(() => didTabla(serie), [serie]);
  const fin = serie[serie.length - 1];

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("c40-encuestas-v1", true);
        if (r && r.value) setVotos(JSON.parse(r.value));
      } catch (e) { /* primera vez: clave inexistente */ }
    })();
  }, []);

  const votar = async (pregunta, opcion) => {
    if (miVoto[pregunta]) return;
    const nuevo = { ...votos, [pregunta]: { ...votos[pregunta], [opcion]: (votos[pregunta][opcion] || 0) + 1 } };
    setVotos(nuevo);
    setMiVoto({ ...miVoto, [pregunta]: opcion });
    try { await window.storage.set("c40-encuestas-v1", JSON.stringify(nuevo), true); } catch (e) { /* fallback en memoria */ }
  };

  const EncuestaBloque = ({ pregunta, titulo, opciones }) => {
    const total = Object.values(votos[pregunta] || {}).reduce((a, b) => a + b, 0);
    return (
      <div style={{ ...S.card, marginBottom: 16 }}>
        <p style={{ fontWeight: 500, margin: "0 0 12px", color: C.ink }}>{titulo}</p>
        {opciones.map((op) => {
          const n = (votos[pregunta] || {})[op] || 0;
          const pct = total ? Math.round((n / total) * 100) : 0;
          const elegida = miVoto[pregunta] === op;
          return (
            <button key={op} onClick={() => votar(pregunta, op)} disabled={!!miVoto[pregunta]}
              style={{ width: "100%", textAlign: "left", marginBottom: 8, borderRadius: 12, position: "relative", overflow: "hidden", background: "#fcf9f4", border: `1px solid ${elegida ? C.teal : "rgba(60,40,20,.15)"}`, cursor: miVoto[pregunta] ? "default" : "pointer" }}>
              <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, transition: "width .3s ease", width: `${miVoto[pregunta] ? pct : 0}%`, background: elegida ? "#CFE8E7" : "#f5efe7" }} />
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 8, padding: "8px 12px", fontSize: 13, color: C.ink }}>
                <span>{elegida ? "✓ " : ""}{op}</span>
                {miVoto[pregunta] && <span style={S.mono}>{pct}% ({n})</span>}
              </div>
            </button>
          );
        })}
        <p style={{ ...S.nota, marginTop: 4 }}>{total} voto{total !== 1 ? "s" : ""}</p>
      </div>
    );
  };

  const nav = [
    ["recursos", "Recursos"], ["c40", "Cifras C40"], ["valoracion", "Valoración"],
    ["comparacion", "Comparación"], ["did", "DiD 15 años"], ["perdidas", "Pérdidas"],
    ["otros-cf", "Otros CF"], ["encuestas", "Encuestas"], ["refs", "Referencias"],
  ];

  const heroCards = [
    { n: "0,71%", label: "del territorio nacional cedido a perpetuidad",
      proc: `= ${CAYO_ROMANO_KM2} km² (Cayo Romano, cláusula 1 del proyecto C40) ÷ ${SUPERFICIE_CUBA_KM2.toLocaleString("es-ES")} km² de superficie terrestre de Cuba`, ref: "[1]", col: C.loss },
    { n: "30%", label: "de la producción petrolera entregada sin fecha de fin",
      proc: "Cláusula textual del proyecto: \u201cEE.UU. conservaría el 30% de la producción petrolera de manera indefinida\u201d, tras saldar la deuda con derechos exclusivos", ref: "[1]", col: C.loss },
    { n: "$20–80B", label: "renta soberana realista de recursos en 30–50 años (VPN)",
      proc: "Elaboración propia: reservas USGS × precios de largo plazo, menos costes HPAL/CAPEX, con descuento temporal. Detalle en sección 03", ref: "[3][4]", col: C.teal },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: C.ink, fontFamily: "'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(239,232,223,0.95)", backdropFilter: "blur(6px)", borderBottom: "1px solid rgba(60,40,20,.15)" }}>
        <div style={{ ...S.wrap, display: "flex", gap: 4, overflowX: "auto", padding: "8px 22px", fontSize: 13 }}>
          {nav.map(([id, t]) => (
            <a key={id} href={`#${id}`} style={{ padding: "6px 12px", borderRadius: 999, whiteSpace: "nowrap", textDecoration: "none", color: C.blue }}>{t}</a>
          ))}
        </div>
      </nav>

      <main style={{ ...S.wrap, padding: "40px 22px" }}>
        <header style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase", margin: "0 0 12px", color: C.teal }}>Análisis estratégico · Proyecto Cuba</p>
          <h1 style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 800, letterSpacing: "-0.03em", fontSize: "clamp(30px, 6vw, 48px)", lineHeight: 1.15, margin: "0 0 16px" }}>
            Cayo Romano <span style={{ color: C.sqGray }}>vs</span> Fondo Soberano Minero
          </h1>
          <p style={{ fontSize: "clamp(15px, 2.2vw, 18px)", lineHeight: 1.55, maxWidth: 680, margin: "0 0 24px", color: "#4a3f36" }}>
            Dos estrategias para financiar una hipotética transición cubana: ceder territorio y recursos a EE.UU., o retener el subsuelo bajo un fondo soberano. Datos verificables, cifras originales del plan C40 contrastadas, y <b style={{ color: C.amber }}>contrafactuales explícitamente marcados</b>.
          </p>
          <div style={{ margin: "8px 0 12px" }}>
            <h2 style={{ ...S.h2, fontSize: "clamp(18px, 2.4vw, 21px)" }}>El Proyecto Cayo Romano en cifras</h2>
            <p style={{ ...S.nota, marginTop: 4 }}>Tres números que resumen el precio del plan; conectan directamente con la base de recursos por proyecto (sección 01).</p>
          </div>
          <div style={S.grid(230, 12)}>
            {heroCards.map((c) => (
              <div key={c.n} style={{ ...S.card, display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 800, color: c.col, fontFamily: "'Manrope', system-ui, sans-serif" }}>{c.n}</div>
                <div style={{ fontSize: 13, margin: "4px 0 8px", color: "#4a3f36" }}>{c.label}</div>
                <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: "auto", paddingTop: 8, borderTop: "1px solid rgba(60,40,20,.10)", color: "#6b5d50" }}>
                  <b>Procedencia:</b> {c.proc} <span style={{ color: C.teal }}>{c.ref}</span>
                </div>
              </div>
            ))}
          </div>
        </header>

        {/* 01 RECURSOS: tabs tabla / gráficas / mapa */}
        <Seccion id="recursos" num="01" titulo="Base de recursos por proyecto">
          <p style={S.parr}>
            La minería y el petróleo cubanos no son una masa homogénea: son proyectos concretos con operadores, reservas certificadas (o no) y estados muy distintos. Explóralos de lo simple a lo profundo: gráficas, mapa interactivo y tabla detallada.
          </p>
          <div style={{ display: "flex", gap: 24, marginBottom: 20, borderBottom: "1px solid rgba(60,40,20,.15)", overflowX: "auto" }}>
            {[["graficas", "Gráficas"], ["mapa", "Mapa interactivo"], ["tabla", "Tabla"]].map(([k, t]) => (
              <button key={k} onClick={() => setTab(k)}
                style={{ paddingBottom: 8, fontSize: 13, fontWeight: 600, marginBottom: -1, whiteSpace: "nowrap", cursor: "pointer", background: "none", border: "none", borderBottom: tab === k ? `3px solid ${C.blue}` : "3px solid transparent", color: tab === k ? C.blue : C.sqGray }}>{t}</button>
            ))}
          </div>

          {tab === "tabla" && (
            <div style={S.tablaWrap}>
              <table style={S.tabla}>
                <thead><tr style={{ background: "#f5efe7" }}>
                  {["Proyecto", "Recurso", "Operador", "Estado", "Dato clave", "Fuente"].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {PROYECTOS.map((p) => (
                    <tr key={p.id} style={{ borderTop: "1px solid rgba(60,40,20,.10)", background: p.especial ? "#fbf1e4" : undefined }}>
                      <td style={{ ...S.td, ...S.nowrap, fontWeight: 500 }}>{p.nombre}</td>
                      <td style={{ ...S.td, ...S.nowrap }}>{p.recurso}</td>
                      <td style={S.td}>{p.operador}</td>
                      <td style={{ ...S.td, ...S.nowrap }}>{p.estado}</td>
                      <td style={{ ...S.td, color: "#4a3f36", minWidth: 220 }}>{p.dato}</td>
                      <td style={{ ...S.td, ...S.nowrap, color: C.sqGray }}>{p.fuente}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "graficas" && (
            <div style={S.grid(320)}>
              <div>
                <h3 style={S.h3}>Valor bruto teórico por recurso (verificable, $B)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={C40_VS_REAL.map((r) => ({ recurso: r.recurso, Bruto: r.verificable / 1000 }))} layout="vertical" margin={{ left: 0, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,40,20,.10)" />
                    <XAxis type="number" tickFormatter={fmtB} />
                    <YAxis type="category" dataKey="recurso" width={80} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={S.tt.c} itemStyle={S.tt.i} labelStyle={S.tt.l} formatter={(v) => `$${v}B bruto`} />
                    <Bar dataKey="Bruto" fill={C.blue} radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="Bruto" position="right" formatter={(v) => `$${v}B`} style={{ fontSize: 11 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p style={S.nota}>Bruto in situ, no VPN. Excluye el recurso offshore no descubierto ($368B condicionales).</p>
              </div>
              <div>
                <h3 style={S.h3}>Producción de níquel: capacidad histórica vs actual (kt/año)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={[
                    { etiqueta: "Histórica (~2011)", kt: 70 },
                    { etiqueta: "2016", kt: 65 },
                    { etiqueta: "2020", kt: 49 },
                    { etiqueta: "Potencial con inversión", kt: 90 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,40,20,.10)" />
                    <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip contentStyle={S.tt.c} itemStyle={S.tt.i} labelStyle={S.tt.l} formatter={(v) => `${v} kt Ni`} />
                    <Bar dataKey="kt" fill={C.teal} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="kt" position="top" style={{ fontSize: 11 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p style={S.nota}>El país produce muy por debajo de su potencial de reservas: descapitalización crónica [4][8]. La barra "potencial" es una estimación con inversión y gobernanza adecuadas.</p>
              </div>
            </div>
          )}

          {tab === "mapa" && <MapaCuba seleccion={proySel} onSelect={setProySel} />}
        </Seccion>

        {/* 02 CIFRAS C40 vs VERIFICABLE */}
        <Seccion id="c40" num="02" titulo="Las cifras originales del Proyecto C40, contrastadas">
          <p style={S.parr}>
            El proyecto declara un total de <b>$635.660M</b>. El contraste revela una doble distorsión: <b style={{ color: C.loss }}>infla el petróleo ×56</b> (valora 7.000 Mbbl como reserva cuando solo ~124 Mbbl están probados) y a la vez <b style={{ color: C.blue }}>subestima el níquel ×5</b> y el cobalto ×2 respecto al USGS. Esa incoherencia interna delata que la tabla no procede de una valoración geológica sino de un collage de cifras. Y el error de fondo lo empeora todo: multiplicar reservas por precio spot ignora costes, recuperación metalúrgica y descuento temporal.
          </p>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={C40_VS_REAL.map((r) => ({
              recurso: r.recurso,
              "Cifra C40": r.c40 / 1000,
              "Verificable (bruto)": r.verificable / 1000,
              "Condicional (no descubierto)": r.condicional / 1000,
            }))} margin={{ right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,40,20,.10)" />
              <XAxis dataKey="recurso" tick={{ fontSize: 12 }} />
              <YAxis scale="log" domain={[1, 1000]} tickFormatter={fmtB} allowDataOverflow />
              <Tooltip contentStyle={S.tt.c} itemStyle={S.tt.i} labelStyle={S.tt.l} formatter={(v) => (v > 0 ? `$${v}B` : "—")} />
              <Legend />
              <Bar dataKey="Cifra C40" fill={C.loss} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Verificable (bruto)" fill={C.blue} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Condicional (no descubierto)" fill={C.amber} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p style={{ ...S.nota, marginBottom: 16 }}>Eje logarítmico (miles de millones USD) para hacer visibles órdenes de magnitud dispares. "Condicional" = recurso offshore USGS técnicamente recuperable pero NO descubierto: no debe sumarse como riqueza disponible.</p>
          <div style={S.tablaWrap}>
            <table style={S.tabla}>
              <thead><tr style={{ background: "#f5efe7" }}>
                {["Recurso", "C40 (M$)", "Verificable (M$)", "Distorsión", "Explicación"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {C40_VS_REAL.map((r) => (
                  <tr key={r.recurso} style={{ borderTop: "1px solid rgba(60,40,20,.10)" }}>
                    <td style={{ ...S.td, fontWeight: 500 }}>{r.recurso}</td>
                    <td style={{ ...S.td, ...S.mono }}>{r.c40.toLocaleString("es-ES")}</td>
                    <td style={{ ...S.td, ...S.mono }}>{r.verificable.toLocaleString("es-ES")}{r.condicional ? ` (+${r.condicional.toLocaleString("es-ES")} cond.)` : ""}</td>
                    <td style={{ ...S.td, ...S.nowrap, fontWeight: 600, color: r.distorsion.startsWith("×") ? C.loss : r.distorsion.startsWith("÷") ? C.blue : C.sqGray }}>{r.distorsion}</td>
                    <td style={{ ...S.td, color: "#4a3f36", minWidth: 240 }}>{r.nota}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: "1px solid rgba(60,40,20,.15)", fontWeight: 600, background: "#fbf1e4" }}>
                  <td style={S.td}>TOTAL</td>
                  <td style={{ ...S.td, ...S.mono, color: C.loss }}>635.660</td>
                  <td style={{ ...S.td, ...S.mono, color: C.blue }}>≈170.660 (+368.000 cond.)</td>
                  <td style={{ ...S.td, color: C.loss }}>×3,7 sobre lo verificable</td>
                  <td style={{ ...S.td, fontSize: 12, fontWeight: 400, color: "#4a3f36" }}>Y en VPN real, la renta soberana disponible cae a $20–80B (sección 03)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Seccion>

        {/* 03 VALORACIÓN */}
        <Seccion id="valoracion" num="03" titulo="Del bruto in situ a la renta soberana">
          <p style={S.parr}>
            La cascada de valor: bruto teórico → proyectos comercialmente viables (VPN tras costes, CAPEX y descuento) → renta que efectivamente llega al Estado. Cada escalón divide por varias veces.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={VALORACION.map((v) => ({ nombre: v.concepto, Mínimo: v.min / 1000, Máximo: v.max / 1000 }))} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,40,20,.10)" />
              <XAxis type="number" tickFormatter={fmtB} />
              <YAxis type="category" dataKey="nombre" width={230} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={S.tt.c} itemStyle={S.tt.i} labelStyle={S.tt.l} formatter={(v) => `$${v.toLocaleString("es-ES")} mil M`} />
              <Legend />
              <Bar dataKey="Mínimo" fill={C.blue} radius={[0, 4, 4, 0]} />
              <Bar dataKey="Máximo" fill={C.teal} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Seccion>

        {/* 04 COMPARACIÓN */}
        <Seccion id="comparacion" num="04" titulo="Comparación multidimensional">
          <ResponsiveContainer width="100%" height={380}>
            <RadarChart data={RADAR}>
              <PolarGrid stroke="rgba(60,40,20,.15)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: C.ink }} />
              <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
              <Radar name="Cayo Romano" dataKey="cayoRomano" stroke={C.loss} fill={C.loss} fillOpacity={0.25} />
              <Radar name="Fondo soberano" dataKey="fondoSoberano" stroke={C.teal} fill={C.teal} fillOpacity={0.3} />
              <Legend /><Tooltip contentStyle={S.tt.c} itemStyle={S.tt.i} labelStyle={S.tt.l} />
            </RadarChart>
          </ResponsiveContainer>
          <p style={S.nota}>Escala 0–10 (valoración cualitativa del análisis; en "riesgo de corrupción" mayor = peor).</p>
        </Seccion>

        {/* 05 DiD */}
        <Seccion id="did" num="05" titulo="Diferencias en diferencias proyectado a 15 años" contrafactual>
          <p style={S.parr}>
            Tres trayectorias del PIB 2026–2041 bajo el <b>supuesto hipotético</b> de transición democrática en 2027, con el <i>status quo</i> como grupo de control. Ajusta los supuestos:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <Toggle label="Descubrimiento petrolero offshore (desde 2036)" value={petroleo} onChange={setPetroleo} onText="Sí" offText="No" />
            <Toggle label="Calidad de gobernanza" value={gobernanzaAlta} onChange={setGobernanzaAlta} onText="Alta" offText="Baja" />
          </div>
          <h3 style={S.h3}>PIB proyectado (miles de millones USD)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={serie} margin={{ right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,40,20,.10)" />
              <XAxis dataKey="anio" />
              <YAxis tickFormatter={fmtB} domain={["auto", "auto"]} />
              <Tooltip contentStyle={S.tt.c} itemStyle={S.tt.i} labelStyle={S.tt.l} formatter={(v) => `$${v}B`} />
              <Legend />
              <ReferenceLine x={2027} stroke={C.amber} strokeDasharray="4 4" label={{ value: "Transición (hipótesis)", fontSize: 11, fill: C.amber }} />
              <Line type="monotone" dataKey="pibStatusQuo" name="Status quo (control)" stroke={C.sqGray} strokeWidth={2} strokeDasharray="6 4" dot={false} />
              <Line type="monotone" dataKey="pibFondo" name="Transición + Fondo soberano" stroke={C.teal} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="pibCayo" name="Transición + Cayo Romano" stroke={C.loss} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ ...S.grid(320, 16), marginTop: 24 }}>
            <div>
              <h3 style={S.h3}>Estimador DiD (Δ PIB 2026→2041, $B)</h3>
              <div style={S.tablaWrap}>
                <table style={{ ...S.tabla, minWidth: 340 }}>
                  <thead><tr style={{ background: "#f5efe7" }}>
                    <th style={S.th}>Escenario</th><th style={{ ...S.th, textAlign: "right" }}>Δ propio</th><th style={{ ...S.th, textAlign: "right" }}>DiD vs control</th>
                  </tr></thead>
                  <tbody>
                    {did.map((r) => (
                      <tr key={r.escenario} style={{ borderTop: "1px solid rgba(60,40,20,.10)" }}>
                        <td style={S.td}>{r.escenario}</td>
                        <td style={{ ...S.td, ...S.mono, textAlign: "right" }}>+{r.delta}</td>
                        <td style={{ ...S.td, ...S.mono, textAlign: "right", fontWeight: 600, color: r.did > 0 ? C.teal : C.sqGray }}>{r.did > 0 ? `+${r.did}` : r.did}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ ...S.nota, marginTop: 8 }}>
                Advertencia metodológica: DiD <i>sintético prospectivo</i>; sin datos post-tratamiento reales, el estimador hereda íntegramente los supuestos del modelo (parámetros en <code>supuestosDiD</code> del JSON adjunto).
              </p>
            </div>
            <div>
              <h3 style={S.h3}>Renta soberana acumulada ($B)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={serie} margin={{ right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,40,20,.10)" />
                  <XAxis dataKey="anio" /><YAxis tickFormatter={fmtB} />
                  <Tooltip contentStyle={S.tt.c} itemStyle={S.tt.i} labelStyle={S.tt.l} formatter={(v) => `$${v}B`} /><Legend />
                  <Area type="monotone" dataKey="acumFondo" name="Fondo soberano" stroke={C.teal} fill={C.teal} fillOpacity={0.25} />
                  <Area type="monotone" dataKey="acumCayo" name="Cayo Romano (tras fuga 42%)" stroke={C.loss} fill={C.loss} fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: "8px 0 0" }}>Pérdida acumulada a 2041 por el 30% perpetuo + exclusividad: <b style={{ color: C.loss }}>${fin.perdidaAcum}B</b> en este escenario.</p>
            </div>
          </div>
        </Seccion>

        {/* 06 PÉRDIDAS */}
        <Seccion id="perdidas" num="06" titulo="El peso de la pérdida (Cayo Romano)">
          <div style={S.grid(300, 12)}>
            {PERDIDAS.map((p) => (
              <div key={p.dimension} style={{ ...S.card, borderColor: "#E4C6CB" }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                  <span style={{ fontWeight: 600, color: C.loss }}>{p.dimension}</span>
                  {p.vpEstimado && <span style={{ ...S.mono, fontSize: 13 }}>≈ ${(p.vpEstimado / 1000).toFixed(0)}B VPN</span>}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.55, margin: "4px 0 0", color: "#4a3f36" }}>{p.detalle}</p>
              </div>
            ))}
          </div>
          <p style={{ ...S.parr, marginTop: 16, marginBottom: 0 }}>
            La asimetría clave: si no aparece petróleo, EE.UU. limita su riesgo; si aparece, Cuba pierde una fracción enorme de un activo cuyo valor futuro puede superar con creces los ~$50.000M que el acuerdo dice cubrir. A esto se suma la pérdida de legitimidad: una república nacida cediendo territorio gobernaría bajo la acusación permanente de haber hipotecado el país.
          </p>
        </Seccion>

        {/* 07 OTROS CONTRAFACTUALES */}
        <Seccion id="otros-cf" num="07" titulo="Contrafactuales adicionales" contrafactual>
          <div style={S.grid(320)}>
            <div>
              <h3 style={S.h3}>CF-1 · Demanda de cobalto: migración a baterías LFP</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[
                  { anio: "2026", "Demanda alta (NMC domina)": 20, "Demanda baja (LFP domina)": 20 },
                  { anio: "2031", "Demanda alta (NMC domina)": 26, "Demanda baja (LFP domina)": 16 },
                  { anio: "2036", "Demanda alta (NMC domina)": 32, "Demanda baja (LFP domina)": 12 },
                  { anio: "2041", "Demanda alta (NMC domina)": 38, "Demanda baja (LFP domina)": 10 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,40,20,.10)" />
                  <XAxis dataKey="anio" /><YAxis tickFormatter={fmtB} />
                  <Tooltip contentStyle={S.tt.c} itemStyle={S.tt.i} labelStyle={S.tt.l} formatter={(v) => `$${v}B bruto`} /><Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Demanda alta (NMC domina)" fill={C.blue} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Demanda baja (LFP domina)" fill={C.amber} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p style={S.nota}>Valor bruto hipotético de la reserva de cobalto según la química de batería dominante en EV. Además, el cobalto cubano es subproducto del níquel: no se extrae solo.</p>
            </div>
            <div>
              <h3 style={S.h3}>CF-2 · Valor de opción turística de Cayo Romano</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={Array.from({ length: 16 }, (_, i) => {
                  const a = 2026 + i, t = Math.max(0, a - 2029);
                  return { anio: a, "Desarrollo cubano (10k hab.)": Math.round(Math.min(10, t * 0.9) * 10) / 10, "Cedido a EE.UU. (renta ≈ 0)": 0.2 };
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(60,40,20,.10)" />
                  <XAxis dataKey="anio" /><YAxis tickFormatter={(v) => `$${v}B/a`} />
                  <Tooltip contentStyle={S.tt.c} itemStyle={S.tt.i} labelStyle={S.tt.l} formatter={(v) => `$${v}B/año`} /><Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="Desarrollo cubano (10k hab.)" stroke={C.teal} strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Cedido a EE.UU. (renta ≈ 0)" stroke={C.loss} strokeWidth={2.5} strokeDasharray="5 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <p style={S.nota}>Facturación turística bruta hipotética retenida por Cuba: desarrollo propio en el corredor Jardines del Rey vs cesión perpetua. La cesión trata un activo con enorme valor de opción como terreno ocioso.</p>
            </div>
          </div>
          <div style={{ marginTop: 24, borderRadius: 20, padding: 16, background: "#FBEED7", border: `1px solid ${C.amber}` }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              <b>CF-3 (textual) · Sin transición:</b> el control implícito. Sin cambio político, la producción de níquel sigue declinando, el offshore permanece sin explorar y la renta soberana adicional es ≈ $0. <b>CF-4 (textual) · Intervención fallida:</b> si la fase militar deriva en insurgencia prolongada (patrón Irak), el coste supera los $15.000M declarados en uno o dos órdenes de magnitud, el boom de reconstrucción no llega y el PIB caería por debajo del status quo durante una década. No se grafica porque su dispersión es demasiado amplia para una curva única honesta.
            </p>
          </div>
        </Seccion>

        {/* 08 ENCUESTAS */}
        <Seccion id="encuestas" num="08" titulo="Encuestas">
          <div style={S.grid(320, 16)}>
            <EncuestaBloque pregunta="estrategia" titulo="¿Qué estrategia consideras superior para una Cuba en transición?"
              opciones={["Fondo soberano minero", "Proyecto Cayo Romano", "Híbrido: alianza temporal sin cesión", "Ninguna de las dos"]} />
            <EncuestaBloque pregunta="petroleo" titulo="¿Qué probabilidad das a un descubrimiento petrolero offshore comercial antes de 2040?"
              opciones={["Alta (>50%)", "Media (20–50%)", "Baja (<20%)"]} />
          </div>
        </Seccion>

        {/* 09 REFERENCIAS */}
        <Seccion id="refs" num="09" titulo="Referencias">
          <ol style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 13, lineHeight: 1.6 }}>
            {REFERENCIAS.map((r) => (
              <li key={r.id} style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                <span style={{ ...S.mono, color: C.teal, flexShrink: 0 }}>[{r.id}]</span>
                <span>
                  <a href={r.url} target="_blank" rel="noreferrer" style={{ textDecoration: "underline", color: C.blue, overflowWrap: "anywhere" }}>{r.titulo}</a>
                  <span style={{ color: C.sqGray }}> — {r.fuente}</span>
                </span>
              </li>
            ))}
          </ol>
          <p style={{ ...S.nota, marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(60,40,20,.15)" }}>
            Documento analítico. Los datos completos y su esquema de validación se distribuyen aparte como <code>datos-cuba.json</code> y <code>schema-cuba.json</code>. Todas las proyecciones marcadas con ⚠ son contrafactuales condicionados a supuestos explícitos y no constituyen predicción, asesoría de inversión ni posición política.
          </p>
        </Seccion>
      </main>
    </div>
  );
}
