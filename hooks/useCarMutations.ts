
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCar, updateCar, deleteCar } from '../services/firebaseService';
import { Car } from '../types';

export const useCarMutations = () => {
    const queryClient = useQueryClient();

    const addMutation = useMutation({
        mutationFn: addCar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateCar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
    });

    return {
        addCar: addMutation.mutateAsync,
        updateCar: updateMutation.mutateAsync,
        deleteCar: deleteMutation.mutateAsync,
        isPending: addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
        error: addMutation.error || updateMutation.error || deleteMutation.error
    };
};
