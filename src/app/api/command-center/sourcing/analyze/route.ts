import { NextResponse } from 'next/server';
import { generateStructuredJSON } from '@/shared/api/ai/geminiService';



/**
 * POST /api/command-center/sourcing/analyze
 * 
 * Recibe un query de búsqueda y utiliza IA (Gemini) para generar una
 * recomendación táctica de abasto (Purchase Order Draft).
 */
export async function POST(req: Request) {
  try {
    const { query, count } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const systemInstruction = `
      Eres el Brain de Sourcing de Richard Automotive (Sentinel N15). 
      Tu misión es analizar una búsqueda de cliente no satisfecha (Search Gap)
      y proponer una orden de compra lógica para el mercado de Puerto Rico.

      REGLAS:
      1. ROI: Estima un retorno de inversión real (10-25%).
      2. Prioridad: 'critical' si count > 10, 'high' si count > 5, 'medium' otherwise.
      3. Recomendación: Sé específico con años (ej. 2021-2024) y versiones populares en PR.
      4. Razón: Explica por qué es una buena compra (ej. valor de reventa, escasez en la isla).
      5. Formato: JSON estricto.
    `;

    const prompt = `
      Analiza el siguiente Gap de Búsqueda:
      - Búsqueda: "${query}"
      - Veces buscado: ${count}
      
      Genera una propuesta de abasto en JSON:
      {
        "recommendation": "string",
        "roi": number,
        "priority": "critical" | "high" | "medium",
        "reason": "string"
      }
    `;

    const analysis = await generateStructuredJSON(prompt, systemInstruction, 'gemini-2.0-flash');

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('[Sourcing API] Failure:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
