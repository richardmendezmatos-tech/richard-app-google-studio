import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ [Supabase Middleware] Missing environment variables. Skipping session update.');
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const privateRoutes = ['/admin', '/garage', '/profile', '/command-center'];
  const adminRoutes = ['/admin', '/command-center'];
  const currentPath = request.nextUrl.pathname;
  
  const isPrivateRoute = privateRoutes.some(route => currentPath.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => currentPath.startsWith(route));

  // 1. Protection for any private route (must be logged in)
  if (!user && isPrivateRoute && !currentPath.startsWith('/login') && !currentPath.startsWith('/auth')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', currentPath);
    return NextResponse.redirect(url);
  }

  // 2. Strict Protection for Admin routes (must be an admin email)
  if (user && isAdminRoute) {
    const email = user.email?.toLowerCase() || '';
    const isAdmin = 
      email === 'richardmendezmatos@gmail.com' || 
      email.endsWith('@richard-automotive.com') ||
      email.includes('admin');

    if (!isAdmin) {
      // Not an admin, redirect to garage or home
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
