import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { usePage } from '@inertiajs/react';

// Elegant Muted Base Palette requested by user
const BASE_PALETTE = [
  '#3046C8',
  '#4F64E8',
  '#6E83ED',
  '#8B7FE8',
  '#6FB6A3',
  '#D6A85A',
  '#C96B6B',
];

// Generate consistent color based on index with HSL fallback for scalabilty
const getLembagaColor = (index: number): string => {
  if (index >= 0 && index < BASE_PALETTE.length) {
    return BASE_PALETTE[index];
  }
  const hue = (index * 137.5) % 360;
  return `hsl(${Math.round(hue)}, 55%, 52%)`;
};

interface BackendLembagaStat {
  id: number;
  name: string;
  data: number[];
}

const StatistikSuratMasuk: React.FC = () => {
  const { props } = usePage();
  const [selectedLembagaId, setSelectedLembagaId] = useState<string>('Semua');

  const rawLembagaStats = (props.lembagaStats as BackendLembagaStat[]) || [];

  // Map backend stats with consistent color indexing
  const indexedLembagas = rawLembagaStats.map((item, idx) => ({
    ...item,
    color: getLembagaColor(idx),
  }));

  // Filter series based on selected lembaga ID
  const activeSeriesList = selectedLembagaId === 'Semua'
    ? indexedLembagas
    : indexedLembagas.filter((item) => String(item.id) === selectedLembagaId);

  const seriesData = activeSeriesList.map((item) => ({
    name: item.name,
    data: item.data && item.data.length > 0 ? item.data : [0, 0, 0, 0, 0, 0, 0, 0],
  }));

  const seriesColors = activeSeriesList.map((item) => item.color);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last',
        columnWidth: '45%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu'],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#94A3B8',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      decimalsInFloat: 0,
      labels: {
        style: {
          colors: '#94A3B8',
          fontSize: '12px',
        },
        formatter: (val: number) => {
          if (val % 1 === 0) {
            return val.toFixed(0);
          }
          return '';
        },
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      markers: {
        size: 6,
      },
      labels: {
        colors: '#CBD5E1',
      },
    },
    fill: {
      opacity: 1,
    },
    colors: seriesColors.length > 0 ? seriesColors : ['#3046C8'],
    grid: {
      strokeDashArray: 0,
      borderColor: 'rgba(36, 48, 68, 0.5)',
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val: number) => `${val} Surat`,
      },
    },
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 dark:border-[#243044] dark:bg-[#111827] transition-colors duration-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-[#F8FAFC]">
            Statistik Surat Masuk
          </h3>
          <p className="text-xs text-gray-500 dark:text-[#94A3B8]">
            Jumlah surat masuk per bulan berdasarkan lembaga
          </p>
        </div>

        {/* Dynamic Lembaga Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="filter-lembaga" className="text-xs font-medium text-gray-500 dark:text-[#94A3B8]">
            Filter Lembaga:
          </label>
          <select
            id="filter-lembaga"
            value={selectedLembagaId}
            onChange={(e) => setSelectedLembagaId(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-[#243044] dark:bg-[#172033] dark:text-[#CBD5E1] dark:hover:bg-[#1E293B]"
          >
            <option value="Semua">Semua Lembaga</option>
            {indexedLembagas.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 -ml-2 h-[350px]">
        <ReactApexChart
          options={chartOptions}
          series={seriesData}
          type="bar"
          height="100%"
        />
      </div>
    </div>
  );
};

export default StatistikSuratMasuk;
