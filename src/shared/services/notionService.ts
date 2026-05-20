import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_TOKEN });

interface FiProgressData {
  clientName?: string;
  status?: string;
  summary?: string;
  phone?: string;
  score?: number;
  income?: number;
  ssn?: string;
  unitPrice?: number;
  tradeIn?: number;
  netToFinance?: number;
}

export async function createFiProgressInNotion(data: FiProgressData) {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;

    if (!databaseId) {
      console.warn(
        'NOTION_DATABASE_ID no está configurado. La persistencia bidireccional se interrumpió.',
      );
      return { success: false, message: 'Database ID not configured' };
    }

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

    console.info(`Notion sincronizado exitosamente para Lead ${data.clientName}`);
    return { success: true, pageId: response.id };
  } catch (error: any) {
    console.error('Error sincronizando con Notion:', error);
    return { success: false, message: error.message || 'Error Inesperado' };
  }
}
