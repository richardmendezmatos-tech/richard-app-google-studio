import React from 'react';
import { CinemaLayout } from '@/widgets/brand-ui/layout/CinemaLayout';
import { Suspense } from 'react';


/**
 * Dashboard Layout (Sentinel N23)
 * The full "Command Center" experience.
 * Includes heavy interactive widgets and premium animations.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 animate-pulse" />}>
      <CinemaLayout inventory={[]}>
        {children}
      </CinemaLayout>
    </Suspense>
  );
}
