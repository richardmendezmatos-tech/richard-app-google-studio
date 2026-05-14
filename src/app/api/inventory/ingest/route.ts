import { NextResponse } from 'next/server';
import { createClient } from '@/shared/api/supabase/client';
import { SupabaseInventoryRepository } from '@/entities/inventory/api/SupabaseInventoryRepository';
import { Vehicle } from '@/entities/inventory/model/sync/Vehicle';
import { InventoryMatchingService } from '@/server/services/inventoryMatchingService';

export async function POST(request: Request) {
  try {
    const carData = await request.json();
    
    if (!carData.vin) {
      return NextResponse.json({ error: 'VIN is required for ingestion' }, { status: 400 });
    }

    const supabase = createClient();
    const repository = new SupabaseInventoryRepository(supabase);

    // Check if vehicle already exists
    const existing = await repository.getCarById(carData.vin);
    if (existing) {
      return NextResponse.json({ error: 'Vehicle already exists in inventory' }, { status: 409 });
    }

    // Map to Domain Vehicle
    const vehicle = Vehicle.create(carData.vin, {
      make: carData.make || 'Unknown',
      model: carData.model || 'Unknown',
      year: carData.year || new Date().getFullYear(),
      price: carData.price || 0,
      mileage: carData.mileage || 0,
      images: carData.image ? [carData.image] : [],
      status: 'AVAILABLE',
      condition: 'USED',
      trim: carData.trim || '',
      transmission: carData.transmission || '',
      engine: carData.engine || '',
      exteriorColor: carData.color || '',
      lastScrapedAt: new Date(),
    });

    await repository.insertBatch([vehicle]);
    
    // 🎯 TRIGGER: Proactive Matching (Neural Match v3)
    // Run in background to not block the ingestion UI
    InventoryMatchingService.matchInventoryToLeads(carData.vin, {
      ...carData,
      name: `${carData.year} ${carData.make} ${carData.model}`
    }).catch(err => console.error('[Ingest] Match trigger failed:', err));

    return NextResponse.json({ 
      success: true, 
      message: 'Vehicle ingested successfully and matches calculated',
      vin: carData.vin 
    });

  } catch (error: any) {
    console.error('[Inventory Ingest API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
