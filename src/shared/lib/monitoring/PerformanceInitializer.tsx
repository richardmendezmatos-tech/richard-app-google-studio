'use client';

import { useEffect } from 'react';
import { observerPerformance } from './performanceObserver';

/**
 * PerformanceInitializer: El arrancador del motor de performance (Nivel 15).
 * Se encarga de inicializar el observador de WebVitals una vez que el cliente está listo.
 */
export function PerformanceInitializer() {
  useEffect(() => {
    // Inicialización universal del Sentinel RUM (Nivel 15)
    observerPerformance();
  }, []);

  return null;
}
