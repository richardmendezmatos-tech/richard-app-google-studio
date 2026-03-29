# Firebase Expert Skill (Richard Automotive)

Este skill define el estándar de ingeniería para el ecosistema Firebase de Richard Automotive, asegurando que las funciones sean resilientes, tipadas y seguras.

## 🌉 Puente de Datos: Firestore ↔ Dominio (Zod)

En Firebase Functions v2, los triggers reciben objetos `Timestamp` de Firestore. Estos objetos no son compatibles directamente con `z.date()` en Zod.

### El Patrón de Oro
Siempre utiliza el esquema `FirestoreDateSchema` para cualquier campo de fecha en el dominio:

```typescript
const FirestoreDateSchema = z.union([
  z.date(),
  z.any().transform(v => (v && typeof v === 'object' && 'toDate' in v ? (v as any).toDate() : v))
]).pipe(z.date());
```

## 🔒 Gestión de Secretos (v2)

Las funciones v2 deben declarar explícitamente qué secretos necesitan en el objeto de configuración.

### Error Común
Intentar leer `process.env[SECRET]` sin haberlo declarado en la propiedad `secrets` del trigger. Esto devolverá `undefined` o causará errores de ejecución.

### Estándar de Configuración
```typescript
export const myTrigger = onDocumentCreated({
  document: 'path/{id}',
  secrets: ['SENDGRID_API_KEY', 'PROJECT_SECRET'],
}, async (event) => {
  // Lógica segura
});
```

## 📋 Diagnóstico en Producción

### Comando de Auditoría en Tiempo Real
Si un email no llega, usa este filtro para depurar la ejecución:
`gcloud functions logs read [FUNCTION_NAME] --limit 50 --project richard-automotive --format="table(textPayload)"`

### Fallback Resiliente
Siempre implementa un adaptador de correo que soporte **SendGrid** como primario y **SMTP (Gmail)** como fallback secundario, asegurando que ambos tengan sus secretos configurados.
