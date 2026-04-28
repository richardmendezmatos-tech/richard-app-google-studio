import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Storefront from '@/pages/storefront/ui/Storefront';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { notFound } from 'next/navigation';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';

// ── Tactical City Data for PR Market Domination ──
const CITIES: Record<string, {
  name: string;
  slug: string;
  meta: string;
  region: string;
  zipCodes: string[];
  landmarks: string[];
  population: string;
}> = {
  'bayamon': {
    name: 'Bayamón',
    slug: 'bayamon',
    meta: 'el Dealer #1 de Bayamón',
    region: 'Zona Metro',
    zipCodes: ['00956', '00957', '00959', '00960', '00961'],
    landmarks: ['Rexville', 'Santa Rosa Mall', 'Lomas Verdes'],
    population: '185,996',
  },
  'san-juan': {
    name: 'San Juan',
    slug: 'san-juan',
    meta: 'exclusividad en la Capital',
    region: 'Capital',
    zipCodes: ['00901', '00907', '00909', '00911', '00913', '00917', '00918', '00920', '00921', '00923', '00924', '00925', '00926', '00927', '00934', '00936'],
    landmarks: ['Condado', 'Hato Rey', 'Isla Verde', 'Santurce', 'Miramar'],
    population: '342,259',
  },
  'guaynabo': {
    name: 'Guaynabo',
    slug: 'guaynabo',
    meta: 'unidades de lujo en Guaynabo City',
    region: 'Zona Metro',
    zipCodes: ['00965', '00966', '00968', '00969', '00970', '00971'],
    landmarks: ['Garden Hills', 'Caparra', 'Downtown Center'],
    population: '89,780',
  },
  'ponce': {
    name: 'Ponce',
    slug: 'ponce',
    meta: 'la Perla del Sur con Richard Automotive',
    region: 'Sur',
    zipCodes: ['00716', '00717', '00728', '00730', '00731', '00732', '00733', '00734'],
    landmarks: ['Plaza Las Américas Ponce', 'Museo de Arte', 'La Guancha'],
    population: '132,502',
  },
  'caguas': {
    name: 'Caguas',
    slug: 'caguas',
    meta: 'financiamiento expreso en el Turabo',
    region: 'Centro-Este',
    zipCodes: ['00725', '00726', '00727'],
    landmarks: ['Las Catalinas Mall', 'Jardín Botánico', 'Centro Criollo'],
    population: '127,244',
  },
  'carolina': {
    name: 'Carolina',
    slug: 'carolina',
    meta: 'la Ciudad de los Campeones confía en Richard',
    region: 'Zona Metro',
    zipCodes: ['00979', '00982', '00983', '00984', '00985', '00987'],
    landmarks: ['Plaza Carolina', 'Isla Verde', 'Roberto Clemente Coliseum'],
    population: '147,372',
  },
  'mayaguez': {
    name: 'Mayagüez',
    slug: 'mayaguez',
    meta: 'el mejor inventario del Oeste',
    region: 'Oeste',
    zipCodes: ['00680', '00681', '00682'],
    landmarks: ['Plaza del Caribe', 'RUM', 'Zoológico de Mayagüez'],
    population: '71,083',
  },
  'arecibo': {
    name: 'Arecibo',
    slug: 'arecibo',
    meta: 'financiamiento garantizado en La Villa del Capitán Correa',
    region: 'Norte',
    zipCodes: ['00612', '00613', '00614'],
    landmarks: ['Cueva del Indio', 'Faro de Arecibo', 'Plaza del Atlántico'],
    population: '87,242',
  },
  'toa-baja': {
    name: 'Toa Baja',
    slug: 'toa-baja',
    meta: 'tu dealer de confianza en Levittown',
    region: 'Zona Metro',
    zipCodes: ['00949', '00950', '00951', '00952'],
    landmarks: ['Levittown', 'Punta Salinas'],
    population: '75,204',
  },
  'humacao': {
    name: 'Humacao',
    slug: 'humacao',
    meta: 'autos certificados para el Este de PR',
    region: 'Este',
    zipCodes: ['00791', '00792'],
    landmarks: ['Palmas del Mar', 'Plaza Humacao'],
    population: '44,328',
  },
  'vega-alta': {
    name: 'Vega Alta',
    slug: 'vega-alta',
    meta: 'financiamiento directo desde Central Ford',
    region: 'Norte',
    zipCodes: ['00692'],
    landmarks: ['Central Ford', 'Cerro Gordo Beach'],
    population: '39,951',
  },
};

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  return Object.values(CITIES).map((city) => ({
    city: city.slug,
  }));
}

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

function CityJsonLd({ city }: { city: typeof CITIES[string] }) {
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

function CityFAQJsonLd({ city }: { city: typeof CITIES[string] }) {
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

  let inventory: any[] = [];

  try {
    const result = await getPaginatedCars(12);
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
