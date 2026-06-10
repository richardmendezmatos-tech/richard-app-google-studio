'use client';
/* eslint-disable react-hooks/purity */

import React, { useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface NeuralBackgroundProps {
  className?: string;
  count?: number;
}

export const NeuralBackground: React.FC<NeuralBackgroundProps> = ({
  className = '',
  count = 20,
}) => {
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 1000], [0, -200]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const nodes = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * -20,
      offsetX: Math.random() * 2 - 1,
      offsetY: Math.random() * 2 - 1,
    }));
  }, [count, mounted]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
    >
      {mounted && (
        <motion.div style={{ y: yParallax }} className="absolute inset-0">
          <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Subtle connecting lines */}
            {nodes.slice(0, 10).map((node, i) => {
              const nextNode = nodes[(i + 1) % nodes.length];
              return (
                <motion.line
                  key={`line-${i}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${nextNode.x}%`}
                  y2={`${nextNode.y}%`}
                  stroke="currentColor"
                  strokeWidth="0.05"
                  className="text-brand-cyan/30"
                  animate={{
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.5,
                  }}
                />
              );
            })}

            {/* Floating Nodes */}
            {nodes.map((node) => (
              <motion.circle
                key={node.id}
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r={node.size / 10}
                className="text-brand-cyan"
                fill="currentColor"
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.5, 1],
                  x: [0, node.offsetX, 0],
                  y: [0, node.offsetY, 0],
                }}
                transition={{
                  duration: node.duration,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: node.delay,
                }}
              />
            ))}
          </svg>
        </motion.div>
      )}

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
    </div>
  );
};
