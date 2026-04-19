import { DI } from '@/app/(dashboard)/di/registry';
import { STATIC_INVENTORY_FALLBACK } from '@/shared/api/inventory/staticInventory';

export const inventoryService = {
  async fetchInventory(dealerId: string) {
    try {
      const useCase = DI.getInventoryUseCase();
      const results = await useCase.execute(dealerId);

      // Sentinel Check: If empty or nearly empty, augment with fallback for cinematic density
      if (!results || results.length === 0) {
        console.warn('[Sentinel Sync] Empty API response. Engaging Fallback.');
        return STATIC_INVENTORY_FALLBACK;
      }

      return results;
    } catch (error) {
      console.error('[inventoryService] Backend Offline. Engaging Sentinel Sync Fallback:', error);
      return STATIC_INVENTORY_FALLBACK;
    }
  },
};
