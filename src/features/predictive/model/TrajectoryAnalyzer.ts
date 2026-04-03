import { TrajectoryEvent } from '@/entities/session/model/useTrajectoryStore';

export type IntentCategory = 'discovery' | 'consideration' | 'decision';

export interface ScoreInsight {
  score: number;
  category: IntentCategory;
  factors: string[];
}

export class TrajectoryAnalyzer {
  private static WEIGHTS = {
    PAGE_VIEW_INVENTORY: 5,
    PAGE_VIEW_DETAIL: 15,
    CALCULATION_RUN: 30,
    IMAGE_VIEW_ZOOM: 10,
    LONG_DWELL_TIME: 20, // > 60s
  };

  /**
   * Calcula el Neuro-Score basado en la trayectoria de la sesión actual.
   */
  static analyze(events: TrajectoryEvent[], dwellTimes: Record<string, number>): ScoreInsight {
    let score = 0;
    const factors: string[] = [];
    const uniqueVisits = new Set(events.filter(e => e.type === 'page_view').map(e => e.path));

    // 1. Scoring por volumen de exploración
    if (uniqueVisits.size > 5) {
      score += 10;
      factors.push('Exploración profunda del catálogo');
    }

    // 2. Scoring por interacciones de valor (Calculadora / Financiamiento)
    const calculations = events.filter(e => e.type === 'calculation_run').length;
    if (calculations > 0) {
      score += this.WEIGHTS.CALCULATION_RUN;
      factors.push('Cálculo de financiamiento activo');
    }

    // 3. Scoring por atención prolongada (Dwell Time)
    Object.entries(dwellTimes).forEach(([path, duration]) => {
      if (path.includes('/trade-in') && duration > 45000) {
        score += this.WEIGHTS.LONG_DWELL_TIME;
        factors.push('Alta atención en Tasación de Trade-In');
      }
      if (path.includes('/inventory/') && duration > 60000) {
        score += this.WEIGHTS.PAGE_VIEW_DETAIL;
        factors.push('Interés sostenido en unidad específica');
      }
    });

    // 4. Categorización
    let category: IntentCategory = 'discovery';
    if (score >= 60) category = 'decision';
    else if (score >= 30) category = 'consideration';

    return {
      score: Math.min(100, score),
      category,
      factors
    };
  }
}
