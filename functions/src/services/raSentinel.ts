import { z } from 'genkit';
import { ai } from './aiManager';
import * as logger from 'firebase-functions/logger';
import { logFlowExecution } from './persistenceService';

export const raSentinelFlow = ai.defineFlow(
    {
        name: 'raSentinel',
        inputSchema: z.object({
            type: z.enum(['lead_health', 'inventory_risk', 'system_performance']),
            context: z.any()
        }),
        outputSchema: z.object({
            status: z.string(),
            insights: z.array(z.string()),
            riskLevel: z.enum(['low', 'medium', 'high']),
            recommendations: z.array(z.string()),
            operational_score: z.number() // Richard Automotive Operational Score
        })
    },
    async (input) => {
        logger.info(`🛡️ Richard Automotive Sentinel: Analyzing ${input.type}...`);

        const prompt = `
            Actúa como Richard Automotive Sentinel, el guardián inteligente de la operación de Richard Méndez.
            Tu misión es identificar riesgos financieros y operativos antes de que afecten el cierre del dealer.
            
            Analiza el siguiente contexto de ${input.type}:
            ${JSON.stringify(input.context)}
            
            Reglas de Respuesta:
            1. Usa un tono analítico, preciso y experto en F&I.
            2. Prioriza la mitigación de riesgo para bancos y aseguradoras asociadas a Richard Automotive.
            3. Calcula un "Operational Score" (0-100) que represente la salud de este segmento.
            4. Mantén la voz de marca de Richard Automotive: Sofisticado, experto y enfocado en el mercado de Puerto Rico.
            
            Devuelve un JSON con: status, insights[], riskLevel, recommendations[], operational_score.
        `;

        const result = await ai.generate(prompt);
        const output = result.output() || JSON.parse(result.text);

        // Automate Persistence Protocol
        await logFlowExecution('raSentinel', input, output);

        return output;
    }
);

/**
 * Lead health scoring for Richard Automotive
 */
export function calculateOperationalScore(data: any): number {
    let score = 75;
    if (data.active_followup) score += 10;
    if (data.credit_score > 700) score += 15;
    if (data.unprocessed_incident) score -= 30;
    return Math.min(Math.max(score, 0), 100);
}
