"use client";

import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { Car } from '@/entities/inventory';
import PremiumGlassCard from '@/widgets/inventory/PremiumGlassCard';
import { motion, AnimatePresence } from 'motion/react';

import { useTrajectoryStore } from '@/entities/session/model/useTrajectoryStore';
import { TrajectoryAnalyzer } from '@/features/predictive/model/TrajectoryAnalyzer';

interface VirtualInventoryProps {
  cars: Car[];
  onSelectCar: (car: Car) => void;
  onCompare: (e: React.MouseEvent, car: Car) => void;
  isComparing: (id: string) => boolean;
  isSaved: (id: string) => boolean;
  onToggleSave: (e: React.MouseEvent, id: string) => void;
  customerMemory?: any;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: 'spring', 
      damping: 20, 
      stiffness: 100 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    transition: { duration: 0.2 } 
  }
};

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
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 12 });

  // Nivel 13 Adaptive Intelligence: Analizar intención en tiempo real
  const trajectory = useTrajectoryStore((s: any) => s.trajectory);
  const preferences = useMemo(() => TrajectoryAnalyzer.analyze(trajectory), [trajectory]);

  // Grid configuration
  const itemHeight = 480; 
  const [columns, setColumns] = useState(1);

  useLayoutEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) setColumns(3);
      else if (width >= 768) setColumns(2);
      else setColumns(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rowCount = Math.ceil(cars.length / columns);
  const totalHeight = rowCount * itemHeight;

  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.height = totalHeight > 0 ? `${totalHeight}px` : 'auto';
    }
  }, [totalHeight]);

  useEffect(() => {
    const updateVisibleRange = () => {
      if (!containerRef.current) return;

      const gridRect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how much of the grid is above the viewport
      const scrolled = Math.max(0, -gridRect.top);
      
      const startRow = Math.floor(scrolled / itemHeight);
      const visibleRows = Math.ceil(viewportHeight / itemHeight) + 1;
      const endRow = Math.min(rowCount, startRow + visibleRows + 2);

      setVisibleRange({
        start: Math.max(0, startRow * columns),
        end: Math.min(cars.length, endRow * columns),
      });
    };

    window.addEventListener('scroll', updateVisibleRange, { passive: true });
    updateVisibleRange(); 

    return () => window.removeEventListener('scroll', updateVisibleRange);
  }, [cars.length, columns, rowCount]);

  const visibleCars = useMemo(() => {
    return cars.slice(visibleRange.start, visibleRange.end);
  }, [cars, visibleRange]);

  const checkRecommendation = (car: Car): boolean => {
    // Priority 1: Trajectory Match (Neuromarketing)
    const score = TrajectoryAnalyzer.scoreCar(car, preferences);
    if (score > 0.6) return true;

    // Priority 2: Traditional memory
    if (!customerMemory?.preferences) return false;
    const { models, colors, features } = customerMemory.preferences;
    if (models?.some((m: string) => car.name.toLowerCase().includes(m.toLowerCase()))) return true;
    if (colors?.some((c: string) => car.name.toLowerCase().includes(c.toLowerCase()))) return true;
    if (features?.some((f: string) => car.name.toLowerCase().includes(f.toLowerCase()))) return true;
    return false;
  };

  const translateY = Math.floor(visibleRange.start / columns) * itemHeight;

  return (
    <div 
      ref={containerRef} 
      className="relative w-full"
    >
      <motion.div
        ref={gridRef}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 absolute left-0 right-0"
        style={{ transform: `translateY(${translateY}px)` }}
      >
        <AnimatePresence mode="popLayout">
          {visibleCars.map((car, index) => {
            const intentScore = TrajectoryAnalyzer.scoreCar(car, preferences);
            const isHighInterest = intentScore > 0.75;
            
            return (
              <motion.article
                key={car.id}
                variants={itemVariants}
                layout
                className="h-[480px] w-full"
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
                  isHighInterest={isHighInterest}
                  priority={index < 4}
                />
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VirtualInventory;
