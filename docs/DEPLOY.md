# Guía de Despliegue Sentinel N24 (Hardened Supabase)

El Richard Automotive Command Center ha sido migrado a una arquitectura unificada de **Supabase (PostgreSQL)**, eliminando la dependencia de Firebase/GCP para la gestión de inventario y telemetría.

## 1. Variables de Entorno (Vercel)

Asegúrate de configurar los siguientes secretos en el dashboard de Vercel para que el build y el runtime funcionen correctamente.

### Core Infrastructure (Supabase)
| Variable | Propósito |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Endpoint de tu instancia de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Key pública para el cliente del navegador |
| `SUPABASE_SERVICE_ROLE_KEY` | **(CRÍTICO)** Requerido para operaciones de servidor y crons que saltan RLS |

### AI & Intelligence (Vercel AI SDK)
| Variable | Propósito |
| :--- | :--- |
| `GEMINI_API_KEY` | Motor Neural Match, Visión de Unidades y Chat Copilot (Vercel AI SDK) |
| `NEXT_PUBLIC_AI_ENDPOINT` | Opcional. Por defecto utiliza `/api/ai/chat` |

### Integrations
| Variable | Propósito |
| :--- | :--- |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | Número de WhatsApp Business para leads |

## 2. Gestión de Base de Datos (Supabase CLI)

El proyecto ahora utiliza el **Supabase CLI** para gestionar el esquema y los tipos de TypeScript.

### Sincronización de Tipos
Para regenerar los tipos de la base de datos localmente:
```bash
npx supabase gen types typescript --project-id <tu-id-de-proyecto> > src/shared/api/supabase/types.ts
```

### Migraciones
El esquema de la base de datos se gestiona en el directorio `supabase/migrations`. Para aplicar cambios o jalar el esquema actual:
```bash
npx supabase db pull
```

## 3. Verificación de Despliegue

Una vez configuradas las variables:
1. Realiza un `git commit` y `git push` a la rama `main`.
2. Vercel ejecutará el build utilizando **npm** (estándar de estabilidad).
3. Verifica en el dashboard de Houston (`/admin`) que la telemetría esté reportando **ONLINE** y el **Enlace DB** esté activo.

---
*Richard Automotive - Sentinel N24 Security Protocol*
