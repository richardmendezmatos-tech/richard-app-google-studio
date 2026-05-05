import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { contents, model = 'gemini-1.5-flash' } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model });

    // Format contents for Google Generative AI SDK
    // The SDK expects parts to be strings or inlineData
    const formattedParts = contents.map((part: any) => {
      if (typeof part === 'string') return part;
      if (part.inlineData) return part;
      return part;
    });

    const result = await genModel.generateContent(formattedParts);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ data: text });
  } catch (error: any) {
    console.error('[Gemini API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal AI Error' }, { status: 500 });
  }
}
