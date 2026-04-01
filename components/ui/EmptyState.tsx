'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  icon?: React.ReactNode
}

export default function EmptyState({ title, description, actionLabel, actionHref, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-xl shadow-[var(--shadow-recessed)] bg-[var(--bg)] flex items-center justify-center mb-5">
        {icon || <FileText size={24} className="text-[var(--text-faint)]" />}
      </div>
      <h3 className="text-lg font-bold text-[var(--text)] mb-1.5">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm leading-relaxed mb-5">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn-primary no-underline">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
