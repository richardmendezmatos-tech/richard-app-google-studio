// src/app/api/cron/sync-inventory/route.ts
import { NextResponse } from 'next/server';
import { RunInventorySyncUseCase } from '@/features/inventory-sync/model/RunInventorySyncUseCase';
import { SupabaseInventoryRepository } from '@/entities/inventory/api/SupabaseInventoryRepository';
import { PlaywrightWebExtractorAdapter } from '@/shared/api/scrapers/PlaywrightWebExtractorAdapter';
import { ReconciliationEngine } from '@/features/inventory-sync/model/ReconciliationEngine';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Evita que Next.js convierta esta ruta en estática

// Vercel Serverless Functions para Playwright necesitan más memoria/tiempo (si el plan lo permite)
export const maxDuration = 300; // 5 minutos máximo

export async function GET(request: Request) {
  // 1. Seguridad: Verificar el "Bearer Token" secreto de Vercel Cron
  // En desarrollo local nos podemos saltar esto o usar un token propio
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Inicializar Cliente Supabase (Setup estricto @supabase/ssr)
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
       console.error('[CRON Sync] Missing Supabase credentials');
       return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const supabaseClient = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore if called from Server Component
            }
          },
        },
      }
    );

    // 3. Orquestación Inyección de Dependencias
    const repository = new SupabaseInventoryRepository(supabaseClient);
    const extractor = new PlaywrightWebExtractorAdapter();
    const engine = new ReconciliationEngine();
    
    const useCase = new RunInventorySyncUseCase(repository, extractor, engine);

    // 4. Disparo
    const result = await useCase.execute({
      baseUrl: 'https://centralfordpr.com/inventario-nuevos/',
      useStealthMode: process.env.NODE_ENV === 'production',
    });

    // 5. Respuesta
    if (result.status === 'FAILED') {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Sincronización Completada',
      telemetry: result
    }, { status: 200 });

  } catch (error: any) {
    console.error('[CRON Sync] Error fatal:', error);
    return NextResponse.json({ error: 'Error interno del Cron Sync' }, { status: 500 });
  }
}
