import React from 'react';

interface GlassContainerProps {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  hoverable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * GlassContainer: Componente atómico de Nivel 18.
 * Proporciona un contenedor con efecto de vidrio esmerilado dinámico.
 */
export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  intensity = 'medium',
  hoverable = false,
  className = '',
  style = {},
}) => {
  // Mapping intensities to CSS variable values
  const intensityMap = {
    low: 0.5,
    medium: 1,
    high: 1.5,
  };

  const dynamicStyle = {
    '--ra-glass-intensity': intensityMap[intensity],
    ...style,
  } as React.CSSProperties;

  const hoverClass = hoverable
    ? 'hover:border-primary/40 hover:shadow-cyan-900/20 cursor-pointer active:scale-[0.98]'
    : '';

  return (
    <div
      className={`glass-premium rounded-2xl p-6 ${hoverClass} ${className}`}
      style={dynamicStyle}
    >
      {children}
    </div>
  );
};
