#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// NightAudit — Email Polling Script
// Runs via GitHub Actions on a cron schedule.
// Connects to IMAP, fetches unseen emails with PDF attachments,
// parses hotel report data, and writes to Supabase.
// ─────────────────────────────────────────────────────────────

import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

// ─── Config ─────────────────────────────────────────────────
const IMAP_HOST     = process.env.IMAP_HOST     || 'imap.one.com';
const IMAP_PORT     = parseInt(process.env.IMAP_PORT || '993');
const IMAP_USER     = process.env.IMAP_USER     || '';
const IMAP_PASSWORD = process.env.IMAP_PASSWORD || '';
const IMAP_MAILBOX  = process.env.IMAP_MAILBOX  || 'INBOX';

const SUPABASE_URL  = process.env.SUPABASE_URL  || '';
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!IMAP_USER || !IMAP_PASSWORD) {
  console.error('❌ IMAP_USER and IMAP_PASSWORD are required');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Hotel Resolution ───────────────────────────────────────
let hotelsCache = null;

async function loadHotels() {
  if (hotelsCache) return hotelsCache;
  const { data, error } = await supabase.from('hotels').select('*').eq('live', true);
  if (error) throw new Error(`Failed to load hotels: ${error.message}`);
  hotelsCache = data || [];
  console.log(`📋 Loaded ${hotelsCache.length} live hotel(s)`);
  return hotelsCache;
}

function resolveHotel(text) {
  const hotels = hotelsCache || [];
  const upper = text.toUpperCase();

  // Try property code match first
  for (const h of hotels) {
    if (upper.includes(h.property_code.toUpperCase())) return h;
  }

  // Try hotel name match
  for (const h of hotels) {
    if (upper.includes(h.name.toUpperCase())) return h;
  }

  // Try aliases
  for (const h of hotels) {
    for (const alias of (h.aliases || [])) {
      if (upper.includes(alias.toUpperCase())) return h;
    }
  }

  return null;
}

// ─── PDF Parsing ────────────────────────────────────────────

const MONTHS = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function parseNumber(str) {
  if (!str) return null;
  const cleaned = str.replace(/[$,%\s]/g, '').replace(/,/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function parseDate(str) {
  if (!str) return null;

  // "Mar 27, 2026" or "March 27, 2026"
  const mName = str.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (mName) {
    const mon = MONTHS[mName[1].toLowerCase().slice(0, 3)];
    if (mon) return `${mName[3]}-${mon}-${mName[2].padStart(2, '0')}`;
  }

  // MM/DD/YYYY, MM-DD-YYYY
  const m1 = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m1) {
    const year = m1[3].length === 2 ? `20${m1[3]}` : m1[3];
    return `${year}-${m1[1].padStart(2, '0')}-${m1[2].padStart(2, '0')}`;
  }

  // YYYY-MM-DD
  const m2 = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m2) return m2[0];

  return null;
}

// Extract date from filename like "Mar 28, 2026-PNCPE-..." (this is the run date;
// the business date is typically the day before, but we prefer the in-PDF date)
function parseDateFromFilename(filename) {
  if (!filename) return null;
  const m = filename.match(/^([A-Za-z]+\s+\d{1,2},?\s+\d{4})/);
  return m ? parseDate(m[1]) : null;
}

function extractField(text, patterns) {
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) return m[1].trim();
  }
  return null;
}

// Extract a trio of values: Today$val1$val2$val3 or val1 %val2 %val3 %
function extractTrio(text, labelPattern) {
  // Currency: Label$1,234.56$1,234.56$1,234.56
  const currencyRe = new RegExp(labelPattern + '\\$([\\d,.]+)\\$([\\d,.]+)\\$([\\d,.]+)', 'i');
  const cm = text.match(currencyRe);
  if (cm) return [parseNumber(cm[1]), parseNumber(cm[2]), parseNumber(cm[3])];

  // Percentage: Label83.16 %94.31 %87.77 %
  const pctRe = new RegExp(labelPattern + '([\\d.]+)\\s*%([\\d.]+)\\s*%([\\d.]+)\\s*%', 'i');
  const pm = text.match(pctRe);
  if (pm) return [parseNumber(pm[1]), parseNumber(pm[2]), parseNumber(pm[3])];

  // Integer: Label952,5658,170 (Today, MTD, YTD concatenated integers)
  const intRe = new RegExp(labelPattern + '([\\d,]+?)([\\d,]+?)([\\d,]+?)(?:\\d|$)', 'i');
  // This is too ambiguous for integers — skip trio, fall through to single value
  return null;
}

function parseIHGReport(text, filename) {
  const metrics = {};

  // Business date — "Date: Mar 27, 2026"
  const dateStr = extractField(text, [
    /^Date:\s*(.+)$/m,
    /business\s*date[:\s]*([^\n]+)/i,
  ]);
  metrics.business_date = parseDate(dateStr);

  // Fallback: use filename date (report run date = business date + 1 typically,
  // but if no in-PDF date found, use it as-is)
  if (!metrics.business_date) {
    metrics.business_date = parseDateFromFilename(filename);
  }

  // Occupancy trio: "Occupancy83.16 %94.31 %87.77 %"
  const occTrio = extractTrio(text, 'Occupancy');
  if (occTrio) {
    [metrics.occupancy_pct, metrics.occupancy_mtd, metrics.occupancy_ytd] = occTrio;
  } else {
    metrics.occupancy_pct = parseNumber(extractField(text, [
      /occupancy\s*%?[:\s]*([\d.]+)\s*%/i,
    ]));
  }

  // ADR trio: "ADR$118.12$108.04$95.69"
  const adrTrio = extractTrio(text, 'ADR');
  if (adrTrio) {
    [metrics.adr, metrics.adr_mtd, metrics.adr_ytd] = adrTrio;
  } else {
    metrics.adr = parseNumber(extractField(text, [
      /adr[:\s]*\$?([\d,.]+)/i,
    ]));
  }

  // RevPAR trio: "RevPAR$98.23$101.89$83.99"
  const revparTrio = extractTrio(text, 'RevPAR');
  if (revparTrio) {
    [metrics.revpar, metrics.revpar_mtd, metrics.revpar_ytd] = revparTrio;
  } else {
    metrics.revpar = parseNumber(extractField(text, [
      /rev\s*\/?par[:\s]*\$?([\d,.]+)/i,
    ]));
  }

  // Room Revenue trio: "Room Revenue$9,331.62$261,340.82$687,142.59"
  const roomRevTrio = extractTrio(text, 'Room Revenue');
  if (roomRevTrio) {
    [metrics.room_revenue, metrics.room_revenue_mtd, metrics.room_revenue_ytd] = roomRevTrio;
  } else {
    metrics.room_revenue = parseNumber(extractField(text, [
      /room\s*revenue[:\s]*\$?([\d,.]+)/i,
    ]));
  }

  // Total Revenue trio
  const totalRevTrio = extractTrio(text, 'Total Revenue');
  if (totalRevTrio) {
    [metrics.total_revenue, metrics.total_revenue_mtd, metrics.total_revenue_ytd] = totalRevTrio;
  } else {
    metrics.total_revenue = parseNumber(extractField(text, [
      /total\s*revenue[:\s]*\$?([\d,.]+)/i,
    ]));
  }

  // Other Revenue trio
  const otherRevTrio = extractTrio(text, 'Other Revenue');
  if (otherRevTrio) {
    [metrics.other_revenue] = otherRevTrio;
  } else {
    metrics.other_revenue = parseNumber(extractField(text, [
      /other\s*revenue[:\s]*\$?([\d,.]+)/i,
    ]));
  }

  // Collected Taxes trio
  const taxTrio = extractTrio(text, 'Collected Taxes');
  if (taxTrio) {
    [metrics.taxes] = taxTrio;
  } else {
    metrics.taxes = parseNumber(extractField(text, [
      /taxes?[:\s]*\$?([\d,.]+)/i,
    ]));
  }

  // Integer fields — IHG PDFs concatenate Today/MTD/YTD/LY columns without
  // separators (e.g. "Total Rooms952,5658,170000"), making them impossible to
  // split reliably. We skip these; the dashboard primarily uses the financial
  // and percentage metrics above. The hotel's total_rooms comes from the DB.

  // Forecast — occupancy percentages
  const occField = (label) => {
    const re = new RegExp(label + '([\\d.]+)\\s*%', 'i');
    const m = text.match(re);
    return m ? parseNumber(m[1]) : null;
  };
  metrics.tomorrow_occ_pct = occField('Occupancy Tomorrow');
  if (metrics.tomorrow_occ_pct == null) metrics.tomorrow_occ_pct = occField("Tomorrow(?:'s)?\\s*Occupancy");
  metrics.next_7d_occ_pct = occField('Occupancy For Next 7 Days');
  if (metrics.next_7d_occ_pct == null) metrics.next_7d_occ_pct = occField('Next\\s*7\\s*Days?\\s*Occ');
  metrics.next_14d_occ_pct = occField('Occupancy Percentage For\\s*The Next 14 Days');
  if (metrics.next_14d_occ_pct == null) metrics.next_14d_occ_pct = occField('Next\\s*14\\s*Days?\\s*Occ');
  metrics.next_31d_occ_pct = occField('Occupancy For Next 31 Days');
  if (metrics.next_31d_occ_pct == null) metrics.next_31d_occ_pct = occField('Next\\s*(?:31|30)\\s*Days?\\s*Occ');

  // Tomorrow arrivals/departures — also concatenated, skip
  metrics.tomorrow_arrivals = null;
  metrics.tomorrow_departures = null;

  return metrics;
}

function parseReport(text, filename) {
  // IHG General Manager Report format
  const isIHG = /General Manager Report/i.test(text) || /M-T-D/i.test(text) || /Actual Today/i.test(text);
  const metrics = isIHG ? parseIHGReport(text, filename) : parseIHGReport(text, filename); // use IHG parser as default for now
  metrics.report_type = 'gm_report';
  return metrics;
}

// ─── Ingestion Pipeline ─────────────────────────────────────

async function isDuplicate(hash) {
  const { data } = await supabase
    .from('ingestion_log')
    .select('id')
    .eq('attachment_hash', hash)
    .eq('status', 'complete')
    .limit(1);
  return data && data.length > 0;
}

async function processAttachment(emailMeta, filename, buffer) {
  const start = Date.now();
  const hash = createHash('sha256').update(buffer).digest('hex');

  // Check duplicate
  if (await isDuplicate(hash)) {
    console.log(`  ⏭️  Skipping duplicate: ${filename}`);
    await supabase.from('ingestion_log').insert({
      email_uid: emailMeta.uid,
      email_subject: emailMeta.subject,
      email_from: emailMeta.from,
      email_date: emailMeta.date,
      attachment_name: filename,
      attachment_hash: hash,
      status: 'duplicate',
      processing_time_ms: Date.now() - start,
    });
    return { status: 'duplicate' };
  }

  // Create log entry
  const { data: logEntry } = await supabase.from('ingestion_log').insert({
    email_uid: emailMeta.uid,
    email_subject: emailMeta.subject,
    email_from: emailMeta.from,
    email_date: emailMeta.date,
    attachment_name: filename,
    attachment_hash: hash,
    status: 'downloading',
  }).select().single();

  const logId = logEntry?.id;

  try {
    // Extract text from PDF
    await supabase.from('ingestion_log').update({ status: 'parsing' }).eq('id', logId);
    const pdf = await pdfParse(buffer);
    const text = pdf.text;

    if (!text || !text.trim()) {
      throw new Error('PDF text is empty (possibly a scanned image)');
    }

    // Parse report data
    const metrics = parseReport(text, filename);

    // Resolve hotel
    const hotel = resolveHotel(text);
    if (!hotel) {
      throw new Error(`Could not resolve hotel from report text`);
    }

    if (!metrics.business_date) {
      throw new Error('Could not determine business date from report');
    }

    console.log(`  ✅ Parsed: ${hotel.name} — ${metrics.business_date} (occ: ${metrics.occupancy_pct}%)`);

    // Upsert daily report
    const reportData = { ...metrics, hotel_id: hotel.id, updated_at: new Date().toISOString() };
    delete reportData.report_type; // used separately

    const { data: report, error: upsertErr } = await supabase
      .from('daily_reports')
      .upsert(
        { ...reportData, report_type: metrics.report_type || 'gm_report' },
        { onConflict: 'hotel_id,business_date,report_type' }
      )
      .select()
      .single();

    if (upsertErr) throw new Error(`Upsert failed: ${upsertErr.message}`);

    // Update log
    await supabase.from('ingestion_log').update({
      status: 'complete',
      hotel_id: hotel.id,
      daily_report_id: report?.id,
      processing_time_ms: Date.now() - start,
    }).eq('id', logId);

    return { status: 'complete', hotel: hotel.name, date: metrics.business_date };

  } catch (err) {
    console.error(`  ❌ Failed: ${filename} — ${err.message}`);
    if (logId) {
      await supabase.from('ingestion_log').update({
        status: 'failed',
        error_message: err.message,
        processing_time_ms: Date.now() - start,
      }).eq('id', logId);
    }
    return { status: 'failed', error: err.message };
  }
}

// ─── IMAP Polling ───────────────────────────────────────────

async function pollEmails() {
  console.log('🔌 Connecting to IMAP...');
  const client = new ImapFlow({
    host: IMAP_HOST,
    port: IMAP_PORT,
    secure: true,
    auth: { user: IMAP_USER, pass: IMAP_PASSWORD },
    logger: false,
  });

  let emailsProcessed = 0;
  let reportsIngested = 0;
  let lastError = null;

  try {
    await client.connect();
    console.log('📬 Connected. Opening mailbox...');

    const lock = await client.getMailboxLock(IMAP_MAILBOX);

    try {
      // Collect all unseen messages first (avoid async work inside IMAP iterator)
      const collected = [];
      const messages = client.fetch({ seen: false }, {
        uid: true,
        envelope: true,
        source: true,
      });

      for await (const msg of messages) {
        collected.push({
          uid: msg.uid,
          subject: msg.envelope?.subject || '(no subject)',
          from: msg.envelope?.from?.[0]?.address || '',
          date: msg.envelope?.date || new Date(),
          source: msg.source,
        });
      }

      console.log(`📥 Fetched ${collected.length} unseen message(s)\n`);

      // Mark all as seen now so they won't be re-fetched
      if (collected.length > 0) {
        const uids = collected.map(m => m.uid);
        await client.messageFlagsAdd(uids, ['\\Seen'], { uid: true });
      }

      // Release IMAP lock before heavy processing
      lock.release();
      await client.logout();

      // Process each message
      for (const msg of collected) {
        console.log(`📧 Processing: "${msg.subject}" from ${msg.from}`);

        const parsed = await simpleParser(msg.source);
        const pdfAttachments = (parsed.attachments || []).filter(
          a => a.contentType === 'application/pdf' ||
               (a.filename && a.filename.toLowerCase().endsWith('.pdf'))
        );

        if (pdfAttachments.length === 0) {
          console.log('  ⏭️  No PDF attachments, skipping');
          continue;
        }

        emailsProcessed++;

        for (const attachment of pdfAttachments) {
          console.log(`  📎 Attachment: ${attachment.filename}`);
          const result = await processAttachment(
            { uid: msg.uid.toString(), subject: msg.subject, from: msg.from, date: msg.date },
            attachment.filename || 'report.pdf',
            attachment.content
          );
          if (result.status === 'complete') reportsIngested++;
        }
      }
    } catch (innerErr) {
      lock.release();
      throw innerErr;
    }

  } catch (err) {
    lastError = err.message;
    console.error(`\n❌ IMAP error: ${err.message}`);
  }

  // Update sync status
  await supabase.from('sync_status').update({
    last_poll_at: new Date().toISOString(),
    ...(reportsIngested > 0 ? { last_success_at: new Date().toISOString() } : {}),
    emails_processed: emailsProcessed,
    reports_ingested: reportsIngested,
    last_error: lastError,
    updated_at: new Date().toISOString(),
  }).eq('id', 'singleton');

  console.log(`\n✅ Poll complete: ${emailsProcessed} email(s), ${reportsIngested} report(s) ingested`);
  return { emailsProcessed, reportsIngested, lastError };
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  console.log('🌙 NightAudit Email Poller');
  console.log(`   IMAP: ${IMAP_USER}@${IMAP_HOST}`);
  console.log(`   Supabase: ${SUPABASE_URL}`);
  console.log('');

  await loadHotels();
  const result = await pollEmails();

  if (result.lastError) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
