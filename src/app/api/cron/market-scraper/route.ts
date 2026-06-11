import { NextResponse } from 'next/server';
import { CleanAuditLogs } from '@/features/command-center/api/CleanAuditLogs';
import { SupabaseLogRepository } from '@/shared/api/supabase/SupabaseLogRepository';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const results: Record<string, any> = {};

  // — Market Intel Scraper —
  try {
    const { runMarketIntelScraper } = await import('@/features/market-intelligence/api/marketIntelService');
    await runMarketIntelScraper();
    results.marketScraper = { success: true };
    console.info('[CRON Market] Scraper finished');
  } catch (error: any) {
    console.error('[CRON Market] Scraper error:', error);
    results.marketScraper = { error: error.message };
  }

  // — Log Cleanup (merged from cleanup-logs cron) —
  try {
    const logRepository = new SupabaseLogRepository();
    const useCase = new CleanAuditLogs(logRepository);
    const deletedCount = await useCase.execute(30);
    results.logCleanup = { deleted: deletedCount };
    console.info('[CRON Market] Log cleanup deleted:', deletedCount);
  } catch (error: any) {
    console.error('[CRON Market] Log cleanup error:', error);
    results.logCleanup = { error: error.message };
  }

  const hasError = Object.values(results).some((r: any) => r.error);
  return NextResponse.json(
    { success: !hasError, results },
    { status: hasError ? 500 : 200 },
  );
}
