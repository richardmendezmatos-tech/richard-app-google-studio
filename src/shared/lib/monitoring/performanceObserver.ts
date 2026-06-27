import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { raSentinel } from './raSentinelService';

type Rating = 'good' | 'needs-improvement' | 'poor';

interface VitalEntry {
  metric: string;
  value: number;
  rating: Rating;
  score: number;
  page: string;
}

const pendingBatch: VitalEntry[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function getScore(metric: string, value: number): number {
  switch (metric) {
    case 'LCP': return value < 1200 ? 100 : value < 2500 ? 85 : value < 4000 ? 60 : 30;
    case 'INP': return value < 100 ? 100 : value < 200 ? 85 : value < 500 ? 60 : 30;
    case 'CLS': return value < 0.05 ? 100 : value < 0.1 ? 85 : value < 0.25 ? 60 : 30;
    case 'FCP': return value < 1000 ? 100 : value < 1800 ? 85 : value < 3000 ? 60 : 30;
    case 'TTFB': return value < 400 ? 100 : value < 800 ? 85 : value < 1800 ? 60 : 30;
    default: return 50;
  }
}

function flushBatch() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  const batch = pendingBatch.splice(0);
  if (batch.length === 0) return;

  const page = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
  const payload = JSON.stringify({ metrics: batch, page });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/monitoring/vitals', payload);
    } else {
      fetch('/api/monitoring/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch { /* fire-and-forget */ }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(flushBatch, 10_000);
}

function report({ name, value, rating }: { name: string; value: number; rating: Rating }) {
  const page = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
  const score = getScore(name, value);

  raSentinel.reportPerformance(name, value, score);

  pendingBatch.push({ metric: name, value, rating, score, page });
  scheduleFlush();
}

export const observerPerformance = () => {
  if (typeof window === 'undefined') return;

  addEventListener('pagehide', flushBatch);
  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushBatch();
  });

  // web-vitals handles correct measurement for all metrics:
  // - LCP: reports the final LCP after user interaction or page hide
  // - CLS: accumulates layout shifts and reports final value on page hide
  // - INP: tracks the worst interaction and reports on page hide (2024 Core Web Vital)
  // - FCP: reports on first contentful paint
  // - TTFB: uses responseStart - activationStart for accurate server response time
  onLCP((m) => report(m));
  onCLS((m) => report(m));
  onINP((m) => report(m));
  onFCP((m) => report(m));
  onTTFB((m) => report(m));
};
