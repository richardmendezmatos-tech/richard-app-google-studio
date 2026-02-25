import { WhatsAppRepository, WhatsAppSequence, WhatsAppStage } from '../../domain/repositories/WhatsAppRepository';
import { db } from '../../services/firebaseAdmin';
import * as admin from 'firebase-admin';

export class FirestoreWhatsAppRepository implements WhatsAppRepository {
    private collection = 'whatsapp_sequences';

    async getSequence(leadId: string): Promise<WhatsAppSequence | null> {
        const snapshot = await db.collection(this.collection).doc(leadId).get();
        if (!snapshot.exists) return null;

        const data = snapshot.data() as any;
        return {
            ...data,
            lastInteraction: data.lastInteraction.toDate(),
            history: data.history.map((h: any) => ({
                ...h,
                timestamp: h.timestamp.toDate()
            }))
        };
    }

    async saveSequence(sequence: WhatsAppSequence): Promise<void> {
        const doc = {
            ...sequence,
            lastInteraction: admin.firestore.Timestamp.fromDate(sequence.lastInteraction),
            history: sequence.history.map(h => ({
                ...h,
                timestamp: admin.firestore.Timestamp.fromDate(h.timestamp)
            }))
        };
        await db.collection(this.collection).doc(sequence.leadId).set(doc, { merge: true });
    }

    async updateStage(leadId: string, stage: WhatsAppStage): Promise<void> {
        await db.collection(this.collection).doc(leadId).update({
            currentStage: stage,
            lastInteraction: admin.firestore.Timestamp.now()
        });
    }

    async sendMessage(to: string, message: string): Promise<boolean> {
        console.log(`[WhatsApp] Sending message to ${to}: ${message}`);
        // Integration with 360dialog or Twilio would go here
        return true;
    }
}
