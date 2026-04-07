// Virtualized List Component for rendering large lists efficiently
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';

/**
 * VirtualizedList - Only renders items that are visible in the viewport
 * Handles thousands of items without performance issues
 */
const VirtualizedList = memo(({
  items = [],
  itemHeight = 200,
  containerHeight = 600,
  overscan = 3, // Number of items to render outside visible area
  renderItem,
  className = '',
  emptyMessage = 'No items to display',
  loadMore,
  hasMore = false,
  loading = false,
  LoadingComponent = null
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 * overscan;
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);

    // Trigger loadMore when near bottom
    if (loadMore && hasMore && !loading) {
      const scrollBottom = newScrollTop + containerHeight;
      const threshold = totalHeight - containerHeight; // Load when 1 viewport from bottom
      if (scrollBottom >= threshold) {
        loadMore();
      }
    }
  }, [loadMore, hasMore, loading, totalHeight, containerHeight]);

  // Throttled scroll handler for better performance
  const throttledScrollHandler = useCallback(() => {
    let ticking = false;
    return (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll(e);
          ticking = false;
        });
        ticking = true;
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollHandler = throttledScrollHandler();
    container.addEventListener('scroll', scrollHandler, { passive: true });

    return () => {
      container.removeEventListener('scroll', scrollHandler);
    };
  }, [throttledScrollHandler]);

  // Get visible items
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    if (items[i]) {
      visibleItems.push({
        item: items[i],
        index: i,
        style: {
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight
        }
      });
    }
  }

  if (items.length === 0 && !loading) {
    return (
      <div className={`flex items-center justify-center py-12 text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, style }) => (
          <div key={item.id || item.job_id || index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      
      {/* Loading indicator at bottom */}
      {loading && (
        <div className="flex justify-center py-4">
          {LoadingComponent || (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          )}
        </div>
      )}
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

/**
 * Simple windowed list for grid layouts
 */
export const VirtualizedGrid = memo(({
  items = [],
  itemHeight = 300,
  itemWidth = 300,
  containerHeight = 600,
  gap = 16,
  columns = 3,
  overscan = 2,
  renderItem,
  className = '',
  emptyMessage = 'No items to display',
  loading = false
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // Calculate columns based on container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const actualColumns = containerWidth 
    ? Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)))
    : columns;

  const rowHeight = itemHeight + gap;
  const totalRows = Math.ceil(items.length / actualColumns);
  const totalHeight = totalRows * rowHeight;

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleRows = Math.ceil(containerHeight / rowHeight) + 2 * overscan;
  const endRow = Math.min(totalRows - 1, startRow + visibleRows);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  // Get visible items
  const visibleItems = [];
  for (let row = startRow; row <= endRow; row++) {
    for (let col = 0; col < actualColumns; col++) {
      const index = row * actualColumns + col;
      if (index < items.length) {
        visibleItems.push({
          item: items[index],
          index,
          style: {
            position: 'absolute',
            top: row * rowHeight,
            left: col * (itemWidth + gap),
            width: itemWidth,
            height: itemHeight
          }
        });
      }
    }
  }

  if (items.length === 0 && !loading) {
    return (
      <div className={`flex items-center justify-center py-12 text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, style }) => (
          <div key={item.id || item.job_id || index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

VirtualizedGrid.displayName = 'VirtualizedGrid';

export default VirtualizedList;









