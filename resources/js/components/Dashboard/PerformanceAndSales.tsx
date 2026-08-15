import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const barChartOptions: ApexOptions = {
  chart: {
    type: 'bar',
    toolbar: {
      show: false,
    },
    animations: {
      enabled: false,
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '40%',
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
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
    min: 0,
    max: 400,
    tickAmount: 4,
  },
  grid: {
    strokeDashArray: 0,
    borderColor: '#f2f4f7',
  },
  fill: {
    opacity: 1,
  },
  colors: ['#465fff'],
};

const barSeries = [
  {
    name: 'Sales',
    data: [160, 380, 195, 290, 180, 190, 175],
  },
];

const PerformanceAndSales: React.FC = () => {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          Product Performance
        </h3>
        <button className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
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

      {/* Tabs */}
      <div className="mt-6 grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-1 dark:bg-gray-800">
        <button className="rounded-md bg-white py-2 text-sm font-medium text-black shadow-sm dark:bg-gray-900 dark:text-white">
          Daily Sales
        </button>
        <button className="rounded-md py-2 text-sm font-medium text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
          Online Sales
        </button>
        <button className="rounded-md py-2 text-sm font-medium text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">
          New Users
        </button>
      </div>

      {/* Metrics */}
      <div className="mt-6 flex border-b border-gray-200 pb-6 dark:border-gray-800">
        <div className="w-1/2 border-r border-gray-200 pr-6 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Digital Product
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex items-center justify-center rounded-full bg-success-50 p-1 text-success-600 dark:bg-success-500/10 dark:text-success-500">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 10.5V1.5M6 1.5L1.5 6M6 1.5L10.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h4 className="text-xl font-bold text-black dark:text-white">790</h4>
          </div>
        </div>
        <div className="w-1/2 pl-6">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Physical Product
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="flex items-center justify-center rounded-full bg-error-50 p-1 text-error-600 dark:bg-error-500/10 dark:text-error-500">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1.5V10.5M6 10.5L1.5 6M6 10.5L10.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h4 className="text-xl font-bold text-black dark:text-white">572</h4>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Average Daily Sales
            </p>
            <h4 className="mt-1 text-2xl font-bold text-black dark:text-white">
              $2,950
            </h4>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-error-50 px-2 py-0.5 text-xs font-medium text-error-600 dark:bg-error-500/10 dark:text-error-500">
            ↓ 0.52%
          </span>
        </div>

        <div className="mt-4 -ml-4 -mr-2">
          <ReactApexChart
            options={barChartOptions}
            series={barSeries}
            type="bar"
            height={260}
          />
        </div>
      </div>
    </div>
  );
};

export default PerformanceAndSales;
