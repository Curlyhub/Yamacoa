import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase, useCuenta, mensajeError } from "./cuenta";

/* Inscripción de lectores (2026-10-18): gratuita, con correo y contraseña (escrita dos veces y
   confirmada por correo) o con Google. Con cuenta se pueden descargar los podcasts. Los lectores
   se guardan aparte de los usuarios internos (ops/suscriptores/suscriptores_supabase.sql). */

const CSS = `
.ysu{max-width:560px; margin:0 auto; padding-top:36px;}
.ysu form{display:flex; flex-direction:column; gap:12px; margin-top:16px;}
.ysu label{font:500 10.5px var(--y-mono); letter-spacing:.08em; text-transform:uppercase; color:var(--y-muted); display:block; margin-bottom:6px;}
.ysu input[type=email], .ysu input[type=password]{width:100%; box-sizing:border-box; background:var(--y-surface-2); border:1px solid transparent;
  border-radius:12px; padding:12px; font:500 16px var(--y-font); color:var(--y-ink);}
.ysu input:focus{outline:none; border-color:var(--y-accent);}
.ysu .y-btn{justify-content:center;}
.ysu-tabs{display:flex; gap:6px; margin-top:22px;}
.ysu-o{display:flex; align-items:center; gap:12px; color:var(--y-subtle); font:500 11px var(--y-mono); margin:18px 0;}
.ysu-o::before, .ysu-o::after{content:""; flex:1; height:1px; background:var(--y-rule);}
.ysu-google{width:100%; justify-content:center; background:var(--y-surface) !important; color:var(--y-ink) !important; box-shadow:inset 0 0 0 1px var(--y-rule);}
.ysu-msg{border-radius:14px; padding:12px 14px; font-size:14.5px; line-height:1.45; margin-top:14px;}
.ysu-msg.ok{background:var(--y-auto-bg); color:var(--y-auto-head);}
.ysu-msg.err{background:#f6d5cc; color:#a8321e;}
.ysu label.ysu-check{display:flex; gap:10px; align-items:flex-start; font:400 13.5px/1.45 var(--y-font); letter-spacing:0;
  text-transform:none; color:var(--y-ink-2); margin:0;}
.ysu-check input{margin-top:3px;}
`;

function Google({ onError }) {
  return (
    <button type="button" className="y-btn ysu-google" onClick={async () => {
      const sb = await supabase();
      const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/suscribete` } });
      if (error) onError(mensajeError(error));
    }}>
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
      Continuar con Google
    </button>
  );
}

function Formulario() {
  const [modo, setModo] = useState("alta"); // alta | entrar | olvido
  const [msg, setMsg] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [f, setF] = useState({ email: "", pass: "", pass2: "", acepto: false });
  const cambia = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  async function enviar(e) {
    e.preventDefault(); setMsg(null);
    if (modo === "alta") {
      if (f.pass.length < 8) return setMsg(["err", "La contraseña necesita al menos 8 caracteres."]);
      if (f.pass !== f.pass2) return setMsg(["err", "Las dos contraseñas no coinciden."]);
      if (!f.acepto) return setMsg(["err", "Para crear la cuenta tienes que aceptar el uso de tu correo."]);
    }
    setOcupado(true);
    const sb = await supabase();
    let r;
    if (modo === "alta") r = await sb.auth.signUp({ email: f.email.trim(), password: f.pass, options: { emailRedirectTo: `${window.location.origin}/suscribete` } });
    else if (modo === "entrar") r = await sb.auth.signInWithPassword({ email: f.email.trim(), password: f.pass });
    else r = await sb.auth.resetPasswordForEmail(f.email.trim(), { redirectTo: `${window.location.origin}/suscribete` });
    setOcupado(false);
    if (r.error) return setMsg(["err", mensajeError(r.error)]);
    if (modo === "alta") setMsg(["ok", "Casi está: te hemos enviado un correo para confirmar la cuenta. Abre el enlace y volverás aquí ya inscrito."]);
    if (modo === "olvido") setMsg(["ok", "Si hay una cuenta con ese correo, te llegará un enlace para poner una contraseña nueva."]);
  }

  return (
    <>
      <div className="ysu-tabs" role="tablist">
        {[["alta", "Crear cuenta"], ["entrar", "Entrar"]].map(([m, t]) => (
          <button key={m} type="button" className="y-chip" aria-pressed={modo === m || (m === "entrar" && modo === "olvido")}
            onClick={() => { setModo(m); setMsg(null); }}>{t}</button>
        ))}
      </div>
      <form onSubmit={enviar} noValidate>
        <div><label htmlFor="su-email">Correo</label>
          <input id="su-email" type="email" autoComplete="email" required value={f.email} onChange={cambia("email")} /></div>
        {modo !== "olvido" && (
          <div><label htmlFor="su-pass">Contraseña{modo === "alta" ? " (mínimo 8 caracteres)" : ""}</label>
            <input id="su-pass" type="password" autoComplete={modo === "alta" ? "new-password" : "current-password"} required
              value={f.pass} onChange={cambia("pass")} /></div>
        )}
        {modo === "alta" && (
          <>
            <div><label htmlFor="su-pass2">Repite la contraseña</label>
              <input id="su-pass2" type="password" autoComplete="new-password" required value={f.pass2} onChange={cambia("pass2")} /></div>
            <label className="ysu-check"><input type="checkbox" checked={f.acepto} onChange={cambia("acepto")} />
              <span>Acepto que Yamacoa guarde mi correo solo para gestionar mi cuenta. No se comparte ni se publica, y puedo darme de baja cuando quiera.</span></label>
          </>
        )}
        <button className="y-btn" type="submit" disabled={ocupado}>
          {ocupado ? "Un momento…" : modo === "alta" ? "Crear mi cuenta" : modo === "entrar" ? "Entrar" : "Enviarme el enlace"}
        </button>
        {modo === "entrar" && <button type="button" className="y-link" style={{ background: "none", border: 0, cursor: "pointer", fontSize: 14, color: "var(--y-muted)" }}
          onClick={() => { setModo("olvido"); setMsg(null); }}>¿Olvidaste la contraseña?</button>}
      </form>
      {msg && <p className={`ysu-msg ${msg[0]}`} role="status">{msg[1]}</p>}
      <div className="ysu-o">o</div>
      <Google onError={(m) => setMsg(["err", m])} />
    </>
  );
}

function NuevaContrasena() {
  const [p, setP] = useState(["", ""]); const [msg, setMsg] = useState(null);
  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      if (p[0].length < 8) return setMsg(["err", "Mínimo 8 caracteres."]);
      if (p[0] !== p[1]) return setMsg(["err", "Las dos contraseñas no coinciden."]);
      const { error } = await (await supabase()).auth.updateUser({ password: p[0] });
      setMsg(error ? ["err", mensajeError(error)] : ["ok", "Contraseña cambiada."]);
    }}>
      <p className="y-eyebrow">Nueva contraseña</p>
      <input type="password" autoComplete="new-password" placeholder="Nueva contraseña" value={p[0]} onChange={(e) => setP([e.target.value, p[1]])} />
      <input type="password" autoComplete="new-password" placeholder="Repítela" value={p[1]} onChange={(e) => setP([p[0], e.target.value])} />
      <button className="y-btn" type="submit">Guardar</button>
      {msg && <p className={`ysu-msg ${msg[0]}`}>{msg[1]}</p>}
    </form>
  );
}

function MiCuenta({ sesion, recuperando }) {
  const [baja, setBaja] = useState(0); const [msg, setMsg] = useState(null);
  return (
    <div className="y-card" style={{ marginTop: 24 }}>
      <p className="y-eyebrow" style={{ color: "var(--y-ink)" }}>Tu cuenta</p>
      <p style={{ fontSize: 18, fontWeight: 700, margin: "8px 0 4px" }}>{sesion.user.email}</p>
      <p className="y-card-p">Inscripción gratuita. Ya puedes descargar los episodios del{" "}
        <Link className="y-link" to="/podcast">podcast</Link>.</p>
      {recuperando && <div style={{ marginTop: 18 }}><NuevaContrasena /></div>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
        <button className="y-btn y-btn--ghost" type="button" onClick={async () => { await (await supabase()).auth.signOut(); }}>Salir</button>
        <button className="y-btn y-btn--ghost" type="button" onClick={async () => {
          if (baja === 0) return setBaja(1);
          const sb = await supabase();
          const { error } = await sb.rpc("baja_suscriptor");
          if (error) return setMsg(["err", /NO_ES_LECTOR/.test(error.message) ? "Las cuentas internas se gestionan desde el portal." : mensajeError(error)]);
          await sb.auth.signOut(); setMsg(["ok", "Cuenta borrada. Gracias por haber estado."]);
        }}>{baja ? "¿Seguro? Se borra la cuenta: pulsa otra vez" : "Darme de baja"}</button>
      </div>
      {msg && <p className={`ysu-msg ${msg[0]}`}>{msg[1]}</p>}
    </div>
  );
}

export default function Suscribete() {
  const { sesion, cargando, evento } = useCuenta();
  return (
    <div className="y-wrap">
      <style>{CSS}</style>
      <div className="ysu">
        <p className="y-eyebrow">Inscripción gratuita</p>
        <h1 className="y-h1" style={{ margin: "12px 0 14px" }}>{sesion ? "Ya formas parte de Yamacoa." : "Tu cuenta en Yamacoa."}</h1>
        <p className="y-lede">Con una cuenta puedes descargar los episodios del podcast para escucharlos sin conexión. Todo
          el contenido sigue siendo abierto para leer y escuchar.</p>
        {cargando ? null : sesion ? <MiCuenta sesion={sesion} recuperando={evento === "PASSWORD_RECOVERY"} /> : <Formulario />}
      </div>
    </div>
  );
}
