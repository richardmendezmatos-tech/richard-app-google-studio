import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { contents, model = 'gemini-1.5-flash' } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    // Convert contents array to Vercel AI SDK parts format
    const parts = contents.map((part: any) => {
      if (typeof part === 'string') return { type: 'text', text: part };
      if (part.text) return { type: 'text', text: part.text };
      if (part.inlineData) {
        return { 
          type: 'image', 
          image: part.inlineData.data,
          mimeType: part.inlineData.mimeType 
        };
      }
      return { type: 'text', text: '' };
    });

    const { text } = await generateText({
      model: google(model),
      messages: [{ role: 'user', content: parts }],
    });

    return NextResponse.json({ data: text });
  } catch (error: any) {
    console.error('[Gemini API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal AI Error' }, { status: 500 });
  }
}
