# Píldora · Himno de Narciso López

Una **píldora histórica** (no un dashboard de datos): historia + encuesta + evaluación gráfica,
con el mismo esqueleto Yamacoa (Archivo + IBM Plex Mono, fondo oscuro, tarjetas/tooltip, recharts).

## Archivos
- `himno_narciso.jsx` — el renderizador **congelado**. Va en `src/temas/`.
- `himno.json` — el dataset que **reescribe el agente**. Va en `public/data/`.
- `himno.schema.json` — el contrato que valida lo que produce el agente (sirve de `responseSchema`).

El `.jsx` hace `fetch('/data/himno.json')` al montar; si falla, usa `EMBEDDED` (copia de respaldo
idéntica al JSON). Como artifact suelto en claude.ai cae al embebido y se ve igual.

## La paleta (lo que cambia frente a represión/conflictos)
No es la heat-scale. Sale de la **bandera y la partitura**, para que se lea como otra sección:
- **Azul** `#3D6FE5` / `#23408F` — el azul del pabellón. Acento principal de datos.
- **Punzó** `#D8392B` — el rojo del triángulo. Picos y errores.
- **Oro** `#E6B450` — la estrella y el pergamino de la BNF. Acento editorial.
- **Steel** `#6E7E96` — neutro.
Añade **Spectral** (serif) sólo para los versos y el fragmento destacado: textura de época sin salirse del sistema.

## Las cuatro pestañas
1. **Historia** — línea de tiempo (1825 → 1945) con nodos coloreados por `tono`, + ficha técnica + nota honesta sobre la doble autoría.
2. **El Himno** — **el texto completo y verificado** contra la partitura original de la BNF/Gallica (imp. Paul Dupont): los 4 movimientos (Coro de hombres / Estrofa Dúo / Coro de mujeres / Todos, con los refranes que se repiten en II–IV). Debajo, la **raíz literaria** (Heredia, *Himno del desterrado*, 1825), la **otra versión** que circuló (fragmento «…del azul y el punzó…», atribuido a Plácido Gener, que **no** está en la partitura), y el recuadro «No confundir» que lo separa de *La Bayamesa*.
3. **Encuesta** — 4 preguntas de opinión. Mismo patrón que los otros temas: `seed` + voto local guardado por dispositivo. `pollStore` listo para enchufar a Supabase para conteo global.
4. **Evaluación** — quiz de 7 preguntas etiquetadas por área (Cronología/Autoría/Símbolos/Contexto). Al terminar: **gauge radial** del puntaje + **barras por área** (recharts) + repaso pregunta a pregunta con la explicación. Es la "evaluación gráfica".

## Corte de datos (lo que respira vs. lo congelado)
- **En el dataset** (agente): intro, ficha, timeline, letra, preguntas de encuesta, preguntas y veredictos del quiz.
- **En el renderizador** (tú): paleta, CSS, la bandera del hero, la estrella SVG, el copy de estructura y la lógica de puntaje.

## Una salvedad de rigor
La fuente original (MovimientoC40) llevaba aviso de "respuestas de IA pueden contener errores" y daba
autoría contradictoria. Verificado y corregido en el dataset:
- **Música:** Narciso López **Frías** (el *hijo* del General Narciso López de Urriola), no el general.
- **Letra:** la partitura de la BNF la atribuye a **Heredia** y otros (tres estrofas del *Himno del desterrado*, 1825); parte de la prensa cubana cita a **Plácido Gener**. La píldora muestra ambas versiones.
- **Estatus:** Gay-Calbó (1945) la situó como **antecedente** del himno nacional (La Bayamesa, 1868), no como himno oficial.
- **Letra (verificado con fuente primaria):** el texto «Ya retumba el cañón en la sierra…» **sí es auténtico** — lo confirma el escaneo de la partitura original de la BNF/Gallica (imp. Paul Dupont). No aparecía en fuentes secundarias online, de ahí la cautela inicial; el documento primario lo zanja. La *otra* versión que circuló («…del azul y el punzó…», atribuida a Plácido Gener) **no** figura en esa partitura. Nada de esto es *La Bayamesa* (1868), el himno nacional, que es una pieza distinta.

## Persistencia
Igual que los otros temas: localStorage por dispositivo, envuelto en `try/catch` (en claude.ai cae a memoria sin romperse). Para global, conecta `pollStore` a Supabase con el mismo `poll_supabase.sql`.
