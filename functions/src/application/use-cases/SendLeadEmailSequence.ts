import { LeadRepository } from '../../domain/repositories/LeadRepository';
import { EmailRepository } from '../../domain/repositories/EmailRepository';
import { Lead } from '../../domain/entities';

export class SendLeadEmailSequence {
    constructor(
        private leadRepo: LeadRepository,
        private emailRepo: EmailRepository
    ) { }

    async sendWelcome(lead: Lead): Promise<void> {
        if (!lead.email || !lead.id) return;

        await this.emailRepo.send({
            to: lead.email,
            subject: `🚗 Bienvenidos a Richard Automotive`,
            html: `<p>Hola ${lead.firstName}, bienvenido.</p>`
        });

        await this.leadRepo.updateLead(lead.id, {
            emailSequence: {
                ...lead.emailSequence,
                welcome1SentAt: new Date(),
                emailsSent: (lead.emailSequence?.emailsSent || 0) + 1
            }
        } as any);
    }

    async sendAppointmentFollowUp(lead: Lead): Promise<void> {
        if (!lead.email || !lead.id) return;

        await this.emailRepo.send({
            to: lead.email,
            subject: `📅 Resumen de tu cita`,
            html: `<p>Gracias por la visita, ${lead.firstName}.</p>`
        });

        await this.leadRepo.updateLead(lead.id, {
            emailSequence: {
                ...lead.emailSequence,
                postAppointment1SentAt: new Date(),
                emailsSent: (lead.emailSequence?.emailsSent || 0) + 1
            }
        } as any);
    }
}
