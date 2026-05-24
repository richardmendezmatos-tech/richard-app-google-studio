import { VehicleTelemetry } from './vehicleHealth';
import { useEffect, useState, useMemo, useRef } from 'react';
import { nativeBridgeService } from '@/shared/api/core/nativeBridgeService';
import { createClient } from '@/shared/api/supabase/client';
import { analyzeVehicleHealth } from './vehicleHealth';

const TELEMETRY_CHANNEL = 'vehicle-telemetry';

export const updateVehicleTelemetry = async (telemetry: VehicleTelemetry) => {
  try {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase.channel(TELEMETRY_CHANNEL);

    // In a real scenario, you'd subscribe first or keep a singleton channel,
    // but for simple pushes you can do this, though keeping a singleton is better.
    await channel.send({
      type: 'broadcast',
      event: `update-${telemetry.vehicleId}`,
      payload: {
        ...telemetry,
        lastUpdate: Date.now(),
      },
    });
  } catch (error) {
    console.warn('[Telemetry] Broadcast failed:', error);
  }
};

export const useVehicleTelemetry = (vehicleId: string) => {
  const [telemetry, setTelemetry] = useState<VehicleTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleId) return;

    const setupTelemetry = async () => {
      const supabase = createClient();
      if (!supabase) {
        setError('Supabase client not initialized');
        setLoading(false);
        return;
      }

      const channel = supabase.channel(TELEMETRY_CHANNEL);

      channel
        .on('broadcast', { event: `update-${vehicleId}` }, (payload) => {
          setTelemetry(payload.payload as VehicleTelemetry);
          setLoading(false);
        })
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            setLoading(false);
          }
          if (status === 'CHANNEL_ERROR') {
            setError(err?.message || 'Error subscribing to telemetry');
          }
        });

      return channel;
    };

    let activeChannel: any;
    setupTelemetry().then((channel) => {
      activeChannel = channel;
    });

    return () => {
      if (activeChannel) {
        const supabase = createClient();
        supabase?.removeChannel(activeChannel);
      }
    };
  }, [vehicleId]);

  return { telemetry, loading, error };
};

import { useTelemetry } from '@/shared/ui/providers/TelemetryProvider';

export const useVehicleHealth = (vehicleId: string) => {
  const { telemetryMap, subscribeToVehicle, unsubscribeFromVehicle } = useTelemetry();
  const lastAlertId = useRef<string | null>(null);

  const health = useMemo(() => {
    return telemetryMap[vehicleId] || null;
  }, [telemetryMap, vehicleId]);

  useEffect(() => {
    if (!vehicleId) return;

    subscribeToVehicle(vehicleId);
    return () => {
      unsubscribeFromVehicle(vehicleId);
    };
  }, [vehicleId, subscribeToVehicle, unsubscribeFromVehicle]);

  useEffect(() => {
    if (health) {
      const criticalAlert = health.alerts.find((a) => a.type === 'critical');
      if (criticalAlert && criticalAlert.id !== lastAlertId.current) {
        lastAlertId.current = criticalAlert.id;
        nativeBridgeService.sendLocalNotification(
          'ALERTA CRÍTICA: ' + criticalAlert.category.toUpperCase(),
          criticalAlert.message,
        );
      }
    }
  }, [health]);

  return { health, loading: !health, error: null };
};
