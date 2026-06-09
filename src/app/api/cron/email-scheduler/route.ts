import { NextResponse } from 'next/server';
import { AutomateEmailSequences } from '@/features/automation/api/AutomateEmailSequences';
import { SupabaseLeadRepository } from '@/shared/api/supabase/SupabaseLeadRepository';
import { SendGridEmailRepository } from '@/shared/api/communications/SendGridEmailRepository';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  // Authorization header verification can be added here
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.info('Starting Agnostic Email Automation Queue');

  try {
    const leadRepository = new SupabaseLeadRepository();
    const emailRepository = new SendGridEmailRepository();
    const useCase = new AutomateEmailSequences(leadRepository, emailRepository);

    await useCase.execute();
    console.info('✅ Email automation executed successfully via Use Case');
    return NextResponse.json({ success: true, message: 'Email automation executed' });
  } catch (error: any) {
    console.error('❌ Error in Email Automation Scheduler:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
