import { useEffect, useState } from "react";

/* ============================================================================
   YAMACOA · expediente "derechos_sociales" — RENDERER CONGELADO
   Crisis de derechos economicos, sociales y culturales (agua, electricidad,
   salud) y repunte de violencia ciudadana en Cuba, julio de 2026, sobre el
   informe mensual de Cubalex, verificado de forma independiente. Dos hilos
   narrativos SEPARADOS (boletin-mensual-en-dos-hilos): el hilo DESC, mejor
   verificado, y el hilo de violencia ciudadana, donde persiste una
   divergencia real entre monitores (Cubalex 37 homicidios vs Cubanet ~20;
   ver comparativa_homicidios). Nunca se promedian ni se fusionan.
   Datos en public/data/derechos_sociales.json (validado por
   derechos_sociales.schema.json).
   Paleta "Cisterna y Vino Oxidado": verde-cisterna institucional + vino
   oxidado casi negro (marca puntual de violencia, uso interno del
   renderer), sobre fondo oscuro.
   ========================================================================== */

const C = {
  bg: "#0F1210", panel: "#1B211C", panel2: "#232B24",
  line: "rgba(232,236,230,.10)", paper: "#E8ECE6", dim: "#8B948D",
  primario: "#3A5F4D", contrapunto: "#3F222B", contrapuntoClaro: "#8A5A63",
  corrob: "#5FAE8F", parcial: "#C9954B", noconf: "#D9A13B",
};
const DATA_URL = ((typeof process !== "undefined" && process.env && process.env.PUBLIC_URL) || "") + "/data/derechos_sociales.json";

const EMBEDDED = {"meta": {"slug": "derechos_sociales", "titulo": "Julio sin tregua", "subtitulo": "En julio de 2026, zonas periféricas de La Habana cumplieron tres meses sin agua potable, el sistema eléctrico colapsó por completo al menos tres veces y Cubalex contó nueve feminicidios, la cifra más alta de su serie mensual. El propio informe describe julio como el mes de mayor violencia ciudadana desde que comenzó su monitoreo en 2022 — pero, a diferencia de los feminicidios, esa cifra total no ha sido confirmada por una segunda fuente.", "descripcion": "El informe mensual de Cubalex sobre derechos humanos en Cuba correspondiente a julio de 2026 documenta dos crisis que avanzan en paralelo: el colapso sostenido de las condiciones materiales de vida (derechos económicos, sociales y culturales) y un repunte agudo de violencia ciudadana. Este expediente separa ambos hilos y verifica cada uno por su cuenta, sin fusionarlos en una sola narrativa de \"todo empeora igual\".\n\nEn el frente de derechos económicos, sociales y culturales, tres hechos quedaron corroborados por fuentes independientes de Cubalex. Primero, zonas periféricas de La Habana, como Arroyo Naranjo, llevaban más de tres meses sin agua potable regular. Segundo, el Sistema Electroenergético Nacional sufrió al menos tres desconexiones totales durante julio (6, 10 y 14 de julio, según prensa independiente), además de apagones locales prolongados. Tercero, el sistema de salud reportó escasez de insumos para diálisis, condiciones extremas en áreas de neonatología y fallas de higiene en infraestructura sanitaria. A esto se suma el cierre del 73% del parque hotelero cubano, coincidiendo con la salida de las cadenas españolas Meliá, Iberostar y Barceló, y un paquete de 176 medidas económicas que incluyó la eliminación de 92.000 plazas estatales y atrasos salariales de hasta seis meses en algunos territorios.\n\nEn el frente de violencia ciudadana, la verificación produjo un resultado más matizado. Cubalex reportó 9 feminicidios en julio: esa cifra fue corroborada de forma independiente por el Observatorio de Género de Alas Tensas (OGAT), que llegó al mismo número por su cuenta. Pero la cifra de 37 homicidios totales —que el informe describe como la más alta desde que Cubalex inició su monitoreo en 2022— no pudo confirmarse: es una afirmación autorreferencial sobre la propia serie histórica de Cubalex, y otro monitor independiente, Cubanet, contó alrededor de 20 muertes violentas para el mismo mes, con una metodología distinta. Los 4 suicidios que reporta Cubalex, también descritos como el máximo del año, tampoco tienen respaldo de una segunda fuente: Cuba no publica estadística oficial mensual de suicidios.\n\nEste expediente no oculta esa divergencia ni la resuelve por decreto: presenta la cifra de Cubalex marcada como no confirmada, junto a la cifra de contraste de Cubanet, para que quede visible que dos monitores independientes, con metodologías distintas, llegan a números distintos sobre el mismo mes. La denuncia del informe original sobre un presunto desvío de ayuda humanitaria estadounidense distribuida vía Cáritas en la provincia de Granma tampoco pudo confirmarse: el inicio de la distribución del paquete de 100 millones de dólares sí está corroborado, pero no las denuncias de desvío o reventa.\n\nLo que si tiene el mismo diagnóstico en ambas fuentes -Cubalex y prensa independiente por separado- es la fotografía general del mes: una población que entró en agosto de 2026 sin agua regular en algunos barrios, con el sistema eléctrico colapsando por tercera vez consecutiva en cuestión de semanas, con un sistema de salud que no puede garantizar insumos básicos, y con una violencia social que, se mida como se mida, alcanzó uno de sus puntos más altos documentados.", "narracion": "En julio de dos mil veintiséis, zonas periféricas de La Habana cumplieron más de tres meses sin agua potable regular. El sistema eléctrico nacional colapsó por completo al menos tres veces durante el mes, y los hospitales reportaron escasez de insumos para diálisis y condiciones extremas en salas de neonatología. Cerró el setenta y tres por ciento del parque hotelero cubano, coincidiendo con la salida de las cadenas Meliá, Iberostar y Barceló. El Estado eliminó noventa y dos mil plazas de trabajo como parte de un paquete de ciento setenta y seis medidas económicas. En paralelo, Cubalex contó nueve feminicidios en julio, cifra confirmada de forma independiente por el Observatorio de Género Alas Tensas. Pero la cifra de treinta y siete homicidios totales, que el informe describe como la más alta desde dos mil veintidós, no pudo confirmarse con una segunda fuente: otro monitor, Cubanet, contó alrededor de veinte muertes violentas ese mismo mes, con una metodología distinta. Los cuatro suicidios reportados tampoco tienen respaldo independiente. Este expediente separa siempre la crisis de derechos económicos y sociales, mejor verificada, de la violencia ciudadana, donde persiste una divergencia real entre monitores. Ninguna cifra se presenta como cierta si depende de una sola fuente.", "version": "1.0.0", "fecha_datos": "2026-07-31", "advertencia": "La cifra de 37 homicidios y la de 4 suicidios en julio de 2026 son propias del monitoreo de Cubalex y no fueron confirmadas por una segunda fuente: Cubanet, un monitor independiente, contó alrededor de 20 muertes violentas el mismo mes con una metodología distinta. Los 9 feminicidios sí fueron corroborados de forma independiente por el Observatorio de Género Alas Tensas. Las denuncias de desvío de ayuda humanitaria en Granma tampoco se confirmaron."}, "intro": {"parrafos": ["El informe mensual de Cubalex sobre derechos humanos en Cuba de julio de 2026 documenta dos crisis paralelas: el colapso de las condiciones materiales de vida (agua, electricidad, salud) y un repunte de violencia ciudadana. Este expediente las trata como dos series separadas, cada una verificada por su cuenta.", "En derechos económicos, sociales y culturales, tres meses sin agua potable en zonas periféricas de La Habana, al menos tres apagones nacionales totales y una crisis sanitaria con escasez de insumos quedaron corroborados por fuentes independientes de Cubalex.", "En violencia ciudadana, los 9 feminicidios de julio fueron confirmados por un segundo monitor (Alas Tensas), pero los 37 homicidios totales —presentados como el máximo desde 2022— no lo fueron: Cubanet, otro monitor independiente, contó alrededor de 20 para el mismo mes. Ambas cifras se muestran, marcadas según su estado de verificación."]}, "desc": {"agua": {"resumen": "Zonas periféricas de La Habana, como Arroyo Naranjo, llevaban más de tres meses sin agua potable regular a julio de 2026.", "hechos": [{"afirmacion": "Municipios periféricos de La Habana, entre ellos Arroyo Naranjo, acumulaban más de tres meses sin agua potable regular.", "confianza": "corroborada", "fuente": "Diario de Cuba"}, {"afirmacion": "La crisis hídrica se suma a la eléctrica como parte de un patrón de colapso estructural de servicios esenciales, según el informe de Cubalex.", "confianza": "corroborada", "fuente": "Cubalex (informe julio 2026)"}]}, "electricidad": {"resumen": "El Sistema Electroenergético Nacional (SEN) sufrió al menos tres desconexiones totales durante julio de 2026, además de apagones locales de varios días consecutivos.", "hechos": [{"afirmacion": "El SEN colapsó por completo al menos tres veces en julio de 2026 (6, 10 y 14 de julio).", "confianza": "corroborada", "fuente": "14ymedio, CiberCuba, Diario de Cuba"}, {"afirmacion": "Se registraron además apagones locales prolongados, de varios días consecutivos, en distintas provincias.", "confianza": "corroborada", "fuente": "Cubalex (informe julio 2026), 14ymedio"}]}, "salud": {"resumen": "El sistema de salud reportó escasez de insumos para diálisis, condiciones extremas en áreas de neonatología y fallas de higiene en infraestructura sanitaria.", "hechos": [{"afirmacion": "Hospitales como el Hermanos Ameijeiras reportaron escasez de insumos para tratamientos de diálisis.", "confianza": "corroborada", "fuente": "Infobae, Diario de Cuba"}, {"afirmacion": "Se documentaron condiciones extremas en áreas de neonatología, incluida la falta de equipamiento adecuado.", "confianza": "corroborada", "fuente": "Infobae, Diario de Cuba"}, {"afirmacion": "Se reportaron fallas de higiene en infraestructura sanitaria hospitalaria.", "confianza": "corroborada", "fuente": "Diario de Cuba"}]}}, "violencia": {"homicidios": {"valor": 37, "etiqueta": "homicidios en julio de 2026, según Cubalex", "confianza": "no_confirmada", "fuente": "Cubalex (informe julio 2026)", "nota": "Cifra autorreferencial de la serie propia de Cubalex, descrita como la más alta desde el inicio de su monitoreo en 2022. Otro monitor independiente, Cubanet, contó alrededor de 20 muertes violentas para el mismo mes con una metodología distinta. Ver comparativa_homicidios."}, "feminicidios": {"valor": 9, "etiqueta": "feminicidios en julio de 2026", "confianza": "corroborada", "fuente": "Cubalex; confirmado de forma independiente por el Observatorio de Género Alas Tensas (OGAT)"}, "suicidios": {"valor": 4, "etiqueta": "suicidios en julio de 2026, según Cubalex, el máximo del año", "confianza": "no_confirmada", "fuente": "Cubalex (informe julio 2026)", "nota": "Cuba no publica estadística oficial mensual de suicidios; no se localizó ninguna fuente independiente con cifra propia para julio de 2026."}, "otros_hechos": {"descripcion": "El resto de los hechos de violencia correspondió mayormente a robos y asaltos violentos, ejecutados con machetes y armas de fuego, en un contexto de crisis de combustible que ha impulsado el robo de vehículos, motos y triciclos.", "confianza": "parcialmente_corroborada", "fuente": "Cubanet", "nota": "El patrón general de robos violentos vinculados a la crisis de combustible está bien documentado por prensa independiente. No se encontró corroboración específica de que los asaltos se concentraran, como afirma el informe de Cubalex, en equipos de generación eléctrica."}}, "comparativa_homicidios": {"cubalex_valor": 37, "cubalex_fuente": "Cubalex, informe mensual de julio de 2026", "cubanet_valor_aprox": 20, "cubanet_fuente": "Cubanet, \"Cuba: julio dejó al menos 20 muertos en hechos violentos\"", "nota": "Dos monitores independientes de la violencia en Cuba llegan a cifras distintas para el mismo mes. Cubalex agrega denuncias de una red más amplia de fuentes y redes sociales; Cubanet documenta casos con verificación propia más acotada. Ninguna de las dos cifras es oficial: el Estado cubano no publica estadística de homicidios. Este expediente no elige una sobre la otra, las presenta ambas con su fuente."}, "hoteles": {"pct_cerrado": 73, "cadenas_salida": ["Meliá", "Iberostar", "Barceló"], "confianza": "corroborada", "fuente": "OnCubaNews, CiberCuba, Diario de Cuba; reconocido por el Primer Ministro Manuel Marrero ante la Asamblea Nacional", "nota": "El 73% del parque hotelero cubano permanecía cerrado a julio de 2026, coincidiendo con la salida de las tres principales cadenas hoteleras españolas del país."}, "economia_contexto": [{"titulo": "176 medidas económicas", "detalle": "Paquete de 176 medidas que incluyó una nueva escala salarial presupuestada, billetes de alta denominación, mayores límites en banca electrónica y subsidios focalizados para 1,4 millones de personas vulnerables.", "confianza": "corroborada", "fuente": "The Conversation, CiberCuba"}, {"titulo": "92.000 plazas estatales eliminadas", "detalle": "Se anunció la eliminación de 92.000 plazas estatales por reestructuración, concentradas en los sectores de Salud, Educación, Cultura y Deportes.", "confianza": "corroborada", "fuente": "CiberCuba, The Conversation"}, {"titulo": "Atrasos salariales de hasta 6 meses", "detalle": "Persistieron atrasos salariales de hasta seis meses en algunos territorios (Guáimaro); otras fuentes documentan casos aún peores, de hasta 116 meses acumulados en Camagüey.", "confianza": "corroborada", "fuente": "CiberCuba"}, {"titulo": "Ampliación de sanciones de la OFAC", "detalle": "El Departamento del Tesoro de Estados Unidos amplió sanciones contra dos ciudadanos cubanos y nueve entidades vinculadas al régimen, el 23 de julio de 2026.", "confianza": "corroborada", "fuente": "Cubanet, Cuba en Miami, Departamento de Estado de EE.UU."}, {"titulo": "Ayuda humanitaria vía Cáritas", "detalle": "Estados Unidos comenzó en julio de 2026 la distribución de un paquete de 100 millones de dólares en ayuda humanitaria a través de Cáritas, con entregas documentadas en la provincia de Granma.", "confianza": "corroborada", "fuente": "La Patilla, Infobae"}, {"titulo": "Denuncias de desvío de la ayuda (no confirmadas)", "detalle": "El informe original de Cubalex denuncia al menos dos casos de desvío o reventa de la ayuda humanitaria en Granma.", "confianza": "no_confirmada", "fuente": "Cubalex (informe julio 2026)", "nota": "No se localizó ninguna fuente independiente, ni oficialista ni de prensa cubana, que documente estas denuncias específicas de desvío o reventa."}], "calendario_julio": {"dias": 31, "blackouts": [{"dia": 6, "fecha": "6 de julio de 2026", "confianza": "corroborada", "fuente": "14ymedio, CiberCuba"}, {"dia": 10, "fecha": "10 de julio de 2026", "confianza": "corroborada", "fuente": "14ymedio, CiberCuba, Diario de Cuba"}, {"dia": 14, "fecha": "14 de julio de 2026", "confianza": "corroborada", "fuente": "Diario de Cuba"}], "nota_agua": "La falta de agua potable en las zonas periféricas de La Habana fue una condición sostenida durante todo julio (ya llevaba más de tres meses al cierre del mes), no un evento puntual de un día concreto: los 31 días del mes comparten el mismo diagnóstico de fondo.", "nota_violencia": "El informe de Cubalex no desglosa la fecha exacta de cada homicidio, feminicidio o suicidio: las cifras de violencia (37, 9 y 4) son totales mensuales y se presentan aparte, nunca proyectadas sobre un día concreto del calendario."}, "verificacion": {"total_evaluadas": 11, "corroboradas": 7, "parcialmente_corroboradas": 2, "no_confirmadas": 2, "excluidas": 0, "nota": "Se evaluaron 11 afirmaciones del informe original de Cubalex. Quedaron corroboradas por fuentes independientes: los feminicidios (9), la crisis hídrica en La Habana, los apagones totales del SEN, la crisis sanitaria (diálisis, neonatología, higiene), el cierre del 73% del parque hotelero, las 176 medidas económicas con sus 92.000 plazas eliminadas y atrasos salariales, y la ampliación de sanciones de la OFAC. Quedaron parcialmente corroboradas: el patrón general de robos violentos (sin confirmar el detalle de que se concentren en equipos de generación eléctrica) y el inicio de la ayuda de Cáritas (sin confirmar las denuncias de desvío). No se confirmaron: la cifra total de homicidios (37) y la de suicidios (4), ambas propias del monitoreo interno de Cubalex sin réplica independiente exacta."}, "encuesta": {"preguntas": [{"id": "agua_electricidad", "texto": "Tres meses sin agua potable y al menos tres apagones nacionales totales en un solo mes. ¿Cuál de las dos crisis te parece más grave para la vida cotidiana?", "opciones": ["La falta de agua potable", "Los apagones nacionales totales", "Ambas por igual: son la misma crisis de fondo"]}, {"id": "cifras_violencia", "texto": "Cubalex y Cubanet reportan cifras distintas de homicidios para el mismo mes (37 frente a unos 20). ¿Qué te parece más razonable?", "opciones": ["Confiar en el monitor con la red más amplia (Cubalex)", "Confiar en el monitor con verificación más acotada (Cubanet)", "Ninguna cifra es confiable sin datos oficiales del Estado"]}, {"id": "prioridad_estatal", "texto": "El Estado desplegó fuerzas de seguridad para contener protestas por apagones, pero no logró frenar el aumento de la violencia ciudadana. ¿Qué debería priorizar?", "opciones": ["Seguridad ciudadana antes que control social", "Resolver la causa de fondo (energía y agua) antes que cualquier despliegue", "No hay forma de priorizar sin más información"]}]}, "referencias": [{"fuente": "Cubalex", "detalle": "Informe Mensual sobre la Situación de los Derechos Humanos en Cuba, julio de 2026", "fecha": "agosto de 2026"}, {"fuente": "Diario de Cuba", "detalle": "Cobertura de la crisis hídrica en Arroyo Naranjo y de la crisis sanitaria", "fecha": "julio de 2026"}, {"fuente": "14ymedio", "detalle": "Cobertura de los apagones totales del Sistema Electroenergético Nacional", "fecha": "julio de 2026"}, {"fuente": "CiberCuba", "detalle": "Cobertura de los apagones, el cierre hotelero, las 176 medidas y los atrasos salariales", "fecha": "julio de 2026"}, {"fuente": "Infobae", "detalle": "Cobertura de la crisis del sistema de salud (diálisis, neonatología)", "fecha": "julio de 2026"}, {"fuente": "OnCubaNews", "detalle": "Cobertura del cierre del 73% del parque hotelero cubano", "fecha": "julio de 2026"}, {"fuente": "The Conversation", "detalle": "Análisis de las 176 medidas económicas", "fecha": "julio de 2026"}, {"fuente": "Cubanet", "detalle": "Conteo independiente de muertes violentas en julio de 2026 (~20), usado como fuente de contraste frente a la cifra de Cubalex (37)", "fecha": "julio de 2026"}, {"fuente": "Alas Tensas / Observatorio de Género (OGAT)", "detalle": "Confirmación independiente de 9 feminicidios en julio de 2026", "fecha": "julio de 2026"}, {"fuente": "Cuba en Miami / Departamento de Estado de EE.UU.", "detalle": "Confirmación de la ampliación de sanciones de la OFAC del 23 de julio de 2026", "fecha": "julio de 2026"}, {"fuente": "La Patilla / Infobae", "detalle": "Cobertura del inicio de la distribución de ayuda humanitaria vía Cáritas", "fecha": "julio de 2026"}], "metodologia": {"fuentes": [{"nombre": "Cubalex", "tipo": "informe mensual / monitoreo propio", "url": "https://cubalex.org"}, {"nombre": "Cubanet", "tipo": "monitoreo independiente de contraste (violencia ciudadana)", "url": ""}, {"nombre": "Alas Tensas / OGAT", "tipo": "observatorio de género independiente", "url": ""}, {"nombre": "Prensa independiente cubana (14ymedio, CiberCuba, Diario de Cuba, Infobae, OnCubaNews)", "tipo": "cobertura periodística", "url": ""}], "periodo": "julio de 2026", "cadencia": "Nivel 2 — creación asistida vía /procesar-inbox; no entra en el ciclo automático de refresco de 8 horas.", "extraccion": "Verificación asistida por LLM (motor agnóstico) sobre el PDF de origen, con un subagente dedicado a corroborar cada afirmación cuantitativa y cualitativa contra fuentes independientes antes de incluirla en el dataset.", "validacion": "ajv contra derechos_sociales.schema.json · node scripts/bracket-balance.mjs · npm run build", "limitaciones": ["Las cifras de homicidios y suicidios de julio de 2026 son la métrica interna de Cubalex; no existe estadística oficial cubana de homicidios ni de suicidios, y el único monitor independiente comparable (Cubanet) reporta una cifra distinta de homicidios para el mismo mes.", "El informe original no desglosa la fecha exacta de cada homicidio, feminicidio o suicidio: no es posible ubicarlos en días concretos del calendario.", "Las denuncias de desvío de ayuda humanitaria en Granma no pudieron confirmarse de forma independiente."], "cambios_metodologicos": []}, "conclusion": "Julio de 2026 deja dos crisis documentadas con distinto grado de certeza. La primera —el colapso de las condiciones materiales de vida: tres meses sin agua potable en La Habana, al menos tres apagones nacionales totales, un sistema de salud sin insumos básicos, el cierre de tres cuartas partes del parque hotelero— está sólidamente corroborada por prensa independiente, más allá del propio informe de Cubalex que la documenta. La segunda —el repunte de violencia ciudadana— tiene una pieza firme (nueve feminicidios, confirmados por un segundo monitor) y dos piezas que dependen de una sola fuente: treinta y siete homicidios totales y cuatro suicidios, ninguno replicado de forma independiente, con un monitor alternativo que cuenta casi la mitad de los homicidios que reporta Cubalex para el mismo mes. Este expediente no promedia esas dos cifras ni elige una: las muestra ambas, con su fuente a la vista, porque la falta de estadística oficial cubana sobre violencia deja a la ciudadanía dependiendo de monitores privados que, se ha visto, no siempre coinciden."};

function SecHead({ n, t, d, hilo }) {
  return (
    <div className="ds-sec-head">
      <div className="ds-sec-top"><span className="ds-sec-num">{n}</span>{hilo && <span className={"ds-hilo ds-hilo-" + hilo}>{hilo === "desc" ? "HILO · DESC" : "HILO · VIOLENCIA"}</span>}</div>
      <h2>{t}</h2>{d && <p>{d}</p>}
    </div>
  );
}

function Chip({ estado }) {
  const cls = estado === "corroborada" ? "ok" : estado === "parcialmente_corroborada" ? "parcial" : "no";
  const txt = estado === "corroborada" ? "corroborada" : estado === "parcialmente_corroborada" ? "parcial" : "no confirmada";
  return <span className={"ds-chip ds-chip-" + cls}>{txt}</span>;
}

function Hecho({ h }) {
  return (
    <div className="ds-hecho">
      <div className="ds-hecho-top"><Chip estado={h.confianza} /><span className="ds-hecho-fuente">{h.fuente}</span></div>
      <p>{h.afirmacion}</p>
      {h.nota && <p className="ds-hecho-nota">{h.nota}</p>}
    </div>
  );
}

function CuentagotasJulio({ calendario }) {
  const dias = Array.from({ length: calendario.dias }, (_, i) => i + 1);
  const blackoutDias = new Set(calendario.blackouts.map((b) => b.dia));
  return (
    <div className="ds-cuentagotas">
      <div className="ds-cg-grid">
        {dias.map((d) => {
          const isBlackout = blackoutDias.has(d);
          return (
            <div className={"ds-cg-cell" + (isBlackout ? " ds-cg-cell-blackout" : "")} key={d} title={isBlackout ? `${d} de julio: desconexión total del SEN` : `${d} de julio: sin agua potable regular en zonas periféricas`}>
              <svg viewBox="0 0 20 26" className="ds-cg-drop">
                <path d="M10 1 C10 1 2 12 2 18 A8 8 0 0 0 18 18 C18 12 10 1 10 1 Z" className="ds-cg-drop-shape" />
              </svg>
              <span className="ds-cg-day">{d}</span>
            </div>
          );
        })}
      </div>
      <p className="ds-cg-nota">{calendario.nota_agua} <span className="ds-cg-legend"><i className="ds-cg-sw ds-cg-sw-blackout" /> apagón nacional total (día verificado)</span></p>
      <div className="ds-cg-violencia">
        <span className="ds-cg-violencia-label">Violencia del mes, sin fecha asignable:</span>
        <span className="ds-cg-violencia-item"><b>37</b> homicidios<Chip estado="no_confirmada" /></span>
        <span className="ds-cg-violencia-item"><b>9</b> feminicidios<Chip estado="corroborada" /></span>
        <span className="ds-cg-violencia-item"><b>4</b> suicidios<Chip estado="no_confirmada" /></span>
      </div>
      <p className="ds-cg-nota">{calendario.nota_violencia}</p>
    </div>
  );
}

function ComparativaHomicidios({ c }) {
  const max = Math.max(c.cubalex_valor, c.cubanet_valor_aprox);
  return (
    <div className="ds-comparativa">
      <div className="ds-comp-row">
        <span className="ds-comp-label">Cubalex</span>
        <span className="ds-comp-track"><span className="ds-comp-fill ds-comp-fill-a" style={{ width: (c.cubalex_valor / max) * 100 + "%" }}><b>{c.cubalex_valor}</b></span></span>
        <Chip estado="no_confirmada" />
      </div>
      <div className="ds-comp-row">
        <span className="ds-comp-label">Cubanet</span>
        <span className="ds-comp-track"><span className="ds-comp-fill ds-comp-fill-b" style={{ width: (c.cubanet_valor_aprox / max) * 100 + "%" }}><b>~{c.cubanet_valor_aprox}</b></span></span>
        <Chip estado="corroborada" />
      </div>
      <p className="ds-comp-nota">{c.nota}</p>
    </div>
  );
}

function DonutHoteles({ h }) {
  const R = 46, C_ = 2 * Math.PI * R;
  const pct = h.pct_cerrado;
  const dash = (pct / 100) * C_;
  return (
    <div className="ds-donut-wrap">
      <svg viewBox="0 0 120 120" className="ds-donut-svg" role="img" aria-label={`${pct}% del parque hotelero cerrado`}>
        <circle cx="60" cy="60" r={R} className="ds-donut-bg" />
        <circle cx="60" cy="60" r={R} className="ds-donut-fill" strokeDasharray={`${dash} ${C_}`} transform="rotate(-90 60 60)" />
        <text x="60" y="56" textAnchor="middle" className="ds-donut-pct">{pct}%</text>
        <text x="60" y="72" textAnchor="middle" className="ds-donut-sub">cerrado</text>
      </svg>
      <div className="ds-donut-legend">
        <p>Salida de <b>{h.cadenas_salida.join(", ")}</b> del parque hotelero cubano.</p>
        <p className="ds-donut-fuente"><Chip estado={h.confianza} /> <span>{h.fuente}</span></p>
      </div>
    </div>
  );
}

function FichasContexto({ items }) {
  return (
    <div className="ds-fichas-grid">
      {items.map((f, i) => (
        <div className="ds-ficha" key={i}>
          <div className="ds-ficha-top"><h4>{f.titulo}</h4><Chip estado={f.confianza} /></div>
          <p>{f.detalle}</p>
          {f.nota && <p className="ds-ficha-nota">{f.nota}</p>}
          <span className="ds-ficha-fuente">{f.fuente}</span>
        </div>
      ))}
    </div>
  );
}

function Encuesta({ datos }) {
  const CLAVE = "yamacoa_derechos_sociales_votos";
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
      sb.rpc("derechos_sociales_totales").then(({ data }) => { if (data) setVotos((v) => ({ ...v, ...data })); }).catch(() => {});
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
    if (sb && sb.rpc) sb.rpc("derechos_sociales_votar", { p_pregunta: pid, p_opcion: opcion }).catch(() => {});
  };
  return (
    <div className="ds-encuesta">
      {datos.preguntas.map((q) => {
        const conteo = votos[q.id] || {};
        const total = Object.values(conteo).reduce((a, b) => a + b, 0);
        const votado = miVoto[q.id] != null;
        return (
          <div className="ds-pregunta" key={q.id}>
            <p>{q.texto}</p>
            {q.opciones.map((op) => {
              const n = conteo[op] || 0;
              const pct = total ? Math.round((n / total) * 100) : 0;
              const elegida = miVoto[q.id] === op;
              return (
                <button key={op} className="ds-opcion" disabled={votado} onClick={() => votar(q.id, op)}>
                  <span className="ds-opcion-fill" style={{ width: votado ? pct + "%" : 0, background: elegida ? "rgba(58,95,77,.45)" : "rgba(139,148,141,.16)" }} />
                  <span className="ds-opcion-txt"><span>{elegida ? "✓ " : ""}{op}</span>{votado && <span>{pct}%</span>}</span>
                </button>
              );
            })}
            <p className="ds-pregunta-total">{total} voto{total === 1 ? "" : "s"}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(EMBEDDED);

  useEffect(() => {
    const id = "ds-fonts";
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

  return (
    <div className="ds-root">
      <style>{CSS}</style>

      <header className="ds-hero">
        <span className="ds-eyebrow">CUBALEX · INFORME MENSUAL, JULIO 2026</span>
        <h1>{m.titulo}</h1>
        <p className="ds-subtitulo">{m.subtitulo}</p>
        <div className="ds-advertencia">⚠ {m.advertencia}</div>
      </header>

      <main className="ds-main">
        <section>
          <SecHead n="00" t="Dos hilos, dos grados de certeza" />
          {data.intro.parrafos.map((p, i) => <p className="ds-parrafo" key={i}>{p}</p>)}
        </section>

        <section>
          <SecHead n="01" hilo="desc" t="Agua: tres meses de espera" d={data.desc.agua.resumen} />
          <div className="ds-hechos-grid">{data.desc.agua.hechos.map((h, i) => <Hecho h={h} key={i} />)}</div>
        </section>

        <section>
          <SecHead n="02" hilo="violencia" t="Homicidios: dos monitores, dos cifras" d={data.violencia.homicidios.nota} />
          <ComparativaHomicidios c={data.comparativa_homicidios} />
        </section>

        <section>
          <SecHead n="03" hilo="desc" t="Electricidad y el calendario de julio" d={data.desc.electricidad.resumen} />
          <div className="ds-hechos-grid">{data.desc.electricidad.hechos.map((h, i) => <Hecho h={h} key={i} />)}</div>
          <CuentagotasJulio calendario={data.calendario_julio} />
        </section>

        <section>
          <SecHead n="04" hilo="desc" t="Salud: lo que faltó" d={data.desc.salud.resumen} />
          <div className="ds-hechos-grid">{data.desc.salud.hechos.map((h, i) => <Hecho h={h} key={i} />)}</div>
        </section>

        <section>
          <SecHead n="05" hilo="violencia" t="Feminicidios, suicidios y el resto de la violencia" />
          <div className="ds-hechos-grid">
            <Hecho h={{ afirmacion: `${data.violencia.feminicidios.valor} ${data.violencia.feminicidios.etiqueta}.`, confianza: data.violencia.feminicidios.confianza, fuente: data.violencia.feminicidios.fuente }} />
            <Hecho h={{ afirmacion: `${data.violencia.suicidios.valor} ${data.violencia.suicidios.etiqueta}.`, confianza: data.violencia.suicidios.confianza, fuente: data.violencia.suicidios.fuente, nota: data.violencia.suicidios.nota }} />
            <Hecho h={{ afirmacion: data.violencia.otros_hechos.descripcion, confianza: data.violencia.otros_hechos.confianza, fuente: data.violencia.otros_hechos.fuente, nota: data.violencia.otros_hechos.nota }} />
          </div>
        </section>

        <section>
          <SecHead n="06" t="Contexto económico: 176 medidas y cierre hotelero" />
          <DonutHoteles h={data.hoteles} />
          <FichasContexto items={data.economia_contexto} />
        </section>

        <section>
          <SecHead n="07" t="Cómo se verificó este expediente" d={v.nota} />
          <div className="ds-verif-stats">
            <div><b>{v.total_evaluadas}</b><span>afirmaciones evaluadas</span></div>
            <div><b style={{ color: C.corrob }}>{v.corroboradas}</b><span>corroboradas</span></div>
            <div><b style={{ color: C.parcial }}>{v.parcialmente_corroboradas}</b><span>parciales</span></div>
            <div><b style={{ color: C.noconf }}>{v.no_confirmadas}</b><span>no confirmadas</span></div>
          </div>
        </section>

        <section>
          <SecHead n="08" t="Tu lectura" />
          <Encuesta datos={data.encuesta} />
        </section>

        <section>
          <SecHead n="09" t="Referencias" />
          <ul className="ds-referencias">
            {data.referencias.map((r, i) => <li key={i}><b>{r.fuente}</b> — {r.detalle}{r.fecha ? ` (${r.fecha})` : ""}</li>)}
          </ul>
          <p className="ds-conclusion">{data.conclusion}</p>
        </section>
      </main>
    </div>
  );
}

const CSS = `
.ds-root{ background:${C.bg}; color:${C.paper}; font-family:'Archivo',system-ui,sans-serif; min-height:100vh; }
.ds-root *{ box-sizing:border-box; }
.ds-hero{ padding:48px 20px 28px; max-width:920px; margin:0 auto; }
.ds-eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.14em; color:${C.contrapuntoClaro}; }
.ds-hero h1{ font-size:clamp(28px,5vw,46px); margin:10px 0 8px; line-height:1.08; }
.ds-subtitulo{ color:${C.dim}; font-size:16px; max-width:700px; line-height:1.55; }
.ds-advertencia{ margin-top:18px; background:${C.panel}; border:1px solid ${C.primario}; border-radius:8px; padding:12px 16px; font-size:13.5px; line-height:1.5; }
.ds-main{ max-width:920px; margin:0 auto; padding:0 20px 80px; }
.ds-main section{ margin-top:56px; }
.ds-sec-head{ margin-bottom:16px; }
.ds-sec-top{ display:flex; align-items:center; gap:10px; }
.ds-sec-num{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:${C.dim}; letter-spacing:.1em; }
.ds-hilo{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.08em; padding:2px 7px; border-radius:999px; }
.ds-hilo-desc{ color:${C.primario}; border:1px solid ${C.primario}; }
.ds-hilo-violencia{ color:${C.contrapuntoClaro}; border:1px solid ${C.contrapuntoClaro}; }
.ds-sec-head h2{ font-size:22px; margin:4px 0 6px; }
.ds-sec-head p{ color:${C.dim}; font-size:13.5px; line-height:1.5; margin:0; }
.ds-parrafo{ font-size:15px; line-height:1.65; margin:0 0 14px; }
.ds-chip{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; text-transform:uppercase; letter-spacing:.07em; padding:2px 7px; border-radius:999px; white-space:nowrap; }
.ds-chip-ok{ color:${C.corrob}; border:1px solid ${C.corrob}; }
.ds-chip-parcial{ color:${C.parcial}; border:1px dashed ${C.parcial}; }
.ds-chip-no{ color:${C.noconf}; border:1px dashed ${C.noconf}; }
.ds-hechos-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:12px; }
.ds-hecho{ background:${C.panel}; border-radius:8px; padding:12px 16px; }
.ds-hecho-top{ display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap; }
.ds-hecho-fuente{ font-size:11px; color:${C.dim}; }
.ds-hecho p{ font-size:13.5px; line-height:1.5; margin:0; }
.ds-hecho-nota{ color:${C.dim}; font-size:12px; margin-top:6px !important; }
.ds-cuentagotas{ margin-top:18px; background:${C.panel}; border-radius:10px; padding:18px; }
.ds-cg-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(30px,1fr)); gap:4px; }
.ds-cg-cell{ display:flex; flex-direction:column; align-items:center; gap:2px; }
.ds-cg-drop{ width:16px; height:20px; }
.ds-cg-drop-shape{ fill:${C.primario}; opacity:.45; }
.ds-cg-cell-blackout .ds-cg-drop-shape{ fill:${C.contrapuntoClaro}; opacity:1; filter:drop-shadow(0 0 4px rgba(138,90,99,.7)); }
.ds-cg-day{ font-family:'IBM Plex Mono',monospace; font-size:8px; color:${C.dim}; }
.ds-cg-nota{ font-size:11.5px; color:${C.dim}; line-height:1.5; margin:12px 0 0; }
.ds-cg-legend{ display:inline-flex; align-items:center; gap:5px; margin-left:8px; white-space:nowrap; }
.ds-cg-sw{ display:inline-block; width:9px; height:9px; border-radius:2px; background:${C.contrapuntoClaro}; }
.ds-cg-violencia{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-top:16px; padding-top:14px; border-top:1px solid ${C.line}; }
.ds-cg-violencia-label{ font-size:11.5px; color:${C.dim}; }
.ds-cg-violencia-item{ display:inline-flex; align-items:center; gap:6px; font-size:13px; }
.ds-cg-violencia-item b{ font-family:'IBM Plex Mono',monospace; font-size:16px; }
.ds-comparativa{ margin-top:12px; background:${C.panel}; border-radius:10px; padding:18px; display:flex; flex-direction:column; gap:10px; }
.ds-comp-row{ display:grid; grid-template-columns:80px 1fr auto; align-items:center; gap:12px; }
.ds-comp-label{ font-size:13px; font-weight:600; }
.ds-comp-track{ position:relative; height:26px; background:${C.panel2}; border-radius:6px; overflow:hidden; }
.ds-comp-fill{ position:absolute; top:2px; bottom:2px; left:0; border-radius:5px; display:flex; align-items:center; justify-content:flex-end; padding-right:8px; }
.ds-comp-fill-a{ background:${C.contrapuntoClaro}; }
.ds-comp-fill-b{ background:${C.primario}; }
.ds-comp-fill b{ font-family:'IBM Plex Mono',monospace; font-size:12px; }
.ds-comp-nota{ font-size:12px; color:${C.dim}; line-height:1.5; margin:6px 0 0; }
.ds-donut-wrap{ display:flex; gap:22px; align-items:center; flex-wrap:wrap; background:${C.panel}; border-radius:10px; padding:18px; margin-bottom:14px; }
.ds-donut-svg{ width:120px; height:120px; flex-shrink:0; }
.ds-donut-bg{ fill:none; stroke:${C.panel2}; stroke-width:12; }
.ds-donut-fill{ fill:none; stroke:${C.contrapuntoClaro}; stroke-width:12; stroke-linecap:round; transition:stroke-dasharray .6s; }
.ds-donut-pct{ font-family:'IBM Plex Mono',monospace; font-size:20px; fill:${C.paper}; }
.ds-donut-sub{ font-size:10px; fill:${C.dim}; text-transform:uppercase; letter-spacing:.06em; }
.ds-donut-legend{ flex:1; min-width:200px; }
.ds-donut-legend p{ font-size:13.5px; line-height:1.5; margin:0 0 8px; }
.ds-donut-fuente{ display:flex; align-items:center; gap:8px; }
.ds-donut-fuente span{ font-size:11px; color:${C.dim}; }
.ds-fichas-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:12px; }
.ds-ficha{ background:${C.panel}; border-radius:8px; padding:14px 16px; }
.ds-ficha-top{ display:flex; justify-content:space-between; align-items:baseline; gap:8px; margin-bottom:6px; }
.ds-ficha-top h4{ font-size:14px; margin:0; }
.ds-ficha p{ font-size:12.5px; line-height:1.5; margin:0; color:${C.paper}; }
.ds-ficha-nota{ color:${C.dim} !important; font-size:11.5px !important; margin-top:6px !important; }
.ds-ficha-fuente{ display:block; font-size:10.5px; color:${C.dim}; margin-top:8px; }
.ds-verif-stats{ display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:14px; }
.ds-verif-stats div{ background:${C.panel}; border-radius:8px; padding:14px 16px; text-align:center; }
.ds-verif-stats b{ font-family:'IBM Plex Mono',monospace; font-size:24px; display:block; color:${C.paper}; }
.ds-verif-stats span{ font-size:10.5px; color:${C.dim}; text-transform:uppercase; letter-spacing:.05em; }
.ds-encuesta{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; }
.ds-pregunta{ background:${C.panel}; border:1px solid ${C.line}; border-radius:10px; padding:14px 16px; }
.ds-pregunta p{ font-size:14px; line-height:1.5; margin:0 0 12px; }
.ds-opcion{ display:block; width:100%; text-align:left; margin-bottom:8px; position:relative; overflow:hidden; background:${C.panel2}; color:${C.paper}; border-radius:6px; border:1px solid ${C.line}; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:12.5px; }
.ds-opcion:disabled{ cursor:default; }
.ds-opcion-fill{ position:absolute; inset:0; transition:width .4s; }
.ds-opcion-txt{ position:relative; display:flex; justify-content:space-between; padding:8px 10px; }
.ds-pregunta-total{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:${C.dim}; margin:4px 0 0; }
.ds-referencias{ list-style:none; margin:0 0 20px; padding:0; display:flex; flex-direction:column; gap:8px; }
.ds-referencias li{ font-size:13px; color:${C.dim}; line-height:1.5; }
.ds-referencias b{ color:${C.paper}; }
.ds-conclusion{ font-size:15px; line-height:1.65; border-top:1px solid ${C.line}; padding-top:20px; }
@media (max-width:640px){
  .ds-comp-row{ grid-template-columns:60px 1fr auto; }
  .ds-donut-wrap{ flex-direction:column; align-items:flex-start; }
}
`;
