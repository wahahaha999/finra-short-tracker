#!/bin/bash

# FINRA Daily Data Fetcher Cron Setup Script
# This script sets up a daily cron job to fetch FINRA short sale data

echo "🚀 Setting up FINRA daily data fetcher cron job..."

# Get the absolute path to the backend directory
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRON_JOB_PATH="$BACKEND_DIR/cron-job.js"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if the cron job file exists
if [ ! -f "$CRON_JOB_PATH" ]; then
    echo "❌ Cron job file not found: $CRON_JOB_PATH"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p "$BACKEND_DIR/logs"

# Define the cron schedule (every weekday at 7:00 PM ET - after FINRA updates)
CRON_SCHEDULE="0 19 * * 1-5"
CRON_COMMAND="cd $BACKEND_DIR && node cron-job.js >> $BACKEND_DIR/logs/cron-output.log 2>&1"

# Check if the cron job already exists
if crontab -l 2>/dev/null | grep -q "cron-job.js"; then
    echo "⚠️  Cron job already exists. Updating it..."
    (crontab -l 2>/dev/null | grep -v "cron-job.js"; echo "$CRON_SCHEDULE $CRON_COMMAND") | crontab -
else
    echo "📅 Adding new cron job..."
    (crontab -l 2>/dev/null; echo "$CRON_SCHEDULE $CRON_COMMAND") | crontab -
fi

echo "✅ Cron job successfully set up!"
echo "⏰ Schedule: Weekdays at 7:00 PM ET (after FINRA updates)"
echo "📊 Logs will be saved to: $BACKEND_DIR/logs/"
echo ""
echo "To manually test the cron job:"
echo "  cd $BACKEND_DIR && node cron-job.js"
echo ""
echo "To view cron jobs:"
echo "  crontab -l"
echo ""
echo "To remove the cron job:"
echo "  crontab -e"  # Then delete the line containing cron-job.js