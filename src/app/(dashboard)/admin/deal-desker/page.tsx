import React from 'react';
import type { Metadata } from 'next';
import DealDesker from '@/features/command-center/ui/DealDesker';

export const metadata: Metadata = {
  title: 'Deal Desker (F&I) | Richard Automotive',
  description: 'Herramienta ejecutiva de estructuración de negocios F&I.',
  robots: { index: false, follow: false },
};

/**
 * Ruta oficial del Deal Desker F&I en el App Router.
 * Antes solo era alcanzable vía el router SPA legacy (ya eliminado).
 */
export default function DealDeskerPage() {
  return <DealDesker />;
}
