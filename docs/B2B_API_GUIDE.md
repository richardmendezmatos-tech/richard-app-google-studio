# Richard Automotive: Guía de Integración B2B (RaaS)

Bienvenido a la red de Richard Automotive. Esta guía detalla cómo desplegar nuestra tecnología IA en tu concesionario.

## 🔑 1. Identificación del Dealer
Toda la data está aislada por un `dealerId` único. 
- **Configuración Local**: El sistema busca el ID en `localStorage.getItem('current_dealer_id')`.
- **Despliegue Multi-tenant**: Se recomienda inyectar este ID mediante un subdominio o una variable de entorno en el build.

## 🎨 2. Personalización de Marca
Puedes inyectar un objeto de configuración en el `DealerProvider` dentro de `App.tsx`:
```typescript
{
  id: 'tu-concesionario-id',
  name: 'Nombre Concesionario',
  logo: 'URL-de-tu-logo',
  themeColor: '#HEX_CODE'
}
```

## 🚗 3. Gestión de Inventario
Los autos deben subirse a la colección `/cars` de Firestore incluyendo el campo `dealerId`. 
- **Filtro Automático**: El frontend filtrará automáticamente todos los resultados por este ID.

## 🤖 4. Activación de IA (Gemini)
Asegúrate de configurar tu propia `VITE_GEMINI_API_KEY` para evitar límites de cuota compartida. El gemelo digital y el chat funcionarán nativamente bajo tu propia clave.

## 🛡️ 5. Cumplimiento Legal
Cada instancia incluye automáticamente el `AI_LEGAL_DISCLAIMER`. No modifiques este componente si deseas mantener la cobertura de responsabilidad civil de la plataforma.

---
*Para soporte técnico de integración, contacta al equipo de Richard Automotive Master Blueprint.*
