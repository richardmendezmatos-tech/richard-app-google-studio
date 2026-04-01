import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/shared/api/firebase/admin';

export async function POST(request: Request) {
  const { idToken } = await request.json();

  const admin = getFirebaseAdmin();
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días

  try {
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    const response = NextResponse.json({ status: 'success' }, { status: 200 });

    response.cookies.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ status: 'success' }, { status: 200 });
  response.cookies.set('session', '', { maxAge: 0, path: '/' });
  return response;
}
