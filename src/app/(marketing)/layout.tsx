import React from 'react';
import { headers } from 'next/headers';
import { MarketingProviders } from '@/widgets/brand-ui/providers/MarketingProviders';
import { CinemaLayout } from '@/widgets/brand-ui/layout/CinemaLayout';
import HeroStaticContent from '@/features/inventory/ui/storefront/HeroStaticContent';

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const pathname = h.get('x-invoke-path') || h.get('next-url') || '';
  const isHome = pathname === '/' || pathname === '/es' || pathname === '';

  return (
    <>
      {isHome && <HeroStaticContent />}
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
