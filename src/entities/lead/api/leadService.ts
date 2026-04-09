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
      const savedLead = await DI.getLeadRepository().saveLead(data);
      
      // Async trigger for AI Agent Follow-up (Jules WhatsApp Webhook)
      if (data.phone) {
        fetch('/api/webhooks/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, id: savedLead?.id || 'synthetic_id' })
        }).catch(err => console.error('Failed to trigger Jules webhook:', err));
      }

      return savedLead;
    } catch (error) {
      console.error('[leadService.saveLead] Error:', error);
      throw error;
    }
  },
};
