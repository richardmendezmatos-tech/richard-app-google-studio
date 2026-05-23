import { NextResponse } from 'next/server';
import { createClient } from '@/shared/api/supabase/server';

export async function POST(request: Request) {
  try {
    const { subscription } = await request.json();
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 400 });
    }

    const sb = await createClient();
    const { error } = await sb.from('push_subscriptions').upsert(
      {
        endpoint: subscription.endpoint,
        auth: subscription.keys?.auth || '',
        p256dh: subscription.keys?.p256dh || '',
        user_agent: request.headers.get('user-agent') || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' },
    );

    if (error) {
      console.error('[Push Subscribe] DB error:', error);
      return NextResponse.json({ error: 'Storage failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Push Subscribe] Error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
