import { NextResponse } from 'next/server';
import { createClient } from '@/shared/api/supabase/server';

const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_EMAIL = 'mailto:ventas@richard-automotive.com';

export async function POST(request: Request) {
  try {
    const { title, body, url, targetUserId } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'title and body required' }, { status: 400 });
    }

    const sb = await createClient();

    let subscriptions: any[];
    if (targetUserId) {
      const { data, error } = await sb
        .from('push_subscriptions')
        .select('endpoint, auth, p256dh, user_id')
        .eq('user_id', targetUserId)
        .limit(100);
      if (error) throw error;
      subscriptions = data || [];
    } else {
      const { data, error } = await sb.from('push_subscriptions').select('endpoint, auth, p256dh, user_id').limit(100);
      if (error) throw error;
      subscriptions = data || [];
    }

    if (!subscriptions.length) {
      return NextResponse.json({ sent: 0, total: 0 });
    }

    if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY) {
      return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    const webpush = await import('web-push');
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    let sent = 0;
    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { auth: sub.auth, p256dh: sub.p256dh } },
            JSON.stringify({ title, body, url, icon: '/pwa-192x192.png' }),
          );
          sent++;
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await sb.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
          }
        }
      }),
    );

    await sb.from('push_logs').insert({
      title,
      body,
      target: targetUserId || 'all',
      sent,
      total: subscriptions.length,
    });

    return NextResponse.json({ sent, total: subscriptions.length });
  } catch (err) {
    console.error('[Push Send] Error:', err);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
