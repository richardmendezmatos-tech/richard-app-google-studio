'use client';

import React from 'react';
import ContactPage from '@/pages/contacto/ui/ContactPage';

/**
 * Next.js App Router entry point for /contacto
 * Bridges to the FSD Contact layer component.
 */
export default function ContactRoute() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <ContactPage />
    </div>
  );
}
