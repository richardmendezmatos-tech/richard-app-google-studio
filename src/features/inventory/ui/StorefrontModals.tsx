import React, { Suspense } from 'react';
import { Car } from '@/domain/entities';
import NeuralMatchModal from './NeuralMatchModal';
import ComparisonModal from './ComparisonModal';
import CarDetailModal from './CarDetailModal';

const VisualSearchModal = React.lazy(() => import('./VisualSearchModal'));

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
      {isNeuralMatchOpen && (
        <NeuralMatchModal
          inventory={inventory}
          onClose={() => setIsNeuralMatchOpen(false)}
          onSelectCar={(car) => {
            setSelectedCar(car);
            setIsNeuralMatchOpen(false);
          }}
        />
      )}

      {isComparisonOpen && (
        <ComparisonModal cars={compareList} onClose={() => setIsComparisonOpen(false)} />
      )}

      {isVisualSearchOpen && (
        <Suspense fallback={null}>
          <VisualSearchModal
            isOpen={isVisualSearchOpen}
            onClose={() => setIsVisualSearchOpen(false)}
            onAnalyze={handleVisualAnalyze}
            isAnalyzing={isAnalyzing}
            error={visualError}
          />
        </Suspense>
      )}

      {selectedCar && <CarDetailModal car={selectedCar} onClose={() => setSelectedCar(null)} />}
    </>
  );
};

export default StorefrontModals;
