'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import KPICard from '@/components/ui/KPICard'
import BrandBadge from '@/components/ui/BrandBadge'
import ForecastGauge from '@/components/ui/ForecastGauge'
import EmptyState from '@/components/ui/EmptyState'
import HotelCharts from './HotelCharts'
import { HOTELS, getStatsForHotel, getLatestStats } from '@/lib/mock/data'

export default function HotelDetailClient({ hotelId }: { hotelId: string }) {
  const basePath = '/nightaudit'
  const hotel = HOTELS.find(h => h.id === hotelId)
  const allStats = useMemo(() => getStatsForHotel(hotelId), [hotelId])
  const latest = useMemo(() => getLatestStats(hotelId), [hotelId])

  const [page, setPage] = useState(0)
  const pageSize = 15
  const totalPages = Math.ceil(allStats.length / pageSize)
  const pageStats = allStats.slice().reverse().slice(page * pageSize, (page + 1) * pageSize)

  if (!hotel) {
    return <EmptyState title="Hotel Not Found" description="This hotel does not exist." actionLabel="Back to Dashboard" actionHref="/dashboard" />
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`${basePath}/dashboard`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-[#2d3436] tracking-tight" style={{ textShadow: '0 1px 0 #fff' }}>
              {hotel.name}
            </h1>
            <BrandBadge brand={hotel.brand} />
          </div>
          <p className="font-mono text-[10px] text-[#a3b1c6] uppercase tracking-wider mt-1">
            {hotel.propertyCode} &middot; {hotel.totalRooms} rooms &middot; {hotel.timezone}
          </p>
        </div>
        <div className={`w-3 h-3 rounded-full ${latest ? 'led-green' : 'led-red'}`} />
      </div>

      {!latest ? (
        <EmptyState title="No Data Yet" description="Upload a report to see stats." actionLabel="Upload Report" actionHref="/upload" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
            <KPICard label="Occupancy" value={latest.occupancyToday?.toFixed(1) ?? '—'} suffix="%" mtd={latest.occupancyMTD?.toFixed(1)} ytd={latest.occupancyYTD?.toFixed(1)} trend={(latest.occupancyToday ?? 0) > 70 ? 'up' : 'down'} />
            <KPICard label="ADR" value={latest.adrToday?.toFixed(0) ?? '—'} prefix="$" mtd={latest.adrMTD?.toFixed(0)} ytd={latest.adrYTD?.toFixed(0)} trend="up" />
            <KPICard label="RevPAR" value={latest.revparToday?.toFixed(0) ?? '—'} prefix="$" mtd={latest.revparMTD?.toFixed(0)} ytd={latest.revparYTD?.toFixed(0)} />
            <KPICard label="Revenue" value={`${((latest.totalRevenueToday ?? 0) / 1000).toFixed(1)}K`} prefix="$" mtd={`${((latest.totalRevenueMTD ?? 0) / 1000).toFixed(0)}K`} trend="up" />
          </div>

          <div className="card-static screws p-5 animate-fade-up delay-1">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#4a5568] mb-3">Occupancy Forecast</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ForecastGauge label="Tomorrow" value={latest.occupancyTomorrow} />
              <ForecastGauge label="7-Day" value={latest.occupancyNext7Days} />
              <ForecastGauge label="14-Day" value={latest.occupancyNext14Days} />
              <ForecastGauge label="31-Day" value={latest.occupancyNext31Days} />
            </div>
          </div>

          <div className="card-static screws p-5 animate-fade-up delay-2">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#4a5568] mb-3">30-Day Trends</h3>
            <HotelCharts stats={allStats} />
          </div>

          <div className="card-static screws overflow-hidden animate-fade-up delay-3">
            <div className="flex items-center justify-between px-5 py-3 border-b-2 border-[#d1d9e6]">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#4a5568]">Daily Reports</h3>
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
                  {pageStats.map(s => (
                    <tr key={s.id}>
                      <td>{s.date}</td>
                      <td style={{ color: (s.occupancyToday ?? 0) > 70 ? '#16a34a' : (s.occupancyToday ?? 0) > 50 ? '#f59e0b' : '#dc2626' }}>
                        {s.occupancyToday?.toFixed(1)}%
                      </td>
                      <td>${s.adrToday?.toFixed(2)}</td>
                      <td>${s.revparToday?.toFixed(2)}</td>
                      <td>${s.totalRevenueToday?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td>{s.roomsOccupied}/{s.availableRooms}</td>
                      <td>{s.arrivalsToday}</td>
                      <td>{s.departuresToday}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-5 py-2 border-t-2 border-[#d1d9e6]">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="btn btn-ghost btn-sm disabled:opacity-30">Prev</button>
              <span className="font-mono text-[11px] text-[#4a5568]">Page {page + 1} of {totalPages || 1}</span>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="btn btn-ghost btn-sm disabled:opacity-30">Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
