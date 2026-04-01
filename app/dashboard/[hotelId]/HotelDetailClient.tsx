'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Clock } from 'lucide-react'
import KPICard from '@/components/ui/KPICard'
import BrandBadge from '@/components/ui/BrandBadge'
import ForecastGauge from '@/components/ui/ForecastGauge'
import EmptyState from '@/components/ui/EmptyState'
import HotelCharts from './HotelCharts'
import { getHotels, getLatestReport, getReportsForHotel } from '@/lib/data'
import type { Hotel, DailyReport } from '@/lib/types'

export default function HotelDetailClient({ hotelId }: { hotelId: string }) {
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [latest, setLatest] = useState<DailyReport | null>(null)
  const [allReports, setAllReports] = useState<DailyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const pageSize = 15

  useEffect(() => {
    async function load() {
      try {
        const hotels = await getHotels()
        const h = hotels.find(h => h.id === hotelId) || null
        setHotel(h)
        if (h) {
          const [l, r] = await Promise.all([
            getLatestReport(hotelId),
            getReportsForHotel(hotelId),
          ])
          setLatest(l)
          setAllReports(r)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [hotelId])

  const totalPages = Math.ceil(allReports.length / pageSize)
  const pageReports = allReports.slice().reverse().slice(page * pageSize, (page + 1) * pageSize)

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <div className="skeleton h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!hotel) {
    return <EmptyState title="Hotel Not Found" description="This hotel does not exist." actionLabel="Back to Dashboard" actionHref="/dashboard" />
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-7">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-extrabold text-[var(--text)] tracking-tight">
              {hotel.name}
            </h1>
            <BrandBadge brand={hotel.brand} />
            <span className={`badge ${hotel.live ? 'badge-live' : 'badge-placeholder'}`}>
              {hotel.live ? 'Live' : 'Pending'}
            </span>
          </div>
          <p className="font-mono text-[0.6rem] text-[var(--text-faint)] uppercase tracking-wider mt-1">
            {hotel.property_code} &middot; {hotel.total_rooms} rooms &middot; {hotel.timezone}
          </p>
        </div>
        {latest && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Clock size={12} className="text-[var(--text-faint)]" />
            <span className="font-mono text-[0.6rem] text-[var(--text-faint)]">{latest.business_date}</span>
          </div>
        )}
      </div>

      {!latest ? (
        <EmptyState
          title="No Data Yet"
          description={hotel.live ? 'Waiting for the first report email to arrive.' : 'This property is not yet automated. Enable it in Supabase to start receiving data.'}
          actionLabel="Upload Report"
          actionHref="/upload"
        />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
            <KPICard label="Occupancy" value={latest.occupancy_pct?.toFixed(1) ?? '\u2014'} suffix="%" mtd={latest.occupancy_mtd?.toFixed(1)} ytd={latest.occupancy_ytd?.toFixed(1)} trend={(latest.occupancy_pct ?? 0) > 70 ? 'up' : 'down'} />
            <KPICard label="ADR" value={latest.adr?.toFixed(0) ?? '\u2014'} prefix="$" mtd={latest.adr_mtd?.toFixed(0)} ytd={latest.adr_ytd?.toFixed(0)} trend="up" />
            <KPICard label="RevPAR" value={latest.revpar?.toFixed(0) ?? '\u2014'} prefix="$" mtd={latest.revpar_mtd?.toFixed(0)} ytd={latest.revpar_ytd?.toFixed(0)} />
            <KPICard label="Revenue" value={`${((latest.total_revenue ?? 0) / 1000).toFixed(1)}K`} prefix="$" mtd={latest.total_revenue_mtd ? `${(latest.total_revenue_mtd / 1000).toFixed(0)}K` : undefined} trend="up" />
          </div>

          {/* Forecast */}
          <div className="card-static p-5 animate-fade-up delay-1">
            <h3 className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-4">Occupancy Forecast</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ForecastGauge label="Tomorrow" value={latest.tomorrow_occ_pct} />
              <ForecastGauge label="7-Day" value={latest.next_7d_occ_pct} />
              <ForecastGauge label="14-Day" value={latest.next_14d_occ_pct} />
              <ForecastGauge label="31-Day" value={latest.next_31d_occ_pct} />
            </div>
          </div>

          {/* Charts */}
          {allReports.length >= 2 && (
            <div className="card-static p-5 animate-fade-up delay-2">
              <h3 className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-4">30-Day Trends</h3>
              <HotelCharts reports={allReports} />
            </div>
          )}

          {/* Daily Reports Table */}
          <div className="card-static overflow-hidden animate-fade-up delay-3">
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--muted)' }}>
              <h3 className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Daily Reports</h3>
              <button className="btn btn-ghost btn-sm"><Download size={12} /> CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Occ%</th><th>ADR</th><th>RevPAR</th><th>Revenue</th>
                    <th>Rooms</th><th>Arrivals</th><th>Departures</th>
                  </tr>
                </thead>
                <tbody>
                  {pageReports.map(r => (
                    <tr key={r.id}>
                      <td>{r.business_date}</td>
                      <td style={{ color: (r.occupancy_pct ?? 0) > 70 ? '#16a34a' : (r.occupancy_pct ?? 0) > 50 ? '#f59e0b' : '#dc2626' }}>
                        {r.occupancy_pct?.toFixed(1)}%
                      </td>
                      <td>${r.adr?.toFixed(2)}</td>
                      <td>${r.revpar?.toFixed(2)}</td>
                      <td>${r.total_revenue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td>{r.rooms_occupied}/{r.available_rooms}</td>
                      <td>{r.arrivals}</td>
                      <td>{r.departures}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-2.5" style={{ borderTop: '1px solid var(--muted)' }}>
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn btn-ghost btn-sm disabled:opacity-30">Prev</button>
                <span className="font-mono text-[0.65rem] text-[var(--text-muted)]">Page {page + 1} of {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn btn-ghost btn-sm disabled:opacity-30">Next</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
