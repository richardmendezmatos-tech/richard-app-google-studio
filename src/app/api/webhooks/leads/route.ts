import { NextResponse } from 'next/server';
import { whatsappAgent } from '@/features/automation/api/whatsappAgent';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.id || !data.phone) {
      return NextResponse.json({ error: 'Missing lead parameters' }, { status: 400 });
    }

    // Pass processing offline to the WhatsApp Agent Agentic Flow
    // In a real environment, wait for event processing or queue
    await whatsappAgent.sendWelcomeValidation({
      id: data.id,
      firstName: data.firstName || 'Cliente',
      phone: data.phone,
      notes: data.notes || '',
    });

    return NextResponse.json({ success: true, processedBy: 'Jules AI' });
  } catch (error: any) {
    console.error('Lead Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
