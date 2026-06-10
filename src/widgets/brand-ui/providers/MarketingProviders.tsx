'use client';

import React from 'react';
import { ThemeProvider } from '@/shared/ui/providers/ThemeProvider';
import { MarketingTelemetryProvider } from '@/shared/ui/providers/MarketingTelemetryProvider';
import { ReactQueryProvider } from '@/shared/ui/providers/ReactQueryProvider';

export const MarketingProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactQueryProvider>
      <ThemeProvider>
        <MarketingTelemetryProvider>{children}</MarketingTelemetryProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
};
