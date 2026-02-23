import { ChatRepository, ChatSession } from '../../domain/repositories/ChatRepository';
import { db } from '../../services/firebaseAdmin';
import * as admin from 'firebase-admin';

export class FirestoreChatRepository implements ChatRepository {
    private collection = 'chats';

    async getById(chatId: string): Promise<ChatSession | null> {
        const snapshot = await db.collection(this.collection).doc(chatId).get();
        if (!snapshot.exists) return null;

        const data = snapshot.data() as any;
        return {
            ...data,
            lastUpdated: data.lastUpdated.toDate(),
            messages: (data.messages || []).map((m: any) => ({
                ...m,
                timestamp: m.timestamp instanceof admin.firestore.Timestamp ? m.timestamp.toDate() : new Date(m.timestamp)
            }))
        } as ChatSession;
    }

    async save(chatId: string, session: ChatSession): Promise<void> {
        const doc = {
            ...session,
            lastUpdated: admin.firestore.Timestamp.fromDate(session.lastUpdated),
            messages: session.messages.map(m => ({
                ...m,
                timestamp: admin.firestore.Timestamp.fromDate(m.timestamp)
            }))
        };
        await db.collection(this.collection).doc(chatId).set(doc, { merge: true });
    }
}
