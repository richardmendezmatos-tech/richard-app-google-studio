import { VehicleTelemetry, VehicleHealthStatus, HealthAlert } from '@/shared/types/types';
import { useEffect, useState, useMemo, useRef } from 'react';
import { nativeBridgeService } from '@/shared/api/core/nativeBridgeService';
import { createClient } from '@/shared/api/supabase/client';

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

export const analyzeVehicleHealth = (telemetry: VehicleTelemetry): VehicleHealthStatus => {
  const alerts: HealthAlert[] = [];
  let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

  // 1. Temperature Analysis
  if (telemetry.temp > 105) {
    alerts.push({
      id: `temp-crit-${Date.now()}`,
      type: 'critical',
      category: 'engine',
      message: `Temperatura Crítica: ${telemetry.temp}°C. Detenga el vehículo inmediatamente.`,
      timestamp: Date.now(),
    });
    overallStatus = 'critical';
  } else if (telemetry.temp > 95) {
    alerts.push({
      id: `temp-warn-${Date.now()}`,
      type: 'warning',
      category: 'engine',
      message: `Temperatura Elevada: ${telemetry.temp}°C. Revise el sistema de enfriamiento.`,
      timestamp: Date.now(),
    });
    overallStatus = 'warning';
  }

  // 2. Battery Analysis
  if (telemetry.batteryVoltage < 11.5) {
    alerts.push({
      id: `batt-crit-${Date.now()}`,
      type: 'critical',
      category: 'battery',
      message: `Voltaje de Batería Crítico: ${telemetry.batteryVoltage}V. Riesgo de fallo de arranque.`,
      timestamp: Date.now(),
    });
    overallStatus = 'critical';
  } else if (telemetry.batteryVoltage < 12.1) {
    alerts.push({
      id: `batt-warn-${Date.now()}`,
      type: 'warning',
      category: 'battery',
      message: `Batería Baja: ${telemetry.batteryVoltage}V. Se recomienda revisión.`,
      timestamp: Date.now(),
    });
    if (overallStatus !== 'critical') overallStatus = 'warning';
  }

  // 3. Fuel Analysis
  if (telemetry.fuelLevel < 10) {
    alerts.push({
      id: `fuel-crit-${Date.now()}`,
      type: 'critical',
      category: 'fuel',
      message: `Nivel de Combustible Crítico: ${telemetry.fuelLevel}%. Reposte inmediatamente.`,
      timestamp: Date.now(),
    });
    overallStatus = 'critical';
  } else if (telemetry.fuelLevel < 20) {
    alerts.push({
      id: `fuel-warn-${Date.now()}`,
      type: 'warning',
      category: 'fuel',
      message: `Nivel de Combustible Bajo: ${telemetry.fuelLevel}%.`,
      timestamp: Date.now(),
    });
    if (overallStatus !== 'critical') overallStatus = 'warning';
  }

  // 4. Engine Efficiency / Idle Warning
  if (telemetry.rpm > 1200 && telemetry.speed === 0) {
    alerts.push({
      id: `rpm-warn-${Date.now()}`,
      type: 'warning',
      category: 'engine',
      message: `Ralentí Inestable detectado (${telemetry.rpm} RPM en parado).`,
      timestamp: Date.now(),
    });
    if (overallStatus !== 'critical') overallStatus = 'warning';
  }

  return {
    overallStatus,
    alerts,
    lastCheck: Date.now(),
  };
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
