import { useEffect, useState } from "react";
import { cargarFuentes } from "../design/tokens";

/* ============================================================================
   YAMACOA · expediente "angel_veliz" — RENDERER CONGELADO
   Movido tres veces, aliviado ninguna: el caso de Angel Jesus Veliz Marcano,
   preso politico del 11J en Camaguey, condenado a 6 anios de prision, con tres
   traslados carcelarios (Kilo 7 -> Kilo 8 -> Kilo 9) que nunca lo devolvieron
   al regimen de minima severidad que perdio al principio, y un patron
   comparable (negacion sistematica de minima severidad y huelgas de hambre
   entre presos politicos cubanos) mostrado SIEMPRE por separado.
   Datos en public/data/angel_veliz.json (validado por angel_veliz.schema.json).
   Paleta "Traslado y Linea Muerta": violeta institucional + contrapunto casi
   acromatico, sobre fondo oscuro.
   Tercer expediente de la serie "Tras las Rejas" (protesta_solitaria, sulmira).
   ========================================================================== */

const C = {
  bg: "#fcf9f4", panel: "#fcf9f4", panel2: "#f5efe7",
  line: "rgba(60,40,20,.15)", paper: "#1f1a16", dim: "#6b5d50",
  primario: "#71397F", contrapunto: "#6B717B",
  corrob: "#127567", noconf: "#8A6410",
};
const DATA_URL = ((typeof process !== "undefined" && process.env && process.env.PUBLIC_URL) || "") + "/data/angel_veliz.json";

const REGIMEN_Y = { minima: 40, media: 140, maxima: 240 };
const REGIMEN_LABEL = { minima: "Mínima severidad", media: "Media severidad", maxima: "Máxima severidad" };

const EMBEDDED = {"meta":{"slug":"angel_veliz","titulo":"Movido tres veces, aliviado ninguna","subtitulo":"Ángel Jesús Véliz Marcano, preso del 11J en Camagüey, condenado a 6 años de prisión: tres traslados carcelarios entre 2021 y 2024, ninguno hacia el régimen de mínima severidad que le habría acercado a la libertad condicional, mientras su madre, exiliada desde 2024, ya no puede comunicarse con él por teléfono.","descripcion":"Ángel Jesús Véliz Marcano es un preso político cubano de la provincia de Camagüey. Participó en las protestas populares del 11 de julio de 2021 (11J), las mayores manifestaciones antigubernamentales en décadas en Cuba. La Policía Nacional Revolucionaria lo detuvo el 18 de julio de 2021 en su propio domicilio, sin tutela judicial.\n\nFue condenado a 6 años de prisión (Causa 265/2021, Expediente de Fase Preparatoria 63/2021 de Camagüey) por los delitos de \"atentado\" y \"desórdenes públicos\". Una variante de \"5 años\" circuló en el material de origen de este expediente, pero no se corroboró en ninguna fuente independiente consultada: se descarta y se usa 6 años como cifra única, respaldada por Prisoners Defenders, CiberCuba, Cubanet y Diario Las Américas. Prisoners Defenders lo incluye en su lista de presos políticos, con ficha propia.\n\nSu historial carcelario muestra una secuencia de traslados sin alivio real. Empezó cumpliendo condena en régimen abierto (asimilable a mínima severidad) en la prisión Kilo 7 de Camagüey. En octubre de 2022 ese régimen le fue revocado y fue trasladado a Kilo 8, después de que las autoridades penitenciarias le hallaran una \"cuchilla multipropósito\". Desde entonces, y hasta hoy, está reportado en la prisión Kilo 9. En ninguno de esos tres puntos ha vuelto a alcanzar el régimen de mínima severidad que perdió al principio: las fuentes documentan una negativa reiterada al pase a ese régimen, citando \"indisciplina\" como motivo. En diciembre de 2022 se reportó que llevaba dos meses recluido en celda de castigo. Su ficha oficial de Prisoners Defenders documenta además problemas de desnutrición.\n\nEl 8 de octubre de 2024 inició una huelga de hambre de aproximadamente 6 días para exigir el régimen de mínima severidad que le habría acercado a la libertad condicional. No existe reporte posterior que confirme que ese beneficio le fue concedido.\n\nSu madre, Ailex Marcano Fabelo, ha sido la principal defensora pública de su causa dentro de Cuba. El 7 u 8 de octubre de 2023, coincidiendo con la visita de un enviado papal a la isla, fue detenida por una citación policial en Camagüey y liberada tras 24 horas. Fue hostigada de nuevo después de un viaje a Europa. En mayo de 2024 se exilió en Estados Unidos, desde donde ha continuado denunciando el caso de su hijo.\n\nEl estado más reciente verificado de este expediente es del 18 de mayo de 2026: el senador estadounidense Rick Scott denunció públicamente que Véliz Marcano lleva \"más de cinco años\" injustamente preso. Ese mismo día, su madre confirmó que sigue cumpliendo la condena de 6 años y que ya no puede comunicarse por teléfono con él, debido a restricciones impuestas en la prisión.\n\nEste expediente se cierra el 31 de julio de 2026, sin que exista información pública para el periodo comprendido entre junio y julio de ese año. Ese vacío se declara aquí de forma explícita: no equivale a que su situación \"siga igual\" ni a ningún otro supuesto tácito, sino a la ausencia documentada de fuentes públicas para ese tramo concreto de tiempo.\n\nEl caso de Véliz Marcano no es aislado. Prisoners Defenders reportó, en su informe de aniversario del 11J del 9 de julio de 2026, un nuevo récord represivo: 1.306 presos políticos en Cuba, de los cuales 752 (el 65%) son manifestantes del 11 de julio de 2021. La misma organización documenta, en sus informes mensuales de octubre de 2025 a julio de 2026, la negación sistemática del régimen de mínima severidad y las huelgas de hambre como forma de protesta entre otros presos políticos, entre ellos Lizandra Góngora, Manuel Velázquez Licea y Juan Enrique Pérez, cuyas condenas exactas no están determinadas por las fuentes consultadas para este expediente.","narracion":"Ángel Jesús Véliz Marcano participó en las protestas del once de julio de dos mil veintiuno, en Camagüey. La policía lo detuvo en su propia casa el dieciocho de julio de ese año, sin orden judicial. Fue condenado a seis años de prisión por atentado y desórdenes públicos; la cifra de cinco años que circuló en algún momento no se pudo confirmar en ninguna fuente independiente y se descarta. Prisoners Defenders lo reconoce como preso político. Empezó cumpliendo condena en régimen abierto, en la prisión Kilo siete; se lo revocaron en octubre de dos mil veintidós, tras hallarle una cuchilla, y lo trasladaron a Kilo ocho. Desde entonces está reportado en Kilo nueve, donde sigue hoy. Ha pasado meses en celda de castigo, sufre desnutrición según su ficha oficial, y las autoridades le han negado, una y otra vez, el régimen de mínima severidad, citando indisciplina. En octubre de dos mil veinticuatro hizo una huelga de hambre de unos seis días para exigir ese beneficio. Su madre, Ailex Marcano Fabelo, fue detenida por veinticuatro horas en Camagüey en octubre de dos mil veintitrés y se exilió en Estados Unidos en mayo de dos mil veinticuatro. En mayo de dos mil veintiséis ella confirmó que ya no puede comunicarse por teléfono con su hijo. No hay información pública sobre su situación entre junio y julio de dos mil veintiséis.","version":"1.0.0","fecha_datos":"2026-07-31","advertencia":"La cifra de \"5 años\" de condena que menciona parte del material de origen no se corrobora en ninguna fuente independiente y se descarta: se usa 6 años como cifra única. No hay información pública para el periodo junio-julio de 2026; ese vacío se declara de forma explícita, no como un tácito \"sigue igual\"."},"intro":{"parrafos":["Ángel Jesús Véliz Marcano, preso político de la provincia de Camagüey, participó en las protestas del 11 de julio de 2021 y fue detenido ocho días después en su propio domicilio, sin tutela judicial. Fue condenado a 6 años de prisión por \"atentado\" y \"desórdenes públicos\".","Desde su condena, ha sido trasladado tres veces: Kilo 7, Kilo 8 y Kilo 9, todas en Camagüey. Solo tocó el régimen abierto una vez, al principio, en Kilo 7; se lo revocaron en octubre de 2022 y, pese a solicitudes documentadas y a una huelga de hambre en 2024, nunca ha vuelto a alcanzar el régimen de mínima severidad.","Su madre, Ailex Marcano Fabelo, defendió su causa en Cuba hasta exiliarse en 2024; en mayo de 2026 confirmó que ya no puede comunicarse por teléfono con su hijo. Este expediente sitúa su caso junto a un patrón más amplio de negación de beneficios penitenciarios entre presos políticos cubanos, y declara de forma explícita el vacío informativo de junio y julio de 2026."]},"caso_indice":{"advertencia":"Los hechos centrales de este caso (identidad, detención, causa penal, condena de 6 años, traslados carcelarios, huelga de hambre y hostigamiento a la madre) están corroborados por Prisoners Defenders y por prensa independiente. La variante de \"5 años\" de condena se descarta explícitamente por falta de corroboración independiente. El periodo junio-julio de 2026 queda marcado como vacío informativo, no como un hecho asentado.","perfil":{"nombre":"Ángel Jesús Véliz Marcano","provincia":"Camagüey","causa_penal":"Causa 265/2021, Expediente de Fase Preparatoria (EFP) 63/2021, Camagüey, por \"atentado\" y \"desórdenes públicos\"","condena":"6 años de prisión (la variante de \"5 años\" que circuló en el material de origen no se corrobora y se descarta)","prision_actual":"Kilo 9, Camagüey (reportado desde 2022-2024 en adelante)","comunicacion_madre":"Sin comunicación telefónica con su madre desde al menos mayo de 2026, por restricciones impuestas en la prisión, según denuncia de la propia madre."},"hechos":[{"afirmacion":"Participó en las protestas populares del 11 de julio de 2021 (11J).","confianza":"corroborada","fuente":"Prisoners Defenders, CiberCuba (28 de mayo de 2022), Diario de Cuba (julio de 2023)"},{"afirmacion":"Fue detenido el 18 de julio de 2021, sin tutela judicial, en su propio domicilio, por la Policía Nacional Revolucionaria.","confianza":"corroborada","fuente":"Prisoners Defenders (ficha oficial)"},{"afirmacion":"Fue condenado a 6 años de prisión (Causa 265/2021, EFP 63/2021 de Camagüey) por \"atentado\" y \"desórdenes públicos\".","confianza":"corroborada","fuente":"Prisoners Defenders, CiberCuba, Cubanet, Diario Las Américas (18 de mayo de 2026)","nota":"La variante de \"5 años\" que menciona el material de origen no se corrobora en ninguna fuente independiente y se descarta; se usa 6 años como cifra única."},{"afirmacion":"Prisoners Defenders lo incluye en su lista de presos políticos, con ficha propia.","confianza":"corroborada","fuente":"Prisoners Defenders (lista.prisonersdefenders.org/prisioneros/angel-jesus-veliz-marcano/)"},{"afirmacion":"Cumplió inicialmente condena en régimen abierto en la prisión Kilo 7 de Camagüey; ese régimen le fue revocado y fue trasladado a Kilo 8 en octubre de 2022, tras hallarle una \"cuchilla multipropósito\".","confianza":"corroborada","fuente":"Diario Las Américas (20 de octubre de 2022)"},{"afirmacion":"Está reportado en la prisión Kilo 9 desde 2022-2024 en adelante, donde permanece hoy.","confianza":"corroborada","fuente":"Prisoners Defenders, Cubanet, Martí Noticias, ADN Cuba"},{"afirmacion":"Presenta desnutrición, según su ficha oficial de Prisoners Defenders.","confianza":"corroborada","fuente":"Prisoners Defenders (ficha oficial)"},{"afirmacion":"Pasó periodos prolongados en celda de castigo: en diciembre de 2022 se reportó que llevaba dos meses recluido en esas condiciones.","confianza":"corroborada","fuente":"CiberCuba (20 de diciembre de 2022)"},{"afirmacion":"Las autoridades le han negado de forma reiterada el pase al régimen de mínima severidad, citando \"indisciplina\" como motivo.","confianza":"corroborada","fuente":"Cubanet, ADN Cuba","nota":"Episodios repetidos, sin fechas individuales documentadas por las fuentes: se presentan como un patrón, no como un incidente único."},{"afirmacion":"Inició una huelga de hambre el 8 de octubre de 2024, de aproximadamente 6 días, para exigir el régimen de mínima severidad.","confianza":"corroborada","fuente":"Cubanet, ADN Cuba"},{"afirmacion":"Su madre, Ailex Marcano Fabelo, fue detenida por citación policial en Camagüey el 7 u 8 de octubre de 2023, coincidiendo con la visita de un enviado papal, y liberada tras 24 horas.","confianza":"corroborada","fuente":"Diario de Cuba, CiberCuba, Martí Noticias"},{"afirmacion":"Su madre fue hostigada de nuevo después de un viaje a Europa.","confianza":"corroborada","fuente":"ADN Cuba"},{"afirmacion":"Su madre se exilió en Estados Unidos en mayo de 2024.","confianza":"corroborada","fuente":"ADN Cuba, Diario de Cuba"},{"afirmacion":"El senador estadounidense Rick Scott denunció, el 18 de mayo de 2026, que Véliz Marcano lleva \"más de cinco años\" injustamente preso.","confianza":"corroborada","fuente":"Diario Las Américas (18 de mayo de 2026)"},{"afirmacion":"Su madre confirmó, en esa misma fecha, que sigue cumpliendo la condena de 6 años y que ya no puede comunicarse por teléfono con él, por restricciones en la prisión.","confianza":"corroborada","fuente":"Diario Las Américas (18 de mayo de 2026, declaración de la madre)"},{"afirmacion":"No existe información pública localizada para el periodo junio-julio de 2026: este expediente lo declara de forma explícita como un vacío informativo, no como un hecho asentado.","confianza":"corroborada","fuente":"Verificación directa de Yamacoa: sin fuente pública localizada entre el informe de mayo de 2026 y la fecha de cierre de este expediente (31 de julio de 2026)"}],"linea_tiempo":[{"fecha":"11 de julio de 2021","detalle":"Participa en las protestas populares del 11J en Camagüey.","confianza":"corroborada","fuente":"Prisoners Defenders, CiberCuba, Diario de Cuba","carril":"hijo","es_denegacion":false,"es_vacio_informativo":false},{"fecha":"18 de julio de 2021","detalle":"Detenido en su domicilio por la Policía Nacional Revolucionaria, sin tutela judicial.","confianza":"corroborada","fuente":"Prisoners Defenders (ficha oficial)","carril":"hijo","es_denegacion":false,"es_vacio_informativo":false},{"fecha":"2021-2022 (fecha exacta no precisada)","detalle":"Condenado a 6 años de prisión (Causa 265/2021, EFP 63/2021); comienza a cumplir condena en régimen abierto en la prisión Kilo 7.","confianza":"corroborada","fuente":"Prisoners Defenders, CiberCuba, Cubanet, Diario Las Américas","carril":"hijo","es_denegacion":false,"es_vacio_informativo":false},{"fecha":"octubre de 2022","detalle":"Le revocan el régimen abierto tras hallarle una \"cuchilla multipropósito\" y lo trasladan a la prisión Kilo 8.","confianza":"corroborada","fuente":"Diario Las Américas (20 de octubre de 2022)","carril":"hijo","es_denegacion":false,"es_vacio_informativo":false},{"fecha":"diciembre de 2022","detalle":"Reportado con dos meses de reclusión en celda de castigo.","confianza":"corroborada","fuente":"CiberCuba (20 de diciembre de 2022)","carril":"hijo","es_denegacion":false,"es_vacio_informativo":false},{"fecha":"2022-2024 en adelante","detalle":"Reportado en la prisión Kilo 9, donde permanece hoy.","confianza":"corroborada","fuente":"Prisoners Defenders, Cubanet, Martí Noticias, ADN Cuba","carril":"hijo","es_denegacion":false,"es_vacio_informativo":false},{"fecha":"2023-2024 (episodios reiterados, sin fecha única)","detalle":"Negativa reiterada de las autoridades penitenciarias al pase al régimen de mínima severidad, citando \"indisciplina\".","confianza":"corroborada","fuente":"Cubanet, ADN Cuba","carril":"hijo","es_denegacion":true,"es_vacio_informativo":false},{"fecha":"8 de octubre de 2024","detalle":"Inicia una huelga de hambre de aproximadamente 6 días para exigir el régimen de mínima severidad.","confianza":"corroborada","fuente":"Cubanet, ADN Cuba","carril":"hijo","es_denegacion":false,"es_vacio_informativo":false,"nota":"No existe reporte posterior que confirme que el beneficio le fue concedido."},{"fecha":"junio-julio de 2026","detalle":"Sin información pública localizada para este periodo: vacío informativo declarado de forma explícita, no un tácito \"sigue igual\".","confianza":"corroborada","fuente":"Verificación directa de Yamacoa, sin fuente pública localizada","carril":"hijo","es_denegacion":false,"es_vacio_informativo":true},{"fecha":"7-8 de octubre de 2023","detalle":"Ailex Marcano Fabelo, madre de Ángel Jesús, es detenida por citación policial en Camagüey, coincidiendo con la visita de un enviado papal; liberada tras 24 horas.","confianza":"corroborada","fuente":"Diario de Cuba, CiberCuba, Martí Noticias","carril":"madre","es_denegacion":false,"es_vacio_informativo":false},{"fecha":"2023-2024 (fecha exacta no precisada)","detalle":"Es hostigada de nuevo por las autoridades tras un viaje a Europa.","confianza":"corroborada","fuente":"ADN Cuba","carril":"madre","es_denegacion":false,"es_vacio_informativo":false},{"fecha":"mayo de 2024","detalle":"Se exilia en Estados Unidos, desde donde continúa denunciando el caso de su hijo.","confianza":"corroborada","fuente":"ADN Cuba, Diario de Cuba","carril":"madre","es_denegacion":false,"es_vacio_informativo":false},{"fecha":"18 de mayo de 2026","detalle":"Confirma que ya no puede comunicarse por teléfono con su hijo, por restricciones impuestas en la prisión, mientras el senador estadounidense Rick Scott denuncia el caso.","confianza":"corroborada","fuente":"Diario Las Américas (18 de mayo de 2026)","carril":"madre","es_denegacion":false,"es_vacio_informativo":false}],"traslados":[{"prision":"Kilo 7","fecha":"2021-2022 (régimen abierto, revocado en octubre de 2022)","regimen":"minima","detalle":"Reclusión inicial en régimen abierto, asimilable a mínima severidad, antes de que existiera ninguna solicitud documentada de beneficio penitenciario.","confianza":"corroborada","fuente":"Diario Las Américas (20 de octubre de 2022)"},{"prision":"Kilo 8","fecha":"octubre de 2022","regimen":"media","detalle":"Trasladado tras la revocación del régimen abierto en Kilo 7, después de hallarle una \"cuchilla multipropósito\".","confianza":"corroborada","fuente":"Diario Las Américas (20 de octubre de 2022)","nota":"Las fuentes no usan la etiqueta jurídica exacta \"régimen medio\"; se representa aquí como \"media\" por precaución, evitando la etiqueta más severa \"máxima\" que ninguna fuente emplea literalmente."},{"prision":"Kilo 9","fecha":"2022-2024 en adelante (donde permanece hoy)","regimen":"media","detalle":"Reportado en Kilo 9 desde 2022-2024; niega el régimen de mínima severidad pese a solicitudes documentadas y a una huelga de hambre en 2024.","confianza":"corroborada","fuente":"Prisoners Defenders, Cubanet, Martí Noticias, ADN Cuba","nota":"Igual que en Kilo 8, la clasificación exacta de régimen no está declarada en esos términos jurídicos por las fuentes: se representa como \"media\", no \"máxima\", por precaución editorial."}]},"verificadores":{"organizaciones":[{"nombre":"Prisoners Defenders","rol_reconocimiento":"Mantiene la ficha oficial del caso, lo reconoce como preso político y documenta sus traslados carcelarios y el patrón de negación de mínima severidad en informes mensuales.","fuente":"Prisoners Defenders (ficha oficial, lista.prisonersdefenders.org)"},{"nombre":"CiberCuba","rol_reconocimiento":"Cobertura de su participación en el 11J, la reclusión en celda de castigo (diciembre de 2022) y la citación policial a su madre.","fuente":"CiberCuba"},{"nombre":"Diario Las Américas","rol_reconocimiento":"Cobertura de la revocación del régimen abierto y el traslado a Kilo 8 (octubre de 2022), y del estado más reciente del caso, incluida la denuncia del senador Rick Scott (mayo de 2026).","fuente":"Diario Las Américas"},{"nombre":"Cubanet","rol_reconocimiento":"Cobertura de la negativa reiterada al régimen de mínima severidad y de la huelga de hambre de octubre de 2024.","fuente":"Cubanet"},{"nombre":"ADN Cuba","rol_reconocimiento":"Cobertura de la huelga de hambre, el hostigamiento a la madre tras su viaje a Europa, y los casos comparables de Manuel Velázquez Licea y Juan Enrique Pérez.","fuente":"ADN Cuba"},{"nombre":"Martí Noticias","rol_reconocimiento":"Cobertura de la citación policial a la madre en octubre de 2023 y de la reclusión en Kilo 9.","fuente":"Martí Noticias"},{"nombre":"Diario de Cuba","rol_reconocimiento":"Cobertura de la citación policial a la madre, coincidiendo con la visita de un enviado papal en octubre de 2023.","fuente":"Diario de Cuba"}]},"patron":{"texto":"La negación sistemática del régimen de mínima severidad y las huelgas de hambre como forma de protesta no son un fenómeno aislado del caso de Ángel Jesús Véliz Marcano: Prisoners Defenders documenta el mismo patrón contra otros presos políticos en sus informes mensuales de octubre de 2025 a julio de 2026, sobre el trasfondo de que la mayoría de los presos políticos cubanos hoy son manifestantes del 11J.","cifras":{"presos_politicos_totales":1306,"presos_11j":752,"porcentaje_11j":65,"fecha_pd":"9 de julio de 2026 (informe de aniversario del 11J)","nota_metodologica":"Cifra de Prisoners Defenders del informe de aniversario del 11J (9 de julio de 2026): 1.306 presos políticos totales en Cuba, de los cuales 752 (65%) son manifestantes del 11 de julio de 2021. Esta cifra de nivel patrón nunca se fusiona con el caso individual de Véliz Marcano: no se usa para inferir nada sobre su expediente penal específico, solo para dimensionar el fenómeno del que forma parte."},"casos_comparables":[{"nombre":"Ángel Jesús Véliz Marcano (caso índice)","situacion":"Condenado por \"atentado\" y \"desórdenes públicos\"; niega el régimen de mínima severidad desde 2022.","condena_anios":6,"condena_texto":"6 años","fecha":"2021-2022","fuente":"Prisoners Defenders, CiberCuba, Cubanet, Diario Las Américas","confianza":"corroborada"},{"nombre":"Lizandra Góngora","situacion":"Huelga de hambre en abril de 2026 para exigir mejores condiciones y beneficios penitenciarios.","condena_anios":null,"condena_texto":"Condena no determinada por las fuentes consultadas para este expediente.","fecha":"abril de 2026","fuente":"Diario de Cuba, Martí Noticias, CiberCuba","confianza":"corroborada"},{"nombre":"Manuel Velázquez Licea","situacion":"Negación documentada de beneficios penitenciarios, incluido el régimen de mínima severidad.","condena_anios":null,"condena_texto":"Condena no determinada por las fuentes consultadas para este expediente.","fecha":"2025-2026 (fecha exacta no precisada)","fuente":"ADN Cuba","confianza":"corroborada"},{"nombre":"Juan Enrique Pérez","situacion":"Negación documentada de beneficios penitenciarios, incluido el régimen de mínima severidad.","condena_anios":null,"condena_texto":"Condena no determinada por las fuentes consultadas para este expediente.","fecha":"2025-2026 (fecha exacta no precisada)","fuente":"ADN Cuba","confianza":"corroborada"}]},"verificacion":{"total_evaluadas":22,"corroboradas":21,"no_confirmadas":0,"excluidas":1,"nota":"Se evaluaron 16 afirmaciones a nivel del caso índice (todas corroboradas por Prisoners Defenders y prensa independiente), 1 afirmación de nivel patrón (cifras de Prisoners Defenders sobre el 11J, corroborada) y 4 casos comparables (corroborados en lo documentado, aunque tres de ellos no tienen condena exacta determinada por las fuentes consultadas: se declara así en vez de inventar un número). Se excluyó 1 afirmación del material de origen: la variante de \"5 años\" de condena, que no se corrobora en ninguna fuente independiente. El periodo junio-julio de 2026 no se cuenta como afirmación no confirmada, sino como vacío informativo declarado de forma explícita."},"encuesta":{"preguntas":[{"id":"traslados","texto":"¿Te parece que trasladar a un preso político de cárcel en cárcel, sin cambiar nunca su régimen penitenciario, equivale a mejorar sus condiciones?","opciones":["No, es solo cambiar el lugar del mismo castigo","Depende de las condiciones específicas de cada prisión","Sí, si implica menos hacinamiento"]},{"id":"silencio","texto":"La madre de Ángel Jesús Véliz Marcano denunció en mayo de 2026 que ya no puede comunicarse con él por teléfono. ¿Qué tan grave te parece cortar la comunicación telefónica de un preso con su familia?","opciones":["Gravísimo: es una forma más de castigo","Grave, pero puede tener otra explicación operativa","No tengo suficiente información para opinar"]},{"id":"cifras_once_j","texto":"Prisoners Defenders reporta que el 65% de los presos políticos actuales en Cuba (752 de 1.306) son manifestantes del 11 de julio de 2021. ¿Qué te parece más relevante de esta cifra?","opciones":["Que casi cinco años después siguen presos por protestar una vez","El tamaño total (1.306), más allá del origen 11J","Que se necesita un desglose provincia por provincia"]}]},"referencias":[{"fuente":"Prisoners Defenders","detalle":"Ficha oficial del caso de Ángel Jesús Véliz Marcano, reconocimiento como preso político e informe de aniversario del 11J (julio de 2026) sobre presos políticos en Cuba","fecha":"2021-2026"},{"fuente":"CiberCuba","detalle":"Cobertura de la participación en el 11J, la reclusión en celda de castigo y la citación policial a la madre","fecha":"2022-2023"},{"fuente":"Cubanet","detalle":"Cobertura de la negativa reiterada al régimen de mínima severidad y de la huelga de hambre de octubre de 2024","fecha":"2022-2024"},{"fuente":"Diario de Cuba","detalle":"Cobertura de la condena, del caso y de la citación policial a la madre en octubre de 2023","fecha":"2023"},{"fuente":"Diario Las Américas","detalle":"Cobertura del traslado carcelario de 2022 y del estado más reciente del caso, incluida la denuncia del senador Rick Scott","fecha":"2022 y mayo de 2026"},{"fuente":"Martí Noticias","detalle":"Cobertura de la citación policial a la madre y de la reclusión en Kilo 9","fecha":"2023-2024"},{"fuente":"ADN Cuba","detalle":"Cobertura de la huelga de hambre, el hostigamiento a la madre y los casos comparables de Manuel Velázquez Licea y Juan Enrique Pérez","fecha":"2024-2026"}],"conclusion":"Ángel Jesús Véliz Marcano ha sido trasladado tres veces desde su condena: Kilo 7, Kilo 8, Kilo 9. Ninguno de esos traslados lo acercó al régimen de mínima severidad que perdió al principio, en octubre de 2022, ni siquiera después de solicitudes documentadas y de una huelga de hambre de seis días. Casi cinco años después de su detención, sigue cumpliendo una condena de 6 años en Camagüey, mientras su madre, que ya tuvo que exiliarse por defenderlo, denuncia desde mayo de 2026 que ni siquiera puede escuchar su voz por teléfono. Su caso comparte cargo, provincia y patrón con al menos otros tres presos políticos cuya condena exacta no está determinada por las fuentes consultadas, y con el 65% de los presos políticos cubanos actuales que, como él, siguen presos por haber salido a la calle el 11 de julio de 2021. Este expediente documenta lo corroborado con su fuente a la vista, y declara sin rodeos el vacío informativo de junio y julio de 2026: no hay dato donde no hay dato."};

function SecHead({ n, t, d }) {
  return (<div className="av-sec-head"><span className="av-sec-num">{n}</span><h2>{t}</h2>{d && <p>{d}</p>}</div>);
}

function Chip({ estado, nota }) {
  const ok = estado === "corroborada";
  return (
    <span className={"av-chip " + (ok ? "av-chip-ok" : "av-chip-no")} title={nota || ""}>
      {ok ? "corroborada" : "no confirmada"}
    </span>
  );
}

function Hecho({ h }) {
  return (
    <div className="av-hecho">
      <div className="av-hecho-top"><Chip estado={h.confianza} nota={h.nota} /><span className="av-hecho-fuente">{h.fuente}</span></div>
      <p>{h.afirmacion}</p>
      {h.nota && <p className="av-hecho-nota">{h.nota}</p>}
    </div>
  );
}

function PlanoTrayecto({ traslados, denegaciones }) {
  const W = 720, H = 280;
  const xs = traslados.map((_, i) => 60 + i * ((W - 120) / (traslados.length - 1)));
  const pts = traslados.map((t, i) => ({ x: xs[i], y: REGIMEN_Y[t.regimen], t }));
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p.x + "," + p.y).join(" ");
  const lastX = xs[xs.length - 1];
  const prevX = xs[Math.max(0, xs.length - 2)];
  const stampX = (prevX + lastX) / 2;
  return (
    <div className="av-plano-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="av-plano-svg" role="img" aria-label="Plano de trayecto: eje horizontal los traslados carcelarios, eje vertical el regimen penitenciario">
        {Object.entries(REGIMEN_Y).map(([k, y]) => (
          <g key={k}>
            <line x1={20} x2={W - 20} y1={y} y2={y} className="av-plano-grid" />
            <text x={16} y={y + 4} textAnchor="end" className="av-plano-eje">{REGIMEN_LABEL[k]}</text>
          </g>
        ))}
        <path d={path} className="av-plano-linea" fill="none" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={7} className="av-plano-punto" />
            <text x={p.x} y={H - 6} textAnchor="middle" className="av-plano-prision">{p.t.prision}</text>
            <text x={p.x} y={H - 20} textAnchor="middle" className="av-plano-fecha">{p.t.fecha.split(" (")[0]}</text>
          </g>
        ))}
        {denegaciones.map((d, i) => (
          <g key={i} transform={`translate(${stampX}, ${REGIMEN_Y.minima - 26 - i * 30}) rotate(-6)`}>
            <rect x={-52} y={-14} width={104} height={26} rx={3} className="av-plano-sello-rect" />
            <text x={0} y={5} textAnchor="middle" className="av-plano-sello-txt">DENEGADO</text>
          </g>
        ))}
      </svg>
      <p className="av-plano-nota">Solo tocó el régimen de mínima severidad una vez, al principio, en Kilo 7. Cada solicitud documentada de recuperarlo, después, quedó marcada como denegada; la línea nunca volvió a subir.</p>
    </div>
  );
}

function CarrilColumna({ titulo, eventos }) {
  return (
    <div className="av-carril">
      <h3 className="av-carril-titulo">{titulo}</h3>
      <div className="av-timeline">
        {eventos.map((e, i) => (
          <div className="av-tl-row" key={i}>
            <div className="av-tl-axis">
              <span className="av-tl-dot" />
              {i < eventos.length - 1 && <span className="av-tl-conn" />}
            </div>
            <div className="av-tl-body">
              <div className="av-tl-fecha">
                {e.fecha}
                {e.es_denegacion && <span className="av-sello av-sello-tl">DENEGADO</span>}
                {e.es_vacio_informativo && <span className="av-sello av-sello-vacio">VACÍO INFORMATIVO</span>}
              </div>
              <p>{e.detalle}</p>
              <div className="av-tl-meta"><Chip estado={e.confianza} nota={e.nota} /><span className="av-tl-fuente">{e.fuente}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilaSellosVerificadores({ organizaciones }) {
  const angulos = [-4, 3, -3, 4, -2, 2, -5];
  return (
    <div className="av-sellos-fila">
      {organizaciones.map((o, i) => (
        <div className="av-sello-org" style={{ transform: `rotate(${angulos[i % angulos.length]}deg)` }} key={o.nombre}>
          <b className="av-sello-org-nombre">{o.nombre}</b>
          <span className="av-sello-org-rol">{o.rol_reconocimiento}</span>
        </div>
      ))}
    </div>
  );
}

function WaffleOnceJ({ cifras }) {
  const N = 100;
  const proporcion = Math.round((cifras.presos_11j / cifras.presos_politicos_totales) * N);
  const celdas = Array.from({ length: N }, (_, i) => i < proporcion);
  return (
    <div className="av-waffle-wrap">
      <div className="av-waffle" role="img" aria-label={`${cifras.presos_11j} presos del 11J de ${cifras.presos_politicos_totales} presos politicos totales, normalizado a 100 celdas`}>
        {celdas.map((es11j, i) => <span key={i} className={"av-cell" + (es11j ? " av-cell-11j" : "")} />)}
      </div>
      <div className="av-waffle-legend">
        <p><b>{cifras.presos_11j.toLocaleString("es")}</b> presos del 11J entre <b>{cifras.presos_politicos_totales.toLocaleString("es")}</b> presos políticos ({cifras.porcentaje_11j}%) — Prisoners Defenders, {cifras.fecha_pd}</p>
        <p className="av-waffle-nota">{cifras.nota_metodologica}</p>
      </div>
    </div>
  );
}

function BarraComparables({ casos }) {
  const conocidos = casos.filter((c) => c.condena_anios != null).map((c) => c.condena_anios);
  const max = conocidos.length ? Math.max(...conocidos) : 1;
  return (
    <div className="av-barras">
      {casos.map((c) => {
        const esIndice = c.nombre.indexOf("caso índice") !== -1;
        const conocida = c.condena_anios != null;
        return (
          <div className="av-barra-row" key={c.nombre}>
            <span className="av-barra-label">{c.nombre}<i>{c.situacion} · {c.fecha}</i></span>
            <span className="av-barra-track">
              {conocida ? (
                <span className={"av-barra-fill" + (esIndice ? " av-barra-fill-indice" : "")} style={{ width: (c.condena_anios / max) * 100 + "%" }}>
                  <b>{c.condena_texto}</b>
                </span>
              ) : (
                <span className="av-barra-sindato"><b>{c.condena_texto}</b></span>
              )}
            </span>
            <Chip estado={c.confianza} nota={c.fuente} />
          </div>
        );
      })}
    </div>
  );
}

function Encuesta({ datos }) {
  const CLAVE = "yamacoa_angel_veliz_votos";
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
      sb.rpc("angel_veliz_totales").then(({ data }) => { if (data) setVotos((v) => ({ ...v, ...data })); }).catch(() => {});
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
    if (sb && sb.rpc) sb.rpc("angel_veliz_votar", { p_pregunta: pid, p_opcion: opcion }).catch(() => {});
  };
  return (
    <div className="av-encuesta">
      {datos.preguntas.map((q) => {
        const conteo = votos[q.id] || {};
        const total = Object.values(conteo).reduce((a, b) => a + b, 0);
        const votado = miVoto[q.id] != null;
        return (
          <div className="av-pregunta" key={q.id}>
            <p>{q.texto}</p>
            {q.opciones.map((op) => {
              const n = conteo[op] || 0;
              const pct = total ? Math.round((n / total) * 100) : 0;
              const elegida = miVoto[q.id] === op;
              return (
                <button key={op} className="av-opcion" disabled={votado} onClick={() => votar(q.id, op)}>
                  <span className="av-opcion-fill" style={{ width: votado ? pct + "%" : 0, background: elegida ? "rgba(113,57,127,.22)" : "rgba(107,93,80,.14)" }} />
                  <span className="av-opcion-txt"><span>{elegida ? "✓ " : ""}{op}</span>{votado && <span>{pct}%</span>}</span>
                </button>
              );
            })}
            <p className="av-pregunta-total">{total} voto{total === 1 ? "" : "s"}</p>
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
  const eventosHijo = data.caso_indice.linea_tiempo.filter((e) => e.carril === "hijo");
  const eventosMadre = data.caso_indice.linea_tiempo.filter((e) => e.carril === "madre");
  const denegaciones = eventosHijo.filter((e) => e.es_denegacion);

  return (
    <div className="av-root">
      <style>{CSS}</style>

      <header className="av-hero">
        <span className="av-eyebrow">TRAS LAS REJAS · CASO Y PATRÓN</span>
        <h1>{m.titulo}</h1>
        <p className="av-subtitulo">{m.subtitulo}</p>
        <div className="av-advertencia">⚠ {m.advertencia}</div>
      </header>

      <main className="av-main">
        <section>
          <SecHead n="00" t="Un caso, un patrón — nunca la misma cifra" />
          {data.intro.parrafos.map((p, i) => <p className="av-parrafo" key={i}>{p}</p>)}
        </section>

        <section>
          <SecHead n="01" t="El caso índice: Ángel Jesús Véliz Marcano" d={data.caso_indice.advertencia} />
          <div className="av-perfil">
            <b>{data.caso_indice.perfil.nombre}</b>
            <p>{data.caso_indice.perfil.provincia} · {data.caso_indice.perfil.causa_penal}</p>
            <p>{data.caso_indice.perfil.condena}</p>
            <p>Reclusión actual: {data.caso_indice.perfil.prision_actual}</p>
            <p className="av-perfil-madre">{data.caso_indice.perfil.comunicacion_madre}</p>
          </div>
          <div className="av-hechos-grid">
            {data.caso_indice.hechos.map((h, i) => <Hecho h={h} key={i} />)}
          </div>
        </section>

        <section>
          <SecHead n="02" t="El plano de trayecto: tres cárceles, un solo nivel" d="Eje horizontal: los traslados forzosos. Eje vertical: el régimen penitenciario. Moverlo de celda nunca fue lo mismo que aliviarlo." />
          <PlanoTrayecto traslados={data.caso_indice.traslados} denegaciones={denegaciones} />
        </section>

        <section>
          <SecHead n="03" t="Dos carriles: el hijo preso, la madre exiliada" d="La cronología de Ángel Jesús en prisión y la de su madre, Ailex Marcano Fabelo, fuera de ella, convergen hoy en el mismo silencio telefónico." />
          <div className="av-carriles">
            <CarrilColumna titulo="Ángel Jesús (en prisión)" eventos={eventosHijo} />
            <CarrilColumna titulo="Ailex Marcano Fabelo (madre, exiliada)" eventos={eventosMadre} />
          </div>
        </section>

        <section>
          <SecHead n="04" t="Quién documenta este caso" d="Siete organizaciones y medios independientes, cada uno con su propia cobertura." />
          <FilaSellosVerificadores organizaciones={data.verificadores.organizaciones} />
        </section>

        <section>
          <SecHead n="05" t="El patrón: presos del 11J, casi cinco años después" d={data.patron.texto} />
          <WaffleOnceJ cifras={data.patron.cifras} />
        </section>

        <section>
          <SecHead n="06" t="Condenas comparadas, donde se conocen" d="Véliz Marcano junto a otros tres presos políticos con el mismo patrón de negación de beneficios; donde la condena exacta no está determinada, se declara así en vez de inventar un número." />
          <BarraComparables casos={data.patron.casos_comparables} />
        </section>

        <section>
          <SecHead n="07" t="Cómo se verificó este expediente" d={v.nota} />
          <div className="av-verif-stats">
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
          <ul className="av-referencias">
            {data.referencias.map((r, i) => <li key={i}><b>{r.fuente}</b> — {r.detalle}{r.fecha ? ` (${r.fecha})` : ""}</li>)}
          </ul>
          <p className="av-conclusion">{data.conclusion}</p>
        </section>
      </main>
    </div>
  );
}

const CSS = `
.av-root{ background:transparent; color:${C.paper}; font-family:'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif; min-height:100vh; --sh:var(--y-shadow,0 1px 2px rgba(40,25,10,.04),0 10px 30px rgba(40,25,10,.055)); }
.av-root *{ box-sizing:border-box; }
.av-hero{ padding:48px 20px 28px; max-width:920px; margin:0 auto; }
.av-eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.14em; color:${C.primario}; }
.av-hero h1{ font-size:clamp(28px,5vw,44px); margin:10px 0 8px; line-height:1.1; }
.av-subtitulo{ color:${C.dim}; font-size:16px; max-width:680px; line-height:1.5; }
.av-advertencia{ margin-top:18px; background:${C.panel}; border:1px solid ${C.primario}; border-radius:16px; padding:12px 16px; font-size:13.5px; line-height:1.5; }
.av-main{ max-width:920px; margin:0 auto; padding:0 20px 80px; }
.av-main section{ margin-top:52px; }
.av-sec-head{ margin-bottom:16px; }
.av-sec-num{ font-family:'IBM Plex Mono',monospace; font-size:11px; color:${C.dim}; letter-spacing:.1em; }
.av-sec-head h2{ font-size:22px; margin:4px 0 6px; }
.av-sec-head p{ color:${C.dim}; font-size:13.5px; line-height:1.5; margin:0; }
.av-parrafo{ font-size:15px; line-height:1.65; margin:0 0 14px; }
.av-chip{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; text-transform:uppercase; letter-spacing:.07em; padding:2px 7px; border-radius:999px; white-space:nowrap; }
.av-chip-ok{ color:${C.corrob}; border:1px solid ${C.corrob}; }
.av-chip-no{ color:${C.noconf}; border:1px dashed ${C.noconf}; }
.av-perfil{ background:${C.panel}; box-shadow:var(--sh); border-radius:20px; padding:14px 18px; margin-bottom:16px; }
.av-perfil p{ color:${C.dim}; font-size:13px; margin:4px 0 0; }
.av-perfil-madre{ color:${C.paper} !important; margin-top:8px !important; padding-top:8px; border-top:1px solid ${C.line}; }
.av-hechos-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:12px; }
.av-hecho{ background:${C.panel}; box-shadow:var(--sh); border-radius:20px; padding:12px 16px; }
.av-hecho-top{ display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap; }
.av-hecho-fuente{ font-size:11px; color:${C.dim}; }
.av-hecho p{ font-size:13.5px; line-height:1.5; margin:0; }
.av-hecho-nota{ color:${C.dim}; font-size:12px; margin-top:6px !important; }
.av-plano-wrap{ background:${C.panel}; box-shadow:var(--sh); border-radius:24px; padding:18px; }
.av-plano-svg{ width:100%; height:auto; }
.av-plano-grid{ stroke:${C.line}; stroke-width:1; }
.av-plano-eje{ font-family:'IBM Plex Mono',monospace; font-size:11px; fill:${C.dim}; }
.av-plano-linea{ stroke:${C.primario}; stroke-width:3; }
.av-plano-punto{ fill:${C.primario}; stroke:${C.bg}; stroke-width:2; }
.av-plano-prision{ font-family:'IBM Plex Mono',monospace; font-size:12px; font-weight:600; fill:${C.paper}; }
.av-plano-fecha{ font-family:'IBM Plex Mono',monospace; font-size:9.5px; fill:${C.dim}; }
.av-plano-sello-rect{ fill:none; stroke:${C.contrapunto}; stroke-width:2; }
.av-plano-sello-txt{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.1em; fill:${C.contrapunto}; }
.av-plano-nota{ color:${C.dim}; font-size:12.5px; line-height:1.5; margin:12px 0 0; }
.av-carriles{ display:grid; grid-template-columns:1fr 1fr; gap:24px; }
.av-carril-titulo{ font-size:14px; color:${C.primario}; margin:0 0 14px; text-transform:uppercase; letter-spacing:.04em; }
.av-timeline{ position:relative; padding-left:6px; }
.av-tl-row{ display:flex; gap:14px; }
.av-tl-axis{ display:flex; flex-direction:column; align-items:center; width:14px; flex-shrink:0; }
.av-tl-dot{ width:11px; height:11px; border-radius:50%; background:${C.primario}; flex-shrink:0; }
.av-tl-conn{ width:2px; flex:1; background:${C.primario}; min-height:36px; opacity:.6; }
.av-tl-body{ padding-bottom:22px; flex:1; }
.av-tl-fecha{ font-family:'IBM Plex Mono',monospace; font-size:11.5px; color:${C.dim}; margin-bottom:4px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.av-tl-body p{ font-size:13.5px; line-height:1.5; margin:0 0 6px; }
.av-tl-meta{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.av-tl-fuente{ font-size:11px; color:${C.dim}; }
.av-sello{ display:inline-block; font-family:'IBM Plex Mono',monospace; font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; padding:2px 8px; border:2px solid ${C.contrapunto}; border-radius:3px; color:${C.contrapunto}; }
.av-sello-tl{ transform:rotate(-5deg); }
.av-sello-vacio{ border-color:${C.noconf}; color:${C.noconf}; transform:rotate(3deg); }
.av-sellos-fila{ display:flex; gap:20px; flex-wrap:wrap; }
.av-sello-org{ border:2px solid ${C.primario}; border-radius:4px; padding:12px 16px; display:flex; flex-direction:column; gap:4px; min-width:170px; max-width:240px; }
.av-sello-org-nombre{ font-family:'IBM Plex Mono',monospace; font-size:12.5px; letter-spacing:.05em; text-transform:uppercase; color:${C.primario}; }
.av-sello-org-rol{ font-size:11.5px; color:${C.dim}; line-height:1.4; }
.av-waffle-wrap{ display:flex; gap:24px; flex-wrap:wrap; align-items:flex-start; background:${C.panel}; box-shadow:var(--sh); border-radius:24px; padding:18px; }
.av-waffle{ display:grid; grid-template-columns:repeat(10,1fr); gap:3px; width:200px; flex-shrink:0; }
.av-cell{ aspect-ratio:1; border-radius:2px; background:${C.panel2}; }
.av-cell-11j{ background:${C.contrapunto}; }
.av-waffle-legend{ flex:1; min-width:220px; }
.av-waffle-legend p{ font-size:14px; line-height:1.5; margin:0 0 8px; }
.av-waffle-legend b{ font-family:'IBM Plex Mono',monospace; color:${C.paper}; }
.av-waffle-nota{ font-size:12px !important; color:${C.dim}; }
.av-barras{ display:flex; flex-direction:column; gap:10px; }
.av-barra-row{ display:grid; grid-template-columns:220px 1fr auto; align-items:center; gap:12px; background:${C.panel}; box-shadow:var(--sh); border-radius:16px; padding:10px 14px; }
.av-barra-label{ font-size:13px; display:flex; flex-direction:column; }
.av-barra-label i{ font-style:normal; font-size:11px; color:${C.dim}; }
.av-barra-track{ position:relative; height:24px; background:${C.panel2}; border-radius:6px; overflow:hidden; display:flex; align-items:center; }
.av-barra-fill{ position:absolute; top:2px; bottom:2px; left:0; background:${C.primario}; border-radius:5px; display:flex; align-items:center; justify-content:flex-end; padding-right:8px; opacity:.75; }
.av-barra-fill-indice{ background:${C.contrapunto}; opacity:1; }
.av-barra-fill b{ color:#fcf9f4; font-family:'IBM Plex Mono',monospace; font-size:11px; white-space:nowrap; }
.av-barra-sindato{ padding-left:10px; }
.av-barra-sindato b{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:${C.dim}; font-style:italic; font-weight:500; }
.av-verif-stats{ display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:14px; }
.av-verif-stats div{ background:${C.panel}; box-shadow:var(--sh); border-radius:20px; padding:14px 16px; text-align:center; }
.av-verif-stats b{ font-family:'IBM Plex Mono',monospace; font-size:26px; display:block; color:${C.paper}; }
.av-verif-stats span{ font-size:11px; color:${C.dim}; text-transform:uppercase; letter-spacing:.05em; }
.av-encuesta{ display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:14px; }
.av-pregunta{ background:${C.panel}; border:0; box-shadow:var(--sh); border-radius:24px; padding:14px 16px; }
.av-pregunta p{ font-size:14px; line-height:1.5; margin:0 0 12px; }
.av-opcion{ display:block; width:100%; text-align:left; margin-bottom:8px; position:relative; overflow:hidden; background:${C.panel2}; color:${C.paper}; border-radius:12px; border:1px solid ${C.line}; padding:0; cursor:pointer; font-family:'IBM Plex Mono',monospace; font-size:12.5px; }
.av-opcion:disabled{ cursor:default; }
.av-opcion-fill{ position:absolute; inset:0; transition:width .4s; }
.av-opcion-txt{ position:relative; display:flex; justify-content:space-between; padding:8px 10px; }
.av-pregunta-total{ font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:${C.dim}; margin:4px 0 0; }
.av-referencias{ list-style:none; margin:0 0 20px; padding:0; display:flex; flex-direction:column; gap:8px; }
.av-referencias li{ font-size:13px; color:${C.dim}; line-height:1.5; }
.av-referencias b{ color:${C.paper}; }
.av-conclusion{ font-size:15px; line-height:1.65; border-top:1px solid ${C.line}; padding-top:20px; }
@media (max-width:720px){
  .av-carriles{ grid-template-columns:1fr; }
}
@media (max-width:640px){
  .av-barra-row{ grid-template-columns:1fr; }
  .av-waffle{ width:100%; max-width:240px; }
}
`;
