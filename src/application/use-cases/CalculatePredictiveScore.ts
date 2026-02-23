import { Lead, PredictiveInsight } from '../../domain/entities';
import { PredictiveRepository } from '../../domain/repositories/PredictiveRepository';
import { LeadRepository } from '../../domain/repositories/LeadRepository';

export interface ScoringEngine {
    compute(lead: Lead): Promise<PredictiveInsight>;
}

export class CalculatePredictiveScore {
    constructor(
        private predictiveRepo: PredictiveRepository,
        private leadRepo: LeadRepository,
        private scoringEngine: ScoringEngine
    ) { }

    async execute(leadId: string): Promise<number> {
        const lead = await this.leadRepo.getLeadById(leadId);
        if (!lead) throw new Error('Lead not found');

        const insight = await this.scoringEngine.compute(lead);

        await this.predictiveRepo.savePredictiveInsight(insight);

        // Update lead with the new score and metrics trajectory
        await this.leadRepo.updateLead(leadId, {
            predictiveScore: insight.score,
            behavioralMetrics: {
                ...lead.behavioralMetrics,
                intentTrajectory: insight.score > (lead.predictiveScore || 0) ? 'improving' : 'stable'
            }
        });

        return insight.score;
    }
}
