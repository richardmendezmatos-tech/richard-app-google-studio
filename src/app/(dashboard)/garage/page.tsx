'use client';

import React from 'react';
import DigitalGaragePage from '@/pages/digital-garage/ui/DigitalGaragePage';
import { useRouter } from 'next/navigation';

/**
 * Next.js App Router entry point for /garage
 * Bridges to the FSD Digital Garage layer component.
 */
export default function GarageRoute() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <DigitalGaragePage inventory={[]} onExit={() => router.push('/')} />
    </div>
  );
}
