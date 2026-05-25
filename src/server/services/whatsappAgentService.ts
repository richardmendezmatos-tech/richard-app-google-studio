import { customerMemoryService } from './customerMemoryService';
import { appointmentService } from './appointmentService';
import { WhatsAppAgent } from '../application/use-cases/leads/WhatsAppAgent.usecase';
import { TwilioWhatsAppRepository } from '../infrastructure/messaging/TwilioWhatsAppRepository';
import { SupabaseLeadRepository } from '../infrastructure/repositories/SupabaseLeadRepository';

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
        await this.leadRepo.updateLead(existing.id, {
          customer_memory: {
            ...(existing.customer_memory as any || {}),
            last_seen: new Date().toISOString(),
            whatsapp_messages: ((existing.customer_memory as any)?.whatsapp_messages || 0) + messageCount,
          },
        } as any);
      } else {
        // Create new lead from WhatsApp
        await this.leadRepo.create({
          phone: cleanPhone,
          first_name: 'WhatsApp',
          last_name: 'Lead',
          status: 'new',
          source: 'whatsapp',
          customer_memory: {
            last_seen: new Date().toISOString(),
            whatsapp_messages: 1,
          },
        } as any);
        console.log(`[WhatsAppAgentService] ✅ Nuevo lead creado desde WhatsApp: ${cleanPhone}`);
      }
    } catch (err) {
      // Non-blocking — agent still replies even if lead save fails
      console.error('[WhatsAppAgentService] Error en upsert de lead:', err);
    }
  }

  async processInboundMessage(leadId: string, message: string): Promise<string> {
    const memory = await customerMemoryService.getMemory(leadId);
    const vehicleContext =
      memory?.history && memory.history.length > 0
        ? memory.history[memory.history.length - 1]
        : undefined;

    // 🔑 Upsert lead in Supabase (non-blocking)
    this.upsertLead(leadId).catch(() => {});

    const result = await this.agent.execute({
      leadId,
      message,
      customerContext: vehicleContext,
      from: 'whatsapp',
    });

    // External side-effect: Appointment Scheduling
    if (result.nextStage === 'closed' && message.toLowerCase().includes('si')) {
      await appointmentService.schedule({
        leadId,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        type: 'test-drive',
      });
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

