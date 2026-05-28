# Richard Automotive — Command Center

**Portal F&I de Richard Méndez | Central Ford, Vega Alta — Puerto Rico**

Stack: Next.js 16 (App Router) + Supabase + Tailwind CSS 4 + Google Gemini

---

## Quick Start

```bash
# 1. Instalar dependencias
npm install --legacy-peer-deps

# 2. Variables de entorno
#    Usar dotenvx localmente (NO en Vercel)
npx dotenvx encrypt   # si cambias .env
npx dotenvx run -- npm run dev

# 3. Dev server (Turbopack)
npm run dev
```

## Build & Deploy

```bash
# Local (con dotenvx)
npx dotenvx run -- npm run build

# Vercel (sin dotenvx — no hay DOTENV_PRIVATE_KEY en Vercel)
npx vercel --prod
```

El build de Vercel corre `next build --webpack`. Node 22.x requerido.

## Arquitectura SEO

| Estrategia | Detalle |
|------------|---------|
| Sitemap dinámico | 2,207 URLs — se genera en `/api/sitemap` con revalidate 24h |
| Páginas programáticas | `/autos-usados/[city]`, `/[brand]`, `/[model]` |
| Render | ISR con `revalidate = 86400` (24h) — server-render + edge cache |
| Build-time static | Solo ~100 páginas (categories, inventory, blog) |
| Beneficio | Build en <5 min, SEO intacto, caché en edge |

## Environment Variables

| Variable | Dónde | Requerida |
|----------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env` + Vercel | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env` + Vercel | ✅ |
| `SUPABASE_DB_PASSWORD` | `.env` (dotenvx) | Para pooler directo |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `.env` + Vercel | ✅ |
| `TURNSTILE_SECRET_KEY` | `.env` + Vercel | ✅ |
| `GEMINI_API_KEY` | `.env` + Vercel | Para AI Advisor |
| `SENDGRID_API_KEY` | `.env` + Vercel | Para emails |

## Seguridad

- **CSP + HSTS**: Headers en `next.config.js` y `vercel.json`
- **Rate limiting**: 7 rutas protegidas en `src/proxy.ts`, fallback in-memory
- **Turnstile**: Captcha invisible de Cloudflare en formularios de leads
- **RLS**: 19 políticas en 9 tablas Supabase — PII restringido a admins/agents
- **Zod validation**: Schemas estrictos en `src/server/domain/validators/`

## Tests

```bash
npm test              # 147 tests (30 files)
npm run lint          # ESLint
```

## Comandos útiles

```bash
npm run dev           # Dev con Turbopack
npm run build         # Build local (con webpack)
npx vercel --prod     # Deploy a producción
npx vercel inspect    # Ver estado del último deploy
```

## Proyecto

- `src/app/` — Next.js pages & layouts
- `src/views/` — Page components
- `src/widgets/` — Bloques complejos (Header, Footer, Command Center)
- `src/features/` — Capacidades de negocio (auth, inventory, houston)
- `src/entities/` — Modelos, stores, servicios
- `src/shared/` — UI kit, API clients, lib, utils

---

© 2026 Richard Automotive | Richard O. Méndez Matos | Central Ford, Vega Alta
