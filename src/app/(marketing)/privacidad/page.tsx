'use client';

import React from 'react';
import PrivacyView from '@/pages/privacy/ui/PrivacyView';

/**
 * Next.js App Router entry point for /privacidad
 */
export default function PrivacyRoute() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <PrivacyView />
    </div>
  );
}
