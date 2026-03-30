import { Lead, PredictiveInsight } from '../model/types';

export interface PredictiveRepository {
  getPredictiveInsight(leadId: string): Promise<PredictiveInsight | null>;
  savePredictiveInsight(insight: PredictiveInsight): Promise<void>;
  getHighProbabilityLeads(threshold: number): Promise<Lead[]>;
}
