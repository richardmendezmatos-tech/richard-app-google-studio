import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '@/shared/api/supabase/supabaseClient';

interface VehicleStats {
  views: number;
  leads: number;
  dailyViews: number;
  weeklyViews: number;
}

async function fetchVehicleStats(vehicleId: string): Promise<VehicleStats> {
  const sb = await getSupabase();
  if (!sb) return { views: 0, leads: 0, dailyViews: 0, weeklyViews: 0 };

  const [viewRes, leadRes, dailyRes, weeklyRes] = await Promise.all([
    sb.rpc('get_vehicle_view_count', { vehicle_id: vehicleId }),
    sb.rpc('get_vehicle_lead_count', { vehicle_id: vehicleId }),
    sb.rpc('get_vehicle_daily_views', { vehicle_id: vehicleId }),
    sb.rpc('get_vehicle_weekly_views', { vehicle_id: vehicleId }),
  ]);

  return {
    views: viewRes.data ?? 0,
    leads: leadRes.data ?? 0,
    dailyViews: dailyRes.data ?? 0,
    weeklyViews: weeklyRes.data ?? 0,
  };
}

export function useVehicleStats(vehicleId: string) {
  return useQuery({
    queryKey: ['vehicle_stats', vehicleId],
    queryFn: () => fetchVehicleStats(vehicleId),
    staleTime: 60_000,
    refetchInterval: 300_000,
    enabled: !!vehicleId,
  });
}
