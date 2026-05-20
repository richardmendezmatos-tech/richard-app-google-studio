import { NextResponse } from 'next/server';
import {
  shouldEnforceWebhookSignatures,
  verifySendGridEventWebhook,
} from '@/shared/security/webhooks';
import { SupabaseLeadRepository } from '@/entities/lead/api/repositories/SupabaseLeadRepository';

interface SendGridEvent {
  email: string;
  event:
    | 'processed'
    | 'delivered'
    | 'open'
    | 'click'
    | 'bounce'
    | 'dropped'
    | 'spamreport'
    | 'unsubscribe';
  timestamp: number;
  url?: string;
  reason?: string;
  sg_message_id?: string;
}

export async function POST(req: Request) {
  // Read raw body for signature verification
  const rawBodyText = await req.text();
  const rawBodyBuffer = Buffer.from(rawBodyText, 'utf8');

  // Verification
  const hasPublicKey = !!String(process.env.SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY || '').trim();
  if (hasPublicKey) {
    const ok = verifySendGridEventWebhook(req, rawBodyBuffer);
    if (!ok) {
      console.warn('Rejected SendGrid webhook: invalid signature');
      return new NextResponse('Forbidden', { status: 403 });
    }
  } else if (shouldEnforceWebhookSignatures()) {
    console.warn('Rejected SendGrid webhook: missing SENDGRID_EVENT_WEBHOOK_PUBLIC_KEY');
    return new NextResponse('Forbidden', { status: 403 });
  }

  let events: SendGridEvent[];
  try {
    events = JSON.parse(rawBodyText);
  } catch (e) {
    console.error('Invalid payload: expected JSON array', e);
    return new NextResponse('Invalid payload', { status: 400 });
  }

  if (!Array.isArray(events)) {
    console.error('Invalid payload: expected array of events');
    return new NextResponse('Invalid payload', { status: 400 });
  }

  console.info(`Received ${events.length} SendGrid events`);

  try {
    const repository = new SupabaseLeadRepository();

    const promises = events.map(async (event) => {
      const { email, event: eventType, timestamp, url, reason } = event;

      // In Supabase we don't have a direct "where email == email" in the repository yet
      // but we can use the client directly or extend the repository.
      // For now, let's use the repository if possible, or direct client for speed.
      const { data: leads, error } = await (repository as any).client
        .from('leads')
        .select('*')
        .eq('email', email)
        .limit(1);

      if (error || !leads || leads.length === 0) {
        console.warn(`Lead not found for email: ${email}`);
        return;
      }

      const lead = leads[0];
      const updates: any = {
        email_sequence: {
          ...(lead.email_sequence || {}),
          last_event: eventType,
          last_event_at: new Date(timestamp * 1000).toISOString(),
        },
      };

      // Update lead based on event type
      switch (eventType) {
        case 'open':
          updates.email_sequence.emails_opened = (updates.email_sequence.emails_opened || 0) + 1;
          updates.email_sequence.last_opened_at = new Date(timestamp * 1000).toISOString();
          break;

        case 'click':
          updates.email_sequence.emails_clicked = (updates.email_sequence.emails_clicked || 0) + 1;
          updates.email_sequence.last_clicked_at = new Date(timestamp * 1000).toISOString();
          updates.email_sequence.last_clicked_url = url || '';

          if (!lead.responded) {
            updates.responded = true;
            updates.updated_at = new Date().toISOString();
          }
          break;

        case 'bounce':
          updates.email_sequence.bounced = true;
          updates.email_sequence.bounce_reason = reason || 'Unknown';
          break;

        case 'spamreport':
          updates.email_sequence.marked_as_spam = true;
          updates.status = 'unsubscribed';
          break;

        case 'unsubscribe':
          updates.status = 'unsubscribed';
          break;

        case 'delivered':
          updates.email_sequence.last_delivered_at = new Date(timestamp * 1000).toISOString();
          break;
      }

      await repository.updateLead(lead.id, updates);
    });

    await Promise.all(promises);

    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('Error processing SendGrid webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
