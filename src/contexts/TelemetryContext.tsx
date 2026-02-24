import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getRealtimeDbService } from '@/services/firebaseService';
import { VehicleHealthStatus } from '@/types/types';
import type { DataSnapshot } from 'firebase/database';

interface TelemetryContextType {
    telemetryMap: Record<string, VehicleHealthStatus>;
    subscribeToVehicle: (vehicleId: string) => void;
    unsubscribeFromVehicle: (vehicleId: string) => void;
    loading: boolean;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

const TELEMETRY_PATH = 'telemetry';

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [telemetryMap, setTelemetryMap] = useState<Record<string, VehicleHealthStatus>>({});
    const [activeSubscriptions] = useState(new Map<string, { count: number, unsubscribe: () => void }>());
    const [loading, setLoading] = useState(false);

    const subscribeToVehicle = useCallback(async (vehicleId: string) => {
        if (!vehicleId) return;

        const current = activeSubscriptions.get(vehicleId);
        if (current) {
            activeSubscriptions.set(vehicleId, { ...current, count: current.count + 1 });
            return;
        }

        try {
            const rtdb = await getRealtimeDbService();
            const { ref, onValue, off } = await import('firebase/database');
            const vehicleRef = ref(rtdb, `${TELEMETRY_PATH}/${vehicleId}`);

            const unsub = onValue(vehicleRef, (snapshot: DataSnapshot) => {
                const data = snapshot.exists() ? snapshot.val() : null;
                if (data) {
                    // Import inside to avoid circular deps if needed, but analyzeVehicleHealth is pure
                    import('@/services/telemetryService').then(({ analyzeVehicleHealth }) => {
                        const health = analyzeVehicleHealth(data);
                        setTelemetryMap(prev => ({ ...prev, [vehicleId]: health }));
                    });
                }
            });

            activeSubscriptions.set(vehicleId, { count: 1, unsubscribe: () => off(vehicleRef) });
        } catch (err) {
            console.error(`[TelemetryContext] Subscription failed for ${vehicleId}:`, err);
        }
    }, [activeSubscriptions]);

    const unsubscribeFromVehicle = useCallback((vehicleId: string) => {
        const current = activeSubscriptions.get(vehicleId);
        if (!current) return;

        if (current.count > 1) {
            activeSubscriptions.set(vehicleId, { ...current, count: current.count - 1 });
        } else {
            current.unsubscribe();
            activeSubscriptions.delete(vehicleId);
            setTelemetryMap(prev => {
                const next = { ...prev };
                delete next[vehicleId];
                return next;
            });
        }
    }, [activeSubscriptions]);

    return (
        <TelemetryContext.Provider value={{ telemetryMap, subscribeToVehicle, unsubscribeFromVehicle, loading }}>
            {children}
        </TelemetryContext.Provider>
    );
};

export const useTelemetry = () => {
    const context = useContext(TelemetryContext);
    if (!context) throw new Error('useTelemetry must be used within a TelemetryProvider');
    return context;
};
