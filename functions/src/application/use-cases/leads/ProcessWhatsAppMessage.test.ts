import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessWhatsAppMessage } from './ProcessWhatsAppMessage.usecase';
import { ChatSession } from '../../../domain/repositories';

describe('ProcessWhatsAppMessage', () => {
    let processMessage: ProcessWhatsAppMessage;
    let mockChatRepo: any;
    let mockLeadRepo: any;
    let mockAI: any;

    beforeEach(() => {
        mockChatRepo = {
            getById: vi.fn(),
            save: vi.fn()
        };
        mockLeadRepo = {
            getById: vi.fn()
        };
        mockAI = {
            orchestrate: vi.fn(() => Promise.resolve({ response: 'Test AI Response', metadata: {} }))
        };

        processMessage = new ProcessWhatsAppMessage(mockChatRepo, mockLeadRepo, mockAI);
    });

    it('should process a message, get history, and save new session', async () => {
        const input = { from: 'whatsapp:+7870000000', body: 'Hola' };
        mockChatRepo.getById.mockResolvedValue(null);
        mockLeadRepo.getById.mockResolvedValue({ id: '7870000000', firstName: 'Richard' });

        const response = await processMessage.execute(input);

        expect(response).toBe('Test AI Response');
        expect(mockChatRepo.getById).toHaveBeenCalledWith('7870000000');
        expect(mockAI.orchestrate).toHaveBeenCalled();
        expect(mockChatRepo.save).toHaveBeenCalled();

        const savedSession = mockChatRepo.save.mock.calls[0][1] as ChatSession;
        expect(savedSession.messages.length).toBe(2);
        expect(savedSession.messages[0].content).toBe('Hola');
        expect(savedSession.messages[1].content).toBe('Test AI Response');
    });
});
