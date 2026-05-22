import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { RICHARD_KNOWLEDGE_BASE } from '@/entities/knowledge';
import { aiTools } from '@/shared/api/ai/tools';
import { FINANCIAL_ENTITIES_PR } from '@/shared/config/financialEntities';
import { MARKET_INTELLIGENCE_PR } from '@/shared/config/marketIntelligence';
import { sentinelAI } from '@/shared/api/ai/sentinelAI';
import { searchSemanticInventory } from '@/shared/api/supabase/supabaseClient';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, leadId } = await req.json();

    // 1. RAG Semántico en Tiempo Real
    let semanticContext = '';
    const lastMessage = messages[messages.length - 1];

    if (lastMessage && lastMessage.role === 'user' && typeof lastMessage.content === 'string') {
      const text = lastMessage.content;
      // Interceptamos consultas con más de 5 caracteres que puedan expresar búsqueda de vehículos
      const hasSearchIntent =
        /quiero|busco|interes|auto|carro|guagua|pickup|suv|sedan|precio|pago|cuota|financiar|comprar/i.test(
          text,
        );

      if (hasSearchIntent && text.length > 5) {
        console.log(`[AI Chat RAG] Detectada intención de búsqueda en mensaje: "${text}"`);
        try {
          const embedding = await sentinelAI.generateEmbedding(text);
          const matches = await searchSemanticInventory(embedding, 0.35, 3);

          if (matches && matches.length > 0) {
            console.log(
              `[AI Chat RAG] Se encontraron ${matches.length} coincidencias en inventario.`,
            );
            const carIds = matches.map((m) => m.car_id);
            const { getSupabase: gs } = await import('@/shared/api/supabase/supabaseClient');
            const sb = await gs();
            const { data: dbCars } = await sb.from('inventory').select('*').in('vin', carIds);

            if (dbCars && dbCars.length > 0) {
              semanticContext = `
              UNIDADES RELEVANTES DISPONIBLES EN INVENTARIO (EN TIEMPO REAL):
              ${dbCars
                .map(
                  (c) => `
                - Unidad: ${c.year} ${c.make} ${c.model} (${c.condition === 'new' ? 'Nueva' : 'Usada'})
                  ID: ${c.id}
                  Precio de Venta: $${c.price?.toLocaleString()}
                  Pago Mensual Estimado: (Simula la cuota incorporando el Contrato de Servicio)
                  Detalles: ${c.description || 'Prestigiosa unidad en excelentes condiciones.'}
              `,
                )
                .join('\n')}
              
              REGLAS DE RECOMENDACIÓN DE INVENTARIO:
              - Recomienda proactivamente y con orgullo estas unidades que ya están en nuestro inventario físico.
              - Refiere al cliente a estas unidades usando sus detalles reales y precios especificados.
              `;
            }
          }
        } catch (ragError) {
          console.warn('[AI Chat RAG] Error al inyectar contexto semántico:', ragError);
        }
      }
    }

    const result = streamText({
      model: google('gemini-2.0-flash'),
      messages,
      system: `
        ${RICHARD_KNOWLEDGE_BASE}

        ESTRATEGIA FINANCIERA PUERTO RICO:
        - Prioriza bancos locales: Banco Popular de PR y FirstBank PR. Son los socios principales para cierres rápidos.
        - Entidades recomendadas: ${FINANCIAL_ENTITIES_PR.filter((e) => e.tier === 1)
          .map((e) => `${e.name} (${e.baseRate}% APR)`)
          .join(', ')}.
        
        INTELIGENCIA DE MERCADO LOCAL (PR):
        - Contexto regional: ${MARKET_INTELLIGENCE_PR.regionalInsights.metro}
        - Marcas dominantes: ${MARKET_INTELLIGENCE_PR.powerBrands.map((b) => b.name).join(', ')}
        - Tono Richard: Usa terminología local (guagua, pronto, marbete, trade-in, millaje) de forma profesional, premium y estratégica.
        
        ESTRATEGIA EXCLUSIVA DE VENTAS (F&I - PAGO TODO INCLUIDO):
        - El producto más importante de Richard Automotive es el CONTRATO DE SERVICIO (Garantía y Protección Extendida).
        - NUNCA desgloses el contrato de servicio como un cargo hostil, inesperado o adicional al final de la cotización.
        - En su lugar, utiliza la estrategia del "PAGO TODO INCLUIDO". Presenta siempre las cuotas mensuales indicando que ya INCORPORAN y CUBREN completamente el Contrato de Servicio Premium, la garantía extendida, la asistencia 24/7 y la protección del dealer.
        - Comunica al cliente la tranquilidad y exclusividad de que su cuota mensual cubre cualquier imprevisto técnico y mantenimiento básico, de manera que está 100% protegido desde el día uno sin pagar un centavo extra.
        - Ejemplo de narrativa: "Tu pago mensual de $495 ya incluye marbete, garantía de fábrica y nuestro Contrato de Servicio Premium todo incluido, para que disfrutes tu guagua con total paz mental."

        ${semanticContext}

        REGLAS DE OPERACIÓN:
        1. Eres el asistente virtual de Richard Automotive.
        2. Siempre sé servicial, sumamente profesional e inspirador de confianza.
        3. Si un cliente está interesado, intenta capturar su nombre y teléfono usando la herramienta 'captureCustomerLead'.
        4. Puedes calcular pagos mensuales usando 'calculateLoanPayment' e integra las coberturas de protección en la cuota final.
        5. Jamás uses placeholders o textos vacíos. Si te falta información, invítalo a hablar con Richard.
      `,
      tools: {
        calculateLoanPayment: aiTools.calculateLoanPayment,
        searchInventory: aiTools.searchInventory,
        captureCustomerLead: aiTools.captureCustomerLead,
      },
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('[AI Chat API] Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal AI Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
