import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { garageService } from '@/entities/garage/api/garageService';

export const GARAGE_KEYS = {
  all: ['garage'] as const,
  savedCars: () => [...GARAGE_KEYS.all, 'saved_cars'] as const,
};

/**
 * Hook to retrieve user's saved car IDs
 */
export const useSavedCarIds = () => {
  return useQuery({
    queryKey: GARAGE_KEYS.savedCars(),
    queryFn: () => Promise.resolve(garageService.getSavedCarIds()),
    staleTime: Infinity, // Synchronous cookie read, only invalidated upon mutation
  });
};

/**
 * Hook to save/unsave a car to the garage
 */
export const useToggleSavedCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (carId: string) => Promise.resolve(garageService.toggleSavedCar(carId)),
    onMutate: async (carId) => {
      await queryClient.cancelQueries({ queryKey: GARAGE_KEYS.savedCars() });
      const previousIds = queryClient.getQueryData<string[]>(GARAGE_KEYS.savedCars());
      
      queryClient.setQueryData<string[]>(GARAGE_KEYS.savedCars(), (old = []) => {
        return old.includes(carId) ? old.filter((id) => id !== carId) : [...old, carId];
      });

      return { previousIds };
    },
    onError: (_err, _newVal, context) => {
      if (context?.previousIds) {
        queryClient.setQueryData(GARAGE_KEYS.savedCars(), context.previousIds);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GARAGE_KEYS.savedCars() });
    },
  });
};
