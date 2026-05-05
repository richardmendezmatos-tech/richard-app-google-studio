import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

export interface GarageVehicle {
    id: string;
    userId: string;
    make: string;
    model: string;
    year: number;
    mileage: number;
    vin?: string;
    lastServiceDate?: string;
    nextServiceDue?: string;
    estimatedValue?: number;
    status: 'active' | 'sold' | 'archived';
}

/**
 * Service to manage the "Smart Garage" - vehicles owned by leads/customers.
 */
export const garageService = {
    /**
     * Adds a vehicle to a user's digital garage.
     */
    async addVehicle(userId: string, vehicle: Omit<GarageVehicle, 'id' | 'status'>) {
        console.log(`Adding vehicle to garage for user: ${userId}`);
        const supabase = createServerSupabaseClient();
        
        const { data, error } = await supabase.from('garage').insert({
            user_id: userId,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            mileage: vehicle.mileage,
            vin: vehicle.vin,
            last_service_date: vehicle.lastServiceDate,
            next_service_due: vehicle.nextServiceDue,
            estimated_value: vehicle.estimatedValue,
            status: 'active'
        }).select('id').single();

        if (error) throw error;
        return data.id;
    },

    /**
     * Calculates the next maintenance date based on mileage and history.
     */
    calculateNextService(currentMileage: number, lastServiceMileage: number): Date {
        const SERVICE_INTERVAL = 5000; // 5k miles interval
        const milesSinceLast = currentMileage - lastServiceMileage;
        const milesRemaining = Math.max(0, SERVICE_INTERVAL - milesSinceLast);

        // Estimation: average 1000 miles per month
        const monthsRemaining = milesRemaining / 1000;
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + monthsRemaining);

        return nextDate;
    },

    /**
     * Predictive Trade-in logic: Detects when "Equity" is optimal.
     */
    isOptimalTradeInTime(vehicle: GarageVehicle): boolean {
        // Simple logic: High mileage or approaching major service (60k, 100k)
        const transitionPoints = [30000, 60000, 100000];
        return transitionPoints.some(point =>
            vehicle.mileage > (point - 2000) && vehicle.mileage < point
        );
    }
};

