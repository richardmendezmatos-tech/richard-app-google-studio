import ReactGA from 'react-ga4';

let isInitialized = false;

export const initGA = (measurementId: string = 'G-XXXXXXXXXX') => {
    if (!isInitialized && typeof window !== 'undefined') {
        ReactGA.initialize(measurementId);
        isInitialized = true;
        console.log('[Analytics] Google Analytics 4 initialized');
    }
};

export const trackPageView = (path: string) => {
    if (isInitialized) {
        ReactGA.send({ hitType: 'pageview', page: path });
    }
};

export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
    if (isInitialized) {
        ReactGA.event({
            category,
            action,
            label,
            value
        });
    }
};

// Custom event trackers
export const trackCarView = (carId: string, carName: string, price: number) => {
    trackEvent('Engagement', 'view_car', `${carId}-${carName}`, price);
};

export const trackAddToGarage = (carId: string, carName: string) => {
    trackEvent('Conversion', 'add_to_garage', `${carId}-${carName}`);
};

export const trackWhatsAppClick = (carId: string, carName: string) => {
    trackEvent('Conversion', 'whatsapp_click', `${carId}-${carName}`);
};

export const trackCompareAdd = (carId: string, carName: string) => {
    trackEvent('Engagement', 'add_to_compare', `${carId}-${carName}`);
};

export const trackSearch = (searchTerm: string, resultsCount: number) => {
    trackEvent('Engagement', 'search', searchTerm, resultsCount);
};

export const trackVisualSearch = (analysisType: string) => {
    trackEvent('Engagement', 'visual_search', analysisType);
};

export const trackNeuralMatch = (lifestyle: string) => {
    trackEvent('Engagement', 'neural_match', lifestyle);
};

export const trackFilterChange = (filterType: string, filterValue: string) => {
    trackEvent('Engagement', 'filter_change', `${filterType}:${filterValue}`);
};

export const trackLogin = (method: string) => {
    trackEvent('User', 'login', method);
};

export const trackSignup = (method: string) => {
    trackEvent('User', 'signup', method);
};
