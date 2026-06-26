# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Richard Automotive Command Center** — F&I portal for Richard Méndez at Central Ford, Vega Alta, Puerto Rico.
Stack: Next.js 16 (App Router) + Supabase + Tailwind CSS 4 + Google Gemini 2.0 Flash.

Deployed to Vercel. Mobile via Capacitor (Android/iOS). PWA via `@serwist/next`.

---

## Commands

```bash
# Install (always use --legacy-peer-deps)
npm install --legacy-peer-deps

# Dev server (Turbopack + dotenvx for env decryption)
npm run dev                    # = dotenvx run -- next dev

# Build
npm run build                  # local webpack build (no dotenvx in Vercel)
ANALYZE=true npm run build     # bundle analyzer

# Tests (Vitest, ~147 tests across 30 files)
npm test                       # run all unit tests
npx vitest run src/path/to/file.test.ts   # single file
npx vitest run --reporter verbose         # verbose output

# E2E
npm run test:e2e               # Playwright full suite
npm run test:e2e:smoke         # smoke test (boot-smoke.spec.ts, Chromium only)

# Lint & Format
npm run lint                   # ESLint (max-warnings 500)
npm run format                 # Prettier across src/**

# Circular dependency check
npm run circular               # madge, excludes shared/vendor/kalidokit

# Deploy
npx vercel --prod              # deploy to production
npx vercel inspect             # inspect last deploy status

# Database (Supabase pooler — requires SUPABASE_DB_PASSWORD)
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql \
  -h aws-0-us-west-2.pooler.supabase.com \
  -p 6543 -U postgres.dizzjfijsmxdlnfqydfk -d postgres
```

### Environment Setup

Secrets are encrypted with `dotenvx`. Locally:
```bash
npx dotenvx run -- npm run dev    # decrypt + run
npx dotenvx encrypt               # re-encrypt after editing .env
```
Vercel does NOT use dotenvx — env vars are set directly in Vercel dashboard. Node 22.x required.

---

## Architecture

### Feature-Sliced Design (FSD) — Strict

Dependency direction (left → right only, no upward imports):

```
app → views → widgets → features → entities → shared
```

```
src/
├── app/               # Next.js App Router (layouts, pages, API routes)
│   ├── (auth)/        # login, admin-login, auth/confirm
│   ├── (dashboard)/   # dashboard layout + admin, garage, profile, panel-control
│   ├── (marketing)/   # public pages: landing, about, contacto, inventory
│   └── api/           # API routes (ai, command-center, cron, inventory, leads, webhooks…)
├── views/             # Page-level components (alias @/pages/)
├── widgets/           # Complex UI blocks — NO barrel exports required
│   ├── admin/
│   ├── houston/       # WhatsApp/Houston AI components
│   └── brand-ui/      # Header, Footer, Sidebar, DevOpsView
├── features/          # Business capabilities — ALWAYS have barrel exports (index.ts)
│   ├── auth/
│   ├── inventory/
│   └── houston/       # AI chat, WhatsApp integration, lead analysis
├── entities/          # Domain models + Zustand stores — ALWAYS have barrel exports
│   ├── session/
│   ├── user/
│   └── inventory/
└── shared/            # Pure utilities, no project layer imports
    ├── ui/            # Base UI components (Button, Card, Input, Modal…)
    ├── api/           # Supabase clients, adminGuard, adapters, scrapers
    ├── lib/           # cn(), formatters, validators, encryption
    └── i18n/          # i18next config + locales (es/en)
```

**FSD rules:**
- `features/` never imports from `widgets/`
- `entities/` never imports from `features/` or `widgets/`
- `shared/` never imports from any other project layer
- `widgets/` composes features and entities but has no upward imports
- Always use the `@/` alias (maps to `src/`). `@/pages/*` maps to `src/views/*`

### Middleware / Proxy

Next.js 16 uses `src/proxy.ts` (not `middleware.ts`) as the global request handler. It handles:
- Rate limiting on 20+ protected API routes (Upstash Redis with in-memory fallback)
- Supabase session refresh via `@supabase/ssr`
- Auth guards: `/admin`, `/garage`, `/profile`, `/panel-control` require login
- Admin routes additionally verify `role === 'admin'` from the `profiles` table
- Geo headers (`X-Geo-Country`, `X-Market`) forwarded from Vercel edge
- E2E bypass via `e2e_bypass` cookie (dev only)

### Key Patterns

**Server vs Client Components:**
- Server Components by default (no `'use client'`)
- Add `'use client'` only when using hooks, event handlers, browser APIs, or i18n (`useTranslation`)

**Zustand stores** live in `entities/<domain>/model/use<Name>Store.ts`. Use only `persist` and `createJSONStorage` middleware — no devtools, immer, or subscribeWithSelector.

**i18n** with react-i18next. Namespaces: `common`, `auth`, `dashboard`, `sidebar`. Locales at `src/shared/config/i18n/locales/{es,en}/translation.json`. Any component using `useTranslation` must be a client component.

**API Route pattern:**
```typescript
export async function POST(req: Request) {
  try {
    const data = await req.json()
    return NextResponse.json({ ... }, { status: 200 })
  } catch (error: any) {
    console.error('[RouteName] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
```
Status codes: `400` validation, `409` conflict, `429` rate limit, `500` internal.

**SEO:** Dynamic sitemap at `/api/sitemap` (2,200+ URLs, 24h revalidate). Programmatic pages use ISR (`revalidate = 86400`). Build generates ~100 static pages only to keep build under 5 minutes.

---

## Database (Supabase — project `dizzjfijsmxdlnfqydfk`)

### Core Tables

| Table | Key columns |
|-------|-------------|
| `profiles` | `id` (→ auth.users), `email`, `role` (admin\|editor\|agent\|user), `is_blocked` |
| `inventory` | `id`, `dealer_id`, `make`, `model`, `year`, `price`, `vin` (encrypted), `dealer_status` |
| `leads` | `id`, `inventory_id`, `name`, `email`, `phone`, `status`, `source` (whatsapp\|web\|facebook\|instagram) |
| `deals` | F&I deal records with leasing support |
| `audit_logs` | `user_id`, `action`, `entity_type`, `old_data`, `new_data`, `ip_address` |

Tables `appraisal`, `conversations`, and `users` do not exist — create migrations if needed.

### RLS (Row Level Security)

19 policies across 9 tables. Key rules:
- `leads` / `deals` — PII restricted: `service_role` gets ALL; admins/agents get SELECT; public gets INSERT only
- `api_keys` — users see only their own keys
- `sentinel_metrics` / `system_logs` / `distribution_logs` — restricted to admins and service_role
- `blog_posts` / `ford_news_cache` / `market_insights` — public SELECT, restricted write

Migrations live in `supabase/migrations/`. Direct DB access uses the transaction pooler (port 6543), not IPv6 direct connection.

---

## Conventions

### Naming
- `camelCase` — variables, functions, instances
- `PascalCase` — React components, types, interfaces, classes
- `UPPER_SNAKE_CASE` — global constants, env vars
- Files: `kebab-case.ts` for utilities, `PascalCase.tsx` for components

### Imports
- Always use `@/` alias over deep relative paths
- Named exports preferred over default exports
- `cn()` (clsx + tailwind-merge) for conditional class merging

### Commits (enforced by commitlint + husky)
Format: `type: description in lowercase` (max 100 chars, no trailing period)

Types: `feat`, `fix`, `perf`, `refactor`, `chore`, `docs`, `style`, `test`, `build`, `ci`, `revert`, `wip` (wip only on feature branches)

---

## Commercial Context (Ford-First Strategy)

The AI advisor, chatbots, and content must bias toward Ford vehicles:
1. Ford Nuevo (factory warranty, Ford Credit) — always first option
2. Ford CPO — second option
3. Ford usado — third option
4. Other brands — last resort, pivot back to Ford when possible

In every customer interaction: highlight monthly payment (not total price), mention the $300 Web Bonus, emphasize Ford Credit financing and trade-in acceptance.

Lead from WhatsApp = highest priority in CRM queue.

---

## Security

- `X-Antigravity-Token` header required for internal service-to-service calls
- Cloudflare Turnstile (invisible captcha) on all lead capture forms — validated server-side at `/api/validate-turnstile`
- Zod validation schemas for all external inputs: `src/shared/lib/` and API route body parsing
- VIN field encrypted in inventory table
- CSP, HSTS, X-Frame-Options, Permissions-Policy set globally in `next.config.js`

## Workspace Checkpointing

Significant tasks should be saved as JSON/Markdown files in `docs/antigravity/` using the format:
`[YYYY-MM-DD]_RA_[CATEGORY]_[UUID].json`
