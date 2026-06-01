'use client';

import React, { useRef, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface PremiumCTAProps {
  label: string;
  tag: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  onClick?: () => void;
  className?: string;
}

export const PremiumCTA: React.FC<PremiumCTAProps> = ({
  label,
  tag,
  icon,
  variant = 'secondary',
  onClick,
  className = '',
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);

  // Magnetic Physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const mouseX = useSpring(x, springConfig);
  const mouseY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Attract center to mouse within bounds
    x.set(distanceX * 0.2);
    y.set(distanceY * 0.2);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0);
    y.set(0);
  };

  const styles: any = {
    primary: 'bg-brand-cyan text-slate-950 shadow-[0_20px_50px_-10px_rgba(0,229,255,0.3)]',
    secondary: 'bg-white/5 text-white border border-white/10',
    tertiary: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  };

  return (
    <motion.button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: mouseX, y: mouseY }}
      whileTap={{ scale: 0.98 }}
      className={`group relative overflow-hidden flex items-center justify-between min-h-[48px] p-5 rounded-2xl transition-colors duration-500 ${styles[variant]} ${className}`}
    >
      {/* Cinematic Flare Effect */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        initial={{ x: '-100%', opacity: 0 }}
        animate={hovered ? { x: '100%', opacity: 1 } : { x: '-100%', opacity: 0 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        }}
      />

      {/* Content */}
      <div className="flex flex-col items-start text-left relative z-10">
        <span
          className={`text-[8px] font-black uppercase tracking-[0.4em] mb-1 opacity-60 ${variant === 'primary' ? 'text-slate-900' : ''}`}
        >
          {tag}
        </span>
        <span className="font-cinematic text-xl tracking-wider leading-none">{label}</span>
      </div>

      <motion.div
        animate={hovered ? { x: 5, scale: 1.1 } : { x: 0, scale: 1 }}
        className={`relative z-10 p-2 rounded-xl transition-all ${variant === 'primary' ? 'bg-black/10' : 'bg-white/5'}`}
      >
        {icon}
      </motion.div>

      {/* Subtle Bottom Glow for Primary */}
      {variant === 'primary' && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-white opacity-40 blur-[1px]" />
      )}
    </motion.button>
  );
};
