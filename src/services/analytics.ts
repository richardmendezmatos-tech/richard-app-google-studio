import ReactGA from 'react-ga4';

/**
 * Analytics Service Factory
 * Uses Closures to encapsulate initialization state and Currying for event composition.
 */
const createAnalyticsService = () => {
    let isInitialized = false;

    const init = (measurementId: string = 'G-XXXXXXXXXX') => {
        if (!isInitialized && typeof window !== 'undefined') {
            ReactGA.initialize(measurementId);
            isInitialized = true;
            console.log('[Analytics] GA4 initialized via Closure Engine');
        }
    };

    /**
     * Curried Track Event
     * Signature: trackEvent(category)(action)(label)(value)
     */
    const trackEvent = (category: string) => (action: string) => (label?: string) => (value?: number) => {
        if (isInitialized) {
            ReactGA.event({ category, action, label, value });
        }
    };

    const trackPageView = (path: string) => {
        if (isInitialized) {
            ReactGA.send({ hitType: 'pageview', page: path });
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
export const trackCarView = (id: string, name: string, price: number) =>
    analytics.engagement('view_car')(`${id}-${name}`)(price);

export const trackAddToGarage = (id: string, name: string) =>
    analytics.conversion('add_to_garage')(`${id}-${name}`)();

export const trackWhatsAppClick = (id: string, name: string) =>
    analytics.conversion('whatsapp_click')(`${id}-${name}`)();

export const trackSearch = (term: string, count: number) =>
    analytics.engagement('search')(term)(count);

export const trackLogin = (method: string) => analytics.user('login')(method)();
export const trackSignup = (method: string) => analytics.user('signup')(method)();

// AI-Powered Specialized Trackers
export const trackNeuralMatch = (lifestyle: string) =>
    analytics.engagement('neural_match')(lifestyle)();

export const trackVisualSearch = (type: string) =>
    analytics.engagement('visual_search')(type)();

export const trackInteraction = (action: string, details?: any) =>
    analytics.engagement('ai_interaction')(action)(undefined);
