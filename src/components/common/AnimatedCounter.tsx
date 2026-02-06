import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    format?: 'currency' | 'number' | 'percent';
    className?: string;
    delay?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    duration = 2000,
    format = 'number',
    className = '',
    delay = 0
}) => {
    const [displayValue, setDisplayValue] = useState(0);
    const counterRef = useRef({ val: 0 });

    useEffect(() => {
        const animation = animate(counterRef.current, {
            val: value,
            duration: duration,
            delay: delay,
            easing: 'easeOutExpo',
            update: () => {
                setDisplayValue(counterRef.current.val);
            }
        });

        return () => {
            animation.pause();
        };
    }, [value, duration, delay]);

    const formattedValue = () => {
        const rounded = Math.round(displayValue);
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
    };

    return <span className={className}>{formattedValue()}</span>;
};

export default AnimatedCounter;
