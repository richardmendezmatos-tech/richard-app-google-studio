'use client';

import React, { useEffect } from 'react';

export const MarketingTelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (gaId && gaId !== 'G-XXXXXXXXXX') {
      import('@/shared/api/metrics/analytics').then(({ initGA }) => initGA(gaId));
    }
  }, []);

  return <>{children}</>;
};
