import React from 'react';
import type { Metadata } from 'next';
import PreQualifyClient from './PreQualifyClient';

export const dynamic = 'force-static';
import { getBreadcrumbSchema, getHowToSchema, getFAQSchema, getQAPageSchema } from '@/shared/config/seoSchemas';

export const metadata: Metadata = {
  title: 'Precalificación de Crédito para Auto | Richard Automotive',
  description:
    'Precalifícate en línea sin afectar tu crédito (soft pull). Aprobación expresa desde 4.9% APR. Completa el formulario en 2 minutos y recibe tu oferta personalizada.',
  keywords: [
    'precalificacion de credito auto',
    'soft pull credito pr',
    'prestamo aprobado carro',
    'credito pre aprobado auto vega alta',
    'como precalificar para carro',
  ],
  alternates: {
    canonical: 'https://www.richard-automotive.com/precualificacion',
  },
  openGraph: {
    title: 'Precalifícate en 2 Min | Richard Automotive',
    description:
      'Soft pull sin afectar tu crédito. Recibe tu aprobación expresa hoy.',
    url: 'https://www.richard-automotive.com/precualificacion',
    siteName: 'Richard Automotive',
    locale: 'es_PR',
    type: 'website',
  },
};

function PreQualifyJsonLd() {
  const breadcrumb = [
    { name: 'Inicio', url: '/' },
    { name: 'Precalificación', url: '/precualificacion' },
  ];

  const howTo = getHowToSchema(
    [
      {
        name: 'Completa el formulario exprés',
        text: 'Ingresa tu nombre, teléfono, email e ingresos estimados. No afectamos tu crédito.',
      },
      {
        name: 'Recibe tu evaluación',
        text: 'Nuestra IA analiza tu perfil y te presenta opciones de financiamiento personalizadas.',
      },
      {
        name: 'Explora tu poder de compra',
        text: 'Descubre cuánto auto puedes comprar y qué mensualidad te queda.',
      },
    ],
    'Cómo precalificarte para financiamiento de auto',
    'Precalificación exprés sin afectar tu crédito. Soft pull, 2 minutos, sin compromiso.',
  );

  const faq = getFAQSchema([
    {
      question: '¿La precalificación afecta mi crédito?',
      answer:
        'No. Usamos soft pull (consulta suave) que no afecta tu puntaje crediticio. Solo cuando decidas proceder con la solicitud formal haremos un hard pull.',
    },
    {
      question: '¿Cuánto tiempo toma la precalificación?',
      answer: 'El formulario toma menos de 2 minutos. La respuesta es inmediata.',
    },
    {
      question: '¿Qué necesito para precalificarme?',
      answer:
        'Solo tu nombre, teléfono, email y un estimado de ingresos mensuales.',
    },
  ]);

  const qaPage = getQAPageSchema([
    {
      name: '¿La precalificación afecta mi crédito?',
      acceptedAnswer: 'No. Usamos soft pull que no afecta tu puntaje crediticio. Solo al proceder con la solicitud formal hacemos hard pull.',
    },
    {
      name: '¿Cuánto tiempo toma la precalificación?',
      acceptedAnswer: 'El formulario toma menos de 2 minutos. La respuesta es inmediata.',
    },
    {
      name: '¿Qué necesito para precalificarme?',
      acceptedAnswer: 'Solo tu nombre, teléfono, email y un estimado de ingresos mensuales.',
    },
  ]);

  const schemas = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumb.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: `https://www.richard-automotive.com${item.url}` })) },
    howTo,
    faq,
    qaPage,
  ];

  return schemas.map((schema, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  ));
}

export default function PreQualifyRoute() {
  return (
    <>
      <PreQualifyJsonLd />
      <div className="min-h-screen bg-slate-950 pt-20">
        <PreQualifyClient />
      </div>
    </>
  );
}
