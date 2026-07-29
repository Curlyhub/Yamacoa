# ENCUESTAS.md — convención de encuestas de Yamacoa

> Contrato único de la capa de encuestas. Lo referencian las cabeceras de los renderers.
> Para tokens de diseño ver `AGENTS.md`; para el contrato operativo general, `CLAUDE.md`.

---

## 1. Estado real (28-jul-2026)

Auditoría hecha durante el import de `auditar`. Conviven **tres** patrones, y uno de ellos
no funciona:

| Patrón | Temas | ¿Agrega votos? |
| --- | --- | --- |
| **A · Tabla única `yamacoa_encuesta_votos`** | `auditar`, `normas` | **Sí** (es el vigente) |
| **B · Tabla compartida `poll_votes` + `poll_increment`** | `represion`, `angola`, `convocatoria_11j`, `desaparecidos_2023`, `asesinatos_masacres`, `servicio_militar` | Sí |
| **C · Tabla por tema + `window.__yamacoaSupabase`** | `sulmira`, `desacreditacion`, `protesta_solitaria`, `coraje_dividido`, `triana`, `envejecimiento` | **No** |

### Por qué el patrón C nunca agregó nada

Los renderers del patrón C leen el cliente de Supabase desde `window.__yamacoaSupabase`.
Ese objeto **solo se asigna en dos sitios** — `triana_reformas.jsx:916` y
`envejecimiento.jsx:837` — y en ambos desde una **prop** `supabase` que el router nunca
pasa: `App.js:37` renderiza `<Componente />` sin props. Además `@supabase/supabase-js`
**no está instalado** en el proyecto.

Consecuencia: esos seis temas tienen encuestas **solo-localStorage**. Cada visitante ve su
propio voto y unos porcentajes calculados sobre su propio navegador; no hay agregado global.
Sus ficheros `ops/<tema>/poll_supabase.sql` crearon tablas que jamás recibieron una fila.

No es un fallo de Supabase ni de las políticas RLS: es que la llamada nunca sale del
navegador. Se detecta con `grep -rn "__yamacoaSupabase" src/` y comprobando que ninguna
asignación es alcanzable desde el router.

---

## 2. El contrato vigente (patrón A)

### 2.1 Credenciales

Los renderers leen las variables que CRA inyecta en build, **no** un global de `window`:

```js
const SB_URL = process.env.REACT_APP_SUPABASE_URL;
const SB_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
```

Definidas en `.env.local` (fuera del repo; ver `.env.example`). Si faltan, la encuesta
funciona en modo local sin errores visibles.

> Supabase muestra estos nombres con prefijo `VITE_`. Este proyecto es CRA y **solo** inyecta
> `REACT_APP_*`. El valor es el mismo, cambia el nombre.

### 2.2 Clave de voto

```
<meta.slug>::<pregunta.id>::<opcion.id>
```

Se usa `meta.slug` del dataset, **no** el `slug` del registry: pueden diferir cuando el tema
declara `dataSlug` (`normas` → `reconstruccion-civica`, `auditar` →
`propuesta-economica-auditoria`). El renderer recibe `slug={datos.meta.slug}`.

### 2.3 RPC

```
yamacoa_encuesta_votar(p_clave text) returns void
yamacoa_encuesta_resultados(p_prefijo text) returns table(clave text, votos bigint)
```

Lectura con prefijo `"<meta.slug>::"`. Definidas en `ops/_shared/poll_supabase.sql`, que se
aplica **una sola vez** en el proyecto Supabase.

### 2.4 Forma del bloque `encuesta` en el dataset

```json
{
  "titulo": "Tu lectura",
  "intro": "Tres preguntas. El voto es anónimo y se registra una sola vez por navegador.",
  "nota_privacidad": "No se recoge ningún dato personal. Solo se incrementa un contador agregado por opción.",
  "preguntas": [
    {
      "id": "p1",
      "texto": "¿…?",
      "opciones": [
        { "id": "o1", "texto": "…" },
        { "id": "o2", "texto": "…" }
      ]
    }
  ]
}
```

Las opciones son **objetos con `id`**, nunca cadenas sueltas: el `id` es lo que entra en la
clave de voto, así que reescribir el texto de una opción en un `/refrescar` no pierde los
votos acumulados. `id` de pregunta y de opción: `^[a-z][a-z0-9_]*$`.

### 2.5 Siembra obligatoria (lista blanca)

`yamacoa_encuesta_votar` **solo incrementa claves ya sembradas**; una clave desconocida se
rechaza con excepción. Cada tema aporta su siembra en `ops/<tema>/poll_supabase.sql`.

Sin esa lista blanca, un cliente anónimo podría dar de alta filas arbitrarias en la tabla
compartida de toda la plataforma. La lista blanca es lo que hace segura la tabla única.

### 2.6 Privacidad

Sin deduplicación por votante: **no se guarda IP ni identidad**. El control anti-repetición
vive en `localStorage`. Es deliberado — un expediente sobre represión no debe registrar quién
vota qué. El precio es que el agregado no resiste un ataque de inflado; se asume.

---

## 3. Añadir encuesta a un tema nuevo

1. Bloque `encuesta` en el dataset con la forma de §2.4.
2. Declararlo en el `.schema.json` (`additionalProperties: false`, `id` con `pattern`).
3. Si hay fallback embebido en el `.jsx`, **espejarlo**: si no, al fallar el fetch la encuesta
   desaparece o rompe.
4. `ops/<tema>/poll_supabase.sql` con la siembra de todas las claves.
5. Verificar que las claves sembradas coinciden **byte a byte** con el dataset, en ambos
   sentidos (ninguna opción sin sembrar, ninguna siembra huérfana). Es un script de tres
   líneas y ha pillado errores reales.

---

## 4. Convergencia pendiente

- **Patrón C → A.** Los seis temas afectados no tienen votos que preservar (nunca llegó
  ninguno), así que la migración es solo de código: sustituir el bloque que lee
  `window.__yamacoaSupabase` por el de §2.1 + §2.3 y sembrar sus claves. Sus
  `ops/<tema>/poll_supabase.sql` actuales quedan obsoletos y sus tablas por tema pueden
  eliminarse.
- **Patrón B → A.** Estos **sí tienen votos reales acumulados**. Migrar exige volcado de
  `poll_votes` a `yamacoa_encuesta_votos` con reescritura de claves. No hay prisa: funcionan.
- Mientras tanto, **no crear temas nuevos con B ni con C**.
