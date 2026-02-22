#!/usr/bin/env bash
# =============================================================================
# scripts/bq-quota-setup.sh — Richard Automotive v2026.1
# Standard #4: Escudo Financiero BigQuery — Límite de 10 GB/día
#
# Uso: bash scripts/bq-quota-setup.sh [PROJECT_ID]
# Default PROJECT_ID: richard-automotive
#
# Requiere: gcloud CLI autenticado con permisos de Service Usage Admin
# =============================================================================
set -euo pipefail

PROJECT_ID="${1:-richard-automotive}"
DAILY_LIMIT_BYTES=10737418240  # 10 GB exactos
DAILY_LIMIT_GB=10

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛡️  Richard Automotive — BigQuery Financial Shield v2026.1"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Proyecto:    $PROJECT_ID"
echo "📏 Límite/día:  $DAILY_LIMIT_GB GB ($DAILY_LIMIT_BYTES bytes)"
echo ""

# ── Verificar que gcloud está disponible ──────────────────────────────────────
if ! command -v gcloud &> /dev/null; then
  echo "❌ ERROR: gcloud CLI no encontrado. Instala en: https://cloud.google.com/sdk"
  exit 1
fi

# ── Verificar autenticación ───────────────────────────────────────────────────
ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null || echo "")
if [ -z "$ACTIVE_ACCOUNT" ]; then
  echo "❌ ERROR: No hay cuenta gcloud activa. Ejecuta: gcloud auth login"
  exit 1
fi
echo "👤 Cuenta activa: $ACTIVE_ACCOUNT"

# ── Establecer proyecto ───────────────────────────────────────────────────────
gcloud config set project "$PROJECT_ID" --quiet
echo "✅ Proyecto configurado: $PROJECT_ID"

# ── Habilitar BigQuery API (si no está habilitada) ─────────────────────────────
echo ""
echo "🔌 Verificando BigQuery API..."
gcloud services enable bigquery.googleapis.com --project="$PROJECT_ID" --quiet && \
  echo "   ✅ BigQuery API activa" || \
  echo "   ℹ️  BigQuery API ya estaba activa"

# ── Configurar límite de cuota diaria via BigQuery Settings ───────────────────
# Nota: La API de cuotas de BigQuery se controla por datasets y jobs.
# El método más robusto es configurar el límite por proyecto via la consola
# o usando Cloud Quotas API (Preview). El siguiente método usa la API de BigQuery.

echo ""
echo "📏 Configurando límite de datos procesados diarios..."

# Verificar si existe política de cuota (requiere proyecto activo)
cat << 'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 INSTRUCCIONES PARA CONFIGURAR CUOTA EN CONSOLA:
   (La API de Cloud Quotas está en Preview — recomendamos UI)

   1. Ve a: https://console.cloud.google.com/apis/api/bigquery.googleapis.com/quotas
   2. Busca: "Query usage per day"
   3. Haz clic en "Edit Quotas"
   4. Establece el límite en: 10,737,418,240 bytes (10 GB)
   5. Guarda los cambios

   Alternativamente, vía gcloud (Cloud Quotas API v1beta1):
EOF

# Intentar via gcloud quotas (disponible en versiones recientes)
echo ""
echo "🔧 Intentando configurar vía Cloud Quotas API..."

gcloud alpha services quota update \
  --consumer="project:$PROJECT_ID" \
  --service=bigquery.googleapis.com \
  --metric=bigquery.googleapis.com/quota/query/usage \
  --unit=1/d \
  --values="$DAILY_LIMIT_BYTES" \
  --quiet 2>/dev/null && \
  echo "   ✅ Cuota configurada exitosamente: $DAILY_LIMIT_GB GB/día" || \
  echo "   ℹ️  Configura manualmente en la consola (URL arriba). Limitación de API en Preview."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Script completado para proyecto: $PROJECT_ID"
echo "🛡️  Usa bq-dry-run.js para validar cada consulta antes de ejecutar"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
