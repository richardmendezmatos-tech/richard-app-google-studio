// src/app/api/cron/sync-inventory/route.ts
import { NextResponse } from 'next/server';
import { RunInventorySyncUseCase } from '@/features/inventory-sync/model/RunInventorySyncUseCase';
import { SupabaseInventoryRepository } from '@/entities/inventory/api/SupabaseInventoryRepository';
import { ReconciliationEngine } from '@/features/inventory-sync/model/ReconciliationEngine';
import { RestApiExtractorAdapter } from '@/shared/api/scrapers/RestApiExtractorAdapter';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Evita que Next.js convierta esta ruta en estática

// Vercel Serverless Functions para Playwright necesitan más memoria/tiempo (si el plan lo permite)
export const maxDuration = 300; // 5 minutos máximo

export async function GET(request: Request) {
  // 1. Seguridad: Verificar el "Bearer Token" secreto de Vercel Cron o si es un trigger manual del Admin
  const { searchParams } = new URL(request.url);
  const isManual = searchParams.get('manual') === 'true';
  const authHeader = request.headers.get('authorization');
  
  if (
    process.env.NODE_ENV === 'production' &&
    !isManual &&
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
    const extractor = new RestApiExtractorAdapter();
    const engine = new ReconciliationEngine();
    
    const useCase = new RunInventorySyncUseCase(repository, extractor, engine);

    // 4. Disparo (Doble pasada: Nuevos y Usados para un Mirroring Completo)
    const result = await useCase.execute({
      targetUrls: [
        'https://centralfordpr.com/inventario-nuevos/',
        'https://centralfordpr.com/inventario-usados/'
      ],
      useStealthMode: process.env.NODE_ENV === 'production',
    });

    // 5. Respuesta
    if (result.status === 'FAILED') {
      return NextResponse.json({ 
        error: result.error,
        status: 'partial_failure'
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      telemetry: {
        inserted: result.inserted,
        updated: result.updated,
        sold: result.sold,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[CRON Sync] Error fatal:', error);
    return NextResponse.json({ error: 'Error interno del Cron Sync' }, { status: 500 });
  }
}
