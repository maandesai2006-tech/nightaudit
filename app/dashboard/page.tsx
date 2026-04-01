'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import KPICard from '@/components/ui/KPICard'
import BrandBadge from '@/components/ui/BrandBadge'
import ForecastGauge from '@/components/ui/ForecastGauge'
import SyncIndicator from '@/components/ui/SyncIndicator'
import EmptyState from '@/components/ui/EmptyState'
import { getHotels, getLatestReport, getSyncStatus } from '@/lib/data'
import type { Hotel, DailyReport, SyncStatus } from '@/lib/types'

export default function DashboardPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [reports, setReports] = useState<Record<string, DailyReport | null>>({})
  const [sync, setSync] = useState<SyncStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [h, s] = await Promise.all([getHotels(), getSyncStatus()])
        setHotels(h)
        setSync(s)

        const reps: Record<string, DailyReport | null> = {}
        await Promise.all(
          h.map(async (hotel) => {
            reps[hotel.id] = await getLatestReport(hotel.id)
          })
        )
        setReports(reps)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const agg = useMemo(() => {
    const withStats = hotels.filter(h => reports[h.id])
    if (withStats.length === 0) return null
    const avgOcc = withStats.reduce((s, h) => s + (reports[h.id]?.occupancy_pct ?? 0), 0) / withStats.length
    const avgAdr = withStats.reduce((s, h) => s + (reports[h.id]?.adr ?? 0), 0) / withStats.length
    const avgRevpar = withStats.reduce((s, h) => s + (reports[h.id]?.revpar ?? 0), 0) / withStats.length
    const totalRev = withStats.reduce((s, h) => s + (reports[h.id]?.total_revenue ?? 0), 0)
    const avgOccMTD = withStats.reduce((s, h) => s + (reports[h.id]?.occupancy_mtd ?? 0), 0) / withStats.length
    const avgAdrMTD = withStats.reduce((s, h) => s + (reports[h.id]?.adr_mtd ?? 0), 0) / withStats.length
    return { avgOcc, avgAdr, avgRevpar, totalRev, avgOccMTD, avgAdrMTD }
  }, [hotels, reports])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-56 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (hotels.length === 0) {
    return <EmptyState title="No Hotels" description="Add your first hotel in Settings." actionLabel="Go to Settings" actionHref="/settings" />
  }

  // Sort: live properties first
  const sorted = [...hotels].sort((a, b) => (b.live ? 1 : 0) - (a.live ? 1 : 0))

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)] tracking-tight">
            Portfolio Overview
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wider">
            {hotels.length} properties
          </p>
        </div>
        <SyncIndicator sync={sync} />
      </div>

      {/* Aggregate KPIs */}
      {agg && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
          <KPICard label="Avg Occupancy" value={agg.avgOcc.toFixed(1)} suffix="%" mtd={agg.avgOccMTD.toFixed(1)} trend={agg.avgOcc > 65 ? 'up' : 'down'} />
          <KPICard label="Avg ADR" value={agg.avgAdr.toFixed(0)} prefix="$" mtd={agg.avgAdrMTD.toFixed(0)} trend="up" />
          <KPICard label="Avg RevPAR" value={agg.avgRevpar.toFixed(0)} prefix="$" trend={agg.avgRevpar > 80 ? 'up' : 'neutral'} />
          <KPICard label="Total Revenue" value={`${(agg.totalRev / 1000).toFixed(1)}K`} prefix="$" trend="up" />
        </div>
      )}

      {/* Hotel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sorted.map((hotel, i) => {
          const stats = reports[hotel.id]
          const isLive = hotel.live

          return (
            <Link
              key={hotel.id}
              href={`/dashboard/${hotel.id}`}
              className={`card p-5 no-underline block animate-fade-up delay-${Math.min(i + 1, 5)} ${!isLive ? 'opacity-75' : ''}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[var(--text)] truncate">{hotel.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <BrandBadge brand={hotel.brand} />
                    <span className="font-mono text-[0.6rem] text-[var(--text-faint)]">{hotel.property_code}</span>
                    <span className="font-mono text-[0.6rem] text-[var(--text-faint)]">{hotel.total_rooms} rooms</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                  <div className={isLive ? 'dot-live' : 'dot-offline'} />
                  <span className={`font-mono text-[0.55rem] uppercase tracking-wider font-semibold ${isLive ? 'text-[var(--success)]' : 'text-[var(--text-faint)]'}`}>
                    {isLive ? 'Live' : 'Pending'}
                  </span>
                </div>
              </div>

              {stats ? (
                <>
                  {/* KPI Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { label: 'Occ%', value: stats.occupancy_pct?.toFixed(1) ?? '\u2014', color: (stats.occupancy_pct ?? 0) > 70 ? 'var(--success)' : 'var(--warning)' },
                      { label: 'ADR', value: `$${stats.adr?.toFixed(0) ?? '\u2014'}`, color: 'var(--text)' },
                      { label: 'RevPAR', value: `$${stats.revpar?.toFixed(0) ?? '\u2014'}`, color: 'var(--text)' },
                      { label: 'Revenue', value: `$${((stats.total_revenue ?? 0) / 1000).toFixed(1)}K`, color: 'var(--text)' },
                    ].map(kpi => (
                      <div key={kpi.label} className="rounded-lg p-2 text-center" style={{ boxShadow: 'var(--shadow-recessed)' }}>
                        <div className="font-mono text-[0.5rem] uppercase tracking-wider text-[var(--text-faint)] font-semibold">{kpi.label}</div>
                        <div className="font-mono text-sm font-bold mt-0.5" style={{ color: kpi.color }}>{kpi.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Forecast */}
                  <div className="space-y-2">
                    <ForecastGauge label="Tomorrow" value={stats.tomorrow_occ_pct} />
                    <ForecastGauge label="7-Day" value={stats.next_7d_occ_pct} />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--muted)' }}>
                    <div className="flex items-center gap-1.5">
                      <Clock size={10} className="text-[var(--text-faint)]" />
                      <span className="font-mono text-[0.6rem] text-[var(--text-faint)]">
                        {stats.business_date}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-[var(--text-faint)]" />
                  </div>
                </>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-xs text-[var(--text-faint)]">
                    {isLive ? 'Awaiting first report' : 'Not yet automated'}
                  </p>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
