import { LeadRepository } from '../../domain/repositories/LeadRepository';
import { Car, MatchResult } from '../../domain/entities';

/**
 * Use Case: Match Inventory to Leads
 * Orchestrates domain logic using repository interfaces.
 */
export class InventoryMatcher {
    constructor(private leadRepository: LeadRepository) { }

    async execute(carId: string, carData: Car): Promise<MatchResult[]> {
        // Fetch candidates via interface (Infrastructure-Agnostic)
        const hotLeads = await this.leadRepository.getHotLeads(10);
        const matches: MatchResult[] = [];

        for (const lead of hotLeads) {
            let matchScore = 0;
            let reason = "";

            // Business Logic: Matching criteria
            // (Note: carData already has the fields needed since it's a domain entity)
            if (lead.aiAnalysis?.preferredType === carData.type) {
                matchScore += 40;
                reason += `Busca un ${carData.type}. `;
            }

            if (lead.aiAnalysis?.budget >= (carData.price * 0.9)) {
                matchScore += 30;
                reason += `Presupuesto compatible. `;
            }

            if (matchScore >= 40) {
                matches.push({
                    leadId: lead.id || 'unknown',
                    leadName: `${lead.firstName} ${lead.lastName}`.trim() || "Cliente Anónimo",
                    matchScore,
                    reason: reason.trim()
                });
            }
        }

        return matches;
    }
}
