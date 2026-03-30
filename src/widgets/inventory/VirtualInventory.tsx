import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Car } from '@/entities/shared';
import PremiumGlassCard from '@/widgets/inventory/PremiumGlassCard';

interface VirtualInventoryProps {
  cars: Car[];
  onSelectCar: (car: Car) => void;
  onCompare: (e: React.MouseEvent, car: Car) => void;
  isComparing: (id: string) => boolean;
  isSaved: (id: string) => boolean;
  onToggleSave: (e: React.MouseEvent, id: string) => void;
  customerMemory?: any;
}

const VirtualInventory: React.FC<VirtualInventoryProps> = ({
  cars,
  onSelectCar,
  onCompare,
  isComparing,
  isSaved,
  onToggleSave,
  customerMemory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });

  // Grid configuration
  const itemHeight = 450; // Estimated height of PremiumGlassCard + gap
  const columns =
    typeof window !== 'undefined' && window.innerWidth >= 1280
      ? 3
      : window.innerWidth >= 768
        ? 2
        : 1;
  const rowCount = Math.ceil(cars.length / columns);
  const totalHeight = rowCount * itemHeight;

  useEffect(() => {
    const updateVisibleRange = () => {
      if (!containerRef.current) return;

      const gridTop = containerRef.current.getBoundingClientRect().top;
      const viewportHeight = window.innerHeight;
      const offset = Math.max(0, -gridTop);

      const startRow = Math.floor(offset / itemHeight);
      const visibleRows = Math.ceil(viewportHeight / itemHeight) + 1;
      const endRow = Math.min(rowCount, startRow + visibleRows + 1);

      setVisibleRange({
        start: Math.max(0, startRow * columns),
        end: Math.min(cars.length, endRow * columns),
      });
    };

    window.addEventListener('scroll', updateVisibleRange);
    window.addEventListener('resize', updateVisibleRange);

    updateVisibleRange();

    return () => {
      window.removeEventListener('scroll', updateVisibleRange);
      window.removeEventListener('resize', updateVisibleRange);
    };
  }, [cars.length, columns, rowCount]);

  const visibleCars = useMemo(() => {
    return cars.slice(visibleRange.start, visibleRange.end);
  }, [cars, visibleRange]);

  /**
   * Recommendation Engine (Phase 17)
   * Checks if a car matches the customer's persisted preferences.
   */
  const checkRecommendation = (car: Car): boolean => {
    if (!customerMemory?.preferences) return false;

    const { models, colors, features } = customerMemory.preferences;

    // 1. Model Match
    if (models?.some((m: string) => car.name.toLowerCase().includes(m.toLowerCase()))) return true;

    // 2. Color Match
    if (colors?.some((c: string) => car.name.toLowerCase().includes(c.toLowerCase()))) return true;

    // 3. Feature Match
    if (features?.some((f: string) => car.name.toLowerCase().includes(f.toLowerCase())))
      return true;

    // 4. Lifestyle Match
    const lifestyle = customerMemory.lifestyle?.toLowerCase() || '';
    if (lifestyle.includes('off-road') && car.name.toLowerCase().includes('4x4')) return true;
    if (
      lifestyle.includes('family') &&
      (car.type === 'suv' || car.name.toLowerCase().includes('tucson'))
    )
      return true;

    return false;
  };

  const translateY = Math.floor(visibleRange.start / columns) * itemHeight;

  // Style management via CSS variables to avoid direct DOM manipulation and hardcoded inline styles
  const containerStyle = {
    '--total-height': totalHeight > 0 ? `${totalHeight}px` : 'auto',
  } as React.CSSProperties;

  const gridStyle = {
    '--offset-y': `${translateY}px`,
  } as React.CSSProperties;

  return (
    <div ref={containerRef} className="relative inventory-scroll-container" style={containerStyle}>
      <div
        ref={gridRef}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 absolute top-0 left-0 right-0 inventory-visible-window"
        style={gridStyle}
      >
        {visibleCars.map((car, index) => (
          <article
            key={car.id}
            style={{ '--d': `${Math.min(index * 55, 300)}ms` } as React.CSSProperties}
            className="h-[450px] route-fade-in reveal-up delay-var"
            aria-labelledby={`car-title-${car.id}`}
          >
            <PremiumGlassCard
              car={car}
              onSelect={() => onSelectCar(car)}
              onCompare={(e) => onCompare(e, car)}
              isComparing={isComparing(car.id)}
              isSaved={isSaved(car.id)}
              onToggleSave={(e) => onToggleSave(e, car.id)}
              isRecommended={checkRecommendation(car)}
              priority={index < 2}
            />
          </article>
        ))}
      </div>
      {cars.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Placeholder handled by parent */}
        </div>
      )}
    </div>
  );
};

export default VirtualInventory;
