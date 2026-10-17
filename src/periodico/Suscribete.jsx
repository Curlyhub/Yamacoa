import { Link } from "react-router-dom";

/* Suscripción: las cuentas (Supabase Auth) y el boletín llegan en la fase 5.
   Hasta entonces la página explica qué incluirá, sin formularios falsos. */

export default function Suscribete() {
  return (
    <div className="y-wrap">
      <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: 40 }}>
        <p className="y-eyebrow">Suscripción</p>
        <h1 className="y-h1" style={{ margin: "12px 0 16px" }}>Muy pronto, tu cuenta en Yamacoa.</h1>
        <p className="y-lede">
          Con una cuenta podrás recibir la edición semanal, guardar episodios para escuchar más tarde,
          votar en las encuestas de cada expediente y hacer más preguntas a cada noticia y estudio.
        </p>
        <div className="y-card" style={{ marginTop: 26 }}>
          <p className="y-eyebrow" style={{ color: "var(--y-ink)" }}>Mientras tanto</p>
          <p className="y-card-p" style={{ marginTop: 8 }}>
            Todo el contenido es abierto. Empieza por las <Link className="y-link" to="/noticias">noticias de la semana</Link>
            {" "}o por el <Link className="y-link" to="/expedientes">archivo de expedientes</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
