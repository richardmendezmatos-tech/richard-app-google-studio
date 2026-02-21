import React, { useEffect, useRef } from 'react';
import * as anime from 'animejs';

const AnimeDemo: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        // Create a timeline for the demonstration (AnimeJS v4 syntax)
        const tl = new (anime as any).Timeline({
            defaults: {
                easing: 'easeOutExpo',
                duration: 750,
            },
            loop: true
        });

        tl.add(boxRef.current as any, {
            translateX: 250,
            rotate: '1turn',
            backgroundColor: '#3b82f6', // blue-500
            borderRadius: ['0%', '50%'],
        })
            .add(textRef.current as any, {
                opacity: [0, 1],
                translateY: [-20, 0],
                delay: anime.stagger(100)
            }, '-=500')
            .add(boxRef.current as any, {
                translateX: 0,
                rotate: '0turn',
                backgroundColor: '#ef4444', // red-500
                borderRadius: ['50%', '0%'],
            })
            .add(textRef.current as any, {
                opacity: [1, 0],
                translateY: [0, 20],
            }, '-=500');

        return () => {
            tl.pause();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="p-8 flex flex-col items-center justify-center min-h-[300px] bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden mb-6"
        >
            <div
                ref={boxRef}
                className="w-16 h-16 bg-red-500 mb-8 shadow-lg origin-center"
            />

            <h2
                ref={textRef}
                className="text-2xl font-bold text-white tracking-widest uppercase mb-4"
            >
                AnimeJS v4 Integrated
            </h2>

            <p className="text-slate-400 text-sm max-w-md text-center">
                Esta es una demostración de una línea de tiempo (timeline) usando AnimeJS v4 con exportaciones nombradas (named exports).
            </p>
        </div>
    );
};

export default AnimeDemo;
