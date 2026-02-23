import { Lead, OutreachOpportunity } from '../../domain/entities';
import { PredictiveRepository } from '../../domain/repositories/PredictiveRepository';
import { LeadRepository } from '../../domain/repositories/LeadRepository';

export class IdentifyOutreachOpportunities {
    constructor(
        private predictiveRepo: PredictiveRepository,
        private leadRepo: LeadRepository
    ) { }

    async execute(threshold: number = 80): Promise<OutreachOpportunity[]> {
        // 1. Get high probability leads
        const candidates = await this.predictiveRepo.getHighProbabilityLeads(threshold);

        // 2. Filter by business logic (e.g., status is 'new' or 'contacted' but stalled)
        const opportunities: OutreachOpportunity[] = [];

        for (const lead of candidates) {
            if (this.isStalled(lead)) {
                opportunities.push({
                    leadId: lead.id,
                    opportunityScale: lead.predictiveScore || 0,
                    reason: `High probability lead (${lead.predictiveScore}%) showing signs of stagnation in phase: ${lead.status}`,
                    suggestedAction: this.determineAction(lead),
                    potentialRoi: this.estimateRoi(lead),
                    expiresAt: Date.now() + (1000 * 60 * 60 * 24) // 24h validity
                });
            }
        }

        return opportunities;
    }

    private isStalled(lead: Lead): boolean {
        // Simple heuristic for now: status is not 'sold' or 'lost' and hasn't had contact for a bit
        // In a real scenario, we'd check behavioralMetrics.lastActive vs now
        return lead.status !== 'sold' && lead.status !== 'lost';
    }

    private determineAction(lead: Lead): string {
        if (lead.predictiveScore && lead.predictiveScore > 90) return 'AGGRESSIVE_CLOSING_NUDGE';
        return 'SOFT_REENGAGEMENT_NUDGE';
    }

    private estimateRoi(lead: Lead): number {
        // Placeholder estimation
        return (lead.predictiveScore || 0) * 10;
    }
}
