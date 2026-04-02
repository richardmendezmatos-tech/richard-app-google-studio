import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // 1. Redirigir a login si no hay sesión y trata de acceder a rutas protegidas
  const privateRoutes = ['/admin', '/garage', '/profile'];
  const isPrivate = privateRoutes.some(route => pathname.startsWith(route));

  if (isPrivate && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Si hay sesión y trata de ir a login, redirigir a dashboard o home
  if (session && (pathname === '/login' || pathname === '/admin-login')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.includes('admin') ? '/admin' : '/';
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set('X-Richard-Edge', 'true');
  return response;
}

// Configuración de rutas que el middleware debe interceptar
export const config = {
  matcher: ['/admin/:path*', '/garage/:path*', '/profile/:path*', '/login', '/admin-login'],
};
