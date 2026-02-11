import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAntigravityConfig, getAntigravityHeaders, getAntigravityHealthUrl } from '@/services/antigravityService';

type AntigravityStatus = 'disabled' | 'checking' | 'online' | 'offline';

export const useAntigravity = () => {
  const config = useMemo(() => getAntigravityConfig(), []);
  const [status, setStatus] = useState<AntigravityStatus>(config.enabled ? 'checking' : 'disabled');
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    if (!config.enabled) {
      setStatus('disabled');
      setError(null);
      return;
    }

    const healthUrl = getAntigravityHealthUrl();
    if (!healthUrl) {
      setStatus('offline');
      setError('No health endpoint configured');
      return;
    }

    setStatus('checking');
    setError(null);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: getAntigravityHeaders(),
        signal: controller.signal
      });
      setStatus(response.ok ? 'online' : 'offline');
      setError(response.ok ? null : `HTTP ${response.status}`);
    } catch (e) {
      setStatus('offline');
      setError(e instanceof Error ? e.message : 'Health check failed');
    } finally {
      window.clearTimeout(timeoutId);
      setLastChecked(Date.now());
    }
  }, [config.enabled]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    config,
    status,
    lastChecked,
    error,
    refresh: checkHealth
  };
};
