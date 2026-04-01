# NightAudit — Setup Notes

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  GitHub Actions (cron: every 30 min, 5–10 AM CT)     │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │
│  │  IMAP    │→ │  PDF     │→ │  Supabase          │  │
│  │  Fetch   │  │  Parse   │  │  PostgreSQL        │  │
│  └──────────┘  └──────────┘  └────────────────────┘  │
└──────────────────────────────────────────────────────┘
                                        ↓
┌──────────────────────────────────────────────────────┐
│  GitHub Pages (static Next.js export)                │
│  ┌────────────────────────────────────────────────┐  │
│  │  Dashboard reads from Supabase (anon key)      │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## Services & Accounts Required

### 1. Supabase (Free Tier)
- **URL**: https://supabase.com
- **What**: Hosted PostgreSQL database + REST API
- **Free Tier**: 500 MB database, unlimited API requests
- **Setup**:
  1. Create account at supabase.com
  2. Create a new project (name: `nightaudit`, region: US East)
  3. Go to SQL Editor → paste contents of `supabase/schema.sql` → Run
  4. Go to Settings → API to get:
     - `Project URL` → this is your `SUPABASE_URL`
     - `anon public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` key → this is your `SUPABASE_SERVICE_ROLE_KEY`

### 2. GitHub Repository (Already exists)
- **Repo**: `maandesai2006-tech/nightaudit`
- **Secrets to add** (Settings → Secrets and variables → Actions):
  | Secret Name                  | Value                              |
  |------------------------------|------------------------------------|
  | `IMAP_HOST`                  | `imap.one.com`                     |
  | `IMAP_PORT`                  | `993`                              |
  | `IMAP_USER`                  | `maandesai@cwspensacola.com`       |
  | `IMAP_PASSWORD`              | Your email password                |
  | `IMAP_MAILBOX`               | `INBOX`                            |
  | `SUPABASE_URL`               | From Supabase dashboard            |
  | `SUPABASE_SERVICE_ROLE_KEY`  | From Supabase dashboard            |

### 3. Email (Already exists)
- **Provider**: mail.one.com
- **Address**: maandesai@cwspensacola.com
- **Access**: IMAP (imap.one.com:993, TLS)

## Environment Variables

### For the frontend (.env.local):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

### For GitHub Actions (set as repository secrets):
See the secrets table above.

## How It Works

1. **Email Polling** (GitHub Actions, every 30 min from 5–10 AM CT):
   - Connects to `maandesai@cwspensacola.com` via IMAP
   - Fetches all unseen emails
   - Downloads PDF attachments
   - Extracts text from PDFs
   - Parses hotel metrics (occupancy, ADR, RevPAR, revenue, etc.)
   - Resolves which hotel the report belongs to
   - Writes parsed data to Supabase (upserts by hotel + date)
   - Marks emails as read
   - Logs every ingestion (success, duplicate, or failure)

2. **Dashboard** (GitHub Pages, static site):
   - Reads hotel and report data from Supabase using the anon key
   - Shows portfolio overview with all 5 properties
   - Live properties (Candlewood, Holiday Inn Express) show real data
   - Placeholder properties show "Awaiting data" state
   - Displays last sync time and ingestion status

## Live Properties (Active Automation)
- ✅ Holiday Inn Express Destin (CEWHS) — IHG
- ✅ Candlewood Suites Pensacola (PNCPE) — IHG

## Placeholder Properties (Future Expansion)
- ⏳ Hampton Inn Pensacola (PNSHS) — Hilton
- ⏳ Comfort Inn Pensacola (FL712) — Choice
- ⏳ Courtyard Pensacola Downtown (PNSCYD) — Marriott

To activate a placeholder property:
1. In Supabase, update the hotel row: `UPDATE hotels SET live = true WHERE property_code = 'PNSHS';`
2. Ensure the email reports are being sent to the inbox
3. The polling script will automatically pick them up

## Running Locally

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase keys

# Start development server
npm run dev

# Manually trigger email poll (requires .env with IMAP + Supabase creds)
node scripts/poll-emails.mjs
```

## Deploying

### Frontend (GitHub Pages)
```bash
npm run build
# Push the `out/` directory to gh-pages branch
```

### Email Automation
Push to `main` branch — GitHub Actions will run the poll workflow on the cron schedule.
You can also trigger it manually from the Actions tab.
