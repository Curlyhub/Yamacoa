#!/usr/bin/env bash
# ops/podcast/procesar.sh: procesa las grabaciones entregadas desde el estudio.
#
#   subida  ->  procesando  ->  procesada   (o error, con motivo)
#
# Por cada grabación en estado 'subida':
#   1. baja los trozos del servidor (tts.yamacoa.com, carpeta privada) y los une en el MÁSTER (byte a byte: los trozos de
#      MediaRecorder con timeslice forman un único fichero válido al concatenarlos en orden)
#   2. limpia: paso-alto 70 Hz + reducción de ruido + normalización EBU R128 a -16 LUFS
#      (DeepFilterNet si está instalado, si no RNNoise vía ffmpeg arnndn)
#   3. transcribe en español (whisper.cpp si está; si no, faster-whisper en la GPU: transcribir.py)
#   4. sube máster, limpio.flac, escucha.mp3 y transcripcion.json al servidor; borra los trozos
#
# El máster crudo NO se borra nunca: es el original de archivo (procedencia).
# Corre en el PC (lo lanza ciclo.sh en cada ciclo; también a mano). Desde 2026-10-18 los trozos
# viven en el servidor propio (servicio ops/servidor/subida_estudio.py), no en R2.
#
# Requisitos: ffmpeg (con arnndn), rsync, jq, curl, modelo RNNoise .rnnn y faster-whisper (o
#   whisper.cpp con WHISPER_MODEL); opcional: deep-filter.
# Entorno: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (noticias.env). Por defecto:
#   ORIGEN=$YAMACOA_SERVIDOR (usuario@host:, en noticias.env; la clave ~/.ssh/yamacoa_grabaciones solo puede hacer rsync
#   dentro de /var/lib/yamacoa-grabaciones), RNNOISE_MODEL=~/bohio/yamacoa-tts/modelos/sh.rnnn
set -euo pipefail

: "${SUPABASE_URL:?}" "${SUPABASE_SERVICE_ROLE_KEY:?}"
SUPABASE_URL="${SUPABASE_URL%/}"; SUPABASE_URL="${SUPABASE_URL%/rest/v1}"
RNNOISE_MODEL="${RNNOISE_MODEL:-$HOME/bohio/yamacoa-tts/modelos/sh.rnnn}"
ORIGEN="${ORIGEN:-${YAMACOA_SERVIDOR:?falta YAMACOA_SERVIDOR (usuario@host:, noticias.env)}}"
SSH_GRAB="ssh -i ${CLAVE_GRABACIONES:-$HOME/.ssh/yamacoa_grabaciones} -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=20"
PY="${YAMACOA_TTS_PY:-$HOME/bohio/yamacoa-tts/.venv/bin/python}"
AQUI="$(cd "$(dirname "$0")" && pwd)"
TRABAJO="${TRABAJO:-/var/tmp/yamacoa-podcast}"
LOCK="$TRABAJO/.lock"
mkdir -p "$TRABAJO"
exec 9>"$LOCK"; flock -n 9 || { echo "ya hay un procesador en marcha"; exit 0; }

# Clave nueva (sb_secret_…): solo en apikey; la heredada (JWT eyJ…), también como Bearer.
AUTH=(-H "apikey: $SUPABASE_SERVICE_ROLE_KEY")
[[ "$SUPABASE_SERVICE_ROLE_KEY" == eyJ* ]] && AUTH+=(-H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")
api() { # api METODO RUTA [JSON]
  curl -fsS -X "$1" "$SUPABASE_URL/rest/v1/$2" "${AUTH[@]}" \
    -H "Content-Type: application/json" -H "Prefer: return=minimal" ${3:+-d "$3"}
}
estado() { # estado ID ESTADO [MOTIVO]
  api PATCH "grabaciones?id=eq.$1" "$(jq -nc --arg e "$2" --arg m "${3:-}" \
    '{estado:$e, actualizado:(now|todate)} + (if $m == "" then {} else {motivo_error:$m} end)')"
}

# Escucha privada para el autor (bucket grabaciones-escucha de Supabase, ver escucha_supabase.sql).
almacen() { # almacen METODO RUTA [FICHERO]
  curl -fsS -X "$1" "$SUPABASE_URL/storage/v1/object/grabaciones-escucha/$2" "${AUTH[@]}" \
    ${3:+-H "Content-Type: audio/mpeg" -H "x-upsert: true" --data-binary "@$3"} >/dev/null
}

procesar() {
  local id="$1" trozos="$2" mime="$3" autor="$4"
  local dir="$TRABAJO/$id" ext="webm"
  [[ "$mime" == audio/mp4* ]] && ext="m4a"
  [[ "$mime" == audio/ogg* ]] && ext="ogg"
  rm -rf "$dir"; mkdir -p "$dir/trozos"

  rsync -a -e "$SSH_GRAB" "$ORIGEN$id/trozos/" "$dir/trozos/" 2>/dev/null || true
  local hay; hay=$(find "$dir/trozos" -type f ! -name '.subiendo-*' | wc -l)
  [[ "$hay" -gt 0 ]] || { estado "$id" error "no hay trozos en el servidor"; return; }
  if [[ "$trozos" -ge 0 && "$hay" -ne "$trozos" ]]; then
    estado "$id" error "faltan trozos: $hay de $trozos en el servidor"; return
  fi

  # 1. máster
  find "$dir/trozos" -type f ! -name '.subiendo-*' | sort | xargs cat > "$dir/master.$ext"
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
  if command -v whisper-cli >/dev/null && [[ -n "${WHISPER_MODEL:-}" ]]; then
    ffmpeg -nostdin -v error -y -i "$dir/limpio.flac" -ar 16000 -ac 1 "$dir/w16.wav"
    whisper-cli -m "$WHISPER_MODEL" -l es -oj -of "$dir/whisper" -f "$dir/w16.wav" >/dev/null 2>&1 \
      || { estado "$id" error "falló la transcripción"; return; }
    jq '{idioma:"es", modelo:"whisper.cpp", segmentos:[.transcription[] |
          {inicio:(.offsets.from/1000), fin:(.offsets.to/1000), texto:(.text|ltrimstr(" ")), hablante:null}]}' \
      "$dir/whisper.json" > "$dir/transcripcion.json"
  else
    TQDM_DISABLE=1 "$PY" "$AQUI/transcribir.py" "$dir/limpio.flac" "$dir/transcripcion.json" >/dev/null 2>&1 \
      || { estado "$id" error "falló la transcripción"; return; }
  fi

  # 4. subir resultados y borrar trozos (el máster queda como original)
  local dur; dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$dir/limpio.flac" | cut -d. -f1)
  for f in "master.$ext" limpio.flac escucha.mp3 transcripcion.json; do
    rsync -t -e "$SSH_GRAB" "$dir/$f" "$ORIGEN$id/$f"
  done
  # Los trozos se borran SOLO si el máster ya está en el servidor con su tamaño exacto.
  local remoto; remoto=$(rsync --list-only -e "$SSH_GRAB" "$ORIGEN$id/master.$ext" | awk '{gsub(",","",$2); print $2}')
  if [[ "$remoto" == "$(stat -c%s "$dir/master.$ext")" ]]; then
    mkdir -p "$dir/borrar"
    rsync -a --remove-source-files -e "$SSH_GRAB" "$ORIGEN$id/trozos/" "$dir/borrar/" >/dev/null
  fi
  # Para que su autor la escuche en el estudio (si falla, no se bloquea el procesado).
  almacen POST "$autor/$id.mp3" "$dir/escucha.mp3" || echo "aviso: no se pudo dejar la escucha de $id en el almacén"
  # Copia local del máster (segunda copia del original, fuera del servidor).
  mkdir -p "$HOME/bohio/yamacoa-grabaciones/$id" && cp "$dir/master.$ext" "$HOME/bohio/yamacoa-grabaciones/$id/"
  api PATCH "grabaciones?id=eq.$id" "$(jq -nc --argjson d "${dur:-0}" '{estado:"procesada", duracion_seg:$d, actualizado:(now|todate)}')"
  rm -rf "$dir"
  echo "procesada $id (${dur}s)"
}

# Descartadas por su autor: se borran sus ficheros (servidor y copia local) y se marca `purgada`.
# rsync --remove-source-files es lo único que permite la clave restringida para borrar.
purgar() { # purgar ID AUTOR
  local id="$1" tmp="$TRABAJO/purga-$1"
  mkdir -p "$tmp"
  rsync -a --remove-source-files -e "$SSH_GRAB" "$ORIGEN$id/" "$tmp/" >/dev/null 2>&1 || true
  rm -rf "$tmp" "$HOME/bohio/yamacoa-grabaciones/$id"
  almacen DELETE "$2/$id.mp3" 2>/dev/null || true
  api PATCH "grabaciones?id=eq.$id" "$(jq -nc '{purgada:(now|todate)}')"
  echo "purgada $id"
}
descartadas=$(curl -fsS "$SUPABASE_URL/rest/v1/grabaciones?estado=eq.descartada&purgada=is.null&select=id,autor_id" "${AUTH[@]}" 2>/dev/null || echo "[]")
jq -r '.[] | "\(.id) \(.autor_id)"' <<<"$descartadas" | while read -r id autor; do [[ -n "$id" ]] && purgar "$id" "$autor"; done
# Publicadas: la escucha privada ya no hace falta (el episodio está en la web).
publicadas=$(curl -fsS "$SUPABASE_URL/rest/v1/grabaciones?estado=eq.publicada&select=id,autor_id" "${AUTH[@]}" 2>/dev/null || echo "[]")
jq -r '.[] | "\(.id) \(.autor_id)"' <<<"$publicadas" | while read -r id autor; do almacen DELETE "$autor/$id.mp3" 2>/dev/null || true; done

lista=$(curl -fsS "$SUPABASE_URL/rest/v1/grabaciones?estado=eq.subida&select=id,trozos,mime,autor_id&order=creado" "${AUTH[@]}") \
  || { echo "procesar.sh: sin acceso a grabaciones (¿tabla sin crear?)"; exit 0; }
jq -c '.[]' <<<"$lista" | while read -r g; do
  id=$(jq -r .id <<<"$g"); tr=$(jq -r .trozos <<<"$g"); mi=$(jq -r .mime <<<"$g"); au=$(jq -r .autor_id <<<"$g")
  estado "$id" procesando
  ( procesar "$id" "$tr" "$mi" "$au" ) || estado "$id" error "fallo inesperado del procesador"
done
