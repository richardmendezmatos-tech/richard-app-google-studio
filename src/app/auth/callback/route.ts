import { NextResponse } from 'next/server';
import { createClient } from '@/shared/api/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // 1. Logic to create profile if it doesn't exist
      // We can't use DI easily here since it might be client-side registry,
      // but we can call a simplified internal version or rely on DB triggers.
      // For now, let's just ensure the redirect is clean.
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
