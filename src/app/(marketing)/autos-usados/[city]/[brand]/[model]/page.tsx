import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Storefront from '@/views/storefront/ui/Storefront';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { Car } from '@/entities/inventory';
import { notFound } from 'next/navigation';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';
import { CITIES_PR as CITIES } from '@/shared/config/cities';
import { slugify } from '@/shared/lib/utils/seo';

const BRANDS: Record<string, { name: string; slug: string }> = {
  ford: { name: 'Ford', slug: 'ford' },
  hyundai: { name: 'Hyundai', slug: 'hyundai' },
  toyota: { name: 'Toyota', slug: 'toyota' },
  honda: { name: 'Honda', slug: 'honda' },
};

const MODELS_BY_BRAND: Record<string, { name: string; slug: string; keywords: string[] }[]> = {
  ford: [
    { name: 'F-150', slug: 'f-150', keywords: ['pickup', 'camioneta', 'truck', 'Raptor', 'Lariat', 'King Ranch'] },
    { name: 'Explorer', slug: 'explorer', keywords: ['SUV', '7 pasajeros', '4x4', 'Limited'] },
    { name: 'Mustang', slug: 'mustang', keywords: ['deportivo', 'coupe', 'GT', 'convertible'] },
    { name: 'Ranger', slug: 'ranger', keywords: ['pickup mediana', 'camioneta', 'STX', 'Lariat'] },
    { name: 'Escape', slug: 'escape', keywords: ['SUV compacto', 'híbrido', 'EcoBoost'] },
    { name: 'Edge', slug: 'edge', keywords: ['SUV mediano', 'crossover', 'ST', 'Titanium'] },
    { name: 'Bronco', slug: 'bronco', keywords: ['off-road', '4x4', 'SUV', 'Badlands'] },
    { name: 'Maverick', slug: 'maverick', keywords: ['pickup compacta', 'híbrido', 'Lariat'] },
  ],
  hyundai: [
    { name: 'Tucson', slug: 'tucson', keywords: ['SUV compacto', 'híbrido', 'Limited'] },
    { name: 'Elantra', slug: 'elantra', keywords: ['sedán', 'compacto', 'N Line'] },
    { name: 'Santa Fe', slug: 'santa-fe', keywords: ['SUV mediano', '7 pasajeros', 'Calligraphy'] },
    { name: 'Palisade', slug: 'palisade', keywords: ['SUV grande', '8 pasajeros', 'premium'] },
  ],
  toyota: [
    { name: 'Tacoma', slug: 'tacoma', keywords: ['pickup mediana', 'TRD', '4x4', 'off-road'] },
    { name: 'Corolla', slug: 'corolla', keywords: ['sedán compacto', 'confiable', 'ahorrador'] },
    { name: 'RAV4', slug: 'rav4', keywords: ['SUV compacto', 'híbrido', 'aventura'] },
    { name: 'Highlander', slug: 'highlander', keywords: ['SUV mediano', '7 pasajeros', 'Limited'] },
  ],
  honda: [
    { name: 'CR-V', slug: 'cr-v', keywords: ['SUV compacto', 'confiable', 'familiar'] },
    { name: 'Civic', slug: 'civic', keywords: ['sedán compacto', 'deportivo', 'Si'] },
    { name: 'Accord', slug: 'accord', keywords: ['sedán mediano', 'premium', 'Touring'] },
    { name: 'HR-V', slug: 'hr-v', keywords: ['SUV subcompacto', 'crossover', 'LX'] },
  ],
};

interface Props {
  params: Promise<{ city: string; brand: string; model: string }>;
}

function findModel(brandSlug: string, modelSlug: string) {
  const brandModels = MODELS_BY_BRAND[brandSlug];
  if (!brandModels) return null;
  return brandModels.find((m) => m.slug === modelSlug) || null;
}

export async function generateStaticParams() {
  const params: any[] = [];
  Object.keys(CITIES).forEach((city) => {
    Object.keys(MODELS_BY_BRAND).forEach((brand) => {
      MODELS_BY_BRAND[brand].forEach((model) => {
        params.push({ city, brand, model: model.slug });
      });
    });
  });
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug, brand: brandSlug, model: modelSlug } = await params;
  const city = CITIES[citySlug];
  const brand = BRANDS[brandSlug];
  const model = findModel(brandSlug, modelSlug);

  if (!city || !brand || !model) return {};

  const title = `Ford ${model.name} en ${city.name}, PR | Richard Automotive`;
  const description = `Compra la Ford ${model.name} que buscas en ${city.name}, Puerto Rico. ${model.keywords.slice(0, 3).join(', ')}. Richard Automotive es tu dealer de confianza con financiamiento desde 4.9% APR.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://richard-automotive.com/autos-usados/${city.slug}/${brand.slug}/${model.slug}`,
    },
    openGraph: { title, description, type: 'website', siteName: 'Richard Automotive', locale: 'es_PR' },
  };
}

export default async function CityBrandModelPage({ params }: Props) {
  const { city: citySlug, brand: brandSlug, model: modelSlug } = await params;
  const city = CITIES[citySlug];
  const brand = BRANDS[brandSlug];
  const model = findModel(brandSlug, modelSlug);

  if (!city || !brand || !model) {
    notFound();
  }

  let inventory: Car[] = [];
  try {
    const result = await getPaginatedCars(50, null, 'all');
    inventory = result.cars;
  } catch (error) {
    console.error(`[SEO Page: ${city.name} ${model.name}] Error fetching inventory:`, error);
  }

  const filteredInventory = inventory.filter((car: Car) =>
    car.name.toLowerCase().includes(model.name.toLowerCase()),
  );

  const faqs = [
    {
      question: `¿Hay Ford ${model.name} usados en venta en ${city.name}?`,
      answer: `Sí, Richard Automotive tiene disponibles Ford ${model.name} certificados en ${city.name}. ${model.keywords[0] ? `Destacamos por: ${model.keywords.join(', ')}.` : ''} Cada unidad pasa inspección de 68 puntos antes de salir al lote.`,
    },
    {
      question: `¿Cuál es el precio de la Ford ${model.name} en ${city.name}?`,
      answer: `Nuestro inventario de Ford ${model.name} en ${city.name} varía en precio según año, millas y condición. Tenemos opciones desde $15,000 hasta $85,000. Ofrecemos financiamiento desde 4.9% APR con aprobación en 24 horas.`,
    },
    {
      question: `¿Puedo probar la Ford ${model.name} antes de comprar en ${city.name}?`,
      answer: `Absolutamente. Te invitamos a nuestro dealership en Vega Alta, PR —a solo minutos de ${city.name}— para un test drive sin presión. También ofrecemos entrega a domicilio en ${city.name} y toda el área de ${city.region}.`,
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: `Richard Automotive — Ford ${model.name} en ${city.name}`,
    description: `Compra Ford ${model.name} en ${city.name}, Puerto Rico. ${model.keywords[0] || 'Financiamiento disponible'}.`,
    url: `https://richard-automotive.com/autos-usados/${city.slug}/${brand.slug}/${model.slug}`,
    telephone: BUSINESS_CONTACT.phone,
    address: { '@type': 'PostalAddress', addressLocality: city.name, addressRegion: 'PR', postalCode: city.zipCodes[0], addressCountry: 'US' },
    makesOffer: { '@type': 'Offer', itemOffered: { '@type': 'Vehicle', model: model.name, manufacturer: brand.name } },
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
          customTitle={`Ford ${model.name} en ${city.name}, PR | Richard Automotive`}
          customDescription={`Encuentra la Ford ${model.name} perfecta en ${city.name}, Puerto Rico. ${model.keywords.slice(0, 3).join(', ')}. Financiamiento desde 4.9% APR, trade-in garantizado.`}
        />
      </Suspense>
    </>
  );
}
