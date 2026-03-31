import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getRealtimeDbService } from '@/shared/api/firebase/firebaseService';
import { VehicleHealthStatus } from '@/shared/types/types';
import type { DataSnapshot } from 'firebase/database';
import telemetry from '@/shared/api/metrics/analytics';

if (typeof window !== 'undefined') {
  telemetry.add({
    event: 'page_view',
    url: window.location.href,
    title: document.title
  });
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

  const subscribeToVehicle = useCallback(async (vehicleId: string) => {
    if (activeSubscriptions.current.has(vehicleId)) return;
    activeSubscriptions.current.add(vehicleId);

    try {
      const rtdb = await getRealtimeDbService();
      if (!rtdb) return;

      const { ref, onValue } = await import('firebase/database');
      const vehicleRef = ref(rtdb, `telemetry/${vehicleId}`);

      onValue(vehicleRef, (snapshot: DataSnapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Import analyzeVehicleHealth dynamically to avoid circular dependencies
          import('@/shared/api/metrics/telemetryService').then(({ analyzeVehicleHealth }) => {
            const health = analyzeVehicleHealth(data);
            setTelemetryMap((prev) => ({ ...prev, [vehicleId]: health }));
          });
        }
      });
    } catch (error) {
      console.warn('[TelemetryProvider] Sync error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribeFromVehicle = useCallback(async (vehicleId: string) => {
    activeSubscriptions.current.delete(vehicleId);
    try {
      const rtdb = await getRealtimeDbService();
      if (!rtdb) return;
      const { ref, off } = await import('firebase/database');
      const vehicleRef = ref(rtdb, `telemetry/${vehicleId}`);
      off(vehicleRef);
      
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
