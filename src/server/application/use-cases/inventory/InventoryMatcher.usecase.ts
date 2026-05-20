import { z } from 'zod';
import { LeadRepository } from '../../../domain/repositories';
import { Car, CarEntity } from '../../../domain/entities';
import { Result, success, failure } from '../../../domain/types';
import { MatchReasoningService } from '@/shared/api/ai/MatchReasoningService';

/**
 * Esquema de salida para el resultado de un match de inventario.
 */
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
 */
export class InventoryMatcher {
  constructor(private leadRepository: LeadRepository) {}

  /**
   * Busca leads potenciales para una unidad específica.
   */
  async execute(carId: string, carData: Car): Promise<Result<MatchResultDTO[]>> {
    try {
      const carEntity = new CarEntity(carData);
      const marketScore = carEntity.calculateMarketDesirability();

      const hotLeads = await this.leadRepository.getHotLeads(10);
      const matches: MatchResultDTO[] = [];

      for (const lead of hotLeads) {
        // 1. Initial heuristic check to filter noise
        if (lead.aiAnalysis?.preferredType && lead.aiAnalysis.preferredType !== carData.type) {
          continue;
        }

        // 2. Neural Match v3: AI-Driven Intelligence
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
            whatsappDraft: aiMatch.whatsappDraft, // We should update MatchResultDTO to include this
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
