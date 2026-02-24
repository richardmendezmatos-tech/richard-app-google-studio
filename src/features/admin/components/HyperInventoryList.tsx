
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Car, Lead } from '@/types/types';
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
    onPlanContent
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(600);

    const itemHeight = 80;
    const overscan = 5;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    useEffect(() => {
        if (containerRef.current) {
            setContainerHeight(containerRef.current.clientHeight);

            const resizeObserver = new ResizeObserver(entries => {
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
        Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = useMemo(() => {
        return inventory.slice(startIndex, endIndex).map((car, index) => ({
            car,
            index: startIndex + index,
            leadCount: leads.filter(l => l.vehicleId === car.id).length
        }));
    }, [inventory, leads, startIndex, endIndex]);

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto custom-scrollbar relative"
            onScroll={handleScroll}
        >
            {/* HEADER (Sticky) */}
            <div className="sticky top-0 z-20 flex items-center bg-slate-900/95 backdrop-blur-md border-b border-white/5 px-6 h-[50px]">
                <div className="flex-1 text-[10px] font-black uppercase tracking-widest text-[#00aed9] min-w-[300px]">Unidad</div>
                <div className="w-[200px] text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo / Badge</div>
                <div className="w-[150px] text-[10px] font-black uppercase tracking-widest text-slate-400">Precio</div>
                <div className="w-[150px] text-[10px] font-black uppercase tracking-widest text-slate-400">Advantage</div>
                <div className="w-[150px] text-[10px] font-black uppercase tracking-widest text-slate-400">Sales Velocity</div>
                <div className="flex-1 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Acciones</div>
            </div>

            {/* SPACER FOR SCROLL */}
            <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    transform: `translateY(${startIndex * itemHeight}px)`
                }}>
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
                    <p className="font-bold uppercase tracking-widest text-sm text-white">Cargando hyper-lista...</p>
                </div>
            )}
        </div>
    );
};

export default HyperInventoryList;
