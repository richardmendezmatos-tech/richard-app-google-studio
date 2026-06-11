import { NextResponse } from 'next/server';
import { AutomateEmailSequences } from '@/features/automation/api/AutomateEmailSequences';
import { NudgeStaleLeads } from '@/features/leads/api/NudgeStaleLeads';
import { SupabaseLeadRepository } from '@/shared/api/supabase/SupabaseLeadRepository';
import { SendGridEmailRepository } from '@/shared/api/communications/SendGridEmailRepository';

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

  // — Email Sequences —
  try {
    const leadRepository = new SupabaseLeadRepository();
    const emailRepository = new SendGridEmailRepository();
    const sequences = new AutomateEmailSequences(leadRepository, emailRepository);
    await sequences.execute();
    results.emailSequences = { success: true };
    console.info('[CRON Email] Sequences executed');
  } catch (error: any) {
    console.error('[CRON Email] Sequences error:', error);
    results.emailSequences = { error: error.message };
  }

  // — Stale Leads Nudge (merged from check-stale-leads cron) —
  try {
    const leadRepository = new SupabaseLeadRepository();
    const emailRepository = new SendGridEmailRepository();
    const nudge = new NudgeStaleLeads(leadRepository, emailRepository);
    const nudgeCount = await nudge.execute();
    results.staleLeads = { nudged: nudgeCount };
    console.info('[CRON Email] Stale leads nudged:', nudgeCount);
  } catch (error: any) {
    console.error('[CRON Email] Stale leads error:', error);
    results.staleLeads = { error: error.message };
  }

  const hasError = Object.values(results).some((r: any) => r.error);
  return NextResponse.json(
    { success: !hasError, results },
    { status: hasError ? 500 : 200 },
  );
}
