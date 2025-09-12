#!/usr/bin/env node

const NeonDataService = require('./neon-dataService');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  const logFile = path.join(logsDir, `daily-fetch-${new Date().toISOString().split('T')[0]}.log`);
  
  fs.appendFileSync(logFile, logMessage);
  console.log(message);
}

async function runDailyDownload() {
  try {
    logToFile('🚀 Starting daily FINRA short sale data download');
    
    const dataService = new NeonDataService();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if yesterday was a weekend - if so, skip or adjust
    const dayOfWeek = yesterday.getDay(); // 0=Sunday, 6=Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      logToFile(`📅 Skipping weekend date: ${yesterday.toISOString().split('T')[0]} (Weekend - no trading data)`);
      return { success: false, date: yesterday.toISOString().split('T')[0], reason: 'weekend' };
    }
    
    const dateStr = yesterday.toISOString().split('T')[0];
    logToFile(`📅 Target date: ${dateStr} (Weekday trading data)`);
    
    const result = await dataService.fetchAndStoreData(yesterday);
    
    if (result.success) {
      logToFile(`✅ Successfully downloaded ${result.count} records for ${result.date}`);
      logToFile(`📊 Database updated with latest data`);
    } else {
      logToFile(`⚠️ No data available for ${result.date} - this might be a weekend or holiday`);
    }
    
    logToFile('🏁 Daily download completed');
    
    return result;
  } catch (error) {
    logToFile(`❌ Critical error in daily download: ${error.message}`);
    logToFile(`🔍 Stack trace: ${error.stack}`);
    
    // Send alert/notification here if needed
    throw error;
  }
}

// Function to download multiple days (for backfilling)
async function backfillData(startDate, endDate) {
  logToFile(`🔄 Starting backfill from ${startDate} to ${endDate}`);
  
  const dataService = new NeonDataService();
  const start = new Date(startDate);
  const end = new Date(endDate);
  let current = new Date(start);
  let totalRecords = 0;
  let daysProcessed = 0;
  
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const dayOfWeek = current.getDay();
    
    // Skip weekends automatically
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      logToFile(`📅 Skipping weekend: ${dateStr}`);
      current.setDate(current.getDate() + 1);
      continue;
    }
    
    try {
      logToFile(`📅 Processing ${dateStr} (Weekday)`);
      const result = await dataService.fetchAndStoreData(current);
      
      if (result.success) {
        totalRecords += result.count;
        logToFile(`✅ Downloaded ${result.count} records for ${result.date}`);
      } else {
        logToFile(`⚠️ Skipped ${dateStr} - no data available (possibly holiday)`);
      }
      
      daysProcessed++;
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      logToFile(`❌ Error processing ${dateStr}: ${error.message}`);
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  logToFile(`🏁 Backfill completed: ${totalRecords} records across ${daysProcessed} days`);
  return { totalRecords, daysProcessed };
}

// Function to check if we need to download latest data
async function checkAndDownloadLatest() {
  try {
    const dataService = new NeonDataService();
    const dates = await dataService.getAvailableDates();
    const latestDate = dates.length > 0 ? dates[0] : null;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = dataService.formatDate(yesterday);
    
    if (latestDate !== yesterdayStr) {
      logToFile(`📊 Latest data missing for ${yesterdayStr}, downloading...`);
      return await runDailyDownload();
    } else {
      logToFile(`✅ Data already up to date for ${yesterdayStr}`);
      return { success: true, date: yesterdayStr, count: 0, alreadyUpdated: true };
    }
  } catch (error) {
    logToFile(`❌ Error checking latest data: ${error.message}`);
    throw error;
  }
}

// Run immediately if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length >= 2 && args[0] === '--backfill') {
    // Usage: node neon-cron-job.js --backfill 20241201 20241231
    const startDate = args[1];
    const endDate = args[2] || args[1]; // If only one date provided, use it for both
    backfillData(startDate, endDate).catch(console.error);
  } else if (args.length >= 1 && args[0] === '--check-latest') {
    checkAndDownloadLatest().catch(console.error);
  } else {
    runDailyDownload().catch(console.error);
  }
}

module.exports = { runDailyDownload, backfillData, checkAndDownloadLatest };