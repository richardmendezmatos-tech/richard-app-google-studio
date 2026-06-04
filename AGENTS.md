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

## Convenciones de Código

### Naming
- `camelCase` para variables, funciones, instancias
- `PascalCase` para componentes React, tipos, interfaces, clases
- `UPPER_SNAKE_CASE` para constantes globales y env vars
- Archivos: `kebab-case.ts` para utils, `PascalCase.tsx` para componentes

### Imports
- Usar alias `@/` en lugar de imports relativos profundos
- Barrel exports desde `index.ts` en entities y features
- Preferir imports nombrados sobre default exports

### Server vs Client Components
- Server Components por defecto (sin `'use client'`)
- `'use client'` solo cuando usas: hooks, event handlers, browser APIs, estado, useEffect
- Componentes que usan i18n necesitan `'use client'`

### Librerías clave
- `cn()` de `clsx` + `tailwind-merge` para merges de clases condicionales
- `@tanstack/react-table` para tablas de datos
- `recharts` para gráficos
- `@dnd-kit` para drag and drop
- `react-dropzone` para file uploads
- `framer-motion` para animaciones

## Patrones Zustand

Los stores de estado usan `zustand` con estos 3 patrones:

### Pattern 1: Basic Store
```typescript
import { create } from 'zustand'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
```

### Pattern 2: Persist Store (sessionStorage)
```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useTrajectoryStore = create<TrajectoryState>()(
  persist(
    (set) => ({ ... }),
    { name: 'key', storage: createJSONStorage(() => sessionStorage) },
  ),
)
```

### Pattern 3: Avoid manual localStorage — use persist middleware instead

### Convenciones
- Archivo: `entities/<domain>/model/use<Name>Store.ts`
- Variable: `use<Name>Store`
- Middleware disponible: `persist`, `createJSONStorage`
- No usar: `devtools`, `subscribeWithSelector`, `immer`, `combine`

## Patrones i18n

```typescript
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation()
  return <h1>{t('common.welcome')}</h1>
}
```

### Namespaces
- `common` — textos genéricos (welcome, buttons, loading)
- `auth` — login, register, logout, admin
- `dashboard` — dashboard labels
- `sidebar` — sidebar navigation

### Archivos
- Locales: `src/shared/config/i18n/locales/{es,en}/translation.json`
- Config: `src/i18n.ts`
- Provider: `I18nextProvider` en `AppProviders`

## Manejo de Errores en API Routes

```typescript
export async function POST(req: Request) {
  try {
    const data = await req.json()
    if (!data.requiredField) {
      return NextResponse.json({ error: 'mensaje' }, { status: 400 })
    }
    return NextResponse.json({ ... }, { status: 200 })
  } catch (error: any) {
    console.error('[Prefix] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
```

### Status codes
- `400` — validación / campo faltante
- `409` — conflicto (duplicado)
- `500` — error interno con `error.message`

### Reglas
- `try/catch` alrededor de toda la función handler
- `catch(error: any)` con `console.error` + tag de prefijo
- Background tasks con `.catch()` para no bloquear response
- AppError.ts existe en `src/shared/lib/errors/` pero no se usa activamente en API routes

## Ford-First (Estrategia Comercial)

### Prioridad de ventas
1. **FORD NUEVO** — garantía de fábrica, Ford Credit, Central Ford, Vega Alta
2. **Ford CPO** — certificado, segunda opción si nuevo no es viable
3. **Ford usado** — tercera opción
4. **Otras marcas** — última opción, pivotear a Ford siempre posible

### En cada interacción
- Destacar pago mensual (no solo precio total)
- Mencionar $300 Bono Web
- Ford Credit: tasas preferenciales, aprobación rápida
- Trade-in: aceptamos cualquier vehículo
- Entrega en Puerto Rico

### En AI/Chatbots
- System prompt debe sesgar a Ford nuevo
- Contenido/blog debe mencionar beneficios Ford en primeros 2 párrafos
- Comparaciones deben ponderar garantía y financiamiento Ford

### Leads
- Lead Ford = HIGH-YIELD en CRM
- Lead preguntando precio → responder con pago mensual + bono
- Lead WhatsApp → priorizar en cola

## FSD Layer Rules

```
app → views → widgets → features → entities → shared
```

Cada capa solo importa desde capas a su derecha (misma o más profunda).

### Reglas
- `views/` compone widgets y features — sin lógica de datos directa
- `widgets/` NO necesita barrel exports (index.ts)
- `features/` SIEMPRE tiene barrel exports
- `entities/` SIEMPRE tiene barrel exports
- `shared/` no importa de ninguna capa del proyecto
- ❌ `features/` no importa de `widgets/`
- ❌ `entities/` no importa de `features/` ni `widgets/`
- ✅ Preferir alias `@/` sobre imports relativos

## Commit Conventions

### Formato
```
tipo: descripción en lower case

Cuerpo opcional con líneas ≤ 100 caracteres
```

### Tipos
- `feat:` — nueva funcionalidad
- `fix:` — corrección de bug
- `perf:` — mejora de rendimiento
- `refactor:` — refactor sin cambio funcional
- `chore:` — tareas de mantenimiento
- `docs:` — documentación
- `style:` — formato, estilos (no lógica)
- `test:` — tests

### Reglas
- Subject en lowercase, sin punto final
- Body lines ≤ 100 chars (exigido por commitlint)
- Usar `-m` para subject y `-m` para body si aplica

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

### Conexión PostgreSQL Directa (vía Pooler)
- **Host:** `aws-0-us-west-2.pooler.supabase.com`
- **Port:** `6543` (transaction pooler)
- **User:** `postgres.dizzjfijsmxdlnfqydfk`
- **Password:** `${SUPABASE_DB_PASSWORD}` (en .env, cifrado con dotenvx)
- **Database:** `postgres`
- **SSL requerido**
- Conexión directa IPv6 (`db.dizzjfijsmxdlnfqydfk.supabase.co`) sigue BLOQUEADA por IPv6 local

### Management API
- PAT: `${SUPABASE_PAT}` (variable de entorno, no configurada actualmente)
- Project ref: `dizzjfijsmxdlnfqydfk`
- Endpoint: `https://api.supabase.com/v1/projects/dizzjfijsmxdlnfqydfk/sql`
- NOTA: La Management API requiere PAT. Para queries SQL directas usar el pooler o custom tool `supabase-query`

## RLS Security Audit — Fix Completo

### Problema original
Audit reveló 5 categorías de vulnerabilidades:
- 🔴 **leads** — PII expuesto: política `using: true` permitía a cualquier authenticated user leer todos los leads (nombre, teléfono, email, SSN)
- 🟠 **deals** — `using: true` exponía negociaciones
- 🟠 **api_keys** — política contradictoria bloqueaba todo acceso
- 🟡 **blog_posts** + **ford_news_cache** — sin RLS
- 🟢 **sentinel_metrics, system_logs, distribution_logs, market_insights** — exposición innecesaria

### Fix aplicado (26-mayo-2026)
19 políticas activas en 9 tablas:

| Tabla | Estado | Políticas clave |
|-------|--------|-----------------|
| leads | ✅ Parcheado | service_role (ALL), admins/agents (SELECT), público (INSERT), admins (UPDATE) |
| deals | ✅ Parcheado | service_role (ALL), admins/agents (SELECT), público (INSERT) |
| api_keys | ✅ Parcheado | service_role (ALL), users ven sus propias keys (SELECT) |
| blog_posts | ✅ RLS habilitado | público (SELECT), admins (ALL) |
| ford_news_cache | ✅ RLS habilitado | público (SELECT), service_role (ALL) |
| sentinel_metrics | ✅ Restringido | admins manage (ALL), admins view (SELECT) |
| system_logs | ✅ Restringido | service_role (ALL), admins (SELECT) |
| distribution_logs | ✅ Restringido | service_role (ALL) |
| market_insights | ✅ Restringido | público (SELECT), service_role (ALL) |

### Comandos de verificación
```bash
# Pooler directo
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h aws-0-us-west-2.pooler.supabase.com \
  -p 6543 -U postgres.dizzjfijsmxdlnfqydfk -d postgres \
  -c "SELECT relname, relrowsecurity FROM pg_class WHERE relnamespace = 'public'::regnamespace AND relrowsecurity ORDER BY 1;"

# Listar todas las políticas
PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h aws-0-us-west-2.pooler.supabase.com \
  -p 6543 -U postgres.dizzjfijsmxdlnfqydfk -d postgres \
  -c "SELECT relname, polname, CASE polcmd WHEN '*' THEN 'ALL' WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' END AS cmd FROM pg_policy JOIN pg_class ON pg_class.oid = polrelid WHERE pg_class.relnamespace = 'public'::regnamespace ORDER BY 1, 2;"

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
