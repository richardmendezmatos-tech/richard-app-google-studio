import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import VehicleDetail from '@/pages/storefront/ui/VehicleDetail';
import { getCarById, getSimilarCars, getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';
import { Car } from '@/entities/inventory';
import { SITE_CONFIG } from '@/shared/config/siteConfig';
import { ReactQueryProvider } from '@/shared/ui/providers/ReactQueryProvider';
import { getBreadcrumbSchema } from '@/shared/config/seoSchemas';

interface Props {
  params: Promise<{ id: string; slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    // Fetch all cars for build-time static generation
    const { cars } = await getPaginatedCars(500, 0, 'all');

    if (!cars || cars.length === 0) {
      console.warn(
        '[Build] Empty inventory from Supabase. Using fallback to satisfy Next.js 16/17 build rules.',
      );
      return [
        {
          id: 'placeholder',
          slug: 'vehiculo-en-proceso',
        },
      ];
    }

    return cars.map((car: Car) => ({
      id: car.id,
      slug: generateVehicleSlug(car, false),
    }));
  } catch (error) {
    console.error('[Build] Critical error in generateStaticParams:', error);
    // Absolute fallback to prevent deployment failure
    return [
      {
        id: 'fallback-error',
        slug: 'error-de-datos',
      },
    ];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = await params;

  // Fetch specific car for rich metadata
  const car = await getCarById(id);

  const title = car
    ? `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ''} | Richard Automotive`
    : `Vehículo ${slug.replace(/-/g, ' ')} | Richard Automotive`;

  const description = car
    ? car.description ||
      `${car.year} ${car.make} ${car.model} disponible en Richard Automotive, Puerto Rico. Precio: $${Number(car.price).toLocaleString()}. Financiamiento desde 4.9% APR. Visítanos en Vega Alta.`
    : `Encuentra los mejores vehículos nuevos y usados en Richard Automotive, Puerto Rico. Financiamiento disponible.`;

  const ogImageUrl = `${SITE_CONFIG.url}/api/og?id=${id}`;

  return {
    title,
    description: description.slice(0, 160), // Clamp for SEO best practices
    keywords: [
      `${car?.make} ${car?.model} usado puerto rico`,
      `${car?.make} ${car?.year}`,
      'Richard Automotive',
      'dealer autos usados vega alta',
      'autos reposeidos puerto rico',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'Richard Automotive',
      locale: 'es_PR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: `${SITE_CONFIG.url}/inventario/${slug}/${id}`,
    },
    other: {
      'product:price:amount': car?.price?.toString() || '',
      'product:price:currency': 'USD',
      'product:availability': car?.status === 'available' ? 'in stock' : 'out of stock',
      'product:condition': car?.condition || 'new',
    },
  };
}

// JSON-LD Structured Data for the vehicle
function VehicleJsonLd({ car, slug, id }: { car?: Car; slug: string; id: string }) {
  if (!car) return null;

  const pageUrl = `https://www.richard-automotive.com/inventario/${slug}/${id}`;
  const isNew = car.condition === 'new';
  const conditionUrl = isNew ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition';
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const images = car.images?.length ? car.images : [car.image || car.img || ''].filter(Boolean);

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ''}`,
    description: car.description || `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ''} disponible en Richard Automotive, Vega Alta, Puerto Rico. Precio: $${Number(car.price).toLocaleString()}. Financiamiento desde 4.9% APR.`,
    brand: { '@type': 'Brand', name: car.make },
    manufacturer: car.make,
    model: car.model,
    vehicleModelDate: car.year?.toString(),
    color: car.color,
    bodyType: car.type,
    mileageFromOdometer: car.mileage
      ? { '@type': 'QuantitativeValue', value: car.mileage, unitCode: 'SMI' }
      : undefined,
    fuelType: car.fuel || car.fuelType,
    vehicleTransmission: car.transmission,
    vehicleEngine: car.engine ? { '@type': 'EngineSpecification', name: car.engine } : undefined,
    image: images,
    itemCondition: conditionUrl,
    url: pageUrl,
    sku: car.id,
    additionalProperty: car.features?.map((f) => ({ '@type': 'PropertyValue', name: f })),
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: 'USD',
      itemCondition: conditionUrl,
      availability:
        car.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: pageUrl,
      priceValidUntil,
      seller: {
        '@type': 'AutoDealer',
        name: 'Richard Automotive — Central Ford',
        url: 'https://www.richard-automotive.com',
        telephone: '+1-787-368-2880',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Carr. #2 KM 28.5, Bo. Espinosa',
          addressLocality: 'Vega Alta',
          addressRegion: 'PR',
          postalCode: '00692',
          addressCountry: 'US',
        },
      },
    },
  };

  // Remove undefined fields
  Object.keys(jsonLd).forEach((k) => jsonLd[k] === undefined && delete jsonLd[k]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// FAQ Structured Data
function FAQJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (!faqs?.length) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function VehicleDetailPage({ params }: Props) {
  const { id, slug } = await params;

  const currentCar = await getCarById(id);

  if (!currentCar) notFound();

  // Fetch similar cars by make or type (for related/sidebar)
  const inventory = currentCar
    ? await getSimilarCars(currentCar.make, currentCar.type, id, 4)
    : [];

  // Generate default FAQs if not provided by the entity
  const defaultFaqs = currentCar
    ? [
        {
          question: `¿Cuánto cuesta el ${currentCar.year} ${currentCar.make} ${currentCar.model}?`,
          answer: `El precio del ${currentCar.year} ${currentCar.make} ${currentCar.model} es $${Number(currentCar.price).toLocaleString()} USD. Ofrecemos financiamiento desde 4.9% APR con opciones de $0 down.`,
        },
        {
          question: `¿Está disponible el ${currentCar.make} ${currentCar.model} en Richard Automotive?`,
          answer: `Sí, este ${currentCar.year} ${currentCar.make} ${currentCar.model} está actualmente ${currentCar.status === 'available' ? 'disponible' : 'reservado'} en nuestro lote en Vega Alta, Puerto Rico. Contáctanos para agendar un test drive.`,
        },
        {
          question: '¿Ofrecen financiamiento para este vehículo?',
          answer:
            'Sí, trabajamos con múltiples instituciones financieras para ofrecer las mejores tasas del mercado. Estructuras desde 4.9% APR, incluso con historial crediticio limitado.',
        },
        {
          question: '¿Entregan vehículos a toda la isla?',
          answer:
            'Richard Automotive ofrece entrega rápida y segura en todo Puerto Rico. Si estás en San Juan, Bayamón, Caguas o Ponce, podemos llevarte tu auto directamente a tu hogar o trabajo.',
        },
      ]
    : [];

  const faqs = currentCar?.seoFaqs?.length ? currentCar.seoFaqs : defaultFaqs;

  const vehicleTitle = `${currentCar.year} ${currentCar.make} ${currentCar.model}${currentCar.trim ? ` ${currentCar.trim}` : ''}`;
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Inicio', url: '/' },
    { name: 'Inventario', url: '/inventario' },
    { name: vehicleTitle, url: `/inventario/${slug}/${id}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <VehicleJsonLd car={currentCar || undefined} slug={slug} id={id} />
      <FAQJsonLd faqs={faqs} />
      <ReactQueryProvider>
        <VehicleDetail car={currentCar || undefined} inventory={inventory} />
      </ReactQueryProvider>
    </>
  );
}
