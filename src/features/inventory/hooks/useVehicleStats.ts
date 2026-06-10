import { useState, useEffect } from 'react';

interface VehicleStats {
  views: number;
  leads: number;
  dailyViews: number;
  weeklyViews: number;
}

const defaultStats: VehicleStats = { views: 0, leads: 0, dailyViews: 0, weeklyViews: 0 };

export function useVehicleStats(vehicleId: string) {
  const [data, setData] = useState<VehicleStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(!!vehicleId);

  useEffect(() => {
    if (!vehicleId) return;
    fetch(`/api/vehicle-stats/${vehicleId}`)
      .then((res) => res.json())
      .then((stats: VehicleStats) => {
        setData(stats);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [vehicleId]);

  return { data, isLoading };
}
