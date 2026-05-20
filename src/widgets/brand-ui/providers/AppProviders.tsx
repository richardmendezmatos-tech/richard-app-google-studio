'use client';

import React, { useEffect } from 'react';
import { ThemeProvider } from '@/shared/ui/providers/ThemeProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/lib/react-query';
import { NotificationProvider } from '@/shared/ui/providers/NotificationProvider';
import { TelemetryProvider } from '@/shared/ui/providers/TelemetryProvider';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { LazyMotion } from 'framer-motion';

const loadAnimationFeatures = () => import('framer-motion').then((mod) => mod.domAnimation);

import { RehydrationService } from '@/shared/lib/resilience/RehydrationService';
import { useAuthListener } from '@/features/auth';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  useAuthListener();

  useEffect(() => {
    // Initialize Google Analytics 4 (dynamic import — not in critical path)
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
    import('@/shared/api/metrics/analytics').then(({ initGA }) => initGA(gaId));

    // [Nivel 13] Initialize Resilience Layer (Auto-healing)
    // Dynamic import to avoid circular dependencies with DI registry at startup
    import('@/app/(dashboard)/di/registry').then(async ({ DI }) => {
      console.log('🛡️ [AppProviders] DI Registry loaded dynamically.');
      const leadRepo = await DI.getLeadRepository();
      const rehydration = new RehydrationService(leadRepo as any);
      rehydration.start(30000); // Check every 30s
      console.log('🛡️ [Sentinel:Resilience] Rehydration Service initialized.');
    });
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <TelemetryProvider>
            <I18nextProvider i18n={i18n}>
              <LazyMotion features={loadAnimationFeatures}>{children}</LazyMotion>
            </I18nextProvider>
          </TelemetryProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
