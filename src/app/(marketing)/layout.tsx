import React from 'react';
import { CinemaLayout } from '@/widgets/brand-ui/layout/CinemaLayout';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <CinemaLayout inventory={[]}>
      <div className="min-h-screen bg-transparent text-white selection:bg-cyan-500/30">
        {children}
      </div>
    </CinemaLayout>
  );
}
