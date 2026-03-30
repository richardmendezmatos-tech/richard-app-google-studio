import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { garageService } from '@/entities/garage/api/garageService';
import { FinancialApplication } from '@/shared/types/types';

export const APPLICATION_KEYS = {
  all: ['financial_applications'] as const,
};

/**
 * Hook to retrieve user's saved financial applications
 */
export const useApplications = () => {
  return useQuery({
    queryKey: APPLICATION_KEYS.all,
    queryFn: () => Promise.resolve(garageService.getFinancialApplications()),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to save a new financial application
 */
export const useSaveApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (app: FinancialApplication) => Promise.resolve(garageService.saveFinancialApplication(app)),
    onSuccess: (data) => {
      queryClient.setQueryData(APPLICATION_KEYS.all, data);
      queryClient.invalidateQueries({ queryKey: APPLICATION_KEYS.all });
    },
  });
};
