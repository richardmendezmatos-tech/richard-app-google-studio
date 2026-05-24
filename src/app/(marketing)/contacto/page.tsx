import React from 'react';
import type { Metadata } from 'next';
import ContactoClient from './ContactoClient';
import { SITE_CONFIG } from '@/shared/config/siteConfig';
import { getBreadcrumbSchema, getFAQSchema } from '@/shared/config/seoSchemas';

export const metadata: Metadata = {
  title: 'Contacto | Richard Automotive — Dealer en Vega Alta, PR',
  description:
    'Visítanos en Central Ford, Vega Alta. Carr. #2 KM 28.5, Bo. Espinosa. Tel: +1 (787) 368-2880. Horario: Lun-Vie 9AM-6PM, Sáb 9AM-5PM.',
  alternates: {
    canonical: 'https://richard-automotive.com/contacto',
  },
  openGraph: {
    title: 'Contacta a Richard Automotive | Dealer en Vega Alta',
    description:
      'Estamos ubicados en Central Ford, Vega Alta, Puerto Rico. Visítanos, llámanos o escríbenos por WhatsApp.',
    url: 'https://richard-automotive.com/contacto',
    siteName: 'Richard Automotive',
    locale: 'es_PR',
    type: 'website',
  },
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

  const schemas = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumb.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: `https://richard-automotive.com${item.url}` })) },
    faq,
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
