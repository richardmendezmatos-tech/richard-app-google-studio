import { raSentinel } from '../monitoring/raSentinelService';

export type ABVariant = 'control' | 'variant_a' | 'variant_b';

interface ABConfig {
  experimentId: string;
  variants: ABVariant[];
  trafficAllocation: number; // 0 to 1
}

/**
 * AdaptiveABService: Motor de Optimización Dinámica (Nivel 14).
 * Permite la ejecución de experimentos autónomos para maximizar la conversión en Richard Automotive.
 */
export class AdaptiveABService {
  private activeExperiments: Map<string, ABConfig> = new Map();

  /**
   * Registra un nuevo experimento en el sistema.
   */
  registerExperiment(config: ABConfig) {
    this.activeExperiments.set(config.experimentId, config);
  }

  /**
   * Asigna una variante al usuario basada en su persistencia (Local Storage).
   */
  getVariant(experimentId: string): ABVariant {
    const config = this.activeExperiments.get(experimentId);
    if (!config) return 'control';

    const storageKey = `ra_ab_${experimentId}`;
    const savedVariant = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;

    if (savedVariant) return savedVariant as ABVariant;

    // Asignación determinista o aleatoria
    const variant = this.assignNewVariant(config);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, variant);
      
      // Notificar a Sentinel sobre la asignación para telemetría
      raSentinel.reportActivity({
        type: 'ai_persuasion_generated', // Usamos este tipo para indicar influencia de la IA
        data: { experimentId, variant },
        operationalScore: 100
      });
    }

    return variant;
  }

  private assignNewVariant(config: ABConfig): ABVariant {
    const random = Math.random();
    if (random > config.trafficAllocation) return 'control';

    const variantIndex = Math.floor(Math.random() * config.variants.length);
    return config.variants[variantIndex];
  }

  /**
   * Reporta el éxito (conversión) de una variante.
   */
  trackConversion(experimentId: string, value: number) {
    const variant = typeof window !== 'undefined' ? localStorage.getItem(`ra_ab_${experimentId}`) : 'unknown';
    
    raSentinel.reportActivity({
      type: 'sale_attempt',
      data: { experimentId, variant, value, success: true },
      operationalScore: 100
    });
  }
}

export const adaptiveAB = new AdaptiveABService();
