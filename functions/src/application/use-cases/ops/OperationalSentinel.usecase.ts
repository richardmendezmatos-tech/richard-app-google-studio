import { z } from 'genkit';
import { Result, success, failure } from '../../../domain/types';

/**
 * Esquema de salida para el resultado del Sentinel Operativo (Gold Standard).
 */
export const OperationalScoreResultSchema = z.object({
    status: z.string(),
    insights: z.array(z.string()),
    riskLevel: z.enum(['low', 'medium', 'high']),
    recommendations: z.array(z.string()),
    operational_score: z.number()
});

export type OperationalScoreResultDTO = z.infer<typeof OperationalScoreResultSchema>;

/**
 * Use Case: Operational Sentinel
 * Encapsula la lógica central de análisis para la salud del negocio.
 */
export class OperationalSentinel {
    /**
     * Ejecuta el análisis preventivo utilizando IA.
     */
    static async execute(
        type: string,
        context: any,
        aiService: (prompt: string) => Promise<any>
    ): Promise<Result<OperationalScoreResultDTO>> {
        try {
            const prompt = `
                Actúa como Richard Automotive Sentinel, el guardián inteligente de la operación de Richard Méndez.
                Tu misión es identificar riesgos financieros y operativos antes de que afecten el cierre del dealer.
                
                Analiza el siguiente contexto de ${type}:
                ${JSON.stringify(context)}
                
                Reglas de Respuesta:
                1. Usa un tono analítico, preciso y experto en F&I.
                2. Prioriza la mitigación de riesgo para bancos y aseguradoras asociadas a Richard Automotive.
                3. Calcula un "Operational Score" (0-100) que represente la salud de este segmento.
                4. Mantén la voz de marca de Richard Automotive: Sofisticado, experto y enfocado en el mercado de Puerto Rico.
                
                Devuelve un JSON con: status, insights[], riskLevel, recommendations[], operational_score.
            `;

            const rawResult = await aiService(prompt);

            // Validación del DTO de salida
            const validatedResult = OperationalScoreResultSchema.parse(rawResult);

            return success(validatedResult);
        } catch (error) {
            console.error(`[OperationalSentinel] Fatal error analyzing ${type}:`, error);
            return failure(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * Cálculo manual de respaldo si la IA falla o para chequeos rápidos.
     */
    static calculateManualScore(data: any): number {
        let score = 75;
        if (data.active_followup) score += 10;
        if (data.credit_score > 700) score += 15;
        if (data.unprocessed_incident) score -= 30;
        return Math.min(Math.max(score, 0), 100);
    }
}
