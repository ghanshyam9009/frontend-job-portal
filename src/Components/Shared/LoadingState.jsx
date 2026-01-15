// Global Loading State Component - Handles loading, error, and empty states
import React, { memo } from 'react';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import Loader from './Loader';
import SkeletonJobCard from './SkeletonJobCard';

/**
 * LoadingState - Unified component for handling async states
 * Prevents UI flicker and provides consistent UX
 */
const LoadingState = memo(({
  loading = false,
  error = null,
  data = null,
  children,
  // Loading options
  loadingType = 'spinner', // 'spinner' | 'skeleton' | 'custom'
  skeletonCount = 6,
  loadingMessage = 'Loading...',
  CustomLoader = null,
  // Error options
  onRetry = null,
  errorMessage = null,
  // Empty state options
  emptyMessage = 'No data found',
  emptyIcon = Inbox,
  showEmptyState = true,
  // Minimum loading time to prevent flicker
  minLoadingTime = 0
}) => {
  // Check if data is empty
  const isEmpty = !loading && !error && (
    data === null || 
    data === undefined || 
    (Array.isArray(data) && data.length === 0) ||
    (typeof data === 'object' && Object.keys(data).length === 0)
  );

  // Loading State
  if (loading) {
    if (CustomLoader) {
      return CustomLoader;
    }

    if (loadingType === 'skeleton') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonJobCard count={skeletonCount} />
        </div>
      );
    }

    return <Loader message={loadingMessage} />;
  }

  // Error State
  if (error) {
    const displayError = errorMessage || error?.message || 'Something went wrong';
    
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-full p-4 mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Error Loading Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-4 max-w-md">
          {displayError}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Empty State
  if (isEmpty && showEmptyState) {
    const EmptyIcon = emptyIcon;
    
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
          <EmptyIcon className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Results
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          {emptyMessage}
        </p>
      </div>
    );
  }

  // Render children with data
  return typeof children === 'function' ? children(data) : children;
});

LoadingState.displayName = 'LoadingState';

/**
 * Inline loading indicator for buttons and small areas
 */
export const InlineLoader = memo(({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
});

InlineLoader.displayName = 'InlineLoader';

/**
 * Page-level loading overlay
 */
export const PageLoader = memo(({ message = 'Loading...' }) => (
  <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
      </div>
      <p className="text-gray-600 dark:text-gray-400 font-medium">{message}</p>
    </div>
  </div>
));

PageLoader.displayName = 'PageLoader';

/**
 * Skeleton variants for different content types
 */
export const SkeletonText = memo(({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
        style={{ width: `${Math.random() * 40 + 60}%` }}
      />
    ))}
  </div>
));

SkeletonText.displayName = 'SkeletonText';

export const SkeletonCard = memo(({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm animate-pulse ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
    <SkeletonText lines={2} />
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

export default LoadingState;









