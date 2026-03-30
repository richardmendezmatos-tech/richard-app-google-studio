import { Lead, PredictiveInsight } from '@/entities/lead';
import { ScoringEngine } from '@/features/shared';

export class PredictiveScoringEngine implements ScoringEngine {
  async compute(lead: Lead): Promise<PredictiveInsight> {
    const metrics = lead.behavioralMetrics || {};
    const aiScore = lead.aiScore || 50;

    // Algoritmo de Nivel 14: Ponderación de trayectoria
    let predictiveScore = aiScore;
    const factors: string[] = [];

    // Factor 1: Engagement Temporal
    if (metrics.timeOnSite && metrics.timeOnSite > 300) {
      // 5 minutos
      predictiveScore += 10;
      factors.push('Alto tiempo de permanencia (>5m)');
    }

    // Factor 2: Intensidad de Inventario
    if (metrics.inventoryViews && metrics.inventoryViews > 5) {
      predictiveScore += 15;
      factors.push('Navegación intensiva de inventario');
    }

    // Factor 3: Interacciones Críticas
    if (metrics.highValueInteractions && metrics.highValueInteractions > 2) {
      predictiveScore += 20;
      factors.push('Múltiples interacciones de alto valor (fotos/specs)');
    }

    // Factor 4: Recencia
    const now = Date.now();
    if (metrics.lastActive && now - metrics.lastActive < 1000 * 60 * 60) {
      predictiveScore += 5;
      factors.push('Actividad reciente (<1h)');
    }

    // Cap: No exceder 100
    predictiveScore = Math.min(Math.max(predictiveScore, 0), 100);

    return {
      leadId: lead.id!,
      score: predictiveScore,
      confidence: 0.85,
      factors,
      predictedAction: predictiveScore > 80 ? 'Inmediate Outreach' : 'Nudge Scheduled',
      timestamp: now,
    };
  }
}
