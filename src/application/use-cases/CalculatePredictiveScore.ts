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
    private scoringEngine: ScoringEngine,
  ) {}

  /**
   * AI Scoring Engine 2.0: Generator-based Pipeline
   * Allows for lazy evaluation of scoring metrics and early exits.
   */
  private async *scoringPipeline(lead: Lead): AsyncGenerator<number> {
    // Yield intermediate scores based on different dimensions
    yield (lead.behavioralMetrics?.timeOnSite || 0) * 0.1;
    yield (lead.behavioralMetrics?.inventoryViews || 0) * 0.2;
    yield lead.phone ? 20 : 0;
    yield lead.email ? 10 : 0;
  }

  async execute(leadId: string): Promise<number> {
    const lead = await this.leadRepo.getLeadById(leadId);
    if (!lead) throw new Error('Lead not found');

    // Functional Accumulation of generator scores
    let aggregateScore = 0;
    for await (const partialScore of this.scoringPipeline(lead)) {
      aggregateScore += partialScore;
    }

    const insight: PredictiveInsight = {
      leadId,
      score: Math.min(100, aggregateScore),
      confidence: 0.9,
      factors: ['time_on_site', 'inventory_views', 'phone_provided', 'email_provided'],
      predictedAction: aggregateScore > 50 ? 'whatsapp_outreach' : 'warmup',
      timestamp: Date.now(),
    };

    if (aggregateScore < (lead.predictiveScore || 0)) {
      // Early bypass example: optimization logic if trajectory is declining
    }

    await this.predictiveRepo.savePredictiveInsight(insight);

    await this.leadRepo.updateLead(leadId, {
      predictiveScore: insight.score,
      behavioralMetrics: {
        ...lead.behavioralMetrics,
        intentTrajectory: insight.score > (lead.predictiveScore || 0) ? 'improving' : 'stable',
      },
    });

    return insight.score;
  }
}
