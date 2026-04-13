# Guía de Despliegue Sentinel N23 (Vercel)

Para que el Command Center funcione con todas sus capacidades de **Firebase Admin** y **Houston Intelligence**, debes configurar los siguientes secretos en el dashboard de Vercel.

## 1. Firebase Service Account (CRÍTICO)

El sistema utiliza un puente seguro que no expone archivos JSON en el cliente. Para ello, debes copiar el contenido completo de tu archivo de credenciales de Firebase en una variable de entorno.

- **Variable**: `FIREBASE_SERVICE_ACCOUNT_JSON`
- **Valor**: (Pega aquí el contenido completo del archivo `.json` que descargaste de Firebase Console)

> [!CAUTION]
> No elimines las comillas ni los saltos de línea del JSON. Pégalo tal cual.

## 2. Variables de Entorno Adicionales

Asegúrate de tener configuradas las siguientes variables para Supabase y Gemini:

| Variable | Propósito |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Endpoint de tu base de datos Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Key pública de Supabase |
| `GEMINI_API_KEY` | Key para el motor Neural Match y Visión |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | Tu número de WhatsApp de negocios |

## 3. Verificación de Despliegue

Una vez configuradas las variables:
1. Realiza un `git push` a la rama `main`.
2. Vercel detectará el cambio y ejecutará el build.
3. Verifica en los logs de Vercel que no aparezca el error `❌ [Firebase Admin] Initialization failed`.

---
*Richard Automotive - Sentinel N23 Security Protocol*
