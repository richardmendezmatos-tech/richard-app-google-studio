import * as admin from 'firebase-admin';
import { customerMemoryService } from './customerMemoryService';
import { appointmentService } from './appointmentService';

export interface WhatsAppSequence {
    leadId: string;
    currentStage: 'welcome' | 'qualification' | 'nurturing' | 'appointment_suggested' | 'closed';
    lastInteraction: admin.firestore.Timestamp;
    isAutopilotEnabled: boolean;
    history: { role: 'user' | 'bot', text: string, timestamp: admin.firestore.Timestamp }[];
    notes?: string;
}

/**
 * Advanced WhatsApp Agent Service for Richard Automotive.
 * Handles state-based nurturing and simulated Autopilot logic.
 */
export class WhatsAppAgentService {
    private db = admin.firestore();
    private collection = 'whatsapp_sequences';

    async initializeSequence(leadId: string): Promise<void> {
        const doc: WhatsAppSequence = {
            leadId,
            currentStage: 'welcome',
            lastInteraction: admin.firestore.Timestamp.now(),
            isAutopilotEnabled: true,
            history: []
        };
        await this.db.collection(this.collection).doc(leadId).set(doc);
    }

    async processInboundMessage(leadId: string, message: string): Promise<string> {
        const docRef = this.db.collection(this.collection).doc(leadId);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            await this.initializeSequence(leadId);
        }

        const data = (await docRef.get()).data() as WhatsAppSequence;
        const memory = await customerMemoryService.getMemory(leadId);

        // Update interaction history
        const updatedHistory = [...(data.history || []), {
            role: 'user' as const,
            text: message,
            timestamp: admin.firestore.Timestamp.now()
        }];

        // Decision Logic based on stage and memory
        let reply = "";
        let nextStage = data.currentStage;

        const lowMessage = message.toLowerCase();

        if (lowMessage.includes('cita') || lowMessage.includes('ver el car') || lowMessage.includes('visita')) {
            reply = `¡Excelente elección! Richard me comenta que este auto está disponible para prueba de manejo. ¿Te parece bien si agendamos para mañana a las 10:00 AM?`;
            nextStage = 'appointment_suggested';
        } else if (lowMessage.includes('si') && data.currentStage === 'appointment_suggested') {
            await appointmentService.schedule({
                leadId,
                date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                type: 'test-drive'
            });
            reply = `¡Perfecto! Tu cita ha sido agendada. Richard Méndez te estará esperando en el dealer. Te enviaré la ubicación por aquí mismo. 📍`;
            nextStage = 'closed';
        } else if (data.currentStage === 'welcome') {
            const vehicleContext = (memory?.history && memory.history.length > 0) ? memory.history[memory.history.length - 1] : 'el auto de tu interés';
            reply = `Hola, soy el asistente de Richard. Veo que estuviste mirando ${vehicleContext}. ¿Tienes alguna duda sobre el financiamiento o te gustaría agendar una prueba de manejo?`;
            nextStage = 'qualification';
        } else {
            reply = `Entiendo. Richard está revisando los detalles de tu caso ahora mismo. ¿Hay algo más que deba saber para ayudarte mejor con el financiamiento?`;
            nextStage = 'nurturing';
        }

        // Save progress
        await docRef.update({
            currentStage: nextStage,
            lastInteraction: admin.firestore.Timestamp.now(),
            history: [...updatedHistory, {
                role: 'bot' as const,
                text: reply,
                timestamp: admin.firestore.Timestamp.now()
            }]
        });

        return reply;
    }

    async toggleAutopilot(leadId: string, enabled: boolean): Promise<void> {
        await this.db.collection(this.collection).doc(leadId).update({
            isAutopilotEnabled: enabled
        });
    }
}

export const whatsappAgentService = new WhatsAppAgentService();
