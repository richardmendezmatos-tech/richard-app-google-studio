import { sendTemplateMessage, sendTextMessage } from '@/shared/api/messaging/whatsappClient';
import { supabase } from '@/shared/api/supabase/supabase';
import { sentinelAI } from '@/shared/api/ai/sentinelAI';
import { conversationMemory } from '@/shared/api/ai/conversationMemory';
import { getAuditRepository } from '@/shared/api/houston/AuditRepository';

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
  execute: (agent: WhatsAppAgent, lead: LeadContext) => Promise<void>;
}

/**
 * WhatsApp Agent v3 — Smart Follow-up Orchestrator
 *
 * Uses conversation history to generate hyper-personalized follow-ups
 * instead of generic templates.
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
        const message = await agent.generateSmartFollowUp(lead, '24h');
        await sendTextMessage({ to: lead.phone, body: message });
      },
    },
    {
      label: 'value_offer_72h',
      delayMs: 72 * 60 * 60 * 1000,
      execute: async (agent, lead) => {
        const message = await agent.generateSmartFollowUp(lead, '72h');
        await sendTextMessage({ to: lead.phone, body: message });
      },
    },
  ];

  /**
   * Generates a hyper-personalized follow-up message using conversation history.
   * At 24h: check-in referencing the specific car/topic discussed.
   * At 72h: urgency + exclusive offer angle.
   */
  async generateSmartFollowUp(lead: LeadContext, stage: '24h' | '72h'): Promise<string> {
    const history = await conversationMemory.loadWhatsAppHistory(lead.phone);

    const recentContext =
      history.length > 0
        ? history
            .slice(-6)
            .map((h) => `${h.role === 'user' ? 'Cliente' : 'Richard'}: ${h.content}`)
            .join('\n')
        : '(No hay conversación previa registrada)';

    const vehicleRef = lead.vehicleInterest ? ` interesado en ${lead.vehicleInterest}` : '';

    const stagePerspective =
      stage === '24h'
        ? `OBJETIVO 24H: Retomar el contacto de manera natural. Referencia algo específico de la conversación anterior. No insistas en vender directamente — pregunta si tiene alguna duda o si necesita más información. Ofrece agendar una visita.`
        : `OBJETIVO 72H: Crear urgencia genuina. Menciona el Bono Web de $300 que vence pronto. Si discutieron un vehículo específico, di que hay interés de otros clientes en esa unidad. Invita a agendar HOY para no perder la oportunidad.`;

    const prompt = `Genera un mensaje de WhatsApp de seguimiento para ${lead.firstName}${vehicleRef}.

HISTORIAL DE CONVERSACIÓN:
${recentContext}

${stagePerspective}

REGLAS CRÍTICAS:
- Máximo 260 caracteres (WhatsApp)
- Tono: Boricua ejecutivo. Profesional, cálido, no presionador (24h) / con urgencia estratégica (72h)
- NUNCA sonar como bot o template
- Si conoces el auto específico que busca, menciónalo por nombre
- Incluye 1 emoji estratégico
- Firma: Richard`;

    try {
      const message = await sentinelAI.quickGen(
        prompt,
        'Eres Richard Méndez, Especialista de Ventas en Richard Automotive, Vega Alta PR. Escribes mensajes de WhatsApp naturales y persuasivos basados en la conversación real con el cliente.',
      );

      // Truncate to 280 chars if needed
      return message?.substring(0, 280) || this.getFallbackMessage(lead, stage);
    } catch {
      return this.getFallbackMessage(lead, stage);
    }
  }

  private getFallbackMessage(lead: LeadContext, stage: '24h' | '72h'): string {
    if (stage === '24h') {
      return `¡Hola ${lead.firstName}! 👋 Richard por aquí. ¿Pudiste revisar las opciones que te compartimos? Estoy aquí para cualquier duda. ¿Agendamos una visita? 🚗`;
    }
    return `¡${lead.firstName}! Richard de nuevo. 🏁 Tenemos el Bono Web de $300 disponible solo esta semana. Visitanos en Vega Alta y te cerramos el mejor trato. ¿Te agendo para mañana?`;
  }

  async findPersonalizedRecommendation(lead: LeadContext, unifiedScore?: number) {
    if (!lead.vehicleInterest) return null;

    try {
      const queryEmbedding = await sentinelAI.generateEmbedding(lead.vehicleInterest);
      const threshold = unifiedScore ? Math.max(0.1, 0.5 - unifiedScore / 200) : 0.4;

      const { data, error } = await supabase.rpc('match_inventory', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
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

      for (let i = 1; i < this.sequence.length; i++) {
        const futureStep = this.sequence[i];
        const scheduledAt = new Date(Date.now() + futureStep.delayMs).toISOString();
        await this.logInteraction(
          lead.id,
          lead.firstName,
          lead.phone,
          futureStep.label,
          'scheduled',
          scheduledAt,
        );
      }
    } catch (err) {
      console.error('[WhatsApp Agent] Error in sequence:', err);
      await this.logInteraction(lead.id, lead.firstName, lead.phone, 'welcome_validation', 'failed');
      const audit = await getAuditRepository();
      await audit.log('error', `WhatsApp Welcome failed for ${lead.firstName}`, {
        leadId: lead.id,
        error: err,
      });
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
        const audit = await getAuditRepository();
        await audit.log('error', `WhatsApp Step ${msg.step_label} failed for ${msg.lead_name}`, {
          msgId: msg.id,
          error: err,
        });
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

    try {
      const audit = await getAuditRepository();
      await audit.log(
        status === 'failed' ? 'error' : 'info',
        `WhatsApp ${status}: ${stepLabel} for ${leadName}`,
        { leadId, stepLabel, status, scheduledAt },
      );
    } catch {
      // non-blocking
    }
  }
}

export const whatsappAgent = new WhatsAppAgent();
