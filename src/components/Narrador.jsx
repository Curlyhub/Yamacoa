import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import temas from "../temas/registry";

/*
 * Narrador — TTS Kokoro-82M en navegador, componente GLOBAL.
 * Se monta UNA vez en Layout.jsx: <Narrador/>. No toca ningun renderer congelado.
 *
 * Contrato: lee la ruta activa, resuelve el slug contra el registry, hace fetch de
 * /data/<slug>.json y busca meta.narracion. Si no existe, no renderiza nada.
 *
 * Modelo: kokoro-js (ONNX ~80MB q8) cargado bajo demanda al primer clic, via CDN.
 * WebGPU si esta disponible; fallback WASM. Queda cacheado por el navegador.
 * Voz: em_alex (espanol). Las cifras deben venir en letras desde el dataset
 * (contrato de /narrar): el motor pronuncia mal numerales y simbolos.
 */

const KOKORO_CDN = "https://cdn.jsdelivr.net/npm/kokoro-js@1.2.0/+esm";
const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const VOICE = "em_alex";

/* trocea la narracion en frases razonables para sintetizar en cola */
function segmentar(texto) {
  return texto
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

export default function Narrador() {
  const location = useLocation();
  const [narracion, setNarracion] = useState(null);
  const [fase, setFase] = useState("idle"); // idle | cargando | listo | reproduciendo | pausado | error
  const [progresoModelo, setProgresoModelo] = useState(0);
  const [fraseActual, setFraseActual] = useState(0);
  const [abierto, setAbierto] = useState(false);

  const ttsRef = useRef(null);        // instancia KokoroTTS
  const audioRef = useRef(null);      // HTMLAudioElement en curso
  const colaRef = useRef([]);         // frases pendientes
  const vivoRef = useRef(true);       // cancela al desmontar / cambiar ruta
  const totalRef = useRef(0);

  /* 1) resolver narracion segun la ruta activa (HashRouter: pathname ya viene limpio) */
  useEffect(() => {
    vivoRef.current = true;
    setNarracion(null);
    setAbierto(false);
    detener();
    const path = location.pathname.replace(/\/+$/, "") || "/";
    const tema = temas.find((t) => t.path === path);
    if (!tema) return;
    fetch(`${process.env.PUBLIC_URL || ""}/data/${tema.slug}.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        const n = j && j.meta && typeof j.meta.narracion === "string" ? j.meta.narracion : null;
        if (vivoRef.current && n && n.length >= 200) setNarracion(n);
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
    colaRef.current = [];
  }, []);

  /* 2) carga perezosa del modelo */
  async function asegurarModelo() {
    if (ttsRef.current) return ttsRef.current;
    setFase("cargando");
    const { KokoroTTS } = await import(/* webpackIgnore: true */ KOKORO_CDN);
    let device = "wasm";
    try { if (navigator.gpu && (await navigator.gpu.requestAdapter())) device = "webgpu"; } catch {}
    const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: device === "webgpu" ? "fp32" : "q8",
      device,
      progress_callback: (p) => {
        if (p && p.status === "progress" && p.total) {
          setProgresoModelo(Math.round((p.loaded / p.total) * 100));
        }
      },
    });
    if (!vivoRef.current) return null;
    ttsRef.current = tts;
    return tts;
  }

  /* 3) reproduce la cola frase a frase (sintetiza la siguiente mientras suena la actual) */
  async function reproducir() {
    try {
      const tts = await asegurarModelo();
      if (!tts || !vivoRef.current) return;
      const frases = segmentar(narracion);
      colaRef.current = frases.slice();
      totalRef.current = frases.length;
      setFraseActual(0);
      setFase("reproduciendo");

      let siguiente = sintetizar(tts, colaRef.current.shift());
      let idx = 0;
      while (vivoRef.current) {
        const wavUrl = await siguiente;
        if (!wavUrl || !vivoRef.current) break;
        // prepara la siguiente en paralelo
        const prox = colaRef.current.length ? colaRef.current.shift() : null;
        siguiente = prox ? sintetizar(tts, prox) : Promise.resolve(null);
        setFraseActual(++idx);
        const fin = await reproducirWav(wavUrl);
        URL.revokeObjectURL(wavUrl);
        if (!fin || !vivoRef.current) break;
        if (!prox) { setFase("listo"); setFraseActual(0); break; }
      }
    } catch (e) {
      console.error("Narrador:", e);
      if (vivoRef.current) setFase("error");
    }
  }

  async function sintetizar(tts, texto) {
    if (!texto) return null;
    const audio = await tts.generate(texto, { voice: VOICE });
    const blob = new Blob([audio.toWav()], { type: "audio/wav" });
    return URL.createObjectURL(blob);
  }

  function reproducirWav(url) {
    return new Promise((res) => {
      const a = new Audio(url);
      audioRef.current = a;
      a.onended = () => res(true);
      a.onerror = () => res(false);
      a.play().catch(() => res(false));
    });
  }

  function alternarPausa() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play(); setFase("reproduciendo"); }
    else { a.pause(); setFase("pausado"); }
  }

  function cerrar() {
    detener();
    setFase(ttsRef.current ? "listo" : "idle");
    setFraseActual(0);
    setAbierto(false);
  }

  if (!narracion) return null;

  const enMarcha = fase === "reproduciendo" || fase === "pausado";
  const pct = totalRef.current ? Math.round((fraseActual / totalRef.current) * 100) : 0;

  return (
    <div className="ym-narrador" data-abierto={abierto || enMarcha ? "1" : "0"}>
      <style>{CSS}</style>

      {!abierto && !enMarcha && (
        <button
          className="ymn-fab"
          aria-label="Escuchar este expediente"
          onClick={() => { setAbierto(true); if (fase === "idle" || fase === "listo") reproducir(); }}
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
                <span>Descargando voz ({progresoModelo}%)… solo la primera vez</span>
              </div>
            ) : fase === "error" ? (
              <div className="ymn-carga">No se pudo iniciar la narracion en este navegador.</div>
            ) : (
              <>
                <button className="ymn-btn" onClick={alternarPausa}
                  aria-label={fase === "pausado" ? "Reanudar" : "Pausar"}>
                  {fase === "pausado" ? <IcoPlay /> : <IcoPausa />}
                </button>
                <div className="ymn-prog" aria-hidden>
                  <div className="ymn-prog-fill" style={{ width: pct + "%" }} />
                </div>
                <span className="ymn-cont">{fraseActual}/{totalRef.current || "–"}</span>
              </>
            )}
            <button className="ymn-btn ymn-x" onClick={cerrar} aria-label="Cerrar narracion">✕</button>
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
.ymn-fab:focus-visible,.ymn-btn:focus-visible{outline:2px solid #7AAFC7;outline-offset:2px}
.ymn-dock{background:#161A26;border:1px solid rgba(237,239,245,.18);border-radius:12px;
  padding:10px 12px;min-width:260px;box-shadow:0 10px 30px rgba(0,0,0,.4);color:#EDEFF5}
.ymn-fila{display:flex;align-items:center;gap:10px}
.ymn-btn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;
  border-radius:50%;border:1px solid rgba(237,239,245,.22);background:transparent;color:#EDEFF5;
  cursor:pointer;flex:none}
.ymn-btn:hover{border-color:rgba(237,239,245,.5)}
.ymn-x{border:none;font-size:12px;color:#8A93A8}
.ymn-prog{flex:1;height:4px;background:rgba(237,239,245,.12);border-radius:2px;overflow:hidden}
.ymn-prog-fill{height:100%;background:#7AAFC7;border-radius:2px;transition:width .3s}
.ymn-cont{font-size:10.5px;color:#8A93A8;flex:none}
.ymn-carga{display:flex;align-items:center;gap:8px;font-size:11px;color:#8A93A8;flex:1}
.ymn-spin{width:12px;height:12px;border:2px solid rgba(237,239,245,.2);border-top-color:#7AAFC7;
  border-radius:50%;animation:ymnspin .8s linear infinite;flex:none}
@keyframes ymnspin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.ymn-spin{animation:none}.ymn-fab{transition:none}}
@media (max-width:640px){.ym-narrador{right:10px;bottom:10px}.ymn-dock{min-width:220px}}
`;
