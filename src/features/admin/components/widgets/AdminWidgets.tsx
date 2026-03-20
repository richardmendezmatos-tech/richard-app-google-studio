import React, { useState, useEffect } from 'react';

export const CountUp = ({
  end,
  prefix = '',
  suffix = '',
  duration = 1500,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const ease = (x: number) => 1 - Math.pow(1 - x, 3);
      setCount(Math.floor(end * ease(percentage)));
      if (progress < duration) animationFrame = requestAnimationFrame(updateCount);
    };
    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <span>
      {prefix}
      {(count || 0).toLocaleString()}
      {suffix}
    </span>
  );
};

export const StatusWidget = ({
  icon: Icon,
  label,
  value,
  color,
  subValue,
}: {
  icon: React.ElementType;
  label: string;
  value: string | React.ReactNode;
  color: string;
  subValue?: string;
}) => (
  <div className="glass-premium p-6 rounded-[2rem] flex items-center gap-5 group cursor-default route-fade-in hover:-translate-y-1 hover:scale-[1.01] transition-transform">
    <div
      className={`p-4 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center transition-transform group-hover:rotate-12 duration-500`}
    >
      <Icon
        className={color.replace('bg-', 'text-').replace('text-opacity-100', '')}
        size={32}
        strokeWidth={2.5}
      />
    </div>
    <div>
      <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-[0.2em] mb-1">
        {label}
      </h4>
      <div className="text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tighter text-glow">
        {value}
      </div>
      {subValue && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {subValue}
          </div>
        </div>
      )}
    </div>
  </div>
);
