'use client';

import React from 'react';
import { ExpressPrequalifyPage } from '@/views/leads/ui/ExpressPrequalifyPage';
import { useRouter } from 'next/navigation';

/**
 * Next.js App Router entry point for /bono-300
 * Direct access to the Fast Action Bonus claim bridge.
 */
export default function Bono300Route() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <ExpressPrequalifyPage />
    </div>
  );
}
