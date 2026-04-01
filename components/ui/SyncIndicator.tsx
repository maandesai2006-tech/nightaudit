'use client'

import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { SyncStatus } from '@/lib/types'

export default function SyncIndicator({ sync }: { sync: SyncStatus | null }) {
  if (!sync) return null

  const lastSync = sync.last_poll_at ? formatDistanceToNow(new Date(sync.last_poll_at), { addSuffix: true }) : 'Never'
  const hasError = !!sync.last_error

  return (
    <div className="flex items-center gap-2 text-[0.65rem] font-mono uppercase tracking-wider">
      {hasError ? (
        <AlertCircle size={12} className="text-[var(--warning)]" />
      ) : sync.last_success_at ? (
        <CheckCircle size={12} className="text-[var(--success)]" />
      ) : (
        <RefreshCw size={12} className="text-[var(--text-faint)]" />
      )}
      <span className="text-[var(--text-muted)]">
        Synced {lastSync}
      </span>
    </div>
  )
}
