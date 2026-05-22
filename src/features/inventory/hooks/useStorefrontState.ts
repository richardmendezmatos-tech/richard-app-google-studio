import { useState, useContext, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from '@/shared/lib/next-route-adapter';
import { Car, CarType } from '@/shared/types/types';
import { useVisualSearch } from './useVisualSearch';
import { useCars } from './useCars';
import { useSavedCars } from './useSavedCars';
import { useInventoryAnalytics } from './useInventoryAnalytics';
import { useAuthStore } from '@/entities/session';
import { useTrajectoryStore } from '@/entities/session/model/useTrajectoryStore';
import { TrajectoryAnalyzer } from '@/features/predictive/model/TrajectoryAnalyzer';


export function useStorefrontState(
  inventory: Car[],
  onOpenGarage?: () => void,
  onMagicFix?: () => Promise<void>,
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<CarType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'year' | 'mileage' | 'created_at'>('price');
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
  const [mileageFilter, setMileageFilter] = useState<number | 'all'>('all');
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
      const redirectPath = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${redirectPath}`);
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
    searchTerm || undefined,
    sortBy,
  );

  const serverCars = data?.pages.flatMap((page) => page.cars) || [];
  const hasClientFilters = yearFilter !== 'all' || mileageFilter !== 'all' || !!visualContext;
  const isSearching = hasClientFilters;

  // Nivel 13: Neuro-Adaptive Intelligence
  const trajectoryEvents = useTrajectoryStore((s) => s.events);
  const dwellTimes = useTrajectoryStore((s) => s.dwellTimes);

  const preferredCategory = useMemo(
    () => TrajectoryAnalyzer.getPreferredCategory(trajectoryEvents),
    [trajectoryEvents],
  );

  const filteredAndSorted = useMemo(() => {
    const source = hasClientFilters ? serverCars : inventory;

    return [...(source || [])]
      .filter((c) => {
        if (semanticResultIds.length > 0) {
          if (semanticResultIds.includes('NO_MATCHES')) return false;
          return semanticResultIds.includes(c.id);
        }

        if (visualContext) {
          const type = (c.type || '').toLowerCase();
          const ctx = visualContext.toLowerCase();
          if (!type.includes(ctx.split(' ')[0] || '')) return false;
        }

        const yearValue = c.year || (c.name ? parseInt(c.name.split(' ')[0]) : 0);
        if (yearFilter !== 'all' && yearValue !== yearFilter) return false;

        if (mileageFilter !== 'all') {
          const threshold = mileageFilter as number;
          if ((c.mileage || 0) > threshold) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (preferredCategory) {
          const aMatch = a.type?.toLowerCase() === preferredCategory;
          const bMatch = b.type?.toLowerCase() === preferredCategory;
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
        }

        if (sortOrder === 'asc') return a.price - b.price;
        if (sortOrder === 'desc') return b.price - a.price;
        return 0;
      });
  }, [
    visualContext,
    semanticResultIds,
    sortOrder,
    serverCars,
    inventory,
    preferredCategory,
    yearFilter,
    mileageFilter,
    hasClientFilters,
  ]);

  const displayCars = hasClientFilters || preferredCategory ? filteredAndSorted : serverCars;

  // Sentinel N24: Search Gap Intelligence
  // Captura automáticamente búsquedas visuales que no arrojan resultados para el análisis de Houston.
  useEffect(() => {
    if (hasClientFilters && displayCars.length === 0 && visualContext) {
      const timer = setTimeout(async () => {
        const { logSearchGap: lg } = await import('@/shared/api/supabase/supabaseClient');
        await lg(searchTerm, filter !== 'all' ? `Filter: ${filter}` : 'Visual/Text Gap');
        console.log(`[Sentinel] Search Gap logged: ${searchTerm}`);
      }, 5000); // Debounce extendido para precisión
      return () => clearTimeout(timer);
    }
  }, [isSearching, displayCars.length, searchTerm, filter]);

  const marketPulse = useMemo(() => {
    const source = (displayCars || []).length > 0 ? displayCars : serverCars || [];
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

  const isLoadingInitial = !hasClientFilters && status === 'pending';

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
    // Sentinel Performance: Delay para asegurar que el navegador procese el focus/clic antes del scroll suave
    setTimeout(() => {
      document.getElementById('inventory-grid')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
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
      sortBy,
      setSortBy,
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
      yearFilter,
      setYearFilter,
      mileageFilter,
      setMileageFilter,
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
