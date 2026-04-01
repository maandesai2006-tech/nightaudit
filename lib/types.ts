export type Brand = 'ihg' | 'hilton' | 'choice' | 'marriott' | 'other'

export interface Hotel {
  id: string
  name: string
  property_code: string
  brand: Brand
  total_rooms: number
  timezone: string
  active: boolean
  live: boolean
  aliases: string[]
}

export interface DailyReport {
  id: string
  hotel_id: string
  business_date: string
  report_type: string
  occupancy_pct: number | null
  occupancy_mtd: number | null
  occupancy_ytd: number | null
  adr: number | null
  adr_mtd: number | null
  adr_ytd: number | null
  revpar: number | null
  revpar_mtd: number | null
  revpar_ytd: number | null
  room_revenue: number | null
  room_revenue_mtd: number | null
  room_revenue_ytd: number | null
  total_revenue: number | null
  total_revenue_mtd: number | null
  total_revenue_ytd: number | null
  fb_revenue: number | null
  other_revenue: number | null
  taxes: number | null
  total_rooms: number | null
  available_rooms: number | null
  rooms_occupied: number | null
  ooo_rooms: number | null
  oos_rooms: number | null
  comp_rooms: number | null
  house_use_rooms: number | null
  arrivals: number | null
  departures: number | null
  stayovers: number | null
  guests_in_house: number | null
  walk_ins: number | null
  no_shows: number | null
  cancellations: number | null
  dirty_rooms: number | null
  clean_rooms: number | null
  ready_rooms: number | null
  tomorrow_arrivals: number | null
  tomorrow_departures: number | null
  tomorrow_occ_pct: number | null
  next_7d_occ_pct: number | null
  next_14d_occ_pct: number | null
  next_31d_occ_pct: number | null
  created_at: string
  updated_at: string
}

export interface SyncStatus {
  last_poll_at: string | null
  last_success_at: string | null
  emails_processed: number
  reports_ingested: number
  last_error: string | null
}
