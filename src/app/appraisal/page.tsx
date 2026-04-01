'use client';

import React from 'react';
import AppraisalView from '@/pages/leads/ui/AppraisalView';

/**
 * Next.js App Router entry point for /appraisal
 * Bridges to the FSD Leads layer component.
 */
export default function AppraisalRoute() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <AppraisalView />
    </div>
  );
}
