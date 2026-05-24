# Richard Automotive Command Center

Owner: Richard O. Méndez Matos | Gerente de F&I en Central Ford, Vega Alta — Puerto Rico

## Stack

- **opencode:** big-pickle (modelo principal + subagents)
- Next.js 16 (App Router) + TypeScript strict
- Supabase (PostgreSQL 15+, Auth, Storage, Realtime)
- Tailwind CSS 4 + Framer Motion v12+
- Google Gemini 2.0-flash via AI SDK v6
- Capacitor (Android/iOS)
- Testing: Vitest v3 + Playwright
- Deploy: Vercel (Speed Insights + Analytics)
- PWA: @serwist/next v9
- i18n: i18next v26 + react-i18next v17
- State: Zustand
- Forms: react-hook-form + zod
- Icons: lucide-react v1.16+ (marca icons → SVG inline)

## Arquitectura FSD

```
src/
├── app/               ← Next.js pages & layouts
│   ├── (auth)/        ← login, admin-login, auth/confirm
│   ├── (dashboard)/   ← dashboard layout + admin, garage, profile, command-center
│   └── (marketing)/   ← landing, about, contacto, inventory public
├── views/             ← Pages (alias @/pages/)
├── widgets/           ← Bloques complejos
│   ├── admin/         ← Admin dashboard components
│   ├── houston/       ← WhatsApp/Houston AI components
│   └── brand-ui/      ← Layout shell (Header, Footer, Sidebar, DevOpsView)
├── features/          ← Capacidades de negocio
│   ├── auth/          ← Login, register, logout, admin auth
│   ├── inventory/     ← Inventory CRUD, filters, dealer inventory
│   └── houston/       ← AI chat, WhatsApp integration, lead analysis
├── entities/          ← Modelos y stores
│   ├── session/       ← Zustand store + session management
│   ├── user/          ← Profile, settings, preferences
│   └── inventory/     ← Inventory store, types, filters
└── shared/            ← UI kit, API clients, lib, utils
    ├── ui/            ← Componentes base (Button, Card, Input, Modal, LoadingSpinner, Badge)
    ├── api/           ← Supabase clients, adminGuard, cursorPagination
    ├── lib/           ← cn(), formatters, validators, encryption
    └── i18n/          ← i18next config + locales (es/en)
```

## Base de datos

### Tabla profiles
- id (uuid, PK → auth.users), email (unique), full_name, avatar_url
- role (text: admin|editor|agent|user)
- passkey_id, email_verified, is_blocked, metadata (jsonb)
- Índices: (email), (role)

### Tabla inventory
- id (uuid, PK), dealer_id (FK → profiles)
- make, model, year, price, mileage, vin (encrypted)
- dealer_status (listed|pending|sold|unlisted), sold_at
- images (jsonb), features (jsonb)
- Índices: (dealer_status, updated_at DESC), (make, model, year)

### Tabla leads
- id (uuid, PK), inventory_id (FK → inventory)
- name, email, phone, status (new|contacted|qualified|converted|lost)
- message (text), source (whatsapp|web|facebook|instagram)
- Índices: (status, created_at DESC), (phone)

### Tabla audit_logs
- Tracking de actividad (user_id, action, entity_type, entity_id, old/new_data, ip_address)

### Tabla dealer_inventory
- dealership_id, vin, make, model, year, price, mileage

### Tabla inventory_views
- inventory_id, viewed_at

### Tablas NO existentes (crear si se necesitan)
- appraisal, conversations, users

### Management API
- PAT: `${SUPABASE_PAT}` (variable de entorno)
- Project ref: `dizzjfijsmxdlnfqydfk`
- Endpoint: `https://api.supabase.com/v1/projects/dizzjfijsmxdlnfqydfk/sql`
- Conexión directa PostgreSQL: BLOQUEADA (IPv6)

