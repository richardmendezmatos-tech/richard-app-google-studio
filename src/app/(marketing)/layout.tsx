import React from 'react';
import { MarketingProviders } from '@/widgets/brand-ui/providers/MarketingProviders';
import { CinemaLayout } from '@/widgets/brand-ui/layout/CinemaLayout';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketingProviders>
      <CinemaLayout inventory={[]}>
        <div className="min-h-screen bg-transparent text-white selection:bg-cyan-500/30">
          {children}
        </div>
      </CinemaLayout>
    </MarketingProviders>
  );
}
