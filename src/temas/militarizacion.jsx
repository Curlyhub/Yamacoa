import { useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, LineChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";

/* ============================================================================
   YAMACOA · expediente "militarizacion" — RENDERER CONGELADO
   Militarizacion de facto de la vida civil en Cuba desde el 17 de enero de
   2026, sobre el informe especial de Cubalex "Cuba: militarizacion social y
   excepcionalidad de facto" (feb-jul 2026), verificado de forma independiente
   caso por caso. Las dos series numericas agregadas del propio monitoreo de
   Cubalex (eventos y protestas mensuales) se muestran siempre marcadas como
   "segun Cubalex", nunca como corroboradas por segunda fuente: ver
   cifras.advertencia y cifras.nota_divergencia_occ en el dataset.
   Datos en public/data/militarizacion.json (validado por
   militarizacion.schema.json).
   Paleta "Plomo de Cuartel": plomo-violeta institucional + papel kaki de
   expediente (solo dentro de este renderer, nunca accent de portada), sobre
   fondo oscuro. Geometria de Cuba (CUBA_FEATURE) reutilizada verbatim del
   contorno congelado de 42 puntos; sin senal por provincia nombrada (el
   informe no identifica la mayoria de las provincias de sus conteos), solo
   cobertura numerica agregada.
   ========================================================================== */

const C = {
  bg: "#15121C", panel: "#211C2C", panel2: "#2A2438",
  line: "rgba(231,224,240,.10)", paper: "#EDE7F2", dim: "#948BA3",
  primario: "#4D4068", contrapunto: "#C7BEAE",
  corrob: "#5FAE8F", noconf: "#D9A13B",
};
const DATA_URL = ((typeof process !== "undefined" && process.env && process.env.PUBLIC_URL) || "") + "/data/militarizacion.json";

// Geometria real de Cuba — contorno de 42 puntos, congelado, reutilizado tal
// cual de src/temas/represion_cuba.jsx. No se toca.
const CUBA_FEATURE = {
  type: "Feature",
  geometry: { type: "Polygon", coordinates: [[
    [-84.95,21.86],[-84.40,22.05],[-83.90,22.35],[-83.30,22.70],[-82.80,23.00],
    [-82.30,23.18],[-81.50,23.18],[-80.90,23.13],[-80.20,22.92],[-79.60,22.66],
    [-79.00,22.46],[-78.40,22.40],[-77.80,22.10],[-77.20,21.82],[-76.60,21.34],
    [-76.10,21.12],[-75.60,21.05],[-75.10,20.72],[-74.50,20.50],[-74.13,20.25],
    [-74.55,20.05],[-75.05,19.92],[-75.85,19.86],[-76.55,19.96],[-77.20,20.02],
    [-77.72,19.84],[-78.22,20.32],[-78.62,20.70],[-79.05,21.00],[-79.62,21.30],
    [-80.22,21.50],[-80.82,21.60],[-81.42,21.70],[-82.02,21.86],[-82.62,22.00],
    [-83.22,22.05],[-83.92,22.00],[-84.42,21.90],[-84.95,21.86],
  ]] },
};

const EMBEDDED = {"meta": {"slug": "militarizacion", "titulo": "Guerra sin declarar", "subtitulo": "Desde el 17 de enero de 2026, estructuras militares gobiernan funciones civiles en Cuba sin que el Estado haya proclamado ninguna de las situaciones excepcionales que prevé su propia Constitución: 215 eventos documentados por Cubalex entre febrero y julio, un civil procesado por espionaje ante un tribunal militar y amenazas de muerte contra presos políticos.", "descripcion": "El 17 de enero de 2026, el Consejo de Defensa Nacional de Cuba celebró una sesión presentada por la prensa oficial como una actividad rutinaria del Día de la Defensa. En ella aprobó \"los planes y medidas para el paso al Estado de Guerra\". Dos días después, los principales voceros del sistema estatal de medios negaron por su cuenta que se hubiera declarado un estado de guerra, calificando lo aprobado de \"acto administrativo y preventivo\". Ningún órgano del Estado ha proclamado formalmente una situación excepcional desde entonces. Ninguna medida tiene fecha de terminación. Ningún tribunal supervisa lo que se decide.\n\nEste expediente documenta, con datos del informe especial de Cubalex \"Cuba: militarización social y excepcionalidad de facto\" (corte de datos: 25 de julio de 2026) y verificación independiente propia, cómo esa contradicción entre lo que el Estado hace y lo que proclama se sostuvo y se profundizó durante seis meses. Cubalex registra 215 eventos entre el 3 de febrero y el 24 de julio, con una composición que se invirtió con el tiempo: en febrero, el 20% de los eventos era represión directa; en junio y julio, esa proporción subió a 80% y 79%. La escala de riesgo de militarización social de Cubalex, de 1 a 5, se mantiene en el nivel máximo desde abril de 2026.\n\nEl periodo dejó hechos verificados de forma independiente que superan la retórica. El humorista Eduardo Ceballos fue detenido el 1 de junio por un video satírico grabado en una base militar abandonada; días después se anunció que sería procesado por un tribunal militar acusado de espionaje, delito que en su modalidad más grave alcanza 30 años de prisión. Presos políticos como Alexander Verdecia y expresos como Andy García Lorenzo recibieron amenazas de muerte directas de funcionarios estatales. El opositor Manuel Cuesta Morúa fue detenido de forma incomunicada y denunció golpes tras su liberación. El hábeas corpus presentado a favor del artista Luis Manuel Otero Alcántara fue denegado y obstaculizado repetidamente por tribunales en Artemisa y La Habana, hasta que la resolución final llegó una semana después de que ya hubiera salido de Cuba. La Resolución 6/2026 del Ministerio del Interior, publicada en la Gaceta Oficial el 18 de mayo, autoriza congelar cuentas bancarias sin aviso previo y sin límite temporal.\n\nEste expediente separa con cuidado dos niveles de evidencia. Los hechos y casos individuales narrados aquí (la sesión del Consejo de Defensa Nacional y su desmentido, la Resolución 6/2026, la campaña \"Mi Firma por la Patria\", la restricción de viajes interprovinciales y los cinco casos documentados) fueron corroborados de forma independiente por un subagente de verificación contra prensa cubana, la Gaceta Oficial y organizaciones de derechos humanos. Las dos series numéricas agregadas —eventos mensuales y protestas mensuales— son, en cambio, la métrica interna del propio monitoreo de Cubalex: no existe una réplica exacta en otro observatorio, y la serie de protestas en particular diverge de las cifras publicadas por el Observatorio Cubano de Conflictos (OCC) para los mismos meses. Se presentan igualmente, porque documentan una tendencia consistente con los hechos verificados de forma independiente, pero marcadas de forma visible como \"según Cubalex\", nunca como una segunda fuente que las confirme.\n\nLa evaluación jurídica de este expediente aplica los cinco requisitos que el derecho internacional de los derechos humanos exige a cualquier estado de excepción legítimo —proclamación, límite temporal, necesidad y proporcionalidad, notificación internacional y control judicial efectivo— sobre los hechos verificados de forma independiente. Los cinco aparecen incumplidos.", "narracion": "Desde el diecisiete de enero de dos mil veintiséis, Cuba opera bajo estructuras militares que asumen funciones civiles sin que el Estado haya declarado formalmente ningún estado de excepción. Ese día, el Consejo de Defensa Nacional aprobó los planes para el paso al Estado de Guerra. Dos días después, la televisión estatal negó que existiera tal declaración. Ninguna medida tiene fecha de fin. Ningún tribunal la supervisa. Cubalex documentó doscientos quince eventos entre febrero y julio, con una escala de riesgo que se mantiene en el nivel máximo, de cinco, desde abril. El humorista Eduardo Ceballos enfrenta un tribunal militar por espionaje, por un video satírico. Presos políticos recibieron amenazas de muerte directas. El hábeas corpus del artista Luis Manuel Otero Alcántara fue denegado varias veces, hasta que la resolución llegó una semana después de que ya hubiera salido del país. Una resolución ministerial permite congelar cuentas bancarias sin aviso previo. Este expediente verificó de forma independiente cada caso y cada norma citada. Las cifras mensuales de eventos y protestas, en cambio, son la métrica propia de Cubalex, sin réplica exacta en otro observatorio, y se presentan marcadas como tal. Los cinco requisitos internacionales para un estado de excepción legítimo (proclamación, límite temporal, proporcionalidad, notificación y control judicial) aparecen, los cinco, incumplidos.", "version": "1.0.0", "fecha_datos": "2026-07-25", "advertencia": "Los hechos y casos individuales de este expediente están corroborados por fuentes independientes de Cubalex. Las series mensuales de eventos y de protestas son la métrica interna del propio monitoreo de Cubalex: la serie de protestas, en particular, diverge de las cifras del Observatorio Cubano de Conflictos (OCC) para los mismos meses. Se presentan marcadas como \"según Cubalex\", nunca como corroboradas por una segunda fuente."}, "intro": {"parrafos": ["El 17 de enero de 2026, el Consejo de Defensa Nacional aprobó \"los planes y medidas para el paso al Estado de Guerra\". Dos días después, la televisión estatal negó que se hubiera declarado un estado de guerra. Desde entonces, ningún órgano del Estado ha proclamado formalmente una situación excepcional, ninguna medida tiene fecha de terminación y ningún tribunal supervisa lo que se decide.", "Entre febrero y julio de 2026, Cubalex documentó 215 eventos que muestran cómo esa contradicción se sostuvo: la composición del registro se invirtió (de 20% de represión directa en febrero a 79-80% en junio y julio) y la escala de riesgo de militarización social se mantiene en su nivel máximo desde abril.", "Este expediente distingue siempre dos niveles de evidencia: los hechos y casos individuales, verificados de forma independiente contra prensa cubana y fuentes oficiales, y las dos series numéricas agregadas, que son la métrica propia de Cubalex y se presentan marcadas como tal, sin fusionarlas con lo corroborado por segunda fuente."]}, "origen": {"fecha": "17 de enero de 2026", "hechos": [{"afirmacion": "El Consejo de Defensa Nacional celebró una sesión, presentada por la prensa oficial como una actividad del Día de la Defensa, en la que aprobó \"los planes y medidas para el paso al Estado de Guerra, como parte de la preparación del país bajo la concepción estratégica de la Guerra de todo el Pueblo\".", "confianza": "corroborada", "fuente": "Presidencia de Cuba / Granma / Cubadebate (17 de enero de 2026)"}, {"afirmacion": "La noche del 18 y la mañana del 19 de enero, los principales voceros del sistema estatal de medios negaron que se hubiera declarado un estado de guerra, calificando lo aprobado de \"acto administrativo y preventivo\".", "confianza": "corroborada", "fuente": "CiberCuba, elTOQUE, Telemundo 51 (19 de enero de 2026)"}, {"afirmacion": "Una semana antes de la sesión, la Presidencia había tenido que desmentir un comunicado falso que anunciaba la suspensión de todas las actividades del país.", "confianza": "corroborada", "fuente": "Cubadebate, Presidencia de Cuba (11 de enero de 2026)"}], "cita_oficial": {"texto": "Un acto administrativo y preventivo: actualizar manuales de logística, movilización y defensa.", "atribucion": "Explicación oficial difundida por el Sistema Informativo de la Televisión Cubana", "fecha": "19 de enero de 2026", "confianza": "corroborada", "fuente": "CiberCuba, Canal Caribe"}}, "fases": [{"id": "organizacion", "periodo": "Febrero 2026", "titulo": "Organización", "descripcion": "Activación de Zonas de Defensa y Milicias de Tropas Territoriales, con integración de la población civil en tareas de vigilancia local.", "hechos_clave": ["10 eventos registrados, 3 provincias, 20% de represión directa."]}, {"id": "operativo", "periodo": "Marzo 2026", "titulo": "Operativo", "descripcion": "Los despliegues militares responden a un récord histórico de protestas provocadas por el colapso del sistema eléctrico nacional.", "hechos_clave": ["33 eventos registrados, 9 provincias, 234 protestas según Cubalex — el mes de mayor número de protestas hasta entonces."]}, {"id": "consolidacion", "periodo": "Abril 2026", "titulo": "Consolidación", "descripcion": "Las estructuras militares asumen abiertamente funciones civiles. El Ministerio del Interior acuartela el sistema penitenciario en al menos tres provincias orientales invocando la \"inminencia de una invasión\". La escala de riesgo de Cubalex alcanza su nivel máximo (5 de 5) y no ha bajado desde entonces.", "hechos_clave": ["La campaña \"Mi Firma por la Patria\" reúne 6,2 millones de firmas.", "Ejercicios estudiantiles universitarios con fusiles de asalto y manejo de minas."]}, {"id": "prevencion_amenaza", "periodo": "Mayo 2026", "titulo": "Prevención y amenaza letal", "descripcion": "Mayor dispersión territorial de la serie (eventos en diez provincias, según Cubalex). El Ejercicio Meteoro 2026 y una \"Guía Familiar para la Protección ante una Agresión Militar\" llevan la lógica bélica a los hogares. Presos políticos de al menos tres prisiones denuncian amenazas de fusilamiento.", "hechos_clave": ["Resolución 6/2026 del MININT: congelamiento de cuentas bancarias sin aviso previo.", "Amenaza de muerte directa contra el preso político Alexander Verdecia."]}, {"id": "protesta_represion", "periodo": "Junio-julio 2026", "titulo": "Ciclo protesta-represión y tribunales militares", "descripcion": "La crisis eléctrica desplaza al escenario externo como detonante: protesta por apagones, despliegue de tropas especiales y drones, detenciones y presencia militar permanente en el barrio, semana tras semana. Un civil es procesado por primera vez ante la jurisdicción militar.", "hechos_clave": ["Detención y anuncio de juicio militar por espionaje contra el humorista Eduardo Ceballos.", "Restricción de viajes interprovinciales desde el 18 de junio.", "54 y 39 eventos en junio y julio (parcial), con 80% y 79% de represión directa."]}], "cifras": {"advertencia": "Las dos series siguientes (eventos mensuales y protestas mensuales) son la métrica interna del monitoreo de Cubalex, presentada aquí sin réplica exacta de otro observatorio. Ver nota_divergencia_occ.", "serie_mensual": [{"mes": "Febrero", "eventos": 10, "represion": 2, "pct_represion": 20, "victimas": 0, "provincias": 3}, {"mes": "Marzo", "eventos": 33, "represion": 22, "pct_represion": 67, "victimas": 1, "provincias": 9}, {"mes": "Abril", "eventos": 42, "represion": 31, "pct_represion": 74, "victimas": 18, "provincias": 6}, {"mes": "Mayo", "eventos": 37, "represion": 21, "pct_represion": 57, "victimas": 8, "provincias": 10}, {"mes": "Junio", "eventos": 54, "represion": 43, "pct_represion": 80, "victimas": 25, "provincias": 7}, {"mes": "Julio (al 24)", "eventos": 39, "represion": 31, "pct_represion": 79, "victimas": 26, "provincias": 4}], "serie_protestas": [{"mes": "Enero", "valor": 32, "parcial": false}, {"mes": "Febrero", "valor": 71, "parcial": false}, {"mes": "Marzo", "valor": 234, "parcial": false}, {"mes": "Abril", "valor": 66, "parcial": false}, {"mes": "Mayo", "valor": 109, "parcial": false}, {"mes": "Junio", "valor": 254, "parcial": false}, {"mes": "Julio", "valor": 156, "parcial": true}], "nota_divergencia_occ": "El Observatorio Cubano de Conflictos (OCC), un monitoreo independiente distinto del de Cubalex, reporta cifras sustancialmente distintas para los mismos meses: para mayo de 2026 registra 1.311 protestas, denuncias y expresiones de descontento en total (46 con presencia física en la calle); para junio de 2026, 1.220 en total (107 con presencia física, un récord para su propia serie). Ninguna de las dos cifras de Cubalex (109 en mayo, 254 en junio) coincide con el desglose amplio ni con el de \"protestas presenciales\" del OCC, posiblemente porque miden categorías distintas que Cubalex no explicita del todo en su informe público. Este expediente no intenta reconciliar ambas series: las presenta por separado, cada una atribuida a su fuente."}, "riesgo": {"escala_max": 5, "nivel_actual": 5, "desde": "abril de 2026", "historial": [{"mes": "Febrero", "nivel": null, "fase": "Organización"}, {"mes": "Marzo", "nivel": null, "fase": "Operativo (récord de protestas)"}, {"mes": "Abril", "nivel": 5, "fase": "Consolidación — nivel máximo alcanzado"}, {"mes": "Mayo", "nivel": 5, "fase": "Prevención nacional y amenaza letal individualizada"}, {"mes": "Junio", "nivel": 5, "fase": "Ciclo protesta-represión"}, {"mes": "Julio", "nivel": 5, "fase": "Jurisdicción militar sobre un civil"}], "nota": "Cubalex publica su escala de riesgo de militarización social (1 a 5) como nivel vigente, sin desglosar un valor numérico para cada mes anterior a abril de 2026: febrero y marzo se documentan aquí solo de forma cualitativa (la fase descrita por el propio informe), nunca como una cifra inventada."}, "geografia": {"pct_habana_jun_jul": 54, "lugares_identificados": [{"lugar": "Regla", "provincia": "La Habana", "evento": "Militarización de las calles tras varios días de protesta por los apagones.", "fecha": "22 de junio de 2026", "fuente": "14ymedio", "confianza": "corroborada"}, {"lugar": "Guanabacoa y Centro Habana", "provincia": "La Habana", "evento": "Extensión de la militarización ante el descontento por los apagones.", "fecha": "29 de junio de 2026", "fuente": "14ymedio", "confianza": "corroborada"}, {"lugar": "Santiago de Cuba (ciudad)", "provincia": "Santiago de Cuba", "evento": "Respuesta con armas largas a un cacerolazo.", "fecha": "3 de julio de 2026", "fuente": "Diario de Cuba", "confianza": "corroborada"}, {"lugar": "Luyanó", "provincia": "La Habana", "evento": "Al menos 24 detenidos tras una protesta.", "fecha": "9 de julio de 2026", "fuente": "Diario de Cuba", "confianza": "corroborada"}, {"lugar": "Lawton", "provincia": "La Habana", "evento": "Protestas en otra noche de apagón.", "fecha": "19 de julio de 2026", "fuente": "Martí Noticias", "confianza": "corroborada"}, {"lugar": "Santiago de Las Vegas", "provincia": "La Habana", "evento": "Represión con fuerzas especiales tras protestas; traslado de detenidos al Vivac.", "fecha": "23-24 de julio de 2026", "fuente": "Martí Noticias", "confianza": "corroborada"}, {"lugar": "El Diezmero", "provincia": "La Habana", "evento": "Despliegue del Ministerio del Interior ante protestas por agua y apagones.", "fecha": "25 de julio de 2026", "fuente": "CiberCuba", "confianza": "corroborada"}], "nota": "El informe de Cubalex no identifica por nombre la mayoría de las provincias que integran sus conteos mensuales (por ejemplo, las diez provincias con eventos en mayo): solo reporta un número total. Los únicos lugares que el informe nombra explícitamente son los siete listados aquí, casi todos municipios de La Habana, con un único evento identificado fuera de la capital (Santiago de Cuba)."}, "casos": [{"id": "ceballos", "nombre": "Eduardo (\"Eddy\") Ceballos", "alias": "Despingovery Channel", "resumen": "Humorista detenido el 1 de junio de 2026 por un video satírico grabado en una base militar abandonada; anunciado que sería juzgado por un tribunal militar por espionaje, delito que en su modalidad más grave alcanza 30 años de prisión.", "hechos": [{"afirmacion": "Detenido el 1 de junio de 2026 por un video satírico grabado en una base militar abandonada.", "confianza": "corroborada", "fuente": "CubaNet, Martí Noticias, Diario de Cuba"}, {"afirmacion": "Anunciado el 10 de junio de 2026 que sería juzgado por un tribunal militar por espionaje.", "confianza": "corroborada", "fuente": "Martí Noticias"}, {"afirmacion": "El camarógrafo del video también fue detenido, el 25 de junio de 2026.", "confianza": "corroborada", "fuente": "Martí Noticias"}], "desenlace": "Es el caso documentado más reciente de un civil procesado por la jurisdicción militar cubana; el proceso seguía abierto en la fecha de corte del informe (25 de julio de 2026). Los estándares interamericanos establecen que la jurisdicción militar carece de competencia para juzgar civiles.", "confianza_global": "corroborada"}, {"id": "verdecia", "nombre": "Alexander Verdecia", "resumen": "Preso político que recibió una amenaza de muerte directa de un oficial de prisión en mayo de 2026, en el contexto de la tensión con Estados Unidos.", "hechos": [{"afirmacion": "Recibió una amenaza de muerte directa de un oficial mientras cumplía condena.", "confianza": "corroborada", "fuente": "Martí Noticias (19 de mayo de 2026), Prisoners Defenders"}], "desenlace": "Su caso se documenta junto a denuncias de otros presos políticos de al menos tres prisiones (Guanajay, Boniato y Kilo 8) que reportaron amenazas similares de fusilamiento ante una eventual intervención militar estadounidense.", "confianza_global": "corroborada"}, {"id": "garcia_lorenzo", "nombre": "Andy García Lorenzo", "resumen": "Expreso político amenazado por la Seguridad del Estado con \"prisión o pena de muerte\" en junio de 2026, por filmar instalaciones militares.", "hechos": [{"afirmacion": "Amenazado por la Seguridad del Estado con \"prisión o pena de muerte\", el 25 de junio de 2026.", "confianza": "corroborada", "fuente": "CubaNet, Martí Noticias"}], "desenlace": "La amenaza ocurrió en el mismo periodo en que el discurso oficial calificaba territorios extranjeros, incluido Miami, como \"objetivo legítimo\" ante una eventual agresión militar.", "confianza_global": "corroborada"}, {"id": "cuesta_morua", "nombre": "Manuel Cuesta Morúa", "resumen": "Opositor detenido de forma incomunicada tras una citación policial el 19-20 de junio de 2026; ya liberado, denunció golpes, amenazas de muerte y haber sido abandonado en una provincia distante sin documentos.", "hechos": [{"afirmacion": "Detenido de forma incomunicada tras una citación policial, el 19-20 de junio de 2026.", "confianza": "corroborada", "fuente": "EFE, CiberCuba"}, {"afirmacion": "Tras su liberación, denunció golpes, amenazas de muerte y haber sido abandonado en una provincia distante sin documentos.", "confianza": "corroborada", "fuente": "Diario de Cuba, 14ymedio, Infobae"}], "desenlace": "Fue liberado tras aproximadamente tres días de detención.", "confianza_global": "corroborada"}, {"id": "otero_alcantara", "nombre": "Luis Manuel Otero Alcántara", "resumen": "El hábeas corpus presentado a su favor fue denegado y obstaculizado repetidamente por tribunales en Artemisa y La Habana; la resolución final llegó una semana después de que ya estuviera fuera de Cuba.", "hechos": [{"afirmacion": "El Tribunal Provincial de Artemisa denegó el recurso de hábeas corpus.", "confianza": "corroborada", "fuente": "Cubalex, CiberCuba"}, {"afirmacion": "El mismo tribunal se negó después a recibir la apelación, dejándola fuera de término.", "confianza": "corroborada", "fuente": "Cubalex"}, {"afirmacion": "El 13 de julio de 2026 se presentó un nuevo recurso; el plazo legal de 72 horas venció sin respuesta, con el paradero del recurrente desconocido.", "confianza": "corroborada", "fuente": "Cubalex, Martí Noticias"}, {"afirmacion": "Salió de Cuba el 18 de julio de 2026; la resolución final, \"sin lugar\", llegó una semana después.", "confianza": "corroborada", "fuente": "CiberCuba, NPR, 14ymedio"}], "actos": [{"paso": 1, "fecha": "primavera de 2026", "resultado": "El Tribunal Provincial de Artemisa deniega el recurso de hábeas corpus."}, {"paso": 2, "fecha": "posterior", "resultado": "El mismo tribunal se niega a recibir la apelación: \"el funcionario no está, vuelva mañana\"."}, {"paso": 3, "fecha": "10 de julio de 2026", "resultado": "No puede presentarse un nuevo recurso en La Habana: el Tribunal Provincial y el Supremo permanecen cerrados en día laborable."}, {"paso": 4, "fecha": "13 de julio de 2026", "resultado": "Presentado el recurso, el plazo de 72 horas vence sin respuesta; el caso se lleva ante el Comité de la ONU contra la Desaparición Forzada."}, {"paso": 5, "fecha": "en torno al 25 de julio de 2026", "resultado": "Llega la resolución final, \"sin lugar\", cuando Otero Alcántara ya está fuera de Cuba."}], "desenlace": "El propio informe documenta un patrón similar en el caso de \"Galindo\", detenido por los sucesos de la lancha del 25 de febrero de 2026, cuyo hábeas corpus tampoco fue recibido por el tribunal de Camagüey, mientras un hábeas corpus a favor de dos jóvenes detenidos en Holguín, en el mismo periodo, sí fue admitido y tramitado.", "confianza_global": "corroborada"}], "evaluacion_juridica": {"requisitos": [{"nombre": "Proclamación oficial", "cumplido": false, "descripcion": "No hay proclamación oficial: las medidas se aplican mientras el propio Estado niega la existencia de un estado de guerra o excepción, pese a que el Consejo de Defensa Nacional aprobó desde enero de 2026 planes para el paso al Estado de Guerra."}, {"nombre": "Límite temporal", "cumplido": false, "descripcion": "Ninguna disposición fija cuándo terminan las medidas; la Resolución 6/2026 del MININT, que permite congelar cuentas bancarias sin aviso previo, no tiene límite temporal."}, {"nombre": "Necesidad y proporcionalidad", "cumplido": false, "descripcion": "Se restringe la circulación, el patrimonio y la protesta de toda la población frente a una amenaza cuya evaluación el Estado mantiene en secreto."}, {"nombre": "Notificación internacional", "cumplido": false, "descripcion": "El Estado no ha comunicado a ningún órgano de tratados internacionales la suspensión de derechos que aplica en la práctica."}, {"nombre": "Control judicial efectivo", "cumplido": false, "descripcion": "Los hábeas corpus denegados o no tramitados (caso Otero Alcántara y caso \"Galindo\") muestran tribunales que no ejercen control independiente sobre las medidas."}], "nota": "Los cinco requisitos corresponden a los estándares del derecho internacional de los derechos humanos para cualquier estado de excepción legítimo (Corte Interamericana de Derechos Humanos, Opiniones Consultivas OC-8/87 y OC-9/87; Caso Zambrano Vélez y otros vs. Ecuador, 2007). Es la evaluación jurídica de Cubalex, aplicada sobre hechos verificados de forma independiente por este expediente: la sesión del Consejo de Defensa Nacional, la Resolución 6/2026 y las denegaciones de hábeas corpus documentadas."}, "verificacion": {"total_evaluadas": 11, "corroboradas": 9, "no_confirmadas": 2, "excluidas": 0, "nota": "Se evaluaron 11 afirmaciones del informe original: la sesión del Consejo de Defensa Nacional y su desmentido, la Resolución 6/2026, la campaña \"Mi Firma por la Patria\", la restricción de viajes interprovinciales y los cinco casos individuales documentados quedaron corroborados por fuentes independientes de Cubalex. Las dos series numéricas agregadas (eventos mensuales y protestas mensuales) son la métrica interna del propio monitoreo de Cubalex, sin réplica exacta en otro observatorio; la serie de protestas, en particular, diverge de las cifras del Observatorio Cubano de Conflictos (OCC) para los mismos meses. Se presentan igualmente, marcadas de forma visible como \"según Cubalex\", nunca como corroboradas por una segunda fuente."}, "encuesta": {"preguntas": [{"id": "excepcion", "texto": "Cuba aplica restricciones propias de un estado de excepción sin haberlo declarado formalmente. ¿Qué te parece más grave?", "opciones": ["Que se apliquen sin control judicial", "Que ninguna medida tenga fecha de fin", "Que el Estado niegue en público lo que hace en privado"]}, {"id": "tribunal_militar", "texto": "Un civil, el humorista Eduardo Ceballos, enfrenta cargos de espionaje ante un tribunal militar por un video satírico. ¿Te parece un caso aislado o el inicio de una práctica sistemática?", "opciones": ["Un caso aislado y extremo", "El inicio de una práctica que se generalizará", "No tengo información suficiente para opinar"]}, {"id": "cifras", "texto": "Las series mensuales de este expediente provienen solo del monitoreo propio de Cubalex, sin réplica exacta de otro observatorio. ¿Qué deberíamos hacer con esas cifras?", "opciones": ["Publicarlas igual, marcadas como \"según Cubalex\"", "Esperar una segunda fuente antes de publicarlas", "Publicar solo la tendencia cualitativa, sin las cifras exactas"]}]}, "referencias": [{"fuente": "Cubalex", "detalle": "Informe especial \"Cuba: militarización social y excepcionalidad de facto\", febrero-julio 2026, corte de datos 25 de julio de 2026", "fecha": "agosto de 2026"}, {"fuente": "Presidencia de Cuba / Granma / Cubadebate", "detalle": "Cobertura oficial de la sesión del Consejo de Defensa Nacional del 17 de enero de 2026", "fecha": "enero de 2026"}, {"fuente": "CiberCuba", "detalle": "Cobertura del desmentido de enero, la Resolución 6/2026, el caso Cuesta Morúa y el caso Otero Alcántara", "fecha": "2026"}, {"fuente": "Martí Noticias", "detalle": "Cobertura de amenazas contra presos políticos (Verdecia, García Lorenzo) y del caso Ceballos", "fecha": "2026"}, {"fuente": "CubaNet", "detalle": "Cobertura de amenazas contra presos políticos y del caso Ceballos", "fecha": "2026"}, {"fuente": "Diario de Cuba", "detalle": "Cobertura de protestas y represión en La Habana y Santiago de Cuba, y del caso Cuesta Morúa", "fecha": "2026"}, {"fuente": "14ymedio", "detalle": "Cobertura de la militarización de Regla, Guanabacoa y Centro Habana", "fecha": "junio de 2026"}, {"fuente": "Gaceta Oficial de la República de Cuba", "detalle": "Resolución 6/2026 del Ministerio del Interior, No. 65, 18 de mayo de 2026", "fecha": "mayo de 2026"}, {"fuente": "Observatorio Cubano de Conflictos (OCC)", "detalle": "Informes mensuales de mayo y junio de 2026, usados como fuente de contraste para la serie de protestas de Cubalex", "fecha": "2026"}, {"fuente": "Corte Interamericana de Derechos Humanos", "detalle": "Opiniones Consultivas OC-8/87 y OC-9/87; Caso Zambrano Vélez y otros vs. Ecuador (2007), estándar jurídico aplicado en la evaluación", "fecha": "1987 y 2007"}, {"fuente": "EFE", "detalle": "Cobertura de la detención de Manuel Cuesta Morúa", "fecha": "junio de 2026"}], "metodologia": {"fuentes": [{"nombre": "Cubalex", "tipo": "informe especial / monitoreo propio", "url": "https://cubalex.org"}, {"nombre": "Observatorio Cubano de Conflictos (OCC)", "tipo": "informes mensuales de contraste", "url": ""}, {"nombre": "Prensa independiente cubana (CiberCuba, 14ymedio, Diario de Cuba, Martí Noticias, CubaNet)", "tipo": "cobertura periodística", "url": ""}, {"nombre": "Gaceta Oficial de la República de Cuba", "tipo": "publicación oficial", "url": ""}], "periodo": "febrero-julio 2026 (corte de datos del informe original: 25 de julio de 2026)", "cadencia": "Nivel 2 — creación asistida vía /procesar-inbox; no entra en el ciclo automático de refresco de 8 horas.", "extraccion": "Verificación asistida por LLM (motor agnóstico) sobre el PDF de origen, con un subagente dedicado a corroborar cada afirmación cuantitativa y cualitativa contra fuentes independientes antes de incluirla en el dataset.", "validacion": "ajv contra militarizacion.schema.json · node scripts/bracket-balance.mjs · npm run build", "limitaciones": ["Las series mensuales de eventos y de protestas son la métrica interna de Cubalex; no existe réplica exacta de otro observatorio, y la serie de protestas diverge de las cifras del OCC para los mismos meses.", "El informe no identifica por nombre la mayoría de las provincias que integran sus conteos mensuales, solo los lugares mencionados explícitamente en casos concretos.", "Julio es un mes parcial (hasta el día 24) en todas las series."], "cambios_metodologicos": []}, "conclusion": "Desde el 17 de enero de 2026, Cuba es gobernada por estructuras y facultades propias de un estado de guerra que ningún órgano del Estado ha declarado formalmente. Esa brecha entre lo que se hace y lo que se proclama no es un tecnicismo administrativo: es lo que priva a las personas de toda protección jurídica frente a las medidas que las alcanzan. Un humorista enfrenta un tribunal militar por un video satírico. Presos políticos reciben amenazas de muerte de viva voz. Un artista tuvo que salir del país para que su hábeas corpus, ya inútil, recibiera por fin una respuesta. Los cinco requisitos internacionales para un estado de excepción legítimo —proclamación, límite temporal, proporcionalidad, notificación y control judicial— aparecen, los cinco, incumplidos. Este expediente documenta lo corroborado con su fuente a la vista y marca lo que depende del monitoreo propio de una sola organización como lo que es: una tendencia consistente, no una cifra confirmada dos veces."};

function SecHead({ n, t, d }) {
  return (<div className="mi-sec-head"><span className="mi-sec-num">{n}</span><h2>{t}</h2>{d && <p>{d}</p>}</div>);
}

function Chip({ estado }) {
  const ok = estado === "corroborada";
  return <span className={"mi-chip " + (ok ? "mi-chip-ok" : "mi-chip-no")}>{ok ? "corroborada" : "no confirmada"}</span>;
}

function Hecho({ h }) {
  return (
    <div className="mi-hecho">
      <div className="mi-hecho-top"><Chip estado={h.confianza} /><span className="mi-hecho-fuente">{h.fuente}</span></div>
      <p>{h.afirmacion}</p>
    </div>
  );
}

function CitaOficial({ origen }) {
  return (
    <div className="mi-cita-wrap">
      <div className="mi-cita">
        <span className="mi-cita-eyebrow">EXPLICACIÓN OFICIAL — {origen.cita_oficial.fecha}</span>
        <p className="mi-cita-texto">&ldquo;{origen.cita_oficial.texto}&rdquo;</p>
        <p className="mi-cita-atrib">{origen.cita_oficial.atribucion} · <Chip estado={origen.cita_oficial.confianza} /> <span className="mi-hecho-fuente">{origen.cita_oficial.fuente}</span></p>
      </div>
      <div className="mi-hechos-grid">
        {origen.hechos.map((h, i) => <Hecho h={h} key={i} />)}
      </div>
    </div>
  );
}

/* Rail izquierdo: la espina cronologica es el CONTROL del expediente. Al elegir
   una fase cambia el panel derecho, se resalta su mes en ambas graficas y se
   mueve la lectura del dial. No es una lista decorativa: es la navegacion. */
function RailFases({ fases, sel, onSel }) {
  return (
    <nav className="mi-rail" aria-label="Fases del periodo">
      <span className="mi-rail-linea" aria-hidden="true" />
      {fases.map((f) => (
        <button key={f.id} className={"mi-rail-b" + (sel === f.id ? " on" : "")} onClick={() => onSel(f.id)} aria-current={sel === f.id}>
          <span className="mi-rail-dot" aria-hidden="true" />
          <span className="mi-rail-txt">
            <b>{f.periodo}</b>
            <i>{f.titulo}</i>
          </span>
        </button>
      ))}
    </nav>
  );
}

function PanelFase({ fase, mes }) {
  return (
    <div className="mi-fase-panel">
      <span className="mi-fase-periodo">{fase.periodo}</span>
      <h3>{fase.titulo}</h3>
      <p className="mi-fase-desc">{fase.descripcion}</p>
      <ul className="mi-fase-lista">{fase.hechos_clave.map((h, i) => <li key={i}>{h}</li>)}</ul>
      {mes && (
        <div className="mi-fase-cifras">
          <div><b>{mes.eventos}</b><span>eventos</span></div>
          <div><b>{mes.represion}</b><span>de ellos, represión</span></div>
          <div><b>{mes.pct_represion}%</b><span>proporción</span></div>
          <div><b>{mes.victimas}</b><span>víctimas</span></div>
          <div><b>{mes.provincias}</b><span>provincias</span></div>
        </div>
      )}
    </div>
  );
}

function TipEventos({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="mi-tip">
      <div className="mi-tip-h">{d.mes}</div>
      <div className="mi-tip-r"><span>Eventos totales</span><b>{d.eventos}</b></div>
      <div className="mi-tip-r"><span>Represión directa</span><b>{d.represion}</b></div>
      <div className="mi-tip-r"><span>Proporción</span><b>{d.pct_represion}%</b></div>
      <div className="mi-tip-r"><span>Víctimas</span><b>{d.victimas}</b></div>
      <div className="mi-tip-r"><span>Provincias</span><b>{d.provincias}</b></div>
      <div className="mi-tip-f">según Cubalex · sin réplica independiente</div>
    </div>
  );
}

function TipProtestas({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="mi-tip">
      <div className="mi-tip-h">{d.mes}{d.parcial ? " (parcial)" : ""}</div>
      <div className="mi-tip-r"><span>Protestas</span><b>{d.valor}</b></div>
      {d.parcial && <div className="mi-tip-f">mes parcial: hasta el día 24</div>}
      {!d.parcial && <div className="mi-tip-f">según Cubalex · diverge del OCC</div>}
    </div>
  );
}

function GraficaEventos({ serie, mesSel }) {
  return (
    <div className="mi-chart-card">
      <div className="mi-chart-h">Eventos por mes, y cuántos son represión directa</div>
      <div className="mi-chart-sub">Barra clara: eventos totales. Barra intensa: los que son represión directa. Pasa el cursor por cualquier mes.</div>
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={serie} margin={{ top: 8, right: 10, left: -14, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(237,231,242,.06)" vertical={false} />
          <XAxis dataKey="mes" tick={{ fill: "#948BA3", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#948BA3", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<TipEventos />} cursor={{ fill: "rgba(237,231,242,.05)" }} />
          <Bar dataKey="eventos" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {serie.map((d, i) => <Cell key={i} fill={C.primario} opacity={mesSel && d.mes === mesSel ? 1 : 0.55} />)}
          </Bar>
          <Bar dataKey="represion" radius={[4, 4, 0, 0]} maxBarSize={26}>
            {serie.map((d, i) => <Cell key={i} fill={C.contrapunto} opacity={mesSel && d.mes === mesSel ? 1 : 0.75} />)}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function GraficaProtestas({ serie, mesSel }) {
  return (
    <div className="mi-chart-card">
      <div className="mi-chart-h">Protestas por mes · enero-julio 2026</div>
      <div className="mi-chart-sub">Serie propia de Cubalex. El punto hueco de julio marca un mes parcial (hasta el día 24).</div>
      <ResponsiveContainer width="100%" height={210}>
        <LineChart data={serie} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(237,231,242,.06)" vertical={false} />
          <XAxis dataKey="mes" tick={{ fill: "#948BA3", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#948BA3", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<TipProtestas />} cursor={{ stroke: "rgba(237,231,242,.12)" }} />
          <Line
            type="monotone" dataKey="valor" stroke={C.contrapunto} strokeWidth={2.4}
            dot={(props) => {
              const { cx, cy, payload, index } = props;
              const on = mesSel && payload.mes === mesSel;
              return (
                <circle key={index} cx={cx} cy={cy} r={on ? 6 : payload.parcial ? 5 : 3.6}
                  fill={payload.parcial ? C.bg : C.contrapunto} stroke={C.contrapunto} strokeWidth={payload.parcial ? 2 : 0} />
              );
            }}
            activeDot={{ r: 7, fill: C.contrapunto }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="mi-linea-nota">El Observatorio Cubano de Conflictos reporta cifras muy distintas para los mismos meses; ver la nota de divergencia más abajo.</p>
    </div>
  );
}

/* Dial de riesgo. La aguja NO es decorativa: lee el mes que gobierna el panel
   (o el que se sobrevuela en el rastro). Los meses que Cubalex no cuantifica
   (febrero, marzo) no se rellenan con un valor por defecto: la aguja se retira
   a una posicion fantasma punteada y la lectura dice "sin cuantificar". */
function DialRiesgo({ riesgo, mesSel, onSel }) {
  const R = 108, CX = 130, CY = 128;
  const [hovMes, setHovMes] = useState(null);
  const mesLeido = hovMes || (mesSel ? mesSel.split(" ")[0] : null);
  const entrada = riesgo.historial.find((h) => h.mes === mesLeido) || null;
  const nivel = entrada ? entrada.nivel : riesgo.nivel_actual;
  const sinCuantificar = entrada != null && entrada.nivel == null;

  const angFor = (n) => Math.PI - ((n - 1) / (riesgo.escala_max - 1)) * Math.PI;
  const pt = (n, r = R) => ({ x: CX + r * Math.cos(angFor(n)), y: CY - r * Math.sin(angFor(n)) });
  const arcPath = (from, to, r = R) => {
    const a = pt(from, r), b = pt(to, r);
    return `M ${a.x} ${a.y} A ${r} ${r} 0 0 1 ${b.x} ${b.y}`;
  };
  // Sin dato: la aguja se planta en el centro del arco, punteada, sin afirmar nivel.
  const nivelAguja = sinCuantificar ? (1 + riesgo.escala_max) / 2 : (nivel || riesgo.nivel_actual);
  const needle = pt(nivelAguja, R * 0.82);
  const ticks = [1, 2, 3, 4, 5];
  const etiqueta = sinCuantificar
    ? `${entrada.mes}: nivel sin cuantificar por la fuente`
    : `${entrada ? entrada.mes + ": " : ""}nivel ${nivel} de ${riesgo.escala_max}`;

  return (
    <div className="mi-dial-wrap">
      <svg viewBox="0 0 260 150" className="mi-dial-svg" role="img" aria-label={etiqueta}>
        <path d={arcPath(1, 5)} className="mi-dial-arc-bg" />
        {!sinCuantificar && nivel >= 5 && <path d={arcPath(4.3, 5)} className="mi-dial-arc-hot" />}
        {ticks.map((t) => {
          const p1 = pt(t, R + 6), p2 = pt(t, R - 6), lbl = pt(t, R - 22);
          return (
            <g key={t}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="mi-dial-tick" />
              <text x={lbl.x} y={lbl.y + 4} textAnchor="middle" className={"mi-dial-ticklabel" + (!sinCuantificar && t === nivel ? " on" : "")}>{t}</text>
            </g>
          );
        })}
        <line x1={CX} y1={CY} x2={needle.x} y2={needle.y}
              className={"mi-dial-needle" + (sinCuantificar ? " mi-dial-needle-off" : "")} />
        <circle cx={CX} cy={CY} r={7} className="mi-dial-hub" />
        {!sinCuantificar && (
          <g transform={`translate(${needle.x},${needle.y})`}>
            <rect x={-6} y={-6} width={12} height={12} className="mi-dial-pin-box" transform="rotate(45)" />
          </g>
        )}
        {sinCuantificar && <text x={CX} y={CY - 42} textAnchor="middle" className="mi-dial-sindato">sin cuantificar</text>}
      </svg>
      <div className="mi-dial-caption">
        <b>{sinCuantificar ? "—" : `${nivel}/${riesgo.escala_max}`}</b>
        <span>
          {sinCuantificar
            ? `${entrada.mes}: la fuente no publica nivel`
            : entrada
              ? `${entrada.mes} · ${entrada.fase}`
              : `clavado desde ${riesgo.desde}`}
        </span>
      </div>
      <div className="mi-dial-trail" onMouseLeave={() => setHovMes(null)}>
        {riesgo.historial.map((h, i) => {
          const on = mesLeido === h.mes;
          return (
            <button
              className={"mi-dial-trail-item" + (h.nivel != null ? " mi-dial-trail-pinned" : "") + (on ? " mi-dial-trail-on" : "")}
              key={h.mes}
              onClick={() => onSel && onSel(h.mes)}
              onMouseEnter={() => setHovMes(h.mes)}
              onFocus={() => setHovMes(h.mes)}
              title={h.fase}
            >
              {i > 0 && <span className={"mi-dial-trail-conn" + (h.nivel != null && riesgo.historial[i - 1].nivel != null ? " mi-dial-trail-conn-solid" : "")} />}
              <span className="mi-dial-trail-dot" />
              <span className="mi-dial-trail-mes">{h.mes}</span>
              <span className="mi-dial-trail-val">{h.nivel != null ? h.nivel + "/5" : "sin cuantificar"}</span>
            </button>
          );
        })}
      </div>
      <p className="mi-dial-nota">{riesgo.nota}</p>
    </div>
  );
}

/* Small multiples de cobertura. El informe fuente NO nombra las provincias de
   sus conteos mensuales (solo cuantas son), asi que la silueta se rellena por
   proporcion y jamas se pinta una provincia concreta: seria inventar el reparto.
   Es clicable para sincronizar el mes con el resto del panel. */
function MapaCobertura({ serie, mesSel, onSel }) {
  const cubaPath = useMemo(() => {
    const proj = d3.geoMercator().fitExtent([[4, 4], [76, 52]], CUBA_FEATURE);
    return d3.geoPath(proj)(CUBA_FEATURE);
  }, []);
  return (
    <div className="mi-cobertura">
      {serie.map((m) => {
        const on = mesSel === m.mes;
        return (
          <button className={"mi-cob-item" + (on ? " on" : "")} key={m.mes} onClick={() => onSel(m.mes)}
                  title={`${m.mes}: ${m.provincias} de 15 provincias con eventos registrados`}>
            <svg viewBox="0 0 80 56" className="mi-cob-svg" role="img" aria-label={`${m.mes}: ${m.provincias} de 15 provincias con eventos registrados`}>
              <path d={cubaPath} className="mi-cob-outline" />
              <path d={cubaPath} className="mi-cob-fill" style={{ fillOpacity: m.provincias / 15 }} />
            </svg>
            <div className="mi-cob-badge">{m.provincias}<span>/15</span></div>
            <div className="mi-cob-mes">{m.mes.split(" ")[0]}</div>
          </button>
        );
      })}
      <p className="mi-cob-nota">
        La silueta se rellena en proporción al número de provincias, no por provincia
        concreta: el informe dice cuántas fueron, nunca cuáles.
      </p>
    </div>
  );
}

function GaleriaCasos({ casos }) {
  return (
    <div className="mi-casos-grid">
      {casos.map((c) => (
        <div className="mi-caso" key={c.id}>
          <div className="mi-caso-head">
            <h3>{c.nombre}</h3>
            {c.alias && <span className="mi-caso-alias">{c.alias}</span>}
          </div>
          <p className="mi-caso-resumen">{c.resumen}</p>
          <div className="mi-caso-hechos">
            {c.hechos.map((h, i) => <Hecho h={h} key={i} />)}
          </div>
          {c.actos && (
            <ol className="mi-caso-actos">
              {c.actos.map((a) => (
                <li key={a.paso}><b>{a.paso}.</b> <span className="mi-caso-actos-fecha">{a.fecha}</span> — {a.resultado}</li>
              ))}
            </ol>
          )}
          <p className="mi-caso-desenlace">{c.desenlace}</p>
        </div>
      ))}
    </div>
  );
}

function ChecklistJuridico({ evaluacion }) {
  return (
    <div className="mi-checklist-wrap">
      <div className="mi-checklist">
        {evaluacion.requisitos.map((r) => (
          <div className="mi-req" key={r.nombre}>
            <span className="mi-req-stamp">NO CUMPLE</span>
            <div>
              <h4>{r.nombre}</h4>
              <p>{r.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mi-checklist-nota">{evaluacion.nota}</p>
    </div>
  );
}

function Encuesta({ datos }) {
  const CLAVE = "yamacoa_militarizacion_votos";
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
      sb.rpc("militarizacion_totales").then(({ data }) => { if (data) setVotos((v) => ({ ...v, ...data })); }).catch(() => {});
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
    if (sb && sb.rpc) sb.rpc("militarizacion_votar", { p_pregunta: pid, p_opcion: opcion }).catch(() => {});
  };
  return (
    <div className="mi-encuesta">
      {datos.preguntas.map((q) => {
        const conteo = votos[q.id] || {};
        const total = Object.values(conteo).reduce((a, b) => a + b, 0);
        const votado = miVoto[q.id] != null;
        return (
          <div className="mi-pregunta" key={q.id}>
            <p>{q.texto}</p>
            {q.opciones.map((op) => {
              const n = conteo[op] || 0;
              const pct = total ? Math.round((n / total) * 100) : 0;
              const elegida = miVoto[q.id] === op;
              return (
                <button key={op} className="mi-opcion" disabled={votado} onClick={() => votar(q.id, op)}>
                  <span className="mi-opcion-fill" style={{ width: votado ? pct + "%" : 0, background: elegida ? "rgba(77,64,104,.45)" : "rgba(148,139,163,.16)" }} />
                  <span className="mi-opcion-txt"><span>{elegida ? "✓ " : ""}{op}</span>{votado && <span>{pct}%</span>}</span>
                </button>
              );
            })}
            <p className="mi-pregunta-total">{total} voto{total === 1 ? "" : "s"}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(EMBEDDED);
  const [faseSel, setFaseSel] = useState(EMBEDDED.fases[0].id);

  useEffect(() => {
    const id = "mi-fonts";
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

  // La fase elegida gobierna el panel, las graficas, el dial y el mapa.
  const fase = data.fases.find((f) => f.id === faseSel) || data.fases[0];
  const mesSel = useMemo(() => {
    if (!fase) return null;
    const per = fase.periodo.toLowerCase();
    const hit = data.cifras.serie_mensual.find((x) => per.indexOf(x.mes.split(" ")[0].toLowerCase()) !== -1);
    return hit ? hit.mes : null;
  }, [fase, data.cifras.serie_mensual]);
  const mesActivo = data.cifras.serie_mensual.find((x) => x.mes === mesSel) || null;

  return (
    <div className="mi-root">
      <style>{CSS}</style>

      <header className="mi-hero">
        <span className="mi-eyebrow">EXCEPCIONALIDAD DE FACTO · CUBALEX, FEB-JUL 2026</span>
        <h1>{m.titulo}</h1>
        <p className="mi-subtitulo">{m.subtitulo}</p>
        <div className="mi-advertencia">⚠ {m.advertencia}</div>
      </header>

      <main className="mi-main">
        <section>
          <SecHead n="00" t="Un país, dos niveles de evidencia" />
          {data.intro.parrafos.map((p, i) => <p className="mi-parrafo" key={i}>{p}</p>)}
        </section>

        <section>
          <SecHead n="01" t={`El origen: ${data.origen.fecha}`} d="El propio Estado enunció los requisitos formales de un estado de excepción para negar que existiera, mientras activaba las estructuras propias de uno." />
          <CitaOficial origen={data.origen} />
        </section>

        <section>
          <SecHead n="02" t="Recorrer el periodo por fases" d="Elige una fase en el raíl: el panel, las dos gráficas, el dial y el mapa de cobertura se sincronizan con su mes." />
          <div className="mi-estudio">
            <RailFases fases={data.fases} sel={faseSel} onSel={setFaseSel} />
            <div className="mi-estudio-panel">
              <PanelFase fase={fase} mes={mesActivo} />
              <GraficaEventos serie={data.cifras.serie_mensual} mesSel={mesSel} />
              <GraficaProtestas serie={data.cifras.serie_protestas} mesSel={mesSel ? mesSel.split(" ")[0] : null} />
              <p className="mi-cifras-adv">⚠ {data.cifras.advertencia}</p>
            </div>
          </div>
          <p className="mi-divergencia">{data.cifras.nota_divergencia_occ}</p>
        </section>

        <section>
          <SecHead n="03" t="El dial de riesgo" d="Escala de militarización social de Cubalex, de 1 a 5. Toca cualquier mes del rastro para llevarlo al resto del panel." />
          <DialRiesgo riesgo={data.riesgo} mesSel={mesSel} onSel={(mes) => {
            const f = data.fases.find((x) => x.periodo.toLowerCase().indexOf(mes.toLowerCase()) !== -1);
            if (f) setFaseSel(f.id);
          }} />
        </section>

        <section>
          <SecHead n="04" t="Geografía: de la dispersión a La Habana" d={data.geografia.nota} />
          <MapaCobertura serie={data.cifras.serie_mensual} mesSel={mesSel} onSel={(mes) => {
            const idx = data.cifras.serie_mensual.findIndex((x) => x.mes === mes);
            if (idx >= 0 && data.fases[Math.min(idx, data.fases.length - 1)]) {
              const nombre = mes.split(" ")[0].toLowerCase();
              const f = data.fases.find((x) => x.periodo.toLowerCase().indexOf(nombre) !== -1);
              if (f) setFaseSel(f.id);
            }
          }} />
          <p className="mi-geo-pct"><b>{data.geografia.pct_habana_jun_jul}%</b> de los eventos de junio y julio se concentraron en La Habana.</p>
          <ul className="mi-geo-lugares">
            {data.geografia.lugares_identificados.map((l, i) => (
              <li key={i}><b>{l.lugar}</b> ({l.provincia}) — {l.evento} <span className="mi-hecho-fuente">{l.fecha}, {l.fuente}</span></li>
            ))}
          </ul>
        </section>

        <section>
          <SecHead n="05" t="Casos documentados" d="Cinco casos individuales, verificados de forma independiente, casi siempre distintos del patrón agregado." />
          <GaleriaCasos casos={data.casos} />
        </section>

        <section>
          <SecHead n="06" t="Evaluación jurídica: cinco requisitos, ninguno cumplido" />
          <ChecklistJuridico evaluacion={data.evaluacion_juridica} />
        </section>

        <section>
          <SecHead n="07" t="Cómo se verificó este expediente" d={v.nota} />
          <div className="mi-verif-stats">
            <div><b>{v.total_evaluadas}</b><span>afirmaciones evaluadas</span></div>
            <div><b style={{ color: C.corrob }}>{v.corroboradas}</b><span>corroboradas</span></div>
            <div><b style={{ color: C.noconf }}>{v.no_confirmadas}</b><span>según Cubalex, sin réplica</span></div>
            <div><b>{v.excluidas}</b><span>excluidas</span></div>
          </div>
        </section>

        <section>
          <SecHead n="08" t="Tu lectura" />
          <Encuesta datos={data.encuesta} />
        </section>

        <section>
          <SecHead n="09" t="Referencias" />
          <ul className="mi-referencias">
            {data.referencias.map((r, i) => <li key={i}><b>{r.fuente}</b> — {r.detalle}{r.fecha ? ` (${r.fecha})` : ""}</li>)}
          </ul>
          <p className="mi-conclusion">{data.conclusion}</p>
        </section>
      </main>
    </div>
  );
}

const CSS = `
.mi-root{ background:${C.bg}; color:${C.paper}; font-family:'Archivo',system-ui,sans-serif; min-height:100vh; }
.mi-root *{ box-sizing:border-box; }
.mi-hero{ padding:48px 20px 28px; max-width:920px; margin:0 auto; }
.mi-eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.14em; color:${C.contrapunto}; }
.mi-hero h1{ font-size:clamp(28px,5vw,46px); margin:10px 0 8px; line-height:1.08; }
.mi-subtitulo{ color:${C.dim}; font-size:16px; max-width:700px; line-height:1.55; }
.mi-advertencia{ margin-top:18px; background:${C.panel}; border:1px solid ${C.primario}; border-radius:8px; padding:12px 16px; font-size:13.5px; line-height:1.5; }
.mi-main{ max-width:920px; margin:0 auto; padding:0 20px 80px; }
.mi-main section{ margin-top:56px; }
.mi-sec-head{ margin-bottom:16px; }
.mi-sec-num{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:${C.dim}; letter-spacing:.1em; }
.mi-sec-head h2{ font-size:22px; margin:4px 0 6px; }
.mi-sec-head p{ color:${C.dim}; font-size:13.5px; line-height:1.5; margin:0; }
.mi-parrafo{ font-size:15px; line-height:1.65; margin:0 0 14px; }
.mi-chip{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; text-transform:uppercase; letter-spacing:.07em; padding:2px 7px; border-radius:999px; white-space:nowrap; }
.mi-chip-ok{ color:${C.corrob}; border:1px solid ${C.corrob}; }
.mi-chip-no{ color:${C.noconf}; border:1px dashed ${C.noconf}; }
.mi-hechos-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:12px; }
.mi-hecho{ background:${C.panel}; border-radius:8px; padding:12px 16px; }
.mi-hecho-top{ display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap; }
.mi-hecho-fuente{ font-size:11px; color:${C.dim}; }
.mi-hecho p{ font-size:13.5px; line-height:1.5; margin:0; }
.mi-cita-wrap{ display:flex; flex-direction:column; gap:16px; }
.mi-cita{ background:${C.panel2}; border-left:3px solid ${C.contrapunto}; border-radius:0 8px 8px 0; padding:16px 20px; }
.mi-cita-eyebrow{ display:block; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.12em; color:${C.dim}; margin-bottom:8px; }
.mi-cita-texto{ font-family:'IBM Plex Mono',monospace; font-size:15px; line-height:1.55; color:${C.contrapunto}; margin:0 0 8px; }
.mi-cita-atrib{ font-size:12px; color:${C.dim}; margin:0; display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
.mi-estudio{ display:grid; grid-template-columns:minmax(190px,230px) minmax(0,1fr); gap:20px; align-items:start; }
.mi-rail{ position:sticky; top:16px; display:flex; flex-direction:column; gap:2px; padding-left:6px; }
.mi-rail-linea{ position:absolute; left:11px; top:14px; bottom:14px; width:2px; background:${C.line}; }
.mi-rail-b{ position:relative; display:flex; align-items:flex-start; gap:12px; background:none; border:none; padding:9px 8px; border-radius:8px; cursor:pointer; text-align:left; color:${C.dim}; font-family:inherit; transition:background .18s, color .18s; }
.mi-rail-b:hover{ background:${C.panel}; color:${C.paper}; }
.mi-rail-b.on{ background:${C.panel}; color:${C.paper}; }
.mi-rail-dot{ width:11px; height:11px; border-radius:50%; background:${C.panel2}; border:2px solid ${C.dim}; flex-shrink:0; margin-top:3px; z-index:1; transition:background .18s, border-color .18s, transform .18s; }
.mi-rail-b.on .mi-rail-dot{ background:${C.contrapunto}; border-color:${C.contrapunto}; transform:scale(1.2); }
.mi-rail-txt{ display:flex; flex-direction:column; gap:2px; }
.mi-rail-txt b{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:.05em; color:${C.contrapunto}; font-weight:500; }
.mi-rail-txt i{ font-style:normal; font-size:13px; line-height:1.3; }
.mi-estudio-panel{ display:flex; flex-direction:column; gap:16px; min-width:0; }
.mi-fase-panel{ background:${C.panel}; border-radius:10px; padding:18px; border-left:3px solid ${C.contrapunto}; }
.mi-fase-periodo{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:${C.contrapunto}; letter-spacing:.08em; }
.mi-fase-panel h3{ font-size:19px; margin:5px 0 8px; }
.mi-fase-desc{ font-size:13.5px; line-height:1.6; color:${C.paper}; margin:0 0 10px; }
.mi-fase-lista{ margin:0 0 14px; padding-left:16px; }
.mi-fase-lista li{ font-size:12.5px; line-height:1.55; color:${C.dim}; margin-bottom:4px; }
.mi-fase-cifras{ display:grid; grid-template-columns:repeat(auto-fit,minmax(88px,1fr)); gap:10px; border-top:1px solid ${C.line}; padding-top:12px; }
.mi-fase-cifras div{ text-align:center; }
.mi-fase-cifras b{ display:block; font-family:'IBM Plex Mono',monospace; font-size:19px; color:${C.contrapunto}; }
.mi-fase-cifras span{ font-size:9.5px; color:${C.dim}; text-transform:uppercase; letter-spacing:.04em; }
.mi-chart-card{ background:${C.panel}; border-radius:10px; padding:16px 14px 10px; }
.mi-chart-h{ font-size:14px; font-weight:600; margin-bottom:3px; padding-left:4px; }
.mi-chart-sub{ font-size:11.5px; color:${C.dim}; margin-bottom:10px; line-height:1.45; padding-left:4px; }
.mi-tip{ background:${C.panel2}; border:1px solid ${C.line}; border-radius:8px; padding:10px 12px; box-shadow:0 6px 22px rgba(0,0,0,.45); }
.mi-tip-h{ font-size:12.5px; font-weight:700; margin-bottom:6px; }
.mi-tip-r{ display:flex; justify-content:space-between; gap:18px; font-size:11.5px; color:${C.dim}; margin-bottom:2px; }
.mi-tip-r b{ color:${C.paper}; font-family:'IBM Plex Mono',monospace; }
.mi-tip-f{ font-size:10px; color:${C.dim}; margin-top:6px; border-top:1px solid ${C.line}; padding-top:5px; font-style:italic; }
.mi-cifras-adv{ font-size:11.5px; color:${C.dim}; line-height:1.55; background:${C.panel2}; border-radius:8px; padding:10px 14px; margin:0; }
.mi-linea-nota{ font-size:11px; color:${C.dim}; margin:6px 0 0; padding-left:4px; }
.mi-divergencia{ font-size:12.5px; line-height:1.55; color:${C.dim}; background:${C.panel2}; border-radius:8px; padding:12px 16px; margin-top:12px; }
.mi-dial-wrap{ display:flex; flex-direction:column; align-items:center; background:${C.panel}; border-radius:10px; padding:22px 18px; }
.mi-dial-svg{ width:100%; max-width:340px; height:auto; }
.mi-dial-arc-bg{ fill:none; stroke:${C.panel2}; stroke-width:10; stroke-linecap:round; }
.mi-dial-arc-hot{ fill:none; stroke:${C.contrapunto}; stroke-width:10; stroke-linecap:round; filter:drop-shadow(0 0 6px rgba(199,190,174,.55)); }
.mi-dial-tick{ stroke:${C.dim}; stroke-width:1.5; }
.mi-dial-ticklabel{ font-family:'IBM Plex Mono',monospace; font-size:9px; fill:${C.dim}; transition:fill .25s, font-size .25s; }
.mi-dial-ticklabel.on{ fill:${C.contrapunto}; font-size:12px; font-weight:600; }
.mi-dial-needle{ stroke:${C.contrapunto}; stroke-width:3; stroke-linecap:round; transition:x2 .5s cubic-bezier(.34,1.3,.5,1), y2 .5s cubic-bezier(.34,1.3,.5,1); }
.mi-dial-needle-off{ stroke:${C.dim}; stroke-width:2; stroke-dasharray:4 5; opacity:.65; }
.mi-dial-sindato{ font-family:'IBM Plex Mono',monospace; font-size:11px; fill:${C.dim}; letter-spacing:.06em; }
.mi-dial-caption b{ transition:color .25s; }
.mi-dial-hub{ fill:${C.primario}; stroke:${C.contrapunto}; stroke-width:1.5; }
.mi-dial-pin-box{ fill:none; stroke:${C.contrapunto}; stroke-width:1.5; }
.mi-dial-caption{ display:flex; flex-direction:column; align-items:center; margin-top:-6px; }
.mi-dial-caption b{ font-family:'IBM Plex Mono',monospace; font-size:28px; }
.mi-dial-caption span{ font-size:11px; color:${C.dim}; text-transform:uppercase; letter-spacing:.08em; }
.mi-dial-trail{ display:flex; align-items:flex-end; gap:0; margin-top:20px; width:100%; max-width:520px; }
.mi-dial-trail-item{ position:relative; display:flex; flex-direction:column; align-items:center; flex:1; background:none; border:none; padding:6px 2px; cursor:pointer; font-family:inherit; border-radius:8px; transition:background .18s; }
.mi-dial-trail-item:hover{ background:${C.panel2}; }
.mi-dial-trail-on{ background:${C.panel2}; }
.mi-dial-trail-on .mi-dial-trail-dot{ transform:scale(1.4); }
.mi-dial-trail-on .mi-dial-trail-mes{ color:${C.contrapunto}; }
.mi-dial-fase{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:${C.contrapunto}; margin-top:12px; text-align:center; }
.mi-dial-trail-conn{ position:absolute; top:5px; right:50%; width:100%; height:2px; background:${C.dim}; opacity:.4; border-top:2px dashed ${C.dim}; background:none; }
.mi-dial-trail-conn-solid{ border-top:2px solid ${C.contrapunto}; opacity:1; }
.mi-dial-trail-dot{ width:11px; height:11px; border-radius:50%; background:${C.panel2}; border:2px solid ${C.dim}; z-index:1; }
.mi-dial-trail-pinned .mi-dial-trail-dot{ background:${C.contrapunto}; border-color:${C.contrapunto}; }
.mi-dial-trail-mes{ font-family:'IBM Plex Mono',monospace; font-size:10px; color:${C.dim}; margin-top:6px; }
.mi-dial-trail-val{ font-size:9.5px; color:${C.paper}; margin-top:2px; text-align:center; }
.mi-dial-nota{ font-size:11.5px; color:${C.dim}; line-height:1.5; margin-top:16px; text-align:center; max-width:560px; }
.mi-cobertura{ display:flex; gap:12px; flex-wrap:wrap; background:${C.panel}; border-radius:10px; padding:18px; align-items:flex-start; }
.mi-cob-item{ display:flex; flex-direction:column; align-items:center; flex:1; min-width:70px; background:none; border:1px solid transparent; border-radius:10px; padding:8px 4px; cursor:pointer; font-family:inherit; color:inherit; transition:background .18s, border-color .18s; }
.mi-cob-item:hover{ background:${C.panel2}; }
.mi-cob-item.on{ background:${C.panel2}; border-color:${C.contrapunto}; }
.mi-cob-nota{ flex:1 0 100%; font-size:11.5px; color:${C.dim}; line-height:1.55; margin:6px 0 0; }
.mi-cob-svg{ width:64px; height:auto; }
.mi-cob-outline{ fill:none; stroke:${C.dim}; stroke-width:.6; opacity:.5; }
.mi-cob-fill{ stroke:none; fill:${C.contrapunto}; }
.mi-cob-badge{ font-family:'IBM Plex Mono',monospace; font-size:13px; margin-top:4px; }
.mi-cob-badge span{ color:${C.dim}; font-size:10px; }
.mi-cob-mes{ font-size:10.5px; color:${C.dim}; margin-top:2px; }
.mi-geo-pct{ font-size:14px; margin:14px 0; }
.mi-geo-pct b{ font-family:'IBM Plex Mono',monospace; color:${C.contrapunto}; font-size:18px; }
.mi-geo-lugares{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
.mi-geo-lugares li{ font-size:13px; color:${C.paper}; line-height:1.5; background:${C.panel}; border-radius:6px; padding:8px 12px; }
.mi-casos-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:14px; }
.mi-caso{ background:${C.panel}; border-radius:10px; padding:16px 18px; display:flex; flex-direction:column; gap:10px; }
.mi-caso-head{ display:flex; align-items:baseline; gap:8px; flex-wrap:wrap; }
.mi-caso-head h3{ font-size:16px; margin:0; }
.mi-caso-alias{ font-size:11px; color:${C.dim}; font-family:'IBM Plex Mono',monospace; }
.mi-caso-resumen{ font-size:13px; line-height:1.55; color:${C.paper}; margin:0; }
.mi-caso-hechos{ display:flex; flex-direction:column; gap:8px; }
.mi-caso-actos{ margin:0; padding-left:18px; display:flex; flex-direction:column; gap:6px; background:${C.panel2}; border-radius:6px; padding:10px 14px 10px 30px; }
.mi-caso-actos li{ font-size:12px; line-height:1.5; color:${C.paper}; }
.mi-caso-actos-fecha{ color:${C.contrapunto}; font-family:'IBM Plex Mono',monospace; font-size:11px; }
.mi-caso-desenlace{ font-size:12.5px; color:${C.dim}; line-height:1.5; margin:0; font-style:italic; }
.mi-checklist-wrap{ display:flex; flex-direction:column; gap:14px; }
.mi-checklist{ display:flex; flex-direction:column; gap:10px; }
.mi-req{ display:flex; gap:14px; align-items:flex-start; background:${C.panel}; border-radius:8px; padding:12px 16px; }
.mi-req-stamp{ flex-shrink:0; font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.1em; border:2px solid ${C.contrapunto}; color:${C.contrapunto}; border-radius:3px; padding:4px 8px; transform:rotate(-3deg); white-space:nowrap; }
.mi-req h4{ margin:0 0 4px; font-size:14px; }
.mi-req p{ margin:0; font-size:12.5px; line-height:1.5; color:${C.dim}; }
.mi-checklist-nota{ font-size:11.5px; color:${C.dim}; line-height:1.55; }
.mi-verif-stats{ display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:14px; }
.mi-verif-stats div{ background:${C.panel}; border-radius:8px; padding:14px 16px; text-align:center; }
.mi-verif-stats b{ font-family:'IBM Plex Mono',monospace; font-size:24px; display:block; color:${C.paper}; }
.mi-verif-stats span{ font-size:10.5px; color:${C.dim}; text-transform:uppercase; letter-spacing:.05em; }
.mi-encuesta{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; }
.mi-pregunta{ background:${C.panel}; border:1px solid ${C.line}; border-radius:10px; padding:14px 16px; }
.mi-pregunta p{ font-size:14px; line-height:1.5; margin:0 0 12px; }
.mi-opcion{ display:block; width:100%; text-align:left; margin-bottom:8px; position:relative; overflow:hidden; background:${C.panel2}; color:${C.paper}; border-radius:6px; border:1px solid ${C.line}; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:12.5px; }
.mi-opcion:disabled{ cursor:default; }
.mi-opcion-fill{ position:absolute; inset:0; transition:width .4s; }
.mi-opcion-txt{ position:relative; display:flex; justify-content:space-between; padding:8px 10px; }
.mi-pregunta-total{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:${C.dim}; margin:4px 0 0; }
.mi-referencias{ list-style:none; margin:0 0 20px; padding:0; display:flex; flex-direction:column; gap:8px; }
.mi-referencias li{ font-size:13px; color:${C.dim}; line-height:1.5; }
.mi-referencias b{ color:${C.paper}; }
.mi-conclusion{ font-size:15px; line-height:1.65; border-top:1px solid ${C.line}; padding-top:20px; }
@media (max-width:820px){
  .mi-estudio{ grid-template-columns:1fr; }
  .mi-rail{ position:static; flex-direction:row; overflow-x:auto; padding-left:0; gap:6px; }
  .mi-rail-linea{ display:none; }
  .mi-rail-b{ flex:0 0 auto; flex-direction:column; align-items:flex-start; gap:6px; }
}
@media (max-width:640px){
  .mi-dial-trail{ flex-wrap:wrap; }
}
`;
