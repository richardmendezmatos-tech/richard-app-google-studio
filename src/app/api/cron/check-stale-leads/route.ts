import { NextResponse } from 'next/server';
import { NudgeStaleLeads } from '@/features/leads/api/NudgeStaleLeads';
import { SupabaseLeadRepository } from '@/shared/api/supabase/SupabaseLeadRepository';
import { SendGridEmailRepository } from '@/shared/api/communications/SendGridEmailRepository';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  // Authorization header verification can be added here
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.info('Checking for stale leads (Agnostic Flow)...');

  try {
    const leadRepository = new SupabaseLeadRepository();
    const emailRepository = new SendGridEmailRepository();
    const useCase = new NudgeStaleLeads(leadRepository, emailRepository);

    const nudgeCount = await useCase.execute();
    console.info(`Nudge campaign completed. Emailed ${nudgeCount} leads.`);

    return NextResponse.json({ success: true, nudged: nudgeCount });
  } catch (error: any) {
    console.error('Error in checkStaleLeads', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
