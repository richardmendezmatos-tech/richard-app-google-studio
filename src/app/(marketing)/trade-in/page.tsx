import React from 'react';
import type { Metadata } from 'next';
import TradeInClient from './TradeInClient';
import { getBreadcrumbSchema, getHowToSchema, getFAQSchema } from '@/shared/config/seoSchemas';

export const metadata: Metadata = {
  title: 'Trade-In de Autos en Puerto Rico | Tasación Neural en 90s',
  description:
    'Tasación neural de tu vehículo en 90 segundos. Recibe el máximo valor de trade-in garantizado. Aplica tu trade-in como down payment y maneja tu auto actual mientras procesamos el nuevo.',
  keywords: [
    'trade in puerto rico',
    'tasacion de autos pr',
    'vender mi carro vega alta',
    'trade in bayamon',
    'cambio de auto pr',
    'valor de mi auto usado',
  ],
  alternates: {
    canonical: 'https://richard-automotive.com/trade-in',
  },
  openGraph: {
    title: 'Trade-In Inteligente | Richard Automotive',
    description:
      'Tasación neural en 90 segundos. Recibe el máximo valor por tu auto usado y aplícalo a tu próximo vehículo.',
    url: 'https://richard-automotive.com/trade-in',
    siteName: 'Richard Automotive',
    locale: 'es_PR',
    type: 'website',
  },
};

function TradeInJsonLd() {
  const breadcrumb = [
    { name: 'Inicio', url: '/' },
    { name: 'Trade-In', url: '/trade-in' },
  ];

  const howTo = getHowToSchema(
    [
      {
        name: 'Tasa tu auto',
        text: 'Completa la información básica de tu vehículo (año, marca, modelo, millaje, condición). Recibe una tasación preliminar en segundos.',
      },
      {
        name: 'Recibe oferta firme',
        text: 'Nuestro equipo evalúa tu auto y te presenta una oferta firme. El proceso incluye inspección física rápida.',
      },
      {
        name: 'Aplica como down payment',
        text: 'Usa el valor de tu trade-in como pago inicial para tu próximo vehículo. Te quedas manejando tu auto actual mientras procesamos el nuevo.',
      },
    ],
    'Cómo hacer trade-in de tu auto en Richard Automotive',
    'Proceso de trade-in rápido con tasación neural. Recibe el máximo valor garantizado por tu vehículo usado en Puerto Rico.',
  );

  const faq = getFAQSchema([
    {
      question: '¿Cómo funciona la tasación neural?',
      answer:
        'Usamos inteligencia artificial para analizar el valor de mercado de tu vehículo en tiempo real. La tasación preliminar toma 90 segundos y considera año, marca, modelo, millaje, condición y demanda actual en Puerto Rico.',
    },
    {
      question: '¿Puedo usar mi trade-in como down payment?',
      answer:
        'Sí, el valor de tu trade-in se aplica directamente como pago inicial. Si tu auto vale más que el down payment requerido, recibes la diferencia en efectivo.',
    },
    {
      question: '¿Qué pasa con mi auto mientras espero el nuevo?',
      answer:
        'Puedes seguir manejando tu auto actual hasta que llegue tu vehículo nuevo. Coordinamos la entrega para que no te quedes sin transporte.',
    },
    {
      question: '¿Aceptan autos con deuda pendiente?',
      answer:
        'Sí, evaluamos tu auto y coordinamos el payoff con tu banco o cooperativa. El equity restante se aplica a tu nuevo financiamiento.',
    },
  ]);

  const schemas = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumb.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: `https://richard-automotive.com${item.url}` })) },
    howTo,
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

export default function TradeInRoute() {
  return (
    <>
      <TradeInJsonLd />
      <TradeInClient />
    </>
  );
}
