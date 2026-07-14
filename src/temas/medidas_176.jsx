// =====================================================================
// medidas_176.jsx — Las 176 medidas: anatomía de un ciclo
// Renderer congelado tras publicación. Los datos viven en medidas_176.json
// (ciclo de 8h). Geometría, paleta y copy editorial viven aquí.
//
// Paleta (registrar en ops/design_log.json):
//   fondo   #101C26  (petróleo)      panel #16273
//   apertura #35C4A6 (menta, 165°)   reversión #F2545B (coral, 357°)
//   anuncio  #F5B841 (ámbar, 45°)    comparador #7E9CD8 (lavanda, 222°)
//   frontera #8A93A0 (gris neutro)
// Tipos de gráfico usados (anti-repetición): línea de convergencia con
// cruce, timeline de ciclos por dominio (SVG propio), treemap de ejes,
// dumbbell pre/post (SVG propio). Sin barras apiladas.
// =====================================================================

import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  Treemap,
} from "recharts";

// ---------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------
const T = {
  fondo: "#101C26",
  panel: "#162733",
  panelBorde: "#1F3545",
  texto: "#E8ECEF",
  textoSuave: "#9FB0BC",
  apertura: "#35C4A6",
  reversion: "#F2545B",
  anuncio: "#F5B841",
  comparador: "#7E9CD8",
  frontera: "#8A93A0",
  display: "'Archivo Black', system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
  cuerpo:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const PAISES = [
  { key: "cuba", idx: "cuba_idx", nombre: "Cuba", color: T.reversion, ancho: 3 },
  { key: "vietnam", idx: "vietnam_idx", nombre: "Vietnam", color: T.apertura, ancho: 3 },
  { key: "costa_rica", idx: "costa_rica_idx", nombre: "Costa Rica", color: T.comparador, ancho: 2 },
  { key: "singapore", idx: "singapore_idx", nombre: "Singapore (frontera de referencia)", color: T.frontera, ancho: 1.5 },
];

const DOMINIOS = [
  { id: "empresa_privada", nombre: "Empresa privada" },
  { id: "agricultura", nombre: "Agricultura" },
  { id: "divisas", nombre: "Divisas" },
  { id: "inversion_extranjera", nombre: "Inversión extranjera" },
  { id: "banca", nombre: "Banca" },
  { id: "subsidios", nombre: "Subsidios" },
];

const COLOR_TIPO = {
  apertura: T.apertura,
  reversion: T.reversion,
  anuncio: T.anuncio,
};

const ETIQUETA_TIPO = {
  apertura: "Apertura",
  reversion: "Reversión",
  anuncio: "Anuncio 2026",
};

// ---------------------------------------------------------------------
// Utilidades UI
// ---------------------------------------------------------------------
function SelloConfianza({ nivel }) {
  const colores = {
    confirmado: T.apertura,
    reportado: T.anuncio,
    estimado: T.textoSuave,
  };
  return (
    <span
      style={{
        fontFamily: T.mono,
        fontSize: 11,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: colores[nivel] || T.textoSuave,
        border: `1px solid ${colores[nivel] || T.textoSuave}`,
        borderRadius: 3,
        padding: "1px 6px",
        whiteSpace: "nowrap",
      }}
    >
      {nivel}
    </span>
  );
}

function Seccion({ kicker, titulo, children }) {
  return (
    <section style={{ margin: "72px 0" }}>
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 12,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: T.anuncio,
          marginBottom: 8,
        }}
      >
        {kicker}
      </div>
      <h2
        style={{
          fontFamily: T.display,
          fontSize: "clamp(24px, 4vw, 38px)",
          lineHeight: 1.15,
          color: T.texto,
          margin: "0 0 20px 0",
        }}
      >
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Prosa({ children }) {
  return (
    <p
      style={{
        fontFamily: T.cuerpo,
        fontSize: 17,
        lineHeight: 1.65,
        color: T.textoSuave,
        maxWidth: 720,
        margin: "0 0 16px 0",
      }}
    >
      {children}
    </p>
  );
}

function Panel({ children, pad = 20 }) {
  return (
    <div
      style={{
        background: T.panel,
        border: `1px solid ${T.panelBorde}`,
        borderRadius: 10,
        padding: pad,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------
// 1. Convergencia (gráfico-tesis): índice 1986=100 y cruce 2021
// ---------------------------------------------------------------------
function Convergencia({ series }) {
  const [modo, setModo] = useState("indice"); // 'indice' | 'nivel'
  const esIndice = modo === "indice";

  const cruce = useMemo(() => {
    for (const r of series) {
      if (r.anio >= 2000 && r.vietnam >= r.cuba) return r;
    }
    return null;
  }, [series]);

  return (
    <Panel>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {[
          ["indice", "Índice 1986 = 100 (año del Doi Moi)"],
          ["nivel", "PIB per cápita PPP (USD 2011)"],
        ].map(([m, etiqueta]) => (
          <button
            key={m}
            onClick={() => setModo(m)}
            style={{
              fontFamily: T.mono,
              fontSize: 12,
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
              background: modo === m ? T.anuncio : "transparent",
              color: modo === m ? T.fondo : T.textoSuave,
              border: `1px solid ${modo === m ? T.anuncio : T.panelBorde}`,
            }}
          >
            {etiqueta}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={series} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="anio"
            stroke={T.textoSuave}
            tick={{ fontFamily: T.mono, fontSize: 11, fill: T.textoSuave }}
            ticks={[1959, 1968, 1986, 1993, 2004, 2011, 2021, 2025]}
          />
          <YAxis
            stroke={T.textoSuave}
            tick={{ fontFamily: T.mono, fontSize: 11, fill: T.textoSuave }}
            width={54}
            tickFormatter={(v) => (esIndice ? v : v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
          />
          <Tooltip
            contentStyle={{
              background: T.fondo,
              border: `1px solid ${T.panelBorde}`,
              borderRadius: 8,
              fontFamily: T.mono,
              fontSize: 12,
            }}
            labelStyle={{ color: T.anuncio }}
            formatter={(v, nombre) => [
              esIndice ? v.toFixed(0) : `$${Math.round(v).toLocaleString("es")}`,
              nombre,
            ]}
          />
          <ReferenceLine
            x={1986}
            stroke={T.anuncio}
            strokeDasharray="4 4"
            label={{
              value: "Doi Moi",
              fill: T.anuncio,
              fontFamily: T.mono,
              fontSize: 11,
              position: "insideTopLeft",
            }}
          />
          {cruce && !esIndice && (
            <ReferenceDot
              x={cruce.anio}
              y={cruce.vietnam}
              r={6}
              fill={T.anuncio}
              stroke={T.fondo}
              label={{
                value: `Cruce ${cruce.anio}`,
                fill: T.anuncio,
                fontFamily: T.mono,
                fontSize: 12,
                position: "top",
              }}
            />
          )}
          {PAISES.map((p) => (
            <Line
              key={p.key}
              type="monotone"
              dataKey={esIndice ? p.idx : p.key}
              name={p.nombre}
              stroke={p.color}
              strokeWidth={p.ancho}
              dot={false}
              strokeDasharray={p.key === "singapore" ? "5 4" : undefined}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          marginTop: 10,
          fontFamily: T.mono,
          fontSize: 12,
          color: T.textoSuave,
        }}
      >
        {PAISES.map((p) => (
          <span key={p.key} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 18,
                height: 3,
                background: p.color,
                display: "inline-block",
                opacity: p.key === "singapore" ? 0.8 : 1,
              }}
            />
            {p.nombre}
          </span>
        ))}
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textoSuave, marginTop: 8 }}>
        Fuente: Maddison Project Database 2020. Tramo 2019–2025:{" "}
        <SelloConfianza nivel="estimado" /> (tasas CEPAL/FMI). Singapore no entra en el
        estimador DID: se muestra solo como frontera de referencia.
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------
// 2. Timeline de ciclos por dominio (SVG propio)
// ---------------------------------------------------------------------
function TimelineCiclos({ episodios }) {
  const [activo, setActivo] = useState(null);
  const A0 = 1955;
  const A1 = 2030;
  const W = 920;
  const filaH = 64;
  const margenIzq = 168;
  const H = DOMINIOS.length * filaH + 50;

  const x = (anio) => margenIzq + ((anio - A0) / (A1 - A0)) * (W - margenIzq - 20);

  return (
    <Panel pad={12}>
      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", minWidth: 720, display: "block" }}
          role="img"
          aria-label="Ciclos de apertura y reversión por dominio, 1959 a 2026"
        >
          {[1959, 1968, 1980, 1993, 2004, 2011, 2021, 2026].map((a) => (
            <g key={a}>
              <line x1={x(a)} y1={16} x2={x(a)} y2={H - 34} stroke={T.panelBorde} strokeWidth={1} />
              <text
                x={x(a)}
                y={H - 18}
                textAnchor="middle"
                fill={T.textoSuave}
                fontFamily={T.mono}
                fontSize={11}
              >
                {a}
              </text>
            </g>
          ))}
          {DOMINIOS.map((d, i) => {
            const cy = 40 + i * filaH;
            const eps = episodios.filter((e) => e.dominio === d.id);
            return (
              <g key={d.id}>
                <text
                  x={8}
                  y={cy + 4}
                  fill={T.texto}
                  fontFamily={T.mono}
                  fontSize={12.5}
                >
                  {d.nombre}
                </text>
                <line
                  x1={margenIzq}
                  y1={cy}
                  x2={W - 20}
                  y2={cy}
                  stroke={T.panelBorde}
                  strokeWidth={1.5}
                />
                {eps.map((e, j) => {
                  const cx = x(e.anio);
                  const c = COLOR_TIPO[e.tipo];
                  const seleccionado =
                    activo && activo.dominio === e.dominio && activo.anio === e.anio && activo.titulo === e.titulo;
                  return (
                    <g
                      key={`${e.anio}-${j}`}
                      onMouseEnter={() => setActivo(e)}
                      onMouseLeave={() => setActivo(null)}
                      onClick={() => setActivo(seleccionado ? null : e)}
                      style={{ cursor: "pointer" }}
                    >
                      {e.tipo === "apertura" && (
                        <polygon
                          points={`${cx},${cy - 12} ${cx - 8},${cy + 4} ${cx + 8},${cy + 4}`}
                          fill={c}
                          opacity={seleccionado ? 1 : 0.9}
                        />
                      )}
                      {e.tipo === "reversion" && (
                        <polygon
                          points={`${cx},${cy + 12} ${cx - 8},${cy - 4} ${cx + 8},${cy - 4}`}
                          fill={c}
                          opacity={seleccionado ? 1 : 0.9}
                        />
                      )}
                      {e.tipo === "anuncio" && (
                        <rect
                          x={cx - 7}
                          y={cy - 7}
                          width={14}
                          height={14}
                          transform={`rotate(45 ${cx} ${cy})`}
                          fill={c}
                          opacity={seleccionado ? 1 : 0.9}
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          gap: 18,
          flexWrap: "wrap",
          fontFamily: T.mono,
          fontSize: 12,
          color: T.textoSuave,
          margin: "6px 4px",
        }}
      >
        <span>▲ Apertura</span>
        <span style={{ color: T.reversion }}>▼ Reversión</span>
        <span style={{ color: T.anuncio }}>◆ Anuncio 2026 (sin norma publicada)</span>
      </div>
      <div
        style={{
          minHeight: 74,
          marginTop: 6,
          padding: "12px 14px",
          borderRadius: 8,
          background: T.fondo,
          border: `1px solid ${T.panelBorde}`,
        }}
      >
        {activo ? (
          <div style={{ fontFamily: T.cuerpo, fontSize: 14.5, color: T.texto }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <strong style={{ fontFamily: T.mono, color: COLOR_TIPO[activo.tipo] }}>
                {activo.anio} · {ETIQUETA_TIPO[activo.tipo]}
              </strong>
              <span style={{ fontFamily: T.display, fontSize: 15 }}>{activo.titulo}</span>
              <SelloConfianza nivel={activo.confianza} />
            </div>
            <div style={{ color: T.textoSuave, marginTop: 4 }}>
              {activo.detalle}
              {activo.magnitud ? ` — ${activo.magnitud}` : ""}
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textoSuave, marginTop: 4 }}>
              Fuente: {activo.fuente}
            </div>
          </div>
        ) : (
          <div style={{ fontFamily: T.mono, fontSize: 12.5, color: T.textoSuave }}>
            Toca un marcador para ver el episodio, su magnitud y su fuente.
          </div>
        )}
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------
// 3. Event study: dumbbell pre/post por paquete (SVG propio)
// ---------------------------------------------------------------------
function EventStudy({ paquetes }) {
  const W = 860;
  const filaH = 62;
  const margenIzq = 250;
  const H = paquetes.length * filaH + 56;
  const vals = paquetes.flatMap((p) => [p.crec_pre, p.crec_post]).filter((v) => v !== null);
  const vMin = Math.min(...vals, 0) - 1;
  const vMax = Math.max(...vals) + 1;
  const x = (v) => margenIzq + ((v - vMin) / (vMax - vMin)) * (W - margenIzq - 30);

  return (
    <Panel pad={12}>
      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", minWidth: 680, display: "block" }}
          role="img"
          aria-label="Crecimiento medio del PIB per cápita antes y después de cada paquete de reformas"
        >
          <line x1={x(0)} y1={14} x2={x(0)} y2={H - 40} stroke={T.textoSuave} strokeDasharray="3 4" />
          <text x={x(0)} y={H - 22} textAnchor="middle" fill={T.textoSuave} fontFamily={T.mono} fontSize={11}>
            0%
          </text>
          {paquetes.map((p, i) => {
            const cy = 36 + i * filaH;
            const x1 = p.crec_pre !== null ? x(p.crec_pre) : null;
            const x2 = p.crec_post !== null ? x(p.crec_post) : null;
            const empeora = p.crec_post !== null && p.crec_pre !== null && p.crec_post < p.crec_pre;
            return (
              <g key={p.anio}>
                <text x={8} y={cy - 6} fill={T.texto} fontFamily={T.mono} fontSize={12.5}>
                  {p.anio} · {p.nombre}
                </text>
                <text x={8} y={cy + 12} fill={T.textoSuave} fontFamily={T.mono} fontSize={10.5}>
                  {p.detalle && p.detalle.length > 42 ? p.detalle.slice(0, 42) + "…" : p.detalle}
                </text>
                {x1 !== null && x2 !== null && (
                  <line
                    x1={x1}
                    y1={cy}
                    x2={x2}
                    y2={cy}
                    stroke={empeora ? T.reversion : T.apertura}
                    strokeWidth={3}
                    opacity={0.55}
                  />
                )}
                {x1 !== null && <circle cx={x1} cy={cy} r={7} fill={T.textoSuave} />}
                {x2 !== null && (
                  <circle cx={x2} cy={cy} r={7} fill={empeora ? T.reversion : T.apertura} />
                )}
                {x1 !== null && (
                  <text x={x1} y={cy - 12} textAnchor="middle" fill={T.textoSuave} fontFamily={T.mono} fontSize={11}>
                    {p.crec_pre}%
                  </text>
                )}
                {x2 !== null && (
                  <text
                    x={x2}
                    y={cy + 22}
                    textAnchor="middle"
                    fill={empeora ? T.reversion : T.apertura}
                    fontFamily={T.mono}
                    fontSize={11}
                  >
                    {p.crec_post}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 12, color: T.textoSuave, margin: "4px 4px 0" }}>
        <span style={{ color: T.textoSuave }}>● antes (t−3…t−1)</span>{" "}
        <span style={{ color: T.reversion, marginLeft: 12 }}>● después (t+1…t+3), peor que antes</span>
        <span style={{ color: T.apertura, marginLeft: 12 }}>● después, mejor que antes</span>
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textoSuave, marginTop: 6 }}>
        Crecimiento medio anual del PIB per cápita PPP (Maddison 2020; tramo 2019–2025 estimado).
        El rebote posterior a 2021 es efecto base tras el colapso de 2020, no éxito del paquete.
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------
// 4. Treemap de ejes 2026 por dependencia normativa
// ---------------------------------------------------------------------
const COLOR_DEP = { alta: "#F2545B", media: "#F5B841", baja: "#35C4A6" };

function CeldaTreemap(props) {
  const { x, y, width, height, nombre, dependencia_normativa, medidas_destacadas } = props;
  if (width < 4 || height < 4) return null;
  const mostrarTexto = width > 78 && height > 34;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={COLOR_DEP[dependencia_normativa] || T.panelBorde}
        fillOpacity={0.82}
        stroke={T.fondo}
        strokeWidth={2}
        rx={3}
      />
      {mostrarTexto && (
        <>
          <text
            x={x + 7}
            y={y + 17}
            fill={T.fondo}
            fontFamily={T.mono}
            fontSize={11.5}
            fontWeight={700}
          >
            {nombre && nombre.length > Math.floor(width / 7)
              ? nombre.slice(0, Math.floor(width / 7)) + "…"
              : nombre}
          </text>
          <text x={x + 7} y={y + 31} fill={T.fondo} fontFamily={T.mono} fontSize={10.5}>
            {medidas_destacadas} medidas
          </text>
        </>
      )}
    </g>
  );
}

function TreemapEjes({ ejes }) {
  const datos = useMemo(
    () =>
      ejes.map((e) => ({
        name: e.nombre,
        nombre: e.nombre,
        size: e.medidas_destacadas,
        medidas_destacadas: e.medidas_destacadas,
        dependencia_normativa: e.dependencia_normativa,
      })),
    [ejes]
  );
  const resumen = useMemo(() => {
    const total = ejes.reduce((s, e) => s + e.medidas_destacadas, 0);
    const alta = ejes
      .filter((e) => e.dependencia_normativa === "alta")
      .reduce((s, e) => s + e.medidas_destacadas, 0);
    return { total, pctAlta: Math.round((alta / total) * 100) };
  }, [ejes]);

  return (
    <Panel pad={12}>
      <ResponsiveContainer width="100%" height={420}>
        <Treemap
          data={datos}
          dataKey="size"
          nameKey="name"
          content={<CeldaTreemap />}
          isAnimationActive={false}
        />
      </ResponsiveContainer>
      <div
        style={{
          display: "flex",
          gap: 18,
          flexWrap: "wrap",
          fontFamily: T.mono,
          fontSize: 12,
          color: T.textoSuave,
          margin: "10px 4px 0",
        }}
      >
        <span style={{ color: COLOR_DEP.alta }}>■ Requiere ley o decreto-ley</span>
        <span style={{ color: COLOR_DEP.media }}>■ Requiere decreto o resolución</span>
        <span style={{ color: COLOR_DEP.baja }}>■ Ejecutable por vía administrativa</span>
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.textoSuave, marginTop: 8 }}>
        ~{resumen.pctAlta}% de las medidas destacadas dependen de normas de rango superior aún no
        aprobadas (el propio programa reconoce 148 normas por modificar y 32 nuevas).
        Tamaños por desglose de prensa del documento oficial: <SelloConfianza nivel="reportado" />
      </div>
    </Panel>
  );
}

// ---------------------------------------------------------------------
// 5. Encuesta (localStorage por defecto; RPC Supabase increment-only
//    se conecta en /importar según la infraestructura común de temas)
// ---------------------------------------------------------------------
function Encuesta({ encuesta }) {
  const clave = `yamacoa_encuesta_${encuesta.id}`;
  const [voto, setVoto] = useState(null);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(clave);
      if (v) setVoto(v);
    } catch (e) {
      /* almacenamiento no disponible */
    }
  }, [clave]);

  const votar = (id) => {
    setVoto(id);
    try {
      window.localStorage.setItem(clave, id);
    } catch (e) {
      /* almacenamiento no disponible */
    }
    // TODO(/importar): rpc increment-only SECURITY DEFINER
    // supabase.rpc('incrementar_voto', { encuesta_id: encuesta.id, opcion_id: id })
  };

  return (
    <Panel>
      <div style={{ fontFamily: T.display, fontSize: 18, color: T.texto, marginBottom: 14 }}>
        {encuesta.pregunta}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 480 }}>
        {encuesta.opciones.map((o) => {
          const elegido = voto === o.id;
          return (
            <button
              key={o.id}
              onClick={() => votar(o.id)}
              style={{
                textAlign: "left",
                fontFamily: T.cuerpo,
                fontSize: 15,
                padding: "12px 16px",
                borderRadius: 8,
                cursor: "pointer",
                background: elegido ? T.anuncio : "transparent",
                color: elegido ? T.fondo : T.texto,
                border: `1px solid ${elegido ? T.anuncio : T.panelBorde}`,
                transition: "background 120ms ease",
              }}
            >
              {o.texto}
            </button>
          );
        })}
      </div>
      {voto && (
        <div style={{ fontFamily: T.mono, fontSize: 12, color: T.apertura, marginTop: 12 }}>
          Respuesta guardada en este dispositivo.
        </div>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------
// Instantánea embebida (fallback de vista previa).
// En producción el fetch a /datos/medidas_176.json SIEMPRE tiene prioridad:
// el dataset respira cada 8h; esta copia solo evita un 404 fuera del sitio.
// Fecha de la instantánea: 2026-07-14.
// ---------------------------------------------------------------------
const DATOS_EMBEBIDOS = {"meta": {"slug": "medidas_176", "titulo": "Las 176 medidas: anatomia de un ciclo", "subtitulo": "Sesenta y seis anos de aperturas anunciadas y reversiones ejecutadas, medidos contra los paises que no revirtieron", "descripcion": "Analisis contrafactual del paquete de 176 transformaciones aprobado en junio de 2026: cada eje tiene un antecedente homologo desde 1959 con resultado observable, y la trayectoria cubana se contrasta con Vietnam, Costa Rica y Singapore.", "narracion": "En junio de dos mil veintiseis el gobierno cubano aprobo ciento setenta y seis medidas en una sesion extraordinaria convocada con cuarenta y ocho horas de antelacion, sin calendario de implementacion y dependientes de mas de ciento cuarenta y ocho normas juridicas aun no aprobadas. Este expediente no evalua promesas: evalua precedentes. Desde mil novecientos cincuenta y nueve, cada dominio del paquete ha vivido ciclos de apertura y reversion, y cada paquete anunciado fue seguido de menos crecimiento que el anterior. Mientras tanto, Vietnam, que partio en mil novecientos ochenta y seis con un tercio del ingreso cubano, cruzo a Cuba en dos mil veintiuno. La pregunta del expediente es simple: si la reversion sigue siendo opcion, por que esta vez seria distinto.", "fecha_publicacion": "2026-07-14", "anuncio_paquete": "2026-06-18", "fuentes": ["Maddison Project Database 2020 (Bolt & van Zanden), PIB per capita PPP 2011", "Programa de 176 transformaciones economicas y sociales (documento oficial, jun 2026)", "Presentacion del primer ministro ante la ANPP, sesion extraordinaria 18-19 jun 2026", "CEPAL / FMI: tasas de crecimiento 2019-2025 (extension estimada)", "Gacetas Oficiales y decretos-leyes citados por episodio"], "sistema_confianza": {"confirmado": "norma o serie oficial verificable", "reportado": "prensa o presentacion oficial sin norma publicada", "estimado": "calculo propio o proyeccion"}, "notas_metodologicas": ["Las cifras de Cuba post-1990 en Maddison dependen parcialmente de deflactores oficiales cubanos; posible sobreestimacion del nivel. Sesgo conservador: juega CONTRA nuestra tesis, no a favor.", "La revision poblacional ONEI 2024 (caida a ~9.7M por exodo) elevaria mecanicamente el PIB per capita cubano; no se aplica para evitar inflar el denominador con un artefacto migratorio.", "Singapore entra como frontera de referencia, NO como control DID (tendencias paralelas indefendibles).", "Vietnam es el comparador DID principal (punto de partida planificado, shock sovietico comun, embargo EEUU hasta 1994).", "Costa Rica es control regional sin historia de planificacion centralizada.", "La caida pre-2021 del event study refleja el colapso 2020 (COVID + Ordenamiento); el rebote posterior es efecto base, no exito del paquete.", "Las cifras de crecimiento pre-2011 dependen de deflactores oficiales cubanos, probablemente sobreestimados: el sesgo juega contra la tesis del expediente.", "medidas_destacadas por eje proviene del desglose de prensa del documento oficial; la suma no coincide exactamente con 176."], "tesis_confianza": [{"afirmacion": "El paquete carece de calendario y depende de 148 normas no aprobadas", "nivel": "confirmado"}, {"afirmacion": "Washington condiciono explicitamente la relacion bilateral a la profundidad de los cambios", "nivel": "reportado"}, {"afirmacion": "El momento del anuncio busca ganar tiempo ante las elecciones de medio termino de EEUU (nov 2026)", "nivel": "estimado"}]}, "series_convergencia": [{"anio": 1959, "cuba": 3006.0, "vietnam": 1262.0, "costa_rica": 4141.0, "singapore": 3239.0, "cuba_idx": 59.2, "vietnam_idx": 85.2, "costa_rica_idx": 58.4, "singapore_idx": 19.2, "estimado": false}, {"anio": 1960, "cuba": 2994.0, "vietnam": 1274.0, "costa_rica": 4328.0, "singapore": 3464.0, "cuba_idx": 59.0, "vietnam_idx": 86.0, "costa_rica_idx": 61.1, "singapore_idx": 20.6, "estimado": false}, {"anio": 1961, "cuba": 3068.0, "vietnam": 1294.0, "costa_rica": 4340.0, "singapore": 3623.0, "cuba_idx": 60.5, "vietnam_idx": 87.4, "costa_rica_idx": 61.2, "singapore_idx": 21.5, "estimado": false}, {"anio": 1962, "cuba": 2974.0, "vietnam": 1411.0, "costa_rica": 4439.0, "singapore": 3775.0, "cuba_idx": 58.6, "vietnam_idx": 95.3, "costa_rica_idx": 62.6, "singapore_idx": 22.4, "estimado": false}, {"anio": 1963, "cuba": 2958.0, "vietnam": 1406.0, "costa_rica": 4653.0, "singapore": 4049.0, "cuba_idx": 58.3, "vietnam_idx": 94.9, "costa_rica_idx": 65.7, "singapore_idx": 24.1, "estimado": false}, {"anio": 1964, "cuba": 3158.0, "vietnam": 1427.0, "costa_rica": 4720.0, "singapore": 3800.0, "cuba_idx": 62.2, "vietnam_idx": 96.4, "costa_rica_idx": 66.6, "singapore_idx": 22.6, "estimado": false}, {"anio": 1965, "cuba": 3088.0, "vietnam": 1398.0, "costa_rica": 4983.0, "singapore": 3991.0, "cuba_idx": 60.8, "vietnam_idx": 94.4, "costa_rica_idx": 70.3, "singapore_idx": 23.7, "estimado": false}, {"anio": 1966, "cuba": 3185.0, "vietnam": 1369.0, "costa_rica": 5193.0, "singapore": 4317.0, "cuba_idx": 62.8, "vietnam_idx": 92.4, "costa_rica_idx": 73.3, "singapore_idx": 25.6, "estimado": false}, {"anio": 1967, "cuba": 3489.0, "vietnam": 1165.0, "costa_rica": 5338.0, "singapore": 4741.0, "cuba_idx": 68.7, "vietnam_idx": 78.7, "costa_rica_idx": 75.3, "singapore_idx": 28.2, "estimado": false}, {"anio": 1968, "cuba": 3229.0, "vietnam": 1114.0, "costa_rica": 5574.0, "singapore": 5294.0, "cuba_idx": 63.6, "vietnam_idx": 75.2, "costa_rica_idx": 78.7, "singapore_idx": 31.5, "estimado": false}, {"anio": 1969, "cuba": 3137.0, "vietnam": 1178.0, "costa_rica": 5773.0, "singapore": 5931.0, "cuba_idx": 61.8, "vietnam_idx": 79.5, "costa_rica_idx": 81.5, "singapore_idx": 35.2, "estimado": false}, {"anio": 1970, "cuba": 2976.0, "vietnam": 1172.0, "costa_rica": 5984.0, "singapore": 6650.0, "cuba_idx": 58.6, "vietnam_idx": 79.1, "costa_rica_idx": 84.4, "singapore_idx": 39.5, "estimado": false}, {"anio": 1971, "cuba": 3161.0, "vietnam": 1202.0, "costa_rica": 6199.0, "singapore": 7318.0, "cuba_idx": 62.3, "vietnam_idx": 81.2, "costa_rica_idx": 87.5, "singapore_idx": 43.5, "estimado": false}, {"anio": 1972, "cuba": 3253.0, "vietnam": 1278.0, "costa_rica": 6564.0, "singapore": 8155.0, "cuba_idx": 64.1, "vietnam_idx": 86.3, "costa_rica_idx": 92.6, "singapore_idx": 48.5, "estimado": false}, {"anio": 1973, "cuba": 3486.0, "vietnam": 1333.0, "costa_rica": 6884.0, "singapore": 8894.0, "cuba_idx": 68.7, "vietnam_idx": 90.0, "costa_rica_idx": 97.1, "singapore_idx": 52.8, "estimado": false}, {"anio": 1974, "cuba": 3609.0, "vietnam": 1248.0, "costa_rica": 7061.0, "singapore": 9314.0, "cuba_idx": 71.1, "vietnam_idx": 84.3, "costa_rica_idx": 99.6, "singapore_idx": 55.3, "estimado": false}, {"anio": 1975, "cuba": 3733.0, "vietnam": 1132.0, "costa_rica": 7007.0, "singapore": 9602.0, "cuba_idx": 73.6, "vietnam_idx": 76.4, "costa_rica_idx": 98.9, "singapore_idx": 57.0, "estimado": false}, {"anio": 1976, "cuba": 3786.0, "vietnam": 1290.0, "costa_rica": 7182.0, "singapore": 10178.0, "cuba_idx": 74.6, "vietnam_idx": 87.1, "costa_rica_idx": 101.3, "singapore_idx": 60.5, "estimado": false}, {"anio": 1977, "cuba": 3913.0, "vietnam": 1304.0, "costa_rica": 7602.0, "singapore": 10790.0, "cuba_idx": 77.1, "vietnam_idx": 88.0, "costa_rica_idx": 107.3, "singapore_idx": 64.1, "estimado": false}, {"anio": 1978, "cuba": 4114.0, "vietnam": 1285.0, "costa_rica": 7763.0, "singapore": 11588.0, "cuba_idx": 81.1, "vietnam_idx": 86.8, "costa_rica_idx": 109.5, "singapore_idx": 68.8, "estimado": false}, {"anio": 1979, "cuba": 4183.0, "vietnam": 1267.0, "costa_rica": 7905.0, "singapore": 12521.0, "cuba_idx": 82.4, "vietnam_idx": 85.6, "costa_rica_idx": 111.5, "singapore_idx": 74.4, "estimado": false}, {"anio": 1980, "cuba": 4106.0, "vietnam": 1207.0, "costa_rica": 7828.0, "singapore": 13601.0, "cuba_idx": 80.9, "vietnam_idx": 81.5, "costa_rica_idx": 110.5, "singapore_idx": 80.8, "estimado": false}, {"anio": 1981, "cuba": 4420.0, "vietnam": 1223.0, "costa_rica": 7461.0, "singapore": 14335.0, "cuba_idx": 87.1, "vietnam_idx": 82.6, "costa_rica_idx": 105.3, "singapore_idx": 85.2, "estimado": false}, {"anio": 1982, "cuba": 4487.0, "vietnam": 1293.0, "costa_rica": 6751.0, "singapore": 14687.0, "cuba_idx": 88.4, "vietnam_idx": 87.3, "costa_rica_idx": 95.3, "singapore_idx": 87.3, "estimado": false}, {"anio": 1983, "cuba": 4705.0, "vietnam": 1333.0, "costa_rica": 6743.0, "singapore": 15720.0, "cuba_idx": 92.7, "vietnam_idx": 90.0, "costa_rica_idx": 95.1, "singapore_idx": 93.4, "estimado": false}, {"anio": 1984, "cuba": 5051.0, "vietnam": 1420.0, "costa_rica": 7065.0, "singapore": 16767.0, "cuba_idx": 99.5, "vietnam_idx": 95.9, "costa_rica_idx": 99.7, "singapore_idx": 99.6, "estimado": false}, {"anio": 1985, "cuba": 5120.0, "vietnam": 1471.0, "costa_rica": 6918.0, "singapore": 16611.0, "cuba_idx": 100.9, "vietnam_idx": 99.3, "costa_rica_idx": 97.6, "singapore_idx": 98.7, "estimado": false}, {"anio": 1986, "cuba": 5075.0, "vietnam": 1481.0, "costa_rica": 7087.0, "singapore": 16831.0, "cuba_idx": 100.0, "vietnam_idx": 100.0, "costa_rica_idx": 100.0, "singapore_idx": 100.0, "estimado": false}, {"anio": 1987, "cuba": 4887.0, "vietnam": 1500.0, "costa_rica": 7221.0, "singapore": 18345.0, "cuba_idx": 96.3, "vietnam_idx": 101.3, "costa_rica_idx": 101.9, "singapore_idx": 109.0, "estimado": false}, {"anio": 1988, "cuba": 4994.0, "vietnam": 1556.0, "costa_rica": 7270.0, "singapore": 19853.0, "cuba_idx": 98.4, "vietnam_idx": 105.1, "costa_rica_idx": 102.6, "singapore_idx": 118.0, "estimado": false}, {"anio": 1989, "cuba": 4991.0, "vietnam": 1588.0, "costa_rica": 7489.0, "singapore": 21221.0, "cuba_idx": 98.3, "vietnam_idx": 107.2, "costa_rica_idx": 105.7, "singapore_idx": 126.1, "estimado": false}, {"anio": 1990, "cuba": 4713.0, "vietnam": 1634.0, "costa_rica": 7567.0, "singapore": 22666.0, "cuba_idx": 92.9, "vietnam_idx": 110.3, "costa_rica_idx": 106.8, "singapore_idx": 134.7, "estimado": false}, {"anio": 1991, "cuba": 3982.3, "vietnam": 1688.2, "costa_rica": 7552.4, "singapore": 23636.7, "cuba_idx": 78.5, "vietnam_idx": 114.0, "costa_rica_idx": 106.6, "singapore_idx": 140.4, "estimado": false}, {"anio": 1992, "cuba": 3400.0, "vietnam": 1792.7, "costa_rica": 8038.8, "singapore": 24775.6, "cuba_idx": 67.0, "vietnam_idx": 121.0, "costa_rica_idx": 113.4, "singapore_idx": 147.2, "estimado": false}, {"anio": 1993, "cuba": 2657.5, "vietnam": 1894.9, "costa_rica": 8363.5, "singapore": 27073.7, "cuba_idx": 52.4, "vietnam_idx": 127.9, "costa_rica_idx": 118.0, "singapore_idx": 160.9, "estimado": false}, {"anio": 1994, "cuba": 2683.1, "vietnam": 2018.4, "costa_rica": 8479.6, "singapore": 29454.6, "cuba_idx": 52.9, "vietnam_idx": 136.3, "costa_rica_idx": 119.7, "singapore_idx": 175.0, "estimado": false}, {"anio": 1995, "cuba": 2860.8, "vietnam": 2167.0, "costa_rica": 8576.4, "singapore": 30957.3, "cuba_idx": 56.4, "vietnam_idx": 146.3, "costa_rica_idx": 121.0, "singapore_idx": 183.9, "estimado": false}, {"anio": 1996, "cuba": 3249.6, "vietnam": 2323.0, "costa_rica": 8446.8, "singapore": 32724.5, "cuba_idx": 64.0, "vietnam_idx": 156.9, "costa_rica_idx": 119.2, "singapore_idx": 194.4, "estimado": false}, {"anio": 1997, "cuba": 3425.6, "vietnam": 2466.9, "costa_rica": 8683.9, "singapore": 34868.1, "cuba_idx": 67.5, "vietnam_idx": 166.6, "costa_rica_idx": 122.5, "singapore_idx": 207.2, "estimado": false}, {"anio": 1998, "cuba": 3415.5, "vietnam": 2564.3, "costa_rica": 9053.9, "singapore": 33590.5, "cuba_idx": 67.3, "vietnam_idx": 173.1, "costa_rica_idx": 127.8, "singapore_idx": 199.6, "estimado": false}, {"anio": 1999, "cuba": 3623.6, "vietnam": 2641.3, "costa_rica": 9183.9, "singapore": 35156.1, "cuba_idx": 71.4, "vietnam_idx": 178.3, "costa_rica_idx": 129.6, "singapore_idx": 208.9, "estimado": false}, {"anio": 2000, "cuba": 4009.3, "vietnam": 2773.1, "costa_rica": 9319.8, "singapore": 37772.8, "cuba_idx": 79.0, "vietnam_idx": 187.2, "costa_rica_idx": 131.5, "singapore_idx": 224.4, "estimado": false}, {"anio": 2001, "cuba": 4231.3, "vietnam": 2915.7, "costa_rica": 9451.6, "singapore": 36864.6, "cuba_idx": 83.4, "vietnam_idx": 196.9, "costa_rica_idx": 133.4, "singapore_idx": 219.0, "estimado": false}, {"anio": 2002, "cuba": 4369.0, "vietnam": 3070.7, "costa_rica": 9591.6, "singapore": 37829.9, "cuba_idx": 86.1, "vietnam_idx": 207.3, "costa_rica_idx": 135.3, "singapore_idx": 224.8, "estimado": false}, {"anio": 2003, "cuba": 4506.7, "vietnam": 3242.3, "costa_rica": 9831.2, "singapore": 38950.7, "cuba_idx": 88.8, "vietnam_idx": 218.9, "costa_rica_idx": 138.7, "singapore_idx": 231.4, "estimado": false}, {"anio": 2004, "cuba": 4561.0, "vietnam": 3437.7, "costa_rica": 10086.8, "singapore": 42111.2, "cuba_idx": 89.9, "vietnam_idx": 232.1, "costa_rica_idx": 142.3, "singapore_idx": 250.2, "estimado": false}, {"anio": 2005, "cuba": 4713.7, "vietnam": 3637.7, "costa_rica": 10308.4, "singapore": 44698.8, "cuba_idx": 92.9, "vietnam_idx": 245.6, "costa_rica_idx": 145.5, "singapore_idx": 265.6, "estimado": false}, {"anio": 2006, "cuba": 5416.1, "vietnam": 3828.9, "costa_rica": 10880.5, "singapore": 48073.6, "cuba_idx": 106.7, "vietnam_idx": 258.5, "costa_rica_idx": 153.5, "singapore_idx": 285.6, "estimado": false}, {"anio": 2007, "cuba": 5635.7, "vietnam": 4037.2, "costa_rica": 11584.7, "singapore": 51844.1, "cuba_idx": 111.0, "vietnam_idx": 272.6, "costa_rica_idx": 163.5, "singapore_idx": 308.0, "estimado": false}, {"anio": 2008, "cuba": 6004.9, "vietnam": 4200.2, "costa_rica": 11935.2, "singapore": 52180.2, "cuba_idx": 118.3, "vietnam_idx": 283.6, "costa_rica_idx": 168.4, "singapore_idx": 310.0, "estimado": false}, {"anio": 2009, "cuba": 6248.3, "vietnam": 4360.1, "costa_rica": 11638.0, "singapore": 51344.5, "cuba_idx": 123.1, "vietnam_idx": 294.4, "costa_rica_idx": 164.2, "singapore_idx": 305.1, "estimado": false}, {"anio": 2010, "cuba": 6578.2, "vietnam": 4571.8, "costa_rica": 12031.6, "singapore": 58612.7, "cuba_idx": 129.6, "vietnam_idx": 308.7, "costa_rica_idx": 169.8, "singapore_idx": 348.2, "estimado": false}, {"anio": 2011, "cuba": 6928.0, "vietnam": 4786.0, "costa_rica": 12366.0, "singapore": 61672.0, "cuba_idx": 136.5, "vietnam_idx": 323.2, "costa_rica_idx": 174.5, "singapore_idx": 366.4, "estimado": false}, {"anio": 2012, "cuba": 7138.0, "vietnam": 4984.0, "costa_rica": 12792.0, "singapore": 62783.0, "cuba_idx": 140.7, "vietnam_idx": 336.5, "costa_rica_idx": 180.5, "singapore_idx": 373.0, "estimado": false}, {"anio": 2013, "cuba": 7379.0, "vietnam": 5200.0, "costa_rica": 12916.0, "singapore": 64633.0, "cuba_idx": 145.4, "vietnam_idx": 351.1, "costa_rica_idx": 182.2, "singapore_idx": 384.0, "estimado": false}, {"anio": 2014, "cuba": 7628.0, "vietnam": 5455.0, "costa_rica": 13222.0, "singapore": 65655.0, "cuba_idx": 150.3, "vietnam_idx": 368.3, "costa_rica_idx": 186.6, "singapore_idx": 390.1, "estimado": false}, {"anio": 2015, "cuba": 7889.0, "vietnam": 5763.0, "costa_rica": 13677.0, "singapore": 65660.0, "cuba_idx": 155.4, "vietnam_idx": 389.1, "costa_rica_idx": 193.0, "singapore_idx": 390.1, "estimado": false}, {"anio": 2016, "cuba": 8000.0, "vietnam": 6062.0, "costa_rica": 14098.0, "singapore": 65729.0, "cuba_idx": 157.6, "vietnam_idx": 409.3, "costa_rica_idx": 198.9, "singapore_idx": 390.5, "estimado": false}, {"anio": 2017, "cuba": 8141.7, "vietnam": 6422.1, "costa_rica": 14470.8, "singapore": 67331.0, "cuba_idx": 160.4, "vietnam_idx": 433.6, "costa_rica_idx": 204.2, "singapore_idx": 400.0, "estimado": false}, {"anio": 2018, "cuba": 8325.6, "vietnam": 6814.1, "costa_rica": 14686.3, "singapore": 68402.3, "cuba_idx": 164.1, "vietnam_idx": 460.1, "costa_rica_idx": 207.2, "singapore_idx": 406.4, "estimado": false}, {"anio": 2019, "cuba": 8308.9, "vietnam": 7229.8, "costa_rica": 14891.9, "singapore": 68539.1, "cuba_idx": 163.7, "vietnam_idx": 488.2, "costa_rica_idx": 210.1, "singapore_idx": 407.2, "estimado": true}, {"anio": 2020, "cuba": 7403.2, "vietnam": 7374.4, "costa_rica": 14147.3, "singapore": 65660.5, "cuba_idx": 145.9, "vietnam_idx": 497.9, "costa_rica_idx": 199.6, "singapore_idx": 390.1, "estimado": true}, {"anio": 2021, "cuba": 7499.4, "vietnam": 7507.1, "costa_rica": 15137.6, "singapore": 71438.6, "cuba_idx": 147.8, "vietnam_idx": 506.9, "costa_rica_idx": 213.6, "singapore_idx": 424.4, "estimado": true}, {"anio": 2022, "cuba": 7634.4, "vietnam": 8047.6, "costa_rica": 15697.7, "singapore": 71795.8, "cuba_idx": 150.4, "vietnam_idx": 543.4, "costa_rica_idx": 221.5, "singapore_idx": 426.6, "estimado": true}, {"anio": 2023, "cuba": 7489.3, "vietnam": 8401.7, "costa_rica": 16357.0, "singapore": 71867.6, "cuba_idx": 147.6, "vietnam_idx": 567.3, "costa_rica_idx": 230.8, "singapore_idx": 427.0, "estimado": true}, {"anio": 2024, "cuba": 7406.9, "vietnam": 8939.4, "costa_rica": 16929.5, "singapore": 74454.8, "cuba_idx": 145.9, "vietnam_idx": 603.6, "costa_rica_idx": 238.9, "singapore_idx": 442.4, "estimado": true}, {"anio": 2025, "cuba": 7295.8, "vietnam": 9457.9, "costa_rica": 17437.4, "singapore": 75795.0, "cuba_idx": 143.8, "vietnam_idx": 638.6, "costa_rica_idx": 246.0, "singapore_idx": 450.3, "estimado": true}], "paquetes_event_study": [{"anio": 2008, "nombre": "Usufructo DL 259", "detalle": "Entrega de tierras estatales ociosas en usufructo", "crec_pre": 8.5, "crec_post": 4.88, "confianza": "confirmado", "nota": null}, {"anio": 2011, "nombre": "Lineamientos (313)", "detalle": "VI Congreso PCC: 313 lineamientos de actualizacion del modelo", "crec_pre": 4.88, "crec_post": 3.26, "confianza": "confirmado", "nota": null}, {"anio": 2014, "nombre": "Ley 118 Inversion Extranjera", "detalle": "Nueva ley de inversion extranjera y cartera de oportunidades", "crec_pre": 3.26, "crec_post": 2.2, "confianza": "confirmado", "nota": null}, {"anio": 2021, "nombre": "Trilogia 2021", "detalle": "Tarea Ordenamiento (ene) + 63 medidas agro (abr) + mipymes DL 46 (sep)", "crec_pre": -3.27, "crec_post": -0.4, "confianza": "confirmado", "nota": "post incluye tramo estimado 2019-2025"}, {"anio": 2023, "nombre": "Proyecciones anti-distorsiones", "detalle": "Programa de gobierno para corregir distorsiones y reimpulsar la economia", "crec_pre": 0.4, "crec_post": -1.3, "confianza": "estimado", "nota": "post incluye tramo estimado 2019-2025"}], "episodios": [{"dominio": "empresa_privada", "anio": 1959, "tipo": "reversion", "titulo": "Nacionalizaciones iniciales", "detalle": "Expropiacion de grandes empresas nacionales y extranjeras entre 1959 y 1960", "confianza": "confirmado", "fuente": "Leyes de nacionalizacion 1959-60"}, {"dominio": "empresa_privada", "anio": 1968, "tipo": "reversion", "titulo": "Ofensiva Revolucionaria", "detalle": "Confiscacion de la practica totalidad del pequeno comercio urbano privado", "confianza": "confirmado", "fuente": "Registros oficiales de la epoca; historiografia academica", "magnitud": "~56.000 pequenos negocios"}, {"dominio": "empresa_privada", "anio": 1978, "tipo": "apertura", "titulo": "Cuentapropismo inicial", "detalle": "Primera autorizacion limitada del trabajo por cuenta propia", "confianza": "confirmado", "fuente": "DL 14/1978"}, {"dominio": "empresa_privada", "anio": 1993, "tipo": "apertura", "titulo": "Cuentapropismo ampliado", "detalle": "Ampliacion de oficios autorizados en plena crisis del Periodo Especial", "confianza": "confirmado", "fuente": "DL 141/1993"}, {"dominio": "empresa_privada", "anio": 1996, "tipo": "reversion", "titulo": "Freno fiscal", "detalle": "Endurecimiento tributario y de licencias que contrajo el sector", "confianza": "confirmado", "fuente": "Normativa tributaria 1996"}, {"dominio": "empresa_privada", "anio": 2010, "tipo": "apertura", "titulo": "Expansion de licencias", "detalle": "Ampliacion a ~200 actividades y despidos estatales masivos anunciados", "confianza": "confirmado", "fuente": "Lineamientos VI Congreso; Gaceta Oficial"}, {"dominio": "empresa_privada", "anio": 2017, "tipo": "reversion", "titulo": "Congelacion de licencias", "detalle": "Suspension temporal de nuevas licencias en actividades clave", "confianza": "confirmado", "fuente": "Resoluciones MTSS 2017"}, {"dominio": "empresa_privada", "anio": 2021, "tipo": "apertura", "titulo": "Legalizacion de mipymes", "detalle": "Autorizacion de micro, pequenas y medianas empresas privadas", "confianza": "confirmado", "fuente": "DL 46/2021"}, {"dominio": "empresa_privada", "anio": 2024, "tipo": "reversion", "titulo": "Restricciones a mipymes", "detalle": "Topes de precios, limites a importadoras y mayor control fiscal", "confianza": "confirmado", "fuente": "Resoluciones MFP/MINCIN 2023-24"}, {"dominio": "empresa_privada", "anio": 2026, "tipo": "anuncio", "titulo": "176 medidas: empresa sin limites", "detalle": "Empresas privadas sin limite de tamano, multiples empresas por titular, sociedades anonimas", "confianza": "reportado", "fuente": "Presentacion ante la ANPP, jun 2026"}, {"dominio": "agricultura", "anio": 1959, "tipo": "reversion", "titulo": "Reformas agrarias I y II", "detalle": "Expropiacion y estatizacion progresiva de la tierra (1959 y 1963)", "confianza": "confirmado", "fuente": "Leyes de Reforma Agraria"}, {"dominio": "agricultura", "anio": 1980, "tipo": "apertura", "titulo": "Mercados Libres Campesinos", "detalle": "Autorizacion de venta directa de excedentes a precios libres", "confianza": "confirmado", "fuente": "Normativa MLC 1980"}, {"dominio": "agricultura", "anio": 1986, "tipo": "reversion", "titulo": "Rectificacion: cierre de los MLC", "detalle": "Clausura de los mercados libres campesinos por decision politica", "confianza": "confirmado", "fuente": "Proceso de Rectificacion 1986"}, {"dominio": "agricultura", "anio": 1993, "tipo": "apertura", "titulo": "UBPC y mercados agropecuarios", "detalle": "Cooperativizacion de tierras estatales y reapertura de mercados (1993-94)", "confianza": "confirmado", "fuente": "DL 142/1993"}, {"dominio": "agricultura", "anio": 2008, "tipo": "apertura", "titulo": "Usufructo DL 259", "detalle": "Entrega de tierras ociosas en usufructo a personas naturales", "confianza": "confirmado", "fuente": "DL 259/2008"}, {"dominio": "agricultura", "anio": 2012, "tipo": "apertura", "titulo": "Usufructo ampliado DL 300", "detalle": "Ampliacion de extensiones y plazos del usufructo", "confianza": "confirmado", "fuente": "DL 300/2012"}, {"dominio": "agricultura", "anio": 2021, "tipo": "apertura", "titulo": "63 medidas agropecuarias", "detalle": "Paquete de estimulo a la produccion de alimentos", "confianza": "confirmado", "fuente": "Anuncio MINAG abr 2021"}, {"dominio": "agricultura", "anio": 2026, "tipo": "anuncio", "titulo": "176 medidas: usufructo indefinido", "detalle": "Usufructo sin plazo, comercio exterior directo cooperativo, precios libres", "confianza": "reportado", "fuente": "Presentacion ante la ANPP, jun 2026"}, {"dominio": "divisas", "anio": 1961, "tipo": "reversion", "titulo": "Penalizacion del dolar", "detalle": "Tenencia de divisas tipificada como delito", "confianza": "confirmado", "fuente": "Codigo Penal y normas cambiarias"}, {"dominio": "divisas", "anio": 1993, "tipo": "apertura", "titulo": "Despenalizacion del dolar", "detalle": "Legalizacion de la tenencia y circulacion del dolar", "confianza": "confirmado", "fuente": "DL 140/1993"}, {"dominio": "divisas", "anio": 2004, "tipo": "reversion", "titulo": "Desdolarizacion y gravamen", "detalle": "Retiro del dolar del comercio y gravamen del 10% a su canje", "confianza": "confirmado", "fuente": "Resolucion 80/2004 BCC", "magnitud": "gravamen 10%"}, {"dominio": "divisas", "anio": 2019, "tipo": "apertura", "titulo": "Tiendas en MLC", "detalle": "Reapertura parcial del comercio en divisas mediante moneda libremente convertible", "confianza": "confirmado", "fuente": "Resoluciones BCC/MINCIN 2019"}, {"dominio": "divisas", "anio": 2021, "tipo": "reversion", "titulo": "Rechazo del dolar en efectivo", "detalle": "Suspension de depositos bancarios de dolares en efectivo", "confianza": "confirmado", "fuente": "Resolucion BCC jun 2021"}, {"dominio": "divisas", "anio": 2024, "tipo": "apertura", "titulo": "Dolarizacion parcial comercial", "detalle": "Reapertura de comercio minorista en dolares", "confianza": "confirmado", "fuente": "Normativa 2024"}, {"dominio": "divisas", "anio": 2026, "tipo": "anuncio", "titulo": "176 medidas: ampliacion de divisas", "detalle": "Casas de cambio privadas, mercado cambiario digital, subastas de divisas", "confianza": "reportado", "fuente": "Presentacion ante la ANPP, jun 2026"}, {"dominio": "inversion_extranjera", "anio": 1960, "tipo": "reversion", "titulo": "Expropiaciones a capital extranjero", "detalle": "Nacionalizacion de activos estadounidenses y de otros paises", "confianza": "confirmado", "fuente": "Leyes 851/890 de 1960"}, {"dominio": "inversion_extranjera", "anio": 1982, "tipo": "apertura", "titulo": "Decreto-Ley 50", "detalle": "Primera norma de asociacion economica con capital extranjero", "confianza": "confirmado", "fuente": "DL 50/1982"}, {"dominio": "inversion_extranjera", "anio": 1995, "tipo": "apertura", "titulo": "Ley 77", "detalle": "Ley de inversion extranjera del Periodo Especial", "confianza": "confirmado", "fuente": "Ley 77/1995"}, {"dominio": "inversion_extranjera", "anio": 2013, "tipo": "apertura", "titulo": "ZED Mariel", "detalle": "Zona Especial de Desarrollo con regimen preferencial", "confianza": "confirmado", "fuente": "DL 313/2013"}, {"dominio": "inversion_extranjera", "anio": 2014, "tipo": "apertura", "titulo": "Ley 118", "detalle": "Nueva ley con rebajas fiscales y cartera de oportunidades; ejecucion muy por debajo de lo comprometido", "confianza": "confirmado", "fuente": "Ley 118/2014"}, {"dominio": "inversion_extranjera", "anio": 2026, "tipo": "anuncio", "titulo": "176 medidas: IED en privados", "detalle": "Inversion extranjera en empresas privadas y cooperativas, derechos de superficie a 99 anos", "confianza": "reportado", "fuente": "Presentacion ante la ANPP, jun 2026"}, {"dominio": "banca", "anio": 1960, "tipo": "reversion", "titulo": "Nacionalizacion bancaria", "detalle": "Estatizacion de toda la banca; desde entonces monopolio estatal absoluto", "confianza": "confirmado", "fuente": "Ley de nacionalizacion bancaria 1960"}, {"dominio": "banca", "anio": 2026, "tipo": "anuncio", "titulo": "176 medidas: banca privada", "detalle": "Primera autorizacion de banca e instituciones financieras privadas en 66 anos; sin ciclo previo que evaluar", "confianza": "reportado", "fuente": "Presentacion ante la ANPP, jun 2026"}, {"dominio": "subsidios", "anio": 1962, "tipo": "reversion", "titulo": "Libreta de abastecimiento", "detalle": "Racionamiento universal instaurado como mecanismo permanente", "confianza": "confirmado", "fuente": "Creacion de OFICODA 1962"}, {"dominio": "subsidios", "anio": 2011, "tipo": "anuncio", "titulo": "Lineamientos: eliminar la libreta", "detalle": "El VI Congreso ordena la eliminacion ordenada del racionamiento; quince anos despues sigue vigente", "confianza": "confirmado", "fuente": "Lineamiento 174, VI Congreso PCC"}, {"dominio": "subsidios", "anio": 2026, "tipo": "anuncio", "titulo": "176 medidas: subsidio a personas", "detalle": "Sustitucion gradual de subsidios a productos por focalizacion; eliminacion de subsidios a electricidad, agua y transporte", "confianza": "reportado", "fuente": "Presentacion ante la ANPP, jun 2026"}], "ejes_2026": [{"id": 1, "nombre": "Actores economicos", "medidas_destacadas": 29, "dominio_homologo": "empresa_privada", "dependencia_normativa": "alta", "confianza": "reportado"}, {"id": 2, "nombre": "Propiedad y gestion", "medidas_destacadas": 8, "dominio_homologo": "empresa_privada", "dependencia_normativa": "alta", "confianza": "reportado"}, {"id": 3, "nombre": "Planificacion", "medidas_destacadas": 7, "dominio_homologo": null, "dependencia_normativa": "media", "confianza": "reportado"}, {"id": 4, "nombre": "Sector presupuestado", "medidas_destacadas": 5, "dominio_homologo": null, "dependencia_normativa": "media", "confianza": "reportado"}, {"id": 5, "nombre": "Autonomia municipal", "medidas_destacadas": 11, "dominio_homologo": null, "dependencia_normativa": "alta", "confianza": "reportado"}, {"id": 6, "nombre": "Energia", "medidas_destacadas": 9, "dominio_homologo": null, "dependencia_normativa": "media", "confianza": "reportado"}, {"id": 7, "nombre": "Agricultura", "medidas_destacadas": 17, "dominio_homologo": "agricultura", "dependencia_normativa": "media", "confianza": "reportado"}, {"id": 8, "nombre": "Politica social", "medidas_destacadas": 17, "dominio_homologo": "subsidios", "dependencia_normativa": "baja", "confianza": "reportado"}, {"id": 9, "nombre": "Subsidios", "medidas_destacadas": 8, "dominio_homologo": "subsidios", "dependencia_normativa": "alta", "confianza": "reportado"}, {"id": 10, "nombre": "Trabajo y salarios", "medidas_destacadas": 13, "dominio_homologo": null, "dependencia_normativa": "alta", "confianza": "reportado"}, {"id": 11, "nombre": "Banca y finanzas", "medidas_destacadas": 15, "dominio_homologo": "banca", "dependencia_normativa": "alta", "confianza": "reportado"}, {"id": 12, "nombre": "Tributos", "medidas_destacadas": 12, "dominio_homologo": null, "dependencia_normativa": "alta", "confianza": "reportado"}, {"id": 13, "nombre": "Precios", "medidas_destacadas": 4, "dominio_homologo": null, "dependencia_normativa": "baja", "confianza": "reportado"}, {"id": 14, "nombre": "Inversion extranjera", "medidas_destacadas": 11, "dominio_homologo": "inversion_extranjera", "dependencia_normativa": "alta", "confianza": "reportado"}, {"id": 15, "nombre": "Comercio exterior", "medidas_destacadas": 5, "dominio_homologo": null, "dependencia_normativa": "media", "confianza": "reportado"}, {"id": 16, "nombre": "Dolarizacion parcial", "medidas_destacadas": 4, "dominio_homologo": "divisas", "dependencia_normativa": "media", "confianza": "reportado"}, {"id": 17, "nombre": "Turismo", "medidas_destacadas": 14, "dominio_homologo": null, "dependencia_normativa": "media", "confianza": "reportado"}, {"id": 18, "nombre": "Transporte", "medidas_destacadas": 4, "dominio_homologo": null, "dependencia_normativa": "baja", "confianza": "reportado"}, {"id": 19, "nombre": "Comercio y servicios", "medidas_destacadas": 10, "dominio_homologo": null, "dependencia_normativa": "media", "confianza": "reportado"}, {"id": 20, "nombre": "Seguros", "medidas_destacadas": 6, "dominio_homologo": null, "dependencia_normativa": "media", "confianza": "reportado"}, {"id": 21, "nombre": "Digitalizacion e IA", "medidas_destacadas": 11, "dominio_homologo": null, "dependencia_normativa": "media", "confianza": "reportado"}, {"id": 22, "nombre": "Estadisticas", "medidas_destacadas": 4, "dominio_homologo": null, "dependencia_normativa": "baja", "confianza": "reportado"}, {"id": 23, "nombre": "Control e inspeccion", "medidas_destacadas": 7, "dominio_homologo": null, "dependencia_normativa": "alta", "confianza": "reportado"}], "encuesta": {"id": "medidas_176_implementacion", "pregunta": "De las 176 medidas, cuantas cree que estaran implementadas antes de 2028?", "opciones": [{"id": "mayoria", "texto": "La mayoria (mas de 100)"}, {"id": "parcial", "texto": "Una parte (30 a 100)"}, {"id": "minima", "texto": "Casi ninguna (menos de 30)"}]}};

// ---------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------
export default function Medidas176({ datosUrl = (process.env.PUBLIC_URL || "") + "/data/medidas_176.json" }) {
  const [datos, setDatos] = useState(null);
  const [instantanea, setInstantanea] = useState(false);

  useEffect(() => {
    let vivo = true;
    fetch(datosUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (vivo) {
          setDatos(d);
          setInstantanea(false);
        }
      })
      .catch(() => {
        // Sin acceso al JSON publicado: usar la instantánea embebida.
        if (vivo) {
          setDatos(DATOS_EMBEBIDOS);
          setInstantanea(true);
        }
      });
    return () => {
      vivo = false;
    };
  }, [datosUrl]);

  if (!datos) {
    return (
      <div style={{ background: T.fondo, minHeight: "100vh", padding: 40 }}>
        <div style={{ fontFamily: T.mono, color: T.textoSuave }}>Cargando expediente…</div>
      </div>
    );
  }

  const { meta, series_convergencia, paquetes_event_study, episodios, ejes_2026, encuesta } = datos;
  const s1959 = series_convergencia[0];
  const s2025 = series_convergencia[series_convergencia.length - 1];

  return (
    <div style={{ background: T.fondo, minHeight: "100vh", color: T.texto }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "56px 20px 80px" }}>
        {/* ------------------------------------------------ Hero */}
        <header style={{ marginBottom: 24 }}>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 12,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: T.anuncio,
              marginBottom: 12,
            }}
          >
            Expediente · Economía política · {meta.fecha_publicacion}
          </div>
          <h1
            style={{
              fontFamily: T.display,
              fontSize: "clamp(34px, 6vw, 62px)",
              lineHeight: 1.05,
              margin: "0 0 16px 0",
            }}
          >
            {meta.titulo}
          </h1>
          <Prosa>{meta.subtitulo}</Prosa>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
              marginTop: 28,
            }}
          >
            {[
              {
                cifra: "176",
                texto: "medidas en 23 ejes, aprobadas sin calendario de implementación",
                color: T.anuncio,
              },
              {
                cifra: "148",
                texto: "normas jurídicas deben modificarse antes de que el grueso entre en vigor",
                color: T.reversion,
              },
              {
                cifra: "2021",
                texto: `año en que Vietnam cruzó a Cuba en PIB per cápita, partiendo en 1986 con un tercio`,
                color: T.apertura,
              },
            ].map((c) => (
              <Panel key={c.cifra} pad={16}>
                <div style={{ fontFamily: T.display, fontSize: 40, color: c.color }}>{c.cifra}</div>
                <div style={{ fontFamily: T.cuerpo, fontSize: 13.5, color: T.textoSuave }}>
                  {c.texto}
                </div>
              </Panel>
            ))}
          </div>
        </header>

        {/* ------------------------------------------------ Tesis con confianza */}
        <Panel>
          <div style={{ fontFamily: T.mono, fontSize: 12, letterSpacing: 2, color: T.textoSuave, marginBottom: 10 }}>
            LO QUE ESTE EXPEDIENTE AFIRMA, Y CON QUÉ NIVEL DE CONFIANZA
          </div>
          {meta.tesis_confianza.map((t, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                padding: "10px 0",
                borderTop: i > 0 ? `1px solid ${T.panelBorde}` : "none",
              }}
            >
              <SelloConfianza nivel={t.nivel} />
              <span style={{ fontFamily: T.cuerpo, fontSize: 15, color: T.texto }}>
                {t.afirmacion}
              </span>
            </div>
          ))}
        </Panel>

        {/* ------------------------------------------------ 1. Convergencia */}
        <Seccion
          kicker="El contrafactual externo"
          titulo="Cuatro países, un punto de partida y un cruce en 2021"
        >
          <Prosa>
            En 1959 Cuba tenía un ingreso por habitante de ${Math.round(s1959.cuba).toLocaleString("es")}{" "}
            (PPP): más del doble que Vietnam y prácticamente el mismo que Singapore. En 1986, año del
            Doi Moi vietnamita, todavía triplicaba a Vietnam. La diferencia entre los cuatro países no
            es el punto de partida: es que tres de ellos nunca revirtieron sus reglas. Vietnam alcanzó
            a Cuba en 2021 —el año de la Tarea Ordenamiento y del 11J— y hoy la supera con holgura.
          </Prosa>
          <Convergencia series={series_convergencia} />
          <Prosa>
            El diseño es un DID clásico con Vietnam como tratado sostenido y Cuba como tratado
            intermitente: mismo shock soviético en 1989–91, embargo estadounidense en ambos casos
            hasta 1994. Costa Rica actúa como control regional sin historia de planificación central.
            La divergencia acumulada —Vietnam en índice ~{Math.round(s2025.vietnam_idx)} contra Cuba en
            ~{Math.round(s2025.cuba_idx)} sobre base 1986=100— es el costo medible del ciclo
            apertura-reversión.
          </Prosa>
        </Seccion>

        {/* ------------------------------------------------ 2. Ciclos */}
        <Seccion
          kicker="El contrafactual interno"
          titulo="Cada eje de 2026 ya se intentó: seis dominios, sesenta y seis años de ciclos"
        >
          <Prosa>
            Las 176 medidas no inauguran nada: reabren puertas que el propio Estado cerró. La empresa
            privada ha vivido cinco aperturas y cuatro reversiones desde 1959. El dólar fue delito,
            luego legal, luego gravado, luego moneda de tienda. Los mercados campesinos de 1980 fueron
            clausurados por decisión política en 1986. Solo la banca privada carece de ciclo previo:
            es la primera apertura desde la nacionalización de 1960.
          </Prosa>
          <TimelineCiclos episodios={episodios} />
        </Seccion>

        {/* ------------------------------------------------ 3. Event study */}
        <Seccion
          kicker="La elasticidad anuncio→resultado"
          titulo="Cada paquete fue seguido de menos crecimiento que el anterior"
        >
          <Prosa>
            Medimos el crecimiento medio del ingreso por habitante en los tres años previos y
            posteriores a cada gran paquete anunciado desde 2008. El patrón es monótono: 8,5% antes
            del usufructo de 2008; 2,2% después de la Ley 118; terreno negativo tras 2023. Ningún
            paquete quebró la tendencia al alza. Las 176 medidas piden ser juzgadas como excepción a
            una serie que nunca tuvo excepciones.
          </Prosa>
          <EventStudy paquetes={paquetes_event_study} />
        </Seccion>

        {/* ------------------------------------------------ 4. Ejecutabilidad */}
        <Seccion
          kicker="La prueba del calendario"
          titulo="Qué parte del paquete puede ejecutarse mañana, y qué parte necesita leyes que no existen"
        >
          <Prosa>
            El argumento de la extensión de tiempo no exige leer intenciones: basta leer el propio
            documento. La sesión fue convocada con 48 horas de antelación, no se publicó calendario, y
            los ejes de mayor peso —banca, subsidios, tributos, propiedad accionaria— dependen de leyes
            y decretos-leyes que la Asamblea aún no ha redactado. Lo inmediatamente ejecutable es la
            franja menor del mapa.
          </Prosa>
          <TreemapEjes ejes={ejes_2026} />
        </Seccion>

        {/* ------------------------------------------------ 5. Encuesta */}
        <Seccion kicker="Su lectura" titulo="La pregunta que el programa no responde">
          <Encuesta encuesta={encuesta} />
        </Seccion>

        {/* ------------------------------------------------ Metodología y fuentes */}
        <Seccion kicker="Transparencia" titulo="Metodología, sesgos declarados y fuentes">
          <Panel>
            <div style={{ fontFamily: T.mono, fontSize: 12, letterSpacing: 2, color: T.textoSuave, marginBottom: 10 }}>
              NOTAS METODOLÓGICAS
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {meta.notas_metodologicas.map((n, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: T.cuerpo,
                    fontSize: 14,
                    color: T.textoSuave,
                    lineHeight: 1.6,
                    marginBottom: 8,
                  }}
                >
                  {n}
                </li>
              ))}
            </ul>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 12,
                letterSpacing: 2,
                color: T.textoSuave,
                margin: "18px 0 10px",
              }}
            >
              FUENTES
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {meta.fuentes.map((f, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: T.mono,
                    fontSize: 12.5,
                    color: T.textoSuave,
                    lineHeight: 1.7,
                  }}
                >
                  {f}
                </li>
              ))}
            </ul>
          </Panel>
        </Seccion>

        <footer
          style={{
            fontFamily: T.mono,
            fontSize: 12,
            color: T.textoSuave,
            borderTop: `1px solid ${T.panelBorde}`,
            paddingTop: 20,
          }}
        >
          Yamacoa · Observatorio de derechos humanos y economía política de Cuba · Datos abiertos:
          medidas_176.json
          {instantanea && " · Vista previa con instantánea embebida (2026-07-14); en producción los datos se actualizan cada 8 horas."}
        </footer>
      </div>
    </div>
  );
}
