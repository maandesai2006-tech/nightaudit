'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import BrandBadge from '@/components/ui/BrandBadge'
import { getHotels, getSyncStatus } from '@/lib/data'
import SyncIndicator from '@/components/ui/SyncIndicator'
import type { Hotel, SyncStatus, Brand } from '@/lib/types'

type Tab = 'hotels' | 'users' | 'alerts'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('hotels')
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [sync, setSync] = useState<SyncStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [h, s] = await Promise.all([getHotels(), getSyncStatus()])
      setHotels(h)
      setSync(s)
      setLoading(false)
    }
    load()
  }, [])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'hotels', label: 'Hotels' },
    { id: 'users', label: 'Users' },
    { id: 'alerts', label: 'Alerts' },
  ]

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-48 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-extrabold text-[var(--text)] tracking-tight">Settings</h1>
        <SyncIndicator sync={sync} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-wider transition-all rounded-lg ${
              activeTab === tab.id ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hotels Tab */}
      {activeTab === 'hotels' && (
        <div className="space-y-3">
          {hotels.map(hotel => (
            <div key={hotel.id} className="card-static p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={hotel.live ? 'dot-live' : 'dot-offline'} />
                <BrandBadge brand={hotel.brand} />
                <div>
                  <p className="text-sm font-bold text-[var(--text)]">{hotel.name}</p>
                  <p className="font-mono text-[0.6rem] text-[var(--text-faint)]">
                    {hotel.property_code} &middot; {hotel.total_rooms} rooms
                    {hotel.live ? ' \u2022 Automated' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${hotel.live ? 'badge-live' : 'badge-placeholder'}`}>
                  {hotel.live ? 'Live' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
          <p className="text-xs text-[var(--text-faint)] mt-4 leading-relaxed">
            To add or modify hotels, update the <span className="font-mono">hotels</span> table in Supabase.
            Set <span className="font-mono">live = true</span> to enable email automation for a property.
          </p>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <div className="card-static p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--text)]">Maan Desai</p>
              <p className="font-mono text-[0.6rem] text-[var(--text-faint)]">maan@nightaudit.app</p>
            </div>
            <span className="badge badge-owner">owner</span>
          </div>
          <p className="text-xs text-[var(--text-faint)] mt-4 leading-relaxed">
            User management coming soon. Currently the dashboard is a static site with no authentication.
          </p>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          <div className="card-static p-6 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Alert configuration coming soon.
            </p>
            <p className="text-xs text-[var(--text-faint)] mt-2">
              You&apos;ll be able to set threshold alerts for occupancy, ADR, and revenue per property.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
