import { NextResponse } from 'next/server';
import { whatsappAgent } from '@/features/automation/api/whatsappAgent';

/**
 * GET /api/cron/messages
 * 
 * Vercel Cron Job endpoint that processes scheduled WhatsApp follow-ups.
 * Add to vercel.json: { "crons": [{ "path": "/api/cron/messages", "schedule": "every 4 hours" }] }
 * 
 * Security: Protected by CRON_SECRET (set in Vercel env vars).
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await whatsappAgent.processPendingMessages();

    console.log(`[Cron:Messages] Processed: ${result.processed}, Failed: ${result.failed}`);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Cron:Messages] Error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
