import { useInfiniteQuery } from '@tanstack/react-query';
import { searchInventory } from '@/entities/inventory/api/actions/searchInventory';

export const useCars = (
  pageSize: number = 9,
  filterType: string = 'all',
  sortOrder: 'asc' | 'desc' | null = null,
  searchTerm?: string,
  sortBy: 'price' | 'year' | 'mileage' | 'created_at' = 'price',
) => {
  return useInfiniteQuery({
    queryKey: ['cars', filterType, sortOrder, searchTerm, sortBy],
    queryFn: async ({ pageParam }) => {
      const result = await searchInventory(
        pageSize,
        pageParam as number,
        filterType,
        sortOrder,
        searchTerm,
        sortBy,
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
