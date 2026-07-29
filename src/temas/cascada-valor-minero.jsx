import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LineChart, Line, Legend
} from "recharts";

/* ------------------------------------------------------------------
   Tema: cascada-valor-minero
   Paleta: "Acero y Laterita"
     primario  #7479B4  h235  -> portada + renderer
     laterita  #B1723E  h27   -> SOLO renderer (perdidas de la cascada)
     ambar     #C98A17        -> aviso / contrafactual (convencion de plataforma)
     hueso     #D8D2C6        -> linea de deuda (neutro, no reclama tono)
   Renderer congelado. Solo respira el .json.

   Encuesta: base unica `yamacoa_encuesta_votos` (patron A de ENCUESTAS.md).
   Clave de voto `${meta.slug}::${pregunta.id}::${opcion.id}`. Siembra de la
   lista blanca en ops/cascada/poll_supabase.sql; sin siembra el voto se
   rechaza. Sin credenciales REACT_APP_SUPABASE_* la encuesta cae a recuento
   local sin error visible.
------------------------------------------------------------------- */

const RUTA_DATOS = "/data/cascada-valor-minero.json";

const C = {
  fondo: "#111218",
  panel: "#1A1C23",
  borde: "#2A2D38",
  texto: "#E8E9ED",
  tenue: "#8B8FA3",
  acero: "#7479B4",
  aceroProfundo: "#4A5096",
  aceroTenue: "#44476A",
  laterita: "#B1723E",
  lateritaClara: "#CE9464",
  ambar: "#C98A17",
  hueso: "#D8D2C6"
};

const CONFIANZA = {
  confirmado: { etiqueta: "confirmado", color: "#7479B4", fondo: "rgba(116,121,180,0.14)" },
  calculado: { etiqueta: "calculado", color: "#9AA0C4", fondo: "rgba(154,160,196,0.12)" },
  reportado: { etiqueta: "reportado", color: "#CE9464", fondo: "rgba(206,148,100,0.13)" },
  estimado: { etiqueta: "estimado", color: "#C98A17", fondo: "rgba(201,138,23,0.14)" },
  no_cuantificado: { etiqueta: "no cuantificado", color: "#8B8FA3", fondo: "rgba(139,143,163,0.12)" }
};

const DATOS_EMBEBIDOS = {
  meta: {
    slug: "cascada-valor-minero",
    titulo: "Del subsuelo al fondo: cuanto vale realmente el niquel cubano",
    subtitulo:
      "Anclaje empirico del multiplicador VAN/in-situ a partir del unico activo minero cubano con estudio de factibilidad auditado",
    version: "1.0.0",
    actualizado: "2026-07-29",
    unidad_monetaria: "USD",
    unidad_magnitud: "millones",
    nota_metodologica:
      "Toda cifra etiquetada 'confirmado' procede literalmente de tablas del informe tecnico NI 43-101."
  },
  fuente_primaria: {
    titulo:
      "NI 43-101 Technical Report on the Mineral Resource and Mineral Reserve Estimate, Moa Project, Holguin, Cuba",
    autor_independiente: "Micon International Co Limited",
    estandar: "CIM Definition Standards 2014 / NI 43-101",
    fecha_efectiva: "2022-08-31",
    fecha_informe: "2023-03-31",
    advertencia_independencia:
      "El laboratorio DELABEL, que realizo la mayoria de los ensayos, no se considera independiente del Moa JV. La persona cualificada senala que el protocolo QAQC no incluye blancos ni materiales de referencia certificados.",
    confianza: "confirmado"
  },
  titularidad: {
    vehiculo: "Moa Joint Venture",
    socios: [
      { nombre: "Sherritt International", origen: "Canada", participacion_pct: 50 },
      { nombre: "General Nickel Company S.A.", origen: "Estado cubano", participacion_pct: 50 }
    ],
    regalia_pct: 5,
    contribucion_territorial_pct: 1,
    confianza: "confirmado"
  },
  recuperacion: {
    planta_declarada: { ni_global_planta_pct: 85.2, co_global_planta_pct: 84.2, confianza: "confirmado" },
    mina_a_metal_real: {
      recuperacion_ni_pct: 61.2,
      recuperacion_co_pct: 58.8,
      confianza: "calculado",
      nota_editorial:
        "La recuperacion de planta (85%) mide el rendimiento entre lo que entra a proceso y el metal final. La recuperacion mina-a-metal (61%) mide que fraccion del metal contenido en reservas llega a venderse."
    }
  },
  inventario_geologico: {
    nota_critica:
      "Los recursos se reportan INCLUSIVOS de las reservas. Sumar ambas categorias constituye doble contabilizacion.",
    categorias: [
      { categoria: "Reservas probadas + probables", tonelaje_mt: 117.18, metal_ni_kt: 1182.4, metal_co_kt: 144.0, confianza: "confirmado", admite_valoracion: true, es_total: true },
      { categoria: "Recursos medidos + indicados", tonelaje_mt: 156.54, metal_ni_kt: 1677.2, metal_co_kt: 192.1, confianza: "confirmado", admite_valoracion: false },
      { categoria: "Recursos inferidos", tonelaje_mt: 42.2, metal_ni_kt: 419.3, metal_co_kt: 49.2, confianza: "reportado", admite_valoracion: false }
    ]
  },
  cascada: {
    escenario_referencia: "base",
    tramos: [
      { orden: 1, concepto: "Valor bruto de contenido metalico in situ", valor_musd: 25328, confianza: "calculado", nota: "Magnitud que suele citarse como 'riqueza mineral'. No es valor de activo." },
      { orden: 2, concepto: "Ingreso bruto realizable en la vida de mina", valor_musd: 14764, perdida_vs_anterior_musd: -10564, causa: "Recuperacion mina-a-metal del 61% en niquel y 59% en cobalto", confianza: "confirmado" },
      { orden: 3, concepto: "Margen operativo neto (EBITDA)", valor_musd: 3738, perdida_vs_anterior_musd: -11026, causa: "Coste de caja total de 7.394 M USD neto de creditos por subproductos", confianza: "confirmado" },
      { orden: 4, concepto: "Flujo no descontado despues de impuestos", valor_musd: 1887, perdida_vs_anterior_musd: -1851, causa: "Capital de sostenimiento, cierre e impuestos", confianza: "confirmado" },
      { orden: 5, concepto: "VAN al 8% despues de impuestos", valor_musd: 812, perdida_vs_anterior_musd: -1075, causa: "Descuento temporal sobre 26 anos de vida de mina", confianza: "confirmado" },
      { orden: 6, concepto: "Participacion efectiva del Estado cubano", valor_musd: 888, confianza: "calculado", nota: "50% del equity mas regalias e impuestos descontados." }
    ]
  },
  multiplicador: {
    rango_recomendado_pct: { min: 3.2, max: 4.9 },
    valores: [
      { escenario: "base", multiplicador_pct: 3.21, confianza: "calculado" },
      { escenario: "alternativo", multiplicador_pct: 4.91, confianza: "calculado" },
      { escenario: "base", concepto: "toma estatal", multiplicador_pct: 3.51, confianza: "calculado" },
      { escenario: "alternativo", concepto: "toma estatal", multiplicador_pct: 4.57, confianza: "calculado" }
    ],
    sesgos_a_etiquetar: [
      { direccion: "al alza", descripcion: "Moa es el mejor activo minero de Cuba. Cualquier otro yacimiento tendra un multiplicador inferior. Es techo, no valor central." },
      { direccion: "a la baja", descripcion: "El VAN se calculo con la red electrica cubana deteriorada. Bajo suministro normalizado, parte del descuento se revierte." },
      { direccion: "acotamiento", descripcion: "Especifico de laterita Ni-Co con proceso HPAL. No trasladable a oro ni a tierras raras." }
    ]
  },
  sensibilidad: {
    confianza: "confirmado",
    series: [
      { variable: "Precios de los metales", puntos: [{ pct_caso_base: 75, van8_musd: -612 }, { pct_caso_base: 85, van8_musd: 11 }, { pct_caso_base: 100, van8_musd: 812 }, { pct_caso_base: 125, van8_musd: 2153 }] },
      { variable: "Costes operativos", puntos: [{ pct_caso_base: 75, van8_musd: 1979 }, { pct_caso_base: 100, van8_musd: 812 }, { pct_caso_base: 125, van8_musd: -356 }] },
      { variable: "Costes de capital", puntos: [{ pct_caso_base: 75, van8_musd: 963 }, { pct_caso_base: 100, van8_musd: 812 }, { pct_caso_base: 125, van8_musd: 661 }] }
    ],
    umbral_critico: {
      caida_precios_pct: 15,
      ni_umbral_usd_t: 13340,
      van8_resultante_musd: 11,
      confianza: "confirmado",
      nota_editorial:
        "La media LME del niquel en 2024 fue de unos 17.000 USD/t y cerro diciembre en ~15.500. El umbral de valor cero esta en 13.340 USD/t."
    }
  },
  linea_deuda: {
    partidas: [
      { concepto: "Deuda oficial Club de Paris (2025)", valor_musd: 4795.5, confianza: "confirmado" },
      { concepto: "Deuda externa total, Banco Central (2020)", valor_musd: 19743, confianza: "reportado" },
      { concepto: "Deuda externa total estimada", valor_musd: 40000, confianza: "estimado" },
      { concepto: "Reclamaciones por nacionalizaciones", valor_musd: null, confianza: "no_cuantificado" }
    ]
  },
  implicacion_fondo_soberano: {
    tesis: "El argumento a favor de un fondo soberano cubano no puede sostenerse sobre magnitudes de riqueza in situ.",
    puntos: [
      "El Estado cubano capta aproximadamente el 3,5% del valor bruto in situ de su mejor activo minero.",
      "Un multiplicador del 3,2-4,9% situa el valor realizable en el mismo orden de magnitud que la deuda externa, o por debajo.",
      "El valor de opcion sobre reservas no desarrolladas es real y no es cero, pero debe declararse como opcion.",
      "La justificacion del fondo no es la abundancia presente sino la custodia de una opcion."
    ],
    confianza: "estimado"
  },
  referencia_interna: {
    tema: "mineria",
    ruta: "#/mineria",
    titulo: "El subsuelo y la crisis",
    papel: "numerador",
    texto:
      "El inventario geologico nacional vive en el expediente «El subsuelo y la crisis»: unas 5,5 Mt de reservas de niquel y una valoracion bruta de contenido metalico in situ del orden de 121.500 M USD a precios spot. Ese es el numerador. Este expediente aporta el factor que le falta: el multiplicador del 3,2-4,9% que traduce esa magnitud a valor realizable.",
    cautela:
      "La cifra de 5,5 Mt esta anclada en el USGS de 2024. El Mineral Commodity Summaries de 2025 ya NO desglosa Cuba en su tabla de reservas: la agrega dentro de «otros paises». Debe leerse como estimacion de 2024, no como dato corriente.",
    confianza: "reportado"
  },
  encuesta: {
    titulo: "Tu lectura",
    intro: "Tres preguntas. El voto es anonimo y se registra una sola vez por navegador.",
    nota_privacidad:
      "No se recoge ningun dato personal. Solo se incrementa un contador agregado por opcion.",
    preguntas: [
      {
        id: "p1",
        texto: "Antes de leer esto, ¿que creias que median las cifras de riqueza mineral cubana que circulan?",
        opciones: [
          { id: "o1", texto: "Lo que el pais podria llegar a ingresar" },
          { id: "o2", texto: "El metal del subsuelo a precio de mercado, sin descontar nada" },
          { id: "o3", texto: "Un valor ya descontado de costes y de tiempo" },
          { id: "o4", texto: "No tenia claro que median" }
        ]
      },
      {
        id: "p2",
        texto: "El Estado cubano capta en torno al 3,5% del valor bruto in situ de su mejor activo minero. ¿Que lo explica mejor?",
        opciones: [
          { id: "o1", texto: "La geologia: una laterita de baja ley exige un proceso caro" },
          { id: "o2", texto: "Los terminos pactados con el socio extranjero" },
          { id: "o3", texto: "El deterioro del pais: red electrica, riesgo y coste de capital" },
          { id: "o4", texto: "Nada anomalo: es lo corriente en mineria" }
        ]
      },
      {
        id: "p3",
        texto: "Con este multiplicador sobre la mesa, ¿sigue en pie el argumento de un fondo soberano minero cubano?",
        opciones: [
          { id: "o1", texto: "Si, pero como custodia de una opcion, no como reparto de abundancia" },
          { id: "o2", texto: "Si, tal como se plantea: el valor realizable basta" },
          { id: "o3", texto: "No: lo realizable no cubre siquiera la deuda externa" },
          { id: "o4", texto: "No se puede decidir sin auditar el resto de los yacimientos" }
        ]
      }
    ]
  }
};

/* ----------------------------- utilidades ----------------------------- */

const fmt = (n) =>
  n === null || n === undefined
    ? "sin cuantificar"
    : new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(n);

function Chip({ nivel }) {
  const c = CONFIANZA[nivel] || CONFIANZA.estimado;
  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: c.color,
        background: c.fondo,
        border: "1px solid " + c.color + "44",
        borderRadius: 2,
        padding: "2px 7px",
        whiteSpace: "nowrap"
      }}
    >
      {c.etiqueta}
    </span>
  );
}

function Aviso({ children }) {
  return (
    <div
      style={{
        border: "1px dashed " + C.ambar,
        background: "rgba(201,138,23,0.07)",
        borderRadius: 3,
        padding: "12px 14px",
        margin: "18px 0",
        display: "flex",
        gap: 11,
        alignItems: "flex-start"
      }}
    >
      <span style={{ color: C.ambar, fontSize: 15, lineHeight: 1.2 }}>⚠</span>
      <div style={{ fontSize: 13.5, lineHeight: 1.62, color: "#D6D2C4" }}>{children}</div>
    </div>
  );
}

function Seccion({ n, titulo, children }) {
  return (
    <section style={{ marginBottom: 68 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 13, marginBottom: 6 }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: C.aceroTenue,
            letterSpacing: "0.14em"
          }}
        >
          {String(n).padStart(2, "0")}
        </span>
        <h2
          style={{
            fontFamily: "'Archivo Black', 'Archivo', sans-serif",
            fontSize: "clamp(19px, 3.1vw, 25px)",
            margin: 0,
            letterSpacing: "-0.014em",
            color: C.texto
          }}
        >
          {titulo}
        </h2>
      </div>
      <div style={{ height: 1, background: C.borde, marginBottom: 22 }} />
      {children}
    </section>
  );
}

/* --------------------------- cascada (firma) --------------------------- */

function Cascada({ tramos }) {
  const [activo, setActivo] = useState(null);
  const total = tramos[0].valor_musd;

  const datos = [];
  let acumulado = 0;
  tramos.forEach((t, i) => {
    const esUltimo = i === tramos.length - 1;
    if (i === 0) {
      datos.push({ ...t, base: 0, visible: t.valor_musd, tipo: "bruto" });
      acumulado = t.valor_musd;
    } else if (esUltimo) {
      datos.push({ ...t, base: 0, visible: t.valor_musd, tipo: "estado" });
    } else {
      const base = t.valor_musd;
      datos.push({ ...t, base, visible: acumulado - t.valor_musd, tipo: "perdida" });
      acumulado = t.valor_musd;
    }
  });

  const colorDe = (tipo) =>
    tipo === "bruto" ? C.aceroProfundo : tipo === "estado" ? C.acero : C.laterita;

  return (
    <div>
      <div style={{ width: "100%", height: 430 }}>
        <ResponsiveContainer>
          <BarChart data={datos} margin={{ top: 12, right: 16, left: 6, bottom: 96 }}>
            <CartesianGrid strokeDasharray="2 5" stroke={C.borde} vertical={false} />
            <XAxis
              dataKey="orden"
              tick={{ fill: C.tenue, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}
              tickFormatter={(v) => "0" + v}
              stroke={C.borde}
            />
            <YAxis
              tick={{ fill: C.tenue, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}
              tickFormatter={(v) => fmt(v / 1000) + "k"}
              stroke={C.borde}
              width={54}
            />
            <Tooltip
              cursor={{ fill: "rgba(116,121,180,0.07)" }}
              contentStyle={{
                background: C.panel,
                border: "1px solid " + C.borde,
                borderRadius: 3,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12
              }}
              labelFormatter={() => ""}
              formatter={(v, name, p) => {
                if (name !== "visible") return null;
                return [fmt(p.payload.valor_musd) + " M USD", p.payload.concepto];
              }}
            />
            {[4795.5, 19743].map((d) => (
              <ReferenceLine
                key={d}
                y={d}
                stroke={C.hueso}
                strokeDasharray="6 4"
                strokeOpacity={0.55}
                label={{
                  value: d === 4795.5 ? "deuda Club de Paris" : "deuda externa BCC 2020",
                  position: "insideTopRight",
                  fill: C.hueso,
                  fontSize: 10,
                  fontFamily: "'IBM Plex Mono', monospace",
                  opacity: 0.8
                }}
              />
            ))}
            <Bar dataKey="base" stackId="a" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="visible" stackId="a" isAnimationActive={false}>
              {datos.map((d, i) => (
                <Cell
                  key={i}
                  fill={colorDe(d.tipo)}
                  fillOpacity={activo === null || activo === i ? 1 : 0.32}
                  onMouseEnter={() => setActivo(i)}
                  onMouseLeave={() => setActivo(null)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ol style={{ listStyle: "none", padding: 0, margin: "10px 0 0" }}>
        {tramos.map((t, i) => (
          <li
            key={t.orden}
            onMouseEnter={() => setActivo(i)}
            onMouseLeave={() => setActivo(null)}
            style={{
              display: "grid",
              gridTemplateColumns: "30px 1fr auto",
              gap: 12,
              alignItems: "baseline",
              padding: "11px 8px",
              borderBottom: "1px solid " + C.borde,
              background: activo === i ? "rgba(116,121,180,0.06)" : "transparent",
              transition: "background 140ms"
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: C.aceroTenue
              }}
            >
              {String(t.orden).padStart(2, "0")}
            </span>
            <div>
              <div style={{ fontSize: 14, color: C.texto, marginBottom: 3 }}>{t.concepto}</div>
              {t.causa ? (
                <div style={{ fontSize: 12.5, color: C.lateritaClara, lineHeight: 1.5 }}>
                  −{fmt(Math.abs(t.perdida_vs_anterior_musd))} M · {t.causa}
                </div>
              ) : null}
              {t.nota ? (
                <div style={{ fontSize: 12.5, color: C.tenue, lineHeight: 1.5 }}>{t.nota}</div>
              ) : null}
            </div>
            <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 15,
                  color: C.texto
                }}
              >
                {fmt(t.valor_musd)}
              </div>
              <div style={{ fontSize: 10.5, color: C.tenue, marginBottom: 4 }}>
                {((t.valor_musd / total) * 100).toFixed(1)}% del bruto
              </div>
              <Chip nivel={t.confianza} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------ sensibilidad ------------------------------ */

function Sensibilidad({ series, umbral }) {
  const puntos = [75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125];
  const datos = puntos.map((p) => {
    const fila = { pct: p };
    series.forEach((s) => {
      const hit = s.puntos.find((x) => x.pct_caso_base === p);
      if (hit) fila[s.variable] = hit.van8_musd;
    });
    return fila;
  });
  const colores = [C.laterita, C.acero, C.aceroTenue];

  return (
    <div style={{ width: "100%", height: 330 }}>
      <ResponsiveContainer>
        <LineChart data={datos} margin={{ top: 10, right: 20, left: 6, bottom: 10 }}>
          <CartesianGrid strokeDasharray="2 5" stroke={C.borde} vertical={false} />
          <XAxis
            dataKey="pct"
            tick={{ fill: C.tenue, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}
            tickFormatter={(v) => v + "%"}
            stroke={C.borde}
          />
          <YAxis
            tick={{ fill: C.tenue, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}
            stroke={C.borde}
            width={56}
          />
          <ReferenceLine y={0} stroke={C.ambar} strokeDasharray="5 4" />
          <Tooltip
            contentStyle={{
              background: C.panel,
              border: "1px solid " + C.borde,
              borderRadius: 3,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12
            }}
            formatter={(v) => fmt(v) + " M USD"}
            labelFormatter={(l) => l + "% del caso base"}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: C.tenue }} />
          {series.map((s, i) => (
            <Line
              key={s.variable}
              type="monotone"
              dataKey={s.variable}
              stroke={colores[i % colores.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -------------------------------- encuesta -------------------------------- */

const SB_URL =
  typeof process !== "undefined" && process.env ? process.env.REACT_APP_SUPABASE_URL : null;
const SB_KEY =
  typeof process !== "undefined" && process.env ? process.env.REACT_APP_SUPABASE_ANON_KEY : null;

const memoria = {};
const almacen = {
  leer(clave) {
    try {
      const v = window.localStorage.getItem(clave);
      return v === null ? (memoria[clave] === undefined ? null : memoria[clave]) : v;
    } catch (e) {
      return memoria[clave] === undefined ? null : memoria[clave];
    }
  },
  escribir(clave, valor) {
    memoria[clave] = valor;
    try {
      window.localStorage.setItem(clave, valor);
    } catch (e) {
      /* modo memoria */
    }
  }
};

function claveVoto(slug, preguntaId, opcionId) {
  return slug + "::" + preguntaId + "::" + opcionId;
}

async function rpcVotar(clave) {
  if (!SB_URL || !SB_KEY) return false;
  try {
    const r = await fetch(SB_URL + "/rest/v1/rpc/yamacoa_encuesta_votar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SB_KEY,
        Authorization: "Bearer " + SB_KEY
      },
      body: JSON.stringify({ p_clave: clave })
    });
    return r.ok;
  } catch (e) {
    return false;
  }
}

async function rpcResultados(prefijo) {
  if (!SB_URL || !SB_KEY) return null;
  try {
    const r = await fetch(SB_URL + "/rest/v1/rpc/yamacoa_encuesta_resultados", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SB_KEY,
        Authorization: "Bearer " + SB_KEY
      },
      body: JSON.stringify({ p_prefijo: prefijo })
    });
    if (!r.ok) return null;
    const filas = await r.json();
    const mapa = {};
    (filas || []).forEach((f) => {
      mapa[f.clave] = Number(f.votos) || 0;
    });
    return mapa;
  } catch (e) {
    return null;
  }
}

function Encuesta({ encuesta, slug }) {
  const claveLocal = "yamacoa:encuesta:" + slug;
  const [votos, setVotos] = useState({});
  const [conteos, setConteos] = useState({});
  const [remoto, setRemoto] = useState(false);

  useEffect(() => {
    const guardado = almacen.leer(claveLocal);
    if (guardado) {
      try {
        setVotos(JSON.parse(guardado));
      } catch (e) {
        /* dato corrupto: se ignora */
      }
    }
    const conteoLocal = almacen.leer(claveLocal + ":conteos");
    if (conteoLocal) {
      try {
        setConteos(JSON.parse(conteoLocal));
      } catch (e) {
        /* dato corrupto: se ignora */
      }
    }
    let vivo = true;
    rpcResultados(slug + "::").then((m) => {
      if (vivo && m) {
        setConteos(m);
        setRemoto(true);
      }
    });
    return () => {
      vivo = false;
    };
  }, [claveLocal, slug]);

  const votar = useCallback(
    (preguntaId, opcionId) => {
      if (votos[preguntaId]) return;
      const clave = claveVoto(slug, preguntaId, opcionId);
      const nuevos = { ...votos, [preguntaId]: opcionId };
      setVotos(nuevos);
      almacen.escribir(claveLocal, JSON.stringify(nuevos));
      setConteos((prev) => {
        const sig = { ...prev, [clave]: (prev[clave] || 0) + 1 };
        almacen.escribir(claveLocal + ":conteos", JSON.stringify(sig));
        return sig;
      });
      rpcVotar(clave);
    },
    [votos, slug, claveLocal]
  );

  return (
    <div>
      <p style={{ fontSize: 15.5, lineHeight: 1.72, color: "#C8CAD6", marginBottom: 24 }}>
        {encuesta.intro}
      </p>
      <div style={{ display: "grid", gap: 20 }}>
        {encuesta.preguntas.map((pr, idx) => {
          const votada = votos[pr.id];
          const total = pr.opciones.reduce(
            (acc, o) => acc + (conteos[claveVoto(slug, pr.id, o.id)] || 0),
            0
          );
          return (
            <div
              key={pr.id}
              style={{
                background: C.panel,
                border: "1px solid " + C.borde,
                borderRadius: 3,
                padding: "19px 20px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "baseline",
                  marginBottom: 15,
                  flexWrap: "wrap"
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: C.aceroTenue,
                    letterSpacing: "0.12em"
                  }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    fontFamily: "'Archivo Black', 'Archivo', sans-serif",
                    fontSize: 16,
                    lineHeight: 1.42,
                    color: C.texto,
                    flex: "1 1 240px",
                    letterSpacing: "-0.012em"
                  }}
                >
                  {pr.texto}
                </span>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {pr.opciones.map((o) => {
                  const clave = claveVoto(slug, pr.id, o.id);
                  const n = conteos[clave] || 0;
                  const pct = total > 0 ? (n / total) * 100 : 0;
                  const elegida = votada === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => votar(pr.id, o.id)}
                      disabled={!!votada}
                      style={{
                        position: "relative",
                        overflow: "hidden",
                        textAlign: "left",
                        background: C.fondo,
                        border: "1px solid " + (elegida ? C.acero : C.borde),
                        borderRadius: 2,
                        padding: "12px 14px",
                        cursor: votada ? "default" : "pointer",
                        color: C.texto,
                        fontSize: 14.5,
                        lineHeight: 1.55,
                        fontFamily: "inherit"
                      }}
                    >
                      {votada ? (
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: pct + "%",
                            background: elegida ? C.acero : C.aceroTenue,
                            opacity: elegida ? 0.24 : 0.3,
                            transition: "width 420ms"
                          }}
                        />
                      ) : null}
                      <span
                        style={{
                          position: "relative",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 14
                        }}
                      >
                        <span>
                          {elegida ? (
                            <span style={{ color: C.acero, marginRight: 8 }}>✓</span>
                          ) : null}
                          {o.texto}
                        </span>
                        {votada ? (
                          <span
                            style={{
                              fontFamily: "'IBM Plex Mono', monospace",
                              fontSize: 13,
                              color: elegida ? C.acero : C.tenue,
                              whiteSpace: "nowrap"
                            }}
                          >
                            {pct.toFixed(1).replace(".", ",")} %
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              {votada ? (
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: C.tenue,
                    marginTop: 12
                  }}
                >
                  {fmt(total)} {total === 1 ? "voto" : "votos"} ·{" "}
                  {remoto ? "recuento agregado" : "recuento local"}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div
        style={{
          fontSize: 12.5,
          lineHeight: 1.6,
          color: C.tenue,
          marginTop: 16
        }}
      >
        {encuesta.nota_privacidad}
      </div>
    </div>
  );
}

/* -------------------------------- pagina -------------------------------- */

export default function CascadaValorMinero() {
  const [datos, setDatos] = useState(DATOS_EMBEBIDOS);
  const [vivo, setVivo] = useState(false);

  useEffect(() => {
    let cancelado = false;
    fetch(RUTA_DATOS)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then((j) => {
        if (!cancelado && j && j.cascada && j.cascada.tramos) {
          setDatos(j);
          setVivo(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  const d = datos;
  const inv = d.inventario_geologico;
  const rec = d.recuperacion;

  return (
    <div
      style={{
        background: C.fondo,
        color: C.texto,
        minHeight: "100vh",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "clamp(22px, 5vw, 72px) clamp(16px, 5vw, 40px) 110px"
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <header style={{ marginBottom: 54 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.17em",
              textTransform: "uppercase",
              color: C.acero,
              marginBottom: 15
            }}
          >
            Yamacoa · marco del fondo soberano · {vivo ? "datos en vivo" : "datos embebidos"}
          </div>
          <h1
            style={{
              fontFamily: "'Archivo Black', 'Archivo', sans-serif",
              fontSize: "clamp(30px, 6.2vw, 52px)",
              lineHeight: 1.05,
              letterSpacing: "-0.028em",
              margin: "0 0 18px"
            }}
          >
            {d.meta.titulo}
          </h1>
          <p style={{ fontSize: 16.5, lineHeight: 1.62, color: C.tenue, maxWidth: 660, margin: 0 }}>
            {d.meta.subtitulo}
          </p>
        </header>

        <Seccion n={1} titulo="La magnitud equivocada">
          <p style={{ fontSize: 15.5, lineHeight: 1.72, color: "#C8CAD6" }}>
            Las cifras de riqueza mineral que circulan sobre Cuba miden el{" "}
            <strong style={{ color: C.texto }}>valor bruto de contenido metalico in situ</strong>:
            toneladas de metal en el subsuelo multiplicadas por su precio de mercado. No es valor de
            activo. Entre una magnitud y la otra median la recuperacion metalurgica, el coste
            operativo, el capital, el descuento temporal y la titularidad.
          </p>
          <p style={{ fontSize: 15.5, lineHeight: 1.72, color: "#C8CAD6" }}>
            Moa es el unico yacimiento cubano con estudio de factibilidad auditado bajo estandar
            internacional. Permite medir esa distancia en lugar de suponerla.
          </p>
          <Aviso>
            <strong>{rec.mina_a_metal_real.recuperacion_ni_pct}%</strong> es la recuperacion real
            mina-a-metal del niquel, frente al{" "}
            <strong>{rec.planta_declarada.ni_global_planta_pct}%</strong> de recuperacion de planta
            que suele citarse. {rec.mina_a_metal_real.nota_editorial}
          </Aviso>
        </Seccion>

        <Seccion n={2} titulo="La cascada">
          <p style={{ fontSize: 15.5, lineHeight: 1.72, color: "#C8CAD6", marginBottom: 26 }}>
            Reservas probadas y probables del Moa JV, base 100%, a precios del caso base del informe.
            Cada tramo en laterita es valor que no llega al final. Las lineas discontinuas marcan el
            pasivo externo cubano.
          </p>
          <Cascada tramos={d.cascada.tramos} />
          <Aviso>
            La participacion del Estado cubano supera al VAN de la sociedad porque regalias e
            impuestos ya estaban deducidos antes de llegar al VAN despues de impuestos y se
            reincorporan como ingreso publico. El factor de descuento aplicado a esas partidas es una
            aproximacion uniforme: el perfil anual exacto refinaria la cifra en ±10%.
          </Aviso>
        </Seccion>

        <Seccion n={3} titulo="El multiplicador">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 14,
              marginBottom: 24
            }}
          >
            {d.multiplicador.valores.map((v, i) => (
              <div
                key={i}
                style={{
                  background: C.panel,
                  border: "1px solid " + C.borde,
                  borderRadius: 3,
                  padding: "17px 16px"
                }}
              >
                <div
                  style={{
                    fontFamily: "'Archivo Black', 'Archivo', sans-serif",
                    fontSize: 33,
                    color: v.concepto ? C.acero : C.lateritaClara,
                    letterSpacing: "-0.03em"
                  }}
                >
                  {v.multiplicador_pct.toFixed(2).replace(".", ",")}%
                </div>
                <div style={{ fontSize: 12.5, color: C.tenue, margin: "6px 0 9px" }}>
                  {v.concepto === "toma estatal" ? "toma estatal" : "VAN de la sociedad"} · escenario{" "}
                  {v.escenario}
                </div>
                <Chip nivel={v.confianza} />
              </div>
            ))}
          </div>
          <p style={{ fontSize: 15.5, lineHeight: 1.72, color: "#C8CAD6" }}>
            Rango recomendado para trasladar cualquier tabla de riqueza in situ a valor realizable:{" "}
            <strong style={{ color: C.texto }}>
              {String(d.multiplicador.rango_recomendado_pct.min).replace(".", ",")}% a{" "}
              {String(d.multiplicador.rango_recomendado_pct.max).replace(".", ",")}%
            </strong>
            . Con tres sesgos que deben declararse junto al numero:
          </p>
          <ul style={{ paddingLeft: 0, listStyle: "none", margin: "16px 0 0" }}>
            {d.multiplicador.sesgos_a_etiquetar.map((s, i) => (
              <li
                key={i}
                style={{
                  borderLeft: "2px solid " + (s.direccion === "al alza" ? C.laterita : C.aceroTenue),
                  paddingLeft: 15,
                  marginBottom: 15
                }}
              >
                <div
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10.5,
                    letterSpacing: "0.11em",
                    textTransform: "uppercase",
                    color: C.tenue,
                    marginBottom: 5
                  }}
                >
                  sesgo {s.direccion}
                </div>
                <div style={{ fontSize: 14.5, lineHeight: 1.62, color: "#C8CAD6" }}>
                  {s.descripcion}
                </div>
              </li>
            ))}
          </ul>

          {d.referencia_interna ? (
            <a
              href={d.referencia_interna.ruta}
              style={{
                display: "block",
                textDecoration: "none",
                background: C.panel,
                border: "1px solid " + C.borde,
                borderLeft: "2px solid " + C.acero,
                borderRadius: 3,
                padding: "17px 19px",
                marginTop: 26
              }}
            >
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10.5,
                  letterSpacing: "0.11em",
                  textTransform: "uppercase",
                  color: C.acero,
                  marginBottom: 8
                }}
              >
                el {d.referencia_interna.papel} · expediente {d.referencia_interna.ruta.slice(1)}
              </div>
              <div
                style={{
                  fontFamily: "'Archivo Black', 'Archivo', sans-serif",
                  fontSize: 17,
                  color: C.texto,
                  letterSpacing: "-0.014em",
                  marginBottom: 9
                }}
              >
                {d.referencia_interna.titulo} ↗
              </div>
              <div style={{ fontSize: 14.5, lineHeight: 1.62, color: "#C8CAD6", marginBottom: 11 }}>
                {d.referencia_interna.texto}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.58,
                  color: C.lateritaClara,
                  paddingTop: 10,
                  borderTop: "1px solid " + C.borde
                }}
              >
                {d.referencia_interna.cautela}
              </div>
              <div style={{ marginTop: 11 }}>
                <Chip nivel={d.referencia_interna.confianza} />
              </div>
            </a>
          ) : null}
        </Seccion>

        <Seccion n={4} titulo="El acantilado">
          <p style={{ fontSize: 15.5, lineHeight: 1.72, color: "#C8CAD6", marginBottom: 22 }}>
            Sensibilidad del VAN al 8% a variaciones sobre el caso base. La linea ambar es el valor
            cero.
          </p>
          <Sensibilidad series={d.sensibilidad.series} umbral={d.sensibilidad.umbral_critico} />
          <Aviso>
            Con los precios un {d.sensibilidad.umbral_critico.caida_precios_pct}% por debajo del caso
            base, el VAN cae a {fmt(d.sensibilidad.umbral_critico.van8_resultante_musd)} M USD. Eso
            ocurre con el niquel a{" "}
            {fmt(d.sensibilidad.umbral_critico.ni_umbral_usd_t)} USD/t.{" "}
            {d.sensibilidad.umbral_critico.nota_editorial}
          </Aviso>
        </Seccion>

        <Seccion n={5} titulo="Que se puede valorar y que no">
          <p style={{ fontSize: 15.5, lineHeight: 1.72, color: "#C8CAD6", marginBottom: 20 }}>
            {inv.nota_critica}
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr>
                  {["Categoria", "Mt", "Ni kt", "Co kt", "Valorable", "Confianza"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: h === "Categoria" ? "left" : "right",
                        padding: "9px 10px",
                        borderBottom: "1px solid " + C.borde,
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10.5,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: C.tenue,
                        fontWeight: 400
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inv.categorias.map((c, i) => (
                  <tr key={i} style={{ opacity: c.admite_valoracion ? 1 : 0.62 }}>
                    <td style={{ padding: "11px 10px", borderBottom: "1px solid " + C.borde }}>
                      {c.categoria}
                    </td>
                    {[c.tonelaje_mt, c.metal_ni_kt, c.metal_co_kt].map((v, k) => (
                      <td
                        key={k}
                        style={{
                          padding: "11px 10px",
                          borderBottom: "1px solid " + C.borde,
                          textAlign: "right",
                          fontFamily: "'IBM Plex Mono', monospace"
                        }}
                      >
                        {new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(v)}
                      </td>
                    ))}
                    <td
                      style={{
                        padding: "11px 10px",
                        borderBottom: "1px solid " + C.borde,
                        textAlign: "right",
                        color: c.admite_valoracion ? C.acero : C.laterita,
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 12
                      }}
                    >
                      {c.admite_valoracion ? "si" : "no"}
                    </td>
                    <td
                      style={{
                        padding: "11px 10px",
                        borderBottom: "1px solid " + C.borde,
                        textAlign: "right"
                      }}
                    >
                      <Chip nivel={c.confianza} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Seccion>

        <Seccion n={6} titulo="Lo que implica para el fondo">
          <p
            style={{
              fontFamily: "'Archivo Black', 'Archivo', sans-serif",
              fontSize: "clamp(18px, 3vw, 23px)",
              lineHeight: 1.36,
              letterSpacing: "-0.016em",
              margin: "0 0 24px",
              color: C.texto
            }}
          >
            {d.implicacion_fondo_soberano.tesis}
          </p>
          <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
            {d.implicacion_fondo_soberano.puntos.map((p, i) => (
              <li
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "26px 1fr",
                  gap: 10,
                  marginBottom: 15,
                  fontSize: 15.5,
                  lineHeight: 1.66,
                  color: "#C8CAD6"
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: C.aceroTenue,
                    paddingTop: 5
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 18 }}>
            <Chip nivel={d.implicacion_fondo_soberano.confianza} />
          </div>
        </Seccion>

        {d.encuesta ? (
          <Seccion n={7} titulo={d.encuesta.titulo}>
            <Encuesta encuesta={d.encuesta} slug={d.meta.slug} />
          </Seccion>
        ) : null}

        <footer
          style={{
            borderTop: "1px solid " + C.borde,
            paddingTop: 26,
            fontSize: 12.5,
            lineHeight: 1.68,
            color: C.tenue
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <strong style={{ color: "#B6B9C8" }}>Fuente primaria.</strong>{" "}
            {d.fuente_primaria.titulo}. {d.fuente_primaria.autor_independiente},{" "}
            {d.fuente_primaria.estandar}. Fecha efectiva {d.fuente_primaria.fecha_efectiva}, informe{" "}
            {d.fuente_primaria.fecha_informe}.
          </div>
          <div style={{ marginBottom: 10, color: C.lateritaClara }}>
            <strong>Advertencia de independencia.</strong>{" "}
            {d.fuente_primaria.advertencia_independencia}
          </div>
          <div>
            Dataset {d.meta.slug} v{d.meta.version} · actualizado {d.meta.actualizado} ·{" "}
            {d.meta.unidad_magnitud} de {d.meta.unidad_monetaria} salvo indicacion expresa.
          </div>
        </footer>
      </div>
    </div>
  );
}
