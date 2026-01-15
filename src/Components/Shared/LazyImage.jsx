// Lazy Loading Image Component with placeholder and error handling
import React, { useState, useRef, useEffect, memo } from 'react';

const LazyImage = memo(({
  src,
  alt = '',
  className = '',
  placeholderClassName = '',
  errorClassName = '',
  width,
  height,
  fallbackSrc = null,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = (e) => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    setIsLoaded(true);
    onError?.(e);
  };

  // Placeholder/Skeleton
  const Placeholder = () => (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${placeholderClassName}`}
      style={{ width, height }}
    />
  );

  // Error fallback
  const ErrorFallback = () => (
    <div
      className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${errorClassName}`}
      style={{ width, height }}
    >
      {fallbackSrc ? (
        <img src={fallbackSrc} alt={alt} className={className} {...props} />
      ) : (
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )}
    </div>
  );

  return (
    <div ref={imgRef} className="relative" style={{ width, height }}>
      {/* Show placeholder while loading */}
      {!isLoaded && !hasError && <Placeholder />}
      
      {/* Show error fallback on error */}
      {hasError && <ErrorFallback />}
      
      {/* Actual image - only load when in view */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          width={width}
          height={height}
          {...props}
        />
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;









