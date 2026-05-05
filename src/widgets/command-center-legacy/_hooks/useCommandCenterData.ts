"use client";

"use client";

import { useQuery } from '@tanstack/react-query';
import { DI } from '@/app/(dashboard)/di/registry';

import { Lead } from '@/entities/lead/model/types';
import { Subscriber } from '@/shared/types/types';

export const useCommandCenterData = (dealerId: string) => {
  const leadsQuery = useQuery<Lead[]>({
    queryKey: ['leads', dealerId],
    queryFn: async () => {
      if (!dealerId) return [];
      const useCase = DI.getLeadsUseCase();
      return useCase.execute(dealerId) as Promise<Lead[]>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const subscribersQuery = useQuery<Subscriber[]>({
    queryKey: ['subscribers', dealerId],
    queryFn: async () => {
      const repo = DI.getSubscriberRepository();
      const data = await repo.getSubscribers();
      return (data || []).map((s: any) => ({
        id: s.id || s.email || '',
        email: s.email,
        timestamp: s.created_at ? { seconds: Math.floor(new Date(s.created_at).getTime() / 1000), nanoseconds: 0 } : undefined
      })) as Subscriber[];
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
