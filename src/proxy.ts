import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Sentinel N20: Anti-Spam Rate Limiting Engine (Edge Persistent Map per instance)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const LIMIT = 5; // 5 requests
const WINDOW = 60 * 1000; // per minute

/**
 * Richard Automotive Global Proxy (Sentinel N24-PRO Edge)
 * Replaces the deprecated 'middleware' convention for Next.js 16.
 * Handles Supabase sessions, protections, and security headers.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || 'anonymous';

  // 0. Sentinel N20: Anti-Spam Rate Limiting
  if (pathname.startsWith('/api/webhooks/leads') || pathname.startsWith('/api/ai/chat')) {
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - rateData.lastReset > WINDOW) {
      rateData.count = 1;
      rateData.lastReset = now;
    } else {
      rateData.count++;
    }

    rateLimitMap.set(ip, rateData);

    if (rateData.count > LIMIT) {
      console.warn(`🚨 [Rate Limit] Blocking ${ip} for too many requests on ${pathname}`);
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429 }
      );
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const privateRoutes = ['/admin', '/garage', '/profile', '/command-center'];
  const adminRoutes = ['/admin', '/command-center'];
  
  const isPrivate = privateRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // SENTINEL BYPASS: Allow local development bypass if a specific dev cookie is set
  const isDevBypass = request.cookies.get('sentinel_dev_bypass')?.value === 'active';
  
  if (isDevBypass && process.env.NODE_ENV === 'development') {
    return supabaseResponse;
  }

  // 1. Redirigir a login si no hay sesión y trata de acceder a rutas protegidas
  if (!user && isPrivate && !pathname.includes('telemetry') && !pathname.includes('/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Strict Protection for Admin routes
  if (user && isAdminRoute) {
    const email = user.email?.toLowerCase().trim() || '';
    const isAdmin = 
      email === 'richardmendezmatos@gmail.com' || 
      email.includes('richardmendezmatos') ||
      email.endsWith('@richard-automotive.com') ||
      email.includes('admin');

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/garage';
      return NextResponse.redirect(url);
    }
  }

  // 3. Security Headers & Telemetry
  supabaseResponse.headers.set('X-Richard-Edge', 'true');
  supabaseResponse.headers.set('X-Sentinel-Version', 'N24-PRO');
  supabaseResponse.headers.set('X-Vibecoding-Layer', 'Nivel-15');
  
  return supabaseResponse;
}

// Next.js 16 requires the proxy function to be the default export in proxy.ts
export default proxy;

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
