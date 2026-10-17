import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { expedientesOrdenados } from "./Portada";
import { TarjetaExpediente, Vacio, etiquetaCorta } from "./piezas";

/* Archivo de expedientes dirigidos (permanentes). Deriva del registry: añadir un
   expediente no toca este archivo. Buscador en vivo + filtro por etiqueta. */

const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const CSS = `
.yx-head{display:flex; justify-content:space-between; align-items:flex-end; gap:20px; flex-wrap:wrap; padding:36px 0 20px;}
.yx-busca{min-width:min(360px,100%); background:var(--y-surface); border:0; border-radius:999px; padding:12px 18px;
  font:500 15px var(--y-font); color:var(--y-ink); box-shadow:var(--y-shadow);}
.yx-chips{display:flex; gap:6px; flex-wrap:wrap; margin-bottom:22px;}
.yx-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:18px;}
@media (max-width:900px){ .yx-grid{grid-template-columns:1fr;} }
`;

export default function Expedientes() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");
  const cats = useMemo(
    () => ["Todos", ...new Set(expedientesOrdenados.map((t) => etiquetaCorta(t.etiqueta)))].slice(0, 14),
    []
  );
  const lista = expedientesOrdenados.filter((t) => {
    if (cat !== "Todos" && etiquetaCorta(t.etiqueta) !== cat) return false;
    if (!q.trim()) return true;
    const h = norm(`${t.titulo} ${t.subtitulo} ${t.etiqueta} ${t.fuentes}`);
    return norm(q).split(/\s+/).every((p) => h.includes(p));
  });

  return (
    <div className="y-wrap">
      <style>{CSS}</style>
      <header className="yx-head">
        <div>
          <p className="y-eyebrow" style={{ color: "var(--y-dir-ink)" }}>Expedientes dirigidos · {expedientesOrdenados.length}</p>
          <h1 className="y-h1" style={{ marginTop: 12 }}>Investigaciones con método.</h1>
          <p className="y-lede" style={{ marginTop: 12, maxWidth: 640 }}>
            Estudios elaborados por la redacción con datos verificados. Contenido permanente.
            {" "}<Link to="/metodologia" className="y-link" style={{ fontWeight: 600 }}>Cómo trabajamos →</Link>
          </p>
        </div>
        <input type="search" className="yx-busca" placeholder="Buscar expediente, tema o fuente…" value={q}
          onChange={(e) => setQ(e.target.value)} aria-label="Buscar expedientes" />
      </header>
      <div className="yx-chips" role="group" aria-label="Filtrar por tema">
        {cats.map((c) => (
          <button key={c} type="button" className="y-chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      {lista.length === 0 ? <Vacio>Ningún expediente coincide con «{q}».</Vacio> : (
        <div className="yx-grid">
          {lista.map((t) => <TarjetaExpediente key={t.id} t={t} />)}
        </div>
      )}
    </div>
  );
}
