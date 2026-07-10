# Tema "convocatoria_11j" · guía de operación

## Qué es (y qué no es)

Página especial de **convocatoria y agitación** por el quinto aniversario del 11J
(11 de julio de 2026). Su objetivo declarado es aumentar la asistencia a las
manifestaciones de la jornada. Es un **registro editorial distinto** al resto de
Yamacoa (observacional/estadístico); la mezcla de agitación + rigor de fuentes es
intencional y está declarada de forma visible en la propia página (`meta.nota_registro`).
La disciplina de fuentes NO se relaja: cada convocatoria lleva su nivel de verificación
y cada cifra su fuente y fecha de corte.

## Estructura de archivos

| Fichero | Ubicación final | Quién lo toca |
|---|---|---|
| `convocatoria_11j.jsx` | `src/temas/convocatoria_11j.jsx` | Nadie: renderizador congelado |
| `convocatoria_11j.json` | `public/data/convocatoria_11j.json` | **El agente** (refresco sin rebuild) |
| `convocatoria_11j.schema.json` | `public/data/convocatoria_11j.schema.json` | Contrato: no se toca |
| `poll_supabase.sql` | `ops/convocatoria_11j/poll_supabase.sql` | Setup único (tabla compartida; namespace `c11j`) |

Dependencia nueva del proyecto introducida por este tema: `react-leaflet@5` + `leaflet@1.9`
(mapa mundial; queda documentada como aprobada en AGENTS.md § Stack). Tiles: CartoDB Dark
Matter, gratuitos y sin API key; la atribución CARTO + OpenStreetMap es obligatoria y va
embebida en el renderer (prop `attribution` del TileLayer): **no retirarla nunca**.

## Los cuatro niveles de confianza (innegociables)

El campo `estado` de cada convocatoria admite: `confirmado`, `celebrado` (confirmada y ya
ocurrida), `reportado_no_verificado`, `plausible_no_confirmado`, `especulativo`. El mapa y
el listado los distinguen por **forma + opacidad** del marcador (no solo color), con leyenda
fija. Al refrescar el dataset: **jamás** promover un evento a `confirmado` sin fuente de
prensa independiente identificable con fecha/hora/lugar; el campo `verificacion` explica
qué se pudo comprobar. Un evento sin coordenadas fiables lleva `geo: null` y aparece solo
en el listado.

## Refresco (Nivel 1)

Campos pensados para el ciclo corto de HOY (10-11 de julio):

- `convocatorias[]`: añadir eventos nuevos verificados, subir/bajar `estado` según se
  confirmen o desmientan, corregir horas. Conservar los `celebrado`.
- `caso_otero`: el caso está ABIERTO (desaparición forzada denunciada el 10-jul).
  Actualizar `hechos[]`, `estado_actual` y `actualizado` con cada novedad verificada.
- `cifras.bloques[]` y `kpis[]`: solo si sale un informe nuevo, con su `fecha_corte`.
- `meta.actualizado` siempre.

Validar con ajv contra el schema antes de publicar; si falla, abortar y registrar.

## Verificación de origen (10-jul-2026)

Verificación completa en subagente el 10-jul-2026: 20 de 27 afirmaciones corroboradas.
Correcciones aplicadas respecto al material de inbox: traslado de Otero Alcántara el
**7 de julio** (no el 6); cifras de menores separadas en **40 acumulados** en la lista
actual y **9 nuevos** en S1 2026 (eran cifras distintas, no una discrepancia); detenciones
del 11J como **rango** (~1.300 a ~1.900 según recuento), no cifra única; condena de Dayron
Martín Rodríguez (11J-000012) marcada "con discrepancia" (reportada 30 y luego 22 años;
ficha primaria no re-verificable en vivo). El registro de 342 protestas de 2026 se
presenta como registro personal de Cecilia Bobes (FLACSO), no como estadística
institucional.

## Encuesta

Namespace `c11j` sobre la tabla compartida `poll_votes`. Si el proyecto Supabase ya tiene
la tabla y la RPC (las creó el tema represión), no hay que ejecutar nada.

---

## ⚠️ VIGENCIA CORTA · PLAN DE RECONVERSIÓN OBLIGATORIO

Esta página **pierde sentido como convocatoria después del 11 de julio de 2026**. NO debe
quedar congelada llamando a un evento ya pasado.

**Después de la jornada (12 de julio en adelante):** reconvertirla vía `/refrescar` (o
decisión humana) en un **registro retrospectivo** de cómo fue la jornada:

1. Cambiar `meta.modo` de `"convocatoria"` a `"retrospectiva"`. El renderer ya lo
   contempla: el hero deja de contar hacia atrás y pasa a "la jornada ya ocurrió"
   (también lo hace solo por fecha, como red de seguridad, pero el modo debe fijarse
   en el dato).
2. Reescribir `meta.titulo` / `meta.subtitulo` / `meta.nota_registro` en clave de
   memoria ("Así fue el 11J de 2026").
3. Actualizar cada convocatoria celebrada a `estado: "celebrado"` con crónica breve en
   `notas` (asistencia real con fuente, incidencias); degradar o retirar las que no se
   celebraron (lo especulativo que no ocurrió puede eliminarse: ya no informa).
4. Refrescar `meta.descripcion` y `meta.narracion` (+ `narracion_en`) al registro
   retrospectivo.
5. Actualizar `caso_otero` con el desenlace que tenga a esa fecha.

Si nadie la reconvierte, la opción honesta es despublicarla (`/eliminar-tema`) antes que
dejarla como convocatoria fantasma. **Recordatorio para el operador: esto debe decidirse
el 12 o 13 de julio de 2026, no "algún día".**
