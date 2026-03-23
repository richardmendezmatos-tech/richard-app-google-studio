import React from 'react';
import { DatabaseZap, Loader2, Wrench, Heart, Sparkles } from 'lucide-react';
import { Car } from '@/entities/shared';
import VirtualInventory from '@/widgets/inventory/VirtualInventory';

interface StorefrontResultsGridProps {
  displayCars: Car[];
  isLoadingInitial: boolean;
  isSearching: boolean;
  searchTerm: string;
  visualContext: string | null;
  savedIdsCount: number;
  status: 'pending' | 'success' | 'error';
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onClearFilters: () => void;
  onMagicFix?: () => Promise<void>;
  isFixing: boolean;
  onOpenGarage?: () => void;
  onSelectCar: (car: Car) => void;
  onCompare: (e: React.MouseEvent, car: Car) => void;
  isComparing: (id: string) => boolean;
  isSaved: (id: string) => boolean;
  onToggleSave: (e: React.MouseEvent, id: string) => void;
  onFetchNextPage: () => void;
}

const StorefrontResultsGrid: React.FC<StorefrontResultsGridProps> = ({
  displayCars,
  isLoadingInitial,
  isSearching,
  searchTerm,
  visualContext,
  savedIdsCount,
  status,
  error,
  hasNextPage,
  isFetchingNextPage,
  onClearFilters,
  onMagicFix,
  isFixing,
  onOpenGarage,
  onSelectCar,
  onCompare,
  isComparing,
  isSaved,
  onToggleSave,
  onFetchNextPage,
}) => {
  return (
    <section id="inventory-grid" aria-labelledby="inventory-heading" className="scroll-mt-32">
      {/* Inventory Grid */}
      <div className="pb-10 space-y-8">
        {isLoadingInitial ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[400px] animate-pulse rounded-[40px] border border-primary/15 bg-slate-900/40 backdrop-blur-xl"
              />
            ))}
          </div>
        ) : displayCars.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-[40px] border-2 border-dashed border-primary/20 bg-slate-900/60 backdrop-blur-xl py-20 text-center animate-in fade-in">
            {isSearching ? (
              <>
                <p className="font-cinematic text-4xl tracking-[0.06em] text-slate-100">
                  Sin Resultados
                </p>
                <p className="mt-2 max-w-md text-sm text-slate-400">
                  Prueba cambiar el tipo, limpiar la búsqueda visual o explorar todos los segmentos.
                </p>
                <button
                  onClick={onClearFilters}
                  className="mt-5 rounded-full border border-primary/30 px-6 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary-200 transition-colors hover:bg-primary/10"
                >
                  Limpiar Filtros
                </button>
              </>
            ) : (
              <>
                <DatabaseZap size={48} className="text-slate-400 mb-4" />
                <h3 className="text-2xl font-black text-slate-700 dark:text-white uppercase tracking-tight">
                  Base de datos vacía
                </h3>
                <p className="text-slate-500 mt-2 max-w-md">No hay autos visibles.</p>
                {onMagicFix ? (
                  <button
                    onClick={onMagicFix}
                    disabled={isFixing}
                    className="mt-6 px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-black uppercase tracking-widest shadow-xl shadow-rose-600/30 active:scale-95 transition-all flex items-center gap-3 animate-bounce"
                  >
                    {isFixing ? (
                      <>
                        <Loader2 className="animate-spin" /> Reparando...
                      </>
                    ) : (
                      <>
                        <Wrench size={20} /> 🚨 Reparación Automática
                      </>
                    )}
                  </button>
                ) : (
                  <div className="mt-6 flex flex-col items-center gap-4">
                    <p className="text-slate-400 mb-2 max-w-sm text-center text-sm">Nuestros asesores VIP pueden encontrar el modelo exacto que buscas en nuestra red extendida.</p>
                    <a href="https://wa.me/17871234567" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,174,217,0.3)] transition-all flex items-center gap-3">
                      Contactar Asesor VIP
                    </a>
                  </div>
                )}
                {/* Debugging / Error Message */}
                {(status === 'error' || displayCars.length === 0) && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-left max-w-lg overflow-auto">
                    {status === 'error' && (
                      <div className="text-red-500 mb-2">
                        <p className="font-bold">Error de Carga:</p>
                        {error instanceof Error ? error.message : String(error)}
                        {String(error).includes('requires an index') && (
                          <p className="mt-2 text-xs">
                            💡 Tip: Falta un índice en Firebase. Revisa la consola o despliega los
                            índices.
                          </p>
                        )}
                      </div>
                    )}
                    <div className="text-slate-500">
                      <p>
                        <strong>Debug Info:</strong>
                      </p>
                      <p>Filter: {status === 'success' ? 'all' : 'N/A'}</p>
                      <p>
                        Dealer ID used:{' '}
                        {(() => {
                          const raw =
                            typeof window !== 'undefined'
                              ? localStorage.getItem('current_dealer_id')
                              : null;
                          if (!raw || raw === 'undefined' || raw === 'null')
                            return 'richard-automotive (Default)';
                          return raw;
                        })()}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            <VirtualInventory
              cars={displayCars as Car[]}
              onSelectCar={onSelectCar}
              onCompare={onCompare}
              isComparing={isComparing}
              isSaved={isSaved}
              onToggleSave={onToggleSave}
            />

            {/* Load More Button */}
            {!isSearching && hasNextPage && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={onFetchNextPage}
                  disabled={isFetchingNextPage}
                  className="group flex items-center gap-2 rounded-full border border-primary/20 bg-slate-900/80 px-8 py-4 font-bold text-primary-100 shadow-lg shadow-black/30 transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white active:scale-95"
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Loader2 className="group-hover:translate-y-1 transition-transform" />
                  )}
                  {isFetchingNextPage ? 'Cargando más...' : 'Cargar Más Vehículos'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default StorefrontResultsGrid;
