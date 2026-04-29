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
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      loading={loading || (priority ? 'eager' : 'lazy')}
      onLoad={onLoad}
    />
  );
};

export default OptimizedImage;
