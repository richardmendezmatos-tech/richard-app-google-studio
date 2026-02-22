# ╔══════════════════════════════════════════════════════════════╗
# ║  Dockerfile — Richard Automotive v2026.1                     ║
# ║  Multi-stage: Builder (node:20-alpine) → Runner (nginx)      ║
# ║  Imagen final estimada: ~35 MB vs ~900 MB en imagen full     ║
# ╚══════════════════════════════════════════════════════════════╝

# ── STAGE 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Metadata
LABEL maintainer="Richard Oneal Méndez Matos <richard@richard-automotive.com>"
LABEL project="richard-automotive"
LABEL stage="builder"

# Variables de build (pasar como --build-arg en Cloud Build o docker build)
ARG VITE_FIREBASE_API_KEY
ARG VITE_GEMINI_API_KEY
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Directorio de trabajo
WORKDIR /app

# Copiar manifiestos primero (capa cacheada si no cambian)
COPY package*.json ./

# Instalar dependencias (solo producción-relevantes para el build)
RUN npm ci --prefer-offline

# Copiar el resto del código fuente
COPY . .

# Build de producción
RUN npm run build

# ── STAGE 2: Runner (imagen final ligera) ─────────────────────────────────────
FROM nginx:stable-alpine AS runner

LABEL project="richard-automotive"
LABEL stage="runner"

# Eliminar config default de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar solo el build estático desde el stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración nginx para SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
