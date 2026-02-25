import { Lead, LeadScore } from '../../../domain/entities';

/**
 * Use Case: Calculate Lead Score
 * Pure business logic, agnostic to frameworks.
 */
export class ScoreCalculator {
    static execute(data: Partial<Lead>): LeadScore {
        let score = 0;
        const insights: string[] = [];

        // 1. Intent Signals (40%)
        if (data.vehicleId) { score += 20; insights.push("Interés específico en unidad"); }
        if (data.aiAnalysis?.requestedConsultation) { score += 20; insights.push("Solicitó consulta"); }

        // 2. Financial Fit (20%)
        const income = parseFloat(data.monthlyIncome || "0");
        if (income > 3000) { score += 10; insights.push("Ingreso sólido (>3k)"); }
        if (data.hasPronto) { score += 10; insights.push("Cuenta con pronto"); }

        // 3. Behavioral Engagement (25%)
        const interactions = data.chatInteractions || 0;
        if (interactions > 5) { score += 15; insights.push("Alta interacción en chat"); }
        if (data.viewedInventoryMultipleTimes) { score += 10; insights.push("Vuelve al inventario"); }

        // 4. Demographic/Stability (15%)
        if (data.timeAtJob === '2+ years') { score += 10; insights.push("Estabilidad laboral"); }
        if (data.location === 'Puerto Rico') { score += 5; insights.push("Local (PR)"); }

        let category: 'HOT' | 'WARM' | 'COLD' = 'COLD';
        if (score >= 70) category = 'HOT';
        else if (score >= 40) category = 'WARM';

        const nextAction = category === 'HOT' ? "Llamar INMEDIATAMENTE (<5 min)" : "Email sequence + Seguimiento 24h";

        return {
            score,
            category,
            insights,
            nextAction,
            reasoning: `Score basado en ${insights.length} señales de compra identificadas.`
        };
    }
}
