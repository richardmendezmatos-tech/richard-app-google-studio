"use client";

"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Car } from '@/entities/inventory';
import { Lead } from '@/entities/lead';
import InventoryRow from './InventoryRow';

interface HyperInventoryListProps {
  inventory: Car[];
  leads: Lead[];
  onDelete: (id: string) => void;
  onEdit: (car: Car) => void;
  onPlanContent: (car: Car) => void;
}

const HyperInventoryList: React.FC<HyperInventoryListProps> = ({
  inventory,
  leads,
  onDelete,
  onEdit,
  onPlanContent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const scrollSpacerRef = useRef<HTMLDivElement>(null);
  const visibleWindowRef = useRef<HTMLDivElement>(null);

  const itemHeight = 80;
  const overscan = 5;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const totalHeight = inventory.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    inventory.length,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan,
  );

  useEffect(() => {
    if (scrollSpacerRef.current) {
      scrollSpacerRef.current.style.setProperty('--total-height', `${totalHeight}px`);
    }
  }, [totalHeight]);

  useEffect(() => {
    if (visibleWindowRef.current) {
      visibleWindowRef.current.style.setProperty('--offset-y', `${startIndex * itemHeight}px`);
    }
  }, [startIndex, itemHeight]);

  const leadCounts = useMemo(() => {
    const counts = new Map<string, number>();
    leads.forEach((l) => {
      if (l.vehicleId) {
        counts.set(l.vehicleId, (counts.get(l.vehicleId) || 0) + 1);
      }
    });
    return counts;
  }, [leads]);

  const visibleItems = useMemo(() => {
    return inventory.slice(startIndex, endIndex).map((car, index) => ({
      car,
      index: startIndex + index,
      leadCount: leadCounts.get(car.id) || 0,
    }));
  }, [inventory, leadCounts, startIndex, endIndex]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto custom-scrollbar relative"
      onScroll={handleScroll}
    >
      {/* HEADER (Sticky) */}
      <div className="sticky top-0 z-20 flex items-center bg-[#050c14]/90 backdrop-blur-2xl border-b border-white/5 px-8 h-16">
        <div className="flex-1 text-[9px] font-black uppercase tracking-[0.3em] text-primary min-w-board-column-lg">
          Asset / Identity
        </div>
        <div className="w-board-column-md text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
          Classification
        </div>
        <div className="w-board-column-sm text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
          Valuation
        </div>
        <div className="w-board-column-sm text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
          Advantage
        </div>
        <div className="w-board-column-sm text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
          Market Velocity
        </div>
        <div className="flex-1 text-right text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
          Control
        </div>
      </div>

      {/* SPACER FOR SCROLL */}
      <div ref={scrollSpacerRef} className="inventory-scroll-container">
        <div ref={visibleWindowRef} className="inventory-visible-window">
          {visibleItems.map(({ car, leadCount }) => (
            <InventoryRow
              key={car.id}
              car={car}
              leadCount={leadCount}
              onEdit={onEdit}
              onDelete={onDelete}
              onPlanContent={onPlanContent}
            />
          ))}
        </div>
      </div>

      {inventory.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
          <p className="font-bold uppercase tracking-widest text-sm text-white">
            Cargando hyper-lista...
          </p>
        </div>
      )}
    </div>
  );
};

export default HyperInventoryList;
