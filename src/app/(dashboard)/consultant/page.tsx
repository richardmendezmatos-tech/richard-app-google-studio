import React from 'react';
import type { Metadata } from 'next';
import AIConsultant from '@/features/ai-hub/ui/AIConsultant';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { Car } from '@/entities/inventory';
import { SITE_CONFIG } from '@/shared/config/siteConfig';

export const metadata: Metadata = {
  title: 'Richard Oneal Méndez Matos — Consultor F&I | Richard Automotive',
  description:
    'Richard Oneal Méndez Matos, Gerente de F&I en Central Ford, Vega Alta. Especialista en financiamiento automotriz, seguros y aprobación de crédito en Puerto Rico. Más de 15 años de experiencia.',
  keywords: [
    'Richard Oneal Méndez Matos',
    'Richard Méndez',
    'Central Ford Vega Alta',
    'financiamiento automotriz Puerto Rico',
    'F&I Puerto Rico',
    'gerente de financiamiento',
    'aprobación de crédito auto',
    'seguros de auto Puerto Rico',
  ],
  openGraph: {
    title: 'Richard Oneal Méndez Matos — Consultor F&I | Central Ford',
    description:
      'Gerente de F&I en Central Ford, Vega Alta. Financiamiento desde 4.9% APR, aprobación en 24 horas. ¡Bono web de $300!',
    type: 'profile',
    locale: 'es_PR',
    siteName: 'Richard Automotive',
    firstName: 'Richard Oneal',
    lastName: 'Méndez Matos',
    username: 'richard-mendez',
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/consultant`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function ConsultantRoute() {
  let inventory: Car[] = [];

  try {
    const result = await getPaginatedCars(20, null, 'all');
    inventory = result.cars;
  } catch (error) {
    console.error('Error fetching inventory for Consultant:', error);
  }

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Richard Oneal Méndez Matos',
    givenName: 'Richard Oneal',
    familyName: 'Méndez Matos',
    jobTitle: 'Gerente de F&I (Financiamiento y Seguros)',
    worksFor: {
      '@type': 'AutoDealer',
      name: 'Central Ford',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Vega Alta',
        addressRegion: 'PR',
        addressCountry: 'US',
      },
    },
    url: `${SITE_CONFIG.url}/consultant`,
    sameAs: [
      'https://www.linkedin.com/in/richard-mendez-matos',
      'https://www.richard-automotive.com',
    ],
    knowsAbout: [
      'Financiamiento automotriz',
      'Seguros de auto',
      'Aprobación de crédito',
      'Ford nuevas y usadas',
      'Trade-in de vehículos',
    ],
    description:
      'Gerente de F&I en Central Ford, Vega Alta, Puerto Rico. Especialista en financiamiento automotriz, seguros, y aprobación de crédito.',
    image: 'https://www.richard-automotive.com/richard-mendez.jpg',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <div className="min-h-screen bg-slate-950 pt-20">
        <AIConsultant inventory={inventory} />
      </div>
    </>
  );
}
