'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FordModelSummary } from '@/entities/inventory/api/adapters/serverInventoryService';

// 10% down, 5.9% APR, 72 months
function estimateMonthly(price: number): number {
  const principal = price * 0.9;
  const r = 0.059 / 12;
  const n = 72;
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

interface Props {
  models: FordModelSummary[];
}

export default function FordCarouselStrip({ models }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const CARD_W = 192 + 16; // card width + gap

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -CARD_W * 2 : CARD_W * 2, behavior: 'smooth' });
  }, [CARD_W]);

  // Auto-scroll every 4 seconds, pause on hover
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const start = () => {
      autoRef.current = setInterval(() => {
        const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 8;
        el.scrollBy({ left: atEnd ? -el.scrollWidth : CARD_W, behavior: 'smooth' });
      }, 4000);
    };
    const stop = () => { if (autoRef.current) clearInterval(autoRef.current); };

    start();
    el.addEventListener('mouseenter', stop);
    el.addEventListener('mouseleave', start);
    el.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();

    return () => {
      stop();
      el.removeEventListener('mouseenter', stop);
      el.removeEventListener('mouseleave', start);
      el.removeEventListener('scroll', updateArrows);
    };
  }, [CARD_W, updateArrows]);

  if (!models.length) return null;

  return (
    <section className="relative z-10 -mt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative">
          {/* Left fade */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-linear-to-r from-slate-950 to-transparent z-10 transition-opacity duration-300"
            style={{ opacity: canLeft ? 1 : 0 }} />
          {/* Right fade */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-linear-to-l from-slate-950 to-transparent z-10" />

          {/* Left arrow */}
          {canLeft && (
            <button
              onClick={() => scroll('left')}
              aria-label="Ver modelos anteriores"
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-800/90 border border-white/10 flex items-center justify-center hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all shadow-lg"
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
          )}

          {/* Right arrow */}
          {canRight && (
            <button
              onClick={() => scroll('right')}
              aria-label="Ver más modelos Ford"
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-800/90 border border-white/10 flex items-center justify-center hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all shadow-lg"
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          )}

          {/* Track */}
          <div
            ref={trackRef}
            className="flex items-stretch gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
          >
            {models.map((m) => (
              <Link
                key={m.model}
                href={`/ford/${m.model.toLowerCase()}`}
                className="snap-start shrink-0 group relative w-48 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.12)] transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-[4/3] relative bg-slate-800 flex items-center justify-center p-3">
                  <Image
                    src={m.image}
                    alt={`Ford ${m.model}`}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                    sizes="200px"
                  />
                  {/* Units badge */}
                  {m.count > 0 && (
                    <span className="absolute top-2 right-2 text-[9px] font-black uppercase bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-full px-2 py-0.5 tracking-wide">
                      {m.count} {m.count === 1 ? 'unidad' : 'unidades'}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Ford</span>
                    <span className="text-[9px] text-slate-600">·</span>
                    <span className="text-[9px] text-slate-500">{m.bodyStyles[0] ?? 'Auto'}</span>
                  </div>
                  <p className="text-sm font-black text-white truncate">{m.model}</p>
                  <p className="text-[10px] text-slate-400">
                    Desde <span className="text-white font-bold">${estimateMonthly(m.minPrice).toLocaleString()}/mes</span>
                  </p>
                  <p className="text-[9px] text-slate-600">${m.minPrice.toLocaleString()} · 72 meses est.</p>
                </div>
              </Link>
            ))}

            {/* Ver todos */}
            <Link
              href="/ford"
              className="snap-start shrink-0 w-48 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex flex-col items-center justify-center p-6 hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all text-center gap-2"
            >
              <div className="w-10 h-10 rounded-full border border-cyan-500/30 flex items-center justify-center">
                <ChevronRight size={18} className="text-cyan-400" />
              </div>
              <p className="text-xs font-black text-cyan-400 uppercase tracking-widest leading-tight">Ver Todos<br />los Ford</p>
              <p className="text-[9px] text-slate-500">Inventario completo</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
