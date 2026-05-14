/**
 * DIRECT DB TEST: Inventory Ingestion
 * Bypasses the API and tests the repository directly.
 */
import { createClient } from '../src/shared/api/supabase/client';
import { SupabaseInventoryRepository } from '../src/entities/inventory/api/SupabaseInventoryRepository';
import { Vehicle } from '../src/entities/inventory/model/sync/Vehicle';

async function testDirectDB() {
  console.log('🚀 Testing Direct Database Ingestion...');

  try {
    const supabase = createClient();
    const repository = new SupabaseInventoryRepository(supabase);

    const finalVin = '1HGBH4854E104386' + Math.floor(Math.random() * 9);
    const finalVin17 = finalVin.substring(0, 17);
    
    const vehicle = Vehicle.create(finalVin17, {
      make: 'Ferrari',
      model: 'SF90 Stradale',
      year: 2024,
      price: 524000,
      mileage: 5,
      images: ['https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80'],
      status: 'AVAILABLE',
      condition: 'NEW',
      trim: 'Assetto Fiorano',
      transmission: 'DCT',
      engine: 'V8 Hybrid',
      exteriorColor: 'Rosso Corsa',
      lastScrapedAt: new Date(),
    });

    await repository.insertBatch([vehicle]);
    console.log('✅ Direct Ingestion Successful for VIN:', vin);

  } catch (error: any) {
    console.error('❌ Direct Ingestion Failed:', error.message);
  }
}

testDirectDB();
