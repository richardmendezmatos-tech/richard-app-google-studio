import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { garageService } from '@/entities/garage/api/garageService';
import { Appraisal } from '@/shared/types/types';

export const APPRAISAL_KEYS = {
  all: ['appraisals'] as const,
};

/**
 * Hook to retrieve user's saved appraisals history
 */
export const useAppraisals = () => {
  return useQuery({
    queryKey: APPRAISAL_KEYS.all,
    queryFn: () => Promise.resolve(garageService.getAppraisals()),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

/**
 * Hook to save a new appraisal to the digital garage
 */
export const useSaveAppraisal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appraisal: Appraisal) => Promise.resolve(garageService.saveAppraisal(appraisal)),
    onSuccess: (data) => {
      // Direct update to cache for instant UI feedback
      queryClient.setQueryData(APPRAISAL_KEYS.all, data);
      queryClient.invalidateQueries({ queryKey: APPRAISAL_KEYS.all });
    },
  });
};
