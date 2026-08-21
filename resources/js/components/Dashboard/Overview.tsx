import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';

interface OverviewProps {
  period?: 'weekly' | 'monthly' | 'yearly';
  onPeriodChange?: (period: 'weekly' | 'monthly' | 'yearly') => void;
}

const Overview: React.FC<OverviewProps> = ({ period: externalPeriod, onPeriodChange }) => {
  const { props } = usePage();
  const [internalPeriod, setInternalPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  
  const currentPeriod = externalPeriod || internalPeriod;

  const handlePeriodClick = (p: 'weekly' | 'monthly' | 'yearly') => {
    setInternalPeriod(p);
    if (onPeriodChange) {
      onPeriodChange(p);
    }
  };

  const rawStats = (props.stats as {
    disetujui?: number;
    menunggu_persetujuan?: number;
    draft?: number;
    ditolak?: number;
  }) || {};

  const statsData = {
    disetujui: rawStats.disetujui ?? 0,
    menunggu_persetujuan: rawStats.menunggu_persetujuan ?? 0,
    draft: rawStats.draft ?? 0,
    ditolak: rawStats.ditolak ?? 0,
  };

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#243044] dark:bg-[#111827] sm:p-6 transition-colors duration-200">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-gray-800 dark:text-[#F8FAFC] sm:text-xl">
          Overview E-Surat
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Buttons */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 p-1 dark:border-[#243044] dark:bg-[#172033]">
            <button
              onClick={() => handlePeriodClick('weekly')}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-all ${
                currentPeriod === 'weekly'
                  ? 'bg-white text-gray-800 shadow-sm dark:bg-[#0F172A] dark:text-[#F8FAFC]'
                  : 'text-gray-500 hover:text-gray-800 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => handlePeriodClick('monthly')}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-all ${
                currentPeriod === 'monthly'
                  ? 'bg-white text-gray-800 shadow-sm dark:bg-[#0F172A] dark:text-[#F8FAFC]'
                  : 'text-gray-500 hover:text-gray-800 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handlePeriodClick('yearly')}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-all ${
                currentPeriod === 'yearly'
                  ? 'bg-white text-gray-800 shadow-sm dark:bg-[#0F172A] dark:text-[#F8FAFC]'
                  : 'text-gray-500 hover:text-gray-800 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid inside a 3-column bordered container */}
      <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-gray-200 dark:border-[#243044] md:grid-cols-3">
        {/* Surat Ditandatangani */}
        <div className="border-b border-gray-200 p-5 md:border-b-0 md:border-r dark:border-[#243044]">
          <p className="text-sm font-medium text-gray-500 dark:text-[#94A3B8]">
            Surat Ditandatangani
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-[#F8FAFC]">
              {statsData.disetujui}
            </h4>
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-emerald-950/40 dark:text-[#22C55E] dark:border dark:border-emerald-800/30">
              {statsData.disetujui > 0 ? '+100%' : '0%'}
            </span>
          </div>
        </div>

        {/* Menunggu Persetujuan */}
        <div className="border-b border-gray-200 p-5 md:border-b-0 md:border-r dark:border-[#243044]">
          <p className="text-sm font-medium text-gray-500 dark:text-[#94A3B8]">
            Menunggu Persetujuan
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-[#F8FAFC]">
              {statsData.menunggu_persetujuan}
            </h4>
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-emerald-950/40 dark:text-[#22C55E] dark:border dark:border-emerald-800/30">
              {statsData.menunggu_persetujuan > 0 ? '+100%' : '0%'}
            </span>
          </div>
        </div>

        {/* Surat Ditolak */}
        <div className="p-5">
          <p className="text-sm font-medium text-gray-500 dark:text-[#94A3B8]">
            Surat Ditolak
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-[#F8FAFC]">
              {statsData.ditolak}
            </h4>
            <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-[#EF4444] dark:border dark:border-red-800/30">
              {statsData.ditolak > 0 ? '+100%' : '0%'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
