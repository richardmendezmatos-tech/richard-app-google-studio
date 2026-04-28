'use client';

import React from 'react';
import { Car } from '@/shared/types/types';
import SEO from '@/shared/ui/seo/SEO';
import { SITE_CONFIG } from '@/shared/config/siteConfig';

// Extracted UI Components
import { StorefrontToolbar } from '@/features/inventory';
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

const InventoryPage: React.FC<Props> = ({ inventory, onMagicFix, onOpenGarage }) => {
  const { state, actions } = useStorefrontState(inventory, onOpenGarage, onMagicFix);

  return (
    <>
      <div className="h-full w-full bg-transparent">
        <SEO
          title="Inventario Completo | Richard Automotive"
          description="Explora el inventario completo de autos nuevos y usados certificados."
          url="/inventario"
          type="website"
        />

        <div className="mx-auto max-w-[1600px] space-y-12 px-6 pb-28 lg:px-12 lg:pb-16 pt-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Nuestro <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Inventario</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Encuentra el vehículo perfecto para ti. Usa nuestros filtros inteligentes o la búsqueda neural para explorar nuestra selección premium.
            </p>
          </div>

          {/* Search, Filters, Grid */}
          <section id="inventory-grid" aria-labelledby="inventory-heading">
            <StorefrontToolbar state={state} actions={actions} />

            <div className="mt-8">
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
            </div>
          </section>
        </div>
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
    </>
  );
};

export default InventoryPage;
