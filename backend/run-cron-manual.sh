#!/bin/bash

# Manual cron job runner for FINRA data
# Usage: ./run-cron-manual.sh [today|yesterday|backfill YYYY-MM-DD]

cd "$(dirname "$0")"

echo "🚀 Starting manual FINRA data download..."

if [ "$1" = "today" ]; then
    node neon-cron-job.js
elif [ "$1" = "yesterday" ]; then
    node neon-cron-job.js --check-latest
elif [ "$1" = "backfill" ] && [ -n "$2" ]; then
    echo "📅 Backfilling data for $2..."
    node neon-cron-job.js --backfill $(echo $2 | tr -d '-') $(echo $2 | tr -d '-')
else
    echo "Usage:"
    echo "  ./run-cron-manual.sh today      - Download today's data"
    echo "  ./run-cron-manual.sh yesterday  - Download yesterday's data"
    echo "  ./run-cron-manual.sh backfill 2024-12-06 - Backfill specific date"
    echo ""
    echo "Available commands:"
    echo "  node neon-cron-job.js                    - Download yesterday"
    echo "  node neon-cron-job.js --check-latest     - Check and download missing"
    echo "  node neon-cron-job.js --backfill 20241201 20241231 - Backfill range"
fi