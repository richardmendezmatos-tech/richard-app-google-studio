import { z } from 'zod';
import {
  LeadRepository,
  EmailRepository,
  SMSRepository,
  MetaRepository,
  WhatsAppRepository,
} from '../../../domain/repositories';
import { ScoreCalculator } from './ScoreCalculator.usecase';
import { Lead, LeadEntity } from '../../../domain/entities';
import { Result, success, failure } from '../../../domain/types';
import { hubspotService } from '../../../services/hubspotService';

/**
 * Esquema de entrada estricto para nuevas solicitudes de Lead.
 */
export const LeadApplicationInputSchema = z.object({
  id: z.string(),
  data: z.any(), // Se valida internamente con LeadEntity
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
    private whatsAppRepo: WhatsAppRepository,
  ) {}

  /**
   * Ejecuta el procesamiento integral de una nueva solicitud.
   */
  async execute(input: LeadApplicationInput): Promise<Result<void>> {
    try {
      const appId = input.id;
      const leadData = input.data;

      // 1. Validación de Entidad (Fail-fast strategy)
      let leadEntity: LeadEntity;
      try {
        leadEntity = LeadEntity.create(leadData);
      } catch (validationError: any) {
        console.error(`[CRÍTICO] Error de validación al procesar lead ${appId}:`, {
          error:
            validationError instanceof Error ? validationError.message : String(validationError),
          data: JSON.stringify(leadData),
        });
        throw validationError; // Re-throw to ensure function marks as failed
      }

      const lead = leadEntity.data;

      // 1. Lógica de Dominio: Scoring & Análisis
      const analysis = ScoreCalculator.execute(lead);
      const updatedLead: Partial<Lead> = {
        aiAnalysis: analysis,
        status: analysis.score > 80 ? 'pre-approved' : 'new',
        timestamp: new Date(),
      };

      // 2. Persistencia (Infraestructura)
      await this.leadRepo.updateLead(appId, updatedLead);
      console.log(`[ProcessNewLead] Persisted lead: ${appId} (Status: ${updatedLead.status})`);

      // 3. Orquestación de Notificaciones (Efectos Secundarios)
      await this.handleNotifications(lead, analysis, leadEntity, appId);

      // 4. Marketing & CRM Data Flow
      const finalLead = { ...lead, ...updatedLead } as Lead;
      await this.metaRepo.sendLeadEvent(lead.email, lead.phone, lead);
      await hubspotService.syncLeadToHubSpot(finalLead);

      // 5. Automatic F&I Pre-Desking Cockpit (Option C)
      if (lead.vehicleId) {
        try {
          const { SupabaseInventoryRepository } = await import('../../../../entities/inventory/api/SupabaseInventoryRepository');
          const { createClient } = await import('../../../../shared/api/supabase/client');
          const { calculateFIDeal } = await import('../../../../features/deal-desker/lib/fiCalculator');
          const { DealApi } = await import('../../../../entities/deal/api/dealApi');

          const supabaseClient = createClient();
          const inventoryRepo = new SupabaseInventoryRepository(supabaseClient);
          const vehicle = await inventoryRepo.getCarById(lead.vehicleId);

          if (vehicle) {
            const isFord = vehicle.make?.toLowerCase().includes('ford');
            const isLeasingEligible = isFord && vehicle.price >= 35000;

            const structureType = isLeasingEligible ? 'leasing' : 'conventional';
            const term = isLeasingEligible ? 60 : 72; // default 60m leasing, 72m conventional
            const gapInsuranceEnabled = isLeasingEligible; // GAP included for leasing

            const creditTier = 'tier_1'; // baseline excellent for auto-desking

            // Calculate precise F&I deal
            const calcResult = calculateFIDeal({
              vehiclePrice: vehicle.price,
              downPayment: lead.downPaymentAmount || 0,
              tradeInValue: 0,
              tradeInPayoff: 0,
              term,
              apr: 5.95, // excellent tier default APR
              gapInsuranceEnabled,
              extendedWarrantyEnabled: false,
              powerPackEnabled: false,
              diamondCeramicEnabled: false,
              structureType,
              vehicleYear: vehicle.year,
              vehicleCondition: vehicle.condition === 'new' ? 'new' : 'used',
              creditTier
            });

            // Persist the pre-desked deal in Supabase
            await DealApi.createDeal({
              leadId: appId,
              inventoryId: lead.vehicleId,
              creditTier,
              downPayment: lead.downPaymentAmount || 0,
              tradeInValue: 0,
              tradeInPayoff: 0,
              term: term as any,
              apr: calcResult.apr,
              ltv: calcResult.ltv,
              estimatedMonthlyPayment: calcResult.monthlyPayment,
              frontEndProfit: calcResult.frontEndProfit,
              backEndProfit: calcResult.backEndProfit,
              bankSelected: 'popular', // PR preferred local bank
              status: 'structured',
              structureType,
              residualValue: calcResult.residualValue
            });

            console.log(`[F&I Auto-Desking] Successfully persisted ${structureType} deal for lead ${appId} on vehicle ${lead.vehicleId}`);
          } else {
            console.warn(`[F&I Auto-Desking] Vehicle ${lead.vehicleId} not found in inventory.`);
          }
        } catch (autoDeskingError) {
          console.error('[F&I Auto-Desking] Error during automatic F&I pre-desking calculation/persist:', autoDeskingError);
        }
      }

      return success(undefined);
    } catch (error) {
      console.error(`[ProcessNewLead] Fatal error for application ${input.id}:`, error);
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Maneja el flujo de comunicación multicanal basado en el perfil del lead.
   */
  private async handleNotifications(
    lead: Lead,
    analysis: any,
    entity: LeadEntity,
    leadId: string,
  ): Promise<void> {
    const baseUrl = process.env.VITE_APP_URL || 'https://richard-automotive.com';
    const crmLink = `${baseUrl}/admin/pipeline?leadId=${leadId}`;

    // Notificación al equipo (Admin)
    await this.emailRepo.send({
      to: 'richardmendezmatos@gmail.com',
      subject: `🦅 NUEVO LEAD: ${lead.firstName} ${lead.lastName} (Score: ${analysis.score})`,
      html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #0891b2;">🚀 Nuevo Lead Recibido</h2>
                    <p><strong>Candidato:</strong> ${lead.firstName} ${lead.lastName}</p>
                    <p><strong>Email:</strong> ${lead.email || 'N/A'}</p>
                    <p><strong>Teléfono:</strong> ${lead.phone || 'N/A'}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <h3>🧠 Análisis de IA</h3>
                    <p><strong>Score:</strong> ${analysis.score}/100</p>
                    <p><strong>Categoría:</strong> ${analysis.category.toUpperCase()}</p>
                    <p><strong>Insights:</strong> ${analysis.insights || 'Sin insights adicionales'}</p>
                    <br>
                    <a href="${crmLink}" style="background: #0891b2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver en CRM Board</a>
                </div>
            `,
    });

    // Bienvenida al Cliente (Email)
    if (lead.email) {
      await this.emailRepo.send({
        to: lead.email,
        subject: `🚗 Recibimos tu solicitud`,
        html: `<p>Hola ${lead.firstName}, gracias por elegir Richard Automotive. Te contactaremos pronto.</p>`,
      });
    }

    // Bienvenida al Cliente (SMS)
    if (lead.phone) {
      await this.smsRepo.send(
        lead.phone,
        `Hola ${lead.firstName}, recibimos su solicitud en Richard Automotive. Estaremos en contacto.`,
      );
    }

    // WhatsApp Proactivo Integrado (Universal + VIP)
    if (lead.phone) {
      if (analysis.score >= 85 || entity.isHighPotential()) {
        const waMessage = `¡Hola ${lead.firstName}! Le habla Richard de Richard Automotive. 🦅🚀 Hemos analizado su solicitud y califica para atención estratégica prioritaria. ¿Podemos coordinar una cita hoy en el Richard Automotive Command Center?`;
        await this.whatsAppRepo.sendMessage(lead.phone, waMessage);
        console.log(`[WhatsApp Automation] Ruteo VIP enviado a: ${lead.phone}`);
      } else {
        const waMessage = `¡Hola ${lead.firstName}! Recibimos su solicitud en Richard Automotive. 🚗 Su perfil comercial está siendo evaluado por un asesor. ¿Desea ver detalles técnicos de alguna unidad en particular?`;
        await this.whatsAppRepo.sendMessage(lead.phone, waMessage);
        console.log(`[WhatsApp Automation] Welcome Nudge estándar enviado a: ${lead.phone}`);
      }
    }
  }
}
