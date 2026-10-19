import { useEffect, useRef, useState } from "react";

/* Botón «Compartir» de expedientes (franja de Layout), noticias, episodios y artículos de
   opinión. Estilos en Layout.jsx (.yl-comp*); `oscuro` para la cabecera marrón del podcast.
   En el móvil abre la hoja nativa del sistema (navigator.share: WhatsApp, Telegram, Signal…
   lo que el lector tenga instalado); en el escritorio, o si el lector la cierra sin elegir,
   un menú con las redes que más se usan desde y hacia Cuba. Solo enlaces de intención: ningún script ni píxel de terceros se carga
   en la página. La tarjeta que ven las redes (título, imagen) la sirve functions/_middleware.js. */

const REDES = [
  { id: "whatsapp", t: "WhatsApp", href: (u, x) => `https://wa.me/?text=${enc(`${x} ${u}`)}` },
  { id: "telegram", t: "Telegram", href: (u, x) => `https://t.me/share/url?url=${enc(u)}&text=${enc(x)}` },
  { id: "facebook", t: "Facebook", href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}` },
  { id: "x", t: "X (Twitter)", href: (u, x) => `https://twitter.com/intent/tweet?text=${enc(x)}&url=${enc(u)}` },
  { id: "correo", t: "Correo", href: (u, x) => `mailto:?subject=${enc(x)}&body=${enc(u)}` },
];
const enc = encodeURIComponent;
const esTactil = () => typeof window !== "undefined" && window.matchMedia?.("(pointer:coarse)").matches;

export default function Compartir({ titulo, oscuro = false }) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const caja = useRef(null);
  const url = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
  const texto = `${titulo} · Yamacoa`;

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e) => { if (!caja.current?.contains(e.target)) setAbierto(false); };
    const esc = (e) => { if (e.key === "Escape") setAbierto(false); };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", fuera); document.removeEventListener("keydown", esc); };
  }, [abierto]);

  async function pulsar() {
    if (!abierto && esTactil() && navigator.share) {
      try { await navigator.share({ title: texto, text: texto, url }); return; }
      catch (e) { if (e?.name === "AbortError") return; } // cerrada a propósito: no insistir
    }
    setAbierto((v) => !v);
  }

  async function copiar() {
    try { await navigator.clipboard.writeText(url); }
    catch { window.prompt("Copia el enlace:", url); return; }
    setCopiado(true);
    setTimeout(() => { setCopiado(false); setAbierto(false); }, 1400);
  }

  return (
    <span className={"yl-comp" + (oscuro ? " yl-comp--osc" : "")} ref={caja}>
      <button type="button" className="yl-comp-btn" aria-haspopup="menu" aria-expanded={abierto}
        aria-label={`Compartir ${titulo}`} onClick={pulsar}>Compartir</button>
      {abierto && (
        <span className="yl-comp-menu" role="menu">
          {REDES.map((r) => (
            <a key={r.id} role="menuitem" href={r.href(url, texto)} target="_blank" rel="noopener noreferrer"
              onClick={() => setAbierto(false)}>{r.t}</a>
          ))}
          <button type="button" role="menuitem" onClick={copiar}>{copiado ? "Enlace copiado ✓" : "Copiar enlace"}</button>
        </span>
      )}
    </span>
  );
}
