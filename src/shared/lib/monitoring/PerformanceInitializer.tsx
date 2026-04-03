'use client';

import { useEffect } from 'react';
import { observerPerformance } from './performanceObserver';

/**
 * PerformanceInitializer: El arrancador del motor de performance (Nivel 15).
 * Se encarga de inicializar el observador de WebVitals una vez que el cliente está listo.
 */
export function PerformanceInitializer() {
  useEffect(() => {
    // Solo en producción o bajo demanda para evitar ruido en desarrollo
    if (process.env.NODE_ENV === 'production') {
      observerPerformance();
    }
  }, []);

  return null;
}
