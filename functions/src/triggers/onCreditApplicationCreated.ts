import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { hubspotService } from '../services/hubspotService';
import { sendTwilioMessage } from '../services/twilioService';
import { sendPlainEmail } from '../services/sendgridService';
import { Lead } from '../domain/entities';

export const onCreditApplicationCreated = onDocumentCreated(
  {
    document: 'credit_applications/{appId}'
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const appId = event.params.appId;

    logger.info(`[F&I] Nuevo formulario de crédito detectado: ${appId}`);

    try {
      // 1. Map data to Lead entity for HubSpot
      const lead: Lead = {
        id: appId,
        status: 'new',
        firstName: data.personalInfo?.firstName || '',
        lastName: data.personalInfo?.lastName || '',
        email: data.personalInfo?.email || '',
        phone: data.personalInfo?.phone || '',
        monthlyIncome: data.employmentInfo?.monthlyIncome,
        workStatus: data.employmentInfo?.employmentStatus,
        tradeIn: data.vehicleInfo?.tradeInValue ? 'Yes' : 'No',
        hasPronto: data.vehicleInfo?.downPayment > 0,
        vehicleOfInterest: data.vehicleInfo?.vehicleOfInterest,
      };

      // 2. Sync to HubSpot (Create Contact & Deal in F&I Pipeline)
      logger.info(`[F&I] Syncing to HubSpot...`);
      const contactId = await hubspotService.syncLeadToHubSpot(lead);
      if (contactId) {
         logger.info(`[F&I] HubSpot Sync Exitoso. Contact ID: ${contactId}`);
      }

      // 3. Send SMS/WhatsApp confirmation via Twilio
      if (lead.phone) {
        const message = `¡Hola ${lead.firstName}! Recibimos tu solicitud de pre-aprobación en Richard Automotive. Nuestro equipo de Financiamiento la está revisando y te daremos respuesta en minutos. 🚗💨`;
        await sendTwilioMessage(lead.phone, message);
        logger.info(`[F&I] SMS enviado al prospecto: ${lead.phone}`);
      }

      // 4. Send Email confirmation via SendGrid
      if (lead.email) {
        const subject = `Recibimos tu solicitud de Financiamiento - Richard Automotive 🦅`;
        const htmlBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #0b1a27;">¡Hola ${lead.firstName}!</h2>
            <p>Queremos confirmarte que hemos recibido exitosamente tu solicitud de pre-aprobación de crédito vehicular.</p>
            <p>Nuestro equipo de Financiamiento en <strong>Richard Automotive</strong> ya está en proceso de revisar tu perfil con la banca local para conseguirte las mejores tasas posibles, incluso si no tienes pronto pago.</p>
            <p>Te estaremos contactando en breve para darte los resultados.</p>
            <br/>
            <p>Atentamente,</p>
            <p><strong>El equipo de Richard Automotive</strong></p>
          </div>
        `;
        await sendPlainEmail(lead.email, subject, '', htmlBody);
        logger.info(`[F&I] Email de confirmación enviado a: ${lead.email}`);
      }

    } catch (err) {
      logger.error(`[F&I] Error procesando la aplicación de crédito ${appId}`, err);
    }
  },
);
