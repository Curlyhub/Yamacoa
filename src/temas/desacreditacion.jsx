import { useEffect, useState } from "react";
import { cargarFuentes } from "../design/tokens";

/* ============================================================================
   YAMACOA · expediente "desacreditacion" — RENDERER CONGELADO
   La maquinaria de desacreditar: campañas de desprestigio y patologización
   pseudo-clínica contra opositores cubanos no alineados, desde el oficialismo
   y desde sectores del propio exilio/diáspora. El caso Otero Alcántara
   (jul-2026) es ilustrativo de FORMA y FUNCIÓN, nunca sujeto de diagnóstico.
   Datos en public/data/desacreditacion.json (validado por
   desacreditacion.schema.json).
   Paleta "Contusión": violeta moretón + verde-bilis sobre fondo oscuro.
   ========================================================================== */

const C = {
  bg: "#efe8df", panel: "#fcf9f4", panel2: "#f5efe7",
  line: "rgba(60,40,20,.15)", paper: "#1f1a16", dim: "#6b5d50",
  violeta: "#8E4A8B", bilis: "#2F7D4A",
  corrob: "#127567", noconf: "#8A6410",
};
const TOK = { violeta: C.violeta, bilis: C.bilis, paper: C.paper };
const DATA_URL = ((typeof process !== "undefined" && process.env && process.env.PUBLIC_URL) || "") + "/data/desacreditacion.json";
const FRENTE_COLOR = { oficialista: C.violeta, diaspora: C.bilis };
const FRENTE_LABEL = { oficialista: "Oficialismo", diaspora: "Diáspora/exilio", ambos: "Ambos frentes" };
const PESO_PX = { alto: 30, medio: 21, bajo: 15 };

const EMBEDDED = {"meta":{"slug":"desacreditacion","titulo":"La maquinaria de desacreditar","subtitulo":"Cómo se fabrica el descrédito de un opositor cubano: etiquetado coordinado, patologización pseudo-clínica y hostigamiento mediático, desde el oficialismo y desde el propio exilio.","descripcion":"Este expediente documenta un patrón, no un diagnóstico: la desacreditación coordinada de opositores cubanos que no se alinean con la ideología dominante de su entorno, ya sea el oficialismo dentro de la isla o sectores del propio exilio y la diáspora. No es un fenómeno nuevo ni exclusivo de un bando: es una táctica con historia documentada y con vocabulario reconocible que se repite contra blancos distintos por la misma razón, restarles agencia y credibilidad para que su testimonio deje de pesar políticamente.\n\nEl expediente organiza la evidencia en tres capas. La primera es un patrón histórico bien establecido: organizaciones como Cubalex han documentado, con nombres y fechas que van de la década de 1960 hasta 2018, el uso de internamientos y evaluaciones psiquiátricas forzosas contra disidentes cubanos, entre veinte y treinta casos solo en los últimos quince años, concentrados sobre todo en integrantes de las Damas de Blanco y UNPACU. La psiquiatrización del discurso no es una ocurrencia moderna de redes sociales: es una herramienta represiva con historial clínico y político propio, ya empleada mucho antes de que existiera un expediente de un preso liberado al que aplicársela.\n\nLa segunda capa es el hostigamiento mediático transnacional documentado por ICLEP, el Instituto Cubano por la Libertad de Expresión y Prensa: en su informe de 2025 registró treinta y tres ataques a la prensa concentrados en apenas diecisiete víctimas, un patrón de hostigamiento repetido y focalizado, no disperso. El caso del medio independiente elTOQUE, que sufrió una campaña transnacional de desprestigio incluyendo un acto de repudio contra su director fuera de Cuba, es el ejemplo mejor documentado de cómo la descalificación mediática cruza fronteras.\n\nLa tercera capa es el caso ilustrativo que dispara este expediente: la campaña de desprestigio estatal contra el artista y activista Luis Manuel Otero Alcántara tras su salida de prisión y su exilio forzoso en julio de 2026. Medios oficialistas lo calificaron de \"mercenario\" en cuestión de horas, en una pieza replicada de forma coordinada por varios portales afines, un calificativo que la propia prensa independiente señaló como especialmente cínico dado que el mismo Estado lo mantuvo en paradero desconocido durante once días antes de conducirlo al exilio. Junto a esa campaña oficialista circuló, de forma independiente, un artefacto distinto: un mensaje que combinaba intimidación directa con un aparato pseudo-científico que atribuía su conducta pública a mecanismos clínicos como la disociación o el síndrome de Estocolmo. Este expediente examina ese artefacto únicamente por su forma y su función, el envoltorio de autoridad clínica al servicio de silenciar un testimonio, sin reproducir ni evaluar ninguna de sus afirmaciones sobre la persona real que las recibió. Ninguna valoración sobre el estado psicológico de Otero Alcántara ha sido investigada, verificada ni incorporada aquí.\n\nCada afirmación de este expediente conserva su fuente y su estado de verificación. Donde la evidencia fue de fuente única o no pudo cotejarse de primera mano, queda marcada visiblemente como no confirmada; ninguna aparece presentada como un hecho asentado si no lo es.","narracion":"Este expediente documenta una táctica, no un diagnóstico: cómo se fabrica el descrédito de un opositor cubano que no se alinea con la ideología dominante de su entorno, sea el oficialismo dentro de la isla o sectores del propio exilio. Cubalex documentó entre veinte y treinta casos, en los últimos quince años, de disidentes sometidos a evaluaciones psiquiátricas forzosas para descalificarlos como mentalmente inestables, una herramienta represiva con historia que llega hasta los años sesenta. El Instituto Cubano por la Libertad de Expresión y Prensa registró en dos mil veinticinco treinta y tres ataques a la prensa concentrados en diecisiete víctimas, y documentó una campaña transnacional contra el medio independiente elTOQUE. El caso que dispara este expediente es la campaña estatal contra el artista Luis Manuel Otero Alcántara tras su exilio forzoso en julio de dos mil veintiséis: medios oficialistas lo llamaron mercenario en horas, en piezas replicadas de forma coordinada, mientras el mismo Estado lo había mantenido desaparecido once días antes de exiliarlo. Junto a esa campaña circuló un mensaje distinto que combinaba intimidación con un aparato pseudo-científico sobre su conducta. Este expediente examina ese mensaje solo por forma y función: el lenguaje clínico al servicio de silenciar un testimonio, sin evaluar afirmación alguna sobre la persona real. Cada dato conserva su fuente y grado de verificación.","version":"1.0.0","fecha_datos":"2026-07-22","advertencia":"El sujeto de este expediente es la táctica de desacreditación documentada, no ninguna persona nombrada. Ninguna afirmación sobre el estado psicológico de Luis Manuel Otero Alcántara ha sido investigada, verificada ni incorporada: aparece solo como ejemplo ilustrativo, por la forma y función de la campaña que sufrió, nunca como sujeto de diagnóstico."},"intro":{"parrafos":["Cuando un preso político sale de la cárcel, lo que diga y cómo lo diga suele ser sometido a un escrutinio que no se aplica igual a nadie más. Este expediente no trata sobre lo que dijo ninguna persona en particular: trata sobre la maquinaria que decide, sistemáticamente, que lo dicho por un disidente no cuenta salvo que encaje con lo que su entorno político esperaba escuchar.","Esa maquinaria tiene dos frentes documentados en Cuba. Uno es el oficialismo: el aparato de medios estatales que etiqueta a los opositores como mercenarios, criminales comunes o agentes extranjeros para vaciar de legitimidad política su encarcelamiento. El otro es interno al propio exilio y la diáspora: sectores que exigen pureza ideológica o un relato de sufrimiento determinado, y descalifican a quien no lo ofrece exactamente en esos términos.","Ambos frentes comparten una táctica más antigua y más documentada que cualquier caso individual: vestir la descalificación política con el lenguaje de la autoridad clínica. Cubalex documentó ese patrón desde los años sesenta hasta la actualidad. Este expediente lo sitúa primero como fenómeno histórico, y solo después examina el episodio que lo trajo de vuelta a examen en julio de 2026, sin convertir a nadie en el sujeto de un diagnóstico que nadie con autoridad para hacerlo ha emitido."]},"tacticas":[{"id":"etiquetado","nombre":"Etiquetado descalificatorio coordinado","definicion":"Calificativos que buscan vaciar de legitimidad política a un opositor (mercenario, criminal común, agente extranjero), replicados de forma simultánea por varios medios o cuentas afines para simular consenso.","frente":"oficialista"},{"id":"patologizacion","nombre":"Patologización pseudo-clínica","definicion":"Atribuir el discurso o la conducta de un disidente a un cuadro clínico (disociación, síndrome de Estocolmo, inestabilidad mental) sin evaluación profesional real, para restarle agencia a su testimonio.","frente":"ambos"},{"id":"hostigamiento_transnacional","nombre":"Hostigamiento mediático transnacional","definicion":"Campañas de desprestigio que siguen a periodistas u opositores fuera de Cuba, incluyendo actos de repudio organizados en el país de acogida.","frente":"oficialista"},{"id":"prueba_pureza","nombre":"Prueba de pureza ideológica","definicion":"Exigir a un disidente recién liberado un relato de sufrimiento o una conducta pública específica como condición para reconocer su autenticidad política.","frente":"diaspora"},{"id":"ataque_credibilidad","nombre":"Ataque a la credibilidad personal","definicion":"Cuestionar la autenticidad o las motivaciones de un opositor a partir de su apariencia, posesiones o conducta pública, en lugar de su historial documentado.","frente":"diaspora"}],"cronologia":[{"fecha":"2026 (fecha exacta no verificada en esta pasada)","frente":"oficialista","hecho":"Cubalex sitúa el origen documentado de la patologización psiquiátrica de disidentes cubanos en la década de 1960, con casos como el de Eugenio de Sosa Chabau (1967).","confianza":"corroborada","fuente":"Infobae, feb-2025, citando Mesa-Lago (1991) y Directorio Democrático Cubano (2008)"},{"fecha":"2018","frente":"oficialista","hecho":"Caso de Daniel Llorente, disidente sometido a internamiento psiquiátrico documentado dentro del mismo patrón represivo histórico.","confianza":"corroborada","fuente":"Infobae, feb-2025"},{"fecha":"2025","frente":"oficialista","hecho":"ICLEP documenta en su informe anual una campaña transnacional de descrédito contra el medio independiente elTOQUE, incluyendo un acto de repudio contra su director en Ciudad de México.","confianza":"corroborada","fuente":"ICLEP, informe 2025 (vía Voces del Sur)"},{"fecha":"2025","frente":"oficialista","hecho":"ICLEP registra 33 ataques a la prensa concentrados en solo 17 víctimas, evidenciando hostigamiento repetido y focalizado, no disperso.","confianza":"corroborada","fuente":"ICLEP, informe 2025"},{"fecha":"18-jul-2026","frente":"oficialista","hecho":"Amnistía Internacional, Human Rights Watch y Freedom House denuncian que la liberación de Otero Alcántara fue condicionada a exilio forzoso, sin garantía de libertad dentro de Cuba.","confianza":"corroborada","fuente":"Amnesty International, HRW, Freedom House (vía Infobae, 18-jul-2026)"},{"fecha":"18-jul-2026","frente":"oficialista","hecho":"El programa estatal \"Razones de Cuba\" publica un video calificando a Otero Alcántara de \"mercenario\" a su llegada a Miami; el contenido se replica de forma coordinada en portales afines en las horas siguientes.","confianza":"corroborada","fuente":"CiberCuba, 19-jul-2026; réplicas en razonesdecuba.cu, El Joven Cubano, El Heraldo Cubano (18-20 jul 2026)"},{"fecha":"19-jul-2026","frente":"oficialista","hecho":"Medios oficialistas describen a Otero Alcántara como \"criminal común, no preso político\", vinculando su financiamiento a una exfuncionaria diplomática estadounidense.","confianza":"no_confirmada","fuente":"Síntesis de cobertura de prensa; sin acceso directo verificado a la pieza primaria en esta pasada","nota":"Consistente con la campaña ya corroborada de \"Razones de Cuba\", pero la atribución específica no pudo cotejarse de primera mano."},{"fecha":"19-20 jul 2026","frente":"diaspora","hecho":"Sectores de la diáspora en Miami cuestionan públicamente la autenticidad anticastrista de Otero Alcántara a partir de su apariencia y ausencia de un relato de sufrimiento carcelario visible.","confianza":"no_confirmada","fuente":"Revista El Estornudo, ensayo de Carlos Manuel Álvarez (fuente única, fuera de la jerarquía preferente del proyecto)"}],"matriz":{"nota":"Marca si cada táctica está documentada, en la evidencia recogida en este expediente, como empleada desde el frente oficialista y/o desde sectores del exilio/diáspora. No implica que ambos frentes actúen coordinados entre sí.","filas":[{"tactica_id":"etiquetado","oficialista":true,"diaspora":false},{"tactica_id":"patologizacion","oficialista":true,"diaspora":false},{"tactica_id":"hostigamiento_transnacional","oficialista":true,"diaspora":false},{"tactica_id":"prueba_pureza","oficialista":false,"diaspora":true},{"tactica_id":"ataque_credibilidad","oficialista":false,"diaspora":true}]},"caso_ilustrativo":{"advertencia":"Otero Alcántara aparece aquí solo como ejemplo ilustrativo de una campaña de desprestigio documentada y del artefacto pseudo-clínico que la acompañó. Ninguna afirmación sobre su estado psicológico real ha sido investigada, verificada ni incorporada a este expediente.","hechos":[{"afirmacion":"Otero Alcántara permaneció en paradero desconocido unos 11 días tras salir de prisión y antes de llegar a Miami, conducido por un oficial del MININT; denunciado como secuestro de Estado.","confianza":"corroborada","fuente":"CiberCuba, 19-jul-2026; 14ymedio, jul-2026"},{"afirmacion":"Su liberación fue condicionada a exilio forzoso, sin garantía de libertad dentro de Cuba, según denuncia conjunta de Amnistía Internacional, Human Rights Watch y Freedom House.","confianza":"corroborada","fuente":"Amnesty International, HRW, Freedom House (18-jul-2026, vía Infobae)"},{"afirmacion":"El programa estatal \"Razones de Cuba\" lo calificó de \"mercenario\" en un video publicado el 18-jul-2026, replicado de forma coordinada por varios portales afines al Estado en las 48 horas siguientes.","confianza":"corroborada","fuente":"CiberCuba, 19-jul-2026; razonesdecuba.cu, El Joven Cubano, El Heraldo Cubano","nota":"CiberCuba, prensa independiente, calificó la campaña de \"especialmente cínica\" dado que el mismo Estado lo había mantenido desaparecido 11 días."},{"afirmacion":"Medios oficialistas lo describieron además como \"criminal común, no preso político ni defensor de derechos humanos\".","confianza":"no_confirmada","fuente":"Síntesis de cobertura de prensa; sin acceso verificado de primera mano a la pieza primaria en esta pasada"},{"afirmacion":"Sectores de la diáspora en Miami cuestionaron su autenticidad anticastrista por su apariencia física y la ausencia de un relato de sufrimiento carcelario visible.","confianza":"no_confirmada","fuente":"Revista El Estornudo, ensayo de Carlos Manuel Álvarez; fuente única, no corroborada de forma independiente"}],"artefacto":{"forma":"Un mensaje circulado tras su salida de prisión combinaba, en el mismo texto, lenguaje de intimidación directa (\"el exilio te destruirá\") con un aparato pseudo-científico que invocaba categorías clínicas reales (disociación, síndrome de Estocolmo, sedación farmacológica) para explicar su conducta pública.","funcion":"El envoltorio de autoridad clínica cumple una función retórica, no diagnóstica: presenta la descalificación política como si fuera un hallazgo médico neutral, y con eso le resta agencia al testimonio directo de quien vivió la experiencia, sin necesidad de refutar ese testimonio con evidencia.","nota":"Este expediente no evalúa, no verifica y no reproduce ninguna de las afirmaciones clínicas concretas de ese mensaje sobre la persona real que lo recibió; se documenta únicamente como espécimen de la táctica de patologización descrita en la sección histórica de este expediente."}},"patron_iclep":{"texto":"El Instituto Cubano por la Libertad de Expresión y Prensa (ICLEP) documenta de forma sostenida el hostigamiento mediático contra periodistas y voces independientes, dentro y fuera de Cuba. Su informe de 2025 muestra un patrón concentrado, no disperso: pocas víctimas repetidamente atacadas.","cifras":{"ataques":33,"victimas":17,"anio":2025,"fuente":"ICLEP, informe 2025"},"caso_eltoque":{"texto":"El medio independiente elTOQUE sufrió una campaña transnacional de desprestigio documentada por ICLEP, que incluyó un acto de repudio organizado contra su director fuera de Cuba, en Ciudad de México.","confianza":"corroborada","fuente":"ICLEP, informe 2025 (vía Voces del Sur)"}},"patron_cubalex":{"texto":"Cubalex documenta en su informe de diciembre de 2024, \"La psiquiatría como herramienta de represión política en Cuba\", el uso sostenido de evaluaciones y tratamientos psiquiátricos forzosos contra disidentes, empleados para descalificarlos públicamente como \"mentalmente inestables\".","rango_casos":"Entre 20 y 30 casos documentados en los últimos 15 años","grupos_afectados":["Damas de Blanco","UNPACU"],"confianza":"corroborada","fuente":"Cubalex, informe dic-2024","casos_historicos":[{"nombre":"Eugenio de Sosa Chabau","anio":"1967","detalle":"Uno de los primeros casos documentados de internamiento psiquiátrico forzoso contra un disidente cubano, dentro de un patrón que se extiende hasta el presente.","confianza":"corroborada","fuente":"Infobae, feb-2025, citando Mesa-Lago (1991)"},{"nombre":"Daniel Llorente","anio":"2018","detalle":"Disidente sometido a internamiento psiquiátrico documentado como parte del mismo patrón represivo histórico.","confianza":"corroborada","fuente":"Infobae, feb-2025"},{"nombre":"Roberto Bahamonte Basot","anio":"sin fecha exacta verificada en esta pasada","detalle":"Caso citado dentro del mismo patrón histórico de internamientos psiquiátricos forzosos contra disidentes cubanos.","confianza":"no_confirmada","fuente":"Infobae, feb-2025; fecha específica no verificada de forma independiente en esta pasada"}]},"diccionario_etiquetas":[{"termino":"MERCENARIO","frente":"oficialista","peso":"alto","confianza":"corroborada","nota":"Usado contra Otero Alcántara por \"Razones de Cuba\" el 18-jul-2026, replicado de forma coordinada en portales afines."},{"termino":"CRIMINAL COMÚN","frente":"oficialista","peso":"medio","confianza":"no_confirmada","nota":"Atribuido a cobertura oficialista sobre Otero Alcántara; sin verificación de primera mano de la pieza original en esta pasada."},{"termino":"MENTALMENTE INESTABLE","frente":"oficialista","peso":"alto","confianza":"corroborada","nota":"Documentado por Cubalex contra Damas de Blanco y UNPACU, entre 20 y 30 casos en 15 años."},{"termino":"AGENTE EXTRANJERO","frente":"oficialista","peso":"medio","confianza":"no_confirmada","nota":"Vocabulario históricamente asociado a la retórica represiva del Estado cubano contra disidentes; sin documento primario específico cotejado en esta pasada."},{"termino":"IMPOSTOR / FALSO DISIDENTE","frente":"diaspora","peso":"medio","confianza":"no_confirmada","nota":"Caracterización recogida de un único ensayo periodístico (El Estornudo) sobre cuestionamientos a la autenticidad de Otero Alcántara en sectores del exilio de Miami."},{"termino":"LA DISIDENCIA ES UN GIMNASIO","frente":"diaspora","peso":"bajo","confianza":"no_confirmada","nota":"Frase citada en el mismo ensayo de fuente única sobre cuestionamientos de autenticidad; no corroborada de forma independiente."}],"verificacion":{"total_evaluadas":10,"corroboradas":7,"no_confirmadas":3,"excluidas":1,"nota":"Una afirmación adicional, que nombraba a un disidente cubano concreto acusado de colaboracionismo dentro de la propia oposición, quedó excluida por completo de este expediente: procedía de una única fuente fuera de la jerarquía de verificación del proyecto y no se consideró prudente su publicación ni siquiera marcada como no confirmada, dado que señala a una persona identificada con una acusación grave."},"encuesta":{"preguntas":[{"id":"frente","texto":"¿De qué frente crees que viene con más frecuencia la desacreditación de opositores cubanos no alineados?","opciones":["Del oficialismo dentro de Cuba","De sectores del propio exilio","De ambos por igual","No sabría decir"]},{"id":"patologizacion","texto":"¿Conocías el uso histórico de la psiquiatría como herramienta represiva contra disidentes cubanos?","opciones":["Sí, lo conocía","No, es la primera vez que lo veo documentado","Lo sospechaba pero no conocía casos concretos"]},{"id":"efecto","texto":"¿Qué tan efectiva crees que es la desacreditación pseudo-clínica para silenciar un testimonio?","opciones":["Muy efectiva: cambia cómo se recibe el testimonio","Algo efectiva, pero se nota la manipulación","Poco efectiva entre audiencias informadas"]}]},"referencias":[{"fuente":"CiberCuba","detalle":"Cobertura de la campaña \"Razones de Cuba\" contra Otero Alcántara y de su desaparición de 11 días","fecha":"19-jul-2026"},{"fuente":"14ymedio","detalle":"Cobertura de la desaparición y conducción de Otero Alcántara por un oficial del MININT","fecha":"jul-2026"},{"fuente":"Amnesty International / Human Rights Watch / Freedom House","detalle":"Denuncia conjunta sobre exilio forzoso condicionando la liberación de Otero Alcántara","fecha":"18-jul-2026"},{"fuente":"ICLEP (Instituto Cubano por la Libertad de Expresión y Prensa)","detalle":"Informe anual 2025: campaña transnacional contra elTOQUE y estadísticas de 33 ataques concentrados en 17 víctimas","fecha":"2025"},{"fuente":"Cubalex","detalle":"Informe \"La psiquiatría como herramienta de represión política en Cuba\"","fecha":"dic-2024"},{"fuente":"Infobae","detalle":"Reportaje histórico sobre internamientos psiquiátricos forzosos de disidentes cubanos, citando a Mesa-Lago (1991) y al Directorio Democrático Cubano (2008)","fecha":"feb-2025"},{"fuente":"Revista El Estornudo","detalle":"Ensayo de Carlos Manuel Álvarez sobre cuestionamientos de autenticidad a Otero Alcántara en sectores del exilio de Miami (fuente única, fuera de jerarquía preferente)","fecha":"jul-2026"}],"conclusion":"La desacreditación de un opositor no es un episodio aislado: es un repertorio con historia, vocabulario reconocible y frentes distintos que, sin coordinarse entre sí, convergen en el mismo objetivo, vaciar de peso político un testimonio incómodo. Cuando el envoltorio es clínico, el efecto buscado no es diagnosticar sino silenciar. Este expediente documenta ese repertorio con la fuente y el estado de verificación de cada afirmación a la vista; ninguna persona nombrada en él es sujeto de un diagnóstico que este expediente no está haciendo."};

function SecHead({ n, t, d }) {
  return (<div className="dc-sec-head"><span className="dc-sec-num">{n}</span><h2>{t}</h2>{d && <p>{d}</p>}</div>);
}

function Chip({ estado, nota }) {
  const ok = estado === "corroborada";
  return (
    <span className={"dc-chip " + (ok ? "dc-chip-ok" : "dc-chip-no")} title={nota || ""}>
      {ok ? "corroborada" : "no confirmada"}
    </span>
  );
}

function FrenteTag({ frente }) {
  return (
    <span className="dc-frente-tag" style={{ color: FRENTE_COLOR[frente] || C.paper, borderColor: FRENTE_COLOR[frente] || C.dim }}>
      {FRENTE_LABEL[frente] || frente}
    </span>
  );
}

function TacticaCard({ t }) {
  return (
    <div className="dc-tactica" style={{ borderLeft: `3px solid ${FRENTE_COLOR[t.frente] || C.dim}` }}>
      <div className="dc-tactica-head">
        <b>{t.nombre}</b>
        <FrenteTag frente={t.frente} />
      </div>
      <p>{t.definicion}</p>
    </div>
  );
}

function Matriz({ tacticas, matriz }) {
  return (
    <div className="dc-matriz">
      <div className="dc-matriz-row dc-matriz-head">
        <span>Táctica</span><span>Oficialismo</span><span>Diáspora/exilio</span>
      </div>
      {matriz.filas.map((f) => {
        const t = tacticas.find((x) => x.id === f.tactica_id);
        if (!t) return null;
        return (
          <div className="dc-matriz-row" key={f.tactica_id}>
            <span className="dc-matriz-nombre">{t.nombre}</span>
            <span className="dc-matriz-dot">{f.oficialista ? <i style={{ background: C.violeta }} /> : "—"}</span>
            <span className="dc-matriz-dot">{f.diaspora ? <i style={{ background: C.bilis }} /> : "—"}</span>
          </div>
        );
      })}
      <p className="dc-matriz-nota">{matriz.nota}</p>
    </div>
  );
}

function Cronologia({ eventos }) {
  return (
    <div className="dc-carriles">
      <div className="dc-carril">
        <h3 style={{ color: C.violeta }}>Frente oficialista</h3>
        {eventos.filter((e) => e.frente === "oficialista").map((e, i) => (
          <div className="dc-evento" key={i} style={{ borderColor: C.violeta }}>
            <div className="dc-evento-fecha">{e.fecha}</div>
            <p>{e.hecho}</p>
            <div className="dc-evento-meta"><Chip estado={e.confianza} nota={e.nota} /><span className="dc-evento-fuente">{e.fuente}</span></div>
          </div>
        ))}
      </div>
      <div className="dc-carril">
        <h3 style={{ color: C.bilis }}>Frente diáspora/exilio</h3>
        {eventos.filter((e) => e.frente === "diaspora").map((e, i) => (
          <div className="dc-evento" key={i} style={{ borderColor: C.bilis }}>
            <div className="dc-evento-fecha">{e.fecha}</div>
            <p>{e.hecho}</p>
            <div className="dc-evento-meta"><Chip estado={e.confianza} nota={e.nota} /><span className="dc-evento-fuente">{e.fuente}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HBar({ label, value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="dc-hbar-row">
      <span className="dc-hbar-label">{label}</span>
      <span className="dc-hbar-track"><span className="dc-hbar-fill" style={{ width: pct + "%", background: color }} /></span>
      <span className="dc-hbar-n">{value}</span>
    </div>
  );
}

function Donut({ corroboradas, no_confirmadas, excluidas }) {
  const total = corroboradas + no_confirmadas + excluidas;
  const a = (corroboradas / total) * 360;
  const b = (no_confirmadas / total) * 360;
  const grad = `conic-gradient(${C.corrob} 0deg ${a}deg, ${C.noconf} ${a}deg ${a + b}deg, ${C.dim} ${a + b}deg 360deg)`;
  return (
    <div className="dc-donut-wrap">
      <div className="dc-donut" style={{ background: grad }}>
        <div className="dc-donut-hole">
          <b>{total}</b><span>evaluadas</span>
        </div>
      </div>
      <ul className="dc-donut-legend">
        <li><i style={{ background: C.corrob }} /> {corroboradas} corroboradas</li>
        <li><i style={{ background: C.noconf }} /> {no_confirmadas} no confirmadas</li>
        <li><i style={{ background: C.dim }} /> {excluidas} excluida por riesgo a persona nombrada</li>
      </ul>
    </div>
  );
}

function Diccionario({ items }) {
  return (
    <div className="dc-muro">
      {items.map((it, i) => (
        <span
          key={i}
          className={"dc-etiqueta " + (it.confianza === "corroborada" ? "dc-etiqueta-ok" : "dc-etiqueta-no")}
          style={{ fontSize: PESO_PX[it.peso] || 18, color: FRENTE_COLOR[it.frente] || C.paper, borderColor: FRENTE_COLOR[it.frente] || C.dim }}
          title={it.nota}
        >
          {it.termino}
        </span>
      ))}
    </div>
  );
}

function Encuesta({ datos }) {
  const CLAVE = "yamacoa_desacreditacion_votos";
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
      sb.rpc("desacreditacion_totales").then(({ data }) => { if (data) setVotos((v) => ({ ...v, ...data })); }).catch(() => {});
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
    if (sb && sb.rpc) sb.rpc("desacreditacion_votar", { p_pregunta: pid, p_opcion: opcion }).catch(() => {});
  };
  return (
    <div className="dc-encuesta">
      {datos.preguntas.map((q) => {
        const conteo = votos[q.id] || {};
        const total = Object.values(conteo).reduce((a, b) => a + b, 0);
        const votado = miVoto[q.id] != null;
        return (
          <div className="dc-pregunta" key={q.id}>
            <p>{q.texto}</p>
            {q.opciones.map((op) => {
              const n = conteo[op] || 0;
              const pct = total ? Math.round((n / total) * 100) : 0;
              const elegida = miVoto[q.id] === op;
              return (
                <button key={op} className="dc-opcion" disabled={votado} onClick={() => votar(q.id, op)}>
                  <span className="dc-opcion-fill" style={{ width: votado ? pct + "%" : 0, background: elegida ? "rgba(142,74,139,.22)" : "rgba(107,93,80,.14)" }} />
                  <span className="dc-opcion-txt"><span>{elegida ? "✓ " : ""}{op}</span>{votado && <span>{pct}%</span>}</span>
                </button>
              );
            })}
            <p className="dc-pregunta-total">{total} voto{total === 1 ? "" : "s"}</p>
          </div>
        );
      })}
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
  const v = data.verificacion;

  return (
    <div className="dc-root">
      <style>{CSS}</style>

      <header className="dc-hero">
        <span className="dc-eyebrow">DESACREDITACIÓN · TÁCTICA DOCUMENTADA</span>
        <h1>{m.titulo}</h1>
        <p className="dc-subtitulo">{m.subtitulo}</p>
        <div className="dc-advertencia">⚠ {m.advertencia}</div>
      </header>

      <main className="dc-main">
        <section>
          <SecHead n="00" t="La táctica, no la persona" />
          {data.intro.parrafos.map((p, i) => <p className="dc-parrafo" key={i}>{p}</p>)}
        </section>

        <section>
          <SecHead n="01" t="Cinco tácticas documentadas" d="Cada una con su frente de origen: oficialismo, diáspora, o ambos." />
          <div className="dc-tacticas-grid">
            {data.tacticas.map((t) => <TacticaCard t={t} key={t.id} />)}
          </div>
        </section>

        <section>
          <SecHead n="02" t="Quién usa cuál táctica" d="Documentado en la evidencia recogida aquí; no implica coordinación entre frentes." />
          <Matriz tacticas={data.tacticas} matriz={data.matriz} />
        </section>

        <section>
          <SecHead n="03" t="Cronología en dos carriles" d="Del patrón histórico al episodio de julio de 2026, frente por frente." />
          <Cronologia eventos={data.cronologia} />
        </section>

        <section>
          <SecHead n="04" t="El caso ilustrativo: Otero Alcántara" />
          <div className="dc-caso-advertencia">⚠ {data.caso_ilustrativo.advertencia}</div>
          <div className="dc-caso-hechos">
            {data.caso_ilustrativo.hechos.map((h, i) => (
              <div className="dc-hecho" key={i}>
                <div className="dc-hecho-top"><Chip estado={h.confianza} nota={h.nota} /><span className="dc-hecho-fuente">{h.fuente}</span></div>
                <p>{h.afirmacion}</p>
                {h.nota && <p className="dc-hecho-nota">{h.nota}</p>}
              </div>
            ))}
          </div>
          <div className="dc-artefacto">
            <h3>El artefacto: forma y función, no diagnóstico</h3>
            <p><b>Forma —</b> {data.caso_ilustrativo.artefacto.forma}</p>
            <p><b>Función —</b> {data.caso_ilustrativo.artefacto.funcion}</p>
            <p className="dc-artefacto-nota">{data.caso_ilustrativo.artefacto.nota}</p>
          </div>
        </section>

        <section>
          <SecHead n="05" t="Patrón histórico: la psiquiatría como arma" d={data.patron_cubalex.texto} />
          <p className="dc-rango"><b>{data.patron_cubalex.rango_casos}</b> · {data.patron_cubalex.grupos_afectados.join(" · ")} <Chip estado={data.patron_cubalex.confianza} /></p>
          <div className="dc-casos-historicos">
            {data.patron_cubalex.casos_historicos.map((c, i) => (
              <div className="dc-caso-hist" key={i}>
                <div className="dc-caso-hist-top"><b>{c.nombre}</b><span>{c.anio}</span><Chip estado={c.confianza} nota={c.fuente} /></div>
                <p>{c.detalle}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SecHead n="06" t="Patrón transnacional: ICLEP" d={data.patron_iclep.texto} />
          <div className="dc-iclep-bars">
            <HBar label="Ataques a la prensa (2025)" value={data.patron_iclep.cifras.ataques} max={40} color={C.violeta} />
            <HBar label="Víctimas concentradas" value={data.patron_iclep.cifras.victimas} max={40} color={C.bilis} />
          </div>
          <div className="dc-eltoque"><Chip estado={data.patron_iclep.caso_eltoque.confianza} /><p>{data.patron_iclep.caso_eltoque.texto}</p></div>
        </section>

        <section>
          <SecHead n="07" t="El diccionario de las etiquetas" d="Tamaño = peso documentado. Color = frente de origen. Pasa el cursor para la fuente." />
          <Diccionario items={data.diccionario_etiquetas} />
        </section>

        <section>
          <SecHead n="08" t="Cómo se verificó este expediente" d={v.nota} />
          <Donut corroboradas={v.corroboradas} no_confirmadas={v.no_confirmadas} excluidas={v.excluidas} />
        </section>

        <section>
          <SecHead n="09" t="Tu lectura" />
          <Encuesta datos={data.encuesta} />
        </section>

        <section>
          <SecHead n="10" t="Referencias" />
          <ul className="dc-referencias">
            {data.referencias.map((r, i) => <li key={i}><b>{r.fuente}</b> — {r.detalle}{r.fecha ? ` (${r.fecha})` : ""}</li>)}
          </ul>
          <p className="dc-conclusion">{data.conclusion}</p>
        </section>
      </main>
    </div>
  );
}

const CSS = `
.dc-root{ background:transparent; color:${C.paper}; font-family:'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif; min-height:100vh; }
.dc-root *{ box-sizing:border-box; }
.dc-hero{ padding:48px 20px 28px; max-width:920px; margin:0 auto; }
.dc-eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.14em; color:${C.violeta}; }
.dc-hero h1{ font-size:clamp(28px,5vw,44px); margin:10px 0 8px; line-height:1.1; font-weight:800; letter-spacing:-.02em; }
.dc-subtitulo{ color:${C.dim}; font-size:16px; max-width:640px; line-height:1.5; }
.dc-advertencia{ margin-top:18px; background:${C.panel}; border:1px solid ${C.violeta}; border-radius:16px; padding:12px 16px; font-size:13.5px; line-height:1.5; color:${C.paper}; }
.dc-main{ max-width:920px; margin:0 auto; padding:0 20px 80px; }
.dc-main section{ margin-top:52px; }
.dc-sec-head{ margin-bottom:16px; }
.dc-sec-num{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:${C.dim}; letter-spacing:.1em; }
.dc-sec-head h2{ font-size:22px; margin:4px 0 6px; }
.dc-sec-head p{ color:${C.dim}; font-size:13.5px; line-height:1.5; margin:0; }
.dc-parrafo{ font-size:15px; line-height:1.65; color:${C.paper}; margin:0 0 14px; }
.dc-chip{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; text-transform:uppercase; letter-spacing:.07em; padding:2px 7px; border-radius:999px; white-space:nowrap; }
.dc-chip-ok{ color:${C.corrob}; border:1px solid ${C.corrob}; }
.dc-chip-no{ color:${C.noconf}; border:1px dashed ${C.noconf}; }
.dc-frente-tag{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; text-transform:uppercase; letter-spacing:.06em; padding:2px 7px; border-radius:999px; border:1px solid; }
.dc-tacticas-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; }
.dc-tactica{ background:${C.panel}; border-radius:24px; box-shadow:var(--y-shadow); padding:14px 16px; }
.dc-tactica-head{ display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px; }
.dc-tactica p{ font-size:13px; color:${C.dim}; line-height:1.5; margin:0; }
.dc-matriz{ background:${C.panel}; border-radius:24px; box-shadow:var(--y-shadow); padding:10px 16px; }
.dc-matriz-row{ display:grid; grid-template-columns:1fr 110px 130px; align-items:center; padding:9px 0; border-bottom:1px solid ${C.line}; gap:8px; }
.dc-matriz-row:last-of-type{ border-bottom:none; }
.dc-matriz-head{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:${C.dim}; text-transform:uppercase; letter-spacing:.06em; }
.dc-matriz-nombre{ font-size:13.5px; }
.dc-matriz-dot{ text-align:center; color:${C.dim}; }
.dc-matriz-dot i{ display:inline-block; width:11px; height:11px; border-radius:50%; }
.dc-matriz-nota{ font-size:12px; color:${C.dim}; padding:10px 0 2px; margin:0; }
.dc-carriles{ display:grid; grid-template-columns:1fr 1fr; gap:20px; }
@media (max-width:720px){ .dc-carriles{ grid-template-columns:1fr; } }
.dc-carril h3{ font-size:14px; text-transform:uppercase; letter-spacing:.06em; font-family:'IBM Plex Mono',monospace; margin:0 0 12px; }
.dc-evento{ border-left:2px solid; padding:2px 0 14px 14px; margin-bottom:6px; }
.dc-evento-fecha{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:${C.dim}; margin-bottom:3px; }
.dc-evento p{ font-size:13.5px; line-height:1.5; margin:0 0 6px; }
.dc-evento-meta{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.dc-evento-fuente{ font-size:11px; color:${C.dim}; }
.dc-caso-advertencia{ background:${C.panel}; border:1px solid ${C.violeta}; border-radius:16px; padding:12px 16px; font-size:13px; line-height:1.5; margin-bottom:18px; }
.dc-caso-hechos{ display:flex; flex-direction:column; gap:10px; margin-bottom:20px; }
.dc-hecho{ background:${C.panel}; border-radius:20px; box-shadow:var(--y-shadow); padding:12px 16px; }
.dc-hecho-top{ display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap; }
.dc-hecho-fuente{ font-size:11px; color:${C.dim}; }
.dc-hecho p{ font-size:13.5px; line-height:1.5; margin:0; }
.dc-hecho-nota{ color:${C.dim}; font-size:12px; margin-top:6px !important; }
.dc-artefacto{ background:${C.panel2}; border:1px solid ${C.line}; border-radius:20px; padding:16px 18px; }
.dc-artefacto h3{ font-size:14px; margin:0 0 10px; color:${C.dim}; text-transform:uppercase; letter-spacing:.05em; font-family:'IBM Plex Mono',monospace; }
.dc-artefacto p{ font-size:13.5px; line-height:1.6; margin:0 0 10px; }
.dc-artefacto-nota{ color:${C.dim}; font-size:12px; margin:0 !important; }
.dc-rango{ font-size:14px; margin:0 0 14px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.dc-casos-historicos{ display:flex; flex-direction:column; gap:10px; }
.dc-caso-hist{ background:${C.panel}; border-radius:20px; box-shadow:var(--y-shadow); padding:12px 16px; }
.dc-caso-hist-top{ display:flex; align-items:center; gap:10px; margin-bottom:6px; }
.dc-caso-hist-top span{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:${C.dim}; }
.dc-caso-hist p{ font-size:13px; color:${C.dim}; line-height:1.5; margin:0; }
.dc-iclep-bars{ display:flex; flex-direction:column; gap:10px; margin-bottom:16px; }
.dc-hbar-row{ display:grid; grid-template-columns:170px 1fr 34px; gap:10px; align-items:center; }
.dc-hbar-label{ font-size:12.5px; color:${C.dim}; }
.dc-hbar-track{ height:14px; border-radius:7px; background:${C.panel}; overflow:hidden; }
.dc-hbar-fill{ display:block; height:100%; border-radius:7px; transition:width .4s; }
.dc-hbar-n{ font-family:'IBM Plex Mono',monospace; font-size:13px; text-align:right; }
.dc-eltoque{ background:${C.panel}; border-radius:20px; box-shadow:var(--y-shadow); padding:12px 16px; display:flex; gap:10px; align-items:flex-start; }
.dc-eltoque p{ font-size:13.5px; line-height:1.5; margin:0; }
.dc-muro{ display:flex; flex-wrap:wrap; gap:8px 14px; background:${C.panel}; border-radius:24px; box-shadow:var(--y-shadow); padding:22px; align-items:baseline; }
.dc-etiqueta{ font-family:'IBM Plex Mono',monospace; font-weight:600; letter-spacing:.02em; border-bottom:2px solid; padding-bottom:2px; cursor:default; }
.dc-etiqueta-no{ opacity:.72; border-bottom-style:dashed; }
.dc-donut-wrap{ display:flex; align-items:center; gap:24px; flex-wrap:wrap; }
.dc-donut{ width:120px; height:120px; border-radius:50%; position:relative; flex-shrink:0; }
.dc-donut-hole{ position:absolute; inset:14px; border-radius:50%; background:${C.bg}; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.dc-donut-hole b{ font-size:22px; font-family:'IBM Plex Mono',monospace; }
.dc-donut-hole span{ font-size:9px; color:${C.dim}; text-transform:uppercase; letter-spacing:.06em; }
.dc-donut-legend{ list-style:none; margin:0; padding:0; font-size:13px; display:flex; flex-direction:column; gap:8px; }
.dc-donut-legend li{ display:flex; align-items:center; gap:8px; }
.dc-donut-legend i{ width:10px; height:10px; border-radius:50%; display:inline-block; flex-shrink:0; }
.dc-encuesta{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; }
.dc-pregunta{ background:${C.panel}; border:0; box-shadow:var(--y-shadow); border-radius:24px; padding:14px 16px; }
.dc-pregunta p{ font-size:14px; line-height:1.5; margin:0 0 12px; }
.dc-opcion{ display:block; width:100%; text-align:left; margin-bottom:8px; position:relative; overflow:hidden; background:${C.panel2}; color:${C.paper}; border-radius:10px; border:1px solid ${C.line}; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:12.5px; }
.dc-opcion:disabled{ cursor:default; }
.dc-opcion-fill{ position:absolute; inset:0; transition:width .4s; }
.dc-opcion-txt{ position:relative; display:flex; justify-content:space-between; padding:8px 10px; }
.dc-pregunta-total{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:${C.dim}; margin:4px 0 0; }
.dc-referencias{ list-style:none; margin:0 0 20px; padding:0; display:flex; flex-direction:column; gap:8px; }
.dc-referencias li{ font-size:13px; color:${C.dim}; line-height:1.5; }
.dc-referencias b{ color:${C.paper}; }
.dc-conclusion{ font-size:15px; line-height:1.65; border-top:1px solid ${C.line}; padding-top:20px; }
`;
