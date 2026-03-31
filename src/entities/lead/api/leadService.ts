import { DI } from '@/app/di/registry';

/**
 * LeadService (Clean Entry Point)
 * Delegación pura a Use Cases y Repositorios vía DI Container.
 */
export const leadService = {
  async fetchLeads(dealerId: string) {
    try {
      const useCase = DI.getLeadsUseCase();
      return await useCase.execute(dealerId);
    } catch (error) {
      console.error('[leadService.fetchLeads] Error:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: string) {
    try {
      await DI.getLeadRepository().updateLead(id, { status: status as any });
    } catch (error) {
      console.error('[leadService.updateStatus] Error:', error);
      throw error;
    }
  },

  async saveLead(data: any) {
    try {
      return await DI.getLeadRepository().saveLead(data);
    } catch (error) {
      console.error('[leadService.saveLead] Error:', error);
      throw error;
    }
  },
};
