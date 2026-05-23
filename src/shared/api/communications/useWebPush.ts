import { useCallback, useEffect } from 'react';
import { subscribeToWebPush } from '@/shared/api/communications/webPushService';

export function useWebPush() {
  const subscribe = useCallback(async () => {
    const sub = await subscribeToWebPush();
    return !!sub;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return { subscribe };
}
