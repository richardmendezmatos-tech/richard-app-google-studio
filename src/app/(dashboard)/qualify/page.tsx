'use client';

import React from 'react';
import PreQualifyView from '@/pages/leads/ui/PreQualifyView';
import { useRouter } from 'next/navigation';

/**
 * Next.js App Router entry point for /qualify
 * Bridges to the FSD Leads layer component with exit navigation.
 */
export default function QualifyRoute() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <PreQualifyView onExit={() => router.push('/')} />
    </div>
  );
}
