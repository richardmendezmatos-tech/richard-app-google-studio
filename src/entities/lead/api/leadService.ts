import { SupabaseLeadRepository } from './repositories/SupabaseLeadRepository';

const repo = new SupabaseLeadRepository();

/**
 * LeadService (Clean Entry Point)
 * Delegación directa a repositorio.
 */
export const leadService = {
  async fetchLeads(dealerId: string) {
    try {
      return await repo.getLeads(dealerId);
    } catch (error) {
      console.error('[leadService.fetchLeads] Error:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: string) {
    try {
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

      const savedLead = await repo.saveLead(data);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(sessionKey, 'locked');
      }
      // Async trigger for AI Agent Follow-up
      if (data.phone) {
        fetch('/api/webhooks/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            id: savedLead || 'synthetic_id',
            triggerNudge: !!(data.closureProbability && data.closureProbability >= 70),
          }),
        }).catch((err) => console.error('Failed to trigger webhook:', err));
      }

      return savedLead;
    } catch (error) {
      console.error('[leadService.saveLead] Error:', error);
      throw error;
    }
  },
};
