'use client';
import { useEffect, useRef, useState } from 'react';

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 15, suffix: '+', label: 'Años de experiencia' },
  { value: 2400, suffix: '+', label: 'Familias atendidas' },
  { value: 4.9, suffix: '★', label: 'Calificación Google' },
  { value: 100, suffix: '%', label: 'Ford Autorizado' },
];

function AnimatedNumber({ target, suffix, started }: { target: number; suffix: string; started: boolean }) {
  const [current, setCurrent] = useState(0);
  const isDecimal = !Number.isInteger(target);

  useEffect(() => {
    if (!started) return;
    const duration = 1400;
    const steps = 60;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCurrent(Math.min(increment * step, target));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  const display = isDecimal ? current.toFixed(1) : Math.round(current).toLocaleString();
  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

export default function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative z-10 py-6 px-6"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(({ value, suffix, label }) => (
          <div
            key={label}
            className="flex flex-col items-center text-center bg-slate-900/50 border border-white/5 rounded-2xl py-5 px-4 hover:border-cyan-500/20 transition-colors"
          >
            <p className="text-2xl md:text-3xl font-black text-cyan-400 tabular-nums">
              <AnimatedNumber target={value} suffix={suffix} started={started} />
            </p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
