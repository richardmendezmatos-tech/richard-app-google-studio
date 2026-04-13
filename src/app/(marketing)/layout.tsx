import React from 'react';
import { AppProviders } from '@/widgets/brand-ui/providers/AppProviders';

/**
 * Marketing Layout (Sentinel N23)
 * Optimized for SEO and ultra-fast initial paint.
 * No heavy dashboard widgets here.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
        {/* Simple navigation can be added here if needed, or kept inside pages */}
        {children}
      </div>
    </AppProviders>
  );
}
