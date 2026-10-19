#!/usr/bin/env bash
# Publica Yamacoa en Cloudflare Pages (Direct Upload) con las noticias vigentes y los episodios de podcast.
#
# El build NUNCA sale del árbol de trabajo (puede tener cambios a medias): sale de la
# rama `publicacion`, en un worktree aparte, más el feed de noticias exportado desde
# la base de datos. Así el cron solo publica lo que un humano ya commiteó y movió.
#
#   ops/publicar.sh               redespliega `publicacion` + noticias vigentes (lo que hace el cron)
#   ops/publicar.sh --mover       mueve `publicacion` a HEAD (publicar código/expedientes nuevos) y despliega
#   ops/publicar.sh --sin-subir   todo menos wrangler (comprobar el build)
#
# Secretos (fuera del repo): ~/.config/yamacoa/cf.env (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
# y ~/.config/yamacoa/noticias.env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd -P)"  # -P: ruta real aunque se llame por ~/bohio/yamacoa (enlace)
WT="${YAMACOA_PUBLICACION:-$(dirname "$REPO")/yamacoa-publicacion}"
RAMA=publicacion
MOVER=0; SUBIR=1; MOTIVO=manual
while [ $# -gt 0 ]; do
  case "$1" in
    --mover) MOVER=1 ;;
    --sin-subir) SUBIR=0 ;;
    --motivo) MOTIVO="$2"; shift ;;
    *) echo "opción desconocida: $1" >&2; exit 2 ;;
  esac
  shift
done

REPO_DUENO_HOME="$(getent passwd "$(stat -c %U "$(dirname "$0")")" | cut -d: -f6)"
for f in "$HOME/.config/yamacoa/cf.env" "$HOME/.config/yamacoa/noticias.env" \
         "$REPO_DUENO_HOME/.config/yamacoa/cf.env" "$REPO_DUENO_HOME/.config/yamacoa/noticias.env"; do
  # shellcheck disable=SC1090
  [ -f "$f" ] && { set -a; . "$f"; set +a; }
done

cd "$REPO"
if [ "$MOVER" = 1 ]; then
  git branch -f "$RAMA" HEAD
  echo "rama $RAMA -> $(git rev-parse --short HEAD)"
fi
if ! git rev-parse --verify -q "$RAMA" >/dev/null; then
  echo "No existe la rama '$RAMA'. Tras revisar y commitear: ops/publicar.sh --mover" >&2
  exit 1
fi

if [ ! -e "$WT/.git" ]; then
  git worktree add --detach "$WT" "$RAMA"
fi
git -C "$WT" checkout -q -f --detach "$RAMA"
git -C "$WT" clean -q -fdx -e node_modules
ln -sfn "$REPO/node_modules" "$WT/node_modules"

# Noticias vigentes (desde la BD) + su audio, dentro de public/ del worktree.
: "${SUPABASE_SERVICE_ROLE_KEY:?falta SUPABASE_SERVICE_ROLE_KEY (~/.config/yamacoa/noticias.env): sin ella se exportaría la BD local de ensayo}"
node "$REPO/ops/noticias/ciclo.mjs" --solo-exportar --destino "$WT/public"
# Episodios de podcast publicados (BD) y sus transcripciones; el MP3 está en R2.
node "$REPO/ops/podcast/auto/episodio.mjs" --solo-exportar --destino "$WT/public"
# Artículos de opinión publicados (BD); vacío si no hay, y entonces la sección no se muestra.
node "$REPO/ops/opinion/opinion.mjs" --solo-exportar --destino "$WT/public"

(cd "$WT" && CI=false npm run build --silent)
test -s "$WT/build/index.html"
test -s "$WT/build/data/feed/noticias.json"

COMMIT="$(git rev-parse "$RAMA")"
if [ "$SUBIR" = 1 ]; then
  : "${CLOUDFLARE_API_TOKEN:?falta CLOUDFLARE_API_TOKEN (~/.config/yamacoa/cf.env)}"
  (cd "$WT" && npx --no-install wrangler pages deploy build --project-name=yamacoa --branch=main \
    --commit-hash "$COMMIT" --commit-message "publicar ($MOTIVO) $(date +%FT%H:%M)" --commit-dirty=true)
  echo "desplegado $COMMIT ($MOTIVO)"
else
  echo "build listo en $WT/build (sin subir)"
fi
