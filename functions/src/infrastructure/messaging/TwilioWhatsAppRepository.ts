import { WhatsAppRepository, WhatsAppSequence, WhatsAppStage } from '../../domain/repositories';
import { sendTwilioMessage } from './TwilioAdapter';
import { db } from '../../services/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export class TwilioWhatsAppRepository implements WhatsAppRepository {
    private collection = 'whatsapp_sequences';

    async getSequence(leadId: string): Promise<WhatsAppSequence | null> {
        const doc = await db.collection(this.collection).doc(leadId).get();
        return doc.exists ? doc.data() as WhatsAppSequence : null;
    }

    async saveSequence(sequence: WhatsAppSequence): Promise<void> {
        await db.collection(this.collection).doc(sequence.leadId).set(sequence);
    }

    async updateStage(leadId: string, stage: WhatsAppStage): Promise<void> {
        await db.collection(this.collection).doc(leadId).update({
            currentStage: stage,
            lastInteraction: Timestamp.now()
        });
    }

    async sendMessage(to: string, message: string): Promise<boolean> {
        try {
            // Twilio requires 'whatsapp:' prefix for numbers
            const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
            await sendTwilioMessage(formattedTo, message);
            return true;
        } catch (error) {
            console.error('TwilioWhatsAppRepository Error:', error);
            return false;
        }
    }
}
