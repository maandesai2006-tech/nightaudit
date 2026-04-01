'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  mtd?: string | number
  ytd?: string | number
  prefix?: string
  suffix?: string
  trend?: 'up' | 'down' | 'neutral'
}

export default function KPICard({ label, value, mtd, ytd, prefix, suffix, trend }: KPICardProps) {
  return (
    <div className="card-static p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-muted)] font-semibold">
          {label}
        </p>
        {trend && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            trend === 'up' ? 'text-[var(--success)]' :
            trend === 'down' ? 'text-[var(--danger)]' :
            'text-[var(--text-faint)]'
          }`} style={{ boxShadow: 'var(--shadow-subtle)' }}>
            {trend === 'up' ? <TrendingUp size={14} /> :
             trend === 'down' ? <TrendingDown size={14} /> :
             <Minus size={14} />}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-0.5">
        {prefix && <span className="font-mono text-base text-[var(--text-faint)]">{prefix}</span>}
        <span className="text-3xl font-extrabold leading-none text-[var(--text)] tracking-tight">
          {value}
        </span>
        {suffix && <span className="font-mono text-sm text-[var(--text-faint)] ml-0.5">{suffix}</span>}
      </div>

      {(mtd !== undefined || ytd !== undefined) && (
        <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--muted)' }}>
          {mtd !== undefined && (
            <div>
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.06em] text-[var(--text-faint)] font-semibold block mb-0.5">MTD</span>
              <p className="font-mono text-xs text-[var(--text)] font-bold">{prefix}{mtd}{suffix}</p>
            </div>
          )}
          {ytd !== undefined && (
            <div>
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.06em] text-[var(--text-faint)] font-semibold block mb-0.5">YTD</span>
              <p className="font-mono text-xs text-[var(--text)] font-bold">{prefix}{ytd}{suffix}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
