# Lead Scoring Model para Richard Automotive

**Adaptación del agente `lead-qualifier` para F&I en Puerto Rico**

---

## Modelo de Scoring de Leads

### Dimensiones de Scoring (Total: 100 puntos)

| Dimensión | Peso | Rango | Justificación |
|-----------|------|-------|---------------|
| **Intent Signals** | 40% | 0-40 pts | Indicadores de intención de compra inmediata |
| **Behavioral Engagement** | 25% | 0-25 pts | Nivel de interacción con chatbot/contenido |
| **Financial Fit** | 20% | 0-20 pts | Capacidad de pago y perfil crediticio |
| **Demographic Fit** | 15% | 0-15 pts | Alineación con perfil de cliente ideal |

---

## 1. Intent Signals (0-40 puntos)

### Señales de Alta Intención

| Señal | Puntos | Descripción |
|-------|--------|-------------|
| **Mencionó modelo específico** | +15 | "Quiero una Tucson 2024" |
| **Mencionó timeline inmediato** | +10 | "Necesito el auto esta semana" |
| **Preguntó por financiamiento** | +8 | "¿Cuánto sería el pago mensual?" |
| **Mencionó presupuesto** | +7 | "Puedo pagar $400/mes" |
| **Preguntó por inventario** | +5 | "¿Tienen Kona disponible?" |
| **Preguntó por trade-in** | +5 | "¿Aceptan mi auto usado?" |
| **Solicitó cita** | +10 | "¿Cuándo puedo ir a verlo?" |
| **Compartió SSN/documentos** | +15 | Máxima intención |

**Cálculo:**

```typescript
function calculateIntentScore(lead: Lead): number {
  let score = 0;
  
  if (lead.mentionedSpecificModel) score += 15;
  if (lead.timeline === 'immediate') score += 10;
  if (lead.askedAboutFinancing) score += 8;
  if (lead.mentionedBudget) score += 7;
  if (lead.askedAboutInventory) score += 5;
  if (lead.askedAboutTradeIn) score += 5;
  if (lead.requestedAppointment) score += 10;
  if (lead.sharedDocuments) score += 15;
  
  return Math.min(score, 40); // Cap at 40
}
```

---

## 2. Behavioral Engagement (0-25 puntos)

### Métricas de Engagement

| Comportamiento | Puntos | Umbral |
|----------------|--------|--------|
| **Tiempo en conversación** | 0-10 | >3 min = 10 pts, 1-3 min = 5 pts, <1 min = 0 pts |
| **Número de mensajes** | 0-5 | >10 msgs = 5 pts, 5-10 = 3 pts, <5 = 0 pts |
| **Respondió a follow-up** | +5 | Respondió email o llamada |
| **Visitó página de inventario** | +3 | Después de chatbot |
| **Abrió email** | +2 | Cualquier email de secuencia |
| **Clickeó link en email** | +3 | CTA en email |
| **Regresó al sitio** | +2 | Segunda visita |

**Cálculo:**

```typescript
function calculateEngagementScore(lead: Lead): number {
  let score = 0;
  
  // Tiempo en conversación
  if (lead.conversationTime > 180) score += 10;
  else if (lead.conversationTime > 60) score += 5;
  
  // Número de mensajes
  if (lead.messageCount > 10) score += 5;
  else if (lead.messageCount >= 5) score += 3;
  
  // Follow-up response
  if (lead.respondedToFollowUp) score += 5;
  
  // Page visits
  if (lead.visitedInventoryPage) score += 3;
  
  // Email engagement
  if (lead.openedEmail) score += 2;
  if (lead.clickedEmailLink) score += 3;
  
  // Return visit
  if (lead.returnVisit) score += 2;
  
  return Math.min(score, 25); // Cap at 25
}
```

---

## 3. Financial Fit (0-20 puntos)

### Indicadores Financieros

| Indicador | Puntos | Criterio |
|-----------|--------|----------|
| **Crédito excelente** | +10 | Score 750+ o mencionó "excelente" |
| **Crédito bueno** | +7 | Score 650-749 o mencionó "bueno" |
| **Crédito regular** | +4 | Score 550-649 o mencionó "regular" |
| **Crédito afectado** | +2 | Score <550 o mencionó "malo" |
| **Presupuesto realista** | +5 | Budget alineado con mercado |
| **Tiene pronto** | +3 | Mencionó down payment |
| **Empleo estable** | +2 | >1 año en mismo trabajo |

**Cálculo:**

```typescript
function calculateFinancialScore(lead: Lead): number {
  let score = 0;
  
  // Credit score
  if (lead.creditScore >= 750 || lead.creditSelfAssessment === 'excellent') {
    score += 10;
  } else if (lead.creditScore >= 650 || lead.creditSelfAssessment === 'good') {
    score += 7;
  } else if (lead.creditScore >= 550 || lead.creditSelfAssessment === 'fair') {
    score += 4;
  } else {
    score += 2; // Todos son leads válidos en F&I
  }
  
  // Budget alignment
  if (isRealisticBudget(lead.monthlyBudget, lead.vehicleType)) {
    score += 5;
  }
  
  // Down payment
  if (lead.hasDownPayment) score += 3;
  
  // Employment stability
  if (lead.employmentYears >= 1) score += 2;
  
  return Math.min(score, 20);
}

function isRealisticBudget(budget: number, vehicleType: string): boolean {
  const ranges: Record<string, [number, number]> = {
    'compact': [250, 400],
    'sedan': [300, 500],
    'suv': [350, 600],
    'pickup': [400, 700],
  };
  
  const [min, max] = ranges[vehicleType] || [250, 700];
  return budget >= min && budget <= max;
}
```

---

## 4. Demographic Fit (0-15 puntos)

### Perfil de Cliente Ideal (ICP)

| Característica | Puntos | Criterio |
|----------------|--------|----------|
| **Ubicación en PR** | +5 | Área metropolitana o cerca de dealer |
| **Edad 25-55** | +3 | Rango de edad ideal |
| **Empleo formal** | +3 | Talonario, W2 |
| **Primera vez comprando** | +2 | Oportunidad de educación |
| **Familia/Pareja** | +2 | Mayor estabilidad |

**Cálculo:**

```typescript
function calculateDemographicScore(lead: Lead): number {
  let score = 0;
  
  // Location
  const metroAreas = ['San Juan', 'Bayamón', 'Carolina', 'Caguas', 'Ponce'];
  if (metroAreas.some(area => lead.location?.includes(area))) {
    score += 5;
  }
  
  // Age
  if (lead.age >= 25 && lead.age <= 55) score += 3;
  
  // Employment type
  if (lead.employmentType === 'formal') score += 3;
  
  // First-time buyer
  if (lead.isFirstTimeBuyer) score += 2;
  
  // Family status
  if (lead.hasFamily) score += 2;
  
  return Math.min(score, 15);
}
```

---

## Clasificación de Leads

### Categorías por Score

| Categoría | Score | Acción | SLA de Respuesta |
|-----------|-------|--------|------------------|
| **🔥 Hot Lead** | 70-100 | Llamar INMEDIATAMENTE | <5 minutos |
| **🟡 Warm Lead** | 40-69 | Email sequence + llamada en 24h | <24 horas |
| **🔵 Cold Lead** | 0-39 | Nurture sequence largo plazo | <7 días |

---

## Función de Scoring Completa

```typescript
interface Lead {
  // Intent signals
  mentionedSpecificModel: boolean;
  timeline: 'immediate' | 'this_week' | 'this_month' | 'exploring';
  askedAboutFinancing: boolean;
  mentionedBudget: boolean;
  monthlyBudget?: number;
  askedAboutInventory: boolean;
  askedAboutTradeIn: boolean;
  requestedAppointment: boolean;
  sharedDocuments: boolean;
  
  // Behavioral
  conversationTime: number; // seconds
  messageCount: number;
  respondedToFollowUp: boolean;
  visitedInventoryPage: boolean;
  openedEmail: boolean;
  clickedEmailLink: boolean;
  returnVisit: boolean;
  
  // Financial
  creditScore?: number;
  creditSelfAssessment?: 'excellent' | 'good' | 'fair' | 'poor';
  hasDownPayment: boolean;
  employmentYears: number;
  employmentType: 'formal' | 'informal' | 'self_employed';
  vehicleType: string;
  
  // Demographic
  location?: string;
  age?: number;
  isFirstTimeBuyer: boolean;
  hasFamily: boolean;
  
  // Metadata
  source: string;
  createdAt: Date;
}

interface LeadScore {
  total: number;
  breakdown: {
    intent: number;
    engagement: number;
    financial: number;
    demographic: number;
  };
  category: 'hot' | 'warm' | 'cold';
  recommendedAction: string;
  priority: 1 | 2 | 3;
}

function scoreLead(lead: Lead): LeadScore {
  const intentScore = calculateIntentScore(lead);
  const engagementScore = calculateEngagementScore(lead);
  const financialScore = calculateFinancialScore(lead);
  const demographicScore = calculateDemographicScore(lead);
  
  const total = intentScore + engagementScore + financialScore + demographicScore;
  
  let category: 'hot' | 'warm' | 'cold';
  let recommendedAction: string;
  let priority: 1 | 2 | 3;
  
  if (total >= 70) {
    category = 'hot';
    recommendedAction = 'Llamar INMEDIATAMENTE. Lead con alta intención de compra.';
    priority = 1;
  } else if (total >= 40) {
    category = 'warm';
    recommendedAction = 'Enviar email personalizado + llamada en 24h.';
    priority = 2;
  } else {
    category = 'cold';
    recommendedAction = 'Agregar a nurture sequence de largo plazo.';
    priority = 3;
  }
  
  return {
    total,
    breakdown: {
      intent: intentScore,
      engagement: engagementScore,
      financial: financialScore,
      demographic: demographicScore,
    },
    category,
    recommendedAction,
    priority,
  };
}
```

---

## Ejemplos de Scoring

### Ejemplo 1: Hot Lead (Score: 85)

```typescript
const hotLead: Lead = {
  // Intent: 38 puntos
  mentionedSpecificModel: true,        // +15
  timeline: 'immediate',               // +10
  askedAboutFinancing: true,           // +8
  mentionedBudget: true,               // +7
  monthlyBudget: 450,
  askedAboutInventory: false,
  askedAboutTradeIn: false,
  requestedAppointment: false,
  sharedDocuments: false,
  
  // Engagement: 23 puntos
  conversationTime: 240,               // +10
  messageCount: 15,                    // +5
  respondedToFollowUp: true,           // +5
  visitedInventoryPage: true,          // +3
  openedEmail: false,
  clickedEmailLink: false,
  returnVisit: false,
  
  // Financial: 17 puntos
  creditScore: 720,                    // +7 (good)
  hasDownPayment: true,                // +3
  employmentYears: 3,                  // +2
  employmentType: 'formal',            // +3
  vehicleType: 'suv',
  monthlyBudget: 450,                  // +5 (realistic)
  
  // Demographic: 13 puntos
  location: 'San Juan',                // +5
  age: 35,                             // +3
  isFirstTimeBuyer: false,
  hasFamily: true,                     // +2
  employmentType: 'formal',            // +3
  
  source: 'chatbot',
  createdAt: new Date(),
};

const score = scoreLead(hotLead);
// {
//   total: 85,
//   breakdown: { intent: 38, engagement: 23, financial: 17, demographic: 13 },
//   category: 'hot',
//   recommendedAction: 'Llamar INMEDIATAMENTE. Lead con alta intención de compra.',
//   priority: 1
// }
```

**Acción:** Richard debe llamar a este lead en los próximos 5 minutos.

---

### Ejemplo 2: Warm Lead (Score: 55)

```typescript
const warmLead: Lead = {
  // Intent: 20 puntos
  mentionedSpecificModel: false,
  timeline: 'this_month',
  askedAboutFinancing: true,           // +8
  mentionedBudget: true,               // +7
  monthlyBudget: 350,
  askedAboutInventory: true,           // +5
  askedAboutTradeIn: false,
  requestedAppointment: false,
  sharedDocuments: false,
  
  // Engagement: 15 puntos
  conversationTime: 120,               // +5
  messageCount: 8,                     // +3
  respondedToFollowUp: false,
  visitedInventoryPage: true,          // +3
  openedEmail: true,                   // +2
  clickedEmailLink: true,              // +3
  returnVisit: false,
  
  // Financial: 12 puntos
  creditSelfAssessment: 'fair',        // +4
  hasDownPayment: false,
  employmentYears: 2,                  // +2
  employmentType: 'formal',            // +3
  vehicleType: 'sedan',
  monthlyBudget: 350,                  // +5 (realistic)
  
  // Demographic: 8 puntos
  location: 'Bayamón',                 // +5
  age: 28,                             // +3
  isFirstTimeBuyer: true,              // +2 (pero ya tiene +3 de age)
  hasFamily: false,
  
  source: 'facebook_ad',
  createdAt: new Date(),
};

const score = scoreLead(warmLead);
// {
//   total: 55,
//   breakdown: { intent: 20, engagement: 15, financial: 12, demographic: 8 },
//   category: 'warm',
//   recommendedAction: 'Enviar email personalizado + llamada en 24h.',
//   priority: 2
// }
```

**Acción:** Enviar email de la secuencia Welcome + agendar llamada para mañana.

---

### Ejemplo 3: Cold Lead (Score: 28)

```typescript
const coldLead: Lead = {
  // Intent: 7 puntos
  mentionedSpecificModel: false,
  timeline: 'exploring',
  askedAboutFinancing: false,
  mentionedBudget: true,               // +7
  monthlyBudget: 200,
  askedAboutInventory: false,
  askedAboutTradeIn: false,
  requestedAppointment: false,
  sharedDocuments: false,
  
  // Engagement: 5 puntos
  conversationTime: 45,                // +0
  messageCount: 3,                     // +0
  respondedToFollowUp: false,
  visitedInventoryPage: false,
  openedEmail: true,                   // +2
  clickedEmailLink: true,              // +3
  returnVisit: false,
  
  // Financial: 11 puntos
  creditSelfAssessment: 'poor',        // +2
  hasDownPayment: false,
  employmentYears: 0.5,                // +0
  employmentType: 'informal',          // +0
  vehicleType: 'compact',
  monthlyBudget: 200,                  // +0 (unrealistic)
  
  // Demographic: 5 puntos
  location: 'Arecibo',                 // +0
  age: 22,                             // +0
  isFirstTimeBuyer: true,              // +2
  hasFamily: false,
  
  source: 'organic_search',
  createdAt: new Date(),
};

const score = scoreLead(coldLead);
// {
//   total: 28,
//   breakdown: { intent: 7, engagement: 5, financial: 11, demographic: 5 },
//   category: 'cold',
//   recommendedAction: 'Agregar a nurture sequence de largo plazo.',
//   priority: 3
// }
```

**Acción:** Agregar a email sequence educativa sobre cómo mejorar crédito y ahorrar para pronto.

---

## Integración con Firestore

```typescript
// firestore.rules
match /leads/{leadId} {
  allow read, write: if request.auth != null;
  
  // Trigger para calcular score automáticamente
  allow create: if request.resource.data.keys().hasAll(['nombre', 'telefono']);
}

// Cloud Function
export const calculateLeadScore = functions.firestore
  .document('leads/{leadId}')
  .onCreate(async (snap, context) => {
    const lead = snap.data() as Lead;
    const score = scoreLead(lead);
    
    // Update lead with score
    await snap.ref.update({
      score: score.total,
      scoreBreakdown: score.breakdown,
      category: score.category,
      recommendedAction: score.recommendedAction,
      priority: score.priority,
      scoredAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Trigger notification for hot leads
    if (score.category === 'hot') {
      await sendNotificationToRichard({
        title: '🔥 Hot Lead Alert!',
        body: `${lead.nombre} - Score: ${score.total}`,
        leadId: context.params.leadId,
      });
    }
  });

// También recalcular cuando se actualiza el lead
export const recalculateLeadScore = functions.firestore
  .document('leads/{leadId}')
  .onUpdate(async (change, context) => {
    const lead = change.after.data() as Lead;
    const score = scoreLead(lead);
    
    await change.after.ref.update({
      score: score.total,
      scoreBreakdown: score.breakdown,
      category: score.category,
      recommendedAction: score.recommendedAction,
      priority: score.priority,
      scoredAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
```

---

## Dashboard de Leads

### Vista para Richard

```typescript
interface LeadDashboard {
  hotLeads: Lead[];      // Score 70-100
  warmLeads: Lead[];     // Score 40-69
  coldLeads: Lead[];     // Score 0-39
  stats: {
    totalLeads: number;
    avgScore: number;
    conversionRate: number;
    responseTime: number;
  };
}

// Query para hot leads
const hotLeadsQuery = db.collection('leads')
  .where('score', '>=', 70)
  .where('contacted', '==', false)
  .orderBy('score', 'desc')
  .orderBy('createdAt', 'desc')
  .limit(20);
```

---

## Notificaciones Automáticas

### Para Hot Leads (Score 70+)

```typescript
async function sendNotificationToRichard(lead: Lead, score: LeadScore) {
  // SMS via Twilio
  await twilioClient.messages.create({
    body: `🔥 HOT LEAD!\n\n${lead.nombre}\n${lead.telefono}\nScore: ${score.total}\n\n${score.recommendedAction}`,
    to: RICHARD_PHONE,
    from: TWILIO_NUMBER,
  });
  
  // WhatsApp notification
  await sendWhatsAppMessage({
    to: RICHARD_WHATSAPP,
    message: `🔥 *Hot Lead Alert!*\n\nNombre: ${lead.nombre}\nTeléfono: ${lead.telefono}\nScore: ${score.total}/100\n\nAcción: ${score.recommendedAction}`,
  });
  
  // Push notification (si tiene app)
  await admin.messaging().send({
    token: RICHARD_FCM_TOKEN,
    notification: {
      title: '🔥 Hot Lead!',
      body: `${lead.nombre} - Score: ${score.total}`,
    },
    data: {
      leadId: lead.id,
      score: score.total.toString(),
    },
  });
}
```

---

## Score Decay (Degradación de Score)

### Leads que no responden pierden puntos con el tiempo

```typescript
export const decayLeadScores = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const leads = await db.collection('leads')
      .where('category', 'in', ['hot', 'warm'])
      .where('lastContactedAt', '<', sevenDaysAgo())
      .get();
    
    for (const doc of leads.docs) {
      const lead = doc.data() as Lead;
      const daysSinceContact = getDaysSince(lead.lastContactedAt);
      
      // Decay: -5 puntos por cada 7 días sin contacto
      const decayPoints = Math.floor(daysSinceContact / 7) * 5;
      const newScore = Math.max(0, lead.score - decayPoints);
      
      await doc.ref.update({
        score: newScore,
        category: getCategoryFromScore(newScore),
        decayedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });
```

---

## Métricas de Éxito del Scoring

### KPIs a Monitorear

| Métrica | Target | Cómo Medir |
|---------|--------|------------|
| **Precisión de Hot Leads** | >60% conversion | Hot leads que cierran / Total hot leads |
| **Tiempo de respuesta a Hot** | <5 min | Timestamp de lead - timestamp de primer contacto |
| **False positives** | <20% | Hot leads que no responden / Total hot leads |
| **False negatives** | <10% | Cold leads que cierran / Total cold leads |
| **Score distribution** | 20% hot, 50% warm, 30% cold | Distribución actual |

---

## Ajustes Basados en Resultados

### Después de 2 semanas, revisar

1. **Si muchos hot leads no convierten:**
   - Reducir peso de Intent Signals
   - Aumentar peso de Financial Fit

2. **Si cold leads están cerrando:**
   - Revisar umbrales de categorización
   - Ajustar pesos de dimensiones

3. **Si warm leads convierten mejor que hot:**
   - Recalibrar umbrales (warm = 50-79, hot = 80-100)

---

## Conclusión

**Beneficios del Lead Scoring:**

- ✅ Priorización automática de leads
- ✅ Respuesta más rápida a hot leads
- ✅ Mejor asignación de tiempo de Richard
- ✅ Nurturing apropiado por categoría
- ✅ Métricas claras de calidad de leads

**Próximo paso:** Implementar en Firestore y monitorear primeras 50 leads.
