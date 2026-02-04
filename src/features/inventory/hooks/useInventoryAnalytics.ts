import { useCallback } from 'react';
import { logBehavioralEvent } from '@/features/leads/services/retargetingService';
import { incrementCarView } from '@/features/inventory/services/inventoryService';
import * as ga from '@/services/analytics';

export const useInventoryAnalytics = () => {
    const trackCarView = useCallback((carId: string) => {
        logBehavioralEvent({ carId, action: 'view' });
        ga.trackEvent('Engagement', 'view_car', carId);
    }, []);

    const trackCarViewIncremental = useCallback((carId: string) => {
        incrementCarView(carId);
        logBehavioralEvent({ carId, action: 'view' });
        ga.trackEvent('Engagement', 'view_car', carId);
    }, []);


    const trackGarageAdd = useCallback((carId: string) => {
        logBehavioralEvent({ carId, action: 'garage_add' });
        ga.trackEvent('Conversion', 'add_to_garage', carId);
    }, []);

    const trackCarConfigure = useCallback((carId: string) => {
        logBehavioralEvent({ carId, action: 'configure' });
        ga.trackEvent('Engagement', 'car_configure', carId);
    }, []);

    const trackNeuralMatch = useCallback((lifestyle: string) => {
        ga.trackNeuralMatch(lifestyle);
    }, []);

    const trackVisualSearch = useCallback((analysisType: string) => {
        ga.trackVisualSearch(analysisType);
    }, []);

    const trackCompare = useCallback((car1Id: string, car2Id: string) => {
        ga.trackEvent('Engagement', 'car_comparison', `${car1Id}_vs_${car2Id}`);
    }, []);

    const trackInteraction = useCallback((action: string, details?: any) => {
        ga.trackEvent('AI_Agent', action, details ? JSON.stringify(details) : undefined);
    }, []);

    return {
        trackCarView,
        trackCarViewIncremental,
        trackGarageAdd,
        trackCarConfigure,
        trackNeuralMatch,
        trackVisualSearch,
        trackCompare,
        trackInteraction
    };
};


