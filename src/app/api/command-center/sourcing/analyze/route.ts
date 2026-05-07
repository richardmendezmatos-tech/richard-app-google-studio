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
      Eres el Brain de Sourcing de Richard Automotive (Sentinel N24). 
      Tu misión es analizar una búsqueda de cliente no satisfecha (Search Gap)
      y proponer una estrategia de abasto de nivel ejecutivo para el mercado de Puerto Rico.

      REGLAS DE ANÁLISIS N24:
      1. ROI: Estima un retorno de inversión real (12-28%) basado en demanda local.
      2. FINANZAS: Estima el precio de compra subasta vs precio de venta sugerido (retail).
      3. ESCASEZ: Clasifica la escasez del modelo en PR del 1 al 10.
      4. FUENTE: Sugiere dónde comprar (Subasta Local PR, Florida Export, Trade-in Directo).
      5. PRIORIDAD: 'critical' si la demanda es explosiva (>10), 'high' (>5), 'medium' otherwise.
      6. RECOMENDACIÓN: Sé extremadamente específico (Modelos, Años, Versiones).
      
      FORMATO: JSON estricto.
    `;

    const prompt = `
      Analiza el siguiente Gap de Demanda:
      - Vehículo/Query: "${query}"
      - Volumen de Búsqueda: ${count}
      
      Genera una propuesta de inversión estratégica en JSON:
      {
        "recommendation": "string",
        "roi": number,
        "estimatedPurchasePrice": number,
        "estimatedResalePrice": number,
        "marketScarcity": number,
        "targetSource": "string",
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
