import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  blurDataURL?: string;
  priority?: boolean;
  dataSaver?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage = ({
  src,
  alt,
  className,
  width = 400,
  height,
  quality = 75,
  blurDataURL,
  priority = false,
  dataSaver = false,
  onLoad,
  onError
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  // Return clean image URL
  const getOptimizedSrc = (originalSrc: string) => {
    if (!originalSrc) return '';
    return originalSrc;
  };

  // Generate blur placeholder
  const generateBlurPlaceholder = () => {
    if (blurDataURL) return blurDataURL;
    
    // Generate a simple gradient blur placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      try {
        const gradient = ctx.createLinearGradient(0, 0, 40, 40);
        // Use static fallback colors to avoid canvas errors with CSS variables
        gradient.addColorStop(0, '#e5e7eb'); // light gray
        gradient.addColorStop(1, '#cbd5e1'); // slightly darker gray
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 40, 40);
        return canvas.toDataURL();
      } catch {
        // Fallback: solid placeholder to ensure no runtime errors
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(0, 0, 40, 40);
        return canvas.toDataURL();
      }
    }
    
    return '';
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1 
      }
    );

    if (placeholderRef.current) {
      observer.observe(placeholderRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  const optimizedSrc = getOptimizedSrc(src);
  const blurPlaceholder = generateBlurPlaceholder();

  // Don't load images in data saver mode unless priority
  if (dataSaver && !priority && !isLoaded) {
    return (
      <div 
        ref={placeholderRef}
        className={cn(
          'bg-muted flex items-center justify-center text-muted-foreground text-sm',
          className
        )}
        style={{ width, height }}
      >
        📷 Image (Data Saver)
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {/* Blur placeholder */}
      {!isLoaded && blurPlaceholder && (
        <img
          src={blurPlaceholder}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover filter blur-sm scale-105 transition-opacity duration-300',
            isLoaded ? 'opacity-0' : 'opacity-100'
          )}
          aria-hidden="true"
        />
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && !blurPlaceholder && (
        <div 
          ref={placeholderRef}
          className={cn(
            'absolute inset-0 bg-muted animate-pulse',
            !isInView && 'bg-gradient-to-r from-muted via-muted-foreground/10 to-muted'
          )}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            className,
            isLoaded ? 'opacity-100' : 'opacity-0',
            error && 'hidden'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}

      {/* Error state */}
      {error && (
        <div className={cn(
          'absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground',
          className
        )}>
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-xs">Failed to load</div>
          </div>
        </div>
      )}
    </div>
  );
};

export { OptimizedImage };