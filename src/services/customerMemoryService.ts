import { db } from './firebaseService';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore/lite';
import { generateEmbedding } from './geminiService';
import { vectorStoreService } from './vectorStoreService';

export interface CustomerPreference {
    brands: string[];
    carTypes: string[];
    priceRange: { min: number; max: number };
    lastSeen: Date;
    intentScore: number;
}

export interface CustomerMemory {
    leadId: string;
    preferences: CustomerPreference;
    history: string[]; // List of vehicle IDs viewed or discussed
    notes: string[]; // AI-generated synthesis of customer persona
}

/**
 * Mobile/Web Frontend Service to manage long-term customer memory.
 */
export class CustomerMemoryService {
    private collection = 'customer_memory';

    /**
     * Updates customer memory based on a new interaction.
     */
    async updateMemory(leadId: string, data: { vehicleId?: string; interactionSnippet?: string }): Promise<void> {
        const memoryRef = doc(db, this.collection, leadId);
        const docSnap = await getDoc(memoryRef);

        if (!docSnap.exists()) {
            await setDoc(memoryRef, this.getDefaultMemory(leadId));
        }

        const updates: Record<string, unknown> = {
            'preferences.lastSeen': Timestamp.now()
        };

        if (data.vehicleId) {
            updates.history = arrayUnion(data.vehicleId);
        }

        if (data.interactionSnippet) {
            const timestamp = new Date().toLocaleDateString();
            const noteEntry = `[${timestamp}] ${data.interactionSnippet}`;
            updates.notes = arrayUnion(noteEntry);

            // AI Vector Integration: Generate embedding and store in Supabase
            try {
                const embedding = await generateEmbedding(data.interactionSnippet);
                await vectorStoreService.upsertInteraction({
                    leadId,
                    content: data.interactionSnippet,
                    embedding,
                    metadata: { source: 'direct_interaction', timestamp }
                });
            } catch (err) {
                console.error('Failed to update vector memory:', err);
            }
        }

        await updateDoc(memoryRef, updates);
    }

    /**
     * Searches for relevant past context across all interactions of a lead.
     */
    async getRelevantContext(leadId: string, query: string): Promise<string[]> {
        try {
            const queryEmbedding = await generateEmbedding(query);
            const similar = await vectorStoreService.querySimilarInteractions(leadId, queryEmbedding);
            return similar.map(s => s.content);
        } catch (err) {
            console.error('Error fetching semantic context:', err);
            return [];
        }
    }

    /**
     * Retrieves the stored memory for a lead.
     */
    async getMemory(leadId: string): Promise<CustomerMemory | null> {
        const docRef = doc(db, this.collection, leadId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...data,
                preferences: {
                    ...data.preferences,
                    lastSeen: data.preferences.lastSeen.toDate()
                }
            } as CustomerMemory;
        }
        return null;
    }

    private getDefaultMemory(leadId: string): CustomerMemory {
        return {
            leadId,
            preferences: {
                brands: [],
                carTypes: [],
                priceRange: { min: 0, max: 0 },
                lastSeen: new Date(),
                intentScore: 0
            },
            history: [],
            notes: []
        };
    }
}

export const customerMemoryService = new CustomerMemoryService();
