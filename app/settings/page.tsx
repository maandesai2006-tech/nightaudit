'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import BrandBadge from '@/components/ui/BrandBadge'
import { HOTELS, USERS, ALERTS, CURRENT_USER, type MockHotel, type MockUser, type MockAlert } from '@/lib/mock/data'

type Tab = 'hotels' | 'users' | 'alerts'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('hotels')

  // Mock state for demo
  const [hotels, setHotels] = useState<MockHotel[]>([...HOTELS])
  const [users, setUsers] = useState<MockUser[]>([...USERS])
  const [alerts, setAlerts] = useState<MockAlert[]>([...ALERTS])
  const [editingHotel, setEditingHotel] = useState<string | null>(null)

  // Hotel form
  const [hotelForm, setHotelForm] = useState({ name: '', propertyCode: '', brand: 'other' as MockHotel['brand'], totalRooms: 0, timezone: 'America/Chicago' })

  // User form
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'gm' as 'owner' | 'gm', hotelId: '' })

  // Alert form
  const [alertForm, setAlertForm] = useState({ hotelId: '', metric: 'occupancyToday', operator: 'lt', threshold: 50, alertEmail: CURRENT_USER.email })

  const isOwner = CURRENT_USER.role === 'owner'
  const tabs: { id: Tab; label: string }[] = [
    { id: 'hotels', label: 'Hotels' },
    ...(isOwner ? [{ id: 'users' as Tab, label: 'Users' }] : []),
    { id: 'alerts', label: 'Alerts' },
  ]

  const addHotel = () => {
    if (!hotelForm.name || !hotelForm.propertyCode) return
    const newHotel: MockHotel = { id: `h${Date.now()}`, ...hotelForm }
    setHotels([...hotels, newHotel])
    setHotelForm({ name: '', propertyCode: '', brand: 'other', totalRooms: 0, timezone: 'America/Chicago' })
  }

  const addUser = () => {
    if (!userForm.name || !userForm.email) return
    const newUser: MockUser = { id: `u${Date.now()}`, ...userForm, hotelId: userForm.hotelId || null }
    setUsers([...users, newUser])
    setUserForm({ name: '', email: '', role: 'gm', hotelId: '' })
  }

  const addAlert = () => {
    const hotel = hotels.find(h => h.id === alertForm.hotelId)
    const newAlert: MockAlert = {
      id: `a${Date.now()}`,
      hotelId: alertForm.hotelId || null,
      hotelName: hotel?.name ?? 'All Hotels',
      metric: alertForm.metric,
      operator: alertForm.operator,
      threshold: alertForm.threshold,
      enabled: true,
      alertEmail: alertForm.alertEmail,
    }
    setAlerts([...alerts, newAlert])
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-[#2d3436] tracking-tight" style={{ textShadow: '0 1px 0 #fff' }}>
        Settings
      </h1>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hotels Tab */}
      {activeTab === 'hotels' && (
        <div className="space-y-4">
          <div className="card-static screws p-5 space-y-4">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#4a5568]">Add Hotel</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="input" placeholder="Hotel name" value={hotelForm.name} onChange={e => setHotelForm({ ...hotelForm, name: e.target.value })} />
              <input className="input" placeholder="Property code" value={hotelForm.propertyCode} onChange={e => setHotelForm({ ...hotelForm, propertyCode: e.target.value })} />
              <select className="select" value={hotelForm.brand} onChange={e => setHotelForm({ ...hotelForm, brand: e.target.value as MockHotel['brand'] })}>
                <option value="ihg">IHG</option>
                <option value="hilton">Hilton</option>
                <option value="choice">Choice</option>
                <option value="marriott">Marriott</option>
                <option value="other">Other</option>
              </select>
              <input className="input" type="number" placeholder="Total rooms" value={hotelForm.totalRooms || ''} onChange={e => setHotelForm({ ...hotelForm, totalRooms: Number(e.target.value) })} />
            </div>
            <button onClick={addHotel} className="btn btn-primary"><Plus size={14} /> Add Hotel</button>
          </div>

          <div className="space-y-2">
            {hotels.map(hotel => (
              <div key={hotel.id} className="card-static p-4 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <BrandBadge brand={hotel.brand} />
                  <div>
                    <p className="text-sm font-bold text-[#2d3436]">{hotel.name}</p>
                    <p className="font-mono text-[10px] text-[#a3b1c6]">{hotel.propertyCode} &middot; {hotel.totalRooms} rooms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingHotel(editingHotel === hotel.id ? null : hotel.id)} className="btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => setHotels(hotels.filter(h => h.id !== hotel.id))} className="btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity text-[#dc2626]">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && isOwner && (
        <div className="space-y-4">
          <div className="card-static screws p-5 space-y-4">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#4a5568]">Add User</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="input" placeholder="Name" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
              <input className="input" placeholder="Email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
              <select className="select" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value as 'owner' | 'gm' })}>
                <option value="gm">General Manager</option>
                <option value="owner">Owner</option>
              </select>
              <select className="select" value={userForm.hotelId} onChange={e => setUserForm({ ...userForm, hotelId: e.target.value })}>
                <option value="">No hotel (portfolio access)</option>
                {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <button onClick={addUser} className="btn btn-primary"><Plus size={14} /> Add User</button>
          </div>

          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="card-static p-4 flex items-center justify-between group">
                <div>
                  <p className="text-sm font-bold text-[#2d3436]">{user.name}</p>
                  <p className="font-mono text-[10px] text-[#a3b1c6]">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge badge-${user.role}`}>{user.role}</span>
                  {user.id !== CURRENT_USER.id && (
                    <button onClick={() => setUsers(users.filter(u => u.id !== user.id))} className="btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity text-[#dc2626]">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="card-static screws p-5 space-y-4">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#4a5568]">Create Alert</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select className="select" value={alertForm.hotelId} onChange={e => setAlertForm({ ...alertForm, hotelId: e.target.value })}>
                <option value="">All Hotels</option>
                {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              <select className="select" value={alertForm.metric} onChange={e => setAlertForm({ ...alertForm, metric: e.target.value })}>
                <option value="occupancyToday">Occupancy Today</option>
                <option value="adr">ADR</option>
                <option value="revpar">RevPAR</option>
                <option value="totalRevenueToday">Total Revenue</option>
                <option value="occupancyTomorrow">Occupancy Tomorrow</option>
                <option value="occupancyNext7Days">Occupancy 7-Day</option>
              </select>
              <select className="select" value={alertForm.operator} onChange={e => setAlertForm({ ...alertForm, operator: e.target.value })}>
                <option value="lt">Less than</option>
                <option value="gt">Greater than</option>
                <option value="lte">Less or equal</option>
                <option value="gte">Greater or equal</option>
              </select>
              <input className="input" type="number" placeholder="Threshold" value={alertForm.threshold} onChange={e => setAlertForm({ ...alertForm, threshold: Number(e.target.value) })} />
            </div>
            <button onClick={addAlert} className="btn btn-primary"><Plus size={14} /> Create Alert</button>
          </div>

          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className="card-static p-4 flex items-center justify-between group">
                <div>
                  <p className="text-sm font-bold text-[#2d3436]">
                    {alert.metric} {alert.operator} {alert.threshold}
                  </p>
                  <p className="font-mono text-[10px] text-[#a3b1c6]">{alert.hotelName} &middot; {alert.alertEmail}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAlerts(alerts.map(a => a.id === alert.id ? { ...a, enabled: !a.enabled } : a))}
                    className={`w-3 h-3 rounded-full ${alert.enabled ? 'led-green' : 'led-red'}`}
                    title={alert.enabled ? 'Enabled' : 'Disabled'}
                  />
                  <button onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))} className="btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity text-[#dc2626]">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
