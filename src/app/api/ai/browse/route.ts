import { NextRequest, NextResponse } from 'next/server';
import { browserAgentService } from '@/features/browser-agent';

export const runtime = 'nodejs';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { instruction, url } = await req.json();

    if (!instruction || typeof instruction !== 'string') {
      return NextResponse.json(
        { error: 'Se requiere una instrucción de navegación' },
        { status: 400 },
      );
    }

    const result = await browserAgentService.execute({
      instruction,
      url: url || undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Browse API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del agente de navegación' },
      { status: 500 },
    );
  }
}
