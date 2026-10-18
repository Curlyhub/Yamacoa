import { Link } from "react-router-dom";
import { BotonPlay } from "./Reproductor";
import { fraccionVida, textoCaduca, mesAnio, minutos } from "./feed";

/* Piezas compartidas por portada y landings. Una sola forma de pintar cada
   tipología en todo el sitio: así el origen (auto / dirigido / podcast) se lee
   igual en cualquier página. */

export const rutaNoticia = (n) => `/noticias/${n.slug}`;
export const rutaEstudio = (e) => `/estudios/${e.slug}`;
export const rutaEpisodio = (p) => `/podcast/${p.slug}`;

export function pistaDe(item, tipo) {
  const audio = item?.audio?.url || item?.audio;
  if (!audio) return null;
  return { id: `${tipo}:${item.id || item.slug}`, titulo: item.titulo, tipo, audio };
}

export function Vida({ caduca }) {
  return (
    <>
      <div className="y-vida" aria-hidden="true">
        <i style={{ width: `${fraccionVida(caduca) * 100}%` }} />
      </div>
      <div className="y-meta" style={{ marginTop: 8 }}>{textoCaduca(caduca)}</div>
    </>
  );
}

export const PLANTILLA = { cronica: "Crónica", breve: "Breve · última hora", datos: "El dato", contraste: "Contraste" };

export function MetaNoticia({ n }) {
  const partes = [n.seccion, n.plantilla && n.plantilla !== "cronica" ? PLANTILLA[n.plantilla].split(" ·")[0] : null, n.fuentes?.length ? `${n.fuentes.length} fuentes` : null, textoCaduca(n.caduca)];
  return <span className="y-meta">{partes.filter(Boolean).join(" · ")}</span>;
}

export function Confianza({ valor }) {
  if (!valor) return null;
  const txt = { corroborada: "Corroborada", no_confirmada: "No confirmada", en_desarrollo: "En desarrollo" }[valor] || valor;
  return <span className={`y-confianza y-confianza--${valor}`}>{txt}</span>;
}

// En la portada van tres en fila: la barra de vida se ancla al pie (margin-top:auto) para que
// las tres queden alineadas aunque los títulos tengan distinto número de líneas.
export function NoticiaColumna({ n }) {
  return (
    <article style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <p className="y-eyebrow">{n.seccion}</p>
      <h3 style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.22, letterSpacing: "-.01em", margin: "8px 0 0" }}>
        <Link className="y-link" to={rutaNoticia(n)}>{n.titulo}</Link>
      </h3>
      <div style={{ marginTop: "auto", paddingTop: 4 }}><Vida caduca={n.caduca} /></div>
    </article>
  );
}

export function TarjetaEstudio({ e, rotulo = "Estudio automático" }) {
  return (
    <Link to={rutaEstudio(e)} className="y-card y-card--auto">
      <p className="y-eyebrow">{rotulo}</p>
      <h3 className="y-card-t">{e.titulo}</h3>
      <p className="y-card-p" style={{ color: "var(--y-auto-ink)" }}>
        Generado a partir de {e.noticias?.length || 0} noticias{e.seccion ? ` sobre ${e.seccion.toLowerCase()}` : ""}.
      </p>
      <p style={{ margin: "14px 0 0", fontWeight: 600, fontSize: 14, color: "var(--y-auto-head)" }}>Abrir estudio →</p>
    </Link>
  );
}

export function TarjetaExpediente({ t, compacta = false }) {
  return (
    <Link to={t.path} className="y-card" style={compacta ? { padding: "18px 20px" } : undefined}>
      <span className="y-badge y-badge--dir">{etiquetaCorta(t.etiqueta)}</span>
      <h3 className="y-card-t" style={{ fontSize: compacta ? 17 : 19, fontWeight: 700 }}>{t.titulo}</h3>
      {!compacta && t.subtitulo && <p className="y-card-p">{recorta(t.subtitulo, 140)}</p>}
      {t.publicado && <p className="y-meta" style={{ margin: "12px 0 0" }}>{mesAnio(t.publicado)}</p>}
    </Link>
  );
}

export function BloquePodcast({ p, rotulo = "Podcast" }) {
  if (!p) return null;
  return (
    <div className="y-card y-card--pod" style={{ borderRadius: 28 }}>
      <p className="y-eyebrow">{rotulo} · {p.tipo}</p>
      <h3 className="y-card-t" style={{ color: "var(--y-pod-ink)", fontSize: 21 }}>
        <Link className="y-link" to={rutaEpisodio(p)}>{p.titulo}</Link>
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
        <BotonPlay pista={pistaDe(p, `Podcast · ${p.tipo}`)} />
        <span className="y-meta" style={{ color: "var(--y-pod-sec)" }}>{minutos(p.duracion)}</span>
      </div>
    </div>
  );
}

export function Vacio({ children }) {
  return <div className="y-vacio">{children}</div>;
}

export function etiquetaCorta(etq = "") {
  return String(etq).split("·")[0].trim();
}

export function recorta(s = "", n = 160) {
  return s.length > n ? s.slice(0, s.lastIndexOf(" ", n)) + "…" : s;
}
