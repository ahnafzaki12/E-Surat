import React from 'react';

const OverviewHeader: React.FC = () => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md font-bold text-black dark:text-white">
        Overview
      </h2>

      <div className="flex flex-wrap items-center gap-3">
        {/* Toggle Buttons */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
          <button className="rounded-md bg-white px-3 py-1 text-sm font-medium text-black shadow-sm dark:bg-gray-800 dark:text-white">
            Weekly
          </button>
          <button className="rounded-md px-3 py-1 text-sm font-medium text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
            Monthly
          </button>
          <button className="rounded-md px-3 py-1 text-sm font-medium text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
            Yearly
          </button>
        </div>

        {/* Filter Button */}
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 4.66667H14M4 8H12M6 11.3333H10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Filter
        </button>
      </div>
    </div>
  );
};

export default OverviewHeader;
