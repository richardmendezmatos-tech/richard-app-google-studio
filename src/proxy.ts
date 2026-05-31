import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

/**
 * Richard Automotive Global Proxy (Sentinel N24-PRO Edge)
 * Replaces the deprecated 'middleware' convention for Next.js 16.
 * Handles Supabase sessions, protections, and security headers.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip =
    (request as any).ip || request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';

  // 0. Sentinel N20: Anti-Spam Rate Limiting (with Upstash fallback)
  const protectedApiRoutes: { route: string; limit: number; windowMs: number }[] = [
    { route: '/api/webhooks/leads', limit: 5, windowMs: 60_000 },
    { route: '/api/ai/chat', limit: 10, windowMs: 60_000 },
    { route: '/api/leads', limit: 3, windowMs: 60_000 },
    { route: '/api/command-center/telemetry', limit: 30, windowMs: 60_000 },
    { route: '/api/command-center/intelligence', limit: 20, windowMs: 60_000 },
    { route: '/api/command-center/ai-advisor', limit: 10, windowMs: 60_000 },
    { route: '/api/command-center/blog/generate', limit: 5, windowMs: 60_000 },
    { route: '/api/command-center/nurture/generate', limit: 10, windowMs: 60_000 },
    { route: '/api/validate-turnstile', limit: 20, windowMs: 60_000 },
    { route: '/api/cron/blog-from-gaps', limit: 1, windowMs: 60_000 },
    { route: '/api/cron/ford-news', limit: 1, windowMs: 60_000 },
    { route: '/api/cron/neural-sourcing', limit: 1, windowMs: 60_000 },
    { route: '/api/cron/messages', limit: 1, windowMs: 60_000 },
    { route: '/api/cron/sync-inventory', limit: 1, windowMs: 60_000 },
    { route: '/api/cron/email-scheduler', limit: 1, windowMs: 60_000 },
    { route: '/api/cron/check-stale-leads', limit: 1, windowMs: 60_000 },
    { route: '/api/cron/cleanup-logs', limit: 1, windowMs: 60_000 },
    { route: '/api/cron/market-scraper', limit: 1, windowMs: 60_000 },
    { route: '/api/webhooks/whatsapp', limit: 10, windowMs: 60_000 },
    { route: '/api/webhooks/notion', limit: 10, windowMs: 60_000 },
    { route: '/api/webhooks/sendgrid', limit: 10, windowMs: 60_000 },
    { route: '/api/webhooks/twilio', limit: 10, windowMs: 60_000 },
    { route: '/api/embeddings', limit: 5, windowMs: 60_000 },
    { route: '/api/automation/smart-reply', limit: 10, windowMs: 60_000 },
    { route: '/api/seo/reindex', limit: 3, windowMs: 60_000 },
    { route: '/api/push/send', limit: 10, windowMs: 60_000 },
    { route: '/api/distribution/facebook-feed', limit: 5, windowMs: 60_000 },
    { route: '/api/distribution/sync', limit: 5, windowMs: 60_000 },
    { route: '/api/finance/stats', limit: 20, windowMs: 60_000 },
    { route: '/api/monitoring/vitals', limit: 10, windowMs: 60_000 },
  ];

  for (const rule of protectedApiRoutes) {
    if (pathname.startsWith(rule.route)) {
      const result = await checkRateLimit({
        limit: rule.limit,
        windowMs: rule.windowMs,
        identifier: ip,
      });

      if (!result.success) {
        console.warn(`[Rate Limit] Blocking ${ip} on ${pathname}`);
        return NextResponse.json(
          { error: 'Too many requests. Please slow down.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
              'X-RateLimit-Remaining': '0',
            },
          },
        );
      }
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

  const privateRoutes = ['/admin', '/garage', '/profile', '/panel-control'];
  const adminRoutes = ['/admin', '/panel-control'];

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
    '/panel-control/:path*',
    '/login',
    '/admin-login',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
