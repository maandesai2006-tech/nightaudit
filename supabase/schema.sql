-- ============================================================
-- NightAudit — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Hotels
CREATE TABLE IF NOT EXISTS hotels (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  property_code TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL CHECK (brand IN ('ihg','hilton','choice','marriott','other')),
  total_rooms INTEGER NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  active BOOLEAN NOT NULL DEFAULT true,
  live BOOLEAN NOT NULL DEFAULT false,
  aliases TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily Reports (one row per hotel per business date)
CREATE TABLE IF NOT EXISTS daily_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  hotel_id TEXT NOT NULL REFERENCES hotels(id),
  business_date DATE NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'gm_report',
  -- Occupancy
  occupancy_pct DECIMAL,
  occupancy_mtd DECIMAL,
  occupancy_ytd DECIMAL,
  -- ADR
  adr DECIMAL,
  adr_mtd DECIMAL,
  adr_ytd DECIMAL,
  -- RevPAR
  revpar DECIMAL,
  revpar_mtd DECIMAL,
  revpar_ytd DECIMAL,
  -- Revenue
  room_revenue DECIMAL,
  room_revenue_mtd DECIMAL,
  room_revenue_ytd DECIMAL,
  total_revenue DECIMAL,
  total_revenue_mtd DECIMAL,
  total_revenue_ytd DECIMAL,
  fb_revenue DECIMAL,
  other_revenue DECIMAL,
  taxes DECIMAL,
  -- Rooms
  total_rooms INTEGER,
  available_rooms INTEGER,
  rooms_occupied INTEGER,
  ooo_rooms INTEGER,
  oos_rooms INTEGER,
  comp_rooms INTEGER,
  house_use_rooms INTEGER,
  -- Guest movement
  arrivals INTEGER,
  departures INTEGER,
  stayovers INTEGER,
  guests_in_house INTEGER,
  walk_ins INTEGER,
  no_shows INTEGER,
  cancellations INTEGER,
  -- Housekeeping
  dirty_rooms INTEGER,
  clean_rooms INTEGER,
  ready_rooms INTEGER,
  -- Forecast
  tomorrow_arrivals INTEGER,
  tomorrow_departures INTEGER,
  tomorrow_occ_pct DECIMAL,
  next_7d_occ_pct DECIMAL,
  next_14d_occ_pct DECIMAL,
  next_31d_occ_pct DECIMAL,
  -- Meta
  report_run_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(hotel_id, business_date, report_type)
);

-- Ingestion Log (tracks every email processed)
CREATE TABLE IF NOT EXISTS ingestion_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email_uid TEXT,
  email_subject TEXT,
  email_from TEXT,
  email_date TIMESTAMPTZ,
  attachment_name TEXT,
  attachment_hash TEXT UNIQUE,
  hotel_id TEXT REFERENCES hotels(id),
  daily_report_id TEXT REFERENCES daily_reports(id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','downloading','parsing','complete','duplicate','failed')),
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sync Status (tracks last successful poll)
CREATE TABLE IF NOT EXISTS sync_status (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  last_poll_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  emails_processed INTEGER DEFAULT 0,
  reports_ingested INTEGER DEFAULT 0,
  last_error TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO sync_status (id) VALUES ('singleton') ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed the five hotels
-- ============================================================
INSERT INTO hotels (id, name, property_code, brand, total_rooms, timezone, live, aliases) VALUES
  ('h1', 'Holiday Inn Express Destin',     'CEWHS',  'ihg',      120, 'America/Chicago', true,
    ARRAY['HIE Destin','Holiday Inn Destin','Holiday Inn Express']),
  ('h2', 'Hampton Inn Pensacola',           'PNSHS',  'hilton',   98,  'America/Chicago', false,
    ARRAY['Hampton Pensacola','Hampton Inn']),
  ('h3', 'Candlewood Suites Pensacola',     'PNCPE',  'ihg',      85,  'America/Chicago', true,
    ARRAY['Candlewood Pensacola','CW Pensacola','Candlewood Suites']),
  ('h4', 'Comfort Inn Pensacola',           'FL712',  'choice',   72,  'America/Chicago', false,
    ARRAY['Comfort Pensacola','Comfort Inn']),
  ('h5', 'Courtyard Pensacola Downtown',    'PNSCYD', 'marriott', 110, 'America/Chicago', false,
    ARRAY['Courtyard Downtown','Courtyard Pensacola'])
ON CONFLICT (property_code) DO NOTHING;

-- ============================================================
-- Row Level Security — public read, service-role write
-- ============================================================
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "Public read hotels"        ON hotels        FOR SELECT USING (true);
CREATE POLICY "Public read daily_reports"  ON daily_reports FOR SELECT USING (true);
CREATE POLICY "Public read sync_status"    ON sync_status   FOR SELECT USING (true);

-- Service role can write (used by GitHub Action with service_role key)
CREATE POLICY "Service write daily_reports" ON daily_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write ingestion_log" ON ingestion_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write sync_status"   ON sync_status   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service write hotels"        ON hotels        FOR ALL USING (true) WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_daily_reports_hotel_date ON daily_reports(hotel_id, business_date DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_log_hash       ON ingestion_log(attachment_hash);
