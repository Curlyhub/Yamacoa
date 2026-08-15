import { useEffect, useMemo, useRef, useState } from "react";
import { CUBA_PATHS, CUBA_VIEWBOX } from "./electrica_geo";

/* ============================================================================
   YAMACOA · expediente "cerco_julio" — RENDERER CONGELADO
   Campana de represion selectiva contra defensores de derechos humanos en
   Cuba, julio de 2026: el operativo del 2 de julio (tres pistas sincronizadas
   que despues divergen), casos satelite, y un cierre en balanza entre
   muertes bajo custodia y excarcelaciones. Tercer expediente construido
   sobre el mismo informe mensual de Cubalex (los otros dos: "militarizacion"
   y "derechos_sociales"); no repite su contenido ni su mecanismo visual.
   Datos en public/data/cerco_julio.json (validado por cerco_julio.schema.json).
   Paleta "Citacion y Reten": oro-mostaza de convocatoria administrativa +
   azul-pizarra de puesto de control, sobre fondo oscuro.
   Geometria provincial real reutilizada de electrica_geo.js (paths del cuba.svg
   de MapSVG, uno por provincia): coropleta seleccionable. Solo 3 de las 15
   provincias tienen cifra en el informe fuente; el resto queda apagado y
   declarado "sin desglose" (no se inventan datos).
   ========================================================================== */

const C = {
  bg: "#14120C", panel: "#211E16", panel2: "#2A261B",
  line: "rgba(233,228,214,.10)", paper: "#E9E4D6", dim: "#948C78",
  primario: "#D4BD2B", contrapunto: "#4B578B",
  corrob: "#5FAE8F", parcial: "#C9954B", noconf: "#D9A13B",
};
const DATA_URL = ((typeof process !== "undefined" && process.env && process.env.PUBLIC_URL) || "") + "/data/cerco_julio.json";

// Geometria provincial real (coropleta), compartida con el expediente electrica:
// paths por provincia extraidos del cuba.svg de MapSVG. Se enlazan al dataset por
// el codigo ISO CU-XX, no por el nombre, para no depender de tildes ni variantes.
const ISO_POR_ID = {
  habana: "CU-03", camaguey: "CU-09", santiago: "CU-13",
  pinar: "CU-01", matanzas: "CU-04", villaclara: "CU-05", cienfuegos: "CU-06",
  sancti: "CU-07", ciego: "CU-08", tunas: "CU-10", holguin: "CU-11",
  granma: "CU-12", guantanamo: "CU-14", artemisa: "CU-15", mayabeque: "CU-16",
};

const EMBEDDED = {"meta": {"slug": "cerco_julio", "titulo": "El cerco de julio", "subtitulo": "El 2 de julio de 2026, la Seguridad del Estado desplegó un operativo simultáneo contra activistas en varias provincias para impedirles asistir a un acto de la Embajada de Estados Unidos. Tres defensores de derechos humanos fueron incomunicados, golpeados y amenazados de muerte el mismo día — y el hostigamiento contra ellos no se detuvo en todo el mes. En paralelo, cuatro presos políticos salieron libres tras cumplir condena, mientras otros no sobrevivieron bajo custodia.", "descripcion": "El 2 de julio de 2026, según el informe mensual de Cubalex y confirmado por al menos cuatro medios de prensa independiente, la Seguridad del Estado cubano ejecutó un operativo coordinado contra activistas y opositores en distintas provincias del país. El objetivo declarado por las propias fuentes: impedir su asistencia a una recepción organizada por la Embajada de Estados Unidos en La Habana por el 250 aniversario de la independencia estadounidense. Cubalex cifra en \"al menos 25\" el número de personas afectadas; ese número exacto no aparece verbatim en la prensa independiente consultada, aunque el fenómeno del operativo sí está ampliamente documentado, con más de una decena de nombres propios reportados por distintos medios: Marthadela Tamayo, Osvaldo Navarro, Lisandra Orraca, Irina León, Dagoberto Valdés, Yoandy Izquierdo, Rosa María Rodríguez Gil, Esteban Ajete y Katia Hernández, entre otros.\n\nEste expediente sigue de cerca a tres de los afectados con el trato documentado más severo: José Elías González Agüero, Alexander Díaz Rodríguez y Mario Alberto Hernández Leyva, defensores de derechos humanos y expresos políticos. Los tres coinciden en un mismo punto de partida, el 2 de julio: González Agüero y Díaz Rodríguez fueron detenidos e incomunicados durante tres días, con golpizas, desnudez forzada y amenazas de muerte con arma de fuego, según coinciden CiberCuba, Martí Noticias, Diario de Cuba y Periódico Cubano. Hernández Leyva fue golpeado en una unidad policial y trasladado a un área boscosa cerca de Artemisa, donde fue desnudado, fotografiado y devuelto a La Habana esa misma noche. A partir de ese punto sincronizado, las tres historias se separan: el informe de Cubalex denuncia que los tres fueron citados de nuevo el 8 de julio, que la familia de González Agüero fue amenazada el día 11 para impedirle salir de su casa, y que Hernández Leyva sufrió nuevas detenciones los días 10 y 12. Ninguna de estas afirmaciones de seguimiento pudo confirmarse con una fuente independiente de Cubalex: no se localizó cobertura de prensa sobre esos hechos concretos, aunque tampoco se encontró nada que las contradiga.\n\nEl mismo operativo del 2 de julio incluyó a Anna Sofía Benítez, sometida a un interrogatorio de entre 10 y 12 horas según distintos medios. Otros dos casos, verificados de forma independiente por fuera del operativo del día 2: un adolescente de 13 años, identificado por prensa independiente como Alex Javier Hernández González, fue golpeado por la policía durante una protesta en Santiago de las Vegas (Boyeros) el 22 de julio; y Lismani Acosta Gómez fue detenido el 6 de julio durante un cacerolazo en Guanabacoa, aunque los detalles de su traslado carcelario difieren entre el informe original (que menciona la prisión de Cuba-Panamá y fianzas de 100.000 y 50.000 pesos) y la prensa independiente localizada (que sitúa su traslado al centro de detención El Vivac, sin confirmar las cifras de fianza).\n\nEl mes cierra con un contraste que este expediente presenta de forma deliberada en una misma balanza, sin promediar sus dos lados: por un lado, tres muertes bajo custodia denunciadas por Cubalex, de las cuales solo una (Rolando Yunior Rodríguez Torres, por intoxicación sin atención médica oportuna) fue corroborada de forma independiente; otra (Jorge Luis Iglesia Rodríguez) tiene su muerte confirmada en prisión, pero con una causa que la prensa independiente reporta distinta —una infección de próstata, no la tuberculosis no tratada que cita Cubalex, aunque ambas condiciones coexistían—; y la tercera (Osviel Rivero Viera) no pudo confirmarse en ninguna fuente consultada. Por el otro lado, cuatro excarcelaciones sí quedaron plenamente corroboradas: tres personas que cumplieron íntegra su condena de cinco años por el 11 de julio de 2021, y una cuarta liberada bajo libertad condicional.\n\nComo contexto agregado, no protagonista, el informe original de Cubalex registra 388 eventos represivos y 817 incidentes de hostigamiento en julio, afectando a 302 personas en 51 municipios de 15 provincias; La Habana concentró 191 de esos eventos, muy por delante de Camagüey (39) y Santiago de Cuba (27). Estas tres cifras provinciales son las únicas que el informe desglosa por nombre; el resto de las provincias no aparece individualizado en el material consultado, y este expediente no completa ese vacío con datos inventados.", "narracion": "El dos de julio de dos mil veintiséis, la Seguridad del Estado cubano ejecutó un operativo simultáneo contra activistas en varias provincias, para impedirles asistir a una recepción de la Embajada de Estados Unidos. Tres defensores de derechos humanos, José Elías González Agüero, Alexander Díaz Rodríguez y Mario Alberto Hernández Leyva, fueron detenidos ese mismo día: incomunicación, golpizas, desnudez forzada y amenazas de muerte, confirmadas por varios medios independientes. A partir de ahí, cada historia sigue un camino distinto: el informe de Cubalex denuncia nuevas citaciones y detenciones durante todo julio, pero esos hechos posteriores no pudieron confirmarse con una segunda fuente. El mismo operativo incluyó un interrogatorio de once horas a la activista Anna Sofía Benítez. Por separado, un adolescente de trece años fue golpeado por la policía en una protesta, y otro activista fue detenido durante un cacerolazo. El mes cierra con un contraste: tres muertes bajo custodia denunciadas por Cubalex, de las cuales solo una fue confirmada de forma independiente, frente a cuatro excarcelaciones plenamente corroboradas, entre ellas tres personas que cumplieron íntegra su condena de cinco años por las protestas del once de julio de dos mil veintiuno. Este expediente separa siempre lo confirmado de lo que solo reporta una fuente, sin mezclarlos en una sola cifra.", "version": "1.0.0", "fecha_datos": "2026-07-31", "advertencia": "La cifra de \"al menos 25\" personas afectadas por el operativo del 2 de julio no tiene respaldo textual exacto en prensa independiente, aunque el operativo en sí está ampliamente corroborado. El hostigamiento continuado contra los tres defensores tras el 2 de julio (citaciones y detenciones posteriores) solo lo reporta Cubalex. De las tres muertes bajo custodia denunciadas, solo una fue confirmada de forma independiente; una segunda tiene una causa de muerte distinta según prensa independiente, y la tercera no pudo confirmarse en ninguna fuente."}, "intro": {"parrafos": ["El 2 de julio de 2026, la Seguridad del Estado desplegó un operativo simultáneo contra activistas en varias provincias, para impedirles asistir a una recepción de la Embajada de Estados Unidos. Este expediente sigue tres historias que arrancan en el mismo punto exacto de ese operativo y luego se separan.", "José Elías González Agüero, Alexander Díaz Rodríguez y Mario Alberto Hernández Leyva sufrieron, el mismo día, incomunicación, golpizas y amenazas de muerte, confirmadas por prensa independiente. Lo que Cubalex denuncia que ocurrió después —nuevas citaciones y detenciones durante julio— no tiene, por ahora, una segunda fuente.", "El mes cierra con una balanza deliberada: tres muertes bajo custodia denunciadas por Cubalex, verificadas con distinto grado de certeza cada una, frente a cuatro excarcelaciones plenamente corroboradas. Este expediente no promedia ambos lados: los presenta juntos, con su fuente a la vista."]}, "operativo": {"fecha": "2 de julio de 2026", "resumen": "La Seguridad del Estado desplegó un operativo simultáneo contra activistas y opositores en distintas provincias, para impedirles asistir a una recepción de la Embajada de Estados Unidos en La Habana por el 250 aniversario de su independencia.", "cifra_afirmada": {"valor": 25, "confianza": "parcialmente_corroborada", "fuente": "Cubalex (informe julio 2026)", "nota": "El operativo del 2 de julio está ampliamente documentado por prensa independiente, con más de una decena de nombres propios distintos reportados. La cifra exacta \"al menos 25\" no aparece verbatim en ninguna fuente independiente consultada, aunque es plausible dado el número de nombres ya identificados."}, "hechos": [{"afirmacion": "El operativo coordinado del 2 de julio de 2026 está documentado por al menos cuatro medios de prensa independiente.", "confianza": "corroborada", "fuente": "Diario de Cuba, 14ymedio, Martí Noticias, Cubanet"}, {"afirmacion": "El objetivo declarado fue impedir la asistencia de activistas y opositores a una recepción de la Embajada de Estados Unidos por el 250 aniversario de su independencia.", "confianza": "corroborada", "fuente": "Diario de Cuba, 14ymedio"}], "nombres_adicionales": ["Marthadela Tamayo", "Osvaldo Navarro", "Lisandra Orraca", "Irina León", "Dagoberto Valdés", "Yoandy Izquierdo", "Rosa María Rodríguez Gil", "Esteban Ajete", "Katia Hernández"]}, "tres_pistas": [{"persona": "José Elías González Agüero", "eventos": [{"fecha": "2 de julio", "hecho": "Detenido e incomunicado, junto a Alexander Díaz Rodríguez, para impedir su asistencia a la recepción diplomática.", "confianza": "corroborada", "fuente": "CiberCuba, Martí Noticias", "sincronizado": true}, {"fecha": "2-4 de julio", "hecho": "Tres días de incomunicación, golpizas, desnudez forzada y amenazas de muerte con arma de fuego.", "confianza": "corroborada", "fuente": "CiberCuba, Diario de Cuba, Periódico Cubano", "sincronizado": true}, {"fecha": "8 de julio", "hecho": "Citado nuevamente por la Seguridad del Estado, según el informe de Cubalex.", "confianza": "no_confirmada", "fuente": "Cubalex (informe julio 2026)", "sincronizado": false}, {"fecha": "11 de julio", "hecho": "Su familia fue amenazada para impedirle salir de su casa, según el informe de Cubalex.", "confianza": "no_confirmada", "fuente": "Cubalex (informe julio 2026)", "sincronizado": false}]}, {"persona": "Alexander Díaz Rodríguez", "eventos": [{"fecha": "2 de julio", "hecho": "Detenido e incomunicado, junto a José Elías González Agüero, para impedir su asistencia a la recepción diplomática.", "confianza": "corroborada", "fuente": "CiberCuba, Martí Noticias", "sincronizado": true}, {"fecha": "2-4 de julio", "hecho": "Tres días de incomunicación, golpizas, desnudez forzada y amenazas de muerte con arma de fuego; un papel le fue introducido a la fuerza en la boca.", "confianza": "corroborada", "fuente": "CiberCuba, Diario de Cuba", "sincronizado": true}, {"fecha": "8 de julio", "hecho": "Citado nuevamente por la Seguridad del Estado, según el informe de Cubalex.", "confianza": "no_confirmada", "fuente": "Cubalex (informe julio 2026)", "sincronizado": false}]}, {"persona": "Mario Alberto Hernández Leyva", "eventos": [{"fecha": "2 de julio", "hecho": "Golpeado en una unidad policial y trasladado a una zona boscosa cerca de Artemisa.", "confianza": "corroborada", "fuente": "Martí Noticias", "sincronizado": true}, {"fecha": "2 de julio", "hecho": "Desnudado, fotografiado y devuelto a La Habana esa misma noche, cerca de las 22:00 horas.", "confianza": "corroborada", "fuente": "Martí Noticias", "sincronizado": true}, {"fecha": "8 de julio", "hecho": "Citado nuevamente, según el informe de Cubalex.", "confianza": "no_confirmada", "fuente": "Cubalex (informe julio 2026)", "sincronizado": false}, {"fecha": "10 de julio", "hecho": "Nueva detención, según el informe de Cubalex.", "confianza": "no_confirmada", "fuente": "Cubalex (informe julio 2026)", "sincronizado": false}, {"fecha": "12 de julio", "hecho": "Nueva detención, vigilancia domiciliaria y retenciones de hasta 24 horas, según el informe de Cubalex.", "confianza": "no_confirmada", "fuente": "Cubalex (informe julio 2026)", "sincronizado": false}]}], "casos_satelite": [{"id": "benitez", "nombre": "Anna Sofía Benítez", "resumen": "Sometida a un interrogatorio de entre 10 y 12 horas el 2 de julio de 2026, en el mismo operativo dirigido a impedir la asistencia a la recepción diplomática.", "hechos": [{"afirmacion": "Fue interrogada durante entre 10 y 12 horas, según distintas fuentes, el 2 de julio de 2026.", "confianza": "corroborada", "fuente": "Diario Las Américas, ADN Cuba, CiberCuba, Cubanet"}], "confianza_global": "corroborada"}, {"id": "hernandez_gonzalez", "nombre": "Alex Javier Hernández González, 13 años", "resumen": "Golpeado por la policía durante una protesta en Santiago de las Vegas (Boyeros) el 22 de julio de 2026.", "hechos": [{"afirmacion": "Un adolescente de 13 años, identificado por prensa independiente, fue golpeado por la policía durante una protesta el 22 de julio de 2026.", "confianza": "corroborada", "fuente": "Diario de Cuba, Martí Noticias, 14ymedio, Infobae, Prisoners Defenders"}], "confianza_global": "corroborada"}, {"id": "acosta_gomez", "nombre": "Lismani Acosta Gómez", "resumen": "Detenido el 6 de julio de 2026 durante un cacerolazo en Guanabacoa; los detalles de su traslado carcelario difieren entre el informe original y la prensa independiente.", "hechos": [{"afirmacion": "Fue detenido el 6 de julio de 2026 durante un cacerolazo en Guanabacoa.", "confianza": "corroborada", "fuente": "CiberCuba, 14ymedio"}, {"afirmacion": "El informe de Cubalex indica fianzas sucesivas de 100.000 y 50.000 pesos y traslado a la prisión de Cuba-Panamá.", "confianza": "no_confirmada", "fuente": "Cubalex (informe julio 2026)", "nota": "Prensa independiente sitúa en cambio su traslado al centro de detención El Vivac, con cambio de medida a prisión provisional, sin mencionar las cifras de fianza citadas por Cubalex."}], "confianza_global": "parcialmente_corroborada"}], "cierre_balanza": {"muertes": [{"nombre": "Rolando Yunior Rodríguez Torres", "detalle": "Murió tras un mes hospitalizado, después de intoxicarse con medicamentos en prisión y no recibir atención médica oportuna.", "confianza": "corroborada", "fuente": "14ymedio"}, {"nombre": "Jorge Luis Iglesia Rodríguez", "detalle": "Murió en la Prisión Provincial de Guantánamo. Cubalex atribuye la muerte a tuberculosis no tratada.", "confianza": "parcialmente_corroborada", "fuente": "14ymedio, Diario de Cuba", "nota": "Prensa independiente reporta que la causa de muerte registrada fue una infección de próstata; la tuberculosis, diagnosticada en junio, era una condición concurrente que tampoco recibió tratamiento adecuado."}, {"nombre": "Osviel Rivero Viera", "detalle": "Cubalex reporta su muerte en el Combinado del Este, tras casi dos años detenido.", "confianza": "no_confirmada", "fuente": "Cubalex (informe julio 2026)", "nota": "No se localizó ninguna fuente independiente que mencione este nombre ni este hecho."}], "excarcelados": [{"nombre": "Nilo Abrahante Santiago", "detalle": "Cumplió íntegra su condena de 5 años por las protestas del 11 de julio de 2021.", "confianza": "corroborada", "fuente": "14ymedio, Diario de Cuba"}, {"nombre": "Aníbal Yasiel Palau Jacinto", "detalle": "Cumplió íntegra su condena de 5 años por las protestas del 11 de julio de 2021.", "confianza": "corroborada", "fuente": "Martí Noticias"}, {"nombre": "Kevin Damián Frómeta Castro", "detalle": "Cumplió íntegra su condena de 5 años por las protestas del 11 de julio de 2021.", "confianza": "corroborada", "fuente": "Solidaridad Española con Cuba"}, {"nombre": "Ángel Castro Carrera", "detalle": "Excarcelado bajo libertad condicional tras cumplir 5 de los 6 años de su condena por \"sabotaje\".", "confianza": "corroborada", "fuente": "Martí Noticias, 23 de julio de 2026"}], "nota": "De las tres muertes bajo custodia que denuncia Cubalex, solo una fue confirmada de forma independiente sin matices; las cuatro excarcelaciones sí lo fueron, todas. Este expediente no resume ambos lados en un solo número: los muestra juntos, cada nombre con su propia fuente y su propio grado de certeza."}, "contexto_agregado": {"resumen": "Cifras agregadas del informe mensual de Cubalex para julio de 2026, presentadas como contexto, no como protagonistas de este expediente.", "cifras": {"eventos": 388, "incidentes": 817, "victimas": 302, "municipios": 51, "provincias_total": 15}, "cortes_telecom": {"valor": 8, "nota": "El doble que en junio de 2026, según el informe de Cubalex; incluye un corte de internet durante una protesta en Jatibonico."}, "confianza": "no_confirmada", "fuente": "Cubalex (informe julio 2026)"}, "provincias": [{"id": "habana", "nombre": "La Habana", "eventos": 191, "confianza": "no_confirmada", "fuente": "Cubalex (informe julio 2026)"}, {"id": "camaguey", "nombre": "Camagüey", "eventos": 39, "confianza": "no_confirmada", "fuente": "Cubalex (informe julio 2026)"}, {"id": "santiago", "nombre": "Santiago de Cuba", "eventos": 27, "confianza": "no_confirmada", "fuente": "Cubalex (informe julio 2026)"}], "verificacion": {"total_evaluadas": 13, "corroboradas": 6, "parcialmente_corroboradas": 3, "no_confirmadas": 4, "excluidas": 0, "nota": "Se evaluaron 13 afirmaciones del informe original de Cubalex. Quedaron corroboradas: el operativo del 2 de julio como fenómeno (aunque no su cifra exacta de 25 personas), los hechos centrales de González Agüero y Díaz Rodríguez, los de Hernández Leyva, el interrogatorio de Anna Sofía Benítez, el caso del adolescente golpeado en Boyeros, y las cuatro excarcelaciones. Quedaron parcialmente corroboradas: la cifra de personas afectadas por el operativo, el caso Acosta Gómez (detención confirmada, traslado y fianzas sin confirmar) y la muerte de Jorge Luis Iglesia Rodríguez (confirmada, causa distinta a la reportada por Cubalex). No se confirmaron: el hostigamiento continuado tras el 2 de julio (citaciones y detenciones posteriores), el caso de Agustín López Canino, los otros dos menores detenidos en Regla y Arroyo Naranjo, y la muerte de Osviel Rivero Viera."}, "encuesta": {"preguntas": [{"id": "operativo_coordinado", "texto": "Tres defensores sufrieron el mismo trato el mismo día, en un operativo para impedirles asistir a un acto diplomático. ¿Qué te parece más revelador?", "opciones": ["La coordinación centralizada del operativo", "Que el motivo fuera impedir un acto simbólico, no una protesta", "Que el hostigamiento posterior no tenga aún segunda fuente"]}, {"id": "balanza_final", "texto": "El mismo mes hubo tres muertes bajo custodia (una confirmada) y cuatro excarcelaciones (las cuatro confirmadas). ¿Qué transmite mejor ese contraste?", "opciones": ["Que el sistema libera a quien ya cumplió, sin más concesión que esa", "Que las muertes bajo custodia siguen sin transparencia real", "Ambas cosas a la vez, sin que una compense a la otra"]}, {"id": "cifras_no_confirmadas", "texto": "Cuatro de las trece afirmaciones evaluadas en este expediente no pudieron confirmarse con una segunda fuente. ¿Cómo deberíamos tratarlas?", "opciones": ["Publicarlas igual, marcadas como no confirmadas", "No publicarlas hasta tener una segunda fuente", "Depende de la gravedad de cada afirmación"]}]}, "referencias": [{"fuente": "Cubalex", "detalle": "Informe Mensual sobre la Situación de los Derechos Humanos en Cuba, julio de 2026", "fecha": "agosto de 2026"}, {"fuente": "CiberCuba", "detalle": "Cobertura del operativo del 2 de julio contra González Agüero y Díaz Rodríguez", "fecha": "julio de 2026"}, {"fuente": "Martí Noticias", "detalle": "Cobertura del caso de Hernández Leyva y de la excarcelación de Ángel Castro Carrera", "fecha": "julio de 2026"}, {"fuente": "Diario de Cuba", "detalle": "Cobertura del operativo del 2 de julio y de la muerte de Jorge Luis Iglesia Rodríguez", "fecha": "julio de 2026"}, {"fuente": "14ymedio", "detalle": "Cobertura de la muerte de Rolando Yunior Rodríguez Torres y de las excarcelaciones por el 11J", "fecha": "julio de 2026"}, {"fuente": "Cubanet", "detalle": "Cobertura del operativo del 2 de julio", "fecha": "julio de 2026"}, {"fuente": "Periódico Cubano", "detalle": "Cobertura de los hechos contra González Agüero y Díaz Rodríguez", "fecha": "julio de 2026"}, {"fuente": "Diario Las Américas / ADN Cuba", "detalle": "Cobertura del interrogatorio de Anna Sofía Benítez", "fecha": "julio de 2026"}, {"fuente": "Infobae / Prisoners Defenders", "detalle": "Cobertura del caso del adolescente golpeado en Boyeros", "fecha": "julio de 2026"}, {"fuente": "Solidaridad Española con Cuba", "detalle": "Cobertura de la excarcelación de Kevin Damián Frómeta Castro", "fecha": "julio de 2026"}], "metodologia": {"fuentes": [{"nombre": "Cubalex", "tipo": "informe mensual / monitoreo propio", "url": "https://cubalex.org"}, {"nombre": "Prensa independiente cubana (CiberCuba, 14ymedio, Diario de Cuba, Martí Noticias, Cubanet, ADN Cuba)", "tipo": "cobertura periodística", "url": ""}, {"nombre": "Prisoners Defenders", "tipo": "organización de derechos humanos", "url": ""}], "periodo": "julio de 2026", "cadencia": "Nivel 2 — creación asistida vía /procesar-inbox; no entra en el ciclo automático de refresco de 8 horas.", "extraccion": "Verificación asistida por LLM (motor agnóstico) sobre el PDF de origen, con un subagente dedicado a corroborar cada afirmación individual contra fuentes independientes antes de incluirla en el dataset.", "validacion": "ajv contra cerco_julio.schema.json · node scripts/bracket-balance.mjs · npm run build", "limitaciones": ["El hostigamiento continuado contra los tres defensores tras el 2 de julio (nuevas citaciones y detenciones) solo lo reporta Cubalex; no se localizó cobertura de prensa independiente sobre esos hechos concretos.", "Las cifras agregadas del mes (388 eventos, 817 incidentes, 302 víctimas) son la métrica interna de Cubalex; el desglose por provincia solo está disponible para tres de las quince provincias.", "De las tres muertes bajo custodia denunciadas, una tiene una causa de muerte distinta según prensa independiente y otra no pudo confirmarse en ninguna fuente."], "cambios_metodologicos": []}, "conclusion": "El 2 de julio de 2026 deja una prueba visual poco frecuente: tres personas, en tres lugares, sometidas al mismo trato el mismo día, por el mismo motivo declarado. Esa sincronía —incomunicación, golpizas, desnudez forzada, amenazas de muerte— está confirmada por prensa independiente más allá del propio informe de Cubalex que la denuncia. Lo que Cubalex describe que ocurrió después, durante el resto de julio, todavía depende de una sola fuente. El mes se cierra con una balanza que este expediente no simplifica: tres muertes bajo custodia, verificadas con distinto grado de certeza cada una, y cuatro excarcelaciones, las cuatro confirmadas sin matices. Ninguna de las dos cifras corrige a la otra; ambas describen, con su propio nivel de certeza, lo que le pasó a un grupo de personas nombradas en julio de 2026."};

const SECCIONES = [
  ["operativo", "El operativo"],
  ["triptico", "Tríptico: tres pistas"],
  ["satelites", "Casos satélite"],
  ["mapa", "El mapa"],
  ["balanza", "La balanza"],
  ["metodo", "Método y fuentes"],
];

// Extrae un dia de julio de una etiqueta tipo "2 de julio" o "2-4 de julio".
function diaDe(fecha) {
  const m = /^(\d+)/.exec(String(fecha).trim());
  return m ? Number(m[1]) : null;
}

function SecHead({ n, t, d }) {
  return (<div className="cj-sec-head"><span className="cj-sec-num">{n}</span><h2>{t}</h2>{d && <p>{d}</p>}</div>);
}

function Chip({ estado }) {
  const cls = estado === "corroborada" ? "ok" : estado === "parcialmente_corroborada" ? "parcial" : "no";
  const txt = estado === "corroborada" ? "corroborada" : estado === "parcialmente_corroborada" ? "parcial" : "no confirmada";
  return <span className={"cj-chip cj-chip-" + cls}>{txt}</span>;
}

function Hecho({ h }) {
  return (
    <div className="cj-hecho">
      <div className="cj-hecho-top"><Chip estado={h.confianza} /><span className="cj-hecho-fuente">{h.fuente}</span></div>
      <p>{h.afirmacion}</p>
      {h.nota && <p className="cj-hecho-nota">{h.nota}</p>}
    </div>
  );
}

function OperativoBlock({ operativo }) {
  return (
    <div className="cj-operativo">
      <p className="cj-operativo-resumen">{operativo.resumen}</p>
      <div className="cj-operativo-cifra">
        <span className="cj-operativo-cifra-num">"al menos {operativo.cifra_afirmada.valor}"</span>
        <Chip estado={operativo.cifra_afirmada.confianza} />
        <p>{operativo.cifra_afirmada.nota}</p>
      </div>
      <div className="cj-hechos-grid">{operativo.hechos.map((h, i) => <Hecho h={h} key={i} />)}</div>
      <div className="cj-nombres">
        <span className="cj-nombres-label">Otros nombres reportados por prensa independiente en el mismo operativo:</span>
        <span className="cj-nombres-lista">{operativo.nombres_adicionales.join(" · ")}</span>
      </div>
    </div>
  );
}

/* FIRMA — triptico de tres pistas con eje de dias compartido.
   Cada evento se posiciona por su dia real de julio sobre un eje comun, asi que
   la alineacion del 2 de julio es geometrica, no decorativa. Al pasar el cursor
   (o enfocar con teclado) por cualquier evento se resalta ese MISMO dia en las
   tres pistas: si las tres se encienden a la vez, hubo simultaneidad real. */
function TresPistas({ pistas }) {
  const [diaActivo, setDiaActivo] = useState(null);
  const [soloCorrob, setSoloCorrob] = useState(false);

  const dias = pistas.flatMap((p) => p.eventos.map((e) => diaDe(e.fecha))).filter((d) => d != null);
  const minD = Math.min(...dias), maxD = Math.max(...dias);
  const pos = (d) => ((d - minD) / Math.max(1, maxD - minD)) * 100;

  // Dias en los que coinciden las tres pistas (simultaneidad verificable).
  const diasSimultaneos = useMemo(() => {
    const cuenta = {};
    pistas.forEach((p) => {
      const propios = new Set(p.eventos.map((e) => diaDe(e.fecha)).filter((d) => d != null));
      propios.forEach((d) => { cuenta[d] = (cuenta[d] || 0) + 1; });
    });
    return new Set(Object.keys(cuenta).filter((d) => cuenta[d] === pistas.length).map(Number));
  }, [pistas]);

  return (
    <div className="cj-pistas">
      <div className="cj-pistas-bar">
        <button className={"cj-toggle" + (soloCorrob ? " on" : "")} onClick={() => setSoloCorrob((v) => !v)}>
          {soloCorrob ? "✓ " : ""}Solo lo corroborado por prensa independiente
        </button>
        <span className="cj-pistas-hint">
          {diaActivo
            ? `Día ${diaActivo} de julio${diasSimultaneos.has(diaActivo) ? " — las tres pistas a la vez" : " — una sola pista"}`
            : "Pasa el cursor por cualquier hecho: se resalta ese mismo día en las tres pistas."}
        </span>
      </div>

      <div className="cj-eje">
        {Array.from(diasSimultaneos).sort((a, b) => a - b).map((d) => (
          <span key={d} className="cj-eje-marca" style={{ left: pos(d) + "%" }}>
            <i /><b>{d} jul</b>
          </span>
        ))}
        <span className="cj-eje-linea" aria-hidden="true" />
      </div>

      <div className="cj-pistas-grid">
        {pistas.map((p) => {
          const visibles = soloCorrob ? p.eventos.filter((e) => e.confianza === "corroborada") : p.eventos;
          return (
            <div className="cj-pista" key={p.persona}>
              <h3>{p.persona}</h3>
              <div className="cj-pista-track">
                {visibles.map((e, i) => {
                  const d = diaDe(e.fecha);
                  const activo = diaActivo != null && d === diaActivo;
                  return (
                    <div
                      className={"cj-pista-ev" + (e.sincronizado ? " cj-pista-ev-sync" : "") + (activo ? " cj-pista-ev-activo" : "")}
                      key={i}
                      tabIndex={0}
                      onMouseEnter={() => setDiaActivo(d)}
                      onMouseLeave={() => setDiaActivo(null)}
                      onFocus={() => setDiaActivo(d)}
                      onBlur={() => setDiaActivo(null)}
                    >
                      <span className="cj-pista-dot" />
                      <div className="cj-pista-body">
                        <div className="cj-pista-fecha">{e.fecha}<Chip estado={e.confianza} /></div>
                        <p>{e.hecho}</p>
                        <span className="cj-pista-fuente">{e.fuente}</span>
                      </div>
                    </div>
                  );
                })}
                {visibles.length === 0 && <p className="cj-pista-vacio">Sin hechos corroborados por segunda fuente en esta pista.</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GaleriaCasosSatelite({ casos }) {
  const [abierto, setAbierto] = useState(casos[0] ? casos[0].id : null);
  return (
    <div className="cj-casos-grid">
      {casos.map((c) => {
        const on = abierto === c.id;
        return (
          <div className={"cj-caso" + (on ? " cj-caso-on" : "")} key={c.id}>
            <button className="cj-caso-top" onClick={() => setAbierto(on ? null : c.id)} aria-expanded={on}>
              <h4>{c.nombre}</h4>
              <span className="cj-caso-top-r"><Chip estado={c.confianza_global} /><i className="cj-caso-caret">{on ? "−" : "+"}</i></span>
            </button>
            <p className="cj-caso-resumen">{c.resumen}</p>
            {on && <div className="cj-caso-hechos">{c.hechos.map((h, i) => <Hecho h={h} key={i} />)}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* Coropleta provincial real sobre el cuba.svg de MapSVG (electrica_geo.js):
   cada provincia es su propio path, seleccionable, con intensidad proporcional
   a los eventos. Solo tres provincias tienen cifra en el informe fuente: las
   demas quedan apagadas y declaradas "sin desglose", nunca con valor inventado. */
function MapaProvincias({ provincias, contexto }) {
  const max = Math.max(...provincias.map((p) => p.eventos));
  const conDato = useMemo(() => {
    const m = new Map();
    provincias.forEach((p) => { if (ISO_POR_ID[p.id]) m.set(ISO_POR_ID[p.id], p); });
    return m;
  }, [provincias]);
  const [sel, setSel] = useState(provincias[0] ? ISO_POR_ID[provincias[0].id] : null);
  const [hov, setHov] = useState(null);
  const prov = conDato.get(sel);
  const pctDelTotal = prov ? Math.round((prov.eventos / contexto.cifras.eventos) * 100) : 0;
  const rotulado = hov ? conDato.get(hov) : null;
  const tituloHov = hov ? (CUBA_PATHS.find((p) => p.id === hov) || {}).title : null;

  return (
    <div className="cj-mapa-stage">
      <div className="cj-mapa-wrap">
        <svg viewBox={CUBA_VIEWBOX} className="cj-mapa-svg" preserveAspectRatio="xMidYMid meet"
             role="img" aria-label="Eventos represivos por provincia en julio de 2026">
          {CUBA_PATHS.map((prv) => {
            const p = conDato.get(prv.id);
            const activo = !!p;
            const on = sel === prv.id;
            const intensidad = activo ? 0.28 + (p.eventos / max) * 0.72 : 0;
            return (
              <path
                key={prv.id}
                d={prv.d}
                className={"cj-prov" + (activo ? " cj-prov-on" : "") + (on ? " cj-prov-sel" : "")}
                style={activo ? { fillOpacity: intensidad } : undefined}
                onClick={() => activo && setSel(prv.id)}
                onMouseEnter={() => setHov(prv.id)}
                onMouseLeave={() => setHov(null)}
                tabIndex={activo ? 0 : -1}
                onFocus={() => setHov(prv.id)}
                onBlur={() => setHov(null)}
                onKeyDown={(ev) => { if (activo && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); setSel(prv.id); } }}
              >
                <title>{prv.title}{p ? ` — ${p.eventos} eventos` : " — sin desglose publicado"}</title>
              </path>
            );
          })}
        </svg>
        <div className="cj-mapa-pie">
          <span className="cj-mapa-hov">
            {tituloHov
              ? <>{tituloHov}{rotulado ? <b> · {rotulado.eventos} eventos</b> : <i> · sin desglose publicado</i>}</>
              : "Pasa el cursor por el mapa; toca una provincia encendida para fijarla."}
          </span>
          <span className="cj-mapa-legend">
            <span className="cj-mapa-legend-i"><i className="cj-sw-on" />Con cifra en el informe</span>
            <span className="cj-mapa-legend-i"><i className="cj-sw-off" />Sin desglose publicado</span>
          </span>
        </div>
      </div>
      <aside className="cj-dossier">
        {prov ? (
          <>
            <div className="cj-dossier-prov">{prov.nombre}</div>
            <div className="cj-dossier-big">{prov.eventos}<span> eventos</span></div>
            <div className="cj-dossier-rows">
              <div className="cj-dossier-row"><span>Del total del mes</span><b>{pctDelTotal}%</b></div>
              <div className="cj-dossier-row"><span>Total nacional</span><b>{contexto.cifras.eventos}</b></div>
              <div className="cj-dossier-row"><span>Estado del dato</span><b><Chip estado={prov.confianza} /></b></div>
            </div>
            <p className="cj-dossier-text">{prov.fuente}</p>
          </>
        ) : <div className="cj-dossier-prov">Selecciona una provincia</div>}
        <p className="cj-dossier-nota">
          El informe de Cubalex solo desglosa por nombre estas tres provincias de las quince
          en las que dice haber registrado eventos. Las doce restantes aparecen apagadas: no
          se les asigna una cifra que la fuente no publica.
        </p>
        <div className="cj-dossier-hint">Toca una provincia encendida.</div>
      </aside>
    </div>
  );
}

/* Balanza interactiva: el interruptor "contar solo lo corroborado" es el
   argumento del expediente hecho mecanismo. Con todo contado, la balanza queda
   casi nivelada (3 muertes frente a 4 excarcelaciones); al exigir segunda
   fuente, el plato de las muertes se vacia hasta 1 y la inclinacion se dispara.
   No cambia los hechos: cambia lo que se puede afirmar sobre ellos. */
function Balanza({ cierre }) {
  const [soloCorrob, setSoloCorrob] = useState(false);
  const cuenta = (arr) => (soloCorrob ? arr.filter((x) => x.confianza === "corroborada") : arr);
  const muertes = cuenta(cierre.muertes);
  const excar = cuenta(cierre.excarcelados);
  const diff = excar.length - muertes.length;
  const tilt = Math.max(-8, Math.min(8, diff * 2.6));

  const Item = ({ m, atenuado }) => (
    <div className={"cj-balanza-item" + (atenuado ? " cj-balanza-item-off" : "")}>
      <div className="cj-balanza-item-top"><b>{m.nombre}</b><Chip estado={m.confianza} /></div>
      <p>{m.detalle}</p>
      {m.nota && <p className="cj-hecho-nota">{m.nota}</p>}
      <span className="cj-hecho-fuente">{m.fuente}</span>
    </div>
  );

  return (
    <div className="cj-balanza">
      <div className="cj-balanza-bar">
        <button className={"cj-toggle" + (soloCorrob ? " on" : "")} onClick={() => setSoloCorrob((v) => !v)}>
          {soloCorrob ? "✓ " : ""}Contar solo lo corroborado por segunda fuente
        </button>
        <span className="cj-balanza-lectura">
          {soloCorrob
            ? `${muertes.length} frente a ${excar.length}: exigir segunda fuente vacía casi entero el plato de las muertes.`
            : `${muertes.length} frente a ${excar.length}: contado todo lo denunciado, los platos casi se igualan.`}
        </span>
      </div>

      <svg viewBox="0 0 300 44" className="cj-balanza-viga-svg" aria-hidden="true">
        <g style={{ transform: `rotate(${tilt}deg)`, transformOrigin: "150px 22px", transition: "transform .6s cubic-bezier(.4,1.4,.5,1)" }}>
          <line x1="26" y1="22" x2="274" y2="22" className="cj-balanza-viga" />
          <circle cx="26" cy="22" r="5" className="cj-balanza-plato-pt" />
          <circle cx="274" cy="22" r="5" className="cj-balanza-plato-pt" />
          <text x="26" y="12" textAnchor="middle" className="cj-balanza-cnt">{muertes.length}</text>
          <text x="274" y="12" textAnchor="middle" className="cj-balanza-cnt">{excar.length}</text>
        </g>
        <polygon points="150,22 142,40 158,40" className="cj-balanza-fulcro" />
      </svg>

      <div className="cj-balanza-platos">
        <div className="cj-balanza-plato">
          <h4>Muertes bajo custodia <span>{muertes.length}</span></h4>
          {cierre.muertes.map((m, i) => (
            <Item m={m} key={i} atenuado={soloCorrob && m.confianza !== "corroborada"} />
          ))}
        </div>
        <div className="cj-balanza-plato">
          <h4>Excarcelaciones <span>{excar.length}</span></h4>
          {cierre.excarcelados.map((m, i) => (
            <Item m={m} key={i} atenuado={soloCorrob && m.confianza !== "corroborada"} />
          ))}
        </div>
      </div>
      <p className="cj-balanza-nota">{cierre.nota}</p>
    </div>
  );
}

function Encuesta({ datos }) {
  const CLAVE = "yamacoa_cerco_julio_votos";
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
      sb.rpc("cerco_julio_totales").then(({ data }) => { if (data) setVotos((v) => ({ ...v, ...data })); }).catch(() => {});
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
    if (sb && sb.rpc) sb.rpc("cerco_julio_votar", { p_pregunta: pid, p_opcion: opcion }).catch(() => {});
  };
  return (
    <div className="cj-encuesta">
      {datos.preguntas.map((q) => {
        const conteo = votos[q.id] || {};
        const total = Object.values(conteo).reduce((a, b) => a + b, 0);
        const votado = miVoto[q.id] != null;
        return (
          <div className="cj-pregunta" key={q.id}>
            <p>{q.texto}</p>
            {q.opciones.map((op) => {
              const n = conteo[op] || 0;
              const pct = total ? Math.round((n / total) * 100) : 0;
              const elegida = miVoto[q.id] === op;
              return (
                <button key={op} className="cj-opcion" disabled={votado} onClick={() => votar(q.id, op)}>
                  <span className="cj-opcion-fill" style={{ width: votado ? pct + "%" : 0, background: elegida ? "rgba(212,189,43,.32)" : "rgba(148,140,120,.16)" }} />
                  <span className="cj-opcion-txt"><span>{elegida ? "✓ " : ""}{op}</span>{votado && <span>{pct}%</span>}</span>
                </button>
              );
            })}
            <p className="cj-pregunta-total">{total} voto{total === 1 ? "" : "s"}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(EMBEDDED);
  const [visible, setVisible] = useState("operativo");

  const refs = {
    operativo: useRef(null), triptico: useRef(null), satelites: useRef(null),
    mapa: useRef(null), balanza: useRef(null), metodo: useRef(null),
  };

  // Marca en la navegacion la seccion que el lector tiene delante.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const nodos = SECCIONES.map(([id]) => [id, refs[id].current]).filter(([, n]) => n);
    const io = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            const par = nodos.find(([, n]) => n === e.target);
            if (par) setVisible(par[0]);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    nodos.forEach(([, n]) => io.observe(n));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = "cj-fonts";
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
  const ca = data.contexto_agregado;

  return (
    <div className="cj-root">
      <style>{CSS}</style>

      <header className="cj-hero">
        <span className="cj-eyebrow">CUBALEX · INFORME MENSUAL, JULIO 2026</span>
        <h1>{m.titulo}</h1>
        <p className="cj-subtitulo">{m.subtitulo}</p>
        <div className="cj-advertencia">⚠ {m.advertencia}</div>
      </header>

      <nav className="cj-nav">
        {SECCIONES.map(([id, lbl]) => (
          <a key={id} href={`#cj-${id}`} className={"cj-nav-a" + (visible === id ? " on" : "")}>{lbl}</a>
        ))}
      </nav>

      <main className="cj-main">
        <section>
          <SecHead n="00" t="Tres historias, un mismo día" />
          {data.intro.parrafos.map((p, i) => <p className="cj-parrafo" key={i}>{p}</p>)}
        </section>

        <section id="cj-operativo" ref={refs.operativo}>
          <SecHead n="01" t={`El operativo del ${data.operativo.fecha}`} />
          <OperativoBlock operativo={data.operativo} />
        </section>

        <section id="cj-triptico" ref={refs.triptico}>
          <SecHead n="02" t="Tríptico: tres pistas sobre un eje de días" d="Cada hecho se coloca en su día real de julio. Pasa el cursor por cualquiera y verás si ese día se enciende en las tres pistas a la vez." />
          <TresPistas pistas={data.tres_pistas} />
        </section>

        <section id="cj-satelites" ref={refs.satelites}>
          <SecHead n="03" t="Casos satélite" d="Personas afectadas en el mismo operativo o en hechos aparte durante julio. Toca cada ficha para ver los hechos y su verificación." />
          <GaleriaCasosSatelite casos={data.casos_satelite} />
        </section>

        <section id="cj-mapa" ref={refs.mapa}>
          <SecHead n="04" t="Dónde: solo tres provincias con nombre" />
          <MapaProvincias provincias={data.provincias} contexto={ca} />
        </section>

        <section id="cj-balanza" ref={refs.balanza}>
          <SecHead n="05" t="El cierre en balanza" d="Acciona el interruptor: verás cuánto cambia el equilibrio del mes cuando se exige una segunda fuente." />
          <Balanza cierre={data.cierre_balanza} />
        </section>

        <section id="cj-metodo" ref={refs.metodo}>
          <SecHead n="06" t="Contexto agregado del mes" d={ca.resumen} />
          <div className="cj-ca-stats">
            <div><b>{ca.cifras.eventos}</b><span>eventos represivos</span></div>
            <div><b>{ca.cifras.incidentes}</b><span>incidentes de hostigamiento</span></div>
            <div><b>{ca.cifras.victimas}</b><span>víctimas</span></div>
            <div><b>{ca.cifras.municipios}</b><span>municipios / {ca.cifras.provincias_total} provincias</span></div>
            <div><b>{ca.cortes_telecom.valor}</b><span>cortes de telecomunicaciones</span></div>
          </div>
          <p className="cj-ca-nota"><Chip estado={ca.confianza} /> {ca.fuente} — {ca.cortes_telecom.nota}</p>
        </section>

        <section>
          <SecHead n="07" t="Cómo se verificó este expediente" d={v.nota} />
          <div className="cj-verif-stats">
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
          <ul className="cj-referencias">
            {data.referencias.map((r, i) => <li key={i}><b>{r.fuente}</b> — {r.detalle}{r.fecha ? ` (${r.fecha})` : ""}</li>)}
          </ul>
          <p className="cj-conclusion">{data.conclusion}</p>
        </section>
      </main>
    </div>
  );
}

const CSS = `
.cj-root{ background:${C.bg}; color:${C.paper}; font-family:'Archivo',system-ui,sans-serif; min-height:100vh; }
.cj-root *{ box-sizing:border-box; }
.cj-hero{ padding:48px 20px 28px; max-width:940px; margin:0 auto; }
.cj-eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.14em; color:${C.contrapunto}; }
.cj-hero h1{ font-size:clamp(28px,5vw,46px); margin:10px 0 8px; line-height:1.08; }
.cj-subtitulo{ color:${C.dim}; font-size:16px; max-width:720px; line-height:1.55; }
.cj-advertencia{ margin-top:18px; background:${C.panel}; border:1px solid ${C.primario}; border-radius:8px; padding:12px 16px; font-size:13.5px; line-height:1.5; }
.cj-main{ max-width:940px; margin:0 auto; padding:0 20px 80px; }
.cj-main section{ margin-top:56px; }
.cj-sec-head{ margin-bottom:16px; }
.cj-sec-num{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:${C.dim}; letter-spacing:.1em; }
.cj-sec-head h2{ font-size:22px; margin:4px 0 6px; }
.cj-sec-head p{ color:${C.dim}; font-size:13.5px; line-height:1.5; margin:0; }
.cj-parrafo{ font-size:15px; line-height:1.65; margin:0 0 14px; }
.cj-chip{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; text-transform:uppercase; letter-spacing:.07em; padding:2px 7px; border-radius:999px; white-space:nowrap; }
.cj-chip-ok{ color:${C.corrob}; border:1px solid ${C.corrob}; }
.cj-chip-parcial{ color:${C.parcial}; border:1px dashed ${C.parcial}; }
.cj-chip-no{ color:${C.noconf}; border:1px dashed ${C.noconf}; }
.cj-hechos-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:12px; }
.cj-hecho{ background:${C.panel}; border-radius:8px; padding:12px 16px; }
.cj-hecho-top{ display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap; }
.cj-hecho-fuente{ font-size:11px; color:${C.dim}; }
.cj-hecho p{ font-size:13.5px; line-height:1.5; margin:0; }
.cj-hecho-nota{ color:${C.dim}; font-size:12px; margin-top:6px !important; }
.cj-operativo{ background:${C.panel}; border-radius:10px; padding:18px; display:flex; flex-direction:column; gap:14px; }
.cj-operativo-resumen{ font-size:14.5px; line-height:1.6; margin:0; }
.cj-operativo-cifra{ background:${C.panel2}; border-radius:8px; padding:12px 16px; }
.cj-operativo-cifra-num{ font-family:'IBM Plex Mono',monospace; font-size:20px; color:${C.primario}; margin-right:10px; }
.cj-operativo-cifra p{ font-size:12px; color:${C.dim}; line-height:1.5; margin:8px 0 0; }
.cj-nombres{ font-size:12px; color:${C.dim}; line-height:1.6; }
.cj-nombres-label{ display:block; margin-bottom:4px; }
.cj-nombres-lista{ color:${C.paper}; }
.cj-nav{ position:sticky; top:0; z-index:20; display:flex; gap:4px; overflow-x:auto; padding:10px 20px; max-width:940px; margin:0 auto 8px; background:rgba(20,18,12,.92); backdrop-filter:blur(8px); border-bottom:1px solid ${C.line}; }
.cj-nav-a{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.04em; color:${C.dim}; text-decoration:none; padding:6px 10px; border-radius:999px; white-space:nowrap; border:1px solid transparent; }
.cj-nav-a:hover{ color:${C.paper}; }
.cj-nav-a.on{ color:${C.primario}; border-color:${C.primario}; background:rgba(212,189,43,.08); }
.cj-toggle{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; padding:7px 12px; border-radius:999px; border:1px solid ${C.line}; background:${C.panel2}; color:${C.dim}; cursor:pointer; white-space:nowrap; }
.cj-toggle:hover{ color:${C.paper}; border-color:${C.dim}; }
.cj-toggle.on{ color:${C.primario}; border-color:${C.primario}; background:rgba(212,189,43,.10); }
.cj-pistas-bar{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-bottom:14px; }
.cj-pistas-hint{ font-size:11.5px; color:${C.dim}; }
.cj-eje{ position:relative; height:34px; margin:0 4px 14px; }
.cj-eje-linea{ position:absolute; left:0; right:0; top:8px; height:1px; background:${C.line}; }
.cj-eje-marca{ position:absolute; top:0; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:3px; }
.cj-eje-marca i{ width:2px; height:16px; background:${C.primario}; display:block; box-shadow:0 0 6px rgba(212,189,43,.55); }
.cj-eje-marca b{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; color:${C.primario}; letter-spacing:.04em; white-space:nowrap; }
.cj-pistas-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:16px; }
.cj-pista{ background:${C.panel}; border-radius:10px; padding:16px; border-top:3px solid ${C.primario}; }
.cj-pista h3{ font-size:14.5px; margin:0 0 12px; }
.cj-pista-track{ display:flex; flex-direction:column; gap:10px; }
.cj-pista-ev{ display:flex; gap:10px; padding:6px 8px; margin:-6px -8px; border-radius:8px; cursor:default; outline:none; transition:background .18s, box-shadow .18s; }
.cj-pista-ev:hover{ background:${C.panel2}; }
.cj-pista-ev-activo{ background:${C.panel2}; box-shadow:inset 3px 0 0 ${C.primario}; }
.cj-pista-dot{ width:9px; height:9px; border-radius:50%; background:${C.dim}; flex-shrink:0; margin-top:5px; transition:transform .18s; }
.cj-pista-ev-sync .cj-pista-dot{ background:${C.primario}; box-shadow:0 0 6px rgba(212,189,43,.6); }
.cj-pista-ev-activo .cj-pista-dot{ transform:scale(1.45); }
.cj-pista-body{ flex:1; }
.cj-pista-fecha{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:${C.dim}; margin-bottom:3px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.cj-pista-body p{ font-size:12.5px; line-height:1.5; margin:0 0 4px; }
.cj-pista-fuente{ font-size:10.5px; color:${C.dim}; }
.cj-pista-vacio{ font-size:12px; color:${C.dim}; font-style:italic; margin:0; }
.cj-casos-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:14px; }
.cj-caso{ background:${C.panel}; border-radius:10px; padding:16px; display:flex; flex-direction:column; gap:10px; transition:box-shadow .2s; }
.cj-caso-on{ box-shadow:inset 0 0 0 1px rgba(212,189,43,.35); }
.cj-caso-top{ display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; width:100%; background:none; border:none; padding:0; cursor:pointer; color:inherit; text-align:left; font-family:inherit; }
.cj-caso-top h4{ font-size:14.5px; margin:0; }
.cj-caso-top-r{ display:flex; align-items:center; gap:8px; }
.cj-caso-caret{ font-family:'IBM Plex Mono',monospace; font-size:15px; color:${C.primario}; font-style:normal; width:16px; text-align:center; }
.cj-caso-resumen{ font-size:13px; line-height:1.5; margin:0; color:${C.paper}; }
.cj-caso-hechos{ display:flex; flex-direction:column; gap:8px; }
.cj-mapa-stage{ display:grid; grid-template-columns:minmax(0,1.9fr) minmax(230px,1fr); gap:18px; align-items:start; }
.cj-mapa-wrap{ background:${C.panel}; border-radius:10px; padding:14px; }
.cj-mapa-svg{ width:100%; height:auto; display:block; }
.cj-prov{ fill:rgba(148,140,120,.16); stroke:${C.bg}; stroke-width:.6; outline:none; transition:fill-opacity .2s, fill .2s, stroke .2s; }
.cj-prov-on{ fill:${C.contrapunto}; cursor:pointer; }
.cj-prov-on:hover{ fill:#6C79B4; }
.cj-prov-sel{ stroke:${C.primario}; stroke-width:1.8; }
.cj-mapa-pie{ display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:center; margin-top:10px; font-size:11.5px; color:${C.dim}; }
.cj-mapa-hov b{ color:${C.primario}; font-family:'IBM Plex Mono',monospace; }
.cj-mapa-hov i{ font-style:italic; }
.cj-mapa-legend{ display:flex; gap:14px; flex-wrap:wrap; align-items:center; font-size:11px; color:${C.dim}; }
.cj-mapa-legend-i{ display:inline-flex; align-items:center; gap:5px; }
.cj-mapa-legend-i i{ width:10px; height:10px; border-radius:2px; display:inline-block; }
.cj-sw-on{ background:${C.contrapunto}; }
.cj-sw-off{ background:rgba(148,140,120,.35); }
.cj-dossier{ background:${C.panel}; border-radius:10px; padding:16px; border-top:3px solid ${C.contrapunto}; }
.cj-dossier-prov{ font-size:16px; font-weight:700; margin-bottom:4px; }
.cj-dossier-big{ font-family:'IBM Plex Mono',monospace; font-size:34px; color:${C.primario}; line-height:1; margin-bottom:12px; }
.cj-dossier-big span{ font-size:12px; color:${C.dim}; margin-left:6px; }
.cj-dossier-rows{ display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
.cj-dossier-row{ display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:12px; color:${C.dim}; border-bottom:1px solid ${C.line}; padding-bottom:5px; }
.cj-dossier-row b{ color:${C.paper}; font-family:'IBM Plex Mono',monospace; }
.cj-dossier-text{ font-size:11.5px; color:${C.dim}; margin:0 0 10px; }
.cj-dossier-nota{ font-size:11.5px; color:${C.dim}; line-height:1.55; margin:0 0 10px; }
.cj-dossier-hint{ font-family:'IBM Plex Mono',monospace; font-size:10px; color:${C.primario}; letter-spacing:.06em; }
.cj-balanza{ background:${C.panel}; border-radius:10px; padding:20px; }
.cj-balanza-bar{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-bottom:10px; }
.cj-balanza-lectura{ font-size:12px; color:${C.dim}; }
.cj-balanza-viga-svg{ width:100%; max-width:380px; display:block; margin:0 auto 18px; }
.cj-balanza-viga{ stroke:${C.contrapunto}; stroke-width:3; stroke-linecap:round; }
.cj-balanza-plato-pt{ fill:${C.contrapunto}; }
.cj-balanza-cnt{ font-family:'IBM Plex Mono',monospace; font-size:11px; fill:${C.paper}; }
.cj-balanza-fulcro{ fill:${C.primario}; }
.cj-balanza-platos{ display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:16px; }
.cj-balanza-plato{ background:${C.panel2}; border-radius:8px; padding:14px; display:flex; flex-direction:column; gap:10px; }
.cj-balanza-plato h4{ margin:0 0 4px; font-size:13px; text-transform:uppercase; letter-spacing:.04em; color:${C.dim}; display:flex; justify-content:space-between; align-items:center; }
.cj-balanza-plato h4 span{ font-family:'IBM Plex Mono',monospace; font-size:18px; color:${C.primario}; }
.cj-balanza-item{ border-top:1px solid ${C.line}; padding-top:8px; transition:opacity .3s, filter .3s; }
.cj-balanza-item:first-of-type{ border-top:none; padding-top:0; }
.cj-balanza-item-off{ opacity:.28; filter:saturate(.3); }
.cj-balanza-item-top{ display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap; }
.cj-balanza-item p{ font-size:12.5px; line-height:1.5; margin:0; color:${C.paper}; }
.cj-balanza-nota{ font-size:12px; color:${C.dim}; line-height:1.55; margin-top:14px; }
.cj-ca-stats{ display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:12px; }
.cj-ca-stats div{ background:${C.panel}; border-radius:8px; padding:12px 14px; text-align:center; }
.cj-ca-stats b{ font-family:'IBM Plex Mono',monospace; font-size:22px; display:block; }
.cj-ca-stats span{ font-size:10px; color:${C.dim}; text-transform:uppercase; letter-spacing:.04em; }
.cj-ca-nota{ font-size:12px; color:${C.dim}; margin-top:10px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.cj-verif-stats{ display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:14px; }
.cj-verif-stats div{ background:${C.panel}; border-radius:8px; padding:14px 16px; text-align:center; }
.cj-verif-stats b{ font-family:'IBM Plex Mono',monospace; font-size:24px; display:block; color:${C.paper}; }
.cj-verif-stats span{ font-size:10.5px; color:${C.dim}; text-transform:uppercase; letter-spacing:.05em; }
.cj-encuesta{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; }
.cj-pregunta{ background:${C.panel}; border:1px solid ${C.line}; border-radius:10px; padding:14px 16px; }
.cj-pregunta p{ font-size:14px; line-height:1.5; margin:0 0 12px; }
.cj-opcion{ display:block; width:100%; text-align:left; margin-bottom:8px; position:relative; overflow:hidden; background:${C.panel2}; color:${C.paper}; border-radius:6px; border:1px solid ${C.line}; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:12.5px; }
.cj-opcion:disabled{ cursor:default; }
.cj-opcion-fill{ position:absolute; inset:0; transition:width .4s; }
.cj-opcion-txt{ position:relative; display:flex; justify-content:space-between; padding:8px 10px; }
.cj-pregunta-total{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:${C.dim}; margin:4px 0 0; }
.cj-referencias{ list-style:none; margin:0 0 20px; padding:0; display:flex; flex-direction:column; gap:8px; }
.cj-referencias li{ font-size:13px; color:${C.dim}; line-height:1.5; }
.cj-referencias b{ color:${C.paper}; }
.cj-conclusion{ font-size:15px; line-height:1.65; border-top:1px solid ${C.line}; padding-top:20px; }
@media (max-width:820px){
  .cj-mapa-stage{ grid-template-columns:1fr; }
}
@media (max-width:640px){
  .cj-eje{ display:none; }
  .cj-nav{ padding:8px 12px; }
}
`;
