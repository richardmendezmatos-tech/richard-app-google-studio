import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAuditRepository } from '@/shared/api/houston/AuditRepositoryProvider';

/**
 * POST /api/seo/reindex
 * Triggers an on-demand revalidation of the sitemap and core inventory pages.
 * Ensures search engines receive the most up-to-date data.
 */
export async function POST(req: Request) {
  try {
    const audit = await getAuditRepository();
    
    console.log('[SEO API] Invocando revalidación on-demand...');

    // 1. Revalidar rutas críticas
    revalidatePath('/sitemap.xml');
    revalidatePath('/inventario');
    revalidatePath('/(dashboard)/command-center', 'page');

    // 2. Log de auditoría
    await audit.log({
      type: 'info',
      message: 'Sitemap & Inventory revalidation triggered via Command Center',
      source: 'SentinelSEO',
      metadata: { 
        paths: ['/sitemap.xml', '/inventario'],
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'SEO Revalidation triggered successfully',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[SEO API] Error during revalidation:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal server error during SEO sync'
    }, { status: 500 });
  }
}
