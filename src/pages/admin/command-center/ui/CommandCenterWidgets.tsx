import React, { useState, useEffect } from 'react';

interface CountUpProps {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  prefix = '',
  suffix = '',
  duration = 1500,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const ease = (x: number) => 1 - Math.pow(1 - x, 3); // Cubic ease out
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

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 20;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="opacity-50">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

interface StatusWidgetProps {
  icon: React.ElementType;
  label: string;
  value: string | React.ReactNode;
  color: string;
  subValue?: string;
  trendData?: number[];
}

export const StatusWidget: React.FC<StatusWidgetProps> = ({
  icon: Icon,
  label,
  value,
  color,
  subValue,
  trendData = [30, 40, 35, 50, 45, 60, 55],
}) => (
  <div className="glass-premium p-6 rounded-[2.5rem] flex items-center justify-between group cursor-default transition-all hover:bg-white/5 border border-white/5">
    <div className="flex items-center gap-5">
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
        <div className="text-3xl font-black text-white leading-none tracking-tighter">{value}</div>
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
    <div className="hidden xl:block">
      <Sparkline
        data={trendData}
        color={
          color.includes('cyan')
            ? '#22d3ee'
            : color.includes('emerald')
              ? '#10b981'
              : color.includes('purple')
                ? '#a855f7'
                : '#f59e0b'
        }
      />
    </div>
  </div>
);
