import { CognitiveProfile } from '@/shared/lib/persuasion/customerMemory';

/**
 * NeuroScoringService (Nivel 16)
 * Calibra las probabilidades de cierre basándose en sesgos cognitivos y perfiles psicológicos.
 */
export class NeuroScoringService {
  /**
   * Ajusta la probabilidad de cierre según el perfil del cliente.
   * @param baseScore El score promedio de IA de los leads.
   * @param profile El perfil cognitivo detectado por la memoria de persuasión.
   */
  static calculateCalibratedProbability(baseScore: number, profile: CognitiveProfile): number {
    let multiplier: number;

    switch (profile) {
      case 'analytical':
        // Los analíticos tardan más en decidir (ciclo largo)
        multiplier = 0.85;
        break;
      case 'impulsive':
        // Los impulsivos tienen mayor probabilidad de cierre inmediato ante ofertas
        multiplier = 1.2;
        break;
      case 'conservative':
        // Los conservadores requieren más validación de seguridad
        multiplier = 0.95;
        break;
      case 'neutral':
      default:
        multiplier = 1.0;
        break;
    }

    const calibrated = baseScore * multiplier;
    
    // Cap at 100%
    return Math.min(100, parseFloat(calibrated.toFixed(2)));
  }

  /**
   * Determina el estatus de salud de la métrica basado en el perfil.
   */
  static getStatus(probability: number): 'healthy' | 'warning' | 'critical' {
    if (probability > 75) return 'healthy';
    if (probability > 45) return 'warning';
    return 'critical';
  }
}
