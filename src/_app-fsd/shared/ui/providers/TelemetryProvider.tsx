import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { VehicleHealthStatus } from '@/shared/types/types';
import { createClient } from '@/shared/api/supabase/client';
import { analyzeVehicleHealth } from '@/shared/api/metrics/vehicleHealth';
import telemetryAnalytics from '@/shared/api/metrics/analytics';

interface TelemetryContextType {
  telemetryMap: Record<string, VehicleHealthStatus>;
  subscribeToVehicle: (vehicleId: string) => void;
  unsubscribeFromVehicle: (vehicleId: string) => void;
  loading: boolean;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

const TELEMETRY_CHANNEL = 'global-telemetry';

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [telemetryMap, setTelemetryMap] = useState<Record<string, VehicleHealthStatus>>({});
  const [loading, setLoading] = useState(false);
  const activeSubscriptions = useRef<Record<string, any>>({});
  const supabase = useRef(createClient());

  // Page View Tracking
  useEffect(() => {
    if (typeof window !== 'undefined' && telemetryAnalytics) {
      telemetryAnalytics.add({
        event: 'page_view',
        url: window.location.href,
        title: document.title,
      });
    }
  }, []);

  const subscribeToVehicle = useCallback((vehicleId: string) => {
    if (activeSubscriptions.current[vehicleId] || !supabase.current) return;

    const channel = supabase.current.channel(`${TELEMETRY_CHANNEL}-${vehicleId}`);

    channel
      .on('broadcast', { event: `update-${vehicleId}` }, ({ payload }) => {
        const health = analyzeVehicleHealth(payload);
        setTelemetryMap((prev) => ({ ...prev, [vehicleId]: health }));
      })
      .subscribe();

    activeSubscriptions.current[vehicleId] = channel;
  }, []);

  const unsubscribeFromVehicle = useCallback((vehicleId: string) => {
    const channel = activeSubscriptions.current[vehicleId];
    if (channel && supabase.current) {
      supabase.current.removeChannel(channel);
      delete activeSubscriptions.current[vehicleId];

      setTelemetryMap((prev) => {
        const next = { ...prev };
        delete next[vehicleId];
        return next;
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const currentSupabase = supabase.current;
    const currentSubscriptions = activeSubscriptions.current;
    return () => {
      if (currentSupabase) {
        Object.values(currentSubscriptions).forEach((channel) => {
          currentSupabase.removeChannel(channel);
        });
      }
    };
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
