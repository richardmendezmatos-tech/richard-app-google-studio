import { useInfiniteQuery } from '@tanstack/react-query';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';

export const useCars = (
  pageSize: number = 9,
  filterType: string = 'all',
  sortOrder: 'asc' | 'desc' | null = null,
) => {
  return useInfiniteQuery({
    queryKey: ['cars', filterType, sortOrder],
    queryFn: async ({ pageParam }) => {
      const result = await getPaginatedCars(
        pageSize,
        pageParam as number,
        filterType,
        sortOrder,
      );
      return result;
    },
    initialPageParam: 0 as number,
    getNextPageParam: (lastPage) => {
      return lastPage.nextOffset ?? undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};
