# Notas de operador — tema `angola`

## Origen
- Fuente de partida: `ops/_inbox/angola/Cuba-en-Angola-SPAN-1-2.pdf` (Free Society Project /
  Archivo Cuba, "Cuba en Angola: un viejo y lucrativo negocio de los Castro", ago-sep 2017,
  Maria Werlau). Tratada como hipótesis a verificar, no como fuente asentada.
- Verificación afirmación por afirmación con subagente verificador (jul-2026). Resultado:
  el núcleo cuantitativo entró corroborado o marcado como estimado; ocho afirmaciones quedaron
  fuera o degradadas a la sección visible `no_corroborado` del dataset (armas químicas,
  marfil/diamantes, "iniciativa soviética" descartada por Gleijeses, trueque de petróleo,
  6.000 quedados, 6.200 de Savimbi, 60 médicos de 2007, $2.000/mes por soldado).

## Decisiones editoriales que conviene recordar
- **Muertos**: las cifras oficiales cubanas divergen (2.016 / 2.077 / 2.289) y no existe lista
  oficial publicada. El dataset las presenta TODAS con origen, fecha y alcance en el dot-plot;
  nunca elegir una sola al refrescar.
- **Serie de la misión** (`mision_serie`): los recuentos NO son comparables entre sí (2013 y
  2024 cuentan solo salud; 2014 y 2016 todos los sectores). El campo `alcance` es obligatorio
  y el renderer los dibuja con marca distinta. No convertir en línea continua.
- **Waffle de la firma**: 40 chapas de $125 = $5.000/mes por médico (corroborado, ministra de
  Salud angoleña 2020). Lo que llega al médico se muestra como "entre una y dos chapas" porque
  el valor puntual ($125-200 en mano) varía por año y forma de pago y no se pudo fijar: la
  segunda chapa está partida a propósito. No "corregir" ese degradado.
- **Desviación respecto a la ficha del disenador**, documentada: la ficha proponía un `stream`
  de tropas por año y un `scatter-cuadrantes` comparando programas de otros países; ambos
  exigían datos que la verificación no respaldó (no existe desglose anual verificado de las
  tropas ni cifras verificadas de Venezuela/Brasil/Qatar). Se sustituyeron por `dot-plot-rango`
  (muertos) y `serie-anotada` (misión), manteniendo paleta, layout split-diptico y firma
  exactos. La ficha registrada en `ops/design_log.json` refleja lo construido.

## Refresco (Nivel 1)
- Candidatos a refresco: `mision_serie` (nuevos recuentos), `antex.exportacion_servicios.serie`
  (datos anuales MEP/ONEI), `cronologia` (hitos nuevos), `kpis` (mision_hoy).
- Umbral de alerta: si aparece la lista oficial de muertos o una cifra nueva de deuda
  angoleña verificable, ampliar `muertos.cifras` (el schema lo permite sin tocar el renderer).

## Encuesta
- Namespace Supabase: `angola:q1`. Tabla compartida `poll_votes` + RPC `poll_increment`
  (ya creadas por temas anteriores; el SQL de este directorio es replica de respaldo).
- Sin credenciales Supabase el poll degrada a localStorage (seeds visibles).

## Riesgos
- El PDF de origen quedó en el inbox con ownership root (subido así); no borrar con tooling
  como root (ver memoria del proyecto sobre ownership).
- El tema nombra personas (Del Pino, Olivera Castillo, Werlau, ministros): todas las
  menciones conservan fuente y estado; los testimonios se presentan como testimonio, no
  como estadística (AGENTS.md, procedencia).
