import React from 'react';
import { MarketingProviders } from '@/widgets/brand-ui/providers/MarketingProviders';
import { MarketingCinemaLayout } from '@/widgets/brand-ui/layout/MarketingCinemaLayout';
import Navbar from '@/widgets/brand-ui/layout/Navbar';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketingProviders>
      <MarketingCinemaLayout>
        <Navbar />
        <div className="min-h-screen bg-transparent text-white selection:bg-cyan-500/30 p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto">
          {children}
        </div>
      </MarketingCinemaLayout>
    </MarketingProviders>
  );
}
