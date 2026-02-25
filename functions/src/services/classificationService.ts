import { z } from 'genkit';
import { ai } from './aiManager';

export const IntentSchema = z.enum([
    'SALES_INQUIRY',
    'FINANCE_QUERY',
    'INVENTORY_SEARCH',
    'LEAD_QUALIFICATION',
    'GENERAL_CHAT'
]);

export const classificationFlow = ai.defineFlow(
    {
        name: 'classifyIntent',
        inputSchema: z.string(),
        outputSchema: IntentSchema,
    },
    async (input) => {
        const result = await ai.generate({
            prompt: `Analiza el mensaje del usuario y clasifícalo en UNA sola categoría:
            - SALES_INQUIRY: Preguntas genéricas de ventas o sobre el dealer.
            - FINANCE_QUERY: Preguntas sobre pagos, tasas, crédito o bancos.
            - INVENTORY_SEARCH: Búsqueda de autos específicos o tipos de autos.
            - LEAD_QUALIFICATION: Información sobre empleo, ingresos o trade-in.
            - GENERAL_CHAT: Saludos o charla no relacionada a ventas.

            Mensaje: "${input}"
            
            RETORNA SOLO EL NOMBRE DE LA CATEGORÍA EN MAYÚSCULAS.`,
            config: { temperature: 0 }
        });

        const text = result.text.trim().toUpperCase();
        // Fallback to GENERAL_CHAT if not matching
        return IntentSchema.options.includes(text as any) ? (text as any) : 'GENERAL_CHAT';
    }
);
