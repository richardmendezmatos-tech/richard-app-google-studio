import * as admin from 'firebase-admin';

export interface CustomerPreference {
    brands: string[];
    carTypes: string[];
    priceRange: { min: number; max: number };
    lastSeen: admin.firestore.Timestamp;
    intentScore: number;
}

export interface CustomerMemory {
    leadId: string;
    preferences: CustomerPreference;
    history: string[]; // List of vehicle IDs viewed or discussed
    notes: string[]; // AI-generated synthesis of customer persona
}

/**
 * Service to manage long-term customer memory and preferences.
 */
export class CustomerMemoryService {
    private db = admin.firestore();
    private collection = 'customer_memory';

    /**
     * Updates customer memory based on a new interaction.
     */
    async updateMemory(leadId: string, vehicleId?: string, interactionSnippet?: string): Promise<void> {
        const memoryRef = this.db.collection(this.collection).doc(leadId);
        const doc = await memoryRef.get();

        const currentMemory = doc.exists ? doc.data() as CustomerMemory : this.getDefaultMemory(leadId);

        if (vehicleId && !currentMemory.history.includes(vehicleId)) {
            currentMemory.history.push(vehicleId);
        }

        if (interactionSnippet) {
            // In a real scenario, we'd use Gemini here to extract preferences from the snippet
            // For now, we simulate basic extraction
            currentMemory.notes.push(`Interaction on ${new Date().toISOString()}: ${interactionSnippet.substring(0, 50)}...`);
        }

        currentMemory.preferences.lastSeen = admin.firestore.Timestamp.now();

        await memoryRef.set(currentMemory, { merge: true });
    }

    /**
     * Retrieves the stored memory for a lead.
     */
    async getMemory(leadId: string): Promise<CustomerMemory | null> {
        const doc = await this.db.collection(this.collection).doc(leadId).get();
        return doc.exists ? doc.data() as CustomerMemory : null;
    }

    private getDefaultMemory(leadId: string): CustomerMemory {
        return {
            leadId,
            preferences: {
                brands: [],
                carTypes: [],
                priceRange: { min: 0, max: 0 },
                lastSeen: admin.firestore.Timestamp.now(),
                intentScore: 0
            },
            history: [],
            notes: []
        };
    }
}

export const customerMemoryService = new CustomerMemoryService();
