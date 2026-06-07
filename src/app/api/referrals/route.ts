import { NextRequest, NextResponse } from 'next/server';
import { registerReferral, getReferralStats, getReferralsByPhone, ensureReferralCode } from '@/features/referrals/api/referralService';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get('phone');
    if (!phone) {
      return NextResponse.json({ error: 'Phone parameter is required' }, { status: 400 });
    }

    const [stats, referrals] = await Promise.all([
      getReferralStats(phone),
      getReferralsByPhone(phone),
    ]);

    const name = req.nextUrl.searchParams.get('name') || undefined;

    let existingCode = referrals.length > 0 ? referrals[0].code : null;
    if (!existingCode) {
      const result = await ensureReferralCode(phone, name);
      existingCode = result.code;
    }

    return NextResponse.json({ stats, code: existingCode, referrals });
  } catch (error: any) {
    console.error('[Referrals API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.refereeName || !body.refereePhone || !body.referrerPhone) {
      return NextResponse.json(
        { error: 'Nombre, teléfono del referido y teléfono del referidor son requeridos' },
        { status: 400 },
      );
    }

    const result = await registerReferral({
      referrerPhone: body.referrerPhone,
      referrerName: body.referrerName,
      refereeName: body.refereeName,
      refereePhone: body.refereePhone,
      refereeEmail: body.refereeEmail,
      code: body.code,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('[Referrals API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
