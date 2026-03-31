import { Lead, PredictiveInsight } from '@/entities/lead';
import { ScoringEngine } from '@/features/shared';

export class PredictiveScoringEngine implements ScoringEngine {
  async compute(lead: Lead): Promise<PredictiveInsight> {
    const metrics = lead.behavioralMetrics || {};
    const fingerprint = lead.behavioralFingerprint || { scrollVelocity: 0, imageDwellTime: {}, featureInteractions: [], interactionIntensity: 0 };
    const aiScore = lead.aiScore || 50;

    // Algoritmo de Nivel 14: Ponderación de trayectoria y micro-interacciones
    let predictiveScore = aiScore;
    const factors: string[] = [];

    // 1. Engagement Temporal (Nivel 13 Refined)
    if (metrics.timeOnSite && metrics.timeOnSite > 300) {
      predictiveScore += 10;
      factors.push('Alto tiempo de permanencia (>5m)');
    }

    // 2. Intensidad de Inventario
    if (metrics.inventoryViews && metrics.inventoryViews > 5) {
      predictiveScore += 15;
      factors.push('Navegación intensiva de inventario');
    }

    // 3. Nivel 14 Micro-Interactions: Dwell Time on Photos
    const totalDwellTime = Object.values(fingerprint.imageDwellTime).reduce((a, b) => a + b, 0);
    if (totalDwellTime > 30000) { // 30s en fotos
      predictiveScore += 15;
      factors.push('Exámen visual detallado (Dwell Time High)');
    }

    // 4. Scroll Velocity Analysis (Focus Detection)
    if (fingerprint.scrollVelocity > 50 && fingerprint.scrollVelocity < 500) {
      // Velocidad de lectura/enfoque
      predictiveScore += 10;
      factors.push('Patrón de lectura enfocado (Scroll Velocity Optimal)');
    }

    // 5. Interaction Intensity
    if (fingerprint.interactionIntensity > 7) {
      predictiveScore += 15;
      factors.push('Alta intensidad de interacción micro');
    }

    // 6. Intent Trajectory Calculation
    const trajectory = metrics.intentTrajectory || 'stable';
    if (trajectory === 'improving') {
      predictiveScore *= 1.1; // 10% boost for positive trend
      factors.push('Trayectoria de intención en ascenso');
    }

    // Cap: No exceder 100
    predictiveScore = Math.min(Math.max(predictiveScore, 0), 100);

    const now = Date.now();
    return {
      leadId: lead.id!,
      score: Math.round(predictiveScore),
      confidence: 0.92, // Increased confidence with Nivel 14 data
      factors,
      predictedAction: predictiveScore > 85 ? 'Immediate Outreach - High Conversion' : 'Nudge Scheduled',
      timestamp: now,
    };
  }
}
