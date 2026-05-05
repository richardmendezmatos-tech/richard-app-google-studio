import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { FINANCIAL_ENTITIES_PR } from '@/shared/config/financialEntities';
import { MARKET_INTELLIGENCE_PR } from '@/shared/config/marketIntelligence';
import { RICHARD_KNOWLEDGE_BASE } from '@/entities/knowledge';
import { supabase } from '@/shared/api/supabase/supabaseClient';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, leadId } = await req.json();

    const result = streamText({
      model: google('gemini-1.5-flash'),
      messages,
      system: `
        ${RICHARD_KNOWLEDGE_BASE}

        ESTRATEGIA FINANCIERA PUERTO RICO:
        - Prioriza bancos locales: Banco Popular de PR y FirstBank PR. Son los socios principales para cierres rápidos.
        - Entidades recomendadas: ${FINANCIAL_ENTITIES_PR.filter(e => e.tier === 1).map(e => `${e.name} (${e.baseRate}% APR)`).join(', ')}.
        
        INTELIGENCIA DE MERCADO LOCAL (PR):
        - Contexto regional: ${MARKET_INTELLIGENCE_PR.regionalInsights.metro}
        - Marcas dominantes: ${MARKET_INTELLIGENCE_PR.powerBrands.map(b => b.name).join(', ')}
        - Tono Richard: Usa terminología local (guagua, pronto, marbete) de forma profesional y estratégica.
        
        REGLAS DE OPERACIÓN:
        1. Eres el asistente virtual de Richard Automotive.
        2. Siempre sé servicial y profesional.
        3. Si un cliente está interesado, intenta capturar su nombre y teléfono usando la herramienta 'captureCustomerLead'.
        4. Puedes calcular pagos mensuales usando 'calculateLoanPayment'.
      `,
      tools: {
        calculateLoanPayment: tool({
          description: 'Calcula el pago mensual exacto para un préstamo de auto basado en el precio, pronto y términos.',
          parameters: z.object({
            price: z.number().describe('Precio total de la unidad incluyendo gastos de dealer ($495).'),
            downPayment: z.number().optional().default(0).describe('Cantidad de pronto o trade-in aportada.'),
            term: z.number().describe('Término del préstamo en meses (ej. 72, 84).'),
            apr: z.number().optional().default(6.95).describe('Tasa de interés estimada (ej. 5.95).'),
          }),
          execute: async ({ price, downPayment, term, apr }) => {
            const balance = price - downPayment;
            const monthlyRate = apr / 100 / 12;
            const payment = (balance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
            return {
              monthlyPayment: Math.round(payment),
              totalInterest: Math.round(payment * term - balance),
              balanceToFinance: balance,
              disclaimer: 'Estimado basado en crédito excelente. Sujeto a aprobación bancaria.',
            };
          },
        }),
        searchInventory: tool({
          description: 'Busca vehículos en el inventario actual de Richard Automotive.',
          parameters: z.object({
            query: z.string().describe('Marca, modelo o tipo de auto (ej. "Toyota", "SUV").'),
            maxPrice: z.number().optional().describe('Presupuesto máximo.'),
          }),
          execute: async ({ query, maxPrice }) => {
            const { data, error } = await supabase
              .from('inventory')
              .select('*')
              .or(`name.ilike.%${query}%,type.ilike.%${query}%`)
              .limit(5);

            if (error) {
              console.error('[AI Tool] Search Error:', error);
              return { error: 'No se pudo consultar el inventario en este momento.' };
            }

            let filtered = data || [];
            if (maxPrice) {
              filtered = filtered.filter((c: any) => c.price <= maxPrice);
            }

            return filtered.map((c: any) => ({
              id: c.id,
              name: c.name,
              price: c.price,
              year: c.year,
              type: c.type,
              status: c.status || 'Disponible',
            }));
          },
        }),
        captureCustomerLead: tool({
          description: 'Registra los datos de contacto de un cliente interesado.',
          parameters: z.object({
            firstName: z.string().describe('Nombre del cliente.'),
            phone: z.string().describe('Teléfono o WhatsApp del cliente.'),
            email: z.string().optional().describe('Correo electrónico.'),
            vehicleOfInterest: z.string().optional().describe('Auto que le interesa.'),
            notes: z.string().optional().describe('Notas adicionales.'),
          }),
          execute: async (leadData) => {
            const { error } = await supabase.from('leads').insert({
              first_name: leadData.firstName,
              phone: leadData.phone,
              email: leadData.email,
              vehicle_of_interest: leadData.vehicleOfInterest,
              notes: leadData.notes,
              source: 'AI Copilot Chat',
              status: 'new'
            });

            if (error) {
              console.error('[AI Tool] Lead Capture Error:', error);
              return { success: false, error: 'Error al guardar los datos.' };
            }

            return {
              success: true,
              message: `¡Gracias ${leadData.firstName}! Hemos recibido tus datos. Richard se pondrá en contacto contigo pronto.`,
            };
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('[AI Chat API] Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal AI Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
