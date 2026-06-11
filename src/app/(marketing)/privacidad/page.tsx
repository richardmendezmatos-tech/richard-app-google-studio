import React from 'react';
import type { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Política de Privacidad | Richard Automotive',
  description:
    'Política de privacidad de Richard Automotive. Conoce cómo protegemos y manejamos tu información personal en cumplimiento con las leyes de Puerto Rico y EE.UU.',
  alternates: {
    canonical: 'https://www.richard-automotive.com/privacidad',
  },
};

export default function PrivacyRoute() {
  return (
    <>
      <PrivacyClient />
    </>
  );
}
