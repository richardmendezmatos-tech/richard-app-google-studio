import { createServiceClient } from '@/shared/api/supabase/factory';

export interface HandoffAlert {
  leadPhone: string;
  message: string;
  reason: string;
  channel: 'whatsapp' | 'chat';
}

export const houstonHandoffService = {
  async escalate(alert: HandoffAlert): Promise<void> {
    try {
      const supabase = createServiceClient();

      // Mark lead as hot so it surfaces at the top of the CRM queue
      await supabase
        .from('leads')
        .update({ status: 'hot' })
        .eq('phone', alert.leadPhone);

      // Create a traceable audit record so the admin dashboard can surface it
      await supabase.from('audit_logs').insert({
        action: 'human_handoff_requested',
        entity_type: 'lead',
        new_data: {
          phone: alert.leadPhone,
          reason: alert.reason,
          last_message: alert.message,
          channel: alert.channel,
          requested_at: new Date().toISOString(),
        },
      });

      console.log(`[HoustonHandoff] Escalated ${alert.channel} lead ${alert.leadPhone}: ${alert.reason}`);
    } catch (err) {
      console.error('[HoustonHandoff] Escalation error:', err);
    }
  },
};
