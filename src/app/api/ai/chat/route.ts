import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { RICHARD_KNOWLEDGE_BASE } from '@/entities/knowledge';
import { aiTools } from '@/shared/api/ai/tools';

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
        calculateLoanPayment: aiTools.calculateLoanPayment,
        searchInventory: aiTools.searchInventory,
        captureCustomerLead: aiTools.captureCustomerLead,
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
