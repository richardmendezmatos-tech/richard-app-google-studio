'use client';

import React from 'react';
import ComparisonView from '@/pages/comparison/ui/ComparisonView';

/**
 * Next.js App Router entry point for /compare
 * Bridges to the FSD Comparison layer component.
 */
export default function CompareRoute() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <ComparisonView />
    </div>
  );
}
