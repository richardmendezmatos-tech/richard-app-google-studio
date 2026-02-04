# Optimización de Formularios para Leads Automotrices

**Adaptación del skill `form-cro` para Richard Automotive**

---

## Principio Fundamental

**Cada campo cuesta conversión:**

- 3 campos: Baseline
- 4-6 campos: -10-25% conversión
- 7+ campos: -25-50% conversión

**Para Richard Automotive:** Reducir de 5-7 campos a **2-3 campos esenciales**

---

## Formulario Actual vs. Optimizado

### ❌ ANTES (Conversión: ~15-20%)

```typescript
interface LeadFormOld {
  nombreCompleto: string;      // Campo 1
  email: string;                // Campo 2
  telefono: string;             // Campo 3
  tipoVehiculo: string;         // Campo 4 (dropdown)
  presupuesto: string;          // Campo 5 (dropdown)
  scoreCredito: string;         // Campo 6 (dropdown)
  comentarios?: string;         // Campo 7 (textarea)
}
```

**Problemas:**

- 7 campos = fricción masiva
- Información sensible (crédito) al inicio
- Campos que pueden capturarse después
- Mobile UX pobre (mucho scroll)

---

### ✅ DESPUÉS (Conversión esperada: ~40-50%)

```typescript
interface LeadFormNew {
  nombre: string;               // Campo 1: Solo nombre (no apellido)
  telefono: string;             // Campo 2: WhatsApp preferido
  email?: string;               // Campo 3: OPCIONAL
}
```

**Ventajas:**

- 2 campos obligatorios (nombre + teléfono)
- Email opcional (capturar después si necesario)
- Toda la info adicional se captura en la conversación del chatbot
- Mobile-first (completa en <20 segundos)

---

## Justificación de Cada Campo

### Campo 1: Nombre ✅ ESENCIAL

**Por qué:**

- Personalización inmediata ("Hola Juan")
- Humaniza la interacción
- Requerido para seguimiento

**Optimización:**

- Un solo campo "Nombre" (no First/Last)
- Placeholder: "Tu nombre"
- Auto-capitalize primera letra

```tsx
<input
  type="text"
  name="nombre"
  placeholder="Tu nombre"
  autoComplete="given-name"
  required
  className="capitalize"
/>
```

---

### Campo 2: Teléfono ✅ ESENCIAL

**Por qué:**

- Canal preferido en PR (WhatsApp)
- Contacto directo e inmediato
- Mayor tasa de respuesta que email

**Optimización:**

- Input type="tel" (teclado numérico en mobile)
- Auto-format mientras escribe: (787) 123-4567
- Validación inline (10 dígitos)
- Icono de WhatsApp para claridad

```tsx
<input
  type="tel"
  name="telefono"
  placeholder="(787) 123-4567"
  autoComplete="tel"
  pattern="[0-9]{10}"
  required
  onChange={formatPhoneNumber}
/>
```

**Auto-format function:**

```typescript
function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return value;
}
```

---

### Campo 3: Email ⚠️ OPCIONAL

**Por qué opcional:**

- No es crítico para contacto inicial
- Reduce fricción significativamente
- Se puede capturar después en conversación

**Cuándo pedirlo:**

- Si el lead lo menciona voluntariamente
- Para enviar cotizaciones formales
- Para secuencias de email (si prefiere ese canal)

```tsx
<input
  type="email"
  name="email"
  placeholder="tu@email.com (opcional)"
  autoComplete="email"
  // NO required
/>
```

---

## Información Adicional: Captura Progresiva

### ❌ NO pedir en formulario inicial

**Tipo de vehículo**

- Capturar en conversación: "¿Qué tipo de vehículo buscas?"
- Permite conversación natural
- Evita dropdown con 20 opciones

**Presupuesto**

- Pregunta sensible que genera abandono
- Mejor: "¿Cuánto quieres pagar al mes?"
- Capturar después de establecer rapport

**Score de crédito**

- MUY sensible, genera abandono masivo
- Capturar indirectamente: "¿Cómo describirías tu crédito: excelente, bueno, regular, o necesita mejora?"
- Solo después de construir confianza

**Comentarios**

- Genera parálisis ("¿qué escribo?")
- Mejor: Dejar que el chatbot haga preguntas específicas

---

## Diseño del Formulario Optimizado

### Layout Mobile-First

```tsx
<form className="lead-capture-form">
  {/* Header con propuesta de valor */}
  <div className="form-header">
    <h3>Descubre tu pago mensual</h3>
    <p className="trust-badge">
      ✓ Respuesta en 5 min  
      ✓ Sin compromiso  
      ✓ 100% confidencial
    </p>
  </div>

  {/* Campo 1: Nombre */}
  <div className="form-field">
    <label htmlFor="nombre">Tu nombre</label>
    <input
      id="nombre"
      type="text"
      name="nombre"
      placeholder="Ej: Juan"
      autoComplete="given-name"
      required
      className="input-lg"
    />
  </div>

  {/* Campo 2: Teléfono */}
  <div className="form-field">
    <label htmlFor="telefono">
      WhatsApp <span className="icon">💬</span>
    </label>
    <input
      id="telefono"
      type="tel"
      name="telefono"
      placeholder="(787) 123-4567"
      autoComplete="tel"
      pattern="[0-9]{10}"
      required
      className="input-lg"
      onChange={(e) => {
        e.target.value = formatPhoneNumber(e.target.value);
      }}
    />
    <span className="help-text">Te contactamos por WhatsApp</span>
  </div>

  {/* Campo 3: Email (opcional) */}
  <div className="form-field">
    <label htmlFor="email">
      Email <span className="optional">(opcional)</span>
    </label>
    <input
      id="email"
      type="email"
      name="email"
      placeholder="tu@email.com"
      autoComplete="email"
      className="input-lg"
    />
  </div>

  {/* Trust elements */}
  <div className="trust-elements">
    <p className="privacy-note">
      🔒 Tu información está segura. No compartimos tus datos.
    </p>
  </div>

  {/* CTA Button */}
  <button type="submit" className="cta-button">
    Descubrir mi pago mensual
    <span className="time-indicator">(toma 30 seg)</span>
  </button>

  {/* Alternative contact */}
  <p className="alternative-contact">
    ¿Prefieres llamar? <a href="tel:+17871234567">(787) 123-4567</a>
  </p>
</form>
```

---

## Estilos CSS (Mobile-First)

```css
.lead-capture-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 24px;
}

.form-header h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.trust-badge {
  font-size: 14px;
  color: #059669; /* green */
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-field {
  margin-bottom: 20px;
}

.form-field label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.optional {
  font-weight: 400;
  color: #9ca3af;
  font-size: 12px;
}

.input-lg {
  width: 100%;
  height: 48px; /* Large touch target */
  padding: 12px 16px;
  font-size: 16px; /* Prevent zoom on iOS */
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.input-lg:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.help-text {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.trust-elements {
  margin: 16px 0;
}

.privacy-note {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

.cta-button {
  width: 100%;
  height: 56px;
  background: #2563eb; /* Blue */
  color: white;
  font-size: 18px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.cta-button:hover {
  background: #1d4ed8;
}

.cta-button:active {
  transform: scale(0.98);
}

.time-indicator {
  font-size: 12px;
  font-weight: 400;
  opacity: 0.9;
}

.alternative-contact {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  margin-top: 16px;
}

.alternative-contact a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .lead-capture-form {
    padding: 20px 16px;
    border-radius: 0; /* Full width on mobile */
  }
  
  .input-lg {
    font-size: 16px; /* Prevent iOS zoom */
  }
}
```

---

## Validación y Error Handling

### Inline Validation (Real-time)

```typescript
// Validación de teléfono
function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
}

// Validación de email (si se provee)
function validateEmail(email: string): boolean {
  if (!email) return true; // Optional field
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Typo detection para email
function suggestEmailCorrection(email: string): string | null {
  const commonDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
  const parts = email.split('@');
  if (parts.length !== 2) return null;
  
  const [, domain] = parts;
  
  // Check for common typos
  const typos: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
  };
  
  return typos[domain] || null;
}
```

### Error Messages (Español, Amigables)

```typescript
const errorMessages = {
  nombre: {
    required: 'Por favor, dinos tu nombre',
    minLength: 'Tu nombre parece muy corto',
  },
  telefono: {
    required: 'Necesitamos tu número para contactarte',
    invalid: 'Por favor, verifica tu número (debe tener 10 dígitos)',
    format: 'Formato: (787) 123-4567',
  },
  email: {
    invalid: 'Este email no parece válido',
    suggestion: '¿Quisiste decir {suggestion}?',
  },
};
```

---

## Experimentos A/B Recomendados

### Test 1: Número de Campos

**Variante A:** 2 campos (Nombre + Teléfono)  
**Variante B:** 3 campos (Nombre + Teléfono + Email obligatorio)

**Hipótesis:** A tendrá +30-50% más conversión  
**Métrica:** Form completion rate

---

### Test 2: CTA Button Copy

**Variante A:** "Descubrir mi pago mensual"  
**Variante B:** "Hablar con Richard ahora"  
**Variante C:** "Ver mis opciones (gratis)"

**Hipótesis:** A ganará (enfatiza beneficio específico)  
**Métrica:** Click-through rate

---

### Test 3: Trust Elements

**Variante A:** Con badges ("Respuesta en 5 min", "Sin compromiso")  
**Variante B:** Sin badges

**Hipótesis:** A tendrá +10-15% más conversión  
**Métrica:** Form start rate

---

### Test 4: Email Field

**Variante A:** Email opcional (como está)  
**Variante B:** Sin campo de email  
**Variante C:** Email obligatorio

**Hipótesis:** B tendrá máxima conversión, pero A mejor calidad de lead  
**Métrica:** Completion rate + Lead quality score

---

## Métricas de Éxito

### Conversión del Formulario

| Métrica | Baseline (Actual) | Target (Optimizado) | Mejora |
|---------|-------------------|---------------------|--------|
| **Form start rate** | 40% | 60% | +50% |
| **Form completion rate** | 15-20% | 40-50% | +150% |
| **Time to complete** | 90-120 seg | 20-30 seg | -75% |
| **Mobile completion** | 10-15% | 35-45% | +200% |
| **Error rate** | 25% | <10% | -60% |

### Calidad de Leads

| Métrica | Baseline | Target |
|---------|----------|--------|
| **Lead response rate** | 60% | 75% |
| **Lead quality score** | 6/10 | 8/10 |
| **Phone reachability** | 70% | 85% |

---

## Implementación Técnica

### React Component

```tsx
import { useState } from 'react';

interface LeadFormData {
  nombre: string;
  telefono: string;
  email?: string;
}

export function LeadCaptureForm() {
  const [formData, setFormData] = useState<LeadFormData>({
    nombre: '',
    telefono: '',
    email: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: Partial<Record<keyof LeadFormData, string>> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Por favor, dinos tu nombre';
    }
    
    if (!validatePhone(formData.telefono)) {
      newErrors.telefono = 'Por favor, verifica tu número (debe tener 10 dígitos)';
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Este email no parece válido';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit
    setIsSubmitting(true);
    try {
      await submitLead(formData);
      // Redirect to thank you page or show success message
      window.location.href = '/gracias';
    } catch (error) {
      alert('Hubo un error. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="lead-capture-form">
      {/* Implementation as shown above */}
    </form>
  );
}
```

---

## Checklist de Optimización

### Antes de Lanzar

- [ ] Reducir a 2-3 campos máximo
- [ ] Implementar auto-format de teléfono
- [ ] Validación inline (no solo on submit)
- [ ] Error messages en español, amigables
- [ ] Touch targets mínimo 44px (mobile)
- [ ] Input type="tel" para teléfono
- [ ] Input type="email" para email
- [ ] Placeholder text con ejemplos
- [ ] Labels siempre visibles (no solo placeholder)
- [ ] CTA orientado a beneficio
- [ ] Trust elements visibles
- [ ] Privacy note incluida
- [ ] Alternativa de contacto (teléfono directo)
- [ ] Loading state en botón
- [ ] Success/error states claros
- [ ] Probar en iOS y Android
- [ ] Probar con conexión lenta
- [ ] Analytics tracking configurado

### Post-Lanzamiento

- [ ] Monitorear completion rate diariamente
- [ ] Identificar campos con más errores
- [ ] A/B test CTA copy
- [ ] A/B test número de campos
- [ ] Revisar quality de leads capturados
- [ ] Ajustar basado en feedback de ventas

---

## Integración con Chatbot

### Flujo Post-Captura

```typescript
// Después de capturar nombre + teléfono
const chatbotFlow = {
  step1: {
    message: `¡Hola ${nombre}! Gracias por tu interés. ¿Qué tipo de vehículo buscas?`,
    options: ['SUV', 'Sedan', 'Pickup', 'Compacto', 'No estoy seguro'],
  },
  step2: {
    message: '¿Cuánto te gustaría pagar al mes?',
    type: 'number',
    validation: (value) => value > 0 && value < 2000,
  },
  step3: {
    message: '¿Cómo describirías tu crédito?',
    options: ['Excelente (750+)', 'Bueno (650-749)', 'Regular (550-649)', 'Necesita mejora (<550)'],
  },
  // ... más preguntas según necesidad
};
```

**Ventaja:** Captura progresiva se siente como conversación natural, no como interrogatorio.

---

## Conclusión

**Impacto esperado de optimización:**

- ✅ Conversión: 15-20% → 40-50% (+150%)
- ✅ Tiempo de captura: 90 seg → 25 seg (-72%)
- ✅ Mobile completion: 10-15% → 35-45% (+200%)
- ✅ Lead quality: Igual o mejor (captura progresiva)

**Clave del éxito:** Menos fricción + captura progresiva = más leads de mejor calidad.
