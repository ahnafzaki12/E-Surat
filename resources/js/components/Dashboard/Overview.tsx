import React from 'react';
import { usePage } from '@inertiajs/react';

const Overview: React.FC = () => {
  const { props } = usePage();
  const stats = (props.stats as {
    disetujui: number;
    menunggu_persetujuan: number;
    draft: number;
    ditolak: number;
  }) || {
    disetujui: 0,
    menunggu_persetujuan: 0,
    draft: 0,
    ditolak: 0,
  };

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white sm:text-xl">
          Overview E-Surat
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Buttons */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-800">
            <button className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm dark:bg-gray-900 dark:text-white">
              Weekly
            </button>
            <button className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
              Monthly
            </button>
            <button className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
              Yearly
            </button>
          </div>

          {/* Filter Button */}
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
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

      {/* Metrics Grid inside a bordered container */}
      <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 md:grid-cols-2 xl:grid-cols-4">
        {/* Total Surat Disetujui */}
        <div className="border-b border-gray-200 p-5 md:border-r xl:border-b-0 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Surat Tertanda Tangan
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.disetujui}
            </h4>
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
              +2.5%
            </span>
          </div>
        </div>

        {/* Menunggu Persetujuan */}
        <div className="border-b border-gray-200 p-5 xl:border-r xl:border-b-0 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Menunggu Persetujuan
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.menunggu_persetujuan}
            </h4>
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
              +9.5%
            </span>
          </div>
        </div>

        {/* Draft Surat */}
        <div className="border-b border-gray-200 p-5 md:border-r xl:border-b-0 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Draft Surat
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.draft}
            </h4>
            <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">
              -1.6%
            </span>
          </div>
        </div>

        {/* Surat Ditolak */}
        <div className="p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Surat Ditolak
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.ditolak}
            </h4>
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-400">
              +3.5%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
