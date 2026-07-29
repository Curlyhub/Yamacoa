import React, { useState, useEffect } from "react";

/* ------------------------------------------------------------------
   Tema: marco-fondo-soberano
   Paleta: "Bronce y Ciruela"
     bronce  #83924F  h73   -> portada + renderer (el articulado)
     ciruela #9B65A4  h291  -> SOLO renderer (los cuatro fallos)
     ambar   #C98A17        -> decision abierta (convencion de plataforma)
     hueso   #D8D2C6        -> texto destacado
   Renderer congelado. Solo respira el .json.
------------------------------------------------------------------- */

const RUTA_DATOS = "/data/marco-fondo-soberano.json";

const C = {
  fondo: "#131310",
  panel: "#1C1D18",
  borde: "#2E3028",
  texto: "#E9E9E2",
  cuerpo: "#C6C7BC",
  tenue: "#8A8C7E",
  bronce: "#83924F",
  bronceClaro: "#A8B872",
  bronceTenue: "#4E5632",
  ciruela: "#9B65A4",
  ciruelaClara: "#BD8AC4",
  ciruelaTenue: "#5A3B60",
  ambar: "#C98A17",
  hueso: "#D8D2C6"
};

const CONFIANZA = {
  confirmado: { etiqueta: "confirmado", color: "#A8B872" },
  reportado: { etiqueta: "reportado", color: "#BD8AC4" },
  estimado: { etiqueta: "estimado", color: "#C98A17" },
  normativo: { etiqueta: "normativo", color: "#8A8C7E" }
};

const DATOS_EMBEBIDOS = {
  meta: {
    slug: "marco-fondo-soberano",
    titulo: "El fondo que aún no existe",
    subtitulo: "Marco para la creación de cualquier fondo soberano en una Cuba democrática",
    kicker: "Edición especial",
    version: "1.0.0",
    actualizado: "2026-07-29",
    naturaleza: "marco normativo",
    advertencia_naturaleza:
      "Esto no es la propuesta de un fondo. Es el conjunto de condiciones que cualquier fondo soberano cubano debería satisfacer para merecer ese nombre, con independencia de qué recurso lo alimente, qué gobierno lo cree o qué mayoría lo apruebe.",
    tema_hermano: {
      slug: "cascada",
      ruta: "#/cascada",
      relacion:
        "Aquel tema aporta el tratamiento cuantitativo del valor realizable del subsuelo. Este aporta la arquitectura institucional."
    }
  },
  premisa: {
    enunciado:
      "Este marco está escrito para una Cuba democrática consolidada. No para las condiciones actuales, ni para un período de transición.",
    desarrollo:
      "Las garantías que exige no son factibles en entornos poco democráticos. Un fondo soberano no crea instituciones: las presupone. Donde no existan, lo que se cree llevará el nombre pero no la función.",
    declaracion_de_sesgo:
      "Este texto no es neutral en un punto: sostiene que la rigidez constitucional de las reglas de extracción es preferible a la flexibilidad legislativa. Ese es un juicio, no un dato.",
    confianza: "normativo"
  },
  fallos: [
    {
      id: "perimetro", orden: 1, titulo: "El fallo de perímetro", caso: "Alaska", periodo: "1976 – presente",
      sintesis: "El conflicto migra a lo que dejaste fuera del blindaje.",
      hechos: [
        { texto: "El Fondo Permanente se creó en 1976 por votación popular, 75.588 votos contra 38.518, incorporándose al Artículo IX Sección 15 de la Constitución del estado.", confianza: "confirmado" },
        { texto: "Medio siglo después, el capital sigue intacto. La protección constitucional funcionó como se prometió.", confianza: "confirmado" },
        { texto: "Pero las ganancias se alojaron en una cuenta separada creada por ley ordinaria, no por la constitución. Es el componente gastable.", confianza: "confirmado" },
        { texto: "En 2018-19, una parte fija de esas ganancias pasó a tratarse como ingreso general para financiar operaciones ordinarias del gobierno.", confianza: "confirmado" }
      ],
      leccion: "Blindar el principal y dejar el rendimiento en rango legal es dejar la puerta abierta, solo que un poco más lejos del vestíbulo.",
      genera_articulos: [4]
    },
    {
      id: "rigidez", orden: 2, titulo: "El fallo de rigidez", caso: "Timor-Leste", periodo: "2005 – presente",
      sintesis: "Una regla calibrada para un país rico, aplicada a uno que debe reconstruirse, se incumple.",
      hechos: [
        { texto: "Timor-Leste adoptó una regla de extracción del 3% de la riqueza petrolera anual, calcada del modelo noruego.", confianza: "confirmado" },
        { texto: "El NRGI documenta que resultó demasiado restrictiva dada la escasez de capital, la pobreza y la alta rentabilidad social de la inversión doméstica. La regla se ha incumplido de forma sistemática.", confianza: "confirmado" },
        { texto: "El 3% noruego no es un principio sino un parámetro: se fijó en el 4% al introducirse la regla y se rebajó al 3% en 2017.", confianza: "confirmado" }
      ],
      leccion: "La restricción tiene que ser función del estado de desarrollo del país, no una constante.",
      genera_articulos: [7, 8, 9, 10]
    },
    {
      id: "proliferacion", orden: 3, titulo: "El fallo de proliferación", caso: "Venezuela", periodo: "2005 – 2015",
      sintesis: "No era un fondo con problemas de control: era un sistema de presupuestos paralelos.",
      hechos: [
        { texto: "Según Transparencia Venezuela, el FONDEN comprometió unos 174.898 millones de dólares en 781 proyectos entre 2005 y mediados de 2015.", confianza: "reportado" },
        { texto: "Cerca del 29% del total asignado fue a gasto corriente y en torno al 5% a compra de armamento y vehículos militares.", confianza: "reportado" },
        { texto: "El FONDEN no estaba solo: convivía con una docena larga de fondos poco transparentes, incluidos dos bilaterales con China.", confianza: "reportado" },
        { texto: "El NRGI identifica el mismo patrón en los fondos soberanos de Angola, Irán y Rusia: eluden los procedimientos presupuestarios ordinarios.", confianza: "confirmado" }
      ],
      leccion: "Perímetro único. Basta que un fondo sea laxo para que se convierta en la salida de todo.",
      genera_articulos: [5, 6]
    },
    {
      id: "custodia", orden: 4, titulo: "El fallo de custodia", caso: "Kazajistán", periodo: "2017 – 2023",
      sintesis: "La inmunidad soberana no protege a un fondo como protege a un banco central.",
      hechos: [
        { texto: "En octubre de 2017, unos inversores con un laudo arbitral de Estocolmo obtuvieron de un tribunal de Bruselas una orden de embargo sobre activos del Fondo Nacional de Kazajistán.", confianza: "confirmado" },
        { texto: "BNY Mellon, custodio global, congeló 22.600 millones de dólares, alrededor del 40% de la cartera, en lo que se considera el mayor embargo de la historia jurídica. El laudo era de unos 542 millones.", confianza: "confirmado" },
        { texto: "El detonante no fue deuda impagada sino una disputa entre inversores y el Estado. Kazajistán era un Estado funcional, sin crisis de deuda, integrado en mercados.", confianza: "confirmado" },
        { texto: "En el mismo litigio, un tribunal sueco sí rechazó ejecutar contra activos del Banco Nacional por gozar de inmunidad. La línea se trazó donde estaba el banco central, no donde estaba el fondo.", confianza: "confirmado" }
      ],
      leccion: "El riesgo no viene de la deuda actual sino de la integración internacional futura.",
      aplicacion_cuba: "Una Cuba democrática generará reclamaciones patrimoniales y firmará tratados de inversión. El fondo será el único activo estatal grande, líquido, localizable y custodiado en jurisdicción extranjera.",
      genera_articulos: [12]
    }
  ],
  articulado: [
    { n: 1, titulo: "Premisa democrática", es_nuevo: false, responde_a: [], cuerpo: "El fondo solo puede crearse en condiciones de salud democrática verificable. Las garantías del proceso son la condición que hace que el blindaje signifique algo.", nota: "Noruega no se volvió confiable por crear su fondo; creó su fondo porque ya era confiable." },
    { n: 2, titulo: "Naturaleza jurídica y rango constitucional", es_nuevo: false, responde_a: [], cuerpo: "Creación mediante tres fases inseparables: educación ciudadana; plebiscito vinculante con observación internacional; incorporación a la Constitución.", clausulas: ["Toda modificación posterior exige repetir íntegramente el mismo procedimiento.", "El funcionamiento operativo cotidiano queda expresamente fuera de esta exigencia."] },
    { n: 3, titulo: "Distinción entre funcionamiento y extracción", es_nuevo: false, responde_a: [], cuerpo: "Dos planos separados, con regímenes opuestos por diseño.", clausulas: ["Funcionamiento operativo: flexible en lo técnico y plenamente transparente.", "Extracción y objetivos: sometido al blindaje constitucional reforzado. La baja flexibilidad es deliberada."] },
    { n: 4, titulo: "Perímetro del blindaje", es_nuevo: true, responde_a: ["perimetro"], cuerpo: "El blindaje cubre con idéntico rango: el capital principal; el rendimiento no extraído, que se capitaliza automáticamente al principal en el mismo ejercicio; las reglas de aportación; las de extracción; y los objetivos fundamentales.", clausulas: ["No existe cuenta intermedia. Queda prohibida la creación de cualquier cuenta, reserva o subfondo que aloje rendimientos bajo régimen jurídico distinto al del principal."], nota: "Este es el artículo que impide el fallo de Alaska." },
    { n: 5, titulo: "Perímetro institucional", es_nuevo: true, responde_a: ["proliferacion"], cuerpo: "Queda prohibida constitucionalmente la creación de fondos soberanos paralelos. Cualquier finalidad nueva se instrumenta como ventanilla interna del fondo único.", clausulas: ["Se admiten cuentas internas de finalidad distinta siempre que compartan perímetro jurídico y órgano de gobierno. Chile opera con esta arquitectura."] },
    { n: 6, titulo: "Fuentes admisibles", es_nuevo: false, revisado: true, responde_a: ["proliferacion"], cuerpo: "El fondo se nutre exclusivamente de rentas de recursos naturales agotables; ingresos extraordinarios no recurrentes; rendimientos propios; y contribuciones voluntarias con trazabilidad completa.", clausulas: ["Queda expresamente excluida la tributación ordinaria de sectores de actividad corriente.", "Se evitará en todo caso la dependencia de una fuente única."], fundamento: "El níquel califica: es finito y pertenece también a quien no ha nacido. El turismo o la biotecnología son actividad ordinaria sujeta a impuestos ordinarios. Apartar constitucionalmente esa recaudación sería blindar contra la temporalidad política ingresos que deben estar sujetos a la temporalidad política." },
    { n: 7, titulo: "Regla de aportación creciente", es_nuevo: true, responde_a: ["rigidez"], cuerpo: "La fracción de renta que ingresa al fondo no es constante: comienza baja y crece conforme el país converge. En la fase temprana la mayor parte va a reconstrucción, donde su rentabilidad social es máxima.", nota: "Preferible a la tasa de extracción decreciente por una razón política: no exige a ningún gobierno justificar que saca dinero del fondo del pueblo. Noruega hizo esto de facto: ley en 1990, primera transferencia en 1996." },
    { n: 8, titulo: "Regla de extracción", es_nuevo: false, revisado: true, responde_a: ["rigidez"], cuerpo: "La extracción se calcula como porcentaje del valor de mercado medio del fondo en los cinco de los seis ejercicios precedentes. La media móvil impide extraer sobre un pico de valoración. Alaska aplica esta metodología con un tope legal del 5%.", clausulas: ["El porcentaje es decreciente y pre-especificado en el texto constitucional, no delegado a ley de desarrollo.", "Prohibida la extracción del capital principal salvo emergencia nacional extrema sometida a plebiscito."], cuestiones_abiertas: [{ titulo: "Base de cálculo", texto: "Debe quedar explícito si el porcentaje se aplica al valor del fondo o al rendimiento real esperado. La diferencia es de un orden de magnitud." }, { titulo: "Objeto de la restricción", texto: "Una tasa decreciente sobre un fondo creciente puede producir transferencias absolutas crecientes. Hay que decidir si vincula a la tasa o a la transferencia real per cápita." }] },
    { n: 9, titulo: "Indicador de convergencia", es_nuevo: true, responde_a: ["rigidez"], cuerpo: "El calendario se indexa a un indicador de convergencia, con tres requisitos innegociables.", clausulas: ["Producción externa: certificado por entidad ajena al gobierno, no por la oficina nacional de estadística. Quien controla la serie controla la regla.", "Fórmula pre-especificada en el texto constitucional. No se delega.", "Bidireccionalidad definida: debe estar escrito qué ocurre si el indicador retrocede."] },
    { n: 10, titulo: "Cláusula de escape", es_nuevo: true, responde_a: ["rigidez"], cuerpo: "Toda regla fiscal sin cláusula de escape creíble se rompe. Este marco la incorpora en lugar de fingir que no hará falta.", clausulas: ["La reversión al alza es automática, nunca discrecional.", "Se activa solo por shocks verificados externamente y definidos de antemano.", "Lleva caducidad automática predefinida, con retorno al calendario ordinario sin acto positivo alguno."] },
    { n: 11, titulo: "Gobernanza", es_nuevo: false, responde_a: [], cuerpo: "Consejo de Administración de profesionales independientes con mandatos largos y renovación escalonada. Comité de Ética y Cumplimiento independiente. Banco Central como supervisor de riesgos sistémicos, con separación estructural. Parlamento con control político del marco general.", clausulas: ["Ningún gobierno podrá ordenar inversiones concretas ni disponer de recursos fuera de las reglas constitucionales."] },
    { n: 12, titulo: "Inmunidad, custodia y jurisdicción", es_nuevo: true, responde_a: ["custodia"], cuerpo: "Cuatro cláusulas que son buen diseño con o sin deuda pendiente.", clausulas: ["Declaración de fin público no comercial del patrimonio, con la formulación más restrictiva posible respecto a la excepción de uso comercial.", "Prohibición constitucional de renuncia a la inmunidad. Cierra la vía de exposición más común, que es contractual y voluntaria.", "Custodia deliberadamente fragmentada. La concentración en un custodio único convirtió un litigio de 542 millones en un congelamiento de 22.600.", "Separación estructural respecto al banco central."] },
    { n: 13, titulo: "Transparencia", es_nuevo: false, responde_a: [], cuerpo: "Con rango constitucional desde el origen: publicación periódica de cartera, rentabilidad, costes y decisiones; auditorías independientes obligatorias; acceso público a las metodologías de valoración y de cálculo de la regla de extracción." },
    { n: 14, titulo: "Régimen sancionador", es_nuevo: false, responde_a: [], cuerpo: "Sanciones administrativas y, en casos graves, penales, para quienes dispongan de recursos al margen de las reglas, falseen información o presionen a los órganos de gestión. Previo debido proceso y con control judicial.", nota: "La eficacia de este artículo depende íntegramente del Artículo 1. Donde el poder judicial no sea independiente, este régimen es decorativo." }
  ],
  decision_pendiente: {
    titulo: "El dividendo ciudadano",
    planteamiento: "Este marco deja abierta deliberadamente una pregunta que no puede resolverse por vía técnica.",
    a_favor: { etiqueta: "A favor del reparto directo", argumento: "Un plebiscito solo protege si el ciudadano medio tiene un interés material identificable en el resultado. Sin cheque, la defensa del fondo depende de una convicción abstracta sobre las generaciones futuras, que es el tipo de convicción que cede ante una crisis fiscal. Alaska reparte un dividendo anual, y eso ha convertido a cada residente en parte interesada." },
    en_contra: { etiqueta: "En contra", argumento: "El dividendo compite con la reconstrucción. Cada dólar repartido es un dólar que no va a red eléctrica, agua o vivienda, donde su rentabilidad social es superior. Y el caso de Alaska muestra que el dividendo, una vez instaurado, se politiza: puede acabar siendo la palanca que abre el perímetro en lugar de la fuerza que lo defiende." },
    resolucion_procedimental: "El plebiscito de creación debería someter esta cuestión por separado, no fundida en la aprobación general del fondo, porque son decisiones de naturaleza distinta y una puede ganar mientras la otra pierde."
  },
  anexo_admisibilidad: {
    titulo: "Anexo de admisibilidad para la fase de ejecución",
    preambulo: "Estas cinco condiciones no son recomendaciones. Son criterios de admisibilidad: mientras no se cumplan, no hay fondo que constituir.",
    criterios: [
      { letra: "A", titulo: "Protocolo de valoración patrimonial", texto: "Ninguna cifra de riqueza mineral entra en el debate público sin la cadena completa: reservas certificadas, recursos declarados por separado, recuperación metalúrgica, costes, y valor actual neto descontado, con auditor independiente.", prohibicion: "Queda prohibido usar el valor bruto de contenido metálico en yacimiento como valor de activo. Sobreestima el valor realizable en un factor superior a veinte.", enlace_tema: "#/cascada" },
      { letra: "B", titulo: "Balance consolidado previo", texto: "Antes de capitalizar: deuda oficial, deuda comercial, reclamaciones patrimoniales y pasivos contingentes, todo en un único estado auditado." },
      { letra: "C", titulo: "Criterio de carry", texto: "No capitalizar mientras existan pasivos con coste superior al rendimiento esperado del fondo. Ahorrar y deber simultáneamente destruye valor cada año. Es aritmética, no política." },
      { letra: "D", titulo: "Admisibilidad de fuentes", texto: "Verificación de que cada flujo entrante pertenece a una de las categorías del Artículo 6." },
      { letra: "E", titulo: "Capacidad sancionadora verificada", texto: "Constatación de que existe un poder judicial en condiciones de aplicar el Artículo 14 antes de que haya patrimonio que proteger." }
    ]
  },
  limites: {
    titulo: "Lo que este marco no resuelve",
    preambulo: "Un documento que solo enumera sus fortalezas no merece confianza. Estas son sus juntas débiles.",
    entradas: [
      { titulo: "No resuelve el problema del origen", texto: "Este marco define un procedimiento, no una dotación. Es probable que Cuba no tenga durante años excedente que apartar. Un contenedor constitucional bien diseñado sobre cero sigue siendo cero.", respuesta_honesta: "El fondo no se justifica por la abundancia presente sino por la custodia de una opción: existe un activo agotable cuyo valor depende de decisiones futuras, y no existe institución que impida malvenderlo." },
      { titulo: "No resuelve el problema del patrimonio existente", texto: "El mayor activo estatal cubano hoy no es una reserva mineral: es el conglomerado empresarial bajo control militar. Este marco no aborda qué ocurre con ese patrimonio.", respuesta_honesta: "Cualquier documento sobre fondos soberanos cubanos que esquive esta cuestión está discutiendo el segundo problema mientras el primero sigue abierto." },
      { titulo: "No resuelve la asimetría de la evidencia sobre credibilidad", texto: "La evidencia de que la rigidez constitucional produce durabilidad es sólida: el capital de Alaska lleva cincuenta años intacto. La de que reduce el coste de financiación es mucho más débil y está confundida con la calidad institucional general.", respuesta_honesta: "El argumento debe formularse en términos de durabilidad, que se puede defender, y no de prima de riesgo, que no." },
      { titulo: "No resuelve la referencia a Singapur", texto: "Los vehículos soberanos singapurenses son referencias técnicas de gestión, no de legitimación democrática, y su marco político carece de alternancia.", respuesta_honesta: "Invocarlos en la fase de educación ciudadana de un documento cuyo eje es el plebiscito vinculante introduce una contradicción normativa que los críticos explotarán con razón." }
    ]
  },
  principio_rector: {
    enunciado: "El fondo no pertenece al gobierno de turno ni a ninguna mayoría parlamentaria temporal. Pertenece a todos los cubanos, presentes y futuros.",
    consecuencia: "De ahí se sigue lo único que este documento pide de verdad: que las reglas que protegen su capital y limitan su extracción solo puedan alterarse mediante el mismo procedimiento de legitimación ciudadana reforzada que las creó. Todo lo demás es calibración. Esto es la estructura."
  },
  fuentes: [
    { caso: "perimetro", referencia: "Constitución de Alaska, Artículo IX Sección 15; documentación de la Alaska Permanent Fund Corporation." },
    { caso: "rigidez", referencia: "Natural Resource Governance Institute; Norges Bank y Ministerio de Finanzas de Noruega sobre la revisión de la regla fiscal en 2017." },
    { caso: "proliferacion", referencia: "Transparencia Venezuela, investigación sobre el FONDEN; NRGI sobre fondos usados como vehículos de patronazgo." },
    { caso: "custodia", referencia: "Documentación judicial y de prensa especializada sobre el embargo del Fondo Nacional de Kazajistán en Bélgica (2017) y resoluciones posteriores." }
  ]
};

/* ------------------------------- piezas ------------------------------- */

function Chip({ nivel }) {
  const c = CONFIANZA[nivel] || CONFIANZA.normativo;
  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9.5,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: c.color,
        border: "1px solid " + c.color + "40",
        borderRadius: 2,
        padding: "1px 6px",
        whiteSpace: "nowrap"
      }}
    >
      {c.etiqueta}
    </span>
  );
}

function Rotulo({ children, color }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10.5,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: color || C.tenue,
        marginBottom: 9
      }}
    >
      {children}
    </div>
  );
}

function Parte({ numero, titulo, children }) {
  return (
    <section style={{ marginBottom: 82 }}>
      <div style={{ marginBottom: 26 }}>
        <Rotulo color={C.bronce}>Parte {numero}</Rotulo>
        <h2
          style={{
            fontFamily: "'Archivo Black', 'Archivo', sans-serif",
            fontSize: "clamp(21px, 3.4vw, 30px)",
            margin: 0,
            letterSpacing: "-0.02em",
            color: C.texto
          }}
        >
          {titulo}
        </h2>
        <div style={{ height: 2, width: 54, background: C.bronce, marginTop: 14 }} />
      </div>
      {children}
    </section>
  );
}

/* --------------------- matriz de trazabilidad (firma) --------------------- */

function Trazabilidad({ fallos, articulado, activo, setActivo }) {
  const W = 720;
  const H = 300;
  const xF = 168;
  // Los enlaces ocupan de xF a xA. Se mantienen deliberadamente cortos: lo que
  // sobra a la derecha es el sitio que necesitan las etiquetas del articulado,
  // que llegan a 48 caracteres ("03 · Distinción entre funcionamiento y
  // extracción") y a 10,5px de IBM Plex Mono piden 309px. Con xA mayor el
  // texto se salía del viewBox y se cortaba.
  const xA = 400;
  const cur = (xA - xF) * 0.42; // control de las bezier, proporcional al tramo
  const yF = (i) => 46 + i * ((H - 92) / (fallos.length - 1));
  const arts = articulado.map((a) => a.n);
  const yA = (n) => 24 + (arts.indexOf(n) * (H - 48)) / (arts.length - 1);

  const enlaces = [];
  fallos.forEach((f, i) => {
    f.genera_articulos.forEach((n) => {
      enlaces.push({ fallo: f.id, art: n, y1: yF(i), y2: yA(n) });
    });
  });

  const vivo = (e) =>
    activo === null ||
    (activo.tipo === "fallo" && activo.id === e.fallo) ||
    (activo.tipo === "articulo" && activo.id === e.art);

  return (
    <div style={{ overflowX: "auto", margin: "8px 0 12px" }}>
      <svg viewBox={"0 0 " + W + " " + H} style={{ width: "100%", minWidth: 560, height: "auto" }}>
        <text x={xF - 96} y={16} fill={C.ciruela} fontSize="10.5" fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.14em">
          DIAGNÓSTICO
        </text>
        <text x={xA + 28} y={16} fill={C.bronce} fontSize="10.5" fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.14em">
          ARTICULADO
        </text>

        {enlaces.map((e, i) => (
          <path
            key={i}
            d={
              "M " + (xF + 8) + " " + e.y1 +
              " C " + (xF + 8 + cur) + " " + e.y1 +
              ", " + (xA - 10 - cur) + " " + e.y2 +
              ", " + (xA - 10) + " " + e.y2
            }
            fill="none"
            stroke={vivo(e) ? C.ciruela : C.borde}
            strokeWidth={vivo(e) ? 1.8 : 1}
            strokeOpacity={vivo(e) ? 0.9 : 0.35}
            style={{ transition: "all 160ms" }}
          />
        ))}

        {fallos.map((f, i) => {
          const on = activo === null || (activo.tipo === "fallo" && activo.id === f.id) ||
            (activo.tipo === "articulo" && f.genera_articulos.indexOf(activo.id) !== -1);
          return (
            <g
              key={f.id}
              onMouseEnter={() => setActivo({ tipo: "fallo", id: f.id })}
              onMouseLeave={() => setActivo(null)}
              style={{ cursor: "pointer" }}
            >
              <rect x={xF - 156} y={yF(i) - 15} width={164} height={30} fill="transparent" />
              <text
                x={xF}
                y={yF(i) + 4}
                textAnchor="end"
                fill={on ? C.ciruelaClara : C.tenue}
                fontSize="13"
                fontFamily="'Archivo', sans-serif"
                style={{ transition: "fill 160ms" }}
              >
                {f.caso}
              </text>
              <circle cx={xF + 8} cy={yF(i)} r={on ? 5 : 3.5} fill={on ? C.ciruela : C.ciruelaTenue} style={{ transition: "all 160ms" }} />
            </g>
          );
        })}

        {articulado.map((a) => {
          const on =
            activo === null ||
            (activo.tipo === "articulo" && activo.id === a.n) ||
            (activo.tipo === "fallo" &&
              (fallos.find((f) => f.id === activo.id) || { genera_articulos: [] }).genera_articulos.indexOf(a.n) !== -1);
          const conectado = a.responde_a && a.responde_a.length > 0;
          return (
            <g
              key={a.n}
              onMouseEnter={() => setActivo({ tipo: "articulo", id: a.n })}
              onMouseLeave={() => setActivo(null)}
              style={{ cursor: "pointer" }}
            >
              <rect x={xA - 14} y={yA(a.n) - 9} width={W - xA + 14} height={18} fill="transparent" />
              <circle
                cx={xA - 10}
                cy={yA(a.n)}
                r={on && conectado ? 5 : 3.5}
                fill={conectado ? (on ? C.bronce : C.bronceTenue) : C.borde}
                style={{ transition: "all 160ms" }}
              />
              <text
                x={xA + 4}
                y={yA(a.n) + 3.5}
                fill={on ? (conectado ? C.bronceClaro : C.cuerpo) : C.tenue}
                fontSize="10.5"
                fontFamily="'IBM Plex Mono', monospace"
                style={{ transition: "fill 160ms" }}
              >
                {String(a.n).padStart(2, "0")} · {a.titulo}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* -------------------------------- pagina -------------------------------- */

export default function MarcoFondoSoberano() {
  const [d, setD] = useState(DATOS_EMBEBIDOS);
  const [vivo, setVivo] = useState(false);
  const [activo, setActivo] = useState(null);
  const [abierto, setAbierto] = useState(null);

  useEffect(() => {
    let cancelado = false;
    fetch(RUTA_DATOS)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then((j) => {
        if (!cancelado && j && j.articulado && j.fallos) {
          setD(j);
          setVivo(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  const resaltado = (art) => {
    if (activo === null) return false;
    if (activo.tipo === "articulo") return activo.id === art.n;
    const f = d.fallos.find((x) => x.id === activo.id);
    return !!f && f.genera_articulos.indexOf(art.n) !== -1;
  };

  return (
    <div
      style={{
        background: C.fondo,
        color: C.texto,
        minHeight: "100vh",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "clamp(22px, 5vw, 76px) clamp(16px, 5vw, 40px) 120px"
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <header style={{ marginBottom: 46 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.19em",
              textTransform: "uppercase",
              color: C.bronce,
              marginBottom: 18
            }}
          >
            Yamacoa · {d.meta.kicker} · {vivo ? "datos en vivo" : "datos embebidos"}
          </div>
          <h1
            style={{
              fontFamily: "'Archivo Black', 'Archivo', sans-serif",
              fontSize: "clamp(34px, 7.4vw, 62px)",
              lineHeight: 1.02,
              letterSpacing: "-0.033em",
              margin: "0 0 20px"
            }}
          >
            {d.meta.titulo}
          </h1>
          <p style={{ fontSize: 17.5, lineHeight: 1.55, color: C.cuerpo, maxWidth: 640, margin: 0 }}>
            {d.meta.subtitulo}
          </p>
        </header>

        <div
          style={{
            border: "1px solid " + C.bronceTenue,
            borderLeft: "3px solid " + C.bronce,
            background: "rgba(131,146,79,0.06)",
            padding: "20px 22px",
            marginBottom: 52
          }}
        >
          <Rotulo color={C.bronce}>Advertencia sobre la naturaleza de este documento</Rotulo>
          <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.68, color: C.cuerpo }}>
            {d.meta.advertencia_naturaleza}
          </p>
        </div>

        <section style={{ marginBottom: 78 }}>
          <Rotulo>Premisa</Rotulo>
          <p
            style={{
              fontFamily: "'Archivo Black', 'Archivo', sans-serif",
              fontSize: "clamp(19px, 3.2vw, 26px)",
              lineHeight: 1.34,
              letterSpacing: "-0.018em",
              margin: "0 0 20px",
              color: C.hueso
            }}
          >
            {d.premisa.enunciado}
          </p>
          <p style={{ fontSize: 15.5, lineHeight: 1.72, color: C.cuerpo }}>{d.premisa.desarrollo}</p>
          <div
            style={{
              borderLeft: "2px solid " + C.ambar,
              paddingLeft: 15,
              marginTop: 22,
              fontSize: 14.5,
              lineHeight: 1.66,
              color: "#D2CDBE"
            }}
          >
            {d.premisa.declaracion_de_sesgo}
          </div>
        </section>

        <Parte numero="I" titulo="Cuatro formas de fracasar">
          <p style={{ fontSize: 15.5, lineHeight: 1.72, color: C.cuerpo, marginBottom: 30 }}>
            La literatura comparada sobre fondos de recursos naturales es abundante en fracasos, y los
            fracasos son más instructivos que los éxitos porque los éxitos suelen deberse a variables
            que no se pueden trasplantar. Lo que sí se puede trasplantar es el conocimiento de por
            dónde se rompen estas instituciones.
          </p>

          {d.fallos.map((f) => {
            const on = activo !== null && activo.tipo === "fallo" && activo.id === f.id;
            const exp = abierto === f.id;
            return (
              <article
                key={f.id}
                onMouseEnter={() => setActivo({ tipo: "fallo", id: f.id })}
                onMouseLeave={() => setActivo(null)}
                style={{
                  border: "1px solid " + (on ? C.ciruela : C.borde),
                  borderLeft: "3px solid " + (on ? C.ciruela : C.ciruelaTenue),
                  background: on ? "rgba(155,101,164,0.06)" : C.panel,
                  padding: "20px 22px",
                  marginBottom: 16,
                  transition: "all 160ms"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                  <div>
                    <Rotulo color={C.ciruela}>
                      {String(f.orden).padStart(2, "0")} · {f.caso} · {f.periodo}
                    </Rotulo>
                    <h3
                      style={{
                        fontFamily: "'Archivo Black', 'Archivo', sans-serif",
                        fontSize: 19,
                        margin: "0 0 8px",
                        letterSpacing: "-0.014em"
                      }}
                    >
                      {f.titulo}
                    </h3>
                  </div>
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10.5,
                      color: C.bronce,
                      whiteSpace: "nowrap",
                      paddingTop: 4
                    }}
                  >
                    → art. {f.genera_articulos.map((n) => String(n).padStart(2, "0")).join(", ")}
                  </div>
                </div>

                <p style={{ fontSize: 15.5, lineHeight: 1.6, color: C.hueso, margin: "0 0 14px" }}>
                  {f.sintesis}
                </p>

                <button
                  onClick={() => setAbierto(exp ? null : f.id)}
                  style={{
                    background: "transparent",
                    border: "1px solid " + C.borde,
                    color: C.tenue,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10.5,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "5px 11px",
                    cursor: "pointer",
                    borderRadius: 2
                  }}
                >
                  {exp ? "ocultar hechos" : "ver los hechos (" + f.hechos.length + ")"}
                </button>

                {exp ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0" }}>
                    {f.hechos.map((h, i) => (
                      <li
                        key={i}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: 12,
                          alignItems: "start",
                          padding: "10px 0",
                          borderTop: "1px solid " + C.borde,
                          fontSize: 14,
                          lineHeight: 1.62,
                          color: C.cuerpo
                        }}
                      >
                        <span>{h.texto}</span>
                        <Chip nivel={h.confianza} />
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 14,
                    borderTop: "1px solid " + C.borde,
                    fontSize: 14.5,
                    lineHeight: 1.64,
                    color: C.ciruelaClara
                  }}
                >
                  <strong style={{ color: C.ciruelaClara }}>La lección.</strong> {f.leccion}
                </div>

                {f.aplicacion_cuba ? (
                  <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.64, color: C.cuerpo }}>
                    <strong style={{ color: C.hueso }}>Aplicado a Cuba.</strong> {f.aplicacion_cuba}
                  </div>
                ) : null}
              </article>
            );
          })}
        </Parte>

        <section style={{ marginBottom: 82 }}>
          <Rotulo color={C.bronce}>La firma del marco</Rotulo>
          <h2
            style={{
              fontFamily: "'Archivo Black', 'Archivo', sans-serif",
              fontSize: "clamp(19px, 3.1vw, 26px)",
              margin: "0 0 10px",
              letterSpacing: "-0.02em"
            }}
          >
            Qué artículo cierra qué fallo
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.68, color: C.cuerpo, marginBottom: 18, maxWidth: 640 }}>
            Ningún artículo nuevo de este marco es una preferencia estética. Cada uno responde a una
            junta por la que se ha roto un fondo real. Pasa el cursor por cualquiera de los dos lados.
          </p>
          <Trazabilidad fallos={d.fallos} articulado={d.articulado} activo={activo} setActivo={setActivo} />
          <p style={{ fontSize: 13.5, lineHeight: 1.64, color: C.tenue, marginTop: 6 }}>
            Los artículos sin enlace proceden del marco original y no derivan de un fallo comparado.
          </p>
        </section>

        <Parte numero="II" titulo="El articulado">
          {d.articulado.map((a) => {
            const on = resaltado(a);
            return (
              <article
                key={a.n}
                onMouseEnter={() => setActivo({ tipo: "articulo", id: a.n })}
                onMouseLeave={() => setActivo(null)}
                style={{
                  padding: "22px 0",
                  borderTop: "1px solid " + C.borde,
                  background: on ? "rgba(131,146,79,0.05)" : "transparent",
                  transition: "background 160ms"
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      color: on ? C.bronceClaro : C.bronceTenue
                    }}
                  >
                    ART. {String(a.n).padStart(2, "0")}
                  </span>
                  <h3
                    style={{
                      fontFamily: "'Archivo Black', 'Archivo', sans-serif",
                      fontSize: 18,
                      margin: 0,
                      letterSpacing: "-0.014em",
                      color: C.texto
                    }}
                  >
                    {a.titulo}
                  </h3>
                  {a.es_nuevo ? (
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9.5,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: C.bronce,
                        border: "1px solid " + C.bronce + "55",
                        padding: "1px 6px",
                        borderRadius: 2
                      }}
                    >
                      nuevo
                    </span>
                  ) : null}
                  {a.revisado ? (
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9.5,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: C.tenue,
                        border: "1px solid " + C.borde,
                        padding: "1px 6px",
                        borderRadius: 2
                      }}
                    >
                      revisado
                    </span>
                  ) : null}
                  {a.responde_a && a.responde_a.length ? (
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        color: C.ciruela
                      }}
                    >
                      cierra: {a.responde_a.join(", ")}
                    </span>
                  ) : null}
                </div>

                <p style={{ fontSize: 15.5, lineHeight: 1.72, color: C.cuerpo, margin: "0 0 12px" }}>
                  {a.cuerpo}
                </p>

                {a.clausulas ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px" }}>
                    {a.clausulas.map((c, i) => (
                      <li
                        key={i}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "18px 1fr",
                          gap: 8,
                          marginBottom: 8,
                          fontSize: 14.5,
                          lineHeight: 1.64,
                          color: C.cuerpo
                        }}
                      >
                        <span style={{ color: C.bronceTenue, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, paddingTop: 3 }}>
                          §{i + 1}
                        </span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {a.fundamento ? (
                  <div
                    style={{
                      borderLeft: "2px solid " + C.bronceTenue,
                      paddingLeft: 14,
                      fontSize: 14,
                      lineHeight: 1.66,
                      color: C.tenue,
                      marginBottom: 10
                    }}
                  >
                    <strong style={{ color: C.cuerpo }}>Fundamento.</strong> {a.fundamento}
                  </div>
                ) : null}

                {a.nota ? (
                  <div style={{ fontSize: 13.5, lineHeight: 1.64, color: C.tenue, fontStyle: "italic" }}>
                    {a.nota}
                  </div>
                ) : null}

                {a.cuestiones_abiertas
                  ? a.cuestiones_abiertas.map((q, i) => (
                      <div
                        key={i}
                        style={{
                          border: "1px dashed " + C.ambar,
                          background: "rgba(201,138,23,0.06)",
                          padding: "11px 14px",
                          marginTop: 11,
                          display: "flex",
                          gap: 10
                        }}
                      >
                        <span style={{ color: C.ambar, fontSize: 14 }}>⚠</span>
                        <div style={{ fontSize: 13.5, lineHeight: 1.62, color: "#D2CDBE" }}>
                          <strong style={{ color: C.ambar }}>{q.titulo}.</strong> {q.texto}
                        </div>
                      </div>
                    ))
                  : null}
              </article>
            );
          })}
        </Parte>

        <Parte numero="III" titulo={d.decision_pendiente.titulo}>
          <p style={{ fontSize: 15.5, lineHeight: 1.72, color: C.cuerpo, marginBottom: 24 }}>
            {d.decision_pendiente.planteamiento}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(268px, 1fr))",
              gap: 16,
              marginBottom: 24
            }}
          >
            {[d.decision_pendiente.a_favor, d.decision_pendiente.en_contra].map((lado, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid " + C.borde,
                  borderTop: "3px solid " + (i === 0 ? C.bronce : C.ciruela),
                  background: C.panel,
                  padding: "20px 20px"
                }}
              >
                <Rotulo color={i === 0 ? C.bronce : C.ciruela}>{lado.etiqueta}</Rotulo>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.68, color: C.cuerpo }}>
                  {lado.argumento}
                </p>
              </div>
            ))}
          </div>
          <div
            style={{
              border: "1px dashed " + C.ambar,
              background: "rgba(201,138,23,0.06)",
              padding: "15px 17px",
              display: "flex",
              gap: 11
            }}
          >
            <span style={{ color: C.ambar, fontSize: 15 }}>⚠</span>
            <div style={{ fontSize: 14.5, lineHeight: 1.66, color: "#D2CDBE" }}>
              {d.decision_pendiente.resolucion_procedimental}
            </div>
          </div>
        </Parte>

        <Parte numero="IV" titulo={d.anexo_admisibilidad.titulo}>
          <p style={{ fontSize: 15.5, lineHeight: 1.72, color: C.hueso, marginBottom: 24 }}>
            {d.anexo_admisibilidad.preambulo}
          </p>
          {d.anexo_admisibilidad.criterios.map((c) => (
            <div
              key={c.letra}
              style={{
                display: "grid",
                gridTemplateColumns: "38px 1fr",
                gap: 14,
                padding: "18px 0",
                borderTop: "1px solid " + C.borde
              }}
            >
              <div
                style={{
                  fontFamily: "'Archivo Black', 'Archivo', sans-serif",
                  fontSize: 22,
                  color: C.bronce,
                  lineHeight: 1
                }}
              >
                {c.letra}
              </div>
              <div>
                <h3 style={{ fontFamily: "'Archivo', sans-serif", fontSize: 16, margin: "0 0 7px", fontWeight: 700 }}>
                  {c.titulo}
                </h3>
                <p style={{ margin: "0 0 9px", fontSize: 14.5, lineHeight: 1.66, color: C.cuerpo }}>
                  {c.texto}
                </p>
                {c.prohibicion ? (
                  <p style={{ margin: "0 0 9px", fontSize: 14.5, lineHeight: 1.66, color: C.ciruelaClara }}>
                    {c.prohibicion}
                  </p>
                ) : null}
                {c.enlace_tema ? (
                  <a
                    href={"/" + c.enlace_tema}
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      color: C.bronce,
                      textDecoration: "none",
                      borderBottom: "1px solid " + C.bronceTenue
                    }}
                  >
                    ver el tratamiento cuantitativo →
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </Parte>

        <Parte numero="V" titulo={d.limites.titulo}>
          <p style={{ fontSize: 15.5, lineHeight: 1.72, color: C.cuerpo, marginBottom: 24 }}>
            {d.limites.preambulo}
          </p>
          {d.limites.entradas.map((e, i) => (
            <div key={i} style={{ padding: "20px 0", borderTop: "1px solid " + C.borde }}>
              <h3
                style={{
                  fontFamily: "'Archivo Black', 'Archivo', sans-serif",
                  fontSize: 16.5,
                  margin: "0 0 9px",
                  letterSpacing: "-0.012em",
                  color: C.ciruelaClara
                }}
              >
                {e.titulo}
              </h3>
              <p style={{ margin: "0 0 11px", fontSize: 14.5, lineHeight: 1.68, color: C.cuerpo }}>
                {e.texto}
              </p>
              <div
                style={{
                  borderLeft: "2px solid " + C.bronceTenue,
                  paddingLeft: 14,
                  fontSize: 14.5,
                  lineHeight: 1.66,
                  color: C.hueso
                }}
              >
                {e.respuesta_honesta}
              </div>
            </div>
          ))}
        </Parte>

        <section
          style={{
            border: "1px solid " + C.bronceTenue,
            padding: "clamp(24px, 5vw, 38px)",
            marginBottom: 54,
            background: "rgba(131,146,79,0.05)"
          }}
        >
          <Rotulo color={C.bronce}>Principio rector</Rotulo>
          <p
            style={{
              fontFamily: "'Archivo Black', 'Archivo', sans-serif",
              fontSize: "clamp(19px, 3.2vw, 27px)",
              lineHeight: 1.32,
              letterSpacing: "-0.02em",
              margin: "0 0 18px",
              color: C.texto
            }}
          >
            {d.principio_rector.enunciado}
          </p>
          <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: C.cuerpo }}>
            {d.principio_rector.consecuencia}
          </p>
        </section>

        <footer style={{ borderTop: "1px solid " + C.borde, paddingTop: 26, fontSize: 13, lineHeight: 1.68, color: C.tenue }}>
          <Rotulo>Fuentes por caso</Rotulo>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px" }}>
            {d.fuentes.map((f, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <span style={{ color: C.ciruelaClara, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
                  {f.caso}
                </span>{" "}
                — {f.referencia}
              </li>
            ))}
          </ul>
          {d.meta.tema_hermano ? (
            <div style={{ marginBottom: 14 }}>
              <a
                href={d.meta.tema_hermano.ruta}
                style={{ color: C.bronce, textDecoration: "none", borderBottom: "1px solid " + C.bronceTenue }}
              >
                {d.meta.tema_hermano.slug}
              </a>{" "}
              — {d.meta.tema_hermano.relacion}
            </div>
          ) : null}
          <div>
            Este documento es un marco normativo, no un informe de datos. Las cifras que contiene son
            ilustrativas del argumento institucional y no constituyen estimación patrimonial. · Dataset{" "}
            {d.meta.slug} v{d.meta.version} · actualizado {d.meta.actualizado}.
          </div>
        </footer>
      </div>
    </div>
  );
}
