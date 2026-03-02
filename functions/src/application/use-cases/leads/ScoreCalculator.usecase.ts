import { Lead, LeadScore } from '../../../domain/entities';

/**
 * Use Case: Calculate Lead Score
 * Pure business logic, agnostic to frameworks.
 */
export class ScoreCalculator {
  static execute(data: Partial<Lead>): LeadScore {
    let score = 0;
    const insights: string[] = [];

    // 1. Intent Signals (30%)
    if (data.vehicleId) {
      score += 15;
      insights.push('Interés específico en unidad');
    }
    if (data.aiAnalysis?.requestedConsultation) {
      score += 15;
      insights.push('Solicitó consulta');
    }

    // 2. Behavioral Engagement (30%) - Sincronizado con Frontend
    const interactions = data.chatInteractions || 0;
    if (interactions > 5) {
      score += 10;
      insights.push('Alta interacción en chat');
    }

    const views = data.behavioralMetrics?.inventoryViews || 0;
    if (views > 3) {
      score += 10;
      insights.push('Vuelve al inventario (>3 vistas)');
    }

    const timeOnSite = data.behavioralMetrics?.timeOnSite || 0;
    if (timeOnSite > 300) {
      score += 10;
      insights.push('Sesión prolongada (>5 min)');
    }

    // 3. Financial Fit (25%)
    const income = parseFloat(data.monthlyIncome || '0');
    if (income > 3000) {
      score += 15;
      insights.push('Ingreso sólido (>3k)');
    }
    if (data.hasPronto) {
      score += 10;
      insights.push('Cuenta con pronto');
    }

    // 4. Demographic/Stability (15%)
    if (data.timeAtJob === '2+ years') {
      score += 10;
      insights.push('Estabilidad laboral');
    }
    if (data.location === 'Puerto Rico') {
      score += 5;
      insights.push('Local (PR)');
    }

    let category: 'HOT' | 'WARM' | 'COLD' = 'COLD';
    if (score >= 60) category = 'HOT';
    else if (score >= 30) category = 'WARM';

    const nextAction =
      category === 'HOT' ? 'Llamar INMEDIATAMENTE (<5 min)' : 'Email sequence + Seguimiento 24h';

    return {
      score: Math.min(100, score),
      category,
      insights,
      nextAction,
      reasoning: `Score omnicanal basado en ${insights.length} señales detectadas (Web + WhatsApp).`,
    };
  }
}
