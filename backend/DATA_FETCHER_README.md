# FINRA Short Sale Data Fetcher

This component automatically downloads and stores daily short sale data from FINRA's public dataset.

## Overview

The data fetcher downloads daily Regulation SHO short sale volume data from FINRA's CDN and stores it in a local database. It includes:

- **Daily automated fetching** via cron job
- **Robust error handling** with detailed logging
- **Backfill capability** for historical data
- **Data validation** and duplicate prevention
- **Rate limiting** to avoid being blocked

## Data Source

**URL Format**: `https://cdn.finra.org/equity/regsho/daily/CNMSshvolYYYYMMDD.txt`

**Update Schedule**: FINRA updates data daily after **6:00 PM ET**, excluding weekends (no data on Saturdays/Sundays)

**Data Structure** (pipe-delimited):
```
Date|Symbol|ShortVolume|ShortExemptVolume|TotalVolume|Market
20250910|AAPL|1000000|5000|2000000|Q
```

## Quick Start

### 1. Manual Test
```bash
cd backend
node cron-job.js
```

### 2. Set Up Automated Daily Fetching
```bash
cd backend
./setup-cron.sh
```

This will set up a daily cron job that runs at 6:00 AM to fetch the previous day's data.

## Usage

### Daily Fetch (Automated)
- **Schedule**: Every weekday at 7:00 PM ET (after FINRA updates)
- **Target**: Previous trading day's data
- **Logs**: Saved to `logs/daily-fetch-YYYY-MM-DD.log`
- **Weekend Handling**: Automatically skips weekends (no data available)

### Manual Commands

#### Single Day Download
```bash
node cron-job.js
```

#### Backfill Historical Data
```bash
# Backfill specific date range
node cron-job.js --backfill 20250101 20250131

# Backfill entire month
node cron-job.js --backfill 20250101 20250131
```

#### Test Data Service Directly
```bash
# Download and store yesterday's data
node -e "const DataService = require('./dataService'); DataService.fetchAndStoreData().then(console.log).catch(console.error);"

# Download specific date
node -e "const DataService = require('./dataService'); const date = new Date('2025-01-15'); DataService.fetchAndStoreData(date).then(console.log).catch(console.error);"
```

## File Structure

```
backend/
├── cron-job.js              # Main daily fetcher script
├── setup-cron.sh           # Cron job setup script
├── dataService.js          # Core data fetching logic
├── logs/                   # Log files directory
│   ├── daily-fetch-YYYY-MM-DD.log
│   └── cron-output.log
└── DATA_FETCHER_README.md  # This file
```

## Configuration

### Cron Job Schedule
The default schedule is daily at 6:00 AM. To modify:

1. View current cron jobs:
   ```bash
   crontab -l
   ```

2. Edit cron jobs:
   ```bash
   crontab -e
   ```

3. Change the schedule (example: 8:30 AM daily):
   ```bash
   30 8 * * * cd /path/to/backend && node cron-job.js >> logs/cron-output.log 2>&1
   ```

### Environment Variables
Create a `.env` file in the backend directory:
```bash
# Optional: Custom user agent for requests
USER_AGENT=Mozilla/5.0 (compatible; FINRA-Data-Fetcher/1.0)

# Optional: Request timeout in milliseconds
REQUEST_TIMEOUT=60000
```

## Troubleshooting

### Common Issues

#### 1. "Data not available for date"
- **Cause**: Weekend or holiday (no trading data)
- **Solution**: This is expected behavior - the fetcher will skip these dates

#### 2. "Timeout downloading data"
- **Cause**: Large file size or slow connection
- **Solution**: Increase timeout in `dataService.js` or check internet connection

#### 3. "Permission denied" for setup-cron.sh
```bash
chmod +x setup-cron.sh
```

#### 4. Check Cron Job Status
```bash
# View cron logs (macOS)
grep CRON /var/log/system.log | tail -20

# Or check your specific cron output
tail -f logs/cron-output.log
```

### Log Analysis

#### View Today's Logs
```bash
tail -f logs/daily-fetch-$(date +%Y-%m-%d).log
```

#### View All Logs
```bash
ls -la logs/
cat logs/daily-fetch-2025-09-10.log
```

#### Search for Errors
```bash
grep -i "error\|failed" logs/*.log
```

## API Endpoints

Once data is fetched, you can access it through these endpoints:

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Download Latest Data
```bash
curl -X POST http://localhost:3001/api/download
```

### Get Statistics
```bash
curl http://localhost:3001/api/stats
```

### Get Top Shorted Stocks
```bash
curl http://localhost:3001/api/data/top-shorted/20250910
```

### Search Symbols
```bash
curl "http://localhost:3001/api/data/search?symbol=AAPL"
```

## Monitoring

### Health Checks
Set up monitoring to ensure the fetcher is running:

1. **Daily log verification**: Check that new logs are created daily
2. **Data freshness**: Verify latest data is within 2 business days
3. **Error rate monitoring**: Track failed downloads

### Example Monitoring Script
```bash
#!/bin/bash
# check-data-freshness.sh

LATEST_LOG=$(ls -t logs/daily-fetch-*.log | head -1)
if [ -z "$LATEST_LOG" ]; then
    echo "❌ No recent logs found"
    exit 1
fi

LAST_SUCCESS=$(grep -l "Successfully downloaded" "$LATEST_LOG" | tail -1)
if [ -z "$LAST_SUCCESS" ]; then
    echo "❌ Last download failed"
    exit 1
fi

echo "✅ Data fetcher is healthy"
```

## Data Retention

- **Raw logs**: Kept indefinitely (rotate manually)
- **Database**: No automatic cleanup (manage based on storage needs)
- **Backup**: Consider backing up database periodically

## Security Considerations

- **Rate limiting**: Built-in 1-second delay between requests
- **User agent**: Configurable to identify requests
- **No authentication required**: FINRA data is public

## Performance

- **Typical download time**: 10-30 seconds per day
- **File size**: ~2-5 MB per day (compressed)
- **Database size**: ~10-20 MB per year
- **Memory usage**: <100 MB during processing

## Support

For issues or questions:
1. Check logs in the `logs/` directory
2. Verify cron job is running: `crontab -l`
3. Test manually: `node cron-job.js`
4. Check API endpoints for data availability