import { LeadRepository } from '../../../domain/repositories';
import { EmailRepository } from '../../../domain/repositories';

export class NotifyPriceDrop {
    constructor(
        private leadRepo: LeadRepository,
        private emailRepo: EmailRepository
    ) { }

    async execute(carId: string, oldPrice: number, newPrice: number, carName?: string): Promise<void> {
        if (newPrice >= oldPrice) return;

        const leads = await this.leadRepo.getLeadsByVehicleId(carId);

        for (const lead of leads) {
            if (!lead.email) continue;

            await this.emailRepo.send({
                to: lead.email,
                subject: `🚨 ¡Bajó de Precio! ${carName || 'El auto que te gusta'}`,
                html: `<p>Hola ${lead.firstName}, el vehículo que te interesa bajó de $${oldPrice} a $${newPrice}.</p>`
            });
        }
    }
}
