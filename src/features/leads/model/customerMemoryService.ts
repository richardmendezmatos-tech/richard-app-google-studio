import { supabase } from '@/shared/api/supabase/supabaseClient';
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
  private tableName = 'customer_memory';

  /**
   * Analiza el perfil cognitivo basado en interacciones.
   * Nivel 16: Hyper-Personalization.
   */
  async analyzeCognitiveProfile(interaction: string): Promise<PersuasionProfile> {
    const text = interaction.toLowerCase();
    if (text.includes('precio') || text.includes('ahorro') || text.includes('comparar'))
      return 'Analytical';
    if (text.includes('entrega') || text.includes('estatus') || text.includes('ya'))
      return 'Impulsive';
    if (text.includes('seguro') || text.includes('familia') || text.includes('garantia'))
      return 'Conservative';
    return 'Unknown';
  }

  /**
   * Updates customer memory based on a new interaction.
   */
  async updateMemory(
    leadId: string,
    data: { vehicleId?: string; interactionSnippet?: string },
  ): Promise<void> {
    if (!supabase) return;

    const { data: existingMemory, error: fetchError } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('lead_id', leadId)
      .single();

    const currentMemory: CustomerMemory = existingMemory
      ? {
          leadId: existingMemory.lead_id,
          preferences: {
            ...existingMemory.preferences,
            lastSeen: new Date(existingMemory.preferences.lastSeen),
          },
          history: existingMemory.history || [],
          notes: existingMemory.notes || [],
        }
      : this.getDefaultMemory(leadId);

    const updates: any = {
      lead_id: leadId,
      preferences: {
        ...currentMemory.preferences,
        lastSeen: new Date().toISOString(),
      },
    };

    if (data.vehicleId) {
      updates.history = [...new Set([...currentMemory.history, data.vehicleId])];
    }

    if (data.interactionSnippet) {
      const timestamp = new Date().toLocaleDateString();
      const noteEntry = `[${timestamp}] ${data.interactionSnippet}`;
      updates.notes = [...currentMemory.notes, noteEntry];

      const newProfile = await this.analyzeCognitiveProfile(data.interactionSnippet);
      if (newProfile !== 'Unknown') {
        updates.preferences.persuasionProfile = newProfile;
      }

      try {
        const newMatrix = await intentAnalysisService.extractIntent(data.interactionSnippet);
        updates.preferences.intentMatrix = newMatrix;

        if (currentMemory.preferences.intentMatrix) {
          const velocity = intentAnalysisService.calculateVelocity(
            currentMemory.preferences.intentMatrix,
            newMatrix,
          );
          updates.preferences.sentimentVelocity = velocity;
        }
      } catch (err) {
        console.error('Failed to extract intent matrix:', err);
      }

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

    const { error: upsertError } = await supabase.from(this.tableName).upsert(updates);

    if (upsertError) {
      console.error('[CustomerMemoryService] Error upserting memory:', upsertError);
    }
  }

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

  async getMemory(leadId: string): Promise<CustomerMemory | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('lead_id', leadId)
      .single();

    if (error || !data) return null;

    return {
      leadId: data.lead_id,
      preferences: {
        ...data.preferences,
        lastSeen: new Date(data.preferences.lastSeen),
      },
      history: data.history || [],
      notes: data.notes || [],
    } as CustomerMemory;
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
