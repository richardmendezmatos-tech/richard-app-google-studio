import type { Metadata } from 'next';
import { QuienesSomosPage } from '@/views/about/ui/QuienesSomosPage';
import { SITE_CONFIG } from '@/shared/config/siteConfig';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';

export const metadata: Metadata = {
  title: 'Quiénes Somos | Richard Méndez — Especialista F&I Central Ford Vega Alta PR',
  description:
    'Conoce a Richard Méndez Matos, especialista certificado en Finance & Insurance (F&I) y Dealer Autorizado Ford en Vega Alta, Puerto Rico. Más de 15 años ayudando a familias puertorriqueñas a conseguir su auto ideal.',
  alternates: {
    canonical: `${SITE_CONFIG.url}/quienes-somos`,
  },
  openGraph: {
    title: 'Quiénes Somos — Richard Automotive | Central Ford Vega Alta PR',
    description:
      'Dealer Ford autorizado en Vega Alta PR. Especialistas en financiamiento, F&I y venta de autos nuevos y usados con más de 15 años de experiencia.',
    url: `${SITE_CONFIG.url}/quienes-somos`,
    type: 'website',
    locale: 'es_PR',
    siteName: 'Richard Automotive',
  },
};

const C = BUSINESS_CONTACT;

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Richard Méndez Matos',
  jobTitle: 'Finance & Insurance Specialist',
  worksFor: {
    '@type': 'AutoDealer',
    name: 'Richard Automotive — Central Ford',
    url: SITE_CONFIG.url,
  },
  knowsAbout: [
    'Auto Financing Puerto Rico',
    'Ford Motor Vehicles',
    'F&I Insurance Products',
    'Vehicle Trade-In',
    'Credit Analysis',
  ],
  url: `${SITE_CONFIG.url}/quienes-somos`,
  sameAs: [C.social.facebook, C.social.instagram],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'AutoDealer',
  name: 'Richard Automotive — Central Ford',
  legalName: C.legalName,
  url: SITE_CONFIG.url,
  logo: `${SITE_CONFIG.url}/app-icon.webp`,
  foundingDate: '2009',
  description:
    'Dealer Ford autorizado en Vega Alta, Puerto Rico. Especialistas en financiamiento de autos, F&I, trade-in y venta de vehículos nuevos y usados.',
  telephone: C.phone,
  email: C.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: C.address.street,
    addressLocality: C.address.city,
    addressRegion: C.address.state,
    postalCode: C.address.zip,
    addressCountry: C.address.country,
  },
  geo: { '@type': 'GeoCoordinates', latitude: C.geo.latitude, longitude: C.geo.longitude },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '17:00' },
  ],
  paymentAccepted: ['Cash', 'Credit Card', 'Financing', 'Trade-In'],
  currenciesAccepted: 'USD',
  areaServed: { '@type': 'State', name: 'Puerto Rico' },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '124',
    bestRating: '5',
    worstRating: '1',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Vehículos Ford nuevos y usados en Puerto Rico',
  },
  employee: {
    '@type': 'Person',
    name: 'Richard Méndez Matos',
    jobTitle: 'Finance & Insurance Specialist',
  },
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'Quiénes Somos — Richard Automotive',
  url: `${SITE_CONFIG.url}/quienes-somos`,
  mainEntity: { '@id': `${SITE_CONFIG.url}/#organization` },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
      <QuienesSomosPage />
    </>
  );
}
