import React from 'react';
import { Metadata } from 'next';
import VehicleDetail from '@/pages/storefront/ui/VehicleDetail';
import { fetchInventoryFromJava } from '@/shared/api/backend/javaClient';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';
import { Car } from '@/entities/inventory';



interface Props {
  params: Promise<{ id: string; slug: string }>;
}

// SSG: Generate the top vehicle pages at build time
export async function generateStaticParams() {
  try {
    const inventory = await fetchInventoryFromJava(50);
    if (!inventory || inventory.length === 0) {
      throw new Error('Empty inventory from Java API');
    }
    return inventory.map((car: Car) => ({
      id: car.id,
      slug: generateVehicleSlug(car, false),
    }));
  } catch (error) {
    console.warn('[Build] Java API unreachable for v/[slug]/[id]. Providing fallback for build stability.');
    return [{ id: 'fallback-unit', slug: 'richard-automotive-unit' }];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = await params;

  // Attempt to fetch the specific car for rich metadata
  let car: Car | undefined;
  try {
    const inventory = await fetchInventoryFromJava(100);
    car = inventory.find((c: Car) => c.id === id);
  } catch {
    // Fallback to slug-derived metadata
  }

  const title = car
    ? `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ''} | Richard Automotive`
    : `Vehículo ${slug.replace(/-/g, ' ')} | Richard Automotive`;

  const description = car
    ? `${car.year} ${car.make} ${car.model} disponible en Richard Automotive, Puerto Rico. Precio: $${Number(car.price).toLocaleString()}. Financiamiento desde 4.9% APR. Visítanos en Bayamón.`
    : `Encuentra los mejores vehículos usados en Richard Automotive, Puerto Rico. Financiamiento disponible.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: car?.image ? [{ url: car.image, width: 1200, height: 630, alt: title }] : [],
      siteName: 'Richard Automotive',
      locale: 'es_PR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: car?.image ? [car.image] : [],
    },
    alternates: {
      canonical: `https://richard-automotive.com/v/${slug}/${id}`,
    },
    other: {
      'product:price:amount': car?.price?.toString() || '',
      'product:price:currency': 'USD',
      'product:availability': car?.status === 'available' ? 'in stock' : 'out of stock',
    },
  };
}

// JSON-LD Structured Data for the vehicle
function VehicleJsonLd({ car }: { car?: Car }) {
  if (!car) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ''}`,
    manufacturer: car.make,
    model: car.model,
    vehicleModelDate: car.year?.toString(),
    color: car.color,
    mileageFromOdometer: car.mileage
      ? { '@type': 'QuantitativeValue', value: car.mileage, unitCode: 'SMI' }
      : undefined,
    fuelType: car.fuel || car.fuelType,
    vehicleTransmission: car.transmission,
    vehicleEngine: car.engine
      ? { '@type': 'EngineSpecification', name: car.engine }
      : undefined,
    image: car.image,
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: 'USD',
      availability: car.status === 'available'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'AutoDealer',
        name: 'Richard Automotive',
        url: 'https://richard-automotive.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Bayamón',
          addressRegion: 'PR',
          addressCountry: 'US',
        },
      },
    },
  };

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
  const { id } = await params;
  let inventory: Car[] = [];
  let currentCar: Car | undefined;

  try {
    inventory = await fetchInventoryFromJava(50);
    currentCar = inventory.find((c) => c.id === id);
  } catch (err) {
    console.error(err);
  }

  // Generate default FAQs if not provided by the entity
  const defaultFaqs = currentCar
    ? [
        {
          question: `¿Cuánto cuesta el ${currentCar.year} ${currentCar.make} ${currentCar.model}?`,
          answer: `El precio del ${currentCar.year} ${currentCar.make} ${currentCar.model} es $${Number(currentCar.price).toLocaleString()} USD. Ofrecemos financiamiento desde 4.9% APR con opciones de $0 down.`,
        },
        {
          question: `¿Está disponible el ${currentCar.make} ${currentCar.model} en Richard Automotive?`,
          answer: `Sí, este ${currentCar.year} ${currentCar.make} ${currentCar.model} está actualmente ${currentCar.status === 'available' ? 'disponible' : 'reservado'} en nuestro lote en Bayamón, Puerto Rico. Contáctanos para agendar un test drive.`,
        },
        {
          question: '¿Ofrecen financiamiento para este vehículo?',
          answer: 'Sí, trabajamos con múltiples instituciones financieras para ofrecer las mejores tasas del mercado. Estructuras desde 4.9% APR, incluso con historial crediticio limitado.',
        },
      ]
    : [];

  const faqs = currentCar?.seoFaqs?.length ? currentCar.seoFaqs : defaultFaqs;

  return (
    <>
      <VehicleJsonLd car={currentCar} />
      <FAQJsonLd faqs={faqs} />
      <VehicleDetail inventory={inventory} />
    </>
  );
}
