import { sendTemplateMessage, sendTextMessage } from '@/shared/api/messaging/whatsappClient';
import { supabase } from '@/shared/api/supabase/supabaseClient';
import { openaiService } from '@/shared/api/ai/openaiService';

export interface LeadContext {
  id: string;
  firstName: string;
  phone: string;
  notes: string;
  email?: string;
  vehicleInterest?: string;
}

interface SequenceStep {
  label: string;
  delayMs: number;
  // action handles the logic for this specific step
  execute: (agent: WhatsAppAgent, lead: LeadContext) => Promise<void>;
}

/**
 * WhatsApp Agent v2 — Neural Orchestrator
 * 
 * Uses the Neural Match Engine to personalize follow-ups based on lead interest.
 */
export class WhatsAppAgent {
  private sequence: SequenceStep[] = [
    {
      label: 'welcome_validation',
      delayMs: 0,
      execute: async (_, lead) => {
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
      label: 'follow_up_24h_neural',
      delayMs: 24 * 60 * 60 * 1000,
      execute: async (agent, lead) => {
        const recommendation = await agent.findPersonalizedRecommendation(lead);
        
        let message = `¡Hola ${lead.firstName}! Soy Richard. Estoy pendiente de ayudarte con tu búsqueda.`;
        
        if (recommendation) {
          message += ` Acabo de ver esta unidad que te puede interesar: *${recommendation.name}*. ${recommendation.pitch} ¿Te gustaría pasar a verla? 🚗`;
        } else {
          message += ` ¿Pudiste revisar las opciones que te compartimos? Estoy aquí para cualquier duda.`;
        }

        await sendTextMessage({ to: lead.phone, body: message });
      },
    },
    {
      label: 'value_offer_72h',
      delayMs: 72 * 60 * 60 * 1000,
      execute: async (_, lead) => {
        await sendTemplateMessage({
          to: lead.phone,
          templateName: 'richard_special_offer',
          languageCode: 'es',
          components: [
            {
              type: 'body',
              parameters: [{ type: 'text', text: lead.firstName }],
            },
          ],
        });
      },
    },
  ];

  /**
   * Finds the best match for a lead in the current inventory using the Neural Engine.
   */
  async findPersonalizedRecommendation(lead: LeadContext) {
    if (!lead.vehicleInterest) return null;

    try {
      // 1. Generate embedding for the interest
      const queryEmbedding = await openaiService.generateEmbedding(lead.vehicleInterest);

      // 2. Query Supabase RPC
      const { data, error } = await supabase.rpc('match_inventory', {
        query_embedding: queryEmbedding,
        match_threshold: 0.4,
        match_count: 1,
      });

      if (error || !data?.length) return null;

      const bestMatch = data[0];
      return {
        id: bestMatch.car_id,
        name: bestMatch.car_name,
        pitch: bestMatch.sales_pitch || 'Es una excelente unidad certificada.',
      };
    } catch (err) {
      console.error('[WhatsApp Agent] Recommendation failed:', err);
      return null;
    }
  }

  async sendWelcomeValidation(lead: LeadContext): Promise<void> {
    if (!lead.phone) return;

    try {
      const step = this.sequence[0];
      await step.execute(this, lead);
      await this.logInteraction(lead.id, lead.firstName, lead.phone, step.label, 'sent');

      // Schedule future steps
      for (let i = 1; i < this.sequence.length; i++) {
        const futureStep = this.sequence[i];
        const scheduledAt = new Date(Date.now() + futureStep.delayMs).toISOString();
        await this.logInteraction(lead.id, lead.firstName, lead.phone, futureStep.label, 'scheduled', scheduledAt);
      }
    } catch (err) {
      console.error('[WhatsApp Agent] Error in sequence:', err);
      await this.logInteraction(lead.id, lead.firstName, lead.phone, 'welcome_validation', 'failed');
    }
  }

  async processPendingMessages(): Promise<{ processed: number; failed: number }> {
    const { data: pending, error } = await supabase
      .from('message_queue')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString())
      .limit(20);

    if (error || !pending?.length) return { processed: 0, failed: 0 };

    let processed = 0;
    let failed = 0;

    for (const msg of pending) {
      try {
        const stepDef = this.sequence.find((s) => s.label === msg.step_label);
        if (!stepDef) continue;

        await stepDef.execute(this, {
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
      } catch (err) {
        console.error(`[WhatsApp Agent] Step ${msg.step_label} failed:`, err);
        await supabase.from('message_queue').update({ status: 'failed' }).eq('id', msg.id);
        failed++;
      }
    }

    return { processed, failed };
  }

  private async logInteraction(
    leadId: string,
    leadName: string,
    leadPhone: string,
    stepLabel: string,
    status: 'sent' | 'scheduled' | 'failed',
    scheduledAt?: string,
  ): Promise<void> {
    try {
      await supabase.from('message_queue').insert({
        lead_id: leadId,
        lead_name: leadName,
        lead_phone: leadPhone,
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
