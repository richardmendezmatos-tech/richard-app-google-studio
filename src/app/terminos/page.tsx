'use client';

import React from 'react';
import TermsView from '@/widgets/brand-ui/layout/TermsView';

/**
 * Next.js App Router entry point for /terminos
 */
export default function TermsRoute() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <TermsView />
    </div>
  );
}
