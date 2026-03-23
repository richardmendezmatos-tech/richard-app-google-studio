import { useQuery } from '@tanstack/react-query';
import { DI } from '@/app/di/registry';
import { getSubscribers } from '@/shared/api/firebase/firebaseService';

export const useCommandCenterData = (dealerId: string) => {
  const leadsQuery = useQuery({
    queryKey: ['leads', dealerId],
    queryFn: async () => {
      if (!dealerId) return [];
      const useCase = DI.getGetLeadsUseCase();
      return useCase.execute(dealerId);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const subscribersQuery = useQuery({
    queryKey: ['subscribers', dealerId],
    queryFn: async () => {
      return getSubscribers();
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });

  return {
    leads: leadsQuery.data || [],
    isLoadingLeads: leadsQuery.isLoading,
    isErrorLeads: leadsQuery.isError,
    refetchLeads: leadsQuery.refetch,

    subscribers: subscribersQuery.data || [],
    isLoadingSubscribers: subscribersQuery.isLoading,
    refetchSubscribers: subscribersQuery.refetch,
  };
};
