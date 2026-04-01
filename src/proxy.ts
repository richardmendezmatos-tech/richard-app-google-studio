import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const session = request.cookies.get('session');

  // Redirigir a login si no hay sesión y trata de acceder a rutas protegidas
  if (!session && (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/garage'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Si hay sesión y trata de ir a login, redirigir a dashboard o home
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/admin-login')) {
    const url = request.nextUrl.clone();
    url.pathname = request.nextUrl.pathname.includes('admin') ? '/admin' : '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configuración de rutas que el middleware debe interceptar
export const config = {
  matcher: ['/admin/:path*', '/garage/:path*', '/login', '/admin-login'],
};
