import { NextResponse } from 'next/server';
import { createClient } from '@/shared/api/supabase/client';
import { distributionAgent } from '@/shared/api/distribution/DistributionAgent';
import { Car } from '@/entities/inventory';

/**
 * POST /api/distribution/sync
 * Dispara una sincronización global de todas las unidades 'available'.
 */
export async function POST(req: Request) {
  const supabase = createClient();
  if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

  // 1. Obtener todas las unidades disponibles
  const { data: inventory, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('status', 'available');

  if (error || !inventory) {
    return NextResponse.json({ error: error?.message || 'Inventory not found' }, { status: 404 });
  }

  const cars = inventory as Car[];
  const platforms = ['facebook_marketplace', 'clasificados_online'] as const;

  // 2. Disparar sincronización (No esperamos a que termine todo para responder)
  // En una arquitectura real, esto se mandaría a una cola (Redis/SQS)
  const syncPromises = cars.flatMap(car => 
    platforms.map(platform => distributionAgent.triggerSync(car, platform))
  );

  // Ejecutamos en paralelo (limitado o secuencial sería mejor para producción)
  Promise.all(syncPromises)
    .then(results => {
      console.log(`[Sync API] Sincronización global completada. Éxitos: ${results.filter(Boolean).length}/${results.length}`);
    })
    .catch(err => {
      console.error('[Sync API] Error crítico en sincronización global:', err);
    });

  return NextResponse.json({ 
    message: 'Sincronización global iniciada', 
    units: cars.length,
    platforms: platforms.length
  });
}
