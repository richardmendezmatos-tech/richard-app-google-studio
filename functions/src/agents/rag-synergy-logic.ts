import { ai } from '../services/aiManager';
import { z } from 'genkit';
import * as logger from 'firebase-functions/logger';
import { LoanSimulation, simulateLoan } from '../services/financeService';

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
    vehicleContext?: any
}) {
    logger.info("Starting Multi-Agent Orchestration", { message: input.message });

    // --- STEP 1: RESEARCH AGENT ---
    // (Simulated as a focused prompt for retrieval strategy)
    const researchResult = await ai.generate({
        prompt: `Eres el Research Agent de Richard Automotive. 
        Analiza este mensaje: "${input.message}"
        Historial: ${JSON.stringify(input.history.slice(-3))}
        Contexto del Lead: ${JSON.stringify(input.leadContext)}
        
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

    let finalResponse = synthesisResult.text;
    let audit = { passed: true, feedback: "" };
    let negotiationStrategy: string | null = null;

    try {
        const auditData = JSON.parse(validationResult.text);
        audit = { passed: auditData.passed, feedback: auditData.feedback };
        if (!auditData.passed && auditData.correctedResponse) {
            // 4. STEP: Negotiation & Finance Analysis
            let financeData: LoanSimulation[] | null = null;
            if (input.message.toLowerCase().includes('pago') || input.message.toLowerCase().includes('mensual') || input.message.toLowerCase().includes('pronto')) {
                // Mocking credit score for demo, in real life it would come from input/CRM
                financeData = simulateLoan(35000, 2000, 72, 720);
            }

            const negotiationAnalysis = await ai.generate({
                prompt: `Review this user request: "${input.message}". 
                If there is an objection (price, interest, trade-in), suggest a psychological rebuttal using PAS or AIDA.
                Context: The user is looking at finance options: ${JSON.stringify(financeData)}.
                Return a negotiation strategy name or null.`,
                config: { temperature: 0.1 }
            });
            negotiationStrategy = negotiationAnalysis.text.trim() === 'null' ? null : negotiationAnalysis.text.trim();

            finalResponse = auditData.correctedResponse;
            logger.warn("Validation FAILED - Using corrected response", { feedback: auditData.feedback });
        }
    } catch (e) {
        logger.error("Failed to parse validation JSON", { error: e, raw: validationResult.text });
    }

    return {
        response: finalResponse,
        metadata: {
            stage: input.history && input.history.length > 0 ? "ongoing" : "initial",
            sentiment: "neutral", // TODO: Real sentiment analysis
            intent: "consultation", // TODO: Real intent classification
            negotiationStrategy: negotiationStrategy || undefined,
            validationAudit: audit
        }
    };
}
