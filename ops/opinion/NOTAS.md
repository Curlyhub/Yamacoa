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
  node ops/opinion/opinion.mjs --video <id> --url <x.com|youtube> [--tras <n>]   vídeo citado
  ops/publicar.sh                                    sale al sitio (exporta opinion.json)
```

## El original, reproducido (2026-10-21)
El texto confirmado (`texto`, sha256) solo lleva palabras. Al exportar (`--solo-exportar`, `--ensayo`),
`lib/documento.mjs` descarga el original del bucket (caché en `trabajo/<id>/`) y lo reproduce sobre
ese texto: ladillos, negrita, cursiva, enlaces y figuras (a `data/opinion/<slug>/figura-N.webp`, en
el build, fuera de git). Cada párrafo se busca LITERAL en el documento: lo que no casa sale llano y se
avisa en el log; lo que el documento tiene fuera del texto (título, firma, fecha) no se publica, salvo
las figuras con su pie (la cursiva que las sigue). La página muestra también el sha256 del original.
PDF con pdf.js y Word con mammoth, las mismas versiones que el portal.

## Envío desde el repo (editor, en nombre de un colaborador invitado)
Cuando el texto que llega del portal viene mal (párrafos fundidos, material pegado que no es del artículo),
el editor deja el material en `ops/opinion/contenido/<carpeta>/` (fuera de git):
- el original (`.pdf` o `.docx`), que se sube al bucket privado como lo haría el portal;
- `texto.txt`: el texto CONFIRMADO, párrafos separados por una línea en blanco. Los ladillos
  («II. …») van en su propio párrafo y la plantilla los pinta como subtítulo;
- `ficha.json`: `autor` (email de un perfil con `puede_opinar`), `titulo`, `firma`, `firma_tipo`,
  `presentacion?`, `video?` `{url, tras}` y `grafico?` (formato de `Graficos.jsx` + `fuente_url`:
  cada valor tiene que aparecer en esa página o no se importa).

`node ops/opinion/opinion.mjs --importar ops/opinion/contenido/<carpeta>` crea el envío
(«enviado»; deja `importado.json` para no duplicarlo) y el flujo sigue igual: análisis, revisión,
`--aprobar`, `ops/publicar.sh`. El vídeo y el gráfico del editor sobreviven al análisis; el
gráfico sustituye al del analista. El vídeo no se carga hasta que el lector pulsa.
- **Verja:** cada cifra del contexto y de las notas tiene que estar en la fuente citada (serie de
  Yamacoa o URL que se descarga); cada nota se ancla a un fragmento LITERAL del autor; los
  gráficos de serie los construye el código. Lo que no pasa se descarta (el artículo sigue).
- **Alertas** (incitación a la violencia, personas expuestas dentro de Cuba, acusaciones sin
  respaldo, instrucciones a una IA, plagio): solo informan al editor; nunca se publican.
- **Retirar:** el autor, desde el portal («Retirar»); el editor,
  `update opinion_articulos set estado='retirado' where id='…';`. Sale en el siguiente despliegue.
- La sección «Opinión» del menú solo aparece si hay artículos publicados.
- Prueba sin BD: `node ops/opinion/opinion.mjs --prueba texto.txt --titulo "…"` (vista previa local).
