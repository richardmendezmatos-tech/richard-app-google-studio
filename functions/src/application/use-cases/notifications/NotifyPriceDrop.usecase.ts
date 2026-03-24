import { LeadRepository, EmailRepository, WhatsAppRepository } from '../../../domain/repositories';

export class NotifyPriceDrop {
    constructor(
        private leadRepo: LeadRepository,
        private emailRepo: EmailRepository,
        private whatsappRepo?: WhatsAppRepository
    ) { }

    async execute(carId: string, oldPrice: number, newPrice: number, carName?: string): Promise<void> {
        if (newPrice >= oldPrice) return;

        const leads = await this.leadRepo.getLeadsByVehicleId(carId);

        for (const lead of leads) {
            // Notificación Email
            if (lead.email) {
                await this.emailRepo.send({
                    to: lead.email,
                    subject: `🚨 ¡Bajó de Precio! ${carName || 'El auto que te gusta'}`,
                    html: `<p>Hola ${lead.firstName || 'amigo'}, el vehículo que te interesa bajó de $${oldPrice} a $${newPrice}. ¿Deseas hacer una prueba de manejo?</p>`
                });
            }

            // Notificación WhatsApp (AI Agent Pipeline)
            if (this.whatsappRepo && lead.phone) {
                const message = `🚘 ¡Hola ${lead.firstName || ''}! Tenemos buenas noticias desde Richard Automotive. El ${carName || 'vehículo que consultaste'} acaba de bajar su precio a $${newPrice.toLocaleString()} (antes $${oldPrice.toLocaleString()}). ¿Te interesa agendar una cita para verlo hoy mismo?`;
                await this.whatsappRepo.sendMessage(lead.phone, message);
            }
        }
    }
}
