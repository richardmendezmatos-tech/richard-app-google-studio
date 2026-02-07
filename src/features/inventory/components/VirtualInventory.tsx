import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Car } from '@/types/types';
import PremiumGlassCard from './storefront/PremiumGlassCard';

interface VirtualInventoryProps {
    cars: Car[];
    onSelectCar: (car: Car) => void;
    onCompare: (e: React.MouseEvent, car: Car) => void;
    isComparing: (carId: string) => boolean;
    isSaved: (carId: string) => boolean;
    onToggleSave: (e: React.MouseEvent, carId: string) => void;
}

const VirtualInventory: React.FC<VirtualInventoryProps> = ({
    cars,
    onSelectCar,
    onCompare,
    isComparing,
    isSaved,
    onToggleSave
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });

    // Grid configuration
    const itemHeight = 450; // Estimated height of PremiumGlassCard + gap
    const columns = typeof window !== 'undefined' && window.innerWidth >= 1280 ? 3 : window.innerWidth >= 768 ? 2 : 1;
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
                end: Math.min(cars.length, endRow * columns)
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

    const translateY = Math.floor(visibleRange.start / columns) * itemHeight;

    return (
        <div
            ref={containerRef}
            className="relative"
            style={{ height: totalHeight > 0 ? totalHeight : 'auto' }}
        >
            <div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                style={{
                    transform: `translateY(${translateY}px)`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0
                }}
            >
                {visibleCars.map((car) => (
                    <div key={car.id} style={{ height: itemHeight }}>
                        <PremiumGlassCard
                            car={car}
                            onSelect={() => onSelectCar(car)}
                            onCompare={(e) => onCompare(e, car)}
                            isComparing={isComparing(car.id)}
                            isSaved={isSaved(car.id)}
                            onToggleSave={(e) => onToggleSave(e, car.id)}
                        />
                    </div>
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
