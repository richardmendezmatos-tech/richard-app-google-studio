import { db } from '@/shared/api/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface SentinelMetric {
  type: 'trade_in_calculation' | 'sale_attempt' | 'inventory_in_take' | 'ai_persuasion_generated';
  data: any;
  operationalScore: number;
}

/**
 * Servicio raSentinel: El Vigía del Richard Automotive Command Center.
 * Encargado de la proactividad: pasar del modelo de "pago por siniestro" al de "prevención de incidentes operativos".
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
        `[Sentinel] Actividad registrada: ${metric.type} | Business Health Score: ${metric.operationalScore}`,
      );
    } catch (error) {
      console.error('[Sentinel] Error al persistir reporte:', error);
    }
  }

  /**
   * Calcula el Business Health Score (BHS) basado en el Protocolo RA.
   * Ponderación: Credit (40%), Equidad (30%), Capacidad (30%).
   */
  calculateBusinessHealthScore(type: string, data: any): number {
    let score = 100;

    if (type === 'trade_in_calculation') {
      // Penalidad por riesgo de financiamiento alto (LTV)
      if (data.montoAFinanciar > 60000) score -= 15;
      else if (data.montoAFinanciar > 45000) score -= 5;

      // Penalidad por Credit Score bajo (Stochastic Risk)
      if (data.creditScore < 580) score -= 25;
      else if (data.creditScore < 640) score -= 10;

      // Penalidad por Equidad Negativa Crítica
      const equidad = data.valorTradeIn - data.pagoDeudaTradeIn;
      if (equidad < -5000) score -= 15;
    }

    return Math.max(0, score);
  }
}

export const raSentinel = new RaSentinelService();
