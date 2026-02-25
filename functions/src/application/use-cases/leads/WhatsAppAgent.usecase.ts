import { WhatsAppRepository, WhatsAppStage } from '../../../domain/repositories';

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
    constructor(private whatsappRepo: WhatsAppRepository) { }

    async execute(input: WhatsAppAgentInput): Promise<WhatsAppAgentResult> {
        const { leadId, message, customerContext } = input;

        let sequence = await this.whatsappRepo.getSequence(leadId);

        if (!sequence) {
            sequence = {
                leadId,
                currentStage: 'welcome',
                lastInteraction: new Date(),
                isAutopilotEnabled: true,
                history: []
            };
        }

        // Decision logic
        let reply = "";
        let nextStage = sequence.currentStage;
        const lowMessage = message.toLowerCase();

        // Business Rules: Transitions
        if (lowMessage.includes('cita') || lowMessage.includes('ver el car') || lowMessage.includes('visita')) {
            reply = `¡Excelente elección! Richard me comenta que este auto está disponible para prueba de manejo. ¿Te parece bien si agendamos para mañana a las 10:00 AM?`;
            nextStage = 'appointment_suggested';
        } else if (lowMessage.includes('si') && sequence.currentStage === 'appointment_suggested') {
            reply = `¡Perfecto! Tu cita ha sido agendada. Richard Méndez te estará esperando en el dealer. Te enviaré la ubicación por aquí mismo. 📍`;
            nextStage = 'closed';
            // Note: External service scheduling (AppointmentService) should be handled by the caller or a separate domain event
        } else if (sequence.currentStage === 'welcome') {
            const vehicleContext = customerContext || 'el auto de tu interés';
            reply = `Hola, soy el asistente de Richard. Veo que estuviste mirando ${vehicleContext}. ¿Tienes alguna duda sobre el financiamiento o te gustaría agendar una prueba de manejo?`;
            nextStage = 'qualification';
        } else {
            reply = `Entiendo. Richard está revisando los detalles de tu caso ahora mismo. ¿Hay algo más que deba saber para ayudarte mejor con el financiamiento?`;
            nextStage = 'nurturing';
        }

        // Update sequence
        sequence.currentStage = nextStage;
        sequence.lastInteraction = new Date();
        sequence.history.push({
            role: 'user',
            text: message,
            timestamp: new Date()
        });
        sequence.history.push({
            role: 'bot',
            text: reply,
            timestamp: new Date()
        });

        await this.whatsappRepo.saveSequence(sequence);

        return { reply, nextStage };
    }
}
