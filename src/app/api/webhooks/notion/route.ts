import { NextResponse } from 'next/server';
import { createFiProgressInNotion } from '@/shared/services/notionService';

// Note: authentication should be handled here, e.g. checking a bearer token
// or integrating with Supabase Auth to ensure only authenticated users can call this.

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const notionResult = await createFiProgressInNotion(data);

    if (notionResult.success) {
      console.info(`Progreso Guardado en Notion. PageId: ${notionResult.pageId}`);
      return NextResponse.json({ success: true, message: 'Progreso sincronizado.' });
    } else {
      console.error(`Error reportado por notionService: ${notionResult.message}`);
      return NextResponse.json(
        { error: 'No se pudo sincronizar pre-cualificación en CRM', details: notionResult.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error crítico en saveFiProgress:', error);
    return NextResponse.json({ error: 'Fallo general sincronizando el progreso F&I' }, { status: 500 });
  }
}
