'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text, className }) => {
  const [glitch1Delay] = React.useState(() => Math.random() * 5 + 2);
  const [glitch2Delay] = React.useState(() => Math.random() * 5 + 2);

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.span initial={{ opacity: 1 }} className="relative z-10">
        {text}
      </motion.span>

      {/* Glitch Layers */}
      <motion.span
        animate={{
          x: [0, -2, 2, -1, 0],
          opacity: [0, 0.5, 0.2, 0.5, 0],
        }}
        transition={{
          duration: 0.2,
          repeat: Infinity,
          repeatDelay: glitch1Delay,
        }}
        className="absolute inset-0 z-0 text-ra-primary opacity-0 select-none pointer-events-none"
        style={{ clipPath: 'inset(10% 0 30% 0)' }}
        aria-hidden="true"
      >
        {text}
      </motion.span>

      <motion.span
        animate={{
          x: [0, 2, -2, 1, 0],
          opacity: [0, 0.5, 0.2, 0.5, 0],
        }}
        transition={{
          duration: 0.2,
          repeat: Infinity,
          repeatDelay: glitch2Delay,
        }}
        className="absolute inset-0 z-0 text-ra-accent opacity-0 select-none pointer-events-none"
        style={{ clipPath: 'inset(40% 0 10% 0)' }}
        aria-hidden="true"
      >
        {text}
      </motion.span>
    </div>
  );
};
