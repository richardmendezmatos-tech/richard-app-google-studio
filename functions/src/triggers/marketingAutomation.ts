import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { Lead } from '../domain/entities';

// TODO: Implement infrastructure interfaces natively inside /functions/src to avoid bridging into React /src/


export const onLeadInactivityNurturing = onDocumentUpdated(
  {
    document: 'applications/{leadId}',
    secrets: ['SENDGRID_API_KEY', 'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
  },
  async (event) => {
    const before = event.data?.before.data() as Lead;
    const after = event.data?.after.data() as Lead;
    
    if (!before || !after) return;
    
    // Solo nutrimos si el status no es "sold" o "lost", y el score es prometedor
    if (after.status === 'sold' || after.status === 'lost') return;
    if ((after.aiAnalysis?.score ?? 0) < 50) return;

    // Supongamos que en lugar de un CRON, disparamos esto cuando hay una actualización "inactiva" 
    // Por motivos de la demostración arquitectónica, simulamos la intención de envío:
    logger.info(`[MARKETING AUTO] Evaluando Nurture Sequence para Lead: ${after.id}`);

    // Solo como proof of concept de la Inteligencia Silenciosa
    const lastInteractionStr = after.timestamp?.toString() || '';
    if (lastInteractionStr && before.timestamp !== after.timestamp) {
        logger.info(`Lead interactuó, reiniciando cronómetros de Nurturing`);
        return;
    }

    // Si entra a la secuencia de Nurturing y tiene Score alto, usar Antigravity para personalizar
    try {
      /* 
       * TODO: Mover lógica a una clase de Dominio interna de Firebase Functions
       * 
       const action = await getAntigravityOutreachAction(after, { ... });
       if (action) {
         if (action.channel === 'email' && after.email) { ... }
       }
       */
      logger.info('[MARKETING AUTO] Antigravity Outreach en modo stand-by (desacoplado temporalmente)');
    } catch (error) {
      logger.error('[MARKETING AUTO] Falla en la orquestación del mensaje', error);
    }
  }
);
