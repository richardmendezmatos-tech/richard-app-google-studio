import React from 'react';
import type { Metadata } from 'next';
import BonoClient from './BonoClient';
import { getBreadcrumbSchema, getFAQSchema } from '@/shared/config/seoSchemas';

export const metadata: Metadata = {
  title: 'Bono $300 para tu Auto | Richard Automotive',
  description:
    'Recibe $300 de bono de bienvenida para gastos de cierre en tu próximo auto. Aplica hoy y estrena con Richard Automotive en Vega Alta, PR. Aplica restricciones.',
  keywords: [
    'bono 300 auto puerto rico',
    'descuento compra carro pr',
    'bono bienvenida auto vega alta',
    'incentivo compra auto pr',
    'gastos de cierre auto',
  ],
  alternates: {
    canonical: 'https://www.richard-automotive.com/bono-300',
  },
  openGraph: {
    title: 'Bono $300 de Bienvenida | Richard Automotive',
    description:
      'Aplica tu bono de $300 para gastos de cierre al comprar tu próximo auto con Richard Automotive.',
    url: 'https://www.richard-automotive.com/bono-300',
    siteName: 'Richard Automotive',
    locale: 'es_PR',
    type: 'website',
  },
};

function BonoJsonLd() {
  const breadcrumb = [
    { name: 'Inicio', url: '/' },
    { name: 'Bono $300', url: '/bono-300' },
  ];

  const faq = getFAQSchema([
    {
      question: '¿Cómo reclamo el bono de $300?',
      answer:
        'Completa el formulario de precalificación en esta página. Una vez apruebes y compres tu vehículo, aplicamos los $300 directamente a tus gastos de cierre.',
    },
    {
      question: '¿El bono es para cualquier auto?',
      answer:
        'Sí, aplica para cualquier vehículo nuevo Ford o usado certificado en nuestro inventario sujeto a aprobación de crédito.',
    },
    {
      question: '¿Puedo combinar el bono con otras ofertas?',
      answer:
        'Sí, el bono de $300 es acumulable con incentivos de fábrica y tasas especiales de financiamiento.',
    },
  ]);

  const schemas = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumb.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: `https://www.richard-automotive.com${item.url}` })) },
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

export default function Bono300Route() {
  return (
    <>
      <BonoJsonLd />
      <div className="min-h-screen bg-slate-950 pt-20">
        <BonoClient />
      </div>
    </>
  );
}
