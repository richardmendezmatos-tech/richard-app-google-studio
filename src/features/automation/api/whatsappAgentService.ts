import { customerMemoryService } from '@/features/ai-hub/api/customerMemoryService';
import { appointmentService } from '@/features/appointments/api/appointmentService';
import { WhatsAppAgent } from '@/features/leads/api/WhatsAppAgent';
import { TwilioWhatsAppRepository } from '@/shared/api/communications/TwilioWhatsAppRepository';
import { SupabaseLeadRepository } from '@/shared/api/supabase/SupabaseLeadRepository';

/**
 * Advanced WhatsApp Agent Service for Richard Automotive.
 * Bridge to Clean Architecture Use Case.
 * Auto-creates / updates leads in Supabase on every inbound message.
 */
export class WhatsAppAgentService {
  private agent: WhatsAppAgent;
  private repo: TwilioWhatsAppRepository;
  private leadRepo: SupabaseLeadRepository;

  constructor() {
    this.repo = new TwilioWhatsAppRepository();
    this.agent = new WhatsAppAgent(this.repo);
    this.leadRepo = new SupabaseLeadRepository();
  }

  async initializeSequence(leadId: string): Promise<void> {
    await this.repo.saveSequence({
      leadId,
      currentStage: 'welcome',
      lastInteraction: new Date(),
      isAutopilotEnabled: true,
      history: [],
    });
  }

  /**
   * Upserts a lead in Supabase for the given phone number.
   * - New contacts → INSERT with source='whatsapp', status='new'
   * - Returning contacts → UPDATE last_seen & message count
   */
  private async upsertLead(phone: string, messageCount = 1): Promise<void> {
    try {
      const cleanPhone = phone.replace('whatsapp:', '').replace(/\s/g, '');
      const existing = await this.leadRepo.findByPhone(cleanPhone);

      if (existing && existing.id) {
        // Update existing lead activity
        const currentMemory = existing.customer_memory || {};
        await this.leadRepo.updateLead(existing.id, {
          customer_memory: {
            ...currentMemory,
            last_seen: new Date().toISOString(),
            whatsapp_messages: (Number(currentMemory.whatsapp_messages) || 0) + messageCount,
          },
        });
      } else {
        // Create new lead from WhatsApp
        await this.leadRepo.create({
          phone: cleanPhone,
          firstName: 'WhatsApp',
          lastName: 'Lead',
          status: 'new',
          email: `${cleanPhone}@whatsapp.com`,
          customer_memory: {
            last_seen: new Date().toISOString(),
            whatsapp_messages: 1,
          },
        });
        console.log(`[WhatsAppAgentService] ✅ Nuevo lead creado desde WhatsApp: ${cleanPhone}`);
      }
    } catch (err) {
      // Non-blocking — agent still replies even if lead save fails
      console.error('[WhatsAppAgentService] Error en upsert de lead:', err);
    }
  }

  async processInboundMessage(leadId: string, message: string): Promise<string> {
    const memory = await customerMemoryService.getMemory(leadId);

    // Build rich customer context for the agent
    const customerContext = memory
      ? {
          preferences: memory.preferences,
          vehicleHistory: memory.history,
          recentNotes: memory.notes?.slice(-3) || [],
        }
      : undefined;

    // Upsert lead in Supabase (non-blocking)
    this.upsertLead(leadId).catch(() => {});

    const result = await this.agent.execute({
      leadId,
      message,
      customerContext,
      from: 'whatsapp',
    });

    // Update customer memory with this interaction
    customerMemoryService
      .updateMemory(leadId, undefined, message.substring(0, 200), 'intent')
      .catch(() => {});

    // Appointment scheduling on explicit confirmation
    if (result.nextStage === 'closed' && message.toLowerCase().includes('si')) {
      appointmentService.schedule({
        leadId,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        type: 'test-drive',
      }).catch(() => {});
    }

    return result.reply;
  }

  async toggleAutopilot(leadId: string, enabled: boolean): Promise<void> {
    const sequence = await this.repo.getSequence(leadId);
    if (sequence) {
      sequence.isAutopilotEnabled = enabled;
      await this.repo.saveSequence(sequence);
    }
  }
}

export const whatsappAgentService = new WhatsAppAgentService();

