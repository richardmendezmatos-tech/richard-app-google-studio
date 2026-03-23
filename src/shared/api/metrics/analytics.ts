import ReactGA from 'react-ga4';
import { initMetaPixel, trackMetaEvent } from "@/shared/lib/analytics/useMetaPixel";

// Safety wrapper to handle Vite/Rollup CommonJS to ESM transpilation quirks in production
const getGA = () => (ReactGA as any).default || ReactGA;

/**
 * Analytics Service Factory
 * Uses Closures to encapsulate initialization state and Currying for event composition.
 */
const createAnalyticsService = () => {
  let isInitialized = false;

  const init = (measurementId: string = 'G-XXXXXXXXXX') => {
    if (!isInitialized && typeof window !== 'undefined') {
      getGA().initialize(measurementId);
      isInitialized = true;
      console.log('[Analytics] GA4 initialized via Closure Engine');
      
      const pixelId = import.meta.env.VITE_META_PIXEL_ID;
      if (pixelId) {
        initMetaPixel(pixelId);
        console.log('[Analytics] Meta Pixel initialized');
      }
    }
  };

  /**
   * Curried Track Event
   * Signature: trackEvent(category)(action)(label)(value)
   */
  const trackEvent =
    (category: string) => (action: string) => (label?: string) => (value?: number) => {
      if (isInitialized) {
        getGA().event({ category, action, label, value });
        trackMetaEvent(action, { category, label, value });
      }
    };

  const trackPageView = (path: string) => {
    if (isInitialized) {
      getGA().send({ hitType: 'pageview', page: path });
      trackMetaEvent('PageView', { path });
    }
  };

  return {
    init,
    trackPageView,
    // Domain specific trackers using partial application
    engagement: trackEvent('Engagement'),
    conversion: trackEvent('Conversion'),
    user: trackEvent('User'),
  };
};

export const analytics = createAnalyticsService();

// Legacy compatibility exports (mapped to the new functional engine)
export const initGA = analytics.init;
export const trackPageView = analytics.trackPageView;
export const trackEvent = (cat: string, act: string, lab?: string, val?: number) =>
  analytics.engagement(act)(lab)(val); // Simplified for legacy bridging

// Specialized Trackers using Currying/Partial Application
export const trackCarView = (id: string, name: string, price: number) => {
  analytics.engagement('view_car')(`${id}-${name}`)(price);
  trackMetaEvent('ViewContent', { content_ids: [id], content_name: name, value: price, currency: 'USD', content_type: 'product' });
};

export const trackAddToGarage = (id: string, name: string) => {
  analytics.conversion('add_to_garage')(`${id}-${name}`)();
  trackMetaEvent('AddToCart', { content_ids: [id], content_name: name, content_type: 'product' });
};

export const trackWhatsAppClick = (id: string, name: string) => {
  analytics.conversion('whatsapp_click')(`${id}-${name}`)();
  trackMetaEvent('Lead', { content_name: `WhatsApp: ${name}`, content_category: 'Lead' });
};

export const trackSearch = (term: string, count: number) => {
  analytics.engagement('search')(term)(count);
  trackMetaEvent('Search', { search_string: term });
};

export const trackLogin = (method: string) => {
  analytics.user('login')(method)();
  trackMetaEvent('Login', { method });
};

export const trackSignup = (method: string) => {
  analytics.user('signup')(method)();
  trackMetaEvent('CompleteRegistration', { content_name: method });
};

// AI-Powered Specialized Trackers
export const trackNeuralMatch = (lifestyle: string) => {
  analytics.engagement('neural_match')(lifestyle)();
  trackMetaEvent('NeuralMatch', { lifestyle });
};

export const trackVisualSearch = (type: string) => {
  analytics.engagement('visual_search')(type)();
  trackMetaEvent('VisualSearch', { type });
};

export const trackInteraction = (action: string, details?: any) => {
  analytics.engagement('ai_interaction')(action)(undefined);
  trackMetaEvent('AIInteraction', { action, details });
};
