import { z } from 'zod';
import { generateObject } from 'ai';
import { gemini15Flash } from '@/features/ai-hub/api/aiManager';

export const IntentSchema = z.enum([
  'SALES_INQUIRY',
  'FINANCE_QUERY',
  'INVENTORY_SEARCH',
  'LEAD_QUALIFICATION',
  'GENERAL_CHAT',
]);

export const classificationFlow = async (input: string) => {
  const result = await generateObject({
    model: gemini15Flash,
    output: 'enum',
    enum: IntentSchema.options,
    prompt: `Analiza el mensaje del usuario y clasifícalo en UNA sola categoría:
        - SALES_INQUIRY: Preguntas genéricas de ventas o sobre el dealer.
        - FINANCE_QUERY: Preguntas sobre pagos, tasas, crédito o bancos.
        - INVENTORY_SEARCH: Búsqueda de autos específicos o tipos de autos.
        - LEAD_QUALIFICATION: Información sobre empleo, ingresos o trade-in.
        - GENERAL_CHAT: Saludos o charla no relacionada a ventas.

        Mensaje: "${input}"
        
        RETORNA SOLO EL NOMBRE DE LA CATEGORÍA EN MAYÚSCULAS.`,
    temperature: 0,
  });

  const text = result.object;
  // Fallback to GENERAL_CHAT if not matching
  return IntentSchema.options.includes(text as any) ? (text as any) : 'GENERAL_CHAT';
};
