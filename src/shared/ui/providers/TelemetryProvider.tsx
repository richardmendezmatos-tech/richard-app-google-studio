import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/shared/api/supabase/client';
import { VehicleHealthStatus, VehicleTelemetry } from '@/shared/types/types';
import telemetry from '@/shared/api/metrics/analytics';

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

  // Page View Tracking
  useEffect(() => {
    if (typeof window !== 'undefined' && telemetry) {
      telemetry.add({
        event: 'page_view',
        url: window.location.href,
        title: document.title
      });
    }
  }, []);

  const subscribeToVehicle = useCallback(async (vehicleId: string) => {
    if (activeSubscriptions.current.has(vehicleId)) return;
    activeSubscriptions.current.add(vehicleId);

    try {
      const supabase = createClient();
      if (!supabase) return;

      const channel = supabase.channel('vehicle-telemetry');

      channel
        .on('broadcast', { event: `update-${vehicleId}` }, (payload) => {
          const data = payload.payload as VehicleTelemetry;
          import('@/shared/api/metrics/telemetryService').then(({ analyzeVehicleHealth }) => {
            const health = analyzeVehicleHealth(data);
            setTelemetryMap((prev) => ({ ...prev, [vehicleId]: health }));
          });
        })
        .subscribe();
      
    } catch (error) {
      console.warn('[TelemetryProvider] Sync error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribeFromVehicle = useCallback(async (vehicleId: string) => {
    activeSubscriptions.current.delete(vehicleId);
    try {
      const supabase = createClient();
      if (!supabase) return;
      
      // En una arquitectura más limpia, se debería guardar la referencia al canal
      // y remover específicamente ese canal, pero para simplificar:
      // removemos la key del mapa
      setTelemetryMap((prev) => {
        const next = { ...prev };
        delete next[vehicleId];
        return next;
      });
    } catch (error) {
      console.warn('[TelemetryProvider] Unsubscribe error:', error);
    }
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
