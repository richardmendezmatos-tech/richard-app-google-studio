'use client';

import React from 'react';
import AiLabPage from '@/pages/ai-lab/ui/AiLabPage';

/**
 * Next.js App Router entry point for /ai-lab
 * Bridges to the FSD AI Lab layer component.
 */
export default function AiLabRoute() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <AiLabPage />
    </div>
  );
}
