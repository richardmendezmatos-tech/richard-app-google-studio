import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Storefront from '@/views/storefront/ui/Storefront';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { seoService } from '@/entities/inventory/api/adapters/seoService';
import { Car } from '@/entities/inventory';
import { notFound } from 'next/navigation';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';
import { CITIES_PR as CITIES } from '@/shared/config/cities';
import { slugify } from '@/shared/lib/utils/seo';

interface Props {
  params: Promise<{ city: string; brand: string; model: string }>;
}

export async function generateStaticParams() {
  const combinations = await seoService.getInventoryCombinations();
  const params: any[] = [];
  Object.keys(CITIES).forEach((city) => {
    combinations.forEach((combo) => {
      params.push({ city, brand: combo.brand, model: combo.model });
    });
  });
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug, brand: brandSlug, model: modelSlug } = await params;
  const city = CITIES[citySlug];
  const brandName = brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1);
  const modelName = modelSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  if (!city) return {};

  const title = `${brandName} ${modelName} en ${city.name}, PR | Richard Automotive`;
  const description = `Compra el ${brandName} ${modelName} que buscas en ${city.name}, Puerto Rico. Richard Automotive es tu dealer de confianza con financiamiento desde 4.9% APR.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://richard-automotive.com/autos-usados/${city.slug}/${brandSlug}/${modelSlug}`,
    },
    openGraph: { title, description, type: 'website', siteName: 'Richard Automotive', locale: 'es_PR' },
  };
}

export default async function CityBrandModelPage({ params }: Props) {
  const { city: citySlug, brand: brandSlug, model: modelSlug } = await params;
  const city = CITIES[citySlug];
  const brandName = brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1);
  const modelName = modelSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  if (!city) {
    notFound();
  }

  let inventory: Car[] = [];
  try {
    const result = await getPaginatedCars(100, null, 'all');
    inventory = result.cars;
  } catch (error) {
    console.error(`[SEO Page: ${city.name} ${modelName}] Error fetching inventory:`, error);
  }

  const filteredInventory = inventory.filter((car: Car) =>
    (car.make || '').toLowerCase() === brandSlug.toLowerCase() &&
    (car.model || '').toLowerCase() === modelSlug.toLowerCase(),
  );

  const faqs = [
    {
      question: `¿Hay ${brandName} ${modelName} usados en venta en ${city.name}?`,
      answer: `Sí, Richard Automotive tiene disponibles ${brandName} ${modelName} certificados en ${city.name}. Cada unidad pasa inspección de 68 puntos antes de salir al lote.`,
    },
    {
      question: `¿Cuál es el precio del ${brandName} ${modelName} en ${city.name}?`,
      answer: `Nuestro inventario en ${city.name} varía según año, millas y condición. Ofrecemos financiamiento desde 4.9% APR con aprobación en 24 horas.`,
    },
    {
      question: `¿Puedo probar el ${brandName} ${modelName} antes de comprar en ${city.name}?`,
      answer: `Absolutamente. Te invitamos a nuestro dealership en Vega Alta, PR —a solo minutos de ${city.name}— para un test drive sin presión.`,
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: `Richard Automotive — ${brandName} ${modelName} en ${city.name}`,
    description: `Compra ${brandName} ${modelName} en ${city.name}, Puerto Rico. Financiamiento disponible.`,
    url: `https://richard-automotive.com/autos-usados/${city.slug}/${brandSlug}/${modelSlug}`,
    telephone: BUSINESS_CONTACT.phone,
    address: { '@type': 'PostalAddress', addressLocality: city.name, addressRegion: 'PR', postalCode: city.zipCodes[0], addressCountry: 'US' },
    makesOffer: { '@type': 'Offer', itemOffered: { '@type': 'Vehicle', model: modelName, manufacturer: brandName } },
    areaServed: { '@type': 'City', name: city.name },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Suspense fallback={null}>
        <Storefront
          inventory={filteredInventory}
          customTitle={`${brandName} ${modelName} en ${city.name}, PR | Richard Automotive`}
          customDescription={`Encuentra el ${brandName} ${modelName} perfecto en ${city.name}, Puerto Rico. Financiamiento desde 4.9% APR, trade-in garantizado.`}
        />
      </Suspense>
    </>
  );
}
