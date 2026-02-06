import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';

interface ProgressRingProps {
    value: number;
    max?: number;
    label: string;
    size?: number;
    strokeWidth?: number;
    color?: string;
    duration?: number;
    delay?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
    value,
    max = 100,
    label,
    size = 120,
    strokeWidth = 10,
    color = '#00aed9',
    duration = 1500,
    delay = 0
}) => {
    const ringRef = useRef<SVGCircleElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    useEffect(() => {
        if (!ringRef.current) return;

        // Initial state: Full offset (empty circle)
        ringRef.current.style.strokeDasharray = `${circumference}`;
        ringRef.current.style.strokeDashoffset = `${circumference}`;

        animate(ringRef.current, {
            strokeDashoffset: circumference - (percentage / 100) * circumference,
            duration: duration,
            delay: delay,
            easing: 'easeInOutQuart'
        });

        if (textRef.current) {
            animate({
                val: 0
            }, {
                val: value,
                duration: duration,
                delay: delay,
                round: 1,
                easing: 'easeInOutQuart',
                onUpdate: (self: any) => {
                    if (textRef.current) {
                        const target = self.targets[0] as { val: number };
                        textRef.current.innerHTML = String(Math.round(target.val));
                    }
                }
            });
        }
    }, [value, max, circumference, percentage, duration, delay]);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative" style={{ '--ring-size': `${size}px` } as React.CSSProperties}>
                <div
                    className="absolute inset-0"
                    style={{ width: 'var(--ring-size)', height: 'var(--ring-size)' }}
                />
                {/* Background Circle */}
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        className="text-slate-200 dark:text-slate-800"
                    />
                    {/* Progress Circle */}
                    <circle
                        ref={ringRef}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeLinecap="round"
                    />
                </svg>
                {/* Value Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span ref={textRef} className="text-2xl font-black text-slate-800 dark:text-white leading-none">0</span>
                    {max === 100 && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">%</span>}
                </div>
            </div>
            <span className="mt-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">{label}</span>
        </div>
    );
};

export default ProgressRing;
