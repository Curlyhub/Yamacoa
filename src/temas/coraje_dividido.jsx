import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea, LabelList, Cell,
} from "recharts";

// =====================================================================
// CORAJE DIVIDIDO — edición especial Yamacoa
// Renderer CONGELADO. Los datos viven en /data/coraje_dividido.json.
// Paleta propia (design_log): verde caña 95° / magenta 330° — sin
// colisión con rojo-ascua (represión), voltaje (conflictos), fuego
// (protestas) ni bandera (píldoras).
// =====================================================================

const T = {
  fondo: "#0F131B",
  panel: "#171D28",
  panelSuave: "#1C2432",
  linea: "#28303F",
  crema: "#EFE8D8",
  cremaSuave: "#B9B2A2",
  isla: "#8FB259",
  islaOscuro: "#5C7A38",
  exilio: "#C2497F",
  exilioOscuro: "#8A2F58",
  neutro: "#7C8496",
  ambarCF: "#D9A13B",
  ambarCFfondo: "rgba(217,161,59,0.07)",
  display: "'Archivo Black', 'Arial Black', sans-serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
  serif: "Georgia, 'Times New Roman', serif",
};

const CONFIANZA = {
  confirmado: { color: "#8FB259", texto: "confirmado" },
  reportado: { color: "#D9A13B", texto: "reportado" },
  estimado: { color: "#C2497F", texto: "estimado" },
};

function ChipConfianza({ nivel }) {
  const c = CONFIANZA[nivel] || CONFIANZA.estimado;
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 10, letterSpacing: 1, textTransform: "uppercase",
      color: c.color, border: `1px solid ${c.color}`, borderRadius: 3, padding: "1px 6px",
    }}>{c.texto}</span>
  );
}

function Tabs({ opciones, activo, onCambio }) {
  return (
    <div style={{ display: "flex", gap: 22, borderBottom: `1px solid ${T.linea}`, marginBottom: 16, flexWrap: "wrap" }}>
      {opciones.map((o) => (
        <button key={o.id} onClick={() => onCambio(o.id)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 2px 10px",
            fontFamily: T.mono, fontSize: 12.5, letterSpacing: 1, textTransform: "uppercase",
            color: activo === o.id ? T.crema : T.neutro,
            borderBottom: activo === o.id ? `3px solid ${T.ambarCF}` : "3px solid transparent" }}>
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}

function Cinta() {
  return (
    <div style={{
      background: `linear-gradient(90deg, ${T.islaOscuro}, ${T.exilioOscuro})`,
      color: T.crema, fontFamily: T.mono, fontSize: 11, letterSpacing: 4,
      textTransform: "uppercase", textAlign: "center", padding: "6px 12px",
    }}>
      Edición especial · Expediente comparado
    </div>
  );
}

function Seccion({ num, titulo, children, contrafactual }) {
  return (
    <section style={{ margin: "72px 0" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 6 }}>
        <span style={{ fontFamily: T.mono, color: contrafactual ? T.ambarCF : T.isla, fontSize: 13 }}>{num}</span>
        <h2 style={{ fontFamily: T.display, color: T.crema, fontSize: "clamp(20px,3.2vw,30px)", margin: 0, lineHeight: 1.15 }}>{titulo}</h2>
      </div>
      <div style={{ height: 2, background: contrafactual ? T.ambarCF : `linear-gradient(90deg, ${T.isla}, ${T.exilio})`, opacity: 0.5, marginBottom: 22 }} />
      {contrafactual && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{
            fontFamily: T.mono, fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
            color: T.ambarCF, border: `1px dashed ${T.ambarCF}`, borderRadius: 4, padding: "3px 10px",
          }}>⚠ contrafactual</span>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.neutro }}>
            Escenario hipotético parametrizado. No es una predicción.
          </span>
        </div>
      )}
      <div style={contrafactual ? {
        border: `1.5px dashed ${T.ambarCF}`, borderRadius: 10, padding: "20px 18px", background: T.ambarCFfondo,
      } : {}}>{children}</div>
    </section>
  );
}

function Prosa({ texto }) {
  return <p style={{ fontFamily: T.serif, color: T.crema, fontSize: 17, lineHeight: 1.75, maxWidth: 820, margin: "0 0 16px" }}>{texto}</p>;
}

// ---------------------------------------------------------------------
// La grieta del hero: trazo quebrado que separa isla y exilio
// ---------------------------------------------------------------------
function Grieta() {
  return (
    <svg viewBox="0 0 24 200" preserveAspectRatio="none" style={{ width: 20, height: "100%", minHeight: 140 }}>
      <path d="M14,0 L9,28 L16,52 L7,84 L15,110 L6,142 L14,168 L10,200"
        fill="none" stroke={T.ambarCF} strokeWidth="2.5" strokeLinejoin="round" opacity="0.9" />
      <path d="M14,0 L9,28 L16,52 L7,84 L15,110 L6,142 L14,168 L10,200"
        fill="none" stroke={T.ambarCF} strokeWidth="7" strokeLinejoin="round" opacity="0.12" />
    </svg>
  );
}

// ---------------------------------------------------------------------
// §01 — Cuadrante voluntad × coordinación (SVG propio, clicable)
// ---------------------------------------------------------------------
function Cuadrante({ datos }) {
  const [sel, setSel] = useState("cuba");
  const W = 680, H = 440, M = { l: 54, r: 20, t: 24, b: 46 };
  const x = (c) => M.l + (c / 10) * (W - M.l - M.r);
  const y = (v) => H - M.b - ((v - 40) / 60) * (H - M.t - M.b);
  const colRes = { "transición": T.isla, "régimen persiste": T.exilio, "en disputa": T.ambarCF };
  const p = datos.paises.find((q) => q.id === sel);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: T.panel, borderRadius: 10, border: `1px solid ${T.linea}` }}>
        <rect x={x(5)} y={M.t} width={W - M.r - x(5)} height={y(70) - M.t} fill={T.isla} opacity="0.06" />
        <rect x={M.l} y={M.t} width={x(5) - M.l} height={y(70) - M.t} fill={T.exilio} opacity="0.05" />
        {[0, 2.5, 5, 7.5, 10].map((v) => (
          <g key={v}>
            <line x1={x(v)} y1={M.t} x2={x(v)} y2={H - M.b} stroke={T.linea} strokeWidth="1" />
            <text x={x(v)} y={H - M.b + 18} fill={T.neutro} fontSize="11" fontFamily={T.mono} textAnchor="middle">{v}</text>
          </g>
        ))}
        {[40, 55, 70, 85, 100].map((v) => (
          <g key={v}>
            <line x1={M.l} y1={y(v)} x2={W - M.r} y2={y(v)} stroke={T.linea} strokeWidth="1" />
            <text x={M.l - 8} y={y(v) + 4} fill={T.neutro} fontSize="11" fontFamily={T.mono} textAnchor="end">{v}%</text>
          </g>
        ))}
        <line x1={x(5)} y1={M.t} x2={x(5)} y2={H - M.b} stroke={T.neutro} strokeDasharray="5 4" strokeWidth="1.4" />
        <text x={x(9.9)} y={M.t + 14} fill={T.isla} fontSize="11" fontFamily={T.mono} textAnchor="end" opacity="0.9">CUADRANTE DE LAS TRANSICIONES →</text>
        <text x={M.l + 6} y={M.t + 14} fill={T.exilio} fontSize="11" fontFamily={T.mono} opacity="0.9">← ENERGÍA SIN CAUCE</text>
        <text x={(M.l + W - M.r) / 2} y={H - 8} fill={T.cremaSuave} fontSize="12" fontFamily={T.mono} textAnchor="middle">Coordinación opositora (10 − IFE) →</text>
        <text x={14} y={(M.t + H - M.b) / 2} fill={T.cremaSuave} fontSize="12" fontFamily={T.mono} textAnchor="middle" transform={`rotate(-90 14 ${(M.t + H - M.b) / 2})`}>Voluntad de cambio →</text>
        {datos.paises.map((q) => {
          const esSel = q.id === sel, cx = x(q.coordinacion), cy = y(q.voluntad);
          return (
            <g key={q.id} onClick={() => setSel(q.id)} style={{ cursor: "pointer" }}>
              {q.id === "cuba" && (
                <circle cx={cx} cy={cy} r="16" fill="none" stroke={T.ambarCF} strokeWidth="1.5" opacity="0.8">
                  <animate attributeName="r" values="12;19;12" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.4s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={cx} cy={cy} r={esSel ? 9 : 6.5} fill={colRes[q.resultado]} stroke={T.fondo} strokeWidth="2" />
              <text x={cx} y={cy - 13} fill={esSel ? T.crema : T.cremaSuave} fontSize={esSel ? 12.5 : 10.5}
                fontFamily={T.mono} textAnchor="middle" fontWeight={esSel ? 700 : 400}>{q.nombre}</text>
            </g>
          );
        })}
      </svg>
      {p && (
        <div style={{ marginTop: 12, background: T.panelSuave, border: `1px solid ${T.linea}`, borderLeft: `4px solid ${colRes[p.resultado]}`, borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
            <b style={{ fontFamily: T.mono, color: T.crema }}>{p.nombre}</b>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: colRes[p.resultado], textTransform: "uppercase", letterSpacing: 1 }}>{p.resultado}</span>
            <ChipConfianza nivel={p.confianza} />
          </div>
          <p style={{ fontFamily: T.serif, color: T.cremaSuave, fontSize: 14.5, lineHeight: 1.6, margin: "6px 0 0" }}>{p.detalle}</p>
        </div>
      )}
      <p style={{ fontFamily: T.mono, fontSize: 11, color: T.neutro, marginTop: 10 }}>{datos.nota_metodologica}</p>
    </div>
  );
}

// ---------------------------------------------------------------------
// §02 — Constelación de la fragmentación vs hub ANC (SVG propio)
// ---------------------------------------------------------------------
const DECADAS = ["1960s", "1980s", "1990s", "2000s", "2010s", "2020s"];

function CajaOrg({ org, total }) {
  return (
    <div style={{ marginTop: 12, minHeight: 46, background: T.panelSuave, border: `1px solid ${org ? T.ambarCF : T.linea}`,
      borderLeft: `4px solid ${org ? T.exilio : T.linea}`, borderRadius: 8, padding: "10px 14px",
      fontFamily: T.mono, fontSize: 13.5, color: T.crema, lineHeight: 1.55 }}>
      {org ? (
        <>▸ <b style={{ color: T.exilio }}>{org.nombre}</b>
          <span style={{ color: T.ambarCF }}> · fundación {org.decada} (est.)</span>
          <span style={{ color: T.cremaSuave }}> — una de las {total}+ organizaciones sin estructura común. Toca otro punto para comparar.</span></>
      ) : (
        <span style={{ color: T.cremaSuave }}>Toca cualquier punto para identificar la organización; el nodo seleccionado parpadea.</span>
      )}
    </div>
  );
}

function ConstelacionMapa({ datos, orgSel, setOrgSel }) {
  const orgs = datos.organizaciones;
  const puntos = useMemo(() => {
    let s = 42;
    const rnd = () => { s = (s * 16807) % 2147483647; return (s % 10000) / 10000; };
    return orgs.map((o) => ({ ...o, x: 30 + rnd() * 300, y: 44 + rnd() * 282, r: 3 + rnd() * 2.2 }));
  }, [orgs]);
  const halos = [
    { cx: 110, cy: 118, r: 70, p: datos.paraguas[0], lx: 110, ly: [30, 42], abajo: false },
    { cx: 250, cy: 208, r: 58, p: datos.paraguas[2], lx: 232, ly: [132, 144], abajo: false },
    { cx: 150, cy: 272, r: 44, p: datos.paraguas[3], lx: 150, ly: [332, 344], abajo: true },
  ];
  const halo2linea = (p) => [`${p.nombre} (${p.anio})`, p.estado];
  const radios = 12;
  return (
    <div>
      <svg viewBox="0 0 720 396" style={{ width: "100%", background: T.panel, borderRadius: 10, border: `1px solid ${T.linea}` }}>
        <line x1="360" y1="16" x2="360" y2="360" stroke={T.linea} strokeWidth="1.5" strokeDasharray="3 5" />
        <text x="180" y="24" fill={T.exilio} fontSize="12.5" fontFamily={T.mono} textAnchor="middle" letterSpacing="2" fontWeight="700">EXILIO CUBANO · {orgs.length}+ ORGS.</text>
        <text x="540" y="24" fill={T.isla} fontSize="12.5" fontFamily={T.mono} textAnchor="middle" letterSpacing="2" fontWeight="700">ANC · MANDO ÚNICO</text>
        {halos.map((hh, i) => (
          <g key={i}>
            <circle cx={hh.cx} cy={hh.cy} r={hh.r} fill="none" stroke={T.ambarCF} strokeWidth="1" strokeDasharray="4 5" opacity="0.55" />
            {halo2linea(hh.p).map((ln, j) => (
              <text key={j} x={hh.lx} y={hh.ly[j]} fill={T.ambarCF} fontSize="9.5" fontFamily={T.mono} textAnchor="middle"
                stroke={T.panel} strokeWidth="4" paintOrder="stroke">{ln}</text>
            ))}
          </g>
        ))}
        {puntos.map((p, i) => {
          const sel = orgSel && orgSel.nombre === p.nombre;
          return (
            <g key={i} onClick={() => setOrgSel({ nombre: p.nombre, decada: p.decada })} style={{ cursor: "pointer" }}>
              {sel && <circle cx={p.x} cy={p.y} r={p.r + 6} fill="none" stroke={T.ambarCF} strokeWidth="1.5" />}
              <circle cx={p.x} cy={p.y} r={sel ? p.r + 2.5 : p.r} fill={sel ? T.crema : T.exilio} opacity={sel ? 1 : 0.78}>
                {sel && <animate attributeName="opacity" values="1;0.2;1" dur="0.9s" repeatCount="indefinite" />}
                <title>{p.nombre}</title>
              </circle>
            </g>
          );
        })}
        <circle cx="540" cy="186" r="15" fill={T.isla} />
        <text x="540" y="190" fill={T.fondo} fontSize="10" fontFamily={T.mono} textAnchor="middle" fontWeight="700">ANC</text>
        {Array.from({ length: radios }).map((_, i) => {
          const a = (i / radios) * Math.PI * 2;
          const x2 = 540 + Math.cos(a) * 100, y2 = 186 + Math.sin(a) * 100;
          return (
            <g key={i}>
              <line x1={540 + Math.cos(a) * 17} y1={186 + Math.sin(a) * 17} x2={x2} y2={y2} stroke={T.isla} strokeWidth="1.1" opacity="0.55" />
              <circle cx={x2} cy={y2} r="4" fill={T.panel} stroke={T.isla} strokeWidth="1.6" />
            </g>
          );
        })}
        <text x="540" y="330" fill={T.cremaSuave} fontSize="10.5" fontFamily={T.mono} textAnchor="middle" stroke={T.panel} strokeWidth="4" paintOrder="stroke">Tambo · Lusaka · ~1967–1991</text>
        <text x="540" y="345" fill={T.cremaSuave} fontSize="10.5" fontFamily={T.mono} textAnchor="middle" stroke={T.panel} strokeWidth="4" paintOrder="stroke">un solo canal de apoyo y negociación</text>
      </svg>
      <CajaOrg org={orgSel} total={orgs.length} />
    </div>
  );
}

function ConstelacionTiempo({ datos, orgSel, setOrgSel }) {
  const [k, setK] = useState(35);
  const orgs = datos.organizaciones;
  const W = 720, H = 400, ml = 14, mr = 14, bw = (W - ml - mr) / DECADAS.length;
  const nodos = useMemo(() => {
    let s = 271828;
    const rnd = () => { s = (s * 16807) % 2147483647; return (s % 10000) / 10000; };
    const porDec = {};
    const lista = orgs.map((o) => {
      const d = Math.max(0, DECADAS.indexOf(o.decada));
      porDec[d] = (porDec[d] || 0) + 1;
      const j = porDec[d] - 1;
      const x0 = ml + d * bw;
      // posición dispersa (dentro de su banda) y posición concentrada (empaquetado phyllotaxis)
      const disp = { x: x0 + 16 + rnd() * (bw - 32), y: 66 + rnd() * 246 };
      const ang = j * 2.39996; // ángulo áureo
      const rad = 5.5 * Math.sqrt(j + 0.6);
      const conc = { x: x0 + bw / 2 + Math.cos(ang) * rad, y: 196 + Math.sin(ang) * rad };
      return { ...o, d, disp, conc };
    });
    return { lista, porDec };
  }, [orgs, bw]);
  const t = k / 100;
  return (
    <div>
      <label style={{ display: "block", fontFamily: T.mono, fontSize: 12, color: T.cremaSuave, margin: "0 0 10px" }}>
        Agrupamiento por década (parámetro k de concentración): <b style={{ color: T.crema }}>{k}%</b>
        <input type="range" min={0} max={100} step={5} value={k} onChange={(e) => setK(Number(e.target.value))}
          style={{ width: "100%", accentColor: T.ambarCF, marginTop: 4 }} />
      </label>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: T.panel, borderRadius: 10, border: `1px solid ${T.linea}` }}>
        {DECADAS.map((d, i) => (
          <g key={d}>
            {i > 0 && <line x1={ml + i * bw} y1={30} x2={ml + i * bw} y2={H - 66} stroke={T.linea} strokeWidth="1" strokeDasharray="2 5" />}
            <text x={ml + i * bw + bw / 2} y={H - 44} fill={T.crema} fontSize="13" fontFamily={T.mono} textAnchor="middle" fontWeight="700">{d}</text>
            <text x={ml + i * bw + bw / 2} y={H - 28} fill={T.ambarCF} fontSize="10.5" fontFamily={T.mono} textAnchor="middle">{nodos.porDec[i] || 0} orgs.</text>
          </g>
        ))}
        <text x={W / 2} y={20} fill={T.neutro} fontSize="10.5" fontFamily={T.mono} textAnchor="middle">← concentra (k alto) · dispersa (k bajo) → la constelación nunca colapsa en UN solo nodo: eso es el hallazgo</text>
        {nodos.lista.map((p, i) => {
          const x = p.disp.x + (p.conc.x - p.disp.x) * t;
          const y = p.disp.y + (p.conc.y - p.disp.y) * t;
          const sel = orgSel && orgSel.nombre === p.nombre;
          return (
            <g key={i} onClick={() => setOrgSel({ nombre: p.nombre, decada: p.decada })} style={{ cursor: "pointer" }}>
              {sel && <circle cx={x} cy={y} r="9.5" fill="none" stroke={T.ambarCF} strokeWidth="1.5" />}
              <circle cx={x} cy={y} r={sel ? 5.5 : 3.6} fill={sel ? T.crema : T.exilio} opacity={sel ? 1 : 0.8}
                style={{ transition: "cx .25s, cy .25s" }}>
                {sel && <animate attributeName="opacity" values="1;0.2;1" dur="0.9s" repeatCount="indefinite" />}
                <title>{p.nombre} · {p.decada}</title>
              </circle>
            </g>
          );
        })}
      </svg>
      <p style={{ fontFamily: T.mono, fontSize: 11, color: T.neutro, margin: "8px 0 0" }}>{datos.nota_decadas}</p>
      <CajaOrg org={orgSel} total={orgs.length} />
    </div>
  );
}

function Constelacion({ datos }) {
  const [pestana, setPestana] = useState("mapa");
  const [orgSel, setOrgSel] = useState(null);
  return (
    <div>
      <Tabs activo={pestana} onCambio={setPestana} opciones={[
        { id: "mapa", etiqueta: "Constelación vs ANC" },
        { id: "tiempo", etiqueta: "Línea temporal + agrupamiento" },
      ]} />
      {pestana === "mapa"
        ? <ConstelacionMapa datos={datos} orgSel={orgSel} setOrgSel={setOrgSel} />
        : <ConstelacionTiempo datos={datos} orgSel={orgSel} setOrgSel={setOrgSel} />}
    </div>
  );
}

// ---------------------------------------------------------------------
// §03 — Matriz-calor del IFE
// ---------------------------------------------------------------------
const calorIFE = (v) => {
  const t = v / 10;
  const a = [143, 178, 89], b = [194, 73, 127];
  const c = a.map((av, i) => Math.round(av + (b[i] - av) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

function MatrizCalor({ datos }) {
  const [compSel, setCompSel] = useState(0);
  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 4, width: "100%", minWidth: 640 }}>
          <thead>
            <tr>
              <th style={{ fontFamily: T.mono, fontSize: 11, color: T.neutro, textAlign: "left", padding: "4px 8px" }}>caso</th>
              {datos.componentes.map((c, i) => (
                <th key={c.id} onClick={() => setCompSel(i)}
                  style={{ fontFamily: T.mono, fontSize: 10.5, color: compSel === i ? T.crema : T.neutro, cursor: "pointer",
                    padding: "4px 6px", borderBottom: compSel === i ? `2px solid ${T.ambarCF}` : "2px solid transparent" }}>
                  {c.nombre}
                </th>
              ))}
              <th style={{ fontFamily: T.mono, fontSize: 11, color: T.crema, padding: "4px 8px" }}>IFE</th>
            </tr>
          </thead>
          <tbody>
            {datos.casos.map((k) => (
              <tr key={k.id}>
                <td style={{ fontFamily: T.mono, fontSize: 12.5, color: k.id === "cuba" ? T.crema : T.cremaSuave, fontWeight: k.id === "cuba" ? 700 : 400, padding: "6px 8px", whiteSpace: "nowrap" }}>
                  {k.id === "cuba" ? "▸ " : ""}{k.nombre}
                </td>
                {k.valores.map((v, i) => (
                  <td key={i} style={{ background: calorIFE(v), borderRadius: 4, textAlign: "center",
                    fontFamily: T.mono, fontSize: 12, color: "#10131A", fontWeight: 700, padding: "8px 0",
                    outline: k.id === "cuba" ? `1.5px solid ${T.crema}` : "none", opacity: compSel === i ? 1 : 0.82 }}>{v}</td>
                ))}
                <td style={{ fontFamily: T.display, fontSize: 16, color: k.ife >= 6 ? T.exilio : T.isla, textAlign: "center", padding: "6px 10px" }}>{k.ife.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.neutro, letterSpacing: 1, textTransform: "uppercase" }}>Leyenda</span>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.isla }}>0 · cohesión</span>
        <div style={{ flex: "0 0 170px", height: 12, borderRadius: 6,
          background: `linear-gradient(90deg, ${calorIFE(0)}, ${calorIFE(5)}, ${calorIFE(10)})`, border: `1px solid ${T.linea}` }} />
        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.exilio }}>10 · fragmentación</span>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.neutro }}>· recuadro crema = exilio cubano · cabeceras clicables = metodología</span>
      </div>
      <div style={{ marginTop: 12, background: T.panelSuave, border: `1px solid ${T.linea}`, borderRadius: 8, padding: "12px 16px" }}>
        <b style={{ fontFamily: T.mono, fontSize: 12.5, color: T.ambarCF }}>{datos.componentes[compSel].nombre}</b>
        <p style={{ fontFamily: T.serif, fontSize: 14.5, color: T.cremaSuave, lineHeight: 1.6, margin: "6px 0 0" }}>{datos.componentes[compSel].descripcion}</p>
      </div>
      <p style={{ fontFamily: T.mono, fontSize: 11, color: T.neutro, marginTop: 10 }}>
        Escala 0–10 por componente (mayor = más fragmentado); IFE = media simple. Índice de elaboración propia: discútelo, esa es la idea.
      </p>
    </div>
  );
}

function GrafoCausal({ comparativa }) {
  const [nodoSel, setNodoSel] = useState("dispersion");
  const pos = {
    dependencia: { x: 100, y: 150 }, dispersion: { x: 270, y: 150 },
    paraguas: { x: 440, y: 72 }, mando: { x: 440, y: 226 }, divergencia: { x: 616, y: 226 },
  };
  const porId = {};
  comparativa.metricas.forEach((m) => { porId[m.id] = m; });
  const msel = porId[nodoSel];
  const datosCurva = comparativa.metricas.map((m) => ({
    name: m.corto, "Exilio cubano": m.cuba.compuesto, "ANC": m.anc.compuesto,
  }));
  return (
    <div>
      <Prosa texto={comparativa.texto} />
      <svg viewBox="0 0 720 300" style={{ width: "100%", background: T.panel, borderRadius: 10, border: `1px solid ${T.linea}` }}>
        <defs>
          <marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={T.ambarCF} />
          </marker>
        </defs>
        {comparativa.enlaces.map((e, i) => {
          const a = pos[e.de], b = pos[e.a];
          const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
          const ra = 16 + porId[e.de].cuba.puntuacion * 1.6, rb = 16 + porId[e.a].cuba.puntuacion * 1.6;
          const x1 = a.x + (dx / L) * (ra + 2), y1 = a.y + (dy / L) * (ra + 2);
          const x2 = b.x - (dx / L) * (rb + 6), y2 = b.y - (dy / L) * (rb + 6);
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 10;
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.ambarCF} strokeWidth="1.6" opacity="0.8" markerEnd="url(#flecha)" />
              <text x={mx} y={my} fill={T.cremaSuave} fontSize="9" fontFamily={T.mono} textAnchor="middle"
                stroke={T.panel} strokeWidth="4" paintOrder="stroke">{e.texto}</text>
            </g>
          );
        })}
        {comparativa.metricas.map((m) => {
          const p = pos[m.id], r = 16 + m.cuba.puntuacion * 1.6, sel = nodoSel === m.id;
          return (
            <g key={m.id} onClick={() => setNodoSel(m.id)} style={{ cursor: "pointer" }}>
              <circle cx={p.x} cy={p.y} r={r} fill={T.exilio} opacity={sel ? 0.95 : 0.6} stroke={sel ? T.crema : T.exilioOscuro} strokeWidth={sel ? 2 : 1} />
              <circle cx={p.x} cy={p.y} r={16 + m.anc.puntuacion * 1.6} fill="none" stroke={T.isla} strokeWidth="1.6" strokeDasharray="3 3" />
              <text x={p.x} y={p.y + 4} fill={T.crema} fontSize="12" fontFamily={T.mono} textAnchor="middle" fontWeight="700">{m.cuba.puntuacion}</text>
              <text x={p.x} y={p.y + r + 14} fill={sel ? T.crema : T.cremaSuave} fontSize="10.5" fontFamily={T.mono} textAnchor="middle"
                stroke={T.panel} strokeWidth="4" paintOrder="stroke" fontWeight={sel ? 700 : 400}>{m.corto}</text>
            </g>
          );
        })}
        <g fontFamily={T.mono} fontSize="10">
          <circle cx={22} cy={282} r={6} fill={T.exilio} opacity="0.8" /><text x={33} y={286} fill={T.cremaSuave}>radio = puntuación del exilio cubano</text>
          <circle cx={278} cy={282} r={6} fill="none" stroke={T.isla} strokeDasharray="3 3" strokeWidth="1.6" /><text x={289} y={286} fill={T.cremaSuave}>anillo discontinuo = ANC</text>
        </g>
      </svg>
      {msel && (
        <div style={{ marginTop: 10, background: T.panelSuave, border: `1px solid ${T.linea}`, borderLeft: `4px solid ${T.ambarCF}`, borderRadius: 8, padding: "10px 14px", fontFamily: T.mono, fontSize: 12.5, color: T.crema, lineHeight: 1.65 }}>
          <b style={{ color: T.ambarCF }}>{msel.componente}</b><br />
          Exilio cubano: <b style={{ color: T.exilio }}>{msel.cuba.puntuacion}</b> · {msel.cuba.unidades} {msel.cuba.etiqueta} → compuesto <b style={{ color: T.exilio }}>{msel.cuba.compuesto}</b><br />
          ANC: <b style={{ color: T.isla }}>{msel.anc.puntuacion}</b> · {msel.anc.unidades} {msel.anc.etiqueta} → compuesto <b style={{ color: T.isla }}>{msel.anc.compuesto}</b>
        </div>
      )}
      <h3 style={{ fontFamily: T.mono, color: T.cremaSuave, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", margin: "24px 0 6px" }}>
        Las dos curvas: fragmentación compuesta por variable
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={datosCurva} margin={{ right: 26, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.linea} />
          <XAxis dataKey="name" tick={{ fill: T.cremaSuave, fontSize: 11.5, fontFamily: T.mono }} />
          <YAxis tick={{ fill: T.neutro, fontSize: 11, fontFamily: T.mono }} label={{ value: "índice compuesto", angle: -90, fill: T.neutro, fontFamily: T.mono, fontSize: 11 }} />
          <Tooltip contentStyle={{ background: T.panelSuave, border: `1px solid ${T.linea}`, fontFamily: T.mono, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontFamily: T.mono, fontSize: 12 }} />
          <Line type="monotone" dataKey="Exilio cubano" stroke={T.exilio} strokeWidth={2.6} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="ANC" stroke={T.isla} strokeWidth={2.6} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
      <p style={{ fontFamily: T.mono, fontSize: 11, color: T.ambarCF, marginTop: 4 }}>{comparativa.formula}</p>
    </div>
  );
}

function MatrizIFE({ datos }) {
  const [pestana, setPestana] = useState("matriz");
  return (
    <div>
      <Tabs activo={pestana} onCambio={setPestana} opciones={[
        { id: "matriz", etiqueta: "Matriz de calor" },
        { id: "causal", etiqueta: "Grafo causal · Cuba vs ANC" },
      ]} />
      {pestana === "matriz" ? <MatrizCalor datos={datos} /> : <GrafoCausal comparativa={datos.comparativa} />}
    </div>
  );
}

// ---------------------------------------------------------------------
// §04 — Serie de protestas con corte de eje para el 11J
// ---------------------------------------------------------------------
function SerieProtestas({ datos }) {
  const serie = datos.serie_protestas;
  const maxNormal = 120;
  const W = 700, H = 320, M = { l: 46, r: 16, t: 30, b: 40 };
  const n = serie.length;
  const bw = (W - M.l - M.r) / n - 14;
  const y = (v) => H - M.b - (Math.min(v, maxNormal) / maxNormal) * (H - M.t - M.b - 34);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: T.panel, borderRadius: 10, border: `1px solid ${T.linea}` }}>
        {[0, 30, 60, 90, 120].map((v) => (
          <g key={v}>
            <line x1={M.l} y1={y(v)} x2={W - M.r} y2={y(v)} stroke={T.linea} strokeWidth="1" />
            <text x={M.l - 8} y={y(v) + 4} fill={T.neutro} fontSize="11" fontFamily={T.mono} textAnchor="end">{v}</text>
          </g>
        ))}
        {serie.map((s, i) => {
          const x0 = M.l + 8 + i * ((W - M.l - M.r) / n);
          const esCorte = s.protestas > maxNormal;
          const hTope = esCorte ? M.t + 12 : y(s.protestas);
          const record = s.mes === "jun-2026";
          return (
            <g key={s.mes}>
              <rect x={x0} y={hTope} width={bw} height={H - M.b - hTope} rx="3"
                fill={record ? T.isla : s.tipo === "estimado" ? "none" : T.islaOscuro}
                stroke={s.tipo === "estimado" ? T.neutro : "none"} strokeDasharray={s.tipo === "estimado" ? "4 3" : "none"} strokeWidth="1.6" />
              {esCorte && (
                <g>
                  <path d={`M${x0 - 3},${M.t + 26} l${bw + 6},-7 m${-bw - 6},13 l${bw + 6},-7`} stroke={T.fondo} strokeWidth="5" fill="none" />
                  <path d={`M${x0 - 3},${M.t + 26} l${bw + 6},-7 m${-bw - 6},13 l${bw + 6},-7`} stroke={T.neutro} strokeWidth="1.5" fill="none" />
                </g>
              )}
              <text x={x0 + bw / 2} y={hTope - 6} fill={record ? T.isla : T.crema} fontSize={record ? 14 : 12} fontWeight="700" fontFamily={T.mono} textAnchor="middle">{s.protestas}</text>
              <text x={x0 + bw / 2} y={H - M.b + 16} fill={T.cremaSuave} fontSize="10.5" fontFamily={T.mono} textAnchor="middle">{s.mes}</text>
              {record && <text x={x0 + bw / 2} y={H - M.b + 30} fill={T.isla} fontSize="9.5" fontFamily={T.mono} textAnchor="middle" letterSpacing="1">RÉCORD</text>}
            </g>
          );
        })}
        <text x={W - M.r} y={16} fill={T.neutro} fontSize="10.5" fontFamily={T.mono} textAnchor="end">Protestas presenciales/mes (OCC) · eje cortado en {maxNormal}: jul-2021 fuera de escala</text>
      </svg>
      <p style={{ fontFamily: T.mono, fontSize: 11, color: T.neutro, marginTop: 8 }}>{datos.nota_serie} Barras discontinuas = {"estimado"}.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 14 }}>
        {datos.coste.map((c) => (
          <div key={c.indicador} style={{ background: T.panelSuave, border: `1px solid ${T.linea}`, borderTop: `3px solid ${T.exilio}`, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontFamily: T.display, fontSize: 20, color: T.crema }}>{c.valor}</div>
            <div style={{ fontFamily: T.serif, fontSize: 13, color: T.cremaSuave, margin: "4px 0 6px" }}>{c.indicador}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.neutro }}>{c.fuente}</span>
              <ChipConfianza nivel={c.confianza} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// §05 — Dumbbell isla ↔ exilio + embargo generacional
// ---------------------------------------------------------------------
function DumbbellBrechas({ datos }) {
  const filas = datos.divergencias;
  const W = 700, filaH = 46;
  const x = (v) => 300 + (v / 100) * 360;
  const notas = filas.filter((f) => f.nota);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${filas.length * filaH + 44}`} style={{ width: "100%", background: T.panel, borderRadius: 10, border: `1px solid ${T.linea}` }}>
        <g fontFamily={T.mono} fontSize="11.5">
          <circle cx={310} cy={16} r={5} fill={T.isla} /><text x={320} y={20} fill={T.cremaSuave}>isla</text>
          <circle cx={372} cy={16} r={5} fill={T.exilio} /><text x={382} y={20} fill={T.cremaSuave}>exilio</text>
          <text x={W - 10} y={20} fill={T.neutro} textAnchor="end">% de acuerdo</text>
        </g>
        {filas.map((f, i) => {
          const cy = 44 + i * filaH + filaH / 2;
          const tema = f.nota ? f.tema + " *" : f.tema;
          return (
            <g key={f.tema}>
              <text x={290} y={cy - 4} fill={T.crema} fontSize="12.5" fontFamily={T.serif} textAnchor="end">{tema}</text>
              <text x={290} y={cy + 11} fill={T.neutro} fontSize="9" fontFamily={T.mono} textAnchor="end">{f.fuente}</text>
              <line x1={x(0)} y1={cy} x2={x(100)} y2={cy} stroke={T.linea} strokeWidth="1" />
              {f.isla != null && f.exilio != null && (
                <line x1={x(f.isla)} y1={cy} x2={x(f.exilio)} y2={cy} stroke={T.cremaSuave} strokeWidth="2.5" opacity="0.7" />
              )}
              {f.isla != null && (
                <g><circle cx={x(f.isla)} cy={cy} r="7" fill={T.isla} stroke={T.fondo} strokeWidth="2" />
                  <text x={x(f.isla)} y={cy - 11} fill={T.isla} fontSize="11.5" fontFamily={T.mono} textAnchor="middle" fontWeight="700"
                    stroke={T.panel} strokeWidth="4" paintOrder="stroke">{f.isla}</text></g>
              )}
              {f.exilio != null && (
                <g><circle cx={x(f.exilio)} cy={cy} r="7" fill={T.exilio} stroke={T.fondo} strokeWidth="2" />
                  <text x={x(f.exilio)} y={cy - 11} fill={T.exilio} fontSize="11.5" fontFamily={T.mono} textAnchor="middle" fontWeight="700"
                    stroke={T.panel} strokeWidth="4" paintOrder="stroke">{f.exilio}</text></g>
              )}
              {(f.isla == null || f.exilio == null) && (
                <text x={W - 10} y={cy + 12} fill={T.neutro} fontSize="9" fontFamily={T.mono} textAnchor="end">sin desglose publicado</text>
              )}
            </g>
          );
        })}
      </svg>
      {notas.length > 0 && (
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.neutro, lineHeight: 1.65, marginTop: 8 }}>
          {notas.map((f) => <p key={f.tema} style={{ margin: "2px 0" }}>* {f.tema}: {f.nota}</p>)}
        </div>
      )}
      <h3 style={{ fontFamily: T.mono, color: T.cremaSuave, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", margin: "26px 0 8px" }}>
        Apoyo al embargo por grupo — {datos.fuente_embargo}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={datos.embargo_generacional} layout="vertical" margin={{ left: 10, right: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.linea} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: T.neutro, fontSize: 11, fontFamily: T.mono }} unit="%" />
          <YAxis type="category" dataKey="grupo" width={170} tick={{ fill: T.cremaSuave, fontSize: 12, fontFamily: T.mono }} />
          <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: T.panelSuave, border: `1px solid ${T.linea}`, fontFamily: T.mono }} />
          <ReferenceLine x={50} stroke={T.neutro} strokeDasharray="4 4" />
          <Bar dataKey="apoyo" radius={[0, 4, 4, 0]}>
            {datos.embargo_generacional.map((e, i) => (
              <Cell key={i} fill={e.apoyo >= 50 ? T.exilio : T.isla} />
            ))}
            <LabelList dataKey="apoyo" position="right" formatter={(v) => `${v}%`} style={{ fill: T.crema, fontFamily: T.mono, fontSize: 12 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RadarInternacional({ datos }) {
  const colorTipo = { "mercado de predicción": T.ambarCF, "encuesta": T.isla, "cobertura": T.neutro };
  return (
    <div>
      <p style={{ fontFamily: T.mono, fontSize: 12, color: T.cremaSuave, lineHeight: 1.65, margin: "0 0 14px", maxWidth: 820 }}>
        Qué miden fuera: mercados de predicción y prensa internacional. Un precio de mercado NO es una probabilidad objetiva:
        es la apuesta agregada de traders con dinero real, en mercados a veces poco líquidos — por eso todos llevan etiqueta de confianza.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        {datos.cobertura_internacional.map((c, i) => (
          <div key={i} style={{ background: T.panel, border: `1px solid ${T.linea}`, borderTop: `3px solid ${colorTipo[c.tipo] || T.neutro}`, borderRadius: 10, padding: "12px 15px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: colorTipo[c.tipo] || T.neutro, border: `1px solid ${colorTipo[c.tipo] || T.neutro}`, borderRadius: 3, padding: "1px 6px" }}>{c.tipo}</span>
              <ChipConfianza nivel={c.confianza} />
            </div>
            <div style={{ fontFamily: T.display, fontSize: 26, color: T.crema, margin: "8px 0 2px" }}>{c.dato}</div>
            <b style={{ fontFamily: T.mono, fontSize: 12, color: T.cremaSuave }}>{c.fuente} · {c.fecha}</b>
            <p style={{ fontFamily: T.serif, fontSize: 13.5, color: T.cremaSuave, lineHeight: 1.6, margin: "8px 0 10px" }}>{c.detalle}</p>
            <a href={c.url} target="_blank" rel="noreferrer" style={{ fontFamily: T.mono, fontSize: 11, color: T.isla, marginTop: "auto" }}>ver fuente ↗</a>
          </div>
        ))}
      </div>
    </div>
  );
}

function DivergenciasIslaExilio({ datos }) {
  const [pestana, setPestana] = useState("brechas");
  return (
    <div>
      <Tabs activo={pestana} onCambio={setPestana} opciones={[
        { id: "brechas", etiqueta: "Brechas isla ↔ exilio" },
        { id: "radar", etiqueta: "Radar internacional" },
      ]} />
      {pestana === "brechas" ? <DumbbellBrechas datos={datos} /> : <RadarInternacional datos={datos} />}
    </div>
  );
}

// ---------------------------------------------------------------------
// §06 — Género
// ---------------------------------------------------------------------
function Genero({ datos }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={datos.participacion} margin={{ right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.linea} />
          <XAxis dataKey="caso" tick={{ fill: T.cremaSuave, fontSize: 11.5, fontFamily: T.mono }} />
          <YAxis domain={[0, 100]} unit="%" tick={{ fill: T.neutro, fontSize: 11, fontFamily: T.mono }} />
          <Tooltip formatter={(v, n, o) => [`${v}% · ${o.payload.confianza}`, "mujeres"]} contentStyle={{ background: T.panelSuave, border: `1px solid ${T.linea}`, fontFamily: T.mono, fontSize: 12 }} />
          <Bar dataKey="pct_mujeres" radius={[4, 4, 0, 0]}>
            {datos.participacion.map((p, i) => (
              <Cell key={i} fill={p.confianza === "confirmado" ? T.exilio : "transparent"}
                stroke={T.exilio} strokeWidth={p.confianza === "confirmado" ? 0 : 2} strokeDasharray={p.confianza === "confirmado" ? "0" : "5 4"} />
            ))}
            <LabelList dataKey="pct_mujeres" position="top" formatter={(v) => `${v}%`} style={{ fill: T.crema, fontFamily: T.mono, fontSize: 12 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={{ fontFamily: T.mono, fontSize: 11, color: T.neutro, margin: "4px 0 16px" }}>
        Participación femenina en protesta. Barras discontinuas = estimaciones sin metodología precisa (marcadas también en cada nota); la cifra cubana mide detenciones documentadas, no participación total.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
        {datos.casos_emblema.map((c) => (
          <div key={c.nombre} style={{ background: T.panelSuave, border: `1px solid ${T.linea}`, borderLeft: `4px solid ${T.exilio}`, borderRadius: 8, padding: "10px 14px" }}>
            <b style={{ fontFamily: T.mono, fontSize: 13, color: T.crema }}>{c.nombre}</b>
            <span style={{ fontFamily: T.display, fontSize: 15, color: T.exilio, marginLeft: 8 }}>{c.condena}</span>
            <p style={{ fontFamily: T.serif, fontSize: 13, color: T.cremaSuave, margin: "5px 0 0", lineHeight: 1.5 }}>{c.detalle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// §07 — Financiación
// ---------------------------------------------------------------------
function Financiacion({ datos }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 10 }}>
      {datos.partidas.map((p) => {
        const contraste = p.concepto.includes("NUG");
        return (
          <div key={p.concepto} style={{
            background: contraste ? "rgba(143,178,89,0.08)" : T.panelSuave,
            border: `1px solid ${contraste ? T.isla : T.linea}`, borderRadius: 8, padding: "12px 14px",
          }}>
            <div style={{ fontFamily: T.display, fontSize: 22, color: contraste ? T.isla : T.exilio }}>{p.valor}</div>
            <div style={{ fontFamily: T.serif, fontSize: 13.5, color: T.crema, margin: "4px 0" }}>{p.concepto}</div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 6, alignItems: "center" }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.neutro }}>{p.detalle}</span>
              <ChipConfianza nivel={p.confianza} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------
// §08 — Contrafactuales interactivos
// ---------------------------------------------------------------------
function Deslizador({ etiqueta, min, max, paso, valor, onChange, formato }) {
  return (
    <label style={{ display: "block", fontFamily: T.mono, fontSize: 12, color: T.cremaSuave, margin: "10px 0" }}>
      {etiqueta}: <b style={{ color: T.crema }}>{formato(valor)}</b>
      <input type="range" min={min} max={max} step={paso} value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: T.ambarCF, marginTop: 4 }} />
    </label>
  );
}

function CF1Chenoweth({ cf }) {
  const [porProtesta, setPorProtesta] = useState(cf.participantes_por_protesta_defecto);
  const umbral = Math.round(cf.poblacion * (cf.umbral_pct / 100));
  const actual = cf.protestas_mes_actual * porProtesta;
  const mult = umbral / Math.max(actual, 1);
  const pct = Math.min(100, (actual / umbral) * 100);
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.linea}`, borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
      <h3 style={{ fontFamily: T.display, color: T.crema, fontSize: 17, margin: "0 0 8px" }}>{cf.titulo}</h3>
      <Prosa texto={cf.texto} />
      <Deslizador etiqueta="Participantes medios por protesta (supuesto)" min={cf.participantes_min} max={cf.participantes_max}
        paso={10} valor={porProtesta} onChange={setPorProtesta} formato={(v) => `${v} personas`} />
      <div style={{ margin: "14px 0 6px", background: T.fondo, borderRadius: 6, height: 26, position: "relative", overflow: "hidden", border: `1px solid ${T.linea}` }}>
        <div style={{ position: "absolute", inset: 0, width: `${pct}%`, background: `linear-gradient(90deg, ${T.islaOscuro}, ${T.isla})`, transition: "width .3s" }} />
        <span style={{ position: "absolute", left: 10, top: 4, fontFamily: T.mono, fontSize: 12, color: T.crema }}>
          ~{actual.toLocaleString("es-ES")} manifestantes/mes ({pct.toFixed(2)}% del umbral)
        </span>
      </div>
      <p style={{ fontFamily: T.mono, fontSize: 12.5, color: T.ambarCF, margin: "8px 0 0" }}>
        Umbral 3,5% ≈ {umbral.toLocaleString("es-ES")} personas sostenidas → la protesta espontánea actual necesitaría multiplicarse ×{mult.toFixed(0)} — el orden de magnitud que separa el coraje disperso de la masa crítica coordinada.
      </p>
    </div>
  );
}

function CF2Mando({ cf }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.linea}`, borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
      <h3 style={{ fontFamily: T.display, color: T.crema, fontSize: 17, margin: "0 0 8px" }}>{cf.titulo}</h3>
      <Prosa texto={cf.texto} />
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={cf.serie} margin={{ right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.linea} />
          <XAxis dataKey="anio" tick={{ fill: T.neutro, fontSize: 11, fontFamily: T.mono }} />
          <YAxis domain={[0, 10]} tick={{ fill: T.neutro, fontSize: 11, fontFamily: T.mono }} label={{ value: "IFE", angle: -90, fill: T.neutro, fontFamily: T.mono, fontSize: 11 }} />
          <Tooltip contentStyle={{ background: T.panelSuave, border: `1px solid ${T.linea}`, fontFamily: T.mono, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontFamily: T.mono, fontSize: 12 }} />
          <ReferenceArea y1={0} y2={3} fill={T.isla} fillOpacity={0.08} label={{ value: "zona histórica de transiciones (IFE < 3)", position: "insideBottomLeft", fill: T.isla, fontSize: 10, fontFamily: T.mono }} />
          <Line type="monotone" dataKey="real" name="Trayectoria real" stroke={T.exilio} strokeWidth={2.6} dot={{ r: 3.5 }} />
          <Line type="monotone" dataKey="hipotetico" name="Contrafactual: mando único desde 2021" stroke={T.ambarCF} strokeWidth={2.6} strokeDasharray="7 5" dot={{ r: 3.5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CF3Fondo({ cf }) {
  const [frac, setFrac] = useState(cf.fraccion_defecto);
  const [cuota, setCuota] = useState(cf.cuota_defecto);
  const anual = cf.diaspora * (frac / 100) * cuota * 12;
  const nug = 100000000;
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.linea}`, borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
      <h3 style={{ fontFamily: T.display, color: T.crema, fontSize: 17, margin: "0 0 8px" }}>{cf.titulo}</h3>
      <Prosa texto={cf.texto} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        <Deslizador etiqueta="Fracción de la diáspora que contribuye" min={1} max={30} paso={1} valor={frac} onChange={setFrac} formato={(v) => `${v}%`} />
        <Deslizador etiqueta="Cuota mensual" min={1} max={50} paso={1} valor={cuota} onChange={setCuota} formato={(v) => `$${v}/mes`} />
      </div>
      <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 13, color: T.crema }}>
        Fondo anual: <b style={{ color: T.isla, fontSize: 18, fontFamily: T.display }}>${(anual / 1e6).toFixed(0)}M</b>
        <span style={{ color: T.neutro }}> · {anual >= nug ? "supera" : "equivale al " + ((anual / nug) * 100).toFixed(0) + "% de"} lo autofinanciado por el NUG birmano (&gt;$100M)</span>
      </div>
      <div style={{ margin: "10px 0 0", background: T.fondo, borderRadius: 6, height: 20, position: "relative", overflow: "hidden", border: `1px solid ${T.linea}` }}>
        <div style={{ position: "absolute", inset: 0, width: `${Math.min(100, (anual / nug) * 100)}%`, background: T.isla, opacity: 0.8, transition: "width .3s" }} />
        <div style={{ position: "absolute", left: "100%", top: 0, bottom: 0, width: 2, background: T.ambarCF }} />
      </div>
      <p style={{ fontFamily: T.mono, fontSize: 11, color: T.neutro, marginTop: 8 }}>{"Referencia: el corte USAID/NED de 2025 eliminó de un plumazo el andamiaje que sostenía al ecosistema opositor; un fondo propio lo haría inmune a esa palanca."}</p>
    </div>
  );
}

// ---------------------------------------------------------------------
// §09 — Encuesta (localStorage + Supabase opcional, fallo silencioso)
// ---------------------------------------------------------------------
function Encuesta({ datos, supabase }) {
  const CLAVE = "yamacoa_coraje_dividido_votos";
  const [votos, setVotos] = useState({});
  const [miVoto, setMiVoto] = useState({});
  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem(CLAVE) || "{}");
      setVotos(local.votos || {});
      setMiVoto(local.miVoto || {});
    } catch (e) { /* sin almacenamiento */ }
    const sb = supabase || (typeof window !== "undefined" && window.__yamacoaSupabase);
    if (sb && sb.rpc) {
      sb.rpc("coraje_dividido_totales").then(({ data }) => {
        if (data) setVotos((v) => ({ ...v, ...data }));
      }).catch(() => {});
    }
  }, [supabase]);
  const votar = (pid, opcion) => {
    if (miVoto[pid] != null) return;
    setVotos((prev) => {
      const p = { ...(prev[pid] || {}) };
      p[opcion] = (p[opcion] || 0) + 1;
      const nuevos = { ...prev, [pid]: p };
      const nuevoMi = { ...miVoto, [pid]: opcion };
      try { localStorage.setItem(CLAVE, JSON.stringify({ votos: nuevos, miVoto: nuevoMi })); } catch (e) {}
      return nuevos;
    });
    setMiVoto((m) => ({ ...m, [pid]: opcion }));
    const sb = supabase || (typeof window !== "undefined" && window.__yamacoaSupabase);
    if (sb && sb.rpc) sb.rpc("coraje_dividido_votar", { p_pregunta: pid, p_opcion: opcion }).catch(() => {});
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
      {datos.preguntas.map((q) => {
        const conteo = votos[q.id] || {};
        const total = Object.values(conteo).reduce((a, b) => a + b, 0);
        const votado = miVoto[q.id] != null;
        return (
          <div key={q.id} style={{ background: T.panel, border: `1px solid ${T.linea}`, borderRadius: 10, padding: "14px 16px" }}>
            <p style={{ fontFamily: T.serif, color: T.crema, fontSize: 15, margin: "0 0 12px", lineHeight: 1.5 }}>{q.pregunta}</p>
            {q.opciones.map((op) => {
              const n = conteo[op] || 0;
              const pct = total ? Math.round((n / total) * 100) : 0;
              const elegida = miVoto[q.id] === op;
              return (
                <button key={op} onClick={() => votar(q.id, op)} disabled={votado}
                  style={{
                    display: "block", width: "100%", textAlign: "left", marginBottom: 8, position: "relative",
                    overflow: "hidden", background: T.panelSuave, color: T.crema, borderRadius: 6,
                    border: `1px solid ${elegida ? T.isla : T.linea}`, padding: 0,
                    cursor: votado ? "default" : "pointer", fontFamily: T.mono, fontSize: 12.5,
                  }}>
                  <span style={{ position: "absolute", inset: 0, width: votado ? `${pct}%` : 0, background: elegida ? "rgba(143,178,89,0.25)" : "rgba(124,132,150,0.18)", transition: "width .4s" }} />
                  <span style={{ position: "relative", display: "flex", justifyContent: "space-between", padding: "8px 10px" }}>
                    <span>{elegida ? "✓ " : ""}{op}</span>
                    {votado && <span>{pct}%</span>}
                  </span>
                </button>
              );
            })}
            <p style={{ fontFamily: T.mono, fontSize: 10.5, color: T.neutro, margin: "4px 0 0" }}>{total} voto{total === 1 ? "" : "s"}</p>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------
// Instantánea embebida (fallback de vista previa).
// En producción el fetch a /data/coraje_dividido.json SIEMPRE tiene
// prioridad: el dataset respira con el pipeline; esta copia solo evita
// un 404 fuera del sitio. Fecha de la instantánea: 2026-07-20 (v1.1.0).
// ---------------------------------------------------------------------
const DATOS_EMBEBIDOS = {"meta": {"slug": "coraje_dividido", "titulo": "Coraje dividido", "subtitulo": "El valor de un pueblo y la fragmentación de su exilio, medidos", "descripcion": "Cuba combina un rechazo al régimen que roza la unanimidad medible con una oposición que carece de estructura para canalizarlo. La mayor encuesta independiente realizada en la isla —coalición de más de veinte medios, 42.263 respuestas, del 24 de abril al 1 de mayo de 2026, no probabilística— registró más del 94% de insatisfacción con el sistema político. En junio de 2026 el Observatorio Cubano de Conflictos documentó 107 protestas presenciales, récord absoluto de la serie (+38,2% interanual), y el 89% de quienes participaron no pertenecía a ninguna organización. Este expediente mide las dos mitades de esa paradoja: el valor, operacionalizado como protesta bajo coste represivo, y la desunión, operacionalizada mediante el Índice de Fragmentación del Exilio (IFE), una elaboración propia con metodología explícita. Cuba puntúa 8,8 sobre 10 en el IFE, más cerca del exilio iraní que de cualquier transición lograda. El contraste comparado —Polonia 1989, Chile 1988, Sudáfrica 1994, frente a Myanmar, Irán y Eritrea— señala la unidad del exilio como la variable que separa las transiciones logradas de las autocracias que persisten: todas las del cuadrante ganador compartieron mando único, financiación disciplinada y un puente operativo entre isla y exilio. En el lado del exilio, el 79% de los cubanoamericanos de Florida apoya una intervención militar (Bendixen & Amandi + Tarrance para Miami Herald, n=800, ±3,5), mientras el precedente del Concilio Cubano —más de 130 organizaciones agrupadas en 1995 y aplastadas en cuatro meses— marca el techo histórico de la coordinación interna. Los bloques contrafactuales son escenarios parametrizados, no predicciones.", "narracion": "Cuba reúne la combinación más extraña del catálogo comparado de resistencias civiles: un rechazo al régimen que roza la unanimidad y, al mismo tiempo, una oposición sin estructura que lo canalice. La mayor encuesta independiente jamás hecha en la isla, con cuarenta y dos mil doscientas sesenta y tres respuestas, registró más de un noventa y cuatro por ciento de insatisfacción con el sistema político. En junio de dos mil veintiséis, el Observatorio Cubano de Conflictos contó ciento siete protestas presenciales: récord absoluto de la serie, un treinta y ocho por ciento más que un año antes. Casi nueve de cada diez manifestantes no pertenecían a organización alguna. Este expediente mide las dos mitades de la paradoja. El valor, entendido como protesta bajo coste represivo. Y la desunión, medida con el Índice de Fragmentación del Exilio, una elaboración propia. Cuba puntúa ocho coma ocho sobre diez: más cerca del exilio iraní que de cualquier transición lograda. Polonia en mil novecientos ochenta y nueve, Chile en mil novecientos ochenta y ocho y Sudáfrica en mil novecientos noventa y cuatro compartieron mando único, financiación disciplinada y un puente operativo entre el interior y el exilio. El hallazgo incómodo: Cuba tiene el rechazo popular de la Polonia de mil novecientos ochenta y nueve con la estructura organizativa del exilio iraní. El coraje no está en déficit; está en dispersión. Lo que falta no es valor, sino cauce.", "edicion": "especial", "version": "1.1.0", "fecha_datos": "2026-07-20", "advertencia": "Los bloques marcados como contrafactuales son escenarios hipotéticos parametrizados, no predicciones. El Índice de Fragmentación del Exilio (IFE) es una elaboración propia con metodología explícita."}, "tesis": {"parrafos": ["Cuba presenta la combinación más extraña del catálogo comparado de resistencias civiles: el rechazo al régimen roza la unanimidad medible (más del 94% de insatisfacción en la mayor encuesta independiente jamás realizada, 42.263 respuestas) y, sin embargo, ninguna estructura convierte esa energía en presión coordinada. Este expediente mide las dos mitades de esa paradoja: el valor —operacionalizado como protesta bajo coste represivo— y la desunión —operacionalizada como fragmentación organizativa del exilio—.", "La tesis que sometemos a los datos no es que el pueblo cubano haya perdido la valentía. Es que el régimen y la historia construyeron una arquitectura donde la valentía individual es abundante pero carece de cauce: dentro, la atomización deliberada de todo tejido asociativo; fuera, un exilio con voluntad máxima y coordinación mínima. Los casos comparados (Polonia, Chile, Sudáfrica, Myanmar, Irán, Eritrea) muestran que esa segunda variable —la unidad del exilio— separa históricamente las transiciones logradas de las autocracias que persisten.", "El hallazgo incómodo: Cuba tiene el rechazo popular de la Polonia de 1989 con la estructura organizativa del exilio iraní. Y la evidencia de junio de 2026 —107 protestas presenciales, récord absoluto, todas espontáneas— confirma que el cuello de botella no está en el coraje de la calle sino en la ausencia de mando, dentro y fuera."]}, "cifras_clave": [{"valor": ">94%", "etiqueta": "de insatisfacción con el sistema político", "procedencia": "Encuesta de coalición de +20 medios independientes, 42.263 respuestas (24 abr–1 may 2026); no probabilística", "confianza": "confirmado", "lado": "isla"}, {"valor": "107", "etiqueta": "protestas presenciales en junio 2026, récord histórico", "procedencia": "Observatorio Cubano de Conflictos; +38,2% vs jun-2025; récord previo: 54 (mar-2026)", "confianza": "confirmado", "lado": "isla"}, {"valor": "79%", "etiqueta": "del exilio de Florida apoya intervención militar", "procedencia": "Miami Herald / Bendixen & Amandi + Tarrance, n=800, 6–10 abr 2026, ±3,5", "confianza": "confirmado", "lado": "exilio"}, {"valor": ">130", "etiqueta": "organizaciones agrupó Concilio Cubano en 1995, aplastado en 4 meses", "procedencia": "Registro histórico del Concilio Cubano (oct-1995 / feb-1996)", "confianza": "confirmado", "lado": "exilio"}, {"valor": "~385.000", "etiqueta": "manifestantes sostenidos exigiría el umbral del 3,5% de Chenoweth", "procedencia": "Regla del 3,5% (Chenoweth 2013, dataset NAVCO) aplicada a ~11M de habitantes", "confianza": "estimado", "lado": "isla"}], "paradoja": {"titulo": "La paradoja: voluntad máxima, coordinación mínima", "texto": "Cada punto es un caso histórico o vigente. El eje vertical mide la voluntad de cambio (rechazo al régimen o voto opositor verificado); el horizontal, la coordinación opositora (10 − IFE). Los casos que cruzaron a la democracia habitan el cuadrante superior derecho. Cuba flota sola arriba a la izquierda: toda la energía, ningún cauce.", "paises": [{"id": "cuba", "nombre": "Cuba 2026", "voluntad": 94, "coordinacion": 1.2, "resultado": "régimen persiste", "detalle": "Rechazo >94% (encuesta coalición); exilio atomizado en decenas de organizaciones rivales; protesta récord pero espontánea.", "confianza": "confirmado"}, {"id": "polonia", "nombre": "Polonia 1989", "voluntad": 88, "coordinacion": 8.0, "resultado": "transición", "detalle": "Solidarność: ~9,5-10M de afiliados (~30% de adultos). Exilio y Occidente canalizaron ~$33M (CIA ~$20M, NED ~$9M, AFL-CIO >$4M; Seth G. Jones, 2018).", "confianza": "confirmado"}, {"id": "chile", "nombre": "Chile 1988", "voluntad": 56, "coordinacion": 7.8, "resultado": "transición", "detalle": "Concertación: coalición unificada de casi toda la oposición. Voto No: 56% con 97,6% de participación. ~$1,5M de NED/NDI para registro y conteo paralelo.", "confianza": "confirmado"}, {"id": "sudafrica", "nombre": "Sudáfrica 1994", "voluntad": 80, "coordinacion": 8.4, "resultado": "transición", "detalle": "ANC: mando único de Oliver Tambo en el exilio (~1967-1991, Lusaka). Sanciones globales coordinadas (CAAA 1986). ANC: 62,65% en 1994.", "confianza": "confirmado"}, {"id": "myanmar", "nombre": "Myanmar (NUG) 2021-", "voluntad": 92, "coordinacion": 7.2, "resultado": "en disputa", "detalle": "Gobierno de unidad nacional en el exilio; ~92% de apoyo (USIP 2023); >$100M autofinanciados (bonos, lotería, cripto; ~45% vía bonos).", "confianza": "confirmado"}, {"id": "venezuela", "nombre": "Venezuela 2023-", "voluntad": 85, "coordinacion": 3.6, "resultado": "régimen persiste", "detalle": "Oposición fragmentada que logró una primaria unitaria (>2,4M votantes, 93% para Machado) pero sin estructura sostenida.", "confianza": "confirmado"}, {"id": "iran", "nombre": "Irán 2022-", "voluntad": 75, "coordinacion": 2.0, "resultado": "régimen persiste", "detalle": "Diáspora rica (6-8M) y con medios potentes, pero rota: monárquicos vs MEK vs republicanos. La Carta Mahsa colapsó en 2023. Espejo casi exacto del caso cubano.", "confianza": "estimado"}, {"id": "eritrea", "nombre": "Eritrea", "voluntad": 60, "coordinacion": 1.0, "resultado": "régimen persiste", "detalle": "Control negativo extremo: ~34 partidos opositores paralizados y una diáspora que FINANCIA al régimen vía impuesto del 2% (>30% del presupuesto estatal; Hirt, African Affairs 2015).", "confianza": "confirmado"}], "nota_metodologica": "«Voluntad» usa el mejor dato verificable de cada caso (encuestas, voto opositor real); donde no existe, estimación marcada. «Coordinación» = 10 − IFE (índice propio, ver sección siguiente)."}, "ife": {"titulo": "Índice de Fragmentación del Exilio (IFE)", "texto": "Índice propio 0–10 (mayor = más fragmentado), media simple de cinco componentes puntuados sobre evidencia documental. No pretende precisión decimal sino orden comparado; la metodología completa acompaña cada componente para que el lector la discuta.", "componentes": [{"id": "dispersion", "nombre": "Dispersión organizativa", "descripcion": "Número de organizaciones activas sin estructura común. Cuba: decenas (la sola Asamblea de la Resistencia agrupa +50 grupos que no integran a los demás bloques)."}, {"id": "paraguas", "nombre": "Fracaso de paraguas unitarios", "descripcion": "Intentos de unidad colapsados o efímeros: Concilio Cubano (>130 orgs, 1995, aplastado), Grupo de Trabajo, Alianza Nacional, Acuerdo de Liberación (2026, en prueba)."}, {"id": "divergencia", "nombre": "Divergencia táctica isla-exilio", "descripcion": "Brecha entre método preferido dentro (cautela, agotamiento) y fuera (79% pro-intervención en Florida). Documentada en encuesta de coalición y Miami Herald Poll."}, {"id": "dependencia", "nombre": "Dependencia financiera externa", "descripcion": "Fracción del andamiaje opositor sostenida por fondos gubernamentales de terceros (USAID/NED). El corte del 83% de 2025 liquidó programas enteros de un plumazo."}, {"id": "mando", "nombre": "Ausencia de mando único", "descripcion": "No existe figura o consejo con autoridad reconocida por la mayoría de los bloques ni dentro ni fuera («si tiras una piedra en Miami encuentras a varios que quieren ser presidentes» — R. Herrero)."}], "casos": [{"id": "cuba", "nombre": "Exilio cubano", "valores": [9, 9, 8, 9, 9], "ife": 8.8}, {"id": "eritrea", "nombre": "Diáspora eritrea", "valores": [9, 9, 8, 10, 9], "ife": 9.0}, {"id": "iran", "nombre": "Diáspora iraní", "valores": [9, 9, 7, 5, 10], "ife": 8.0}, {"id": "venezuela", "nombre": "Oposición venezolana", "valores": [7, 6, 6, 7, 6], "ife": 6.4}, {"id": "myanmar", "nombre": "NUG Myanmar", "valores": [3, 2, 3, 3, 3], "ife": 2.8}, {"id": "chile", "nombre": "Concertación (Chile)", "valores": [3, 2, 2, 3, 1], "ife": 2.2}, {"id": "polonia", "nombre": "Solidarność + exilio", "valores": [2, 2, 2, 3, 1], "ife": 2.0}, {"id": "sudafrica", "nombre": "ANC en el exilio", "valores": [1, 1, 2, 3, 1], "ife": 1.6}], "comparativa": {"texto": "El grafo ordena los cinco componentes según la cadena causal que la evidencia sugiere: la financiación por organización multiplica siglas; más siglas hacen inviable federar; cada sigla produce un aspirante; y sin árbitro, los métodos nunca convergen. Debajo, las dos curvas comparan exilio cubano y ANC con una medida compuesta que pondera cada puntuación por el número de unidades rivales implicadas (a más actores descoordinados en una variable, más pesa su fragmentación).", "formula": "compuesto = puntuación × (1 + log₁₀(unidades rivales)) — medida de elaboración propia; las unidades marcadas (est.) son estimaciones", "metricas": [{"id": "dependencia", "corto": "Dependencia", "componente": "Dependencia financiera externa", "cuba": {"puntuacion": 9, "unidades": 40, "etiqueta": "receptores de fondos descoordinados (est.)", "compuesto": 23.4}, "anc": {"puntuacion": 3, "unidades": 1, "etiqueta": "canal receptor único", "compuesto": 3.0}}, {"id": "dispersion", "corto": "Dispersión", "componente": "Dispersión organizativa", "cuba": {"puntuacion": 9, "unidades": 50, "etiqueta": "organizaciones catalogadas", "compuesto": 24.3}, "anc": {"puntuacion": 1, "unidades": 1, "etiqueta": "estructura única", "compuesto": 1.0}}, {"id": "paraguas", "corto": "Paraguas", "componente": "Fracaso de paraguas unitarios", "cuba": {"puntuacion": 9, "unidades": 4, "etiqueta": "paraguas intentados", "compuesto": 14.4}, "anc": {"puntuacion": 1, "unidades": 1, "etiqueta": "frente único sostenido", "compuesto": 1.0}}, {"id": "mando", "corto": "Mando", "componente": "Ausencia de mando único", "cuba": {"puntuacion": 9, "unidades": 10, "etiqueta": "liderazgos rivales visibles (est.)", "compuesto": 18.0}, "anc": {"puntuacion": 1, "unidades": 1, "etiqueta": "mando único (Tambo)", "compuesto": 1.0}}, {"id": "divergencia", "corto": "Divergencia", "componente": "Divergencia táctica isla-exilio", "cuba": {"puntuacion": 8, "unidades": 3, "etiqueta": "corrientes de método", "compuesto": 11.8}, "anc": {"puntuacion": 2, "unidades": 1, "etiqueta": "línea negociadora única", "compuesto": 2.0}}], "enlaces": [{"de": "dependencia", "a": "dispersion", "texto": "financiación por sigla multiplica siglas"}, {"de": "dispersion", "a": "paraguas", "texto": "a más actores, federar cuesta más"}, {"de": "dispersion", "a": "mando", "texto": "cada sigla produce un aspirante"}, {"de": "mando", "a": "divergencia", "texto": "sin árbitro, los métodos no convergen"}]}}, "constelacion": {"titulo": "La constelación de la fragmentación", "texto": "Cada punto es una organización opositora cubana documentada en registros históricos y actuales; los halos agrupan los paraguas unitarios que intentaron federarlas y la fecha en que colapsaron o quedaron en suspenso. A la derecha, la topología opuesta: el ANC sudafricano, un solo nodo con radios, que sostuvo mando único durante ~24 años de exilio. La forma de la red ES el dato.", "organizaciones": [{"nombre": "CANF", "decada": "1980s"}, {"nombre": "Directorio Democrático Cubano", "decada": "1990s"}, {"nombre": "Asamblea de la Resistencia", "decada": "2000s"}, {"nombre": "Cuba Decide", "decada": "2010s"}, {"nombre": "Pasos de Cambio", "decada": "2020s"}, {"nombre": "CTDC", "decada": "2020s"}, {"nombre": "UNPACU", "decada": "2010s"}, {"nombre": "Damas de Blanco", "decada": "2000s"}, {"nombre": "MCL (Mov. Cristiano Liberación)", "decada": "1980s"}, {"nombre": "Alpha 66", "decada": "1960s"}, {"nombre": "Cuba Study Group", "decada": "2000s"}, {"nombre": "D Frente", "decada": "2020s"}, {"nombre": "Mesa de Unidad de Acción Democrática", "decada": "2010s"}, {"nombre": "Consejo por la Libertad de Cuba", "decada": "2000s"}, {"nombre": "Mov. San Isidro (exiliados)", "decada": "2010s"}, {"nombre": "Archipiélago (exiliados)", "decada": "2020s"}, {"nombre": "Justicia 11J", "decada": "2020s"}, {"nombre": "Cubalex", "decada": "2010s"}, {"nombre": "FANTU", "decada": "2000s"}, {"nombre": "Partido por la Democracia P. L. Boitel", "decada": "1990s"}, {"nombre": "Corriente Agramontista", "decada": "1990s"}, {"nombre": "Coalición Central Opositora", "decada": "2010s"}, {"nombre": "Frente Nacional de Resistencia Cívica", "decada": "2000s"}, {"nombre": "Fund. p. los DDHH en Cuba", "decada": "1990s"}, {"nombre": "Inspira América", "decada": "2010s"}, {"nombre": "Foro Antitotalitario Unido", "decada": "2000s"}, {"nombre": "Solidaridad de Trabajadores Cubanos", "decada": "1990s"}, {"nombre": "Colegio de Pedagogos Indep.", "decada": "1990s"}, {"nombre": "Instituto La Rosa Blanca", "decada": "2000s"}, {"nombre": "Mov. Democracia", "decada": "1990s"}, {"nombre": "Madres y Mujeres Antirrepresión", "decada": "2010s"}, {"nombre": "Clandestinos", "decada": "2010s"}, {"nombre": "La Nueva Nación", "decada": "2010s"}, {"nombre": "Somos+", "decada": "2010s"}, {"nombre": "Cuba Independiente y Democrática", "decada": "1980s"}, {"nombre": "Partido Solidaridad Democrática", "decada": "1990s"}, {"nombre": "Unión Liberal Cubana", "decada": "1990s"}, {"nombre": "Plataforma Femenina", "decada": "2010s"}, {"nombre": "Consejo de Relatores de DDHH", "decada": "1990s"}, {"nombre": "CCDHRN", "decada": "1980s"}, {"nombre": "Observatorio Cubano de DDHH", "decada": "2000s"}, {"nombre": "Prisoners Defenders", "decada": "2010s"}, {"nombre": "Food Monitor Program", "decada": "2020s"}, {"nombre": "Cubanos por el Mundo", "decada": "2010s"}, {"nombre": "Fund. Cubana p. la Democracia", "decada": "1990s"}, {"nombre": "Junta Patriótica Cubana", "decada": "1960s"}, {"nombre": "Presidio Político Histórico", "decada": "1960s"}, {"nombre": "Mov. 30 de Noviembre", "decada": "1990s"}, {"nombre": "Vigilia Mambisa", "decada": "1990s"}, {"nombre": "Casa del Preso", "decada": "2010s"}], "paraguas": [{"nombre": "Concilio Cubano", "anio": "1995", "estado": "aplastado feb-1996", "orgs": ">130"}, {"nombre": "Grupo de Trabajo de la Disidencia Interna", "anio": "1997", "estado": "disuelto tras la Primavera Negra (2003)", "orgs": "4 líderes"}, {"nombre": "Asamblea de la Resistencia", "anio": "2010s", "estado": "activo, no integra a los demás bloques", "orgs": ">50"}, {"nombre": "Acuerdo de Liberación", "anio": "mar-2026", "estado": "en prueba; consejo de 51 miembros", "orgs": "Asamblea + Pasos de Cambio"}], "contraste_anc": "ANC (Sudáfrica): mando único de Oliver Tambo desde Lusaka, ~1967–1991. Una sola estructura recibió y administró todo el apoyo internacional, negoció con un solo rostro y entregó el poder a un solo partido (62,65% en 1994).", "nota_decadas": "Décadas de fundación aproximadas, asignadas por registro documental disperso: trátense como estimado, no como censo."}, "valor_medido": {"titulo": "El valor, medido: protesta bajo coste represivo", "texto": "Si la valentía se mide por la disposición a protestar sabiendo el precio, los cubanos de la isla la exhiben en niveles crecientes y récord. El Observatorio Cubano de Conflictos registró en junio de 2026 el mayor número de protestas presenciales de su serie: 107, casi el doble del récord previo (54, marzo 2026) y +38,2% sobre junio de 2025 — con 135 actos represivos y al menos 38 detenidos ese mismo mes. El coste es conocido por todos: por el 11J hubo ~1.580 procesados y condenas de hasta 30 años. Y el dato que desmonta la lectura de la apatía: el 89% de los presos del 11J que siguen recluidos no tenía vínculo previo con NINGUNA organización. La protesta cubana no es cobarde ni organizada: es valiente y huérfana.", "serie_protestas": [{"mes": "jul-2021", "protestas": 584, "nota": "11J: estallido nacional en ~50 localidades (registro agregado, metodología distinta)", "tipo": "estimado"}, {"mes": "dic-2023", "protestas": 26, "nota": "", "tipo": "confirmado"}, {"mes": "mar-2024", "protestas": 43, "nota": "Protestas de Santiago (17M)", "tipo": "confirmado"}, {"mes": "jun-2025", "protestas": 77, "nota": "", "tipo": "confirmado"}, {"mes": "oct-2025", "protestas": 49, "nota": "", "tipo": "confirmado"}, {"mes": "ene-2026", "protestas": 41, "nota": "", "tipo": "confirmado"}, {"mes": "mar-2026", "protestas": 54, "nota": "Récord previo de la serie", "tipo": "confirmado"}, {"mes": "jun-2026", "protestas": 107, "nota": "RÉCORD: apagones de 24-48h como detonante", "tipo": "confirmado"}], "nota_serie": "Serie no exhaustiva: puntos mensuales seleccionados con cifra pública verificable del OCC. El pipeline densificará la serie con cada informe mensual.", "coste": [{"indicador": "Procesados por el 11J", "valor": "~1.580", "fuente": "Justicia 11J / Cubalex", "confianza": "confirmado"}, {"indicador": "Condena máxima impuesta", "valor": "30 años", "fuente": "Justicia 11J", "confianza": "confirmado"}, {"indicador": "Presos del 11J sin afiliación previa", "valor": "89%", "fuente": "Justicia 11J, 'Otro año sin justicia' (2024)", "confianza": "confirmado"}, {"indicador": "Actos represivos solo en jun-2026", "valor": "135", "fuente": "OCC + Cubalex", "confianza": "confirmado"}]}, "isla_exilio": {"titulo": "Dos velocidades: isla y exilio ante el método", "texto": "Sobre el diagnóstico no hay dos Cubas: el rechazo al sistema supera el 94% en ambas orillas y el 99% quiere eliminar el partido único. Y la publicación de mayo de 2026 estrechó también la brecha de MÉTODO que este expediente daba por mayor: en el agregado isla+exilio de la encuesta de coalición (58% de respuestas desde la isla), el 60,9% apoya una intervención militar directa de EE.UU. y el 64,9% el derrocamiento «por cualquier medio, incluida la vía armada», frente al 79% pro-intervención del exilio del sur de Florida. La divergencia persiste, pero es de grado, no de naturaleza: dentro pesan más la cautela operativa (20,7% prefiere transición negociada; solo 1,9% la reforma desde dentro) y el agotamiento, y apenas el 6% excluiría al exilio de la transición. La generación divide más que la geografía: el apoyo al embargo cae del 55% al 43% entre nacidos fuera de Cuba y al 47% entre menores de 40.", "divergencias": [{"tema": "Rechazo al sistema político", "isla": 94, "exilio": 96, "unidad": "%", "fuente": "Encuesta coalición 2026"}, {"tema": "Eliminar el partido único", "isla": 99, "exilio": 99, "unidad": "%", "fuente": "Encuesta coalición 2026"}, {"tema": "Apoyo a intervención militar de EE.UU.", "isla": 61, "exilio": 79, "unidad": "%", "fuente": "Coalición may-2026 / Miami Herald abr-2026", "nota": "El 61 es el agregado isla+exilio de la encuesta de coalición (60,9%; 58% de respuestas desde la isla; pregunta multi-respuesta), no un desglose insular puro; el 79 es solo exilio del sur de Florida."}, {"tema": "Derrocamiento por cualquier medio (incl. armada)", "isla": 65, "exilio": null, "unidad": "%", "fuente": "Encuesta coalición may-2026", "nota": "Agregado isla+exilio (64,9%); la coalición no publicó desglose por orilla."}, {"tema": "Rechazo a acuerdo sin cambio de régimen", "isla": null, "exilio": 78, "unidad": "%", "fuente": "Miami Herald Poll abr-2026"}, {"tema": "Aceptaría al exilio en igualdad en la transición", "isla": 54, "exilio": null, "unidad": "%", "fuente": "Encuesta coalición 2026"}, {"tema": "Daría al exilio rol protagónico", "isla": 25, "exilio": null, "unidad": "%", "fuente": "Encuesta coalición 2026"}, {"tema": "Excluiría al exilio", "isla": 6, "exilio": null, "unidad": "%", "fuente": "Encuesta coalición 2026"}], "embargo_generacional": [{"grupo": "Total cubanoamericanos", "apoyo": 55}, {"grupo": "Republicanos", "apoyo": 65}, {"grupo": "Menores de 40 años", "apoyo": 47}, {"grupo": "Nacidos fuera de Cuba", "apoyo": 43}, {"grupo": "Demócratas", "apoyo": 25}], "fuente_embargo": "FIU Cuba Poll 2024 (n=1.001; 25 sep–9 oct 2024; serie desde 1991)", "cobertura_internacional": [{"fuente": "Polymarket", "tipo": "mercado de predicción", "dato": "~35%", "detalle": "Probabilidad implícita de que «el régimen cubano caiga en 2026» (mercado 'Cuban regime falls in 2026?'); abrió en ~28% en marzo. Volumen ~$126k: mercado fino, precio volátil.", "fecha": "abr-2026", "url": "https://polymarket.com/event/cuban-regime-falls-in-2026", "confianza": "reportado"}, {"fuente": "Polymarket", "tipo": "mercado de predicción", "dato": "~61%", "detalle": "Probabilidad implícita de que Díaz-Canel deje el poder antes del 31-dic-2026 (serie 'out as leader of Cuba'); el tramo 'antes del 30 de junio' cotizó ~42% en marzo.", "fecha": "jun-2026", "url": "https://polymarket.com/event/miguel-daz-canel-out-as-leader-of-cuba-by-june-30", "confianza": "reportado"}, {"fuente": "Polymarket (vía CiberCuba)", "tipo": "mercado de predicción", "dato": "~44%", "detalle": "Probabilidad implícita de un choque militar EE.UU.–Cuba en 2026, según el repaso de mercados publicado en marzo.", "fecha": "mar-2026", "url": "https://en.cibercuba.com/noticias/2026-03-11-u1-e13-s27061-nid322825-apuestas-internet-ponen-precio-caida-regimen-cubano-2026", "confianza": "reportado"}, {"fuente": "AP · sindicada (USA Today, AOL, prensa regional)", "tipo": "cobertura", "dato": "79%", "detalle": "La agencia AP distribuyó el sondeo Miami Herald/Bendixen & Amandi ('Cuban Americans support US military attack on Cuba'), llevando el dato del exilio a cabeceras generalistas.", "fecha": "abr-2026", "url": "https://kdhnews.com/news/ap/cuban-americans-support-us-military-attack-on-cuba-reject-economic-deal-poll-shows/article_074bf0c0-6395-5ab0-8084-7ee04eca4f72.html", "confianza": "confirmado"}, {"fuente": "encuestascuba.net (coalición +20 medios)", "tipo": "encuesta", "dato": "60,9%", "detalle": "Apoyo a intervención militar directa en el agregado isla+exilio (42.263 respuestas; 64,9% por el derrocamiento «por cualquier medio»). Autoselección: no probabilística.", "fecha": "may-2026", "url": "https://www.cibercuba.com/noticias/2026-05-08-u1-e135253-s27061-nid328496-mayoria-cubanos-apoya-intervencion-militar-eeuu", "confianza": "confirmado"}, {"fuente": "El País", "tipo": "cobertura", "dato": "+50 grupos", "detalle": "Reportaje sobre las disputas de liderazgo del exilio ante una posible transición («si tiras una piedra en Miami encuentras a varios que quieren ser presidentes»).", "fecha": "abr-2026", "url": "https://elpais.com/us/2026-04-06/la-expectativa-de-una-transicion-en-cuba-agita-las-disputas-por-el-liderazgo-en-el-exilio.html", "confianza": "confirmado"}]}, "genero": {"titulo": "El género del coraje", "texto": "Las mujeres cubanas cargan una parte desproporcionada de la protesta sostenida: las Damas de Blanco marcharon semanalmente durante más de una década bajo actos de repudio, y tras el 11J las madres de los presos se convirtieron en el rostro de la denuncia. En cifras: ~15% de los detenidos del 11J fueron mujeres (218 de ~1.484 según Cubalex; 314 detenidas por motivos políticos desde el 11J según 14ymedio), con picos de 74-76 presas políticas simultáneas y condenas emblemáticas de 14-15 años. El contraste comparado sugiere que donde la protesta femenina alcanza masa crítica —Sudán 2019, Irán 2022, Bielorrusia 2020— el movimiento gana persistencia; en Cuba esa masa existe pero, como todo lo demás, sin estructura que la multiplique.", "participacion": [{"caso": "Sudán 2019", "pct_mujeres": 70, "confianza": "estimado", "nota": "«Hasta el 70% de los manifestantes» (CNN, may-2019); metodología imprecisa según fuentes académicas"}, {"caso": "Bielorrusia 2020", "pct_mujeres": 50, "confianza": "estimado", "nota": "Marchas de mujeres como columna vertebral del movimiento; sin censo formal"}, {"caso": "Irán 2022", "pct_mujeres": 50, "confianza": "estimado", "nota": "Movimiento LIDERADO por mujeres (Mujer, Vida, Libertad); participación mixta"}, {"caso": "Cuba 11J (detenidos)", "pct_mujeres": 15, "confianza": "confirmado", "nota": "218 mujeres de ~1.484 detenciones documentadas (Cubalex/Justicia 11J)"}], "casos_emblema": [{"nombre": "Lizandra Góngora", "condena": "14 años", "detalle": "Madre de cinco hijos; manifestante pacífica del 11J"}, {"nombre": "Brenda Díaz", "condena": "14 años", "detalle": "Mujer trans recluida en penal masculino; VIH+"}, {"nombre": "Mariuska Díaz Calvo", "condena": "15 años", "detalle": "Condenada por sedición tras el 11J"}]}, "financiacion": {"titulo": "2025: el año en que se cortó el andamiaje", "texto": "La dependencia financiera del ecosistema opositor y mediático cubano quedó expuesta el 10 de marzo de 2025, cuando el secretario de Estado Marco Rubio anunció la cancelación del 83% de los programas de USAID (5.200 contratos). El efecto fue inmediato y asimétrico: de los 95 programas del International Republican Institute para Cuba, Venezuela y Nicaragua sobrevivieron 4 — ninguno cubano. Radio y TV Martí dejaron de emitir por primera vez en 40 años (emisión luego parcialmente restituida). El contrafactual birmano muestra la alternativa que el exilio cubano no ha construido: el NUG se autofinancia con más de $100M de su propia diáspora.", "partidas": [{"concepto": "Programas USAID cancelados (global)", "valor": "83%", "detalle": "5.200 contratos; anuncio de M. Rubio, 10-mar-2025", "confianza": "confirmado"}, {"concepto": "Programas IRI Cuba/Ven/Nic supervivientes", "valor": "4 de 95", "detalle": "Ninguno cubano (El Nuevo Herald / 14ymedio)", "confianza": "confirmado"}, {"concepto": "Subvención USAID perdida por CubaNet", "valor": "$1,8M / 3 años", "detalle": "Editorial de emergencia del medio", "confianza": "confirmado"}, {"concepto": "Fondos USAID a Diario de Cuba (2016-2020)", "valor": "$1,3M", "detalle": "Registros públicos", "confianza": "confirmado"}, {"concepto": "Fondos retenidos al NED (demanda judicial)", "valor": "$167M", "detalle": "NED vs Ejecutivo, 2025", "confianza": "confirmado"}, {"concepto": "Autofinanciación del NUG birmano (contraste)", "valor": ">$100M", "detalle": "Bonos de la 'Spring Revolution' (~45%), lotería, cripto", "confianza": "confirmado"}]}, "contrafactuales": {"titulo": "Contrafactuales: cuatro Cubas que no existen (todavía)", "advertencia": "Escenarios hipotéticos parametrizados. Los supuestos están a la vista y el lector puede manipularlos; nada de esto es una predicción.", "cf1_chenoweth": {"titulo": "CF-1 · La distancia al 3,5%", "texto": "La regla del 3,5% (Chenoweth, 2013; dataset NAVCO: 323 campañas 1900-2006, 53% de éxito no violento vs 26% violento) sitúa el umbral histórico de participación sostenida a partir del cual ninguna campaña no violenta documentada ha fracasado. Para Cuba (~11M): ~385.000 personas. El simulador estima cuántas personas moviliza hoy la protesta espontánea y qué multiplicador de coordinación exigiría cruzar el umbral. Supuesto manipulable: participantes medios por protesta.", "poblacion": 11000000, "umbral_pct": 3.5, "protestas_mes_actual": 107, "participantes_por_protesta_defecto": 150, "participantes_min": 30, "participantes_max": 2000}, "cf2_mando_unico": {"titulo": "CF-2 · Cuba con un ANC", "texto": "Si el exilio cubano hubiera consolidado un mando único tipo ANC/Concertación en 2021 (tras el 11J), la trayectoria proyectada del IFE habría descendido hacia la zona donde históricamente ocurren las transiciones (IFE < 3). La curva real, con el Acuerdo de Liberación de 2026 como único movimiento, apenas se dobla. Proyección ilustrativa: la velocidad de consolidación copia la del NUG birmano (2021-2023).", "serie": [{"anio": 2021, "real": 8.9, "hipotetico": 8.9}, {"anio": 2022, "real": 8.9, "hipotetico": 7.2}, {"anio": 2023, "real": 8.8, "hipotetico": 5.1}, {"anio": 2024, "real": 8.8, "hipotetico": 3.8}, {"anio": 2025, "real": 8.9, "hipotetico": 3.1}, {"anio": 2026, "real": 8.8, "hipotetico": 2.8}]}, "cf3_autofinanciacion": {"titulo": "CF-3 · La diáspora como tesoro propio", "texto": "~2,4M de personas de origen cubano viven en EE.UU. Si una fracción aportara una cuota mensual modesta a un fondo unitario auditado (modelo NUG), la oposición dejaría de depender de decisiones presupuestarias de Washington. El simulador cruza fracción contribuyente × cuota mensual y lo compara con lo que el corte de 2025 destruyó.", "diaspora": 2400000, "fraccion_defecto": 5, "cuota_defecto": 10}, "cf4_textuales": [{"id": "espejo_irani", "titulo": "CF-4a · El espejo iraní", "texto": "Irán es el contrafactual involuntario del exilio cubano: diáspora numerosa y próspera, medios propios potentes, rechazo interno masivo… y parálisis por la guerra entre monárquicos, MEK y republicanos. La Carta Mahsa (2023) —su 'Acuerdo de Liberación'— colapsó en semanas. Toda la evidencia disponible indica que la riqueza y el tamaño de una diáspora no compensan la ausencia de mando: lo agravan, porque multiplican los pretendientes."}, {"id": "control_eritrea", "titulo": "CF-4b · El control negativo: Eritrea", "texto": "El extremo de la escala: una diáspora que no solo no derriba al régimen sino que lo FINANCIA (impuesto del 2% a la diáspora, >30% del presupuesto estatal según Hirt, 2015). Sirve de ancla del índice: ningún grado de descontento interno compensa una diáspora capturada. Cuba no está ahí —su exilio es opositor—, pero el caso demuestra que la variable diaspórica puede llegar a cambiar de signo."}]}, "encuesta": {"titulo": "Tu voto en el expediente", "nota": "Voto anónimo. Se almacena localmente y, si el sitio lo permite, se agrega de forma global.", "preguntas": [{"id": "cuello", "pregunta": "¿Dónde está el cuello de botella del cambio en Cuba?", "opciones": ["En la represión interna", "En la desunión del exilio", "En ambas por igual", "En la falta de apoyo internacional"]}, {"id": "mando", "pregunta": "¿Aceptarías un mando único de la oposición aunque no fuera tu corriente preferida?", "opciones": ["Sí, la unidad es lo primero", "Solo si surge de una votación abierta", "No, prefiero pluralidad de liderazgos"]}, {"id": "cuota", "pregunta": "¿Contribuirías a un fondo unitario auditado de la diáspora?", "opciones": ["Sí, con cuota mensual", "Sí, puntualmente", "Solo si existe mando único primero", "No"]}]}, "referencias": [{"id": 1, "titulo": "Resultados de la primera encuesta de opinión a gran escala sobre Cuba", "fuente": "elTOQUE + coalición de medios, may-2026", "url": "https://eltoque.com/resultados-de-la-primera-encuesta-de-opinion-a-gran-escala-sobre-cuba", "confianza": "confirmado"}, {"id": 2, "titulo": "Cuban Americans support US military attack on Cuba, reject economic deal, poll shows", "fuente": "Miami Herald / AP (Bendixen & Amandi + Tarrance), abr-2026", "url": "https://kdhnews.com/news/ap/cuban-americans-support-us-military-attack-on-cuba-reject-economic-deal-poll-shows/article_074bf0c0-6395-5ab0-8084-7ee04eca4f72.html", "confianza": "confirmado"}, {"id": 3, "titulo": "The 2024 FIU Cuba Poll", "fuente": "Florida International University (Grenier & Lai)", "url": "https://ics.fiu.edu/research/fiu-cuba-poll/the-2024-fiu-cuba-poll-report-final.pdf", "confianza": "confirmado"}, {"id": 4, "titulo": "Cuba registró un récord histórico de protestas en junio: 107 manifestaciones", "fuente": "Infobae / OCC, jul-2026", "url": "https://www.infobae.com/america/america-latina/2026/07/03/cuba-registro-un-record-historico-de-protestas-en-junio-hubo-107-manifestaciones-en-todo-el-pais/", "confianza": "confirmado"}, {"id": 5, "titulo": "La expectativa de una transición en Cuba agita las disputas por el liderazgo en el exilio", "fuente": "El País, 6-abr-2026 (reproducción verificada)", "url": "https://elpais.com/us/2026-04-06/la-expectativa-de-una-transicion-en-cuba-agita-las-disputas-por-el-liderazgo-en-el-exilio.html", "confianza": "confirmado"}, {"id": 6, "titulo": "Las detenidas, las enjuiciadas, las condenadas del 11J", "fuente": "Periodismo de Barrio / Justicia 11J, mar-2024", "url": "https://periodismodebarrio.org/2024/03/las-detenidas-las-enjuiciadas-las-condenadas-del-11j/", "confianza": "confirmado"}, {"id": 7, "titulo": "De las 314 mujeres detenidas en Cuba por motivos políticos desde el 11J, 56 siguen en la cárcel", "fuente": "14ymedio", "url": "https://www.14ymedio.com/cuba/314-mujeres-detenidas-cuba-motivos_1_1100719.html", "confianza": "confirmado"}, {"id": 8, "titulo": "Anuncio de cancelación del 83% de los programas de USAID", "fuente": "Marco Rubio (X), 10-mar-2025", "url": "https://x.com/marcorubio/status/1899021361797816325", "confianza": "confirmado"}, {"id": 9, "titulo": "Only Four Venezuelan Entities, and No Cuban, Survive Trump's Cuts", "fuente": "14ymedio / Translating Cuba, 2025", "url": "https://translatingcuba.com/only-four-venezuelan-entities-and-no-cuban-survive-trumps-cuts/", "confianza": "confirmado"}, {"id": 10, "titulo": "A Covert Action: Reagan, the CIA, and the Cold War Struggle in Poland", "fuente": "Seth G. Jones, W.W. Norton, 2018", "url": "https://lawliberty.org/helping-the-poles-throw-off-moscows-yoke-a-conversation-with-seth-g-jones/", "confianza": "confirmado"}, {"id": 11, "titulo": "Myanmar opposition drive to crimp junta revenue is far from quixotic", "fuente": "Radio Free Asia, oct-2023", "url": "https://www.rfa.org/english/commentaries/myanmar-nug-revenue-10222023084657.html", "confianza": "confirmado"}, {"id": 12, "titulo": "The 2% Tax for Eritreans in the diaspora", "fuente": "Nicole Hirt, African Affairs, ene-2015", "url": "https://academic.oup.com/afraf/article/114/454/115/2195212", "confianza": "confirmado"}, {"id": 13, "titulo": "Why Civil Resistance Works / regla del 3,5%", "fuente": "Chenoweth & Stephan, Columbia UP 2011; Chenoweth 2013 (NAVCO)", "url": "https://en.wikipedia.org/wiki/3.5%25_rule", "confianza": "confirmado"}, {"id": 14, "titulo": "The Women's Revolution: Female Activism in Sudan", "fuente": "Harvard International Review", "url": "https://hir.harvard.edu/the-womens-revolution-female-activism-in-sudan/", "confianza": "estimado"}, {"id": 15, "titulo": "Concilio Cubano (registro histórico)", "fuente": "Refworld / USCIS", "url": "https://www.refworld.org/reference/countryrep/uscis/1998/en/77974", "confianza": "confirmado"}, {"id": 16, "titulo": "Chile's 1988 Plebiscite and the End of Pinochet's Dictatorship", "fuente": "ADST", "url": "https://adst.org/2014/11/chiles-1988-plebiscite-and-the-end-of-pinochets-dictatorship/", "confianza": "confirmado"}, {"id": 17, "titulo": "Cuban regime falls in 2026? (mercado de predicción)", "fuente": "Polymarket", "url": "https://polymarket.com/event/cuban-regime-falls-in-2026", "confianza": "reportado"}, {"id": 18, "titulo": "Mayoría de cubanos apoya intervención militar de EE.UU. y derrocamiento del régimen (encuesta coalición: 60,9% / 64,9%)", "fuente": "CiberCuba / encuestascuba.net, 7-may-2026", "url": "https://www.cibercuba.com/noticias/2026-05-08-u1-e135253-s27061-nid328496-mayoria-cubanos-apoya-intervencion-militar-eeuu", "confianza": "confirmado"}], "conclusion": {"titulo": "Lectura final", "parrafos": ["El coraje cubano no está en déficit: está en dispersión. Junio de 2026 lo demostró con el récord de la serie del OCC, protagonizado por gente que en un 89% no pertenece a organización alguna. Lo que falta no es valor sino cauce, y el cauce es precisamente lo que el exilio —la única parte de la nación que puede organizarse sin ir presa— no ha construido en 65 años: el IFE cubano (8,8) está más cerca del espejo iraní que de cualquier transición lograda.", "La historia comparada es tozuda: ninguna dictadura del catálogo cayó ante una oposición con este nivel de fragmentación, y todas las transiciones del cuadrante ganador compartieron mando único, financiación disciplinada y un puente operativo isla-exilio. Los tres simuladores de este expediente muestran que ninguna de esas tres condiciones es materialmente imposible para Cuba; todas son decisiones pendientes.", "Este expediente se actualizará con cada informe mensual del OCC y con cada movimiento del mapa organizativo del exilio. Si el Acuerdo de Liberación de 2026 sobrevive a su primer año, será la primera curva descendente del IFE en la historia de la serie. Ese, y no otro, es el número a vigilar."]}};

// =====================================================================
// Página
// =====================================================================
export default function CorajeDividido({ data, datosUrl = "/data/coraje_dividido.json", supabase }) {
  const [datos, setDatos] = useState(data || null);
  const [instantanea, setInstantanea] = useState(false);

  useEffect(() => {
    if (data) { setDatos(data); return; }
    let vivo = true;
    const rutas = [...new Set([datosUrl, "/data/coraje_dividido.json"])];
    (async () => {
      for (const ruta of rutas) {
        try {
          const r = await fetch(ruta);
          if (!r.ok) throw new Error(String(r.status));
          const d = await r.json();
          if (vivo) { setDatos(d); setInstantanea(false); }
          return;
        } catch (e) { /* siguiente ruta */ }
      }
      if (vivo) { setDatos(DATOS_EMBEBIDOS); setInstantanea(true); }
    })();
    return () => { vivo = false; };
  }, [data, datosUrl]);

  if (!datos) {
    return (
      <div style={{ background: T.fondo, minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <span style={{ fontFamily: T.mono, color: T.neutro }}>cargando expediente…</span>
      </div>
    );
  }

  return (
    <div style={{ background: T.fondo, minHeight: "100vh", color: T.crema }}>
      <Cinta />
      <main style={{ maxWidth: 980, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* HERO */}
        <header style={{ padding: "56px 0 12px" }}>
          <p style={{ fontFamily: T.mono, fontSize: 12, letterSpacing: 4, color: T.neutro, textTransform: "uppercase", margin: "0 0 18px" }}>
            Yamacoa · {datos.meta.subtitulo}
          </p>
          <div style={{ display: "flex", alignItems: "stretch", gap: "clamp(8px,2vw,22px)", flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: T.display, fontSize: "clamp(38px,8vw,84px)", color: T.isla, margin: 0, lineHeight: 0.95 }}>CORAJE</h1>
            <Grieta />
            <h1 style={{ fontFamily: T.display, fontSize: "clamp(38px,8vw,84px)", color: T.exilio, margin: 0, lineHeight: 0.95 }}>DIVIDIDO</h1>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12, marginTop: 34 }}>
            {datos.cifras_clave.map((c) => (
              <div key={c.etiqueta} style={{
                background: T.panel, borderRadius: 10, padding: "14px 16px",
                border: `1px solid ${T.linea}`, borderTop: `3px solid ${c.lado === "isla" ? T.isla : T.exilio}`,
                display: "flex", flexDirection: "column",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: T.display, fontSize: 30, color: c.lado === "isla" ? T.isla : T.exilio }}>{c.valor}</span>
                  <ChipConfianza nivel={c.confianza} />
                </div>
                <div style={{ fontFamily: T.serif, fontSize: 14, color: T.crema, margin: "6px 0 10px", lineHeight: 1.45 }}>{c.etiqueta}</div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.neutro, marginTop: "auto", borderTop: `1px solid ${T.linea}`, paddingTop: 8, lineHeight: 1.5 }}>
                  <b>Procedencia:</b> {c.procedencia}
                </div>
              </div>
            ))}
          </div>
        </header>

        <section style={{ margin: "44px 0" }}>
          {datos.tesis.parrafos.map((p, i) => <Prosa key={i} texto={p} />)}
        </section>

        <Seccion num="01" titulo={datos.paradoja.titulo}>
          <Prosa texto={datos.paradoja.texto} />
          <Cuadrante datos={datos.paradoja} />
        </Seccion>

        <Seccion num="02" titulo={datos.constelacion.titulo}>
          <Prosa texto={datos.constelacion.texto} />
          <Constelacion datos={datos.constelacion} />
          <p style={{ fontFamily: T.serif, fontSize: 14.5, color: T.cremaSuave, lineHeight: 1.65, marginTop: 14, borderLeft: `3px solid ${T.isla}`, paddingLeft: 14 }}>{datos.constelacion.contraste_anc}</p>
        </Seccion>

        <Seccion num="03" titulo={datos.ife.titulo}>
          <Prosa texto={datos.ife.texto} />
          <MatrizIFE datos={datos.ife} />
        </Seccion>

        <Seccion num="04" titulo={datos.valor_medido.titulo}>
          <Prosa texto={datos.valor_medido.texto} />
          <SerieProtestas datos={datos.valor_medido} />
        </Seccion>

        <Seccion num="05" titulo={datos.isla_exilio.titulo}>
          <Prosa texto={datos.isla_exilio.texto} />
          <DivergenciasIslaExilio datos={datos.isla_exilio} />
        </Seccion>

        <Seccion num="06" titulo={datos.genero.titulo}>
          <Prosa texto={datos.genero.texto} />
          <Genero datos={datos.genero} />
        </Seccion>

        <Seccion num="07" titulo={datos.financiacion.titulo}>
          <Prosa texto={datos.financiacion.texto} />
          <Financiacion datos={datos.financiacion} />
        </Seccion>

        <Seccion num="08" titulo={datos.contrafactuales.titulo} contrafactual>
          <p style={{ fontFamily: T.mono, fontSize: 12, color: T.ambarCF, margin: "0 0 16px" }}>{datos.contrafactuales.advertencia}</p>
          <CF1Chenoweth cf={datos.contrafactuales.cf1_chenoweth} />
          <CF2Mando cf={datos.contrafactuales.cf2_mando_unico} />
          <CF3Fondo cf={datos.contrafactuales.cf3_autofinanciacion} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {datos.contrafactuales.cf4_textuales.map((c) => (
              <div key={c.id} style={{ background: T.panel, border: `1px solid ${T.linea}`, borderRadius: 10, padding: "14px 16px" }}>
                <h3 style={{ fontFamily: T.display, color: T.crema, fontSize: 15, margin: "0 0 8px" }}>{c.titulo}</h3>
                <p style={{ fontFamily: T.serif, fontSize: 14, color: T.cremaSuave, lineHeight: 1.65, margin: 0 }}>{c.texto}</p>
              </div>
            ))}
          </div>
        </Seccion>

        <Seccion num="09" titulo={datos.encuesta.titulo}>
          <p style={{ fontFamily: T.mono, fontSize: 11.5, color: T.neutro, margin: "0 0 14px" }}>{datos.encuesta.nota}</p>
          <Encuesta datos={datos.encuesta} supabase={supabase} />
        </Seccion>

        <Seccion num="10" titulo="Referencias">
          <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {datos.referencias.map((r) => (
              <li key={r.id} style={{ display: "flex", gap: 12, alignItems: "baseline", padding: "7px 0", borderBottom: `1px solid ${T.linea}` }}>
                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.isla }}>[{r.id}]</span>
                <span style={{ flex: 1 }}>
                  <a href={r.url} target="_blank" rel="noreferrer" style={{ fontFamily: T.serif, fontSize: 14.5, color: T.crema, textDecorationColor: T.neutro }}>{r.titulo}</a>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.neutro }}> — {r.fuente}</span>
                </span>
                <ChipConfianza nivel={r.confianza} />
              </li>
            ))}
          </ol>
        </Seccion>

        <Seccion num="11" titulo={datos.conclusion.titulo}>
          {datos.conclusion.parrafos.map((p, i) => <Prosa key={i} texto={p} />)}
        </Seccion>

        <footer style={{ marginTop: 60, paddingTop: 18, borderTop: `1px solid ${T.linea}`, fontFamily: T.mono, fontSize: 11, color: T.neutro, lineHeight: 1.7 }}>
          Yamacoa · Observatorio de derechos humanos y economía política de Cuba · Datos abiertos: coraje_dividido.json · Los niveles de confianza (confirmado / reportado / estimado) acompañan cada cifra · {datos.meta.advertencia}
          {instantanea && " · Vista previa con instantánea embebida (2026-07-20); en producción los datos se actualizan con cada ciclo del pipeline."}
        </footer>
      </main>
    </div>
  );
}
