# NOTAS — expediente `mineria`

## Contenido editorial
Reservas y producción de níquel, cobalto, plomo-zinc, oro-plata y otros minerales cubanos.
Foco especial en la ruptura de la cadena Moa → Fort Saskatchewan (jun-2026) y el giro
inversor hacia Rusia y China.

## Frontera de datos
- Reservas: estimaciones USGS 2024 + NI 43-101 Sherritt (Moa) + JORC Antilles Gold (La Demajagua).
  Los datos de GeoMinera Cuba no tienen auditoría independiente: tratarlos como suelos.
- Producción de Ni y Co: 2019-2025. El año 2024 no aparece en fuentes públicas.
  Sherritt publica datos anuales en su informe de producción. Verificar en Q1 2027.
- Zinc/Plomo: datos hasta 2023; sin fuente para 2024-2025.

## Dataset
- `public/data/mineria.json` — cadencia: **estática** (no parte del ciclo de 8 h).
- Actualizar manualmente cuando Sherritt publique producción anual o USGS revise reservas.

## Renderer
- `src/temas/mineria.jsx` — CONGELADO tras la entrega de 2026-06-28.
- Paleta: cobre `#C47B2B` / malaquita `#3B8C6A` / níquel `#9EAAB8`.
- Tabs: Mapa de recursos | Valoración | Producción | Proceso HPAL | Encuesta.
- Mapa: 10 yacimientos con coordenadas lat/lon aproximadas (±15 km nivel distrito).
- Gráfico producción: ComposedChart bar (Ni) + line (Co), eje dual.
- Gráfico valoración: BarChart horizontal comparativo por norma técnica.
- Proceso HPAL: diagrama de flujo 8 pasos; pasos 7-8 marcados "CADENA ROTA jun-2026".

## Encuesta
- 3 preguntas. Persistencia en localStorage (`ymPollMineria`).
- Para activar Supabase: ejecutar `poll_supabase.sql` y cambiar el `pollStore`
  en el renderer para usar el RPC `vote_mineria`.

## Registro
- Entry en `src/temas/registry.js`: id `mineria`, accent `#C47B2B`.

## Afirmaciones marcadas como no completamente verificadas
- Reservas Pinares de Mayarí (~2.200 Mt): estimación soviética de los 70s, sin revisión independiente.
- Reservas San Felipe (~3.000 Mt, ~60.000 M USD): inferencia sin NI 43-101 ni JORC. Marcar confianza "baja".
- Inversión rusa >1.000 M USD: citada en medios; no confirmada con contrato firmado.
- Producción Zn/Pb 2019-2023: estimaciones propias, sin ONE Cuba disponible.

## Caveats de coordinadas geográficas
Los yacimientos se muestran en posición provincial/distrital, no sobre el depósito exacto.
Usar solo para referencia orientativa en el mapa.
