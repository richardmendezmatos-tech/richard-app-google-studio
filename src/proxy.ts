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
  const ip =
    (request as any).ip || request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';

  // 0. Sentinel N20: Anti-Spam Rate Limiting
  const protectedApiRoutes = [
    '/api/webhooks/leads',
    '/api/ai/chat',
    '/api/command-center/telemetry',
    '/api/command-center/intelligence',
  ];

  if (protectedApiRoutes.some((route) => pathname.startsWith(route))) {
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
      return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  // 0.5. Edge Caching for Intelligence (Nivel 22)
  if (pathname.includes('/api/command-center/intelligence') && request.method === 'GET') {
    supabaseResponse.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const privateRoutes = ['/admin', '/garage', '/profile', '/command-center'];
  const adminRoutes = ['/admin', '/command-center'];

  const isPrivate = privateRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // SENTINEL BYPASS: Allow local development bypass for e2e testing
  const bypassCookie = request.cookies.get('e2e_bypass')?.value;
  const isDevBypass =
    process.env.NODE_ENV === 'development' &&
    (bypassCookie === 'true' || request.nextUrl.searchParams.get('bypass') === 'true');

  if (isDevBypass) {
    if (request.nextUrl.searchParams.get('bypass') === 'true' && bypassCookie !== 'true') {
      supabaseResponse.cookies.set('e2e_bypass', 'true', { path: '/' });
    }
    return supabaseResponse;
  }

  // 1. Redirigir a login si no hay sesión y trata de acceder a rutas protegidas
  if (!user && isPrivate && !pathname.includes('telemetry') && !pathname.includes('/login') && !pathname.startsWith('/admin-login')) {
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
      email.endsWith('@richard-automotive.com');

    if (!isAdmin) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/garage';
        return NextResponse.redirect(url);
      }
    }
  }

  // 3. Security Headers & Telemetry
  supabaseResponse.headers.set('X-Richard-Edge', 'true');
  supabaseResponse.headers.set('X-Sentinel-Version', 'N24-PRO');
  supabaseResponse.headers.set('X-Vibecoding-Layer', 'Nivel-15');

  // 4. Geo-headers for localization
  const country = request.headers.get('x-vercel-ip-country') || 'PR';
  const region = request.headers.get('x-vercel-ip-country-region') || '';
  const city = request.headers.get('x-vercel-ip-city') || '';
  supabaseResponse.headers.set('X-Geo-Country', country);
  supabaseResponse.headers.set('X-Geo-Region', region);
  supabaseResponse.headers.set('X-Geo-City', city);

  // Pass geo to response for client-side use
  if (country === 'PR' || country === 'US') {
    supabaseResponse.headers.set('X-Market', 'PR');
  } else {
    supabaseResponse.headers.set('X-Market', 'international');
  }

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
