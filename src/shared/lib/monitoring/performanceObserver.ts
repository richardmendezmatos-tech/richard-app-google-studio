import { raSentinel } from './raSentinelService';

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
    
    raSentinel.reportActivity({
      type: 'ai_persuasion_generated', // Reutilizamos reporte de actividad con metadata de performance
      data: { lcp: lastEntry.startTime },
      operationalScore: lastEntry.startTime < 1200 ? 100 : 70,
      metadata: { metric: 'LCP', unit: 'ms' }
    });
  });

  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

  // FID (First Input Delay)
  const fidObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach((entry) => {
      const fid = entry.duration;
      raSentinel.reportActivity({
        type: 'ai_persuasion_generated',
        data: { fid },
        operationalScore: fid < 100 ? 100 : 50,
        metadata: { metric: 'FID', unit: 'ms' }
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
    
    raSentinel.reportActivity({
      type: 'ai_persuasion_generated',
      data: { cls: clsValue },
      operationalScore: clsValue < 0.1 ? 100 : 40,
      metadata: { metric: 'CLS' }
    });
  });

  clsObserver.observe({ type: 'layout-shift', buffered: true });
};
