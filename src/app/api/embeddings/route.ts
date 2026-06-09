import { NextResponse } from 'next/server';
import { sentinelAI } from '@/shared/api/ai/sentinelAI';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text query is required' }, { status: 400 });
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      console.warn(
        'Embeddings API: Missing OPENAI_API_KEY. Falling back to Google Gemini embeddings...',
      );
      try {
        const embedding = await sentinelAI.generateEmbedding(text);
        return NextResponse.json({ embedding });
      } catch (geminiError: any) {
        console.error('Gemini Embeddings Fallback Failed:', geminiError);
        return NextResponse.json({ error: 'AI capabilities currently offline' }, { status: 503 });
      }
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-small',
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const embedding = data.data[0].embedding;

      return NextResponse.json({ embedding });
    } catch (openaiError: any) {
      console.warn('OpenAI Embedding failed, trying Google Gemini fallback...', openaiError);
      const embedding = await sentinelAI.generateEmbedding(text);
      return NextResponse.json({ embedding });
    }
  } catch (error: any) {
    console.error('Embeddings Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
