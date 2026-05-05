import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PredictiveRepository } from '../PredictiveRepository';
import { Lead, PredictiveInsight } from '../../model/types';

export class SupabasePredictiveRepository implements PredictiveRepository {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    if (client) {
      this.client = client;
    } else {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      this.client = createClient(supabaseUrl, supabaseKey);
    }
  }

  async getPredictiveInsight(leadId: string): Promise<PredictiveInsight | null> {
    const { data, error } = await this.client
      .from('leads')
      .select('ai_analysis')
      .eq('id', leadId)
      .single();

    if (error || !data) return null;
    return data.ai_analysis as PredictiveInsight;
  }

  async savePredictiveInsight(insight: PredictiveInsight): Promise<void> {
    const { error } = await this.client
      .from('leads')
      .update({ ai_analysis: insight })
      .eq('id', insight.leadId);

    if (error) {
      console.error('[SupabasePredictiveRepository] Error saving insight:', error);
      throw error;
    }
  }

  async getHighProbabilityLeads(threshold: number): Promise<Lead[]> {
    // Note: This requires filtering inside JSONB if closureProbability is there.
    // PostgreSQL syntax: ai_analysis->>'closureProbability'
    const { data, error } = await this.client
      .from('leads')
      .select('*')
      .gt('ai_analysis->>closureProbability', threshold);

    if (error) {
      console.error('[SupabasePredictiveRepository] Error fetching high probability leads:', error);
      return [];
    }

    return (data || []) as any[];
  }
}
