import { LeadRepository } from '../../../domain/repositories';
import { EmailRepository } from '../../../domain/repositories';

export class NudgeStaleLeads {
    constructor(
        private leadRepo: LeadRepository,
        private emailRepo: EmailRepository
    ) { }

    async execute(): Promise<number> {
        const staleLeads = await this.leadRepo.getStaleLeads(3, 50);
        let nudgeCount = 0;

        for (const lead of staleLeads) {
            if (!lead.email || lead.id === undefined) continue;

            try {
                await this.emailRepo.send({
                    to: lead.email,
                    subject: `¿Sigues buscando auto, ${lead.firstName}? 🤔`,
                    html: `<p>Hola ${lead.firstName}, queremos ayudarte...</p>`
                });

                await this.leadRepo.updateLead(lead.id, {
                    aiAnalysis: {
                        ...lead.aiAnalysis,
                        score: lead.aiAnalysis?.score || 0,
                        insights: lead.aiAnalysis?.insights || [],
                        nudgeSent: true
                    }
                });
                nudgeCount++;
            } catch (e) {
                console.error(`Failed to nudge lead ${lead.id}`, e);
            }
        }

        return nudgeCount;
    }
}
