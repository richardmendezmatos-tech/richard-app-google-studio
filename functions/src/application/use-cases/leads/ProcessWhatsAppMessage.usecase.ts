import { ChatRepository, ChatSession, ChatMessage } from '../../../domain/repositories';
import { AgentOrchestrator } from '../../../domain/repositories';
import { LeadRepository } from '../../../domain/repositories';
import { InventoryRepository } from '../../../domain/repositories';

export interface WhatsAppMessageInput {
    from: string;
    body: string;
    vehicleId?: string;
}

export class ProcessWhatsAppMessage {
    constructor(
        private chatRepo: ChatRepository,
        private leadRepo: LeadRepository,
        private aiOrchestrator: AgentOrchestrator,
        private inventoryRepo?: InventoryRepository
    ) { }

    async execute(input: WhatsAppMessageInput): Promise<string> {
        const chatId = input.from.replace(/\D/g, '');

        // 1. Get Session & Lead Context
        const [session, lead] = await Promise.all([
            this.chatRepo.getById(chatId),
            this.leadRepo.getById(chatId)
        ]);

        const history = session?.messages || [];

        // 2. Get Vehicle Context
        let vehicleContext = null;
        if (input.vehicleId && this.inventoryRepo) {
            vehicleContext = await this.inventoryRepo.getById(input.vehicleId);
        }

        // 3. Orchestrate AI Response
        const aiResult = await this.aiOrchestrator.orchestrate({
            message: input.body,
            history: history,
            leadContext: lead || {},
            vehicleContext: vehicleContext,
            leadId: chatId
        });

        // 4. Update History
        const newMessage: ChatMessage = {
            role: 'user',
            content: input.body,
            timestamp: new Date()
        };

        const replyMessage: ChatMessage = {
            role: 'model',
            content: aiResult.response,
            timestamp: new Date()
        };

        const updatedSession: ChatSession = {
            phone: input.from,
            lastUpdated: new Date(),
            messages: [...history, newMessage, replyMessage].slice(-10) // Keep window
        };

        // 5. Persist
        await this.chatRepo.save(chatId, updatedSession);

        return aiResult.response;
    }
}
