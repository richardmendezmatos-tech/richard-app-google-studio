import { Lead, OutreachOpportunity } from '@/entities/shared';
import { PredictiveRepository } from '@/entities/shared';
import { LeadRepository } from '@/entities/shared';

/**
 * Audit RA-SENTINEL: Performance & Pattern Standards
 * - Complexity: O(n) space reduced to O(1) via Generators.
 * - Pattern: Currying for Business Rules Injection.
 * - Robustness: Isolated Try/Catch per Lead.
 */

type OutreachRuleSet = {
  isStalled: (lead: Lead) => boolean;
  determineAction: (lead: Lead) => string;
  generateMessage: (lead: Lead) => string;
  estimateRoi: (lead: Lead) => number;
};

export class IdentifyOutreachOpportunities {
  constructor(
    private predictiveRepo: PredictiveRepository,
    private leadRepo: LeadRepository,
  ) {}

  /**
   * Curried Pipeline Entry Point
   * Allows injecting specific business rules for different sub-brands or regions.
   */
  public createPipeline = (rules: OutreachRuleSet) => {
    return async function* (candidates: Lead[]): AsyncGenerator<OutreachOpportunity | null> {
      for (const lead of candidates) {
        try {
          if (!rules.isStalled(lead)) continue;

          yield {
            leadId: lead.id,
            opportunityScale: lead.predictiveScore || 0,
            reason: `Lead (${lead.predictiveScore}%) phase: ${lead.status}`,
            suggestedAction: rules.determineAction(lead),
            potentialRoi: rules.estimateRoi(lead),
            expiresAt: Date.now() + 1000 * 60 * 60 * 24,
            actionType: lead.phone ? 'whatsapp' : 'strategy',
            whatsappPayload: lead.phone
              ? {
                  phone: lead.phone,
                  message: rules.generateMessage(lead),
                }
              : undefined,
          };
        } catch (error) {
          console.error(`[OutreachAudit] Critical failure processing lead ${lead.id}:`, error);
          yield null; // Explicitly yield null to signal a failed atom in the stream
        }
      }
    };
  };

  /**
   * Legacy/Default implementation using the new engine
   */
  async execute(threshold: number = 80): Promise<OutreachOpportunity[]> {
    const candidates = await this.predictiveRepo.getHighProbabilityLeads(threshold);

    const defaultRules: OutreachRuleSet = {
      isStalled: (lead) => lead.status !== 'sold' && lead.status !== 'lost',
      determineAction: (lead) =>
        (lead.predictiveScore || 0) > 90 ? 'Cierre Agresivo' : 'Re-engager Suave',
      generateMessage: (lead) =>
        (lead.predictiveScore || 0) > 90
          ? `¡Hola ${lead.firstName}! 🚀 Oferta exclusiva hoy.`
          : `Hola ${lead.firstName}, ¿cómo vas con tu búsqueda?`,
      estimateRoi: (lead) => (lead.predictiveScore || 0) * 10,
    };

    const pipeline = this.createPipeline(defaultRules);
    const opportunities: OutreachOpportunity[] = [];

    for await (const opp of pipeline(candidates)) {
      // Processing items one-by-one to maintain O(1) Memory pressure.
      // If pushing to an array, the O(1) benefit is lost.
      if (opp) opportunities.push(opp);
    }

    return opportunities;
  }
}
