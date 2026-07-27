import { useEffect, useRef, useState } from "react";

/* ============================================================================
   YAMACOA · expediente "sulmira" — RENDERER CONGELADO
   La voz que le prestaron: el caso de Sulmira Martinez Perez ("Salem Cuba"),
   activista de redes sociales condenada a 5 anios de prision por memes y
   llamados pacificos a protestar en Facebook, obligada a una autoinculpacion
   forzada transmitida por television estatal.
   Caso indice y patron comparable (otras condenas por publicaciones en
   Facebook) se muestran SIEMPRE por separado, nunca fusionados en una sola
   cifra.
   Datos en public/data/sulmira.json (validado por sulmira.schema.json).
   Paleta "Senial Cortada": verdin institucional + magenta interferencia,
   sobre fondo oscuro. El magenta solo se usa dentro de este renderer (glitch
   de la firma, acentos puntuales), nunca como accent de portada.
   ========================================================================== */

const C = {
  bg: "#12160F", panel: "#1A2016", panel2: "#222B1C",
  line: "rgba(230,236,224,.10)", paper: "#E9EEE4", dim: "#8C9484",
  primario: "#4E7A44", contrapunto: "#CF4AA9",
  corrob: "#5BAE9A", noconf: "#D9A13B",
};
const DATA_URL = ((typeof process !== "undefined" && process.env && process.env.PUBLIC_URL) || "") + "/data/sulmira.json";

const EMBEDDED = {"meta":{"slug":"sulmira","titulo":"La voz que le prestaron","subtitulo":"Sulmira Martínez Pérez, \"Salem Cuba\", 21-22 años, condenada a 5 años de prisión por memes y llamados pacíficos a protestar en Facebook: la autoinculpación forzada que la televisión estatal transmitió como si fuera su propia voz.","descripcion":"Sulmira Martínez Pérez, conocida en redes como \"Salem Cuba\" o \"Salem Cuba Censura\", tenía entre 21 y 22 años cuando fue detenida en La Habana. Usaba su cuenta de Facebook para publicar memes, mensajes críticos del gobierno cubano, llamados pacíficos a protestar y opiniones disidentes; ninguno de los cargos formales que enfrenta incluye un solo acto de violencia.\n\nLa Seguridad del Estado la detuvo el 10 de enero de 2023. Fue recluida inicialmente en Villa Marista, la sede de la policía política cubana en La Habana, donde, según fuentes corroboradas, fue obligada a una autoinculpación forzada que después se transmitió por la televisión estatal: un guion ajeno, leído bajo coacción, presentado al país como si fuera su propia voz.\n\nSe le acusa de delitos contra el orden constitucional, en la modalidad de propaganda contra el orden, y de desacato. El juicio se pospuso varias veces antes de celebrarse finalmente en noviembre de 2024; la Fiscalía pidió en ese momento una condena de diez años de prisión. En julio de 2025, antes de que se dictara sentencia, fue trasladada desde su centro de reclusión anterior a un campamento penitenciario, donde permanece hoy. La condena llegó después, en febrero de 2026: cinco años de privación de libertad, la mitad de lo que había solicitado la Fiscalía.\n\nNorma Pérez Ferrer, madre de Sulmira, ha denunciado públicamente que el régimen no ha entregado a la familia una copia de la sentencia. Prisoners Defenders documenta en su ficha oficial que Sulmira presenta problemas de salud, entre ellos neumonía. Cuatro organizaciones de derechos humanos (Prisoners Defenders, Cubalex, Alas Tensas e ICLEP) la reconocen como presa política.\n\nDos afirmaciones del envío original no pudieron confirmarse con más de una fuente y quedan marcadas de forma visible como no confirmadas, nunca como hechos asentados: que las condiciones de reclusión en el campamento penitenciario sean \"precarias\" o \"terribles\", y que a Sulmira le correspondería la libertad condicional y esta le haya sido negada de forma arbitraria. Ambas afirmaciones provienen del mismo origen (un testimonio de su madre recogido por un solo medio, CiberCuba) y no han sido corroboradas de forma independiente.\n\nEl caso de Sulmira no es aislado. Cristian Labrada fue condenado a diez años de prisión por una sola publicación en Facebook; Yasser García López, a cinco años por publicaciones similares; dos personas más recibieron condenas de cinco y cuatro años por publicar en la misma red; un joven fue condenado a siete años por criticar al gobierno en redes sociales. Prisoners Defenders contaba, en su informe de abril de 2026, ciento cuarenta y dos mujeres entre mil doscientos sesenta presos políticos en Cuba; su informe de junio de 2026 eleva el total a mil doscientos ochenta y uno, con lo que la organización describe como una nueva ofensiva contra las mujeres, sin que exista todavía un desglose actualizado de cuántas de ellas son mujeres a esa fecha.\n\nEste expediente separa siempre el caso de Sulmira del patrón más amplio de condenas por publicaciones en redes sociales: ninguna cifra de un nivel se usa para completar lo que falta en el otro.","narracion":"Sulmira Martínez Pérez, conocida como Salem Cuba, tenía entre veintiuno y veintidós años cuando la Seguridad del Estado la detuvo en La Habana, el diez de enero de dos mil veintitrés. Usaba Facebook para publicar memes y mensajes críticos del gobierno, y para llamar de forma pacífica a protestar. Ningún cargo en su contra incluye un acto de violencia. Fue recluida en Villa Marista, sede de la policía política, donde la obligaron a una autoinculpación forzada que la televisión estatal transmitió como si fuera su propia voz. Se le acusa de delitos contra el orden constitucional y de desacato. El juicio se pospuso varias veces y se celebró en noviembre de dos mil veinticuatro; la Fiscalía pidió entonces diez años de prisión. En julio de dos mil veinticinco, antes de la sentencia, la trasladaron a un campamento penitenciario, donde sigue hoy. La condena llegó en febrero de dos mil veintiséis: cinco años de privación de libertad. Su madre denuncia que no se ha entregado copia de la sentencia a la familia. Prisoners Defenders documenta que ha tenido neumonía; junto a Cubalex, Alas Tensas e ICLEP, la reconoce como presa política. Otros cinco cubanos fueron condenados a entre cuatro y diez años por publicar en redes sociales. Dos afirmaciones sobre sus condiciones de reclusión, de una sola fuente, quedan marcadas como no confirmadas.","version":"1.0.0","fecha_datos":"2026-07-27","advertencia":"Las condiciones de reclusión en el campamento penitenciario y una posible negativa de libertad condicional se apoyan en un testimonio único de la madre de Sulmira, recogido por un solo medio (CiberCuba); aparecen marcadas visiblemente como no confirmadas, nunca como hechos asentados."},"intro":{"parrafos":["Sulmira Martínez Pérez, conocida en redes como \"Salem Cuba\" o \"Salem Cuba Censura\", tenía entre 21 y 22 años cuando la Seguridad del Estado la detuvo en La Habana el 10 de enero de 2023. Usaba Facebook para publicar memes, mensajes críticos del gobierno y llamados pacíficos a protestar; ninguno de sus cargos incluye violencia.","En Villa Marista fue obligada a una autoinculpación forzada que la televisión estatal transmitió como si fuera su propia voz. El juicio se pospuso varias veces, se celebró en noviembre de 2024 y terminó, en febrero de 2026, en una condena de cinco años de prisión, la mitad de lo que había pedido la Fiscalía.","Su caso se suma a otros: personas condenadas a entre cuatro y diez años de prisión por publicar en Facebook. Este expediente mantiene el caso de Sulmira y ese patrón más amplio en secciones separadas, cada una con su propia fuente y su propio grado de verificación."]},"caso_indice":{"advertencia":"Los hechos centrales de este caso (identidad, fecha de detención, cargos, autoinculpación forzada, aplazamientos, juicio, traslado y condena) están corroborados por la ficha oficial de Prisoners Defenders y por prensa independiente. Las condiciones de reclusión descritas como \"precarias\" y la presunta negativa arbitraria de libertad condicional provienen de una sola fuente y quedan marcadas como no confirmadas.","perfil":{"nombre":"Sulmira Martínez Pérez","alias":"\"Salem Cuba\" / \"Salem Cuba Censura\"","edad_detencion":"21-22 años (las fuentes varían) al momento de la detención","lugar":"La Habana"},"hechos":[{"afirmacion":"Usaba su cuenta de Facebook para publicar memes, mensajes críticos del gobierno cubano, llamados pacíficos a protestar y opiniones disidentes; ninguno de los cargos formales en su contra incluye un acto de violencia.","confianza":"corroborada","fuente":"Prisoners Defenders (ficha oficial), CiberCuba, Diario de Cuba"},{"afirmacion":"Fue detenida el 10 de enero de 2023 por la Seguridad del Estado.","confianza":"corroborada","fuente":"Prisoners Defenders (ficha oficial)"},{"afirmacion":"Se le acusa de delitos contra el orden constitucional, en la modalidad de propaganda contra el orden.","confianza":"corroborada","fuente":"Prisoners Defenders, Diario de Cuba"},{"afirmacion":"Se le acusa también de desacato.","confianza":"corroborada","fuente":"Prisoners Defenders, Diario de Cuba"},{"afirmacion":"Fue recluida inicialmente en Villa Marista, sede de la Seguridad del Estado en La Habana.","confianza":"corroborada","fuente":"CiberCuba, Revista El Estornudo"},{"afirmacion":"Fue obligada a una autoinculpación forzada que se transmitió por la televisión estatal.","confianza":"corroborada","fuente":"CiberCuba, Diario de Cuba, ADN Cuba"},{"afirmacion":"El juicio se pospuso varias veces antes de celebrarse.","confianza":"corroborada","fuente":"CiberCuba, Diario de Cuba"},{"afirmacion":"El juicio se celebró finalmente en noviembre de 2024; la Fiscalía pidió en ese momento una condena de diez años de prisión.","confianza":"corroborada","fuente":"Diario de Cuba, ADN Cuba"},{"afirmacion":"Fue condenada en febrero de 2026 a cinco años de privación de libertad.","confianza":"corroborada","fuente":"Prisoners Defenders (ficha oficial), CiberCuba"},{"afirmacion":"Su madre, Norma Pérez Ferrer, denunció que el régimen no ha entregado copia de la sentencia a la familia.","confianza":"corroborada","fuente":"CiberCuba"},{"afirmacion":"Fue trasladada en julio de 2025, antes de conocerse la condena, desde su centro de reclusión anterior a un campamento penitenciario, donde se encuentra hoy.","confianza":"corroborada","fuente":"Prisoners Defenders (ficha oficial), CiberCuba"},{"afirmacion":"Presenta problemas de salud reportados, entre ellos neumonía, según la ficha oficial de Prisoners Defenders.","confianza":"corroborada","fuente":"Prisoners Defenders (ficha oficial)"},{"afirmacion":"Es reconocida como presa política por Prisoners Defenders, Cubalex, Alas Tensas e ICLEP.","confianza":"corroborada","fuente":"Prisoners Defenders, Cubalex, Alas Tensas, ICLEP"},{"afirmacion":"Las condiciones de reclusión en el campamento penitenciario son \"precarias\" o \"terribles\".","confianza":"no_confirmada","fuente":"CiberCuba (testimonio de la madre, Norma Pérez Ferrer)","nota":"Fuente única: un solo medio recoge el testimonio de la madre. No se localizó corroboración independiente de las condiciones concretas del campamento."},{"afirmacion":"Le correspondería la libertad condicional y esta le ha sido negada de forma arbitraria.","confianza":"no_confirmada","fuente":"CiberCuba (testimonio de la madre, Norma Pérez Ferrer)","nota":"Fuente única: no se localizó el expediente penitenciario ni una segunda fuente que confirme el cómputo del tiempo cumplido o la existencia de una solicitud formal rechazada."}],"linea_tiempo":[{"fecha":"10 de enero de 2023","detalle":"Detenida por la Seguridad del Estado en La Habana.","confianza":"corroborada","fuente":"Prisoners Defenders (ficha oficial)","es_aplazamiento":false},{"fecha":"enero de 2023","detalle":"Recluida inicialmente en Villa Marista, sede de la Seguridad del Estado.","confianza":"corroborada","fuente":"CiberCuba, Revista El Estornudo","es_aplazamiento":false},{"fecha":"2023 (fecha exacta no precisada por las fuentes)","detalle":"Obligada a una autoinculpación forzada, transmitida después por la televisión estatal como si fuera su propia versión de los hechos.","confianza":"corroborada","fuente":"CiberCuba, Diario de Cuba, ADN Cuba","es_aplazamiento":false},{"fecha":"2023-2024","detalle":"El juicio es pospuesto varias veces antes de celebrarse; las fuentes no precisan cuántas fechas concretas se aplazaron.","confianza":"corroborada","fuente":"CiberCuba, Diario de Cuba","es_aplazamiento":true},{"fecha":"noviembre de 2024","detalle":"El juicio se celebra finalmente; la Fiscalía pide una condena de diez años de prisión.","confianza":"corroborada","fuente":"Diario de Cuba, ADN Cuba","es_aplazamiento":false},{"fecha":"julio de 2025","detalle":"Trasladada, antes de conocerse la condena, desde su centro de reclusión anterior a un campamento penitenciario.","confianza":"corroborada","fuente":"Prisoners Defenders (ficha oficial), CiberCuba","es_aplazamiento":false},{"fecha":"febrero de 2026","detalle":"Condenada a cinco años de privación de libertad, la mitad de lo pedido por la Fiscalía.","confianza":"corroborada","fuente":"Prisoners Defenders (ficha oficial), CiberCuba","es_aplazamiento":false},{"fecha":"julio de 2026 (hoy)","detalle":"Permanece en el campamento penitenciario con problemas de salud reportados (neumonía); su madre denuncia que la familia no ha recibido copia de la sentencia.","confianza":"corroborada","fuente":"Prisoners Defenders (ficha oficial), CiberCuba","es_aplazamiento":false},{"fecha":"julio de 2026 (hoy)","detalle":"Su madre describe las condiciones de reclusión como \"precarias\" y afirma que se le niega una libertad condicional que le correspondería.","confianza":"no_confirmada","fuente":"CiberCuba (testimonio único de la madre)","nota":"Sin corroboración independiente; se presenta como testimonio, no como hecho asentado.","es_aplazamiento":false}]},"verificadores":{"organizaciones":[{"nombre":"Prisoners Defenders","rol_reconocimiento":"Mantiene la ficha oficial del caso y la reconoce como presa política.","fuente":"Prisoners Defenders (ficha oficial)"},{"nombre":"Cubalex","rol_reconocimiento":"Reconoce a Sulmira Martínez Pérez como presa política.","fuente":"Cubalex"},{"nombre":"Alas Tensas","rol_reconocimiento":"Reconoce a Sulmira Martínez Pérez como presa política.","fuente":"Alas Tensas"},{"nombre":"ICLEP","rol_reconocimiento":"Reconoce a Sulmira Martínez Pérez como presa política.","fuente":"Instituto Cubano por la Libertad de Expresión y Prensa (ICLEP)"}]},"patron":{"texto":"Condenar publicaciones de Facebook con años de prisión no es un hecho aislado del caso de Sulmira: prensa independiente documenta condenas de entre cuatro y diez años contra otras personas por publicar críticas al gobierno o llamados a protestar en la misma red social, sin relación organizativa entre los casos.","cifras":{"mujeres_presas_politicas":142,"total_presos_politicos":1260,"fecha_pd":"abril de 2026","nota_metodologica":"Cifra de Prisoners Defenders a abril de 2026, la más directamente verificada en el momento de este expediente. El informe de junio de 2026 de la misma organización eleva el total de presos políticos a 1.281, con lo que Infobae describió como una nueva ofensiva contra las mujeres, pero no existe todavía un desglose de mujeres actualizado a esa fecha: se usa abril de 2026 como cifra principal y junio de 2026 solo como nota de contexto."},"casos_comparables":[{"nombre":"Sulmira Martínez Pérez (caso índice)","cargo":"Delitos contra el orden constitucional (propaganda contra el orden) y desacato","condena_anios":5,"fecha":"febrero de 2026","fuente":"Prisoners Defenders (ficha oficial), CiberCuba","confianza":"corroborada"},{"nombre":"Cristian Labrada","cargo":"Una publicación en Facebook","condena_anios":10,"fecha":"julio de 2025","fuente":"Yucabyte","confianza":"corroborada"},{"nombre":"Yasser García López","cargo":"Publicaciones en Facebook","condena_anios":5,"fecha":"mayo de 2026","fuente":"Yucabyte","confianza":"corroborada"},{"nombre":"Primera persona condenada (caso reportado por Infobae)","cargo":"Publicaciones en Facebook","condena_anios":5,"fecha":"enero de 2025","fuente":"Infobae","confianza":"corroborada"},{"nombre":"Segunda persona condenada (caso reportado por Infobae)","cargo":"Publicaciones en Facebook","condena_anios":4,"fecha":"enero de 2025","fuente":"Infobae","confianza":"corroborada"},{"nombre":"Joven condenado por críticas en redes","cargo":"Criticar al gobierno en redes sociales","condena_anios":7,"fecha":"marzo de 2025","fuente":"El Imparcial","confianza":"corroborada"}]},"verificacion":{"total_evaluadas":17,"corroboradas":15,"no_confirmadas":2,"excluidas":0,"nota":"Se evaluaron 15 afirmaciones a nivel del caso índice y 2 a nivel del patrón comparable. Trece de las quince afirmaciones del caso índice están corroboradas por la ficha oficial de Prisoners Defenders y por prensa independiente; dos (condiciones de reclusión y negativa de libertad condicional) dependen de una sola fuente y quedan marcadas como no confirmadas. Las dos afirmaciones de nivel patrón (cifras de mujeres y total de presos políticos, y la actualización de junio de 2026) están corroboradas."},"encuesta":{"preguntas":[{"id":"condena","texto":"¿Te parece proporcional una condena de 5 años de prisión por publicaciones en Facebook sin ningún cargo de violencia?","opciones":["No, es desproporcionada","Depende del contenido exacto de las publicaciones","Sí, si incluye llamados a protestar"]},{"id":"confesion","texto":"¿Sabías que las autoinculpaciones forzadas transmitidas por televisión estatal cubana son una práctica documentada contra activistas?","opciones":["Sí, lo sabía","No, es la primera vez que lo veo documentado","Lo sospechaba pero no conocía casos concretos"]},{"id":"cifras","texto":"Ante la actualización de Prisoners Defenders (1.260 presos políticos en abril de 2026 a 1.281 en junio, sin desglose de mujeres para esa fecha), ¿qué te parece más importante?","opciones":["El total actualizado (1.281), aunque falte el desglose","El desglose disponible (142 mujeres), aunque esté desactualizado","Que se publique pronto un desglose para la cifra nueva"]}]},"referencias":[{"fuente":"Prisoners Defenders","detalle":"Ficha oficial del caso de Sulmira Martínez Pérez, reconocimiento como presa política e informes de abril y junio de 2026 sobre presos políticos en Cuba","fecha":"2026"},{"fuente":"CiberCuba","detalle":"Cobertura de la detención, la autoinculpación forzada, la condena y el testimonio de la madre, Norma Pérez Ferrer","fecha":"2023-2026"},{"fuente":"Diario de Cuba","detalle":"Cobertura de los cargos, los aplazamientos del juicio y la petición fiscal de diez años","fecha":"2024"},{"fuente":"Revista El Estornudo","detalle":"Cobertura del caso y del contexto de reclusión en Villa Marista","fecha":"2023-2024"},{"fuente":"Alas Tensas","detalle":"Reconocimiento de Sulmira Martínez Pérez como presa política","fecha":"2026"},{"fuente":"ICLEP","detalle":"Reconocimiento de Sulmira Martínez Pérez como presa política","fecha":"2026"},{"fuente":"Yucabyte","detalle":"Cobertura de los casos de Cristian Labrada y Yasser García López, condenados por publicaciones en Facebook","fecha":"julio de 2025 y mayo de 2026"},{"fuente":"ADN Cuba","detalle":"Cobertura del juicio y la autoinculpación forzada","fecha":"2024"},{"fuente":"Infobae","detalle":"Cobertura de dos personas condenadas a cinco y cuatro años por publicaciones en Facebook, y de la actualización de junio de 2026 de Prisoners Defenders","fecha":"enero y junio de 2026"},{"fuente":"El Imparcial","detalle":"Cobertura de un joven condenado a siete años por criticar al gobierno en redes sociales","fecha":"marzo de 2025"},{"fuente":"Cubalex","detalle":"Reconocimiento de Sulmira Martínez Pérez como presa política","fecha":"2026"}],"conclusion":"Sulmira Martínez Pérez pasó de publicar memes y críticas en Facebook a leer, bajo coacción, un guion ajeno frente a las cámaras de la televisión estatal; ese guion no le perteneció nunca, y aun así el Estado se lo prestó como si fuera su voz. Tres años después de su detención, cumple una condena de cinco años en un campamento penitenciario al que fue trasladada antes de que existiera sentencia firme, sin que su familia haya recibido todavía una copia del documento que la condena. Su caso comparte cargo y método con al menos otros cinco cubanos condenados por publicar en la misma red social, entre cuatro y diez años de prisión, y con el centenar largo de mujeres que Prisoners Defenders cuenta entre los presos políticos del país. Este expediente documenta lo corroborado con su fuente a la vista, y marca lo que depende de un solo testimonio como lo que es: no confirmado, no descartado."};

function SecHead({ n, t, d }) {
  return (<div className="su-sec-head"><span className="su-sec-num">{n}</span><h2>{t}</h2>{d && <p>{d}</p>}</div>);
}

function Chip({ estado, nota }) {
  const ok = estado === "corroborada";
  return (
    <span className={"su-chip " + (ok ? "su-chip-ok" : "su-chip-no")} title={nota || ""}>
      {ok ? "corroborada" : "no confirmada"}
    </span>
  );
}

function Hecho({ h }) {
  return (
    <div className="su-hecho">
      <div className="su-hecho-top"><Chip estado={h.confianza} nota={h.nota} /><span className="su-hecho-fuente">{h.fuente}</span></div>
      <p>{h.afirmacion}</p>
      {h.nota && <p className="su-hecho-nota">{h.nota}</p>}
    </div>
  );
}

function TimelineSellos({ eventos }) {
  return (
    <div className="su-timeline">
      {eventos.map((e, i) => (
        <div className="su-tl-row" key={i}>
          <div className="su-tl-axis">
            <span className="su-tl-dot" />
            {i < eventos.length - 1 && <span className="su-tl-conn" />}
          </div>
          <div className="su-tl-body">
            <div className="su-tl-fecha">
              {e.fecha}
              {e.es_aplazamiento && <span className="su-sello su-sello-tl">APLAZADO</span>}
            </div>
            <p>{e.detalle}</p>
            <div className="su-tl-meta"><Chip estado={e.confianza} nota={e.nota} /><span className="su-tl-fuente">{e.fuente}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FilaSellosVerificadores({ organizaciones }) {
  const angulos = [-4, 3, -3, 4, -2, 2];
  return (
    <div className="su-sellos-fila">
      {organizaciones.map((o, i) => (
        <div className="su-sello-org" style={{ transform: `rotate(${angulos[i % angulos.length]}deg)` }} key={o.nombre}>
          <b className="su-sello-org-nombre">{o.nombre}</b>
          <span className="su-sello-org-rol">{o.rol_reconocimiento}</span>
        </div>
      ))}
    </div>
  );
}

function WaffleMujeres({ cifras }) {
  const N = 100;
  const mujeres = Math.round((cifras.mujeres_presas_politicas / cifras.total_presos_politicos) * N);
  const celdas = Array.from({ length: N }, (_, i) => i < mujeres);
  return (
    <div className="su-waffle-wrap">
      <div className="su-waffle" role="img" aria-label={`${cifras.mujeres_presas_politicas} mujeres de ${cifras.total_presos_politicos} presos politicos, normalizado a 100 celdas`}>
        {celdas.map((esMujer, i) => <span key={i} className={"su-cell" + (esMujer ? " su-cell-mujer" : "")} />)}
      </div>
      <div className="su-waffle-legend">
        <p><b>{cifras.mujeres_presas_politicas.toLocaleString("es")}</b> mujeres entre <b>{cifras.total_presos_politicos.toLocaleString("es")}</b> presos políticos — Prisoners Defenders, {cifras.fecha_pd}</p>
        <p className="su-waffle-nota">{cifras.nota_metodologica}</p>
      </div>
    </div>
  );
}

function BarraComparables({ casos }) {
  const max = Math.max(...casos.map((c) => c.condena_anios));
  const ordenados = [...casos].sort((a, b) => b.condena_anios - a.condena_anios);
  return (
    <div className="su-barras">
      {ordenados.map((c) => {
        const esIndice = c.nombre.indexOf("caso índice") !== -1;
        return (
          <div className="su-barra-row" key={c.nombre}>
            <span className="su-barra-label">{c.nombre}<i>{c.cargo} · {c.fecha}</i></span>
            <span className="su-barra-track">
              <span className={"su-barra-fill" + (esIndice ? " su-barra-fill-indice" : "")} style={{ width: (c.condena_anios / max) * 100 + "%" }}>
                <b>{c.condena_anios} {c.condena_anios === 1 ? "año" : "años"}</b>
              </span>
            </span>
            <Chip estado={c.confianza} nota={c.fuente} />
          </div>
        );
      })}
    </div>
  );
}

function FirmaGlitch({ guion, voz }) {
  const [revelada, setRevelada] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setRevelada(true); });
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={"su-firma" + (revelada ? " su-en-vista" : "")}
      onMouseEnter={() => setRevelada(true)}
      onFocus={() => setRevelada(true)}
      tabIndex={0}
      role="group"
      aria-label="Bloque de la confesion oficial que revela, al entrar en vista o al pasar el cursor, la voz propia documentada antes de la detencion"
    >
      <span className="su-firma-eyebrow">EL GUION IMPUESTO — AUTOINCULPACIÓN TRANSMITIDA POR TV ESTATAL</span>
      <div className="su-firma-guion" data-text={guion}>{guion}</div>
      <div className="su-firma-scan" aria-hidden="true" />
      <div className="su-firma-voz">
        <span className="su-firma-eyebrow su-firma-eyebrow-voz">LO DOCUMENTADO ANTES DE LA DETENCIÓN</span>
        {voz}
      </div>
    </div>
  );
}

function Encuesta({ datos }) {
  const CLAVE = "yamacoa_sulmira_votos";
  const [votos, setVotos] = useState({});
  const [miVoto, setMiVoto] = useState({});
  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem(CLAVE) || "{}");
      setVotos(local.votos || {});
      setMiVoto(local.miVoto || {});
    } catch (e) {}
    const sb = typeof window !== "undefined" && window.__yamacoaSupabase;
    if (sb && sb.rpc) {
      sb.rpc("sulmira_totales").then(({ data }) => { if (data) setVotos((v) => ({ ...v, ...data })); }).catch(() => {});
    }
  }, []);
  const votar = (pid, opcion) => {
    if (miVoto[pid] != null) return;
    setVotos((prev) => {
      const p = { ...(prev[pid] || {}) };
      p[opcion] = (p[opcion] || 0) + 1;
      const nuevos = { ...prev, [pid]: p };
      const nuevoMi = { ...miVoto, [pid]: opcion };
      try { localStorage.setItem(CLAVE, JSON.stringify({ votos: nuevos, miVoto: nuevoMi })); } catch (e) {}
      return nuevos;
    });
    setMiVoto((m) => ({ ...m, [pid]: opcion }));
    const sb = typeof window !== "undefined" && window.__yamacoaSupabase;
    if (sb && sb.rpc) sb.rpc("sulmira_votar", { p_pregunta: pid, p_opcion: opcion }).catch(() => {});
  };
  return (
    <div className="su-encuesta">
      {datos.preguntas.map((q) => {
        const conteo = votos[q.id] || {};
        const total = Object.values(conteo).reduce((a, b) => a + b, 0);
        const votado = miVoto[q.id] != null;
        return (
          <div className="su-pregunta" key={q.id}>
            <p>{q.texto}</p>
            {q.opciones.map((op) => {
              const n = conteo[op] || 0;
              const pct = total ? Math.round((n / total) * 100) : 0;
              const elegida = miVoto[q.id] === op;
              return (
                <button key={op} className="su-opcion" disabled={votado} onClick={() => votar(q.id, op)}>
                  <span className="su-opcion-fill" style={{ width: votado ? pct + "%" : 0, background: elegida ? "rgba(78,122,68,.30)" : "rgba(140,148,132,.18)" }} />
                  <span className="su-opcion-txt"><span>{elegida ? "✓ " : ""}{op}</span>{votado && <span>{pct}%</span>}</span>
                </button>
              );
            })}
            <p className="su-pregunta-total">{total} voto{total === 1 ? "" : "s"}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(EMBEDDED);

  useEffect(() => {
    const id = "su-fonts";
    if (!document.getElementById(id)) {
      const l = document.createElement("link"); l.id = id; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap";
      document.head.appendChild(l);
    }
    let live = true;
    fetch(DATA_URL).then((r) => (r.ok ? r.json() : null)).then((j) => { if (live && j) setData(j); }).catch(() => {});
    return () => { live = false; };
  }, []);

  const m = data.meta;
  const v = data.verificacion;
  const hechosGuion = data.caso_indice.hechos.find((h) => /autoinculpaci/i.test(h.afirmacion));
  const hechosVoz = data.caso_indice.hechos.find((h) => /Facebook/i.test(h.afirmacion));

  return (
    <div className="su-root">
      <style>{CSS}</style>

      <header className="su-hero">
        <span className="su-eyebrow">TRAS LAS REJAS · CASO Y PATRÓN</span>
        <h1>{m.titulo}</h1>
        <p className="su-subtitulo">{m.subtitulo}</p>
        <div className="su-advertencia">⚠ {m.advertencia}</div>
      </header>

      <main className="su-main">
        <section>
          <SecHead n="00" t="Un caso, un patrón — nunca la misma cifra" />
          {data.intro.parrafos.map((p, i) => <p className="su-parrafo" key={i}>{p}</p>)}
        </section>

        <section>
          <SecHead n="01" t="El caso índice: Sulmira Martínez Pérez" d={data.caso_indice.advertencia} />
          <div className="su-perfil">
            <b>{data.caso_indice.perfil.nombre}</b> <span>{data.caso_indice.perfil.alias}</span>
            <p>{data.caso_indice.perfil.edad_detencion} · {data.caso_indice.perfil.lugar}</p>
          </div>
          <div className="su-hechos-grid">
            {data.caso_indice.hechos.map((h, i) => <Hecho h={h} key={i} />)}
          </div>
        </section>

        <section>
          <SecHead n="02" t="Línea de tiempo: de la detención a hoy" d="Cada sello marca un aplazamiento del juicio; el traslado al campamento ocurrió antes de que existiera condena firme." />
          <TimelineSellos eventos={data.caso_indice.linea_tiempo} />
        </section>

        {hechosGuion && hechosVoz && (
          <section>
            <SecHead n="03" t="El guion impuesto y la voz propia" d="Pasa el cursor o desplaza la página: el bloque de la autoinculpación forzada se distorsiona y debajo aparece, sin distorsión, lo que documentan las fuentes sobre su actividad antes de la detención." />
            <FirmaGlitch guion={hechosGuion.afirmacion} voz={hechosVoz.afirmacion} />
          </section>
        )}

        <section>
          <SecHead n="04" t="Cuatro sellos, un mismo reconocimiento" d="Las cuatro organizaciones que documentan y reconocen el caso." />
          <FilaSellosVerificadores organizaciones={data.verificadores.organizaciones} />
        </section>

        <section>
          <SecHead n="05" t="El patrón: condenas por publicar en Facebook" d={data.patron.texto} />
          <WaffleMujeres cifras={data.patron.cifras} />
        </section>

        <section>
          <SecHead n="06" t="Condenas comparadas, de mayor a menor" d="Sulmira junto a otros cinco casos condenados por publicaciones o críticas en redes sociales." />
          <BarraComparables casos={data.patron.casos_comparables} />
        </section>

        <section>
          <SecHead n="07" t="Cómo se verificó este expediente" d={v.nota} />
          <div className="su-verif-stats">
            <div><b>{v.total_evaluadas}</b><span>afirmaciones evaluadas</span></div>
            <div><b style={{ color: C.corrob }}>{v.corroboradas}</b><span>corroboradas</span></div>
            <div><b style={{ color: C.noconf }}>{v.no_confirmadas}</b><span>no confirmadas</span></div>
            <div><b>{v.excluidas}</b><span>excluidas</span></div>
          </div>
        </section>

        <section>
          <SecHead n="08" t="Tu lectura" />
          <Encuesta datos={data.encuesta} />
        </section>

        <section>
          <SecHead n="09" t="Referencias" />
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
.su-root{ background:${C.bg}; color:${C.paper}; font-family:'Archivo',system-ui,sans-serif; min-height:100vh; }
.su-root *{ box-sizing:border-box; }
.su-hero{ padding:48px 20px 28px; max-width:900px; margin:0 auto; }
.su-eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.14em; color:${C.primario}; }
.su-hero h1{ font-size:clamp(28px,5vw,44px); margin:10px 0 8px; line-height:1.1; }
.su-subtitulo{ color:${C.dim}; font-size:16px; max-width:660px; line-height:1.5; }
.su-advertencia{ margin-top:18px; background:${C.panel}; border:1px solid ${C.primario}; border-radius:8px; padding:12px 16px; font-size:13.5px; line-height:1.5; }
.su-main{ max-width:900px; margin:0 auto; padding:0 20px 80px; }
.su-main section{ margin-top:52px; }
.su-sec-head{ margin-bottom:16px; }
.su-sec-num{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:${C.dim}; letter-spacing:.1em; }
.su-sec-head h2{ font-size:22px; margin:4px 0 6px; }
.su-sec-head p{ color:${C.dim}; font-size:13.5px; line-height:1.5; margin:0; }
.su-parrafo{ font-size:15px; line-height:1.65; margin:0 0 14px; }
.su-chip{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; text-transform:uppercase; letter-spacing:.07em; padding:2px 7px; border-radius:999px; white-space:nowrap; }
.su-chip-ok{ color:${C.corrob}; border:1px solid ${C.corrob}; }
.su-chip-no{ color:${C.noconf}; border:1px dashed ${C.noconf}; }
.su-perfil{ background:${C.panel}; border-radius:8px; padding:14px 18px; margin-bottom:16px; }
.su-perfil span{ color:${C.dim}; }
.su-perfil p{ color:${C.dim}; font-size:13px; margin:4px 0 0; }
.su-hechos-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:12px; }
.su-hecho{ background:${C.panel}; border-radius:8px; padding:12px 16px; }
.su-hecho-top{ display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap; }
.su-hecho-fuente{ font-size:11px; color:${C.dim}; }
.su-hecho p{ font-size:13.5px; line-height:1.5; margin:0; }
.su-hecho-nota{ color:${C.dim}; font-size:12px; margin-top:6px !important; }
.su-timeline{ position:relative; padding-left:6px; }
.su-tl-row{ display:flex; gap:14px; }
.su-tl-axis{ display:flex; flex-direction:column; align-items:center; width:14px; flex-shrink:0; }
.su-tl-dot{ width:11px; height:11px; border-radius:50%; background:${C.primario}; flex-shrink:0; }
.su-tl-conn{ width:2px; flex:1; background:${C.primario}; min-height:36px; opacity:.6; }
.su-tl-body{ padding-bottom:22px; flex:1; }
.su-tl-fecha{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:${C.dim}; margin-bottom:4px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.su-tl-body p{ font-size:13.5px; line-height:1.5; margin:0 0 6px; }
.su-tl-meta{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.su-tl-fuente{ font-size:11px; color:${C.dim}; }
.su-sello{ display:inline-block; font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; padding:2px 8px; border:2px solid ${C.contrapunto}; border-radius:3px; color:${C.contrapunto}; }
.su-sello-tl{ transform:rotate(-5deg); }
.su-sellos-fila{ display:flex; gap:20px; flex-wrap:wrap; }
.su-sello-org{ border:2px solid ${C.primario}; border-radius:4px; padding:12px 16px; display:flex; flex-direction:column; gap:4px; min-width:170px; }
.su-sello-org-nombre{ font-family:'IBM Plex Mono',monospace; font-size:12.5px; letter-spacing:.05em; text-transform:uppercase; color:${C.primario}; }
.su-sello-org-rol{ font-size:11.5px; color:${C.dim}; line-height:1.4; }
.su-waffle-wrap{ display:flex; gap:24px; flex-wrap:wrap; align-items:flex-start; background:${C.panel}; border-radius:10px; padding:18px; }
.su-waffle{ display:grid; grid-template-columns:repeat(10,1fr); gap:3px; width:200px; flex-shrink:0; }
.su-cell{ aspect-ratio:1; border-radius:2px; background:${C.panel2}; }
.su-cell-mujer{ background:${C.contrapunto}; }
.su-waffle-legend{ flex:1; min-width:220px; }
.su-waffle-legend p{ font-size:14px; line-height:1.5; margin:0 0 8px; }
.su-waffle-legend b{ font-family:'IBM Plex Mono',monospace; color:${C.paper}; }
.su-waffle-nota{ font-size:12px !important; color:${C.dim}; }
.su-barras{ display:flex; flex-direction:column; gap:10px; }
.su-barra-row{ display:grid; grid-template-columns:220px 1fr auto; align-items:center; gap:12px; background:${C.panel}; border-radius:8px; padding:10px 14px; }
.su-barra-label{ font-size:13px; display:flex; flex-direction:column; }
.su-barra-label i{ font-style:normal; font-size:11px; color:${C.dim}; }
.su-barra-track{ position:relative; height:24px; background:${C.panel2}; border-radius:6px; overflow:hidden; }
.su-barra-fill{ position:absolute; top:2px; bottom:2px; left:0; background:${C.primario}; border-radius:5px; display:flex; align-items:center; justify-content:flex-end; padding-right:8px; opacity:.75; }
.su-barra-fill-indice{ background:${C.contrapunto}; opacity:1; }
.su-barra-fill b{ font-family:'IBM Plex Mono',monospace; font-size:11px; white-space:nowrap; }
.su-firma{ position:relative; background:${C.panel}; border:1px solid ${C.line}; border-radius:10px; padding:22px 24px; overflow:hidden; cursor:pointer; outline:none; }
.su-firma-eyebrow{ display:block; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.12em; color:${C.dim}; margin-bottom:10px; }
.su-firma-eyebrow-voz{ color:${C.primario}; }
.su-firma-guion{ position:relative; font-family:'IBM Plex Mono',monospace; color:#A6AC9E; font-size:14.5px; line-height:1.65; transition:opacity .5s ease .1s; }
.su-firma.su-en-vista .su-firma-guion{ opacity:.16; }
.su-firma-guion::before, .su-firma-guion::after{ content:attr(data-text); position:absolute; inset:0; opacity:0; }
.su-firma.su-en-vista .su-firma-guion::before{ color:#E8433B; mix-blend-mode:screen; animation:su-glitch-1 .7s steps(6,end) 1; }
.su-firma.su-en-vista .su-firma-guion::after{ color:#2FD8E0; mix-blend-mode:screen; animation:su-glitch-2 .7s steps(6,end) 1; }
@keyframes su-glitch-1{
  0%{ clip-path:inset(8% 0 62% 0); transform:translate(-2px,0); opacity:.7; }
  30%{ clip-path:inset(42% 0 18% 0); transform:translate(3px,0); opacity:.6; }
  65%{ clip-path:inset(4% 0 82% 0); transform:translate(-4px,0); opacity:.5; }
  100%{ clip-path:inset(60% 0 8% 0); transform:translate(0,0); opacity:0; }
}
@keyframes su-glitch-2{
  0%{ clip-path:inset(55% 0 14% 0); transform:translate(2px,0); opacity:.7; }
  30%{ clip-path:inset(12% 0 55% 0); transform:translate(-3px,0); opacity:.6; }
  65%{ clip-path:inset(70% 0 6% 0); transform:translate(4px,0); opacity:.5; }
  100%{ clip-path:inset(10% 0 70% 0); transform:translate(0,0); opacity:0; }
}
.su-firma-scan{ position:absolute; inset:0; pointer-events:none; background:repeating-linear-gradient(0deg, rgba(207,74,169,.10) 0 2px, transparent 2px 4px); opacity:0; }
.su-firma.su-en-vista .su-firma-scan{ opacity:1; animation:su-scan-move .7s linear 1; }
@keyframes su-scan-move{ from{ background-position-y:0; } to{ background-position-y:60px; } }
.su-firma-voz{ position:absolute; inset:22px 24px; font-family:'Archivo',sans-serif; font-size:16px; line-height:1.55; color:${C.paper}; opacity:0; transition:opacity .6s ease .35s; background:${C.panel}; }
.su-firma.su-en-vista .su-firma-voz{ opacity:1; }
.su-verif-stats{ display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:14px; }
.su-verif-stats div{ background:${C.panel}; border-radius:8px; padding:14px 16px; text-align:center; }
.su-verif-stats b{ font-family:'IBM Plex Mono',monospace; font-size:26px; display:block; color:${C.paper}; }
.su-verif-stats span{ font-size:11px; color:${C.dim}; text-transform:uppercase; letter-spacing:.05em; }
.su-encuesta{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; }
.su-pregunta{ background:${C.panel}; border:1px solid ${C.line}; border-radius:10px; padding:14px 16px; }
.su-pregunta p{ font-size:14px; line-height:1.5; margin:0 0 12px; }
.su-opcion{ display:block; width:100%; text-align:left; margin-bottom:8px; position:relative; overflow:hidden; background:${C.panel2}; color:${C.paper}; border-radius:6px; border:1px solid ${C.line}; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:12.5px; }
.su-opcion:disabled{ cursor:default; }
.su-opcion-fill{ position:absolute; inset:0; transition:width .4s; }
.su-opcion-txt{ position:relative; display:flex; justify-content:space-between; padding:8px 10px; }
.su-pregunta-total{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:${C.dim}; margin:4px 0 0; }
.su-referencias{ list-style:none; margin:0 0 20px; padding:0; display:flex; flex-direction:column; gap:8px; }
.su-referencias li{ font-size:13px; color:${C.dim}; line-height:1.5; }
.su-referencias b{ color:${C.paper}; }
.su-conclusion{ font-size:15px; line-height:1.65; border-top:1px solid ${C.line}; padding-top:20px; }
@media (max-width:640px){
  .su-barra-row{ grid-template-columns:1fr; }
  .su-waffle{ width:100%; max-width:240px; }
  .su-firma-voz{ position:static; margin-top:14px; opacity:1; background:transparent; }
  .su-firma.su-en-vista .su-firma-guion{ opacity:.5; }
}
`;
