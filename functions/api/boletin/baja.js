// Cloudflare Pages Function — baja del boletín semanal con un clic (2026-10-18).
//
//   GET  /api/boletin/baja?t=<token>  -> página con un botón (los antivirus de correo abren los
//                                         enlaces: un GET no puede dar de baja a nadie).
//   POST /api/boletin/baja?t=<token>  -> baja. Es también el destino de la cabecera
//                                         List-Unsubscribe-Post (RFC 8058) que usan Gmail y Outlook.
//
// La RPC boletin_baja (ops/suscriptores/boletin_supabase.sql) solo apaga el boletín del token
// dado; la cuenta del lector no se toca. Clave publicable, como el middleware.

const SUPABASE = "https://qsajkrppuaikyzmuipru.supabase.co";
const SUPABASE_PUBLICA = "sb_publishable_iuMth2MYSMZ2Y6-pN5gF8Q_Okq9CwWJ";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const pagina = (titulo, cuerpo) => new Response(`<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${titulo} · Yamacoa</title><link rel="stylesheet" href="/fonts/fuentes.css">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#efe8df;color:#1f1a16;
font-family:Manrope,system-ui,sans-serif;padding:24px;box-sizing:border-box}
main{max-width:460px;background:#fcf9f4;border-radius:24px;padding:30px 28px}
.m{font:600 22px Manrope,system-ui,sans-serif;letter-spacing:-.02em;margin:0 0 18px}
h1{font-size:24px;letter-spacing:-.02em;margin:0 0 10px}p{font-size:16px;line-height:1.55;color:#4a3f36}
button,a.b{display:inline-block;background:#3a2418;color:#fcf9f4;border:0;border-radius:999px;padding:13px 24px;
font:700 15px Manrope,system-ui,sans-serif;cursor:pointer;text-decoration:none}a{color:#b8562e}</style></head>
<body><main><p class="m">Yamacoa</p>${cuerpo}</main></body></html>`,
  { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });

export async function onRequestGet({ request }) {
  const t = new URL(request.url).searchParams.get("t") || "";
  if (!UUID.test(t)) return pagina("Enlace no válido", `<h1>Este enlace no es válido</h1>
    <p>Puedes desactivar el boletín desde <a href="/suscribete">tu cuenta</a>.</p>`);
  return pagina("Dejar el boletín", `<h1>¿Dejas de recibir el boletín?</h1>
    <p>Dejarás de recibir el correo semanal de Yamacoa. Tu cuenta sigue igual y puedes volver a activarlo cuando quieras.</p>
    <form method="post"><button type="submit">Sí, no quiero recibirlo</button></form>`);
}

export async function onRequestPost({ request }) {
  const t = new URL(request.url).searchParams.get("t") || "";
  let ok = false;
  if (UUID.test(t)) {
    const r = await fetch(`${SUPABASE}/rest/v1/rpc/boletin_baja`, {
      method: "POST", headers: { apikey: SUPABASE_PUBLICA, "Content-Type": "application/json" },
      body: JSON.stringify({ p_token: t }),
    }).catch(() => null);
    ok = !!r && r.ok;
  }
  if (!ok) return pagina("No se pudo", `<h1>No hemos podido darte de baja</h1>
    <p>Inténtalo de nuevo en un momento o desactívalo desde <a href="/suscribete">tu cuenta</a>.</p>`);
  return pagina("Hecho", `<h1>Hecho: ya no recibirás el boletín</h1>
    <p>Tu cuenta sigue activa. Si cambias de idea, lo activas de nuevo en <a href="/suscribete">Mi cuenta</a>.</p>
    <p><a class="b" href="/">Ir a Yamacoa</a></p>`);
}
