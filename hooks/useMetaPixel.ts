// @ts-nocheck
/* eslint-disable */
import { useCallback } from 'react';

declare global {
    interface Window {
        fbq: any;
        _fbq: any;
    }
}

export const useMetaPixel = () => {
    const pixelId = import.meta.env.VITE_META_PIXEL_ID;

    const initPixel = useCallback(() => {
        if (typeof window === 'undefined' || !pixelId) return;
        if (window.fbq) return;

        // Standard Meta Pixel Code
        if (typeof window !== 'undefined') {
            !function (f, b, e, v, n, t, s) {
                if (f.fbq) return; n = f.fbq = function () {
                    n.callMethod ?
                        n.callMethod.apply(n, arguments) : n.queue.push(arguments)
                };
                if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
                n.queue = []; t = b.createElement(e); t.async = !0;
                t.src = v; s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s)
            }(window, document, 'script',
                'https://connect.facebook.net/en_US/fbevents.js');

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
