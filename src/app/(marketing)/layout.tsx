import React from 'react';
import { headers } from 'next/headers';
import { MarketingProviders } from '@/widgets/brand-ui/providers/MarketingProviders';
import { CinemaLayout } from '@/widgets/brand-ui/layout/CinemaLayout';
import HeroStaticContent from '@/features/inventory/ui/storefront/HeroStaticContent';

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const isHomepage = h.get('x-is-homepage') === '1';

  return (
    <>
      {isHomepage && <HeroStaticContent />}
      <MarketingProviders>
        <CinemaLayout inventory={[]}>
          <div className="min-h-screen bg-transparent text-white selection:bg-cyan-500/30">
            {children}
          </div>
        </CinemaLayout>
      </MarketingProviders>
    </>
  );
}
