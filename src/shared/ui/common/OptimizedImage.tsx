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
  fallbackSrc = '/placeholder-car.webp',
}) => {
  const [error, setError] = React.useState(false);
  const [retryWithOriginal, setRetryWithOriginal] = React.useState(false);

  // Use the Richard Automotive Edge (Antigravity) for pre-optimization
  const optimizedSrc = React.useMemo(() => optimizeWithAntigravity(src || '', width), [src, width]);
  
  // Decide which source to use
  const displaySrc = React.useMemo(() => {
    if (error) return fallbackSrc;
    if (retryWithOriginal) return src || fallbackSrc;
    return optimizedSrc || src || fallbackSrc;
  }, [error, retryWithOriginal, optimizedSrc, src, fallbackSrc]);

  const handleError = () => {
    if (!retryWithOriginal && optimizedSrc !== src) {
      setRetryWithOriginal(true);
    } else {
      setError(true);
    }
  };

  return (
    <img
      src={displaySrc}
      alt={error ? 'Imagen no disponible' : alt}
      className={`${className} ${error ? 'opacity-50 grayscale' : ''}`}
      loading={loading || (priority ? 'eager' : 'lazy')}
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={onLoad}
      onError={handleError}
    />
  );
};

export default OptimizedImage;
