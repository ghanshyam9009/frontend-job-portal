// Debounce hooks for search and filter inputs
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Debounce a value - delays updating until user stops typing
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default 300ms)
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Debounced callback - delays function execution
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds
 */
export const useDebouncedCallback = (callback, delay = 300) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Cancel function
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Flush - execute immediately
  const flush = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    callbackRef.current(...args);
  }, []);

  return { debouncedCallback, cancel, flush };
};

/**
 * Throttle a callback - limits execution frequency
 * @param {Function} callback - The function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds
 */
export const useThrottledCallback = (callback, limit = 300) => {
  const lastRunRef = useRef(0);
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback((...args) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRunRef.current;

    if (timeSinceLastRun >= limit) {
      lastRunRef.current = now;
      callbackRef.current(...args);
    } else {
      // Schedule for later
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        lastRunRef.current = Date.now();
        callbackRef.current(...args);
      }, limit - timeSinceLastRun);
    }
  }, [limit]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};

/**
 * Search input hook with debouncing
 */
export const useSearchInput = (initialValue = '', delay = 300) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const debouncedValue = useDebounce(inputValue, delay);
  const [isSearching, setIsSearching] = useState(false);

  // Track if we're waiting for debounce
  useEffect(() => {
    if (inputValue !== debouncedValue) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [inputValue, debouncedValue]);

  const handleChange = useCallback((e) => {
    const value = e?.target?.value ?? e;
    setInputValue(value);
  }, []);

  const clear = useCallback(() => {
    setInputValue('');
  }, []);

  return {
    inputValue,
    debouncedValue,
    isSearching,
    handleChange,
    clear,
    setInputValue
  };
};

export default useDebounce;





