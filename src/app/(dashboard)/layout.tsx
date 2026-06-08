import React from 'react';
import { DashboardProviders } from '@/widgets/brand-ui/providers/DashboardProviders';
import { CinemaLayout } from '@/widgets/brand-ui/layout/CinemaLayout';
import { Suspense } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProviders>
      <Suspense fallback={<div className="min-h-screen bg-slate-950 animate-pulse" />}>
        <CinemaLayout inventory={[]} showSidebar>{children}</CinemaLayout>
      </Suspense>
    </DashboardProviders>
  );
}
