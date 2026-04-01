import { useState, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from '@/shared/lib/next-route-adapter';
import { Car, CarType } from '@/shared/types/types';
import { useVisualSearch } from './useVisualSearch';
import { useCars } from './useCars';
import { useSavedCars } from './useSavedCars';
import { useInventoryAnalytics } from './useInventoryAnalytics';
import { useAuthStore } from '@/entities/session';

export function useStorefrontState(
  inventory: Car[],
  onOpenGarage?: () => void,
  onMagicFix?: () => Promise<void>,
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<CarType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isNeuralMatchOpen, setIsNeuralMatchOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [visualContext, setVisualContext] = useState<string | null>(null);
  const [semanticResultIds, setSemanticResultIds] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<Car[]>([]);

  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  const analytics = useInventoryAnalytics();
  const savedCars = useSavedCars();

  const handleToggleSave = (e: React.MouseEvent, carId: string) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    savedCars.toggleSave(carId);
  };

  const { isAnalyzing, error: visualError, analyze } = useVisualSearch(inventory);

  const handleVisualAnalyze = async (file: File) => {
    const result = await analyze(file);
    if (result && result.analysis) {
      setSearchTerm(result.analysis.brand || '');
      setVisualContext(
        result.analysis.type
          ? `Tipo: ${result.analysis.type.toUpperCase()}`
          : 'Resultados Visuales',
      );

      if (result.matches.length > 0) {
        setSemanticResultIds(result.matches.map((c: Car) => c.id));
      } else {
        setSemanticResultIds(['NO_MATCHES']);
      }

      setIsVisualSearchOpen(false);
      return result;
    }
    return null;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } = useCars(
    9,
    filter,
    sortOrder,
  );

  const serverCars = data?.pages.flatMap((page) => page.cars) || [];
  const isSearching = !!searchTerm || !!visualContext;

  const filteredAndSorted = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const isGuagua = normalizedSearch === 'guagua';
    const isPickup = normalizedSearch === 'pickup' || normalizedSearch === 'pick-up';

    return inventory
      .filter((c) => {
        if (semanticResultIds.length > 0) {
          return semanticResultIds.includes(c.id);
        }

        const type = (c.type || '').toLowerCase();
        const name = (c.name || '').toLowerCase();

        // Local Semantic Logic
        if (isGuagua) return type === 'suv' || type === 'truck';
        if (isPickup) return type === 'truck';

        const matchesSearch = visualContext
          ? name.includes(normalizedSearch) ||
            (visualContext || '').toLowerCase().includes(type) ||
            type.includes(visualContext.split(' ')[0] || '')
          : name.includes(normalizedSearch) || type.includes(normalizedSearch);

        const matchesType = filter === 'all' || type === filter;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortOrder === 'asc') return a.price - b.price;
        if (sortOrder === 'desc') return b.price - a.price;
        return 0;
      });
  }, [searchTerm, visualContext, semanticResultIds, filter, sortOrder, inventory]);

  const displayCars = isSearching ? filteredAndSorted : serverCars;

  const marketPulse = useMemo(() => {
    const source = displayCars.length > 0 ? displayCars : inventory;
    if (!source.length) {
      return { avgPrice: 0, premiumUnits: 0, compactUnits: 0 };
    }

    const totalPrice = source.reduce((acc, car) => acc + (car.price || 0), 0);
    return {
      avgPrice: Math.round(totalPrice / source.length),
      premiumUnits: source.filter((car) => car.price >= 40000).length,
      compactUnits: source.filter((car) => car.price < 25000).length,
    };
  }, [displayCars, inventory]);

  const isLoadingInitial = !isSearching && status === 'pending';

  const handleToggleCompare = (e: React.MouseEvent, car: Car) => {
    e.stopPropagation();
    setCompareList((prev: Car[]) => {
      const isSelected = prev.some((c: Car) => c.id === car.id);
      if (isSelected) {
        return prev.filter((c: Car) => c.id !== car.id);
      }

      if (prev.length >= 2) {
        alert('Modo VS: Máximo 2 unidades para comparar.');
        return prev;
      }
      return [...prev, car];
    });
  };

  const [isFixing, setIsFixing] = useState(false);

  const handleMagicClick = async () => {
    if (!onMagicFix) return;
    setIsFixing(true);
    await onMagicFix();
    setIsFixing(false);
  };

  const openNeuralMatch = (source: string) => {
    analytics.trackInteraction('open_neural_match', { source, route: location.pathname });
    setIsNeuralMatchOpen(true);
  };

  const openVisualSearch = (source: string) => {
    analytics.trackInteraction('open_visual_search', { source, route: location.pathname });
    setIsVisualSearchOpen(true);
  };

  const openAppraisal = (source: string) => {
    analytics.trackInteraction('open_appraisal', { source, route: location.pathname });
    navigate('/appraisal');
  };

  const jumpToInventory = (source: string) => {
    analytics.trackInteraction('jump_inventory', { source, route: location.pathname });
    document.getElementById('inventory-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectCar = (car: Car) => {
    setSelectedCar(car);
    analytics.trackCarView(car.id);
  };

  return {
    state: {
      searchTerm,
      setSearchTerm,
      filter,
      setFilter,
      sortOrder,
      setSortOrder,
      selectedCar,
      setSelectedCar,
      isVisualSearchOpen,
      setIsVisualSearchOpen,
      isNeuralMatchOpen,
      setIsNeuralMatchOpen,
      isComparisonOpen,
      setIsComparisonOpen,
      visualContext,
      setVisualContext,
      semanticResultIds,
      setSemanticResultIds,
      compareList,
      setCompareList,
      isFixing,
      isLoadingInitial,
      isSearching,
      displayCars,
      marketPulse,
      savedCars,
      isAnalyzing,
      visualError,
      status,
      error,
      hasNextPage,
      isFetchingNextPage,
    },
    actions: {
      handleToggleSave,
      handleVisualAnalyze,
      handleToggleCompare,
      handleMagicClick,
      openNeuralMatch,
      openVisualSearch,
      openAppraisal,
      jumpToInventory,
      fetchNextPage,
      handleSelectCar,
      onOpenGarage,
    },
  };
}
