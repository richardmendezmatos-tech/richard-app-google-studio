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
        // Option 1: Trigger external webhook
        fetch('/api/webhooks/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, id: savedLead || 'synthetic_id' })
        }).catch(err => console.error('Failed to trigger Jules webhook:', err));

        // Option 2: Pure Local Autonomous Orchestration (WhatsApp Nudge)
        if (data.closureProbability && data.closureProbability >= 70) {
          import('@/features/leads/model/whatsappService').then(({ triggerSentinelNudge }) => {
            triggerSentinelNudge(savedLead || 'synthetic_id', data.firstName || 'Cliente', data.phone)
              .then(res => console.log(`[leadService] WhatsApp Nudge triggered: ${res.success}`))
              .catch(err => console.error('[leadService] WhatsApp Nudge failed', err));
          }).catch(err => console.error('Failed to load whatsappService:', err));
        }
      }

      return savedLead;
    } catch (error) {
      console.error('[leadService.saveLead] Error:', error);
      throw error;
    }
  },
};
