import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import * as d3 from "d3";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ──────────────────────────────────────────────────────────────────────────
   MAÑANA ES 11J  ·  tema Yamacoa (convocatoria, quinto aniversario)
   Renderizador congelado. Los datos viven en /data/convocatoria_11j.json;
   aquí van incrustados como copia de respaldo por si el fetch falla.

   Registro editorial distinto al resto de Yamacoa: esta página es agitación
   declarada (quiere llenar plazas mañana), con la disciplina de fuentes
   intacta: cada convocatoria muestra su nivel de verificación y cada cifra
   lleva fuente y fecha de corte.

   Dependencias nuevas de este tema: react-leaflet + leaflet (mapa mundial).
   El CSS de Leaflet se importa arriba: es la única excepción al patrón de
   <style> embebido; conviven sin problema.
   ────────────────────────────────────────────────────────────────────────── */

/* ════════ CONFIG DEL RENDERIZADOR (no lo toca el agente) ═══════════════════ */

const DATA_URL = (typeof process !== "undefined" && process.env && process.env.PUBLIC_URL ? process.env.PUBLIC_URL : "") + "/data/convocatoria_11j.json";

// Paleta "Luz verde" (ficha de diseño jul-2026): verde señal + violeta eléctrico.
const COL = {
  bg: "#0B100D", panel: "#121A15", panel2: "#0E1511",
  line: "rgba(226,244,232,.12)", text: "#ECF4EE", dim: "#8FA396",
  green: "#32BD4E", greenHi: "#4ADE68", greenDim: "#1F7A36", greenSoft: "rgba(50,189,78,.16)",
  violet: "#AE5AD8", violetSoft: "rgba(174,90,216,.16)",
  desat: "#7FA88B",
};

// Leaflet en bundlers: las rutas de los PNG del icono por defecto no resuelven.
// Este tema usa exclusivamente DivIcon propios, pero se retira el resolutor
// roto por si algún plugin instanciara el icono por defecto.
delete L.Icon.Default.prototype._getIconUrl;

// Geometría real de Cuba (contorno de 42 puntos, patrón de la casa) para la
// sección histórica. La actividad la aporta el JSON (historia_2021.propagacion)
// fusionada por id contra LOC_GEO; un id desconocido se omite sin romper.
const CUBA_FEATURE = {
  type: "Feature",
  geometry: { type: "Polygon", coordinates: [[
    [-84.95,21.86],[-84.40,22.05],[-83.90,22.35],[-83.30,22.70],[-82.80,23.00],
    [-82.30,23.18],[-81.50,23.18],[-80.90,23.13],[-80.20,22.92],[-79.60,22.66],
    [-79.00,22.46],[-78.40,22.40],[-77.80,22.10],[-77.20,21.82],[-76.60,21.34],
    [-76.10,21.12],[-75.60,21.05],[-75.10,20.72],[-74.50,20.50],[-74.13,20.25],
    [-74.55,20.05],[-75.05,19.92],[-75.85,19.86],[-76.55,19.96],[-77.20,20.02],
    [-77.72,19.84],[-78.22,20.32],[-78.62,20.70],[-79.05,21.00],[-79.62,21.30],
    [-80.22,21.50],[-80.82,21.60],[-81.42,21.70],[-82.02,21.86],[-82.62,22.00],
    [-83.22,22.05],[-83.92,22.00],[-84.42,21.90],[-84.95,21.86],
  ]] },
};

// Localidades de la propagación de 2021 (lon, lat). El dataset decide cuáles
// se muestran, en qué orden y con qué texto.
const LOC_GEO = {
  san_antonio: [-82.499, 22.888],
  palma_soriano: [-75.996, 20.213],
  la_habana: [-82.383, 23.133],
  santiago_cuba: [-75.826, 20.024],
  cardenas: [-81.204, 23.037],
  pinar_rio: [-83.698, 22.417],
  camaguey: [-77.917, 21.379],
  holguin: [-76.263, 20.887],
  la_guinera: [-82.355, 23.020],
};

// Niveles de confianza: etiquetas y orden fijos del renderizador. celebrado
// comparte nivel con confirmado (es una confirmada que ya ocurrió).
const TIERS = [
  { id: "confirmado", label: "Confirmada" },
  { id: "reportado_no_verificado", label: "Reportada sin verificar" },
  { id: "plausible_no_confirmado", label: "Plausible, no confirmada" },
  { id: "especulativo", label: "Especulativa" },
];
const tierOf = (estado) => (estado === "celebrado" ? "confirmado" : estado);

// Encuesta: copy editorial del renderizador; los votos se suman al seed.
const SURVEY = [
  { id: "q1", q: "¿Cómo te sumarás a la jornada del 11 de julio?",
    opts: [
      { id: "a", t: "Asistiré a una convocatoria", seed: 87 },
      { id: "b", t: "Compartiré el mapa y las cifras", seed: 134 },
      { id: "c", t: "Seguiré la jornada e informaré", seed: 61 },
      { id: "d", t: "Esta vez no puedo", seed: 22 },
    ] },
];

/* ════════ PERSISTENCIA DE LA ENCUESTA ══════════════════════════════════════
   Tabla compartida poll_votes (ver ops/convocatoria_11j/poll_supabase.sql).
   Sin credenciales Supabase la encuesta funciona con localStorage. */
const POLL_BACKEND = {
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL || "",
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || "",
};
const HAS_SUPA = !!(POLL_BACKEND.supabaseUrl && POLL_BACKEND.supabaseAnonKey);
const NS = "c11j";
const LS_COUNTS = "c11j_poll_counts", LS_VOTED = "c11j_poll_voted";

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

const pollStore = {
  async results() {
    if (HAS_SUPA) {
      try {
        const r = await fetch(`${POLL_BACKEND.supabaseUrl}/rest/v1/poll_votes?select=question_id,option_id,votes&question_id=like.${NS}:*`,
          { headers: { apikey: POLL_BACKEND.supabaseAnonKey, Authorization: `Bearer ${POLL_BACKEND.supabaseAnonKey}` } });
        if (r.ok) {
          const out = {};
          for (const row of await r.json()) {
            const qid = row.question_id.slice(NS.length + 1);
            if (!out[qid]) out[qid] = {};
            out[qid][row.option_id] = Number(row.votes) || 0;
          }
          return out;
        }
      } catch {}
    }
    return lsGet(LS_COUNTS, {});
  },
  async vote(qid, oid) {
    if (HAS_SUPA) {
      try {
        await fetch(`${POLL_BACKEND.supabaseUrl}/rest/v1/rpc/poll_increment`, {
          method: "POST",
          headers: { apikey: POLL_BACKEND.supabaseAnonKey, Authorization: `Bearer ${POLL_BACKEND.supabaseAnonKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ q: `${NS}:${qid}`, o: oid }),
        });
        return;
      } catch {}
    }
    const c = lsGet(LS_COUNTS, {});
    if (!c[qid]) c[qid] = {};
    c[qid][oid] = (c[qid][oid] || 0) + 1;
    lsSet(LS_COUNTS, c);
  },
};

/* ════════ DATASET DE RESPALDO (espejo byte a byte de convocatoria_11j.json) ═ */
const EMBEDDED = {
 "meta": {
  "slug": "convocatoria_11j",
  "titulo": "Mañana es 11J",
  "subtitulo": "Quinto aniversario de las protestas del 11 de julio de 2021: dónde y a qué hora sale el mundo a la calle por Cuba, y por qué importa que estés.",
  "actualizado": "2026-07-10",
  "evento_fecha": "2026-07-11",
  "modo": "convocatoria",
  "nota_registro": "Esta página es una convocatoria: su objetivo declarado es que mañana haya más gente en la calle. Es un registro distinto al del resto de Yamacoa, que observa y mide sin llamar a nada. Lo que no cambia es la disciplina de fuentes: cada convocatoria muestra su nivel de verificación (confirmada, reportada sin verificar, plausible o especulativa) y cada cifra lleva su fuente y su fecha de corte. Agitar no es excusa para inflar.",
  "fuentes": [
   "CubaNet",
   "Diario Las Américas",
   "Árbol Invertido",
   "14ymedio",
   "CiberCuba",
   "Center for a Free Cuba",
   "Prisoners Defenders",
   "Consorcio Justicia",
   "Justicia 11J",
   "OCDH",
   "Cecilia Bobes (FLACSO México)",
   "Amnistía Internacional",
   "Infobae",
   "El Estornudo",
   "Martí Noticias"
  ],
  "descripcion": "Página especial de convocatoria por el quinto aniversario de las protestas del 11 de julio de 2021 en Cuba. Reúne las manifestaciones convocadas para el 11 de julio de 2026 en ciudades de América y Europa, cada una con su nivel de verificación explícito: cuatro confirmadas por prensa independiente (dos en Miami, una en Madrid y una en Washington D. C.), dos reportadas por usuarios sin confirmación independiente de prensa (Montevideo y West New York, esta última con volante oficial del convocante), tres plausibles sin confirmar (Houston, Santiago de Chile y Montreal) y dos especulativas (Gijón y un Kornmarkt alemán sin ciudad identificada). Incluye la reconstrucción de la propagación de las protestas originales del 11 y 12 de julio de 2021, desde San Antonio de los Baños hasta más de cincuenta localidades de las quince provincias y la Isla de la Juventud; las cifras de represión al cierre del primer semestre de 2026 según Prisoners Defenders, el Consorcio Justicia, Justicia 11J y el OCDH; el caso de Luis Manuel Otero Alcántara, con condena vencida y paradero desconocido, denunciado como desaparición forzada por Amnistía Internacional; y una primera cohorte nominal de treinta personas que siguen presas o bajo medidas penales cinco años después del 11J.",
  "narracion": "Mañana se cumplen cinco años del once de julio de dos mil veintiuno, el día en que Cuba entera salió a la calle. Empezó por la mañana en San Antonio de los Baños, un pueblo de Artemisa, con una transmisión en directo por Facebook que el régimen castigó después con seis años de cárcel. Antes del anochecer la protesta había llegado a Palma Soriano, a La Habana, a Santiago de Cuba, a Cárdenas, a Pinar del Río; en total, a más de cincuenta localidades de las quince provincias y la Isla de la Juventud. Fueron las mayores protestas antigubernamentales desde mil novecientos cincuenta y nueve. Un hombre, Diubis Laurencio Tejeda, murió por un disparo policial en La Güinera. Las detenciones documentadas se cuentan por centenares y, según la fecha del recuento, superan el millar y medio. Cinco años después, la maquinaria sigue en marcha. Al cierre de junio de dos mil veintiséis, Prisoners Defenders contaba mil trescientos seis presos políticos en las cárceles cubanas, un récord absoluto; más de dos mil cien personas han pasado por esa condición desde el once de julio. Al menos trescientos treinta y ocho de los presos actuales siguen vinculados directamente a aquellas protestas. Cuarenta personas de la lista actual fueron detenidas siendo menores de edad. Solo en el primer semestre de este año hubo más de ciento setenta y cinco nuevos presos políticos, y el Observatorio Cubano de Derechos Humanos documentó al menos mil novecientas cuarenta y nueve acciones represivas. Y sin embargo la calle no se ha rendido: el registro de la investigadora Cecilia Bobes cuenta al menos trescientas cuarenta y dos protestas en Cuba en lo que va de año, más que en los tres años anteriores juntos. El caso que resume el momento es el del artista Luis Manuel Otero Alcántara: su condena venció el nueve de julio, pero dos días antes fue sacado de la prisión de Guanajay hacia un paradero que nadie conoce. Amnistía Internacional lo denuncia como desaparición forzada. Mañana, once de julio, la diáspora vuelve a la calle. Hay marchas y vigilias confirmadas en Miami, en Madrid y en Washington; hay convocatorias reportadas o plausibles en Montevideo, West New York, Houston, Santiago de Chile y Montreal. Esta página muestra cada una con su nivel de verificación, porque la honestidad con las fuentes es la marca de la casa incluso cuando el objetivo es llenar una plaza. Si hay una convocatoria cerca de ti, asiste. Si no la hay, comparte esta página, verifica antes de difundir y acompaña a los que sí pueden ir. La evidencia comparada lo dice con claridad: la resistencia civil pacífica y masiva es la vía que derriba dictaduras. Cinco años después, los nombres de los presos siguen teniendo rostro. Que mañana nadie pueda decir que no lo sabía.",
  "narracion_en": "Tomorrow marks five years since July eleventh, twenty twenty-one, the day all of Cuba took to the streets. It began in the morning in San Antonio de los Baños, a town in Artemisa, with a Facebook live stream that the regime later punished with six years in prison. Before nightfall the protest had reached Palma Soriano, Havana, Santiago de Cuba, Cárdenas and Pinar del Río; in all, more than fifty towns across the fifteen provinces and the Isle of Youth. They were the largest anti-government protests since nineteen fifty-nine. One man, Diubis Laurencio Tejeda, was killed by a police gunshot in La Güinera. Documented arrests number in the hundreds and, depending on the date of the count, exceed fifteen hundred. Five years on, the machinery is still running. At the close of June twenty twenty-six, Prisoners Defenders counted one thousand three hundred and six political prisoners in Cuban jails, an absolute record; more than two thousand one hundred people have passed through that condition since July eleventh. At least three hundred and thirty-eight of the current prisoners remain directly linked to those protests. Forty people on the current list were minors when detained. In the first half of this year alone there were more than one hundred and seventy-five new political prisoners, and the Cuban Observatory for Human Rights documented at least one thousand nine hundred and forty-nine repressive actions. And yet the street has not surrendered: researcher Cecilia Bobes has recorded at least three hundred and forty-two protests in Cuba so far this year, more than in the previous three years combined. The case that sums up the moment is that of artist Luis Manuel Otero Alcántara: his sentence expired on July ninth, but two days earlier he was taken from Guanajay prison to a location nobody knows. Amnesty International has denounced it as an enforced disappearance. Tomorrow, July eleventh, the diaspora returns to the streets. There are confirmed marches and vigils in Miami, Madrid and Washington; there are reported or plausible calls in Montevideo, West New York, Houston, Santiago de Chile and Montreal. This page shows each one with its level of verification, because honesty with sources is the house rule even when the goal is to fill a square. If there is a rally near you, attend. If there is not, share this page, verify before spreading, and stand with those who can go. The comparative evidence is clear: massive, peaceful civil resistance is the path that brings down dictatorships. Five years later, the prisoners' names still have faces. Let no one say tomorrow that they did not know."
 },
 "kpis": [
  {
   "id": "aniversario",
   "valor": "5 años",
   "etiqueta": "del estallido del 11 de julio de 2021"
  },
  {
   "id": "confirmadas",
   "valor": "4",
   "etiqueta": "convocatorias confirmadas para mañana (Miami ×2, Madrid, Washington)",
   "fuente": "prensa independiente, ver mapa"
  },
  {
   "id": "presos11j",
   "valor": "≥338",
   "etiqueta": "presos actuales vinculados directamente al 11J",
   "fuente": "Justicia 11J, jul 2026"
  },
  {
   "id": "protestas2026",
   "valor": "≥342",
   "etiqueta": "protestas en Cuba en lo que va de 2026",
   "fuente": "registro de Cecilia Bobes, FLACSO México"
  }
 ],
 "convocatorias": [
  {
   "id": "miami_cuban_freedom_march",
   "nombre": "Cuban Freedom March: «Acciones, no palabras»",
   "ciudad": "Miami",
   "pais": "Estados Unidos",
   "lugar": "Calle Ocho, desde las inmediaciones de la Casa del Preso",
   "fecha": "2026-07-11",
   "hora_inicio": "17:00",
   "hora_fin": "18:00",
   "tipo": "marcha",
   "organizadores": [
    "Cuban Freedom March",
    "Alián Collazo (director ejecutivo)"
   ],
   "estado": "confirmado",
   "verificacion": "Confirmada por CubaNet y WLRN. Concentración a las 17:00; la marcha en sí arranca hacia las 17:30.",
   "fuente": "https://www.cubanet.org/acciones-no-palabras-convocan-en-miami-una-marcha-por-el-quinto-aniversario-del-11j/",
   "geo": {
    "lat": 25.7656,
    "lon": -80.2264,
    "precision": "ciudad"
   }
  },
  {
   "id": "miami_liberation_day_rally",
   "nombre": "Liberation Day Rally Miami",
   "ciudad": "Miami",
   "pais": "Estados Unidos",
   "lugar": "1444 SW 8th St (frente al Parque del Dominó / Parque Máximo Gómez), La Pequeña Habana",
   "fecha": "2026-07-11",
   "hora_inicio": "18:00",
   "hora_fin": "22:00",
   "tipo": "concentracion",
   "organizadores": [
    "Ciudad de Miami",
    "Comisionado del distrito 3, Miguel Ángel Gabela Escalona",
    "Movimiento Somos+"
   ],
   "estado": "confirmado",
   "verificacion": "Confirmada por Diario Las Américas. Parte de una jornada más amplia de 13:00 a 22:00 con exposiciones y actos culturales cerca del Tower Theater.",
   "fuente": "https://www.diariolasamericas.com/florida/exilio-cubano-marcha-este-sabado-la-pequena-habana-quinto-aniversario-del-11j-n5398619",
   "notas": "Jornada completa desde las 13:00; el acto central va de 18:00 a 22:00.",
   "geo": {
    "lat": 25.7657,
    "lon": -80.2193,
    "precision": "local"
   }
  },
  {
   "id": "madrid_puerta_del_sol",
   "nombre": "Jornada pública «Hoy puede ser un 11J»",
   "ciudad": "Madrid",
   "pais": "España",
   "lugar": "Puerta del Sol",
   "fecha": "2026-07-11",
   "hora_inicio": "14:00",
   "hora_fin": "20:00",
   "tipo": "concentracion",
   "organizadores": [
    "Partido Liberal Clásico Cubano (Amelia Calzadilla)",
    "Disidencias en Movimiento",
    "Somos+"
   ],
   "programa": [
    "Mesas informativas",
    "Intervenciones políticas",
    "Performance «Mi Bandera» (Rafael Vilches, Alberto Lorente, Avana de la Torre), por la tarde",
    "Lectura de poesía a cargo de Rafael Vilches, 18:00",
    "Concierto de cierre de jóvenes cubanos"
   ],
   "estado": "confirmado",
   "verificacion": "Confirmada por Árbol Invertido. El marco general (Puerta del Sol, 14:00 a 20:00) está verificado; los horarios internos del programa varían ligeramente entre fuentes.",
   "fuente": "https://www.arbolinvertido.com/sociedad/jornada-11j-en-madrid-exilio-cubano-celebra-la-rebeldia",
   "geo": {
    "lat": 40.4169,
    "lon": -3.7035,
    "precision": "local"
   }
  },
  {
   "id": "washington_vigilia_embajada",
   "nombre": "Vigilia frente a la Embajada de Cuba",
   "ciudad": "Washington D. C.",
   "pais": "Estados Unidos",
   "lugar": "Embajada de Cuba, 2630 16th St NW",
   "fecha": "2026-07-11",
   "hora_inicio": "19:00",
   "hora_fin": null,
   "tipo": "vigilia",
   "organizadores": [
    "Center for a Free Cuba",
    "Students for Liberty"
   ],
   "estado": "confirmado",
   "verificacion": "Confirmada por el CubaBrief del Center for a Free Cuba (7 de julio de 2026).",
   "fuente": "https://cubacenter.org/cuba-brief/2026/07/07/cubabrief-remembering-what-happened-in-cuba-on-the-fifth-anniversary-of-the-11j-protests-and-a-call-to-nonviolent-civic-action/",
   "geo": {
    "lat": 38.9243,
    "lon": -77.0364,
    "precision": "local"
   }
  },
  {
   "id": "madrid_conversatorio_previo",
   "nombre": "Conversatorio «Cinco años después: memoria, resistencia y libertad»",
   "ciudad": "Madrid",
   "pais": "España",
   "lugar": "Centro Social Comunitario Casa del Cura, Plaza del Dos de Mayo 1",
   "fecha": "2026-07-09",
   "hora_inicio": "17:00",
   "hora_fin": "19:00",
   "tipo": "conversatorio",
   "organizadores": [
    "Sociedad civil cubana en el exilio"
   ],
   "estado": "celebrado",
   "verificacion": "Acto previo ya celebrado, parte de la jornada triple que culmina el 11 de julio en Puerta del Sol.",
   "fuente": "https://www.14ymedio.com/cartelera/cinco-anos-despues-11j-memoria_1_1128196.html",
   "geo": {
    "lat": 40.4272,
    "lon": -3.7043,
    "precision": "local"
   }
  },
  {
   "id": "madrid_coloquio_internacional",
   "nombre": "Coloquio internacional «Retos para la Cuba que viene»",
   "ciudad": "San Sebastián de los Reyes (Madrid)",
   "pais": "España",
   "lugar": "Casa de la Libertad de Cuba, Calle Lanzarote 22",
   "fecha": "2026-07-10",
   "hora_inicio": "17:00",
   "hora_fin": null,
   "tipo": "coloquio",
   "organizadores": [
    "Partido Liberal Clásico Cubano",
    "Disidencias en Movimiento",
    "Somos+"
   ],
   "estado": "celebrado",
   "verificacion": "Acto previo del 10 de julio, con aforo limitado e inscripción previa; moderó el Dr. Antonio Guedes.",
   "fuente": "https://www.arbolinvertido.com/sociedad/jornada-11j-en-madrid-exilio-cubano-celebra-la-rebeldia",
   "geo": {
    "lat": 40.5473,
    "lon": -3.6262,
    "precision": "ciudad"
   }
  },
  {
   "id": "montevideo_explanada_intendencia",
   "nombre": "Concentración por el 11J",
   "ciudad": "Montevideo",
   "pais": "Uruguay",
   "lugar": "Explanada de la Intendencia de Montevideo",
   "fecha": "2026-07-11",
   "hora_inicio": "16:30",
   "hora_fin": null,
   "tipo": "concentracion",
   "organizadores": [
    "Comunidad cubana en Uruguay (probable: Cubanos Libres en Uruguay)",
    "Comité Uruguayo por la Democracia en Cuba (según segunda fuente aportada)",
    "RED Uruguaya por la Libertad (según segunda fuente aportada)"
   ],
   "estado": "reportado_no_verificado",
   "verificacion": "Dato aportado por usuario en dos ocasiones con hora y ubicación no coincidentes (16:30 en la Explanada; 15:00 en Plaza Independencia o «18 y Ejido»). Sin cobertura de prensa que lo confirme de forma independiente; plausible por el patrón de la zona (la comunidad cubana exiliada se concentra habitualmente allí, con movilizaciones documentadas en febrero, marzo y mayo de 2026).",
   "fuente": null,
   "fuentes_contexto": [
    "https://www.infobae.com/america/america-latina/2026/03/03/cubanos-se-movilizaron-en-uruguay-pidiendo-ayuda-humanitaria-y-libertad-de-presos-politicos-la-dictadura-va-a-caer/",
    "https://www.cibercuba.com/noticias/2026-05-30-u1-e208574-s27061-nid330743-tensa-protesta-montevideo-enfrenta-exiliados-cubanos",
    "https://www.subrayado.com.uy/cubanos-montevideo-se-movilizaron-contra-el-regimen-cuba-participaron-politicos-la-oposicion-n1001155"
   ],
   "geo": {
    "lat": -34.9066,
    "lon": -56.1852,
    "precision": "local"
   }
  },
  {
   "id": "houston_plaza_americas",
   "nombre": "Caravana por la Libertad",
   "ciudad": "Houston",
   "pais": "Estados Unidos",
   "lugar": "Plaza Americas Mall, 7500 Bellaire Blvd",
   "fecha": "2026-07-11",
   "hora_inicio": "10:00",
   "hora_fin": null,
   "tipo": "caravana",
   "organizadores": [
    "Comunidad cubana de Houston"
   ],
   "estado": "plausible_no_confirmado",
   "verificacion": "La comunidad cubana de Houston organiza caravanas por la libertad de Cuba de forma recurrente y documentada durante 2026 (marzo de 2026, cobertura de CiberCuba y redes). No se encontró confirmación específica de esta convocatoria del 11 de julio con esa dirección y hora.",
   "fuente": null,
   "geo": {
    "lat": 29.7047,
    "lon": -95.5413,
    "precision": "local"
   }
  },
  {
   "id": "santiago_chile_embajada",
   "nombre": "Manifestación frente a la Embajada de Cuba",
   "ciudad": "Santiago",
   "pais": "Chile",
   "lugar": "Embajada de Cuba, Av. Los Leones 1346, Providencia",
   "fecha": "2026-07-11",
   "hora_inicio": "17:00",
   "hora_fin": null,
   "tipo": "manifestacion",
   "organizadores": [
    "Comunidad cubana en Chile"
   ],
   "estado": "plausible_no_confirmado",
   "verificacion": "La dirección es real y verificada (sede de la embajada cubana), con precedente documentado de protesta cubana exactamente en ese lugar en 2021. Sin confirmación de prensa específica para el 11 de julio de 2026.",
   "fuente": null,
   "geo": {
    "lat": -33.4315,
    "lon": -70.6044,
    "precision": "local"
   }
  },
  {
   "id": "montreal_sainte_catherine",
   "nombre": "Manifestación de la comunidad cubana",
   "ciudad": "Montreal",
   "pais": "Canadá",
   "lugar": "1134 Sainte-Catherine St. West",
   "fecha": "2026-07-11",
   "hora_inicio": "14:00",
   "hora_fin": null,
   "tipo": "manifestacion",
   "organizadores": [
    "Cubanos en Canadá (Montreal)"
   ],
   "estado": "plausible_no_confirmado",
   "verificacion": "La comunidad «Cubanos en Canadá» de Montreal organiza marchas recurrentes y documentadas (precedente: marcha de apoyo al 15N). Sin confirmación específica para el 11 de julio de 2026 en esta dirección.",
   "fuente": null,
   "geo": {
    "lat": 45.4977,
    "lon": -73.5713,
    "precision": "local"
   }
  },
  {
   "id": "west_new_york_jose_marti_memorial",
   "nombre": "Conmemoración del quinto aniversario del 11J",
   "ciudad": "West New York (Nueva Jersey)",
   "pais": "Estados Unidos",
   "lugar": "José Martí Memorial (Veterans Memorial Park), 54th Street y Boulevard East, West New York, NJ",
   "fecha": "2026-07-11",
   "hora_inicio": "19:00",
   "hora_fin": null,
   "tipo": "conmemoracion",
   "organizadores": [
    "Unión de Expresos Políticos Cubanos (el material aportado dice JEPPC), zonas de Nueva Jersey, Nueva York y Connecticut"
   ],
   "estado": "reportado_no_verificado",
   "verificacion": "Respaldada por el volante promocional oficial del convocante, aportado directamente por usuario (imagen, sin URL pública): fuente primaria en tipo, pero sin corroboración de prensa independiente al 10 de julio (habitual en convocatorias locales antes del evento). Verificado de forma independiente: el José Martí Memorial de Boulevard East y 54th Street es un monumento real, punto de encuentro conocido de la comunidad cubana de la zona, y la organización existe con publicación propia (ueppc.com; la sigla del volante, JEPPC, parece errata de UEPPC).",
   "fuente": null,
   "fuentes_contexto": [
    "https://www.ueppc.com/clarinadas-suplementos/",
    "https://www.flickr.com/photos/wallyg/1817405179"
   ],
   "notas": "West New York figuraba hasta hoy entre las ciudades con redes activas sin convocatoria localizada; este volante la mueve a convocatoria reportada.",
   "geo": {
    "lat": 40.7813,
    "lon": -74.0082,
    "precision": "local"
   }
  },
  {
   "id": "gijon_asturias",
   "nombre": "Marcha por la libertad de Cuba",
   "ciudad": "Gijón (Asturias)",
   "pais": "España",
   "lugar": "Lugar no especificado",
   "fecha": "2026-07-11",
   "hora_inicio": null,
   "hora_fin": null,
   "tipo": "marcha",
   "estado": "especulativo",
   "verificacion": "Sin búsqueda dirigida adicional; sin verificación propia. Ni hora ni lugar concretos.",
   "fuente": null,
   "geo": {
    "lat": 43.5322,
    "lon": -5.6611,
    "precision": "ciudad"
   }
  },
  {
   "id": "alemania_kornmarkt",
   "nombre": "Protesta por los derechos humanos en Cuba",
   "ciudad": "Ciudad no identificada",
   "pais": "Alemania",
   "lugar": "Kornmarkt (plaza común a varias ciudades alemanas, p. ej. Heidelberg o Coblenza)",
   "fecha": "2026-07-11",
   "hora_inicio": "11:30",
   "hora_fin": "15:00",
   "tipo": "protesta",
   "estado": "especulativo",
   "verificacion": "Búsqueda dirigida sin resultados relevantes. No se pudo identificar con certeza en qué ciudad alemana estaría este Kornmarkt, así que no aparece en el mapa.",
   "fuente": null,
   "geo": null
  }
 ],
 "ciudades_en_duda": [
  {
   "ciudad": "Barcelona",
   "pais": "España",
   "nota": "Patrón histórico consistente (2021, 2022): concentraciones frente al Consulado cubano en Passeig de Gràcia. Nada específico localizado para 2026."
  },
  {
   "ciudad": "Berlín",
   "pais": "Alemania",
   "nota": "Apareció en convocatorias globales de aniversarios anteriores del 11J. Nada específico localizado para 2026."
  },
  {
   "ciudad": "Estocolmo",
   "pais": "Suecia",
   "nota": "Participó en la jornada coordinada de la diáspora del 28 de febrero de 2026 (red activa verificada), pero sin convocatoria específica localizada para el 11 de julio."
  },
  {
   "ciudad": "Toronto y Calgary",
   "pais": "Canadá",
   "nota": "Participaron en la jornada coordinada del 28 de febrero de 2026. Nada específico localizado para el 11 de julio."
  },
  {
   "ciudad": "Ciudad de México, Panamá y Buenos Aires",
   "pais": "Latinoamérica",
   "nota": "Aparecieron en convocatorias globales de aniversarios anteriores. Nada específico localizado para 2026."
  },
  {
   "ciudad": "Tampa y Union City",
   "pais": "Estados Unidos",
   "nota": "Comunidades cubanas históricas con activismo regular (caravana en Tampa en marzo de 2026). Nada específico localizado para el 11 de julio."
  },
  {
   "ciudad": "Oslo",
   "pais": "Noruega",
   "nota": "Actividad cubana de derechos humanos reciente y verificada (Oslo Freedom Forum, junio de 2026, con la exposición «Doors to Freedom»), pero sin convocatoria del 11 de julio."
  },
  {
   "ciudad": "Ginebra y Bruselas",
   "pais": "Suiza / Bélgica",
   "nota": "Sedes habituales de incidencia ante la ONU y las instituciones europeas en otras fechas. Nada específico para el 11 de julio de 2026."
  }
 ],
 "historia_2021": {
  "resumen": {
   "texto": "El 11 de julio de 2021, decenas de miles de cubanos salieron a la calle en la mayor ola de protestas antigubernamentales desde 1959. Empezó a media mañana en San Antonio de los Baños, transmitida en directo por Facebook, y antes del anochecer se había extendido por toda la isla. El régimen respondió con cortes de internet, despliegue de fuerzas especiales y una ola de juicios ejemplarizantes que aún no termina.",
   "localidades": "más de 50 localidades",
   "provincias": "las 15 provincias y la Isla de la Juventud",
   "fuente": "El Estornudo · Diario de Cuba · Race and Equality · cobertura agregada de aniversarios"
  },
  "propagacion": [
   {
    "id": "san_antonio",
    "orden": 1,
    "dia": "2021-07-11",
    "nombre": "San Antonio de los Baños (Artemisa)",
    "hora_aprox": "10:00–11:00",
    "texto": "El origen. Vecinos se concentran en el Parque de la Iglesia y avanzan por la calle Real al grito de «libertad». Yoan de la Cruz lo transmite en directo por Facebook; esa transmisión enciende la isla y le costó una condena de 6 años.",
    "fuente": "El Estornudo · Martí Noticias"
   },
   {
    "id": "palma_soriano",
    "orden": 2,
    "dia": "2021-07-11",
    "nombre": "Palma Soriano (Santiago de Cuba)",
    "hora_aprox": "mediodía",
    "texto": "Casi simultánea a San Antonio: la protesta estalla en el otro extremo de la isla antes de que el directo original termine de circular.",
    "fuente": "Diario de Cuba"
   },
   {
    "id": "la_habana",
    "orden": 3,
    "dia": "2021-07-11",
    "nombre": "La Habana",
    "hora_aprox": "tarde",
    "texto": "Miles marchan hacia el Capitolio y el Malecón. Las imágenes de la multitud frente al Capitolio dan la vuelta al mundo mientras el régimen corta el acceso a internet móvil.",
    "fuente": "cobertura internacional del 11J"
   },
   {
    "id": "santiago_cuba",
    "orden": 4,
    "dia": "2021-07-11",
    "nombre": "Santiago de Cuba",
    "hora_aprox": "tarde",
    "texto": "La segunda ciudad del país se suma con protestas masivas en el centro urbano.",
    "fuente": "cobertura internacional del 11J"
   },
   {
    "id": "cardenas",
    "orden": 5,
    "dia": "2021-07-11",
    "nombre": "Cárdenas (Matanzas)",
    "hora_aprox": "tarde",
    "texto": "Una de las protestas más intensas fuera de las capitales: la multitud vuelca un patrullero. Matanzas, epicentro entonces de la crisis sanitaria, aporta varias de las condenas más duras.",
    "fuente": "cobertura internacional del 11J"
   },
   {
    "id": "pinar_rio",
    "orden": 6,
    "dia": "2021-07-11",
    "nombre": "Pinar del Río",
    "hora_aprox": "tarde",
    "texto": "El extremo occidental se suma: la protesta ya cubre la isla de punta a punta.",
    "fuente": "cobertura internacional del 11J"
   },
   {
    "id": "camaguey",
    "orden": 7,
    "dia": "2021-07-11",
    "nombre": "Camagüey",
    "hora_aprox": "tarde",
    "texto": "Protestas en la ciudad y en municipios del interior; el centro de la isla replica el estallido.",
    "fuente": "cobertura internacional del 11J"
   },
   {
    "id": "holguin",
    "orden": 8,
    "dia": "2021-07-11",
    "nombre": "Holguín",
    "hora_aprox": "tarde",
    "texto": "El oriente se multiplica: Holguín registra varias concentraciones el mismo día.",
    "fuente": "cobertura internacional del 11J"
   },
   {
    "id": "la_guinera",
    "orden": 9,
    "dia": "2021-07-12",
    "nombre": "La Güinera (Arroyo Naranjo, La Habana)",
    "hora_aprox": "tarde",
    "texto": "Al día siguiente, en este barrio popular del sur de La Habana, la policía dispara contra los manifestantes: muere Diubis Laurencio Tejeda, de 36 años, el único fallecido confirmado de la ola de protestas. El agente que disparó no fue procesado.",
    "fuente": "Diario de Cuba · CiberCuba · elTOQUE"
   }
  ],
  "muerte": {
   "nombre": "Diubis Laurencio Tejeda",
   "lugar": "La Güinera, Arroyo Naranjo (La Habana)",
   "fecha": "2021-07-12",
   "texto": "Único fallecido confirmado de las protestas, por disparo policial. La fiscalía archivó el caso como «legítima defensa»; elTOQUE documentó que el disparo no la justificaba.",
   "fuente": "Diario de Cuba · CiberCuba · elTOQUE"
  },
  "detenciones": {
   "cifra": "entre ~1.300 y ~1.900 según la fecha del recuento",
   "fuente": "Justicia 11J / Cubalex (1.484 registradas, 1.297 verificadas en el primer recuento; reportes posteriores hablan de al menos 1.600)",
   "nota": "No existe una cifra única y estable de detenciones del 11J: cada recuento tiene su fecha y su método. Se muestra el rango completo en vez de fingir precisión."
  }
 },
 "cifras": {
  "corte": "primer semestre de 2026 (informes del 30 de junio y el 9 de julio)",
  "bloques": [
   {
    "id": "presos_activos",
    "valor": "1.306",
    "etiqueta": "presos políticos en Cuba al cierre de junio de 2026, récord absoluto",
    "detalle": "El récord anterior era 1.260 en abril: son dos lecturas de la misma serie mensual, no una horquilla del mismo instante.",
    "fuente": "Prisoners Defenders",
    "fecha_corte": "2026-06-30 (informe 2026-07-09)"
   },
   {
    "id": "acumulado",
    "valor": "2.112",
    "etiqueta": "presos políticos totalizados desde el 1 de julio de 2021",
    "detalle": "1.965 llegaron a ingresar en prisión.",
    "fuente": "Prisoners Defenders",
    "fecha_corte": "2026-06-30"
   },
   {
    "id": "vinculados_11j",
    "valor": "≥338",
    "etiqueta": "presos actuales vinculados directamente al 11J",
    "detalle": "Justicia 11J cifra 337–338; Amnistía Internacional habla de más de 300. Se muestra el suelo mejor documentado.",
    "fuente": "Justicia 11J · Amnistía Internacional",
    "fecha_corte": "jul 2026"
   },
   {
    "id": "nuevos_s1",
    "valor": ">175",
    "etiqueta": "nuevos presos políticos en el primer semestre de 2026",
    "detalle": "114 vinculados a protesta, expresión o asociación: 79 por protesta, 22 por vigilancia digital, 13 otros.",
    "fuente": "Prisoners Defenders + Consorcio Justicia",
    "fecha_corte": "2026-06-30"
   },
   {
    "id": "menores_acumulado",
    "valor": "40",
    "etiqueta": "personas de la lista actual detenidas siendo menores de edad",
    "detalle": "38 varones y 2 mujeres; 16 siguen en prisiones de adultos. Cifra acumulada de la lista vigente, no del semestre.",
    "fuente": "Prisoners Defenders",
    "fecha_corte": "2026-06-30 (informe 2026-07-09)"
   },
   {
    "id": "menores_nuevos",
    "valor": "9",
    "etiqueta": "menores entre los nuevos presos por protesta o expresión del semestre",
    "detalle": "Cuatro de 15 años, dos de 16 y tres de 17. Es un subconjunto de los 114 nuevos casos, distinto de los 40 acumulados.",
    "fuente": "Prisoners Defenders + Consorcio Justicia",
    "fecha_corte": "2026-06-30"
   },
   {
    "id": "ocdh",
    "valor": "≥1.949",
    "etiqueta": "acciones represivas documentadas en el primer semestre de 2026",
    "detalle": "257 detenciones arbitrarias, 488 arrestos domiciliarios ilegales, al menos 300 acciones dentro de prisiones y 91 casos contra periodistas independientes.",
    "fuente": "OCDH",
    "fecha_corte": "2026-06-30 (difundido 2026-07-07)"
   },
   {
    "id": "protestas_2026",
    "valor": "≥342",
    "etiqueta": "protestas registradas en Cuba en lo que va de 2026, más que en los tres años anteriores juntos",
    "detalle": "Registro personal de una investigadora, no estadística institucional de OCDH u OCC: se marca como tal.",
    "fuente": "Cecilia Bobes (FLACSO México), vía Infobae",
    "fecha_corte": "2026-07-10"
   }
  ]
 },
 "caso_otero": {
  "nombre": "Luis Manuel Otero Alcántara",
  "quien": "Artista del Movimiento San Isidro, preso desde el 11 de julio de 2021, incluido por la revista Time entre las 100 personas más influyentes de 2021.",
  "hechos": [
   {
    "fecha": "2026-07-07",
    "texto": "Es sacado de la prisión de Guanajay hacia un paradero no revelado. La alerta la da una activista desde el propio penal. (El material de partida decía 6 de julio; la fuente primaria fija el traslado el martes 7.)"
   },
   {
    "fecha": "2026-07-09",
    "texto": "Vence su condena de 5 años. No es liberado ni localizado."
   },
   {
    "fecha": "2026-07-10",
    "texto": "Amnistía Internacional denuncia el caso como desaparición forzada; el Comité de la ONU contra la Desaparición Forzada activa una acción urgente. Su familia confirma que no está en su casa de El Cerro."
   }
  ],
  "estado_actual": "Condena cumplida y paradero desconocido: denunciado como desaparición forzada. Verificado a la fecha de publicación; puede cambiar en cualquier momento.",
  "actualizado": "2026-07-10",
  "fuente": "CiberCuba (8 y 10 jul 2026) · 14ymedio · Infobae · Amnistía Internacional"
 },
 "padron": {
  "corte": "2026-07-10",
  "total": 30,
  "en_prision": 19,
  "nota_metodo": "Primera cohorte de un padrón histórico nominal del 11J en construcción: 30 fichas contrastadas una a una con la lista pública de Prisoners Defenders el 10 de julio de 2026. No es la lista completa (Justicia 11J documenta cientos de casos más); cada ficha conserva su nivel de confianza y su enlace a la fuente primaria.",
  "fuente": "Prisoners Defenders (lista nominal pública) · contraste con Justicia 11J y Cubalex",
  "casos": [
   {
    "id": "11J-000001",
    "nombre": "Alain Roselló Fernández",
    "edad_detencion": 30,
    "provincia": "Matanzas",
    "sentencia_anos": 6.0,
    "estatus": "Libertad condicional bajo amenazas",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/alain-rosello-fernandez/"
   },
   {
    "id": "11J-000002",
    "nombre": "Marcos de la Luz Caballero Granados",
    "edad_detencion": 19,
    "provincia": "La Habana",
    "sentencia_anos": 10.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/marcos-de-la-luz-caballero-granados/"
   },
   {
    "id": "11J-000003",
    "nombre": "Ronald Luis González Ramos",
    "edad_detencion": 22,
    "provincia": "Santiago de Cuba",
    "sentencia_anos": 9.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/ronald-luis-gonzalez-ramos/"
   },
   {
    "id": "11J-000004",
    "nombre": "Oscar Luis Ortiz Arrovsmeth",
    "edad_detencion": 22,
    "provincia": "La Habana",
    "sentencia_anos": 10.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/oscar-luis-ortiz-arrovsmeth/"
   },
   {
    "id": "11J-000005",
    "nombre": "Rodennis Ávila Corujo",
    "edad_detencion": 43,
    "provincia": "Santiago de Cuba",
    "sentencia_anos": 6.0,
    "estatus": "Libertad condicional bajo amenazas",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/rodennis-avila-corujo/"
   },
   {
    "id": "11J-000006",
    "nombre": "Félix Navarro Rodríguez",
    "edad_detencion": 68,
    "provincia": "Matanzas",
    "sentencia_anos": 9.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/felix-navarro-rodriguez/"
   },
   {
    "id": "11J-000007",
    "nombre": "Manuel Díaz Rodríguez",
    "edad_detencion": 59,
    "provincia": "Artemisa",
    "sentencia_anos": 5.0,
    "estatus": "Libertad condicional bajo amenazas",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/manuel-diaz-rodriguez-2/"
   },
   {
    "id": "11J-000008",
    "nombre": "Miguel Domínguez Antomachín",
    "edad_detencion": null,
    "provincia": "La Habana",
    "sentencia_anos": 5.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado parcialmente",
    "url": "https://lista.prisonersdefenders.org/prisioneros/miguel-dominguez-antomachin/"
   },
   {
    "id": "11J-000009",
    "nombre": "Yuniel Blanco Jiménez",
    "edad_detencion": 35,
    "provincia": "La Habana",
    "sentencia_anos": 10.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/yuniel-alias-pipo-blanco-jimenez/"
   },
   {
    "id": "11J-000010",
    "nombre": "Rolando Sardiñas Fernández",
    "edad_detencion": 38,
    "provincia": "Matanzas",
    "sentencia_anos": 12.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/rolando-sardinas-fernandez/"
   },
   {
    "id": "11J-000011",
    "nombre": "Yasniel Mariño Himely",
    "edad_detencion": 30,
    "provincia": "La Habana",
    "sentencia_anos": 12.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/yasniel-marino-himely/"
   },
   {
    "id": "11J-000012",
    "nombre": "Dayron Martín Rodríguez",
    "edad_detencion": 36,
    "provincia": "La Habana",
    "sentencia_anos": 22.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado con discrepancia (condena reportada 30 y luego 22 años; ficha primaria no re-verificada)",
    "url": "https://lista.prisonersdefenders.org/prisioneros/dayron-martin-rodriguez/"
   },
   {
    "id": "11J-000013",
    "nombre": "Erian José Scull Villa",
    "edad_detencion": 28,
    "provincia": "Matanzas",
    "sentencia_anos": 13.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/erian-jose-scull-villa/"
   },
   {
    "id": "11J-000014",
    "nombre": "Liliana Oropesa Ferrer",
    "edad_detencion": null,
    "provincia": null,
    "sentencia_anos": 5.0,
    "estatus": "Libertad condicional bajo amenazas",
    "nivel_confianza": "Confirmado parcialmente",
    "url": "https://lista.prisonersdefenders.org/prisioneros/liliana-oropesa-ferrer/"
   },
   {
    "id": "11J-000015",
    "nombre": "Efrén Duany Alfonso",
    "edad_detencion": 45,
    "provincia": "Artemisa",
    "sentencia_anos": 7.0,
    "estatus": "Libertad condicional bajo amenazas",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/efren-duany-alfonso/"
   },
   {
    "id": "11J-000016",
    "nombre": "Marlon Brando Díaz Oliva",
    "edad_detencion": null,
    "provincia": null,
    "sentencia_anos": 5.0,
    "estatus": "Privación de libertad tras revocación de libertad condicional",
    "nivel_confianza": "Confirmado parcialmente",
    "url": "https://lista.prisonersdefenders.org/prisioneros/marlon-brando-diaz-oliva/"
   },
   {
    "id": "11J-000017",
    "nombre": "Omar Hernández Calzadilla",
    "edad_detencion": 35,
    "provincia": "Artemisa",
    "sentencia_anos": 5.0,
    "estatus": "Libertad condicional bajo amenazas",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/omar-hernandez-calzadilla/"
   },
   {
    "id": "11J-000018",
    "nombre": "Mijaíl Sánchez de la Nuez",
    "edad_detencion": 44,
    "provincia": "Artemisa",
    "sentencia_anos": 15.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/mijail-sanchez-de-la-nuez/"
   },
   {
    "id": "11J-000019",
    "nombre": "Edel Cabrera González",
    "edad_detencion": 28,
    "provincia": "La Habana",
    "sentencia_anos": 10.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/edel-cabrera-gonzalez/"
   },
   {
    "id": "11J-000020",
    "nombre": "Miguel Díaz Sosa",
    "edad_detencion": 47,
    "provincia": "Artemisa",
    "sentencia_anos": 8.0,
    "estatus": "Licencia extrapenal bajo amenazas",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/miguel-diaz-sosa/"
   },
   {
    "id": "11J-000021",
    "nombre": "Yaquelin Castillo García",
    "edad_detencion": 49,
    "provincia": "La Habana",
    "sentencia_anos": 11.0,
    "estatus": "Subsidio de pena no privativa bajo amenazas; pendiente de confirmar",
    "nivel_confianza": "Confirmado con discrepancia",
    "url": "https://lista.prisonersdefenders.org/prisioneros/yaquelin-castillo-garcia/"
   },
   {
    "id": "11J-000022",
    "nombre": "José Luis Castillo de la Torre",
    "edad_detencion": 56,
    "provincia": "La Habana",
    "sentencia_anos": 11.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/jose-luis-castillo-de-la-torre/"
   },
   {
    "id": "11J-000023",
    "nombre": "Leonel Tristá García",
    "edad_detencion": 35,
    "provincia": "Villa Clara",
    "sentencia_anos": 8.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/leonel-trista-garcia__trashed/"
   },
   {
    "id": "11J-000024",
    "nombre": "Ibrahim Domínguez Aguilar",
    "edad_detencion": 33,
    "provincia": "Santiago de Cuba",
    "sentencia_anos": 10.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/ibrahim-dominguez-aguilar/"
   },
   {
    "id": "11J-000025",
    "nombre": "Joel Tor Caballero",
    "edad_detencion": 33,
    "provincia": "Santiago de Cuba",
    "sentencia_anos": 4.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/joel-tor-caballero/"
   },
   {
    "id": "11J-000026",
    "nombre": "Fredi Beirut Matos",
    "edad_detencion": 63,
    "provincia": "La Habana",
    "sentencia_anos": 9.0,
    "estatus": "Libertad condicional bajo amenazas",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/fredi-beirut-matos/"
   },
   {
    "id": "11J-000027",
    "nombre": "Carlos Manuel Pupo Rodríguez",
    "edad_detencion": 67,
    "provincia": "Artemisa",
    "sentencia_anos": 6.0,
    "estatus": "Licencia extrapenal bajo amenazas",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/carlos-manuel-pupo-rodriguez/"
   },
   {
    "id": "11J-000028",
    "nombre": "Yoel David Ochoa Álvarez",
    "edad_detencion": 20,
    "provincia": "Ciego de Ávila",
    "sentencia_anos": 8.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/yoel-david-ochoa-alvarez/"
   },
   {
    "id": "11J-000029",
    "nombre": "Jessica Lisbeth Torres Calvo",
    "edad_detencion": 27,
    "provincia": "Holguín",
    "sentencia_anos": 10.0,
    "estatus": "Libertad condicional bajo amenazas",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/jessica-lisbeth-torres-calvo/"
   },
   {
    "id": "11J-000030",
    "nombre": "Franyer Abad Dumet",
    "edad_detencion": 26,
    "provincia": "La Habana",
    "sentencia_anos": 10.0,
    "estatus": "En prisión",
    "nivel_confianza": "Confirmado por ficha pública",
    "url": "https://lista.prisonersdefenders.org/prisioneros/franyer-abad-dumet/"
   }
  ]
 },
 "cta": {
  "titulo": "Qué puedes hacer hoy y mañana",
  "intro": "No hace falta ser activista. La jornada del 11 de julio se construye con gestos simples, pacíficos y legales.",
  "acciones": [
   {
    "titulo": "Asiste",
    "texto": "Si hay una convocatoria cerca de ti, ve. Lleva a alguien. La diferencia entre una foto triste y una plaza llena son personas que dudaron y al final fueron."
   },
   {
    "titulo": "Comparte",
    "texto": "Difunde esta página y el mapa de convocatorias con sus niveles de verificación. Comparte cifras con fuente, no rumores: la credibilidad también se defiende en la calle digital."
   },
   {
    "titulo": "Verifica antes de difundir",
    "texto": "Si ves una convocatoria que no está aquí, búscale fuente antes de amplificarla. Lo especulativo se marca como especulativo; así se protege la confianza de todos."
   },
   {
    "titulo": "Acompaña a los presos",
    "texto": "Treinta nombres de este padrón siguen esperando. Escribe sus nombres, sigue sus casos en Prisoners Defenders y Justicia 11J, pide por ellos donde tengas voz."
   }
  ],
  "aviso": "Esta convocatoria se inscribe en la resistencia civil pacífica. La evidencia comparada (Chenoweth y Stephan, expediente «Vías de cambio» de Yamacoa) muestra que las campañas noviolentas y masivas son las que derriban dictaduras y desembocan en democracias. Nada de lo que se pide aquí es violento ni ilegal en los países donde se convoca."
 },
 "metodologia": {
  "registro": "Esta página es una convocatoria (agitación declarada), no un expediente observacional como el resto de Yamacoa. El listado se construyó a partir de convocatorias públicas de prensa independiente y de datos aportados por usuarios, verificados uno a uno donde fue posible el 10 de julio de 2026. La disciplina de fuentes se mantiene íntegra: nada especulativo se presenta como confirmado.",
  "niveles": [
   {
    "id": "confirmado",
    "etiqueta": "Confirmada",
    "descripcion": "Verificada por prensa independiente identificable (o por el propio convocante institucional), con fecha, hora y lugar concretos. Incluye las ya celebradas de la misma jornada."
   },
   {
    "id": "reportado_no_verificado",
    "etiqueta": "Reportada sin verificar",
    "descripcion": "Aportada por usuarios, sin confirmación de prensa independiente. Plausible por el patrón de la comunidad local, pero con detalles (hora, punto exacto) no coincidentes entre reportes."
   },
   {
    "id": "plausible_no_confirmado",
    "etiqueta": "Plausible, no confirmada",
    "descripcion": "El lugar es real y la comunidad convocante tiene precedentes documentados de actos similares, pero no se encontró confirmación específica para el 11 de julio de 2026."
   },
   {
    "id": "especulativo",
    "etiqueta": "Especulativa",
    "descripcion": "Sin verificación propia: ni siquiera se pudo fijar el lugar o la ciudad con certeza. Se muestra solo para que nadie la tome de otra fuente como confirmada."
   }
  ],
  "limitaciones": [
   "El buscador usado no indexa contenido en vivo de X/Twitter, la vía principal por la que circulan estas convocatorias: es probable que existan más eventos reales que esta página no captura.",
   "Las horas son locales de cada ciudad; las coordenadas del mapa son aproximadas (punto de encuentro o centroide urbano, según el campo de precisión).",
   "Dentro de Cuba no se localizó una convocatoria pública coordinada para el 11 de julio de 2026: el patrón documentado es de protesta cotidiana dispersa, atribuible a la represión preventiva.",
   "El padrón nominal es una primera cohorte de 30 casos, no la lista exhaustiva de sancionados del 11J.",
   "Las cifras de represión son suelos («al menos»): todas las fuentes reconocen subregistro."
  ]
 }
};

/* ════════ ICONOS DE MARCADOR (forma + opacidad por nivel, no solo color) ═══ */

const PIN_SVG = {
  // Confirmada: círculo relleno, opacidad plena, halo.
  confirmado: `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
    <circle cx="14" cy="14" r="12" fill="rgba(50,189,78,.22)"/>
    <circle cx="14" cy="14" r="7.5" fill="#32BD4E" stroke="#0B100D" stroke-width="1.5"/>
  </svg>`,
  // Celebrada: círculo relleno atenuado con marca de hecho.
  celebrado: `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" opacity=".8">
    <circle cx="14" cy="14" r="7.5" fill="#1F7A36" stroke="#0B100D" stroke-width="1.5"/>
    <path d="M10.5 14.2l2.4 2.4 4.6-5" fill="none" stroke="#ECF4EE" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
  // Reportada sin verificar: círculo relleno con anillo blanco, 70 %.
  reportado_no_verificado: `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" opacity=".7">
    <circle cx="14" cy="14" r="10" fill="none" stroke="#ECF4EE" stroke-width="1.6"/>
    <circle cx="14" cy="14" r="6" fill="#32BD4E"/>
  </svg>`,
  // Plausible: círculo hueco de trazo discontinuo.
  plausible_no_confirmado: `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
    <circle cx="14" cy="14" r="8" fill="rgba(50,189,78,.08)" stroke="#32BD4E" stroke-width="2" stroke-dasharray="4 3"/>
  </svg>`,
  // Especulativa: rombo hueco punteado, verde desaturado, 40 %.
  especulativo: `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" opacity=".4">
    <rect x="8" y="8" width="12" height="12" transform="rotate(45 14 14)" fill="none" stroke="#7FA88B" stroke-width="2" stroke-dasharray="2 3"/>
  </svg>`,
};

const PIN_ICONS = {};
function pinIcon(estado) {
  if (!PIN_ICONS[estado]) {
    PIN_ICONS[estado] = L.divIcon({
      className: "c11j-pin",
      html: PIN_SVG[estado] || PIN_SVG.especulativo,
      iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -12],
    });
  }
  return PIN_ICONS[estado];
}

// Miniatura del mismo símbolo para leyenda y listado.
function TierGlyph({ estado }) {
  return <span className="glyph" dangerouslySetInnerHTML={{ __html: PIN_SVG[estado] || PIN_SVG.especulativo }} />;
}

/* ════════ UTILIDADES ═══════════════════════════════════════════════════════ */

function franjaDe(c) {
  if (c.estado === "celebrado") return "celebradas";
  if (!c.hora_inicio) return "sinhora";
  const h = parseInt(c.hora_inicio.slice(0, 2), 10);
  if (h < 14) return "manana";
  if (h < 18) return "tarde";
  return "noche";
}
const FRANJAS = [
  ["manana", "Por la mañana (antes de las 14:00)"],
  ["tarde", "Por la tarde (14:00 a 18:00)"],
  ["noche", "Por la noche (desde las 18:00)"],
  ["sinhora", "Sin hora confirmada"],
  ["celebradas", "Actos previos ya celebrados"],
];

function horario(c) {
  if (!c.hora_inicio) return "hora sin confirmar";
  return c.hora_fin ? `${c.hora_inicio} a ${c.hora_fin}` : `desde las ${c.hora_inicio}`;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = (e) => setReduced(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

/* ════════ CUENTA ATRÁS ═════════════════════════════════════════════════════ */

function Countdown({ fecha, modo }) {
  const target = useMemo(() => new Date(`${fecha}T00:00:00`), [fecha]);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = target.getTime() - now.getTime();
  const esHoy = diff <= 0 && diff > -86400000;
  const paso = diff <= -86400000;

  if (modo === "retrospectiva" || paso) {
    const dias = Math.floor(-diff / 86400000);
    return (
      <div className="count count-past" role="status">
        <div className="count-big">LA JORNADA YA OCURRIÓ</div>
        <div className="count-sub">hace {dias} {dias === 1 ? "día" : "días"} · esta página queda como registro</div>
      </div>
    );
  }
  if (esHoy) {
    return (
      <div className="count count-today" role="status">
        <div className="count-big">ES HOY</div>
        <div className="count-sub">11 de julio: busca tu convocatoria en el mapa</div>
      </div>
    );
  }
  const s = Math.floor(diff / 1000);
  const dd = Math.floor(s / 86400), hh = Math.floor((s % 86400) / 3600),
        mm = Math.floor((s % 3600) / 60), ss = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className="count" role="timer" aria-label={`Faltan ${dd} días, ${hh} horas, ${mm} minutos`}>
      {[[dd, dd === 1 ? "día" : "días"], [hh, "horas"], [mm, "min"], [ss, "seg"]].map(([v, l]) => (
        <div className="count-cell" key={l}>
          <div className="count-n">{pad(v)}</div>
          <div className="count-l">{l}</div>
        </div>
      ))}
    </div>
  );
}

/* ════════ MAPA MUNDIAL (react-leaflet) ═════════════════════════════════════ */

function WorldMap({ convocatorias, niveles }) {
  const [filtros, setFiltros] = useState(() =>
    Object.fromEntries(TIERS.map((t) => [t.id, true])));
  const toggle = (id) => setFiltros((f) => ({ ...f, [id]: !f[id] }));

  const visibles = convocatorias.filter((c) => c.geo && filtros[tierOf(c.estado)]);
  const nivelDesc = (id) => (niveles.find((n) => n.id === id) || {}).descripcion || "";

  return (
    <div>
      <div className="filters" role="group" aria-label="Filtrar por nivel de verificación">
        {TIERS.map((t) => (
          <button key={t.id} onClick={() => toggle(t.id)} aria-pressed={filtros[t.id]}
            className={"filter" + (filtros[t.id] ? " on" : "")} title={nivelDesc(t.id)}>
            <TierGlyph estado={t.id} /> {t.label}
          </button>
        ))}
      </div>

      <div className="mapwrap">
        <MapContainer center={[33, -35]} zoom={3} minZoom={2} maxZoom={17}
          scrollWheelZoom={false} worldCopyJump className="worldmap">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {visibles.map((c) => (
            <Marker key={c.id} position={[c.geo.lat, c.geo.lon]} icon={pinIcon(c.estado)}>
              <Popup maxWidth={300}>
                <div className="pop">
                  <div className="pop-tier"><TierGlyph estado={c.estado} />
                    {c.estado === "celebrado" ? "Confirmada · ya celebrada" : (TIERS.find((t) => t.id === tierOf(c.estado)) || {}).label}
                  </div>
                  <div className="pop-h">{c.nombre}</div>
                  <div className="pop-city">{c.ciudad} · {c.pais}</div>
                  <div className="pop-row"><strong>Lugar:</strong> {c.lugar}</div>
                  <div className="pop-row"><strong>Cuándo:</strong> {c.fecha} · {horario(c)} (hora local)</div>
                  {c.organizadores && c.organizadores.length > 0 && (
                    <div className="pop-row"><strong>Convocan:</strong> {c.organizadores.join("; ")}</div>
                  )}
                  {tierOf(c.estado) !== "confirmado" && c.verificacion && (
                    <div className="pop-warn">{c.verificacion}</div>
                  )}
                  {c.fuente && (
                    <a className="pop-src" href={c.fuente} target="_blank" rel="noreferrer">Ver la fuente</a>
                  )}
                  {c.geo.precision === "ciudad" && (
                    <div className="pop-precision">Posición aproximada (centro urbano)</div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="legend" aria-hidden="false">
          <div className="legend-h">Nivel de verificación</div>
          {TIERS.map((t) => (
            <div className="legend-row" key={t.id}><TierGlyph estado={t.id} /> {t.label}</div>
          ))}
          <div className="legend-row"><TierGlyph estado="celebrado" /> Confirmada, ya celebrada</div>
        </div>
      </div>

      <p className="mapnote">
        Lo que no está confirmado se muestra como tal: la forma y la opacidad del marcador
        cambian con el nivel de verificación. Coordenadas aproximadas; las horas son locales
        de cada ciudad. Una convocatoria en Alemania (Kornmarkt, ciudad sin identificar) no
        aparece en el mapa por no ser geolocalizable: está en el listado de abajo.
      </p>
    </div>
  );
}

/* ════════ MAPA HISTÓRICO DE CUBA (propagación 2021) ════════════════════════ */

function CubaMap({ propagacion, reduced }) {
  const MW = 1000, MH = 380;
  const [paso, setPaso] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  const { cubaPath, project } = useMemo(() => {
    const p = d3.geoMercator().fitExtent([[26, 26], [MW - 26, MH - 26]], CUBA_FEATURE);
    return { cubaPath: d3.geoPath(p)(CUBA_FEATURE), project: p };
  }, []);

  const hitos = useMemo(() =>
    (propagacion || [])
      .filter((h) => LOC_GEO[h.id])
      .sort((a, b) => a.orden - b.orden)
      .map((h) => ({ ...h, xy: project(LOC_GEO[h.id]) })),
    [propagacion, project]);

  useEffect(() => {
    if (!playing) return undefined;
    timer.current = setInterval(() => {
      setPaso((p) => {
        if (p >= hitos.length - 1) { setPlaying(false); return p; }
        return p + 1;
      });
    }, 1700);
    return () => clearInterval(timer.current);
  }, [playing, hitos.length]);

  if (hitos.length === 0) return null;
  const activo = hitos[Math.min(paso, hitos.length - 1)];

  return (
    <div className="cubawrap">
      <div className="cuba-controls">
        <button className="ctl" onClick={() => { setPlaying(false); setPaso((p) => Math.max(0, p - 1)); }}
          disabled={paso === 0} aria-label="Hito anterior">‹</button>
        {!reduced && (
          <button className="ctl play" onClick={() => {
            if (playing) { setPlaying(false); return; }
            if (paso >= hitos.length - 1) setPaso(0);
            setPlaying(true);
          }}>
            {playing ? "Pausar" : "Reproducir la propagación"}
          </button>
        )}
        <button className="ctl" onClick={() => { setPlaying(false); setPaso((p) => Math.min(hitos.length - 1, p + 1)); }}
          disabled={paso >= hitos.length - 1} aria-label="Hito siguiente">›</button>
        <div className="cuba-step mono">{paso + 1} / {hitos.length} · {activo.dia === "2021-07-12" ? "12 de julio" : "11 de julio"}</div>
      </div>

      <svg viewBox={`0 0 ${MW} ${MH}`} className="cubamap" role="img"
        aria-label="Mapa de Cuba con la propagación de las protestas del 11 y 12 de julio de 2021">
        <defs>
          <radialGradient id="c11jGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(174,90,216,.20)" />
            <stop offset="100%" stopColor="rgba(174,90,216,0)" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width={MW} height={MH} fill="url(#c11jGlow)" />
        <path d={cubaPath} fill="#101913" stroke={COL.line} strokeWidth="1.4" />
        {hitos.map((h, i) => {
          const on = i <= paso;
          const es = i === paso;
          const r = es ? 13 : on ? 8 : 5;
          return (
            <g key={h.id} transform={`translate(${h.xy[0]},${h.xy[1]})`}
              onClick={() => { setPlaying(false); setPaso(i); }} style={{ cursor: "pointer" }}>
              {es && <circle r={22} fill="rgba(50,189,78,.18)" />}
              <circle r={r}
                fill={on ? (es ? COL.greenHi : COL.green) : "none"}
                stroke={on ? "#0B100D" : COL.desat} strokeWidth={on ? 1.5 : 1.2}
                opacity={on ? 1 : 0.55} />
              <text y={-r - 7} textAnchor="middle" className="cuba-lbl"
                opacity={es ? 1 : on ? 0.65 : 0}>{h.orden}. {h.nombre.split(" (")[0]}</text>
            </g>
          );
        })}
      </svg>

      <div className="cuba-card">
        <div className="cuba-card-h">
          <span className="cuba-orden mono">{activo.orden}</span> {activo.nombre}
          {activo.hora_aprox && <span className="cuba-hora mono"> · {activo.hora_aprox}</span>}
        </div>
        <p className="cuba-card-t">{activo.texto}</p>
        {activo.fuente && <div className="srcline">Fuente: {activo.fuente}</div>}
      </div>
    </div>
  );
}

/* ════════ APP ══════════════════════════════════════════════════════════════ */

export default function App() {
  const [data, setData] = useState(EMBEDDED);
  const [votos, setVotos] = useState(() => lsGet(LS_VOTED, {}));
  const [live, setLive] = useState({});
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const id = "c11j-fonts";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    fetch(DATA_URL).then((r) => (r.ok ? r.json() : null)).then((j) => { if (alive && j) setData(j); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => { pollStore.results().then(setLive).catch(() => setLive({})); }, []);

  const vote = useCallback(async (qid, oid) => {
    if (votos[qid]) return;
    const nv = { ...votos, [qid]: oid }; setVotos(nv); lsSet(LS_VOTED, nv);
    setLive((p) => { const c = { ...p, [qid]: { ...(p[qid] || {}) } }; c[qid][oid] = (c[qid][oid] || 0) + 1; return c; });
    try { await pollStore.vote(qid, oid); } catch {}
  }, [votos]);

  const meta = data.meta || {};
  const convocatorias = useMemo(() => data.convocatorias || [], [data]);
  const porFranja = useMemo(() => {
    const g = {};
    for (const c of convocatorias) {
      const f = franjaDe(c);
      (g[f] = g[f] || []).push(c);
    }
    for (const k of Object.keys(g)) g[k].sort((a, b) => (a.hora_inicio || "99").localeCompare(b.hora_inicio || "99"));
    return g;
  }, [convocatorias]);

  const hist = data.historia_2021 || {};
  const cifras = data.cifras || {};
  const otero = data.caso_otero;
  const padron = data.padron || {};
  const cta = data.cta || {};
  const metodo = data.metodologia || {};
  const kpi = (id) => (data.kpis || []).find((k) => k.id === id) || {};

  return (
    <div className="c11j">
      <style>{CSS}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <header className="hd" id="manana">
        <div className="eyebrow mono">QUINTO ANIVERSARIO · 11 DE JULIO DE 2021 · CONVOCATORIA MUNDIAL</div>
        <h1 className="title">{meta.titulo || "Mañana es 11J"}</h1>
        <p className="sub">{meta.subtitulo}</p>
        <Countdown fecha={meta.evento_fecha || "2026-07-11"} modo={meta.modo} />
        <div className="kpis">
          {["aniversario", "confirmadas", "presos11j", "protestas2026"].map((id) => (
            <div className="kpi" key={id}>
              <div className="kpi-n">{kpi(id).valor}</div>
              <div className="kpi-l">{kpi(id).etiqueta}</div>
              {kpi(id).fuente && <div className="kpi-f mono">{kpi(id).fuente}</div>}
            </div>
          ))}
        </div>
        {meta.nota_registro && (
          <aside className="registro">
            <span className="registro-tag mono">NOTA EDITORIAL</span>
            <p>{meta.nota_registro}</p>
          </aside>
        )}
      </header>

      {/* ── ANCLAS ───────────────────────────────────────────────────────── */}
      <nav className="anchors mono" aria-label="Secciones de la página">
        {[["#mapa", "El mapa"], ["#horas", "¿A qué hora?"], ["#memoria", "2021"],
          ["#cifras", "Las cifras"], ["#nombres", "Los nombres"], ["#sumate", "Súmate"]].map(([href, lbl]) => (
          <a key={href} href={href} className="anchor">{lbl}</a>
        ))}
      </nav>

      {/* ── MAPA MUNDIAL ─────────────────────────────────────────────────── */}
      <section className="panel" id="mapa">
        <h2 className="sec-h">Dónde sale el mundo a la calle</h2>
        <p className="sec-sub">
          Convocatorias del 11 de julio de 2026, cada una con su nivel de verificación.
          Toca un marcador para ver lugar, hora local, convocantes y fuente.
        </p>
        <WorldMap convocatorias={convocatorias} niveles={metodo.niveles || []} />
        {(data.ciudades_en_duda || []).length > 0 && (
          <div className="endudas">
            <div className="endudas-h">Ciudades con redes activas pero sin convocatoria localizada</div>
            <div className="endudas-grid">
              {data.ciudades_en_duda.map((c) => (
                <div className="enduda" key={c.ciudad}>
                  <div className="enduda-c">{c.ciudad} <span className="dim">· {c.pais}</span></div>
                  <div className="enduda-n">{c.nota}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── LISTADO POR FRANJA ───────────────────────────────────────────── */}
      <section className="panel" id="horas">
        <h2 className="sec-h">¿A qué hora es en tu ciudad?</h2>
        <p className="sec-sub">El mismo listado del mapa, agrupado por franja horaria local.</p>
        {FRANJAS.map(([fid, flabel]) => {
          const items = porFranja[fid] || [];
          if (items.length === 0) return null;
          return (
            <div className="franja" key={fid}>
              <h3 className="franja-h mono">{flabel}</h3>
              <ul className="evlist">
                {items.map((c) => (
                  <li className="ev" key={c.id}>
                    <TierGlyph estado={c.estado} />
                    <div className="ev-body">
                      <div className="ev-top">
                        <strong>{c.ciudad}</strong> <span className="dim">· {c.pais}</span>
                        <span className="ev-hora mono">{horario(c)}</span>
                      </div>
                      <div className="ev-nombre">{c.nombre} · {c.lugar}</div>
                      {c.organizadores && c.organizadores.length > 0 && (
                        <div className="ev-org dim">Convocan: {c.organizadores.join("; ")}</div>
                      )}
                      {tierOf(c.estado) !== "confirmado" && c.verificacion && (
                        <div className="ev-warn">{c.verificacion}</div>
                      )}
                      {c.fuente && <a className="ev-src" href={c.fuente} target="_blank" rel="noreferrer">Fuente</a>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* ── MEMORIA 2021 ─────────────────────────────────────────────────── */}
      <section className="panel" id="memoria">
        <h2 className="sec-h">Lo que se conmemora: así se encendió Cuba en 2021</h2>
        {hist.resumen && (
          <p className="sec-sub">
            {hist.resumen.texto} {hist.resumen.localidades && (
              <strong> Alcanzó {hist.resumen.localidades} en {hist.resumen.provincias}.</strong>
            )}
          </p>
        )}
        <CubaMap propagacion={hist.propagacion} reduced={reduced} />
        <div className="hist-grid">
          {hist.muerte && (
            <div className="hist-card">
              <div className="hist-h violet-h">El muerto de La Güinera</div>
              <p><strong>{hist.muerte.nombre}</strong> ({hist.muerte.fecha}, {hist.muerte.lugar}). {hist.muerte.texto}</p>
              <div className="srcline">Fuente: {hist.muerte.fuente}</div>
            </div>
          )}
          {hist.detenciones && (
            <div className="hist-card">
              <div className="hist-h">Las detenciones</div>
              <p><strong>{hist.detenciones.cifra}.</strong> {hist.detenciones.nota}</p>
              <div className="srcline">Fuente: {hist.detenciones.fuente}</div>
            </div>
          )}
        </div>
        {hist.resumen && hist.resumen.fuente && <div className="srcline">Fuentes de la sección: {hist.resumen.fuente}</div>}
      </section>

      {/* ── CIFRAS ───────────────────────────────────────────────────────── */}
      <section className="panel" id="cifras">
        <h2 className="sec-h">Cinco años después, en cifras</h2>
        {cifras.corte && <p className="sec-sub">Corte: {cifras.corte}. Todas las cifras son suelos («al menos»): las fuentes reconocen subregistro.</p>}
        <div className="cifras-grid">
          {(cifras.bloques || []).map((b) => (
            <div className="cifra" key={b.id}>
              <div className="cifra-n">{b.valor}</div>
              <div className="cifra-l">{b.etiqueta}</div>
              {b.detalle && <div className="cifra-d dim">{b.detalle}</div>}
              <div className="cifra-f mono">{b.fuente} · corte {b.fecha_corte}</div>
            </div>
          ))}
        </div>

        {otero && (
          <div className="otero">
            <div className="otero-tag mono">CASO ABIERTO · VERIFICADO {otero.actualizado}</div>
            <h3 className="otero-h">{otero.nombre}</h3>
            {otero.quien && <p className="otero-quien dim">{otero.quien}</p>}
            <ol className="otero-tl">
              {(otero.hechos || []).map((h) => (
                <li key={h.fecha}><span className="mono otero-f">{h.fecha}</span> {h.texto}</li>
              ))}
            </ol>
            <div className="otero-estado">{otero.estado_actual}</div>
            <div className="srcline">Fuente: {otero.fuente}</div>
          </div>
        )}
      </section>

      {/* ── MURO NOMINAL ─────────────────────────────────────────────────── */}
      <section className="panel" id="nombres">
        <h2 className="sec-h">Los nombres que siguen esperando</h2>
        <p className="sec-sub">
          {padron.total} fichas nominales verificadas contra la lista pública de Prisoners Defenders
          (corte {padron.corte}); {padron.en_prision} siguen en prisión cinco años después.
        </p>
        <div className="muro">
          {(padron.casos || []).map((c) => (
            <a className={"ficha" + (c.estatus === "En prisión" ? " preso" : "")}
              key={c.id} href={c.url} target="_blank" rel="noreferrer"
              title={`${c.nivel_confianza} · fuente: Prisoners Defenders`}>
              <div className="ficha-n">{c.nombre}</div>
              <div className="ficha-d mono">
                {c.edad_detencion ? `${c.edad_detencion} años al ser detenido · ` : ""}
                {c.provincia || "provincia por confirmar"}
                {c.sentencia_anos ? ` · condena ${c.sentencia_anos} años` : ""}
              </div>
              <div className="ficha-e">{c.estatus}</div>
              {c.nivel_confianza.startsWith("Confirmado por ficha") ? null : (
                <div className="ficha-conf">{c.nivel_confianza}</div>
              )}
            </a>
          ))}
        </div>
        {padron.nota_metodo && <p className="mapnote">{padron.nota_metodo} Fuente: {padron.fuente}.</p>}
      </section>

      {/* ── CTA + ENCUESTA ───────────────────────────────────────────────── */}
      <section className="panel" id="sumate">
        <h2 className="sec-h">{cta.titulo || "Súmate"}</h2>
        <p className="sec-sub">{cta.intro}</p>
        <div className="cta-grid">
          {(cta.acciones || []).map((a) => (
            <div className="cta-card" key={a.titulo}>
              <div className="cta-h">{a.titulo}</div>
              <p>{a.texto}</p>
            </div>
          ))}
        </div>
        {cta.aviso && <aside className="aviso">{cta.aviso}</aside>}

        {SURVEY.map((q) => {
          const counts = live[q.id] || {};
          const total = q.opts.reduce((s, o) => s + o.seed + (counts[o.id] || 0), 0);
          const voted = votos[q.id];
          return (
            <div className="survey" key={q.id}>
              <div className="survey-q">{q.q}</div>
              {q.opts.map((o) => {
                const n = o.seed + (counts[o.id] || 0);
                const pct = total ? Math.round((n / total) * 100) : 0;
                return (
                  <button key={o.id} className={"opt" + (voted === o.id ? " mine" : "")}
                    onClick={() => vote(q.id, o.id)} disabled={!!voted} aria-pressed={voted === o.id}>
                    <span className="opt-bar" style={{ width: voted ? `${pct}%` : 0 }} />
                    <span className="opt-t">{o.t}</span>
                    {voted && <span className="opt-n mono">{pct} %</span>}
                  </button>
                );
              })}
              <div className="survey-note dim">{voted ? "Gracias. Un voto por dispositivo." : "Vota para ver los resultados."}</div>
            </div>
          );
        })}
      </section>

      {/* ── PIE: METODOLOGÍA ─────────────────────────────────────────────── */}
      <footer className="foot">
        {metodo.registro && (
          <div className="foot-blk">
            <div className="foot-h mono">CÓMO SE HIZO ESTE REGISTRO</div>
            <p>{metodo.registro}</p>
          </div>
        )}
        {(metodo.niveles || []).length > 0 && (
          <div className="foot-blk">
            <div className="foot-h mono">LOS CUATRO NIVELES DE VERIFICACIÓN</div>
            <ul className="foot-niveles">
              {metodo.niveles.map((n) => (
                <li key={n.id}><TierGlyph estado={n.id} /> <strong>{n.etiqueta}:</strong> {n.descripcion}</li>
              ))}
            </ul>
          </div>
        )}
        {(metodo.limitaciones || []).length > 0 && (
          <div className="foot-blk">
            <div className="foot-h mono">LO QUE ESTA PÁGINA NO PUEDE VER</div>
            <ul>{metodo.limitaciones.map((l, i) => <li key={i}>{l}</li>)}</ul>
          </div>
        )}
        <div className="stamp mono">
          FUENTES: {(meta.fuentes || []).join(" · ")} · ACTUALIZADO {meta.actualizado}
        </div>
      </footer>
    </div>
  );
}

/* ════════ ESTILOS ══════════════════════════════════════════════════════════ */

const CSS = `
.c11j { background:${COL.bg}; color:${COL.text}; min-height:100vh; font-family:'Archivo',system-ui,sans-serif; line-height:1.5; }
.c11j .mono { font-family:'IBM Plex Mono',ui-monospace,monospace; }
.c11j a { color:${COL.greenHi}; }
.c11j .dim { color:${COL.dim}; }
.c11j :focus-visible { outline:2px solid ${COL.greenHi}; outline-offset:2px; border-radius:3px; }
.c11j button { font-family:inherit; }

.c11j .hd { max-width:1080px; margin:0 auto; padding:56px 20px 28px; text-align:center; }
.c11j .eyebrow { color:${COL.green}; font-size:12px; letter-spacing:.14em; margin-bottom:14px; }
.c11j .title { font-size:clamp(44px,9vw,96px); font-weight:900; letter-spacing:-.02em; margin:0 0 12px; text-transform:uppercase; }
.c11j .sub { max-width:760px; margin:0 auto 26px; color:${COL.dim}; font-size:17px; }

.c11j .count { display:flex; gap:12px; justify-content:center; margin:10px 0 26px; }
.c11j .count-cell { background:${COL.panel}; border:1px solid ${COL.line}; border-top:3px solid ${COL.green}; border-radius:8px; padding:10px 14px; min-width:76px; }
.c11j .count-n { font-family:'IBM Plex Mono',monospace; font-size:clamp(28px,5vw,44px); font-weight:600; color:${COL.greenHi}; }
.c11j .count-l { font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:${COL.dim}; }
.c11j .count-today .count-big, .c11j .count-past .count-big { font-size:clamp(30px,6vw,52px); font-weight:900; color:${COL.greenHi}; letter-spacing:.04em; }
.c11j .count-sub { color:${COL.dim}; font-size:14px; }
.c11j .count-today, .c11j .count-past { flex-direction:column; align-items:center; gap:4px; }

.c11j .kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:12px; max-width:980px; margin:0 auto 22px; }
.c11j .kpi { background:${COL.panel}; border:1px solid ${COL.line}; border-radius:8px; padding:14px; text-align:left; }
.c11j .kpi-n { font-family:'IBM Plex Mono',monospace; font-size:30px; font-weight:600; color:${COL.greenHi}; }
.c11j .kpi-l { font-size:13px; color:${COL.text}; margin-top:2px; }
.c11j .kpi-f { font-size:11px; color:${COL.dim}; margin-top:6px; }

.c11j .registro { max-width:820px; margin:6px auto 0; text-align:left; background:${COL.violetSoft}; border:1px solid rgba(174,90,216,.4); border-radius:8px; padding:14px 16px; }
.c11j .registro-tag { color:${COL.violet}; font-size:11px; letter-spacing:.14em; }
.c11j .registro p { margin:6px 0 0; font-size:14px; }

.c11j .anchors { position:sticky; top:0; z-index:1200; display:flex; gap:4px; justify-content:center; flex-wrap:wrap; padding:10px 8px; background:rgba(11,16,13,.92); backdrop-filter:blur(6px); border-top:1px solid ${COL.line}; border-bottom:1px solid ${COL.line}; }
.c11j .anchor { color:${COL.text}; text-decoration:none; font-size:12.5px; letter-spacing:.06em; padding:7px 13px; border-radius:999px; border:1px solid transparent; }
.c11j .anchor:hover { border-color:${COL.green}; color:${COL.greenHi}; }

.c11j .panel { max-width:1080px; margin:0 auto; padding:48px 20px 8px; }
.c11j .sec-h { font-size:clamp(24px,4vw,36px); font-weight:800; margin:0 0 8px; }
.c11j .sec-sub { color:${COL.dim}; max-width:820px; margin:0 0 20px; }

.c11j .filters { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
.c11j .filter { display:inline-flex; align-items:center; gap:6px; background:${COL.panel2}; color:${COL.dim}; border:1px solid ${COL.line}; border-radius:999px; padding:6px 14px 6px 8px; font-size:13px; cursor:pointer; }
.c11j .filter.on { background:${COL.greenSoft}; color:${COL.text}; border-color:${COL.green}; }
.c11j .glyph { display:inline-flex; width:22px; height:22px; vertical-align:middle; flex:none; }
.c11j .glyph svg { width:22px; height:22px; }

.c11j .mapwrap { position:relative; border:1px solid ${COL.line}; border-radius:10px; overflow:hidden; }
.c11j .worldmap { height:480px; width:100%; background:#0a0a0a; }
.c11j .legend { position:absolute; left:10px; bottom:10px; z-index:1000; background:rgba(11,16,13,.9); border:1px solid ${COL.line}; border-radius:8px; padding:10px 12px; font-size:12px; max-width:230px; }
.c11j .legend-h { font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; color:${COL.dim}; margin-bottom:6px; }
.c11j .legend-row { display:flex; align-items:center; gap:6px; margin:3px 0; }
.c11j .mapnote { color:${COL.dim}; font-size:13px; max-width:860px; margin:12px 0 0; }
.c11j .c11j-pin { background:none; border:none; }
.c11j .leaflet-popup-content-wrapper { background:${COL.panel}; color:${COL.text}; border:1px solid ${COL.line}; border-radius:8px; }
.c11j .leaflet-popup-tip { background:${COL.panel}; }
.c11j .leaflet-container a.leaflet-popup-close-button { color:${COL.dim}; }
.c11j .pop { font-size:13px; }
.c11j .pop-tier { display:flex; align-items:center; gap:5px; font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.06em; text-transform:uppercase; color:${COL.green}; margin-bottom:4px; }
.c11j .pop-h { font-weight:700; font-size:15px; }
.c11j .pop-city { color:${COL.dim}; margin-bottom:6px; }
.c11j .pop-row { margin:3px 0; }
.c11j .pop-warn { margin-top:7px; padding:7px 9px; background:rgba(174,90,216,.12); border-left:3px solid ${COL.violet}; font-size:12px; color:${COL.text}; }
.c11j .pop-src { display:inline-block; margin-top:7px; font-weight:600; }
.c11j .pop-precision { margin-top:5px; font-size:11px; color:${COL.dim}; }

.c11j .endudas { margin-top:24px; }
.c11j .endudas-h { font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:${COL.dim}; margin-bottom:10px; }
.c11j .endudas-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:10px; }
.c11j .enduda { background:${COL.panel2}; border:1px dashed ${COL.line}; border-radius:8px; padding:10px 12px; }
.c11j .enduda-c { font-weight:600; font-size:14px; }
.c11j .enduda-n { color:${COL.dim}; font-size:12.5px; margin-top:3px; }

.c11j .franja { margin-bottom:22px; }
.c11j .franja-h { font-size:13px; letter-spacing:.1em; text-transform:uppercase; color:${COL.green}; border-bottom:1px solid ${COL.line}; padding-bottom:6px; margin:0 0 10px; }
.c11j .evlist { list-style:none; margin:0; padding:0; }
.c11j .ev { display:flex; gap:10px; padding:12px 6px; border-bottom:1px solid ${COL.line}; }
.c11j .ev-body { flex:1; min-width:0; }
.c11j .ev-top { display:flex; gap:8px; align-items:baseline; flex-wrap:wrap; }
.c11j .ev-hora { margin-left:auto; color:${COL.greenHi}; font-size:13px; }
.c11j .ev-nombre { font-size:14px; margin-top:2px; }
.c11j .ev-org { font-size:12.5px; margin-top:2px; }
.c11j .ev-warn { margin-top:6px; padding:6px 9px; background:rgba(174,90,216,.10); border-left:3px solid ${COL.violet}; font-size:12.5px; color:${COL.dim}; }
.c11j .ev-src { font-size:12.5px; font-weight:600; }

.c11j .cubawrap { border:1px solid ${COL.line}; border-radius:10px; padding:14px; background:${COL.panel2}; }
.c11j .cuba-controls { display:flex; align-items:center; gap:8px; margin-bottom:8px; flex-wrap:wrap; }
.c11j .ctl { background:${COL.panel}; color:${COL.text}; border:1px solid ${COL.line}; border-radius:6px; padding:6px 12px; cursor:pointer; font-size:14px; }
.c11j .ctl.play { color:${COL.greenHi}; border-color:${COL.green}; }
.c11j .ctl:disabled { opacity:.35; cursor:default; }
.c11j .cuba-step { color:${COL.dim}; font-size:12px; margin-left:auto; }
.c11j .cubamap { width:100%; height:auto; display:block; }
.c11j .cuba-lbl { fill:${COL.text}; font-size:13px; font-family:'IBM Plex Mono',monospace; paint-order:stroke; stroke:${COL.bg}; stroke-width:3px; }
.c11j .cuba-card { border-top:1px solid ${COL.line}; margin-top:10px; padding-top:12px; }
.c11j .cuba-card-h { font-weight:700; font-size:16px; }
.c11j .cuba-orden { display:inline-block; background:${COL.green}; color:${COL.bg}; border-radius:4px; padding:0 7px; font-weight:600; margin-right:4px; }
.c11j .cuba-hora { color:${COL.dim}; font-size:13px; }
.c11j .cuba-card-t { margin:8px 0 6px; max-width:900px; }
.c11j .srcline { font-family:'IBM Plex Mono',monospace; font-size:11px; color:${COL.dim}; margin-top:8px; }

.c11j .hist-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:12px; margin-top:16px; }
.c11j .hist-card { background:${COL.panel}; border:1px solid ${COL.line}; border-radius:8px; padding:14px 16px; }
.c11j .hist-h { font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:${COL.green}; margin-bottom:6px; }
.c11j .hist-h.violet-h { color:${COL.violet}; }
.c11j .hist-card p { margin:0; font-size:14px; }

.c11j .cifras-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:12px; }
.c11j .cifra { background:${COL.panel}; border:1px solid ${COL.line}; border-left:3px solid ${COL.green}; border-radius:8px; padding:14px 16px; }
.c11j .cifra-n { font-family:'IBM Plex Mono',monospace; font-size:34px; font-weight:600; color:${COL.greenHi}; }
.c11j .cifra-l { font-size:13.5px; margin-top:2px; }
.c11j .cifra-d { font-size:12.5px; margin-top:6px; }
.c11j .cifra-f { font-size:11px; color:${COL.dim}; margin-top:8px; }

.c11j .otero { margin-top:22px; background:${COL.panel}; border:1px solid rgba(174,90,216,.45); border-radius:10px; padding:18px 20px; }
.c11j .otero-tag { color:${COL.violet}; font-size:11px; letter-spacing:.14em; }
.c11j .otero-h { margin:6px 0 2px; font-size:24px; }
.c11j .otero-quien { margin:0 0 10px; font-size:13.5px; }
.c11j .otero-tl { margin:0; padding-left:18px; }
.c11j .otero-tl li { margin:7px 0; font-size:14px; }
.c11j .otero-f { color:${COL.violet}; margin-right:6px; }
.c11j .otero-estado { margin-top:10px; padding:9px 12px; background:${COL.violetSoft}; border-radius:6px; font-weight:600; font-size:14px; }

.c11j .muro { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:10px; }
.c11j .ficha { display:block; background:${COL.panel2}; border:1px solid ${COL.line}; border-radius:8px; padding:11px 13px; text-decoration:none; color:${COL.text}; }
.c11j .ficha:hover { border-color:${COL.green}; }
.c11j .ficha.preso { border-left:3px solid ${COL.green}; }
.c11j .ficha-n { font-weight:700; font-size:14.5px; }
.c11j .ficha-d { font-size:11px; color:${COL.dim}; margin-top:3px; }
.c11j .ficha-e { font-size:12px; color:${COL.greenHi}; margin-top:5px; }
.c11j .ficha-conf { font-size:11px; color:${COL.violet}; margin-top:4px; }

.c11j .cta-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:12px; }
.c11j .cta-card { background:${COL.greenSoft}; border:1px solid rgba(50,189,78,.4); border-radius:8px; padding:14px 16px; }
.c11j .cta-h { font-weight:800; font-size:17px; color:${COL.greenHi}; margin-bottom:4px; }
.c11j .cta-card p { margin:0; font-size:14px; }
.c11j .aviso { margin:16px 0 0; padding:12px 14px; border-left:3px solid ${COL.green}; background:${COL.panel2}; color:${COL.dim}; font-size:13.5px; }

.c11j .survey { margin-top:26px; background:${COL.panel}; border:1px solid ${COL.line}; border-radius:10px; padding:16px 18px; max-width:680px; }
.c11j .survey-q { font-weight:700; margin-bottom:10px; }
.c11j .opt { position:relative; display:flex; width:100%; align-items:center; gap:8px; background:${COL.panel2}; color:${COL.text}; border:1px solid ${COL.line}; border-radius:6px; padding:9px 12px; margin:6px 0; cursor:pointer; overflow:hidden; text-align:left; font-size:14px; }
.c11j .opt:disabled { cursor:default; }
.c11j .opt.mine { border-color:${COL.green}; }
.c11j .opt-bar { position:absolute; left:0; top:0; bottom:0; background:${COL.greenSoft}; transition:width .5s ease; }
.c11j .opt-t, .c11j .opt-n { position:relative; }
.c11j .opt-n { margin-left:auto; color:${COL.greenHi}; }
.c11j .survey-note { font-size:12px; margin-top:6px; }

.c11j .foot { max-width:1080px; margin:36px auto 0; padding:28px 20px 48px; border-top:1px solid ${COL.line}; }
.c11j .foot-blk { max-width:860px; margin-bottom:20px; }
.c11j .foot-h { font-size:11.5px; letter-spacing:.14em; color:${COL.green}; margin-bottom:6px; }
.c11j .foot-blk p, .c11j .foot-blk li { font-size:13.5px; color:${COL.dim}; }
.c11j .foot-niveles { list-style:none; padding:0; }
.c11j .foot-niveles li { display:flex; gap:7px; align-items:flex-start; margin:6px 0; }
.c11j .foot-niveles .glyph { margin-top:-1px; }
.c11j .stamp { font-size:10.5px; color:${COL.dim}; letter-spacing:.06em; margin-top:10px; }

@media (max-width:640px) {
  .c11j .worldmap { height:380px; }
  .c11j .legend { position:static; max-width:none; margin-top:0; border-radius:0; border-left:none; border-right:none; border-bottom:none; }
  .c11j .ev-hora { margin-left:0; width:100%; }
}
@media (prefers-reduced-motion: reduce) {
  .c11j .opt-bar { transition:none; }
  .c11j * { scroll-behavior:auto !important; }
}
html { scroll-behavior:smooth; }
`;
