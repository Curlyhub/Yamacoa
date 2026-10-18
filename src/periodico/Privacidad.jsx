import { Link } from "react-router-dom";

/* Política de privacidad (2026-10-18). Describe lo que el sitio hace de verdad (revisado en el
   código: sin analítica ni publicidad; almacenamiento local; Supabase y Oracle en Londres,
   Cloudflare, Google solo para «Continuar con Google»; tipografías alojadas en Yamacoa). Si cambia
   un proveedor, una región o lo que se guarda, se actualiza aquí y la fecha. */

const CSS = `
.ypr{max-width:760px; margin:0 auto; padding-top:34px;}
.ypr h2{font-size:22px; letter-spacing:-.02em; margin:34px 0 10px;}
.ypr h3{font-size:16.5px; margin:22px 0 6px;}
.ypr p, .ypr li{font-size:16px; line-height:1.62; color:var(--y-ink-2);}
.ypr ul{padding-left:22px;}
.ypr table{width:100%; border-collapse:collapse; font-size:14.5px; margin:10px 0;}
.ypr th, .ypr td{text-align:left; vertical-align:top; padding:9px 8px; border-bottom:1px solid var(--y-rule);}
.ypr th{font:500 10.5px var(--y-mono); letter-spacing:.06em; text-transform:uppercase; color:var(--y-subtle);}
`;

export default function Privacidad() {
  return (
    <div className="y-wrap">
      <style>{CSS}</style>
      <article className="ypr">
        <p className="y-eyebrow">Privacidad</p>
        <h1 className="y-h1" style={{ margin: "12px 0 14px" }}>Política de privacidad</h1>
        <p className="y-lede">Recogemos lo mínimo y nunca lo vendemos ni lo usamos para publicidad. Leer y escuchar Yamacoa
          no requiere darnos ningún dato. Esta página explica, sin letra pequeña, qué datos tratamos, para qué y
          cómo puedes decidir sobre ellos.</p>
        <p className="y-meta">Última actualización: 18 de octubre de 2026</p>

        <h2>1. Quién es el responsable</h2>
        <p>El responsable del tratamiento es Mr Favier, editor de Yamacoa, con domicilio en Barcelona (España).
          Para cualquier cuestión de privacidad escríbenos a <b>bohiocubano@gmail.com</b>.</p>

        <h2>2. Si solo lees o escuchas</h2>
        <p>No usamos cookies de seguimiento, analítica, píxeles ni publicidad. No sabemos quién eres.</p>
        <ul>
          <li><b>Almacenamiento en tu navegador.</b> Para que el sitio funcione guardamos en tu propio dispositivo,
            sin enviarlo a ningún servidor: el punto en que dejaste un audio, tus votos en las encuestas (para no
            contarlos dos veces) y, si tienes cuenta, tu sesión. Puedes borrarlo desde la configuración de tu navegador.</li>
          <li><b>Encuestas.</b> Los votos son anónimos: la base de datos guarda el recuento, nunca tu IP ni tu identidad.</li>
          <li><b>Registros técnicos.</b> Como cualquier web, los servidores anotan cada petición (dirección IP, fecha,
            página o fichero pedido y navegador) por seguridad y para resolver fallos. Lo hacen Cloudflare, que aloja
            el sitio, y nuestro servidor de audio (tts.yamacoa.com). Base legal: nuestro interés legítimo en mantener
            el servicio seguro. En nuestro servidor se borran a los 14 días; Cloudflare los conserva según su propia política.</li>
          <li><b>Lectura en voz alta.</b> Si pulsas el narrador, el texto de la página se envía a nuestro propio
            servidor de voz para generar el audio. No se envía a terceros.</li>
        </ul>

        <h2>3. Si te inscribes como lector</h2>
        <p>La inscripción es gratuita y sirve para descargar los episodios del podcast.</p>
        <div style={{ overflowX: "auto" }}><table style={{ minWidth: 560 }}>
          <thead><tr><th>Dato</th><th>Para qué</th><th>Base legal</th><th>Cuánto tiempo</th></tr></thead>
          <tbody>
            <tr><td>Correo electrónico</td><td>Identificarte, confirmar la cuenta y recuperar la contraseña</td><td>Tu consentimiento y la prestación del servicio que pides</td><td>Hasta que te des de baja</td></tr>
            <tr><td>Contraseña</td><td>Entrar. Se guarda cifrada por nuestro proveedor de cuentas: nadie en Yamacoa puede verla</td><td>Ídem</td><td>Hasta la baja</td></tr>
            <tr><td>Si entras con Google: nombre y foto de tu cuenta de Google</td><td>Los envía Google al iniciar sesión; no los usamos para nada más</td><td>Tu consentimiento</td><td>Hasta la baja</td></tr>
            <tr><td>Fecha de alta y tipo de acceso (correo o Google)</td><td>Gestionar la cuenta</td><td>Ídem</td><td>Hasta la baja</td></tr>
          </tbody>
        </table></div>
        <p>No te enviaremos boletines ni comunicaciones comerciales sin pedirte antes un consentimiento aparte.
          Puedes <b>darte de baja</b> cuando quieras desde <Link className="y-link" to="/suscribete">Mi cuenta</Link>:
          la cuenta y sus datos se borran en ese momento.</p>

        <h2>4. Si colaboras con Yamacoa</h2>
        <p>Las personas invitadas a escribir o grabar (redacción y colaboradores) usan una cuenta interna, separada de
          las de los lectores.</p>
        <ul>
          <li><b>Artículos de opinión.</b> Guardamos el texto, el documento original y la firma. Puedes firmar con
            seudónimo: en ese caso conocemos tu cuenta pero nunca publicamos tu identidad. Puedes retirar tu artículo
            en cualquier momento, también después de publicado.</li>
          <li><b>Grabaciones de voz.</b> Solo se graba a quien da su consentimiento, que queda registrado con fecha y
            hora. Lo que su autor descarta se borra por completo (audio y transcripción). Lo publicado forma parte del
            archivo del periódico.</li>
          <li><b>Envíos al portal.</b> Guardamos lo que nos envías y quién lo envió, para poder verificarlo.</li>
        </ul>
        <p>Base legal: tu consentimiento y nuestra relación de colaboración. Lo publicado se conserva como archivo
          periodístico; lo no publicado, mientras dure la colaboración o hasta que pidas su borrado.</p>

        <h2>5. Cuidado especial con Cuba</h2>
        <p>Sabemos que dar datos a un medio independiente puede tener consecuencias para quien vive en Cuba o tiene
          familia allí. Por eso: no pedimos más datos de los necesarios, permitimos firmar con seudónimo, nunca
          publicamos información que permita identificar a personas dentro de Cuba y no compartimos datos con ningún
          gobierno salvo obligación legal en España.</p>

        <h2>6. Con quién trabajamos</h2>
        <p>Usamos estos proveedores, que tratan datos por cuenta nuestra y con contrato de encargo:</p>
        <ul>
          <li><b>Supabase</b>: base de datos y cuentas de usuario. Sus servidores están en Londres (Reino Unido).</li>
          <li><b>Cloudflare</b>: alojamiento y distribución del sitio.</li>
          <li><b>Oracle Cloud</b>: nuestro servidor de audio y de grabaciones. Está en Londres (Reino Unido).</li>
          <li><b>Google</b>: solo si eliges «Continuar con Google». Las tipografías del sitio están alojadas en Yamacoa:
            leer no comunica tu IP a Google.</li>
        </ul>
        <p>Los datos de las cuentas y las grabaciones se guardan en el Reino Unido, que cuenta con una decisión de
          adecuación de la Unión Europea. Cloudflare sirve el sitio desde su red mundial, y Supabase, Cloudflare y
          Google son empresas de Estados Unidos: cuando tratan datos fuera del Espacio Económico Europeo lo hacen
          con las garantías previstas por la ley (Marco de Privacidad de Datos UE-EE. UU. o cláusulas contractuales tipo).</p>
        <p>Los enlaces a otros sitios (por ejemplo, vídeos de YouTube o las fuentes de cada noticia) te llevan fuera de
          Yamacoa; allí rigen sus propias políticas.</p>

        <h2>7. Tus derechos</h2>
        <p>Puedes pedirnos acceso a tus datos, su rectificación o supresión, oponerte a su tratamiento, limitarlo,
          llevártelos (portabilidad) y retirar tu consentimiento cuando quieras, escribiendo a <b>bohiocubano@gmail.com</b>. Te responderemos en el plazo legal de un mes. Si crees que no hemos
          atendido bien tu petición, puedes reclamar ante la Agencia Española de Protección
          de Datos (<a className="y-link" href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">aepd.es</a>).</p>

        <h2>8. Menores</h2>
        <p>La inscripción no está dirigida a menores de 14 años.</p>

        <h2>9. Cambios</h2>
        <p>Si cambiamos algo importante de esta política (por ejemplo, si llega una suscripción de pago o un boletín),
          lo anunciaremos en el sitio y, si afecta a tu cuenta, te pediremos de nuevo tu consentimiento.</p>
      </article>
    </div>
  );
}
