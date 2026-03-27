import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'motion/react';

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  duration?: number;
  direction?: 'normal' | 'reverse' | 'center';
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  delay = 0,
  staggerDelay = 100,
  duration = 800,
  direction = 'normal',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // We target only the direct children that are likely to be cards
    const targets = Array.from(containerRef.current.children);

    if (targets.length === 0) return;

    // Initial state: Hidden and slightly shifted
    animate(
      targets,
      {
        opacity: [0, 1],
        y: [30, 0],
        scale: [0.95, 1],
      },
      {
        delay: stagger(staggerDelay / 1000, {
          startDelay: delay / 1000,
          from: direction === 'normal' ? 'first' : direction === 'reverse' ? 'last' : 'center',
        }),
        duration: duration / 1000,
        type: 'spring',
        bounce: 0.3,
      },
    );
  }, [children, delay, staggerDelay, duration, direction]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default StaggerContainer;
