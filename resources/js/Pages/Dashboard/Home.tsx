import React, { useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import Overview from '../../components/Dashboard/Overview';
import MiniChartsRow from '../../components/Dashboard/MiniChartsRow';
import StatistikSuratMasuk from '../../components/Dashboard/StatistikSuratMasuk';
import ChartKanan from '../../components/Dashboard/ChartKanan';

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
        {/* Left Column (Mini Charts + Statistik Surat Masuk) */}
        <div className="col-span-12 flex flex-col gap-4 md:gap-6 xl:col-span-8">
          <MiniChartsRow period={period} />
          <StatistikSuratMasuk />
        </div>

        {/* Right Column (Jenis Surat Chart) */}
        <div className="col-span-12 xl:col-span-4">
          <ChartKanan />
        </div>
      </div>
    </>
  );
}
