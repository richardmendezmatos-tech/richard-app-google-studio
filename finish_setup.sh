#!/bin/bash

echo "🚀 Iniciando configuración final del Command Center..."

# 1. Firestore Cleanup
echo ""
echo "🚗 [1/3] Limpiando base de datos..."
npx tsx tools/deleteGhost.ts

# 2. GitHub Secrets Automation
echo ""
echo "🔐 [2/3] Configurando GitHub Secrets para Auto-RAG..."

if ! gh auth status &> /dev/null; then
  echo "⚠️ Necesitamos acceso a tu GitHub. Se abrirá el navegador para iniciar sesión."
  echo "👉 Presiona Enter cuando estés listo..."
  read
  gh auth login -p https -w
fi

echo "💉 Inyectando secretos en GitHub..."
gh secret set VITE_FIREBASE_API_KEY --body "AIzaSyDm1uXN61V7OI-iRh_Dxbyo-dfDR4u5hYU"
gh secret set VITE_FIREBASE_AUTH_DOMAIN --body "richard-automotive.firebaseapp.com"
gh secret set VITE_FIREBASE_PROJECT_ID --body "richard-automotive"
gh secret set VITE_FIREBASE_STORAGE_BUCKET --body "richard-automotive.firebasestorage.app"
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID --body "197990063384"
gh secret set VITE_FIREBASE_APP_ID --body "1:197990063384:web:2e797f109bda021e2e926d"
gh secret set VITE_FIREBASE_MEASUREMENT_ID --body "G-BB5QFNTHHG"
gh secret set VITE_GEMINI_API_KEY --body "AIzaSyDm1uXN61V7OI-iRh_Dxbyo-dfDR4u5hYU"
gh secret set VITE_SUPABASE_URL --body "https://dizzjfijsmxdlnfqydfk.supabase.co"
gh secret set VITE_SUPABASE_ANON_KEY --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpenpqZmlqc214ZGxuZnF5ZGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5Njg4MTIsImV4cCI6MjA4MjU0NDgxMn0.Hh--yKp8SBLbY7EgQVGJ63vwc5XQlO86LghZCGAKVl4"

echo "✅ Secretos configurados correctamente."

# 3. Vercel Analytics
echo ""
echo "📈 [3/3] Intentando activar Vercel Analytics..."
# Try CLI, fallback to URL
npx vercel analytics enable || echo "ℹ️ La activación automática falló. Por favor activa Analytics manualmente en: https://vercel.com/dashboard"

echo ""
echo "🏁 ¡TODO LISTO! Tu Command Center está blindado y automatizado."
