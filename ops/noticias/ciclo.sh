#!/usr/bin/env bash
# Envoltorio del cron (00:00 y 18:00). Carga entorno y secretos, evita solapes y
# guarda el registro del día en ops/noticias/estado/logs/.
set -uo pipefail

REPO="$(cd "$(dirname "$0")/../.." && pwd)"
export PATH="$HOME/.local/bin:$(dirname "$(ls -d "$HOME"/.nvm/versions/node/*/bin/node 2>/dev/null | tail -1)"):/usr/local/bin:/usr/bin:/bin"
# Secretos en ~/.config/yamacoa/ de root o del dueño del repo (el cron corre como root).
DUENO_HOME="$(getent passwd "$(stat -c %U "$REPO")" | cut -d: -f6)"
for f in "$HOME/.config/yamacoa/cf.env" "$HOME/.config/yamacoa/noticias.env" "$HOME/.config/yamacoa/claude.env" \
         "$DUENO_HOME/.config/yamacoa/cf.env" "$DUENO_HOME/.config/yamacoa/noticias.env" "$DUENO_HOME/.config/yamacoa/claude.env"; do
  # shellcheck disable=SC1090
  [ -f "$f" ] && { set -a; . "$f"; set +a; }
done

LOGS="$REPO/ops/noticias/estado/logs"
mkdir -p "$LOGS"
exec 9>"$REPO/ops/noticias/estado/ciclo.lock"
if ! flock -n 9; then
  echo "$(date -Is) ciclo anterior aún en curso; se salta" >> "$LOGS/$(date +%F).log"
  exit 0
fi
cd "$REPO"
node ops/noticias/ciclo.mjs "$@" >> "$LOGS/$(date +%F).log" 2>&1
