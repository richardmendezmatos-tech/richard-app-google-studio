import { z } from 'genkit';
import { LeadRepository, EmailRepository, SMSRepository, MetaRepository, WhatsAppRepository } from '../../../domain/repositories';
import { ScoreCalculator } from './ScoreCalculator.usecase';
import { Lead, LeadEntity } from '../../../domain/entities';
import { Result, success, failure } from '../../../domain/types';

/**
 * Esquema de entrada estricto para nuevas solicitudes de Lead.
 */
export const LeadApplicationInputSchema = z.object({
    id: z.string(),
    data: z.any() // Se valida internamente con LeadEntity
});

export type LeadApplicationInput = z.infer<typeof LeadApplicationInputSchema>;

/**
 * Use Case: Process New Lead Application
 * Orquestador principal para la ingesta y respuesta inicial de leads.
 */
export class ProcessNewLeadApplication {
    constructor(
        private leadRepo: LeadRepository,
        private emailRepo: EmailRepository,
        private smsRepo: SMSRepository,
        private metaRepo: MetaRepository,
        private whatsAppRepo: WhatsAppRepository
    ) { }

    /**
     * Ejecuta el procesamiento integral de una nueva solicitud.
     */
    async execute(input: LeadApplicationInput): Promise<Result<void>> {
        try {
            const lead = input.data as Lead;
            const appId = input.id;
            const leadEntity = new LeadEntity(lead);

            // 1. Lógica de Dominio: Scoring & Análisis
            const analysis = ScoreCalculator.execute(lead);
            const updatedLead: Partial<Lead> = {
                aiAnalysis: analysis,
                status: analysis.score > 80 ? 'pre-approved' : 'new',
                timestamp: new Date()
            };

            // 2. Persistencia (Infraestructura)
            await this.leadRepo.updateLead(appId, updatedLead);
            console.log(`[ProcessNewLead] Persisted lead: ${appId} (Status: ${updatedLead.status})`);

            // 3. Orquestación de Notificaciones (Efectos Secundarios)
            await this.handleNotifications(lead, analysis, leadEntity);

            // 4. Marketing & CRM Data Flow
            await this.metaRepo.sendLeadEvent(lead.email, lead.phone, lead);

            return success(undefined);
        } catch (error) {
            console.error(`[ProcessNewLead] Fatal error for application ${input.id}:`, error);
            return failure(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * Maneja el flujo de comunicación multicanal basado en el perfil del lead.
     */
    private async handleNotifications(lead: Lead, analysis: any, entity: LeadEntity): Promise<void> {
        // Notificación al equipo (Admin)
        await this.emailRepo.send({
            to: 'richardmendezmatos@gmail.com',
            subject: `🦅 New Lead - ${lead.firstName} ${lead.lastName} (Score: ${analysis.score})`,
            html: `<h2>New Lead Received</h2><p><strong>Applicant:</strong> ${lead.firstName} ${lead.lastName}</p><hr><h3>AI Analysis</h3><p>Score: ${analysis.score}/100 (${analysis.category})</p>`
        });

        // Bienvenida al Cliente (Email)
        if (lead.email) {
            await this.emailRepo.send({
                to: lead.email,
                subject: `🚗 Recibimos tu solicitud`,
                html: `<p>Hola ${lead.firstName}, gracias por elegir Richard Automotive. Te contactaremos pronto.</p>`
            });
        }

        // Bienvenida al Cliente (SMS)
        if (lead.phone) {
            await this.smsRepo.send(lead.phone, `Hola ${lead.firstName}, recibimos tu solicitud en Richard Automotive. Estaremos en contacto.`);
        }

        // WhatsApp Proactivo (Solo para leads de ALTO POTENCIAL)
        if (lead.phone && (analysis.score >= 85 || entity.isHighPotential())) {
            const waMessage = `¡Hola ${lead.firstName}! Soy Richard de Richard Automotive. 🦅🚀 Tu perfil califica para atención prioritaria. ¿Coordinamos una videollamada hoy?`;
            await this.whatsAppRepo.sendMessage(lead.phone, waMessage);
            console.log(`[WhatsApp Automation] Nudge sent to high-priority lead.`);
        }
    }
}
