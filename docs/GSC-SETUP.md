# GSC Dashboard Setup

Para activar el dashboard de Google Search Console en el command-center:

## 1. Obtener Refresh Token (OAuth2)

Ejecuta el script de setup:

```bash
node scripts/setup-gsc-oauth.mjs
```

Esto abrirá el navegador para autorizar con tu cuenta de Google (necesitas ser owner de la propiedad en GSC). Al completar, el refresh token se guarda automáticamente en `.env.local`.

## 2. Verificar en Local

```bash
# Carga las env vars
dotenvx run -- node -e "
import('./src/shared/api/seo/gscService.js').then(m => m.getSitemaps().then(console.log));
"
```

O simplemente visita `http://localhost:3000/admin/seo` después de arrancar el dev server.

## 3. Configurar en Vercel

```bash
vercel env add GOOGLE_OAUTH_CLIENT_ID
# Valor: 764086051850-6qr4p6gpi6hn506pt8ejuq83di341hur.apps.googleusercontent.com

vercel env add GOOGLE_REFRESH_TOKEN
# El refresh token generado en el paso 1
```

O en el dashboard de Vercel: Project Settings → Environment Variables.

## 4. Verificar

Ve a `/admin/seo` en el command-center. Si la configuración es correcta, verás:
- Sitemap status
- Search analytics (clicks, impresiones, CTR, posición)
- Top queries de los últimos 28 días
