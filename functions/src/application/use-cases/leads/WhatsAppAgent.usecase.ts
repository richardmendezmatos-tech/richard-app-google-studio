import { WhatsAppRepository } from '../../../domain/repositories';
import { ai } from '../../../services/aiManager';
import { WHATSAPP_AGENT_PROMPT } from './WhatsAppAgent.prompt';

export interface WhatsAppAgentInput {
  leadId: string;
  message: string;
  customerContext?: any;
}

export interface WhatsAppAgentOutput {
  reply: string;
  nextStage: string;
}

export class WhatsAppAgent {
  constructor(private repo: WhatsAppRepository) {}

  async execute(input: WhatsAppAgentInput): Promise<WhatsAppAgentOutput> {
    const sequence = await this.repo.getSequence(input.leadId);
    const history = sequence?.history || [];

    // Simple prompt-based orchestration for now
    const prompt = WHATSAPP_AGENT_PROMPT.replace(
      '{{customerContext}}',
      JSON.stringify(input.customerContext || {}),
    )
      .replace('{{history}}', JSON.stringify(history))
      .replace('{{message}}', input.message);

    const { text } = await ai.generate(prompt);

    // Deterministic stage transiton (Simplified)
    let nextStage: any = sequence?.currentStage || 'welcome';
    if (
      input.message.toLowerCase().includes('cita') ||
      input.message.toLowerCase().includes('ver')
    ) {
      nextStage = 'appointment_suggested';
    }

    return {
      reply: text || 'Gracias por contactar a Richard Automotive. Estamos procesando tu solicitud.',
      nextStage,
    };
  }
}
