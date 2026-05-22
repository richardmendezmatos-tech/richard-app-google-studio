'use client';

import React, { useState, useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startValueRef = useRef(0);

  useEffect(() => {
    const controls = animate(startValueRef.current, value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        startValueRef.current = latest;
        setDisplayValue(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value]);

  return <span className="tabular-nums">{displayValue.toLocaleString()}</span>;
};

export default AnimatedNumber;
