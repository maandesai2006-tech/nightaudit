'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  const basePath = '/nightaudit'
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-full shadow-recessed bg-[#e0e5ec] flex items-center justify-center mb-6">
        <FileText size={28} className="text-[#a3b1c6]" />
      </div>
      <h3 className="text-xl font-bold text-[#2d3436] mb-2">{title}</h3>
      <p className="text-sm text-[#4a5568] max-w-md leading-relaxed mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link href={`${basePath}${actionHref}`} className="btn btn-primary no-underline">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
