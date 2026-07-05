import React, { Suspense } from "react";
//import { HashRouter, Routes, Route } from "react-router-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout.jsx";
import Landing from "./components/Landing.jsx";
import temas from "./temas/registry.js";

// Ruta explícita para la página de metodología (no es un expediente del registry).
const Metodologia = React.lazy(() => import("./temas/metodologia.jsx"));

// Cada tema se carga en diferido desde su `load` del registry. React.lazy se
// resuelve al `export default` del .jsx del tema (importado con alias, nunca
// por su nombre literal `App`).
const temasLazy = temas.map((tema) => ({
  ...tema,
  Componente: React.lazy(tema.load),
}));

function Cargando() {
  return (
    <div className="ym-cargando" role="status" aria-live="polite">
      Cargando análisis…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<Cargando />}>
          <Routes>
            <Route path="/" element={<Landing />} />
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

// export default function App() {
//   return (
//     <HashRouter>
//       <Layout>
//         <Suspense fallback={<Cargando />}>
//           <Routes>
//             <Route path="/" element={<Landing />} />
//             <Route path="/metodologia" element={<Metodologia />} />
//             {temasLazy.map(({ id, path, Componente }) => (
//               <Route key={id} path={path} element={<Componente />} />
//             ))}
//           </Routes>
//         </Suspense>
//       </Layout>
//     </HashRouter>
//   );
// }
