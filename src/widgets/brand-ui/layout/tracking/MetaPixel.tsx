"use client";

import { useEffect } from 'react';
import { useMetaPixel } from '@/shared/lib/analytics/useMetaPixel';
import { useLocation } from '@/shared/lib/next-route-adapter';

export const MetaPixel = () => {
  const { initPixel, trackEvent } = useMetaPixel();
  const location = useLocation();

  useEffect(() => {
    initPixel();
  }, [initPixel]);

  useEffect(() => {
    // Track PageView on route change
    trackEvent('PageView');
  }, [location, trackEvent]);

  return null;
};
