import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Prefer ANON_KEY as it's the standard for Supabase Auth in middleware
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      '⚠️ [Supabase Middleware] Missing environment variables. Skipping session update.',
    );
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
        // Update the response with the modified request
        supabaseResponse = NextResponse.next({
          request,
        });
        // Re-apply cookies to the new response
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const privateRoutes = ['/admin', '/garage', '/profile', '/command-center'];
  const adminRoutes = ['/admin', '/command-center'];
  const currentPath = request.nextUrl.pathname;

  const isPrivateRoute = privateRoutes.some((route) => currentPath.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => currentPath.startsWith(route));

  // DEBUG LOG
  console.log(`[Middleware] 📍 Path: ${currentPath} | 👤 User: ${user?.email || 'None'}`);

  // Local development bypass (strictly gated to NODE_ENV === 'development')
  const bypassCookie = request.cookies.get('e2e_bypass')?.value;
  const isDevBypass =
    process.env.NODE_ENV === 'development' &&
    (bypassCookie === 'true' || request.nextUrl.searchParams.get('bypass') === 'true');

  if (isDevBypass) {
    console.log(`[Middleware] ⚡ Development bypass active for: ${currentPath}`);
    if (request.nextUrl.searchParams.get('bypass') === 'true' && bypassCookie !== 'true') {
      supabaseResponse.cookies.set('e2e_bypass', 'true', { path: '/' });
    }
    return supabaseResponse;
  }

  // 1. Protection for any private route (must be logged in)
  if (
    !user &&
    isPrivateRoute &&
    !currentPath.startsWith('/login') &&
    !currentPath.startsWith('/auth')
  ) {
    console.log(`[Middleware] 🔒 Redirecting to login: No user session found for ${currentPath}`);
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', currentPath);
    return NextResponse.redirect(url);
  }

  // 2. Strict Protection for Admin routes (must be an admin email)
  if (user && isAdminRoute) {
    const email = user.email?.toLowerCase().trim() || '';
    const isAdmin =
      email === 'richardmendezmatos@gmail.com' ||
      email.includes('richardmendezmatos') ||
      email.endsWith('@richard-automotive.com') ||
      email.includes('admin');

    if (!isAdmin) {
      console.log(
        `[Middleware] 🚫 Access Denied: User ${email} is not in the admin list. Redirecting to /garage`,
      );
      const url = request.nextUrl.clone();
      url.pathname = '/garage';
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally: return myNewResponse

  return supabaseResponse;
}
