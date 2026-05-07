import { NextResponse } from 'next/server';
import { generateStructuredJSON } from '@/shared/api/ai/geminiService';

export async function POST(req: Request) {
  try {
    const { topic, context } = await req.json();

    const systemInstruction = `
      Eres el Editor-in-Chief de Richard Automotive Newsroom (Sentinel N24).
      Tu misión es escribir artículos de blog que eduquen, emocionen y conviertan a los lectores en clientes de Richard Automotive en Puerto Rico.

      REGLAS EDITORIALES N24:
      1. TONO: Profesional, tecnológico, premium y cercano ("Enfoque Houston").
      2. ESTRUCTURA: Título gancho, intro impactante, 3 puntos clave, y conclusión con llamado a la acción.
      3. LOCALIZACIÓN: Menciona Puerto Rico, pueblos de la isla, o el estilo de vida local cuando sea relevante.
      4. SEO: Incluye palabras clave de alto volumen en PR (financiamiento, autos nuevos, Ford, Hyundai).
      5. FORMATO: Markdown estructurado con subtítulos (H2, H3).
    `;

    const prompt = `
      Escribe un artículo completo sobre el tema: "${topic}"
      Contexto adicional: ${context || 'Enfoque en financiamiento y tecnología automotriz'}
      
      Genera el contenido en JSON con este formato:
      {
        "title": "Título del Artículo",
        "excerpt": "Breve resumen de 2 líneas para la tarjeta de blog",
        "content": "Contenido completo en Markdown...",
        "tags": ["Tag1", "Tag2"],
        "estimatedReadingTime": "5 min"
      }
    `;

    const result = await generateStructuredJSON(prompt, systemInstruction, 'gemini-2.0-flash');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Blog Generation API] Failure:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
