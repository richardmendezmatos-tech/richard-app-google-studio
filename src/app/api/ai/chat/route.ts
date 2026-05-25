import { GoogleGenerativeAI } from '@google/generative-ai';
import { RICHARD_KNOWLEDGE_BASE } from '@/entities/knowledge';
import { FINANCIAL_ENTITIES_PR } from '@/shared/config/financialEntities';
import { MARKET_INTELLIGENCE_PR } from '@/shared/config/marketIntelligence';
import { sentinelAI } from '@/shared/api/ai/sentinelAI';
import { searchSemanticInventory } from '@/shared/api/supabase/supabaseClient';
import { aiTools } from '@/shared/api/ai/tools';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, leadId } = await req.json();

    // 1. RAG Semántico en Tiempo Real
    let semanticContext = '';
    const lastMessage = messages[messages.length - 1];

    if (lastMessage && lastMessage.role === 'user' && typeof lastMessage.content === 'string') {
      const text = lastMessage.content;
      const hasSearchIntent =
        /quiero|busco|interes|auto|carro|guagua|pickup|suv|sedan|precio|pago|cuota|financiar|comprar/i.test(text);

      if (hasSearchIntent && text.length > 5) {
        console.log(`[AI Chat RAG] Detectada intención de búsqueda: "${text}"`);
        try {
          const embedding = await sentinelAI.generateEmbedding(text);
          const matches = await searchSemanticInventory(embedding, 0.35, 3);

          if (matches && matches.length > 0) {
            console.log(`[AI Chat RAG] ${matches.length} coincidencias.`);
            const carIds = matches.map((m) => m.car_id);
            const { getSupabase: gs } = await import('@/shared/api/supabase/supabaseClient');
            const sb = await gs();
            const { data: dbCars } = await sb.from('inventory').select('vin, year, make, model, condition, id, price, description, status').in('vin', carIds).limit(50);

            if (dbCars && dbCars.length > 0) {
              semanticContext = `
              UNIDADES RELEVANTES DISPONIBLES:
              ${dbCars.map((c: any) => `
                - ${c.year} ${c.make} ${c.model} (${c.condition === 'new' ? 'Nueva' : 'Usada'})
                  ID: ${c.id} | Precio: $${c.price?.toLocaleString()}
              `).join('\n')}
              RECOMIENDA estas unidades con sus precios reales.
              `;
            }
          }
        } catch (ragError) {
          console.warn('[AI Chat RAG] Error:', ragError);
        }
      }
    }

    const systemPrompt = `
      ${RICHARD_KNOWLEDGE_BASE}

      ESTRATEGIA FINANCIERA PR:
      - Bancos locales: Banco Popular PR, FirstBank PR.
      - Entidades: ${FINANCIAL_ENTITIES_PR.filter((e) => e.tier === 1).map((e) => `${e.name} (${e.baseRate}% APR)`).join(', ')}.

      INTELIGENCIA DE MERCADO:
      - ${MARKET_INTELLIGENCE_PR.regionalInsights.metro}
      - Marcas: ${MARKET_INTELLIGENCE_PR.powerBrands.map((b) => b.name).join(', ')}

      PAGO TODO INCLUIDO: La cuota mensual ya incluye Contrato de Servicio Premium.

      ${semanticContext}

      REGLAS:
      1. Eres asistente de Richard Automotive, sé profesional y servicial.
      2. Si el cliente está interesado, captura su nombre y teléfono.
      3. Jamás uses placeholders. Si te falta info, invítalo a hablar con Richard.
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage?.content || '');

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let full = '';
        for await (const chunk of result.stream) {
          const delta = chunk.text();
          if (delta) {
            full += delta;
            controller.enqueue(encoder.encode(delta));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[AI Chat API] Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal AI Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
