import React, { useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import Overview from '../../components/Dashboard/Overview';
import MiniChartsRow from '../../components/Dashboard/MiniChartsRow';
import ConversionFunnelChart from '../../components/Dashboard/ConversionFunnelChart';
import PerformanceAndSales from '../../components/Dashboard/PerformanceAndSales';

export default function Home() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');

  return (
    <>
      <PageMeta
        title="Dashboard E-Surat | Pondok Pesantren Islamiyah Syafi'iyah"
        description="Dashboard Administrasi Surat Pondok Pesantren Islamiyah Syafi'iyah"
      />
      <Overview period={period} onPeriodChange={setPeriod} />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Left Column (Mini Charts + Funnel) */}
        <div className="col-span-12 flex flex-col gap-4 md:gap-6 xl:col-span-8">
          <MiniChartsRow period={period} />
          <ConversionFunnelChart />
        </div>

        {/* Right Column (Performance & Sales) */}
        <div className="col-span-12 xl:col-span-4">
          <PerformanceAndSales period={period} />
        </div>
      </div>
    </>
  );
}
