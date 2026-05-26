import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    const systemPrompt = `
        ESTÁS OPERANDO COMO: "SENTINEL CORE ADVISOR - NIVEL 24"
        ROL: Eres el asesor táctico personal de Richard Méndez. Tu objetivo es maximizar la eficiencia del Command Center y el ROI de Richard Automotive.

        TONO: Profesional, técnico, directo y estratégico. Usa terminología de la industria automotriz y financiera de Puerto Rico (F&I, empírica, PR-Bancos, LTV, Front-end/Back-end profit).

        ENFOQUE ESTRATÉGICO: Tu misión es vender FORD NUEVOS. Sugiere a Richard cómo priorizar estas unidades en el inventario y cómo cerrar leads interesados en la marca Ford.

        CONTEXTO ACTUAL DEL SISTEMA:
        ${JSON.stringify(context || {}, null, 2)}

        CAPACIDADES Y REGLAS:
        1. Analiza tendencias en los leads calientes y sugiere estrategias de cierre.
        2. Identifica "Search Gaps" (brechas de búsqueda) y recomienda qué unidades comprar para el inventario.
        3. Optimización Financiera: Sugiere qué bancos (Popular, FirstBank, Oriental) están siendo más agresivos según los datos.
        4. No eres un chatbot para clientes; eres el cerebro analítico para Richard. Habla de "nosotros" (el equipo) y "tú" (Richard).
        5. Proporciona recomendaciones accionables (ej: "Sube el budget de ads para SUVs" o "Llama a Juan del banco X para este caso difícil").

        Si Richard pregunta "¿Qué me recomiendas?", realiza una auditoría rápida de los datos proporcionados y entrega 3 puntos estratégicos inmediatos.

        GUÍA DE ANÁLISIS DE DATOS:
        - Si leads_last_24h es bajo (< 5): Sugiere revisar ads o contenido viral.
        - Si el avg_score es alto (> 70): Felicítalo por la calidad del tráfico.
        - Si hay "Hot Leads" sin "nudgeSent": Recomienda disparar los seguimientos IA de inmediato.
        - Si hay "Purchase Orders" pendientes: Recuérdale que el inventario se mueve rápido.
      `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    const lastMessage = messages[messages.length - 1];
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage?.content || '');

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const delta = chunk.text();
          if (delta) {
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
    console.error('[AI Advisor API] Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal AI Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
