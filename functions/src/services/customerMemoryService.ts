import * as admin from 'firebase-admin';
import { db } from './firebaseAdmin';

export interface CustomerPreference {
  brands: string[];
  carTypes: string[];
  priceRange: { min: number; max: number };
  lastSeen: admin.firestore.Timestamp;
  intentScore: number;
}

export interface StructuredNote {
  timestamp: string;
  content: string;
  category: 'intent' | 'objection' | 'budget' | 'general';
}

export interface CustomerMemory {
  leadId: string;
  preferences: CustomerPreference;
  history: string[]; // List of vehicle IDs viewed or discussed
  notes: StructuredNote[]; // AI-generated synthesis of customer persona (Sanitized)
}

/**
 * Service to manage long-term customer memory and preferences.
 */
export class CustomerMemoryService {
  private db = db;
  private collection = 'customer_memory';

  /**
   * Sanitizes input to remove potential PII (Phones, SSN patterns, etc.)
   */
  private sanitizeSnippet(text: string): string {
    // Mask PR Phones: (787/939) XXX-XXXX or XXX-XXXX
    let sanitized = text.replace(
      /(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/g,
      '[PHONE_MASKED]',
    );
    // Mask generic 9-digit patterns (SSN potential)
    sanitized = sanitized.replace(/\d{3}-\d{2}-\d{4}/g, '[ID_MASKED]');
    return sanitized;
  }

  /**
   * Updates customer memory based on a new interaction.
   */
  async updateMemory(
    leadId: string,
    vehicleId?: string,
    interactionSnippet?: string,
    category: StructuredNote['category'] = 'general',
  ): Promise<void> {
    const memoryRef = this.db.collection(this.collection).doc(leadId);
    const doc = await memoryRef.get();

    const currentMemory = doc.exists
      ? (doc.data() as CustomerMemory)
      : this.getDefaultMemory(leadId);

    if (vehicleId && !currentMemory.history.includes(vehicleId)) {
      currentMemory.history.push(vehicleId);
    }

    if (interactionSnippet) {
      const sanitized = this.sanitizeSnippet(interactionSnippet);
      currentMemory.notes.push({
        timestamp: new Date().toISOString(),
        content: sanitized,
        category,
      });
    }

    currentMemory.preferences.lastSeen = admin.firestore.Timestamp.now();

    await memoryRef.set(currentMemory, { merge: true });
  }

  /**
   * Retrieves the stored memory for a lead.
   */
  async getMemory(leadId: string): Promise<CustomerMemory | null> {
    const doc = await this.db.collection(this.collection).doc(leadId).get();
    return doc.exists ? (doc.data() as CustomerMemory) : null;
  }

  private getDefaultMemory(leadId: string): CustomerMemory {
    return {
      leadId,
      preferences: {
        brands: [],
        carTypes: [],
        priceRange: { min: 0, max: 0 },
        lastSeen: admin.firestore.Timestamp.now(),
        intentScore: 0,
      },
      history: [],
      notes: [],
    };
  }
}

export const customerMemoryService = new CustomerMemoryService();
