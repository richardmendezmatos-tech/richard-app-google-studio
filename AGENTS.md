# Richard Automotive Command Center

Owner: Richard O. Méndez Matos | Gerente de F&I en Central Ford, Vega Alta — Puerto Rico

## Stack

- Next.js 16 (App Router) + TypeScript 6
- Supabase (PostgreSQL, Auth, Storage)
- Tailwind CSS 4 + Framer Motion
- Google Gemini AI (AI SDK)
- Capacitor (Android/iOS)
- Testing: Vitest + Playwright
- Deploy: Vercel

## Arquitectura FSD

- `src/app` — Rutas de Next.js (grupos: `(auth)`, `(dashboard)`, `(marketing)`)
- `src/views` — Páginas (alias `@/pages/`)
- `src/widgets` — Bloques complejos (admin, houston, brand-ui)
- `src/features` — Capacidades de negocio (auth, inventory, houston, etc.)
- `src/entities` — Modelos y stores (session, user, inventory, etc.)
- `src/shared` — UI, API clients, lib, utils

## Comandos

```bash
dev        npm run dev
build      npm run build
lint       npm run lint
test       npm run test
deploy     npm run deploy:vercel
format     npm run format
e2e        npx playwright test
lg         lazygit
fuck       thefuck — corrige el último comando
h          tldr — ejemplos rápidos de comandos
http       httpie — curl con JSON bonito
tm         tmux
top        btop — monitor de sistema
```

## Terminal tools

- `h tar` — ejemplos de tar, `h git commit` — ejemplos de git
- `fuck` — corrige auto-mágicamente el último comando que falló
- `http GET /api/users` — debug de APIs
- `Ctrl+R` — historial fuzzy con fzf
- `tm` — tmux, usa `Ctrl+A` como prefix, `\|` para splits

## Convenciones

- Import alias: `@/` → `src/`, `@/pages/` → `src/views/`
- Usar `'use client'` en componentes interactivos
- Zustand para estado global, server actions para mutaciones
- i18next para textos en español/inglés
- Variables de entorno con prefijo `NEXT_PUBLIC_` para cliente

## Auth

- Supabase Auth con email/password, Google OAuth, Facebook, passkeys, magic link
- Middleware protege rutas: `/admin`, `/garage`, `/profile`, `/command-center`
- Admin: solo `richardmendezmatos@gmail.com` y emails `@richard-automotive.com`
- Login usuarios: `/login` | Login admin: `/admin-login`
- Confirmación de email vía `/auth/confirm`
- API admin: `/api/admin/users` (GET/PATCH/DELETE)

## Base de datos

- Tabla `profiles` vinculada a `auth.users` vía trigger
- Columnas: id, email, full_name, avatar_url, role, passkey_id, email_verified, is_blocked, metadata
- Roles: admin, editor, agent, user
- `audit_logs` para tracking de actividad
