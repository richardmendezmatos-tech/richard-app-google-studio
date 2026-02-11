import { db } from './firebaseService';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore/lite';

export interface ConversationMessage {
    id?: string;
    leadId: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Timestamp;
    source: 'whatsapp' | 'web' | 'sms';
    metadata?: {
        mediaUrl?: string;
        vehicleId?: string;
        sentiment?: 'positive' | 'neutral' | 'negative';
    };
}

/**
 * Service for managing conversation history in Firebase.
 * Enables contextual RAG by storing and retrieving message history.
 */
export class ConversationService {
    private collection = 'conversations';

    /**
     * Adds a new message to the conversation history.
     */
    async addMessage(
        leadId: string,
        role: 'user' | 'assistant',
        content: string,
        source: 'whatsapp' | 'web' | 'sms',
        metadata?: ConversationMessage['metadata']
    ): Promise<void> {
        try {
            await addDoc(collection(db, this.collection), {
                leadId,
                role,
                content,
                source,
                metadata: metadata || {},
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error('Error adding message to conversation:', error);
            throw error;
        }
    }

    /**
     * Retrieves conversation history for a lead.
     * Returns messages in chronological order (oldest first).
     */
    async getConversationHistory(
        leadId: string,
        messageLimit: number = 10
    ): Promise<ConversationMessage[]> {
        try {
            const q = query(
                collection(db, this.collection),
                where('leadId', '==', leadId),
                orderBy('timestamp', 'desc'),
                limit(messageLimit)
            );

            const snapshot = await getDocs(q);
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ConversationMessage));

            // Reverse to get chronological order (oldest first)
            return messages.reverse();
        } catch (error) {
            console.error('Error fetching conversation history:', error);
            return [];
        }
    }

    /**
     * Formats conversation history for RAG context.
     * Returns a string suitable for inclusion in Gemini prompts.
     */
    async getContextForRAG(leadId: string, messageLimit: number = 5): Promise<string> {
        const history = await this.getConversationHistory(leadId, messageLimit);

        if (history.length === 0) {
            return 'No hay historial de conversación previo.';
        }

        return history
            .map(msg => {
                const role = msg.role === 'user' ? 'Cliente' : 'Asistente';
                return `${role}: ${msg.content}`;
            })
            .join('\n');
    }

    /**
     * Gets the last message from a conversation.
     * Useful for detecting context switches or topic changes.
     */
    async getLastMessage(leadId: string): Promise<ConversationMessage | null> {
        const history = await this.getConversationHistory(leadId, 1);
        return history.length > 0 ? history[0] : null;
    }

    /**
     * Counts total messages in a conversation.
     * Useful for analytics and intent scoring.
     */
    async getMessageCount(leadId: string): Promise<number> {
        try {
            const q = query(
                collection(db, this.collection),
                where('leadId', '==', leadId)
            );
            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            console.error('Error counting messages:', error);
            return 0;
        }
    }
}

export const conversationService = new ConversationService();
