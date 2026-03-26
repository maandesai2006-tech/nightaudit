'use client'

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
  const trendIcon = trend === 'up' ? '\u25B2' : trend === 'down' ? '\u25BC' : null
  const trendColor = trend === 'up' ? '#16a34a' : trend === 'down' ? '#dc2626' : '#4a5568'

  return (
    <div className="card-static screws p-6">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[#4a5568] font-bold mb-2">
        {label}
      </p>

      <div className="flex items-baseline gap-1">
        {prefix && <span className="font-mono text-lg text-[#a3b1c6]">{prefix}</span>}
        <span className="text-[2.5rem] font-extrabold leading-none text-[#2d3436]" style={{ textShadow: '0 1px 0 #ffffff' }}>
          {value}
        </span>
        {suffix && <span className="font-mono text-sm text-[#a3b1c6]">{suffix}</span>}
        {trendIcon && (
          <span className="text-xs ml-1.5" style={{ color: trendColor }}>{trendIcon}</span>
        )}
      </div>

      {(mtd !== undefined || ytd !== undefined) && (
        <div className="flex gap-5 mt-3 pt-3" style={{ borderTop: '2px solid #d1d9e6' }}>
          {mtd !== undefined && (
            <div className="shadow-recessed rounded-lg px-3 py-2">
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.08em] text-[#a3b1c6] font-bold block">MTD</span>
              <p className="font-mono text-sm text-[#2d3436] font-bold">{prefix}{mtd}{suffix}</p>
            </div>
          )}
          {ytd !== undefined && (
            <div className="shadow-recessed rounded-lg px-3 py-2">
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.08em] text-[#a3b1c6] font-bold block">YTD</span>
              <p className="font-mono text-sm text-[#2d3436] font-bold">{prefix}{ytd}{suffix}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
