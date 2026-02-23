import { LeadRepository } from '../../domain/repositories/LeadRepository';
import { ScoreCalculator } from './ScoreCalculator';
import { EmailRepository } from '../../domain/repositories/EmailRepository';
import { Lead } from '../../domain/entities';

export interface LeadApplicationInput {
    data: Lead;
}

export class ProcessNewLeadApplication {
    constructor(
        private leadRepo: LeadRepository,
        private emailRepo: EmailRepository,
        private smsRepo: any, // To be defined as SMSinterface
        private metaRepo?: any // To be defined
    ) { }

    async execute(input: LeadApplicationInput): Promise<void> {
        const lead = input.data;

        // 1. Core Logic: Scoring
        const analysis = ScoreCalculator.execute(lead);
        const updatedLead: Partial<Lead> = {
            ...lead,
            aiAnalysis: analysis,
            status: analysis.score > 80 ? 'pre-approved' : 'new',
            timestamp: new Date()
        };

        // 2. Persist
        const leadId = await this.leadRepo.create(updatedLead as Lead);
        console.log(`Successfully processed and persisted lead: ${leadId}`);

        // 3. Orchestrate Notifications
        // Admin Notification
        await this.emailRepo.send({
            to: 'richardmendezmatos@gmail.com',
            subject: `New Lead - ${lead.firstName} ${lead.lastName} (Score: ${analysis.score})`,
            html: `<h2>New Lead Received</h2><p>Score: ${analysis.score}/100</p>`
        });

        // Welcome Email
        if (lead.email) {
            await this.emailRepo.send({
                to: lead.email,
                subject: `🚗 Recibimos tu solicitud`,
                html: `<p>Hola ${lead.firstName}, recibimos tu solicitud.</p>`
            });
        }

        // Welcome SMS (Simulated via SMS Repo)
        if (lead.phone && this.smsRepo) {
            await this.smsRepo.send(lead.phone, `Hola ${lead.firstName}, recibimos tu solicitud en Richard Automotive.`);
        }

        // Meta CAPI (Simulated)
        if (this.metaRepo) {
            await this.metaRepo.sendLeadEvent(lead.email, lead.phone, lead);
        }
    }
}
