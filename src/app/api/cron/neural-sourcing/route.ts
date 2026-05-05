import { NextResponse } from 'next/server';
import { NeuralSourcingService } from '@/features/houston/api/NeuralSourcingService';



/**
 * GET /api/cron/neural-sourcing
 * Triggered by Vercel Cron or manual admin action.
 * Analyzes search gaps and generates PO drafts.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  // En producción, verificar el CRON_SECRET de Vercel
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const result = await NeuralSourcingService.processRecentGaps();

  if (result.success) {
    return NextResponse.json({
      status: 'success',
      message: 'Neural Sourcing Analysis Complete',
      processed: result.processed
    });
  } else {
    return NextResponse.json({
      status: 'error',
      message: result.message || 'Analysis failed',
      error: result.error
    }, { status: 500 });
  }
}
