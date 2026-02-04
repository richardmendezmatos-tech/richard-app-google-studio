
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SemanticMatch {
    car_id: string;
    car_name: string;
    content: string;
    similarity: number;
}

export const searchSemanticInventory = async (queryEmbedding: number[], threshold = 0.5, count = 3): Promise<SemanticMatch[]> => {
    const { data, error } = await supabase.rpc('match_inventory', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: count,
    });

    if (error) {
        console.error('Error in semantic search:', error);
        return [];
    }

    return data as SemanticMatch[];
};

export const logSearchGap = async (query: string, intent?: string) => {
    const { error } = await supabase.from('search_gaps').insert({
        query,
        detected_intent: intent
    });
    if (error) console.error('Error logging search gap:', error);
};
