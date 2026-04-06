import React, { Suspense } from 'react';
import { Car } from '@/entities/inventory';
import NeuralMatchModal from './NeuralMatchModal';
import ComparisonModal from './ComparisonModal';
import telemetry from '@/shared/api/metrics/analytics';
import { AnimatePresence } from 'motion/react';
import { Portal } from '@/shared/ui/common/Portal';

// Sentinel Performance: Lazy loading of heavy modals to optimize main thread
const VisualSearchModal = React.lazy(() => import('./VisualSearchModal'));
const CarDetailModal = React.lazy(() => import('./CarDetailModal'));

interface StorefrontModalsProps {
  inventory: Car[];
  isNeuralMatchOpen: boolean;
  setIsNeuralMatchOpen: (o: boolean) => void;
  isComparisonOpen: boolean;
  setIsComparisonOpen: (o: boolean) => void;
  isVisualSearchOpen: boolean;
  setIsVisualSearchOpen: (o: boolean) => void;
  selectedCar: Car | null;
  setSelectedCar: (c: Car | null) => void;
  compareList: Car[];
  handleVisualAnalyze: (file: File) => Promise<any>;
  isAnalyzing: boolean;
  visualError: any;
}

const StorefrontModals: React.FC<StorefrontModalsProps> = ({
  inventory,
  isNeuralMatchOpen,
  setIsNeuralMatchOpen,
  isComparisonOpen,
  setIsComparisonOpen,
  isVisualSearchOpen,
  setIsVisualSearchOpen,
  selectedCar,
  setSelectedCar,
  compareList,
  handleVisualAnalyze,
  isAnalyzing,
  visualError,
}) => {
  return (
    <>
      <AnimatePresence>
        {isNeuralMatchOpen && (
          <Portal>
            <NeuralMatchModal
              inventory={inventory}
              onClose={() => setIsNeuralMatchOpen(false)}
              onSelectCar={(car) => {
                setSelectedCar(car);
                setIsNeuralMatchOpen(false);
                if (telemetry && typeof telemetry.add === 'function') {
                  telemetry.add({
                    event: 'neural_match_select',
                    carId: car.id,
                  });
                }
              }}
            />
          </Portal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isComparisonOpen && (
          <Portal>
            <ComparisonModal cars={compareList} onClose={() => setIsComparisonOpen(false)} />
          </Portal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVisualSearchOpen && (
          <Portal>
            <Suspense fallback={null}>
              <VisualSearchModal
                isOpen={isVisualSearchOpen}
                onClose={() => setIsVisualSearchOpen(false)}
                onAnalyze={handleVisualAnalyze}
                isAnalyzing={isAnalyzing}
                error={visualError}
              />
            </Suspense>
          </Portal>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {selectedCar && (
          <Portal>
            <Suspense fallback={
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                        <span className="font-tech text-[10px] uppercase tracking-widest text-cyan-400">
                            Cargando Unidad...
                        </span>
                    </div>
                </div>
            }>
                <CarDetailModal car={selectedCar} onClose={() => setSelectedCar(null)} />
            </Suspense>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
};

export default StorefrontModals;
