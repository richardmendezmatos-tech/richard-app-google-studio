import { InventoryRepository } from '../../domain/repositories/InventoryRepository';
import { Car } from '../../domain/entities';

export class GetInventory {
    constructor(private inventoryRepo: InventoryRepository) { }

    async execute(dealerId: string, limit: number = 100): Promise<Car[]> {
        if (!dealerId) throw new Error("Dealer ID is required");
        return await this.inventoryRepo.getInventory(dealerId, limit);
    }
}
