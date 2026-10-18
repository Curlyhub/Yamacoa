import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase, useCuenta, mensajeError } from "./cuenta";

/* Inscripción de lectores (2026-10-18): gratuita, con correo y contraseña (escrita dos veces y
   confirmada por correo) o con Google. Con cuenta se descargan los podcasts y, si el lector lo
   pide aparte, llega el boletín de los domingos (ops/suscriptores/boletin_supabase.sql y
   ops/boletin/). Los lectores se guardan aparte de los usuarios internos
   (ops/suscriptores/suscriptores_supabase.sql). */

const CSS = `
.ysu{padding-top:36px;}
.ysu-cab{max-width:720px;}
.ysu-ventajas{display:grid; grid-template-columns:repeat(auto-fit, minmax(230px, 1fr)); gap:14px; margin:30px 0 8px;}
.ysu-ventajas .y-card{padding:22px;}
.ysu-ventajas .y-card-p{font-size:14.5px;}
.ysu-ico{width:34px; height:34px; border-radius:50%; display:grid; place-items:center; background:rgba(255,255,255,.55);}
.ysu-cuerpo{display:grid; grid-template-columns:minmax(0, 1fr) minmax(0, 1fr); gap:clamp(20px, 4vw, 56px); margin-top:30px; align-items:start;}
@media (max-width:820px){ .ysu-cuerpo{grid-template-columns:1fr;} }
.ysu-faq h3{font-size:16px; margin:18px 0 4px;}
.ysu-faq p{font-size:14.5px; line-height:1.55; color:var(--y-ink-2); margin:0;}
.ysu form{display:flex; flex-direction:column; gap:12px; margin-top:16px;}
.ysu label{font:500 10.5px var(--y-mono); letter-spacing:.08em; text-transform:uppercase; color:var(--y-muted); display:block; margin-bottom:6px;}
.ysu input[type=email], .ysu input[type=password]{width:100%; background:var(--y-surface-2); border:1px solid transparent;
  border-radius:12px; padding:12px; font:500 16px var(--y-font); color:var(--y-ink);}
.ysu input:focus{outline:none; border-color:var(--y-accent);}
.ysu .y-btn{justify-content:center;}
.ysu-tabs{display:flex; gap:6px;}
.ysu-o{display:flex; align-items:center; gap:12px; color:var(--y-subtle); font:500 11px var(--y-mono); margin:18px 0;}
.ysu-o::before, .ysu-o::after{content:""; flex:1; height:1px; background:var(--y-rule);}
.ysu-google{width:100%; justify-content:center; background:var(--y-surface) !important; color:var(--y-ink) !important; box-shadow:inset 0 0 0 1px var(--y-rule);}
.ysu-msg{border-radius:14px; padding:12px 14px; font-size:14.5px; line-height:1.45; margin-top:14px;}
.ysu-msg.ok{background:var(--y-auto-bg); color:var(--y-auto-head);}
.ysu-msg.err{background:#f6d5cc; color:#a8321e;}
.ysu label.ysu-check{display:flex; gap:10px; align-items:flex-start; font:400 13.5px/1.45 var(--y-font); letter-spacing:0;
  text-transform:none; color:var(--y-ink-2); margin:0;}
.ysu-check input{margin-top:3px; accent-color:var(--y-dark);}
.ysu-panel{display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px; margin-top:28px;}
.ysu-panel .y-card{display:flex; flex-direction:column; gap:10px;}
.ysu-fila{display:flex; align-items:center; justify-content:space-between; gap:16px;}
.ysu-interruptor{position:relative; width:52px; height:30px; flex:none; border-radius:999px; border:0; cursor:pointer;
  background:var(--y-rule); transition:background .2s;}
.ysu-interruptor::after{content:""; position:absolute; top:3px; left:3px; width:24px; height:24px; border-radius:50%;
  background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.25); transition:transform .2s;}
.ysu-interruptor[aria-checked=true]{background:var(--y-auto-ink);}
.ysu-interruptor[aria-checked=true]::after{transform:translateX(22px);}
.ysu-interruptor:disabled{opacity:.5; cursor:wait;}
.ysu-estado{font:500 11px var(--y-mono); letter-spacing:.06em; text-transform:uppercase;}
.ysu-lista{margin:0; padding-left:18px; font-size:14px; line-height:1.6; color:var(--y-ink-2);}
.ysu-peligro{margin-top:34px; padding-top:18px; border-top:1px solid var(--y-rule); font-size:14px; color:var(--y-muted); max-width:640px;}
.ysu-enlace{background:none; border:0; padding:0; cursor:pointer; font:inherit; color:var(--y-accent); text-decoration:underline; text-underline-offset:3px;}
`;

const fecha = (iso) => iso ? new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "";

const Icono = ({ d }) => (
  <span className="ysu-ico" aria-hidden="true">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
  </span>
);

function Ventajas() {
  return (
    <div className="ysu-ventajas">
      <div className="y-card y-card--pod">
        <Icono d={<><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>} />
        <p className="y-eyebrow" style={{ marginTop: 14 }}>Podcast</p>
        <p className="y-card-t">Descarga los episodios</p>
        <p className="y-card-p">Las conversaciones grabadas y las ediciones habladas, en MP3, para escucharlas sin conexión:
          en el metro, en el coche o donde la conexión no llega.</p>
      </div>
      <div className="y-card y-card--auto">
        <Icono d={<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>} />
        <p className="y-eyebrow" style={{ marginTop: 14 }}>Boletín · opcional</p>
        <p className="y-card-t">Un correo cada domingo</p>
        <p className="y-card-p">Lo esencial de la semana: los podcasts nuevos, los artículos de opinión y las noticias más
          importantes, con sus fuentes. Uno a la semana, nunca más.</p>
      </div>
      <div className="y-card y-card--dir">
        <Icono d={<><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z" /><path d="m9 12 2 2 4-4" /></>} />
        <p className="y-eyebrow" style={{ marginTop: 14 }}>Sin letra pequeña</p>
        <p className="y-card-t">Gratis y sin rastreo</p>
        <p className="y-card-p">Sin publicidad ni analítica. Tu correo no se comparte ni se publica, y te das de baja con un
          clic. Todo Yamacoa sigue abierto para leer y escuchar.</p>
      </div>
    </div>
  );
}

function Preguntas() {
  return (
    <div className="ysu-faq">
      <p className="y-eyebrow">Preguntas</p>
      <h3>¿Tengo que inscribirme para leer?</h3>
      <p>No. Las noticias, los expedientes, los estudios y el podcast son abiertos. La cuenta solo añade la descarga de
        episodios y, si quieres, el boletín.</p>
      <h3>¿Qué trae el boletín?</h3>
      <p>Cada domingo: la conversación de la semana y los podcasts grabados, los artículos de opinión publicados y una
        selección de las noticias más relevantes, cada una con su enlace y su fuente.</p>
      <h3>¿Es seguro inscribirme desde Cuba?</h3>
      <p>Solo pedimos un correo, que nunca se publica ni se comparte. Si te preocupa, usa una dirección que no lleve tu
        nombre. Más detalles en la <Link className="y-link" to="/privacidad">política de privacidad</Link>.</p>
      <h3>¿Y si me arrepiento?</h3>
      <p>El boletín se apaga desde el propio correo o desde tu cuenta, y la cuenta se borra entera con dos clics.</p>
    </div>
  );
}

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
  const [f, setF] = useState({ email: "", pass: "", pass2: "", acepto: false, boletin: false });
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
    if (modo === "alta") r = await sb.auth.signUp({ email: f.email.trim(), password: f.pass,
      options: { emailRedirectTo: `${window.location.origin}/suscribete`, data: { boletin: f.boletin } } });
    else if (modo === "entrar") r = await sb.auth.signInWithPassword({ email: f.email.trim(), password: f.pass });
    // El enlace del correo vuelve a una ruta propia: con PKCE el evento PASSWORD_RECOVERY no es fiable.
    else r = await sb.auth.resetPasswordForEmail(f.email.trim(), { redirectTo: `${window.location.origin}/suscribete/nueva-contrasena` });
    setOcupado(false);
    if (r.error) return setMsg(["err", mensajeError(r.error)]);
    if (modo === "alta") setMsg(["ok", "Casi está: te hemos enviado un correo para confirmar la cuenta. Abre el enlace y volverás aquí ya inscrito."]);
    if (modo === "olvido") setMsg(["ok", "Si hay una cuenta con ese correo, te llegará un enlace para poner una contraseña nueva."]);
  }

  return (
    <div className="y-card" style={{ padding: "24px clamp(20px, 3vw, 30px)" }}>
      <div className="ysu-tabs" role="tablist">
        {[["alta", "Crear cuenta"], ["entrar", "Ya tengo cuenta"]].map(([m, t]) => (
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
            <label className="ysu-check"><input type="checkbox" checked={f.boletin} onChange={cambia("boletin")} />
              <span><b>Quiero recibir el boletín de los domingos</b> (opcional). Un correo a la semana; lo apagas cuando quieras.</span></label>
            <label className="ysu-check"><input type="checkbox" checked={f.acepto} onChange={cambia("acepto")} />
              <span>Acepto que Yamacoa guarde mi correo para gestionar mi cuenta, según la{" "}
                <Link className="y-link" to="/privacidad" target="_blank">política de privacidad</Link>. No se comparte ni se publica.</span></label>
          </>
        )}
        <button className="y-btn" type="submit" disabled={ocupado}>
          {ocupado ? "Un momento…" : modo === "alta" ? "Crear mi cuenta gratis" : modo === "entrar" ? "Entrar" : "Enviarme el enlace"}
        </button>
        {modo === "entrar" && <button type="button" className="ysu-enlace" style={{ color: "var(--y-muted)", fontSize: 14 }}
          onClick={() => { setModo("olvido"); setMsg(null); }}>¿Olvidaste la contraseña?</button>}
      </form>
      {msg && <p className={`ysu-msg ${msg[0]}`} role="status">{msg[1]}</p>}
      <div className="ysu-o">o</div>
      <Google onError={(m) => setMsg(["err", m])} />
    </div>
  );
}

function NuevaContrasena({ titulo, alTerminar }) {
  const [p, setP] = useState(["", ""]); const [msg, setMsg] = useState(null); const [ocupado, setOcupado] = useState(false);
  return (
    <form onSubmit={async (e) => {
      e.preventDefault(); setMsg(null);
      if (p[0].length < 8) return setMsg(["err", "La contraseña necesita al menos 8 caracteres."]);
      if (p[0] !== p[1]) return setMsg(["err", "Las dos contraseñas no coinciden."]);
      setOcupado(true);
      const { error } = await (await supabase()).auth.updateUser({ password: p[0] });
      setOcupado(false);
      if (error) return setMsg(["err", mensajeError(error)]);
      setP(["", ""]); alTerminar();
    }} noValidate style={{ marginTop: 4 }}>
      {titulo && <p className="y-eyebrow" style={{ color: "var(--y-ink)" }}>{titulo}</p>}
      <div><label htmlFor="su-nueva">Contraseña nueva (mínimo 8 caracteres)</label>
        <input id="su-nueva" type="password" autoComplete="new-password" required value={p[0]} onChange={(e) => setP([e.target.value, p[1]])} /></div>
      <div><label htmlFor="su-nueva2">Repite la contraseña</label>
        <input id="su-nueva2" type="password" autoComplete="new-password" required value={p[1]} onChange={(e) => setP([p[0], e.target.value])} /></div>
      <button className="y-btn" type="submit" disabled={ocupado}>{ocupado ? "Un momento…" : "Guardar la contraseña"}</button>
      {msg && <p className={`ysu-msg ${msg[0]}`} role="status">{msg[1]}</p>}
    </form>
  );
}

// Fila propia en `suscriptores` (null si la cuenta es interna o aún no ha cargado).
function useFicha(sesion) {
  const [ficha, setFicha] = useState(undefined);
  useEffect(() => {
    let vivo = true;
    supabase().then(async (sb) => {
      let r = await sb.from("suscriptores").select("alta, proveedor, boletin, boletin_desde").eq("id", sesion.user.id).maybeSingle();
      // Sin las columnas del boletín (SQL aún no ejecutado) la cuenta sigue siendo de lector.
      if (r.error) r = await sb.from("suscriptores").select("alta, proveedor").eq("id", sesion.user.id).maybeSingle();
      if (vivo) setFicha(r.error ? {} : r.data || null);
    });
    return () => { vivo = false; };
  }, [sesion.user.id]);
  return [ficha, setFicha];
}

function Boletin({ ficha, setFicha }) {
  const [ocupado, setOcupado] = useState(false); const [msg, setMsg] = useState(null);
  const activo = !!ficha?.boletin;
  async function cambiar() {
    setOcupado(true); setMsg(null);
    const { error } = await (await supabase()).rpc("mi_boletin", { p_activo: !activo });
    setOcupado(false);
    if (error) return setMsg(["err", mensajeError(error)]);
    setFicha({ ...ficha, boletin: !activo, boletin_desde: !activo ? new Date().toISOString() : null });
  }
  return (
    <div className="y-card y-card--auto">
      <div className="ysu-fila">
        <div>
          <p className="y-eyebrow">Boletín de los domingos</p>
          <p className="y-card-t" style={{ margin: "8px 0 0" }}>{activo ? "Te llega cada domingo" : "Desactivado"}</p>
        </div>
        <button type="button" role="switch" aria-checked={activo} aria-label="Recibir el boletín semanal" className="ysu-interruptor"
          disabled={ocupado || ficha === undefined} onClick={cambiar} />
      </div>
      <p className="y-card-p">Un correo a la semana con:</p>
      <ul className="ysu-lista">
        <li>la conversación de la semana y los podcasts grabados,</li>
        <li>los artículos de opinión publicados,</li>
        <li>una selección de las noticias más relevantes, con sus fuentes.</li>
      </ul>
      <p className="ysu-estado" style={{ color: "var(--y-auto-ink)" }}>
        {activo ? `Activado desde el ${fecha(ficha.boletin_desde)}` : "Actívalo con el interruptor"}</p>
      {msg && <p className={`ysu-msg ${msg[0]}`}>{msg[1]}</p>}
    </div>
  );
}

function MiCuenta({ sesion, recuperando }) {
  const [ficha, setFicha] = useFicha(sesion);
  const [baja, setBaja] = useState(0); const [msg, setMsg] = useState(null);
  const [cambiarClave, setCambiarClave] = useState(false);
  const navigate = useNavigate();
  const interna = ficha === null;
  const conClave = (ficha?.proveedor || sesion.user.app_metadata?.provider) === "email";

  if (recuperando) return (
    <div className="y-card" style={{ marginTop: 28, maxWidth: 520 }}>
      <NuevaContrasena titulo="Elige una contraseña nueva" alTerminar={() => {
        navigate("/suscribete", { replace: true }); setMsg(["ok", "Contraseña cambiada. Ya puedes entrar con ella."]);
      }} />
    </div>
  );

  return (
    <>
      <div className="ysu-panel">
        <div className="y-card">
          <p className="y-eyebrow" style={{ color: "var(--y-ink)" }}>Tu cuenta</p>
          <p style={{ fontSize: 19, fontWeight: 800, margin: 0, wordBreak: "break-all" }}>{sesion.user.email}</p>
          <p className="y-card-p">{interna ? "Cuenta de la redacción: se gestiona desde el portal."
            : `Inscripción gratuita${ficha?.alta ? ` desde el ${fecha(ficha.alta)}` : ""}${ficha?.proveedor === "google" ? " · con Google" : ""}.`}</p>
          {conClave && (cambiarClave
            ? <NuevaContrasena alTerminar={() => { setCambiarClave(false); setMsg(["ok", "Contraseña cambiada."]); }} />
            : <button type="button" className="ysu-enlace" style={{ alignSelf: "flex-start" }} onClick={() => setCambiarClave(true)}>Cambiar la contraseña</button>)}
          <div style={{ marginTop: "auto", paddingTop: 8 }}>
            <button className="y-btn y-btn--ghost" type="button" onClick={async () => { await (await supabase()).auth.signOut(); }}>Cerrar sesión</button>
          </div>
          {msg && <p className={`ysu-msg ${msg[0]}`} role="status">{msg[1]}</p>}
        </div>
        {!interna && <Boletin ficha={ficha} setFicha={setFicha} />}
        <div className="y-card y-card--pod">
          <p className="y-eyebrow">Podcast</p>
          <p className="y-card-t" style={{ margin: 0 }}>Tus descargas</p>
          <p className="y-card-p">En cada episodio tienes ahora el botón «Descargar MP3» para escucharlo sin conexión.</p>
          <div style={{ marginTop: "auto", paddingTop: 8 }}>
            <Link className="y-btn" to="/podcast" style={{ background: "var(--y-pod-acc)", color: "var(--y-pod-bg)" }}>Ir al podcast</Link>
          </div>
        </div>
      </div>
      {!interna && (
        <div className="ysu-peligro">
          {baja === 0 ? (
            <>¿Quieres irte? <button type="button" className="ysu-enlace" onClick={() => setBaja(1)}>Borrar mi cuenta</button></>
          ) : (
            <>
              <p style={{ margin: "0 0 12px" }}>Se borrarán tu cuenta, tu correo y tu suscripción al boletín. No se puede deshacer
                (aunque puedes volver a inscribirte cuando quieras).</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="y-btn" type="button" style={{ background: "#a8321e" }} onClick={async () => {
                  const sb = await supabase();
                  const { error } = await sb.rpc("baja_suscriptor");
                  if (error) return setMsg(["err", /NO_ES_LECTOR/.test(error.message) ? "Las cuentas internas se gestionan desde el portal." : mensajeError(error)]);
                  // La cuenta ya no existe en el servidor: se borra la sesión de este navegador sin preguntarle.
                  try { sessionStorage.setItem("ysu-adios", "1"); } catch { /* sin almacenamiento: no hay despedida */ }
                  await sb.auth.signOut({ scope: "local" });
                }}>Sí, borrar mi cuenta</button>
                <button className="y-btn y-btn--ghost" type="button" onClick={() => setBaja(0)}>Cancelar</button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default function Suscribete() {
  const { sesion, cargando, evento } = useCuenta();
  const { pathname } = useLocation();
  const recuperando = evento === "PASSWORD_RECOVERY" || pathname.endsWith("/nueva-contrasena");
  const [despedida, setDespedida] = useState(false);
  // Tras borrar la cuenta la sesión desaparece y se vuelve al formulario: se despide una vez.
  useEffect(() => {
    if (sesion || cargando) return;
    try { if (sessionStorage.getItem("ysu-adios")) { sessionStorage.removeItem("ysu-adios"); setDespedida(true); } } catch { /* sin almacenamiento */ }
  }, [sesion, cargando]);
  return (
    <div className="y-wrap">
      <style>{CSS}</style>
      <div className="ysu">
        <div className="ysu-cab">
          <p className="y-eyebrow">{sesion ? "Mi cuenta" : "Inscripción gratuita"}</p>
          <h1 className="y-h1" style={{ margin: "12px 0 14px" }}>{sesion ? "Ya formas parte de Yamacoa." : "Yamacoa, también en tu correo."}</h1>
          <p className="y-lede">{sesion
            ? "Desde aquí eliges qué te llega y gestionas tu cuenta. Gracias por acompañarnos."
            : "Crea una cuenta gratuita para descargar el podcast y, si quieres, recibir cada domingo lo esencial de la semana sobre Cuba. Leer y escuchar sigue siendo abierto para todos."}</p>
        </div>
        {cargando ? null : sesion ? <MiCuenta sesion={sesion} recuperando={recuperando} /> : (
          <>
            {despedida && <p className="ysu-msg ok" style={{ maxWidth: 640 }}>Cuenta borrada. Gracias por haber estado: aquí seguimos, abiertos para leer y escuchar.</p>}
            {recuperando && <p className="ysu-msg err" style={{ maxWidth: 640 }}>Este enlace ya no es válido o ha caducado. Pide otro desde «Ya tengo cuenta» → «¿Olvidaste la contraseña?».</p>}
            <Ventajas />
            <div className="ysu-cuerpo">
              <Formulario />
              <Preguntas />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
