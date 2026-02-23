import { OperationalScoreResult } from '../../domain/entities';

/**
 * Use Case: Operational Sentinel
 * Encapsulates the core analysis logic for business health.
 */
export class OperationalSentinel {
    static execute(type: string, context: any, aiService: (prompt: string) => Promise<any>): Promise<OperationalScoreResult> {
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

        return aiService(prompt);
    }

    /**
     * Legacy backup calculation if AI fails or for fast local checks.
     */
    static calculateManualScore(data: any): number {
        let score = 75;
        if (data.active_followup) score += 10;
        if (data.credit_score > 700) score += 15;
        if (data.unprocessed_incident) score -= 30;
        return Math.min(Math.max(score, 0), 100);
    }
}
