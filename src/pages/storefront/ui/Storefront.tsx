import React from 'react';
import { Car } from '@/shared/types/types';
import { SocialProofWidget } from '@/widgets/brand-ui/layout/conversion/SocialProofWidget';
import SEO from '@/shared/ui/seo/SEO';
import { SITE_CONFIG } from '@/shared/config/siteConfig';

// Import Modular Components
import HeroSection from '@/features/inventory/ui/storefront/HeroSection';
import TrustBar from '@/features/inventory/ui/storefront/TrustBar';
import TestimonialsSection from '@/features/inventory/ui/storefront/TestimonialsSection';
import FAQSection from '@/shared/ui/components/FAQSection';
import SocialFooter from '@/features/inventory/ui/storefront/SocialFooter';
import { AuthoritySection } from '@/features/marketing';

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
}

const Storefront: React.FC<Props> = ({ inventory, onMagicFix, onOpenGarage }) => {
  const { state, actions } = useStorefrontState(inventory, onOpenGarage, onMagicFix);

  return (
    <>
      <div className="h-full w-full bg-transparent">
        <SEO
          title="Autos Nuevos y Usados de Lujo en Puerto Rico | Richard Automotive"
          description="Compra autos nuevos y usados de lujo en Bayamón, Puerto Rico. Financiamiento expreso en 24h, trade-in a precio justo y entrega inmediata. El dealer más tecnológico de PR con IA para encontrar tu auto ideal."
          url="/"
          type="website"
          schema={{
            "@context": "https://schema.org",
            "@type": "AutoDealer",
            "name": "Richard Automotive",
            "image": SITE_CONFIG.seo.ogImage,
            "@id": SITE_CONFIG.url,
            "url": SITE_CONFIG.url,
            "telephone": "+1-787-368-2880",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Bayamón",
              "addressLocality": "Bayamón",
              "addressRegion": "PR",
              "postalCode": "00961",
              "addressCountry": "US"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 18.3990,
              "longitude": -66.1573
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              "opens": "09:00",
              "closes": "18:00"
            },
            "priceRange": "$$",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5.0",
              "reviewCount": "3"
            },
            "review": [
              {
                "@type": "Review",
                "author": { "@type": "Person", "name": "Carlos Rodríguez" },
                "reviewRating": { "@type": "Rating", "ratingValue": "5" },
                "reviewBody": "La experiencia con Richard Automotive fue increíble. La IA me ayudó a elegir la SUV perfecta."
              },
              {
                "@type": "Review",
                "author": { "@type": "Person", "name": "Sofía Méndez" },
                "reviewRating": { "@type": "Rating", "ratingValue": "5" },
                "reviewBody": "Nunca pensé que comprar un auto eléctrico fuera tan fácil. El Neural Match acertó totalmente."
              }
            ]
          }}
        />

        {/* Visually hidden H1 for search engine crawlers — matches SEO keyword strategy */}
        <h1 className="sr-only">Autos Nuevos y Usados de Lujo en Puerto Rico — Richard Automotive Bayamón</h1>

        {/* Hero Section */}
        <HeroSection
          onNeuralMatch={() => actions.openNeuralMatch('hero')}
          onBrowseInventory={() => actions.jumpToInventory('hero')}
          onSellCar={() => actions.openAppraisal('hero')}
        />

        {/* Main Content Container */}
        <main className="relative z-20 mx-auto -mt-14 max-w-[1600px] space-y-14 px-5 pb-28 lg:px-12 lg:pb-10">
          <section aria-label="Autoridad y Respaldo">
            <AuthoritySection />
          </section>

          <StorefrontMarketPulse
            avgPrice={state.marketPulse.avgPrice}
            premiumUnits={state.marketPulse.premiumUnits}
            compactUnits={state.marketPulse.compactUnits}
          />

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
            className="reveal-up rounded-[34px] border border-cyan-200/20 bg-[linear-gradient(150deg,rgba(11,26,39,0.9),rgba(7,15,24,0.85))] p-4 shadow-[0_28px_70px_-42px_rgba(0,0,0,0.9)] md:p-8"
          >
            <TrustBar />
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
