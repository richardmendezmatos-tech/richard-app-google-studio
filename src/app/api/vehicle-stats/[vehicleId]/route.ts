import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: Promise<{ vehicleId: string }> }) {
  try {
    const { vehicleId } = await params;
    if (!vehicleId) {
      return NextResponse.json({ error: 'vehicleId required' }, { status: 400 });
    }

    const sb = createServerSupabaseClient();

    const [viewRes, leadRes, dailyRes, weeklyRes] = await Promise.all([
      sb.rpc('get_vehicle_view_count', { vehicle_id: vehicleId }),
      sb.rpc('get_vehicle_lead_count', { vehicle_id: vehicleId }),
      sb.rpc('get_vehicle_daily_views', { vehicle_id: vehicleId }),
      sb.rpc('get_vehicle_weekly_views', { vehicle_id: vehicleId }),
    ]);

    return NextResponse.json({
      views: viewRes.data ?? 0,
      leads: leadRes.data ?? 0,
      dailyViews: dailyRes.data ?? 0,
      weeklyViews: weeklyRes.data ?? 0,
    });
  } catch (error: any) {
    console.error('[VehicleStats] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
