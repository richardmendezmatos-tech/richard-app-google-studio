#!/usr/bin/env bash
# =============================================================================
# scripts/audit-isolation.sh — Richard Automotive v2026.1
# Standard #3: Auditoría de Aislamiento y Duplicidad
#
# Uso: bash scripts/audit-isolation.sh
# Output: workspace/AUDIT_ISOLATION_<date>.json
# =============================================================================
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATE=$(date +%Y-%m-%d)
OUTPUT_FILE="$PROJECT_ROOT/workspace/${DATE}_AUDIT_ISOLATION_$(uuidgen | tr '[:upper:]' '[:lower:]' | head -c 8).json"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔬 Richard Automotive — Auditoría de Aislamiento v2026.1"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Proyecto: $PROJECT_ROOT"
echo "📄 Output:   $OUTPUT_FILE"
echo ""

# ── 1. Variables de entorno foráneas ──────────────────────────────────────────
echo "🔑 [1/3] Escaneando variables de entorno..."

# Prefijos que NO deben existir en este proyecto
FOREIGN_PREFIXES=("HAPPY_SENIOR" "VITALOS" "NEWS_" "HS_" "NEXUS_")
ENV_ISSUES=()

if [ -f "$PROJECT_ROOT/.env" ]; then
  for prefix in "${FOREIGN_PREFIXES[@]}"; do
    matches=$(grep -n "^${prefix}" "$PROJECT_ROOT/.env" 2>/dev/null || true)
    if [ -n "$matches" ]; then
      ENV_ISSUES+=("$(echo "$matches" | head -5)")
    fi
  done
fi

if [ ${#ENV_ISSUES[@]} -eq 0 ]; then
  echo "   ✅ Sin variables foráneas detectadas"
  ENV_STATUS="clean"
else
  echo "   ⚠️  Variables foráneas encontradas:"
  printf '   %s\n' "${ENV_ISSUES[@]}"
  ENV_STATUS="issues_found"
fi

# ── 2. Dependencias sin usar (depcheck) ───────────────────────────────────────
echo ""
echo "📦 [2/3] Analizando dependencias con depcheck..."

DEPCHECK_OUTPUT=$(npx depcheck --json 2>/dev/null || echo '{"dependencies":[],"devDependencies":[]}')
UNUSED_DEPS=$(echo "$DEPCHECK_OUTPUT" | node -e "
  const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  const unused = [...(data.dependencies || []), ...(data.devDependencies || [])];
  console.log(JSON.stringify(unused));
" 2>/dev/null || echo '[]')

UNUSED_COUNT=$(echo "$UNUSED_DEPS" | node -e "console.log(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).length)" 2>/dev/null || echo "0")

if [ "$UNUSED_COUNT" -eq 0 ]; then
  echo "   ✅ Sin dependencias sin usar"
  DEP_STATUS="clean"
else
  echo "   ⚠️  $UNUSED_COUNT dependencias potencialmente sin usar (verificar manualmente)"
  DEP_STATUS="review_required"
fi

# ── 3. Archivos duplicados potenciales ────────────────────────────────────────
echo ""
echo "📋 [3/3] Detectando funciones/archivos duplicados..."

# Buscar archivos con nombres muy similares en src/
POTENTIAL_DUPES=$(find "$PROJECT_ROOT/src" -name "*.ts" -o -name "*.tsx" 2>/dev/null | \
  xargs -I{} basename {} | sort | uniq -d 2>/dev/null || echo "")

if [ -z "$POTENTIAL_DUPES" ]; then
  echo "   ✅ Sin nombres de archivo duplicados en /src"
  DUPE_STATUS="clean"
else
  echo "   ⚠️  Posibles duplicados: $POTENTIAL_DUPES"
  DUPE_STATUS="review_required"
fi

# ── Generar reporte JSON ───────────────────────────────────────────────────────
echo ""
echo "💾 Guardando reporte en workspace..."

mkdir -p "$PROJECT_ROOT/workspace"

cat > "$OUTPUT_FILE" << EOF
{
  "project": "richard-automotive",
  "standard": "3-isolation-audit",
  "version": "2026.1",
  "date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "auditor": "Antigravity v2026.1",
  "results": {
    "environment_variables": {
      "status": "$ENV_STATUS",
      "foreign_prefixes_checked": ["HAPPY_SENIOR", "VITALOS", "NEWS_", "HS_", "NEXUS_"],
      "issues": ${ENV_ISSUES[@]+"$(printf '%s\n' "${ENV_ISSUES[@]}" | jq -Rs 'split("\n") | map(select(. != ""))' 2>/dev/null || echo '[]')"}
    },
    "dependencies": {
      "status": "$DEP_STATUS",
      "unused_count": $UNUSED_COUNT,
      "unused_packages": $UNUSED_DEPS
    },
    "duplicate_files": {
      "status": "$DUPE_STATUS",
      "potential_duplicates": $([ -z "$POTENTIAL_DUPES" ] && echo '[]' || echo "$(echo "$POTENTIAL_DUPES" | jq -Rs 'split("\n") | map(select(. != ""))' 2>/dev/null || echo '[]')")
    }
  },
  "action_plan": [
    "Revisar dependencias marcadas como unused — algunas pueden ser usadas dinámicamente",
    "Eliminar cualquier variable de entorno de proyectos foráneos encontrada",
    "Consolidar archivos duplicados en módulos compartidos en src/shared/"
  ]
}
EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Auditoría completada → $OUTPUT_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
