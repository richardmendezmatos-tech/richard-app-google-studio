import * as logger from 'firebase-functions/logger';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { createFiProgressInNotionFlow } from '../services/notionService';
import { runFlow } from '@genkit-ai/flow';

/**
 * Recibe un payload desde el Agente Front-End (Gemini UI) con el resumen
 * de la entrevista de F&I. Lo propaga a la Base de Datos de Notion.
 */
export const saveFiProgress = onCall({ cors: true }, async (request) => {
  const { data } = request;

  // 1. Validaciones básicas de seguridad
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'Solo usuarios autenticados pueden guardar progreso en Notion.',
    );
  }

  try {
    const notionResult = await runFlow(createFiProgressInNotionFlow, data);

    if (notionResult.success) {
      logger.info(`Progreso Guardado en Notion. PageId: ${notionResult.pageId}`);
      return { success: true, message: 'Progreso sincronizado.' };
    } else {
      logger.error(`Error reportado por notionService: ${notionResult.message}`);
      throw new HttpsError('internal', 'No se pudo sincronizar pre-cualificación en CRM');
    }
  } catch (error) {
    logger.error('Error crítico en saveFiProgress:', error);
    throw new HttpsError('internal', 'Fallo general sincronizando el progreso F&I');
  }
});
