import { Lead, PredictiveInsight } from '@/entities/lead';

export interface HealthStatus {
  isHealthy: boolean;
  needsHealing: boolean;
  score: number;
  reason?: string;
  lastUpdate: number;
}

export class LeadHealthSensor {
  private static HEALING_THRESHOLD = 85;
  private static ABANDONMENT_TIMEOUT = 120000; // 120s

  static check(lead: Lead, insight: PredictiveInsight): HealthStatus {
    const now = Date.now();
    const leadScore = insight.score;
    
    // 1. Detección de anomalías de alta intención
    const needsHealing = leadScore >= this.HEALING_THRESHOLD && lead.status === 'new';

    return {
      isHealthy: !needsHealing,
      needsHealing,
      score: leadScore,
      reason: needsHealing ? 'Alta intención detectada con riesgo de abandono' : 'Estado óptimo',
      lastUpdate: now
    };
  }

  /**
   * Persistencia de Emergencia (Auto-healing Level 13)
   * Si la infraestructura principal falla, el sensor orquesta el guardado local.
   */
  static async emergencySave(lead: Lead): Promise<void> {
    console.warn('⚠️ Sentinel: Iniciando guardado de emergencia local para Lead', lead.id);
    try {
      const pendingLeads = JSON.parse(localStorage.getItem('sentinel_pending_leads') || '[]');
      pendingLeads.push({
        ...lead,
        _emergencyTimestamp: Date.now(),
        _metadata: { source: 'auto-healing-sensor', version: '3.2' }
      });
      localStorage.setItem('sentinel_pending_leads', JSON.stringify(pendingLeads));
      console.log('✅ Sentinel: Lead resguardado en LocalStorage.');
    } catch (error) {
      console.error('❌ Sentinel Critical: Fallo en el sensor de emergencia.', error);
    }
  }

  /**
   * Detecta si un lead de alto valor ha sido "perdido" en el formulario
   */
  static isAbandoned(lead: Lead, lastInteraction: number): boolean {
    const elapsed = Date.now() - lastInteraction;
    return elapsed > this.ABANDONMENT_TIMEOUT && lead.status === 'new';
  }
}
