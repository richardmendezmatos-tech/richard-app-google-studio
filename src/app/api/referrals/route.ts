import { NextResponse } from 'next/server';
import { registerReferral } from '@/features/referrals/api/referralService';

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
