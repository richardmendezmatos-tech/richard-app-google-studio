import { useCallback } from 'react';

import * as ga from '@/shared/api/metrics/analytics';

export const useInventoryAnalytics = () => {
  const trackCarView = useCallback((carId: string) => {
    ga.trackEvent('Engagement', 'view_car', carId);
  }, []);

  const trackCarViewIncremental = useCallback((carId: string) => {
    fetch('/api/inventory/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carId }),
    }).catch(() => {});
    ga.trackEvent('Engagement', 'view_car', carId);
  }, []);

  const trackGarageAdd = useCallback((carId: string) => {
    ga.trackEvent('Conversion', 'add_to_garage', carId);
  }, []);

  const trackCarConfigure = useCallback((carId: string) => {
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

  const trackTabChange = useCallback((carId: string, tabName: string) => {
    ga.trackEvent('Engagement', 'tab_switch', `${carId}_to_${tabName}`);
  }, []);

  return {
    trackCarView,
    trackCarViewIncremental,
    trackGarageAdd,
    trackCarConfigure,
    trackNeuralMatch,
    trackVisualSearch,
    trackCompare,
    trackInteraction,
    trackTabChange,
  };
};
