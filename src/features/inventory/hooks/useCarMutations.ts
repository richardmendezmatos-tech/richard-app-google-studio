
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addVehicle, updateVehicle, deleteVehicle } from '@/features/inventory/services/inventoryService';
import { Car } from '@/types/types';

export const useCarMutations = () => {
    const queryClient = useQueryClient();

    const addMutation = useMutation({
        mutationFn: addVehicle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...updates }: Car) => updateVehicle(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cars'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteVehicle,
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
