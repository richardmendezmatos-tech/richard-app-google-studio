import { container } from '../infra/di/container';

export const inventoryService = {
  async fetchInventory(dealerId: string) {
    try {
      const useCase = container.getGetInventoryUseCase();
      return await useCase.execute(dealerId);
    } catch (error) {
      console.error('[inventoryService] Error:', error);
      throw error;
    }
  },
};
