import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { VehicleHealthStatus, VehicleTelemetry } from '@/shared/api/metrics/vehicleHealth';
import telemetry from '@/shared/api/metrics/analytics';
import type { RealtimeChannel } from '@supabase/supabase-js';

let _supabaseClient: any = null;
async function getSupabase() {
  if (!_supabaseClient) {
    const { createClient } = await import('@/shared/api/supabase/client');
    _supabaseClient = createClient();
  }
  return _supabaseClient;
}

interface TelemetryContextType {
  telemetryMap: Record<string, VehicleHealthStatus>;
  subscribeToVehicle: (vehicleId: string) => void;
  unsubscribeFromVehicle: (vehicleId: string) => void;
  loading: boolean;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [telemetryMap, setTelemetryMap] = useState<Record<string, VehicleHealthStatus>>({});
  const [loading, setLoading] = useState(true);
  const activeSubscriptions = useRef<Set<string>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Page View Tracking
  useEffect(() => {
    if (typeof window !== 'undefined' && telemetry) {
      telemetry.add({
        event: 'page_view',
        url: window.location.href,
        title: document.title,
      });
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      activeSubscriptions.current.clear();
    };
  }, []);

  const subscribeToVehicle = useCallback(async (vehicleId: string) => {
    if (activeSubscriptions.current.has(vehicleId)) return;
    activeSubscriptions.current.add(vehicleId);

    try {
      const supabase = await getSupabase();
      if (!supabase) return;

      if (!channelRef.current) {
        channelRef.current = supabase.channel('vehicle-telemetry');
      }

      const channel = channelRef.current;
      if (channel.state !== 'closed') {
        channel
          .on('broadcast', { event: `update-${vehicleId}` }, (payload) => {
            const data = payload.payload as VehicleTelemetry;
            import('@/shared/api/metrics/vehicleHealth').then(({ analyzeVehicleHealth }) => {
              const health = analyzeVehicleHealth(data);
              setTelemetryMap((prev) => ({ ...prev, [vehicleId]: health }));
            });
          })
          .subscribe();
      }
    } catch (error) {
      console.warn('[TelemetryProvider] Sync error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribeFromVehicle = useCallback(async (vehicleId: string) => {
    activeSubscriptions.current.delete(vehicleId);
    setTelemetryMap((prev) => {
      const next = { ...prev };
      delete next[vehicleId];
      return next;
    });
  }, []);

  return (
    <TelemetryContext.Provider
      value={{ telemetryMap, subscribeToVehicle, unsubscribeFromVehicle, loading }}
    >
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (context === undefined) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
};
