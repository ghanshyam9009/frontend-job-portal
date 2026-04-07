import React from 'react';

const SkeletonJobCard = ({ count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Company Logo and Title */}
      <div className="flex items-start gap-2 mb-3">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        <div className="flex-1">
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Job Details */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Description */}
      <div className="space-y-2 mb-3">
        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 w-4/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Skills */}
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    </div>
  ));

  return <>{skeletons}</>;
};

export default SkeletonJobCard;










