# 🛡️ Guía de Variables de Entorno (Type-Safe)

Este proyecto utiliza **Zod** para validar las variables de entorno al inicio. Esto previene errores silenciosos y garantiza que la configuración sea correcta.

## 📄 Archivos Importantes

*   **`src/env.ts`**: Define el esquema de validación. Aquí es donde agregas nuevas variables.
*   **`.env`**: Archivo local (ignorada por git) donde pones tus secretos.

## 🚀 Cómo agregar una nueva variable

1.  Abre `src/env.ts`.
2.  Agrega la variable al esquema `EnvSchema`:

```typescript
const EnvSchema = z.object({
  // ...
  MI_NUEVA_VARIABLE: z.string().min(1),
});
```

3.  Agrega la lectura en `validateEnv()`:

```typescript
const _env = {
  // ...
  MI_NUEVA_VARIABLE: process.env.MI_NUEVA_VARIABLE,
};
```

4.  Usa la variable en tu código:

```typescript
import { ENV } from '~/env';

console.log(ENV.MI_NUEVA_VARIABLE);
```

## ⚠️ Reglas de Seguridad

*   **Servidor vs Cliente**: Por defecto, las variables NO se exponen al navegador.
*   **Prefijo VITE_**: Si necesitas que una variable sea pública en el cliente, debe empezar con `VITE_` o `PUBLIC_`.
*   **Fail Fast**: Si olvidas configurar una variable requerida en Vercel, el despliegue fallará (lo cual es bueno, porque evita errores en producción).
