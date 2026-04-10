'use client';

import { useState, useEffect } from 'react';
import { HoustonTelemetry } from '../model/types';

/**
 * useBusinessTelemetry
 * Hook de Nivel 15 para integrar inteligencia de negocio en el Houston Dashboard.
 * Consume /api/command-center/telemetry para enriquecer el estado técnico.
 */
export const useBusinessTelemetry = () => {
  const [businessData, setBusinessData] = useState<HoustonTelemetry['businessMetrics'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    try {
      // Usamos el token interno para la comunicación entre servicios
      const res = await fetch('/api/command-center/telemetry', {
        headers: {
          'x-antigravity-token': 'client-internal'
        }
      });

      if (!res.ok) throw new Error('Sentinel Sync Error');

      const data = await res.json();
      
      setBusinessData({
        hotLeads: data.hotLeads,
        searchGaps: data.neuralSearch.recent_gaps,
        whatsappStats: data.whatsapp,
        summary: data.summary
      });
      setError(null);
    } catch (err: any) {
      console.error('[Sentinel] Business Sync Fail:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    // Re-validación cada 45 segundos para mantener el pulso del negocio
    const interval = setInterval(fetchTelemetry, 45000);
    return () => clearInterval(interval);
  }, []);

  return { businessData, loading, error, refresh: fetchTelemetry };
};
