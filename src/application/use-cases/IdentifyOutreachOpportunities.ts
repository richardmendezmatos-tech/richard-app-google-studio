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

        // 2. Filter and Map by business logic
        return candidates
            .filter(lead => this.isStalled(lead))
            .map(lead => ({
                leadId: lead.id,
                opportunityScale: lead.predictiveScore || 0,
                reason: `High probability lead (${lead.predictiveScore}%) showing signs of stagnation in phase: ${lead.status}`,
                suggestedAction: this.determineAction(lead),
                potentialRoi: this.estimateRoi(lead),
                expiresAt: Date.now() + (1000 * 60 * 60 * 24), // 24h validity
                actionType: this.determineActionType(lead),
                whatsappPayload: lead.phone ? {
                    phone: lead.phone,
                    message: this.generateMessage(lead)
                } : undefined
            }));

    }

    private isStalled(lead: Lead): boolean {
        return lead.status !== 'sold' && lead.status !== 'lost';
    }

    private determineAction(lead: Lead): string {
        if (lead.predictiveScore && lead.predictiveScore > 90) return 'Cierre Agresivo';
        return 'Re-engager Suave';
    }

    private determineActionType(lead: Lead): 'whatsapp' | 'strategy' {
        return lead.phone ? 'whatsapp' : 'strategy';
    }

    private generateMessage(lead: Lead): string {
        const score = lead.predictiveScore || 0;
        if (score > 90) {
            return `¡Hola ${lead.firstName}! 👋 Soy Richard de Richard Automotive. He visto que tienes mucho interés en el inventario. Tengo una oferta exclusiva para cerrar hoy mismo. ¿Hablamos?`;
        }
        return `Hola ${lead.firstName}, ¿cómo vas con tu búsqueda de auto? 🚗 Sigo a tu disposición para cualquier duda.`;
    }

    private estimateRoi(lead: Lead): number {
        return (lead.predictiveScore || 0) * 10;
    }
}
