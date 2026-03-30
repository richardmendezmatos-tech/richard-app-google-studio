import { DI } from '@/app/di/registry';

export const inventoryService = {
  async fetchInventory(dealerId: string) {
    try {
      const useCase = DI.getInventoryUseCase();
      return await useCase.execute(dealerId);
    } catch (error) {
      console.error('[inventoryService] Error:', error);
      throw error;
    }
  },
};
