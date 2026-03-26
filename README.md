# NightAudit — Hotel Portfolio Dashboard

Real-time hotel portfolio intelligence. Upload nightly PMS reports (PDFs) from any property, and NightAudit automatically parses, stores, visualizes, and alerts on key hospitality KPIs.

Built for hotel portfolio owners managing 2–5 properties across IHG, Hilton, Choice Hotels, and Marriott brands.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database**: Neon PostgreSQL via `@neondatabase/serverless` + `drizzle-orm`
- **Auth**: NextAuth.js v5 (credentials provider, JWT sessions)
- **PDF Parsing**: `pdf-parse` with brand-specific regex parsers
- **Charts**: Recharts with Line/Bar/Area toggle
- **Email**: SendGrid (`@sendgrid/mail`)
- **Styling**: Tailwind CSS with custom dark theme
- **Deployment**: Vercel (serverless, cron jobs)

## Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account (free tier works)
- A [Vercel](https://vercel.com) account for deployment
- A [SendGrid](https://sendgrid.com) account for emails (optional, free = 100 emails/day)

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd nightaudit
npm install
```

### 2. Set up Neon Database

1. Go to [neon.tech](https://neon.tech) → Sign up free → Create a project called "nightaudit"
2. Copy the connection string (looks like: `postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)
3. Save it — you'll need it for the next step

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your values:

```
DATABASE_URL=postgres://your-neon-connection-string
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
SENDGRID_API_KEY=SG.xxx          # optional
EMAIL_FROM=noreply@yourdomain.com # optional
CRON_SECRET=<any random string>
```

### 4. Create Database Tables

```bash
npx drizzle-kit push
```

This creates all tables automatically using the Drizzle schema.

### 5. Run Locally

```bash
npm run dev
```

Visit http://localhost:3000 — you'll be redirected to `/setup` to create your first owner account.

### 6. Deploy to Vercel

1. Push to GitHub
2. Import in Vercel → Connect your repo
3. Add all environment variables from `.env.local` to Vercel → Settings → Environment Variables
4. Deploy — Vercel Cron Jobs are configured automatically via `vercel.json`

### 7. SendGrid Setup (Optional)

1. Sign up at [sendgrid.com](https://sendgrid.com) (free = 100 emails/day)
2. Verify your sender email domain
3. Settings → API Keys → Create API Key (Full Access)
4. Add to env vars: `SENDGRID_API_KEY=SG.xxxx`
5. Add: `EMAIL_FROM=noreply@yourdomain.com`

## How to Use

1. **First run**: Create owner account at `/setup`
2. **Add hotels**: Go to `/settings` → Hotels tab → Add each property with its code (e.g., CEWHS, PNCPE, PNSHS, FL712)
3. **Upload reports**: Go to `/upload` → Drag and drop PDF reports from your PMS
4. **View dashboard**: `/dashboard` shows portfolio overview; click a hotel for details
5. **Set alerts**: `/settings` → Alerts tab → Create rules like "Alert if occupancy < 40%"

## Supported PDF Formats

| Brand | Report Type | Property Code Pattern | Example |
|-------|-----------|----------------------|---------|
| IHG (Holiday Inn, Candlewood, etc.) | General Manager Report | 5 uppercase letters (CEWHS, PNCPE) | Holiday Inn Express Destin |
| Hilton (Hampton Inn, etc.) | Hotel Statistics | 5 uppercase letters (PNSHS) | Hampton Inn Pensacola |
| Choice (Comfort Inn, Quality Inn, etc.) | Hotel Statistics | FL + 3 digits (FL712) | Comfort Inn |
| Marriott | Generic parser | Varies | Any Marriott brand |

### Parsed KPIs

- Occupancy (Today, MTD, YTD, Forecast: Tomorrow, 7-day, 14-day, 31-day)
- ADR (Today, MTD, YTD)
- RevPAR (Today, MTD, YTD)
- Revenue (Total, Room — Today, MTD, YTD)
- Rooms (Total, Available, Occupied, OOO)
- Guest stats (Arrivals, Departures, In-House, No-Shows, Cancellations)
- Bookings (Reservations, Room Nights)

## User Roles

- **Owner**: Sees all hotels, full settings access, receives all digests
- **GM (General Manager)**: Sees only their assigned hotel, can upload for their hotel only

## Email Digests

- **Daily** (7:00 AM): Portfolio summary with each hotel's KPIs and forecast
- **Weekly** (Monday 8:00 AM): MTD performance, top performer, low-occupancy alerts
- **KPI Alerts** (Hourly): Threshold-based alerts with 24h deduplication

## Project Structure

```
app/
  layout.tsx              — Root layout with dark theme
  page.tsx                — Redirects to /dashboard
  login/page.tsx          — Login page
  setup/page.tsx          — First-run owner account creation
  dashboard/
    layout.tsx            — Auth-protected layout with NavBar
    page.tsx              — Portfolio overview
    [hotelId]/page.tsx    — Single hotel detail
  upload/page.tsx         — PDF upload with drag-and-drop
  settings/page.tsx       — Hotels, Users, Alerts, Email settings
  api/
    auth/[...nextauth]/   — NextAuth handlers
    upload/               — PDF upload + parse + store
    hotels/               — Hotel CRUD
    stats/                — Stats for charts
    alerts/               — Alert config CRUD
    email/send/           — Manual email trigger
    setup/                — First-run setup
    cron/
      daily/              — Daily digest (7am)
      weekly/             — Weekly digest (Mon 8am)
      alerts/             — Hourly KPI alert check
lib/
  db/schema.ts            — Drizzle ORM schema
  db/index.ts             — Neon connection
  auth/config.ts          — NextAuth config
  parsers/
    index.ts              — Brand detection + dispatcher
    ihg.ts                — IHG GM Report parser
    hilton.ts             — Hilton Hotel Statistics parser
    choice.ts             — Choice Hotels parser
    generic.ts            — Fallback parser
  email/
    sendgrid.ts           — SendGrid wrapper
    templates.ts          — Email HTML templates
components/
  ui/                     — NavBar, KPICard, ForecastGauge, BrandBadge, EmptyState
  charts/                 — HotelCharts, PortfolioChart, SparkLine
```

## Troubleshooting

### PDF parse errors
- Check the `reports` table — `rawText` is always saved even on parse failure
- Parse warnings are stored in `parseWarnings` column
- Check console for regex match details

### Database connection issues
- Verify your `DATABASE_URL` includes `?sslmode=require`
- Run `npx drizzle-kit push` again if tables are missing

### Build hangs
- Ensure `DATABASE_URL` is set (even to a dummy value for build)
- Server components with DB queries use `force-dynamic` to avoid build-time DB calls

### Duplicate uploads
- The system detects same hotel + same date and overwrites old stats
- A warning is returned in the upload response
