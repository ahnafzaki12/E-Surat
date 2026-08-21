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

const ConversionFunnelChart: React.FC = () => {
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
          colors: '#667085',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#667085',
          fontSize: '12px',
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
        colors: '#667085',
      },
    },
    fill: {
      opacity: 1,
    },
    colors: seriesColors.length > 0 ? seriesColors : ['#3046C8'],
    grid: {
      strokeDashArray: 0,
      borderColor: '#f2f4f7',
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
      y: {
        formatter: (val: number) => `${val} Surat`,
      },
    },
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Statistik Surat Masuk
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Jumlah surat masuk per bulan berdasarkan lembaga
          </p>
        </div>

        {/* Dynamic Lembaga Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="filter-lembaga" className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Filter Lembaga:
          </label>
          <select
            id="filter-lembaga"
            value={selectedLembagaId}
            onChange={(e) => setSelectedLembagaId(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
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

export default ConversionFunnelChart;
