# NOTAS — expediente `cascada` · "Del subsuelo al fondo"

Origen: **`ops/_import/cascada/`** (set ya construido: renderer + dataset +
schema + ficha de diseño), cableado con `/importar` el 29-jul-2026. **No es un
`/procesar-inbox`**: el expediente no se investigó ni se diseñó en esta sesión,
llegó hecho.

El tema se llama `cascada` (id, slug y ruta `/cascada`) pero su dataset conserva
el nombre interno del set, `cascada-valor-minero`, enlazados por `dataSlug` en el
registry. Mismo mecanismo que `auditar`, `normas` y `convocatoria_11j`. El
`fetch` del renderer fija ese nombre y es el contrato: `RUTA_DATOS =
"/data/cascada-valor-minero.json"`.

## Qué sostiene el expediente

Deriva empíricamente el **multiplicador VAN/in-situ cubano** a partir del único
activo minero del país con estudio de factibilidad auditado bajo estándar
internacional: el informe técnico NI 43-101 del Moa Joint Venture (Micon
International, CIM 2014, fecha efectiva 31-ago-2022, informe 31-mar-2023).

La cascada va de 25.328 M USD de valor bruto de contenido metálico in situ a
812 M USD de VAN al 8 % después de impuestos, y a 888 M USD de participación
efectiva del Estado cubano. Es decir: **el Estado capta en torno al 3,5 % del
valor bruto in situ de su mejor activo minero**. Rango recomendado para trasladar
cualquier tabla de riqueza in situ a valor realizable: **3,2 %–4,9 %**.

Hallazgo colateral que el dataset recoge: la recuperación **mina-a-metal** real
es del 61,2 % en níquel, no del 85,2 % que suele citarse — ese 85,2 % es
recuperación **de planta**, que mide otra cosa (rendimiento entre lo que entra a
proceso y el metal final, no qué fracción del metal en reservas llega a
venderse).

## Verificación — NO realizada en esta sesión

**Aviso para el operador:** no se ejecutó el subagente `verificador` durante el
import. Atenuantes reales, que no lo sustituyen:

- La fuente es **única, primaria y auditada** por personas cualificadas bajo
  NI 43-101. `meta.nota_metodologica` declara que ninguna cifra procede de
  fuentes secundarias, y cada cifra lleva su chip de confianza
  (`confirmado` = literal de tabla del informe; `calculado` = aritmética derivada
  con fórmula explícita; `estimado` = incorpora supuestos externos).
- El propio dataset arrastra la **advertencia de independencia** del informe: el
  laboratorio DELABEL, que hizo la mayoría de los ensayos, no se considera
  independiente del Moa JV, y el protocolo QAQC no incluye blancos ni materiales
  de referencia certificados. Sale visible en el pie de la página, no en nota al
  pie enterrada.
- La ficha de procedencia declara una autocorrección previa: se había citado un
  VAN de 1.517 M USD, que es el escenario alternativo alcista; el caso base
  auditado es 812 M.

Lo que **sí** se comprobó aquí, por script: coherencia interna de la cascada
(monotonía de los tramos, suma de reservas probadas + probables, consistencia del
multiplicador con los tramos) y que las 31 rutas de datos que lee el renderer
existen en el dataset real, no solo en el fallback embebido.

## Diseño — heredado del set, no propuesto aquí

No se ejecutó el subagente `disenador`. La ficha venía en el set y se asentó en
`ops/design_log.json` (pasa de 20 a 21 fichas) para que futuras propuestas no
colisionen.

- **Paleta "Acero y Laterita".** Fondo `#111218`. Primario acero desaturado
  `#7479B4` (h235, S30/L58) → portada y renderer. Contrapunto laterita ocre
  `#B1723E` (h27) **reservado al renderer**: pinta los tramos de pérdida de la
  cascada y nunca sale a `accent` del registry, así que no compite por hueco en
  la rueda de la portada (mismo criterio que el magenta de `sulmira`). Es el
  color literal del material del tema: laterita niquelífera, goethita y hematita.
- **El círculo está saturado.** 21 fichas, 45 acentos registrados. El acero h235
  es el único hueco de 26 grados que queda (entre `himno` h218 y
  `protesta-solitaria` h248), con margen real de 13 grados a cada lado. Por
  debajo del ideal de 40 y por debajo incluso del 26 que aceptó
  `protesta_solitaria`. Se toma porque **matemáticamente no existe nada mejor**.
  Se diferencia del azul-bandera reservado por CLAUDE.md §4 (`#3D6FE5`, S78/L57)
  por menos de la mitad de saturación. **Confirmado por el operador el
  29-jul-2026**; la alternativa descartada era renunciar al acento de portada y
  sacar la laterita, asumiendo 9 grados de colisión con `rusificacion` (h18).
- El ámbar de aviso (`#C98A17`) no se reclama como acento propio: es convención
  de plataforma para contrafactual y advertencia, igual que en `normas`. La línea
  de deuda va en hueso neutro (`#D8D2C6`) precisamente para no reclamar tono: el
  rojo de alerta que pediría semánticamente está reservado a represión.
- **Tipografía:** Archivo Black + IBM Plex Mono, con Inter de texto corrido.
  Conforme a §4.
- **Elemento firma:** la cascada waterfall. Una barra de acero profundo (el bruto
  in situ) de la que caen cuatro tramos de laterita hasta dejar el bloque de
  participación estatal. El argumento es la merma, y se ve antes de leerse.
  Cruzándola, dos reglas discontinuas en hueso marcan la deuda del Club de París
  y la deuda externa del BCC: la segunda queda **por encima** de todos los tramos
  salvo los dos primeros, de modo que el lector ve que el pasivo externo supera
  al valor realizable sin que ningún texto se lo afirme. Debajo, lista espejo
  sincronizada por hover.

## Cambios aplicados al set durante el import

El set llegó limpio: `RUTA_DATOS` ya apuntaba a `public/data/` (no repitió el
defecto de `normas` y `auditar`), ninguna referencia a `/assets/` ni `/models/`,
schema ya normalizado al punto. Los tres cambios siguientes son **decisión del
operador tomada durante el import**, es decir antes de publicar y por tanto antes
de que el renderer quede congelado según CLAUDE.md §2:

1. **Encuesta de tres preguntas** sobre la base única (ver abajo). El set no
   traía ninguna. Implica bloque `encuesta` en dataset y schema, espejo en
   `DATOS_EMBEBIDOS` y una sección `07` en el renderer.
2. **Referencia interna a `/mineria`**, servida desde el dataset (bloque
   `referencia_interna`) y pintada al cierre de la sección 3, "El multiplicador".
   Resuelve el pendiente que la propia ficha dejaba anotado.
3. Entrada en `ops/design_log.json` y este fichero de notas.

## La referencia a `/mineria` — pendiente resuelto

La ficha del set dejaba anotado: *"enlazar con /mineria como numerador (esa
página aporta el inventario geológico, este tema aporta el multiplicador);
revisar si /mineria ancla las 5,5 Mt de níquel en fuente primaria"*.

Los dos expedientes encajan como numerador y denominador de la misma operación:

| | `/mineria` — "El subsuelo y la crisis" | `/cascada` — este expediente |
| --- | --- | --- |
| Aporta | inventario geológico nacional | multiplicador VAN/in-situ |
| Cifra | ~5,5 Mt de Ni · ~121.500 M USD in situ | 3,2 %–4,9 % · 3,5 % de toma estatal |
| Alcance | agregado nacional | un solo activo, auditado |

**Estado de las 5,5 Mt, comprobado aquí:** `mineria.json` las ancla en el **USGS
de 2024** y ya las declara con `confianza: "media"`, no como dato duro. Ese mismo
dataset advierte además en prosa que la valoración in situ no descuenta
recuperación metalúrgica, costes operativos, regalías ni el paso del tiempo — es
decir, la página ya se marcaba a sí misma el hueco que este expediente rellena.

El matiz que sí había que incorporar, y va **visible en la tarjeta de enlace**,
no en nota al pie: el *Mineral Commodity Summaries* de 2025 **ya no desglosa
Cuba** en su tabla de reservas, la agrega dentro de «otros países» (más de 9,1 Mt
para todas las jurisdicciones restantes). Mientras no haya desglose nuevo, las
5,5 Mt deben leerse como estimación de 2024, no como dato corriente.

El enlace es un `<a href="#/mineria">` plano, sin importar `react-router`: el
proyecto usa `HashRouter` y los temas se cargan `lazy` como componentes
autónomos. **Es el primer enlace interno entre expedientes de la plataforma**
(`grep -rn 'href="#/' src/temas/` no devolvía nada antes de esto). Si se
generaliza, conviene extraerlo a un componente compartido en vez de repetirlo.

## Encuesta

Contrato de **tabla única**, patrón A de `ENCUESTAS.md` — el vigente, el único
que agrega votos de verdad:

```
yamacoa_encuesta_votar(p_clave text)
yamacoa_encuesta_resultados(p_prefijo text)
clave = <meta.slug>::<pregunta.id>::<opcion.id>
```

- Prefijo de este tema: `cascada-valor-minero::` (el `meta.slug` del dataset, no
  el `slug` del registry; ENCUESTAS.md §2.2).
- `ops/cascada/poll_supabase.sql` — **solo siembra**: 12 claves, 3 preguntas de 4
  opciones. Requiere haber aplicado antes `ops/_shared/poll_supabase.sql`.
- Credenciales vía `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY`
  (CRA las inyecta en build). Si faltan, la encuesta cae a recuento local sin
  error visible.
- Sin deduplicación por votante: no se guarda IP ni identidad. El
  anti-repetición vive en `localStorage`.

Las preguntas atacan el argumento del expediente, no la opinión política: qué
creía el lector que medían las cifras de riqueza mineral, qué explica el 3,5 % de
toma estatal, y si el multiplicador sostiene o no el argumento del fondo
soberano.

Verificado por script que las 12 claves sembradas coinciden con el dataset **en
ambos sentidos**: ninguna opción sin sembrar, ninguna siembra huérfana.

**Sobre el espejo del fallback embebido:** los `id` de pregunta y opción son
idénticos byte a byte entre `DATOS_EMBEBIDOS` y el dataset — que es lo único que
entra en la clave de voto. Los **textos** del fallback van sin tildes, siguiendo
la convención que ya traía el renderer en todo su copy embebido. Divergencia
cosmética y deliberada: solo se ve si falla el `fetch` del dataset.

## Registry

`id/slug: "cascada"`, `path: "/cascada"`, `dataSlug: "cascada-valor-minero"`,
`publicado: "2026-07-29"`. `titulo` y `subtitulo` son literales del `meta` del
dataset.

`accent: "#7479B4"` — resuelto, ver Diseño.

**Pendientes de confirmación humana:**

- `etiqueta: "MINERÍA · VALORACIÓN DE ACTIVOS"` — propuesta durante el import.
  Convive con `mineria` (`RECURSOS MINERALES · GEOPOLÍTICA`) y `cayo-romano`
  (`RECURSOS · CONTRAFACTUAL`).
- `fuentes: "Informe técnico NI 43-101 del Moa JV (Micon International · CIM
  2014)"` — propuesta durante el import.

`functions/social-meta.json` ya traía la clave `/cascada` con título y
descripción idénticos al `meta`; no se tocó.

## Validación

- `npx ajv validate -c ajv-formats` schema ↔ dataset → **valid**. Sin
  `-c ajv-formats` el schema se rechaza por el formato `date`; `ajv-formats` es
  devDependency declarada del proyecto y esa es la invocación correcta.
- `node scripts/bracket-balance.mjs src/temas/cascada-valor-minero.jsx` → **OK**.
- `npm run build` → **compila**, sin ningún warning atribuible a este renderer.
- Rutas de datos que lee el renderer ↔ dataset real → **31/31 presentes**.
- Claves de encuesta dataset ↔ SQL → **OK en ambos sentidos**.
- Referencias a `/assets/` y `/models/` en el renderer → **ninguna**. No hay
  assets que colocar ni huérfanos que reportar.

## Pendiente antes de publicar

1. **Verificación editorial** (no hecha; ver arriba). Menor riesgo del habitual
   por ser fuente única primaria auditada, pero no es cero.
2. Confirmar `etiqueta` y `fuentes` del registry.
3. Aplicar en Supabase, **en este orden**: `ops/_shared/poll_supabase.sql` (una
   sola vez para toda la plataforma, si aún no se aplicó) y después
   `ops/cascada/poll_supabase.sql`.
4. Sin capa narrativa: `meta.descripcion` y `meta.narracion` no existen todavía.
   Se añaden con `/narrar cascada`, que solo toca `.json` y `.schema.json`.
5. Opcional: vaciar `ops/_import/cascada/`.
