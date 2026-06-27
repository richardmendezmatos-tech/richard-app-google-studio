import React from 'react';
import type { Metadata } from 'next';
import ContactoClient from './ContactoClient';

export const dynamic = 'force-static';
import { SITE_CONFIG } from '@/shared/config/siteConfig';
import { getBreadcrumbSchema, getFAQSchema } from '@/shared/config/seoSchemas';

export const metadata: Metadata = {
  title: 'Contacto | Richard Automotive — Dealer en Vega Alta, PR',
  description:
    'Visítanos en Central Ford, Vega Alta. Carr. #2 KM 28.5, Bo. Espinosa. Tel: +1 (787) 368-2880. Horario: Lun-Vie 9AM-6PM, Sáb 9AM-5PM.',
  alternates: {
    canonical: 'https://www.richard-automotive.com/contacto',
  },
  openGraph: {
    title: 'Contacta a Richard Automotive | Dealer en Vega Alta',
    description:
      'Estamos ubicados en Central Ford, Vega Alta, Puerto Rico. Visítanos, llámanos o escríbenos por WhatsApp.',
    url: 'https://www.richard-automotive.com/contacto',
    siteName: 'Richard Automotive',
    locale: 'es_PR',
    type: 'website',
  },
};

const CONTACT_POINT = {
  '@type': 'ContactPoint',
  telephone: '+1-787-368-2880',
  contactType: 'sales',
  email: 'ventas@richard-automotive.com',
  areaServed: 'PR',
  availableLanguage: ['Spanish', 'English'],
};

function ContactoJsonLd() {
  const breadcrumb = [
    { name: 'Inicio', url: '/' },
    { name: 'Contacto', url: '/contacto' },
  ];

  const faq = getFAQSchema([
    {
      question: '¿Dónde están ubicados?',
      answer:
        'Estamos en Carr. #2 KM 28.5, Bo. Espinosa, Vega Alta, PR 00692, dentro de Central Ford.',
    },
    {
      question: '¿Cuál es el horario de atención?',
      answer: 'Lunes a Viernes de 9:00 AM a 6:00 PM y Sábados de 9:00 AM a 5:00 PM.',
    },
    {
      question: '¿Cómo puedo contactarlos por WhatsApp?',
      answer:
        'Puedes escribirnos al +1 (787) 368-2880 por WhatsApp. Respondemos en horario de oficina.',
    },
  ]);

  const contactPage = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contacto — Richard Automotive',
    description: 'Página de contacto del concesionario Richard Automotive en Vega Alta, Puerto Rico.',
    url: 'https://www.richard-automotive.com/contacto',
    mainEntity: {
      '@type': 'AutoDealer',
      name: 'Richard Automotive',
      telephone: '+1-787-368-2880',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Carr. #2 KM 28.5, Bo. Espinosa',
        addressLocality: 'Vega Alta',
        addressRegion: 'PR',
        postalCode: '00692',
        addressCountry: 'US',
      },
      contactPoint: CONTACT_POINT,
    },
  };

  const schemas = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumb.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: `https://www.richard-automotive.com${item.url}` })) },
    faq,
    { '@context': 'https://schema.org', ...CONTACT_POINT },
    contactPage,
  ];

  return schemas.map((schema, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  ));
}

export default function ContactRoute() {
  return (
    <>
      <ContactoJsonLd />
      <ContactoClient />
    </>
  );
}
