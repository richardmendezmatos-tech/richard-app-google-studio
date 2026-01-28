
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { optimizeImage } from '../../services/firebaseService';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    priority?: boolean;
    aspectRatio?: string;
    onLoad?: () => void;
}

/**
 * OptimizedImage Component
 * Uses the Antigravity Edge service to deliver WebP optimized images
 * with blur-up animation and lazy loading.
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = "",
    width = 800,
    priority = false,
    aspectRatio = "aspect-video",
    onLoad
}) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    const optimizedSrc = optimizeImage(src, width);

    return (
        <div className={`relative overflow-hidden bg-slate-800/20 ${aspectRatio} ${className}`}>
            {/* Blurred Placeholder */}
            <AnimatePresence>
                {!loaded && !error && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-800 animate-pulse z-0"
                    />
                )}
            </AnimatePresence>

            <img
                src={optimizedSrc}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                className={`w-full h-full object-cover transition-opacity duration-700 ease-in-out ${loaded ? "opacity-100" : "opacity-0"
                    }`}
                onLoad={() => {
                    setLoaded(true);
                    if (onLoad) onLoad();
                }}
                onError={() => setError(true)}
            />

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 text-slate-500">
                    <span className="text-xs font-bold uppercase tracking-widest">Image Error</span>
                </div>
            )}
        </div>
    );
};

export default OptimizedImage;
