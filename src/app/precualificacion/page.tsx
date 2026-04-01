'use client';

import React from 'react';
import PreQualifyView from '@/pages/leads/ui/PreQualifyView';

/**
 * Next.js App Router entry point for /precualificacion
 * Bridges to the FSD Leads layer component.
 */
export default function PreQualifyRoute() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <PreQualifyView />
    </div>
  );
}
