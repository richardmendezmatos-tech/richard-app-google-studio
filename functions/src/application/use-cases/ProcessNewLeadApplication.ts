import { LeadRepository } from '../../domain/repositories/LeadRepository';
import { ScoreCalculator } from './ScoreCalculator';
import { EmailRepository } from '../../domain/repositories/EmailRepository';
import { SMSRepository } from '../../domain/repositories/SMSRepository';
import { MetaRepository } from '../../domain/repositories/MetaRepository';
import { WhatsAppRepository } from '../../domain/repositories/WhatsAppRepository';
import { Lead } from '../../domain/entities';

export interface LeadApplicationInput {
    id: string;
    data: Lead;
}

export class ProcessNewLeadApplication {
    constructor(
        private leadRepo: LeadRepository,
        private emailRepo: EmailRepository,
        private smsRepo: SMSRepository,
        private metaRepo: MetaRepository,
        private whatsAppRepo: WhatsAppRepository
    ) { }

    async execute(input: LeadApplicationInput): Promise<void> {
        const lead = input.data;
        const appId = input.id;

        // 1. Core Logic: Scoring
        const analysis = ScoreCalculator.execute(lead);
        const updatedLead: Partial<Lead> = {
            aiAnalysis: analysis,
            status: analysis.score > 80 ? 'pre-approved' : 'new',
            timestamp: new Date()
        };

        // 2. Persist using Repository (No snapshot.ref)
        await this.leadRepo.updateLead(appId, updatedLead);
        console.log(`Successfully processed and persisted lead: ${appId}`);

        // 3. Orchestrate Notifications
        // Admin Notification
        await this.emailRepo.send({
            to: 'richardmendezmatos@gmail.com',
            subject: `New Lead - ${lead.firstName} ${lead.lastName} (Score: ${analysis.score})`,
            html: `
                <h2>New Lead Received</h2>
                <p><strong>Applicant:</strong> ${lead.firstName} ${lead.lastName}</p>
                <p><strong>Phone:</strong> ${lead.phone}</p>
                <p><strong>Email:</strong> ${lead.email}</p>
                <hr>
                <h3>AI Analysis</h3>
                <p><strong>Score:</strong> ${analysis.score}/100 (${analysis.category})</p>
                <p><strong>Resumen:</strong> ${analysis.reasoning}</p>
            `
        });

        // Welcome Email to Client
        if (lead.email) {
            await this.emailRepo.send({
                to: lead.email,
                subject: `🚗 Recibimos tu solicitud`,
                html: `<p>Hola ${lead.firstName}, recibimos tu solicitud en Richard Automotive. Te contactaremos pronto.</p>`
            });
        }

        // Welcome SMS
        if (lead.phone) {
            await this.smsRepo.send(lead.phone, `Hola ${lead.firstName}, recibimos tu solicitud en Richard Automotive. pronto te contactaremos.`);
        }

        // 4. Phase 20: WhatsApp Business Automation (The Sales Booster)
        if (lead.phone && analysis.score >= 85) {
            const waMessage = `¡Hola ${lead.firstName}! Soy Richard de Richard Automotive. 🦅🚀 Vi tu interés en un vehículo de nuestro inventario y tu perfil califica para una atención prioritaria. ¿Te gustaría que te envíe un video personalizado o coordinemos una prueba de manejo hoy mismo?`;
            await this.whatsAppRepo.sendMessage(lead.phone, waMessage);
            console.log(`[WhatsApp Automation] Sent proactive nudge to high-priority lead: ${appId}`);
        }

        // Meta CAPI Event
        await this.metaRepo.sendLeadEvent(lead.email, lead.phone, lead);
    }
}
