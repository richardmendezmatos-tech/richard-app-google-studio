import { useState, useEffect } from 'react';
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

const defaultStats: VehicleStats = { views: 0, leads: 0, dailyViews: 0, weeklyViews: 0 };

export function useVehicleStats(vehicleId: string) {
  const [data, setData] = useState<VehicleStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(!!vehicleId);

  useEffect(() => {
    if (!vehicleId) return;
    fetchVehicleStats(vehicleId).then((stats) => {
      setData(stats);
      setIsLoading(false);
    });
  }, [vehicleId]);

  return { data, isLoading };
}
