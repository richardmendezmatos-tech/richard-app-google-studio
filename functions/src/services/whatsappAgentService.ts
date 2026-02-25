import { customerMemoryService } from './customerMemoryService';
import { appointmentService } from './appointmentService';
import { WhatsAppAgent } from '../application/use-cases';
import { FirestoreWhatsAppRepository } from '../infrastructure/whatsapp/FirestoreWhatsAppRepository';

/**
 * Advanced WhatsApp Agent Service for Richard Automotive.
 * Bridge to Clean Architecture Use Case.
 */
export class WhatsAppAgentService {
    private agent: WhatsAppAgent;
    private repo: FirestoreWhatsAppRepository;

    constructor() {
        this.repo = new FirestoreWhatsAppRepository();
        this.agent = new WhatsAppAgent(this.repo);
    }

    async initializeSequence(leadId: string): Promise<void> {
        await this.repo.saveSequence({
            leadId,
            currentStage: 'welcome',
            lastInteraction: new Date(),
            isAutopilotEnabled: true,
            history: []
        });
    }

    async processInboundMessage(leadId: string, message: string): Promise<string> {
        const memory = await customerMemoryService.getMemory(leadId);
        const vehicleContext = (memory?.history && memory.history.length > 0)
            ? memory.history[memory.history.length - 1]
            : undefined;

        const result = await this.agent.execute({
            leadId,
            message,
            customerContext: vehicleContext
        });

        // External side-effect: Appointment Scheduling
        if (result.nextStage === 'closed' && message.toLowerCase().includes('si')) {
            await appointmentService.schedule({
                leadId,
                date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                type: 'test-drive'
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
