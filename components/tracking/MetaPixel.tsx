import { useEffect } from 'react';
import { useMetaPixel } from '../../hooks/useMetaPixel';
import { useLocation } from 'react-router-dom';

export const MetaPixel = () => {
    const { initPixel, trackEvent } = useMetaPixel();
    const location = useLocation();

    useEffect(() => {
        initPixel();
    }, []);

    useEffect(() => {
        // Track PageView on route change
        trackEvent('PageView');
    }, [location]);

    return null;
};
