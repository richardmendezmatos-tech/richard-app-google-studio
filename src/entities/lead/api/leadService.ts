import { DI } from '@/app/(dashboard)/di/registry';

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
      const repo = await DI.getLeadRepository();
      await repo.updateLead(id, { status: status as any });
    } catch (error) {
      console.error('[leadService.updateStatus] Error:', error);
      throw error;
    }
  },

  async saveLead(data: any) {
    try {
      // Sentinel N20: Anti-Duplicate Protection
      const sessionKey = `lead_lock_${data.phone}`;
      if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) {
        console.warn('[leadService] Duplicate submission blocked for:', data.phone);
        return { success: false, error: 'duplicate_submission' };
      }

      const repo = await DI.getLeadRepository();
      const savedLead = await repo.saveLead(data);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(sessionKey, 'locked');
      }
      // Async trigger for AI Agent Follow-up (Jules WhatsApp Webhook)
      if (data.phone) {
        // Option 1: Trigger external webhook
        fetch('/api/webhooks/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, id: savedLead || 'synthetic_id' }),
        }).catch((err) => console.error('Failed to trigger Jules webhook:', err));

        // Option 2: Pure Local Autonomous Orchestration (WhatsApp Nudge)
        if (data.closureProbability && data.closureProbability >= 70) {
          import('@/features/leads/model/whatsappService')
            .then(({ triggerSentinelNudge }) => {
              triggerSentinelNudge(
                savedLead || 'synthetic_id',
                data.firstName || 'Cliente',
                data.phone,
              )
                .then((res) =>
                  console.log(`[leadService] WhatsApp Nudge triggered: ${res.success}`),
                )
                .catch((err) => console.error('[leadService] WhatsApp Nudge failed', err));
            })
            .catch((err) => console.error('Failed to load whatsappService:', err));
        }
      }

      return savedLead;
    } catch (error) {
      console.error('[leadService.saveLead] Error:', error);
      throw error;
    }
  },
};
