import React from 'react';
import type { Metadata } from 'next';
import FinanciamientoClient from './FinanciamientoClient';

export const dynamic = 'force-static';
import { SITE_CONFIG } from '@/shared/config/siteConfig';
import { getBreadcrumbSchema, getHowToSchema, getFAQSchema } from '@/shared/config/seoSchemas';

export const metadata: Metadata = {
  title: 'Financiamiento de Autos en Puerto Rico | Richard Automotive',
  description:
    'Aprobación expresa desde 4.9% APR en Central Ford, Vega Alta. Financiamiento inteligente con IA, soft pull sin afectar tu crédito. Tasa fija, plazo hasta 84 meses, $0 down payment disponible.',
  keywords: [
    'financiamiento de autos puerto rico',
    'credito para carro pr',
    'prestamo auto vega alta',
    'financiamiento ford pr',
    'aprobacion rapida de carro',
    'tasa fija auto pr',
  ],
  alternates: {
    canonical: 'https://www.richard-automotive.com/financiamiento',
  },
  openGraph: {
    title: 'Financiamiento Inteligente de Autos | Richard Automotive',
    description:
      'Aprobación expresa desde 4.9% APR. Analizamos tu perfil y encontramos la mejor tasa. Soft pull, sin compromiso.',
    url: 'https://www.richard-automotive.com/financiamiento',
    siteName: 'Richard Automotive',
    locale: 'es_PR',
    type: 'website',
  },
};

function FinanciamientoJsonLd() {
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Financiamiento', url: '/financiamiento' },
  ]);

  const howTo = getHowToSchema(
    [
      {
        name: 'Precalifícate online',
        text: 'Completa nuestro formulario exprés con tu información básica. No afectamos tu crédito (soft pull).',
      },
      {
        name: 'Recibe ofertas personalizadas',
        text: 'Nuestro sistema analiza múltiples instituciones financieras y encuentra la mejor tasa para ti.',
      },
      {
        name: 'Elige tu vehículo',
        text: 'Selecciona entre nuestro inventario de autos nuevos Ford y usados certificados.',
      },
      {
        name: 'Firma digital y entrega',
        text: 'Completa la documentación desde tu celular. Recibe tu auto en nuestro dealership o a domicilio.',
      },
    ],
    'Cómo financiar tu auto en Richard Automotive',
    'Proceso de financiamiento inteligente con aprobación expresa, soft pull y entrega rápida en Puerto Rico.',
  );

  const faq = getFAQSchema([
    {
      question: '¿Qué tasa de interés ofrecen para financiamiento de autos en Puerto Rico?',
      answer:
        'Ofrecemos tasas desde 4.9% APR para crédito aprobado. La tasa final depende de tu historial crediticio, ingreso y el vehículo seleccionado. Trabajamos con múltiples bancos y cooperativas para garantizar la mejor opción.',
    },
    {
      question: '¿Puedo financiar un auto si tengo crédito malo o no tengo historial?',
      answer:
        'Sí, trabajamos con programas especiales para crédito limitado, primero compradores y reconstrucción de crédito. Ofrecemos opciones con down payment desde $0 y plazos flexibles.',
    },
    {
      question: '¿Cuánto tiempo toma la aprobación de financiamiento?',
      answer:
        'La precualificación es inmediata (soft pull). La aprobación formal puede tomar desde 1 hora hasta 24 horas en la mayoría de los casos.',
    },
    {
      question: '¿Qué documentos necesito para solicitar financiamiento?',
      answer:
        'Identificación vigente (licencia o pasaporte), comprobante de ingresos (talonarios o planilla), dos referencias personales y número de Seguro Social para tirar crédito.',
    },
  ]);

  const loanProduct = {
    '@context': 'https://schema.org',
    '@type': 'LoanOrCredit',
    name: 'Financiamiento Automotriz — Richard Automotive',
    description:
      'Financiamiento de autos con aprobación expresa desde 4.9% APR en Puerto Rico. Soft pull sin afectar tu crédito. Plazos hasta 84 meses y opción de $0 down payment.',
    url: 'https://www.richard-automotive.com/financiamiento',
    provider: {
      '@type': 'AutoDealer',
      name: 'Richard Automotive',
      url: 'https://www.richard-automotive.com',
      telephone: '+1-787-368-2880',
    },
    currency: 'USD',
    loanTerm: {
      '@type': 'QuantitativeValue',
      minValue: 12,
      maxValue: 84,
      unitCode: 'MON',
    },
    feesAndCommissionsSpecification: 'Sin cuotas de apertura. Tasa desde 4.9% APR para crédito aprobado. La tasa final depende del historial crediticio y vehículo seleccionado.',
    areaServed: { '@type': 'Country', name: 'Puerto Rico' },
  };

  const schemas = [breadcrumb, howTo, faq, loanProduct];

  return schemas.map((schema, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  ));
}

export default function FinancingRoute() {
  return (
    <>
      <FinanciamientoJsonLd />
      <FinanciamientoClient />
    </>
  );
}
