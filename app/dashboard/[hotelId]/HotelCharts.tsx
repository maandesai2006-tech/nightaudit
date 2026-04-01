'use client'

import type { DailyReport } from '@/lib/types'

interface Props {
  reports: DailyReport[]
}

function MiniChart({ data, label, color, format }: { data: number[]; label: string; color: string; format: (v: number) => string }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 400, h = 72
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ')
  const latest = data[data.length - 1]

  return (
    <div className="rounded-xl p-4" style={{ boxShadow: 'var(--shadow-recessed)' }}>
      <div className="flex justify-between items-baseline mb-2">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.06em] text-[var(--text-muted)] font-semibold">{label}</span>
        <span className="font-mono text-sm font-bold" style={{ color }}>{format(latest)}</span>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${h} ${points} ${w},${h}`} fill={`url(#grad-${label})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export default function HotelCharts({ reports }: Props) {
  const occ = reports.map(r => r.occupancy_pct ?? 0)
  const adr = reports.map(r => r.adr ?? 0)
  const revpar = reports.map(r => r.revpar ?? 0)
  const rev = reports.map(r => r.total_revenue ?? 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MiniChart data={occ} label="Occupancy" color="#f59e0b" format={v => `${v.toFixed(1)}%`} />
      <MiniChart data={adr} label="ADR" color="#3b82f6" format={v => `$${v.toFixed(0)}`} />
      <MiniChart data={revpar} label="RevPAR" color="#22c55e" format={v => `$${v.toFixed(0)}`} />
      <MiniChart data={rev} label="Revenue" color="#ff4757" format={v => `$${(v / 1000).toFixed(1)}K`} />
    </div>
  )
}
