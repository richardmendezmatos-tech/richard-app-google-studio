import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { lead, context, specs } = await req.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Eres el Asistente Digital de Richard Méndez, Gerente de F&I en Central Ford.
      Tu objetivo es redactar un mensaje de WhatsApp PERSUASIVO y PROFESIONAL para un lead.
      
      CONTEXTO DEL CLIENTE:
      - Nombre: ${lead.name || 'Cliente'}
      - Interés: ${context || 'General'}
      - Specs vistos: ${JSON.stringify(specs || [])}
      
      REGLAS DE ORO:
      1. Usa un tono cercano pero experto ("Richard Automotive Style").
      2. Menciona un dato técnico específico de los specs para demostrar autoridad.
      3. Invita a una acción clara: "Ver mi pago mensual" o "Coordinar test drive".
      4. Mantén el mensaje corto (máximo 3 párrafos cortos).
      5. Usa emojis de forma táctica (🚗, ⚡️, 📉).
      6. Menciona que Richard está disponible para asesoría financiera personalizada.
      
      Responde SOLO con el cuerpo del mensaje de WhatsApp. No incluyas "Hola Richard" ni introducciones.
    `;

    const result = await model.generateContent(prompt);
    const message = result.response.text();

    return NextResponse.json({ message: message.trim() });
  } catch (error) {
    console.error('[SentinelNurture] AI Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate nurture message' }, { status: 500 });
  }
}
