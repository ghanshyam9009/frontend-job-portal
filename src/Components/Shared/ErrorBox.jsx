import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorBox = ({ 
  error, 
  onRetry, 
  title = 'Something went wrong',
  className = '' 
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' 
    ? error 
    : error?.message || 'An unexpected error occurred. Please try again.';

  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
            {title}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-400 mb-3">
            {errorMessage}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorBox;










