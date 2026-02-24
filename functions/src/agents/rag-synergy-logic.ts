import { ai } from '../services/aiManager';
import { z } from 'genkit';
import * as logger from 'firebase-functions/logger';
import { LoanSimulation, simulateLoan } from '../services/financeService';
import { customerMemoryService } from '../services/customerMemoryService';

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
        inventoryMatched: z.array(z.string()).optional()
    })
});

/**
 * Orchestrates the multi-agent RAG synergy.
 * 1. Research: Gathers context.
 * 2. Synthesis: Generates draft response.
 * 3. Validation: Audits for hallucinations and compliance.
 */
export async function orchestrateResponse(input: {
    message: string,
    history: any[],
    leadContext: any,
    vehicleContext?: any,
    leadId?: string
}) {
    logger.info("Starting Multi-Agent Orchestration", { message: input.message });

    // --- STEP 0: MEMORY RETRIEVAL ---
    const customerMemory = input.leadId ? await customerMemoryService.getMemory(input.leadId) : null;
    if (input.leadId) {
        // Asynchronously update memory in the background
        customerMemoryService.updateMemory(input.leadId, input.vehicleContext?.id, input.message).catch(e =>
            logger.error("Failed to update customer memory", e)
        );
    }

    // --- STEP 1: RESEARCH AGENT ---
    // (Simulated as a focused prompt for retrieval strategy)
    const researchResult = await ai.generate({
        prompt: `Eres el Research Agent de Richard Automotive. 
        Analiza este mensaje: "${input.message}"
        Historial: ${JSON.stringify(input.history.slice(-3))}
        Contexto del Lead: ${JSON.stringify(input.leadContext)}
        Memoria Histórica: ${JSON.stringify(customerMemory || 'No hay memoria previa')}
        
        RETORNA SOLO UN OBJETO JSON con:
        - queryExpansion: versión profesional de la búsqueda.
        - needsInventory: boolean.
        - needsPolicy: boolean (F&I/Financiamiento).
        `,
        config: { temperature: 0.1 }
    });

    // --- STEP 2: SYNTHESIS (RICHARD IA) ---
    // This is the core engine that generates the friendly response.
    const synthesisResult = await ai.generate({
        prompt: `Eres Richard IA, vendedor estrella de Richard Automotive. 
        ETAPAS DE VENTA:
        ${SALES_STAGES}

        MENSAJE CLIENTE: "${input.message}"
        CONTEXTO INVESTIGACIÓN: ${researchResult.text}
        VEHÍCULO ACTUAL: ${JSON.stringify(input.vehicleContext || 'Ninguno')}
        
        Enfoque: Determina la ETAPA ACTUAL basada en el historial y avanza a la siguiente.
        Genera una respuesta en "Boricua Profesional".
        REGLA DE ORO: No prometas APR exacto. Sé servicial.`,
    });

    // --- STEP 3: VALIDATION AGENT ---
    const validationResult = await ai.generate({
        prompt: `Eres el Validation Agent (Auditor de Calidad).
        RESPUESTA PROPUESTA: "${synthesisResult.text}"
        CONTEXTO DE VERDAD: ${researchResult.text}
        
        AUDITA SEGÚN:
        1. Precisión: ¿Miente sobre el inventario?
        2. Reglas de Oro: ¿Prometió APR o pagos exactos sin disclaimer?
        3. Identidad: ¿Suena como Richard?
        
        RETORNA JSON: { "passed": boolean, "feedback": "string", "correctedResponse": "string" (opcional) }
        `,
        config: { temperature: 0 },
    });

    // --- STEP 3b: VALIDATION PROCESSING ---
    let finalResponse = synthesisResult.text;
    let audit = { passed: true, feedback: '' };
    let negotiationStrategy: string | null = null;

    try {
        const auditRaw = validationResult.text.trim().replace(/```json|```/g, '');
        const auditData = JSON.parse(auditRaw);
        audit = { passed: auditData.passed, feedback: auditData.feedback };

        if (!auditData.passed && auditData.correctedResponse) {
            // Negotiation & Finance Analysis
            let financeData: LoanSimulation[] | null = null;
            const lowerMsg = input.message.toLowerCase();
            if (lowerMsg.includes('pago') || lowerMsg.includes('mensual') || lowerMsg.includes('pronto')) {
                financeData = simulateLoan(35000, 2000, 72, 720);
            }

            const negotiationAnalysis = await ai.generate({
                prompt: `Review this user request: "${input.message}".
                If there is an objection (price, interest, trade-in), suggest a psychological rebuttal using PAS or AIDA.
                Finance context: ${JSON.stringify(financeData)}.
                Return ONLY a negotiation strategy name or null.`,
                config: { temperature: 0.1 }
            });
            negotiationStrategy = negotiationAnalysis.text.trim() === 'null' ? null : negotiationAnalysis.text.trim();
            finalResponse = auditData.correctedResponse;
            logger.warn('Validation FAILED — using corrected response', { feedback: auditData.feedback });
        }
    } catch (e) {
        logger.error('Failed to parse validation JSON', { error: e, raw: validationResult.text });
    }

    // --- STEP 4: SENTIMENT + INTENT ANALYSIS ---
    const analysisResult = await ai.generate({
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
        config: { temperature: 0 }
    });

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
        logger.warn('Failed to parse sentiment/intent JSON, using defaults', { raw: analysisResult.text });
    }

    return {
        response: finalResponse,
        metadata: {
            stage: input.history && input.history.length > 0 ? "ongoing" : "initial",
            sentiment,
            intent,
            urgency,
            buyerStage,
            negotiationStrategy: negotiationStrategy || undefined,
            validationAudit: audit
        }
    };
}
