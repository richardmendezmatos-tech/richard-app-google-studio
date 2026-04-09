#!/bin/bash
# ============================================================
# Richard Automotive — Setup Script
# Ejecuta las migraciones de Supabase y genera tokens seguros
# ============================================================

set -e

echo "🚀 Richard Automotive — Setup Script"
echo "============================================"
echo ""

# ── 1. Generate secure tokens ──
echo "🔐 Generando tokens seguros..."
ANTIGRAVITY_TOKEN=$(openssl rand -hex 32)
CRON_TOKEN=$(openssl rand -hex 24)
echo ""
echo "  ANTIGRAVITY_INTERNAL_TOKEN=$ANTIGRAVITY_TOKEN"
echo "  CRON_SECRET=$CRON_TOKEN"
echo ""

# ── 2. Check for Supabase credentials ──
echo "🗄️  Verificando credenciales de Supabase..."

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  # Try loading from .env.local
  if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | grep SUPABASE | xargs 2>/dev/null)
  fi
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-$VITE_SUPABASE_URL}"

if [ -z "$SUPABASE_URL" ]; then
  echo "  ⚠️  No se encontró SUPABASE_URL."
  echo "  → Ejecuta la migración manualmente en el SQL Editor de Supabase:"
  echo "  → Archivo: supabase/migrations/001_neural_engine.sql"
  echo ""
else
  echo "  ✅ Supabase URL detectada: $SUPABASE_URL"
  echo ""
fi

# ── 3. Summary ──
echo "============================================"
echo "📋 CHECKLIST DE CONFIGURACIÓN"
echo "============================================"
echo ""
echo "Agrega estas variables en Vercel (Settings → Environment Variables):"
echo ""
echo "  1. SUPABASE_SERVICE_ROLE_KEY  → Obtenerlo de Supabase Dashboard → Settings → API"
echo "  2. OPENAI_API_KEY             → Obtenerlo de platform.openai.com/api-keys"
echo "  3. ANTIGRAVITY_INTERNAL_TOKEN → $ANTIGRAVITY_TOKEN"
echo "  4. CRON_SECRET                → $CRON_TOKEN"
echo "  5. WHATSAPP_PHONE_NUMBER_ID   → Meta Business Dashboard (opcional por ahora)"
echo "  6. WHATSAPP_ACCESS_TOKEN      → Meta Business Dashboard (opcional por ahora)"
echo ""
echo "============================================"
echo "🗄️  MIGRACIÓN SQL"
echo "============================================"
echo ""
echo "Copia y pega el contenido de:"
echo "  supabase/migrations/001_neural_engine.sql"
echo ""
echo "En tu Supabase Dashboard → SQL Editor → New Query → Run"
echo ""
echo "============================================"
echo "✅ Setup completo. Tokens generados de forma segura."
echo "============================================"
