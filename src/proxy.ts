import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/shared/api/supabase/middleware';

export async function proxy(request: NextRequest) {
  // 1. Ejecutar actualización de sesión de Supabase (Middleware-based session refresh)
  const supabaseResponse = await updateSession(request);
  
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // 2. Redirigir a login si no hay sesión y trata de acceder a rutas protegidas
  // (Mantenemos compatibilidad con la lógica de sesión personalizada 'session' cookie)
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

  // Conservar headers personalizados
  supabaseResponse.headers.set('X-Richard-Edge', 'true');
  
  return supabaseResponse;
}

// Configuración de rutas que el middleware/proxy debe interceptar
export const config = {
  matcher: [
    '/admin/:path*', 
    '/garage/:path*', 
    '/profile/:path*', 
    '/command-center/:path*',
    '/login', 
    '/admin-login',
    '/api/:path*'
  ],
};
