'use client';

import React, { useEffect } from 'react';
import { ThemeProvider } from '@/shared/ui/providers/ThemeProvider';
import { TelemetryProvider } from '@/shared/ui/providers/TelemetryProvider';
import { LazyMotion } from 'framer-motion';

const loadAnimationFeatures = () => import('framer-motion').then((mod) => mod.domAnimation);

export const MarketingProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (gaId && gaId !== 'G-XXXXXXXXXX') {
      import('@/shared/api/metrics/analytics').then(({ initGA }) => initGA(gaId));
    }
  }, []);

  return (
    <ThemeProvider>
      <TelemetryProvider>
        <LazyMotion features={loadAnimationFeatures}>{children}</LazyMotion>
      </TelemetryProvider>
    </ThemeProvider>
  );
};
