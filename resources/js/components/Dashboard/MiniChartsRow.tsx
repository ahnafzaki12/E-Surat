import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { usePage } from '@inertiajs/react';

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
      opacityFrom: 0.35,
      opacityTo: 0.05,
      stops: [50, 100],
    },
  },
  colors: ['#4F64E8'],
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

interface MiniChartsRowProps {
  period?: 'weekly' | 'monthly' | 'yearly';
}

const MiniChartsRow: React.FC<MiniChartsRowProps> = () => {
  const { props } = usePage();

  const suratMasukProp = (props.suratMasuk as {
    total?: number;
    monthly_trend?: number[];
  }) || {};

  const suratDisetujuiProp = (props.suratDisetujui as {
    total?: number;
    monthly_trend?: number[];
  }) || {};

  const suratMasukTotal = suratMasukProp.total ?? 0;
  const suratMasukSeries = suratMasukProp.monthly_trend && suratMasukProp.monthly_trend.length > 0
    ? suratMasukProp.monthly_trend
    : [0, 0, 0, 0, 0, 0, 0, 0];

  const suratSelesaiTotal = suratDisetujuiProp.total ?? 0;
  const suratSelesaiSeries = suratDisetujuiProp.monthly_trend && suratDisetujuiProp.monthly_trend.length > 0
    ? suratDisetujuiProp.monthly_trend
    : [0, 0, 0, 0, 0, 0, 0, 0];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      {/* Surat Masuk */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-[#243044] dark:bg-[#111827] transition-colors duration-200">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-[#F8FAFC]">
              Surat Masuk
            </h4>
            <span className="text-sm font-medium text-gray-500 dark:text-[#94A3B8]">
              Total surat masuk sistem
            </span>
          </div>
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-[#F8FAFC]">
              {suratMasukTotal}
            </h4>
            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-[#94A3B8]">
              <span className="text-green-600 dark:text-[#22C55E] font-semibold">
                {suratMasukTotal > 0 ? '+100%' : '0%'}
              </span>{' '}
              dari periode sebelumnya
            </p>
          </div>
          <div className="w-[100px]">
            <ReactApexChart
              options={sparklineOptionsGreen}
              series={[{ data: suratMasukSeries }]}
              type="area"
              height={40}
            />
          </div>
        </div>
      </div>

      {/* Surat Diselesaikan */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-[#243044] dark:bg-[#111827] transition-colors duration-200">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg font-bold text-gray-800 dark:text-[#F8FAFC]">
              Surat Diselesaikan
            </h4>
            <span className="text-sm font-medium text-gray-500 dark:text-[#94A3B8]">
              Surat disetujui & diproses
            </span>
          </div>
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-[#F8FAFC]">
              {suratSelesaiTotal}
            </h4>
            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-[#94A3B8]">
              <span className="text-green-600 dark:text-[#22C55E] font-semibold">
                {suratSelesaiTotal > 0 ? '+100%' : '0%'}
              </span>{' '}
              dari periode sebelumnya
            </p>
          </div>
          <div className="w-[100px]">
            <ReactApexChart
              options={sparklineOptionsGreen}
              series={[{ data: suratSelesaiSeries }]}
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
