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
    private inventoryRepo?: InventoryRepository,
  ) {}

  async execute(input: WhatsAppMessageInput): Promise<string> {
    const chatId = input.from.replace(/\D/g, '');

    // 1. Get Session & Lead Context
    const [session, lead] = await Promise.all([
      this.chatRepo.getById(chatId),
      this.leadRepo.getById(chatId),
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
      leadId: chatId,
      isWhatsApp: true,
    });

    const { intent, sentiment, buyerStage, negotiationStrategy } = aiResult.metadata || {};

    // 4. Extract and Save Lead Intelligence
    const isHotIntent = ['purchase_ready', 'financing', 'test_drive', 'trade_in'].includes(intent);
    
    if (lead) {
      const updatedLead = {
        ...lead,
        status: isHotIntent ? 'Qualified' : (lead.status || 'new'),
        aiAnalysis: {
          ...(lead.aiAnalysis || {}),
          score: lead.aiAnalysis?.score || (isHotIntent ? 85 : 50),
          intent,
          sentiment,
          buyerStage,
          negotiationStrategy,
        }
      } as any;
      await this.leadRepo.updateLead(chatId, updatedLead);
      
      if (isHotIntent) {
        import('../../../services/hubspotService').then(({ hubspotService }) => {
          hubspotService.syncLeadToHubSpot(updatedLead).catch((e: any) => console.error('HubSpot Sync error', e));
        });
      }
    } else if (isHotIntent) {
      // If no lead exists but the intent is hot, we create it dynamically for HubSpot sync
      const newLead: any = {
        firstName: 'WhatsApp',
        lastName: 'Lead',
        phone: input.from,
        status: 'Qualified',
        timestamp: new Date(),
        aiAnalysis: {
          intent: intent,
          score: 85,
        } 
      };
      // We trigger the sync without awaiting so it doesn't block the WhatsApp reply
      import('../../../services/hubspotService').then(({ hubspotService }) => {
        hubspotService.syncLeadToHubSpot(newLead).catch((e: any) => console.error('HubSpot Sync error', e));
      });
    }

    // 5. Update History
    const newMessage: ChatMessage = {
      role: 'user',
      content: input.body,
      timestamp: new Date(),
    };

    const replyMessage: ChatMessage = {
      role: 'model',
      content: aiResult.response,
      timestamp: new Date(),
    };

    const updatedSession: ChatSession = {
      phone: input.from,
      lastUpdated: new Date(),
      messages: [...history, newMessage, replyMessage].slice(-10), // Keep window
    };

    // 5. Persist
    await this.chatRepo.save(chatId, updatedSession);

    return aiResult.response;
  }
}
