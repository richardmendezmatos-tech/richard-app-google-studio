import { useInfiniteQuery } from '@tanstack/react-query';
import { getPaginatedCars } from '@/features/inventory/services/inventoryService';
import { QueryDocumentSnapshot } from 'firebase/firestore';

export const useCars = (
    pageSize: number = 9,
    filterType: string = 'all',
    sortOrder: 'asc' | 'desc' | null = null
) => {
    return useInfiniteQuery({
        queryKey: ['cars', filterType, sortOrder],
        queryFn: async ({ pageParam }) => {
            const result = await getPaginatedCars(
                pageSize,
                pageParam as QueryDocumentSnapshot | null,
                filterType,
                sortOrder
            );
            return result;
        },
        initialPageParam: null as QueryDocumentSnapshot | null,
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.lastDoc : undefined;
        },
        staleTime: 5 * 60 * 1000,
    });
};
