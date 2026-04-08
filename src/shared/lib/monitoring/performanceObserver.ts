import { raSentinel } from './raSentinelService';
import { auditRepository } from '@/shared/api/houston/AuditRepository';

/**
 * PerformanceObserver: El ojo clínico del Nivel 15.
 * Captura y reporta métricas de Core Web Vitals (LCP, FID, CLS) para asegurar una experiencia Zero-Gravity.
 */
export const observerPerformance = () => {
  if (typeof window === 'undefined') return;

  // LCP (Largest Contentful Paint)
  const lcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    // Nivel 16: Calibración de score por impacto en persuasión
    const lcp = lastEntry.startTime;
    const score = lcp < 1200 ? 100 : lcp < 2500 ? 85 : 50;

    raSentinel.reportPerformance('LCP', lcp, score);

    auditRepository.log({
      type: lcp < 2500 ? 'info' : 'warning',
      message: `RUM LCP Detectado: ${Math.round(lcp)}ms`,
      source: 'Sentinel-Vitals',
      metadata: { lcp }
    });
  });

  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

  // FID (First Input Delay)
  const fidObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach((entry) => {
      const fid = entry.duration;
      const score = fid < 100 ? 100 : 60;

      raSentinel.reportPerformance('FID', fid, score);

      auditRepository.log({
        type: fid < 100 ? 'info' : 'warning',
        message: `RUM FID Detectado: ${Math.round(fid)}ms`,
        source: 'Sentinel-Vitals',
        metadata: { fid }
      });
    });
  });

  fidObserver.observe({ type: 'first-input', buffered: true });

  // CLS (Cumulative Layout Shift)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries() as any[]) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    }
    
    const score = clsValue < 0.1 ? 100 : 40;
    raSentinel.reportPerformance('CLS', clsValue, score);

    if (clsValue > 0) {
      auditRepository.log({
        type: clsValue < 0.1 ? 'info' : 'warning',
        message: `RUM CLS Detectado: ${clsValue.toFixed(4)}`,
        source: 'Sentinel-Vitals',
        metadata: { cls: clsValue }
      });
    }
  });

  clsObserver.observe({ type: 'layout-shift', buffered: true });
};
