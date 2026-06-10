import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { carId } = await req.json();
    if (!carId) {
      return NextResponse.json({ error: 'carId required' }, { status: 400 });
    }
    const sb = createServerSupabaseClient();
    await sb.rpc('increment_vehicle_view', { vehicle_id: carId });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
