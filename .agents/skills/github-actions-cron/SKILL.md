---
name: github-actions-cron
description: "GitHub Actions cron workflows for Richard Automotive. 5 workflows replacing Vercel crons. Each workflow runs on a schedule and calls either a Vercel endpoint or a local script."
---

# GitHub Actions Cron Workflows

Richard Automotive usa 5 workflows de cron en GitHub Actions para tareas programadas. Todos los crons de Vercel fueron eliminados — el schedule se maneja exclusivamente via Actions.

## Workflows

| Workflow | Schedule (UTC) | Tipo | Archivo |
|----------|---------------|------|---------|
| Sync Inventory | 04:00 daily | Script local | `.github/workflows/sync-inventory.yml` |
| Ford News | 10:00 daily | Script local | `.github/workflows/ford-news-sync.yml` |
| Email Scheduler | 12:00 daily | Endpoint HTTP | `.github/workflows/cron-email-scheduler.yml` |
| Market Scraper | 06:00 daily | Endpoint HTTP | `.github/workflows/cron-market-scraper.yml` |
| Messages | 00:00 daily | Endpoint HTTP | `.github/workflows/cron-messages.yml` |

## Secrets requeridos (GitHub Actions secrets)

```
CRON_SECRET          — usado en auth header de endpoints Vercel
NEXT_PUBLIC_SITE_URL — URL del deployment
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Scripts vs Endpoints

- **Scripts locales** (`scripts/sync-inventory.ts`, `scripts/ford-news.ts`): importan clases del proyecto directamente via `npx tsx --tsconfig tsconfig.json`. Usan `@supabase/supabase-js` directo (sin SSR/cookies). Bypass del límite de 10s de Vercel Hobby.
- **Endpoints HTTP**: workflows hacen `curl` a la ruta Vercel con header `Authorization: Bearer ${{ secrets.CRON_SECRET }}`.

## Estructura de scripts

```typescript
// scripts/sync-inventory.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  // ... lógica directa, sin depender de next/headers ni cookies
}
main().catch(console.error)
```

## Regla importante

No crear nuevos Vercel cron endpoints. Todo schedule nuevo debe ir en GitHub Actions.
