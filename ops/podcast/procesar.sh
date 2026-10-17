#!/usr/bin/env bash
# ops/podcast/procesar.sh: procesa las grabaciones entregadas desde el estudio.
#
#   subida  ->  procesando  ->  procesada   (o error, con motivo)
#
# Por cada grabación en estado 'subida':
#   1. baja los trozos del R2 privado y los une en el MÁSTER (byte a byte: los trozos de
#      MediaRecorder con timeslice forman un único fichero válido al concatenarlos en orden)
#   2. limpia: paso-alto 70 Hz + reducción de ruido + normalización EBU R128 a -16 LUFS
#      (DeepFilterNet si está instalado, si no RNNoise vía ffmpeg arnndn)
#   3. transcribe en español con whisper.cpp (marcas de tiempo por segmento)
#   4. sube máster, limpio.flac, escucha.mp3 y transcripcion.json; borra los trozos
#
# El máster crudo NO se borra nunca: es el original de archivo (procedencia).
# Corre en Oracle (ARM, CPU) o en local. Cron sugerido: */15 * * * *
#
# Requisitos: ffmpeg (con arnndn), rclone con remoto "r2" (R2 S3 API), jq, curl,
#   whisper.cpp (whisper-cli) + modelo, modelo RNNoise .rnnn; opcional: deep-filter.
# Entorno (fichero fuera del repo, p.ej. ~/.yamacoa/podcast.env):
#   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, WHISPER_MODEL, RNNOISE_MODEL
set -euo pipefail

: "${SUPABASE_URL:?}" "${SUPABASE_SERVICE_ROLE_KEY:?}" "${WHISPER_MODEL:?}" "${RNNOISE_MODEL:?}"
BUCKET="${BUCKET:-r2:yamacoa-grabaciones}"
TRABAJO="${TRABAJO:-/var/tmp/yamacoa-podcast}"
LOCK="$TRABAJO/.lock"
mkdir -p "$TRABAJO"
exec 9>"$LOCK"; flock -n 9 || { echo "ya hay un procesador en marcha"; exit 0; }

api() { # api METODO RUTA [JSON]
  curl -fsS -X "$1" "$SUPABASE_URL/rest/v1/$2" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" -H "Prefer: return=minimal" ${3:+-d "$3"}
}
estado() { # estado ID ESTADO [MOTIVO]
  api PATCH "grabaciones?id=eq.$1" "$(jq -nc --arg e "$2" --arg m "${3:-}" \
    '{estado:$e, actualizado:(now|todate)} + (if $m == "" then {} else {motivo_error:$m} end)')"
}

procesar() {
  local id="$1" trozos="$2" mime="$3"
  local dir="$TRABAJO/$id" ext="webm"
  [[ "$mime" == audio/mp4* ]] && ext="m4a"
  [[ "$mime" == audio/ogg* ]] && ext="ogg"
  rm -rf "$dir"; mkdir -p "$dir/trozos"

  rclone copy "$BUCKET/grabaciones/$id/trozos" "$dir/trozos" --quiet
  local hay; hay=$(find "$dir/trozos" -type f | wc -l)
  [[ "$hay" -gt 0 ]] || { estado "$id" error "no hay trozos en R2"; return; }
  if [[ "$trozos" -ge 0 && "$hay" -ne "$trozos" ]]; then
    estado "$id" error "faltan trozos: $hay de $trozos en R2"; return
  fi

  # 1. máster
  find "$dir/trozos" -type f | sort | xargs cat > "$dir/master.$ext"
  ffprobe -v error "$dir/master.$ext" || { estado "$id" error "máster ilegible"; return; }

  # 2. limpieza
  ffmpeg -nostdin -v error -y -i "$dir/master.$ext" -ac 1 -ar 48000 "$dir/crudo.wav"
  if command -v deep-filter >/dev/null; then
    deep-filter --output-dir "$dir/df" "$dir/crudo.wav" >/dev/null
    local fuente="$dir/df/crudo.wav" ruido=""
  else
    local fuente="$dir/crudo.wav" ruido=",arnndn=m=$RNNOISE_MODEL:mix=0.85"
  fi
  # Dos pasadas de loudnorm: la primera mide, la segunda aplica (más fiel que una sola).
  local medida
  medida=$(ffmpeg -nostdin -hide_banner -i "$fuente" \
    -af "highpass=f=70${ruido},loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 \
    | sed -n '/^{/,/^}/p')
  local mi mtp mlra mth off
  mi=$(jq -r .input_i <<<"$medida"); mtp=$(jq -r .input_tp <<<"$medida")
  mlra=$(jq -r .input_lra <<<"$medida"); mth=$(jq -r .input_thresh <<<"$medida"); off=$(jq -r .target_offset <<<"$medida")
  ffmpeg -nostdin -v error -y -i "$fuente" -af "highpass=f=70${ruido},loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$mi:measured_TP=$mtp:measured_LRA=$mlra:measured_thresh=$mth:offset=$off:linear=true" \
    -ar 48000 "$dir/limpio.flac"
  ffmpeg -nostdin -v error -y -i "$dir/limpio.flac" -ac 1 -b:a 96k "$dir/escucha.mp3"

  # 3. transcripción (whisper.cpp pide WAV 16 kHz mono)
  ffmpeg -nostdin -v error -y -i "$dir/limpio.flac" -ar 16000 -ac 1 "$dir/w16.wav"
  whisper-cli -m "$WHISPER_MODEL" -l es -oj -of "$dir/whisper" -f "$dir/w16.wav" >/dev/null 2>&1 \
    || { estado "$id" error "falló la transcripción"; return; }
  jq '{idioma:"es", modelo:"whisper.cpp", segmentos:[.transcription[] |
        {inicio:(.offsets.from/1000), fin:(.offsets.to/1000), texto:(.text|ltrimstr(" ")), hablante:null}]}' \
    "$dir/whisper.json" > "$dir/transcripcion.json"

  # 4. subir resultados y borrar trozos (el máster queda como original)
  local dur; dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$dir/limpio.flac" | cut -d. -f1)
  for f in "master.$ext" limpio.flac escucha.mp3 transcripcion.json; do
    rclone copyto "$dir/$f" "$BUCKET/grabaciones/$id/$f" --quiet
  done
  local remoto; remoto=$(rclone size --json "$BUCKET/grabaciones/$id/master.$ext" | jq .bytes)
  if [[ "$remoto" == "$(stat -c%s "$dir/master.$ext")" ]]; then
    rclone purge "$BUCKET/grabaciones/$id/trozos" --quiet
  fi
  api PATCH "grabaciones?id=eq.$id" "$(jq -nc --argjson d "${dur:-0}" '{estado:"procesada", duracion_seg:$d, actualizado:(now|todate)}')"
  rm -rf "$dir"
  echo "procesada $id (${dur}s)"
}

lista=$(curl -fsS "$SUPABASE_URL/rest/v1/grabaciones?estado=eq.subida&select=id,trozos,mime&order=creado" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")
jq -c '.[]' <<<"$lista" | while read -r g; do
  id=$(jq -r .id <<<"$g"); tr=$(jq -r .trozos <<<"$g"); mi=$(jq -r .mime <<<"$g")
  estado "$id" procesando
  ( procesar "$id" "$tr" "$mi" ) || estado "$id" error "fallo inesperado del procesador"
done
