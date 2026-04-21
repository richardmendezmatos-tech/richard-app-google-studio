import React from 'react';
import { Metadata } from 'next';
import VehicleDetail from '@/pages/storefront/ui/VehicleDetail';
import { getCarById, getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';
import { Car } from '@/entities/inventory';

interface Props {
  params: Promise<{ id: string; slug: string }>;
}

// SSG: Generate the top vehicle pages at build time
export async function generateStaticParams() {
  try {
    // Fetch first 100 cars for static generation
    const { cars } = await getPaginatedCars(100, 0);
    
    if (!cars || cars.length === 0) {
      console.warn('[Build] Empty inventory from Supabase for static params.');
      return [];
    }

    return cars.map((car: Car) => ({
      id: car.id,
      slug: generateVehicleSlug(car, false),
    }));
  } catch (error) {
    console.error('[Build] Supabase unreachable for static params:', error);
    return [];
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
    ? `${car.year} ${car.make} ${car.model} disponible en Richard Automotive, Puerto Rico. Precio: $${Number(car.price).toLocaleString()}. Financiamiento desde 4.9% APR. Visítanos en Bayamón.`
    : `Encuentra los mejores vehículos nuevos y usados en Richard Automotive, Puerto Rico. Financiamiento disponible.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: car?.img ? [{ url: car.img, width: 1200, height: 630, alt: title }] : [],
      siteName: 'Richard Automotive',
      locale: 'es_PR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: car?.img ? [car.img] : [],
    },
    alternates: {
      canonical: `https://richard-automotive.com/v/${slug}/${id}`,
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
    image: car.img || car.image,
    itemCondition: car.condition === 'new' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
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
  
  // Parallel fetch for current car and initial inventory (for related/sidebar)
  const [currentCar, { cars: inventory }] = await Promise.all([
    getCarById(id),
    getPaginatedCars(12, 0)
  ]);

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
      <VehicleDetail 
        car={currentCar} 
        inventory={inventory} 
      />
    </>
  );
}
