import { z } from 'genkit';
import { LeadRepository } from '../../../domain/repositories';
import { Car, CarEntity } from '../../../domain/entities';
import { Result, success, failure } from '../../../domain/types';

/**
 * Esquema de salida para el resultado de un match de inventario.
 */
export const MatchResultSchema = z.object({
    leadId: z.string(),
    leadName: z.string(),
    matchScore: z.number(),
    reason: z.string()
});

export type MatchResultDTO = z.infer<typeof MatchResultSchema>;

/**
 * Use Case: Match Inventory to Leads
 * Orchestrates domain logic using repository interfaces.
 */
export class InventoryMatcher {
    constructor(private leadRepository: LeadRepository) { }

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
                let matchScore = 0;
                const reasons: string[] = [];

                // 1. Alineación Técnica (Tipo de vehículo)
                if (lead.aiAnalysis?.preferredType === carData.type) {
                    matchScore += 40;
                    reasons.push(`Busca un ${carData.type}`);
                }

                // 2. Compatibilidad Financiera (Presupuesto)
                if (lead.aiAnalysis?.budget && lead.aiAnalysis.budget >= (carData.price * 0.9)) {
                    matchScore += 30;
                    reasons.push(`Presupuesto compatible`);
                }

                // 3. Bonus por Deseabilidad de la Unidad (Houston Intelligence)
                if (marketScore > 70) {
                    matchScore += 10;
                    reasons.push(`Unidad de alta deseabilidad`);
                }

                if (matchScore >= 40) {
                    matches.push({
                        leadId: lead.id || 'unknown',
                        leadName: `${lead.firstName} ${lead.lastName}`.trim() || "Cliente Anónimo",
                        matchScore: Math.min(matchScore, 100),
                        reason: reasons.join('. ')
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
