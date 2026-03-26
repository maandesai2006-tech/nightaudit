'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import KPICard from '@/components/ui/KPICard'
import BrandBadge from '@/components/ui/BrandBadge'
import ForecastGauge from '@/components/ui/ForecastGauge'
import EmptyState from '@/components/ui/EmptyState'
import { HOTELS, getLatestStats } from '@/lib/mock/data'

export default function DashboardPage() {
  // links use plain paths

  const hotelData = useMemo(() => {
    return HOTELS.map(h => ({ hotel: h, stats: getLatestStats(h.id) }))
  }, [])

  const agg = useMemo(() => {
    const withStats = hotelData.filter(h => h.stats)
    if (withStats.length === 0) return null
    const avgOcc = withStats.reduce((s, h) => s + (h.stats!.occupancyToday ?? 0), 0) / withStats.length
    const avgAdr = withStats.reduce((s, h) => s + (h.stats!.adrToday ?? 0), 0) / withStats.length
    const avgRevpar = withStats.reduce((s, h) => s + (h.stats!.revparToday ?? 0), 0) / withStats.length
    const totalRev = withStats.reduce((s, h) => s + (h.stats!.totalRevenueToday ?? 0), 0)
    const avgOccMTD = withStats.reduce((s, h) => s + (h.stats!.occupancyMTD ?? 0), 0) / withStats.length
    const avgAdrMTD = withStats.reduce((s, h) => s + (h.stats!.adrMTD ?? 0), 0) / withStats.length
    return { avgOcc, avgAdr, avgRevpar, totalRev, avgOccMTD, avgAdrMTD }
  }, [hotelData])

  if (HOTELS.length === 0) {
    return <EmptyState title="No Hotels" description="Add your first hotel in Settings." actionLabel="Go to Settings" actionHref="/settings" />
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2d3436] tracking-tight" style={{ textShadow: '0 1px 0 #fff' }}>
            Portfolio Overview
          </h1>
          <p className="text-xs text-[#4a5568] mt-1 font-mono uppercase tracking-wider">
            {HOTELS.length} properties &middot; Last updated today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full led-green" />
          <span className="font-mono text-[10px] text-[#4a5568] uppercase tracking-wider font-bold">Live</span>
        </div>
      </div>

      {agg && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
          <KPICard label="Avg Occupancy" value={agg.avgOcc.toFixed(1)} suffix="%" mtd={agg.avgOccMTD.toFixed(1)} trend={agg.avgOcc > 65 ? 'up' : 'down'} />
          <KPICard label="Avg ADR" value={agg.avgAdr.toFixed(0)} prefix="$" mtd={agg.avgAdrMTD.toFixed(0)} trend="up" />
          <KPICard label="Avg RevPAR" value={agg.avgRevpar.toFixed(0)} prefix="$" trend={agg.avgRevpar > 80 ? 'up' : 'neutral'} />
          <KPICard label="Total Revenue" value={`${(agg.totalRev / 1000).toFixed(1)}K`} prefix="$" trend="up" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {hotelData.map(({ hotel, stats }, i) => (
          <Link
            key={hotel.id}
            href={`/dashboard/${hotel.id}`}
            className={`card screws p-5 no-underline block animate-fade-up delay-${Math.min(i + 1, 5)}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#2d3436]">{hotel.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <BrandBadge brand={hotel.brand} />
                  <span className="font-mono text-[10px] text-[#a3b1c6]">{hotel.propertyCode}</span>
                  <span className="font-mono text-[10px] text-[#a3b1c6]">{hotel.totalRooms} rooms</span>
                </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${stats ? 'led-green' : 'led-red'}`} />
            </div>

            {stats ? (
              <>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'Occ%', value: stats.occupancyToday?.toFixed(1) ?? '—', color: (stats.occupancyToday ?? 0) > 70 ? '#16a34a' : '#f59e0b' },
                    { label: 'ADR', value: `$${stats.adrToday?.toFixed(0) ?? '—'}`, color: '#2d3436' },
                    { label: 'RevPAR', value: `$${stats.revparToday?.toFixed(0) ?? '—'}`, color: '#2d3436' },
                    { label: 'Revenue', value: `$${((stats.totalRevenueToday ?? 0) / 1000).toFixed(1)}K`, color: '#2d3436' },
                  ].map(kpi => (
                    <div key={kpi.label} className="shadow-recessed rounded-lg p-2 text-center">
                      <div className="font-mono text-[8px] uppercase tracking-wider text-[#a3b1c6] font-bold">{kpi.label}</div>
                      <div className="font-mono text-sm font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <ForecastGauge label="Tomorrow" value={stats.occupancyTomorrow} />
                  <ForecastGauge label="7-Day" value={stats.occupancyNext7Days} />
                </div>
                <div className="mt-3 font-mono text-[9px] text-[#a3b1c6] uppercase tracking-wider">
                  Last report: {stats.date}
                </div>
              </>
            ) : (
              <p className="text-xs text-[#a3b1c6] italic">No reports uploaded yet</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
