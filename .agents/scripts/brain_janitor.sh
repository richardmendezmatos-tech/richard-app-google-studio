#!/usr/bin/env bash
set -euo pipefail

BRAIN_DIR="/Users/richardmendez/.gemini/antigravity/brain"
CURRENT_SESSION="fc03ef51-bcb3-4c88-93c1-b87ad56520f0"

echo "🧠 Brain Janitor: Iniciando limpieza estratégica..."

# 1. Poda de archivos resolved y metadatos en todas las sesiones
echo "🧹 Podando archivos .resolved y .metadata en todas las sesiones..."
find "$BRAIN_DIR" -maxdepth 3 -name "*.resolved*" -delete
find "$BRAIN_DIR" -maxdepth 3 -name "*.metadata.json" -delete

# 2. Identificación y eliminación de sesiones contaminadas (excepto la actual)
# Términos prohibidos: senior, vitalos, IFF, plenitud
FORBIDDEN_TERMS="senior\|vitalos\|IFF\|plenitud"

echo "🔍 Buscando sesiones con contextos prohibidos..."
CONTAMINATED_SESSIONS=$(grep -ril "$FORBIDDEN_TERMS" "$BRAIN_DIR" 2>/dev/null | cut -d '/' -f 7 | sort | uniq | grep -v "$CURRENT_SESSION" || true)

if [[ -n "$CONTAMINATED_SESSIONS" ]]; then
  for SESSION in $CONTAMINATED_SESSIONS; do
    echo "🗑️ Eliminando sesión contaminada: $SESSION"
    rm -rf "$BRAIN_DIR/$SESSION"
  done
else
  echo "✅ No se encontraron sesiones contaminadas adicionales."
fi

echo "✨ Limpieza del Brain completada para Richard Automotive."
