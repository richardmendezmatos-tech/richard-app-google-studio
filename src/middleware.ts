import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Sentinel N20: Anti-Spam Rate Limiting Engine
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const LIMIT = 5; // 5 requests
const WINDOW = 60 * 1000; // per minute

export function middleware(request: NextRequest) {
  const ip = request.ip || 'anonymous';
  const path = request.nextUrl.pathname;

  // Only rate limit lead-generating endpoints
  if (path.startsWith('/api/webhooks/leads') || path.startsWith('/api/ai/chat')) {
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
      console.warn(`🚨 [Rate Limit] Blocking ${ip} for too many requests on ${path}`);
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
