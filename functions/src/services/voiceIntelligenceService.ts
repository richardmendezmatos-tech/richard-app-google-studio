import * as admin from 'firebase-admin';

export interface LiveCallInsight {
    callId: string;
    leadId: string;
    transcriptSnippet: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    suggestedRebuttal: string;
    timestamp: admin.firestore.Timestamp;
}

/**
 * Simulates real-time voice intelligence analysis for sales calls.
 */
export class VoiceIntelligenceService {
    private db = admin.firestore();
    private collection = 'live_call_insights';

    /**
     * Simulates receiving a transcript chunk and generating an insight.
     */
    async processCallChunk(leadId: string, text: string): Promise<void> {
        const insight: LiveCallInsight = {
            callId: `call_${Date.now()}`,
            leadId,
            transcriptSnippet: text,
            sentiment: this.analyzeSentiment(text),
            suggestedRebuttal: this.generateRebuttal(text),
            timestamp: admin.firestore.Timestamp.now()
        };

        await this.db.collection(this.collection).add(insight);
    }

    private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
        if (text.toLowerCase().includes('caro') || text.toLowerCase().includes('no puedo')) return 'negative';
        if (text.toLowerCase().includes('me gusta') || text.toLowerCase().includes('perfecto')) return 'positive';
        return 'neutral';
    }

    private generateRebuttal(text: string): string {
        if (text.toLowerCase().includes('caro')) {
            return "Resalta el valor de reventa y la garantía extendida de Richard Automotive.";
        }
        if (text.toLowerCase().includes('pronto')) {
            return "Menciona la opción de financiamiento con Cooperativas locales al 5.95% con pronto flexible.";
        }
        return "Continúa con el anclaje de valor en la tecnología del vehículo.";
    }
}

export const voiceIntelligenceService = new VoiceIntelligenceService();
