import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { runMarketIntelScraper } = await import('@/server/services/marketIntelService');
    await runMarketIntelScraper();
    return NextResponse.json({ success: true, message: 'Market Intel Scraper finished' });
  } catch (error: any) {
    console.error("Error in market scraper:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
