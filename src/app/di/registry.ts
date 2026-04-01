// Repository Registry for Dependency Injection
import { FirestoreInventoryRepository } from '@/entities/inventory/api/repositories/FirestoreInventoryRepository';

export const DI = {
  getInventoryUseCase: () => {
    const repository = new FirestoreInventoryRepository();
    return {
      execute: (dealerId: string) => repository.getInventory(dealerId)
    };
  }
};
