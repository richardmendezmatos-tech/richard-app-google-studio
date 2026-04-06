import { TrajectoryEvent } from '@/entities/session/model/useTrajectoryStore';

export type IntentCategory = 'discovery' | 'consideration' | 'decision';

export interface ScoreInsight {
  score: number;
  category: IntentCategory;
  factors: string[];
  signals: {
    interaction: number;
    velocity: number;
    formFocus: boolean;
    dwellTime: number;
  };
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
  /**
   * Calcula el Neuro-Score basado en la trayectoria de la sesión actual.
   */
  static analyze(events: TrajectoryEvent[], dwellTimes: Record<string, number> = {}): ScoreInsight {
    let score = 0;
    const factorLabels: string[] = [];
    const signals = { interaction: 0, velocity: 0, formFocus: false, dwellTime: 0 };
    
    if (!events || events.length === 0) {
      return { score: 0, category: 'discovery', factors: [], signals };
    }

    const uniqueVisits = new Set(events.filter(e => e.type === 'page_view').map(e => e.path));

    // 1. Scoring por volumen de exploración (Velocity Signal)
    signals.velocity = Math.min(10, uniqueVisits.size);
    if (uniqueVisits.size > 5) {
      score += 10;
      factorLabels.push('Exploración profunda del catálogo');
    }

    // 2. Scoring por interacciones (Interaction Signal)
    const calculationEvents = events.filter(e => e.type === 'calculation_run');
    signals.interaction = Math.min(10, calculationEvents.length * 2);
    if (calculationEvents.length > 0) {
      score += this.WEIGHTS.CALCULATION_RUN;
      factorLabels.push('Cálculo de financiamiento activo');
    }

    // 3. Scoring por atención prolongada (Dwell Signal)
    let totalDwell = 0;
    Object.entries(dwellTimes).forEach(([path, duration]) => {
      totalDwell += duration;
      if (path.includes('/trade-in') && duration > 45000) {
        score += this.WEIGHTS.LONG_DWELL_TIME;
        factorLabels.push('Alta atención en Tasación de Trade-In');
      }
      if (path.includes('/inventory/') && duration > 60000) {
        score += this.WEIGHTS.PAGE_VIEW_DETAIL;
        factorLabels.push('Interés sostenido en unidad específica');
      }
    });
    signals.dwellTime = Math.min(10, totalDwell / 60000); // 1 pt por minuto

    // 4. Form Focus Signal (Búsqueda de financiamiento)
    signals.formFocus = events.some(e => e.path.includes('credit') || e.path.includes('apply'));

    // 5. Categorización
    let category: IntentCategory = 'discovery';
    if (score >= 60) category = 'decision';
    else if (score >= 30) category = 'consideration';

    return {
      score: Math.min(100, score),
      category,
      factors: factorLabels,
      signals
    };
  }

  /**
   * Calcula el puntaje de coincidencia para un auto específico basado en las preferencias analizadas.
   * Retorna un valor entre 0 y 1.
   */
  static scoreCar(car: any, preferences: any): number {
    if (!car || !preferences) return 0;
    let score = 0;
    
    // Match por categoría / tipo
    const preferredType = this.getPreferredCategory(preferences.events || []);
    if (preferredType && car.type?.toLowerCase() === preferredType.toLowerCase()) {
      score += 0.4;
    }

    // Match por nombre / marca mencionado en la trayectoria
    const carName = car.name.toLowerCase();
    const uniquePaths = new Set((preferences.events || []).map((e: any) => e.path.toLowerCase()));
    
    uniquePaths.forEach((path: string) => {
      if (path.includes(carName.split(' ')[0])) { // Match simple por marca
        score += 0.2;
      }
    });

    // Bonus por "Alta Demanda" simulado (Social Proof Predictivo)
    // En producción esto vendría de un backend, aquí lo simulamos con el ID para consistencia
    if (parseInt(car.id.slice(-1), 16) % 3 === 0) {
      score += 0.15;
    }

    return Math.min(1, score);
  }

  /**
   * Identifica la categoría de vehículo preferida basada en la navegación.
   */
  static getPreferredCategory(events: TrajectoryEvent[]): string | null {
    const categories: Record<string, number> = {};
    
    events.forEach(event => {
      if (event.type === 'page_view' || event.type === 'image_view') {
        const path = event.path.toLowerCase();
        if (path.includes('suv')) categories['suv'] = (categories['suv'] || 0) + 1;
        if (path.includes('truck')) categories['truck'] = (categories['truck'] || 0) + 1;
        if (path.includes('sedan')) categories['sedan'] = (categories['sedan'] || 0) + 1;
        if (path.includes('coupe')) categories['coupe'] = (categories['coupe'] || 0) + 1;
      }
    });

    const entries = Object.entries(categories);
    if (entries.length === 0) return null;

    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }
}
