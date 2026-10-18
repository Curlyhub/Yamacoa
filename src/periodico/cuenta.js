import { useEffect, useState } from "react";

/* Cuenta de lector en yamacoa.com (Supabase Auth, 2026-10-18). Inscripción gratuita; los
   lectores viven en `suscriptores`, separados de los internos (`perfiles`): ver
   ops/suscriptores/suscriptores_supabase.sql. El cliente de Supabase se carga BAJO DEMANDA
   (al entrar, inscribirse o descargar): quien solo lee no descarga la biblioteca. */

const SUPABASE_URL = "https://qsajkrppuaikyzmuipru.supabase.co";
const SUPABASE_PUBLICA = "sb_publishable_iuMth2MYSMZ2Y6-pN5gF8Q_Okq9CwWJ"; // publicable (la del portal)
const CLAVE_SESION = "sb-qsajkrppuaikyzmuipru-auth-token";

let cliente = null;
let cargandoCliente = null;
const oyentes = new Set(); // useCuenta montados que esperan a que exista el cliente
export async function supabase() {
  if (!cliente) {
    cargandoCliente ||= import("@supabase/supabase-js").then(({ createClient }) => {
      cliente = createClient(SUPABASE_URL, SUPABASE_PUBLICA, {
        auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true, autoRefreshToken: true },
      });
      oyentes.forEach((f) => f(cliente));
      return cliente;
    });
    await cargandoCliente;
  }
  return cliente;
}

// Sin cargar la biblioteca: ¿hay una sesión guardada en este navegador?
export function haySesionGuardada() {
  try { return !!localStorage.getItem(CLAVE_SESION); } catch { return false; }
}

// Vuelta de Google o de un enlace de correo: la URL trae ?code= o #access_token.
const vieneDeAuth = () => /[?&#](code|access_token|error_description)=/.test(window.location.search + window.location.hash);

/* { sesion, cargando, evento } — carga el cliente al montar solo si hay sesión guardada o se
   vuelve de un flujo de autenticación; si no, se engancha en cuanto alguien lo cargue (al entrar
   o inscribirse sin sesión previa, p. ej. tras una baja). `evento` es el último de
   onAuthStateChange (p. ej. PASSWORD_RECOVERY). */
export function useCuenta() {
  const [estado, setEstado] = useState({ sesion: null, cargando: haySesionGuardada() || vieneDeAuth(), evento: null });
  useEffect(() => {
    let vivo = true; let sub = null;
    const enganchar = async (sb) => {
      if (sub || !vivo) return;
      sub = sb.auth.onAuthStateChange((evento, sesion) => vivo && setEstado({ sesion, cargando: false, evento })).data.subscription;
      const { data } = await sb.auth.getSession();
      if (vivo) setEstado((e) => ({ ...e, sesion: data.session, cargando: false }));
    };
    oyentes.add(enganchar);
    if (cliente) enganchar(cliente);
    else if (haySesionGuardada() || vieneDeAuth()) supabase();
    return () => { vivo = false; oyentes.delete(enganchar); sub?.unsubscribe(); };
  }, []);
  return estado;
}

// Mensajes de Supabase Auth en español (los más habituales).
export function mensajeError(e) {
  const m = String(e?.message || e || "");
  if (/Invalid login credentials/i.test(m)) return "Correo o contraseña incorrectos.";
  if (/Email not confirmed/i.test(m)) return "Aún no has confirmado tu correo: revisa la bandeja de entrada (y el correo no deseado).";
  if (/already registered|already been registered/i.test(m)) return "Ya hay una cuenta con ese correo. Entra o recupera la contraseña.";
  if (/Password should be at least/i.test(m)) return "La contraseña es demasiado corta (mínimo 8 caracteres).";
  if (/rate limit|too many/i.test(m)) return "Demasiados intentos seguidos. Espera unos minutos.";
  if (/Signups not allowed/i.test(m)) return "Las inscripciones aún no están abiertas.";
  return m || "Algo ha fallado. Inténtalo de nuevo.";
}
