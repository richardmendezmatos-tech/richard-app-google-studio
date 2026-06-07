'use client';

import React from 'react';
import { Car } from '@/shared/types/types';
import SEO from '@/shared/ui/seo/SEO';
import { SITE_CONFIG } from '@/shared/config/siteConfig';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';
import { getAutoDealerSchema, getWebsiteSchema } from '@/shared/config/seoSchemas';

import dynamic from 'next/dynamic';
import HeroSection from '@/features/inventory/ui/storefront/HeroSection';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';

const SocialFooter = dynamic(() => import('@/features/inventory/ui/storefront/SocialFooter'), {
  ssr: true,
  loading: () => <div className="h-40 bg-slate-900/20 animate-pulse rounded-3xl mx-6" />,
});
const AuthoritySection = dynamic(
  () => import('@/features/marketing').then((mod) => ({ default: mod.AuthoritySection })),
  { ssr: true, loading: () => <div className="h-64 bg-slate-900/20 animate-pulse rounded-3xl" /> },
);
const StorefrontMarketPulse = dynamic(
  () => import('@/features/inventory/ui/StorefrontMarketPulse'),
  { ssr: true, loading: () => <div className="h-48 bg-slate-900/20 animate-pulse rounded-3xl" /> },
);

const GlassContainer = dynamic(
  () => import('@/shared/ui/common/GlassContainer').then((mod) => ({ default: mod.GlassContainer })),
  { ssr: true, loading: () => <div className="h-48 bg-slate-900/20 animate-pulse rounded-3xl" /> },
);
const StorefrontResultsGrid = dynamic(
  () => import('@/widgets/inventory/StorefrontResultsGrid'),
  { ssr: true, loading: () => <div className="min-h-[400px] bg-slate-900/20 animate-pulse rounded-3xl" /> },
);
const StorefrontComparisonBar = dynamic(
  () => import('@/widgets/comparison/StorefrontComparisonBar'),
  { ssr: false, loading: () => null },
);
const StorefrontModals = dynamic(
  () => import('@/features/inventory/ui/StorefrontModals'),
  { ssr: false, loading: () => null },
);
const SocialProofWidget = dynamic(
  () => import('@/widgets/brand-ui/layout/conversion/SocialProofWidget').then((mod) => ({ default: mod.SocialProofWidget })),
  { ssr: false, loading: () => null },
);

// Custom Hook
import { useStorefrontState } from '@/features/inventory';

import { useRouter } from 'next/navigation';

interface Props {
  inventory: Car[];
  initialVisualSearch?: string | null;
  onClearVisualSearch?: () => void;
  onMagicFix?: () => Promise<void>;
  onOpenGarage?: () => void;
  customTitle?: string;
  customDescription?: string;
}

const Storefront: React.FC<Props> = ({
  inventory,
  onMagicFix,
  onOpenGarage,
  customTitle,
  customDescription,
}) => {
  const { state, actions } = useStorefrontState(inventory, onOpenGarage, onMagicFix);
  const router = useRouter();

  return (
    <>
      <div className="h-full w-full bg-transparent">
        <SEO
          title={customTitle || 'Autos Nuevos y Usados de Lujo en Puerto Rico | Richard Automotive'}
          description={
            customDescription ||
            'Tu concesionario oficial de autos nuevos en Bayamón y Vega Alta, Puerto Rico. El inventario más exclusivo de SUVs, Sedanes y Pickups con financiamiento expreso en 24h. Trade-in justo y entrega inmediata.'
          }
          url="/"
          type="website"
          schema={{
            '@context': 'https://schema.org',
            '@graph': (() => {
              const dealer = getAutoDealerSchema();
              const { '@context': _dc, ...dealerSchema } = dealer;
              const site = getWebsiteSchema();
              const { '@context': _sc, ...siteSchema } = site;
              return [
                { ...dealerSchema, '@id': `${SITE_CONFIG.url}/#dealer` },
                {
                  '@type': 'Organization',
                  '@id': `${SITE_CONFIG.url}/#organization`,
                  name: BUSINESS_CONTACT.name,
                  url: SITE_CONFIG.url,
                  logo: `${SITE_CONFIG.url}/app-icon.webp`,
                  sameAs: [
                    'https://www.facebook.com/richardautomotive',
                    'https://www.instagram.com/richardautomotive',
                  ],
                  contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: BUSINESS_CONTACT.phone,
                    contactType: 'Sales',
                    areaServed: 'PR',
                    availableLanguage: ['Spanish', 'English'],
                  },
                },
                { ...siteSchema, '@id': `${SITE_CONFIG.url}/#website` },
                {
                  '@type': 'ItemList',
                  '@id': `${SITE_CONFIG.url}/#inventory`,
                  name: 'Inventario de Autos Nuevos y Usados Richard Automotive',
                  description:
                    'Selección exclusiva de vehículos nuevos y usados certificados con garantía de 24h.',
                  numberOfItems: (inventory || []).length,
                  itemListElement: (inventory || []).slice(0, 10).map((car, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    item: {
                      '@type': 'Product',
                      name: car.name || 'Vehículo Richard Automotive',
                      image: car.image || car.img || car.images?.[0] || '',
                      description: `${car.type || 'Auto'} nuevo o certificado por Richard Automotive.`,
                      brand: { '@type': 'Brand', name: (car.name || 'Auto').split(' ')[0] },
                      aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: '4.8',
                        reviewCount: '127',
                        bestRating: '5',
                      },
                      review: [
                        {
                          '@type': 'Review',
                          author: { '@type': 'Person', name: 'Cliente Richard Automotive' },
                          datePublished: '2026-05-15',
                          reviewBody: 'Excelente servicio y financiamiento rápido. Recomiendo totalmente.',
                          reviewRating: {
                            '@type': 'Rating',
                            ratingValue: '5',
                            bestRating: '5',
                          },
                        },
                      ],
                      offers: {
                        '@type': 'Offer',
                        price: car.price || 0,
                        priceCurrency: 'USD',
                        availability: 'https://schema.org/InStock',
                        url: `${SITE_CONFIG.url}/inventario/${generateVehicleSlug(car)}/${car.id}`,
                        hasMerchantReturnPolicy: {
                          '@type': 'MerchantReturnPolicy',
                          applicableCountry: 'PR',
                          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                          merchantReturnDays: 7,
                          returnMethod: 'https://schema.org/ReturnByMail',
                          returnFees: 'https://schema.org/FreeReturn',
                        },
                        shippingDetails: {
                          '@type': 'OfferShippingDetails',
                          shippingRate: {
                            '@type': 'MonetaryAmount',
                            value: 0,
                            currency: 'USD',
                          },
                          shippingDestination: {
                            '@type': 'DefinedRegion',
                            addressCountry: 'PR',
                          },
                          deliveryTime: {
                            '@type': 'ShippingDeliveryTime',
                            handlingTime: {
                              '@type': 'QuantitativeValue',
                              minValue: 1,
                              maxValue: 3,
                              unitCode: 'DAY',
                            },
                            transitTime: {
                              '@type': 'QuantitativeValue',
                              minValue: 1,
                              maxValue: 5,
                              unitCode: 'DAY',
                            },
                          },
                        },
                      },
                    },
                  })),
                },
              ];
            })(),
          }}
        />

        {/* Visually hidden H1 for search engine crawlers — matches SEO keyword strategy */}
        <h1 className="sr-only">
          Dealer de Autos Nuevos Ford y Usados Certificados en Puerto Rico — Richard Automotive
          Bayamón
        </h1>

        {/* Hero Section */}
        <HeroSection
          onNeuralMatch={() => actions.openNeuralMatch('hero')}
          onBrowseInventory={() => router.push('/inventario')}
          onSellCar={() => actions.openAppraisal('hero')}
        />

        {/* Main Content Container (Nivel 18: Adaptive Flow) */}
        <main className="relative z-20 mx-auto -mt-20 max-w-[1600px] space-y-20 px-6 pb-28 lg:px-12 lg:pb-16">
          <section aria-label="Autoridad y Respaldo" className="reveal-up">
            <AuthoritySection />
          </section>

          <GlassContainer intensity="medium" opacity={0.03} className="p-8 lg:p-12 reveal-up">
            <StorefrontMarketPulse
              avgPrice={state.marketPulse?.avgPrice || 0}
              premiumUnits={state.marketPulse?.premiumUnits || 0}
              compactUnits={state.marketPulse?.compactUnits || 0}
            />
          </GlassContainer>

          {/* Autos Destacados */}
          <section id="featured-inventory" className="scroll-mt-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white">Unidades Destacadas</h2>
                <p className="text-slate-400 mt-2">
                  Nuestra selección premium de vehículos recién llegados.
                </p>
              </div>
              <a
                href="/inventario"
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] rounded-full bg-cyan-500 text-black font-bold hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all whitespace-nowrap group"
              >
                Ver Inventario Completo
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
            </div>

            <StorefrontResultsGrid
              displayCars={(inventory || []).slice(0, 8)}
              isLoadingInitial={state.isLoadingInitial}
              isSearching={false}
              searchTerm=""
              visualContext={null}
              savedIdsCount={state.savedCars?.savedIds?.length || 0}
              status={state.status as 'pending' | 'success' | 'error'}
              error={state.error}
              hasNextPage={false}
              isFetchingNextPage={false}
              onClearFilters={() => {}}
              onMagicFix={onMagicFix}
              isFixing={state.isFixing}
              onOpenGarage={onOpenGarage}
              onSelectCar={actions.handleSelectCar}
              onCompare={actions.handleToggleCompare}
              isComparing={(id) => (state.compareList || []).some((c: Car) => c.id === id)}
              isSaved={(id) => state.savedCars?.isSaved?.(id) || false}
              onToggleSave={actions.handleToggleSave}
              onFetchNextPage={() => {}}
            />
          </section>

        </main>

        <footer aria-label="Pie de página social" className="reveal-up content-auto">
          <SocialFooter />
        </footer>
      </div>

      <StorefrontComparisonBar
        compareList={state.compareList}
        onClear={() => state.setCompareList([])}
        onStartComparison={() => state.setIsComparisonOpen(true)}
      />

      <StorefrontModals
        inventory={inventory}
        isNeuralMatchOpen={state.isNeuralMatchOpen}
        setIsNeuralMatchOpen={state.setIsNeuralMatchOpen}
        isComparisonOpen={state.isComparisonOpen}
        setIsComparisonOpen={state.setIsComparisonOpen}
        isVisualSearchOpen={state.isVisualSearchOpen}
        setIsVisualSearchOpen={state.setIsVisualSearchOpen}
        selectedCar={state.selectedCar}
        setSelectedCar={state.setSelectedCar}
        compareList={state.compareList}
        handleVisualAnalyze={actions.handleVisualAnalyze}
        isAnalyzing={state.isAnalyzing}
        visualError={state.visualError}
      />

      <SocialProofWidget />
    </>
  );
};

export default Storefront;
