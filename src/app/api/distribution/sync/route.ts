import { NextResponse } from 'next/server';
import { autonomousDistributionAgent } from '@/features/automation/api/distributionAgent';

/**
 * POST /api/distribution/sync
 * Dispara el ciclo autónomo de distribución Sentinel (Nivel 26).
 */
export async function POST(req: Request) {
  // En producción, aquí verificaríamos el rol de admin vía middleware o token
  
  try {
    console.log('[Sync API] Iniciando Ciclo Autónomo de Distribución...');
    
    // Disparar ciclo (podemos esperar a que termine o correrlo en background)
    // Para esta fase, esperaremos para devolver métricas precisas al dashboard.
    const results = await autonomousDistributionAgent.runCycle();

    return NextResponse.json({ 
      success: true,
      message: 'Ciclo autónomo completado con éxito', 
      processed: results.processed,
      errors: results.errors,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[Sync API] Fallo crítico en ciclo autónomo:', err);
    return NextResponse.json({ 
      success: false,
      error: err.message || 'Error interno en la orquestación'
    }, { status: 500 });
  }
}
