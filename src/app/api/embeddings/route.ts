import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text query is required' }, { status: 400 });
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      console.warn('Embeddings API: Missing OPENAI_API_KEY');
      return NextResponse.json({ error: 'AI capabilities currently offline' }, { status: 503 });
    }

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
  } catch (error: any) {
    console.error('Embeddings Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
