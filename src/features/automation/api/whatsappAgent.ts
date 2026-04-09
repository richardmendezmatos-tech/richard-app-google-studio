import { sendTemplateMessage, sendTextMessage } from '@/shared/api/messaging/whatsappClient';
import { supabase } from '@/shared/api/supabase/supabaseClient';

export interface LeadContext {
  id: string;
  firstName: string;
  phone: string;
  notes: string;
  email?: string;
  vehicleInterest?: string;
}

interface SequenceStep {
  delayMs: number;
  action: (lead: LeadContext) => Promise<void>;
  label: string;
}

/**
 * WhatsApp Agent v2 — Production Orchestrator
 * 
 * Manages a multi-touch lead nurturing sequence via WhatsApp Cloud API.
 * Each step is logged to Supabase for traceability (Protocolo Sentinel).
 */
export class WhatsAppAgent {
  private sequence: SequenceStep[] = [
    {
      label: 'welcome_validation',
      delayMs: 0,
      action: async (lead) => {
        await sendTemplateMessage({
          to: lead.phone,
          templateName: 'richard_welcome',
          languageCode: 'es',
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: lead.firstName },
                { type: 'text', text: lead.vehicleInterest || 'el vehículo de tu interés' },
              ],
            },
          ],
        });
      },
    },
    {
      label: 'follow_up_24h',
      delayMs: 24 * 60 * 60 * 1000, // 24 hours
      action: async (lead) => {
        await sendTextMessage({
          to: lead.phone,
          body: `¡Hola ${lead.firstName}! Soy Richard de Richard Automotive. ¿Pudiste revisar las opciones que te compartimos? Estoy aquí para ayudarte a encontrar el vehículo perfecto para ti. 🚗`,
        });
      },
    },
    {
      label: 'value_offer_72h',
      delayMs: 72 * 60 * 60 * 1000, // 72 hours
      action: async (lead) => {
        await sendTemplateMessage({
          to: lead.phone,
          templateName: 'richard_special_offer',
          languageCode: 'es',
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: lead.firstName },
              ],
            },
          ],
        });
      },
    },
  ];

  /**
   * Triggers the initial welcome message and schedules follow-ups.
   */
  async sendWelcomeValidation(lead: LeadContext): Promise<void> {
    if (!lead.phone) {
      console.warn('[WhatsApp Agent] Skipped: No phone for lead', lead.id);
      return;
    }

    try {
      // Execute immediate welcome
      const step = this.sequence[0];
      await step.action(lead);

      // Log to Supabase for traceability
      await this.logInteraction(lead.id, step.label, 'sent');

      // Schedule future steps (in production, use a job queue like Inngest/Trigger.dev)
      // For now, we log the scheduled steps so a cron can pick them up.
      for (let i = 1; i < this.sequence.length; i++) {
        const futureStep = this.sequence[i];
        const scheduledAt = new Date(Date.now() + futureStep.delayMs).toISOString();

        await this.logInteraction(lead.id, futureStep.label, 'scheduled', scheduledAt);
      }

      console.log(`[WhatsApp Agent] Welcome sent to ${lead.phone}. ${this.sequence.length - 1} follow-ups scheduled.`);
    } catch (err) {
      console.error('[WhatsApp Agent] Error in sequence:', err);
      await this.logInteraction(lead.id, 'welcome_validation', 'failed');
    }
  }

  /**
   * Executes any pending scheduled messages (called by cron or Vercel Cron Job).
   */
  async processPendingMessages(): Promise<{ processed: number; failed: number }> {
    const { data: pending, error } = await supabase
      .from('message_queue')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString())
      .limit(50);

    if (error || !pending?.length) {
      return { processed: 0, failed: 0 };
    }

    let processed = 0;
    let failed = 0;

    for (const msg of pending) {
      try {
        const stepDef = this.sequence.find((s) => s.label === msg.step_label);
        if (!stepDef) continue;

        await stepDef.action({
          id: msg.lead_id,
          firstName: msg.lead_name,
          phone: msg.lead_phone,
          notes: '',
        });

        await supabase
          .from('message_queue')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', msg.id);

        processed++;
      } catch {
        await supabase
          .from('message_queue')
          .update({ status: 'failed' })
          .eq('id', msg.id);
        failed++;
      }
    }

    return { processed, failed };
  }

  private async logInteraction(
    leadId: string,
    stepLabel: string,
    status: 'sent' | 'scheduled' | 'failed',
    scheduledAt?: string,
  ): Promise<void> {
    try {
      await supabase.from('message_queue').insert({
        lead_id: leadId,
        step_label: stepLabel,
        status,
        scheduled_at: scheduledAt || new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[WhatsApp Agent] Failed to log interaction:', err);
    }
  }
}

export const whatsappAgent = new WhatsAppAgent();
