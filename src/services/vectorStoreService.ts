import { supabase } from './supabaseClient';

export interface VectorInteraction {
    leadId: string;
    content: string;
    embedding: number[];
    metadata?: Record<string, unknown>;
}

export class VectorStoreService {
    private table = 'customer_interactions';

    /**
     * Stores a new interaction embedding in Supabase.
     */
    async upsertInteraction(interaction: VectorInteraction): Promise<void> {
        const { error } = await supabase.from(this.table).upsert({
            lead_id: interaction.leadId,
            content: interaction.content,
            embedding: interaction.embedding,
            metadata: interaction.metadata,
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error('Error upserting vector interaction:', error);
            throw error;
        }
    }

    /**
     * Performs a semantic search for relevant past context.
     */
    async querySimilarInteractions(leadId: string, queryEmbedding: number[], limit = 5): Promise<VectorInteraction[]> {
        const { data, error } = await supabase.rpc('match_customer_interactions', {
            p_lead_id: leadId,
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: limit
        });

        if (error) {
            console.error('Error querying similar interactions:', error);
            return [];
        }

        return data as VectorInteraction[];
    }
}

export const vectorStoreService = new VectorStoreService();
