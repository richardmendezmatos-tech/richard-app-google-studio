import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Storefront from '@/pages/storefront/ui/Storefront';
import { fetchInventoryFromJava } from '@/shared/api/backend/javaClient';
import { notFound } from 'next/navigation';

const CATEGORIES: Record<string, {
  name: string;
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  icon: string;
}> = {
  'suv': {
    name: 'SUVs',
    slug: 'suv',
    title: 'SUVs Usadas en Puerto Rico',
    description: 'Las mejores SUVs usadas y certificadas en Puerto Rico. Toyota RAV4, Honda CR-V, Hyundai Tucson, Ford Explorer y más. Financiamiento desde 4.9% APR.',
    keywords: ['suv usada', 'suv puerto rico', 'guagua usada', 'toyota rav4 usada', 'honda crv usada'],
    icon: '🚙',
  },
  'sedan': {
    name: 'Sedanes',
    slug: 'sedan',
    title: 'Sedanes Usados en Puerto Rico',
    description: 'Sedanes usados certificados en PR. Toyota Camry, Honda Civic, Hyundai Elantra, Nissan Sentra. Eficiencia y confort con financiamiento garantizado.',
    keywords: ['sedan usado', 'carro sedan puerto rico', 'toyota camry usado', 'honda civic usado'],
    icon: '🚗',
  },
  'pickup': {
    name: 'Pickups',
    slug: 'pickup',
    title: 'Pickups Usadas en Puerto Rico — Trabajo y Potencia',
    description: 'Pickups y trucks usados en PR. Ford F-150, Toyota Tacoma, Chevrolet Silverado, RAM 1500. Para trabajo pesado con financiamiento accesible.',
    keywords: ['pickup usada', 'truck usado puerto rico', 'ford f150 usada', 'toyota tacoma usada'],
    icon: '🛻',
  },
  'luxury': {
    name: 'Lujo',
    slug: 'luxury',
    title: 'Autos de Lujo Usados en Puerto Rico',
    description: 'Vehículos de lujo usados y certificados en PR. BMW, Mercedes-Benz, Audi, Lexus, Genesis. Elegancia premium con estructura de pago accesible.',
    keywords: ['auto lujo usado', 'bmw usado puerto rico', 'mercedes usado pr', 'lexus usado'],
    icon: '✨',
  },
  'economico': {
    name: 'Económicos',
    slug: 'economico',
    title: 'Autos Económicos Usados en Puerto Rico — Desde $8,000',
    description: 'Autos usados económicos en PR desde $8,000. Ahorro en combustible y mantenimiento. Nissan Versa, Kia Forte, Hyundai Accent. Financiamiento garantizado.',
    keywords: ['auto barato puerto rico', 'carro economico usado', 'auto usado barato pr'],
    icon: '💰',
  },
  'electrico': {
    name: 'Eléctricos e Híbridos',
    slug: 'electrico',
    title: 'Autos Eléctricos e Híbridos Usados en Puerto Rico',
    description: 'Vehículos eléctricos e híbridos usados en PR. Tesla, Toyota Prius, Hyundai Ioniq, Chevrolet Bolt. Ahorra en gasolina con tecnología verde.',
    keywords: ['auto electrico usado', 'tesla usada puerto rico', 'hibrido usado pr', 'carro electrico pr'],
    icon: '⚡',
  },
};

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return Object.values(CATEGORIES).map((cat) => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES[category];
  if (!cat) return {};

  return {
    title: `${cat.title} | Richard Automotive`,
    description: cat.description,
    keywords: cat.keywords,
    alternates: {
      canonical: `https://richard-automotive.com/autos-usados/tipo/${cat.slug}`,
    },
    openGraph: {
      title: `${cat.title} | Richard Automotive`,
      description: cat.description,
      type: 'website',
      siteName: 'Richard Automotive',
      locale: 'es_PR',
    },
    twitter: {
      card: 'summary_large_image',
      title: cat.title,
      description: cat.description,
    },
  };
}

function CategoryFAQJsonLd({ cat }: { cat: typeof CATEGORIES[string] }) {
  const faqs = [
    {
      question: `¿Dónde puedo comprar ${cat.name.toLowerCase()} usados en Puerto Rico?`,
      answer: `Richard Automotive ofrece un amplio inventario de ${cat.name.toLowerCase()} usados y certificados en Puerto Rico. Todos nuestros vehículos pasan inspección de 150 puntos y vienen con garantía.`,
    },
    {
      question: `¿Ofrecen financiamiento para ${cat.name.toLowerCase()} usados?`,
      answer: `Sí, ofrecemos financiamiento desde 4.9% APR para ${cat.name.toLowerCase()}. Trabajamos con múltiples instituciones financieras y podemos aprobar tu solicitud en 24 horas, incluso con historial crediticio limitado.`,
    },
    {
      question: `¿Puedo hacer trade-in para comprar un ${cat.name.toLowerCase() === 'lujo' ? 'auto de lujo' : cat.name.toLowerCase().slice(0, -1)}?`,
      answer: `Absolutamente. Aceptamos trade-ins y nuestro motor de tasación neural calcula el valor justo de mercado de tu vehículo actual en 90 segundos. Obtienes el máximo valor garantizado.`,
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

function CollectionJsonLd({ cat }: { cat: typeof CATEGORIES[string] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cat.title,
    description: cat.description,
    url: `https://richard-automotive.com/autos-usados/tipo/${cat.slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Richard Automotive',
      url: 'https://richard-automotive.com',
    },
    provider: {
      '@type': 'AutoDealer',
      name: 'Richard Automotive',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bayamón',
        addressRegion: 'PR',
        addressCountry: 'US',
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

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = CATEGORIES[category];

  if (!cat) {
    notFound();
  }

  let inventory: any[] = [];

  try {
    const allInventory = await fetchInventoryFromJava(50);
    // Filter by type if possible, otherwise show all
    inventory = allInventory.filter(
      (car: any) => car.type?.toLowerCase() === cat.slug || !car.type
    );
    // If filter yields too few results, show all
    if (inventory.length < 3) {
      inventory = allInventory.slice(0, 12);
    }
  } catch (error) {
    console.error(`[SEO Category: ${cat.name}] Error fetching inventory:`, error);
  }

  return (
    <>
      <CollectionJsonLd cat={cat} />
      <CategoryFAQJsonLd cat={cat} />
      <Suspense fallback={null}>
        <Storefront
          inventory={inventory}
          customTitle={`${cat.icon} ${cat.title} | Richard Automotive`}
          customDescription={cat.description}
        />
      </Suspense>
    </>
  );
}
