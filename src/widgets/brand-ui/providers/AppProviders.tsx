import React, { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { HashRouter, BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/shared/ui/providers/ThemeProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/lib/react-query';

import { NotificationProvider } from '@/shared/ui/providers/NotificationProvider';

import { initGA } from '@/shared/api/metrics/analytics';
import { MetaPixel } from '@/widgets/brand-ui/layout/tracking/MetaPixel';
import { TelemetryProvider } from '@/shared/ui/providers/TelemetryProvider';

// --- Router Logic ---
const SmartRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Safe check for Capacitor
  const win = window as Window & { Capacitor?: { isNative: boolean } };
  const isNative = !!(win.Capacitor && win.Capacitor.isNative);
  const Router = isNative ? HashRouter : BrowserRouter;

  useEffect(() => {
    console.log(
      `[SmartRouter] Active mode: ${isNative ? 'HashRouter (Native/Capacitor)' : 'BrowserRouter (Web)'}`,
    );
    // Initialize Google Analytics 4
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
    initGA(gaId);
  }, [isNative]);

  return <Router>{children}</Router>;
};

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <TelemetryProvider>
              <SmartRouter>
                <MetaPixel />
                {children}
              </SmartRouter>
            </TelemetryProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};
