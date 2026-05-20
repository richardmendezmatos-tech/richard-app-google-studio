import { NextResponse } from 'next/server';
import { sentinelAI } from '@/shared/api/ai/sentinelAI';

export async function POST(req: Request) {
  try {
    const { leadName, context, vehicleInterest } = await req.json();

    if (!leadName) {
      return NextResponse.json({ error: 'Lead name is required' }, { status: 400 });
    }

    const prompt = `
      Genera una respuesta de seguimiento corta y persuasiva para un cliente de Richard Automotive.
      
      Cliente: ${leadName}
      Contexto: ${context || 'Seguimiento general'}
      Interés: ${vehicleInterest || 'Cualquier unidad de calidad'}
      
      Instrucciones:
      1. Tono Boricua (Puerto Rico), profesional, de "Richard Mendez".
      2. Máximo 25 palabras.
      3. Sé servicial y empático.
    `;

    const suggestion = await sentinelAI.quickGen(
      prompt,
      'Eres un cerrador de ventas experto en Richard Automotive.',
    );

    return NextResponse.json({ suggestion });
  } catch (error: any) {
    console.error('Smart Reply API Error:', error);
    return NextResponse.json({ error: 'Failed to generate reply' }, { status: 500 });
  }
}
