'use client';

import React from 'react';
import UserLogin from '@/pages/auth/ui/UserLogin';
import SEO from '@/shared/ui/seo/SEO';

export default function LoginPage() {
  return (
    <>
      <SEO 
        title="Acceso Clientes | Richard Automotive" 
        description="Inicia sesión para gestionar tu Garage Digital y tasaciones."
      />
      <div className="min-h-screen bg-slate-950 pt-20">
        <UserLogin />
      </div>
    </>
  );
}
