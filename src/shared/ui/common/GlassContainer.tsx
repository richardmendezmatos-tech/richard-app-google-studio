import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  hoverable?: boolean;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * GlassContainer Master v3.0 (Sentinel N23)
 * Componente atómico de Nivel 18.
 * Proporciona un contenedor con efecto de vidrio esmerilado dinámico y animaciones proactivas.
 */
export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  intensity = 'medium',
  hoverable = false,
  opacity,
  className = '',
  style = {},
  ...motionProps
}) => {
  const intensityMap = {
    low: 0.5,
    medium: 1,
    high: 1.5,
  };

  const blurMap = {
    low: '8px',
    medium: '16px',
    high: '32px'
  };

  const dynamicStyle = {
    '--ra-glass-intensity': intensityMap[intensity],
    ...(opacity !== undefined ? { background: `rgba(13, 34, 50, ${opacity})` } : {}),
    ...(opacity !== undefined ? { backdropFilter: `blur(${blurMap[intensity]})` } : {}),
    ...style,
  } as React.CSSProperties;

  const hoverClass = hoverable
    ? 'hover:border-primary/40 hover:shadow-cyan-900/20 cursor-pointer active:scale-[0.98]'
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-premium rounded-2xl p-6 ${hoverClass} ${className}`}
      style={dynamicStyle}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};
