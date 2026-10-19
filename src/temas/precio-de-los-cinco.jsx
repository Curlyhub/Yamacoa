import React, { useEffect, useMemo, useRef, useState } from "react";
import { cargarFuentes } from "../design/tokens";

/*
 * Tema: El precio de los Cinco
 * Renderer congelado. Todo el contenido analítico vive en public/data/precio-de-los-cinco.json
 * (fetch en runtime; EMBEDDED es el respaldo si falla). Importado el 2026-10-19 con la piel
 * del periódico: superficie, tinta y tipografía salen de los tokens (src/design/tokens.js);
 * del tema solo quedan los colores de datos.
 * Paleta del tema: azul petróleo (EE. UU., ~195°) y óxido (Cuba, ~12°).
 * No usa ámbar: el tema no contiene contrafactuales.
 */

const M = 1e6;
const LIBROS = {
  eeuu: { nombre: "EE. UU.", etiqueta: "Pagó EE. UU.", grupo: "Libro 1 · Estados Unidos", cls: "us" },
  cuba: { nombre: "Cuba", etiqueta: "Pagó Cuba", grupo: "Libro 2 · Cuba", cls: "cu" },
};
const ESCALA = [
  ["confirmado", "documento primario"],
  ["reportado", "prensa o terceros"],
  ["calculado", "aritmética sobre datos confirmados"],
  ["estimado", "supuesto con ancla"],
  ["no_cuantificado", "sin base para una cifra"],
];

const fmt = (v, d = 1) =>
  (v / M).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtFecha = (iso) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

const CSS = `
.pc-root{
  --pc-bg:var(--y-surface-2,#f5efe7); --pc-panel:var(--y-surface,#fcf9f4); --pc-ink:var(--y-ink,#1f1a16);
  --pc-ink2:var(--y-ink-2,#4a3f36); --pc-muted:var(--y-muted,#6b5d50);
  --pc-rule:var(--y-rule,rgba(60,40,20,.15)); --pc-track:var(--y-surface-2,#f5efe7); --pc-us:#0B7FA0; --pc-cu:#B84A2E;
  --pc-confirmado:#1D6B3A; --pc-reportado:#2C5D9E; --pc-calculado:#5B4A9E; --pc-estimado:#5A6168; --pc-no_cuantificado:#8A3A3A;
  --pc-display:var(--y-font,'Manrope',system-ui,sans-serif);
  --pc-body:var(--y-font,'Manrope',system-ui,sans-serif);
  --pc-mono:var(--y-mono,'IBM Plex Mono',ui-monospace,monospace);
  background:transparent; color:var(--pc-ink); font-family:var(--pc-body); font-size:16px; line-height:1.55;
}
.pc-root *{box-sizing:border-box}
.pc-wrap{max-width:1040px;margin:0 auto;padding-inline:20px;padding-block:40px 64px;display:grid;gap:56px}
.pc-root h1,.pc-root h2{font-family:var(--pc-display);font-weight:800;text-wrap:balance;margin:0;letter-spacing:-.03em}
.pc-root h1{font-size:clamp(2.1rem,6vw,3.6rem);line-height:1.02}
.pc-root h2{font-size:clamp(1.3rem,3vw,1.7rem);line-height:1.15}
.pc-root h3{font-size:1rem;font-weight:600;margin:0}
.pc-root p{margin:0;max-width:68ch}
.pc-root a{color:inherit;text-decoration-color:var(--pc-muted);text-underline-offset:2px}
.pc-root a:focus-visible,.pc-row:focus-visible{outline:2px solid var(--pc-us);outline-offset:2px}
.pc-eyebrow{font-family:var(--pc-mono);font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--pc-muted)}
.pc-mono{font-family:var(--pc-mono);font-variant-numeric:tabular-nums}
.pc-sec{display:grid;gap:18px;min-width:0}
.pc-lede{font-size:1.15rem;color:var(--pc-ink2);max-width:62ch}
.pc-head{display:grid;gap:18px}
.pc-docket{font-family:var(--pc-mono);font-size:.8rem;color:var(--pc-muted);border-top:1px solid var(--pc-rule);padding-top:10px;display:flex;flex-wrap:wrap;gap:6px 22px}
.pc-ledger{display:grid;grid-template-columns:1fr 1fr 1.15fr;border-top:2px solid var(--pc-ink);border-bottom:1px solid var(--pc-rule)}
.pc-ledger>div{padding:18px 18px 18px 0;display:grid;gap:6px;align-content:start;min-width:0}
.pc-ledger>div+div{padding-left:18px;border-left:1px solid var(--pc-rule)}
.pc-big{font-family:var(--pc-display);font-weight:800;letter-spacing:-.02em;font-size:clamp(2rem,5vw,2.9rem);line-height:1;font-variant-numeric:tabular-nums}
.pc-big small{font-family:var(--pc-mono);font-size:.9rem;margin-left:4px;color:var(--pc-ink2)}
.pc-ci{font-family:var(--pc-mono);font-size:.82rem;color:var(--pc-ink2)}
.pc-desc{font-size:.85rem;color:var(--pc-ink2)}
.pc-key{display:inline-flex;align-items:center;gap:8px;font-size:.85rem;font-weight:600}
.pc-sw{width:12px;height:12px;border-radius:3px;display:inline-block;flex:none}
.pc-us-bg{background:var(--pc-us)} .pc-cu-bg{background:var(--pc-cu)}
.pc-leyenda{font-size:.85rem;color:var(--pc-ink2);border-left:2px solid var(--pc-rule);padding-left:12px;max-width:none}
.pc-leyenda b{color:var(--pc-ink)}
.pc-fixes{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1px;background:var(--pc-rule);border:1px solid var(--pc-rule)}
.pc-fixes::after{content:"";background:var(--pc-panel)}
.pc-fix{background:var(--pc-panel);padding:16px;display:grid;gap:8px;align-content:start;justify-items:start}
.pc-was{font-size:.88rem;color:var(--pc-muted);text-decoration:line-through;text-decoration-color:var(--pc-no_cuantificado)}
.pc-now{font-size:.95rem}
.pc-src{font-size:.78rem;color:var(--pc-muted);display:flex;flex-wrap:wrap;gap:4px 10px}
.pc-chip{display:inline-block;font-family:var(--pc-mono);font-size:.7rem;letter-spacing:.04em;padding:2px 7px;border-radius:999px;border:1px solid currentColor;white-space:nowrap}
.pc-chip-confirmado{color:var(--pc-confirmado)} .pc-chip-reportado{color:var(--pc-reportado)} .pc-chip-calculado{color:var(--pc-calculado)}
.pc-chip-estimado{color:var(--pc-estimado)} .pc-chip-no_cuantificado{color:var(--pc-no_cuantificado)}
.pc-chart{background:var(--pc-panel);border:1px solid var(--pc-rule);border-radius:14px;padding:18px;display:grid;gap:4px;position:relative}
.pc-legend{display:flex;flex-wrap:wrap;gap:8px 20px;font-size:.85rem;color:var(--pc-ink2);margin-bottom:8px;align-items:center}
.pc-whisk{display:inline-flex;align-items:center;gap:6px}
.pc-whisk i{width:28px;height:2px;background:var(--pc-ink2);position:relative;display:inline-block}
.pc-whisk i::after{content:"";position:absolute;left:10px;top:-4px;width:9px;height:9px;border-radius:50%;background:var(--pc-ink2)}
.pc-grp{font-family:var(--pc-mono);font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:var(--pc-muted);padding-top:12px;border-top:1px solid var(--pc-rule);margin-top:6px}
.pc-row,.pc-axis{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr) 92px;gap:12px;align-items:center}
.pc-row{min-height:34px;border-radius:4px;cursor:default}
.pc-row:hover,.pc-row:focus-visible{background:var(--pc-track)}
.pc-lab{font-size:.88rem;line-height:1.25;min-width:0}
.pc-val{font-family:var(--pc-mono);font-size:.82rem;text-align:right;font-variant-numeric:tabular-nums}
.pc-trk{position:relative;height:22px}
.pc-grid{position:absolute;inset:0;opacity:.7}
.pc-ln{position:absolute;top:10px;height:2px;border-radius:2px}
.pc-pt{position:absolute;top:6px;width:10px;height:10px;border-radius:50%;margin-left:-5px;box-shadow:0 0 0 2px var(--pc-panel)}
.pc-ticks{position:relative;height:20px;font-family:var(--pc-mono);font-size:.75rem;color:var(--pc-muted)}
.pc-ticks span{position:absolute;transform:translateX(-50%);white-space:nowrap}
.pc-ticks span:first-child{transform:none}
.pc-ticks span:last-child{transform:translateX(-100%)}
.pc-tip{position:absolute;pointer-events:none;background:var(--pc-ink);color:var(--pc-bg);font-size:.82rem;padding:8px 10px;border-radius:6px;max-width:280px;line-height:1.35;z-index:5}
.pc-tip b{display:block;margin-bottom:2px}
.pc-sens{display:grid;gap:8px}
.pc-srow{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr) 56px;gap:12px;align-items:center;font-size:.88rem}
.pc-sbar{height:12px;background:var(--pc-track);border-radius:3px;position:relative;overflow:hidden}
.pc-sbar i{position:absolute;inset:0 auto 0 0;border-radius:0 4px 4px 0}
.pc-tbl{overflow-x:auto;border:1px solid var(--pc-rule);border-radius:14px;background:var(--pc-panel)}
.pc-tbl table{border-collapse:collapse;width:100%;font-size:.88rem;min-width:760px}
.pc-tbl th,.pc-tbl td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--pc-rule);vertical-align:top}
.pc-tbl th{font-family:var(--pc-mono);font-weight:500;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--pc-muted);background:var(--pc-bg)}
.pc-tbl th.pc-r,.pc-num{text-align:right}
.pc-num{font-family:var(--pc-mono);font-variant-numeric:tabular-nums;white-space:nowrap}
.pc-nota{color:var(--pc-ink2);margin-top:4px;font-size:.83rem;max-width:58ch}
.pc-out td{color:var(--pc-muted)}
.pc-book{font-family:var(--pc-mono);font-size:.72rem;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.pc-two{display:grid;grid-template-columns:1fr 1fr;gap:28px}
.pc-cards{display:grid;gap:12px;align-content:start}
.pc-card{background:var(--pc-panel);border:1px solid var(--pc-rule);border-radius:12px;padding:16px;display:grid;gap:8px}
.pc-card-h{display:flex;justify-content:space-between;gap:12px;align-items:baseline;flex-wrap:wrap}
.pc-plain{margin:0;padding-left:18px;display:grid;gap:8px;max-width:72ch}
.pc-srclist{margin:0;padding-left:22px;font-size:.84rem;color:var(--pc-ink2);columns:2;column-gap:36px}
.pc-srclist li{break-inside:avoid;margin-bottom:4px}
.pc-foot{font-size:.8rem;color:var(--pc-muted);border-top:1px solid var(--pc-rule);padding-top:14px;display:grid;gap:6px}
@media (max-width:820px){.pc-two{grid-template-columns:1fr}}
@media (max-width:720px){
  .pc-ledger{grid-template-columns:1fr}
  .pc-ledger>div+div{padding-left:0;border-left:0;border-top:1px solid var(--pc-rule)}
  .pc-row,.pc-axis{grid-template-columns:1fr 64px}
  .pc-lab{grid-column:1/-1}
  .pc-axis>div:first-child{display:none}
  .pc-ticks .pc-impar{display:none}
  .pc-srow{grid-template-columns:1fr 52px}
  .pc-srow>span:first-child{grid-column:1/-1}
  .pc-srclist{columns:1}
}
`;

function Chip({ confianza }) {
  return <span className={"pc-chip pc-chip-" + confianza}>{confianza}</span>;
}

/* Leyenda metodológica obligatoria bajo cada gráfico. Sustituible por la Leyenda compartida de la plataforma. */
function Leyenda({ titulo = "Nota metodológica.", children, id }) {
  return (
    <p className="pc-leyenda" id={id}>
      <b>{titulo}</b> {children}
    </p>
  );
}

function Fuentes({ ids, numero }) {
  const visibles = ids.filter((id) => numero.has(id));
  if (!visibles.length) return null;
  return (
    <span className="pc-src">
      {visibles.map((id) => (
        <a key={id} href={numero.get(id).url} target="_blank" rel="noopener noreferrer">
          [{numero.get(id).n}]
        </a>
      ))}
    </span>
  );
}

function Libro({ clave, total, desc }) {
  const lib = LIBROS[clave];
  return (
    <div>
      <span className="pc-key">
        {lib && <span className={"pc-sw pc-" + lib.cls + "-bg"} />}
        {lib ? lib.etiqueta : "Total del caso"}
      </span>
      <span className="pc-big">
        {fmt(total.p50, 0)}
        <small>M USD</small>
      </span>
      <span className="pc-ci">90 %: {fmt(total.p5, 0)}–{fmt(total.p95, 0)} M</span>
      <span className="pc-desc">{desc}</span>
    </div>
  );
}

function GraficoPartidas({ partidas, leyenda }) {
  const ref = useRef(null);
  const [tip, setTip] = useState(null);
  const max = Math.ceil(Math.max(...partidas.map((p) => p.usd2025.p95)) / M / 10) * 10;
  const pct = (v) => Math.min(100, (v / M / max) * 100);
  const ticks = [];
  for (let v = 0; v <= max; v += 10) ticks.push(v);

  const mostrar = (p, e, fila) => {
    const caja = ref.current.getBoundingClientRect();
    const r = fila.getBoundingClientRect();
    const xRaw = (e && e.clientX ? e.clientX : r.left + r.width / 2) - caja.left + 14;
    setTip({ p, x: Math.max(8, Math.min(xRaw, caja.width - 290)), y: r.bottom - caja.top + 4 });
  };

  return (
    <>
      <div className="pc-chart" ref={ref} aria-describedby="pc-ley-partidas">
        <div className="pc-legend">
          <span className="pc-key"><span className="pc-sw pc-us-bg" />Pagó EE. UU.</span>
          <span className="pc-key"><span className="pc-sw pc-cu-bg" />Pagó Cuba</span>
          <span className="pc-whisk"><i />mediana y rango del 90 %</span>
        </div>
        {["eeuu", "cuba"].map((libro) => (
          <React.Fragment key={libro}>
            <div className="pc-grp">{LIBROS[libro].grupo}</div>
            {partidas
              .filter((p) => p.libro === libro)
              .sort((a, b) => b.usd2025.p50 - a.usd2025.p50)
              .map((p) => {
                const { p5, p50, p95 } = p.usd2025;
                const color = "var(--pc-" + LIBROS[libro].cls + ")";
                const op = p.en_total ? 1 : 0.4;
                return (
                  <div
                    key={p.id}
                    className="pc-row"
                    tabIndex={0}
                    aria-label={p.nombre + ": mediana " + fmt(p50) + " millones, rango " + fmt(p5) + " a " + fmt(p95)}
                    onMouseMove={(e) => mostrar(p, e, e.currentTarget)}
                    onFocus={(e) => mostrar(p, null, e.currentTarget)}
                    onMouseLeave={() => setTip(null)}
                    onBlur={() => setTip(null)}
                  >
                    <span className="pc-lab">
                      {p.nombre}
                      {!p.en_total && <> <span className="pc-chip pc-chip-no_cuantificado">fuera del total</span></>}
                    </span>
                    <div className="pc-trk">
                      <div
                        className="pc-grid"
                        style={{
                          backgroundImage: "linear-gradient(to right, var(--pc-rule) 1px, transparent 1px)",
                          backgroundSize: "calc(100% / " + max / 10 + ") 100%",
                        }}
                      />
                      <div
                        className="pc-ln"
                        style={{ left: pct(p5) + "%", width: Math.max(0.4, pct(p95) - pct(p5)) + "%", background: color, opacity: op }}
                      />
                      <div className="pc-pt" style={{ left: pct(p50) + "%", background: color, opacity: op }} />
                    </div>
                    <span className="pc-val">{fmt(p50, p50 < M ? 2 : 1)}</span>
                  </div>
                );
              })}
          </React.Fragment>
        ))}
        <div className="pc-axis">
          <div />
          <div className="pc-ticks">
            {ticks.map((v) => (
              <span key={v} className={(v / 10) % 2 && v !== max ? "pc-impar" : undefined} style={{ left: (v / max) * 100 + "%" }}>
                {String(v)}
              </span>
            ))}
          </div>
          <div />
        </div>
        {tip && (
          <div className="pc-tip" style={{ left: tip.x, top: tip.y }}>
            <b>{tip.p.nombre}</b>
            Mediana {fmt(tip.p.usd2025.p50, 2)} M · 90 %: {fmt(tip.p.usd2025.p5, 2)}–{fmt(tip.p.usd2025.p95, 2)} M
            <br />
            {tip.p.periodo[0]}–{tip.p.periodo[1]} · {tip.p.confianza}
          </div>
        )}
      </div>
      <Leyenda id="pc-ley-partidas">{leyenda} Eje de 0 a {max} millones de USD de 2025.</Leyenda>
    </>
  );
}

function Sensibilidad({ filas, partidas, leyenda }) {
  const porId = new Map(partidas.map((p) => [p.id, p]));
  return (
    <>
      <div className="pc-sens">
        {filas.slice(0, 6).map((s) => {
          const p = porId.get(s.id);
          if (!p) return null;
          return (
            <div className="pc-srow" key={s.id}>
              <span>{p.nombre}</span>
              <div className="pc-sbar">
                <i style={{ width: s.cuota_varianza * 100 + "%", background: "var(--pc-" + LIBROS[p.libro].cls + ")" }} />
              </div>
              <span className="pc-mono" style={{ textAlign: "right" }}>
                {(s.cuota_varianza * 100).toLocaleString("es-ES", { maximumFractionDigits: 1 })} %
              </span>
            </div>
          );
        })}
      </div>
      <Leyenda>{leyenda}</Leyenda>
    </>
  );
}

function PrecioDeLosCinco({ datos }) {
  const d = datos;

  // Numeración de fuentes por orden de primera aparición.
  const numero = useMemo(() => {
    const porId = new Map(d.fuentes.map((f) => [f.id, f]));
    const orden = new Map();
    const usar = (id) => {
      if (porId.has(id) && !orden.has(id)) orden.set(id, { ...porId.get(id), n: orden.size + 1 });
    };
    d.correcciones.forEach((c) => c.fuentes.forEach(usar));
    d.partidas.forEach((p) => p.fuentes.forEach(usar));
    d.encarcelamiento.coif_anclas.forEach((a) => usar(a.fuente));
    d.conexos.forEach((c) => c.fuentes.forEach(usar));
    d.fuentes.forEach((f) => usar(f.id));
    return orden;
  }, [d]);

  const T = d.totales;
  const E = d.encarcelamiento;
  const hitos = d.expediente.hitos;

  return (
    <div className="pc-root">
      <style>{CSS}</style>
      <div className="pc-wrap">
        <header className="pc-head">
          <span className="pc-eyebrow">
            Caso n.º {d.expediente.caso} · {d.expediente.tribunal} · {hitos[0].fecha.slice(0, 4)}–{hitos[hitos.length - 1].fecha.slice(0, 4)}
          </span>
          <h1>{d.titulo}</h1>
          <p className="pc-lede">{d.subtitulo}</p>
          <div className="pc-docket">
            {hitos.map((h) => (
              <span key={h.fecha}>{h.evento}: {fmtFecha(h.fecha)}</span>
            ))}
            <span>{E.total_persona_anios.toLocaleString("es-ES")} años-persona en custodia</span>
            <span>USD constantes de 2025</span>
          </div>
        </header>

        <section className="pc-sec" aria-labelledby="pc-h-totales">
          <h2 id="pc-h-totales">Los dos libros</h2>
          <div className="pc-ledger">
            <Libro clave="eeuu" total={T.eeuu} desc="Investigación, fiscalía, defensa de oficio, tribunal y prisión." />
            <Libro clave="cuba" total={T.cuba} desc="Red Avispa, visitas, red exterior, coloquios y propaganda en divisas." />
            <Libro clave="total" total={T.total} desc="Suma de ambos libros, sin las derivadas conexas." />
          </div>
          <Leyenda titulo="Cómo leer las cifras.">
            {d.leyendas.totales} En dólares de cada año el total es de unos {fmt(T.total_nominal.p50, 0)} millones.
          </Leyenda>
        </section>

        <section className="pc-sec" aria-labelledby="pc-h-fix">
          <h2 id="pc-h-fix">Qué corrige este modelo</h2>
          <p>{d.textos.intro_correcciones}</p>
          <div className="pc-fixes">
            {d.correcciones.map((c, i) => (
              <div className="pc-fix" key={i}>
                <Chip confianza={c.confianza} />
                <span className="pc-was">{c.antes}</span>
                <span className="pc-now">{c.ahora}</span>
                <Fuentes ids={c.fuentes} numero={numero} />
              </div>
            ))}
          </div>
        </section>

        <section className="pc-sec" aria-labelledby="pc-h-partidas">
          <h2 id="pc-h-partidas">Partida por partida</h2>
          <GraficoPartidas partidas={d.partidas} leyenda={d.leyendas.partidas} />
        </section>

        <section className="pc-sec" aria-labelledby="pc-h-sens">
          <h2 id="pc-h-sens">Dónde está la incertidumbre</h2>
          <p>{d.textos.intro_sensibilidad}</p>
          <Sensibilidad filas={d.sensibilidad} partidas={d.partidas} leyenda={d.leyendas.sensibilidad} />
        </section>

        <section className="pc-sec" aria-labelledby="pc-h-tabla">
          <h2 id="pc-h-tabla">Tabla completa</h2>
          <div className="pc-tbl">
            <table>
              <thead>
                <tr>
                  <th>Partida</th><th>Libro</th><th>Periodo</th><th>Confianza</th>
                  <th className="pc-r">Mediana</th><th className="pc-r">Rango 90 %</th>
                </tr>
              </thead>
              <tbody>
                {d.partidas.map((p) => (
                  <tr key={p.id} className={p.en_total ? undefined : "pc-out"}>
                    <td>
                      <b>{p.nombre}</b>
                      <div className="pc-nota">{p.nota}</div>
                      <div style={{ marginTop: 6 }}><Fuentes ids={p.fuentes} numero={numero} /></div>
                    </td>
                    <td>
                      <span className="pc-book">
                        <span className={"pc-sw pc-" + LIBROS[p.libro].cls + "-bg"} />
                        {LIBROS[p.libro].nombre}
                      </span>
                    </td>
                    <td className="pc-mono">{p.periodo[0]}–{p.periodo[1]}</td>
                    <td><Chip confianza={p.confianza} /></td>
                    <td className="pc-num">{fmt(p.usd2025.p50, 2)}</td>
                    <td className="pc-num">{fmt(p.usd2025.p5, 2)}–{fmt(p.usd2025.p95, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Leyenda titulo="Escala de confianza.">
            {ESCALA.map(([k, v]) => (
              <React.Fragment key={k}>
                <Chip confianza={k} /> {v}{" · "}
              </React.Fragment>
            ))}
            {d.leyendas.tabla}
          </Leyenda>
        </section>

        <section className="pc-sec" aria-labelledby="pc-h-carcel">
          <h2 id="pc-h-carcel">La parte que sí se puede calcular</h2>
          <div className="pc-two">
            <div className="pc-cards">
              {E.personas.map((p) => (
                <div className="pc-card" key={p.nombre}>
                  <div className="pc-card-h">
                    <h3>{p.nombre}</h3>
                    <span className="pc-mono">{p.anios_custodia.toLocaleString("es-ES")} años</span>
                  </div>
                  <span className="pc-desc">
                    Condena: {p.condena}. Salida: {fmtFecha(p.salida)} · {p.motivo_salida}.
                  </span>
                </div>
              ))}
            </div>
            <div className="pc-cards">
              {d.textos.carcel.map((t, i) => <p key={i}>{t}</p>)}
              <p>
                Tarifas anuales usadas:{" "}
                {E.coif_anclas.map((a, i) => (
                  <React.Fragment key={a.anio}>
                    {i > 0 && ", "}
                    <span className="pc-mono">{a.usd.toLocaleString("es-ES")} USD</span> en {a.anio}
                  </React.Fragment>
                ))}
                . Base: <b className="pc-mono">{fmt(E.base_nominal_usd, 2)} M USD</b> en dólares de cada año.
              </p>
            </div>
          </div>
        </section>

        <section className="pc-sec" aria-labelledby="pc-h-conexos">
          <h2 id="pc-h-conexos">Fuera del total</h2>
          <p>{d.textos.intro_conexos}</p>
          <div className="pc-cards">
            {d.conexos.map((c) => (
              <div className="pc-card" key={c.id}>
                <div className="pc-card-h">
                  <h3>{c.nombre}</h3>
                  <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="pc-mono">
                      {c.valor_usd == null
                        ? "sin cifra"
                        : (c.valor_usd >= M ? fmt(c.valor_usd, 1) + " M USD" : (c.valor_usd / 1e3).toLocaleString("es-ES") + " mil USD") +
                          (c.anio ? " (" + c.anio + ")" : "")}
                    </span>
                    <Chip confianza={c.confianza} />
                  </span>
                </div>
                <p className="pc-desc">{c.nota}</p>
                <Fuentes ids={c.fuentes} numero={numero} />
              </div>
            ))}
          </div>
        </section>

        <section className="pc-sec" aria-labelledby="pc-h-no">
          <h2 id="pc-h-no">Lo que no tiene precio en este modelo</h2>
          <ul className="pc-plain">
            {d.sin_precio.map((s) => (
              <li key={s.titulo}><b>{s.titulo}.</b> {s.texto}</li>
            ))}
          </ul>
        </section>

        <section className="pc-sec" aria-labelledby="pc-h-metodo">
          <h2 id="pc-h-metodo">Método y fuentes</h2>
          <ul className="pc-plain">
            <li>
              Monte Carlo de {d.metodologia.iteraciones.toLocaleString("es-ES")} iteraciones con semilla fija ({d.metodologia.semilla}).
            </li>
            <li>Deflactor: {d.metodologia.deflactor}</li>
            {d.metodologia.notas.map((n, i) => <li key={i}>{n}</li>)}
            <li><b>Condición de falsación.</b> {d.metodologia.falsacion}</li>
          </ul>
          <ol className="pc-srclist">
            {[...numero.values()].map((f) => (
              <li key={f.id}>
                <a href={f.url} target="_blank" rel="noopener noreferrer">{f.titulo}</a>
              </li>
            ))}
          </ol>
        </section>

        <footer className="pc-foot">
          <span>Versión de los datos: {fmtFecha(d.version_datos)}.</span>
          {d.metodologia.pendientes.map((t, i) => <span key={i}>Pendiente: {t}</span>)}
        </footer>
      </div>
    </div>
  );
}

const DATA_URL = `${process.env.PUBLIC_URL || ""}/data/precio-de-los-cinco.json`;

export default function App() {
  const [datos, setDatos] = useState(EMBEDDED);
  useEffect(() => {
    cargarFuentes();
    let vivo = true;
    fetch(DATA_URL).then((r) => (r.ok ? r.json() : Promise.reject())).then((j) => { if (vivo) setDatos(j); }).catch(() => {});
    return () => { vivo = false; };
  }, []);
  return <PrecioDeLosCinco datos={datos} />;
}

/* ───────────────────────── dataset embebido (respaldo) ─────────────────── */
// Copia de public/data/precio-de-los-cinco.json del 2026-10-19. Solo se ve si el fetch falla.
const EMBEDDED = {
 "slug": "precio-de-los-cinco",
 "titulo": "El precio de los Cinco",
 "subtitulo": "Cuánto costó, a cada gobierno, detener, juzgar y encarcelar a cinco agentes de la Red Avispa, y cuánto gastó La Habana en la campaña para traerlos de vuelta. Un modelo con dos libros de cuentas, cada partida con su fuente y su grado de confianza.",
 "version_datos": "2026-10-19",
 "expediente": {
  "caso": "98-00721-CR-JAL",
  "tribunal": "Distrito Sur de Florida",
  "hitos": [
   {
    "fecha": "1998-09-12",
    "evento": "Detención",
    "confianza": "confirmado"
   },
   {
    "fecha": "2001-06-08",
    "evento": "Veredicto",
    "confianza": "confirmado"
   },
   {
    "fecha": "2014-12-17",
    "evento": "Canje",
    "confianza": "confirmado"
   }
  ]
 },
 "totales": {
  "eeuu": {
   "p5": 26319519,
   "p50": 32110550,
   "p95": 39642064,
   "confianza": "estimado"
  },
  "cuba": {
   "p5": 34099117,
   "p50": 55118563,
   "p95": 87139772,
   "confianza": "estimado"
  },
  "total": {
   "p5": 65418465,
   "p50": 87678410,
   "p95": 120189551,
   "confianza": "estimado"
  },
  "total_nominal": {
   "p5": 38329071,
   "p50": 52206343,
   "p95": 72875204,
   "confianza": "estimado"
  }
 },
 "partidas": [
  {
   "id": "us_fbi",
   "libro": "eeuu",
   "nombre": "Investigación del FBI (vigilancia FISA, descifrado, detenciones)",
   "confianza": "estimado",
   "periodo": [
    1995,
    1999
   ],
   "en_total": true,
   "usd2025": {
    "p5": 10187853,
    "p50": 15611056,
    "p95": 22977817
   },
   "nominal": {
    "p5": 5054600,
    "p50": 7745268,
    "p95": 11400211
   },
   "factor_2025": 2.016,
   "nota": "4 años de 8 a 25 equivalentes a tiempo completo con coste cargado de 100-155 mil USD/año. Sin cifra oficial; el FBI obtuvo autorización FISA en 1995.",
   "fuentes": [
    "havanatimes_habeas",
    "washtimes_2001"
   ]
  },
  {
   "id": "us_fiscalia",
   "libro": "eeuu",
   "nombre": "Fiscalía federal (SDFL): instrucción, juicio, apelaciones y hábeas",
   "confianza": "estimado",
   "periodo": [
    1998,
    2014
   ],
   "en_total": true,
   "usd2025": {
    "p5": 5015282,
    "p50": 6271526,
    "p95": 7884128
   },
   "nominal": {
    "p5": 3079704,
    "p50": 3851119,
    "p95": 4841360
   },
   "factor_2025": 1.628,
   "nota": "Equipo de 3-5 fiscales y apoyo hasta la sentencia (2,75 años) y 0,5-1,5 a tiempo completo durante 13 años de apelaciones, resentencias y hábeas.",
   "fuentes": [
    "campa_2008",
    "jurist_2009"
   ]
  },
  {
   "id": "us_defensa_juicio",
   "libro": "eeuu",
   "nombre": "Defensa de oficio en primera instancia (CJA + defensor público)",
   "confianza": "estimado",
   "periodo": [
    1998,
    2001
   ],
   "en_total": true,
   "usd2025": {
    "p5": 2811213,
    "p50": 3411219,
    "p95": 4078548
   },
   "nominal": {
    "p5": 1480562,
    "p50": 1796563,
    "p95": 2148020
   },
   "factor_2025": 1.899,
   "nota": "Cuatro abogados del panel CJA (tarifa 50-75 USD/h en 2000-2001) más un defensor público, peritos, investigadores y declaraciones tomadas en Cuba.",
   "fuentes": [
    "herald_2001",
    "cja_txs"
   ]
  },
  {
   "id": "us_defensa_apel",
   "libro": "eeuu",
   "nombre": "Defensa en apelaciones y hábeas (2002-2014)",
   "confianza": "estimado",
   "periodo": [
    2002,
    2014
   ],
   "en_total": true,
   "usd2025": {
    "p5": 556057,
    "p50": 1137573,
    "p95": 1945165
   },
   "nominal": {
    "p5": 359828,
    "p50": 736131,
    "p95": 1258730
   },
   "factor_2025": 1.545,
   "nota": "Fuente de financiación no confirmada: parte fue trabajo pro bono o privado (Weinglass, Akin Gump). Rango amplio por esa razón.",
   "fuentes": [
    "scotus_appendix",
    "weinglass"
   ]
  },
  {
   "id": "us_tribunal",
   "libro": "eeuu",
   "nombre": "Tribunal: siete meses de juicio, jurado, alguaciles y seguridad",
   "confianza": "estimado",
   "periodo": [
    2000,
    2001
   ],
   "en_total": true,
   "usd2025": {
    "p5": 1025632,
    "p50": 1673656,
    "p95": 2546191
   },
   "nominal": {
    "p5": 556283,
    "p50": 907759,
    "p95": 1381004
   },
   "factor_2025": 1.844,
   "nota": "Juicio de unos siete meses, el más largo del país en su momento según varias fuentes; más de 20.000 páginas de pruebas.",
   "fuentes": [
    "kimber_trial",
    "wiki_cuban5"
   ]
  },
  {
   "id": "us_carcel",
   "libro": "eeuu",
   "nombre": "Custodia y prisión (77,3 años-persona)",
   "confianza": "calculado",
   "periodo": [
    1998,
    2014
   ],
   "en_total": true,
   "usd2025": {
    "p5": 3361065,
    "p50": 3747417,
    "p95": 4233587
   },
   "nominal": {
    "p5": 2063910,
    "p50": 2301154,
    "p95": 2599694
   },
   "factor_2025": 1.628,
   "nota": "Días de custodia de cada uno multiplicados por la tarifa media anual de la Oficina de Prisiones (COIF), interpolada entre los años publicados. El multiplicador 1,0-1,4 cubre el sobrecoste de las prisiones de alta seguridad.",
   "fuentes": [
    "bop_2003",
    "bop_2008",
    "uscourts_2010",
    "bop_2015"
   ]
  },
  {
   "id": "us_libertad_sup",
   "libro": "eeuu",
   "nombre": "Libertad supervisada de René González (2011-2013)",
   "confianza": "calculado",
   "periodo": [
    2011,
    2013
   ],
   "en_total": true,
   "usd2025": {
    "p5": 8854,
    "p50": 8854,
    "p95": 8854
   },
   "nominal": {
    "p5": 6301,
    "p50": 6301,
    "p95": 6301
   },
   "factor_2025": 1.405,
   "nota": "Unos 1,6 años a 10,79 USD/día (coste de supervisión federal en 2010).",
   "fuentes": [
    "uscourts_2010",
    "ips_rene"
   ]
  },
  {
   "id": "cu_red",
   "libro": "cuba",
   "nombre": "Operación de la Red Avispa (14 miembros, ~1992-1998)",
   "confianza": "estimado",
   "periodo": [
    1992,
    1998
   ],
   "en_total": true,
   "usd2025": {
    "p5": 3598062,
    "p50": 5329763,
    "p95": 7425981
   },
   "nominal": {
    "p5": 1697155,
    "p50": 2513974,
    "p95": 3502731
   },
   "factor_2025": 2.12,
   "nota": "Anclaje: un agente vivía con un presupuesto de 30.935 USD asignado por La Habana en 1996. Varios agentes tenían dos empleos para pagar el alquiler. Se suma el apoyo desde La Habana (control, radio, formación).",
   "fuentes": [
    "ap_2000_budget",
    "guardian_lowbudget",
    "cubanet_14"
   ]
  },
  {
   "id": "cu_visitas",
   "libro": "cuba",
   "nombre": "Viajes de familiares a las prisiones",
   "confianza": "estimado",
   "periodo": [
    2001,
    2014
   ],
   "en_total": true,
   "usd2025": {
    "p5": 529466,
    "p50": 814275,
    "p95": 1211982
   },
   "nominal": {
    "p5": 338359,
    "p50": 520368,
    "p95": 774526
   },
   "factor_2025": 1.565,
   "nota": "Menos de una visita al año por preso de media, según grupos de apoyo; a Olga Salanueva y Adriana Pérez se les negó el visado repetidamente. Se asume que el Estado cubano pagó los viajes.",
   "fuentes": [
    "amnesty_2009",
    "bulatlat"
   ]
  },
  {
   "id": "cu_legal",
   "libro": "cuba",
   "nombre": "Apoyo legal pagado por Cuba",
   "confianza": "no_cuantificado",
   "periodo": [
    2001,
    2014
   ],
   "en_total": false,
   "usd2025": {
    "p5": 234103,
    "p50": 861878,
    "p95": 1875698
   },
   "nominal": {
    "p5": 149605,
    "p50": 550789,
    "p95": 1198678
   },
   "factor_2025": 1.565,
   "nota": "No hay prueba de que Cuba pagara la defensa del juicio, que fue de oficio. Este rango cubre posibles pagos en apelaciones y no debe leerse como cifra.",
   "fuentes": [
    "herald_2001"
   ]
  },
  {
   "id": "cu_coloquios",
   "libro": "cuba",
   "nombre": "Coloquios internacionales de Holguín (9 ediciones)",
   "confianza": "estimado",
   "periodo": [
    2005,
    2013
   ],
   "en_total": true,
   "usd2025": {
    "p5": 1868271,
    "p50": 3060275,
    "p95": 4660857
   },
   "nominal": {
    "p5": 1246813,
    "p50": 2042311,
    "p95": 3110479
   },
   "factor_2025": 1.498,
   "nota": "300-413 delegados de unos 50 países por edición, más marchas y actos locales. Los delegados pagaban en general su propio vuelo; Cuba cubría la logística en la isla.",
   "fuentes": [
    "rebelion_vi",
    "rebelion_vii",
    "vermelho_viii",
    "counterpunch_ix"
   ]
  },
  {
   "id": "cu_embajadas",
   "libro": "cuba",
   "nombre": "Red exterior: embajadas, ICAP y apoyo a comités",
   "confianza": "estimado",
   "periodo": [
    2001,
    2014
   ],
   "en_total": true,
   "usd2025": {
    "p5": 12433250,
    "p50": 31885039,
    "p95": 63556457
   },
   "nominal": {
    "p5": 7945556,
    "p50": 20376360,
    "p95": 40616203
   },
   "factor_2025": 1.565,
   "nota": "833 países-año con actividad documentada (comités en 27 países en 2006 y en unos 110 en 2011-2012), por un gasto marginal de 4.000-60.000 USD por país y año. No existe desglose por embajada.",
   "fuentes": [
    "wiki2006",
    "rebelion_346",
    "rebelion_2000asoc"
   ]
  },
  {
   "id": "cu_giras",
   "libro": "cuba",
   "nombre": "Giras internacionales de familiares y jornadas en Washington y Londres",
   "confianza": "estimado",
   "periodo": [
    2003,
    2014
   ],
   "en_total": true,
   "usd2025": {
    "p5": 694884,
    "p50": 1231896,
    "p95": 1955062
   },
   "nominal": {
    "p5": 455665,
    "p50": 807807,
    "p95": 1282018
   },
   "factor_2025": 1.525,
   "nota": "Giras de madres y esposas, las jornadas «5 días por los 5» (2012-2014) y la comisión de Londres (2014); parte las costearon los comités.",
   "fuentes": [
    "rebelion_5dias",
    "watching_londres"
   ]
  },
  {
   "id": "cu_interna",
   "libro": "cuba",
   "nombre": "Propaganda interna: gasto en divisas",
   "confianza": "estimado",
   "periodo": [
    2001,
    2014
   ],
   "en_total": true,
   "usd2025": {
    "p5": 5565456,
    "p50": 10871130,
    "p95": 18416532
   },
   "nominal": {
    "p5": 3556644,
    "p50": 6947273,
    "p95": 11769215
   },
   "factor_2025": 1.565,
   "nota": "Solo el gasto en divisas (papel, tinta, vallas, equipos, combustible). Las horas de trabajo movilizadas se pagaban en CUP y no se suman en dólares: ver la nota sobre coste de oportunidad.",
   "fuentes": [
    "cubanet_mesa",
    "cubanet_batalla"
   ]
  },
  {
   "id": "cu_post2014",
   "libro": "cuba",
   "nombre": "Recibimientos, actos y giras tras el regreso (2015-2016)",
   "confianza": "estimado",
   "periodo": [
    2015,
    2016
   ],
   "en_total": true,
   "usd2025": {
    "p5": 457453,
    "p50": 935598,
    "p95": 1679978
   },
   "nominal": {
    "p5": 338891,
    "p50": 693112,
    "p95": 1244565
   },
   "factor_2025": 1.35,
   "nota": "Los cargos posteriores (ICAP, CDR, ANEC) son puestos ordinarios y no se cuentan como coste del caso.",
   "fuentes": [
    "ecured_fgl",
    "periodicocubano_cdr"
   ]
  }
 ],
 "sensibilidad": [
  {
   "id": "cu_embajadas",
   "cuota_varianza": 0.88
  },
  {
   "id": "cu_interna",
   "cuota_varianza": 0.054
  },
  {
   "id": "us_fbi",
   "cuota_varianza": 0.053
  },
  {
   "id": "cu_red",
   "cuota_varianza": 0.005
  },
  {
   "id": "us_fiscalia",
   "cuota_varianza": 0.003
  },
  {
   "id": "cu_coloquios",
   "cuota_varianza": 0.002
  },
  {
   "id": "us_defensa_juicio",
   "cuota_varianza": 0.001
  },
  {
   "id": "us_defensa_apel",
   "cuota_varianza": 0.001
  },
  {
   "id": "us_tribunal",
   "cuota_varianza": 0.001
  },
  {
   "id": "cu_giras",
   "cuota_varianza": 0.001
  },
  {
   "id": "us_carcel",
   "cuota_varianza": 0.0
  },
  {
   "id": "us_libertad_sup",
   "cuota_varianza": 0.0
  },
  {
   "id": "cu_visitas",
   "cuota_varianza": 0.0
  },
  {
   "id": "cu_post2014",
   "cuota_varianza": 0.0
  }
 ],
 "encarcelamiento": {
  "coif_anclas": [
   {
    "anio": 2003,
    "usd": 23181,
    "confianza": "confirmado",
    "fuente": "bop_2003"
   },
   {
    "anio": 2008,
    "usd": 25895,
    "confianza": "confirmado",
    "fuente": "bop_2008"
   },
   {
    "anio": 2010,
    "usd": 28284,
    "confianza": "reportado",
    "fuente": "uscourts_2010"
   },
   {
    "anio": 2015,
    "usd": 31978,
    "confianza": "confirmado",
    "fuente": "bop_2015"
   }
  ],
  "personas": [
   {
    "nombre": "René González",
    "condena": "15 años",
    "salida": "2011-10-07",
    "motivo_salida": "fin de condena",
    "anios_custodia": 13.07,
    "confianza": "calculado"
   },
   {
    "nombre": "Fernando González",
    "condena": "19 años, rebajados a 17 años y 9 meses",
    "salida": "2014-02-27",
    "motivo_salida": "fin de condena y deportación",
    "anios_custodia": 15.46,
    "confianza": "calculado"
   },
   {
    "nombre": "Gerardo Hernández",
    "condena": "dos cadenas perpetuas más 15 años",
    "salida": "2014-12-17",
    "motivo_salida": "canje",
    "anios_custodia": 16.26,
    "confianza": "calculado"
   },
   {
    "nombre": "Ramón Labañino",
    "condena": "perpetua, rebajada a 30 años",
    "salida": "2014-12-17",
    "motivo_salida": "canje",
    "anios_custodia": 16.26,
    "confianza": "calculado"
   },
   {
    "nombre": "Antonio Guerrero",
    "condena": "perpetua, rebajada a 21 años y 10 meses",
    "salida": "2014-12-17",
    "motivo_salida": "canje",
    "anios_custodia": 16.26,
    "confianza": "calculado"
   }
  ],
  "total_persona_anios": 77.31,
  "base_nominal_usd": 1955978,
  "base_usd2025": 3139264,
  "multiplicador_alta_seguridad": [
   1.0,
   1.15,
   1.4
  ]
 },
 "correcciones": [
  {
   "confianza": "reportado",
   "antes": "Cuba pagó buena parte de los abogados.",
   "ahora": "Cuatro de los cinco tuvieron abogados privados designados y pagados por el tribunal; el quinto, un defensor público. La defensa del juicio la pagó el contribuyente de EE. UU.",
   "fuentes": [
    "herald_2001"
   ]
  },
  {
   "confianza": "reportado",
   "antes": "Montar la Red Avispa costó de 8 a 20 millones.",
   "ahora": "Era una operación de bajo presupuesto: un agente vivía con 30.935 USD al año y varios tenían dos empleos. El modelo da 1,7–3,5 millones de la época (3,6–7,4 en dólares de 2025).",
   "fuentes": [
    "ap_2000_budget",
    "guardian_lowbudget"
   ]
  },
  {
   "confianza": "reportado",
   "antes": "Visitas familiares periódicas: 6 a 13 millones.",
   "ahora": "A dos esposas se les negó el visado durante años y la media fue de menos de una visita anual por preso. El modelo da menos de un millón.",
   "fuentes": [
    "amnesty_2009",
    "bulatlat"
   ]
  },
  {
   "confianza": "reportado",
   "antes": "El anuncio del New York Times formó parte del gasto del régimen.",
   "ahora": "Se pagó con colectas de comités (meta de 50.000 USD, 10.000 de grupos de Miami). Queda fuera de los dos libros.",
   "fuentes": [
    "greenleft_nyt",
    "herald_2004"
   ]
  },
  {
   "confianza": "confirmado",
   "antes": "Los Cinco salieron juntos en 2014 y uno fue vicepresidente del ICAP.",
   "ahora": "René salió en 2011 y Fernando en febrero de 2014; solo tres llegaron con el canje. Fernando González preside el ICAP desde 2017.",
   "fuentes": [
    "voa_2014",
    "ecured_fgl"
   ]
  }
 ],
 "borrador_original": {
  "campana_cuba_usd": [
   46000000,
   124000000
  ],
  "red_avispa_usd": [
   8400000,
   20300000
  ],
  "confianza": "estimado"
 },
 "conexos": [
  {
   "id": "cx_gross",
   "nombre": "Acuerdo USAID-DAI por Alan Gross",
   "confianza": "confirmado",
   "valor_usd": 3200000.0,
   "anio": 2014,
   "nota": "Pago de USAID en diciembre de 2014 dentro de un acuerdo con DAI, que reclamaba 7 millones. Está ligado al canje, pero lo causó la detención de Gross, no el caso de los Cinco. Se muestra aparte.",
   "fuentes": [
    "npr_gross",
    "tablet_gross"
   ]
  },
  {
   "id": "cx_ocb",
   "nombre": "Pagos de Radio y TV Martí a periodistas de Miami",
   "confianza": "no_cuantificado",
   "valor_usd": null,
   "anio": null,
   "nota": "Documentados por solicitudes FOIA y citados en el hábeas. Eran pagos por colaborar con Radio y TV Martí, no por cubrir el juicio, así que su atribución al caso es discutida. Una cifra de 175.000 USD a un periodista circula sin documento primario a la vista.",
   "fuentes": [
    "nyt_ocb",
    "justiceonline",
    "havanatimes_habeas"
   ]
  },
  {
   "id": "cx_anuncios",
   "nombre": "Anuncios en NYT (2004) y Washington Post (2013)",
   "confianza": "reportado",
   "valor_usd": 50000.0,
   "anio": 2004,
   "nota": "Pagados con colectas de comités: la meta era 50.000 USD y 10.000 los aportaron grupos de Miami. No consta financiación del Estado cubano; no es coste de ningún gobierno.",
   "fuentes": [
    "greenleft_nyt",
    "herald_2004",
    "havanatimes_wapo"
   ]
  }
 ],
 "sin_precio": [
  {
   "titulo": "El tiempo movilizado en Cuba",
   "texto": "Marchas, tribunas, actos escolares y horas de televisión se pagaban en pesos cubanos. Pasarlos a dólares al cambio oficial o al informal mueve el resultado en un orden de magnitud, así que el modelo solo suma el gasto en divisas y deja este coste de oportunidad sin cifra."
  },
  {
   "titulo": "Los cuatro muertos del 24 de febrero de 1996",
   "texto": "Gerardo Hernández fue condenado por conspiración para asesinato por el derribo de las avionetas de Hermanos al Rescate; Cuba lo niega. Ninguna cifra de este modelo mide esas vidas."
  },
  {
   "titulo": "Las familias",
   "texto": "Años sin visitas y una pareja que no se vio en dieciséis años no aparecen en ningún libro de cuentas."
  },
  {
   "titulo": "El valor de inteligencia",
   "texto": "No se estima lo que obtuvo Cuba de la red ni lo que ganó EE. UU. con su desarticulación, incluido el papel de Rolando Sarraff, liberado en el mismo canje."
  }
 ],
 "textos": {
  "intro_correcciones": "El punto de partida fue un bosquejo que situaba la campaña cubana entre 46 y 124 millones y la Red Avispa entre 8 y 20 millones. Al contrastarlo con fuentes, cinco de sus supuestos no se sostienen.",
  "intro_sensibilidad": "Una sola partida explica casi toda la incertidumbre del total, y es justo la que menos documentación tiene: el gasto marginal de la red exterior cubana. Si algún día se publica el presupuesto del ICAP o de las embajadas para la campaña, el intervalo se estrechará más que con cualquier otro dato.",
  "carcel": [
   "El encarcelamiento es la única partida grande que se puede reconstruir con números oficiales. La Oficina de Prisiones publica cada año el coste medio de un recluso; multiplicado por los días que pasó cada uno bajo custodia, sale la base en dólares de cada año.",
   "Los cinco pasaron la mayor parte del tiempo en prisiones de alta seguridad, más caras que la media, por eso el modelo aplica un multiplicador de 1,0 a 1,4. Incluso con él, la cárcel pesa menos que la investigación o la fiscalía: lo caro fue el proceso, no la condena."
  ],
  "intro_conexos": "Tres gastos aparecen a menudo junto a este caso. Están ligados a él, pero sumarlos inflaría la cifra con costes que tienen otra causa o que no pagó ningún gobierno."
 },
 "leyendas": {
  "totales": "Cada número es la mediana de 200.000 simulaciones; debajo va el intervalo que contiene el 90 % de ellas. Ninguno de los dos gobiernos ha publicado estos gastos: casi todo es estimación con anclas documentadas, no contabilidad.",
  "partidas": "Millones de USD de 2025, eje lineal. Cada partida se distribuye por igual entre sus años y se deflacta con el IPC-U del BLS. Las distribuciones son triangulares (mínimo, moda, máximo) salvo el encarcelamiento, que es un cálculo con tarifas publicadas y un multiplicador por prisiones de alta seguridad. Las partidas sin cuantificar se muestran atenuadas y no se suman.",
  "sensibilidad": "Cuota de la varianza del total explicada por cada partida. Las partidas son independientes, así que las cuotas suman cerca de 1. Se muestran las seis mayores.",
  "tabla": "Millones de USD de 2025. Las filas atenuadas no entran en el total."
 },
 "metodologia": {
  "iteraciones": 200000,
  "semilla": 1998,
  "deflactor": "IPC-U del BLS, media anual, llevado a 2025 (321,943).",
  "notas": [
   "Monte Carlo con partidas independientes; el intervalo publicado es el percentil 5 a 95.",
   "Cada partida se reparte por igual entre los años de su periodo para deflactarla.",
   "Encarcelamiento: días exactos de custodia desde el 12 de septiembre de 1998 hasta cada salida, por la tarifa COIF del año, interpolada entre los años publicados y extrapolada antes de 2003.",
   "Red exterior: países con actividad documentada interpolados entre 12 (2001), 27 (2006), 110 (2011) y 111 (2014), unos 833 países-año. El gasto marginal por país y año es el supuesto más débil del modelo."
  ],
  "falsacion": "Si un presupuesto oficial cubano o un informe del Departamento de Justicia sitúa cualquier partida fuera de su rango del 90 %, esa partida y el total deben recalcularse y la corrección se publica en el tema.",
  "pendientes": [
   "Las tarifas CJA proceden del distrito sur de Texas como aproximación; las del distrito sur de Florida en 2000-2001 deben verificarse."
  ]
 },
 "fuentes": [
  {
   "id": "herald_2001",
   "titulo": "Miami Herald (vía CubaNet), «Cuban justice?», 8 ene 2001",
   "url": "https://www.cubanet.org/htdocs/CNews/y01/jan01/08e9.htm"
  },
  {
   "id": "cja_txs",
   "titulo": "Tribunal federal S.D. Texas: histórico de tarifas CJA",
   "url": "https://www.txs.uscourts.gov/node/1189"
  },
  {
   "id": "campa_2008",
   "titulo": "U.S. v. Campa, 529 F.3d 980 (11.º Circuito, 2008)",
   "url": "https://donohueintellaw.ll.georgetown.edu/sites/default/files/assets/U.S.%20v.%20Campa%2C%20529%20F.3d%20980.pdf"
  },
  {
   "id": "jurist_2009",
   "titulo": "JURIST: resentencias de diciembre de 2009",
   "url": "https://www.jurist.org/news/2009/12/federal-judge-reduces-sentences-of/"
  },
  {
   "id": "scotus_appendix",
   "titulo": "Petición de certiorari Campa et al. v. US (2009), apéndice",
   "url": "https://www.scotusblog.com/wp-content/uploads/2009/01/campa-et-al-v-us_petition-appendix.pdf"
  },
  {
   "id": "weinglass",
   "titulo": "Green Left: Leonard Weinglass, abogado de Antonio Guerrero",
   "url": "https://greenleft.org.au/node/51143"
  },
  {
   "id": "kimber_trial",
   "titulo": "Stephen Kimber: inicio del juicio, 6 dic 2000",
   "url": "https://stephenkimber.com/day-in-the-five-the-trial-begins/"
  },
  {
   "id": "wiki_cuban5",
   "titulo": "Wikipedia: Cuban Five",
   "url": "https://en.wikipedia.org/wiki/Cuban_Five"
  },
  {
   "id": "bop_2003",
   "titulo": "Federal Register: COIF 2003 (23.181 USD)",
   "url": "https://regulations.vlex.com/vid/inmate-incarceration-inmates-average-22698509"
  },
  {
   "id": "bop_2008",
   "titulo": "Federal Register: COIF 2008 (25.895 USD)",
   "url": "https://regulations.justia.com/regulations/fedreg/agencies/prisons-bureau/2009/07?registers=between"
  },
  {
   "id": "uscourts_2010",
   "titulo": "US Courts vía beSpacific: costes de prisión y supervisión 2010",
   "url": "https://bespacific.com/?p=27647"
  },
  {
   "id": "bop_2015",
   "titulo": "Federal Register: COIF 2015 (31.977,65 USD)",
   "url": "https://www.federalregister.gov/documents/2016/07/19/2016-17040/annual-determination-of-average-cost-of-incarceration"
  },
  {
   "id": "ips_rene",
   "titulo": "IPS-DC: liberación de René González y regreso a Cuba",
   "url": "https://ips-dc.org/an_interview_with_rene_gonzalez_of_the_cuban_5/"
  },
  {
   "id": "ap_2000_budget",
   "titulo": "AP vía CubaNet: presupuesto de 30.935 USD en 1996",
   "url": "https://www.cubanet.org/htdocs/CNews/y00/dec00/21e2.htm"
  },
  {
   "id": "guardian_lowbudget",
   "titulo": "CubaNet (prensa británica): espionaje de bajo presupuesto",
   "url": "https://www.cubanet.org/htdocs/CNews/y01/mar01/06e5.htm"
  },
  {
   "id": "cubanet_14",
   "titulo": "AP vía CubaNet: red de 14 miembros, 5 cooperaron, 4 prófugos",
   "url": "https://www.cubanet.org/htdocs/CNews/y00/dec00/07e5.htm"
  },
  {
   "id": "amnesty_2009",
   "titulo": "Amnistía Internacional: visados denegados a las esposas (2009)",
   "url": "https://www.amnesty.org/es/latest/news/2009/03/miami-five-wives-again-denied-visas-visit-their-husbands-20090326/"
  },
  {
   "id": "bulatlat",
   "titulo": "Bulatlat: visitas familiares de media inferiores a una al año",
   "url": "https://www.bulatlat.com/?p=52345"
  },
  {
   "id": "rebelion_vi",
   "titulo": "Rebelión: VI Coloquio de Holguín, 325 delegados de 50 países",
   "url": "https://rebelion.org/?p=509101"
  },
  {
   "id": "rebelion_vii",
   "titulo": "Rebelión: declaración del VII Coloquio, 413 delegados",
   "url": "https://rebelion.org/declaracion-final-vii-coloquio-internacional-por-la-liberacion-de-los-cinco-heroes-y-contra-el-terrorismo/"
  },
  {
   "id": "vermelho_viii",
   "titulo": "Vermelho: VIII Coloquio (2012)",
   "url": "https://vermelho.org.br/?p=260008"
  },
  {
   "id": "counterpunch_ix",
   "titulo": "CounterPunch: IX Coloquio (2013)",
   "url": "https://www.counterpunch.org/2013/12/03/obama-give-me-five/"
  },
  {
   "id": "wiki2006",
   "titulo": "Wikipedia (versión 2006): grupos de apoyo en 27 países",
   "url": "https://wikipedia2006.classicistranieri.com/en/c/u/b/Cuban_Five_83be.html"
  },
  {
   "id": "rebelion_346",
   "titulo": "Rebelión: más de 346 comités en 110 países (2011)",
   "url": "https://rebelion.org/?p=528745"
  },
  {
   "id": "rebelion_2000asoc",
   "titulo": "Rebelión: más de 300 comités en 111 países; los Cinco como frente del ICAP",
   "url": "https://rebelion.org/2-000-asociaciones-de-152-paises-trabajan-en-la-solidaridad-con-cuba/"
  },
  {
   "id": "rebelion_5dias",
   "titulo": "Rebelión: II jornadas «5 días por los 5» en Washington",
   "url": "https://rebelion.org/?p=562200"
  },
  {
   "id": "watching_londres",
   "titulo": "Comisión Internacional de Londres (2014)",
   "url": "https://watchingamerica.com/?p=234386"
  },
  {
   "id": "cubanet_mesa",
   "titulo": "CubaNet: la Mesa Redonda nace con la Batalla de Ideas",
   "url": "https://www.cubanet.org/htdocs/CNews/y01/jun01/28o4.htm"
  },
  {
   "id": "cubanet_batalla",
   "titulo": "CubaNet: «Paisaje después de la batalla»",
   "url": "https://www.cubanet.org/paisaje-despues-de-la-batalla/"
  },
  {
   "id": "ecured_fgl",
   "titulo": "EcuRed: Fernando González Llort, presidente del ICAP (2017)",
   "url": "https://www.ecured.cu/Fernando_Gonz%C3%A1lez_Sehwerert"
  },
  {
   "id": "periodicocubano_cdr",
   "titulo": "Periódico Cubano: Gerardo Hernández en los CDR",
   "url": "https://www.periodicocubano.com/?p=216171"
  },
  {
   "id": "npr_gross",
   "titulo": "NPR: USAID pagará 3,2 millones a Alan Gross",
   "url": "https://www.npr.org/sections/thetwo-way/2014/12/24/372900319/contractor-freed-by-cuba-will-get-3-2m-from-u-s"
  },
  {
   "id": "tablet_gross",
   "titulo": "Tablet: acuerdo sobre una reclamación de 7 millones de DAI",
   "url": "https://www.tabletmag.com/sections/news/articles/u-s-to-pay-alan-gross-3-2-million"
  },
  {
   "id": "nyt_ocb",
   "titulo": "ZNet (cita al NYT de 2006): pagos de la OCB a periodistas",
   "url": "https://znetwork.org/znetarticle/the-cuban-5-victims-of-us-state-terrorism-by-stephen-lendman"
  },
  {
   "id": "justiceonline",
   "titulo": "PCJF: contratos FOIA entre Radio/TV Martí y periodistas",
   "url": "https://www.justiceonline.org/?p=3432"
  },
  {
   "id": "havanatimes_habeas",
   "titulo": "Havana Times: el hábeas de Gerardo Hernández",
   "url": "https://havanatimes.org/?p=77088"
  },
  {
   "id": "washtimes_2001",
   "titulo": "Washington Times: más de 10.000 páginas recogidas por el FBI",
   "url": "https://www.washingtontimes.com/news/2001/sep/1/20010901-025143-4234r/"
  },
  {
   "id": "greenleft_nyt",
   "titulo": "Green Left: colecta de 50.000 USD para el anuncio del NYT",
   "url": "https://greenleft.org.au/node/36257"
  },
  {
   "id": "herald_2004",
   "titulo": "Miami Herald (vía CubaNet): 10.000 USD de grupos de Miami",
   "url": "https://www.cubanet.org/htdocs/CNews/y04/mar04/08e4.htm"
  },
  {
   "id": "havanatimes_wapo",
   "titulo": "Havana Times: anuncio en el Washington Post (2013)",
   "url": "https://havanatimes.org/?p=68612"
  },
  {
   "id": "voa_2014",
   "titulo": "VOA: liberación de Fernando González, feb 2014",
   "url": "https://www.globalsecurity.org/intell/library/news/2014/intell-140227-voa02.htm"
  },
  {
   "id": "cnn_sarraff",
   "titulo": "CNN: Rolando Sarraff Trujillo en el canje",
   "url": "https://edition.cnn.com/2014/12/18/world/americas/cuba-us-agent-released"
  },
  {
   "id": "wgad",
   "titulo": "COHA: opinión 19/2005 del Grupo de Trabajo de la ONU",
   "url": "https://coha.org/chronology-in-the-case-of-the-cuban-five/"
  },
  {
   "id": "cpi",
   "titulo": "BLS: tabla histórica CPI-U, medias anuales",
   "url": "https://www.bls.gov/regions/midwest/data/consumerpriceindexhistorical_us_table.pdf"
  }
 ]
};
