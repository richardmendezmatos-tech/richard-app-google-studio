export async function verifyTurnstileToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      console.warn('[Turnstile] TURNSTILE_SECRET_KEY not configured — skipping verification');
      return true;
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });

    const data = await res.json();
    return data.success === true;
  } catch (error) {
    console.error('[Turnstile] Verification error:', error);
    return false;
  }
}
