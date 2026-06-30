# Tema "conflictos" · guía de operación para el agente externo

## Estructura de archivos

| Fichero | Ubicación final | Quién lo toca |
|---|---|---|
| `conflictos_cuba.jsx` | `src/temas/conflictos_cuba.jsx` | Nadie — renderizador congelado |
| `conflictos.json` | `public/data/conflictos.json` | **El agente** — se reescribe cada trimestre |
| `conflictos.schema.json` | `public/data/conflictos.schema.json` | Contrato de validación — no se toca |

---

## 1 · Lo que reescribe el agente cada trimestre

**Archivo objetivo:** `public/data/conflictos.json`

El renderizador hace `fetch('/data/conflictos.json')` al montar y, si el fetch
falla, usa la copia `EMBEDDED` del jsx. Para actualizar la página en producción,
el agente **sobrescribe `public/data/conflictos.json`** y el front lo recoge en el
siguiente fetch, **sin rebuild**.

### Campos que cambian trimestralmente

- `meta.periodo` — periodo cubierto, p.ej. `"abril–junio 2026"`
- `meta.actualizado` — fecha de la actualización (`AAAA-MM-DD`)
- `trimestre` — todos los campos (total, desafios, represivos, presenciales, grafiti, muertesViolencia, deltaMarzoYoYPct)
- `meses[]` — sustituir los tres meses del nuevo trimestre; conservar la estructura exacta de cada objeto
  - Cada mes lleva: id, nombre, total, dcp, des, desafios, represivos, grafiti, presenciales, muertesViolencia, nota2025, nota2025Estimado, categorias[], provincias[]
- `anual[]` — añadir el año nuevo cuando el OCC publique cierre; conservar los anteriores con su `caveat`
- `forecast.puntos[]` — actualizar el punto del año corriente con datos reales; recalcular proyecciones
- `eventos[]` — **sustituir** por los del nuevo trimestre (10–12 eventos clave), usando los tipos permitidos
- `encuesta[]` — mantener las mismas preguntas; actualizar los `seed` si se dispone de datos reales

### Campos que NO cambia el agente

- `meta.tema` — siempre `"conflictos"`
- `meta.titulo` — siempre `"La calle arde"`
- `meta.fuente` — siempre `"Observatorio Cubano de Conflictos (OCC)"`
- El schema (`conflictos.schema.json`) — es el contrato, no un dato
- `PROV_GEO`, `CUBA_OUTLINE` — geometría del renderizador

---

## 2 · Protocolo de validación antes de publicar

1. Pasar el JSON emitido contra `public/data/conflictos.schema.json`
   (usar como `responseSchema` de Gemini o validar con `ajv` / `jsonschema`)
2. Verificar que `meta.tema === "conflictos"` (campo string en el schema)
3. Verificar que `meses` contiene exactamente los meses del trimestre (3 objetos)
4. Comprobar que `eventos[].tipo` usa solo los valores del enum:
   `Calle` · `Energía` · `Salud` · `Represión` · `Escándalo` · `Digital`
5. Comprobar que `eventos[].mes` usa solo: `ene` · `feb` · `mar` · `abr` · `may` · `jun` · `jul` · `ago` · `sep` · `oct` · `nov` · `dic`

---

## 3 · Cómo alimenta el agente (consultas trimestrales sugeridas)

- `OCC informe trimestral <trimestre> <año>` → totales, desafios, represivos, presenciales, grafiti
- `OCC derechos civiles políticos económicos sociales <trimestre>` → desglose dcp/des por mes
- `OCC provincias más activas <mes>` → top provincias con cifras
- `OCC categorías protesta <mes> <año>` → categorías de derechos económicos y sociales
- `Cuba protesta cívica hechos destacados <trimestre>` → 10–12 eventos para `eventos[]`
- `OCC serie anual protestas Cuba 2021 2022 2023 2024 2025` → serie histórica para `anual[]`

### Reglas editoriales para `eventos[]`

- `texto` siempre **parafraseado** (nunca citas literales), máx. ~400 chars
- `tipo` del enum cerrado: `Calle` · `Energía` · `Salud` · `Represión` · `Escándalo` · `Digital`
- `lugar` en formato `"Localidad, Provincia"` o `"Institución · Organismo"`
- `fecha` en formato natural: `"13 mar"`, `"4–5 mar"`, `"marzo"`
- Incluir siempre al menos 1 evento de tipo `Calle` y 1 de tipo `Represión`

---

## 4 · Paleta del renderizador (referencia)

```js
hot:  "#F2913B"   // naranja fuego — acento principal
cool: "#3FA7C9"   // azul frío — DES (económicos y sociales)
h3:   "#E04B3A"   // rojo — represión
h5:   "#F7CE4B"   // amarillo — grafiti / pulso
bg:   "#0A0D12"   // fondo oscuro
```

El renderizador mapea cada `tipo` de evento a un color:
`Calle → hot`, `Energía → cool`, `Salud → #9DC8BF`, `Represión → h3`, `Escándalo → h5`, `Digital → steel`
