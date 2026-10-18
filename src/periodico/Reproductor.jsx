import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { duracion } from "./feed";

/* Reproductor persistente del periódico (handoff 1d/1e).
   Un único <audio> para todo el sitio: sobrevive a la navegación porque vive en
   Layout, fuera de <Routes>. Reproduce episodios de podcast y los resúmenes
   hablados obligatorios de noticias y estudios (pista = { id, titulo, tipo, audio }).
   Guarda la posición por pista en localStorage. */

const Ctx = createContext(null);
const CLAVE = "y-pos:";

function leerPos(id) {
  try {
    return Number(localStorage.getItem(CLAVE + id)) || 0;
  } catch {
    return 0;
  }
}
function guardarPos(id, s) {
  try {
    localStorage.setItem(CLAVE + id, String(Math.floor(s)));
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}

export function ReproductorProvider({ children }) {
  const audio = useRef(null);
  const [pista, setPista] = useState(null);
  const [cola, setCola] = useState([]);
  const [sonando, setSonando] = useState(false);
  const [t, setT] = useState({ actual: 0, total: 0 });

  const reproducir = useCallback((nueva, siguientes = []) => {
    const a = audio.current;
    if (!a || !nueva?.audio) return;
    setCola(siguientes);
    if (pista?.id === nueva.id) {
      a.paused ? a.play().catch(() => {}) : a.pause();
      return;
    }
    setPista(nueva);
    a.src = nueva.audio;
    a.currentTime = leerPos(nueva.id);
    a.play().catch(() => {});
  }, [pista]);

  const alternar = useCallback(() => {
    const a = audio.current;
    if (!a || !pista) return;
    a.paused ? a.play().catch(() => {}) : a.pause();
  }, [pista]);

  const saltar = useCallback((d) => {
    const a = audio.current;
    if (a) a.currentTime = Math.max(0, Math.min((a.duration || 0) - 0.5, a.currentTime + d));
  }, []);

  const buscar = useCallback((seg) => {
    const a = audio.current;
    if (a && Number.isFinite(seg)) a.currentTime = seg;
  }, []);

  const cerrar = useCallback(() => {
    const a = audio.current;
    if (a) {
      a.pause();
      a.removeAttribute("src");
    }
    setPista(null);
    setCola([]);
  }, []);

  useEffect(() => {
    const a = audio.current;
    if (!a) return undefined;
    let ultimo = 0;
    const tick = () => {
      setT({ actual: a.currentTime, total: a.duration || 0 });
      if (pista && a.currentTime - ultimo > 4) {
        ultimo = a.currentTime;
        guardarPos(pista.id, a.currentTime);
      }
    };
    const on = () => setSonando(true);
    const off = () => setSonando(false);
    const fin = () => {
      if (pista) guardarPos(pista.id, 0);
      const [sig, ...resto] = cola;
      if (sig) reproducir(sig, resto);
    };
    a.addEventListener("timeupdate", tick);
    a.addEventListener("loadedmetadata", tick);
    a.addEventListener("play", on);
    a.addEventListener("pause", off);
    a.addEventListener("ended", fin);
    return () => {
      a.removeEventListener("timeupdate", tick);
      a.removeEventListener("loadedmetadata", tick);
      a.removeEventListener("play", on);
      a.removeEventListener("pause", off);
      a.removeEventListener("ended", fin);
    };
  }, [pista, cola, reproducir]);

  const valor = { pista, cola, sonando, t, reproducir, alternar, saltar, buscar, cerrar };
  return (
    <Ctx.Provider value={valor}>
      {children}
      <audio ref={audio} preload="metadata" />
      <BarraReproductor />
    </Ctx.Provider>
  );
}

export function useReproductor() {
  return useContext(Ctx);
}

/* Botón ▶/❚❚ reutilizable: sabe si su pista es la que suena. */
export function BotonPlay({ pista, cola, oscuro = false, tam = 44, etiqueta }) {
  const r = useReproductor();
  if (!pista?.audio) return null;
  const activa = r?.pista?.id === pista.id;
  const sonando = activa && r.sonando;
  return (
    <span className="y-play-caja">
      {activa && <Anillo t={r.t} />}
    <button
      type="button"
      className={"y-play" + (oscuro ? " y-play--dark" : "")}
      style={{ width: tam, height: tam }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        r.reproducir(pista, cola);
      }}
      aria-label={(sonando ? "Pausar " : "Escuchar ") + (etiqueta || pista.titulo)}
    >
      <Icono pausa={sonando} />
    </button>
    </span>
  );
}

// Progreso alrededor del botón (tokens --y-prog-a/b). Decorativo: la posición exacta
// la da la barra del reproductor, con su control accesible.
function Anillo({ t }) {
  const p = t.total ? Math.min(1, t.actual / t.total) : 0;
  return <span className="y-play-anillo" style={{ "--p": p }} aria-hidden="true" />;
}

function Icono({ pausa }) {
  return pausa ? (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
      <rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M3 1.5v11l9.5-5.5z" fill="currentColor" />
    </svg>
  );
}

const CSS = `
.yr-barra{position:fixed; left:50%; transform:translateX(-50%); z-index:70;
  bottom:calc(14px + env(safe-area-inset-bottom,0px)); width:min(760px,calc(100% - 24px));
  background:var(--y-pod-bg); color:var(--y-pod-ink); border-radius:22px; padding:10px 14px;
  display:flex; align-items:center; gap:12px; box-shadow:0 18px 50px rgba(40,25,10,.28);
  font-family:var(--y-font);}
.yr-info{min-width:0; flex:1;}
.yr-tipo{font:500 9.5px var(--y-mono); letter-spacing:.1em; text-transform:uppercase; color:var(--y-pod-acc);}
.yr-tit{font-size:14px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
.yr-prog{display:flex; align-items:center; gap:8px; margin-top:4px;}
.yr-prog input{flex:1; accent-color:var(--y-prog-a); height:3px;}
.yr-tiempo{font:500 10px var(--y-mono); color:var(--y-pod-sec); white-space:nowrap;}
.yr-skip{background:none; border:0; color:var(--y-pod-sec); font:600 11px var(--y-mono); cursor:pointer; padding:6px;}
.yr-skip:hover{color:var(--y-pod-ink);}
.yr-x{background:none; border:0; color:var(--y-pod-sec); cursor:pointer; font-size:15px; padding:6px;}
@media (max-width:560px){ .yr-skip{display:none;} .yr-barra{border-radius:18px;} }
`;

function BarraReproductor() {
  const r = useContext(Ctx);
  if (!r?.pista) return null;
  const { pista, t, sonando } = r;
  return (
    <div className="yr-barra" role="region" aria-label="Reproductor">
      <style>{CSS}</style>
      <span className="y-play-caja">
        <Anillo t={t} />
        <button type="button" className="y-play" style={{ width: 40, height: 40 }} onClick={r.alternar}
          aria-label={sonando ? "Pausar" : "Reanudar"}>
          <Icono pausa={sonando} />
        </button>
      </span>
      <button type="button" className="yr-skip" onClick={() => r.saltar(-15)} aria-label="Retroceder 15 segundos">↺15</button>
      <div className="yr-info">
        <div className="yr-tipo">{pista.tipo || "Audio"}</div>
        <div className="yr-tit">{pista.titulo}</div>
        <div className="yr-prog">
          <input type="range" min={0} max={t.total || 0} step={1} value={Math.min(t.actual, t.total || 0)}
            onChange={(e) => r.buscar(Number(e.target.value))} aria-label="Posición" />
          <span className="yr-tiempo">{duracion(t.actual)} / {duracion(t.total)}</span>
        </div>
      </div>
      <button type="button" className="yr-skip" onClick={() => r.saltar(15)} aria-label="Avanzar 15 segundos">15↻</button>
      <button type="button" className="yr-x" onClick={r.cerrar} aria-label="Cerrar reproductor">✕</button>
    </div>
  );
}
