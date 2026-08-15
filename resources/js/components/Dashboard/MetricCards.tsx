import React from 'react';

const MetricCards: React.FC = () => {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {/* Total Revenue */}
        <div className="border-b border-gray-200 p-6 md:border-r xl:border-b-0 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Revenue
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h4 className="text-3xl font-bold text-black dark:text-white">
              $200,45.87
            </h4>
            <span className="flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/10 dark:text-success-500">
              +2.5%
            </span>
          </div>
        </div>

        {/* Active Users */}
        <div className="border-b border-gray-200 p-6 xl:border-r xl:border-b-0 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Active Users
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h4 className="text-3xl font-bold text-black dark:text-white">
              9,528
            </h4>
            <span className="flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/10 dark:text-success-500">
              +9.5%
            </span>
          </div>
        </div>

        {/* Customer Lifetime Value */}
        <div className="border-b border-gray-200 p-6 md:border-r xl:border-b-0 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Customer Lifetime Value
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h4 className="text-3xl font-bold text-black dark:text-white">
              $849.54
            </h4>
            <span className="flex items-center gap-1 rounded-full bg-error-50 px-2 py-0.5 text-xs font-medium text-error-600 dark:bg-error-500/10 dark:text-error-500">
              -1.6%
            </span>
          </div>
        </div>

        {/* Customer Acquisition Cost */}
        <div className="p-6">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Customer Acquisition Cost
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h4 className="text-3xl font-bold text-black dark:text-white">
              9,528
            </h4>
            <span className="flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/10 dark:text-success-500">
              +3.5%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCards;
