import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Storefront from '@/pages/storefront/ui/Storefront';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { Car } from '@/entities/inventory';
import { notFound } from 'next/navigation';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';
import { CITIES_PR as CITIES } from '@/shared/config/cities';

interface Props {
  params: Promise<{ city: string }>;
}

export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = CITIES[citySlug];
  if (!city) return {};

  const title = `Autos Usados en ${city.name}, Puerto Rico | Richard Automotive`;
  const description = `Compra autos usados certificados en ${city.name}, PR. Richard Automotive es ${city.meta}. Financiamiento desde 4.9% APR, aprobación en 24h, trade-in garantizado. Servimos ${city.region}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://richard-automotive.com/autos-usados/${city.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Richard Automotive',
      locale: 'es_PR',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Richard Automotive ${city.name}`,
      description,
    },
  };
}

function CityJsonLd({ city }: { city: (typeof CITIES)[string] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: `Richard Automotive — ${city.name}`,
    description: `Dealer de autos usados certificados en ${city.name}, Puerto Rico. ${city.meta}. Con el respaldo de Central Ford.`,
    url: `https://richard-automotive.com/autos-usados/${city.slug}`,
    telephone: BUSINESS_CONTACT.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressRegion: 'PR',
      postalCode: city.zipCodes[0],
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS_CONTACT.geo.latitude,
      longitude: BUSINESS_CONTACT.geo.longitude,
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
    },
    priceRange: '$$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '17:00',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function CityFAQJsonLd({ city }: { city: (typeof CITIES)[string] }) {
  const faqs = [
    {
      question: `¿Dónde puedo comprar autos usados en ${city.name}, Puerto Rico?`,
      answer: `Richard Automotive es ${city.meta}. Ofrecemos un inventario certificado de vehículos con financiamiento desde 4.9% APR y aprobación en 24 horas. Servimos toda el área de ${city.region}.`,
    },
    {
      question: `¿Ofrecen financiamiento para autos usados en ${city.name}?`,
      answer: `Sí, trabajamos con múltiples instituciones financieras para garantizar las mejores tasas en ${city.name}. Ofrecemos estructuras desde 4.9% APR, opciones de $0 down, e incluso trabajamos con historial crediticio limitado.`,
    },
    {
      question: `¿Puedo hacer trade-in de mi auto en ${city.name}?`,
      answer: `Absolutamente. Nuestro motor de tasación neural valora tu vehículo actual en 90 segundos. Ofrecemos el máximo valor de trade-in garantizado para residentes de ${city.name} y ${city.region}.`,
    },
    {
      question: `¿Qué marcas de autos usados tienen disponibles en ${city.name}?`,
      answer: `Manejamos todas las marcas principales: Toyota, Honda, Hyundai, Ford, Chevrolet, Nissan, BMW, Mercedes-Benz, y más. Cada unidad pasa por una inspección certificada antes de salir al lote.`,
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function CityPage({ params }: Props) {
  const { city: citySlug } = await params;
  const city = CITIES[citySlug];

  if (!city) {
    notFound();
  }

  let inventory: Car[] = [];

  try {
    const result = await getPaginatedCars(12, null, 'all');
    inventory = result.cars;
  } catch (error) {
    console.error(`[SEO Page: ${city.name}] Error fetching inventory:`, error);
  }

  return (
    <>
      <CityJsonLd city={city} />
      <CityFAQJsonLd city={city} />
      <Suspense fallback={null}>
        <Storefront
          inventory={inventory}
          customTitle={`Autos Usados en ${city.name}, PR | Richard Automotive`}
          customDescription={`Los mejores autos usados y guaguas de lujo en ${city.name}, Puerto Rico. Richard Automotive es ${city.meta}. Aprobación en 24h.`}
        />
      </Suspense>
    </>
  );
}
