
import React, { useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { clsx, ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface OptimizedImageProps extends HTMLMotionProps<"img"> {
    className?: string; // Explicitly add if needed
    placeholder?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, className, placeholder, ...props }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={cn("relative overflow-hidden", className)}>
            {/* Blur Placeholder */}
            {!isLoaded && (
                <div
                    className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse"
                    style={{
                        filter: 'blur(10px)',
                        backgroundImage: placeholder ? `url(${placeholder})` : undefined,
                        backgroundSize: 'cover'
                    }}
                />
            )}

            {/* Actual Image */}
            <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                onLoad={() => setIsLoaded(true)}
                className={cn("w-full h-full object-cover relative z-10", className)}
                {...props}
            />
        </div>
    );
};
