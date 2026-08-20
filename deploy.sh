#!/usr/bin/env bash
# ============================================================
#  AirFryer · Publicar en GitHub Pages
#  ------------------------------------------------------------
#  Sube la versión de la caché, hace commit y publica.
#
#  Uso:   ./deploy.sh "mensaje opcional"
#  Windows: doble clic en subir.bat
# ============================================================
set -e
cd "$(dirname "$0")"

MENSAJE="${1:-Actualización de la app}"

# ── 0. Comprobaciones previas ─────────────────────────────────
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌  Esta carpeta todavía no es un repositorio de git."
  echo "    Ejecuta una sola vez:  git init -b main && git add -A && git commit -m \"AirFryer\""
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "❌  Falta el repositorio remoto."
  echo "    Créalo en github.com y luego ejecuta:"
  echo "    git remote add origin https://github.com/TU-USUARIO/airfryer.git"
  exit 1
fi

# ── 1. ¿Hay algo que publicar? ────────────────────────────────
# Se comprueba ANTES de tocar sw.js: si no, cada ejecución
# generaría un commit aunque no hubieras cambiado nada.
if [ -z "$(git status --porcelain)" ]; then
  echo "✅  No hay cambios que subir. Todo está publicado."
  exit 0
fi

echo "📝  Cambios detectados:"
git status --porcelain | sed 's/^/    /'

# ── 2. Subir CACHE_VERSION ────────────────────────────────────
# Sin esto, los móviles que ya tengan la app instalada seguirían
# viendo la versión antigua guardada en su caché.
ACTUAL=$(grep -o "airfryer-v[0-9]\+" sw.js | head -1)
NUM=${ACTUAL#airfryer-v}
NUEVA="airfryer-v$((NUM + 1))"
sed -i "s/$ACTUAL/$NUEVA/" sw.js
echo "🔄  Caché: $ACTUAL → $NUEVA"

# ── 3. Commit y push ──────────────────────────────────────────
git add -A
git commit -q -m "$MENSAJE ($NUEVA)"
git push -q origin HEAD
echo "🚀  Publicado: $MENSAJE"

# ── 4. Recordatorios ──────────────────────────────────────────
REMOTO=$(git remote get-url origin)
if [[ "$REMOTO" =~ github.com[:/]([^/]+)/([^/.]+) ]]; then
  echo "🌐  https://${BASH_REMATCH[1]}.github.io/${BASH_REMATCH[2]}/"
fi
echo "⏳  GitHub tarda 1-2 minutos en actualizar la página."
echo "📱  En el móvil: cierra la app del todo y ábrela de nuevo para coger la versión nueva."
