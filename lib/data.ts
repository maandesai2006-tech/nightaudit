import { supabase, isLive } from './supabase'
import type { Hotel, DailyReport, SyncStatus, Brand } from './types'
import {
  HOTELS as MOCK_HOTELS,
  getAllStats,
  getStatsForHotel as getMockStatsForHotel,
  getLatestStats as getMockLatestStats,
} from './mock/data'

// ─── Hotels ─────────────────────────────────────────────────

export async function getHotels(): Promise<Hotel[]> {
  if (!isLive) {
    return MOCK_HOTELS.map(h => ({
      id: h.id,
      name: h.name,
      property_code: h.propertyCode,
      brand: h.brand as Brand,
      total_rooms: h.totalRooms,
      timezone: h.timezone,
      active: true,
      live: h.id === 'h1' || h.id === 'h3', // HIE Destin + Candlewood
      aliases: [],
    }))
  }

  const { data, error } = await supabase!
    .from('hotels')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) throw error
  return data || []
}

// ─── Daily Reports ──────────────────────────────────────────

function mockToReport(hotelId: string, s: ReturnType<typeof getMockLatestStats>): DailyReport | null {
  if (!s) return null
  return {
    id: s.id,
    hotel_id: hotelId,
    business_date: s.date,
    report_type: 'gm_report',
    occupancy_pct: s.occupancyToday,
    occupancy_mtd: s.occupancyMTD,
    occupancy_ytd: s.occupancyYTD,
    adr: s.adrToday,
    adr_mtd: s.adrMTD,
    adr_ytd: s.adrYTD,
    revpar: s.revparToday,
    revpar_mtd: s.revparMTD,
    revpar_ytd: s.revparYTD,
    room_revenue: s.roomRevenueToday,
    room_revenue_mtd: s.roomRevenueMTD,
    room_revenue_ytd: s.roomRevenueYTD,
    total_revenue: s.totalRevenueToday,
    total_revenue_mtd: s.totalRevenueMTD,
    total_revenue_ytd: s.totalRevenueYTD,
    fb_revenue: null,
    other_revenue: null,
    taxes: null,
    total_rooms: s.totalRooms,
    available_rooms: s.availableRooms,
    rooms_occupied: s.roomsOccupied,
    ooo_rooms: s.oooRooms,
    oos_rooms: null,
    comp_rooms: null,
    house_use_rooms: null,
    arrivals: s.arrivalsToday,
    departures: s.departuresToday,
    stayovers: null,
    guests_in_house: s.totalInHouseGuests,
    walk_ins: null,
    no_shows: s.noShows,
    cancellations: s.cancellations,
    dirty_rooms: null,
    clean_rooms: null,
    ready_rooms: null,
    tomorrow_arrivals: null,
    tomorrow_departures: null,
    tomorrow_occ_pct: s.occupancyTomorrow,
    next_7d_occ_pct: s.occupancyNext7Days,
    next_14d_occ_pct: s.occupancyNext14Days,
    next_31d_occ_pct: s.occupancyNext31Days,
    created_at: '',
    updated_at: '',
  }
}

export async function getLatestReport(hotelId: string): Promise<DailyReport | null> {
  if (!isLive) {
    return mockToReport(hotelId, getMockLatestStats(hotelId))
  }

  const { data, error } = await supabase!
    .from('daily_reports')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('business_date', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return data
}

export async function getReportsForHotel(
  hotelId: string,
  limit = 30
): Promise<DailyReport[]> {
  if (!isLive) {
    return getMockStatsForHotel(hotelId).map(s => mockToReport(hotelId, s)!)
  }

  const { data, error } = await supabase!
    .from('daily_reports')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('business_date', { ascending: true })
    .limit(limit)

  if (error) return []
  return data || []
}

export async function getReportsForHotelRange(
  hotelId: string,
  startDate: string,
  endDate: string
): Promise<DailyReport[]> {
  if (!isLive) {
    return getMockStatsForHotel(hotelId)
      .filter(s => s.date >= startDate && s.date <= endDate)
      .map(s => mockToReport(hotelId, s)!)
  }

  const { data, error } = await supabase!
    .from('daily_reports')
    .select('*')
    .eq('hotel_id', hotelId)
    .gte('business_date', startDate)
    .lte('business_date', endDate)
    .order('business_date', { ascending: true })

  if (error) return []
  return data || []
}

// ─── Sync Status ────────────────────────────────────────────

export async function getSyncStatus(): Promise<SyncStatus | null> {
  if (!isLive) {
    return {
      last_poll_at: new Date().toISOString(),
      last_success_at: new Date().toISOString(),
      emails_processed: 2,
      reports_ingested: 2,
      last_error: null,
    }
  }

  const { data, error } = await supabase!
    .from('sync_status')
    .select('*')
    .eq('id', 'singleton')
    .single()

  if (error || !data) return null
  return data
}
