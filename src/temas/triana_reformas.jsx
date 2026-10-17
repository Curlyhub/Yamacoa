import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ReferenceLine, LabelList,
  LineChart, Line, Legend,
} from "recharts";

/* =========================================================================
   TRIANA EN CIFRAS — renderer congelado (frozen)
   Todo el contenido variable vive en triana_reformas.json.
   Aquí solo geometría, paleta y lógica de render.
   ========================================================================= */

const C = {
  bg: "#fcf9f4",
  bg2: "#f5efe7",
  panel: "#fcf9f4",
  line: "#ddd2c4",
  ink: "#1f1a16",
  mut: "#6b5d50",
  gold: "#A87300",
  jade: "#1B7F5A",
  coral: "#B83A22",
  violet: "#6A4FB0",
  cyan: "#1C7590",
};

const F = {
  disp: "'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
  body: "'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif",
};

const RUEDA = [C.gold, C.jade, C.coral, C.violet, C.cyan, "#A8487A", "#4F7F3A"];

/* Data incrustada: fallback para previsualización. En producción la prop `data`
   (data fresca del layout) o el fetch la sobrescriben — el renderer sigue congelado. */
const DATOS = {
  "meta": {
    "slug": "triana_reformas",
    "titulo": "Triana en cifras",
    "subtitulo": "Anatomía de una entrevista reformista: dónde acierta, dónde falla la aritmética y a quién se deja de nombrar",
    "descripcion": "Disección de una entrevista de ~67 minutos con el economista Juan Triana sobre el paquete de reformas cubano. Diagnóstico general sólido; precisión cuantitativa y atribución causal, mucho más débiles.",
    "narracion": "Juan Triana representa a un economista reformista dentro del marco institucional cubano. Su diagnóstico general es sólido: exige secuencia y responsables, critica el exceso de empresas estatales, defiende subsidiar personas en lugar de productos y reconoce al sector privado como estratégico. Pero cuando pasa a las cifras, el rigor se desploma. Su aritmética petrolera es incompatible consigo misma; confunde el coste de reconstruir el sistema eléctrico; y usa comparaciones sin denominador. Además, para los fallos internos emplea abstracciones como resistencia o implementación, mientras que para la política estadounidense usa sujetos, nombres e intenciones. El resultado es un análisis que ayuda a mover el debate desde la prohibición hacia la reforma, pero que no termina de romper con el lenguaje y las omisiones que permitieron el estancamiento.",
    "fecha_analisis": "2026-07-14",
    "actualizado": "2026-07-14",
    "duracion_min": 67,
    "programa": "A lo cortico — La Joven Cuba",
    "entrevistado": "Juan Triana",
    "genero": "economista"
  },
  "veredicto": {
    "resumen": "No es un economista incompetente. Es un economista con formación y experiencia, condicionado por dos límites: una tradición económica excesivamente discursiva, con pocos números auditables, y una prudencia política que le impide identificar quién tomó las decisiones responsables del estancamiento.",
    "dimensiones": [
      { "clave": "Conocimiento institucional e histórico", "nivel": "alto", "valor": 85 },
      { "clave": "Intuición microeconómica", "nivel": "media-alta", "valor": 68 },
      { "clave": "Precisión cuantitativa", "nivel": "baja", "valor": 26 },
      { "clave": "Análisis macroeconómico y causal", "nivel": "medio-bajo", "valor": 38 },
      { "clave": "Independencia frente al relato oficial", "nivel": "limitada", "valor": 45 },
      { "clave": "Programa verificable", "nivel": "insuficiente", "valor": 30 }
    ]
  },
  "puntuacion": {
    "escala": 10,
    "nota": "Puntuación de esta intervención concreta, no de toda la carrera académica.",
    "items": [
      { "dimension": "Conocimiento de la economía cubana", "valor": 8 },
      { "dimension": "Intuición sobre reformas de mercado", "valor": 7 },
      { "dimension": "Claridad pedagógica", "valor": 6 },
      { "dimension": "Precisión numérica", "valor": 3 },
      { "dimension": "Consistencia aritmética", "valor": 2 },
      { "dimension": "Análisis causal", "valor": 4 },
      { "dimension": "Comparación internacional", "valor": 3 },
      { "dimension": "Independencia crítica", "valor": 5 },
      { "dimension": "Diseño operativo de políticas", "valor": 4 },
      { "dimension": "Utilidad global de la entrevista", "valor": 6 }
    ]
  },
  "petroleo": {
    "titulo": "La cuadratura imposible",
    "intro": "Triana ofrece tres cifras sobre la necesidad petrolera del país. Las tres no pueden ser simultáneamente correctas. Mueve el consumo diario y compruébalo: no existe ningún valor que satisfaga las tres a la vez.",
    "cargamento_barriles": 800000,
    "necesidad_min_bpd": 130000,
    "necesidad_max_bpd": 150000,
    "dias_afirmados": 15,
    "afirmaciones": [
      { "id": "diaria", "texto": "Necesidad diaria de 130.000 a 150.000 barriles" },
      { "id": "duracion", "texto": "Un cargamento de 800.000 barriles dura ~15 días" },
      { "id": "mensual", "texto": "Necesidad mensual: 800.000 × 2 ≈ 1,6 millones de barriles" }
    ],
    "hechos": [
      "A 130.000 b/d, el consumo mensual sería 3,9 millones, no 1,6 millones.",
      "A 150.000 b/d, serían 4,5 millones mensuales.",
      "Un cargamento de 800.000 barriles dura entre 5,3 y 6,2 días, no 15.",
      "Para que 800.000 durasen 15 días, el consumo tendría que ser de solo 53.333 b/d.",
      "El cálculo mensual está errado por un factor aproximado de 2,4 a 2,8."
    ]
  },
  "termoelectricas": {
    "titulo": "El salto que faltó sumar",
    "intro": "Triana estima bien el orden de magnitud por planta, y luego olvida multiplicar. Cinco o seis bloques de 200 millones no son 200 millones.",
    "coste_mw_min_usd": 800000,
    "coste_mw_max_usd": 1000000,
    "coste_planta_usd": 200000000,
    "plantas_min": 5,
    "plantas_max": 6,
    "coste_afirmado_usd": 200000000,
    "coste_real_min_usd": 1000000000,
    "coste_real_max_usd": 1200000000,
    "costes_omitidos": [
      "Transmisión",
      "Subestaciones",
      "Control y estabilidad de red",
      "Reservas de potencia",
      "Puertos y almacenamiento",
      "Suministro de combustible",
      "Mantenimiento",
      "Capital circulante"
    ],
    "cierre": "Su cifra sirve como cálculo incompleto de generación, no como presupuesto del rescate eléctrico."
  },
  "electricidad_regional": {
    "titulo": "El coste técnico no es excepcional",
    "intro": "Triana usa la tarifa subsidiada cubana para sugerir que el consumidor paga muy poco. Es cierto nominalmente, pero no dice nada sobre el coste de producir electricidad. Otros sistemas insulares afrontan costes físicos iguales o mayores.",
    "paises": [
      { "pais": "Cuba", "tarifa_usd_kwh": null, "perdidas_pct": null, "nota": "Tarifa fuertemente subsidiada, servicio muy interrumpido: el precio no recupera costes y la escasez sustituye al precio." },
      { "pais": "Jamaica", "tarifa_usd_kwh": 0.36, "perdidas_pct": 27, "nota": "Alta dependencia importadora, pérdidas elevadas y pequeña escala." },
      { "pais": "Rep. Dominicana", "tarifa_usd_kwh": 0.24, "perdidas_pct": 30, "nota": "Tarifas históricamente altas, subsidios sustanciales y debilidad de cobro." },
      { "pais": "Puerto Rico", "tarifa_usd_kwh": 0.28, "perdidas_pct": 15, "nota": "Insularidad, combustibles importados y red vulnerable a huracanes." },
      { "pais": "Barbados", "tarifa_usd_kwh": 0.30, "perdidas_pct": 8, "nota": "Sistema pequeño e insular; transición renovable costosa pero viable, mejor entorno de inversión." }
    ],
    "diferencia": "La diferencia decisiva no es el coste físico: es que Cuba combinó alto coste técnico, tarifa artificialmente baja, baja inversión, restricción financiera y mantenimiento diferido. El resultado previsible es déficit de caja, averías, apagones, menos producción y menos recaudación."
  },
  "arroz": {
    "titulo": "La parcela que no es el país",
    "intro": "Triana cita rendimientos de 7, 8 y 9 toneladas de arroz por hectárea de productores vietnamitas. Son posibles en parcelas intensivas, variedades seleccionadas y proyectos demostrativos. Confundirlos con el rendimiento nacional es sesgo de selección.",
    "rendimientos_demostrativos": [7, 8, 9],
    "faltan": [
      "Rendimiento nacional promedio",
      "Varianza entre parcelas",
      "Coste por hectárea",
      "Agua y fertilizante por hectárea",
      "Rentabilidad real",
      "Porcentaje de superficie replicable"
    ],
    "cierre": "Sin eso, la cifra funciona como anécdota favorable, no como evidencia de política agrícola."
  },
  "aciertos": [
    { "titulo": "Exige secuencia, responsables y calendario", "texto": "El paquete contiene el «qué», pero no el «cómo, cuándo y quién». Sin eso, el gobierno puede anunciar mucho, ejecutar poco y culpar luego a la implementación. Es su crítica más importante, aunque no la lleva hasta el final." },
    { "titulo": "Sobran empresas estatales", "texto": "Cuba mantiene miles de empresas formalmente estatales, muchas insolventes y sin función estratégica clara. Reducirlas y concentrarse en lo realmente estratégico libera capital, subsidios y control administrativo." },
    { "titulo": "Los topes de precio mal diseñados destruyen oferta", "texto": "Un precio máximo por debajo del coste genera menos oferta, subdeclaración, mercado negro, corrupción y peor calidad. Su error no está en la teoría, sino en no desarrollar qué política de competencia y transferencias lo sustituiría." },
    { "titulo": "Mejor subsidiar personas que productos", "texto": "Subsidiar a todos por igual acaba beneficiando también a hogares con recursos. Las transferencias focalizadas mejoran eficiencia y progresividad, aunque su idea de «tiendas específicas» reproduciría colas, estigma y arbitraje." },
    { "titulo": "La competencia no depende de la propiedad privada", "texto": "Varias empresas públicas pueden competir. Pero solo si tienen presupuestos separados, sin rescates automáticos, con directivos no nombrados por el mismo órgano. Si no, cuatro empresas estatales son cuatro departamentos del mismo monopolio." },
    { "titulo": "El sector privado es estratégico, no un apéndice", "texto": "Con cerca del 35 % del empleo fuera del sector estatal, tratarlo como complemento tolerado es insostenible. Limitar por decreto el número de empresas de una persona no elimina la concentración: la traslada a testaferros." }
  ],
  "errores_cuantitativos": [
    { "titulo": "Aritmética petrolera incompatible", "texto": "Sus tres cifras sobre la necesidad petrolera no pueden coexistir. El cálculo mensual está errado por un factor de 2,4 a 2,8, hablando de la principal restricción energética del país." },
    { "titulo": "Confunde consumo, demanda y necesidad técnica", "texto": "«Cuba necesita 130.000–150.000 barriles diarios» mezcla consumo observado de una economía deprimida con la demanda de una economía normalizada, sin año, fuente ni composición." },
    { "titulo": "No multiplica el coste eléctrico", "texto": "Cinco o seis centrales de 200 millones no son 200 millones, sino 1.000 a 1.200. Y sustituir bloques de generación no equivale a reconstruir el sistema completo." },
    { "titulo": "«Un centavo por kWh» es engañoso", "texto": "La cifra depende de qué tasa de cambio se use, entre varias simultáneas. Una tarifa casi gratuita que no está disponible no es verdaderamente barata: ignora salarios reales, apagones y costes privados de baterías y alimentos perdidos." },
    { "titulo": "Comparación regional sin denominador", "texto": "Confunde precio pagado por el hogar con coste de producir. Otros sistemas insulares tienen costes iguales o mayores, pero cobran más cerca del coste y permiten inversión." },
    { "titulo": "7–9 t/ha no es representativo", "texto": "Seleccionar la parcela de alto rendimiento es sesgo de selección. Falta la media, la varianza, el coste y el porcentaje de superficie replicable." }
  ],
  "falacias": [
    { "titulo": "Falacia de la implementación", "texto": "«Dependerá de cómo se implemente» puede volverse un escudo: una política cuyo diseño ignora incentivos y capacidad administrativa ya está mal diseñada, aunque sus objetivos sean razonables." },
    { "titulo": "Agente pasivo", "texto": "«La reforma se paró», «había resistencia», «no se autorizó». La voz pasiva convierte decisiones deliberadas en fenómenos meteorológicos. ¿Quién la paró, con qué autoridad y a qué coste?" },
    { "titulo": "Falsa equivalencia sobre la resistencia", "texto": "Comparar la resistencia a las reformas con cambiar los muebles o con el primer novio de una hija banaliza una defensa racional de poder y rentas de ministerios, monopolios de importación y empresas militares." },
    { "titulo": "Sesgo de supervivencia en los directivos", "texto": "Afirmar que los directivos cubanos superan a gerentes multinacionales, citando a los que triunfaron fuera, confunde titulaciones con capacidad y no compara productividad ni retorno sobre activos." },
    { "titulo": "Falacia de intención sobre los accionistas", "texto": "Advertir contra quienes compran acciones «para hacer dinero» confunde el mecanismo del mercado con una desviación. Lo que hay que perseguir son privilegios, fraude y captura, no el ánimo de lucro." },
    { "titulo": "Acciones privilegiadas no son control", "texto": "El Estado podría quedarse con 20–40 % y «mantener control» con acciones privilegiadas, pero eso exige definir derechos sobre dividendos, nombramientos, venta de activos, deuda, fusiones y liquidación. No basta decir que tendrá voto." },
    { "titulo": "«La competencia genera eficiencia sin dudas»", "texto": "La competencia puede mejorar la eficiencia, pero también duplicar en monopolios naturales, generar colusión o exclusión. Cuatro telefónicas con la misma red y el mismo dueño no compiten." },
    { "titulo": "Post hoc sobre la demora de las mipymes", "texto": "Atribuir el retraso de las pymes a una declaración estadounidense de 1995–96 concede al adversario un veto sobre la política económica nacional. La decisión de prohibirlas siguió siendo de las autoridades cubanas." },
    { "titulo": "«EE. UU. nunca quitó sanciones»", "texto": "Es falso en sentido literal: con Obama se restablecieron relaciones, se ampliaron viajes y remesas y se retiró temporalmente a Cuba de la lista de patrocinadores del terrorismo. Lo correcto: relajó restricciones, pero no desmontó el núcleo legislativo del embargo." },
    { "titulo": "Exageración de la Helms–Burton", "texto": "La ley fija criterios para reconocer un gobierno de transición y condiciona el levantamiento de sanciones, pero no otorga jurídicamente a EE. UU. la facultad de nombrar al presidente cubano." },
    { "titulo": "«Arma genocida»", "texto": "El embargo impone costes reales y bien documentados, pero «genocida» tiene un significado jurídico específico —intención de destruir a un grupo— que no se demuestra. El término reemplaza la estimación que un economista debería intentar." },
    { "titulo": "Atribución monocausal", "texto": "La entrevista da un peso narrativo desproporcionado a EE. UU. y muy poco al Ordenamiento, la emisión monetaria, las prohibiciones empresariales, la inversión en hoteles o la descapitalización agrícola. Reducir el problema al embargo es falso; negar su coste, también." }
  ],
  "omisiones": [
    { "titulo": "La restricción presupuestaria del Estado", "texto": "Propone proteger salarios, transferir, rehabilitar la red, dar créditos solares y recapitalizar, pero no plantea de qué se financia. Sin crédito y con baja productividad, Cuba ha financiado sus desequilibrios con emisión: reformar sin cuantificar el déficit arriesga otra ronda inflacionaria." },
    { "titulo": "Propiedad y seguridad jurídica", "texto": "Acciones e inversión extranjera carecen de credibilidad sin garantías sobre expropiación, tribunales, ejecución contractual, repatriación de dividendos, convertibilidad y quiebra. Que hoy sea «políticamente aceptado» no basta." },
    { "titulo": "Producción frente a comercio importador", "texto": "Muchas mipymes se concentran en importación y reventa. Eso mejora el abasto, pero no es expansión de capacidad productiva. Contar mipymes sin medir valor añadido es tan insuficiente como contar empresas estatales." },
    { "titulo": "El fracaso de la inversión turística", "texto": "No pregunta por qué el Estado destinó durante años tanta inversión a hoteles mientras se deterioraban redes, agua, agricultura y vivienda. Eso no es geografía ni embargo: fue una decisión interna de asignación de capital." },
    { "titulo": "El coste de no reformar", "texto": "Reconoce que estas reformas debieron hacerse treinta años antes, pero no calcula el coste de la demora: producción perdida, migración, capital destruido, crecimiento acumulado no realizado." }
  ],
  "causal": {
    "titulo": "¿De quién es la crisis?",
    "intro": "La explicación honesta es multicausal. Estas ponderaciones ilustran el énfasis narrativo, no una medición: comparan el peso que Triana concede a cada factor con una lectura más equilibrada.",
    "advertencia": "Ponderaciones ilustrativas del énfasis del discurso, no estimaciones econométricas.",
    "factores": [
      { "nombre": "Sanciones y bloqueo de EE. UU.", "peso_triana": 55, "peso_equilibrado": 25 },
      { "nombre": "Modelo institucional interno", "peso_triana": 12, "peso_equilibrado": 22 },
      { "nombre": "Errores macroeconómicos", "peso_triana": 8, "peso_equilibrado": 15 },
      { "nombre": "Mala asignación de capital", "peso_triana": 6, "peso_equilibrado": 12 },
      { "nombre": "Descapitalización y mantenimiento", "peso_triana": 7, "peso_equilibrado": 10 },
      { "nombre": "Pérdida de credibilidad", "peso_triana": 5, "peso_equilibrado": 8 },
      { "nombre": "Éxodo y shock demográfico", "peso_triana": 7, "peso_equilibrado": 8 }
    ]
  },
  "demora": {
    "titulo": "El precio compuesto de esperar",
    "intro": "Triana admite que la reforma iniciada en 1990 no tenía por qué haberse parado. Una diferencia de apenas unos puntos de crecimiento anual, sostenida durante décadas, se multiplica. Ajusta la brecha y los años.",
    "formula": "Y_T = Y₀ · (1 + g)^T",
    "base_indice": 100,
    "brecha_default_pct": 3,
    "años_default": 30,
    "años_max": 40,
    "brecha_max_pct": 5,
    "cierre": "Tres puntos porcentuales durante treinta años producen un factor cercano a 2,43: la demora reformista puede explicar diferencias de varias veces en ingreso y capital acumulado."
  },
  "encuesta": {
    "titulo": "Tu lectura",
    "intro": "Esta entrevista trata, en el fondo, de a quién se atribuye la crisis y de qué se le puede exigir a un economista público. Vota: los resultados se comparan con los de otros lectores.",
    "tabla_supabase": "votos_triana_reformas",
    "rpc_incrementar": "incrementar_voto",
    "preguntas": [
      {
        "id": "factor_principal",
        "texto": "En tu criterio, ¿cuál es el factor de MAYOR peso en la crisis cubana?",
        "opciones": [
          { "id": "bloqueo", "texto": "El bloqueo y las sanciones de EE. UU." },
          { "id": "modelo", "texto": "El modelo institucional interno" },
          { "id": "macro", "texto": "Los errores macroeconómicos (Ordenamiento, emisión)" },
          { "id": "capital", "texto": "La mala asignación de capital (p. ej., hoteles)" },
          { "id": "descap", "texto": "La descapitalización y el mantenimiento diferido" },
          { "id": "demografia", "texto": "El éxodo y el shock demográfico" }
        ]
      },
      {
        "id": "reforma_alivio",
        "texto": "¿Traerá este paquete de reformas un alivio real para la mayoría en menos de un año?",
        "opciones": [
          { "id": "si", "texto": "Sí" },
          { "id": "no", "texto": "No" },
          { "id": "algunos", "texto": "Quizás, y solo para algunos" }
        ]
      },
      {
        "id": "responsabilidad",
        "texto": "¿Debe un economista público nombrar a los responsables internos del estancamiento?",
        "opciones": [
          { "id": "nombrar", "texto": "Sí, debe nombrarlos" },
          { "id": "criticar", "texto": "Basta con criticar el modelo" },
          { "id": "depende", "texto": "Depende del contexto y del riesgo" }
        ]
      }
    ]
  },
  "conclusion": {
    "titulo": "El núcleo reformista y su límite",
    "parrafos": [
      "La entrevista contiene un núcleo reformista valioso: menos empresas estatales, empresas realmente autónomas, competencia, un sector privado fuerte, inversión extranjera, subsidios focalizados, tarifas más racionales y continuidad. Eso importa.",
      "Pero evita la conclusión completa: Cuba no está estancada únicamente porque las reformas se implementaron mal. Está estancada porque durante décadas se prohibieron, retrasaron o revirtieron deliberadamente instituciones económicas normales, y porque los decisores no asumieron el coste de sus errores.",
      "Las sanciones estadounidenses han elevado de forma real y a veces muy grave el coste de operar, financiar, transportar e invertir. Negarlo sería deshonesto. Pero otros países insulares soportan combustibles importados, electricidad cara, huracanes y mercados pequeños sin reproducir el mismo grado de colapso."
    ],
    "ecuacion_terminos": [
      "Sanciones externas",
      "Modelo institucional",
      "Errores macroeconómicos",
      "Mala asignación de capital",
      "Descapitalización",
      "Pérdida de credibilidad",
      "Shock demográfico"
    ],
    "cierre": "Su valor está en ayudar a mover el debate cubano desde la prohibición hacia la reforma. Su límite, en no romper del todo con el lenguaje, las omisiones y las protecciones causales que permitieron el estancamiento que ahora intenta corregir."
  },
  "fuentes": [
    { "titulo": "Entrevista: «A lo cortico, con Juan Triana» — La Joven Cuba (YouTube)", "url": "https://www.youtube.com/watch?v=s_YYQ-9vVc8" },
    { "titulo": "Cuba — Wikipedia (salarios, universo empresarial)", "url": "https://es.wikipedia.org/wiki/Cuba" },
    { "titulo": "Economy of Cuba — Wikipedia (empleo no estatal)", "url": "https://en.wikipedia.org/wiki/Economy_of_Cuba" },
    { "titulo": "Reuters — Cuba's petroleum problem (necesidades petroleras)", "url": "https://www.reuters.com/world/us/russian-oil-only-delays-cubas-petroleum-problem-2026-04-08/" },
    { "titulo": "Jamaica Public Service — Wikipedia (tarifa y pérdidas)", "url": "https://en.wikipedia.org/wiki/Jamaica_Public_Service" },
    { "titulo": "Electricity sector in the Dominican Republic — Wikipedia", "url": "https://en.wikipedia.org/wiki/Electricity_sector_in_the_Dominican_Republic" },
    { "titulo": "Helms–Burton Act — Wikipedia", "url": "https://en.wikipedia.org/wiki/Helms%E2%80%93Burton_Act" },
    { "titulo": "The Guardian — Cuba's polycrisis (análisis multicausal)", "url": "https://www.theguardian.com/global-development/2026/jan/10/cuba-regime-polycrisis-collapse-exodus-economy-migration-us-sanctions-trump" }
  ]
};

/* ---------- helpers ---------- */
const fmt = (n) => new Intl.NumberFormat("es-ES").format(Math.round(n));
const fmtM = (n) => (n >= 1e9 ? (n / 1e9).toFixed(1) + " mil M" : (n / 1e6).toFixed(0) + " M");

function Eyebrow({ n, children, color = C.gold }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <span style={{ fontFamily: F.mono, fontSize: 12, color, letterSpacing: 2, border: `1px solid ${color}`, borderRadius: 2, padding: "2px 7px" }}>{n}</span>
      <span style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, letterSpacing: 3, textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

function H({ children, size = 30 }) {
  return <h2 style={{ fontFamily: F.disp, fontWeight: 800, fontSize: size, lineHeight: 1.02, color: C.ink, margin: "0 0 16px", letterSpacing: -0.5 }}>{children}</h2>;
}

function P({ children, style }) {
  return <p style={{ fontFamily: F.body, fontSize: 16.5, lineHeight: 1.62, color: "#4a3f36", margin: "0 0 14px", ...style }}>{children}</p>;
}

function Section({ children, style }) {
  return <section style={{ maxWidth: 940, margin: "0 auto", padding: "56px 22px", ...style }}>{children}</section>;
}

function Card({ children, style }) {
  return <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 24, boxShadow: "var(--y-shadow)", padding: 18, ...style }}>{children}</div>;
}

/* ============================ VEREDICTO ============================ */
function Veredicto({ d }) {
  return (
    <Section>
      <Eyebrow n="01">Veredicto</Eyebrow>
      <H>El diagnóstico convence; la aritmética, no</H>
      <P>{d.resumen}</P>
      <div style={{ marginTop: 26, display: "grid", gap: 12 }}>
        {d.dimensiones.map((x, i) => {
          const col = x.valor >= 60 ? C.jade : x.valor >= 40 ? C.gold : C.coral;
          return (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                <span style={{ fontFamily: F.body, fontSize: 15, color: C.ink }}>{x.clave}</span>
                <span style={{ fontFamily: F.mono, fontSize: 12, color: col, textTransform: "uppercase", letterSpacing: 1 }}>{x.nivel}</span>
              </div>
              <div style={{ height: 8, background: C.bg2, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: x.valor + "%", height: "100%", background: col, borderRadius: 4, transition: "width .8s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ============================ RADAR ============================ */
function RadarDesempeno({ d }) {
  const data = d.items.map((x) => ({ dim: x.dimension, v: x.valor }));
  return (
    <Section>
      <Eyebrow n="02" color={C.violet}>Puntuación · 0–10</Eyebrow>
      <H>Diez ejes, un perfil desigual</H>
      <P>Conocimiento e intuición altos; consistencia aritmética y comparación internacional, en el suelo. {d.nota}</P>
      <div style={{ width: "100%", height: 420 }}>
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke={C.line} />
            <PolarAngleAxis dataKey="dim" tick={{ fill: C.mut, fontSize: 11, fontFamily: F.mono }} />
            <PolarRadiusAxis domain={[0, 10]} tick={{ fill: C.line, fontSize: 10 }} axisLine={false} tickCount={6} />
            <Radar dataKey="v" stroke={C.gold} fill={C.gold} fillOpacity={0.28} strokeWidth={2} dot />
            <Tooltip contentStyle={tipStyle} itemStyle={tipItem} labelStyle={tipItem} formatter={(v) => [v + " / 10", "Nota"]} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}

const tipStyle = { background: "#3a2418", border: 0, borderRadius: 12, boxShadow: "0 8px 24px rgba(40,25,10,.22)", fontFamily: F.mono, fontSize: 12, color: "#fcf9f4" };
const tipItem = { color: "#fcf9f4" };

/* ============================ PETRÓLEO (interactivo, firma) ============================ */
function PetroleoInteractivo({ d }) {
  const [bpd, setBpd] = useState(d.necesidad_min_bpd);
  const dias = d.cargamento_barriles / bpd;
  const mensual = bpd * 30;
  const bpdParaAfirmado = d.cargamento_barriles / d.dias_afirmados; // ~53.333
  const contradiccion = Math.abs(dias - d.dias_afirmados) > 1.5;

  const claim = (ok, label, val) => (
    <div style={{ flex: 1, minWidth: 180, background: C.bg2, border: `1px solid ${ok ? C.jade : C.coral}`, borderRadius: 6, padding: 14 }}>
      <div style={{ fontFamily: F.mono, fontSize: 10.5, color: ok ? C.jade : C.coral, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
        {ok ? "coherente ahora" : "incompatible"}
      </div>
      <div style={{ fontFamily: F.body, fontSize: 13.5, color: C.ink, lineHeight: 1.4, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: F.mono, fontSize: 15, color: C.ink }}>{val}</div>
    </div>
  );

  return (
    <Section>
      <Eyebrow n="03" color={C.coral}>Firma · aritmética petrolera</Eyebrow>
      <H>{d.titulo}</H>
      <P>{d.intro}</P>

      <Card style={{ marginTop: 22, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: F.mono, fontSize: 12, color: C.mut, letterSpacing: 1 }}>CONSUMO DIARIO (barriles)</span>
          <span style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 34, color: C.gold }}>{fmt(bpd)}</span>
        </div>
        <input
          type="range" min={40000} max={160000} step={1000} value={bpd}
          onChange={(e) => setBpd(Number(e.target.value))}
          aria-label="Consumo diario de barriles"
          style={{ width: "100%", marginTop: 10, accentColor: C.gold }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 10.5, color: C.line }}>
          <span>40.000</span>
          <span style={{ color: C.mut }}>rango que él afirma: {fmt(d.necesidad_min_bpd)}–{fmt(d.necesidad_max_bpd)}</span>
          <span>160.000</span>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          {claim(bpd >= d.necesidad_min_bpd && bpd <= d.necesidad_max_bpd, "«Necesidad diaria de 130.000–150.000 barriles»", fmt(bpd) + " b/d")}
          {claim(!contradiccion, "«Un cargamento de 800.000 barriles dura ~15 días»", dias.toFixed(1) + " días reales")}
          {claim(false, "«Necesidad mensual ≈ 1,6 millones»", fmt(mensual) + " b/mes")}
        </div>

        <div style={{ marginTop: 18, padding: "12px 14px", background: C.bg, border: `1px dashed ${C.coral}`, borderRadius: 6, fontFamily: F.mono, fontSize: 12.5, color: "#8a3a26", lineHeight: 1.55 }}>
          Para que 800.000 barriles durasen los 15 días afirmados, el consumo tendría que ser de solo <b style={{ color: C.coral }}>{fmt(bpdParaAfirmado)} b/d</b> — muy por debajo de su propio rango. Ninguna posición del control satisface las tres afirmaciones a la vez.
        </div>
      </Card>

      <div style={{ marginTop: 20, display: "grid", gap: 8 }}>
        {d.hechos.map((h, i) => (
          <div key={i} style={{ display: "flex", gap: 10, fontFamily: F.mono, fontSize: 13, color: C.mut, lineHeight: 1.5 }}>
            <span style={{ color: C.coral }}>→</span><span>{h}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ============================ TERMOELÉCTRICAS ============================ */
function SaltoTermico({ d }) {
  const plantas = d.plantas_min;
  const barras = Array.from({ length: plantas }, (_, i) => ({
    name: "Bloque " + (i + 1),
    v: d.coste_planta_usd / 1e6,
    acum: (d.coste_planta_usd / 1e6) * (i + 1),
  }));
  const dichoM = d.coste_afirmado_usd / 1e6;
  const realM = d.coste_planta_usd * plantas / 1e6;
  return (
    <Section>
      <Eyebrow n="04" color={C.cyan}>Coste eléctrico</Eyebrow>
      <H>{d.titulo}</H>
      <P>{d.intro}</P>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 20 }}>
        <Card style={{ flex: 1, minWidth: 200, textAlign: "center", borderColor: C.coral }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, letterSpacing: 1 }}>ÉL DICE</div>
          <div style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 40, color: C.coral, margin: "8px 0" }}>${dichoM} M</div>
          <div style={{ fontFamily: F.body, fontSize: 13, color: C.mut }}>por {plantas} bloques de 200 MW</div>
        </Card>
        <div style={{ display: "flex", alignItems: "center", fontFamily: F.disp, fontWeight: 800, fontSize: 34, color: C.line }}>≠</div>
        <Card style={{ flex: 1, minWidth: 200, textAlign: "center", borderColor: C.jade }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, letterSpacing: 1 }}>SUMA REAL</div>
          <div style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 40, color: C.jade, margin: "8px 0" }}>${fmt(realM)} M</div>
          <div style={{ fontFamily: F.body, fontSize: 13, color: C.mut }}>200 × {plantas} = {fmt(realM)}, no {dichoM}</div>
        </Card>
      </div>

      <div style={{ width: "100%", height: 260, marginTop: 26 }}>
        <ResponsiveContainer>
          <BarChart data={barras} margin={{ top: 24, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: C.mut, fontSize: 11, fontFamily: F.mono }} axisLine={{ stroke: C.line }} tickLine={false} />
            <YAxis tick={{ fill: C.mut, fontSize: 11, fontFamily: F.mono }} axisLine={false} tickLine={false} unit="M" />
            <Tooltip contentStyle={tipStyle} itemStyle={tipItem} labelStyle={tipItem} formatter={(v, k) => [`$${v} M`, k === "acum" ? "Acumulado" : "Bloque"]} cursor={{ fill: "rgba(60,40,20,0.05)" }} />
            <ReferenceLine y={dichoM} stroke={C.coral} strokeDasharray="4 4" label={{ value: "cifra afirmada", fill: C.coral, fontSize: 11, fontFamily: F.mono, position: "insideTopLeft" }} />
            <Bar dataKey="v" fill={C.cyan} radius={[3, 3, 0, 0]}>
              <LabelList dataKey="acum" position="top" formatter={(v) => "Σ " + v} style={{ fill: C.gold, fontFamily: F.mono, fontSize: 11 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Card style={{ marginTop: 20 }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, letterSpacing: 1, marginBottom: 10 }}>Y ESTO NI SIQUIERA RECONSTRUYE EL SISTEMA. FALTA:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {d.costes_omitidos.map((c, i) => (
            <span key={i} style={{ fontFamily: F.mono, fontSize: 12, color: C.ink, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 20, padding: "5px 12px" }}>{c}</span>
          ))}
        </div>
        <P style={{ marginTop: 14, marginBottom: 0, fontSize: 15 }}>{d.cierre}</P>
      </Card>
    </Section>
  );
}

/* ============================ ELECTRICIDAD REGIONAL ============================ */
function ElectricidadRegional({ d }) {
  const data = d.paises.filter((p) => p.tarifa_usd_kwh != null).map((p) => ({ pais: p.pais, tarifa: p.tarifa_usd_kwh, perdidas: p.perdidas_pct }));
  const cuba = d.paises.find((p) => p.pais === "Cuba");
  return (
    <Section>
      <Eyebrow n="05" color={C.gold}>Comparación regional</Eyebrow>
      <H>{d.titulo}</H>
      <P>{d.intro}</P>

      <div style={{ width: "100%", height: 300, marginTop: 20 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, left: 24, bottom: 0 }}>
            <XAxis type="number" tick={{ fill: C.mut, fontSize: 11, fontFamily: F.mono }} axisLine={{ stroke: C.line }} tickLine={false} domain={[0, 0.4]} tickFormatter={(v) => "$" + v} />
            <YAxis type="category" dataKey="pais" tick={{ fill: C.ink, fontSize: 12, fontFamily: F.mono }} axisLine={false} tickLine={false} width={110} />
            <Tooltip contentStyle={tipStyle} itemStyle={tipItem} labelStyle={tipItem} formatter={(v, k) => [k === "tarifa" ? "$" + v + " /kWh" : v + " %", k === "tarifa" ? "Tarifa" : "Pérdidas"]} cursor={{ fill: "rgba(60,40,20,0.05)" }} />
            <Bar dataKey="tarifa" radius={[0, 4, 4, 0]}>
              <LabelList dataKey="tarifa" position="right" formatter={(v) => "$" + v.toFixed(2)} style={{ fill: C.mut, fontFamily: F.mono, fontSize: 11 }} />
              {data.map((e, i) => <Cell key={i} fill={RUEDA[i % RUEDA.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <Card style={{ marginTop: 8, borderColor: C.coral }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.coral, letterSpacing: 1, marginBottom: 6 }}>CUBA — SIN TARIFA DE MERCADO COMPARABLE</div>
        <P style={{ marginBottom: 0, fontSize: 15 }}>{cuba ? cuba.nota : ""}</P>
      </Card>

      <P style={{ marginTop: 20 }}>{d.diferencia}</P>
    </Section>
  );
}

/* ============================ ARROZ ============================ */
function SesgoArroz({ d }) {
  const dots = [4.2, 3.1, 5.0, 3.8, 2.9, 4.6, 3.3, 5.4, 4.0, 3.6]; // dispersión ilustrativa nacional
  const media = 3.9;
  const W = 640, Hh = 150, pad = 40, max = 10;
  const x = (v) => pad + (v / max) * (W - pad * 2);
  return (
    <Section>
      <Eyebrow n="06" color={C.jade}>Sesgo de selección</Eyebrow>
      <H>{d.titulo}</H>
      <P>{d.intro}</P>

      <Card style={{ marginTop: 20, overflowX: "auto" }}>
        <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" role="img" aria-label="Dispersión de rendimientos de arroz">
          <line x1={pad} y1={Hh - 34} x2={W - pad} y2={Hh - 34} stroke={C.line} />
          {[0, 2, 4, 6, 8, 10].map((t) => (
            <g key={t}>
              <line x1={x(t)} y1={Hh - 38} x2={x(t)} y2={Hh - 30} stroke={C.line} />
              <text x={x(t)} y={Hh - 16} fill={C.mut} fontSize="10" fontFamily={F.mono} textAnchor="middle">{t}</text>
            </g>
          ))}
          <text x={W - pad} y={Hh - 2} fill={C.mut} fontSize="10" fontFamily={F.mono} textAnchor="end">t/ha</text>
          {/* banda promedio nacional */}
          <rect x={x(3)} y={20} width={x(5) - x(3)} height={Hh - 60} fill={C.jade} opacity="0.10" />
          <line x1={x(media)} y1={16} x2={x(media)} y2={Hh - 34} stroke={C.jade} strokeDasharray="4 3" />
          <text x={x(media)} y={12} fill={C.jade} fontSize="10" fontFamily={F.mono} textAnchor="middle">promedio ≈ 3,9</text>
          {dots.map((v, i) => (
            <circle key={i} cx={x(v)} cy={Hh - 34 - 8 - (i % 3) * 10} r="4" fill={C.mut} opacity="0.8" />
          ))}
          {/* parcelas demostrativas citadas */}
          {d.rendimientos_demostrativos.map((v, i) => (
            <g key={"d" + i}>
              <circle cx={x(v)} cy={44} r="7" fill={C.coral} />
              <text x={x(v)} y={34} fill={C.coral} fontSize="11" fontFamily={F.mono} textAnchor="middle">{v}</text>
            </g>
          ))}
        </svg>
        <div style={{ display: "flex", gap: 18, marginTop: 6, fontFamily: F.mono, fontSize: 11, color: C.mut, flexWrap: "wrap" }}>
          <span><span style={{ color: C.coral }}>●</span> parcelas citadas (7–9 t/ha)</span>
          <span><span style={{ color: C.mut }}>●</span> dispersión nacional ilustrativa</span>
          <span><span style={{ color: C.jade }}>▮</span> banda de promedio real</span>
        </div>
      </Card>

      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
        {d.faltan.map((f, i) => (
          <div key={i} style={{ fontFamily: F.mono, fontSize: 12.5, color: C.ink, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 6, padding: "10px 12px" }}>{f}</div>
        ))}
      </div>
      <P style={{ marginTop: 18 }}>{d.cierre}</P>
    </Section>
  );
}

/* ============================ LEDGER: ACIERTOS / ERRORES / FALACIAS / OMISIONES ============================ */
function Acordeon({ items, color, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ? 0 : -1);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {items.map((x, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{ background: C.panel, border: `1px solid ${isOpen ? color : C.line}`, borderRadius: 16, overflow: "hidden" }}>
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: F.mono, fontSize: 11, color, width: 22 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 15, color: C.ink, lineHeight: 1.15 }}>{x.titulo}</span>
              </span>
              <span style={{ fontFamily: F.mono, fontSize: 18, color, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</span>
            </button>
            {isOpen && (
              <div style={{ padding: "0 16px 16px 50px" }}>
                <P style={{ marginBottom: 0, fontSize: 15 }}>{x.texto}</P>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Ledger({ aciertos, errores, falacias, omisiones }) {
  const [tab, setTab] = useState("aciertos");
  const tabs = [
    { id: "aciertos", label: "Aciertos", color: C.jade, data: aciertos },
    { id: "errores", label: "Errores de cifra", color: C.coral, data: errores },
    { id: "falacias", label: "Falacias", color: C.violet, data: falacias },
    { id: "omisiones", label: "Omisiones", color: C.gold, data: omisiones },
  ];
  const active = tabs.find((t) => t.id === tab);
  return (
    <Section>
      <Eyebrow n="07" color={C.violet}>El balance</Eyebrow>
      <H>Lo que sostiene y lo que no</H>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0 22px" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ fontFamily: F.mono, fontSize: 12.5, letterSpacing: 0.5, cursor: "pointer", padding: "8px 14px", borderRadius: 20, border: `1px solid ${tab === t.id ? t.color : C.line}`, background: tab === t.id ? t.color : "transparent", color: tab === t.id ? C.bg : C.mut }}>
            {t.label} <span style={{ opacity: 0.7 }}>· {t.data.length}</span>
          </button>
        ))}
      </div>
      <Acordeon items={active.data} color={active.color} defaultOpen />
    </Section>
  );
}

/* ============================ CAUSAL (donut comparativo) ============================ */
function Causal({ d }) {
  const [modo, setModo] = useState("triana");
  const key = modo === "triana" ? "peso_triana" : "peso_equilibrado";
  const data = d.factores.map((f, i) => ({ name: f.nombre, value: f[key], color: RUEDA[i % RUEDA.length] }));
  const R = 120, cx = 150, cy = 150, thick = 42;
  // construir arcos donut manualmente
  let acc = 0;
  const arcs = data.map((s) => {
    const a0 = acc / 100 * Math.PI * 2 - Math.PI / 2;
    acc += s.value;
    const a1 = acc / 100 * Math.PI * 2 - Math.PI / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const [x0, y0] = p(R, a0), [x1, y1] = p(R, a1);
    const [xi0, yi0] = p(R - thick, a0), [xi1, yi1] = p(R - thick, a1);
    return { d: `M${x0} ${y0} A${R} ${R} 0 ${large} 1 ${x1} ${y1} L${xi1} ${yi1} A${R - thick} ${R - thick} 0 ${large} 0 ${xi0} ${yi0} Z`, color: s.color };
  });
  return (
    <Section>
      <Eyebrow n="08" color={C.coral}>Atribución causal</Eyebrow>
      <H>{d.titulo}</H>
      <P>{d.intro}</P>

      <div style={{ display: "flex", gap: 8, margin: "10px 0 20px", flexWrap: "wrap" }}>
        {[["triana", "Énfasis de Triana"], ["equilibrado", "Lectura equilibrada"]].map(([id, lab]) => (
          <button key={id} onClick={() => setModo(id)}
            style={{ fontFamily: F.mono, fontSize: 12.5, cursor: "pointer", padding: "8px 16px", borderRadius: 4, border: `1px solid ${modo === id ? C.gold : C.line}`, background: modo === id ? C.gold : "transparent", color: modo === id ? C.bg : C.mut }}>
            {lab}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <svg viewBox="0 0 300 300" width="260" height="260" style={{ flexShrink: 0 }} role="img" aria-label="Reparto de causas">
          {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} stroke={C.bg} strokeWidth="1.5" style={{ transition: "all .5s" }} />)}
          <text x="150" y="145" fill={C.ink} fontSize="13" fontFamily={F.disp} fontWeight="800" textAnchor="middle">{modo === "triana" ? "TRIANA" : "EQUILIBRIO"}</text>
          <text x="150" y="164" fill={C.mut} fontSize="10" fontFamily={F.mono} textAnchor="middle">reparto %</text>
        </svg>
        <div style={{ flex: 1, minWidth: 240, display: "grid", gap: 7 }}>
          {data.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 11, height: 11, background: s.color, borderRadius: 2, flexShrink: 0 }} />
              <span style={{ fontFamily: F.body, fontSize: 13.5, color: C.ink, flex: 1 }}>{s.name}</span>
              <span style={{ fontFamily: F.mono, fontSize: 13, color: s.color, width: 40, textAlign: "right" }}>{s.value}%</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 16, fontFamily: F.mono, fontSize: 11.5, color: C.mut, fontStyle: "italic" }}>* {d.advertencia}</div>
    </Section>
  );
}

/* ============================ DEMORA (interactivo) ============================ */
function Demora({ d }) {
  const [g, setG] = useState(d.brecha_default_pct);
  const [T, setT] = useState(d.años_default);
  const serie = useMemo(() => {
    const arr = [];
    for (let t = 0; t <= T; t++) {
      arr.push({
        t,
        reforma: d.base_indice * Math.pow(1 + g / 100, t),
        estancado: d.base_indice,
      });
    }
    return arr;
  }, [g, T, d.base_indice]);
  const mult = Math.pow(1 + g / 100, T);

  return (
    <Section>
      <Eyebrow n="09" color={C.jade}>El coste de esperar</Eyebrow>
      <H>{d.titulo}</H>
      <P>{d.intro}</P>

      <Card style={{ marginTop: 20, padding: 22 }}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: F.mono, fontSize: 12, color: C.mut }}>BRECHA DE CRECIMIENTO ANUAL</div>
            <div style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 28, color: C.jade }}>{g.toFixed(1)} %</div>
            <input type="range" min={0} max={d.brecha_max_pct} step={0.1} value={g} onChange={(e) => setG(Number(e.target.value))} style={{ width: "100%", accentColor: C.jade }} aria-label="Brecha de crecimiento" />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: F.mono, fontSize: 12, color: C.mut }}>AÑOS DE DEMORA</div>
            <div style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 28, color: C.gold }}>{T}</div>
            <input type="range" min={5} max={d.años_max} step={1} value={T} onChange={(e) => setT(Number(e.target.value))} style={{ width: "100%", accentColor: C.gold }} aria-label="Años de demora" />
          </div>
          <div style={{ minWidth: 150, textAlign: "right", alignSelf: "center" }}>
            <div style={{ fontFamily: F.mono, fontSize: 12, color: C.mut }}>MULTIPLICADOR</div>
            <div style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 40, color: C.coral }}>×{mult.toFixed(2)}</div>
          </div>
        </div>

        <div style={{ width: "100%", height: 240, marginTop: 6 }}>
          <ResponsiveContainer>
            <LineChart data={serie} margin={{ top: 6, right: 12, left: -12, bottom: 0 }}>
              <XAxis dataKey="t" tick={{ fill: C.mut, fontSize: 10, fontFamily: F.mono }} axisLine={{ stroke: C.line }} tickLine={false} unit="a" />
              <YAxis tick={{ fill: C.mut, fontSize: 10, fontFamily: F.mono }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} itemStyle={tipItem} labelStyle={tipItem} formatter={(v, k) => [fmt(v), k === "reforma" ? "Con reforma" : "Estancado"]} labelFormatter={(l) => "Año " + l} />
              <Line type="monotone" dataKey="estancado" stroke={C.mut} strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
              <Line type="monotone" dataKey="reforma" stroke={C.jade} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 11.5, color: C.mut, textAlign: "center" }}>{d.formula}</div>
      </Card>
      <P style={{ marginTop: 18 }}>{d.cierre}</P>
    </Section>
  );
}

/* ============================ ENCUESTA (vital) ============================ */
function usePoll(cfg, slug) {
  const [conteos, setConteos] = useState({});
  const [votos, setVotos] = useState({});
  const supaRef = useRef(null);

  useEffect(() => {
    // supabase opcional: prop global o window
    if (typeof window !== "undefined" && window.__yamacoaSupabase) supaRef.current = window.__yamacoaSupabase;
    try {
      const c = JSON.parse(localStorage.getItem("enc:" + slug + ":conteos") || "{}");
      const v = JSON.parse(localStorage.getItem("enc:" + slug + ":votos") || "{}");
      setConteos(c); setVotos(v);
    } catch (e) { /* noop */ }
  }, [slug]);

  const votar = (pid, oid) => {
    setConteos((prev) => {
      const next = { ...prev, [pid]: { ...(prev[pid] || {}) } };
      const anterior = votos[pid];
      if (anterior && next[pid][anterior]) next[pid][anterior] = Math.max(0, next[pid][anterior] - 1);
      next[pid][oid] = (next[pid][oid] || 0) + 1;
      try { localStorage.setItem("enc:" + slug + ":conteos", JSON.stringify(next)); } catch (e) {}
      return next;
    });
    setVotos((prev) => {
      const next = { ...prev, [pid]: oid };
      try { localStorage.setItem("enc:" + slug + ":votos", JSON.stringify(next)); } catch (e) {}
      return next;
    });
    // sync global best-effort
    const supa = supaRef.current;
    if (supa && cfg.rpc_incrementar) {
      try {
        supa.rpc(cfg.rpc_incrementar, { p_tabla: cfg.tabla_supabase, p_pregunta: pid, p_opcion: oid });
      } catch (e) { /* silencioso */ }
    }
  };
  return { conteos, votos, votar };
}

function Encuesta({ d, slug }) {
  const { conteos, votos, votar } = usePoll(d, slug);
  return (
    <Section>
      <Eyebrow n="10" color={C.gold}>Participa</Eyebrow>
      <H>{d.titulo}</H>
      <P>{d.intro}</P>

      <div style={{ display: "grid", gap: 18, marginTop: 24 }}>
        {d.preguntas.map((q) => {
          const cnt = conteos[q.id] || {};
          const total = Object.values(cnt).reduce((a, b) => a + b, 0);
          const votado = votos[q.id];
          return (
            <Card key={q.id} style={{ padding: 20, borderColor: votado ? C.gold : C.line }}>
              <div style={{ fontFamily: F.disp, fontWeight: 800, fontSize: 17, color: C.ink, lineHeight: 1.2, marginBottom: 14 }}>{q.texto}</div>
              <div style={{ display: "grid", gap: 8 }}>
                {q.opciones.map((o, oi) => {
                  const n = cnt[o.id] || 0;
                  const pct = total ? Math.round((n / total) * 100) : 0;
                  const elegido = votado === o.id;
                  const col = RUEDA[oi % RUEDA.length];
                  return (
                    <button key={o.id} onClick={() => votar(q.id, o.id)}
                      style={{ position: "relative", textAlign: "left", cursor: "pointer", border: `1px solid ${elegido ? col : C.line}`, background: C.bg2, borderRadius: 6, padding: "11px 14px", overflow: "hidden" }}>
                      {votado && (
                        <div style={{ position: "absolute", inset: 0, width: pct + "%", background: col, opacity: elegido ? 0.28 : 0.13, transition: "width .6s ease" }} />
                      )}
                      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: F.body, fontSize: 14.5, color: C.ink }}>
                          {elegido && <span style={{ color: col, marginRight: 6 }}>✓</span>}{o.texto}
                        </span>
                        {votado && <span style={{ fontFamily: F.mono, fontSize: 13, color: col, flexShrink: 0 }}>{pct}%</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, marginTop: 10 }}>
                {votado ? `${total} ${total === 1 ? "voto" : "votos"} · toca otra opción para cambiar` : "Toca para votar"}
              </div>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}

/* ============================ CONCLUSIÓN ============================ */
function Conclusion({ d }) {
  return (
    <Section>
      <Eyebrow n="11" color={C.violet}>Cierre</Eyebrow>
      <H>{d.titulo}</H>
      {d.parrafos.map((p, i) => <P key={i}>{p}</P>)}

      <Card style={{ marginTop: 22, background: C.bg2 }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, letterSpacing: 1, marginBottom: 12 }}>LA CRISIS CUBANA =</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {d.ecuacion_terminos.map((t, i) => (
            <React.Fragment key={i}>
              <span style={{ fontFamily: F.mono, fontSize: 13, color: C.ink, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 4, padding: "6px 10px" }}>{t}</span>
              {i < d.ecuacion_terminos.length - 1 && <span style={{ fontFamily: F.disp, fontWeight: 800, color: C.gold }}>+</span>}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <P style={{ marginTop: 22, fontSize: 18, color: C.ink, borderLeft: `3px solid ${C.gold}`, paddingLeft: 16 }}>{d.cierre}</P>
    </Section>
  );
}

/* ============================ FUENTES ============================ */
function Fuentes({ fuentes }) {
  return (
    <Section style={{ paddingBottom: 80 }}>
      <div style={{ fontFamily: F.mono, fontSize: 11, color: C.mut, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, borderTop: `1px solid ${C.line}`, paddingTop: 22 }}>Fuentes</div>
      <div style={{ display: "grid", gap: 6 }}>
        {fuentes.map((f, i) => (
          <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: F.mono, fontSize: 12.5, color: C.mut, textDecoration: "none", display: "flex", gap: 8 }}>
            <span style={{ color: C.gold }}>[{i + 1}]</span>
            <span style={{ borderBottom: `1px solid ${C.line}` }}>{f.titulo}</span>
          </a>
        ))}
      </div>
    </Section>
  );
}

/* ============================ HERO ============================ */
function Hero({ meta }) {
  return (
    <header style={{ maxWidth: 940, margin: "0 auto", padding: "72px 22px 20px" }}>
      <div style={{ fontFamily: F.mono, fontSize: 12, color: C.mut, letterSpacing: 2, marginBottom: 20, display: "flex", gap: 14, flexWrap: "wrap" }}>
        <span>{meta.programa}</span><span style={{ color: C.line }}>|</span>
        <span>~{meta.duracion_min} MIN</span><span style={{ color: C.line }}>|</span>
        <span style={{ color: C.gold }}>ANÁLISIS · {meta.fecha_analisis}</span>
      </div>
      <h1 style={{ fontFamily: F.disp, fontWeight: 800, fontSize: "clamp(40px, 9vw, 82px)", lineHeight: 0.94, color: C.ink, margin: "0 0 8px", letterSpacing: -1.5 }}>
        {meta.titulo}
        <span style={{ color: C.gold }}>.</span>
      </h1>
      <p style={{ fontFamily: F.body, fontSize: 19, lineHeight: 1.5, color: "#4a3f36", maxWidth: 720, margin: "18px 0 0" }}>{meta.subtitulo}</p>
    </header>
  );
}

/* ============================ ROOT ============================ */
export default function TrianaReformas({ data: propData, supabase }) {
  // Orden: prop (fresca desde el layout) -> data importada (fallback, siempre renderiza)
  const [data, setData] = useState(propData || DATOS);

  useEffect(() => {
    if (propData) { setData(propData); return; }
    let vivo = true;
    const base = (typeof process !== "undefined" && process.env && process.env.PUBLIC_URL) || "";
    const rutas = [
      base + "/temas/triana_reformas.json",
      base + "/data/triana_reformas.json",
      base + "/triana_reformas.json",
    ];
    (async () => {
      for (const url of rutas) {
        try {
          const r = await fetch(url);
          if (r && r.ok) { const j = await r.json(); if (vivo) setData(j); return; }
        } catch (e) { /* siguiente ruta */ }
      }
      // si ninguna ruta responde, se queda la data incrustada (DATOS)
    })();
    return () => { vivo = false; };
  }, [propData]);

  useEffect(() => {
    if (supabase && typeof window !== "undefined") window.__yamacoaSupabase = supabase;
  }, [supabase]);

  if (!data) {
    return <div style={{ background: "transparent", color: C.mut, fontFamily: F.mono, minHeight: "60vh", display: "grid", placeItems: "center" }}>Cargando…</div>;
  }

  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <Hero meta={data.meta} />
      <Veredicto d={data.veredicto} />
      <RadarDesempeno d={data.puntuacion} />
      <PetroleoInteractivo d={data.petroleo} />
      <SaltoTermico d={data.termoelectricas} />
      <ElectricidadRegional d={data.electricidad_regional} />
      <SesgoArroz d={data.arroz} />
      <Ledger aciertos={data.aciertos} errores={data.errores_cuantitativos} falacias={data.falacias} omisiones={data.omisiones} />
      <Causal d={data.causal} />
      <Demora d={data.demora} />
      <Encuesta d={data.encuesta} slug={data.meta.slug} />
      <Conclusion d={data.conclusion} />
      <Fuentes fuentes={data.fuentes} />
    </div>
  );
}
