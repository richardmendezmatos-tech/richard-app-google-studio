import React from 'react';
import Image from 'next/image';

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
  blurDataURL?: string;
}

/**
 * OptimizedImage Component (Next.js Native)
 * Leverages the Next.js Image Optimization service for Richard Automotive.
 * Note: next/image handles AVIF/WebP conversion, resizing, and CDN caching natively.
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
  blurDataURL,
}) => {
  const [error, setError] = React.useState(false);

  // next/image handles all optimization — no pre-transformation needed
  const displaySrc = React.useMemo(() => {
    if (error || !src) return fallbackSrc;
    return src;
  }, [error, src, fallbackSrc]);

  const imageLoading = priority ? 'eager' : 'lazy';
  const imagePlaceholder = placeholder === 'blur' && blurDataURL ? 'blur' : 'empty';

  if (!fill && (!width || !height)) {
    console.warn(
      `OptimizedImage: 'width' and 'height' props should be provided when 'fill' is false for image with src: ${src}. This helps prevent layout shifts.`,
    );
  }

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
          loading={imageLoading}
          placeholder={imagePlaceholder}
          blurDataURL={blurDataURL}
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
      loading={imageLoading}
      placeholder={imagePlaceholder}
      blurDataURL={blurDataURL}
    />
  );
};

export default OptimizedImage;
