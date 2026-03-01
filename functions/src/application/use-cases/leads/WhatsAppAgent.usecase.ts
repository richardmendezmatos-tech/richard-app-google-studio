import { WhatsAppRepository, WhatsAppStage } from '../../../domain/repositories';
import { WHATSAPP_AGENT_PROMPT } from './WhatsAppAgent.prompt';

export interface WhatsAppAgentInput {
  leadId: string;
  message: string;
  customerContext?: string; // e.g., from memory service
}

export interface WhatsAppAgentResult {
  reply: string;
  nextStage: WhatsAppStage;
}

/**
 * Use Case: WhatsApp Agent
 * Handles the state-based conversation logic for leads on WhatsApp.
 */
export class WhatsAppAgent {
  constructor(private whatsappRepo: WhatsAppRepository) {}

  async execute(input: WhatsAppAgentInput): Promise<WhatsAppAgentResult> {
    const { leadId, message, customerContext } = input;

    let sequence = await this.whatsappRepo.getSequence(leadId);

    if (!sequence) {
      sequence = {
        leadId,
        currentStage: 'welcome',
        lastInteraction: new Date(),
        isAutopilotEnabled: true,
        history: [],
      };
    }
    // Integrate System Prompt (Elite Standard)
    const systemPrompt = WHATSAPP_AGENT_PROMPT.replace(
      '{{customerContext}}',
      customerContext || 'Sin contexto previo',
    )
      .replace('{{history}}', JSON.stringify(sequence.history.slice(-5)))
      .replace('{{message}}', message);

    console.log(
      '[WhatsAppAgent] Operating with System Prompt:',
      systemPrompt.substring(0, 100) + '...',
    );

    // Note: In a full Genkit implementation, this would be a defineFlow call.
    // For now, we integrate the professional prompt logic into the decision tree.

    let reply = '';
    let nextStage = sequence.currentStage;
    const lowMessage = message.toLowerCase();

    // Business Rules: Transitions with Elite Tone
    if (
      lowMessage.includes('cita') ||
      lowMessage.includes('ver el car') ||
      lowMessage.includes('visita')
    ) {
      reply = `¡Excelente elección! Richard me comenta que este auto está disponible para que lo sientas en la carretera. Proteger tu movilidad es nuestra prioridad. ¿Te parece bien si agendamos para mañana a las 10:00 AM?`;
      nextStage = 'appointment_suggested';
    } else if (lowMessage.includes('si') && sequence.currentStage === 'appointment_suggested') {
      reply = `¡Perfecto! Tu tranquilidad es lo primero. Cita agendada. Richard Méndez te recibirá personalmente para asegurar que todo sea fluido y sin estrés. 📍`;
      nextStage = 'closed';
    } else if (sequence.currentStage === 'welcome') {
      const vehicleContext = customerContext || 'el auto que te brindará esa libertad que buscas';
      reply = `Hola, soy el asistente de Richard. Veo que te interesa ${vehicleContext}. En Richard Automotive nos enfocamos en la plenitud de tu movilidad. ¿Te gustaría saber cómo este auto asegura tu paz mental?`;
      nextStage = 'qualification';
    } else {
      reply = `Entiendo perfectamente. Richard está analizando los detalles para asegurarte la mejor opción financiera, enfocada en la protección de tu patrimonio. ¿Hay algún detalle adicional que facilite tu proceso?`;
      nextStage = 'nurturing';
    }

    // Update sequence
    sequence.currentStage = nextStage;
    sequence.lastInteraction = new Date();
    sequence.history.push({
      role: 'user',
      text: message,
      timestamp: new Date(),
    });
    sequence.history.push({
      role: 'bot',
      text: reply,
      timestamp: new Date(),
    });

    await this.whatsappRepo.saveSequence(sequence);

    return { reply, nextStage };
  }
}
