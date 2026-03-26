# NightAudit Parser Verification

This document verifies that each brand parser correctly extracts KPIs from the sample PDF reports.

## IHG Parser — Holiday Inn Express Destin (CEWHS) — Feb 12, 2026

| Field | Expected | Parser Pattern |
|-------|----------|----------------|
| Property Code | `CEWHS` | `/\n([A-Z]{4,6})\n/` |
| Report Date | `Feb 12, 2026` | `/Date:\s*(\w+ \d{1,2},\s*\d{4})/` |
| Occupancy Today | `33.78%` | `/Occupancy(?!\s+(?:Excluding\|Tomorrow\|For\|Percentage))\s+([\d.]+)\s*%/` |
| Occupancy MTD | `34.12%` | Same pattern, 2nd capture |
| Occupancy YTD | `32.53%` | Same pattern, 3rd capture |
| Occupancy Tomorrow | `54.05%` | `/Occupancy Tomorrow\s+([\d.]+)\s*%/` |
| Occupancy Next 7 | `36.49%` | `/Occupancy For Next 7 Days\s+([\d.]+)\s*%/` |
| Occupancy Next 14 | `29.63%` | `/Occupancy Percentage For\s*(?:The )?Next 14 Days\s+([\d.]+)\s*%/` |
| Occupancy Next 31 | `22.36%` | `/Occupancy For Next 31 Days\s+([\d.]+)\s*%/` |
| ADR Today | `$83.32` | `/ADR \s+(-?\$?[\d,]+\.\d{2})/` |
| ADR MTD | `$80.58` | Same, 2nd value |
| ADR YTD | `$77.47` | Same, 3rd value |
| RevPAR Today | `$28.15` | `/RevPAR \s+(-?\$?[\d,]+\.\d{2})/` |
| RevPAR MTD | `$27.50` | Same, 2nd value |
| RevPAR YTD | `$25.20` | Same, 3rd value |
| Total Revenue Today | `$2,092.29` | `/Total Revenue\s+(-?\$?[\d,]+\.\d{2})/` |
| Total Revenue MTD | `$24,953.55` | Same, 2nd value |
| Total Revenue YTD | `$81,866.81` | Same, 3rd value |
| Rooms Occupied | `25` | `/Rooms Occupied\s+([\d,]+)/` |
| Total Rooms | `74` | `/Total Rooms\s+([\d,]+)/` |
| Available Rooms | `49` | `/Available Rooms\s+([\d,]+)/` |
| OOO Rooms | `0` | `/OOO Rooms\s+([\d,]+)/` |

## IHG Parser — Candlewood Suites Pensacola (PNCPE) — Feb 12, 2026

| Field | Expected | Extracted |
|-------|----------|-----------|
| Property Code | `PNCPE` | Match |
| Occupancy Today | `81.05%` | Match |
| Occupancy Tomorrow | `87.37%` | Match |
| Occupancy Next 7 | `57.89%` | Match |
| Occupancy Next 14 | `57.52%` | Match |
| Occupancy Next 31 | `41.15%` | Match |
| ADR Today | `$95.94` | Match |
| ADR MTD | `$89.33` | Match |
| ADR YTD | `$87.51` | Match |
| RevPAR Today | `$77.76` | Match |
| Total Revenue Today | `$7,423.98` | Match |
| Rooms Occupied | `77` | Match |
| Total Rooms | `95` | Match |
| OOO Rooms | `1` | Match |

## Hilton Parser — Hampton Inn Pensacola (PNSHS) — Feb 12, 2026

| Field | Expected | Parser Pattern |
|-------|----------|----------------|
| Property Code | `PNSHS` | `/\n([A-Z]{4,6})\n/` |
| Report Date | `Feb 12, 2026` | `/Date:\s*(\w+ \d{1,2},\s*\d{4})/` |
| Occupancy Today | `83.53%` | `/OCCUPANCY\s+INCLUDING\s+DOWN.*?\s+([\d.]+)\s*%/` |
| Occupancy MTD | `69.51%` | Same, 2nd value |
| Occupancy YTD | `61.56%` | Same, 4th value (skipping LY-M-T-D) |
| ADR Today | `$106.72` | `/ADR\s+INCLUDING\s+COMP.*?\s+\$([\d,]+\.\d{2})/` |
| ADR MTD | `$107.79` | Same, 2nd value |
| ADR YTD | `$105.63` | Same, 4th value |
| RevPAR Today | `$89.14` | `/REVPAR(?!\s+With)\s+\$([\d,]+\.\d{2})/` |
| RevPAR MTD | `$74.92` | Same, 2nd value |
| RevPAR YTD | `$65.37` | Same, 4th value |
| Total Revenue Today | `$7,703.35` | First `Totals` row in Revenue Statistics |
| Total Revenue MTD | `$77,695.49` | Same, 2nd value |
| Total Revenue YTD | `$242,980.07` | Same, 4th value |
| Rooms Sold Today | `71` | `/ROOM SOLD(?!\s+EXCLUDING)\s+(\d+)/` |
| Total Rooms | `85` | `/Total Rooms\s+(\d+)/` |
| Forecast Tomorrow | `71.76%` | `/ROOMS OCCUPIED\s+FOR\s+TOMORROW\s+([\d.]+)\s*%/` |
| Forecast Next 7 | `52.44%` | `/ROOMS OCCUPIED\s+FOR\s+NEXT\s+SEVEN\s+DAYS\s+([\d.]+)\s*%/` |
| Forecast Next Month | `38.48%` | `/ROOMS OCCUPIED\s+FOR\s+NEXT\s+MONTH\s+([\d.]+)\s*%/` |

**Note:** Hilton format has 5 columns: Today | M-T-D | LY-M-T-D | Y-T-D | LY-T-D.
Parser skips LY columns (indices 3 and 5) and returns (today, mtd, ytd) = (col1, col2, col4).

## Choice Hotels Parser — Comfort Inn (FL712) — Feb 12, 2026

| Field | Expected | Parser Pattern |
|-------|----------|----------------|
| Property Code | `FL712` | `/Property Code:\s*([A-Z0-9]+)/` |
| Report Date | `2/12/2026` | `/Business Date:\s*(\d{1,2}\/\d{1,2}\/\d{4})/` |
| Hotel Name | `Comfort Inn` | `/Property Name:\s*(.+)/` |
| Occ% Available Today | `69.61%` | `/Occ% of Total Available Rooms\s+([\d.]+)/` |
| Occ% Available PTD | `70.73%` | Same, 2nd value |
| Occ% Available YTD | `66.96%` | Same, 4th value (skip LY PTD) |
| ADR Today | `$82.65` | `/ADR for Total Rev Rooms\.\s+([\d.]+)/` |
| ADR PTD | `$81.29` | Same, 2nd value |
| ADR YTD | `$80.76` | Same, 4th value |
| RevPar Today | `$57.53` | `/RevPar(?!\s)\s+([\d.]+)/` |
| RevPar PTD | `$57.35` | Same, 2nd value |
| RevPar YTD | `$53.90` | Same, 4th value |
| Total Revenue Today | `$5,985.31` | `/Total Revenue\s+([\d,]+\.\d{2})/` |
| Total Revenue PTD | `$63,063.26` | Same, 2nd value |
| Total Revenue YTD | `$203,683.92` | Same, 4th value |
| Total Occupied Today | `71` | `/Total Occupied Rooms\s+(\d+)/` |
| Total Rooms | `115` | `/Total Rooms\s+(\d+)/` |
| OOO | `13` | `/Out Of Order\s+(\d+)/` |

**Note:** Choice format has 5 columns: Today | PTD | Last Year PTD | YTD | Last YTD.
Parser skips LY columns and returns (today, ptd, ytd) = (col1, col2, col4).

## Brand Auto-Detection

| Text Pattern | Detected Brand |
|-------------|---------------|
| Contains "BY IHG" or "Holiday Inn" or "Candlewood" | `ihg` |
| Contains "Hampton Inn" or "by Hilton" or "HONORS SETTLEMENT" | `hilton` |
| Contains "Comfort Inn" or "STR (STAR)" or matches `/FL\d{3}/` | `choice` |
| Contains "Marriott" or "Courtyard" or "Bonvoy" | `marriott` |
| None of the above | `other` (uses generic parser) |

## Report Type Detection

| Text Pattern | Report Type |
|-------------|------------|
| Contains "General Manager Report" | `gm_report` |
| Contains "Hotel Statistics" | `hotel_statistics` |
| Contains "Revenue Statistics" or "Performance Statistics" | `hotel_statistics` |
| Default | `gm_report` |
