import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout.jsx";
import Portada from "./periodico/Portada.jsx";
import temas from "./temas/registry.js";

// Rutas fuera del registry: metodología y las secciones del periódico. Las
// plantillas (noticia, estudio, episodio) son UNA por tipología; su contenido
// llega del feed en tiempo de ejecución (periodico/feed.js).
const Metodologia = React.lazy(() => import("./temas/metodologia.jsx"));
const Noticias = React.lazy(() => import("./periodico/Noticias.jsx"));
const Noticia = React.lazy(() => import("./periodico/Noticia.jsx"));
const Estudios = React.lazy(() => import("./periodico/Estudios.jsx"));
const EstudioAuto = React.lazy(() => import("./periodico/Estudios.jsx").then((m) => ({ default: m.EstudioAuto })));
const Expedientes = React.lazy(() => import("./periodico/Expedientes.jsx"));
const Podcast = React.lazy(() => import("./periodico/Podcast.jsx"));
const Episodio = React.lazy(() => import("./periodico/Podcast.jsx").then((m) => ({ default: m.Episodio })));
const Suscribete = React.lazy(() => import("./periodico/Suscribete.jsx"));
const Opinion = React.lazy(() => import("./periodico/Opinion.jsx"));
const Privacidad = React.lazy(() => import("./periodico/Privacidad.jsx"));
const Articulo = React.lazy(() => import("./periodico/Opinion.jsx").then((m) => ({ default: m.Articulo })));

// Cada expediente se carga en diferido desde su `load` del registry. React.lazy se
// resuelve al `export default` del .jsx del tema (importado con alias, nunca
// por su nombre literal `App`).
const temasLazy = temas.map((tema) => ({
  ...tema,
  Componente: React.lazy(tema.load),
}));

function Cargando() {
  return (
    <div className="ym-cargando" role="status" aria-live="polite">
      Cargando…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<Cargando />}>
          <Routes>
            <Route path="/" element={<Portada />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/noticias/:slug" element={<Noticia />} />
            <Route path="/estudios" element={<Estudios />} />
            <Route path="/estudios/:slug" element={<EstudioAuto />} />
            <Route path="/expedientes" element={<Expedientes />} />
            <Route path="/podcast" element={<Podcast />} />
            <Route path="/podcast/:slug" element={<Episodio />} />
            <Route path="/suscribete" element={<Suscribete />} />
            <Route path="/opinion" element={<Opinion />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/opinion/:slug" element={<Articulo />} />
            <Route path="/metodologia" element={<Metodologia />} />
            {temasLazy.map(({ id, path, Componente }) => (
              <Route key={id} path={path} element={<Componente />} />
            ))}
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}
