'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GamificationVIPView } from '@/views/leads/ui/GamificationVIPView';

/**
 * Next.js App Router entry point for /recompensas-vip
 * Bridges to the FSD Leads layer component with exit navigation.
 */
export default function RecompensasVIPRoute() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <GamificationVIPView onExit={() => router.push('/')} />
    </div>
  );
}
