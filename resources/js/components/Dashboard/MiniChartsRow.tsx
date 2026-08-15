import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const sparklineOptionsRed: ApexOptions = {
  chart: {
    type: 'area',
    sparkline: {
      enabled: true,
    },
  },
  stroke: {
    curve: 'smooth',
    width: 2,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [50, 100],
    },
  },
  colors: ['#F04438'],
  tooltip: {
    fixed: {
      enabled: false,
    },
    x: {
      show: false,
    },
    y: {
      title: {
        formatter: function () {
          return '';
        },
      },
    },
    marker: {
      show: false,
    },
  },
};

const sparklineOptionsGreen: ApexOptions = {
  chart: {
    type: 'area',
    sparkline: {
      enabled: true,
    },
  },
  stroke: {
    curve: 'smooth',
    width: 2,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [50, 100],
    },
  },
  colors: ['#12B76A'],
  tooltip: {
    fixed: {
      enabled: false,
    },
    x: {
      show: false,
    },
    y: {
      title: {
        formatter: function () {
          return '';
        },
      },
    },
    marker: {
      show: false,
    },
  },
};

const MiniChartsRow: React.FC = () => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
      {/* Churn Rate */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-white">
              Churn Rate
            </h4>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Downgrade to Free plan
            </span>
          </div>
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
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.99996 4.99996C10.4602 4.99996 10.8333 4.62686 10.8333 4.16663C10.8333 3.70639 10.4602 3.33329 9.99996 3.33329C9.53972 3.33329 9.16663 3.70639 9.16663 4.16663C9.16663 4.62686 9.53972 4.99996 9.99996 4.99996Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.99996 16.6666C10.4602 16.6666 10.8333 16.2935 10.8333 15.8333C10.8333 15.3731 10.4602 14.9999 9.99996 14.9999C9.53972 14.9999 9.16663 15.3731 9.16663 15.8333C9.16663 16.2935 9.53972 16.6666 9.99996 16.6666Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
              4.26%
            </h4>
            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <span className="text-error-500">0.31%</span> than last Week
            </p>
          </div>
          <div className="w-[100px]">
            <ReactApexChart
              options={sparklineOptionsRed}
              series={[{ data: [25, 66, 41, 89, 63, 25, 44, 12, 36, 9, 54] }]}
              type="area"
              height={40}
            />
          </div>
        </div>
      </div>

      {/* User Growth */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-white">
              User Growth
            </h4>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              New signups website + mobile
            </span>
          </div>
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
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.99996 4.99996C10.4602 4.99996 10.8333 4.62686 10.8333 4.16663C10.8333 3.70639 10.4602 3.33329 9.99996 3.33329C9.53972 3.33329 9.16663 3.70639 9.16663 4.16663C9.16663 4.62686 9.53972 4.99996 9.99996 4.99996Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.99996 16.6666C10.4602 16.6666 10.8333 16.2935 10.8333 15.8333C10.8333 15.3731 10.4602 14.9999 9.99996 14.9999C9.53972 14.9999 9.16663 15.3731 9.16663 15.8333C9.16663 16.2935 9.53972 16.6666 9.99996 16.6666Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
              3,768
            </h4>
            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <span className="text-success-500">+3.85%</span> than last Week
            </p>
          </div>
          <div className="w-[100px]">
            <ReactApexChart
              options={sparklineOptionsGreen}
              series={[{ data: [12, 14, 2, 47, 42, 15, 47, 75, 65, 19, 14] }]}
              type="area"
              height={40}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniChartsRow;
