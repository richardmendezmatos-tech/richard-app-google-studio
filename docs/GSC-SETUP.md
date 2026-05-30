# GSC Dashboard Setup

Para activar el dashboard de Google Search Console en el command-center:

## 1. Crear Service Account en Google Cloud Console

1. Ve a https://console.cloud.google.com/apis/credentials
2. Crea un proyecto (o selecciona uno existente)
3. Ve a "Credentials" → "Create Credentials" → "Service Account"
4. Dale un nombre (ej: "gsc-api-reader")
5. Skip los permisos opcionales
6. Click "Done"

## 2. Habilitar Search Console API

1. En Google Cloud Console, ve a "APIs & Services" → "Library"
2. Busca "Google Search Console API"
3. Habilítala

## 3. Generar Key JSON

1. En "Credentials", haz click en tu service account
2. Ve a "Keys" → "Add Key" → "Create New Key"
3. Selecciona JSON
4. Descarga el archivo

## 4. Agregar Service Account a GSC

1. Ve a https://search.google.com/search-console/users
2. Agrega el email de la service account como "Owner" (propietario)

## 5. Configurar Variables de Entorno en Vercel

```bash
# El email está en el JSON descargado (client_email)
vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL

# La private key está en el JSON (private_key) — cópiala COMPLETA incluyendo los \n
vercel env add GOOGLE_PRIVATE_KEY
```

O en el dashboard de Vercel: Project Settings → Environment Variables.

## 6. Verificar

Ve a `/admin/seo` en el command-center. Si la configuración es correcta, verás:
- Sitemap status
- Search analytics (clicks, impresiones, CTR, posición)
- Top queries de los últimos 28 días
