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

  // --- STEP 1: PARALLEL RESEARCH & ANALYSIS (CQRS Lite) ---
  // Fetch market intel if vehicle is present to enable proactive sales
  const marketIntelPromise =
    input.vehicleContext?.make && input.vehicleContext?.model
      ? getMarketInsight(input.vehicleContext.make, input.vehicleContext.model)
      : Promise.resolve(null);

  const [researchResult, analysisResult, marketIntel] = await Promise.all([
    ai.run('research-agent', async () => {
      return await ai.generate({
        prompt: `Eres el Research Agent de Richard Automotive. 
                Analiza este mensaje: "${input.message}"
                Historial: ${JSON.stringify(input.history.slice(-3))}
                Contexto del Lead: ${JSON.stringify(input.leadContext)}
                Memoria Histórica: ${JSON.stringify(customerMemory || 'No hay memoria previa')}
                Intención Detectada: ${input.metadata?.intent || 'Desconocida'}
                
                RETORNA SOLO UN OBJETO JSON con:
                - queryExpansion: versión profesional de la búsqueda.
                - needsInventory: boolean.
                - needsPolicy: boolean (F&I/Financiamiento).
                `,
        config: { temperature: 0.1 },
      });
    }),
    ai.run('analysis-agent', async () => {
      return await ai.generate({
        prompt: `Eres un analizador de CRM especializado en ventas de autos.
                Mensaje del cliente: "${input.message}"
                Historial reciente: ${JSON.stringify(input.history.slice(-4))}
        
                Clasifica y retorna SOLO JSON válido (sin markdown):
                {
                    "sentiment": "positive" | "neutral" | "negative" | "frustrated" | "excited",
                    "intent": "inquiry" | "consultation" | "purchase_ready" | "objection" | "trade_in" | "financing" | "test_drive" | "exit",
                    "urgency": "low" | "medium" | "high",
                    "buyerStage": "awareness" | "consideration" | "decision" | "post_sale"
                }`,
        config: { temperature: 0 },
      });
    }),
    marketIntelPromise,
  ]);

  // Parse Analysis results early
  let sentiment = 'neutral';
  let intent = 'consultation';
  let urgency = 'medium';
  let buyerStage = 'consideration';

  try {
    const raw = analysisResult.text.trim().replace(/```json|```/g, '');
    const parsed = JSON.parse(raw);
    sentiment = parsed.sentiment ?? sentiment;
    intent = parsed.intent ?? intent;
    urgency = parsed.urgency ?? urgency;
    buyerStage = parsed.buyerStage ?? buyerStage;
    logger.info('Sentiment & Intent', { sentiment, intent, urgency, buyerStage });
  } catch (e) {
    logger.warn('Failed to parse sentiment/intent JSON, using defaults', {
      raw: analysisResult.text,
    });
  }

  // Parse Research results to fetch semantic inventory if needed
  let queryExpansion = '';
  let needsInventory = false;
  let needsPolicy = false;
  try {
    const rawR = researchResult.text.trim().replace(/```json|```/g, '');
    const parsedR = JSON.parse(rawR);
    queryExpansion = parsedR.queryExpansion ?? '';
    needsInventory = parsedR.needsInventory ?? false;
    needsPolicy = parsedR.needsPolicy ?? false;
    logger.info('Research Intent', { queryExpansion, needsInventory, needsPolicy });
  } catch (e) {
    logger.warn('Failed to parse research JSON', { raw: researchResult.text });
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

  // --- STEP 2: SYNTHESIS (RICHARD IA) ---
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
            - REGLA: Si el cliente mostró interés previo en un modelo, menciónalo como experto.
            - TERMINOLOGÍA DEL DEALER (OBLIGATORIO): Usa términos nativos como "guagua", "unidad", "pronto" y "trade-in". 
            - TONO: "Boricua Profesional". Cálido, respetuoso y enfocado en la seguridad financiera y paz mental del cliente. Conecta con la cultura de Puerto Rico usando un lenguaje claro pero experto.

            MENSAJE CLIENTE: "${input.message}"
            CONTEXTO INVESTIGACIÓN: ${researchResult.text}
            
            Enfoque: Determina la ETAPA ACTUAL y usa la MEMORIA_RELEVANTE para personalizar.
            Genera una respuesta en "Boricua Profesional".
            REGLA DE ORO: No prometas APR exacto. Usa los datos del contexto de forma servicial pero estricta.`;

    const finalPrompt = basePrompt
      .replace('{{customerContext}}', JSON.stringify(input.leadContext))
      .replace('{{history}}', JSON.stringify(input.history.slice(-5)))
      .replace('{{message}}', input.message)
      .replace('{{inventory}}', inventorySnippet || 'No se requiere inventario.');

    return await ai.generate({
      prompt: finalPrompt,
    });
  });

  // --- STEP 3: LOGICAL CHECKSUM & COMPLIANCE ---
  const validationResult = await ai.run('validation-agent', async () => {
    return await ai.generate({
      prompt: `Eres el Validation Agent (Auditor de Calidad Nivel 12).
            RESPUESTA PROPUESTA: "${synthesisResult.text}"
            CONTEXTO DE VERDAD (HECHOS):
            - Vehículo: ${input.vehicleContext?.name || 'Inquiry general'}
            - Precio: ${input.vehicleContext?.price || 'N/A'}
            - Reglas: No garantizar APR, no inventar stock, disclaimer obligatorio.
            - Regla Terminología: Valida el uso de "guagua", "unidad" y "pronto". Asegura un trato profesional y cercano.
            
            AUDITA SEGÚN ESTRATEGIA DE CHECKSUM LÓGICO:
            1. Alucinación de Precio: ¿El precio en la respuesta coincide con ${input.vehicleContext?.price}?
            2. Legal Compliance: Si habla de financiamiento, ¿incluye Disclaimer de APR estimado?
            3. Inventory Integrity: ¿Promete disponibilidad que no esté confirmada?
            
            RETORNA JSON: { "passed": boolean, "errorType": "PRICE"|"POLICY"|"TONE"|null, "feedback": "string", "correctedResponse": "string" }
            `,
      config: { temperature: 0 },
    });
  });

  let finalResponse = synthesisResult.text;
  let audit = { passed: true, feedback: '', errorType: null };

  try {
    const auditRaw = validationResult.text.trim().replace(/```json|```/g, '');
    const auditData = JSON.parse(auditRaw);
    audit = {
      passed: auditData.passed,
      feedback: auditData.feedback,
      errorType: auditData.errorType,
    };

    if (!auditData.passed && auditData.correctedResponse) {
      finalResponse = auditData.correctedResponse;
      logger.warn('Validation FAILED — Logic Checksum triggered corection', {
        feedback: auditData.feedback,
      });
    }
  } catch (e) {
    logger.error('Failed to parse validation JSON', { error: e, raw: validationResult.text });
  }

  // --- STEP 4: POST-PROCESSING ---
  // Background execution for negotiation strategy to keep responsiveness
  const negotiationPromise = (async () => {
    const lowerMsg = input.message.toLowerCase();
    if (
      lowerMsg.includes('pago') ||
      lowerMsg.includes('mensual') ||
      lowerMsg.includes('pronto') ||
      lowerMsg.includes('caro')
    ) {
      const negotiationAnalysis = await ai.generate({
        prompt: `Review user: "${input.message}".
                Objection: ${intent === 'objection' ? 'Yes' : 'No'}.
                Suggest psychological strategy name (PAS/AIDA/FAB) or null.`,
        config: { temperature: 0.1 },
      });
      return negotiationAnalysis.text.trim() === 'null' ? null : negotiationAnalysis.text.trim();
    }
    return null;
  })();

  const negotiationStrategy = await negotiationPromise;

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
      validationAudit: {
        passed: audit.passed,
        errorType: audit.errorType,
        feedback: audit.feedback,
      },
    },
  };
}
