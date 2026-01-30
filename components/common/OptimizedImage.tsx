
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { optimizeImage } from '../../services/firebaseService';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    priority?: boolean; // Skip lazy loading for critical images
    aspectRatio?: string;
    onLoad?: () => void;
    fallbackSrc?: string;
}

/**
 * OptimizedImage Component
 * Uses the Antigravity Edge service to deliver WebP optimized images
 * with blur-up animation, lazy loading via Intersection Observer, and WebP fallback support.
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className = "",
    width = 800,
    priority = false,
    aspectRatio = "aspect-video",
    onLoad,
    fallbackSrc
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Optimized source from our edge service
    const optimizedSrc = src ? optimizeImage(src, width) : '';

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority || !imgRef.current) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observerRef.current?.disconnect();
                    }
                });
            },
            {
                rootMargin: '100px', // Start loading earlier for better UX
                threshold: 0.01
            }
        );

        observerRef.current.observe(imgRef.current);

        return () => {
            observerRef.current?.disconnect();
        };
    }, [priority]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setHasError(true);
        if (fallbackSrc && imgRef.current) {
            imgRef.current.src = fallbackSrc;
        }
    };

    return (
        <div className={`relative overflow-hidden bg-slate-800/20 ${aspectRatio} ${className}`}>
            {/* Blurred Placeholder / Loading State */}
            <AnimatePresence>
                {!isLoaded && !hasError && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-800 animate-pulse z-0"
                    />
                )}
            </AnimatePresence>

            {/* Actual Image with WebP support via optimizeImage */}
            {isInView && (
                <motion.img
                    ref={imgRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoaded ? 1 : 0 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                    src={optimizedSrc}
                    alt={alt}
                    loading={priority ? "eager" : "lazy"}
                    decoding="async"
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`w-full h-full object-cover relative z-10 ${className}`}
                />
            )}

            {/* Error State */}
            {hasError && !fallbackSrc && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 text-slate-500 z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Image Error</span>
                </div>
            )}
        </div>
    );
};

export default OptimizedImage;
