import { useInfiniteQuery } from '@tanstack/react-query';
import { getPaginatedCars } from '../services/firebaseService';
import { QueryDocumentSnapshot } from 'firebase/firestore';

export const useCars = (pageSize: number = 9, filterType: string = 'all') => {
    return useInfiniteQuery({
        queryKey: ['cars', filterType],
        queryFn: async ({ pageParam }) => {
            const result = await getPaginatedCars(
                pageSize,
                pageParam as QueryDocumentSnapshot | null,
                filterType
            );
            return result;
        },
        initialPageParam: null as QueryDocumentSnapshot | null,
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.lastDoc : undefined;
        },
    });
};
