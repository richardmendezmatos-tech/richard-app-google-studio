import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';
import { InventoryRepository } from '../../domain/repositories/IInventoryRepository';
import { Car } from '../../domain/entities';

export class SupabaseInventoryRepository implements InventoryRepository {
    private tableName = 'inventory';

    async getAll(): Promise<Car[]> {
        const supabase = createServerSupabaseClient();
        const { data, error } = await supabase.from(this.tableName).select('*');
        if (error) throw error;
        
        // Safeguard: Ensure name exists for all cars to prevent .split() crashes
        return (data || []).map(car => ({
            ...car,
            name: car.name || `${car.year} ${car.make} ${car.model}`
        })) as Car[];
    }

    async getById(id: string): Promise<Car | null> {
        const supabase = createServerSupabaseClient();
        const { data, error } = await supabase.from(this.tableName).select('*').eq('id', id).single();
        if (error || !data) return null;
        
        return {
            ...data,
            name: data.name || `${data.year} ${data.make} ${data.model}`
        } as Car;
    }

    async update(id: string, data: Partial<Car>): Promise<void> {
        const supabase = createServerSupabaseClient();
        const { error } = await supabase.from(this.tableName).update(data).eq('id', id);
        if (error) throw error;
    }

    async updateEmbedding(id: string, embedding: number[]): Promise<void> {
        const supabase = createServerSupabaseClient();
        const { error } = await supabase
            .from(this.tableName)
            .update({ embedding })
            .eq('id', id);
        if (error) throw error;
    }
}
