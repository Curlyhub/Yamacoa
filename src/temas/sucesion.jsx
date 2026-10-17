import { useEffect, useState } from "react";
import { cargarFuentes } from "../design/tokens";

/* ============================================================================
   YAMACOA · expediente "sucesion" — RENDERER CONGELADO
   Sucesión sin urnas: continuidad institucional del poder en Cuba, 1959-2026
   (Fidel Castro → Raúl Castro → Miguel Díaz-Canel), con una coda que contrasta
   el marco pseudo-académico de un hilo viral (Locus de Control de Rotter,
   tesis weberiana) con los hechos verificables.
   Datos en public/data/sucesion.json (validado por sucesion.schema.json).
   Paleta "Bronce y Pátina": olivo-bronce + jade sobre fondo oscuro.
   ========================================================================== */

const C = {
  bg: "#fcf9f4", panel: "#fcf9f4", panel2: "#f5efe7",
  line: "rgba(60,40,20,.15)", paper: "#1f1a16", dim: "#6b5d50",
  bronce: "#5E6210", jade: "#1A7F56",
  corrob: "#1E7466", noconf: "#9A6410",
};
const DATA_URL = ((typeof process !== "undefined" && process.env && process.env.PUBLIC_URL) || "") + "/data/sucesion.json";

const EMBEDDED = {"meta":{"slug":"sucesion","titulo":"Sucesión sin urnas","subtitulo":"Tres hombres, un aparato: cómo se ha transferido el poder en Cuba desde 1959 — y por qué un hilo viral que lo explica con teología y psicología usa la herramienta equivocada.","descripcion":"Este expediente documenta un hecho institucional, no una tesis psicológica: cómo se ha transferido el poder en Cuba en tres ocasiones desde 1959, y qué se mantuvo intacto cada vez que cambió el nombre en la cúpula. Nace de un hilo viral que intentaba explicar el \"caudillismo\" latinoamericano —agrupando a Fidel Castro junto a Perón, Chávez, Maduro, Rosas y Santa Anna bajo una sola categoría psicológica— mediante el \"Locus de Control\" de Julian Rotter y la tesis de Max Weber sobre protestantismo y capitalismo. Ninguna de esas dos herramientas explica lo que de verdad ocurrió en Cuba, y este expediente lo demuestra con los hechos, no con el armazón teórico.\n\nEl Locus de Control es un constructo psicológico validado a nivel individual: mide cómo una persona atribuye la causalidad de su propia vida. Rotter nunca lo propuso como explicación de instituciones o culturas nacionales enteras; esa extensión es de quien escribió el hilo, no del autor original. La tesis de Weber, por su parte, sigue disputada en las propias ciencias sociales un siglo después de publicada: se le critica no considerar las condiciones materiales previas y hay estudios cuantitativos recientes con resultados negativos. Y la literatura académica especializada en caudillismo latinoamericano distingue explícitamente el caudillismo federal del siglo XIX, el populismo clásico de Perón, el neopopulismo de Chávez y Maduro, y la revolución socialista de partido único cubana como fenómenos políticos distintos —no una sola categoría psicológica intercambiable.\n\nLo que sí es verificable, y es el cuerpo de este expediente, son tres transferencias de poder documentadas con fecha y mecanismo. Fidel Castro encabezó el Estado cubano desde 1959 hasta que delegó sus cargos por enfermedad el 31 de julio de 2006, y el Partido Comunista de Cuba hasta su VI Congreso en abril de 2011. Raúl Castro asumió como presidente en funciones ese mismo 31 de julio de 2006 y fue formalizado por la Asamblea Nacional del Poder Popular el 24 de febrero de 2008, sin competencia partidaria; asumió la jefatura del PCC en 2011 y la conservó tres años después de ceder la presidencia del Estado a Miguel Díaz-Canel el 19 de abril de 2018, hasta entregarla en el VII Congreso de abril de 2021. Díaz-Canel es, desde 2018, el primer jefe de Estado cubano sin el apellido Castro desde el triunfo revolucionario.\n\nEn ninguna de las tres transiciones hubo una elección competitiva entre partidos ni una candidatura alternativa: el mecanismo fue siempre la designación indirecta por una Asamblea Nacional de partido único. Y en las tres, dos instituciones permanecieron intactas por debajo del cambio de rostro: el Partido Comunista de Cuba como único partido legal, y el control del aparato militar (las Fuerzas Armadas Revolucionarias y su brazo económico) en manos de la misma cúpula. El dato que mejor desmonta cualquier lectura psicológica individual es estructural: durante tres años, entre 2018 y 2021, Cuba tuvo un jefe de Estado que no encabezaba el partido que de verdad concentra el poder. Eso no lo explica el temperamento de nadie; lo explica el diseño de las instituciones.\n\nEste expediente no evalúa ni respalda el Locus de Control ni la tesis weberiana como explicaciones válidas de Cuba: las presenta como lo que son, un armazón teórico tomado fuera de su alcance, y las contrasta con los hechos verificables. La única afirmación que se sostiene aquí como hecho es la continuidad institucional de 1959 a 2026.","narracion":"Este expediente documenta un hecho institucional, no una teoría psicológica: cómo se ha transferido el poder en Cuba tres veces desde mil novecientos cincuenta y nueve. Nace de un hilo viral que explicaba el caudillismo latinoamericano con el Locus de Control de Julian Rotter y la tesis de Max Weber sobre protestantismo y capitalismo. Ninguna de las dos herramientas explica Cuba. Rotter mide personas individuales, no naciones enteras. La tesis de Weber sigue disputada un siglo después de publicada. Y la literatura académica sobre caudillismo distingue el caudillismo del siglo diecinueve, el populismo clásico, el neopopulismo y la revolución socialista cubana como fenómenos distintos, no una sola categoría psicológica. Lo verificable son tres transferencias con fecha exacta. Fidel Castro encabezó el Estado desde mil novecientos cincuenta y nueve hasta que delegó el poder por enfermedad, el treinta y uno de julio de dos mil seis. Raúl Castro fue formalizado presidente el veinticuatro de febrero de dos mil ocho, sin competencia partidaria, y entregó la presidencia a Miguel Díaz-Canel en dos mil dieciocho, pero conservó la jefatura del partido tres años más. En ninguna transición hubo elección competitiva entre partidos. Lo que permaneció fue el partido único y el control militar. Eso no lo explica ninguna psicología individual: lo explica el diseño de las instituciones.","version":"1.0.0","fecha_datos":"2026-07-22","advertencia":"Este expediente no evalúa ni respalda el Locus de Control de Rotter ni la tesis weberiana como explicación causal de la política cubana: los presenta como el armazón teórico de un hilo viral, tomado fuera de su alcance original, y los contrasta con los hechos institucionales verificables. La única afirmación que este expediente sostiene como hecho es la continuidad institucional del poder en Cuba entre 1959 y 2026."},"intro":{"parrafos":["Un hilo viral reciente proponía que la diferencia entre sociedades \"que confían en las instituciones\" y sociedades \"que esperan un salvador\" es psicológica y teológica: el Locus de Control de Julian Rotter, heredado del protestantismo frente al catolicismo. Como ilustración incluía, en una misma lista, a Rosas, Santa Anna, Perón, Chávez, Maduro, Fidel Castro, Raúl Castro y Miguel Díaz-Canel.","Ese marco tiene un problema doble. Rotter nunca diseñó su constructo para explicar naciones enteras: mide cómo una persona atribuye la causalidad de su propia vida, no cómo funciona un Estado. Y la tesis de Weber que el hilo invoca sigue disputada en las propias ciencias sociales un siglo después de publicada. Ninguna de las dos es la herramienta correcta para explicar lo que de verdad ocurrió en Cuba.","Lo que sí explica Cuba son los hechos institucionales: tres transferencias de poder documentadas, con fecha y mecanismo, en las que cambió el rostro pero no el aparato. Este expediente reconstruye esas tres transiciones y, al final, muestra por qué agrupar a Fidel Castro con Perón o Chávez bajo una sola etiqueta psicológica borra distinciones que la propia literatura académica sobre caudillismo sí sostiene."]},"eras":[{"id":"fidel","lider":"Fidel Castro","periodo_texto":"1959–2006 al frente del Estado (47 años); hasta 2011 al frente del partido","cargo_estado":{"inicio":"1959 (primer ministro); 1976 (presidente del Consejo de Estado)","fin":"31-jul-2006 (delegación por enfermedad)","detalle":"Encabezó el gobierno cubano de forma ininterrumpida desde el triunfo revolucionario de enero de 1959 hasta que delegó sus cargos de forma provisional por motivos de salud el 31 de julio de 2006."},"cargo_pcc":{"inicio":"1965 (fundación del Partido Comunista de Cuba)","fin":"19-abr-2011 (VI Congreso del PCC)","detalle":"Primer secretario del Partido Comunista de Cuba desde su fundación en 1965 hasta que cedió formalmente el cargo a Raúl Castro en el VI Congreso, celebrado en abril de 2011."},"mecanismo":"Ninguna elección competitiva ni pluralismo partidario en ningún momento de su mandato; liderazgo consolidado desde el triunfo revolucionario y el aparato de partido único.","confianza":"corroborada","fuente":"Registro histórico consistente (Britannica, cobertura contemporánea de la Revolución cubana y del VI Congreso del PCC, 2011)"},{"id":"raul","lider":"Raúl Castro","periodo_texto":"2006–2021, combinando jefatura del Estado (hasta 2018) y del partido (hasta 2021): 15 años","cargo_estado":{"inicio":"31-jul-2006 (transición provisional por delegación)","fin":"19-abr-2018 (cede la presidencia a Díaz-Canel)","detalle":"Asumió como presidente en funciones el 31 de julio de 2006 por delegación de Fidel Castro. Fue formalizado como presidente del Consejo de Estado el 24 de febrero de 2008 mediante elección indirecta de la Asamblea Nacional del Poder Popular, sin competencia partidaria ni candidatura alternativa."},"cargo_pcc":{"inicio":"19-abr-2011 (VI Congreso del PCC)","fin":"19-abr-2021 (VII Congreso del PCC)","detalle":"Asumió la jefatura del partido en abril de 2011 y la conservó tres años después de haber cedido la presidencia del Estado a Díaz-Canel en 2018, hasta entregarla formalmente en el VII Congreso de abril de 2021."},"mecanismo":"Designación indirecta por la Asamblea Nacional del Poder Popular, sin elección competitiva entre partidos ni candidaturas alternativas; mismo mecanismo institucional que la transición de 1959.","confianza":"corroborada","fuente":"Cobertura histórica consistente sobre la transferencia de funciones presidenciales 2006–2008 y las actas del VI y VII Congreso del PCC"},{"id":"diaz_canel","lider":"Miguel Díaz-Canel","periodo_texto":"2018–presente al frente del Estado; desde 2021 al frente del partido (en curso)","cargo_estado":{"inicio":"19-abr-2018","fin":"en curso (reelegido en 2023 bajo el mismo mecanismo)","detalle":"Elegido presidente del Consejo de Estado por la Asamblea Nacional del Poder Popular el 19 de abril de 2018: primer jefe de Estado cubano sin el apellido Castro desde 1959. Reelegido en 2023 mediante el mismo mecanismo de designación no competitiva."},"cargo_pcc":{"inicio":"19-abr-2021 (VII Congreso del PCC)","detalle":"Elegido primer secretario del Partido Comunista de Cuba en el VII Congreso de abril de 2021, tres años después de asumir la presidencia del Estado: el mismo patrón de rezago partido-Estado que exhibió la transición anterior."},"mecanismo":"Designación indirecta por la Asamblea Nacional del Poder Popular, sin elección competitiva entre partidos ni candidaturas alternativas.","confianza":"corroborada","fuente":"ABC News, France24 y CNBC (abril de 2018 y abril de 2021), coincidentes en fechas y mecanismo"}],"continuidad":{"texto_editorial":"Lectura editorial propia, construida sobre los hechos corroborados de cada era: lo que cambió entre 1959 y 2026 fue el nombre en la cúpula. Lo que no cambió fue el aparato que decide quién ocupa ese lugar.","filas":[{"institucion":"Partido Comunista de Cuba como único partido legal","se_mantuvo":true,"detalle":"Reconocido constitucionalmente como el único partido en las tres transiciones; ninguna transferencia de poder pasó por un proceso multipartidista."},{"institucion":"Control militar (FAR) y su aparato económico","se_mantuvo":true,"detalle":"Los tres líderes ocuparon o supervisaron directamente la cúpula de las Fuerzas Armadas Revolucionarias; el control del aparato económico militar se mantuvo sin ruptura visible a través de las tres eras."},{"institucion":"Asamblea Nacional del Poder Popular como mecanismo de designación","se_mantuvo":true,"detalle":"En las tres transiciones de la jefatura del Estado, el cargo se otorgó por elección indirecta de la Asamblea, sin competencia partidaria ni candidatura alternativa."},{"institucion":"Elecciones competitivas multipartidistas","se_mantuvo":false,"detalle":"En ningún momento de las tres transiciones existió una elección competitiva entre partidos o candidaturas alternativas; su ausencia constante es, en sí misma, la continuidad estructural del sistema."},{"institucion":"Apellido Castro al frente del Estado","se_mantuvo":false,"detalle":"Único elemento que cambió en 2018: por primera vez desde 1959 la jefatura del Estado no recayó en un Castro, aunque el control del partido permaneció en manos de Raúl Castro tres años más."}]},"anios_en_poder":[{"lider":"Fidel Castro","anios":47,"detalle":"1959–2006 al frente del Estado; 1965–2011 al frente del PCC."},{"lider":"Raúl Castro","anios":15,"detalle":"2006–2021, combinando la jefatura del Estado (hasta 2018) y del PCC (hasta 2021)."},{"lider":"Miguel Díaz-Canel","anios":8,"detalle":"2018–2026 al frente del Estado y desde 2021 del PCC; mandato en curso."}],"caudillismo_vs_hechos":{"texto":"El hilo original agrupa a estas siete figuras, de casi dos siglos y sistemas políticos radicalmente distintos, bajo una sola categoría psicológica: \"caudillo de locus de control externo\". La literatura académica especializada en caudillismo latinoamericano rechaza esa fusión: distingue el caudillismo federal decimonónico, el populismo clásico, el neopopulismo y la revolución socialista de partido único como fenómenos políticos separados. Al ordenar a las mismas figuras por año e ideología real, la categoría única se disuelve en cuatro fenómenos distintos.","figuras":[{"nombre":"Juan Manuel de Rosas","pais":"Argentina","anio_inicio":1829,"anio_fin":1852,"categoria_academica":"Caudillismo federal del siglo XIX (autoridad personalista post-independencia)","confianza":"corroborada","fuente":"Literatura académica sobre caudillismo latinoamericano (Redalyc/SciELO, Dialnet)"},{"nombre":"Antonio López de Santa Anna","pais":"México","anio_inicio":1833,"anio_fin":1855,"categoria_academica":"Caudillismo federal del siglo XIX","confianza":"corroborada","fuente":"Literatura académica sobre caudillismo latinoamericano (Redalyc/SciELO, Dialnet)"},{"nombre":"Juan Domingo Perón","pais":"Argentina","anio_inicio":1946,"anio_fin":1974,"categoria_academica":"Populismo clásico de mediados del siglo XX","confianza":"corroborada","fuente":"Literatura académica sobre caudillismo y populismo latinoamericano"},{"nombre":"Fidel Castro","pais":"Cuba","anio_inicio":1959,"anio_fin":2011,"categoria_academica":"Revolución socialista de partido único — categoría que la literatura especializada distingue explícitamente del caudillismo tradicional","confianza":"corroborada","fuente":"Redalyc/SciELO, 'El caudillismo en América Latina, ayer y hoy'"},{"nombre":"Hugo Chávez","pais":"Venezuela","anio_inicio":1999,"anio_fin":2013,"categoria_academica":"Neopopulismo de fines del siglo XX / XXI","confianza":"corroborada","fuente":"Literatura académica sobre neopopulismo latinoamericano"},{"nombre":"Nicolás Maduro","pais":"Venezuela","anio_inicio":2013,"anio_fin":null,"categoria_academica":"Continuidad del neopopulismo chavista","confianza":"corroborada","fuente":"Literatura académica sobre neopopulismo latinoamericano"},{"nombre":"Raúl Castro / Miguel Díaz-Canel","pais":"Cuba","anio_inicio":2006,"anio_fin":null,"categoria_academica":"Continuidad institucional del mismo sistema de partido único, no una categoría de caudillismo independiente","confianza":"corroborada","fuente":"Ver sección 'eras' de este expediente"}]},"meta_critica":{"rotter":{"texto":"El Locus de Control es un constructo psicológico desarrollado por Julian Rotter para describir cómo una persona individual atribuye la causalidad de los eventos de su propia vida a factores internos o externos. Es una medida validada a nivel de individuo; la literatura original de Rotter no lo extiende como explicación causal de instituciones o culturas nacionales enteras — esa extensión es una inferencia de terceros, no del autor.","confianza":"corroborada","fuente":"Rotter, J. B. (1966), 'Generalized Expectancies for Internal versus External Control of Reinforcement', Psychological Monographs"},"weber":{"texto":"Max Weber propuso en 'La ética protestante y el espíritu del capitalismo' (1904–1905) un vínculo entre el protestantismo calvinista y el individualismo que habría impulsado el capitalismo moderno. La tesis sigue activamente disputada en las ciencias sociales un siglo después: se le critica no considerar condiciones materiales previas, el desarrollo de capitalismo en regiones católicas siglos antes de Calvino, y estudios cuantitativos recientes con resultados negativos o de causalidad inversa. Tiene defensores serios, pero no es un consenso científico asentado.","confianza":"no_confirmada","fuente":"EH.net, 'The Protestant Ethic Thesis'; IZA Discussion Paper 2886"},"critica_academica":{"texto":"La literatura especializada en caudillismo latinoamericano distingue explícitamente el caudillismo federal del siglo XIX, el populismo clásico de mediados del XX, el neopopulismo de fines de siglo, y la revolución socialista de partido único cubana como fenómenos políticos distintos, no intercambiables bajo una sola etiqueta psicológica. Agruparlos borra diferencias de época, ideología e institucionalidad que sí importan para entender cada caso por separado.","confianza":"corroborada","fuente":"Redalyc/SciELO, 'El caudillismo en América Latina, ayer y hoy'; Dialnet, 'Entre el caudillismo y la democracia representativa en América Latina'"}},"referencias":[{"fuente":"ABC News / France24 / CNBC","detalle":"Cobertura de la designación de Miguel Díaz-Canel como presidente (abril 2018) y como primer secretario del PCC (abril 2021)","fecha":"2018 / 2021"},{"fuente":"Registro histórico de la transferencia de funciones presidenciales 2006–2008","detalle":"Delegación provisional de Fidel Castro (31-jul-2006) y formalización de Raúl Castro como presidente (24-feb-2008) por la Asamblea Nacional del Poder Popular","fecha":"2006 / 2008"},{"fuente":"Actas del VI y VII Congreso del Partido Comunista de Cuba","detalle":"Transferencia de la jefatura del PCC de Fidel a Raúl Castro (2011) y de Raúl Castro a Díaz-Canel (2021)","fecha":"2011 / 2021"},{"fuente":"Rotter, J. B.","detalle":"'Generalized Expectancies for Internal versus External Control of Reinforcement', Psychological Monographs, 1966","fecha":"1966"},{"fuente":"Weber, Max","detalle":"'La ética protestante y el espíritu del capitalismo', 1904–1905; crítica recogida en EH.net y IZA Discussion Paper 2886","fecha":"1904-05"},{"fuente":"Redalyc / SciELO","detalle":"'El caudillismo en América Latina, ayer y hoy' — distinción académica entre caudillismo, populismo, neopopulismo y revolución de partido único","fecha":"s/f"},{"fuente":"Dialnet","detalle":"'Entre el caudillismo y la democracia representativa en América Latina'","fecha":"s/f"}],"conclusion":"Un hilo viral quiso explicar Cuba con teología y psicología individual. Los hechos dicen otra cosa: durante 67 años, el poder en Cuba se ha transferido tres veces sin que en ninguna ocasión mediara una elección competitiva, y en las tres el mismo aparato —Partido Comunista único, control militar, designación indirecta por una Asamblea sin pluralismo— decidió quién ocuparía el lugar vacante. El dato más revelador no es psicológico: es que durante tres años, entre 2018 y 2021, el jefe de Estado cubano no encabezaba el partido que de verdad concentra el poder. Eso no lo explica el carácter de nadie. Lo explica el diseño de las instituciones, y ese diseño es lo único que este expediente sostiene como hecho."};

function SecHead({ n, t, d }) {
  return (<div className="su-sec-head"><span className="su-sec-num">{n}</span><h2>{t}</h2>{d && <p>{d}</p>}</div>);
}

function Chip({ estado }) {
  const ok = estado === "corroborada";
  return <span className={"su-chip " + (ok ? "su-chip-ok" : "su-chip-no")}>{ok ? "corroborada" : "no confirmada"}</span>;
}

/* Firma: eje de bronce ininterrumpido con tres sellos deslizantes.
   La franja PCC/FAR corre detrás, sin cortarse, mientras los sellos cambian. */
function EjeSucesion({ eras }) {
  return (
    <div className="su-eje-wrap">
      <div className="su-eje-franja" />
      <div className="su-eje-linea" />
      {eras.map((e, i) => (
        <div className="su-sello-row" key={e.id}>
          <div className="su-sello" style={{ borderColor: C.bronce }}>{i + 1}</div>
          <div className="su-sello-card">
            <div className="su-sello-head">
              <b>{e.lider}</b>
              <Chip estado={e.confianza} />
            </div>
            <p className="su-sello-periodo">{e.periodo_texto}</p>
            <div className="su-sello-cargos">
              <div>
                <span className="su-sello-cargo-label">Jefatura del Estado</span>
                <p>{e.cargo_estado.inicio}{e.cargo_estado.fin ? ` → ${e.cargo_estado.fin}` : ""}</p>
                <p className="su-sello-detalle">{e.cargo_estado.detalle}</p>
              </div>
              <div>
                <span className="su-sello-cargo-label" style={{ color: C.jade }}>Jefatura del PCC</span>
                <p>{e.cargo_pcc.inicio}{e.cargo_pcc.fin ? ` → ${e.cargo_pcc.fin}` : " → en curso"}</p>
                <p className="su-sello-detalle">{e.cargo_pcc.detalle}</p>
              </div>
            </div>
            <p className="su-sello-mecanismo">{e.mecanismo}</p>
            <p className="su-sello-fuente">{e.fuente}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function BarraAnios({ datos }) {
  const max = Math.max(...datos.map((d) => d.anios));
  return (
    <div className="su-barras">
      {datos.map((d) => (
        <div className="su-barra-row" key={d.lider}>
          <span className="su-barra-label">{d.lider}</span>
          <span className="su-barra-track">
            <span className="su-barra-fill" style={{ width: (d.anios / max) * 100 + "%" }} />
          </span>
          <span className="su-barra-n">{d.anios} años</span>
        </div>
      ))}
    </div>
  );
}

function Continuidad({ filas }) {
  return (
    <div className="su-continuidad-grid">
      {filas.map((f, i) => (
        <div className="su-continuidad-card" key={i} style={{ borderColor: f.se_mantuvo ? C.bronce : C.jade }}>
          <div className="su-continuidad-top">
            <span className={"su-continuidad-badge " + (f.se_mantuvo ? "su-badge-mantuvo" : "su-badge-cambio")}>
              {f.se_mantuvo ? "se mantuvo" : "cambió"}
            </span>
          </div>
          <b>{f.institucion}</b>
          <p>{f.detalle}</p>
        </div>
      ))}
    </div>
  );
}

/* Slope chart: columna izquierda colapsa las 7 figuras en un solo punto
   (el marco del hilo viral); columna derecha las dispersa por año real. */
function catColor(cat) {
  if (cat.includes("XIX")) return C.dim;
  if (cat.includes("Populismo")) return "#B5652A";
  if (cat.includes("Neopopulismo")) return C.jade;
  return C.bronce;
}
function rangoAnios(f) {
  return `${f.anio_inicio}–${f.anio_fin != null ? f.anio_fin : "en curso"}`;
}

function SlopeCaudillismo({ figuras }) {
  const W = 640, ROW = 42, PAD = 26;
  const ordenadas = [...figuras].sort((a, b) => a.anio_inicio - b.anio_inicio);
  const H = PAD * 2 + ROW * (ordenadas.length - 1);
  const leftX = 108, rightX = W - 190;
  const leftY = H / 2;
  const rightY = (i) => PAD + i * ROW;

  const [pinned, setPinned] = useState(null);
  const [hover, setHover] = useState(null);
  const active = pinned != null ? pinned : hover;
  const activa = active != null ? ordenadas[active] : null;

  return (
    <div className="su-slope-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="su-slope-svg" role="img" aria-label="Contraste entre el marco del hilo viral (un solo punto) y los hechos reales por año y categoría">
        {ordenadas.map((f, i) => {
          const isActive = active === i;
          const dim = active != null && !isActive;
          return (
            <line
              key={i}
              x1={leftX} y1={leftY} x2={rightX} y2={rightY(i)}
              stroke={catColor(f.categoria_academica)}
              strokeWidth={isActive ? 2.6 : 1.3}
              opacity={dim ? 0.12 : isActive ? 1 : 0.5}
            />
          );
        })}
        <circle cx={leftX} cy={leftY} r={8} fill={C.paper} />
        <text x={leftX} y={leftY - 24} textAnchor="middle" className="su-slope-label-left">
          <tspan x={leftX} dy="0">«caudillo de</tspan>
          <tspan x={leftX} dy="12">locus externo»</tspan>
        </text>
        {ordenadas.map((f, i) => {
          const isActive = active === i;
          const dim = active != null && !isActive;
          return (
            <g
              key={i}
              className="su-slope-nodo"
              opacity={dim ? 0.35 : 1}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setPinned(pinned === i ? null : i)}
              tabIndex={0}
              role="button"
              aria-pressed={pinned === i}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPinned(pinned === i ? null : i); } }}
            >
              <rect x={rightX - 6} y={rightY(i) - ROW / 2} width={W - rightX + 6} height={ROW} fill="transparent" />
              <circle cx={rightX} cy={rightY(i)} r={isActive ? 7 : 5} fill={catColor(f.categoria_academica)} />
              <text x={rightX + 12} y={rightY(i) - 3} className="su-slope-label-right-nombre">{f.nombre}</text>
              <text x={rightX + 12} y={rightY(i) + 11} className="su-slope-label-right-anios">{f.pais} · {rangoAnios(f)}</text>
            </g>
          );
        })}
      </svg>

      <div className="su-slope-detalle">
        {activa ? (
          <>
            <div className="su-slope-detalle-top">
              <b>{activa.nombre}</b>
              <span style={{ color: catColor(activa.categoria_academica) }}>{rangoAnios(activa)} · {activa.pais}</span>
              <Chip estado={activa.confianza} />
            </div>
            <p>{activa.categoria_academica}</p>
            <p className="su-slope-detalle-fuente">{activa.fuente}</p>
          </>
        ) : (
          <p className="su-slope-detalle-vacio">Pasa el cursor o toca un nombre para ver su período exacto y su categoría académica real.</p>
        )}
      </div>

      <ul className="su-slope-legend">
        <li><i style={{ background: C.dim }} /> Caudillismo federal, s. XIX</li>
        <li><i style={{ background: "#B5652A" }} /> Populismo clásico</li>
        <li><i style={{ background: C.jade }} /> Neopopulismo</li>
        <li><i style={{ background: C.bronce }} /> Revolución/continuidad de partido único</li>
      </ul>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(EMBEDDED);

  useEffect(() => {
    cargarFuentes();
    let live = true;
    fetch(DATA_URL).then((r) => (r.ok ? r.json() : null)).then((j) => { if (live && j) setData(j); }).catch(() => {});
    return () => { live = false; };
  }, []);

  const m = data.meta;
  const mc = data.meta_critica;

  return (
    <div className="su-root">
      <style>{CSS}</style>

      <header className="su-hero">
        <span className="su-eyebrow">SUCESIÓN DE PODER · CUBA 1959-2026</span>
        <h1>{m.titulo}</h1>
        <p className="su-subtitulo">{m.subtitulo}</p>
        <div className="su-advertencia">⚠ {m.advertencia}</div>
      </header>

      <main className="su-main">
        <section>
          <SecHead n="00" t="El marco equivocado" />
          {data.intro.parrafos.map((p, i) => <p className="su-parrafo" key={i}>{p}</p>)}
        </section>

        <section>
          <SecHead n="01" t="Tres transferencias, un aparato" d="El eje no se corta: cambia el sello, no la estructura." />
          <EjeSucesion eras={data.eras} />
        </section>

        <section>
          <SecHead n="02" t="Años al frente" />
          <BarraAnios datos={data.anios_en_poder} />
        </section>

        <section>
          <SecHead n="03" t="Qué se mantuvo y qué cambió" d={data.continuidad.texto_editorial} />
          <Continuidad filas={data.continuidad.filas} />
        </section>

        <section className="su-coda">
          <SecHead n="04 · coda" t="El armazón que no explica Cuba" d={data.caudillismo_vs_hechos.texto} />
          <SlopeCaudillismo figuras={data.caudillismo_vs_hechos.figuras} />

          <div className="su-meta-critica">
            <div className="su-mc-card">
              <div className="su-mc-top"><b>Locus de Control (Rotter)</b><Chip estado={mc.rotter.confianza} /></div>
              <p>{mc.rotter.texto}</p>
              <p className="su-mc-fuente">{mc.rotter.fuente}</p>
            </div>
            <div className="su-mc-card">
              <div className="su-mc-top"><b>Tesis weberiana</b><Chip estado={mc.weber.confianza} /></div>
              <p>{mc.weber.texto}</p>
              <p className="su-mc-fuente">{mc.weber.fuente}</p>
            </div>
            <div className="su-mc-card">
              <div className="su-mc-top"><b>Crítica académica al caudillismo-como-categoría-única</b><Chip estado={mc.critica_academica.confianza} /></div>
              <p>{mc.critica_academica.texto}</p>
              <p className="su-mc-fuente">{mc.critica_academica.fuente}</p>
            </div>
          </div>
        </section>

        <section>
          <SecHead n="05" t="Referencias" />
          <ul className="su-referencias">
            {data.referencias.map((r, i) => <li key={i}><b>{r.fuente}</b> — {r.detalle}{r.fecha ? ` (${r.fecha})` : ""}</li>)}
          </ul>
          <p className="su-conclusion">{data.conclusion}</p>
        </section>
      </main>
    </div>
  );
}

const CSS = `
.su-root{ background:transparent; color:${C.paper}; font-family:'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif; min-height:100vh; }
.su-root *{ box-sizing:border-box; }
.su-hero{ padding:48px 20px 28px; max-width:920px; margin:0 auto; }
.su-eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.14em; color:${C.bronce}; }
.su-hero h1{ font-size:clamp(28px,5vw,44px); margin:10px 0 8px; line-height:1.1; font-weight:800; letter-spacing:-.03em; }
.su-subtitulo{ color:${C.dim}; font-size:16px; max-width:660px; line-height:1.5; }
.su-advertencia{ margin-top:18px; background:${C.panel}; border:1px solid ${C.bronce}; border-radius:16px; padding:12px 16px; box-shadow:var(--y-shadow); font-size:13.5px; line-height:1.5; }
.su-main{ max-width:920px; margin:0 auto; padding:0 20px 80px; }
.su-main section{ margin-top:52px; }
.su-sec-head{ margin-bottom:16px; }
.su-sec-num{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:${C.dim}; letter-spacing:.1em; }
.su-sec-head h2{ font-size:22px; margin:4px 0 6px; }
.su-sec-head p{ color:${C.dim}; font-size:13.5px; line-height:1.5; margin:0; }
.su-parrafo{ font-size:15px; line-height:1.65; margin:0 0 14px; }
.su-chip{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; text-transform:uppercase; letter-spacing:.07em; padding:2px 7px; border-radius:999px; white-space:nowrap; }
.su-chip-ok{ color:${C.corrob}; border:1px solid ${C.corrob}; }
.su-chip-no{ color:${C.noconf}; border:1px dashed ${C.noconf}; }
.su-eje-wrap{ position:relative; padding-left:8px; }
.su-eje-franja{ position:absolute; left:22px; top:0; bottom:0; width:6px; background:linear-gradient(${C.jade},${C.jade}); opacity:.28; border-radius:3px; }
.su-eje-linea{ position:absolute; left:24px; top:0; bottom:0; width:2px; background:${C.bronce}; }
.su-sello-row{ display:flex; gap:18px; margin-bottom:28px; position:relative; }
.su-sello{ flex-shrink:0; width:48px; height:48px; border-radius:50%; border:2px solid; background:${C.bg}; display:flex; align-items:center; justify-content:center; font-family:'IBM Plex Mono',monospace; font-weight:700; z-index:1; color:${C.paper}; }
.su-sello-card{ background:${C.panel}; border-radius:24px; box-shadow:var(--y-shadow); padding:14px 18px; flex:1; }
.su-sello-head{ display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:16px; margin-bottom:4px; }
.su-sello-periodo{ color:${C.dim}; font-size:12.5px; margin:0 0 10px; }
.su-sello-cargos{ display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:10px; }
@media (max-width:600px){ .su-sello-cargos{ grid-template-columns:1fr; } }
.su-sello-cargo-label{ font-family:'IBM Plex Mono',monospace; font-size:10px; text-transform:uppercase; letter-spacing:.06em; color:${C.bronce}; }
.su-sello-cargos p{ font-size:13px; margin:3px 0; }
.su-sello-detalle{ color:${C.dim}; font-size:12px; line-height:1.4; }
.su-sello-mecanismo{ font-size:12.5px; color:${C.paper}; border-top:1px solid ${C.line}; padding-top:8px; margin:0 0 6px; }
.su-sello-fuente{ font-size:11px; color:${C.dim}; margin:0; }
.su-barras{ display:flex; flex-direction:column; gap:12px; }
.su-barra-row{ display:grid; grid-template-columns:160px 1fr 70px; gap:10px; align-items:center; }
.su-barra-label{ font-size:13px; }
.su-barra-track{ height:16px; border-radius:8px; background:${C.panel2}; overflow:hidden; }
.su-barra-fill{ display:block; height:100%; background:${C.bronce}; border-radius:8px; transition:width .4s; }
.su-barra-n{ font-family:'IBM Plex Mono',monospace; font-size:13px; text-align:right; }
.su-continuidad-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; }
.su-continuidad-card{ background:${C.panel}; border-left:3px solid; border-radius:24px; box-shadow:var(--y-shadow); padding:14px 16px; }
.su-continuidad-top{ margin-bottom:6px; }
.su-continuidad-badge{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; text-transform:uppercase; letter-spacing:.06em; padding:2px 7px; border-radius:999px; }
.su-badge-mantuvo{ color:${C.bronce}; border:1px solid ${C.bronce}; }
.su-badge-cambio{ color:${C.jade}; border:1px solid ${C.jade}; }
.su-continuidad-card b{ display:block; font-size:14px; margin-bottom:6px; }
.su-continuidad-card p{ font-size:12.5px; color:${C.dim}; line-height:1.5; margin:0; }
.su-coda{ border-top:1px solid ${C.line}; padding-top:36px; }
.su-slope-wrap{ background:${C.panel}; border-radius:24px; box-shadow:var(--y-shadow); padding:18px; margin-bottom:20px; }
.su-slope-svg{ width:100%; height:auto; }
.su-slope-label-left{ fill:${C.paper}; font-size:10.5px; font-family:'IBM Plex Mono',monospace; font-style:italic; }
.su-slope-nodo{ cursor:pointer; outline:none; transition:opacity .2s; }
.su-slope-nodo:focus-visible circle{ stroke:${C.paper}; stroke-width:2; }
.su-slope-label-right-nombre{ fill:${C.paper}; font-size:11px; font-family:'Manrope',sans-serif; font-weight:600; }
.su-slope-label-right-anios{ fill:${C.dim}; font-size:9.5px; font-family:'IBM Plex Mono',monospace; }
.su-slope-detalle{ margin-top:14px; min-height:64px; background:${C.panel2}; border:1px solid ${C.line}; border-radius:16px; padding:12px 16px; }
.su-slope-detalle-top{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:6px; }
.su-slope-detalle-top b{ font-size:14px; }
.su-slope-detalle-top span{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; }
.su-slope-detalle p{ font-size:12.5px; line-height:1.5; margin:0 0 4px; color:${C.paper}; }
.su-slope-detalle-fuente{ color:${C.dim} !important; font-size:11px !important; margin:0 !important; }
.su-slope-detalle-vacio{ color:${C.dim} !important; font-style:italic; }
.su-slope-legend{ list-style:none; display:flex; flex-wrap:wrap; gap:14px; margin:14px 0 0; padding:0; font-size:11.5px; color:${C.dim}; }
.su-slope-legend li{ display:flex; align-items:center; gap:6px; }
.su-slope-legend i{ width:9px; height:9px; border-radius:50%; display:inline-block; }
.su-meta-critica{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; }
.su-mc-card{ background:${C.panel}; border:1px solid ${C.line}; border-radius:24px; box-shadow:var(--y-shadow); padding:14px 16px; }
.su-mc-top{ display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px; }
.su-mc-top b{ font-size:13.5px; }
.su-mc-card p{ font-size:12.5px; line-height:1.55; color:${C.paper}; margin:0 0 8px; }
.su-mc-fuente{ color:${C.dim} !important; font-size:11px !important; margin:0 !important; }
.su-referencias{ list-style:none; margin:0 0 20px; padding:0; display:flex; flex-direction:column; gap:8px; }
.su-referencias li{ font-size:13px; color:${C.dim}; line-height:1.5; }
.su-referencias b{ color:${C.paper}; }
.su-conclusion{ font-size:15px; line-height:1.65; border-top:1px solid ${C.line}; padding-top:20px; }
`;
