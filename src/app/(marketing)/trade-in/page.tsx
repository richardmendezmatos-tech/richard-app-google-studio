'use client';

import React from 'react';
import TradeInView from '@/views/leads/ui/TradeInView';

/**
 * Next.js App Router entry point for /trade-in
 * Bridges to the FSD Leads layer component.
 */
export default function TradeInRoute() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <TradeInView />
    </div>
  );
}
