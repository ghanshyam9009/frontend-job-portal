// Custom Hooks for API calls with caching, loading states, and error handling
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data if valid
 */
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

/**
 * Set cache data
 */
const setCacheData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * Clear specific cache or all cache
 */
export const clearCache = (key = null) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

/**
 * Basic API hook with manual execution
 */
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      if (mountedRef.current) {
        setData(result);
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setLoading(false);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, dependencies);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset, setData };
};

/**
 * API hook with automatic execution on mount and caching
 */
export const useApiWithCache = (apiFunction, cacheKey, dependencies = [], options = {}) => {
  const { 
    enabled = true, 
    staleTime = CACHE_DURATION,
    onSuccess,
    onError 
  } = options;
  
  const [data, setData] = useState(() => getCachedData(cacheKey));
  const [loading, setLoading] = useState(!getCachedData(cacheKey) && enabled);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async (force = false) => {
    if (fetchingRef.current) return;
    
    // Check cache first
    if (!force) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        setData(cached);
        setLoading(false);
        return cached;
      }
    }

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction();
      if (mountedRef.current) {
        const responseData = result?.data || result;
        setData(responseData);
        setCacheData(cacheKey, responseData);
        setIsStale(false);
        onSuccess?.(responseData);
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        onError?.(err);
      }
      throw err;
    } finally {
      fetchingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction, cacheKey, onSuccess, onError]);

  // Auto-fetch on mount
  useEffect(() => {
    if (enabled && !getCachedData(cacheKey)) {
      fetchData();
    }
  }, [enabled, cacheKey, ...dependencies]);

  // Mark as stale after staleTime
  useEffect(() => {
    if (data && staleTime > 0) {
      const timer = setTimeout(() => {
        setIsStale(true);
      }, staleTime);
      return () => clearTimeout(timer);
    }
  }, [data, staleTime]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);
  const invalidate = useCallback(() => {
    clearCache(cacheKey);
    setIsStale(true);
  }, [cacheKey]);

  return { data, loading, error, isStale, refetch, invalidate };
};

/**
 * API hook for paginated data
 */
export const usePaginatedApi = (apiFunction, options = {}) => {
  const {
    initialPage = 1,
    pageSize = 10,
    cacheKey = null
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchPage = useCallback(async (pageNum, append = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction({ page: pageNum, limit: pageSize });
      if (mountedRef.current) {
        const items = result?.data || result?.items || result || [];
        const totalCount = result?.total || result?.pagination?.total || items.length;
        
        setData(prev => append ? [...prev, ...items] : items);
        setTotal(totalCount);
        setHasMore(items.length === pageSize && data.length + items.length < totalCount);
        setPage(pageNum);
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction, pageSize, loading]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchPage(page + 1, true);
    }
  }, [fetchPage, page, hasMore, loading]);

  const refresh = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    fetchPage(initialPage, false);
  }, [fetchPage, initialPage]);

  const goToPage = useCallback((pageNum) => {
    fetchPage(pageNum, false);
  }, [fetchPage]);

  return {
    data,
    loading,
    error,
    page,
    hasMore,
    total,
    totalPages: Math.ceil(total / pageSize),
    loadMore,
    refresh,
    goToPage,
    setData
  };
};

/**
 * Hook for infinite scroll with intersection observer
 */
export const useInfiniteScroll = (callback, options = {}) => {
  const { threshold = 0.1, rootMargin = '100px' } = options;
  const observerRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(target);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, threshold, rootMargin]);

  return targetRef;
};

/**
 * Debounced API call hook (for search)
 */
export const useDebouncedApi = (apiFunction, delay = 300) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback((...args) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError(null);

    timeoutRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();
      
      try {
        const result = await apiFunction(...args);
        if (mountedRef.current) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (err.name !== 'AbortError' && mountedRef.current) {
          setError(err);
          setLoading(false);
        }
      }
    }, delay);
  }, [apiFunction, delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
  }, []);

  return { data, loading, error, execute, cancel };
};

/**
 * Hook for mutation (POST, PUT, DELETE) with optimistic updates
 */
export const useMutation = (mutationFn, options = {}) => {
  const { onSuccess, onError, invalidateKeys = [] } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(async (variables) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result);
      
      // Invalidate related caches
      invalidateKeys.forEach(key => clearCache(key));
      
      onSuccess?.(result, variables);
      return result;
    } catch (err) {
      setError(err);
      onError?.(err, variables);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, onSuccess, onError, invalidateKeys]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, loading, error, data, reset };
};

export default useApi;
