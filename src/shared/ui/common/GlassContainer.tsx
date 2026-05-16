import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  hoverable?: boolean;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
  withBrackets?: boolean;
}

/**
 * GlassContainer Master v3.1 (Sentinel N24)
 * Componente atómico de Nivel 18.
 * Proporciona un contenedor con efecto de vidrio esmerilado dinámico y animaciones proactivas.
 */
export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  intensity = 'medium',
  hoverable = false,
  withBrackets = false,
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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-premium relative rounded-2xl p-6 ${hoverClass} ${className}`}
      style={dynamicStyle}
      {...motionProps}
    >
      {withBrackets && (
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/40 rounded-tl-sm" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/40 rounded-tr-sm" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/40 rounded-bl-sm" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/40 rounded-br-sm" />
        </div>
      )}
      {children}
    </motion.div>
  );
};
