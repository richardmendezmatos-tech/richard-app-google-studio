import { inventoryRepo } from './src/shared/api/houston/InventoryRepository';

async function run() {
  try {
    const all = await inventoryRepo.getAll();
    console.log('Available VINs:', all.slice(0, 5).map(v => ({ name: v.name, vin: v.vin })));
  } catch (e) {
    console.error('Failed to fetch inventory:', e.message);
  }
}

run();
