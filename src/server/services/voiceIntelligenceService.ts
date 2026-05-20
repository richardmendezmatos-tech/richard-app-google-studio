import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

export interface LiveCallInsight {
  callId: string;
  leadId: string;
  transcriptSnippet: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestedRebuttal: string;
  timestamp: Date;
}

/**
 * Simulates real-time voice intelligence analysis for sales calls.
 */
export class VoiceIntelligenceService {
  private tableName = 'live_call_insights';

  /**
   * Simulates receiving a transcript chunk and generating an insight.
   */
  async processCallChunk(leadId: string, text: string): Promise<void> {
    const supabase = createServerSupabaseClient();

    const insight = {
      call_id: `call_${Date.now()}`,
      lead_id: leadId,
      transcript_snippet: text,
      sentiment: this.analyzeSentiment(text),
      suggested_rebuttal: this.generateRebuttal(text),
      timestamp: new Date().toISOString(),
    };

    const { error } = await supabase.from(this.tableName).insert(insight);
    if (error) throw error;
  }

  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    if (text.toLowerCase().includes('caro') || text.toLowerCase().includes('no puedo'))
      return 'negative';
    if (text.toLowerCase().includes('me gusta') || text.toLowerCase().includes('perfecto'))
      return 'positive';
    return 'neutral';
  }

  private generateRebuttal(text: string): string {
    if (text.toLowerCase().includes('caro')) {
      return 'Resalta el valor de reventa y la garantía extendida de Richard Automotive.';
    }
    if (text.toLowerCase().includes('pronto')) {
      return 'Menciona la opción de financiamiento con Cooperativas locales al 5.95% con pronto flexible.';
    }
    return 'Continúa con el anclaje de valor en la tecnología del vehículo.';
  }
}

export const voiceIntelligenceService = new VoiceIntelligenceService();
