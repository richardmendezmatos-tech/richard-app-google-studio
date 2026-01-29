
import React, { useState, useEffect, useRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { clsx, ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface OptimizedImageProps extends Omit<HTMLMotionProps<"img">, 'onLoad'> {
    className?: string;
    placeholder?: string;
    priority?: boolean; // Skip lazy loading for critical images
    sizes?: string; // Responsive sizes attribute
    onLoad?: () => void;
    fallbackSrc?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className,
    placeholder,
    priority = false,
    sizes,
    onLoad,
    fallbackSrc,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority); // Load immediately if priority
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

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
                rootMargin: '50px', // Start loading 50px before entering viewport
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

    // Generate WebP source if available
    const webpSrc = src && typeof src === 'string' && src.includes('.jpg')
        ? src.replace('.jpg', '.webp')
        : undefined;

    return (
        <div className={cn("relative overflow-hidden", className)}>
            {/* Blur Placeholder */}
            {!isLoaded && (
                <div
                    className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse"
                    style={{
                        filter: 'blur(10px)',
                        backgroundImage: placeholder ? `url(${placeholder})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
            )}

            {/* Actual Image with WebP support */}
            {isInView && (
                <picture>
                    {webpSrc && (
                        <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
                    )}
                    <motion.img
                        ref={imgRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isLoaded ? 1 : 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        src={src}
                        alt={alt}
                        sizes={sizes}
                        loading={priority ? "eager" : "lazy"}
                        decoding="async"
                        onLoad={handleLoad}
                        onError={handleError}
                        className={cn("w-full h-full object-cover relative z-10", className)}
                        {...props}
                    />
                </picture>
            )}

            {/* Error State */}
            {hasError && !fallbackSrc && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-400 text-xs">
                    Error al cargar imagen
                </div>
            )}
        </div>
    );
};
