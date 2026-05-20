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
  sizes?: string;
}

/**
 * OptimizedImage Component (Next.js Native)
 * Leverages the Next.js Image Optimization service for Richard Automotive.
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  onLoad,
  placeholder = 'empty',
  fill = false,
  fallbackSrc = '/placeholder-car.webp',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}) => {
  const [error, setError] = React.useState(false);

  // Decide which source to use
  const displaySrc = React.useMemo(() => {
    if (error || !src) return fallbackSrc;
    // We can still use Antigravity for the initial source, but next/image will optimize it further
    return optimizeWithAntigravity(src, width || 800) || src;
  }, [error, src, fallbackSrc, width]);

  if (fill) {
    return (
      <div className={`relative h-full w-full ${className}`}>
        <Image
          src={displaySrc}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          onLoad={onLoad}
          onError={() => setError(true)}
          sizes={sizes}
        />
      </div>
    );
  }

  return (
    <Image
      src={displaySrc}
      alt={alt}
      width={width || 800}
      height={height || 600}
      priority={priority}
      className={className}
      onLoad={onLoad}
      onError={() => setError(true)}
      sizes={sizes}
    />
  );
};

export default OptimizedImage;
