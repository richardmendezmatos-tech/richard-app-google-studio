---
name: fsd-architecture
description: Feature-Sliced Design conventions — layer rules, barrel exports, import aliases, and dependency direction enforcement
---

# FSD Architecture

## Layer Dependency Direction
```
app → views → widgets → features → entities → shared
```
Each layer may ONLY import from layers to its right (same or deeper).

## Layer Rules

### `app/` — Next.js pages & layouts
- Pages, layouts, API routes only
- No business logic — delegate to views/widgets/features
- Can import from any layer

### `views/` (alias `@/pages/`) — Page components
- One view per route segment
- Composes widgets and features
- No direct data fetching logic

### `widgets/` — Complex composable blocks
- Self-contained UI modules (Sidebar, Header, CRMBoard)
- NO barrel exports (index.ts) unless explicitly needed
- Can import from features, entities, shared

### `features/` — Business capabilities
- Authentication, inventory CRUD, AI chat, lead management
- ALWAYS has barrel exports (index.ts)
- CANNOT import from widgets (⚠️ documented violation: `features/inventory` → `widgets/inventory`)

### `entities/` — Domain models and stores
- Zod schemas, types, Zustand stores, repositories
- ALWAYS has barrel exports (index.ts)
- CANNOT import from features or widgets

### `shared/` — UI kit, API clients, lib, utils
- No business logic
- CANNOT import from any project layer (only npm packages)
- Barrel exports optional

## Import Aliases
```typescript
@/  → src/              // default
@/pages/  → src/views/  // page views
@app/*  → src/app/      // Next.js app directory
@infra/*  → src/infra/  // infrastructure
```

## Barrel Export Pattern
```typescript
// entities/<domain>/index.ts
export * from './model/types'
export * from './api/Repository'
export { utilityFunction } from './lib/utils'

// features/<domain>/index.ts
export * from './hooks/useFeature'
export * from './services/featureService'
export * from './application/UseCase'
```

## Anti-patterns
- ❌ Feature importing from widget
- ❌ Entity importing from feature
- ❌ Shared importing from any project layer
- ❌ Circular exports (A → B → A)
- ❌ Deep relative imports (`../../../../shared/ui`)
