'use client';

import React from 'react';
import SystemAccessLogin from '@/pages/auth/ui/SystemAccessLogin';
import SEO from '@/shared/ui/seo/SEO';

export default function AdminLoginPage() {
  return (
    <>
      <SEO 
        title="Houston Access | Richard Automotive" 
        description="Panel de Control de Sistemas Richard Automotive."
        noIndex={true}
      />
      <div className="min-h-screen bg-[#0d2232] pt-20">
        <SystemAccessLogin />
      </div>
    </>
  );
}
