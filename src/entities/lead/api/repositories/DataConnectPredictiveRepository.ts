import { PredictiveRepository } from '../PredictiveRepository';
import { Lead, PredictiveInsight } from '../../model/types';
import { listHighProbabilityLeads, updateLeadIntelligence, getLead } from '@dataconnect/generated';

export class DataConnectPredictiveRepository implements PredictiveRepository {
  async getPredictiveInsight(leadId: string): Promise<PredictiveInsight | null> {
    try {
      const resp = await getLead({ id: leadId });
      const lead = resp.data.lead;
      if (!lead || !lead.aiAnalysis) return null;

      const aiData = JSON.parse(lead.aiAnalysis);
      
      return {
        leadId,
        score: lead.closureProbability || aiData.score || 0,
        confidence: aiData.confidence || 0,
        factors: aiData.insights || [],
        predictedAction: aiData.nextAction || 'Contactar',
        timestamp: lead.timestamp ? new Date(lead.timestamp).getTime() : Date.now(),
      };
    } catch (error) {
      console.error('[DataConnectPredictiveRepository] Error fetching insight:', error);
      return null;
    }
  }

  async savePredictiveInsight(insight: PredictiveInsight): Promise<void> {
    try {
      // Re-fetch existing lead to safely update JSON structure
      const resp = await getLead({ id: insight.leadId });
      const lead = resp.data.lead;
      if (!lead) {
        console.warn(`[DataConnectPredictiveRepository] Cannot save insight, Lead not found: ${insight.leadId}`);
        return;
      }

      let currentAiData: any = {};
      try {
        currentAiData = lead.aiAnalysis ? JSON.parse(lead.aiAnalysis) : {};
      } catch (e) {
        console.debug('Failed to parse existing aiAnalysis', e);
      }

      currentAiData.score = insight.score;
      currentAiData.confidence = insight.confidence;
      currentAiData.insights = insight.factors;
      currentAiData.nextAction = insight.predictedAction;

      await updateLeadIntelligence({
        id: insight.leadId,
        aiAnalysis: JSON.stringify(currentAiData),
        closureProbability: parseFloat(insight.score.toString()) || 0,
        // Mantener datos behaviorales existentes o parsearlos si quisieramos
        behavioralData: lead.behavioralData || undefined,
        marketingData: lead.marketingData || undefined,
      });
    } catch (error) {
      console.error('[DataConnectPredictiveRepository] Error saving insight:', error);
      throw error;
    }
  }

  async getHighProbabilityLeads(threshold: number): Promise<Lead[]> {
    try {
      // Assuming a default context of 'richard-automotive' since the original Firestore repository did not filter by dealerId.
      const resp = await listHighProbabilityLeads({
        dealerId: 'richard-automotive',
        threshold,
        limit: 100
      });

      return resp.data.leads.map(lead => {
         let aiAnalysis;
         try { 
            aiAnalysis = lead.aiAnalysis ? JSON.parse(lead.aiAnalysis) : undefined; 
         } catch (e) {
            console.debug('Failed to parse aiAnalysis from remote DB', e);
         }
         
         return {
           id: lead.id,
           firstName: lead.firstName,
           lastName: lead.lastName,
           phone: lead.phone,
           email: lead.email,
           vehicleOfInterest: lead.vehicleOfInterest,
           closureProbability: lead.closureProbability || 0,
           aiScore: lead.closureProbability || 0,
           aiAnalysis,
           timestamp: lead.timestamp ? { toMillis: () => new Date(lead.timestamp).getTime() } as any : undefined,
         } as Lead;
      });
    } catch (error) {
       console.error('[DataConnectPredictiveRepository] Error fetching high prob leads:', error);
       return [];
    }
  }
}
