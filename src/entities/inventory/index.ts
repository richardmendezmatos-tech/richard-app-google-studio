export type { CarType, Car } from './model/types';
export { CarSchema } from './model/types';
export { calculatePredictiveDTS } from './lib/dtsEngine';
export { initialInventoryData } from './model/initialInventory';
export type { InventoryRepository } from './api/InventoryRepository';
export { SupabaseInventoryRepository } from './api/SupabaseInventoryRepository';
export { inventoryService, uploadInitialInventory } from './api/inventoryService';
export type { Vehicle } from './api/adapters/inventoryService';
export {
  getInventory,
  logInventoryVelocityEvent,
  getRecentVelocityMetrics,
  incrementCarView,
  getCarById,
  getSimilarCars,
  uploadVehicleImages,
  getPaginatedCars,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} from './api/adapters/inventoryService';
