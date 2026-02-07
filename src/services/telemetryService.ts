import { rtdb } from './firebaseService';
import { ref, onValue, set, off, DataSnapshot } from 'firebase/database';
import { VehicleTelemetry, VehicleHealthStatus, HealthAlert } from '@/types/types';
import { useEffect, useState, useMemo, useRef } from 'react';
import { nativeBridgeService } from './nativeBridgeService';

const TELEMETRY_PATH = 'telemetry';

export const updateVehicleTelemetry = async (telemetry: VehicleTelemetry) => {
    const vehicleRef = ref(rtdb, `${TELEMETRY_PATH}/${telemetry.vehicleId}`);
    await set(vehicleRef, {
        ...telemetry,
        lastUpdate: Date.now()
    });
};

export const useVehicleTelemetry = (vehicleId: string) => {
    const [telemetry, setTelemetry] = useState<VehicleTelemetry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!vehicleId) return;

        const vehicleRef = ref(rtdb, `${TELEMETRY_PATH}/${vehicleId}`);

        onValue(vehicleRef, (snapshot: DataSnapshot) => {
            if (snapshot.exists()) {
                setTelemetry(snapshot.val() as VehicleTelemetry);
            } else {
                setTelemetry(null);
            }
            setLoading(false);
        }, (err) => {
            console.error("Telemetry Sync Error:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => {
            off(vehicleRef);
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
            timestamp: Date.now()
        });
        overallStatus = 'critical';
    } else if (telemetry.temp > 95) {
        alerts.push({
            id: `temp-warn-${Date.now()}`,
            type: 'warning',
            category: 'engine',
            message: `Temperatura Elevada: ${telemetry.temp}°C. Revise el sistema de enfriamiento.`,
            timestamp: Date.now()
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
            timestamp: Date.now()
        });
        overallStatus = 'critical';
    } else if (telemetry.batteryVoltage < 12.1) {
        alerts.push({
            id: `batt-warn-${Date.now()}`,
            type: 'warning',
            category: 'battery',
            message: `Batería Baja: ${telemetry.batteryVoltage}V. Se recomienda revisión.`,
            timestamp: Date.now()
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
            timestamp: Date.now()
        });
        overallStatus = 'critical';
    } else if (telemetry.fuelLevel < 20) {
        alerts.push({
            id: `fuel-warn-${Date.now()}`,
            type: 'warning',
            category: 'fuel',
            message: `Nivel de Combustible Bajo: ${telemetry.fuelLevel}%.`,
            timestamp: Date.now()
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
            timestamp: Date.now()
        });
        if (overallStatus !== 'critical') overallStatus = 'warning';
    }

    return {
        overallStatus,
        alerts,
        lastCheck: Date.now()
    };
};

export const useVehicleHealth = (vehicleId: string) => {
    const { telemetry, loading, error } = useVehicleTelemetry(vehicleId);
    const lastAlertId = useRef<string | null>(null);

    const health = useMemo(() => {
        if (!telemetry) return null;
        return analyzeVehicleHealth(telemetry);
    }, [telemetry]);

    useEffect(() => {
        if (health) {
            const criticalAlert = health.alerts.find(a => a.type === 'critical');
            if (criticalAlert && criticalAlert.id !== lastAlertId.current) {
                lastAlertId.current = criticalAlert.id;
                nativeBridgeService.sendLocalNotification(
                    'ALERTA CRÍTICA: ' + criticalAlert.category.toUpperCase(),
                    criticalAlert.message
                );
            }
        }
    }, [health]);

    return { health, loading, error };
};
