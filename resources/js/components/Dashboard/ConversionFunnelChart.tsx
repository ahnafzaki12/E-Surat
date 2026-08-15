import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

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
      borderRadiusApplication: 'end', // "around" or "end"
      borderRadiusWhenStacked: 'last',
      columnWidth: '45%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
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
  },
  fill: {
    opacity: 1,
  },
  colors: ['#2A31D8', '#465FFF', '#7592FF', '#B9E6FE'],
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
};

const series = [
  {
    name: 'Ad Impression',
    data: [44, 55, 41, 67, 22, 43, 54, 40],
  },
  {
    name: 'Website Session',
    data: [13, 23, 20, 8, 13, 27, 13, 24],
  },
  {
    name: 'App Download',
    data: [11, 17, 15, 15, 21, 14, 18, 20],
  },
  {
    name: 'New Users',
    data: [21, 7, 25, 13, 22, 8, 18, 20],
  },
];

const ConversionFunnelChart: React.FC = () => {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          Conversion Funnel
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

      <div className="mt-4 -ml-2 h-[350px]">
        <ReactApexChart
          options={chartOptions}
          series={series}
          type="bar"
          height="100%"
        />
      </div>
    </div>
  );
};

export default ConversionFunnelChart;
