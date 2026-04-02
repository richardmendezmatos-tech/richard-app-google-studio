'use client';

import React from 'react';
import FinanciamientoPage from '@/pages/financiamiento/ui/FinanciamientoPage';

/**
 * Next.js App Router entry point for /financiamiento
 * Bridges to the FSD Financing layer component.
 */
export default function FinancingRoute() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <FinanciamientoPage />
    </div>
  );
}
