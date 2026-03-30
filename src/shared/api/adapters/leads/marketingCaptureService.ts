/**
 * Marketing Predictive Capture (Phase 22)
 * Automatically extracts UTM tags, Pixel tracking IDs, and session data
 * from URLs and Cookies without manual UI intervention.
 *
 * RA OS v3.2 - Richard Intelligence
 */

export interface MarketingCaptureData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  fbclid?: string;
  gclid?: string;
  fbp?: string;
  fbc?: string;
  sessionEntryTimestamp?: number;
  landingPage?: string;
}

export const extractMarketingData = (): MarketingCaptureData => {
  // SSR Safety check
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const cookies = document.cookie;

  const getCookie = (name: string) => {
    const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return undefined;
  };

  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
    fbclid: params.get('fbclid') || undefined,
    gclid: params.get('gclid') || undefined,
    fbp: getCookie('_fbp'),
    fbc:
      getCookie('_fbc') ||
      (params.get('fbclid') ? `fb.1.${Date.now()}.${params.get('fbclid')}` : undefined),
    sessionEntryTimestamp: Date.now(),
    landingPage: window.location.pathname,
  };
};
