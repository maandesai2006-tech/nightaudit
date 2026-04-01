'use client'

interface ForecastGaugeProps {
  label: string
  value: number | null
}

export default function ForecastGauge({ label, value }: ForecastGaugeProps) {
  const pct = value ?? 0
  const colorClass = pct > 70 ? 'green' : pct >= 50 ? 'amber' : 'red'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.05em] text-[var(--text-muted)] font-semibold">
          {label}
        </span>
        <span className="font-mono text-xs text-[var(--text)] font-bold">
          {value !== null ? `${pct.toFixed(1)}%` : '\u2014'}
        </span>
      </div>
      <div className="gauge-bar">
        <div
          className={`gauge-fill ${colorClass}`}
          style={{ width: value !== null ? `${Math.min(pct, 100)}%` : '0%' }}
        />
      </div>
    </div>
  )
}
