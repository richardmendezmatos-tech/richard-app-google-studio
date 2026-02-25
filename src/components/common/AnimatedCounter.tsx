import React, { useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    format?: 'currency' | 'number' | 'percent';
    className?: string;
    delay?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    duration = 2, // framer-motion animate uses seconds by default
    format = 'number',
    className = '',
    delay = 0
}) => {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.01
    });

    useEffect(() => {
        // Force the motion value to the current value
        const controls = animate(motionValue, value, {
            duration: duration,
            delay: delay,
            ease: "easeOut"
        });
        return () => controls.stop();
    }, [value, duration, delay, motionValue]);

    const displayValue = useTransform(springValue, (latest) => {
        const rounded = Math.round(latest);
        if (format === 'currency') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
            }).format(rounded);
        }
        if (format === 'percent') {
            return `${rounded}%`;
        }
        return rounded.toLocaleString();
    });

    return <motion.span className={className}>{displayValue}</motion.span>;
};

export default AnimatedCounter;
