/**
 * ScrollNavigator — Richard Automotive
 * @source src/components/common (canonical)
 *
 * Nota: Esta es la versión canónica con `hidden md:block` para ocultar en mobile.
 * La copia en src/features/inventory/components/common/ es un re-export de aquí.
 */

import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const ScrollNavigator: React.FC = () => {
    const [scrollPercentage, setScrollPercentage] = useState(0);
    const containerRef = useRef<HTMLElement | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLDivElement>(null);

    const handleScrollUpdate = useCallback(() => {
        if (!containerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        const totalScrollable = scrollWidth - clientWidth;
        if (totalScrollable <= 0) {
            setScrollPercentage(0);
            return;
        }
        setScrollPercentage((scrollLeft / totalScrollable) * 100);
    }, []);

    useEffect(() => {
        const container = document.getElementById('main-content');
        if (container) {
            containerRef.current = container;
            container.addEventListener('scroll', handleScrollUpdate);

            const timer = setTimeout(handleScrollUpdate, 100);
            return () => {
                container.removeEventListener('scroll', handleScrollUpdate);
                clearTimeout(timer);
            };
        }
    }, [handleScrollUpdate]);

    useLayoutEffect(() => {
        if (navRef.current) {
            navRef.current.style.setProperty('--scroll-progress', `${scrollPercentage}%`);
        }
    }, [scrollPercentage]);

    // Handle Virtual Scroll (Vertical wheel -> Horizontal scroll)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onWheel = (e: WheelEvent) => {
            if (e.deltaY !== 0) {
                container.scrollLeft += e.deltaY;
            }
        };

        container.addEventListener('wheel', onWheel, { passive: true });
        return () => container.removeEventListener('wheel', onWheel);
    }, []);

    const handleNavigate = (clientX: number) => {
        if (!trackRef.current || !containerRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = (x / rect.width);

        const totalScrollable = containerRef.current.scrollWidth - containerRef.current.clientWidth;
        containerRef.current.scrollLeft = totalScrollable * percentage;
    };

    const onMouseDown = (e: React.MouseEvent) => {
        handleNavigate(e.clientX);
        const onMouseMove = (moveEvent: MouseEvent) => {
            handleNavigate(moveEvent.clientX);
        };
        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        handleNavigate(e.touches[0].clientX);
    };

    return (
        // `hidden md:block` → se oculta en mobile, visible en desktop
        <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[60] hidden px-10 pb-6 pt-2 md:block md:px-20 lg:left-[280px]">
            <div
                ref={navRef}
                className="max-w-4xl mx-auto relative h-16 flex flex-col items-center justify-center group pointer-events-auto"
            >
                {/* Visual Hint */}
                <div className="mb-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Control de Desplazamiento Horizontal
                </div>

                <div className="w-full relative h-1.5 flex items-center">
                    {/* Track Background */}
                    <div
                        ref={trackRef}
                        onMouseDown={onMouseDown}
                        onTouchMove={onTouchMove}
                        className="absolute inset-x-0 h-full bg-white/5 dark:bg-slate-800/50 backdrop-blur-md rounded-full border border-white/10 overflow-hidden cursor-pointer"
                    >
                        {/* Active Progress Fill */}
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(0,174,217,0.6)] w-[var(--scroll-progress)]"
                        />
                    </div>

                    {/* Draggable Knob */}
                    <motion.div
                        className="absolute h-10 w-10 -ml-5 flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-none left-[var(--scroll-progress)]"
                        whileHover={{ scale: 1.1 }}
                    >
                        <div className="w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full shadow-2xl flex items-center justify-center border-2 border-cyan-500 relative">
                            <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full animate-pulse" />
                            {/* Percentage Tooltip */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-cyan-500/50 text-white text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                                {Math.round(scrollPercentage)}%
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative Endpoints */}
                <div className="absolute left-0 -ml-12 text-cyan-500/30">
                    <ChevronLeft size={24} />
                </div>
                <div className="absolute right-0 -mr-12 text-cyan-500/30">
                    <ChevronRight size={24} />
                </div>

                {/* Footer Label */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-500 uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-all duration-700">
                    Explorar Comando Central Richard Automotive
                </div>
            </div>
        </div>
    );
};
