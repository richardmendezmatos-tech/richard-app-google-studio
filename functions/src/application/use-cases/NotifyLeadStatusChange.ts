import { EmailRepository } from '../../domain/repositories/EmailRepository';
import { Lead } from '../../domain/entities';

export class NotifyLeadStatusChange {
    constructor(private emailRepo: EmailRepository) { }

    async execute(lead: Lead, oldStatus: string, newStatus: string): Promise<void> {
        if (oldStatus === newStatus) return;
        if (!lead.email) return;

        if (newStatus === 'contacted' && oldStatus === 'new') {
            await this.emailRepo.send({
                to: lead.email,
                subject: `📋 Actualización: Estamos revisando tu solicitud`,
                html: `<p>Hola ${lead.firstName}, estamos procesando tu solicitud.</p>`
            });
        } else if (newStatus === 'sold') {
            await this.emailRepo.send({
                to: lead.email,
                subject: `🎉 ¡Felicidades por tu nuevo auto!`,
                html: `<p>¡Felicidades ${lead.firstName}!</p>`
            });
        }
    }
}
