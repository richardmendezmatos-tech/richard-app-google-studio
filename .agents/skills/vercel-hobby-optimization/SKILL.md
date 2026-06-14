---
name: vercel-hobby-optimization
description: "Optimization patterns for Vercel Hobby plan (gratuito). Use when configuring next.config.js, API routes, cron jobs, dependencies, or deployment settings to stay within 4h CPU / 360 GB-hr memory / 1M invocations per month."
---

# Vercel Hobby Plan Optimization

Límites del plan Hobby: 4h CPU, 360 GB-hr memoria, 1M invocaciones/mes, 10s maxDuration por función.

## Patrones clave

### 1. Crons → GitHub Actions

No usar Vercel Cron. Todo schedule en GitHub Actions workflows.

- Tareas pesadas (scraping, AI generation): correr como **scripts locales** via `npx tsx --tsconfig` en Actions, no como endpoints Vercel.
- Tareas ligeras (enviar emails, mensajes): endpoint Vercel + `curl` desde Actions.

### 2. serverExternalPackages

En `next.config.js`:

```js
serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core', 'playwright-core', 'playwright']
```

Browser engines (~150MB+ each) no empaquetados en serverless functions.

### 3. Dependencias pesadas → devDependencies

Mover a devDependencies lo que no se necesita en build de producción:
- `@capacitor/*` (~50MB) — solo para desarrollo mobile local
- `@sparticuz/chromium` (~150MB) — solo para scripts en Actions

### 4. Edge → Nodejs runtime

Si una ruta usa Edge Runtime pero no necesita edge (no usa `request.geo`, `request.cookies` de edge, etc.), cambiarla a `nodejs`. Edge functions tienen limits más restrictivos.

### 5. force-static para páginas estáticas

Páginas de contenido estático (privacidad, términos, contacto, etc.):
```ts
export const dynamic = 'force-static'
```

### 6. ISR tuning

Valores recomendados:
- Home: 3600 (1h)
- Inventario: 3600 (1h)
- Blog: 7200 (2h)
- Páginas estáticas: 86400 (24h)

### 7. Dynamic imports para librerías pesadas

```tsx
const Chart = dynamic(() => import('recharts').then(m => m.Chart), { ssr: false })
```

Librerías candidatas: `recharts` (~2MB), `framer-motion` (~200KB en cliente).

### 8. React Query tuning

```ts
staleTime: 10 * 60 * 1000, // 10min
gcTime: 30 * 60 * 1000,    // 30min
```

### 9. Payloads de API optimizados

Usar `select('col1, col2, col3')` en vez de `select('*')` en consultas Supabase desde API routes.

### 10. Cache en memoria para endpoints repetitivos

```ts
const cache = new Map<string, { data: any; expires: number }>()
const TTL = 5 * 60 * 1000
```

Útil para endpoints de inteligencia/dashboard que se llaman multiple veces en ventana corta.

### 11. dynamicParams: false

Para rutas catch-all de inventario para evitar generar páginas dinámicas no solicitadas:
```ts
export const dynamicParams = false
```

### 12. Eliminar código muerto

Buscar API routes sin consumidores, features folders sin imports, barrel exports redundantes.
