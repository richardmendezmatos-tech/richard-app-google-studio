import { db } from '@/shared/api/firebase/firebaseService';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { generateEmbedding } from '@/shared/api/ai';
import { vectorStoreService } from '@/features/ai-hub';
import { intentAnalysisService, IntentMatrix } from './scoring/IntentAnalysisService';

export type PersuasionProfile = 'Analytical' | 'Impulsive' | 'Conservative' | 'Unknown';

export interface CustomerPreference {
  brands: string[];
  carTypes: string[];
  priceRange: { min: number; max: number };
  lastSeen: Date;
  intentScore: number;
  persuasionProfile: PersuasionProfile;
  intentMatrix?: IntentMatrix;
  sentimentVelocity?: number;
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
   * Analiza el perfil cognitivo basado en interacciones.
   * Nivel 16: Hyper-Personalization.
   */
  async analyzeCognitiveProfile(leadId: string, interaction: string): Promise<PersuasionProfile> {
    // Aquí se llamaría a un modelo de IA (Vertex/Gemini) para clasificar el texto.
    // Lógica determinista simulada por ahora:
    const text = interaction.toLowerCase();
    if (text.includes('precio') || text.includes('ahorro') || text.includes('comparar')) return 'Analytical';
    if (text.includes('entrega') || text.includes('estatus') || text.includes('ya')) return 'Impulsive';
    if (text.includes('seguro') || text.includes('familia') || text.includes('garantia')) return 'Conservative';
    return 'Unknown';
  }

  /**
   * Updates customer memory based on a new interaction.
   */
  async updateMemory(
    leadId: string,
    data: { vehicleId?: string; interactionSnippet?: string },
  ): Promise<void> {
    const memoryRef = doc(db, this.collection, leadId);
    const docSnap = await getDoc(memoryRef);

    if (!docSnap.exists()) {
      await setDoc(memoryRef, this.getDefaultMemory(leadId));
    }

    const currentMemory = docSnap.exists() ? docSnap.data() as CustomerMemory : this.getDefaultMemory(leadId);

    const updates: Record<string, unknown> = {
      'preferences.lastSeen': Timestamp.now(),
    };

    if (data.vehicleId) {
      updates.history = arrayUnion(data.vehicleId);
    }

    if (data.interactionSnippet) {
      const timestamp = new Date().toLocaleDateString();
      const noteEntry = `[${timestamp}] ${data.interactionSnippet}`;
      updates.notes = arrayUnion(noteEntry);

      // Nivel 16: Perfilado Dinámico
      const newProfile = await this.analyzeCognitiveProfile(leadId, data.interactionSnippet);
      if (newProfile !== 'Unknown') {
        updates['preferences.persuasionProfile'] = newProfile;
      }

      // Nivel 17: Matriz de Intención Semántica (Gemini 1.5 Flash)
      try {
        const newMatrix = await intentAnalysisService.extractIntent(data.interactionSnippet);
        updates['preferences.intentMatrix'] = newMatrix;

        // Sentiment Velocity
        if (currentMemory.preferences.intentMatrix) {
          const velocity = intentAnalysisService.calculateVelocity(
            currentMemory.preferences.intentMatrix,
            newMatrix
          );
          updates['preferences.sentimentVelocity'] = velocity;
        }
      } catch (err) {
        console.error('Failed to extract intent matrix:', err);
      }

      // AI Vector Integration: Generate embedding and store in Supabase
      try {
        const embedding = await generateEmbedding(data.interactionSnippet);
        await vectorStoreService.upsertInteraction({
          leadId,
          content: data.interactionSnippet,
          embedding,
          metadata: { source: 'direct_interaction', timestamp },
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
      return similar.map((s) => s.content);
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
          lastSeen: data.preferences.lastSeen.toDate(),
        },
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
        intentScore: 0,
        persuasionProfile: 'Unknown',
      },
      history: [],
      notes: [],
    };
  }
}

export const customerMemoryService = new CustomerMemoryService();
