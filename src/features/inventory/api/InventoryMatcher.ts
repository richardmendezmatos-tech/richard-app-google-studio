import { z } from 'zod';
import { LeadRepository } from '@/shared/api/repositories/ILeadRepository';
import { Car, CarEntity } from '@/entities/inventory/model/CarEntity';
import { Result, success, failure } from '@/shared/types/server-domain';
import { MatchReasoningService } from '@/shared/api/ai/MatchReasoningService';

export const MatchResultSchema = z.object({
  leadId: z.string(),
  leadName: z.string(),
  matchScore: z.number(),
  reason: z.string(),
  whatsappDraft: z.string().optional(),
});

export type MatchResultDTO = z.infer<typeof MatchResultSchema>;

/**
 * Use Case: Match Inventory to Leads
 * Orchestrates domain logic using repository interfaces.
 * Uses scoring pre-filter to avoid unnecessary AI calls.
 */
export class InventoryMatcher {
  constructor(private leadRepository: LeadRepository) {}

  async execute(carId: string, carData: Car): Promise<Result<MatchResultDTO[]>> {
    try {
      const carEntity = new CarEntity(carData);
      const marketScore = carEntity.calculateMarketDesirability();

      const allHotLeads = await this.leadRepository.getHotLeads(1000);
      const matches: MatchResultDTO[] = [];

      // Scoring pre-filter: only process leads with aiScore >= 50
      const candidates = allHotLeads.filter((lead) => ((lead as any).aiScore || 50) >= 50);

      for (const lead of candidates) {
        if ((lead as any).aiAnalysis?.preferredType && (lead as any).aiAnalysis.preferredType !== carData.type) {
          continue;
        }

        const aiMatch = await MatchReasoningService.analyzeMatchIntelligence(
          carData as any,
          lead as any,
        );

        if (aiMatch.score >= 60) {
          matches.push({
            leadId: lead.id || 'unknown',
            leadName: `${lead.firstName} ${lead.lastName}`.trim() || 'Cliente Anónimo',
            matchScore: aiMatch.score,
            reason: aiMatch.reasoning,
            whatsappDraft: aiMatch.whatsappDraft,
          });
        }
      }

      return success(matches);
    } catch (error) {
      console.error(`[InventoryMatcher] Error finding matches for car ${carId}:`, error);
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
