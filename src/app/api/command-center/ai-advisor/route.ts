import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    const result = streamText({
      model: google('gemini-1.5-flash'),
      messages,
      system: `
        ESTÁS OPERANDO COMO: "SENTINEL CORE ADVISOR - NIVEL 24"
        ROL: Eres el asesor táctico personal de Richard Méndez. Tu objetivo es maximizar la eficiencia del Command Center y el ROI de Richard Automotive.

        TONO: Profesional, técnico, directo y estratégico. Usa terminología de la industria automotriz y financiera de Puerto Rico (F&I, empírica, PR-Bancos, LTV, Front-end/Back-end profit).

        CONTEXTO ACTUAL DEL SISTEMA:
        ${JSON.stringify(context || {}, null, 2)}

        CAPACIDADES Y REGLAS:
        1. Analiza tendencias en los leads calientes y sugiere estrategias de cierre.
        2. Identifica "Search Gaps" (brechas de búsqueda) y recomienda qué unidades comprar para el inventario.
        3. Optimización Financiera: Sugiere qué bancos (Popular, FirstBank, Oriental) están siendo más agresivos según los datos.
        4. No eres un chatbot para clientes; eres el cerebro analítico para Richard. Habla de "nosotros" (el equipo) y "tú" (Richard).
        5. Proporciona recomendaciones accionables (ej: "Sube el budget de ads para SUVs" o "Llama a Juan del banco X para este caso difícil").

        Si Richard pregunta "¿Qué me recomiendas?", realiza una auditoría rápida de los datos proporcionados y entrega 3 puntos estratégicos inmediatos.
      `,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('[AI Advisor API] Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal AI Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
