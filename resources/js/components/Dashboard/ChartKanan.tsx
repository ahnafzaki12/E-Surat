import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { usePage } from '@inertiajs/react';

interface BackendJenisSuratStat {
  id: number;
  kode: string;
  name: string;
  count: number;
}

const ChartKanan: React.FC = () => {
  const { props } = usePage();

  const jenisSuratList = (props.jenisSuratStats as BackendJenisSuratStat[]) || [];

  const categories = jenisSuratList.map((item) => item.name);
  const dataValues = jenisSuratList.map((item) => item.count ?? 0);
  const totalSurat = dataValues.reduce((acc, val) => acc + val, 0);

  const maxVal = Math.max(...dataValues, 10);

  const barChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '45%',
        distributed: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: categories.length > 0 ? categories : ['Belum ada jenis surat'],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#94A3B8',
          fontSize: '11px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94A3B8',
          fontSize: '12px',
        },
      },
      min: 0,
      max: maxVal,
      tickAmount: 5,
    },
    grid: {
      strokeDashArray: 0,
      borderColor: 'rgba(36, 48, 68, 0.5)',
    },
    fill: {
      opacity: 1,
    },
    colors: ['#4F64E8'],
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex }) {
        const item = jenisSuratList[dataPointIndex];
        const name = item ? item.name : categories[dataPointIndex];
        const val = series[seriesIndex][dataPointIndex];
        return `<div class="px-3 py-2 text-xs bg-[#172033] border border-[#243044] text-[#F8FAFC] rounded-md shadow-lg"><strong>${name}</strong>: ${val} surat</div>`;
      },
    },
  };

  const barSeries = [
    {
      name: 'Jumlah Surat',
      data: dataValues.length > 0 ? dataValues : [0],
    },
  ];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 dark:border-[#243044] dark:bg-[#111827] transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-[#F8FAFC]">
            Jenis Surat
          </h3>
          <p className="text-xs text-gray-500 dark:text-[#94A3B8]">
            Jumlah surat berdasarkan jenis surat
          </p>
        </div>
        <button className="text-gray-500 hover:text-black dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] transition-colors duration-200">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.99996 10.8333C10.4602 10.8333 10.8333 10.4602 10.8333 9.99996C10.8333 9.53972 10.4602 9.16663 9.99996 9.16663C9.53972 9.16663 9.16663 9.53972 9.16663 9.99996C9.16663 10.4602 9.53972 10.8333 9.99996 10.8333Z"
              fill="currentColor"
            />
            <path
              d="M9.99996 4.99996C10.4602 4.99996 10.8333 4.62686 10.8333 4.16663C10.8333 3.70639 10.4602 3.33329 9.99996 3.33329C9.53972 3.33329 9.16663 3.70639 9.16663 4.16663C9.16663 4.62686 9.53972 4.99996 9.99996 4.99996Z"
              fill="currentColor"
            />
            <path
              d="M9.99996 16.6666C10.4602 16.6666 10.8333 16.2935 10.8333 15.8333C10.8333 15.3731 10.4602 14.9999 9.99996 14.9999C9.53972 14.9999 9.16663 15.3731 9.16663 15.8333C9.16663 16.2935 9.53972 16.6666 9.99996 16.6666Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      {/* Metric Summary */}
      <div className="mt-6 border-b border-gray-200 pb-6 dark:border-[#243044]">
        <p className="text-sm font-medium text-gray-500 dark:text-[#94A3B8]">
          Total Surat Terdaftar
        </p>
        <div className="mt-2 flex items-center justify-between">
          <h4 className="text-2xl font-bold text-black dark:text-[#F8FAFC]">
            {totalSurat} Surat
          </h4>
          <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-emerald-950/40 dark:text-[#22C55E] dark:border dark:border-emerald-800/30">
            {totalSurat > 0 ? '+100%' : '0%'}
          </span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="mt-6 flex-1">
        <div className="-ml-4 -mr-2 h-[280px]">
          <ReactApexChart
            options={barChartOptions}
            series={barSeries}
            type="bar"
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default ChartKanan;
