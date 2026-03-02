import { Client } from '@notionhq/client';
import * as logger from 'firebase-functions/logger';
import { defineFlow } from '@genkit-ai/flow';
import { z } from '@genkit-ai/core';

// Instanciar Notion Client.
const notion = new Client({ auth: process.env.NOTION_API_TOKEN });

/**
 * Función para inicializar el progreso de F&I de un prospecto
 * en la Base de Datos de Notion.
 */
export const createFiProgressInNotionFlow = defineFlow(
  {
    name: 'createFiProgressInNotion',
    inputSchema: z.object({
      clientName: z.string().optional(),
      status: z.string().optional(),
      summary: z.string().optional(),
      phone: z.string().optional(),
      score: z.number().optional(),
      income: z.number().optional(),
      ssn: z.string().optional(),
      unitPrice: z.number().optional(),
      tradeIn: z.number().optional(),
      netToFinance: z.number().optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      pageId: z.string().optional(),
      message: z.string().optional(),
    }),
  },
  async (data) => {
    try {
      const databaseId = process.env.NOTION_DATABASE_ID;

      // Validar configuración existente. Si el ID no existe en el proyecto, omitir por ahora.
      if (!databaseId) {
        logger.warn(
          'NOTION_DATABASE_ID no está configurado. La persistencia bidireccional se interrumpió.',
        );
        return { success: false, message: 'Database ID not configured' };
      }

      // Estructura agnóstica de página para crear
      const response = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: data.clientName || 'Lead Sin Nombre',
                },
              },
            ],
          },
          Status: {
            select: {
              name: data.status || 'Nuevo Lead',
            },
          },
          Summary: {
            rich_text: [
              {
                text: {
                  content: data.summary || 'Ninguno',
                },
              },
            ],
          },
          Teléfono: {
            phone_number: data.phone || '',
          },
          SSN: {
            rich_text: [{ text: { content: data.ssn || '' } }],
          },
          Score: {
            number: data.score || 0,
          },
          Ingresos: {
            number: data.income || 0,
          },
          'Valor Unidad': {
            number: data.unitPrice || 0,
          },
          'Trade-In': {
            number: data.tradeIn || 0,
          },
          'Neto a Financiar': {
            number: data.netToFinance || 0,
          },
        },
      });

      logger.info(`Notion sincronizado exitosamente para Lead ${data.clientName}`);
      return { success: true, pageId: response.id };
    } catch (error: any) {
      logger.error('Error sincronizando con Notion:', error);
      return { success: false, message: error.message || 'Error Inesperado' };
    }
  },
);
