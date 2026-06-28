import { generateObject } from 'ai';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { sentinelAI } from '@/shared/api/ai/sentinelAI';
import { searchSemanticInventory } from '@/shared/api/supabase/supabaseClient';

// Intent schema — classify the message before routing
const IntentSchema = z.object({
  category: z.enum(['financing', 'inventory', 'appointment', 'trade-in', 'complaint', 'general']),
  confidence: z.number().min(0).max(1),
  vehicle: z.string().nullable().describe('Modelo específico mencionado, null si no aplica'),
  budget: z.string().nullable().describe('Presupuesto o cuota mencionada, null si no aplica'),
  timeframe: z.string().nullable().describe('Urgencia o tiempo mencionado (ej: "esta semana"), null si no aplica'),
});

type Intent = z.infer<typeof IntentSchema>;

// Specialized system instructions per intent category
const AGENT_SYSTEMS: Record<Intent['category'], string> = {
  financing: `Eres el Director de F&I de Richard Automotive en PR.
ESPECIALIDAD: Financiamiento automotriz. Sabes exactamente:
- Banco Popular PR: desde 5.49% APR | FirstBank: desde 5.75% | Oriental: desde 6.25%
- Ford Credit: tasas preferenciales en modelos nuevos (hasta 0% en promociones)
- $0 pronto con estabilidad laboral verificable
- Crédito dañado (<627): pronto inicial del 10-15% asegura aprobación
- Siempre habla en cuota mensual (60/72/84 meses), no en precio total
- Leasing Ford: sin penalidad por millaje, primer pago a 30 días laborables
- GAP Insurance: protege contra pérdida total
REGLA: Nunca des APR exacto sin decir "sujeto a aprobación de banco y perfil crediticio".`,

  inventory: `Eres el Especialista de Inventario de Richard Automotive.
ESPECIALIDAD: Conoces cada unidad disponible y sus ventajas para PR.
- Ford Nuevos: garantía 3/36k (bumper-to-bumper) + 5/60k (tren motriz) + Ford Credit
- Ford CPO: garantía extendida certificada, unidades inspeccionadas 172 puntos
- Recomendaciones basadas en: familia (SUV/Minivan), trabajo (Pickup), playa/montaña (4x4)
- Para PR: menciona siempre resistencia al salitre, neumáticos adecuados, clearance
REGLA: Solo recomienda autos que estén en el inventario actual. Si no tienes lo que busca, ofrece la alternativa más cercana.`,

  appointment: `Eres el Coordinador de Citas de Richard Automotive.
ESPECIALIDAD: Agenda visitas, test drives y citas de F&I.
- Horario: Lunes-Viernes 8am-6pm | Sábado 8am-4pm | Cerrado domingos
- Ubicación: Carr. 2 Km 34.2, Vega Alta, PR 00692
- Para test drive: el auto de interés debe estar disponible (confirmar con inventario)
- Cita de F&I: lleva ID, licencia de conducir, proof of income reciente
- Entrega en todo Puerto Rico disponible
REGLA: Siempre confirma con: nombre, teléfono, fecha preferida, auto de interés.`,

  'trade-in': `Eres el Valuador de Vehículos de Richard Automotive.
ESPECIALIDAD: Trade-in y valuación de vehículos usados para PR.
- Aceptamos CUALQUIER trade-in, con o sin balance de préstamo
- Factores de valuación: año, millaje, condición, historial de accidentes, demanda en PR
- El valor del trade-in se aplica directamente al pronto del vehículo nuevo
- Trade-in con balance: absorbemos la deuda y la estructuramos en el nuevo financiamiento
- Valuación gratis y sin compromiso en el dealer o enviando fotos + VIN por WhatsApp
REGLA: Da siempre un rango estimado, nunca un precio exacto sin inspección física.`,

  complaint: `Eres el Director de Experiencia al Cliente de Richard Automotive.
ESPECIALIDAD: Resolver problemas con empatía y soluciones concretas.
- Escucha activamente. Valida la frustración del cliente PRIMERO antes de ofrecer soluciones.
- Richard Méndez atiende personalmente: (787) 883-1234 o WhatsApp
- Para servicio postventa: coordinar directamente con el taller certificado Ford
- Garantía de satisfacción: si hay un error nuestro, lo corregimos sin costo
REGLA: Nunca minimices la queja. Ofrece una solución concreta y un escalamiento a Richard.`,

  general: `Eres Ricardo, el Asistente de Richard Automotive, concesionario Ford en Vega Alta, PR.
Eres profesional, cálido y experto en el mercado automotriz boricua.
Usa términos locales: "guagua", "pronto", "unidad", "millaje", "empírica".
Estrategia Ford-First: prioriza Ford Nuevos > Ford CPO > Ford usado > otra marca.
Menciona el Bono Web de $300 para solicitudes en línea cuando aplique.`,
};

async function classifyIntent(message: string): Promise<Intent> {
  try {
    const { object } = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: IntentSchema,
      system: 'Clasifica la intención del mensaje de un cliente de un concesionario Ford en Puerto Rico.',
      prompt: `Mensaje del cliente: "${message}"\n\nClasifica la intención principal y extrae las entidades clave.`,
    });
    return object;
  } catch {
    return { category: 'general', confidence: 0.5, vehicle: null, budget: null, timeframe: null };
  }
}

async function enrichContextWithInventory(message: string): Promise<string> {
  try {
    const embedding = await sentinelAI.generateEmbedding(message);
    const matches = await searchSemanticInventory(embedding, 0.35, 4);
    if (!matches?.length) return '';

    const { getSupabase: gs } = await import('@/shared/api/supabase/supabaseClient');
    const sb = await gs();
    const { data: cars } = await sb
      .from('inventory')
      .select('year, make, model, condition, price, mileage')
      .in('vin', matches.map((m) => m.car_id))
      .limit(50);

    if (!cars?.length) return '';
    return `\nINVENTARIO RELEVANTE:\n${cars
      .map((c: any) => `- ${c.year} ${c.make} ${c.model} (${c.condition === 'new' ? 'Nueva' : 'Usada'}) $${c.price?.toLocaleString()}`)
      .join('\n')}\n`;
  } catch {
    return '';
  }
}

/**
 * Multi-agent orchestrator with intent-based routing.
 * Replaces the previous stub implementation.
 */
export const orchestrateResponse = async (input: {
  message: string;
  history: any[];
  leadContext: any;
  vehicleContext?: any;
  leadId?: string;
  metadata?: any;
  isWhatsApp?: boolean;
}): Promise<{ response: string; metadata: any }> => {
  const startTime = Date.now();

  // Step 1: Classify intent
  const intent = await classifyIntent(input.message);

  // Step 2: Enrich context with semantic inventory search for relevant intents
  const inventoryContext =
    ['inventory', 'trade-in', 'general'].includes(intent.category)
      ? await enrichContextWithInventory(input.message)
      : '';

  // Step 3: Build conversation history string
  const historyStr =
    input.history?.slice(-6)
      .map((h: any) => `${h.role === 'user' ? 'Cliente' : 'Richard'}: ${h.content || ''}`)
      .join('\n') || '';

  // Step 4: Route to specialized agent system prompt
  const systemPrompt = AGENT_SYSTEMS[intent.category];

  // Step 5: Build the full contextual prompt
  const contextPrompt = `
HISTORIAL RECIENTE:
${historyStr || '(Primera interacción)'}

CONTEXTO DEL CLIENTE:
${JSON.stringify(input.leadContext || {}, null, 2)}
${inventoryContext}
${intent.vehicle ? `\nVehículo de interés detectado: ${intent.vehicle}` : ''}
${intent.budget ? `\nPresupuesto detectado: ${intent.budget}` : ''}

MENSAJE ACTUAL: "${input.message}"

${input.isWhatsApp ? 'IMPORTANTE: Respuesta máx 280 caracteres (WhatsApp). Sin saltos de línea excesivos.' : ''}
`;

  // Step 6: Generate response with specialized agent
  const response = await sentinelAI.quickGen(contextPrompt, systemPrompt);

  const latencyMs = Date.now() - startTime;

  return {
    response: response || 'Un momento por favor. Estoy consultando tu solicitud con nuestro equipo.',
    metadata: {
      intent: intent.category,
      confidence: intent.confidence,
      vehicle: intent.vehicle,
      budget: intent.budget,
      timeframe: intent.timeframe,
      latencyMs,
      agentUsed: intent.category,
      inventoryContextIncluded: inventoryContext.length > 0,
    },
  };
};
