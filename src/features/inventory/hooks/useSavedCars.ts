import { useState, useCallback, useEffect } from 'react';
import { getCookie, setCookie } from '@/shared/api/tracking/cookieService';
import { useInventoryAnalytics } from './useInventoryAnalytics';

const SAVED_CARS_COOKIE = 'richard_saved_cars';

export const useSavedCars = () => {
  const { trackGarageAdd } = useInventoryAnalytics();

  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const savedCookie = getCookie(SAVED_CARS_COOKIE);
    if (!savedCookie) return;

    try {
      const parsed = JSON.parse(savedCookie);
      if (Array.isArray(parsed)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSavedIds(parsed);
      }
    } catch (e) {
      console.error('Error parsing saved cars cookie', e);
    }
  }, []);

  const toggleSave = useCallback(
    (carId: string) => {
      setSavedIds((prev) => {
        const isSaving = !prev.includes(carId);
        const newSaved = isSaving ? [...prev, carId] : prev.filter((id) => id !== carId);

        if (isSaving) {
          trackGarageAdd(carId);
        }

        setCookie(SAVED_CARS_COOKIE, JSON.stringify(newSaved), 30);
        return newSaved;
      });
    },
    [trackGarageAdd],
  );

  const isSaved = useCallback(
    (carId: string) => {
      return savedIds.includes(carId);
    },
    [savedIds],
  );

  return {
    savedIds,
    toggleSave,
    isSaved,
  };
};
