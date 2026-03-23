import { create } from 'zustand';
import { Car } from '@/entities/shared';

interface ComparisonState {
  selectedCars: Car[];
  addCarToCompare: (car: Car) => void;
  removeCarFromCompare: (carId: string) => void;
  isInComparison: (carId: string) => boolean;
  clearComparison: () => void;
}

const getInitialComparison = (): Car[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('richard_compare_cars_full');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error parsing comparisons from local storage', e);
    return [];
  }
};

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  selectedCars: getInitialComparison(),

  addCarToCompare: (car: Car) => {
    const { selectedCars } = get();
    if (selectedCars.length >= 3) {
      alert('Puedes comparar máximo 3 vehículos.');
      return;
    }
    if (!selectedCars.find((c) => c.id === car.id)) {
      const newSelectedCars = [...selectedCars, car];
      if (typeof window !== 'undefined') {
        localStorage.setItem('richard_compare_cars_full', JSON.stringify(newSelectedCars));
      }
      set({ selectedCars: newSelectedCars });
    }
  },

  removeCarFromCompare: (carId: string) => {
    const { selectedCars } = get();
    const newSelectedCars = selectedCars.filter((c) => c.id !== carId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('richard_compare_cars_full', JSON.stringify(newSelectedCars));
    }
    set({ selectedCars: newSelectedCars });
  },

  isInComparison: (carId: string) => {
    return get().selectedCars.some((c) => c.id === carId);
  },

  clearComparison: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('richard_compare_cars_full', JSON.stringify([]));
    }
    set({ selectedCars: [] });
  },
}));

export const useComparison = () => useComparisonStore();
