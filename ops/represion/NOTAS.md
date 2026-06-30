# Tema "represión" · guía de operación para el agente externo

## Estructura de archivos

| Fichero | Ubicación final | Quién lo toca |
|---|---|---|
| `represion_cuba.jsx` | `src/temas/represion_cuba.jsx` | Nadie — renderizador congelado |
| `represion.json` | `public/data/represion.json` | **El agente** — se reescribe cada mes |
| `represion.schema.json` | `public/data/represion.schema.json` | Contrato de validación — no se toca |
| `poll_supabase.sql` | `ops/represion/poll_supabase.sql` | Setup único de Supabase |

---

## 1 · Lo que reescribe el agente cada mes

**Archivo objetivo:** `public/data/represion.json`

El renderizador hace `fetch('/data/represion.json')` al montar y, si el fetch
falla, usa la copia `EMBEDDED` del jsx. Para actualizar la página en producción,
el agente **sobrescribe `public/data/represion.json`** y el front lo recoge en el
siguiente fetch, **sin rebuild**.

### Campos que cambian mensualmente

- `meta.ventana` — periodo cubierto, p.ej. `"ene–jun 2026"`
- `meta.actualizado` — fecha de la actualización (`AAAA-MM-DD`)
- `kpis[].valor` — el agente puede recalcular a partir de las series
- `serieMensual[]` — añadir el mes nuevo; conservar los anteriores
- `serieAnual[]` — actualizar si el OCDH publica cierre anual
- `acumuladoDesde2021` — actualizar si el OCDH lo revisa
- `composicion` — desglose por tipo del mes de referencia (cambiar `periodo`)
- `provincias[].senal` — añadir la clave `"AAAA-MM"` del nuevo mes con nivel `alta`/`media`/`baja`/`null`
- `presos.serie[]` — añadir el punto del mes; conservar los anteriores
- `presos.desglose[]` — actualizar cifras de Prisoners Defenders
- `casos[]` — **añadir** los nuevos y **conservar** los anteriores, cambiando `estado` cuando proceda

### Campos que NO cambia el agente

- `provincias[].id` / `provincias[].nombre` — estables; la geometría del mapa se une por `id`
- El schema (`represion.schema.json`) — es el contrato, no un dato
- `SURVEY`, `PROV_GEO`, `CUBA_FEATURE`, `MAP_MESES` — son config del renderizador

---

## 2 · Protocolo de validación antes de publicar

1. Pasar el JSON emitido contra `public/data/represion.schema.json`
   (usar como `responseSchema` de Gemini o validar con `ajv` / `jsonschema`)
2. Verificar que `meta.tema === "represion"` (campo `const` en el schema)
3. Verificar que cada `casos[].id` es estable y en minúsculas sin espacios
4. Comprobar que `destacado: true` apunta al caso principal del mes

---

## 3 · Cómo alimenta el agente (consultas mensuales sugeridas)

- `OCDH acciones represivas <mes> <año>` → total, detenciones, otros abusos, provincias
- `OCDH <mes> represión tipos sitio policial detenciones` → composición
- `Prisoners Defenders presos políticos <mes> <año> récord` → serie y desglose
- `Cuba preso político <mes> excarcelado / detenido / condenado` → casos nuevos

### Reglas editoriales para `casos[]`

- `resumen` siempre **parafraseado** (nunca citas largas de las fuentes), máx. 600 chars
- `fuentes` con al menos un medio reconocible
- `destacado: true` sube un caso a la cabecera de la pestaña "Los rostros"
- `estado` es un enum cerrado: `Detención` · `Prisión provisional` · `Condena` ·
  `Protesta` · `Excarcelado` · `Impedimento de salida` · `Fallecido bajo custodia`

---

## 4 · Encuesta con estadística global (opcional)

Por defecto la encuesta guarda votos **sólo en el dispositivo** (localStorage).
Para estadística global:

1. Crear proyecto en Supabase, ejecutar `ops/represion/poll_supabase.sql`
2. En `src/temas/represion_cuba.jsx` rellenar:

```js
const POLL_BACKEND = {
  supabaseUrl: "https://TU-PROYECTO.supabase.co",
  supabaseAnonKey: "TU-ANON-KEY",
};
```

La anon key es pública por diseño; con RLS lo único que un visitante puede hacer
es **leer totales** e **incrementar de uno en uno**.

### Alternativas al backend

- **Upstash Redis** (`HINCRBY` atómico, free, sin servidor)
- **Postgres propio del pipeline** expuesto vía `POST /api/poll/vote`

El componente está escrito contra un `pollStore` con dos métodos (`results()`,
`vote()`), así que cambiar de backend es tocar sólo ese objeto.
