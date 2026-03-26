// ─── Mock Data for Static Demo ───────────────────────────────

export interface MockHotel {
  id: string;
  name: string;
  propertyCode: string;
  brand: 'ihg' | 'hilton' | 'choice' | 'marriott' | 'other';
  totalRooms: number;
  timezone: string;
}

export interface MockDailyStat {
  id: string;
  hotelId: string;
  date: string;
  occupancyToday: number | null;
  occupancyMTD: number | null;
  occupancyYTD: number | null;
  occupancyTomorrow: number | null;
  occupancyNext7Days: number | null;
  occupancyNext14Days: number | null;
  occupancyNext31Days: number | null;
  adrToday: number | null;
  adrMTD: number | null;
  adrYTD: number | null;
  revparToday: number | null;
  revparMTD: number | null;
  revparYTD: number | null;
  totalRevenueToday: number | null;
  totalRevenueMTD: number | null;
  totalRevenueYTD: number | null;
  roomRevenueToday: number | null;
  roomRevenueMTD: number | null;
  roomRevenueYTD: number | null;
  totalRooms: number | null;
  availableRooms: number | null;
  roomsOccupied: number | null;
  oooRooms: number | null;
  arrivalsToday: number | null;
  departuresToday: number | null;
  totalInHouseGuests: number | null;
  noShows: number | null;
  cancellations: number | null;
}

export interface MockAlert {
  id: string;
  hotelId: string | null;
  hotelName: string | null;
  metric: string;
  operator: string;
  threshold: number;
  enabled: boolean;
  alertEmail: string;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'gm';
  hotelId: string | null;
}

// ─── Seeded RNG ──────────────────────────────────────────────
function seedRng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function between(rng: () => number, lo: number, hi: number): number {
  return lo + rng() * (hi - lo);
}

// ─── Hotels ──────────────────────────────────────────────────
export const HOTELS: MockHotel[] = [
  { id: 'h1', name: 'Holiday Inn Express Destin', propertyCode: 'CEWHS', brand: 'ihg', totalRooms: 120, timezone: 'America/Chicago' },
  { id: 'h2', name: 'Hampton Inn Pensacola', propertyCode: 'PNSHS', brand: 'hilton', totalRooms: 98, timezone: 'America/Chicago' },
  { id: 'h3', name: 'Candlewood Suites Pensacola', propertyCode: 'PNCPE', brand: 'ihg', totalRooms: 85, timezone: 'America/Chicago' },
  { id: 'h4', name: 'Comfort Inn Pensacola', propertyCode: 'FL712', brand: 'choice', totalRooms: 72, timezone: 'America/Chicago' },
  { id: 'h5', name: 'Courtyard Pensacola Downtown', propertyCode: 'PNSCYD', brand: 'marriott', totalRooms: 110, timezone: 'America/Chicago' },
];

// ─── Generate 30 days of stats per hotel ─────────────────────
function generateStats(hotel: MockHotel): MockDailyStat[] {
  const rng = seedRng(hotel.propertyCode.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 7919);
  const stats: MockDailyStat[] = [];
  const baseDate = new Date('2026-03-25');

  // Base occupancy varies by hotel
  const baseOcc = hotel.brand === 'hilton' ? 72 : hotel.brand === 'ihg' ? 68 : hotel.brand === 'marriott' ? 75 : 62;
  const baseAdr = hotel.brand === 'hilton' ? 142 : hotel.brand === 'ihg' ? 128 : hotel.brand === 'marriott' ? 155 : 98;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    const occBoost = isWeekend ? between(rng, 8, 18) : between(rng, -5, 5);
    const occToday = Math.min(98, Math.max(35, baseOcc + occBoost + between(rng, -8, 8)));
    const adrToday = baseAdr + between(rng, -15, 20) + (isWeekend ? between(rng, 10, 25) : 0);
    const roomsOccupied = Math.round(hotel.totalRooms * occToday / 100);
    const revpar = adrToday * occToday / 100;
    const totalRevenue = adrToday * roomsOccupied;
    const roomRevenue = totalRevenue * between(rng, 0.85, 0.95);

    stats.push({
      id: `s-${hotel.id}-${dateStr}`,
      hotelId: hotel.id,
      date: dateStr,
      occupancyToday: Number(occToday.toFixed(1)),
      occupancyMTD: Number((baseOcc + between(rng, -3, 5)).toFixed(1)),
      occupancyYTD: Number((baseOcc + between(rng, -2, 4)).toFixed(1)),
      occupancyTomorrow: Number(Math.min(98, occToday + between(rng, -10, 10)).toFixed(1)),
      occupancyNext7Days: Number(Math.min(95, baseOcc + between(rng, -5, 8)).toFixed(1)),
      occupancyNext14Days: Number(Math.min(92, baseOcc + between(rng, -3, 6)).toFixed(1)),
      occupancyNext31Days: Number(Math.min(90, baseOcc + between(rng, -4, 5)).toFixed(1)),
      adrToday: Number(adrToday.toFixed(2)),
      adrMTD: Number((baseAdr + between(rng, -5, 10)).toFixed(2)),
      adrYTD: Number((baseAdr + between(rng, -3, 8)).toFixed(2)),
      revparToday: Number(revpar.toFixed(2)),
      revparMTD: Number((revpar + between(rng, -10, 10)).toFixed(2)),
      revparYTD: Number((revpar + between(rng, -8, 8)).toFixed(2)),
      totalRevenueToday: Number(totalRevenue.toFixed(2)),
      totalRevenueMTD: Number((totalRevenue * between(rng, 20, 28)).toFixed(2)),
      totalRevenueYTD: Number((totalRevenue * between(rng, 70, 90)).toFixed(2)),
      roomRevenueToday: Number(roomRevenue.toFixed(2)),
      roomRevenueMTD: Number((roomRevenue * between(rng, 20, 28)).toFixed(2)),
      roomRevenueYTD: Number((roomRevenue * between(rng, 70, 90)).toFixed(2)),
      totalRooms: hotel.totalRooms,
      availableRooms: hotel.totalRooms - Math.round(between(rng, 0, 4)),
      roomsOccupied,
      oooRooms: Math.round(between(rng, 0, 4)),
      arrivalsToday: Math.round(between(rng, 8, 35)),
      departuresToday: Math.round(between(rng, 8, 30)),
      totalInHouseGuests: Math.round(roomsOccupied * between(rng, 1.2, 1.8)),
      noShows: Math.round(between(rng, 0, 4)),
      cancellations: Math.round(between(rng, 0, 6)),
    });
  }
  return stats;
}

// ─── All Stats ───────────────────────────────────────────────
let _statsCache: MockDailyStat[] | null = null;
export function getAllStats(): MockDailyStat[] {
  if (!_statsCache) _statsCache = HOTELS.flatMap(generateStats);
  return _statsCache;
}

export function getStatsForHotel(hotelId: string): MockDailyStat[] {
  return getAllStats().filter(s => s.hotelId === hotelId).sort((a, b) => a.date.localeCompare(b.date));
}

export function getLatestStats(hotelId: string): MockDailyStat | null {
  const stats = getStatsForHotel(hotelId);
  return stats.length > 0 ? stats[stats.length - 1] : null;
}

// ─── Users ───────────────────────────────────────────────────
export const USERS: MockUser[] = [
  { id: 'u1', name: 'Maan Desai', email: 'maan@nightaudit.app', role: 'owner', hotelId: null },
  { id: 'u2', name: 'Sarah Johnson', email: 'sarah@nightaudit.app', role: 'gm', hotelId: 'h1' },
  { id: 'u3', name: 'Mike Torres', email: 'mike@nightaudit.app', role: 'gm', hotelId: 'h2' },
];

// ─── Alerts ──────────────────────────────────────────────────
export const ALERTS: MockAlert[] = [
  { id: 'a1', hotelId: null, hotelName: 'All Hotels', metric: 'occupancyToday', operator: 'lt', threshold: 40, enabled: true, alertEmail: 'maan@nightaudit.app' },
  { id: 'a2', hotelId: 'h1', hotelName: 'Holiday Inn Express Destin', metric: 'adr', operator: 'lt', threshold: 100, enabled: true, alertEmail: 'maan@nightaudit.app' },
  { id: 'a3', hotelId: 'h2', hotelName: 'Hampton Inn Pensacola', metric: 'occupancyTomorrow', operator: 'lt', threshold: 50, enabled: false, alertEmail: 'sarah@nightaudit.app' },
];

// ─── Mock Upload Results ─────────────────────────────────────
export const MOCK_UPLOAD_RESULTS = [
  {
    fileName: 'GM_Report_CEWHS_03-24-26.pdf',
    success: true,
    hotelName: 'Holiday Inn Express Destin',
    propertyCode: 'CEWHS',
    reportDate: '2026-03-24',
    brand: 'ihg',
    isDuplicate: false,
    warnings: [],
    stats: { occupancy: 78.3, adr: 134.50, revpar: 105.31, revenue: 12642 },
  },
  {
    fileName: 'Hotel_Statistics_PNSHS_03-24-26.pdf',
    success: true,
    hotelName: 'Hampton Inn Pensacola',
    propertyCode: 'PNSHS',
    reportDate: '2026-03-24',
    brand: 'hilton',
    isDuplicate: false,
    warnings: ['Some fields could not be parsed from page 2'],
    stats: { occupancy: 82.1, adr: 148.25, revpar: 121.72, revenue: 14486 },
  },
];

// ─── Current Mock User (for auth) ────────────────────────────
export const CURRENT_USER = USERS[0]; // Owner by default
