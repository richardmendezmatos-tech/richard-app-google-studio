---
name: deploy-vercel
description: Use ONLY when deploying to Vercel, including build verification, git push, and post-deploy checks. Also for diagnosing build failures and deployment issues.
---

# Deploy a Vercel

Workflow completo para desplegar Richard Automotive Command Center a Vercel.

## 1. Pre-deploy checks

```bash
# 1. Lint
npm run lint

# 2. Tests unitarios
npm run test

# 3. Build local (verifica 0 errores)
npm run build
```

Si el build falla, NO continuar. Diagnosticar y fixear primero.

## 2. Deploy

```bash
# Commit + push
git add -A
git commit -m "feat: descripción del cambio"
git push origin main

# Deploy via Vercel CLI
npx vercel --prod
```

O alternativamente:

```bash
npm run deploy:vercel
```

## 3. Post-deploy verification

```bash
# Verificar deploy
npx vercel list --prod

# Abrir la URL del deploy
npx vercel open --prod
```

## 4. Verificaciones manuales

- Cargar homepage → 200 OK
- Navegar a /inventory → carga sin errores
- Login flow → funciona
- Admin dashboard → funciona (solo emails whitelist)
- WhatsApp flow → trigger funciona
- Speed Insights → datos visibles en dashboard Vercel

## Variables de entorno requeridas en Vercel

```
NEXT_PUBLIC_SUPABASE_URL=https://dizzjfijsmxdlnfqydfk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...
GEMINI_API_KEY=...
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...
VERCEL_ANALYTICS_ID=...
```

## Troubleshooting

**Build falla en Vercel pero pasa local:**
- Node version mismatch (Vercel usa Node 20.x)
- Env vars faltantes en Vercel dashboard
- next.config.js tiene algo que solo funciona local

**404 en rutas dinámicas:**
- `generateStaticParams` no cubre todos los paths
- Fallback: `export const dynamicParams = true`

**API routes timeout:**
- Edge Runtime no compatible con `@supabase/ssr` (usar Node runtime)
- Agregar `export const runtime = 'nodejs'`

**PWA no funciona:**
- sw.ts mal configurado
- Serwist no registrado correctamente en next.config.js
