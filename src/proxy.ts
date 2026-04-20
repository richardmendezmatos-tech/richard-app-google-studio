import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/shared/api/supabase/middleware';

/**
 * Richard Automotive Global Proxy (Sentinel N23)
 * Handles Supabase sessions, protections, and security headers.
 */
export async function proxy(request: NextRequest) {
  // 1. Ejecutar actualización de sesión de Supabase (Middleware-based session refresh)
  const supabaseResponse = await updateSession(request);
  
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // 2. Redirigir a login si no hay sesión y trata de acceder a rutas protegidas
  const privateRoutes = ['/admin', '/garage', '/profile', '/command-center'];
  const isPrivate = privateRoutes.some(route => pathname.startsWith(route));

  if (isPrivate && !session && !pathname.includes('telemetry')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // 3. Si hay sesión y trata de ir a login, redirigir a dashboard o home
  if (session && (pathname === '/login' || pathname === '/admin-login')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.includes('admin') ? '/admin' : '/';
    return NextResponse.redirect(url);
  }

  // 4. Agregar Cabeceras de Seguridad y Telemetría
  supabaseResponse.headers.set('X-Richard-Edge', 'true');
  supabaseResponse.headers.set('X-Frame-Options', 'DENY');
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
  supabaseResponse.headers.set('X-Sentinel-Version', 'N23-PRO');
  
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/garage/:path*', 
    '/profile/:path*', 
    '/command-center/:path*',
    '/login', 
    '/admin-login',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
