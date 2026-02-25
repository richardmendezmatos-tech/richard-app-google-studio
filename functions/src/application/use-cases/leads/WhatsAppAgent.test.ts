import { describe, it, expect, beforeEach } from 'vitest';
import { WhatsAppAgent } from './WhatsAppAgent.usecase';
import { WhatsAppRepository, WhatsAppSequence } from '../../../domain/repositories';

class MockWhatsAppRepository implements WhatsAppRepository {
    private sequences: Record<string, WhatsAppSequence> = {};

    async getSequence(leadId: string): Promise<WhatsAppSequence | null> {
        return this.sequences[leadId] || null;
    }

    async saveSequence(sequence: WhatsAppSequence): Promise<void> {
        this.sequences[sequence.leadId] = sequence;
    }

    async updateStage(leadId: string, stage: any): Promise<void> {
        if (this.sequences[leadId]) {
            this.sequences[leadId].currentStage = stage;
        }
    }

    async sendMessage(to: string, message: string): Promise<boolean> {
        return true;
    }
}

describe('WhatsAppAgent', () => {
    let repo: MockWhatsAppRepository;
    let agent: WhatsAppAgent;

    beforeEach(() => {
        repo = new MockWhatsAppRepository();
        agent = new WhatsAppAgent(repo);
    });

    it('should initialize a new sequence and transition to qualification on first message', async () => {
        const leadId = 'lead-123';
        const result = await agent.execute({ leadId, message: 'Hola' });

        expect(result.nextStage).toBe('qualification');
        expect(result.reply).toContain('Hola, soy el asistente de Richard');

        const sequence = await repo.getSequence(leadId);
        expect(sequence?.currentStage).toBe('qualification');
        expect(sequence?.history.length).toBe(2);
    });

    it('should transition to appointment_suggested when user mentions "cita"', async () => {
        const leadId = 'lead-123';
        const result = await agent.execute({ leadId, message: 'Quiero una cita' });

        expect(result.nextStage).toBe('appointment_suggested');
        expect(result.reply).toContain('prueba de manejo');
    });

    it('should transition to closed when user says "si" after appointment suggestion', async () => {
        const leadId = 'lead-123';
        // Mock existing sequence at appointment_suggested stage
        await repo.saveSequence({
            leadId,
            currentStage: 'appointment_suggested',
            lastInteraction: new Date(),
            isAutopilotEnabled: true,
            history: []
        });

        const result = await agent.execute({ leadId, message: 'Si, me parece bien' });

        expect(result.nextStage).toBe('closed');
        expect(result.reply).toContain('agendada');
    });
});
