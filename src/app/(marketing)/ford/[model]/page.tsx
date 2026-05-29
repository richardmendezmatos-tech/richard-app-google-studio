import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getDistinctFordModels,
  getFordModelCars,
} from '@/entities/inventory/api/adapters/fordModelService';
import {
  Car,
  Fuel,
  Gauge,
  ArrowRight,
  Calendar,
  Shield,
  Award,
  Wrench,
  CheckCircle,
} from 'lucide-react';

interface Props {
  params: Promise<{ model: string }>;
}

export async function generateStaticParams() {
  const models = await getDistinctFordModels();
  return models.map((m) => ({
    model: m.model.toLowerCase(),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { model } = await params;
  const modelName = model.charAt(0).toUpperCase() + model.slice(1);

  return {
    title: `Ford ${modelName} 2026 | Precio, Fotos y Especificaciones en Puerto Rico | Richard Automotive`,
    description: `Ford ${modelName} en Puerto Rico. Precios, fotos, especificaciones, financiamiento Ford Credit y más. Disponible en Central Ford, Vega Alta. ¡Agenda tu prueba de manejo!`,
    keywords: [
      `ford ${modelName} puerto rico`,
      `ford ${modelName} precio`,
      `ford ${modelName} 2026`,
      `${modelName} central ford`,
      `${modelName} vega alta`,
      `comprar ford ${modelName} pr`,
    ],
    alternates: {
      canonical: `https://richard-automotive.com/ford/${model}`,
    },
    openGraph: {
      title: `Ford ${modelName} 2026 | Richard Automotive — Central Ford PR`,
      description: `Ford ${modelName} nuevo y usado en Puerto Rico. Precios, fotos y financiamiento en Central Ford, Vega Alta.`,
      type: 'website',
      siteName: 'Richard Automotive',
      locale: 'es_PR',
    },
  };
}

export const revalidate = 3600;

const BODY_STYLE_LABELS: Record<string, string> = {
  suv: 'SUV',
  sedan: 'Sedán',
  pickup: 'Camioneta',
  truck: 'Camioneta',
  coupe: 'Coupé',
  hatchback: 'Hatchback',
  van: 'Van',
  wagon: 'Camioneta',
};

const BODY_STYLE_ICONS: Record<string, React.ReactNode> = {
  suv: <Car size={16} />,
  sedan: <Car size={16} />,
  pickup: <Car size={16} />,
  truck: <Car size={16} />,
};

function ModelJsonLd({
  modelName,
  cars,
}: {
  modelName: string;
  cars: any[];
}) {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://richard-automotive.com' },
        { '@type': 'ListItem', position: 2, name: 'Ford', item: 'https://richard-automotive.com/ford' },
        {
          '@type': 'ListItem',
          position: 3,
          name: `Ford ${modelName}`,
          item: `https://richard-automotive.com/ford/${modelName.toLowerCase()}`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Ford ${modelName} en Puerto Rico`,
      description: `Inventario de Ford ${modelName} nuevo y usado en Central Ford, Vega Alta.`,
      url: `https://richard-automotive.com/ford/${modelName.toLowerCase()}`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: cars.slice(0, 12).map((car, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Car',
            name: `${car.year} ${car.make} ${car.model}`,
            model: modelName,
            manufacturer: 'Ford',
            offers: {
              '@type': 'Offer',
              price: car.price,
              priceCurrency: 'USD',
            },
          },
        })),
      },
    },
  ];

  return schemas.map((schema, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  ));
}

export default async function FordModelPage({ params }: Props) {
  const { model } = await params;
  const modelName = model.charAt(0).toUpperCase() + model.slice(1);

  const cars = await getFordModelCars(model);

  if (cars.length === 0) {
    notFound();
  }

  const minPrice = Math.min(...cars.map((c) => c.price));
  const maxPrice = Math.max(...cars.map((c) => c.price));
  const years = [...new Set(cars.map((c) => c.year))].sort((a, b) => b - a);
  const transmissions = [...new Set(cars.map((c) => c.transmission).filter(Boolean))];
  const fuels = [...new Set(cars.map((c) => c.fuel || c.fuelType).filter(Boolean))];
  const bodyStyles = [...new Set(cars.map((c) => c.type).filter(Boolean))];
  const cheapestCar = cars.reduce((prev, curr) => (prev.price < curr.price ? prev : curr));
  const conditions = [...new Set(cars.map((c) => c.condition).filter(Boolean))];
  const hpValues = [...new Set(cars.map((c) => c.hp).filter((h): h is number => h != null))].sort((a, b) => b - a);
  const engineValues = [...new Set(cars.map((c) => c.engine).filter(Boolean))];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <ModelJsonLd modelName={modelName} cars={cars} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,211,238,0.1)_0%,_transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em]">
                Central Ford — Vega Alta
              </p>
              <h1 className="text-4xl md:text-6xl font-black leading-tight">
                Ford{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
                  {modelName}
                </span>
              </h1>
              <p className="text-slate-400 text-lg">
                {conditions.includes('new') && conditions.includes('used')
                  ? `Nuevo y usado disponible en Puerto Rico.`
                  : conditions.includes('new')
                    ? `Nuevo disponible en Puerto Rico.`
                    : `Usado disponible en Puerto Rico.`}{' '}
                {years[0]} — {years[years.length - 1]}. Financiamiento Ford Credit disponible.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/inventario?make=ford&model=${model}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-500/25"
                >
                  Ver Inventario <ArrowRight size={16} />
                </Link>
                <Link
                  href="/prueba-de-manejo"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/20 hover:border-white/40 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all"
                >
                  Prueba de Manejo
                </Link>
                <Link
                  href="/precualificacion"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/20 hover:border-white/40 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all"
                >
                  Precalifica
                </Link>
              </div>
            </div>

            <div className="relative aspect-video lg:aspect-square bg-slate-800/50 rounded-3xl overflow-hidden border border-white/5 flex items-center justify-center p-8">
              {cheapestCar.image && (
                <Image
                  src={cheapestCar.image}
                  alt={`Ford ${modelName}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-3xl font-black text-cyan-400">${minPrice.toLocaleString()}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Desde</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-3xl font-black text-cyan-400">
              ${Math.round(minPrice / 72).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Mensual Est.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-3xl font-black text-white">{years[0] || '—'}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Año</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-3xl font-black text-white">{cars.length}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Unidades</p>
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8">
          <h2 className="text-2xl font-black mb-8">Especificaciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {years.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <Calendar className="text-cyan-400 shrink-0" size={24} />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Años</p>
                  <p className="font-bold">{years.join(' / ')}</p>
                </div>
              </div>
            )}
            {transmissions.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <Gauge className="text-cyan-400 shrink-0" size={24} />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Transmisión</p>
                  <p className="font-bold capitalize">{transmissions.join(' / ')}</p>
                </div>
              </div>
            )}
            {fuels.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <Fuel className="text-cyan-400 shrink-0" size={24} />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Combustible</p>
                  <p className="font-bold capitalize">{fuels.join(' / ')}</p>
                </div>
              </div>
            )}
            {bodyStyles.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <Car className="text-cyan-400 shrink-0" size={24} />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tipo</p>
                  <p className="font-bold capitalize">
                    {bodyStyles.map((s) => BODY_STYLE_LABELS[s] || s).join(' / ')}
                  </p>
                </div>
              </div>
            )}
            {conditions.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <Award className="text-cyan-400 shrink-0" size={24} />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Condición</p>
                  <p className="font-bold capitalize">
                    {conditions.map((c) => (c === 'new' ? 'Nuevo' : 'Usado')).join(' / ')}
                  </p>
                </div>
              </div>
            )}
            {(engineValues.length > 0 || hpValues.length > 0) && (
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <Wrench className="text-cyan-400 shrink-0" size={24} />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Motor / HP</p>
                  <p className="font-bold">
                    {[engineValues.join(' / '), hpValues.length > 0 ? `${hpValues[0]} HP` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Central Ford */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-black mb-8 text-center">
          ¿Por qué comprar tu Ford{' '}
          <span className="text-cyan-400">{modelName}</span> en Central Ford?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-3">
            <Shield className="text-cyan-400 mx-auto" size={32} />
            <h3 className="font-black text-lg">Garantía 10 Años / 100k</h3>
            <p className="text-sm text-slate-400">
              La mejor garantía del mercado en modelos Ford nuevos. Tranquilidad total en Puerto Rico.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-3">
            <Award className="text-cyan-400 mx-auto" size={32} />
            <h3 className="font-black text-lg">Ford Credit</h3>
            <p className="text-sm text-slate-400">
              Tasas preferenciales, aprobación rápida y opciones de financiamiento para todos.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-3">
            <CheckCircle className="text-cyan-400 mx-auto" size={32} />
            <h3 className="font-black text-lg">Bono Web $300</h3>
            <p className="text-sm text-slate-400">
              Descuento adicional al comprar tu Ford con nosotros. Válido en modelos nuevos y usados.
            </p>
          </div>
        </div>
      </section>

      {/* Inventory Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-black mb-8">
          Ford {modelName} Disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.slice(0, 6).map((car) => (
            <Link
              key={car.id}
              href={`/inventario/${car.name.toLowerCase().replace(/\s+/g, '-')}/${car.id}`}
              className="group bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-400/30 transition-all"
            >
              <div className="aspect-[16/10] relative bg-slate-800 flex items-center justify-center p-4">
                <Image
                  src={car.image}
                  alt={car.name}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-lg">{car.year} {car.name}</h3>
                <p className="text-2xl font-black text-cyan-400">
                  ${car.price.toLocaleString()}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  {car.mileage != null && <span>{car.mileage.toLocaleString()} mi</span>}
                  {car.transmission && <span className="capitalize">{car.transmission}</span>}
                  {car.condition && (
                    <span className={car.condition === 'new' ? 'text-emerald-400' : 'text-amber-400'}>
                      {car.condition === 'new' ? 'Nuevo' : 'Usado'}
                    </span>
                  )}
                  {car.fuel && <span className="capitalize">{car.fuel}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {cars.length > 6 && (
          <div className="text-center mt-8">
            <Link
              href={`/inventario?make=ford&model=${model}`}
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 hover:border-white/40 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all"
            >
              Ver las {cars.length} unidades <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-black mb-8 text-center">
          Preguntas Frecuentes — Ford {modelName}
        </h2>
        <div className="space-y-4">
          {[
            {
              q: `¿Cuál es el precio de la Ford ${modelName} en Puerto Rico?`,
              a: `El precio de la Ford ${modelName} en Puerto Rico comienza desde $${minPrice.toLocaleString()}. El precio varía según año, condición, millaje y equipamiento. Visita nuestro inventario para ver precios actualizados.`,
            },
            {
              q: `¿Dónde puedo comprar una Ford ${modelName} en Puerto Rico?`,
              a: `En Central Ford, ubicados en Vega Alta, Puerto Rico. Somos distribuidores autorizados Ford con inventario nuevo y usado. Además ofrecemos financiamiento Ford Credit, trade-in y bono web de $300.`,
            },
            {
              q: `¿La Ford ${modelName} tiene financiamiento disponible?`,
              a: `Sí, ofrecemos financiamiento a través de Ford Credit con tasas preferenciales. Puedes precalificar en línea sin impacto crediticio en nuestra página de precalificación.`,
            },
            {
              q: `¿Puedo agendar una prueba de manejo de la Ford ${modelName}?`,
              a: `¡Claro! Puedes agendar tu prueba de manejo sin compromiso a través de nuestra página de prueba de manejo. Te esperamos en Central Ford, Vega Alta.`,
            },
          ].map((faq, i) => (
            <details
              key={i}
              className="group bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden"
            >
              <summary className="p-5 font-bold cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between">
                <span>{faq.q}</span>
                <span className="text-cyan-400 shrink-0 ml-4 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
