import { Car } from '@/entities/inventory';

export type Platform = 'facebook_marketplace' | 'clasificados_online' | 'instagram';

export interface DistributionStatus {
  unitId: string;
  platform: Platform;
  status: 'active' | 'pending' | 'error' | 'none';
  lastSync?: string;
  externalUrl?: string;
  errorMsg?: string;
}

/**
 * Sentinel Distribution Agent v2.0
 * Encargado de la soberanía de inventario en canales externos.
 */
export class DistributionAgent {
  /**
   * Valida si una unidad cumple con los requisitos mínimos de calidad para ser publicada.
   */
  validateUnit(car: Car): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    if (!car.price || car.price <= 0) missing.push('Precio');
    if (!car.image) missing.push('Imagen Principal');
    if (!car.mileage && car.condition !== 'new') missing.push('Millaje');
    
    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Obtiene el estado de distribución de una unidad específica.
   * Por ahora simula la respuesta basándose en el estado de la unidad.
   */
  async getStatus(unitId: string): Promise<DistributionStatus[]> {
    // WIP: En el futuro esto consultará la tabla 'distribution_logs'
    return [
      { unitId, platform: 'facebook_marketplace', status: 'active', lastSync: new Date().toISOString() },
      { unitId, platform: 'clasificados_online', status: 'pending' },
    ];
  }

  /**
   * Dispara la sincronización forzada de una unidad.
   */
  async triggerSync(car: Car, platform: Platform): Promise<boolean> {
    const validation = this.validateUnit(car);
    if (!validation.valid) {
      console.error(`[Distribution] Unidad ${car.id} no válida para ${platform}:`, validation.missing);
      return false;
    }

    console.log(`[Distribution] Sincronizando ${car.make} ${car.model} con ${platform}...`);
    // Aquí se llamaría a las funciones específicas de cada plataforma
    return true;
  }
}

export const distributionAgent = new DistributionAgent();
