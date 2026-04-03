/**
 * Richard Automotive Sentinel: Rehydration Service (Level 13 Persistence)
 * Propósito: Sincronización automática de leads de emergencia.
 */

import { Lead } from '@/entities/lead';

export interface Rehydratable {
  saveLead: (lead: Partial<Lead>) => Promise<string>;
}

export class RehydrationService {
  private static STORAGE_KEY = 'sentinel_pending_leads';
  private isRehydrating = false;

  constructor(private repository: Rehydratable) {}

  /**
   * Intenta sincronizar los leads pendientes.
   */
  async synchronize(): Promise<void> {
    if (this.isRehydrating) return;
    
    const pendingData = localStorage.getItem(RehydrationService.STORAGE_KEY);
    if (!pendingData) return;

    const leads: (Lead & { _emergencyTimestamp?: number })[] = JSON.parse(pendingData);
    if (leads.length === 0) return;

    this.isRehydrating = true;
    console.log(`[Sentinel:Rehydration] Iniciando sincronización de ${leads.length} leads...`);

    const remainingLeads: any[] = [];

    for (const lead of leads) {
      try {
        // Limpiamos metadata de emergencia antes de re-intentar
        const { _emergencyTimestamp, _metadata, id, ...cleanLead } = lead as any;
        
        await this.repository.saveLead(cleanLead);
        console.log(`[Sentinel:Rehydration] Lead ${id} sincronizado con éxito.`);
      } catch (error) {
        console.warn(`[Sentinel:Rehydration] Fallo al sincronizar lead ${lead.id}. Se mantendrá en cola.`, error);
        remainingLeads.push(lead);
      }
    }

    // Actualizamos el storage con lo que no se pudo sincronizar
    if (remainingLeads.length > 0) {
      localStorage.setItem(RehydrationService.STORAGE_KEY, JSON.stringify(remainingLeads));
    } else {
      localStorage.removeItem(RehydrationService.STORAGE_KEY);
      console.log('[Sentinel:Rehydration] Todos los leads han sido sincronizados.');
    }

    this.isRehydrating = false;
  }

  /**
   * Inicia el proceso de monitoreo de recuperación (Pooling).
   */
  start(intervalMs: number = 60000): void {
    setInterval(() => this.synchronize(), intervalMs);
    // Ejecución inmediata al iniciar
    this.synchronize();
  }
}
