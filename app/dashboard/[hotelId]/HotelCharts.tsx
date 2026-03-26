'use client'

import type { MockDailyStat } from '@/lib/mock/data'

interface Props {
  stats: MockDailyStat[]
}

function MiniChart({ data, label, color, format }: { data: number[]; label: string; color: string; format: (v: number) => string }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 400, h = 80
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
  const latest = data[data.length - 1]

  return (
    <div className="shadow-recessed rounded-xl p-4 bg-[#e0e5ec] relative">
      <div className="flex justify-between items-baseline mb-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#4a5568] font-bold">{label}</span>
        <span className="font-mono text-sm font-bold" style={{ color }}>{format(latest)}</span>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${h} ${points} ${w},${h}`} fill={`url(#grad-${label})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export default function HotelCharts({ stats }: Props) {
  const occ = stats.map(s => s.occupancyToday ?? 0)
  const adr = stats.map(s => s.adrToday ?? 0)
  const revpar = stats.map(s => s.revparToday ?? 0)
  const rev = stats.map(s => s.totalRevenueToday ?? 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MiniChart data={occ} label="Occupancy" color="#f59e0b" format={v => `${v.toFixed(1)}%`} />
      <MiniChart data={adr} label="ADR" color="#3b82f6" format={v => `$${v.toFixed(0)}`} />
      <MiniChart data={revpar} label="RevPAR" color="#22c55e" format={v => `$${v.toFixed(0)}`} />
      <MiniChart data={rev} label="Revenue" color="#ff4757" format={v => `$${(v / 1000).toFixed(1)}K`} />
    </div>
  )
}
