import { NextResponse } from 'next/server';
import { verifyTurnstileToken } from '@/lib/turnstile';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Missing token' }, { status: 400 });
    }

    const valid = await verifyTurnstileToken(token);

    if (!valid) {
      return NextResponse.json({ valid: false, error: 'Verification failed' }, { status: 403 });
    }

    return NextResponse.json({ valid: true });
  } catch (e: any) {
    console.error('[Validate Turnstile] Error:', e);
    return NextResponse.json({ valid: false, error: 'Internal error' }, { status: 500 });
  }
}
