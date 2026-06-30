import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

/* ──────────────────────────────────────────────────────────────────────────
   LA RUSIFICACIÓN DE CUBA — visor
   Los datos (nodos y vínculos) los genera yamacoa-pipeline y se sirven
   desde /data/rusificacion.json. Este componente es sólo el visor.
   RUSSIA_MAP y CASES son contenido editorial estático.
   ────────────────────────────────────────────────────────────────────────── */

const CLS = {
  regimen:    { name: "Cúpula del régimen",     color: "#C24545" },
  militar:    { name: "GAESA / mando militar",  color: "#8FA0A8" },
  estado:     { name: "Aparato estatal",        color: "#5E9C8E" },
  familia:    { name: "Familia del poder",      color: "#D4AE57" },
  testaferro: { name: "Testaferro / operador",  color: "#DB8A3A" },
  empresa:    { name: "Mipyme / sociedad",      color: "#C9B488" },
};

// Visual radius per class — presentation concern, not pipeline data.
const CLS_R = {
  regimen: 17, militar: 17, estado: 14,
  familia: 13, testaferro: 13, empresa: 12,
};

// Editorial seed data keyed by canonical slug (must match pipeline's entidades_canonicas slugs).
// Provides rich desc / tier / sources / short / r that pipeline materialize.rs leaves sparse.
// Pipeline is authoritative for cls and alleged; seeds fill everything else.
const SEED_NODES = [
  { id: "pcc",                      short: "PCC",              r: 23, cls: "regimen",
    tier: "Poder político",
    label: "Partido Comunista de Cuba",
    desc: "Vértice formal del poder. Dirige al Ejecutivo y mantiene control estratégico sobre GAESA y las FAR.",
    sources: ["Gaceta Oficial", "PCC.cu"] },

  { id: "miguel-diaz-canel",        short: "Díaz-Canel",      r: 20, cls: "regimen",
    tier: "Ejecutivo · Primer Secretario PCC",
    label: "Miguel Díaz-Canel",
    desc: "Presidente de la República y Primer Secretario del PCC. Mando nominal sobre el aparato de seguridad, aunque con influencia limitada frente a GAESA y Raúl Castro.",
    sources: ["Gaceta Oficial"] },

  { id: "manuel-marrero-cruz",       short: "Marrero",          r: 18, cls: "regimen",
    tier: "Primer Ministro",
    label: "Manuel Marrero Cruz",
    desc: "Primer Ministro. Gestiona la reestructuración ministerial y el presupuesto de las supercarteras.",
    sources: ["CiberCuba", "Gaceta Oficial"] },

  { id: "minint",                   short: "MININT",           r: 17, cls: "regimen",
    tier: "Seguridad del Estado",
    label: "Ministerio del Interior",
    desc: "Control de contrainteligencia, represión y 'propietarios nominales' en esquemas de testaferros.",
    sources: ["Martí Noticias"] },

  { id: "gaesa",                    short: "GAESA",            r: 25, cls: "militar",
    tier: "Conglomerado militar-financiero",
    label: "GAESA (Grupo de Administración Empresarial S.A.)",
    desc: "Controla entre 40-70% de la economía (turismo, remesas, tiendas en MLC, puertos, combustibles). Eje principal de la fuga de capitales y represión económica.",
    sources: ["NYT 2026", "Depto. Estado EE.UU.", "CiberCuba"] },

  { id: "ania-lastre-morera",       short: "Gral. A. Lastre",  r: 21, cls: "militar",
    tier: "Presidenta Ejecutiva GAESA",
    label: "Gral. Ania Guillermina Lastre Morera",
    desc: "Presidenta Ejecutiva de GAESA desde 2022. General de Brigada, diputada y miembro del Comité Central del PCC. Figura clave en el control militar de la economía.",
    sources: ["PCC.cu", "Martí Noticias 2026", "CiberCuba"] },

  { id: "el-cangrejo",              short: "R. G. Castro",     r: 21, cls: "familia",
    tier: "Heredero Castro · Influencia GAESA",
    label: "Raúl Guillermo Rodríguez Castro ('El Cangrejo')",
    desc: "Nieto de Raúl Castro. Figura emergente con fuerte influencia en GAESA y negociaciones externas. Mantiene control familiar sobre el conglomerado.",
    sources: ["NYT 2026", "Cubanet"] },

  // Same person, different slug from second fixture extraction — pipeline may create either
  { id: "raul-guillermo-rodriguez-castro", short: "R. G. Castro", r: 21, cls: "familia",
    tier: "Heredero Castro · Influencia GAESA",
    label: "Raúl Guillermo Rodríguez Castro ('El Cangrejo')",
    desc: "Nieto de Raúl Castro. Figura emergente con fuerte influencia en GAESA y negociaciones externas. Mantiene control familiar sobre el conglomerado.",
    sources: ["NYT 2026", "Cubanet"] },

  { id: "min-agroalimentacion",      short: "Agroalimentación", r: 16, cls: "estado",
    tier: "Supercartera (fusión)",
    label: "Min. de Agroalimentación",
    desc: "Fusión de Agricultura y Alimentaria. Controla tierras y concesiones agrícolas prioritarias.",
    sources: ["CiberCuba"] },

  { id: "min-economia-finanzas-planificacion", short: "Economía", r: 16, cls: "estado",
    tier: "Supercartera",
    label: "Min. de Economía, Finanzas y Planificación",
    desc: "Control absoluto sobre Sociedades Mercantiles Mixtas y selección de 'privados' beneficiados.",
    sources: ["Gaceta Oficial", "G. Negocios Cuba"] },

  { id: "min-comercio-inversion-extranjera", short: "Comercio", r: 16, cls: "estado",
    tier: "Supercartera",
    label: "Min. de Comercio e Inversión Extranjera",
    desc: "Otorga licencias de importación (incluyendo combustible) a empresas de la élite.",
    sources: ["Cubanet"] },

  { id: "zed-mariel",               short: "ZED Mariel",       r: 16, cls: "estado",
    tier: "Infraestructura estratégica",
    label: "Zona Especial de Desarrollo Mariel",
    desc: "Cartera de Oportunidades para concesiones de alta rentabilidad reservadas a la élite.",
    sources: ["ZED Mariel oficial"] },

  { id: "copmar",                   short: "COPMAR",           r: 15, cls: "estado",
    tier: "Entidad portuaria estatal",
    label: "COPMAR · Puerto del Mariel",
    desc: "Denuncias de desvío de combustible y fondos estatales hacia Mipymes seleccionadas.",
    sources: ["Denuncias COPMAR", "CiberCuba"] },

  { id: "lisa-titolo-castro",       short: "Lisa T. Castro",   r: 19, cls: "familia",
    tier: "Nieta de Raúl Castro · Mipyme VIP",
    label: "Lisa Titolo Castro",
    desc: "Hija de Mariela Castro. Propietaria de GAIA SRL (Gaia Mercado). Importa combustible, cemento y alimentos con privilegios. Red de farms, cárnicos y materiales de construcción.",
    sources: ["CubaNet 2026", "ADN América", "Arbol Invertido"] },

  { id: "adys-lastre-morera",       short: "Adys Lastre",      r: 16, cls: "testaferro",
    tier: "Hermana de la jefa de GAESA",
    label: "Adys Lastre Morera",
    desc: "Hermana de Ania Lastre. Arrestada en Florida (mayo 2026) por ICE. Operaba inmobiliarias vinculadas a blanqueo y fuga de capitales.",
    sources: ["Martí Noticias", "Telemundo 2026"] },

  { id: "anisa-fumero-lopez",        short: "Anisa Fumero",     r: 14, cls: "testaferro",
    tier: "Operadora comercial Mariel",
    label: "Anisa Fumero López",
    desc: "Directiva en sociedades mixtas del Mariel (astillero).",
    sources: ["ZED Mariel"] },

  { id: "enrique-perez-fumero",     short: "E. Pérez Fumero",  r: 13, cls: "testaferro",
    tier: "Beneficiario irregular",
    label: "Enrique Pérez Fumero",
    desc: "Pagos irregulares con fondos estatales (COPMAR).",
    sources: ["Denuncia COPMAR"] },

  { id: "gaia-srl",                 short: "GAIA SRL",         r: 17, cls: "empresa",
    tier: "Mipyme élite familiar",
    label: "GAIA SRL (Gaia Mercado)",
    desc: "Empresa de Lisa Titolo Castro. Contratos de importación de combustible (Caribe Import y CUPET), cemento desde EE.UU. y comercialización de alimentos premium.",
    sources: ["CubaNet 2026"] },

  { id: "holding-lisa-titolo-castro", short: "Holding Lisa",   r: 16, cls: "empresa",
    tier: "Sector privado privilegiado",
    label: "Holding Mipymes VIP (combustible y alimentos)",
    desc: "Conjunto de microempresas con acceso prioritario a insumos y energía, esquivando apagones.",
    sources: ["Cubanet"] },

  { id: "coral-maritima-sa",         short: "Coral Marítima",   r: 15, cls: "empresa",
    tier: "Sociedad mercantil mixta",
    label: "Coral Marítima S.A. (Mariel)",
    desc: "Concesión de varada y reparación naval en Mariel. VAN 2.893,1 M USD · TIR 24,1 %. Alta rentabilidad reservada.",
    sources: ["ZED Mariel"] },

  { id: "remas-remas-investment-llc", short: "Remás Invest.",  r: 14, cls: "empresa",
    tier: "Firma pantalla exterior",
    label: "Remás Remas Investment LLC (Florida)",
    desc: "Canal inmobiliario en Florida para fuga y blanqueo de capitales de GAESA.",
    sources: ["Medios independientes"] },

  { id: "santa-lena-investment-lc", short: "Santa Lena",       r: 13, cls: "empresa",
    tier: "Firma pantalla exterior",
    label: "Santa Lena Investment LC (Florida)",
    desc: "Segunda inmobiliaria vinculada a la red familiar Lastre.",
    sources: ["Medios independientes"] },
];

// Build lookup map for O(1) enrichment during pipeline data merge
const SEED_MAP = Object.fromEntries(SEED_NODES.map((s) => [s.id, s]));

const RUSSIA_MAP = [
  { ru: "Préstamos por acciones (loans-for-shares): privatizar activos del Estado a precio político.",
    cu: "Sociedades Mercantiles Mixtas (Decreto-Ley 114): el Estado fusiona su empresa con la Mipyme de un allegado." },
  { ru: "Siloviki: oficiales del KGB/FSB colocados al frente de los negocios.",
    cu: "Oficiales de las FAR y el MININT como 'propietarios nominales' de las firmas rentables." },
  { ru: "Oligarcas como familiares y allegados del Kremlin.",
    cu: "'Hijos y nietos del poder': parientes de la cúpula al frente de holdings 'privados'." },
  { ru: "Conglomerados estatal-militares (Rosneft, Gazprom) como caja del régimen.",
    cu: "GAESA: turismo, remesas y divisas bajo control militar opaco." },
  { ru: "Fuga a inmobiliario occidental ('Londongrad').",
    cu: "Inmobiliarias de Florida como destino de los capitales (caso Lastre Morera)." },
  { ru: "Acceso preferencial a crédito y divisa para los leales.",
    cu: "Asignación discrecional de divisas a tasas preferentes para las Mipymes de la élite." },
  { ru: "Un 'sector privado' de fachada que legitima al régimen.",
    cu: "Mipymes presentadas como sector independiente para abrir banca y evadir el embargo." },
  { ru: "Red de protección familiar: hijos, nietos y cónyuges del Kremlin capturan activos sin cargo formal.",
    cu: "Familia Castro-Rodríguez: GAESA, inteligencia, remesas y empresas en EE.UU. y España bajo la siguiente generación; cónyuges sancionados por OFAC en cadena en 2026." },
  { ru: "Negociaciones secretas con Occidente usadas como palanca para una apertura selectiva de negocios.",
    cu: "'El Cangrejo' como interlocutor con la CIA (mayo 2026), defendiendo un modelo de apertura que beneficia al clan, no al pueblo." },
];

const CASES = [
  { tag: "COMBUSTIBLE", title: "La red energética de la familia Castro",
    body: "Lisa Titolo Castro, nieta de Raúl Castro, administra un holding con cárnicos, fincas y materiales que recibió luz verde directa para importar combustible y asegurar el suministro de sus propios negocios mientras el país sufre apagones.",
    metric: "Licencia excepcional de importación", src: "Cubanet · El Español" },
  { tag: "MARIEL", title: "Desvío en el puerto: caso COPMAR",
    body: "Trabajadores denunciaron que camiones cargan combustible ilegalmente para Mipymes seleccionadas y que el dinero se saca de los libros estatales. La auditoría reveló pagos irregulares por 913.575,00 CUP a un particular por supuestos servicios de video.",
    metric: "913.575,00 CUP en pagos irregulares", src: "Denuncia interna COPMAR" },
  { tag: "FLORIDA", title: "Blanqueo inmobiliario: Lastre Morera",
    body: "Adys Lastre Morera, hermana de la jefa de GAESA, fue detenida en EE.UU. Operaba inmobiliarias en Florida (Remás Remas Investment, Santa Lena Investment) usadas para inyectar capital corporativo desviado.",
    metric: "Canal de fuga GAESA → EE.UU.", src: "La Silla Rota · medios independientes" },
  { tag: "ZED MARIEL", title: "Concesión blindada: Coral Marítima",
    body: "La Cartera de Oportunidades de la ZED Mariel asigna a una sociedad mixta el servicio de varada y reparación de embarcaciones, con rentabilidad excepcional garantizada y vedada al cubano común.",
    metric: "VAN 2.893,1 M USD · TIR 24,1 %", src: "ZED Mariel (doc. oficial)" },
  { tag: "MARCO LEGAL", title: "Decreto-Ley 114: la privatización a dedo",
    body: "Crea la Sociedad Mercantil Mixta, que permite fusionar la Mipyme de un testaferro con una empresa estatal o militar. El Ministerio de Economía decide cada operación, aislando por completo al emprendedor independiente real.",
    metric: "Control absoluto del Estado", src: "Gaceta Oficial · G. Negocios Cuba" },
  { tag: "SIGUIENTE GENERACIÓN", title: "El Cangrejo y Gran Azul LLC: la nueva élite capta divisas",
    body: "Raúl Guillermo Rodríguez Castro ('El Cangrejo'), nieto de Raúl Castro e hijo del exjefe de GAESA, actúa como interlocutor con la CIA (Ratcliffe, mayo 2026) mientras su entorno controla Gran Azul LLC (Nevada), empresa de remesas que capta divisas fuera del sistema bancario.",
    metric: "≥13 viajes a Panamá en 2024 · Gran Azul LLC (Nevada)", src: "CiberCuba · El Universo" },
  { tag: "MADRID", title: "Mansión y empresa europea del hijastro de Díaz-Canel",
    body: "Manuel Anido Cuesta, hijastro del Presidente e hijo de la sancionada Lis Cuesta, reside en una mansión de 3.175.000 € en Pozuelo de Alarcón (Madrid) y está vinculado a Green Leaf S.L., sociedad española usada como canal operativo en Europa.",
    metric: "Mansión 3.175.000 € · Pozuelo de Alarcón", src: "Cubanet · Martí Noticias" },
  { tag: "EO 14404", title: "La columna vertebral de GAESA bajo sanciones OFAC",
    body: "Desde la Orden Ejecutiva 14404 (1 mayo 2026), EEUU ha desmantelado financieramente al régimen: GAESA y Moa Nickel (mayo), CUPET (junio 11), BFI, Rafin S.A. y Almacenes Universales (23 junio). Las sanciones secundarias ya forzaron la retirada de Sherritt International y de varias cadenas hoteleras.",
    metric: "+240 sanciones desde enero 2026", src: "Depto. de Estado EE.UU. · CiberCuba" },
];

/* ── Force graph ─────────────────────────────────────────────────────────── */
function Graph({ nodesData, linksData, selected, setSelected, hovered, setHovered, dim }) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const zoomRef = useRef(null);
  const simNodesRef = useRef([]);
  const simLinksRef = useRef([]);
  const [, bump] = useState(0);
  const W = 960, H = 680;

  useEffect(() => {
    if (!nodesData || nodesData.length === 0) return;

    simNodesRef.current = nodesData.map((n) => ({ ...n }));
    simLinksRef.current = linksData.map((l) => ({ ...l, source: l.s, target: l.t }));

    const nodes = simNodesRef.current;
    const links = simLinksRef.current;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sim = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id)
        .distance((l) => (l.kind === "estructura" ? 90 : 105)).strength(0.6))
      .force("charge", d3.forceManyBody().strength(-480))
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collide", d3.forceCollide().radius((d) => d.r + 18).strength(0.85))
      .force("x", d3.forceX(W / 2).strength(0.08))
      .force("y", d3.forceY(H / 2).strength(0.09));

    if (reduce) {
      sim.stop();
      for (let i = 0; i < 260; i++) sim.tick();
      bump((v) => v + 1);
    } else {
      sim.on("tick", () => bump((v) => v + 1));
    }
    if (svgRef.current) svgRef.current.__sim = sim;
    return () => sim.stop();
  }, [nodesData, linksData]); // eslint-disable-line

  // d3-zoom applied once; transforms the inner <g> so simulation coords are untouched
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom()
      .scaleExtent([0.2, 4])
      .on("zoom", ({ transform }) => {
        d3.select(gRef.current).attr("transform", transform);
      });
    svg.call(zoom);
    zoomRef.current = zoom;
    return () => svg.on(".zoom", null);
  }, []); // eslint-disable-line

  const doZoom = (factor) => {
    d3.select(svgRef.current).transition().duration(220)
      .call(zoomRef.current.scaleBy, factor);
  };
  const resetZoom = () => {
    setSelected(null);
    setHovered(null);
    d3.select(svgRef.current).transition().duration(280)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  };

  const nodes = simNodesRef.current;
  const links = simLinksRef.current;

  const toLocal = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };

  const drag = (node) => (e) => {
    e.target.setPointerCapture?.(e.pointerId);
    const sim = svgRef.current.__sim;
    const move = (ev) => {
      const p = toLocal(ev);
      node.fx = p.x; node.fy = p.y;
      sim.alphaTarget(0.3).restart();
    };
    const up = (ev) => {
      node.fx = null; node.fy = null;
      sim.alphaTarget(0);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      e.target.releasePointerCapture?.(ev.pointerId);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const focus = hovered || selected;
  const neighbors = new Set();
  if (focus) {
    neighbors.add(focus);
    links.forEach((l) => {
      const s = l.source.id || l.source, t = l.target.id || l.target;
      if (s === focus) neighbors.add(t);
      if (t === focus) neighbors.add(s);
    });
  }
  const isLit = (id) => {
    if (dim.size && !dim.has(nodes.find((n) => n.id === id)?.cls)) return false;
    if (!focus) return true;
    return neighbors.has(id);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="net" role="img"
           aria-label="Mapa de relaciones de poder y capital en Cuba">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7"
                  markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="rgba(233,226,212,.45)" />
          </marker>
          <marker id="arrow-hot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7"
                  markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#D4AE57" />
          </marker>
        </defs>

        <g ref={gRef}>
          {links.map((l, i) => {
            const s = l.source, t = l.target;
            if (typeof s !== "object") return null;
            const sLit = isLit(s.id), tLit = isLit(t.id);
            const lit = sLit && tLit;
            const hot = focus && lit;
            const dx = t.x - s.x, dy = t.y - s.y, len = Math.hypot(dx, dy) || 1;
            const ex = t.x - (dx / len) * (t.r + 9), ey = t.y - (dy / len) * (t.r + 9);
            const mx = (s.x + ex) / 2, my = (s.y + ey) / 2;
            return (
              <g key={i} opacity={lit ? 1 : 0.12}>
                <line x1={s.x} y1={s.y} x2={ex} y2={ey}
                  stroke={hot ? "#D4AE57" : "rgba(233,226,212,.28)"}
                  strokeWidth={hot ? 1.8 : 1.1}
                  strokeDasharray={l.kind === "presunto" ? "5 4" : "none"}
                  markerEnd={hot ? "url(#arrow-hot)" : "url(#arrow)"} />
                {hot && (
                  <text x={mx} y={my - 3} className="edge-lbl" textAnchor="middle">{l.rel}</text>
                )}
              </g>
            );
          })}

          {nodes.map((n) => {
            const lit = isLit(n.id);
            const sel = selected === n.id;
            const c = (CLS[n.cls] ?? CLS.empresa).color;
            return (
              <g key={n.id} transform={`translate(${n.x ?? 0},${n.y ?? 0})`}
                 opacity={lit ? 1 : 0.16}
                 style={{ cursor: "pointer" }}
                 onPointerDown={drag(n)}
                 onClick={() => setSelected(sel ? null : n.id)}
                 onMouseEnter={() => setHovered(n.id)}
                 onMouseLeave={() => setHovered(null)}>
                {sel && <circle r={n.r + 9} className="ring" />}
                {n.alleged && <circle r={n.r + 4} fill="none" stroke={c} strokeOpacity=".35"
                                       strokeWidth="1" strokeDasharray="2 3" />}
                <circle r={n.r} fill="#16130F" stroke={c} strokeWidth={sel ? 2.4 : 1.6} />
                <circle r={n.r - 5} fill={c} fillOpacity={sel ? 0.28 : 0.16} />
                <text className="node-lbl" y={n.r + 13} textAnchor="middle">{n.short}</text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="zoom-ctrls">
        <button className="zoom-btn" onClick={() => doZoom(1.3)} title="Acercar">+</button>
        <button className="zoom-btn" onClick={() => doZoom(1 / 1.3)} title="Alejar">−</button>
        <button className="zoom-btn" onClick={resetZoom} title="Restablecer">⊙</button>
      </div>
    </div>
  );
}

/* ── App ─────────────────────────────────────────────────────────────────── */
export default function App() {
  const [tab, setTab] = useState("mapa");
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [dim, setDim] = useState(new Set());
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const id = "rc-fonts";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  // Load pipeline-generated graph data from public/data/rusificacion.json,
  // then enrich each node with curated editorial data from SEED_MAP (desc, tier, sources, short).
  // Pipeline is authoritative for cls and alleged; seeds fill everything else.
  useEffect(() => {
    fetch("/data/rusificacion.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const nodes = (data.nodes ?? []).map((n) => {
          const seed = SEED_MAP[n.id];
          return {
            ...n,
            r: seed?.r ?? CLS_R[n.cls] ?? 18,
            ...(seed ? {
              short: seed.short,
              tier: seed.tier,
              desc: seed.desc,
              sources: seed.sources,
            } : {}),
          };
        });
        setGraphData({ nodes, links: data.links ?? [] });
      })
      .catch((e) => setLoadError(e.message));
  }, []);

  const node = graphData.nodes.find((n) => n.id === selected);
  const toggleCls = (k) =>
    setDim((d) => {
      const n = new Set(d);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  const allowed = dim;

  return (
    <div className="rc">
      <style>{CSS}</style>

      <header className="hd">
        <div className="hd-eyebrow">EXPEDIENTE · RED DE PODER Y CAPITAL · 2025–2026</div>
        <h1 className="hd-title">LA RUSIFICACIÓN<span> DE CUBA</span></h1>
        <p className="hd-sub">
          Del Estado socialista al capitalismo de testaferros: cómo los activos públicos
          pasan a una oligarquía ligada a la cúpula, replicando el modelo postsoviético.
        </p>
        <div className="stamp">ANÁLISIS · FUENTES ABIERTAS</div>
      </header>

      <nav className="tabs">
        {[["mapa", "Mapa de la red"], ["tesis", "La tesis rusa"], ["casos", "Los casos"]].map(
          ([k, lbl]) => (
            <button key={k} className={"tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>
              {lbl}
            </button>
          )
        )}
      </nav>

      {tab === "mapa" && (
        <section className="map-wrap">
          <div className="legend">
            {Object.entries(CLS).map(([k, v]) => {
              const off = allowed.size && !allowed.has(k);
              return (
                <button key={k} className={"chip" + (off ? " off" : "")} onClick={() => toggleCls(k)}>
                  <span className="dot" style={{ background: v.color }} />
                  {v.name}
                </button>
              );
            })}
            <span className="hint">Toca para filtrar · líneas punteadas = vínculo presunto</span>
          </div>

          <div className="stage">
            <div className="canvas">
              {loadError ? (
                <div className="load-msg">Error al cargar datos: {loadError}</div>
              ) : graphData.nodes.length === 0 ? (
                <div className="load-msg">Cargando red…</div>
              ) : (
                <Graph
                  nodesData={graphData.nodes}
                  linksData={graphData.links}
                  selected={selected} setSelected={setSelected}
                  hovered={hovered} setHovered={setHovered}
                  dim={allowed}
                />
              )}
            </div>

            <aside className="dossier">
              {node ? (
                <>
                  <div className="d-cls" style={{ color: (CLS[node.cls] ?? CLS.empresa).color }}>
                    <span className="d-dot" style={{ background: (CLS[node.cls] ?? CLS.empresa).color }} />
                    {(CLS[node.cls] ?? CLS.empresa).name}
                  </div>
                  <h2 className="d-name">{node.label}</h2>
                  <div className="d-tier">{node.tier}</div>
                  {node.alleged && <div className="d-flag">Señalamiento presunto</div>}
                  <p className="d-desc">{node.desc}</p>
                  <div className="d-conx-h">Conexiones</div>
                  <ul className="d-conx">
                    {graphData.links
                      .filter((l) => l.s === node.id || l.t === node.id)
                      .map((l, i) => {
                        const other = l.s === node.id ? l.t : l.s;
                        const on = graphData.nodes.find((n) => n.id === other);
                        return (
                          <li key={i} onClick={() => setSelected(other)}>
                            <span className="rel">{l.rel.replace(/_/g, " ")}</span>
                            <span className="arr">{l.s === node.id ? "→" : "←"}</span>
                            <span className="oth">{on?.short}</span>
                          </li>
                        );
                      })}
                  </ul>
                  <div className="d-src">FUENTES · {(node.sources ?? []).join(" · ")}</div>
                </>
              ) : (
                <div className="d-empty">
                  <div className="d-empty-i">⊙</div>
                  <p>Selecciona un nodo para abrir su ficha.</p>
                  <p className="d-empty-s">
                    {graphData.nodes.length} entidades · {graphData.links.length} vínculos.
                    El núcleo rojo es el régimen; el dorado, la familia; el ámbar,
                    los testaferros que conectan al Estado con el capital privado.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </section>
      )}

      {tab === "tesis" && (
        <section className="thesis">
          <p className="th-lead">
            El término describe un patrón ya visto: tras el colapso de la economía planificada,
            el Estado no se democratiza sino que <em>traspasa sus activos más rentables a una
            oligarquía leal</em>. Rusia lo hizo en los años noventa. Cuba lo replica hoy, pieza por pieza.
          </p>
          <div className="th-grid">
            <div className="th-head th-ru">RUSIA POSTSOVIÉTICA</div>
            <div className="th-head th-cu">CUBA · 2024–2026</div>
            {RUSSIA_MAP.map((row, i) => (
              <div className="th-row" key={i}>
                <div className="th-cell ru">{row.ru}</div>
                <div className="th-cell cu">{row.cu}</div>
              </div>
            ))}
          </div>
          <p className="th-foot">
            El resultado no es un mercado libre, sino corporativismo oligárquico: la propiedad
            estatal cambia de manos sin que el poder cambie de dueño.
          </p>
        </section>
      )}

      {tab === "casos" && (
        <section className="cases">
          {CASES.map((c, i) => (
            <article className="case" key={i}>
              <div className="case-tag">{c.tag}</div>
              <h3 className="case-title">{c.title}</h3>
              <p className="case-body">{c.body}</p>
              <div className="case-metric">{c.metric}</div>
              <div className="case-src">{c.src}</div>
            </article>
          ))}
        </section>
      )}

      <footer className="ft">
        Compilado a partir de periodismo de investigación independiente (Cubanet, CiberCuba,
        Martí Noticias, Diario de Cuba, El Español), prensa internacional (WSJ, BBC) y documentos
        oficiales (Gaceta Oficial, ZED Mariel, Depto. de Estado EE.UU.). Los vínculos se presentan
        como reportados o presuntos; no constituyen una determinación de culpabilidad.
      </footer>
    </div>
  );
}

const CSS = `
.rc{--ink:#100E0C;--ink2:#16130F;--panel:#1B1712;--panel2:#221D17;
  --line:rgba(233,226,212,.12);--bone:#E9E2D4;--bone2:#A89F8C;--ox:#C24545;--gold:#D4AE57;
  font-family:'Archivo',system-ui,sans-serif;background:
   radial-gradient(120% 80% at 50% -10%, #1c1813 0%, var(--ink) 60%);
  color:var(--bone);min-height:100%;width:100%;
  -webkit-font-smoothing:antialiased;}
.rc *{box-sizing:border-box;}

.hd{padding:34px 26px 18px;border-bottom:1px solid var(--line);position:relative;}
.hd-eyebrow{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.32em;
  color:var(--bone2);text-transform:uppercase;}
.hd-title{font-family:'Archivo',sans-serif;font-weight:900;font-size:clamp(30px,7vw,62px);
  letter-spacing:-.02em;line-height:.95;margin:10px 0 0;text-transform:uppercase;color:var(--ox);}
.hd-title span{color:var(--bone);display:inline;}
.hd-sub{max-width:62ch;margin:14px 0 0;color:var(--bone2);font-size:15px;line-height:1.5;}
.stamp{position:absolute;top:30px;right:24px;font-family:'IBM Plex Mono',monospace;font-size:10px;
  letter-spacing:.18em;color:var(--ox);border:1.5px solid var(--ox);padding:6px 10px;
  transform:rotate(7deg);opacity:.8;text-align:center;line-height:1.4;}
@media(max-width:640px){.stamp{display:none;}}

.tabs{display:flex;gap:0;border-bottom:1px solid var(--line);padding:0 18px;}
.tab{background:none;border:none;color:var(--bone2);font-family:'IBM Plex Mono',monospace;
  font-size:12px;letter-spacing:.12em;text-transform:uppercase;padding:16px 18px;cursor:pointer;
  border-bottom:2px solid transparent;transition:.2s;}
.tab:hover{color:var(--bone);}
.tab.on{color:var(--gold);border-bottom-color:var(--gold);}

.map-wrap{padding:18px;}
.legend{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:14px;}
.chip{display:inline-flex;align-items:center;gap:7px;background:var(--panel);border:1px solid var(--line);
  color:var(--bone);font-size:12px;padding:6px 11px;border-radius:2px;cursor:pointer;transition:.2s;
  font-family:'Archivo',sans-serif;}
.chip:hover{border-color:rgba(233,226,212,.3);}
.chip.off{opacity:.35;}
.chip .dot{width:9px;height:9px;border-radius:50%;}
.hint{font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--bone2);margin-left:auto;
  letter-spacing:.04em;}
@media(max-width:720px){.hint{margin-left:0;width:100%;}}

.stage{display:grid;grid-template-columns:1fr 320px;gap:16px;}
@media(max-width:860px){.stage{grid-template-columns:1fr;}}
.canvas{background:
   linear-gradient(var(--line) 1px,transparent 1px) 0 0/26px 26px,
   linear-gradient(90deg,var(--line) 1px,transparent 1px) 0 0/26px 26px,
   var(--ink2);
  background-blend-mode:normal;border:1px solid var(--line);border-radius:3px;overflow:hidden;
  min-height:420px;display:flex;align-items:center;justify-content:center;}
.load-msg{color:var(--bone2);font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.08em;}
.net{display:block;width:100%;height:auto;touch-action:none;}
.node-lbl{font-family:'IBM Plex Mono',monospace;font-size:11px;fill:var(--bone);
  paint-order:stroke;stroke:var(--ink2);stroke-width:3px;font-weight:500;}
.edge-lbl{font-family:'IBM Plex Mono',monospace;font-size:9.5px;fill:var(--gold);
  paint-order:stroke;stroke:var(--ink2);stroke-width:3px;letter-spacing:.02em;}
.ring{fill:none;stroke:var(--gold);stroke-width:1;stroke-dasharray:2 4;opacity:.7;}

.dossier{background:var(--panel);border:1px solid var(--line);border-radius:3px;padding:20px;
  min-height:420px;align-self:start;position:sticky;top:12px;}
.d-cls{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;
  display:flex;align-items:center;gap:7px;}
.d-dot{width:8px;height:8px;border-radius:50%;}
.d-name{font-size:21px;font-weight:800;margin:10px 0 2px;line-height:1.1;letter-spacing:-.01em;}
.d-tier{color:var(--bone2);font-size:13px;}
.d-flag{display:inline-block;margin-top:10px;font-family:'IBM Plex Mono',monospace;font-size:10px;
  letter-spacing:.1em;color:var(--ox);border:1px solid var(--ox);padding:3px 8px;border-radius:2px;}
.d-desc{font-size:14px;line-height:1.55;color:#d8d1c2;margin:14px 0 16px;}
.d-conx-h{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.18em;color:var(--bone2);
  text-transform:uppercase;border-top:1px solid var(--line);padding-top:12px;}
.d-conx{list-style:none;margin:8px 0 0;padding:0;}
.d-conx li{display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer;font-size:12px;
  border-bottom:1px solid rgba(233,226,212,.06);}
.d-conx li:hover .oth{color:var(--gold);}
.d-conx .rel{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--bone2);flex:1;}
.d-conx .arr{color:var(--gold);}
.d-conx .oth{font-weight:600;}
.d-src{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.06em;color:var(--bone2);
  margin-top:16px;border-top:1px solid var(--line);padding-top:12px;line-height:1.6;}
.d-empty{color:var(--bone2);text-align:center;padding-top:40px;}
.d-empty-i{font-size:40px;color:var(--gold);opacity:.5;}
.d-empty p{font-size:14px;margin:14px 0 0;}
.d-empty-s{font-size:12.5px!important;line-height:1.6;margin-top:14px!important;
  text-align:left;border-top:1px solid var(--line);padding-top:14px;}

.thesis{padding:30px 26px;max-width:1000px;}
.th-lead{font-size:17px;line-height:1.6;color:#dcd5c6;max-width:70ch;margin:0 0 26px;}
.th-lead em{color:var(--gold);font-style:normal;}
.th-grid{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--line);border-radius:3px;
  overflow:hidden;}
.th-head{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.16em;padding:13px 16px;
  text-transform:uppercase;background:var(--panel2);}
.th-ru{color:var(--bone2);border-right:1px solid var(--line);}
.th-cu{color:var(--gold);}
.th-row{display:contents;}
.th-cell{padding:15px 16px;font-size:13.5px;line-height:1.5;border-top:1px solid var(--line);}
.th-cell.ru{color:var(--bone2);border-right:1px solid var(--line);background:rgba(0,0,0,.12);}
.th-cell.cu{color:#dcd5c6;}
@media(max-width:680px){.th-grid{grid-template-columns:1fr;}
  .th-ru,.th-cell.ru{border-right:none;}
  .th-cell.cu{border-top:none;}}
.th-foot{font-size:15px;color:var(--bone2);margin:24px 0 0;max-width:68ch;line-height:1.55;
  border-left:2px solid var(--ox);padding-left:14px;}

.cases{padding:24px;display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px;}
.case{background:var(--panel);border:1px solid var(--line);border-radius:3px;padding:20px;
  display:flex;flex-direction:column;}
.case-tag{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.2em;color:var(--ox);
  border:1px solid var(--ox);align-self:flex-start;padding:3px 8px;border-radius:2px;}
.case-title{font-size:17px;font-weight:800;margin:13px 0 0;line-height:1.2;}
.case-body{font-size:13.5px;line-height:1.55;color:var(--bone2);margin:11px 0 0;flex:1;}
.case-metric{font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--gold);margin:16px 0 0;
  border-top:1px solid var(--line);padding-top:12px;}
.case-src{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--bone2);margin-top:8px;
  letter-spacing:.04em;}

.ft{padding:22px 26px 34px;border-top:1px solid var(--line);font-size:11.5px;line-height:1.6;
  color:var(--bone2);max-width:90ch;}

.zoom-ctrls{position:absolute;top:10px;right:10px;display:flex;flex-direction:column;gap:4px;z-index:2;}
.zoom-btn{width:28px;height:28px;background:rgba(27,23,18,.88);border:1px solid var(--line);
  color:var(--bone2);font-size:15px;line-height:1;cursor:pointer;border-radius:2px;
  display:flex;align-items:center;justify-content:center;
  font-family:'IBM Plex Mono',monospace;transition:.15s;padding:0;}
.zoom-btn:hover{color:var(--bone);border-color:rgba(233,226,212,.32);}
`;
