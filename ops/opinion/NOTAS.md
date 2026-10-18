# Opinión: notas de operador

Artículos firmados por colaboradores invitados. El texto del autor es **invariante**: se publica
tal cual, con su sha256 a la vista, y un trigger de la BD impide modificarlo tras el envío.
Yamacoa solo añade, aparte y rotulado («Los datos»), contexto con fuentes, un gráfico y notas de
datos neutrales ancladas a palabras literales del autor. Decisiones del editor (2026-10-18):
firma con nombre o seudónimo; solo cuentas invitadas; cifras que chocan con los datos → nota
neutral; revisión humana antes de publicar; el autor puede retirar su artículo cuando quiera.

## Puesta en marcha (una vez)
1. Supabase: ejecutar `ops/opinion/opinion_supabase.sql` (crea la tabla, las funciones
   `enviar_opinion` y `retirar_opinion`, el trigger de invariancia y el bucket privado
   `opinion-originales`).
2. Invitar a cada colaborador (cuenta creada como las del portal):
   `update public.perfiles set puede_opinar = true where email = 'persona@dominio';`
3. Portal: desplegar `portal/` (incluye `opinion.html`):
   `npx wrangler pages deploy portal --project-name=yamacoa-portal --branch=main`.
   El colaborador entra en https://portal.yamacoa.com/opinion.html con su cuenta.

## Flujo
```
portal/opinion.html  Word (.docx) / PDF / texto → el autor revisa el texto extraído y confirma
  └─ enviar_opinion() → estado «enviado» (original en el bucket, texto + sha256 en la BD)
ciclo.sh (cada ciclo) → node ops/opinion/opinion.mjs
  └─ analista (Claude, analista.md) → verja → estado «revision» (+ alertas para el editor)
editor:
  node ops/opinion/opinion.mjs --revisar            pendientes y alertas
  node ops/opinion/opinion.mjs --ver <id>           texto + lo que añade Yamacoa
  node ops/opinion/opinion.mjs --ensayo <id>        vista previa en npm start (/opinion/<slug>)
  node ops/opinion/opinion.mjs --aprobar <id> [--sin-datos]
  node ops/opinion/opinion.mjs --rechazar <id> --motivo "…"   (el autor ve el motivo)
  ops/publicar.sh                                    sale al sitio (exporta opinion.json)
```
- **Verja:** cada cifra del contexto y de las notas tiene que estar en la fuente citada (serie de
  Yamacoa o URL que se descarga); cada nota se ancla a un fragmento LITERAL del autor; los
  gráficos de serie los construye el código. Lo que no pasa se descarta (el artículo sigue).
- **Alertas** (incitación a la violencia, personas expuestas dentro de Cuba, acusaciones sin
  respaldo, instrucciones a una IA, plagio): solo informan al editor; nunca se publican.
- **Retirar:** el autor, desde el portal («Retirar»); el editor,
  `update opinion_articulos set estado='retirado' where id='…';`. Sale en el siguiente despliegue.
- La sección «Opinión» del menú solo aparece si hay artículos publicados.
- Prueba sin BD: `node ops/opinion/opinion.mjs --prueba texto.txt --titulo "…"` (vista previa local).
