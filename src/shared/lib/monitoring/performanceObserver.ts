import { raSentinel } from './raSentinelService';
import { getAuditRepository } from '@/shared/api/houston/AuditRepositoryProvider';

function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (metric) {
    case 'LCP': return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
    case 'FID':
    case 'INP': return value < 200 ? 'good' : value < 500 ? 'needs-improvement' : 'poor';
    case 'CLS': return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
    case 'FCP': return value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB': return value < 800 ? 'good' : value < 1800 ? 'needs-improvement' : 'poor';
    default: return 'needs-improvement';
  }
}

function getScore(metric: string, value: number): number {
  switch (metric) {
    case 'LCP': return value < 1200 ? 100 : value < 2500 ? 85 : value < 4000 ? 60 : 30;
    case 'FID':
    case 'INP': return value < 100 ? 100 : value < 200 ? 85 : value < 500 ? 60 : 30;
    case 'CLS': return value < 0.05 ? 100 : value < 0.1 ? 85 : value < 0.25 ? 60 : 30;
    case 'FCP': return value < 1000 ? 100 : value < 1800 ? 85 : value < 3000 ? 60 : 30;
    case 'TTFB': return value < 400 ? 100 : value < 800 ? 85 : value < 1800 ? 60 : 30;
    default: return 50;
  }
}

function reportToApi(metric: string, value: number, rating: string) {
  try {
    const payload = { metric, value, rating, page: window.location.pathname };
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/monitoring/vitals', JSON.stringify(payload));
    } else {
      fetch('/api/monitoring/vitals', { method: 'POST', body: JSON.stringify(payload), keepalive: true }).catch(() => {});
    }
  } catch {
    // fire-and-forget
  }
}

function report(metric: string, value: number) {
  const rating = getRating(metric, value);
  const score = getScore(metric, value);

  raSentinel.reportPerformance(metric, value, score);
  reportToApi(metric, value, rating);

  getAuditRepository().then((repo) =>
    repo.log(
      rating === 'poor' ? 'warning' : 'info',
      `RUM ${metric}: ${rating} (${Math.round(value)}${metric === 'CLS' ? '' : 'ms'})`,
      { [metric]: value, rating, score },
      'Sentinel-Vitals',
    ),
  );
}

export const observerPerformance = () => {
  if (typeof window === 'undefined') return;

  // TTFB via Navigation Timing API
  if (performance?.getEntriesByType?.('navigation')?.length) {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    report('TTFB', nav.responseStart - nav.requestStart);
  }

  // LCP
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length) {
        report('LCP', entries[entries.length - 1].startTime);
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch { /* unsupported */ }

  // FID (legacy, for older browsers)
  try {
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        report('FID', entry.duration);
      });
    }).observe({ type: 'first-input', buffered: true });
  } catch { /* unsupported */ }

  // INP (Interaction to Next Paint — replaces FID in 2024+)
  try {
    let inpValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        inpValue = Math.max(inpValue, entry.duration);
      }
      if (inpValue > 0) {
        report('INP', inpValue);
      }
    }).observe({ type: 'event', durationThreshold: 40, buffered: true } as any);
  } catch { /* unsupported */ }

  // CLS
  try {
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      if (clsValue > 0) {
        report('CLS', clsValue);
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch { /* unsupported */ }

  // FCP
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          report('FCP', entry.startTime);
          break;
        }
      }
    }).observe({ type: 'paint', buffered: true });
  } catch { /* unsupported */ }
};
