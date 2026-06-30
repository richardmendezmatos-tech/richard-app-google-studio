import type { Car } from '@/entities/inventory';
import { createClient } from '@/shared/api/supabase/client';

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
    if ((car.mileage === undefined || car.mileage === null) && car.condition !== 'new')
      missing.push('Millaje');

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Obtiene el estado de distribución de una unidad específica.
   */
  async getStatus(unitId: string): Promise<DistributionStatus[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('distribution_logs')
      .select('car_id, platform, status, last_sync, external_url, error_msg')
      .eq('car_id', unitId)
      .limit(100);

    if (error || !data) {
      console.error(`[DistributionAgent] Error fetching status for ${unitId}:`, error);
      return [
        { unitId, platform: 'facebook_marketplace', status: 'none' },
        { unitId, platform: 'clasificados_online', status: 'none' },
      ];
    }

    return data.map((log: any) => ({
      unitId: log.car_id,
      platform: log.platform as Platform,
      status: log.status,
      lastSync: log.last_sync,
      externalUrl: log.external_url,
      errorMsg: log.error_msg,
    }));
  }

  /**
   * Dispara la sincronización forzada de una unidad.
   */
  async triggerSync(car: Car, platform: Platform): Promise<boolean> {
    const validation = this.validateUnit(car);
    if (!validation.valid) {
      console.error(
        `[Distribution] Unidad ${car.id} no válida para ${platform}:`,
        validation.missing,
      );
      return false;
    }

    const supabase = createClient();
    if (!supabase) return false;

    console.log(`[Distribution] Sincronizando ${car.make} ${car.model} con ${platform}...`);

    // 1. Registrar inicio de sincronización
    const carId = car.id || car.vin;
    await supabase.from('distribution_logs').upsert(
      {
        car_id: carId,
        platform,
        status: 'pending',
        last_sync: new Date().toISOString(),
      },
      { onConflict: 'car_id,platform' },
    );

    // 2. Ejecutar lógica de plataforma
    try {
      if (platform === 'facebook_marketplace') {
        // En Meta, el feed es pasivo, pero marcamos como activo si pasó validación
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await supabase
          .from('distribution_logs')
          .update({
            status: 'active',
            last_sync: new Date().toISOString(),
          })
          .match({ car_id: carId, platform });

        return true;
      }

      if (platform === 'clasificados_online') {
        const { DistributionMapper } = await import('@/features/automation/lib/DistributionMapper');
        const { clasificadosOnlineAdapter } =
          await import('@/features/automation/lib/ClasificadosOnlineAdapter');

        const mappedData = DistributionMapper.toClasificadosOnline(car);
        const result = await clasificadosOnlineAdapter.postListing(mappedData);

        if (result.success) {
          await supabase
            .from('distribution_logs')
            .update({
              status: 'active',
              external_url: result.externalId
                ? `https://www.clasificadosonline.com/UDAutoDetail.asp?AutoId=${result.externalId}`
                : undefined,
              last_sync: new Date().toISOString(),
            })
            .match({ car_id: carId, platform });
          return true;
        } else {
          throw new Error(result.error || 'Error desconocido en ClasificadosOnline');
        }
      }

      return false;
    } catch (err: any) {
      console.error(`[DistributionAgent] Fallo en ${platform}:`, err.message);
      await supabase
        .from('distribution_logs')
        .update({
          status: 'error',
          error_msg: err.message,
          last_sync: new Date().toISOString(),
        })
        .match({ car_id: carId, platform });
      return false;
    }
  }
}

export const distributionAgent = new DistributionAgent();
