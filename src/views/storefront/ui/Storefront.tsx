'use client';

import React from 'react';
import { Car } from '@/shared/types/types';
import { SocialProofWidget } from '@/widgets/brand-ui/layout/conversion/SocialProofWidget';
import SEO from '@/shared/ui/seo/SEO';
import { SITE_CONFIG } from '@/shared/config/siteConfig';

import dynamic from 'next/dynamic';
import HeroSection from '@/features/inventory/ui/storefront/HeroSection';

const TrustBar = dynamic(() => import('@/features/inventory/ui/storefront/TrustBar'), { ssr: false });
const TestimonialsSection = dynamic(() => import('@/features/inventory/ui/storefront/TestimonialsSection'), { ssr: false });
const FAQSection = dynamic(() => import('@/shared/ui/components/FAQSection'), { ssr: false });
const SocialFooter = dynamic(() => import('@/features/inventory/ui/storefront/SocialFooter'), { ssr: false });
const AuthoritySection = dynamic(() => import('@/features/marketing').then(mod => ({ default: mod.AuthoritySection })), { ssr: false });

import { GlassContainer } from '@/shared/ui/containers/GlassContainer';

// Extracted UI Components
import { StorefrontToolbar } from '@/features/inventory';
import StorefrontMarketPulse from '@/features/inventory/ui/StorefrontMarketPulse';
import StorefrontResultsGrid from '@/widgets/inventory/StorefrontResultsGrid';
import StorefrontComparisonBar from '@/widgets/comparison/StorefrontComparisonBar';
import StorefrontModals from '@/features/inventory/ui/StorefrontModals';

// Custom Hook
import { useStorefrontState } from '@/features/inventory';

interface Props {
  inventory: Car[];
  initialVisualSearch?: string | null;
  onClearVisualSearch?: () => void;
  onMagicFix?: () => Promise<void>;
  onOpenGarage?: () => void;
  customTitle?: string;
  customDescription?: string;
}

const Storefront: React.FC<Props> = ({ inventory, onMagicFix, onOpenGarage, customTitle, customDescription }) => {
  const { state, actions } = useStorefrontState(inventory, onOpenGarage, onMagicFix);

  return (
    <>
      <div className="h-full w-full bg-transparent">
        <SEO
          title={customTitle || "Autos, Guaguas y Pickups de Lujo en Puerto Rico | Richard Automotive"}
          description={customDescription || "Compra autos, guaguas y pickups de lujo en Bayamón, Puerto Rico. El inventario más exclusivo: SUVs, Sedanes y Trucks con financiamiento expreso en 24h. Trade-in justo y entrega inmediata."}
          url="/"
          type="website"
          schema={{
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'AutoDealer',
                name: 'Richard Automotive',
                image: SITE_CONFIG.seo.ogImage,
                '@id': `${SITE_CONFIG.url}/#dealer`,
                url: SITE_CONFIG.url,
                telephone: '+1-787-368-2880',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: 'Bayamón',
                  addressLocality: 'Bayamón',
                  addressRegion: 'PR',
                  postalCode: '00961',
                  addressCountry: 'US',
                },
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: 18.399,
                  longitude: -66.1573,
                },
                openingHoursSpecification: {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                  opens: '09:00',
                  closes: '18:00',
                },
                priceRange: '$$',
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '5.0',
                  reviewCount: '124',
                },
              },
              {
                '@type': 'ItemList',
                '@id': `${SITE_CONFIG.url}/#inventory`,
                name: 'Inventario de Lujo Richard Automotive',
                description: 'Selección exclusiva de vehículos certificados con garantía de 24h.',
                numberOfItems: inventory.length,
                itemListElement: inventory.slice(0, 10).map((car, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  item: {
                    '@type': 'Product',
                    name: car.name,
                    image: car.img,
                    description: `${car.type} de lujo certificado por Richard Automotive.`,
                    brand: { '@type': 'Brand', name: car.name.split(' ')[0] },
                    offers: {
                      '@type': 'Offer',
                      price: car.price,
                      priceCurrency: 'USD',
                      availability: 'https://schema.org/InStock',
                      url: `${SITE_CONFIG.url}/v/${car.id}`,
                    },
                  },
                })),
              },
            ],
          }}
        />

        {/* Visually hidden H1 for search engine crawlers — matches SEO keyword strategy */}
        <h1 className="sr-only">
          Autos Nuevos y Usados de Lujo en Puerto Rico — Richard Automotive Bayamón
        </h1>

        {/* Hero Section */}
        <HeroSection
          onNeuralMatch={() => actions.openNeuralMatch('hero')}
          onBrowseInventory={() => actions.jumpToInventory('hero')}
          onSellCar={() => actions.openAppraisal('hero')}
        />

        {/* Main Content Container (Nivel 18: Adaptive Flow) */}
        <main className="relative z-20 mx-auto -mt-20 max-w-[1600px] space-y-20 px-6 pb-28 lg:px-12 lg:pb-16">
          <section aria-label="Autoridad y Respaldo" className="reveal-up">
            <AuthoritySection />
          </section>

          <GlassContainer 
            intensity="medium"
            opacity={0.03}
            className="p-8 lg:p-12 reveal-up"
          >
            <StorefrontMarketPulse
              avgPrice={state.marketPulse.avgPrice}
              premiumUnits={state.marketPulse.premiumUnits}
              compactUnits={state.marketPulse.compactUnits}
            />
          </GlassContainer>

          {/* Search, Filters, Grid */}
          <section id="inventory-grid" aria-labelledby="inventory-heading" className="scroll-mt-32">
            <StorefrontToolbar state={state} actions={actions} />

            <StorefrontResultsGrid
              displayCars={state.displayCars as Car[]}
              isLoadingInitial={state.isLoadingInitial}
              isSearching={state.isSearching}
              searchTerm={state.searchTerm}
              visualContext={state.visualContext}
              savedIdsCount={state.savedCars.savedIds.length}
              status={state.status as 'pending' | 'success' | 'error'}
              error={state.error}
              hasNextPage={state.hasNextPage}
              isFetchingNextPage={state.isFetchingNextPage}
              onClearFilters={() => {
                state.setVisualContext(null);
                state.setSearchTerm('');
                state.setFilter('all');
                state.setSemanticResultIds([]);
              }}
              onMagicFix={onMagicFix}
              isFixing={state.isFixing}
              onOpenGarage={onOpenGarage}
              onSelectCar={actions.handleSelectCar}
              onCompare={actions.handleToggleCompare}
              isComparing={(id) => state.compareList.some((c: Car) => c.id === id)}
              isSaved={(id) => state.savedCars.isSaved(id)}
              onToggleSave={actions.handleToggleSave}
              onFetchNextPage={actions.fetchNextPage}
            />
          </section>

          <section
            aria-label="Nuestra Confianza"
            className="reveal-up"
          >
            <GlassContainer intensity="high" opacity={0.05} className="p-10 lg:p-16">
              <TrustBar />
            </GlassContainer>
          </section>
        </main>

        <section aria-label="Preguntas Frecuentes" className="reveal-up content-auto">
          <FAQSection />
        </section>

        <section aria-label="Testimonios" className="reveal-up content-auto">
          <TestimonialsSection />
        </section>

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
