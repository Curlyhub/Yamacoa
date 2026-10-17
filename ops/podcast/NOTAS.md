# Podcast: notas de operador

## ¿Hace falta más base de datos?

No. Hace falta **almacenamiento de objetos**, y ese es Cloudflare R2:

| Qué | Dónde | Por qué |
|---|---|---|
| Metadatos de grabaciones (título, voces, consentimiento, estado) | Supabase `public.grabaciones` | Ya existe; son filas pequeñas |
| Trozos crudos, máster, `limpio.flac`, transcripción | R2 **privado** `yamacoa-grabaciones` | Originales de archivo; nunca públicos |
| Episodio publicado (`.mp3`), resúmenes hablados, feeds JSON | R2 **público** `yamacoa-media` → `media.yamacoa.com` | Sin coste de salida (egress 0) |

Por qué no Supabase Storage: el plan gratuito trae 1 GB **en total**. Por qué no Pages:
límite de 25 MiB por fichero y cada audio obligaría a recompilar y desplegar.

R2 gratis: 10 GB-mes, 1 M escrituras y 10 M lecturas al mes, **egress gratis**. Después,
unos 0,015 USD por GB-mes.

Cálculo de tamaños:

- Grabar en opus a 128 kbps ocupa unos 58 MB por hora (máster).
- `limpio.flac` mono 48 kHz ocupa unos 120 a 170 MB por hora. Es lo más pesado.
  Si el espacio aprieta, pasarlo a la clase Infrequent Access o borrarlo y quedarse
  solo con el máster.
- El `.mp3` publicado a 96 kbps mono ocupa unos 43 MB por hora.

Con unas 8 horas grabadas al mes se superan los 10 GB gratuitos hacia el cuarto o quinto
mes. A partir de ahí el coste ronda 1 o 2 USD al mes.

## Flujo

```
estudio.html (teléfono/portátil)
  └─ trozos de 10 s → IndexedDB (sobrevive a cortes) → PUT subida.yamacoa.com (Worker)
        └─ R2 privado grabaciones/<id>/trozos/00000.webm …
  └─ cerrar_grabacion()            → estado 'subida'
ops/podcast/procesar.sh (cron 15 min, Oracle o local)
  └─ máster + limpieza + −16 LUFS + whisper → estado 'procesada'
/podcast-publicar <id>  (asistido, verja humana)
  └─ borrador: título, descripción, capítulos, hablantes, revisión de contenido
  └─ aprobación humana → mp3 público + transcripción + entrada en feed/podcast.json
  └─ estado 'publicada'
```

## Puesta en marcha (una vez)

1. Supabase: ejecutar `ops/podcast/podcast_supabase.sql`. Habilitar a quien graba con
   `update public.perfiles set puede_grabar = true where email = '…';`
2. R2:
   `npx wrangler r2 bucket create yamacoa-grabaciones` (sin dominio público)
   y `npx wrangler r2 bucket create yamacoa-media`, con dominio personalizado
   `media.yamacoa.com` y CORS que permita `GET` desde `https://yamacoa.com`.
3. Worker: revisar `ORIGENES` en `workers/media/wrangler.toml` (dominio real del portal) y
   `cd workers/media && npx wrangler deploy`.
4. Procesador: instalar ffmpeg, jq, rclone y whisper.cpp. Modelo recomendado en CPU ARM:
   `ggml-medium-q5_0` (calidad) o `ggml-small` (rapidez). Modelo RNNoise: `sh.rnnn` del repo
   GregorR/rnnoise-models. Configurar `rclone config` con un remoto `r2` (token R2 de
   lectura y escritura, solo para el bucket de grabaciones y el de medios). Cron:
   `*/15 * * * * . ~/.yamacoa/podcast.env && /ruta/ops/podcast/procesar.sh >> ~/podcast.log 2>&1`
5. Web: compilar con `REACT_APP_FEED_BASE=https://media.yamacoa.com/feed` para que la
   SPA lea los feeds de R2 y no la copia vacía de `public/data/feed`.

## Grabar bien (para quien graba)

- Un solo dispositivo en el centro de la mesa, a 30–60 cm de las voces. Habitación con
  muebles o cortinas, nunca un baño ni un cuarto vacío.
- El medidor debe quedarse en «Nivel correcto» hablando normal.
- La pantalla debe quedarse encendida. El estudio lo pide con Wake Lock, pero algunos
  navegadores no lo permiten. Conviene enchufar el teléfono.
- Si se corta la red no pasa nada: los trozos se guardan en el teléfono y se suben al volver.
- **Consentimiento:** todas las voces deben constar antes de empezar. Lo registra la
  base de datos con fecha y hora.

## Notas técnicas

- iOS/Safari graba `audio/mp4` (AAC). Chrome, Firefox y Android graban `audio/webm` (opus).
  El procesador acepta los dos.
- Si el teléfono murió sin cerrar, en «Mis grabaciones» aparece el botón **Cerrar**, que
  entrega lo subido. Usa `trozos = -1`: el procesador no exige un número exacto de trozos.
- La reducción de ruido del navegador viene **desactivada** por defecto. Destruye
  sibilantes y respiraciones, y la limpieza buena (DeepFilterNet o RNNoise) se hace después
  sobre el original.
- La transcripción de whisper no separa hablantes. En `/podcast-publicar` se asignan
  con ayuda del agente `productor-podcast` y confirmación humana.
