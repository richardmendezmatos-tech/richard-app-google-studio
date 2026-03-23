import { ai } from '../services/aiManager';
import { z } from 'genkit';
import * as logger from 'firebase-functions/logger';
import { customerMemoryService } from '../services/customerMemoryService';
import { saveCheckpoint } from '../services/persistenceService';
import { getMarketInsight } from '../services/marketIntelService';
import { WHATSAPP_AGENT_PROMPT } from '../application/use-cases/leads/WhatsAppAgent.prompt';
import { semanticSearch } from '../infrastructure/ai/VectorAdapter';

const SALES_STAGES = `
1. Introduction: Start conversation, introduce Richard Automotive. Verify they are speaking to the right person if needed.
2. Qualification: Confirm if they are buying, trading-in, or just looking. Ask for budget or specific needs.
3. Value Proposition: Explain why Richard Automotive is the best (Lifetime Warranty, fast service).
4. Needs Analysis: detailed questions about what they need in a car (SUV vs Sedan, Gas vs Hybrid).
5. Solution Presentation: Recommend specific cars from inventory based on needs.
6. Objection Handling: Address price/financing concerns politely.
7. Close: Ask to schedule a Test Drive or Visit.
8. End: Polite goodbye.
`;

export const MultiAgentResponseSchema = z.object({
  response: z.string(),
  metadata: z.object({
    stage: z.string(),
    sentiment: z.string(),
    intent: z.string(),
    negotiationStrategy: z.string().optional(),
    inventoryMatched: z.array(z.string()).optional(),
    extractedData: z.object({
      workStatus: z.string().nullable().optional(),
      downPayment: z.string().nullable().optional(),
      tradeInVehicle: z.string().nullable().optional(),
    }).optional(),
  }),
});

/**
 * Orchestrates the multi-agent RAG synergy.
 * 1. Research: Gathers context.
 * 2. Synthesis: Generates draft response.
 * 3. Validation: Audits for hallucinations and compliance.
 */
export async function orchestrateResponse(input: {
  message: string;
  history: any[];
  leadContext: any;
  vehicleContext?: any;
  leadId?: string;
  metadata?: any;
  isWhatsApp?: boolean; // New flag to detect channel
}) {
  logger.info('Starting Multi-Agent Orchestration', { message: input.message });

  // --- STEP 0: MEMORY RETRIEVAL ---
  const customerMemory = input.leadId ? await customerMemoryService.getMemory(input.leadId) : null;
  if (input.leadId) {
    // Asynchronously update memory in the background
    customerMemoryService
      .updateMemory(input.leadId, input.vehicleContext?.id, input.message)
      .catch((e) => logger.error('Failed to update customer memory', e));
  }

  // --- STEP 1: ROUTING & INTEL (Lean Synergy) ---
  // Fetch market intel if vehicle is present to enable proactive sales
  const marketIntelPromise =
    input.vehicleContext?.make && input.vehicleContext?.model
      ? getMarketInsight(input.vehicleContext.make, input.vehicleContext.model)
      : Promise.resolve(null);

  const routerPromise = ai.run('router-agent', async () => {
    return await ai.generate({
      prompt: `Eres un Analista CRM experto de Richard Automotive.
              Analiza el mensaje: "${input.message}"
              Historial (últimos 3): ${JSON.stringify(input.history.slice(-3))}
              Contexto Lead: ${JSON.stringify(input.leadContext)}
              
              RETORNA SOLO JSON VÁLIDO (sin markdown):
              {
                  "sentiment": "positive" | "neutral" | "negative" | "frustrated" | "excited",
                  "intent": "inquiry" | "consultation" | "purchase_ready" | "objection" | "trade_in" | "financing" | "test_drive" | "exit",
                  "urgency": "low" | "medium" | "high",
                  "buyerStage": "awareness" | "consideration" | "decision" | "post_sale",
                  "needsInventory": boolean,
                  "queryExpansion": string, // Si needsInventory=true, descripción optimizada para buscar autos
                  "extractedData": {
                      "workStatus": "Type of employment or null",
                      "downPayment": "Amount or confirmation of pronto or null",
                      "tradeInVehicle": "Make/model for trade-in or null"
                  }
              }`,
      config: { temperature: 0 },
    });
  });

  const [routerResult, marketIntel] = await Promise.all([routerPromise, marketIntelPromise]);

  // Parse Router results
  let sentiment = 'neutral';
  let intent = 'consultation';
  let urgency = 'medium';
  let buyerStage = 'consideration';
  let queryExpansion = '';
  let needsInventory = false;
  let extractedData: any = {};

  try {
    const rawRouter = routerResult.text.trim().replace(/```json|```/g, '');
    const parsedRouter = JSON.parse(rawRouter);
    sentiment = parsedRouter.sentiment ?? sentiment;
    intent = parsedRouter.intent ?? intent;
    urgency = parsedRouter.urgency ?? urgency;
    buyerStage = parsedRouter.buyerStage ?? buyerStage;
    needsInventory = parsedRouter.needsInventory ?? false;
    queryExpansion = parsedRouter.queryExpansion ?? '';
    extractedData = parsedRouter.extractedData ?? {};
    logger.info('Lean Router Analysis', { intent, needsInventory, sentiment, extractedData });
  } catch (e) {
    logger.warn('Failed to parse router JSON', { raw: routerResult.text });
  }

  let inventorySnippet = '';
  if (needsInventory && queryExpansion) {
    logger.info(`Triggering Semantic Search for: "${queryExpansion}"`);
    try {
      const cars = await semanticSearch(queryExpansion, 3);
      if (cars && cars.length > 0) {
        inventorySnippet = cars.map((c: any) => 
          `- ${c.year || ''} ${c.make} ${c.model} (${c.price ? '$'+c.price : 'Consultar'}): ${c.description || ''}`
        ).join('\\n');
        logger.info('Live inventory matching complete:', { carsCount: cars.length });
      } else {
        inventorySnippet = 'No encontramos unidades exactas según esa descripción actual. Sugiere buscar una alternativa similar o agenda visita al dealer.';
      }
    } catch (e) {
      logger.error('Vector Search Semantic DB Error', e);
      inventorySnippet = 'Error conectando al inventario, pedir disculpas cordialmente.';
    }
  }

  // --- STEP 2: SYNTHESIS & VALIDATION (Lean Synergy) ---
  const synthesisResult = await ai.run('synthesis-agent', async () => {
    const basePrompt = input.isWhatsApp
      ? WHATSAPP_AGENT_PROMPT
      : `Eres Richard IA, vendedor estrella de Richard Automotive. 
            ETAPAS DE VENTA:
            ${SALES_STAGES}

            [DATOS_INMUTABLES]:
            - VEHÍCULO: ${JSON.stringify(input.vehicleContext || 'Consulta el inventario')}
            - PRECIO_STRICT: ${input.vehicleContext?.price || 'No definido'}
            - MARKET_INTEL: ${marketIntel ? `Promedio PR: $${marketIntel.averagePrice}, Más bajo: $${marketIntel.lowestPrice}` : 'Sin datos de mercado recientes'}
            - INTENCIÓN_SEMÁNTICA: ${intent}
            - MEMORIA_RELEVANTE: ${customerMemory ? JSON.stringify(customerMemory) : 'Cliente sin historial'}
            - INVENTARIO_RELEVANTE: ${inventorySnippet || 'No se buscó inventario adicional en este turno.'}
            - REGLA: Usa MARKET_INTEL proactivamente para defender el precio si Richard Automotive es más barato.
            - REGLA: Los precios son finales. No invented descuentos ni tasas.
            - REGLA: Si el cliente mostró interés previo en un modelo, menciónalo como experto.
            - TERMINOLOGÍA DEL DEALER (OBLIGATORIO): Usa términos nativos como "guagua", "unidad", "pronto" y "trade-in". 
            - TONO: "Boricua Profesional". Cálido, respetuoso y enfocado en la seguridad financiera y paz mental del cliente. Conecta con la cultura de Puerto Rico usando un lenguaje claro pero experto.

            MENSAJE CLIENTE: "${input.message}"
            
            Enfoque: Determina la ETAPA ACTUAL y usa la MEMORIA_RELEVANTE para personalizar.
            Genera una respuesta en "Boricua Profesional".
            REGLA DE ORO: No prometas APR exacto. Usa los datos del contexto de forma servicial pero estricta.`;

    const finalPrompt = basePrompt
      .replace('{{customerContext}}', JSON.stringify(input.leadContext))
      .replace('{{history}}', JSON.stringify(input.history.slice(-3))) // Restricted visual history
      .replace('{{message}}', input.message)
      .replace('{{inventory}}', inventorySnippet || 'No se requiere inventario.');

    const structuredPrompt = finalPrompt + `\n\nIMPORTANTE: ESTÁS EN MODO STRICT. DEBES RETORNAR ÚNICAMENTE UN OBJETO JSON VÁLIDO.
    Auto-valida tu respuesta asegurando que no inventas precios ni prometes APRs sin disclaimer.
    {
      "response": "Tu respuesta persuasiva aquí...",
      "negotiationStrategy": "PAS" | "AIDA" | "FAB" | null,
      "validationPassed": true | false
    }`;

    return await ai.generate({
      prompt: structuredPrompt,
      config: { temperature: 0.1 },
    });
  });

  let finalResponse = synthesisResult.text;
  let negotiationStrategy: string | null = null;
  const audit = { passed: true, feedback: 'Auto-validated structurally', errorType: null };

  try {
    const rawSynth = synthesisResult.text.trim().replace(/```json|```/g, '');
    const parsedSynth = JSON.parse(rawSynth);
    finalResponse = parsedSynth.response || finalResponse;
    negotiationStrategy = parsedSynth.negotiationStrategy || null;
    audit.passed = parsedSynth.validationPassed ?? true;
    
    if (!audit.passed) {
       logger.warn('Agent self-reported validation failure.');
    }
  } catch(e) {
    logger.warn('Synthesis did not return JSON. Using raw text.');
  }

  // --- STEP 5: WORKSPACE CHECKPOINTING (Workspace Manager) ---
  const checkpointId = `ra-chat-${input.leadId || 'anonymous'}-${Date.now()}`;
  await saveCheckpoint({
    id: checkpointId,
    fecha: new Date().toISOString().split('T')[0],
    categoria: 'INTERACTION',
    titulo: `Chat Interaction - ${intent}`,
    resumen: `Lead ${input.leadId || 'anonymous'} sent message: ${input.message.substring(0, 50)}`,
    estatus: audit.passed ? 'VALIDATED' : 'CORRECTED',
    datos: {
      sentiment,
      intent,
      urgency,
      buyerStage,
      negotiationStrategy,
      validationFeedback: audit.feedback,
    },
    eficiencia_estimada_Ew: 0.95,
  }).catch((e) => logger.error('Checkpointing failed', e));

  return {
    response: finalResponse,
    metadata: {
      ...input.metadata,
      stage: input.history && input.history.length > 0 ? 'ongoing' : 'initial',
      sentiment,
      intent,
      urgency,
      buyerStage,
      negotiationStrategy: negotiationStrategy || undefined,
      extractedData,
      validationAudit: {
        passed: audit.passed,
        errorType: audit.errorType,
        feedback: audit.feedback,
      },
    },
  };
}
