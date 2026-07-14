import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import temas from "../temas/registry";

/*
 * Narrador v2 — TTS servido por https://tts.yamacoa.com (Kokoro en servidor, con caché
 * por texto exacto), NO síntesis en el navegador. Sustituye a la v1 (kokoro-js cliente).
 *
 * Se monta UNA vez en Layout.jsx: <Narrador/>. No toca ningún renderer congelado.
 *
 * Contrato: lee la ruta activa, resuelve el slug contra el registry, hace fetch de
 * /data/<slug>.json y busca meta.narracion (guion corto, <=1500 caracteres, precalentado
 * en el servidor durante la creación/refresco del tema — ver skill "narración TTS" en
 * SKILLS.md). Si no existe, no renderiza nada.
 *
 * IMPORTANTE: el texto que se envía aquí debe ser BYTE A BYTE el mismo que se precalentó
 * en el servidor (es la clave de caché). Nunca reconstruir ni recortar el texto en el
 * cliente: se envía meta.narracion tal cual llega del JSON.
 */

const TTS_BASE = "https://tts.yamacoa.com";
const TTS_ENDPOINT = `${TTS_BASE}/api/tts`;

export default function Narrador() {
  const location = useLocation();
  const [narracion, setNarracion] = useState(null);
  const [fase, setFase] = useState("idle"); // idle | cargando | reproduciendo | pausado | listo | error
  const [abierto, setAbierto] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);
  const vivoRef = useRef(true);

  /* resolver narracion segun la ruta activa */
  useEffect(() => {
    vivoRef.current = true;
    setNarracion(null);
    setAbierto(false);
    setErrorMsg(null);
    detener();
    const path = location.pathname.replace(/\/+$/, "") || "/";
    const tema = temas.find((t) => t.path === path);
    if (!tema) return;
    fetch(`${process.env.PUBLIC_URL || ""}/data/${tema.dataSlug || tema.slug}.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        const n = j && j.meta && typeof j.meta.narracion === "string" ? j.meta.narracion : null;
        if (vivoRef.current && n && n.length > 0 && n.length <= 1500) setNarracion(n);
      })
      .catch(() => {});
    return () => { vivoRef.current = false; detener(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const detener = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  async function reproducir(reintento = false) {
    if (!narracion) return;
    setErrorMsg(null);
    setFase("cargando");
    try {
      const resp = await fetch(TTS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: narracion }),
      });

      if (resp.status === 503 && !reintento) {
        // Kokoro aun arrancando: un reintento tras una breve espera, sin más.
        await new Promise((res) => setTimeout(res, 3000));
        if (vivoRef.current) return reproducir(true);
      }
      if (!resp.ok) throw new Error("tts_" + resp.status);
      if (!vivoRef.current) return;

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { if (vivoRef.current) setFase("listo"); };
      audio.onerror = () => { if (vivoRef.current) { setFase("error"); setErrorMsg("No se pudo reproducir el audio."); } };
      await audio.play();
      if (vivoRef.current) setFase("reproduciendo");
    } catch (e) {
      if (!vivoRef.current) return;
      setFase("error");
      setErrorMsg(
        String(e.message || "").includes("tts_503")
          ? "El servicio de voz está arrancando. Prueba de nuevo en unos segundos."
          : "No se pudo generar el audio ahora mismo."
      );
    }
  }

  function alternarPausa() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play(); setFase("reproduciendo"); }
    else { a.pause(); setFase("pausado"); }
  }

  function cerrar() {
    detener();
    setFase("idle");
    setAbierto(false);
    setErrorMsg(null);
  }

  if (!narracion) return null;

  const enMarcha = fase === "reproduciendo" || fase === "pausado";

  return (
    <div className="ym-narrador" data-abierto={abierto || enMarcha ? "1" : "0"}>
      <style>{CSS}</style>

      {!abierto && !enMarcha && (
        <button
          className="ymn-fab"
          aria-label="Escuchar este expediente"
          onClick={() => { setAbierto(true); reproducir(); }}
        >
          <IcoOnda /> <span>Escuchar</span>
        </button>
      )}

      {(abierto || enMarcha) && (
        <div className="ymn-dock" role="region" aria-label="Narracion del expediente">
          <div className="ymn-fila">
            {fase === "cargando" ? (
              <div className="ymn-carga">
                <span className="ymn-spin" aria-hidden />
                <span>Generando audio…</span>
              </div>
            ) : fase === "error" ? (
              <div className="ymn-carga ymn-err">
                <span>{errorMsg || "No se pudo iniciar la narración."}</span>
                <button className="ymn-retry" onClick={() => reproducir()}>Reintentar</button>
              </div>
            ) : (
              <>
                <button className="ymn-btn" onClick={alternarPausa}
                  aria-label={fase === "pausado" ? "Reanudar" : "Pausar"}>
                  {fase === "pausado" ? <IcoPlay /> : <IcoPausa />}
                </button>
                <span className="ymn-txt">Narración del expediente</span>
              </>
            )}
            <button className="ymn-btn ymn-x" onClick={cerrar} aria-label="Cerrar narración">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

const IcoOnda = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M3 12h2l3-8 4 16 3-8h2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IcoPlay = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
);
const IcoPausa = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
);

const CSS = `
.ym-narrador{position:fixed;right:18px;bottom:18px;z-index:60;font-family:'IBM Plex Mono',monospace}
.ymn-fab{display:inline-flex;align-items:center;gap:8px;background:#161A26;color:#EDEFF5;
  border:1px solid rgba(237,239,245,.18);border-radius:24px;padding:9px 15px;font-size:12px;
  letter-spacing:.04em;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.35);
  transition:transform .18s,border-color .18s}
.ymn-fab:hover{transform:translateY(-1px);border-color:rgba(237,239,245,.4)}
.ymn-fab:focus-visible,.ymn-btn:focus-visible,.ymn-retry:focus-visible{outline:2px solid #7AAFC7;outline-offset:2px}
.ymn-dock{background:#161A26;border:1px solid rgba(237,239,245,.18);border-radius:12px;
  padding:10px 12px;min-width:230px;box-shadow:0 10px 30px rgba(0,0,0,.4);color:#EDEFF5}
.ymn-fila{display:flex;align-items:center;gap:10px}
.ymn-btn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;
  border-radius:50%;border:1px solid rgba(237,239,245,.22);background:transparent;color:#EDEFF5;
  cursor:pointer;flex:none}
.ymn-btn:hover{border-color:rgba(237,239,245,.5)}
.ymn-x{border:none;font-size:12px;color:#8A93A8;margin-left:auto}
.ymn-txt{font-size:11.5px;color:#C7CDCE}
.ymn-carga{display:flex;align-items:center;gap:8px;font-size:11px;color:#8A93A8;flex:1}
.ymn-err{color:#E06056}
.ymn-retry{font-size:10.5px;color:#7AAFC7;background:transparent;border:1px solid rgba(122,175,199,.4);
  border-radius:14px;padding:3px 9px;cursor:pointer;flex:none}
.ymn-spin{width:12px;height:12px;border:2px solid rgba(237,239,245,.2);border-top-color:#7AAFC7;
  border-radius:50%;animation:ymnspin .8s linear infinite;flex:none}
@keyframes ymnspin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.ymn-spin{animation:none}.ymn-fab{transition:none}}
@media (max-width:640px){.ym-narrador{right:10px;bottom:10px}.ymn-dock{min-width:200px}}
`;