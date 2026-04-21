import React from 'react';
import { AppProviders } from '@/widgets/brand-ui/providers/AppProviders';
import { CinemaLayout } from '@/widgets/brand-ui/layout/CinemaLayout';

/**
 * Marketing Layout (Sentinel N23)
 * Optimized for SEO and ultra-fast initial paint.
 * Now includes the CinemaLayout to maintain the "Command Center" aesthetic
 * and provide global navigation (Sidebar, AI Chat).
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <CinemaLayout inventory={[]}>
        <div className="min-h-screen bg-transparent text-white selection:bg-cyan-500/30">
          {children}
        </div>
      </CinemaLayout>
    </AppProviders>
  );
}
