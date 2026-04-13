'use client';

import React from 'react';
import ProfilePage from '@/pages/profile/ui/ProfilePage';

/**
 * Next.js App Router entry point for /profile
 * Bridges to the FSD Profile layer component.
 */
export default function ProfileRoute() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <ProfilePage />
    </div>
  );
}
