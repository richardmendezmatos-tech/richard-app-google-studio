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

    // Option B: Omnichannel Retargeting Automation
    const score = Number(data.closureProbability || data.aiScore || 80);
    if (score >= 75) {
      try {
        const { TriggerRetargeting } = await import('@/features/automation/api/TriggerRetargeting');
        await TriggerRetargeting.execute({
          leadId: data.id,
          leadName: `${data.firstName || 'Cliente'} ${data.lastName || ''}`.trim(),
          phone: data.phone,
          email: data.email,
          vehicleInterest: data.vehicleOfInterest || data.interest || data.vehicle,
          score: score,
          monthlyBudget: data.monthlyBudget || data.budget,
          downPayment: data.downPayment || data.pronto,
        });
        console.log(`[Webhook Leads] Triggered advanced retargeting for ${data.firstName}`);
      } catch (automationErr) {
        console.error('[Webhook Leads] Failed to execute retargeting automation:', automationErr);
      }
    }

    return NextResponse.json({ success: true, processedBy: 'Jules AI + Sentinel N24' });
  } catch (error: any) {
    console.error('Lead Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
