import { db } from '@/shared/api/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface SentinelMetric {
  type: 'trade_in_calculation' | 'sale_attempt' | 'inventory_in_take' | 'ai_persuasion_generated';
  data: any;
  operationalScore: number;
}

/**
 * Servicio raSentinel: El Vigía del Command Center.
 * Encargado de la proactividad: pasar del modelo de "pago por siniestro" al de "prevención de incidentes".
 */
export class RaSentinelService {
  private readonly metricsCollection = 'raSentinel_metrics';

  async reportActivity(metric: SentinelMetric): Promise<void> {
    try {
      await addDoc(collection(db, this.metricsCollection), {
        ...metric,
        timestamp: serverTimestamp(),
      });
      console.log(
        `[Sentinel] Actividad registrada: ${metric.type} | Score: ${metric.operationalScore}`,
      );
    } catch (error) {
      console.error('[Sentinel] Error al persistir reporte:', error);
    }
  }

  calculateOperationalScore(type: string, data: any): number {
    // Lógica base para el Índice de Felicidad Funcional (IFF)
    // Enfocada en proactividad y paz mental
    let score = 100;

    if (type === 'trade_in_calculation') {
      if (data.montoAFinanciar > 50000) score -= 10;
      if (data.creditScore < 600) score -= 20;
    }

    return Math.max(0, score);
  }
}

export const raSentinel = new RaSentinelService();
