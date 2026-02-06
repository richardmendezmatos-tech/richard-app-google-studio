import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

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
    direction = 'normal'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // We target only the direct children that are likely to be cards
        const targets = containerRef.current.children;

        if (targets.length === 0) return;

        // Initial state: Hidden and slightly shifted
        animate(targets, {
            opacity: [0, 1],
            translateY: [30, 0],
            scale: [0.95, 1],
            delay: stagger(staggerDelay, {
                start: delay,
                from: direction === 'center' ? 'center' : (direction === 'reverse' ? 'last' : 'first')
            }),
            duration: duration,
            easing: 'easeOutElastic(1, .8)'
        });
    }, [children, delay, staggerDelay, duration, direction]);

    return (
        <div ref={containerRef} className={className}>
            {children}
        </div>
    );
};

export default StaggerContainer;
