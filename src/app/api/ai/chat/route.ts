import { streamText, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import { RICHARD_KNOWLEDGE_BASE } from '@/entities/knowledge';
import { FINANCIAL_ENTITIES_PR } from '@/shared/config/financialEntities';
import { MARKET_INTELLIGENCE_PR } from '@/shared/config/marketIntelligence';
import { sentinelAI } from '@/shared/api/ai/sentinelAI';
import { searchSemanticInventory } from '@/shared/api/supabase/supabaseClient';
import { aiTools } from '@/shared/api/ai/tools';
import { conversationMemory } from '@/shared/api/ai/conversationMemory';

export const runtime = 'nodejs';
export const maxDuration = 45;

export async function POST(req: Request) {
  try {
    const { messages, leadId } = await req.json();
    const sessionId = leadId || 'anonymous';
    const lastMessage = messages?.[messages.length - 1];
    const userText: string = lastMessage?.content || '';

    // RAG: semantic inventory search on purchase intent
    let semanticContext = '';
    const hasSearchIntent =
      /quiero|busco|interes|auto|carro|guagua|pickup|suv|sedan|precio|pago|cuota|financiar|comprar/i.test(
        userText,
      );

    if (hasSearchIntent && userText.length > 5) {
      try {
        const embedding = await sentinelAI.generateEmbedding(userText);
        const matches = await searchSemanticInventory(embedding, 0.35, 3);
        if (matches?.length) {
          const { getSupabase: gs } = await import('@/shared/api/supabase/supabaseClient');
          const sb = await gs();
          const { data: dbCars } = await sb
            .from('inventory')
            .select('vin, year, make, model, condition, id, price, description, status')
            .in('vin', matches.map((m) => m.car_id))
            .limit(50);
          if (dbCars?.length) {
            semanticContext = `\nUNIDADES RELEVANTES DISPONIBLES:\n${dbCars
              .map(
                (c: any) =>
                  `- ${c.year} ${c.make} ${c.model} (${c.condition === 'new' ? 'Nueva' : 'Usada'}) ID:${c.id} $${c.price?.toLocaleString()}`,
              )
              .join('\n')}\nRECOMIENDA estas unidades con sus precios reales.\n`;
          }
        }
      } catch (ragErr) {
        console.warn('[AI Chat RAG] Error:', ragErr);
      }
    }

    const systemPrompt = `${RICHARD_KNOWLEDGE_BASE}

ESTRATEGIA COMERCIAL "FORD-FIRST":
- Prioridad: Ford Nuevo (garantía 3/36k o 5/60k, SYNC 4, Ford Credit) → Ford CPO → Ford usado → otra marca.
- Siempre destaca la cuota mensual, nunca solo el precio total.
- Menciona el Bono Web de $300 para solicitudes online.
- Financiamiento: ${FINANCIAL_ENTITIES_PR.filter((e) => e.tier === 1)
      .map((e) => `${e.name} (${e.baseRate}% APR)`)
      .join(', ')}.
- ${MARKET_INTELLIGENCE_PR.regionalInsights.metro}
${semanticContext}

HERRAMIENTAS DISPONIBLES (úsalas cuando aplique):
- searchInventory: cuando el cliente busca un auto específico.
- calculateLoanPayment: cuando preguntan por cuota mensual.
- estimateTradeIn: cuando mencionan entregar su auto.
- scheduleTestDrive: cuando quieren agendar una visita o prueba de manejo.
- captureCustomerLead: cuando compartan nombre y teléfono.
- requestHumanAgent: cuando el cliente pida hablar con Richard directamente o esté frustrado.

REGLAS:
1. Sé profesional, cálido y boricua. Usa "guagua", "pronto", "unidad".
2. Nunca uses placeholders. Si falta info, invita a visitar o llamar.
3. Si el cliente pide hablar con un humano, usa requestHumanAgent inmediatamente.`;

    // Map UI messages to CoreMessage format for streamText
    const coreMessages = messages
      .map((m: any) => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: typeof m.content === 'string' ? m.content : '',
      }))
      .filter((m: any) => m.content.trim());

    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      messages: coreMessages,
      tools: aiTools,
      stopWhen: stepCountIs(3),
      onFinish: async ({ text }) => {
        // Persist conversation for analytics and future context (non-blocking)
        if (text) {
          conversationMemory.saveWebTurn(sessionId, userText, text).catch(() => {});
        }
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
