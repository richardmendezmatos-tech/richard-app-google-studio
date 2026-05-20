import { z } from 'zod';
import { Lead } from '../../../domain/entities';
import { Result, success, failure } from '../../../domain/types';
// emailService functions are used via inline dynamic imports below
import { whatsappAgentService } from '../../../services/whatsappAgentService';
import { saveCheckpoint } from '../../../services/persistenceService';

export const RetargetingInputSchema = z.object({
  leadId: z.string(),
  leadName: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  vehicleInterest: z.string().optional(),
  score: z.number(),
  monthlyBudget: z.number().optional(),
  downPayment: z.number().optional(),
});

export type RetargetingInput = z.infer<typeof RetargetingInputSchema>;

/**
 * Use Case: TriggerRetargeting
 * Triggers pro-active omnichannel retargeting campaigns (Email & WhatsApp)
 * using localized Puerto Rican terminology for premium customer engagement.
 */
export class TriggerRetargeting {
  static async execute(input: RetargetingInput): Promise<Result<{ emailSent: boolean; whatsappSent: boolean }>> {
    try {
      console.log(`[RetargetingAgent] Analyzing triggers for hot lead ${input.leadName} (Score: ${input.score})`);

      let emailSent = false;
      let whatsappSent = false;

      // Only trigger for high-intent leads (Score >= 75)
      if (input.score < 75) {
        console.log(`[RetargetingAgent] Lead score (${input.score}) below threshold (75). Retargeting skipped.`);
        return success({ emailSent, whatsappSent });
      }

      const vehicle = input.vehicleInterest || 'la guagua de tus sueños';
      const pronto = input.downPayment ? `$${input.downPayment.toLocaleString()}` : 'un pronto de excelencia acomodado a tu bolsillo';
      const cuota = input.monthlyBudget ? `$${input.monthlyBudget.toLocaleString()}` : 'una cuota de show';

      // 1. Omnichannel Email Outreach (via Resend/Email service)
      if (input.email) {
        const subject = `🦅 ¡Sal montao hoy mismo! Trato VIP exclusivo para ti en Richard Automotive`;
        const html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-family: monospace; font-size: 10px; font-weight: bold; color: #06b6d4; letter-spacing: 2px; text-transform: uppercase;">VEGA ALTA MISSION UPLINK</span>
              <h1 style="color: #0f172a; margin-top: 10px; font-size: 24px; text-transform: uppercase; tracking: 1px;">🦅 Richard Automotive</h1>
            </div>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 20px;">
            <p style="font-size: 16px; color: #334155; line-height: 1.6;">
              ¡Saludos, <strong>${input.leadName}</strong>! 
            </p>
            <p style="font-size: 15px; color: #334155; line-height: 1.6;">
              Aquí Richard, de <strong>Richard Automotive Command Center</strong> en Vega Alta. Analicé personalmente tu solicitud y tienes un perfil comercial espectacular. Sé que estás buscando esa <strong>${vehicle}</strong> para salir a chinchorrear el fin de semana, y no quiero que te la pierdas.
            </p>
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #06b6d4;">
              <h3 style="margin-top: 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">📋 Propuesta Estructurada VIP:</h3>
              <ul style="padding-left: 20px; margin-bottom: 0; color: #475569; font-size: 14px; line-height: 1.6;">
                <li><strong>Unidad de Interés:</strong> ${vehicle} (Garantizada y certificada)</li>
                <li><strong>Pronto de Excelencia:</strong> ${pronto}</li>
                <li><strong>Cuota Cómoda de Show:</strong> ${cuota} al mes</li>
                <li><strong>Estatus de Calificación:</strong> PRE-APROBADO PRIORITARIO 🚀</li>
              </ul>
            </div>
            <p style="font-size: 15px; color: #334155; line-height: 1.6;">
              Nuestra meta es tenerte <strong>montao</strong> con los mejores términos de financiamiento en todo Puerto Rico. Las tasas están de show y el inventario vuela rápido.
            </p>
            <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
              <a href="https://richard-automotive.com/qualify" style="background-color: #0f172a; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(15,23,42,0.15); text-transform: uppercase; letter-spacing: 1px;">Coordinar Cita de Test Drive</a>
            </div>
            <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 30px;">
              Richard Automotive Command Center • Vega Alta, Puerto Rico
            </p>
          </div>
        `;

        try {
          const { sendPlainEmail } = await import('../../../infrastructure/messaging/SendGridAdapter');
          await sendPlainEmail(input.email, subject, html, html);
          emailSent = true;
          console.log(`[RetargetingAgent] Hyper-personalized retargeting email sent to ${input.email}`);
        } catch (emailErr) {
          console.error(`[RetargetingAgent] Failed to send email to ${input.email}`, emailErr);
        }
      }

      // 2. Omnichannel WhatsApp Proactive Nudge (via Twilio/WhatsApp)
      if (input.phone) {
        const waMessage = `¡Qué la que hay, ${input.leadName}! 🦅 Soy Richard. Vi que te interesó la *${vehicle}*. Te acabo de preparar un combo premium: cuota cómoda y un *pronto de excelencia* para que salgas montao hoy mismo para el chinchorreo. ¿Te gustaría pasar hoy a Vega Alta a probarla? 🚗💨`;
        
        try {
          const { sendTextMessage } = await import('@/shared/api/messaging/whatsappClient');
          await sendTextMessage({ to: input.phone, body: waMessage });
          whatsappSent = true;
          console.log(`[RetargetingAgent] Proactive WhatsApp nudge sent to ${input.phone}`);
        } catch (waErr) {
          console.error(`[RetargetingAgent] Failed to send WhatsApp nudge to ${input.phone}`, waErr);
        }
      }

      // 3. Document Checkpoint in Workspace for Auditability
      await saveCheckpoint({
        id: `retarget-${input.leadId}`,
        fecha: new Date().toISOString().split('T')[0],
        categoria: 'AUTOMATION_OUTREACH',
        titulo: `Omnichannel Retargeting Triggered for ${input.leadName}`,
        resumen: `Proactive follow-up fired via Email (${emailSent ? 'SENT' : 'SKIPPED'}) and WhatsApp (${whatsappSent ? 'SENT' : 'SKIPPED'}) for vehicle ${vehicle}.`,
        estatus: 'COMPLETED',
        datos: {
          leadId: input.leadId,
          leadName: input.leadName,
          vehicle,
          score: input.score,
          emailSent,
          whatsappSent,
        },
        eficiencia_estimada_Ew: 0.98,
      });

      return success({ emailSent, whatsappSent });
    } catch (error) {
      console.error(`[RetargetingAgent] Fatal error triggering retargeting for ${input.leadId}`, error);
      return failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
