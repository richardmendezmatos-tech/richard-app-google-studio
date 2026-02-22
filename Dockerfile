# ╔═══════════════════════════════════════════════════════════════════╗
# ║  Dockerfile — Richard Automotive · Principal Platform Engineer   ║
# ║  Strategy: Multi-Stage SPA Optimizer                             ║
# ║  Builder : node:20-alpine  (compilación + deps completas)        ║
# ║  Runner  : nginx:stable-alpine (~7 MB base, sin runtime Node)    ║
# ║                                                                   ║
# ║  ¿Por qué nginx y no distroless/nodejs?                          ║
# ║  Este proyecto es un SPA estático compilado por Vite.            ║
# ║  El output en /dist son HTML/CSS/JS puros — no hay proceso Node  ║
# ║  que correr en producción. nginx:stable-alpine nos da:           ║
# ║    · Imagen base ~7 MB (vs ~107 MB node:20-alpine)               ║
# ║    · Serving HTTP nativo, gzip, cache headers incluidos          ║
# ║    · Sin superficie de ataque de runtime Node                    ║
# ║                                                                   ║
# ║  Target sizes:                                                    ║
# ║    Builder layer  : ~350 MB (descartado, nunca llega a Registry) ║
# ║    Final image    : ~35–40 MB  ← objetivo financiero             ║
# ╚═══════════════════════════════════════════════════════════════════╝

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 1 — DEPENDENCY CACHE
# Propósito: instalar SOLO node_modules en una capa separada.
# Beneficio: si package.json no cambia, Cloud Build reutiliza esta capa
# completa (~200 MB) sin reinstalar — el mayor ahorro de tiempo en caché.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# ⚑ CLAVE DE CACHÉ: copiar solo los manifiestos antes que cualquier código.
# Esta capa solo se invalida cuando package.json o package-lock.json cambian.
COPY package.json package-lock.json ./

# npm ci garantiza reproducibilidad exacta desde package-lock.json.
# --prefer-offline aprovecha el caché de módulos de Cloud Build.
# Se instalan TODAS las deps aquí (incluyendo devDeps) porque Vite las necesita.
RUN npm ci --prefer-offline

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 2 — BUILDER
# Propósito: compilar el SPA con Vite usando las deps del stage anterior.
# Las variables VITE_* se inyectan en tiempo de build (no en runtime).
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Build-args: pasar desde Cloud Build substitutions o --build-arg
# Nunca hardcodear valores reales → se graban en las capas de imagen
ARG VITE_FIREBASE_API_KEY
ARG VITE_GEMINI_API_KEY
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_ANTIGRAVITY_API_KEY

# Exportar como ENV para que Vite las lea durante el build
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
  VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY \
  VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  VITE_ANTIGRAVITY_API_KEY=$VITE_ANTIGRAVITY_API_KEY

WORKDIR /app

# Reutilizar node_modules del stage deps (no reinstalar)
COPY --from=deps /app/node_modules ./node_modules

# Copiar el código fuente DESPUÉS de node_modules
# Así si solo cambia src/, la capa de deps sigue cacheada
COPY . .

# Compilar SPA → /app/dist
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# STAGE 3 — RUNNER (imagen final de producción)
# Solo contiene: nginx binary + archivos estáticos compilados
# Todo lo demás (node_modules, src, devDeps) es descartado aquí
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:stable-alpine AS runner

# Labels OCI estándar para Artifact Registry y auditoría
LABEL org.opencontainers.image.title="Richard Automotive Frontend" \
  org.opencontainers.image.vendor="Richard Automotive" \
  org.opencontainers.image.authors="Richard Oneal Méndez Matos <richard@richard-automotive.com>" \
  org.opencontainers.image.source="https://github.com/richardmendezmatos-tech/richard-app-google-studio"

# Eliminar contenido default de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar SOLO el output compilado del builder (HTML/CSS/JS/assets)
# Este COPY es el único artefacto que va al runner — nada de Node o deps
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración nginx: SPA fallback + gzip + security headers + cache de assets
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear usuario no-root para nginx (principio de mínimo privilegio)
RUN addgroup -g 1001 -S nginx-app && \
  adduser -u 1001 -S nginx-app -G nginx-app && \
  chown -R nginx-app:nginx-app /usr/share/nginx/html && \
  chown -R nginx-app:nginx-app /var/cache/nginx && \
  chown -R nginx-app:nginx-app /var/log/nginx && \
  touch /var/run/nginx.pid && \
  chown nginx-app:nginx-app /var/run/nginx.pid

USER nginx-app

EXPOSE 8080

# Healthcheck para Cloud Run (usa el path / — ajusta si tienes /health)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
