import React from 'react';
import Image from 'next/image';
import { optimizeWithAntigravity } from '@/shared/api/antigravity/antigravityService';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  aspectRatio?: string;
  onLoad?: () => void;
  fallbackSrc?: string;
  placeholder?: 'blur' | 'empty';
  loading?: 'lazy' | 'eager';
  fill?: boolean;
}

/**
 * OptimizedImage Component (Next.js Native)
 * Leverages the Next.js Image Optimization service for Richard Automotive.
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width = 800,
  height = 600,
  priority = false,
  onLoad,
  placeholder = 'empty',
  loading,
  fill = false,
}) => {
  // Use the Richard Automotive Edge (Antigravity) for pre-optimization
  const displaySrc = optimizeWithAntigravity(src || '', width);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <Image
        src={displaySrc}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        priority={priority}
        loading={loading}
        onLoad={onLoad}
        placeholder={placeholder}
        className={`object-cover transition-all duration-700 ${fill ? 'absolute inset-0' : ''}`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};

export default OptimizedImage;
