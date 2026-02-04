
// Define Facebook Pixel Types
interface Fbq {
    (action: string, eventName: string, data?: Record<string, unknown>): void;
    callMethod?: (...args: unknown[]) => void;
    queue?: unknown[];
    push?: ((...args: unknown[]) => void) | Fbq;
    loaded?: boolean;
    version?: string;
}

declare global {
    interface Window {
        fbq: Fbq;
        _fbq: Fbq;
    }
}

export const useMetaPixel = () => {
    const pixelId = import.meta.env.VITE_META_PIXEL_ID;

    const initPixel = useCallback(() => {
        if (typeof window === 'undefined' || !pixelId) return;
        if (window.fbq) return;

        // Standard Meta Pixel Code
        if (typeof window !== 'undefined') {
            const f = window;
            const b = document;
            const e = 'script';
            const v = 'https://connect.facebook.net/en_US/fbevents.js';

            if (!f.fbq) {
                const n = function (...args: unknown[]) {
                    if (n.callMethod) {
                        n.callMethod(...args);
                    } else {
                        n.queue?.push(args);
                    }
                } as unknown as Fbq;

                f.fbq = n;
                n.push = n;
                n.loaded = true;
                n.version = '2.0';
                n.queue = [];

                const t = b.createElement(e) as HTMLScriptElement;
                t.async = true;
                t.src = v;
                const s = b.getElementsByTagName(e)[0];
                s.parentNode?.insertBefore(t, s);
            }

            window.fbq('init', pixelId);
            window.fbq('track', 'PageView');
        }
    }, [pixelId]);

    const trackEvent = useCallback((eventName: string, data = {}) => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', eventName, data);

            // Send to CAPI (Server-Side) for redundancy
            // Only fire if not in dev mode to save quota/noise, or if explicitly testing
            if (!import.meta.env.DEV) {
                fetch('/api/meta-conversion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventName, data, url: window.location.href })
                }).catch(err => console.error('CAPI Error:', err));
            }
        }
    }, []);

    return { initPixel, trackEvent };
};
