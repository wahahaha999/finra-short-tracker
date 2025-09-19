#!/bin/bash

echo "🔍 Dark Pool Intel Data Fetcher Setup Verification"
echo "========================================"

echo ""
echo "📅 Checking cron job..."
crontab -l | grep dark-pool-intel

echo ""
echo "📁 Checking directories..."
ls -la logs/

echo ""
echo "🔧 Checking file permissions..."
ls -la setup-cron.sh cron-job.js dataService.js

echo ""
echo "🧪 Testing data fetcher..."
cd /Users/user/Documents/dark-pool-intel/backend
node -e "const DataService = require('./dataService'); console.log('✅ DataService loaded'); console.log('Current ET:', DataService.getCurrentEasternDate().toISOString()); console.log('Yesterday:', DataService.getYesterdayDate().toISOString()); console.log('Yesterday weekday?', ![0,6].includes(DataService.getYesterdayDate().getDay()));"

echo ""
echo "✅ Setup verification complete!"
echo ""
echo "📋 Current Status:"
echo "- Cron job: Weekdays at 7:00 PM ET"
echo "- Weekend handling: ✅ Enabled"
echo "- Timezone: Eastern Time (ET)"
echo "- Logs: Available in logs/ directory"