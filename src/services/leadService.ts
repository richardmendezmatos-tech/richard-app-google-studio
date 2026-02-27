import { container } from '../infra/di/container';

/**
 * LeadService (Clean Entry Point)
 * Delegación pura a Use Cases y Repositorios vía DI Container.
 */
export const leadService = {
  async fetchLeads(dealerId: string) {
    try {
      const useCase = container.getGetLeadsUseCase();
      return await useCase.execute(dealerId);
    } catch (error) {
      console.error('[leadService.fetchLeads] Error:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: string) {
    try {
      await container.getLeadRepository().updateLead(id, { status: status as any });
    } catch (error) {
      console.error('[leadService.updateStatus] Error:', error);
      throw error;
    }
  },
};
