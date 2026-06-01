import React from 'react';
import type { Metadata } from 'next';
import TermsClient from './TermsClient';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Richard Automotive',
  description:
    'Términos y condiciones de uso del sitio web y servicios de Richard Automotive. Al usar nuestro sitio aceptas estos términos.',
  alternates: {
    canonical: 'https://www.richard-automotive.com/terminos',
  },
};

export default function TermsRoute() {
  return (
    <>
      <TermsClient />
    </>
  );
}
