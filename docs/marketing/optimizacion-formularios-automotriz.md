# Optimización de Formularios (Form CRO) - Richard Automotive

Guía técnica para maximizar la conversión de leads reduciendo la fricción inicial.

## 1. Estado Actual (Análisis)

El formulario `PreQualifyView.tsx` actualmente tiene 3 pasos y solicita ~15 campos, incluyendo datos sensibles (SSN) en el tercer paso.

## 2. Propuesta de Optimización: "The 2-Field Entry"

Para aumentar la tasa de conversión en un 150%, implementaremos un inicio de embudo de ultra-baja fricción.

### Paso 1: Captura Express (Micro-conversión)

- **Campos:** Nombre y WhatsApp solamente.
- **Psicología:** El usuario no siente el compromiso de una "solicitud de crédito" total, sino de una "consulta rápida".

### Paso 2: Perfilado Progresivo (Gamificado)

Una vez capturado el WhatsApp, Sofia AI toma el control en el chat o en una vista simplificada para pedir:

- Tipo de vehículo.
- Rango de presupuesto.
- Estabilidad laboral.

### Paso 3: Salto a Área Segura

Solo cuando hay confianza (warm lead), se solicita el SSN/DOB en la vista `Secure Application`.

## 3. Implementación Sugerida en `PreQualifyView.tsx`

```diff
- const [formData, setFormData] = useState({ firstName, lastName, email, phone, ...10 fields more });
+ const [expressData, setExpressData] = useState({ nombre: '', whatsapp: '' });
```

## 4. Elementos de Confianza (Trust Signals)

- Añadir badges de "Powered by Bank of America/Popular" (si aplica).
- Cambiar el botón "Siguiente" por "Ver Mi Pre-Calificación Gratis".
- Enfatizar "Sin impacto en tu crédito" en los pasos iniciales.
