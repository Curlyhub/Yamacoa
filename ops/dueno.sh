# shellcheck shell=bash
# Se incluye (source) al principio de ops/publicar.sh y ops/noticias/ciclo.sh, tras fijar REPO:
#   . "$REPO/ops/dueno.sh" "$0" "$@"
#
# El cron (tarea de Windows «Yamacoa noticias») corre como el dueño del repo (<usuario>). Si alguien
# publica como root, deja en el worktree ficheros que el dueño no puede borrar y el siguiente ciclo
# falla al publicar (20-oct-2026: las noticias de las 06:00 no salieron). Por eso:
#  - como root: devuelve al dueño lo que no sea suyo y se relanza como él;
#  - como dueño: si queda algo ajeno, se detiene al principio con un mensaje claro.
# Además fija el PATH con el node de nvm del dueño (el del sistema es demasiado viejo para wrangler).

_YAMACOA_SCRIPT="$1"; shift
_YAMACOA_REAL="$(cd "$REPO" && pwd -P)"
_YAMACOA_WT="${YAMACOA_PUBLICACION:-$(dirname "$_YAMACOA_REAL")/yamacoa-publicacion}"
_YAMACOA_DUENO="$(stat -c %U "$_YAMACOA_REAL")"
_YAMACOA_DUENO_HOME="$(getent passwd "$_YAMACOA_DUENO" | cut -d: -f6)"

_yamacoa_ajenos() {  # $1 = usuario; imprime hasta 5 rutas que no son suyas
  for d in "$_YAMACOA_REAL" "$_YAMACOA_WT"; do
    [ -d "$d" ] && find "$d" ! -user "$1" -print 2>/dev/null
  done | head -5
}

if [ "$(id -u)" = 0 ] && [ "$_YAMACOA_DUENO" != root ]; then
  for d in "$_YAMACOA_REAL" "$_YAMACOA_WT"; do
    [ -d "$d" ] && find "$d" ! -user "$_YAMACOA_DUENO" -exec chown -h "$_YAMACOA_DUENO:$_YAMACOA_DUENO" {} +
  done
  echo "(root) relanzando como $_YAMACOA_DUENO: $_YAMACOA_SCRIPT" >&2
  exec runuser -u "$_YAMACOA_DUENO" -- env HOME="$_YAMACOA_DUENO_HOME" bash "$_YAMACOA_SCRIPT" "$@"
fi

_YAMACOA_AJENOS="$(_yamacoa_ajenos "$(id -un)")"
if [ -n "$_YAMACOA_AJENOS" ]; then
  echo "ERROR: hay ficheros que no son de $(id -un) y el build no podrá borrarlos:" >&2
  echo "$_YAMACOA_AJENOS" >&2
  echo "Arreglo: sudo chown -R $(id -un): $_YAMACOA_REAL $_YAMACOA_WT" >&2
  exit 1
fi

_YAMACOA_NODE="$(ls -d "$HOME"/.nvm/versions/node/*/bin 2>/dev/null | sort -V | tail -1)"
[ -n "$_YAMACOA_NODE" ] && export PATH="$HOME/.local/bin:$_YAMACOA_NODE:$PATH"
unset _YAMACOA_AJENOS _YAMACOA_NODE
