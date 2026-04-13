import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Richard Automotive Global Middleware (Sentinel N23)
 * Handles:
 * 1. Auth redirection for (dashboard) routes.
 * 2. i18n placeholders.
 * 3. Security headers.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Dashboard Protection
  const isDashboardRoute = pathname.includes('/command-center') || 
                          pathname.includes('/ai-lab') || 
                          pathname.includes('/admin');
                          
  const sessionCookie = request.cookies.get('session');

  if (isDashboardRoute && !sessionCookie) {
    // For now, redirect to login if no session is found
    // return NextResponse.redirect(new URL('/login', request.url));
    // NOTE: Disabled until Auth flow is fully tested with the new group structure
  }

  // 2. Add Security Headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Sentinel-Version', 'N23-PRO');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
